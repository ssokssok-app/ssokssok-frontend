import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** InfoItem 묶음. 이름표와 내용의 짝이라 dl 로 만든다. Figma 에서는 항목 사이 20px. */
export function InfoList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <dl className={cn('flex flex-col gap-5', className)}>{children}</dl>
}

interface InfoItemProps {
  label: string
  /** 줄바꿈(\n)은 그대로 보여 준다 (예: 월 임금 내역) */
  children: ReactNode
  className?: string
}

/** Figma List (Vertical). 파란 이름표(기한, 신고 방법 …)와 그 내용. */
export function InfoItem({ label, children, className }: InfoItemProps) {
  return (
    <div className={cn('flex flex-col items-start gap-1.5', className)}>
      <dt className="rounded-md bg-blue-80 px-2 py-1 text-caption-l-semibold text-blue-600">
        {label}
      </dt>
      <dd className="w-full text-body-regular whitespace-pre-line text-gray-900">
        {children}
      </dd>
    </div>
  )
}
