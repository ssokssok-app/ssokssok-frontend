import BubbleTail from '@/assets/images/bubble-tail.svg?react'
import { cn } from '@/lib/utils'

interface UsageBubbleProps {
  remaining: number
  className?: string
}

/**
 * 홈 문서 입력 버튼 위에 뜨는 오늘 남은 이용 횟수 말풍선 (Figma 230:4997).
 * 문구는 Figma "남은 이용 횟수" 대신 하루 기준임이 드러나는 "오늘 이용 가능한 횟수" 를 쓴다 (docs/product.md)
 */
export function UsageBubble({ remaining, className }: UsageBubbleProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-white drop-shadow-bubble',
        className,
      )}
    >
      <p className="flex items-center gap-1 rounded-[8px] bg-white px-3 py-1.5 whitespace-nowrap">
        <span className="text-caption-l-medium text-gray-600">
          오늘 이용 가능한 횟수
        </span>
        <span className="text-caption-l-semibold text-blue-500">
          {remaining}회
        </span>
      </p>
      <BubbleTail aria-hidden className="h-[7.2px] w-[15.8px]" />
    </div>
  )
}
