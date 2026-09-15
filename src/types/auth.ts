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

/**
 * 오늘 남은 변환 횟수 (GET /api/users/me/usage).
 * 백엔드에 제안한 모양이라 아직 Swagger 에 없다 (docs/api-contract.md "백엔드에 보낼 제안" 13번)
 */
export interface Usage {
  /** 오늘 더 변환할 수 있는 횟수. 결과를 받았을 때만 줄어든다 */
  remaining: number
  /** 하루에 변환할 수 있는 횟수 */
  limit: number
}
