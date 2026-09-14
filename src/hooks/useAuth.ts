import { useSyncExternalStore } from 'react'

/**
 * 로그인 상태 (임시).
 *
 * - 인증 방식(토큰 저장 위치 · 갱신)이 아직 정해지지 않았다 (docs/architecture.md "백엔드 연동").
 *   그전까지는 로그인 버튼을 누르면 이 탭의 메모리에서만 로그인한 것으로 친다. 새로고침하면 풀린다.
 * - 백엔드 소셜 로그인이 준비되면 이 파일 안만 바꾸고, 화면은 useAuth() 를 그대로 쓴다.
 */

let loggedIn = false
const listeners = new Set<() => void>()

function setLoggedIn(next: boolean) {
  loggedIn = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return loggedIn
}

function login() {
  setLoggedIn(true)
}

function logout() {
  setLoggedIn(false)
}

export function useAuth() {
  const isLoggedIn = useSyncExternalStore(subscribe, getSnapshot)

  return { isLoggedIn, login, logout }
}
