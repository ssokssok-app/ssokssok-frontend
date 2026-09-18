import { EasyParagraph } from '@/components/easy-paragraph'
import { InfoItem, InfoList } from '@/components/info-list'
import { MustCard, MustCardEmpty, TodoList } from '@/components/must-card'
import { ResultHero, type ResultIllustration } from '@/components/result-hero'
import type { DocumentKind } from '@/types/document-result'

import { CatalogItem, CatalogSection } from './catalog-section'

export function EasyParagraphSection() {
  return (
    <CatalogSection title="Easy_Paragraph" figmaNodeId="101:951">
      <CatalogItem label="소제목 + 본문 (줄바꿈 포함)">
        <EasyParagraph title="계약 기간">
          {'2024년 3월 1일부터\n2026년 2월 28일까지 2년 동안 살 수 있어요.'}
        </EasyParagraph>
      </CatalogItem>
    </CatalogSection>
  )
}

export function MustCardSection() {
  return (
    <CatalogSection title="Must" figmaNodeId="156:4257">
      <CatalogItem label="Default (내용 있음)">
        <div className="flex flex-col gap-4">
          <MustCard kind="must">
            <InfoList>
              <InfoItem label="기한">2024년 11월 14일까지</InfoItem>
              <InfoItem label="신고 방법">팩스, 우편, 전화</InfoItem>
              <InfoItem label="예외 사항">
                현재 소득이 없다면 납부예외 신청
              </InfoItem>
              <InfoItem label="미신고 시">보험료 부과</InfoItem>
            </InfoList>
          </MustCard>
          <MustCard kind="todo">
            <TodoList
              items={['가입신고서 작성하기', '국민연금공단에 신고하기']}
            />
          </MustCard>
        </div>
      </CatalogItem>
      <CatalogItem label="None (내용 없음)">
        <div className="flex flex-col gap-4">
          <MustCard kind="must">
            <MustCardEmpty />
          </MustCard>
          <MustCard kind="todo">
            <MustCardEmpty />
          </MustCard>
        </div>
      </CatalogItem>
    </CatalogSection>
  )
}

const heroExamples: {
  label: string
  type: DocumentKind
  illustration?: ResultIllustration
  title: string
  description: string
}[] = [
  {
    label: 'lease_contract',
    type: 'lease_contract',
    title: '원룸 임대차 계약서예요',
    description: '보증금과 월세, 계약 기간을 꼭 확인해주세요',
  },
  {
    label: 'labor_contract',
    type: 'labor_contract',
    title: '근로계약서예요',
    description: '근무 조건과 급여 내용을 꼭 확인해주세요',
  },
  {
    label: 'notice · 국민연금 샘플 (illustration="pension")',
    type: 'notice',
    illustration: 'pension',
    title: '국민연금 가입 신고가 필요해요',
    description:
      '최근 소득 활동이 확인되어,\n2024년 11월 14일까지 가입 신고가 필요해요.',
  },
  {
    label: 'notice · 그 밖의 안내문 (범용 그림)',
    type: 'notice',
    title: '자궁경부암 검진 안내문이에요',
    description: '검진 기간과 준비할 것을 꼭 확인해주세요',
  },
  {
    label: 'fine',
    type: 'fine',
    title: '교통 과태료 사전통지서예요',
    description: '위반 내용과 납부 기한을 꼭 확인해주세요',
  },
  {
    label: 'other',
    type: 'other',
    title: '일반 범용 안내문',
    description: '설명란설명란설명란설명란설명란',
  },
]

export function ResultHeroSection() {
  return (
    <CatalogSection title="Result_Main" figmaNodeId="115:1743">
      {heroExamples.map(({ label, ...example }) => (
        <CatalogItem key={label} label={label}>
          <ResultHero {...example} className="-mx-5" />
        </CatalogItem>
      ))}
    </CatalogSection>
  )
}
