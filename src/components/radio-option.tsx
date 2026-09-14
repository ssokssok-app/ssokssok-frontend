import { Radio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface RadioGroupProps extends Omit<
  BaseRadioGroup.Props<string>,
  'className'
> {
  className?: string
}

/** 라디오 묶음. 가로로 20px 간격 (Figma Listening 의 목소리 속도 선택). */
export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <BaseRadioGroup
      className={cn('flex flex-wrap items-center gap-5', className)}
      {...props}
    />
  )
}

interface RadioOptionProps {
  value: string
  children: ReactNode
  className?: string
}

/**
 * Figma Radio_Selection.
 * 원은 Figma 벡터와 같은 치수를 테두리로 그린다: 선택 전 1px 회색 테두리, 선택 후 5px 파란 테두리(가운데 10px 비움).
 */
export function RadioOption({ value, children, className }: RadioOptionProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-[9px] text-body-medium text-gray-900',
        className,
      )}
    >
      <Radio.Root
        value={value}
        className="size-5 shrink-0 rounded-full border border-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-checked:border-[5px] data-checked:border-blue-500"
      />
      {children}
    </label>
  )
}
