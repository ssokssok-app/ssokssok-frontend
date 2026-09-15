import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { restoreSession } from '@/api/client'
import { initFontScale } from '@/hooks/useFontScale'
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
// 로그인한 적이 있으면 첫 화면을 그리는 동안 쿠키로 로그인을 되살린다 (기다리지 않는다)
restoreSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
