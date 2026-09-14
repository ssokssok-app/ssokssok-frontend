import type { ReactNode, Ref } from 'react'

import { Gnb } from '@/components/gnb'

interface ResultHeaderProps {
  title: ReactNode
  left?: ReactNode
  right?: ReactNode
  ref?: Ref<HTMLDivElement>
}

/**
 * 결과 화면 · 원문 보기 위에 붙는 파란 헤더 (Figma Frame 54, GNB Variant2).
 * 스크롤해도 위에 붙어 있고, 배경은 아래 결과 머리(Result_Main)의 그라디언트와 이어진다.
 * 높이는 GNB 60px + 위 안전 영역이다. 결과 머리 · 바로가기 메뉴가 이 높이(calc(60px+env(safe-area-inset-top)))에 맞춘다.
 */
export function ResultHeader({ title, left, right, ref }: ResultHeaderProps) {
  return (
    <div
      ref={ref}
      className="sticky top-0 z-30 bg-gradient-header pt-[env(safe-area-inset-top)]"
    >
      <Gnb tone="light" title={title} left={left} right={right} />
    </div>
  )
}
