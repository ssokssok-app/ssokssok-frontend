import { queryOptions } from '@tanstack/react-query'

import type { DocumentResult } from '@/types/document-result'

import { sampleResults } from './mocks/sample-results'

/**
 * 샘플 문서 (로그인 없이 기능 체험).
 * 백엔드에서 받을 예정이라, 그전까지는 프론트 목데이터를 이 파일에서만 다룬다 (docs/api-contract.md "샘플 문서").
 * 목록 순서는 Figma 홈 - 샘플 체험 시트를 따른다.
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

// 변환하는 동안 보이는 로딩 화면을 체험할 수 있도록, 목데이터도 실제 변환처럼 조금 기다렸다가 돌려준다
const MOCK_DELAY_MS = 3200

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

async function getSampleResult(
  sampleId: SampleId,
  signal: AbortSignal,
): Promise<DocumentResult> {
  await wait(MOCK_DELAY_MS, signal)
  return sampleResults[sampleId]
}

export const sampleResultQueryOptions = (sampleId: SampleId) =>
  queryOptions({
    queryKey: ['samples', sampleId],
    queryFn: ({ signal }) => getSampleResult(sampleId, signal),
    // 샘플은 바뀌지 않으니 한 번 받으면 다시 받지 않는다
    staleTime: Infinity,
  })
