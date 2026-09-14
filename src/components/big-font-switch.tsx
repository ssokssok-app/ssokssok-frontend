import { Switch } from '@base-ui/react/switch'

import { useFontScale } from '@/hooks/useFontScale'
import { cn } from '@/lib/utils'

/**
 * Figma Bigfont. 큰글씨 모드 켜고 끄기.
 * 켜지면 손잡이가 오른쪽으로 가고 커진다 (22px → 26px). 상태는 useFontScale 이 가진다.
 */
export function BigFontSwitch({ className }: { className?: string }) {
  const { isLarge, setFontScale } = useFontScale()

  return (
    <Switch.Root
      checked={isLarge}
      onCheckedChange={(checked) => setFontScale(checked ? 'large' : 'normal')}
      className={cn(
        'group inline-flex items-center rounded-full bg-gray-100 p-1 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-checked:flex-row-reverse data-checked:bg-blue-500',
        className,
      )}
    >
      <Switch.Thumb className="size-[22px] shrink-0 rounded-full bg-white shadow-knob data-checked:size-[26px]" />
      <span className="px-2 text-body-semibold text-gray-600 group-data-checked:text-white">
        큰글씨
      </span>
    </Switch.Root>
  )
}
