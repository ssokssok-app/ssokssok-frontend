import { Button } from '@base-ui/react/button'

import ArrowForwardIosIcon from '@/assets/icons/20/arrow-forward-ios.svg?react'
import { cn } from '@/lib/utils'

interface DocumentListItemProps extends Omit<Button.Props, 'className'> {
  className?: string
}

/** Figma Document_List. 문서 이름과 오른쪽 화살표가 있는 목록 버튼 (홈 - 샘플 체험). */
export function DocumentListItem({
  children,
  className,
  ...props
}: DocumentListItemProps) {
  return (
    <Button
      className={cn(
        'flex min-h-[60px] w-full items-center justify-between gap-2 rounded-lg border-[1.6px] border-gray-90 bg-white px-5 py-3.5 text-left text-subtitle-semibold text-gray-900 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-80',
        className,
      )}
      {...props}
    >
      {children}
      <ArrowForwardIosIcon
        aria-hidden
        className="size-5 shrink-0 text-gray-300"
      />
    </Button>
  )
}
