import { Separator } from '@base-ui/react/separator'

import { cn } from '@/lib/utils'

interface DividerProps {
  /** section: 구역 사이 12px 회색 띠 (Figma Divider), line: 1px 선 (Figma DividerLine) */
  variant?: 'section' | 'line'
  className?: string
}

/** Figma Divider. section 은 화면 폭 전체를 채우므로 부모 여백 밖으로 늘려 쓴다. */
export function Divider({ variant = 'line', className }: DividerProps) {
  return (
    <Separator
      className={cn(
        'w-full shrink-0',
        variant === 'section' ? 'h-3 bg-gray-90' : 'h-px bg-gray-100',
        className,
      )}
    />
  )
}
