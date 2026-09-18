import { Menu } from '@base-ui/react/menu'
import type { ReactElement } from 'react'

export interface DropdownMenuItem {
  label: string
  onSelect: () => void
}

interface DropdownMenuProps {
  /** 메뉴를 여는 버튼. 누르면 버튼 아래 오른쪽 끝에 붙어 뜬다 */
  trigger: ReactElement
  items: DropdownMenuItem[]
  /** 버튼과 메뉴 사이 간격(px). 버튼의 누르는 영역이 아이콘보다 넓으면 그만큼 빼서 준다 */
  sideOffset?: number
  /** 메뉴 오른쪽 끝을 버튼 오른쪽 끝에서 옮기는 값(px). 양수면 왼쪽으로 간다 */
  alignOffset?: number
}

/**
 * Figma Menu (251:3217). 홈 설정 아이콘을 누르면 뜨는 메뉴. 항목을 누르면 닫히고 onSelect 를 부른다.
 * 바깥을 누르거나 Esc 로 닫히고, 방향키로 항목을 옮길 수 있다 (Base UI Menu).
 *
 * Figma 는 안쪽 여백 20px · 항목 간격 12px 에 항목 높이가 글자 높이(24px)뿐이라 누르기 작다.
 * 보이는 자리는 같게 두고, 항목마다 위아래 6px 씩 누르는 영역을 넓혀 여백 · 간격에서 뺐다 (14 + 6 = 20, 6 + 6 = 12).
 */
export function DropdownMenu({
  trigger,
  items,
  sideOffset = 0,
  alignOffset = 0,
}: DropdownMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className="z-40 outline-none"
        >
          <Menu.Popup className="flex flex-col rounded-[12px] bg-white py-3.5 shadow-menu outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
            {items.map((item) => (
              <Menu.Item
                key={item.label}
                onClick={item.onSelect}
                className="px-5 py-1.5 text-body-medium whitespace-nowrap text-gray-900 outline-none select-none data-highlighted:bg-gray-80"
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
