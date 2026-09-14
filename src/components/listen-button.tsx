import { Button } from '@base-ui/react/button'

import PauseIcon from '@/assets/icons/20/pause.svg?react'
import PlayArrowIcon from '@/assets/icons/20/play-arrow.svg?react'
import { cn } from '@/lib/utils'

interface ListenButtonProps extends Omit<
  Button.Props,
  'className' | 'children'
> {
  /** 읽어 주는 중이면 "정지", 아니면 "듣기" 를 보여 준다 */
  playing: boolean
  className?: string
}

/** Figma Listening_Button. 글을 소리로 읽어 주기 시작 · 정지. */
export function ListenButton({
  playing,
  className,
  ...props
}: ListenButtonProps) {
  const Icon = playing ? PauseIcon : PlayArrowIcon

  return (
    <Button
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg bg-blue-80 py-1 pr-2.5 pl-1.5 text-caption-l-semibold text-blue-500 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-90',
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      {playing ? '정지' : '듣기'}
    </Button>
  )
}
