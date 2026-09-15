/**
 * 로그인 (docs/api-contract.md "5. 로그인").
 */

export type LoginProvider = 'kakao' | 'google'

/** 내 정보 (GET /api/users/me) */
export interface Me {
  id: string
  /** 설정 화면에 보여 주는 이름 (2026-09-15 사용자와 정함) */
  nickname: string
  provider: LoginProvider
  /** 카카오는 이메일 동의항목을 보류해서 null 이다 */
  email: string | null
}
