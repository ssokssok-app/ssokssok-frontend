import { Toast } from '@base-ui/react/toast'
import type { ReactNode } from 'react'

/**
 * Figma Toast. 짧은 알림 한 줄 (예: 듣기를 중단했어요).
 *
 * - 앱 루트(src/routes/__root.tsx)에 한 번 둔다. 띄우기는 src/hooks/useToast.ts 의 useToast().
 * - 한 번에 하나만 보인다. 새 알림이 오면 이전 알림은 숨긴다.
 * - Figma 에 쓰인 화면이 없어 위치는 화면 아래 가운데(아래 24px)로 정했다. 페이지 단계에서 조정할 수 있다.
 * - 홈 바가 있는 iPhone 에서 가리지 않게 아래 안전 영역(safe-area)만큼 더 띄운다.
 *   env(safe-area-inset-bottom) 은 index.html viewport 에 viewport-fit=cover 가 있어야 값이 생긴다 (없으면 0).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider limit={1}>
      {children}
      <Toast.Portal>
        <Toast.Viewport
          aria-label="알림"
          className="fixed inset-x-5 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-[353px]"
        >
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className="absolute inset-x-0 bottom-0 rounded-lg bg-gray-800 px-5 py-[9px] text-center transition-opacity duration-200 data-ending-style:opacity-0 data-limited:hidden data-starting-style:opacity-0"
    >
      <Toast.Title className="text-body-semibold text-white" />
    </Toast.Root>
  ))
}
