import { Button } from '@base-ui/react/button'
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface QuickMenuItem {
  value: string
  label: string
}

interface QuickMenuProps {
  items: QuickMenuItem[]
  /** 지금 보고 있는 항목 */
  value: string
  onValueChange: (value: string) => void
  className?: string
}

/**
 * Figma QuickMenu + QuickMenu_Button. 문서 결과 화면의 구역 바로가기.
 * 항목이 화면보다 길면 가로로 스크롤하고, 선택된 항목이 가려지면 보이는 곳까지 가로로 옮긴다.
 * 스크롤 위치에 따른 선택 변경은 페이지가 맡는다.
 */
export function QuickMenu({
  items,
  value,
  onValueChange,
  className,
}: QuickMenuProps) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    const active = nav?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!nav || !active) return
    // 좌우 여백(px-5)만큼 띄워서 보이게 한다. 세로 스크롤은 건드리지 않도록 scrollIntoView 대신 가로만 옮긴다
    const padding = parseFloat(getComputedStyle(nav).paddingLeft)
    const start = active.offsetLeft - padding
    const end =
      active.offsetLeft + active.offsetWidth + padding - nav.clientWidth
    if (start < nav.scrollLeft)
      nav.scrollTo({ left: start, behavior: 'smooth' })
    else if (end > nav.scrollLeft)
      nav.scrollTo({ left: end, behavior: 'smooth' })
  }, [value])

  return (
    <nav
      ref={navRef}
      aria-label="바로가기"
      className={cn(
        'relative flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <Button
            key={item.value}
            aria-current={active ? 'true' : undefined}
            onClick={() => onValueChange(item.value)}
            className={cn(
              // 선택 전에도 투명 테두리를 둬서 선택할 때 크기가 바뀌지 않게 한다.
              // Figma 는 테두리가 36px 안쪽에 그려져서, 테두리만큼 세로 여백을 줄여 36px 을 맞춘다
              'flex min-h-9 shrink-0 items-center rounded-lg border-[1.4px] px-3 py-1 whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
              active
                ? 'border-blue-300 bg-blue-90 text-body-semibold text-blue-500'
                : 'border-transparent bg-gray-80 text-body-medium text-gray-500',
            )}
          >
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}
