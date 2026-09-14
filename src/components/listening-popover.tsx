import { Button } from '@base-ui/react/button'
import { Popover } from '@base-ui/react/popover'
import type { ReactElement } from 'react'

import CloseIcon from '@/assets/icons/24/close.svg?react'
import { RadioGroup, RadioOption } from '@/components/radio-option'

export type ListeningSpeed = 'slow' | 'normal' | 'fast'

const speeds: { value: ListeningSpeed; label: string }[] = [
  { value: 'slow', label: '느림' },
  { value: 'normal', label: '보통' },
  { value: 'fast', label: '빠름' },
]

interface ListeningPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 패널을 여는 버튼. 보통 <ListenButton playing={false} /> */
  trigger: ReactElement
  speed: ListeningSpeed
  onSpeedChange: (speed: ListeningSpeed) => void
  onStart: () => void
}

/**
 * Figma Listening. 듣기 버튼을 누르면 버튼 아래 오른쪽 끝에 붙어 뜨는 목소리 속도 패널.
 * 읽는 중(정지 버튼)일 때는 패널을 열지 말고 멈추도록, 페이지가 onOpenChange 에서 판단한다.
 */
export function ListeningPopover({
  open,
  onOpenChange,
  trigger,
  speed,
  onSpeedChange,
  onStart,
}: ListeningPopoverProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-40"
        >
          <Popover.Popup className="flex w-[298px] max-w-[calc(100vw-40px)] flex-col gap-5 rounded-[16px] bg-white p-5 shadow-popover outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
            <div className="flex items-start justify-between gap-2">
              <Popover.Title className="text-subtitle-semibold text-gray-900">
                목소리 속도
              </Popover.Title>
              <Popover.Close
                aria-label="닫기"
                className="-m-2 p-2 text-gray-500 focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <CloseIcon aria-hidden className="size-6" />
              </Popover.Close>
            </div>
            <RadioGroup
              aria-label="목소리 속도"
              value={speed}
              onValueChange={(value) => onSpeedChange(value as ListeningSpeed)}
            >
              {speeds.map(({ value, label }) => (
                <RadioOption key={value} value={value}>
                  {label}
                </RadioOption>
              ))}
            </RadioGroup>
            <Button
              onClick={onStart}
              className="flex min-h-[42px] w-full items-center justify-center rounded-lg bg-blue-500 px-5 py-2 text-body-semibold text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600"
            >
              듣기 시작
            </Button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
