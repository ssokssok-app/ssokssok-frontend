import { useSyncExternalStore } from 'react'

import { hasSession, subscribeSession } from '@/api/client'

/**
 * 로그인 여부. 토큰과 갱신은 src/api/client.ts 가 맡고, 이 훅은 화면이 로그인 여부를 따라 다시 그려지게만 한다.
 *
 * - 로그인은 카카오 · 구글 화면을 다녀와 콜백 라우트(src/routes/auth/$provider/callback.tsx)가 마친다.
 *   시작은 src/routes/-auth/social-login.ts.
 * - 앱을 켤 때 로그인을 되살리는 동안에는 false 다. 로그인 여부로 동작이 갈리는 곳은 whenSessionRestored() 를 기다린다.
 */
export function useAuth() {
  const isLoggedIn = useSyncExternalStore(subscribeSession, hasSession)

  return { isLoggedIn }
}
