import type { DocumentResult } from './document-result'

/**
 * 문서 변환 작업 상태 (docs/api-contract.md "1. 변환 요청", "4. 오류 형식").
 * status 값 전체와 완료 시 result 를 같이 주는 모양은 백엔드에 제안한 값이다 ("백엔드에 보낼 제안" 2번).
 */

/** 서버의 실제 진행 단계. 로딩 화면 4단계와 짝짓는다 */
export type ConversionStage =
  'analyzing' | 'simplifying' | 'structuring' | 'done'

export type ConversionJobStatus =
  'queued' | 'processing' | 'done' | 'failed' | 'canceled'

export interface ApiErrorBody {
  /** 프론트가 화면 문구 · 버튼을 정할 때 쓴다. 예: IMAGE_UNREADABLE */
  code: string
  /** 로그 · 디버깅용. 화면에는 그대로 보여 주지 않는다 (src/routes/-result/conversion-error.ts) */
  message: string
}

export interface ConversionStatus {
  status: ConversionJobStatus
  stage: ConversionStage
  /** 0 ~ 1 */
  progress: number
  /** status 가 done 일 때만 */
  result?: DocumentResult
  /** status 가 failed 일 때만 */
  error?: ApiErrorBody
}
