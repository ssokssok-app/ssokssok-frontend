import { Button } from '@base-ui/react/button'
import type { ComponentType, ReactNode, SVGProps } from 'react'

import SettingsIcon24 from '@/assets/icons/24/settings.svg?react'
import SettingsIcon32 from '@/assets/icons/32/settings.svg?react'
import SsokssokLogo from '@/assets/logos/ssokssok.svg?react'
import { BigFontSwitch } from '@/components/big-font-switch'
import { useFontScale } from '@/hooks/useFontScale'
import { cn } from '@/lib/utils'

/*
 * Figma GNB. 화면 맨 위 막대. 배경은 투명이라 화면 배경을 그대로 보여 준다.
 * - Gnb: 제목 + 양쪽 아이콘 버튼 (Default · Variant2)
 * - HomeGnb: 로고 + 큰글씨 스위치 + 설정 (Home · Home_BIg)
 */

interface GnbProps {
  /** 가운데 제목. 대화상자 제목처럼 감싸야 할 때는 요소를 넣는다 */
  title?: ReactNode
  left?: ReactNode
  right?: ReactNode
  /** light: 흰 글자 (카메라 · 결과 화면의 어두운 배경), dark: 진한 글자 (흰 배경) */
  tone: 'light' | 'dark'
  className?: string
}

export function Gnb({ title, left, right, tone, className }: GnbProps) {
  return (
    <header
      className={cn(
        'flex min-h-[60px] items-center justify-between gap-2 px-5 py-3',
        tone === 'light' ? 'text-white' : 'text-gray-900',
        className,
      )}
    >
      {/* 제목이 가운데에 오도록 양쪽 칸을 아이콘 크기(24px)로 맞춘다 */}
      <div className="flex size-6 shrink-0 items-center">{left}</div>
      {title && (
        <h1 className="flex-1 text-center text-title-semibold">{title}</h1>
      )}
      <div className="flex size-6 shrink-0 items-center justify-end">
        {right}
      </div>
    </header>
  )
}

interface GnbIconButtonProps {
  /** 스크린리더가 읽는 이름 (예: 뒤로 가기) */
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  onClick?: () => void
  className?: string
}

/** GNB 의 24px 아이콘 버튼. 누르는 영역은 바깥으로 8px 넓힌다. 색은 Gnb 의 tone 을 따른다. */
export function GnbIconButton({
  label,
  icon: Icon,
  onClick,
  className,
}: GnbIconButtonProps) {
  return (
    <Button
      aria-label={label}
      onClick={onClick}
      className={cn(
        '-m-2 p-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500',
        className,
      )}
    >
      <Icon aria-hidden className="size-6" />
    </Button>
  )
}

/** 홈 화면 GNB. 큰글씨 모드가 켜지면 설정 아이콘이 24px → 32px 로 커진다 (Figma Home_BIg). */
export function HomeGnb({
  onSettingsClick,
  className,
}: {
  onSettingsClick?: () => void
  className?: string
}) {
  const { isLarge } = useFontScale()
  const SettingsIcon = isLarge ? SettingsIcon32 : SettingsIcon24

  return (
    <header
      className={cn(
        'flex min-h-[60px] items-center justify-between gap-2 px-5 py-2.5',
        className,
      )}
    >
      {/* Figma Logo(230:4744). GNB 에서 보이는 크기가 약 54.5×31.5px 이라 비율(482:280)을 지켜 맞춘다 */}
      <SsokssokLogo
        role="img"
        aria-label="쏙쏙"
        className="h-8 w-[55px] shrink-0 text-blue-500"
      />
      <div className={cn('flex items-center', isLarge ? 'gap-3.5' : 'gap-2.5')}>
        <BigFontSwitch />
        <Button
          aria-label="설정"
          onClick={onSettingsClick}
          className="-m-2 p-2 text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
        >
          <SettingsIcon aria-hidden className={isLarge ? 'size-8' : 'size-6'} />
        </Button>
      </div>
    </header>
  )
}
