import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { ToastProvider } from '@/components/toast'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    // 어느 화면에서든 useToast() 로 알림을 띄울 수 있게 한다
    <ToastProvider>
      {/* 데스크톱 디자인이 없어, 넓은 화면에서는 모바일 화면을 가운데 앱 폭(600px)으로 세우고 양옆은 body 배경으로 둔다 */}
      <div className="relative mx-auto min-h-dvh w-full max-w-app bg-white">
        <Outlet />
      </div>
    </ToastProvider>
  )
}
