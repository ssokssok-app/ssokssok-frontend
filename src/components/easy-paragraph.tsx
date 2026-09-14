import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EasyParagraphProps {
  title: string
  /** 줄바꿈(\n)은 그대로 보여 준다 */
  children: ReactNode
  className?: string
}

/**
 * Figma Easy_Paragraph. 쉬운 글 화면의 소제목과 본문 한 묶음.
 * 결과 화면 구조(h1 GNB 제목 → h2 구역 제목) 아래에 오므로 소제목은 h3 이다.
 */
export function EasyParagraph({
  title,
  children,
  className,
}: EasyParagraphProps) {
  return (
    <section className={cn('flex flex-col gap-0.5 text-black', className)}>
      <h3 className="text-subtitle-semibold">{title}</h3>
      <p className="text-body-regular whitespace-pre-line">{children}</p>
    </section>
  )
}
