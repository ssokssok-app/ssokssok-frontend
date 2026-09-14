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
      <Outlet />
    </ToastProvider>
  )
}
