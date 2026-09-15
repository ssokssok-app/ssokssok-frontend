import { queryOptions } from '@tanstack/react-query'

import { wait } from '@/lib/wait'
import type { DocumentResult } from '@/types/document-result'

import { apiRequest } from './client'
import { parseDocumentResult } from './documents'

/**
 * 샘플 문서 (로그인 없이 기능 체험, docs/api-contract.md "6. 샘플 문서").
 * 목록은 Figma 홈 - 샘플 체험 시트의 문구 · 순서 그대로 프론트가 가진다. id 는 백엔드와 맞춘 값이라
 * 목록 API(GET /api/documents/samples)는 부르지 않고 결과만 받는다.
 */
export const sampleDocuments = [
  { id: 'work-contract', title: '근로 계약서' },
  { id: 'house-contract', title: '임대차 계약서' },
  { id: 'pension-notice', title: '국민연금 가입 신고 안내문' },
  { id: 'fine', title: '과태료 납부 안내문' },
] as const

export type SampleId = (typeof sampleDocuments)[number]['id']

export function isSampleId(value: string): value is SampleId {
  return sampleDocuments.some((sample) => sample.id === value)
}

// 샘플은 변환 과정을 체험하는 게 목적이라, 응답이 빨라도 로딩 화면을 이만큼은 보여 준다 (docs/product.md "확인 필요")
const MIN_LOADING_MS = 2000

async function getSampleResult(
  sampleId: SampleId,
  signal: AbortSignal,
): Promise<DocumentResult> {
  const [body] = await Promise.all([
    apiRequest(`/api/documents/samples/${sampleId}`, { signal }),
    wait(MIN_LOADING_MS, signal),
  ])
  return parseDocumentResult(body)
}

export const sampleResultQueryOptions = (sampleId: SampleId) =>
  queryOptions({
    queryKey: ['samples', sampleId],
    queryFn: ({ signal }) => getSampleResult(sampleId, signal),
    // 샘플은 바뀌지 않으니 한 번 받으면 다시 받지 않는다
    staleTime: Infinity,
  })
