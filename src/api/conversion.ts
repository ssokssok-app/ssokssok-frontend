import { queryOptions } from '@tanstack/react-query'

import { isRecord } from '@/lib/utils'
import type {
  ApiErrorBody,
  ConversionJobStatus,
  ConversionStage,
  ConversionStatus,
} from '@/types/conversion'

import { apiRequest } from './client'
import { parseDocumentResult } from './documents'
import { ApiError } from './errors'

/**
 * 문서 변환: 파일을 올려 작업 ID 를 받고, 상태를 여러 번 조회해 결과를 받는다 (docs/api-contract.md "1. 변환 요청").
 * 세 요청 모두 로그인이 필요하다. 개발 중에도 실제 OCR · AI 를 부르므로 비용이 든다.
 */

const jobStatuses: readonly ConversionJobStatus[] = [
  'queued',
  'processing',
  'done',
  'failed',
  'canceled',
]
const stages: readonly ConversionStage[] = [
  'analyzing',
  'simplifying',
  'structuring',
  'done',
]

function conversionPath(jobId: string): `/api/${string}` {
  return `/api/documents/convert/${encodeURIComponent(jobId)}`
}

/** 파일을 multipart 로 올린다. 여러 장은 한 문서의 페이지 순서다. 202 로 작업 ID 를 바로 돌려준다 */
export async function startConversion(
  files: File[],
  signal: AbortSignal,
): Promise<{ jobId: string }> {
  const form = new FormData()
  for (const file of files) form.append('files', file, file.name)
  const body = await apiRequest('/api/documents/convert', {
    method: 'POST',
    form,
    signal,
    auth: true,
  })
  if (isRecord(body) && typeof body.jobId === 'string') {
    return { jobId: body.jobId }
  }
  throw new ApiError({
    code: 'INVALID_RESPONSE',
    message: '변환 시작 응답에 작업 ID 가 없어요.',
  })
}

function parseJobError(value: unknown): ApiErrorBody {
  if (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  ) {
    return { code: value.code, message: value.message }
  }
  // 실패했는데 오류 내용이 없으면 화면은 기본 문구("잠시 뒤에 다시 시도")를 쓴다
  return { code: 'CONVERT_FAILED', message: '오류 내용이 없어요.' }
}

/** 상태 응답(Swagger `JobStatusResponse`)의 모양을 확인한다. 완료면 결과, 실패면 오류를 같이 돌려준다 */
function parseConversionStatus(body: unknown): ConversionStatus {
  if (!isRecord(body)) throw invalidStatus()
  const status = jobStatuses.find((known) => known === body.status)
  if (!status) throw invalidStatus()
  const parsed: ConversionStatus = {
    status,
    // 모르는 단계가 오면 첫 단계로 보여 준다. 백엔드가 단계를 늘려도 로딩 화면은 계속 돈다
    stage: stages.find((known) => known === body.stage) ?? 'analyzing',
    progress:
      typeof body.progress === 'number'
        ? Math.min(1, Math.max(0, body.progress))
        : 0,
  }
  if (status === 'done') parsed.result = parseDocumentResult(body.result)
  if (status === 'failed') parsed.error = parseJobError(body.error)
  return parsed
}

function invalidStatus() {
  return new ApiError({
    code: 'INVALID_RESPONSE',
    message: '변환 상태 응답 모양이 달라요.',
  })
}

export async function getConversionStatus(
  jobId: string,
  signal: AbortSignal,
): Promise<ConversionStatus> {
  return parseConversionStatus(
    await apiRequest(conversionPath(jobId), { auth: true, signal }),
  )
}

/** 진행 중인 작업을 취소한다. 서버는 다음 단계로 넘어가지 않는 방식이라 이미 보낸 AI 호출은 끝까지 간다. 끝난 작업이면 아무 일도 없다 */
export async function cancelConversion(jobId: string) {
  await apiRequest(conversionPath(jobId), { method: 'DELETE', auth: true })
}

export const conversionStatusQueryOptions = (jobId: string) =>
  queryOptions({
    queryKey: ['conversions', jobId],
    queryFn: ({ signal }) => getConversionStatus(jobId, signal),
    // 결과는 개인정보라 화면이 사라지면 캐시에서도 바로 지운다
    gcTime: 0,
  })
