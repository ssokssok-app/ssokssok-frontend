import type { ComponentType, SVGProps } from 'react'

import { CatalogSection } from './catalog-section'

const iconModules = import.meta.glob<ComponentType<SVGProps<SVGSVGElement>>>(
  '../../../assets/icons/*/*.svg',
  { query: '?react', import: 'default', eager: true },
)

// '../../../assets/icons/24/close.svg' → { size: '24', name: 'close' }
const icons = Object.entries(iconModules).map(([path, Icon]) => {
  const [, size, name] = path.match(/icons\/(\d+)\/([\w-]+)\.svg$/) ?? []
  return { size, name, Icon }
})
const iconSizes = [...new Set(icons.map((icon) => icon.size))].sort(
  (a, b) => Number(b) - Number(a),
)

export function IconSection() {
  return (
    <CatalogSection title="Icon" figmaNodeId="80:685 · 133:1524 · 133:1631">
      {iconSizes.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-caption-l-semibold text-gray-500">{size}px</p>
          <ul className="grid grid-cols-4 gap-2">
            {icons
              .filter((icon) => icon.size === size)
              .map(({ name, Icon }) => (
                <li
                  key={name}
                  className="flex flex-col items-center gap-1 rounded-lg bg-gray-80 p-2 text-gray-700"
                >
                  <Icon />
                  <span className="text-center text-caption-s-semibold break-all text-gray-500">
                    {name}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </CatalogSection>
  )
}
