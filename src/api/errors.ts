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
