import { CtaButton } from '@/components/cta-button'
import { Divider } from '@/components/divider'
import { DocumentChip } from '@/components/document-chip'
import { DocumentListItem } from '@/components/document-list-item'
import { FaqItem, FaqList } from '@/components/faq'
import { InfoItem, InfoList } from '@/components/info-list'
import { useToast } from '@/hooks/useToast'

import { CatalogItem, CatalogSection } from './catalog-section'

export function DividerSection() {
  return (
    <CatalogSection title="Divider" figmaNodeId="80:841">
      <CatalogItem label="line (DividerLine)">
        <Divider />
      </CatalogItem>
      <CatalogItem label="section (Divider, 화면 폭 전체)">
        <Divider variant="section" className="-mx-5 w-auto" />
      </CatalogItem>
    </CatalogSection>
  )
}

export function DocumentChipSection() {
  return (
    <CatalogSection title="Document_Chip" figmaNodeId="120:2198">
      <CatalogItem label="홈 - 가능한 문서 종류">
        <div className="flex flex-col items-start gap-2.5">
          <DocumentChip>근로 계약서</DocumentChip>
          <DocumentChip>임대차 계약서</DocumentChip>
          <DocumentChip>과태료 납부 안내문</DocumentChip>
          <DocumentChip>국민연금 안내문</DocumentChip>
        </div>
      </CatalogItem>
    </CatalogSection>
  )
}

export function ToastSection() {
  const showToast = useToast()

  return (
    <CatalogSection title="Toast" figmaNodeId="80:965">
      <CatalogItem label="누르면 화면 아래에 뜸 (5초 뒤 사라짐)">
        <div className="flex gap-2">
          <CtaButton size="md" onClick={() => showToast('듣기를 중단했어요')}>
            알림 띄우기
          </CtaButton>
          <CtaButton
            size="md"
            variant="secondary"
            onClick={() => showToast('저장했어요')}
          >
            다른 알림
          </CtaButton>
        </div>
      </CatalogItem>
    </CatalogSection>
  )
}

export function InfoListSection() {
  return (
    <CatalogSection title="List" figmaNodeId="80:838">
      <CatalogItem label="InfoList + InfoItem (줄바꿈 포함)">
        <InfoList>
          <InfoItem label="기한">2024년 11월 14일까지</InfoItem>
          <InfoItem label="신고 방법">팩스, 우편, 전화</InfoItem>
          <InfoItem label="월 임금">
            {'총 2,800,000원\n기본급 2,700,000원\n식대 100,000원'}
          </InfoItem>
        </InfoList>
      </CatalogItem>
    </CatalogSection>
  )
}

export function DocumentListSection() {
  return (
    <CatalogSection title="Document_List" figmaNodeId="81:7305">
      <CatalogItem label="홈 - 샘플 체험 (간격 8px)">
        <div className="flex flex-col gap-2">
          <DocumentListItem>근로 계약서</DocumentListItem>
          <DocumentListItem>임대차 계약서</DocumentListItem>
        </div>
      </CatalogItem>
    </CatalogSection>
  )
}

export function FaqSection() {
  return (
    <CatalogSection title="FAQ" figmaNodeId="73:2422">
      <CatalogItem label="Closed · Opened (눌러서 펼침, 여러 개 동시에)">
        <FaqList>
          <FaqItem
            question="국민연금에 꼭 가입해야 하나요?"
            answer="네. 만 18세 이상 60세 미만이고 가입 대상에 해당하면 국민연금에 가입해야 해요. 일부는 제외될 수 있어요."
          />
          <FaqItem
            question="신고소득금액은 얼마로 적어야 하나요?"
            answer="현재 한 달에 평균적으로 버는 금액을 적으면 돼요."
          />
          <FaqItem
            question="살다가 시설이 고장 나면 누가 수리하나요?"
            answer="오래된 시설이 임차인의 책임 없이 고장 나면 임대인이 수리해요."
          />
        </FaqList>
      </CatalogItem>
    </CatalogSection>
  )
}
