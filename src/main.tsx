import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { initSession, subscribeSession } from '@/api/client'
import { usersQueryKey } from '@/api/users'
import { initFontScale } from '@/hooks/useFontScale'
import { LOGIN_ENABLED } from '@/lib/features'
import { queryClient } from '@/lib/query-client'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // 캐싱은 TanStack Query가 담당하므로 라우터 preload 캐시는 끈다
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

initFontScale()
// 로그인한 적이 있으면 쿠키로 로그인을 되살리기 시작한다. 루트 라우트가 끝날 때까지 기다린 뒤 첫 화면을 그린다.
// 로그인을 꺼 두면 부르지 않는다. 그러면 되살리기가 처음부터 끝난 상태라 루트 라우트가 기다리지 않고, 예전 로그인 표시도 되살아나지 않는다
if (LOGIN_ENABLED) initSession()
// 로그인 · 로그아웃 · 탈퇴 · 만료 · 다른 탭 로그아웃 등 로그인이 바뀌면 한 곳에서 사용자 정보 캐시를 지운다
subscribeSession(() => queryClient.removeQueries({ queryKey: usersQueryKey }))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
