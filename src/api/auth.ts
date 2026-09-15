import type { LoginProvider } from '@/types/auth'

import { apiRequest, beginSession, endSession, readAccessToken } from './client'
import { ApiError } from './errors'

/**
 * 로그인 · 로그아웃 · 회원 탈퇴 (docs/api-contract.md "5. 로그인").
 * 토큰은 src/api/client.ts 가 다룬다. 로그인 여부가 바뀌면 users 쿼리를 지우는 것은 부르는 쪽이 한다.
 */

const loginProviders: readonly unknown[] = ['kakao', 'google']

export function isLoginProvider(value: unknown): value is LoginProvider {
  return loginProviders.includes(value)
}

interface LoginCodeRequest {
  provider: LoginProvider
  /** 카카오 · 구글이 콜백 주소로 돌려준 인가 코드 */
  code: string
  /** 로그인 화면을 열 때 쓴 콜백 주소. 콘솔에 등록한 4개가 아니면 400 INVALID_REQUEST */
  redirectUri: string
}

/** 인가 코드를 백엔드에 넘겨 로그인한다. 리프레시 토큰은 응답의 HttpOnly 쿠키로 저장된다 */
export async function loginWithCode(
  { provider, code, redirectUri }: LoginCodeRequest,
  signal: AbortSignal,
) {
  const body = await apiRequest(`/api/auth/${provider}`, {
    method: 'POST',
    json: { code, redirectUri },
    signal,
  })
  const token = readAccessToken(body)
  if (!token) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: '로그인 응답에 액세스 토큰이 없어요.',
    })
  }
  beginSession(token)
}

/** 백엔드가 리프레시 토큰을 무효로 하고 쿠키를 지운다. 실패하면 쿠키가 남아 다시 로그인되므로 로그인 상태를 두고 오류를 던진다 */
export async function logout() {
  await apiRequest('/api/auth/logout', { method: 'POST' })
  endSession()
}

/** 회원 탈퇴. 백엔드가 카카오 연결 끊기 · 구글 토큰 해제를 같이 한다 */
export async function deleteAccount() {
  await apiRequest('/api/users/me', { method: 'DELETE', auth: true })
  endSession()
  // 탈퇴 응답은 리프레시 토큰 쿠키를 지우지 않아 로그아웃으로 한 번 더 지운다.
  // 서버 세션은 이미 지워져서, 이 요청이 실패해도 남은 쿠키로 다시 로그인되지는 않는다
  try {
    await logout()
  } catch {
    // 탈퇴는 끝났으므로 화면에 실패를 알리지 않는다
  }
}
