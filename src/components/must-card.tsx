import type { ReactNode } from 'react'

import mustCheckImage from '@/assets/images/must-check.png'
import mustTodoImage from '@/assets/images/must-todo.png'
import { cn } from '@/lib/utils'

/*
 * Figma Must. 결과 화면의 "꼭 확인하세요" · "해야할 일" 카드.
 * 머리(제목 · 설명 · 일러스트)는 kind 로 정해지고, 몸통은 children 으로 넣는다.
 * - 꼭 확인하세요: <InfoList> (src/components/info-list.tsx)
 * - 해야할 일: <TodoList>
 * - 내용이 없을 때 (Figma Status=None): <MustCardEmpty>
 */
const kinds = {
  must: {
    title: '꼭 확인하세요',
    description: '중요한 정보를 한번 더 정리했어요',
    image: mustCheckImage,
    imageClassName: 'top-3 right-1.5 h-[107px] w-[103px]',
  },
  todo: {
    title: '해야할 일',
    description: '현재 시점에 해야할 일들이에요',
    image: mustTodoImage,
    imageClassName: 'top-3 right-3 h-[97px] w-[94px]',
  },
}

interface MustCardProps {
  kind: keyof typeof kinds
  children: ReactNode
  className?: string
}

export function MustCard({ kind, children, className }: MustCardProps) {
  const { title, description, image, imageClassName } = kinds[kind]

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[16px] border-[1.4px] border-gradient-line',
        className,
      )}
    >
      {/* 일러스트는 머리 오른쪽 위에 겹쳐 두고, 머리 밖으로 나간 부분은 잘린다 (Figma 그대로) */}
      <div className="relative overflow-hidden bg-gradient-must-header px-5 py-6">
        <div className="relative z-10 flex max-w-[205px] flex-col">
          <h3 className="text-title-semibold text-blue-500">{title}</h3>
          <p className="text-body-regular text-gray-600">{description}</p>
        </div>
        <img
          src={image}
          alt=""
          className={cn(
            'pointer-events-none absolute object-cover',
            imageClassName,
          )}
        />
      </div>
      {/*
       * 머리와 몸통 사이에 선을 두지 않는다. Figma 는 "해야할 일" 카드에만 안쪽으로 들여 그린 선이 있어
       * 가장자리에서 끊겨 보이고, "꼭 확인하세요" 카드는 선 없이 배경만으로 나뉜다. 선 없는 쪽으로 맞췄다 (docs/product.md)
       */}
      <div className="px-5 py-[26px]">{children}</div>
    </section>
  )
}

/** 해야할 일 목록. 번호 동그라미는 글자 크기를 따라 커진다. */
export function TodoList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map((item, index) => (
        <li key={item} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-[1.43em] shrink-0 items-center justify-center rounded-full bg-blue-300 text-caption-l-semibold text-white"
          >
            {index + 1}
          </span>
          <span className="flex-1 text-body-regular text-black">{item}</span>
        </li>
      ))}
    </ol>
  )
}

/** Figma Must (Status=None). 이 문서 종류에서는 카드 내용을 만들 수 없을 때. */
export function MustCardEmpty({
  children = '이 문서 형태에서는 제공할 수 없어요.',
}: {
  children?: ReactNode
}) {
  return <p className="text-body-medium text-gray-500">{children}</p>
}
