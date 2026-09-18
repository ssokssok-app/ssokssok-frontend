import resultBasicImage from '@/assets/images/result-basic.png'
import resultFineImage from '@/assets/images/result-fine.png'
import resultHouseContractImage from '@/assets/images/result-house-contract.png'
import resultNoticeImage from '@/assets/images/result-notice.png'
import resultWorkContractImage from '@/assets/images/result-work-contract.png'
import { cn } from '@/lib/utils'
import type { DocumentKind } from '@/types/document-result'

/*
 * Figma Result_Main. 결과 화면 맨 위 파란 영역: 문서 종류 일러스트 · 종류 이름표 · 제목 · 설명.
 * 일러스트와 기본 이름표는 문서 종류(type, 백엔드 kind 코드)로 정해지고, 제목 · 설명은 분석 결과를 넣는다.
 * Figma 에서는 위쪽 138px 에 상태 표시줄 · GNB 가 겹쳐 있다. 여기서는 GNB 아래 여백(18px)만 두고,
 * GNB 는 페이지가 이 영역 위에 따로 둔다.
 */

/** 일러스트. Figma 변형과 짝: house-contract = Contract_House, work-contract = Contract_Work, pension = Notice, basic = Basic */
const illustrations = {
  'house-contract': {
    image: resultHouseContractImage,
    className: 'h-[180px] w-[217px]',
  },
  'work-contract': {
    image: resultWorkContractImage,
    className: 'h-[180px] w-[217px]',
  },
  // Figma 변형 이름은 Notice 지만 NPS 로고 · 동전이 그려진 국민연금 전용 그림이다
  pension: { image: resultNoticeImage, className: 'h-[196px] w-[235px]' },
  fine: { image: resultFineImage, className: 'h-[180px] w-[217px]' },
  basic: { image: resultBasicImage, className: 'h-[169px] w-[204px]' },
} satisfies Record<string, { image: string; className: string }>

export type ResultIllustration = keyof typeof illustrations

const documentTypes: Record<
  DocumentKind,
  { illustration: ResultIllustration; category: string }
> = {
  lease_contract: { illustration: 'house-contract', category: '계약서' },
  labor_contract: { illustration: 'work-contract', category: '계약서' },
  // 안내문은 국민연금 · 검진 · 세금처럼 주제가 넓어 범용 그림을 쓴다. 국민연금 그림은 백엔드가 구분해 주지 않아 국민연금 샘플만 고른다
  notice: { illustration: 'basic', category: '안내문' },
  fine: { illustration: 'fine', category: '과태료 통지서' },
  other: { illustration: 'basic', category: '안내문' },
}

interface ResultHeroProps {
  type: DocumentKind
  title: string
  /** 줄바꿈(\n)은 그대로 보여 준다 */
  description: string
  /** 종류 이름표. 주지 않으면 문서 종류의 기본 이름 (계약서 · 안내문 · 과태료 통지서) */
  category?: string
  /** 일러스트. 주지 않으면 문서 종류의 기본 그림 */
  illustration?: ResultIllustration
  className?: string
}

export function ResultHero({
  type,
  title,
  description,
  category,
  illustration,
  className,
}: ResultHeroProps) {
  const documentType = documentTypes[type]
  const { image, className: imageClassName } =
    illustrations[illustration ?? documentType.illustration]

  return (
    <section
      className={cn(
        'flex flex-col items-center gap-[18px] bg-gradient-main px-5 pt-[18px] pb-10 text-center',
        className,
      )}
    >
      {/* 일러스트가 틀(241×154)보다 커서 위아래로 넘친다 (Figma 그대로) */}
      <div className="relative h-[154px] w-[241px] shrink-0">
        <img
          src={image}
          alt=""
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-1/2 object-cover',
            imageClassName,
          )}
        />
      </div>
      <div className="relative flex w-full flex-col items-center gap-4">
        <span className="rounded-md bg-white/15 px-3 py-1 text-body-bold text-white">
          {category ?? documentType.category}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-headline-s-semibold text-white">{title}</h2>
          <p className="text-body-semibold whitespace-pre-line text-gray-90">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
