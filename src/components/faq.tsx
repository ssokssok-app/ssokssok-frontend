import { Accordion } from '@base-ui/react/accordion'
import type { ReactNode } from 'react'

import ArrowDropDownIcon from '@/assets/icons/24/arrow-drop-down.svg?react'
import ArrowRightIcon from '@/assets/icons/24/arrow-right.svg?react'
import { cn } from '@/lib/utils'

/**
 * FaqItem 묶음. 항목 사이에 1px 선 (Figma Frame 64).
 * 여러 개를 동시에 펼칠 수 있고, 닫힌 답변도 브라우저 페이지 검색으로 찾으면 펼쳐진다.
 */
export function FaqList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Accordion.Root
      multiple
      hiddenUntilFound
      className={cn('flex flex-col divide-y divide-gray-100', className)}
    >
      {children}
    </Accordion.Root>
  )
}

interface FaqItemProps {
  question: string
  answer: ReactNode
}

/** Figma FAQ. 닫히면 ▸, 펼치면 ▾ 아이콘 (Figma 의 두 아이콘을 그대로 바꿔 끼운다). */
export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <Accordion.Item className="bg-white">
      <Accordion.Header>
        <Accordion.Trigger className="group flex w-full items-start justify-between gap-2 py-3 text-left text-body-regular text-black select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-panel-open:pb-2.5">
          <span className="flex-1">{question}</span>
          <ArrowRightIcon
            aria-hidden
            className="size-6 shrink-0 text-gray-400 group-data-panel-open:hidden"
          />
          <ArrowDropDownIcon
            aria-hidden
            className="hidden size-6 shrink-0 text-gray-400 group-data-panel-open:block"
          />
        </Accordion.Trigger>
      </Accordion.Header>
      {/* 닫힌 패널은 hidden="until-found" 라 내용만 숨고 여백은 남는다. 여백은 안쪽 요소에 둔다 */}
      <Accordion.Panel className="text-body-regular text-gray-700">
        <div className="pb-3">{answer}</div>
      </Accordion.Panel>
    </Accordion.Item>
  )
}
