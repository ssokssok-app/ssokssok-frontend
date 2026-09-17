import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@base-ui/react/button'
import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

import { CtaButton } from '@/components/cta-button'
import { cn } from '@/lib/utils'

/*
 * Figma Modal. 70% 어두운 배경 위 가운데 카드.
 * - Modal: 안내 모달 (Safety, 개인정보 안내). 바깥을 누르면 닫힌다
 * - ConfirmModal: 되돌릴 수 없는 행동 확인 (Exit, 나가기). 버튼으로만 닫힌다
 * 제목 · 설명의 줄바꿈(\n)은 그대로 보여 준다.
 *
 * 화면이 낮거나(가로 모드) 큰글씨 모드로 카드가 화면보다 길어지면 Viewport 가 세로로 스크롤된다.
 * 안쪽 틀이 최소 화면 높이(min-h-full)에서 가운데 정렬하므로, 짧으면 가운데 · 길면 위부터 끝까지 볼 수 있다
 * (Base UI 문서의 "Outside scroll dialog" 구조).
 * 넓은 화면에서는 카드가 앱 기둥 가운데에 뜬다(app-column-inset). 어두운 배경은 화면 전체를 덮는다.
 */
const backdropClassName =
  'fixed inset-0 z-50 bg-dimmed transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0'
const viewportClassName =
  'fixed inset-y-0 z-50 app-column-inset overflow-y-auto overscroll-contain'
const viewportContentClassName =
  'flex min-h-full items-center justify-center px-7 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]'
const popupClassName =
  'flex w-full max-w-[337px] flex-col items-center gap-10 rounded-[20px] bg-white px-5 pt-10 pb-5 shadow-modal outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0'
const titleClassName =
  'text-headline-m-semibold whitespace-pre-line text-gray-900'
const descriptionClassName =
  'text-body-medium whitespace-pre-line text-gray-700'

function Illustration({ src }: { src: string }) {
  return <img src={src} alt="" className="h-[109px] w-[92px] object-cover" />
}

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 위쪽 일러스트 이미지 주소 (src/assets/images). Figma 에 없는 안내(문의 주소 등)는 생략한다 */
  illustration?: string
  title: string
  description: string
  /** 아래 버튼들. ModalClose · ModalTextButton 을 넣는다 */
  children: ReactNode
}

export function Modal({
  open,
  onOpenChange,
  illustration,
  title,
  description,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={backdropClassName} />
        <Dialog.Viewport className={viewportClassName}>
          <div className={viewportContentClassName}>
            <Dialog.Popup className={popupClassName}>
              <div className="flex w-full flex-col items-center gap-2.5 text-center">
                {illustration && <Illustration src={illustration} />}
                <div className="flex flex-col gap-5">
                  <Dialog.Title className={titleClassName}>
                    {title}
                  </Dialog.Title>
                  <Dialog.Description className={descriptionClassName}>
                    {description}
                  </Dialog.Description>
                </div>
              </div>
              <div className="flex w-full flex-col items-center gap-4">
                {children}
              </div>
            </Dialog.Popup>
          </div>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Modal 을 닫는 파란 버튼 (Figma CTA md). onClick 을 주면 닫기 전에 실행한다. */
export function ModalClose({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <Dialog.Close render={<CtaButton size="md" />} onClick={onClick}>
      {children}
    </Dialog.Close>
  )
}

/** Modal 아래 밑줄 글자 버튼 (Figma "다시 보지 않기"). */
export function ModalTextButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      className="text-caption-l-semibold text-gray-400 underline underline-offset-2 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      {children}
    </Button>
  )
}

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  illustration: string
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  cancelLabel?: string
  className?: string
}

export function ConfirmModal({
  open,
  onOpenChange,
  illustration,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = '취소',
  className,
}: ConfirmModalProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={backdropClassName} />
        <AlertDialog.Viewport className={viewportClassName}>
          <div className={viewportContentClassName}>
            <AlertDialog.Popup className={cn(popupClassName, className)}>
              <div className="flex w-full flex-col items-center gap-2.5 text-center">
                <Illustration src={illustration} />
                <div className="flex flex-col gap-5">
                  <AlertDialog.Title className={titleClassName}>
                    {title}
                  </AlertDialog.Title>
                  <AlertDialog.Description className={descriptionClassName}>
                    {description}
                  </AlertDialog.Description>
                </div>
              </div>
              <div className="flex w-full gap-2">
                <AlertDialog.Close
                  render={<CtaButton variant="secondary" size="md" />}
                >
                  {cancelLabel}
                </AlertDialog.Close>
                <CtaButton size="md" onClick={onConfirm}>
                  {confirmLabel}
                </CtaButton>
              </div>
            </AlertDialog.Popup>
          </div>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
