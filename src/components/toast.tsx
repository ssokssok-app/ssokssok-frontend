import { Toast } from '@base-ui/react/toast'
import type { ReactNode } from 'react'

const TOAST_TIMEOUT_MS = 2000

/**
 * Figma Toast. 짧은 알림 한 줄 (예: 듣기를 중단했어요).
 *
 * - 앱 루트(src/routes/__root.tsx)에 한 번 둔다. 띄우기는 src/hooks/useToast.ts 의 useToast().
 * - 한 번에 하나만 보인다. 새 알림이 오면 이전 알림은 숨긴다.
 * - 2초 보이고 사라진다. 기본값 5초는 길다는 디자이너 의견으로 줄였다 (2026-09-16). 읽어야 하는 알림은 Toast 가 아니라 모달로 띄운다.
 * - Figma 에 쓰인 화면이 없어 위치는 앱 기둥 아래 가운데로 정했다. 화면 아래에 붙은 CTA(촬영한 문서 확인 "다 찍었어요" 등, 아래 여백 20px + 높이 58px)를
 *   가리지 않게 바닥에서 96px 위에 띄운다.
 * - 누를 곳이 없는 알림이라 터치를 통과시킨다. 겹치더라도 아래 버튼이 눌려야 해서다.
 * - 홈 바가 있는 iPhone 에서 가리지 않게 아래 안전 영역(safe-area)만큼 더 띄운다.
 *   env(safe-area-inset-bottom) 은 index.html viewport 에 viewport-fit=cover 가 있어야 값이 생긴다 (없으면 0).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider limit={1} timeout={TOAST_TIMEOUT_MS}>
      {children}
      <Toast.Portal>
        <Toast.Viewport
          aria-label="알림"
          className="pointer-events-none fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 app-column-inset"
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
      className="absolute inset-x-5 bottom-0 mx-auto max-w-[353px] rounded-lg bg-gray-800 px-5 py-[9px] text-center transition-opacity duration-200 data-ending-style:opacity-0 data-limited:hidden data-starting-style:opacity-0"
    >
      <Toast.Title className="text-body-semibold text-white" />
    </Toast.Root>
  ))
}
