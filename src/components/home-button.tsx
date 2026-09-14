import { Button } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import ArrowForwardIosIcon from '@/assets/icons/24/arrow-forward-ios.svg?react'
import SampleFilledIcon from '@/assets/icons/32/sample-filled.svg?react'
import { cn } from '@/lib/utils'

/**
 * Figma HomeButton (Default). 홈 화면의 큰 선택 버튼.
 *
 * - variant: primary 파란 버튼(문서 촬영하기), secondary 연한 파란 버튼(사진첩에서 선택하기 · 파일 불러오기)
 * - 아이콘은 children 에 32px 아이콘을 글자 앞에 넣는다. 색은 글자색을 따른다
 */
const homeButtonVariants = cva(
  'flex min-h-16 w-full items-center gap-3.5 rounded-lg px-5 py-3 text-left text-subtitle-semibold select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 [&_svg]:size-8 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white active:bg-blue-600',
        secondary: 'bg-blue-100 text-blue-500 active:bg-blue-200',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

interface HomeButtonProps
  extends
    Omit<Button.Props, 'className'>,
    VariantProps<typeof homeButtonVariants> {
  className?: string
}

export function HomeButton({ variant, className, ...props }: HomeButtonProps) {
  return (
    <Button
      className={cn(homeButtonVariants({ variant }), className)}
      {...props}
    />
  )
}

interface HomeSampleButtonProps extends Omit<
  Button.Props,
  'className' | 'children' | 'title'
> {
  title: string
  description: string
  className?: string
}

/** Figma HomeButton (Sample). 샘플 체험 카드형 버튼. */
export function HomeSampleButton({
  title,
  description,
  className,
  ...props
}: HomeSampleButtonProps) {
  return (
    <Button
      className={cn(
        'flex min-h-20 w-full items-center justify-between gap-2.5 rounded-lg border border-gray-90 bg-gray-80 px-4 py-3 text-left select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-90',
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-2.5">
        <SampleFilledIcon
          aria-hidden
          className="size-8 shrink-0 text-gray-400"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-body-semibold text-gray-900">{title}</span>
          <span className="text-caption-l-semibold text-gray-500">
            {description}
          </span>
        </span>
      </span>
      <ArrowForwardIosIcon
        aria-hidden
        className="size-6 shrink-0 text-gray-300"
      />
    </Button>
  )
}
