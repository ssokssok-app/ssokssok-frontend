import { Drawer } from '@base-ui/react/drawer'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/*
 * 바텀시트. Figma Component 섹션에는 없지만, 홈 화면의 시트 셋(로그인 유도 · 지원 문서 · 샘플 목록)이 같은 틀로 그려져 있다.
 * 어두운 배경 위로 아래에서 올라오는 흰 판(위 모서리 20px)과 손잡이(50×8). 아래로 쓸어내리거나 바깥을 누르면 닫힌다.
 * 제목 크기 · 정렬과 간격은 시트마다 달라서 BottomSheetTitle · BottomSheetDescription 과 children 으로 페이지가 채운다.
 *
 * - 판을 화면 아래로 3rem 더 늘려(bleed) 위로 당겨도 아래 틈이 보이지 않게 한다 (Base UI Drawer 예제 구조)
 * - 아래 여백은 홈 바(safe area)와 20px 중 큰 값이다. Figma 는 홈 바 34px 를 포함해 그렸으니 페이지는 그 위 여백만 더한다
 * - 넓은 화면에서는 앱 폭(max-w-app)만큼만 가운데에 뜬다
 * - 큰글씨 모드 · 가로 화면에서 화면보다 길어지면 판 안에서 스크롤된다
 * - 배경 어둡기: Figma 샘플 목록 시트만 58% 이고 나머지는 Dimmed/Normal(70%)이라 70% 로 맞췄다
 * - 동작 줄이기 설정이면 올라오고 내려가는 움직임 없이 바로 나타나고 사라진다. 손가락으로 끄는 동안 따라오는 것은 그대로다
 */
const backdropClassName =
  'fixed inset-0 z-50 min-h-dvh bg-dimmed opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute'
const popupClassName =
  '-mb-12 flex max-h-[calc(100dvh-1.5rem+3rem)] w-full max-w-app flex-col overflow-y-auto overscroll-contain rounded-t-[20px] bg-white px-5 pt-3 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+3rem)] outline-none touch-auto [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] motion-reduce:transition-none'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 손잡이 아래 내용. BottomSheetTitle 을 반드시 넣는다 (스크린리더가 시트 이름으로 읽는다) */
  children: ReactNode
  /** 손잡이 아래 내용 영역의 클래스. 시트마다 다른 위 · 아래 여백을 준다 */
  className?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className={backdropClassName} />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Drawer.Popup className={popupClassName}>
            <div
              aria-hidden
              className="mx-auto h-2 w-[50px] shrink-0 rounded-[10px] bg-gray-90"
            />
            <Drawer.Content className={cn('flex flex-col', className)}>
              {children}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

/** 시트 제목. 기본은 Title/Semibold 왼쪽 정렬이다. 줄바꿈(\n)은 그대로 보여 준다. */
export function BottomSheetTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Drawer.Title
      className={cn(
        'text-title-semibold whitespace-pre-line text-gray-900',
        className,
      )}
    >
      {children}
    </Drawer.Title>
  )
}

/** 시트 제목 아래 보조 설명. */
export function BottomSheetDescription({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Drawer.Description
      className={cn('text-body-medium text-gray-500', className)}
    >
      {children}
    </Drawer.Description>
  )
}
