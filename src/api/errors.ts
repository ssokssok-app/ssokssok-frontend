import { isRecord } from '@/lib/utils'
import type { ApiErrorBody } from '@/types/conversion'

/** 서버가 `{ error: { code, message } }` 로 알려 준 실패 (docs/api-contract.md "4. 오류 형식") */
export class ApiError extends Error {
  readonly code: string

  constructor({ code, message }: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** 실패 응답 본문에서 `{ error: { code, message } }` 를 꺼낸다. 모양이 다르면 HTTP 상태로 만든다 */
export function toApiError(body: unknown, status: number): ApiError {
  const error = isRecord(body) ? body.error : undefined
  if (
    isRecord(error) &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  ) {
    return new ApiError({ code: error.code, message: error.message })
  }
  // 모르는 code 는 화면에서 "잠시 뒤에 다시 시도" 로 보인다 (docs/api-contract.md "백엔드에 보낼 제안" 5번)
  return new ApiError({ code: 'UNKNOWN', message: `HTTP ${status}` })
}
