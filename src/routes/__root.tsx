import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { whenSessionRestored } from '@/api/client'
import { ToastProvider } from '@/components/toast'
import { cn } from '@/lib/utils'

import { DesktopIntro } from './-root/desktop-intro'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // 로그인한 적이 있으면 로그인 되살리기(쿠키 갱신)가 끝난 뒤 화면을 그린다.
  // 화면마다 따로 기다리면 빠뜨리는 곳이 생겨, 이미 로그인한 사람에게 로그인 시트가 뜰 수 있다
  beforeLoad: async () => {
    await whenSessionRestored()
  },
  // 보통 0.1~0.3초라 대기 화면 없이 바로 뜬다. 1초가 넘을 때만 보여 주고, 보이면 0.5초는 유지해 깜빡이지 않게 한다
  pendingMs: 1000,
  pendingMinMs: 500,
  pendingComponent: AppPending,
  component: RootLayout,
})

/**
 * 앱 기둥. 600px 보다 좁으면 화면을 꽉 채우고, 넓으면 가운데에 선다.
 * 데스크톱 화면에서는 오른쪽에 소개(DesktopIntro)를 두려고 기둥을 조금 왼쪽에 둔다 (src/index.css "데스크톱 화면")
 */
const appColumnClassName =
  'relative mx-auto min-h-dvh w-full max-w-app bg-white desktop:mr-0 desktop:ml-(--app-column-left)'

/** 앱을 켤 때 로그인 되살리기가 1초 넘게 걸리면 보이는 화면. Figma 에 없어 문구만 둔다 (docs/product.md "확인 필요") */
function AppPending() {
  return (
    <>
      <main
        role="status"
        className={cn(
          appColumnClassName,
          'flex items-center justify-center px-5 text-center',
        )}
      >
        <p className="text-headline-m-semibold text-gray-900">
          잠시만 기다려주세요
        </p>
      </main>
      <DesktopIntro />
    </>
  )
}

function RootLayout() {
  return (
    // 어느 화면에서든 useToast() 로 알림을 띄울 수 있게 한다
    <ToastProvider>
      <div className={appColumnClassName}>
        <Outlet />
      </div>
      <DesktopIntro />
    </ToastProvider>
  )
}
