import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Figma Document_Chip. 문서 종류 이름표 (홈 - 가능한 문서 종류). 누를 수 없는 표시용이다. */
export function DocumentChip({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-gray-80 px-2.5 py-1 text-body-medium text-gray-900',
        className,
      )}
    >
      {children}
    </span>
  )
}
