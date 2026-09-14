import { Button } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Figma CTA. 화면 아래 주요 버튼과 모달 버튼.
 *
 * - variant: primary 파란 버튼(다 찍었어요 · 확인 · 나가기), secondary 회색 버튼(취소), dark 어두운 버튼(저장하기)
 * - size: lg 화면 아래(58px), md 모달 안(50px). 높이는 최소값이라 큰글씨 모드에서 늘어난다
 * - 아이콘은 children 에 24px 아이콘을 글자 앞에 넣는다. 색은 글자색(흰색)을 따른다
 * - 링크에 같은 모양이 필요해지면 ctaButtonVariants 를 별도 파일로 옮겨 export 한다 (컴포넌트 파일은 컴포넌트만 export)
 */
const ctaButtonVariants = cva(
  'inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-disabled:opacity-40 [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 active:bg-blue-600',
        secondary: 'bg-gray-400 active:bg-gray-500',
        dark: 'bg-gray-700 active:bg-gray-800',
      },
      size: {
        lg: 'min-h-[58px] py-3',
        md: 'min-h-[50px] py-2.5',
      },
    },
    compoundVariants: [
      // Figma: 저장하기(dark) 는 58px 버튼이지만 글자가 Body 크기다
      {
        variant: ['primary', 'secondary'],
        size: 'lg',
        className: 'text-subtitle-semibold',
      },
      { variant: 'dark', size: 'lg', className: 'gap-2.5 text-body-semibold' },
      { size: 'md', className: 'text-body-semibold' },
    ],
    defaultVariants: { variant: 'primary', size: 'lg' },
  },
)

interface CtaButtonProps
  extends
    Omit<Button.Props, 'className'>,
    VariantProps<typeof ctaButtonVariants> {
  className?: string
}

export function CtaButton({
  variant,
  size,
  className,
  ...props
}: CtaButtonProps) {
  return (
    <Button
      className={cn(ctaButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
