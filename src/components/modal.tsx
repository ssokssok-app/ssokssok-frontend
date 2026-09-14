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
 */
const backdropClassName =
  'fixed inset-0 z-50 bg-dimmed transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0'
const viewportClassName =
  'fixed inset-0 z-50 flex items-center justify-center px-7'
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
  /** 위쪽 일러스트 이미지 주소 (src/assets/images) */
  illustration: string
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
          <Dialog.Popup className={popupClassName}>
            <div className="flex w-full flex-col items-center gap-2.5 text-center">
              <Illustration src={illustration} />
              <div className="flex flex-col gap-5">
                <Dialog.Title className={titleClassName}>{title}</Dialog.Title>
                <Dialog.Description className={descriptionClassName}>
                  {description}
                </Dialog.Description>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              {children}
            </div>
          </Dialog.Popup>
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
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
