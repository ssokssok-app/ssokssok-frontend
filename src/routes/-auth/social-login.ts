import { isLoginProvider } from '@/api/auth'
import { isRecord } from '@/lib/utils'
import type { LoginProvider } from '@/types/auth'

import { type InputMethod, isInputMethod } from '../-home/home-search'

/**
 * 카카오 · 구글 로그인 시작과 콜백 확인 (docs/architecture.md "백엔드 연동").
 *
 * 1. startSocialLogin: state 를 만들어 저장하고 카카오 · 구글 로그인 화면으로 이동한다
 * 2. 콜백 라우트(src/routes/auth/$provider/callback.tsx)가 takePendingLogin 으로 꺼내 state 를 비교한다
 *
 * state 와 돌아갈 화면은 sessionStorage 에 둔다. 로그인 화면에 다녀오는 동안 페이지가 새로 열려 메모리는 비기 때문이다.
 * 토큰이 아니라 한 번 쓰고 지우는 확인 값이라 이 탭에만 둔다. sessionStorage 접근은 이 파일에서만 한다.
 */

const STORAGE_KEY = 'social-login-pending'

/** 로그인을 시작하지 못했을 때 알림. 읽어야 하는 오류라 Toast 대신 모달로 띄운다 */
export const LOGIN_UNAVAILABLE_NOTICE = {
  title: '지금은 로그인할 수 없어요',
  description: '잠시 뒤에 다시 시도해주세요.',
}

/** 로그인을 마치고 돌아갈 화면. 주소 문자열 대신 정해진 화면만 받는다 (AGENTS.md "로그인 · 인증") */
export type LoginReturnTo =
  { to: '/'; resume?: InputMethod } | { to: '/settings' }

interface PendingLogin {
  provider: LoginProvider
  state: string
  returnTo: LoginReturnTo
}

const clientIds: Record<LoginProvider, string | undefined> = {
  kakao: import.meta.env.VITE_KAKAO_REST_API_KEY,
  google: import.meta.env.VITE_GOOGLE_CLIENT_ID,
}

const authorizeUrls: Record<LoginProvider, string> = {
  kakao: 'https://kauth.kakao.com/oauth/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
}

// 구글은 받을 정보를 적어야 한다. 카카오는 콘솔의 동의항목(닉네임)을 따른다
const extraParams: Record<LoginProvider, Record<string, string>> = {
  kakao: {},
  google: { scope: 'openid email profile' },
}

/** 콘솔에 등록한 콜백 주소. 로그인 화면을 열 때와 백엔드에 코드를 넘길 때 똑같아야 한다 */
export function getRedirectUri(provider: LoginProvider) {
  return `${window.location.origin}/auth/${provider}/callback`
}

/**
 * 로그인 화면으로 이동한다. 키가 없거나(키를 넣지 않은 미리보기 배포 등) 저장소를 쓸 수 없으면 이동하지 않고 false 를 돌려준다.
 */
export function startSocialLogin(
  provider: LoginProvider,
  returnTo: LoginReturnTo,
): boolean {
  const clientId = clientIds[provider]
  if (!clientId) return false

  const state = crypto.randomUUID()
  const pending: PendingLogin = { provider, state, returnTo }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
  } catch {
    // state 를 저장하지 못하면 돌아와서 확인할 수 없으니 시작하지 않는다
    return false
  }

  const url = new URL(authorizeUrls[provider])
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: getRedirectUri(provider),
    state,
    ...extraParams[provider],
  }).toString()
  // replace 가 아니라 assign 이라, 로그인 화면에서 뒤로 가기를 누르면 쏙쏙으로 돌아온다
  window.location.assign(url)
  return true
}

/** 저장해 둔 로그인 시작 정보를 꺼내고 바로 지운다 (한 번만 쓴다). 없거나 모양이 틀리면 null */
export function takePendingLogin(): PendingLogin | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return raw === null ? null : parsePendingLogin(JSON.parse(raw))
  } catch {
    return null
  }
}

function parsePendingLogin(value: unknown): PendingLogin | null {
  if (!isRecord(value)) return null
  const { provider, state, returnTo } = value
  if (!isLoginProvider(provider) || typeof state !== 'string') return null
  const parsedReturnTo = parseReturnTo(returnTo)
  return parsedReturnTo && { provider, state, returnTo: parsedReturnTo }
}

function parseReturnTo(value: unknown): LoginReturnTo | null {
  if (!isRecord(value)) return null
  if (value.to === '/settings') return { to: '/settings' }
  if (value.to === '/') {
    return isInputMethod(value.resume)
      ? { to: '/', resume: value.resume }
      : { to: '/' }
  }
  return null
}
