import { queryOptions } from '@tanstack/react-query'

import type { ConversionStage, ConversionStatus } from '@/types/conversion'

import { mockConversionResult } from './mocks/conversion-result'
import { wait } from './mocks/wait'

/**
 * 문서 변환: 파일을 올려 작업 ID 를 받고, 상태를 여러 번 조회해 결과를 받는다 (docs/api-contract.md "1. 변환 요청").
 *
 * 백엔드 API 가 준비되기 전이라 목데이터로 흉내 낸다. 진행 단계 · 걸리는 시간 · 결과 모양은 설계안과 백엔드에 보낸 제안을 따른다.
 * 연결할 때는 이 파일의 세 함수 안만 실제 요청(POST · GET · DELETE /api/documents/convert)으로 바꾼다.
 */

interface MockJob {
  startedAt: number
  /** 파일 이름에 unreadable 이 들어 있으면 읽을 수 없는 사진 오류를 흉내 낸다 (오류 화면 확인용) */
  unreadable: boolean
  canceled: boolean
}

// 목 작업은 파일 없이 시작 시각 · 오류 흉내 여부만 기억한다
const mockJobs = new Map<string, MockJob>()
let nextJobNumber = 1

// 설계안의 단계를 시간으로 흉내 낸다 (실제로는 문서에 따라 1~2분)
const MOCK_UPLOAD_MS = 700
const mockStages: { stage: ConversionStage; untilMs: number }[] = [
  { stage: 'analyzing', untilMs: 2000 },
  { stage: 'simplifying', untilMs: 6000 },
  { stage: 'structuring', untilMs: 8000 },
]
const MOCK_TOTAL_MS = 8000

export async function startConversion(
  files: File[],
  signal: AbortSignal,
): Promise<{ jobId: string }> {
  await wait(MOCK_UPLOAD_MS, signal)
  const jobId = `mock-job-${nextJobNumber++}`
  mockJobs.set(jobId, {
    startedAt: Date.now(),
    unreadable: files.some((file) => file.name.includes('unreadable')),
    canceled: false,
  })
  return { jobId }
}

export async function getConversionStatus(
  jobId: string,
  signal: AbortSignal,
): Promise<ConversionStatus> {
  await wait(150, signal)
  const job = mockJobs.get(jobId)
  if (!job) {
    return {
      status: 'failed',
      stage: 'analyzing',
      progress: 0,
      error: { code: 'JOB_NOT_FOUND', message: '변환 작업을 찾을 수 없어요.' },
    }
  }
  if (job.canceled) {
    return { status: 'canceled', stage: 'analyzing', progress: 0 }
  }

  const elapsed = Date.now() - job.startedAt
  if (job.unreadable && elapsed >= 2000) {
    return {
      status: 'failed',
      stage: 'analyzing',
      progress: 0.25,
      error: {
        code: 'IMAGE_UNREADABLE',
        message: '사진이 흐려서 글자를 읽을 수 없어요. 다시 찍어주세요.',
      },
    }
  }
  if (elapsed >= MOCK_TOTAL_MS) {
    return {
      status: 'done',
      stage: 'done',
      progress: 1,
      result: mockConversionResult,
    }
  }
  const current = mockStages.find(({ untilMs }) => elapsed < untilMs)
  return {
    status: 'processing',
    stage: current?.stage ?? 'structuring',
    progress: elapsed / MOCK_TOTAL_MS,
  }
}

export async function cancelConversion(jobId: string) {
  const job = mockJobs.get(jobId)
  if (job) job.canceled = true
}

export const conversionStatusQueryOptions = (jobId: string) =>
  queryOptions({
    queryKey: ['conversions', jobId],
    queryFn: ({ signal }) => getConversionStatus(jobId, signal),
    // 결과는 개인정보라 화면이 사라지면 캐시에서도 바로 지운다
    gcTime: 0,
  })
