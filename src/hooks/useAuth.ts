import { useSyncExternalStore } from 'react'

/**
 * 로그인 상태 (임시).
 *
 * - 인증 방식(토큰 저장 위치 · 갱신)이 아직 정해지지 않았다 (docs/architecture.md "백엔드 연동").
 *   그전까지는 로그인 버튼을 누르면 이 탭의 메모리에서만 로그인한 것으로 친다. 새로고침하면 풀린다.
 * - 백엔드 소셜 로그인이 준비되면 이 파일 안만 바꾸고, 화면은 useAuth() 를 그대로 쓴다.
 */

export type LoginProvider = 'kakao' | 'google'

export interface Account {
  provider: LoginProvider
  /** 로그인한 계정 이메일. 백엔드 연결 전에는 알 수 없어 null 이다 */
  email: string | null
}

let currentAccount: Account | null = null
const listeners = new Set<() => void>()

function setAccount(next: Account | null) {
  currentAccount = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentAccount
}

function login(provider: LoginProvider) {
  setAccount({ provider, email: null })
}

function logout() {
  setAccount(null)
}

export function useAuth() {
  const account = useSyncExternalStore(subscribe, getSnapshot)

  return { account, isLoggedIn: account !== null, login, logout }
}
