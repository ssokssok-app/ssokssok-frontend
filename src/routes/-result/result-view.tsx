import { useRef } from 'react'

import CloseIcon from '@/assets/icons/24/close.svg?react'
import DownloadIcon from '@/assets/icons/24/download.svg?react'
import HomeIcon from '@/assets/icons/24/home.svg?react'
import { CtaButton } from '@/components/cta-button'
import { Divider } from '@/components/divider'
import { FaqItem, FaqList } from '@/components/faq'
import { GnbIconButton } from '@/components/gnb'
import { InfoItem, InfoList } from '@/components/info-list'
import { MustCard, MustCardEmpty, TodoList } from '@/components/must-card'
import { QuickMenu } from '@/components/quick-menu'
import { ResultHero, type ResultIllustration } from '@/components/result-hero'
import { cn } from '@/lib/utils'
import type { DocumentResult } from '@/types/document-result'

import { EasyBody } from './easy-body'
import { ResultHeader } from './result-header'
import { sectionElementId, useSectionScroll } from './use-section-scroll'

type ResultSection = 'easy' | 'must' | 'todo' | 'more'

const sections: ResultSection[] = ['easy', 'must', 'todo', 'more']

const menuItems: { value: ResultSection; label: string }[] = [
  { value: 'easy', label: '쉬운 본문' },
  { value: 'must', label: '꼭 확인하세요' },
  { value: 'todo', label: '해야할 일' },
  { value: 'more', label: '더 알아보기' },
]

function isResultSection(value: string): value is ResultSection {
  return sections.includes(value as ResultSection)
}

interface ResultViewProps {
  result: DocumentResult
  /** 맨 위 일러스트. 주지 않으면 문서 종류(kind)의 기본 그림 */
  illustration?: ResultIllustration
  /** 홈 · 닫기 아이콘. 결과가 저장되지 않는 화면이면 페이지가 나가기 확인을 띄운다 */
  onExit: () => void
  onOpenSource: (paragraphIndex: number) => void
  onSave: () => void
}

/**
 * 문서 인식 결과 화면 (Figma 73:2264, 임대차 94:1072, 과태료 94:3082, 근로계약서 111:1338).
 * 촬영 결과와 샘플 결과가 같이 쓴다. 데이터를 받는 방법 · 화면 이동은 페이지가 맡는다.
 */
export function ResultView({
  result,
  illustration,
  onExit,
  onOpenSource,
  onSave,
}: ResultViewProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { activeSection, menuStuck, scrollToSection } = useSectionScroll({
    sections,
    headerRef,
    menuRef,
  })

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ResultHeader
        ref={headerRef}
        title="문서 인식 결과"
        left={<GnbIconButton label="홈으로" icon={HomeIcon} onClick={onExit} />}
        right={<GnbIconButton label="닫기" icon={CloseIcon} onClick={onExit} />}
      />

      {/* 결과 머리는 헤더 밑까지 끌어올려 배경이 이어지게 하고, 내용은 헤더 아래 18px 부터 둔다 (Figma pt 138 = 120 + 18) */}
      <ResultHero
        type={result.kind}
        illustration={illustration}
        category={result.category}
        title={result.title}
        description={result.summary}
        className="-mt-[calc(60px+env(safe-area-inset-top))] pt-[calc(78px+env(safe-area-inset-top))]"
      />

      {/* 위아래 12px 을 메뉴 안쪽 여백으로 둬서, 헤더 밑에 붙었을 때도 Figma(156:5663)처럼 흰 띠가 된다 */}
      <div
        ref={menuRef}
        className={cn(
          'sticky top-[calc(60px+env(safe-area-inset-top))] z-20 mt-[18px] bg-white py-3 transition-shadow',
          menuStuck && 'shadow-sticky',
        )}
      >
        <QuickMenu
          items={menuItems}
          value={activeSection}
          onValueChange={(value) => {
            if (isResultSection(value)) scrollToSection(value)
          }}
        />
      </div>

      <main className="flex flex-col gap-[30px] pt-[18px]">
        <EasyBody
          id={sectionElementId('easy')}
          paragraphs={result.paragraphs}
          sourceLines={result.sourceLines}
          onOpenSource={onOpenSource}
        />

        <Divider variant="section" />

        <div className="flex flex-col gap-4 px-5">
          <div id={sectionElementId('must')}>
            <MustCard kind="must">
              {result.mustCheck?.length ? (
                <InfoList>
                  {result.mustCheck.map((item, index) => (
                    <InfoItem key={`${index}-${item.label}`} label={item.label}>
                      {item.value}
                    </InfoItem>
                  ))}
                </InfoList>
              ) : (
                <MustCardEmpty />
              )}
            </MustCard>
          </div>
          <div id={sectionElementId('todo')}>
            <MustCard kind="todo">
              {result.todos?.length ? (
                <TodoList items={result.todos} />
              ) : (
                <MustCardEmpty />
              )}
            </MustCard>
          </div>
        </div>

        <Divider variant="section" />

        <section
          id={sectionElementId('more')}
          aria-label="더 알아보기"
          className="flex flex-col gap-2 px-5"
        >
          <h2 className="text-title-semibold text-blue-500">더 알아보기</h2>
          {result.faqs?.length ? (
            <FaqList>
              {result.faqs.map((faq) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </FaqList>
          ) : (
            <MustCardEmpty />
          )}
        </section>

        <footer className="bg-gray-80 px-5 pt-5 pb-[max(3rem,calc(env(safe-area-inset-bottom)+0.875rem))]">
          <CtaButton variant="dark" onClick={onSave}>
            <DownloadIcon aria-hidden />
            저장하기
          </CtaButton>
        </footer>
      </main>
    </div>
  )
}
