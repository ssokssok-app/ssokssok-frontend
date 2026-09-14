import type { ReactNode } from 'react'

/** 카탈로그의 컴포넌트 한 묶음. Figma 노드 ID 를 같이 적어 비교할 곳을 찾기 쉽게 한다. */
export function CatalogSection({
  title,
  figmaNodeId,
  children,
}: {
  title: string
  figmaNodeId: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 bg-white px-5 py-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-subtitle-semibold text-gray-900">{title}</h2>
        <span className="text-caption-l-regular text-gray-400">
          Figma {figmaNodeId}
        </span>
      </div>
      {children}
    </section>
  )
}

/** variant 하나. 위에 이름표를 붙인다. */
export function CatalogItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-caption-l-regular text-gray-500">{label}</p>
      {children}
    </div>
  )
}
