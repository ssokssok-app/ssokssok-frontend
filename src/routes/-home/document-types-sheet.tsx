import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
} from '@/components/bottom-sheet'
import { CtaButton } from '@/components/cta-button'
import { DocumentChip } from '@/components/document-chip'

const supportedDocuments = [
  '근로 계약서',
  '임대차 계약서',
  '과태료 납부 안내문',
  '국민연금 안내문',
]

interface DocumentTypesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/** 홈 - 가능한 문서 종류 시트 (Figma 66:1116). 문서를 넣기 직전에 지원하는 문서를 알려 준다. */
export function DocumentTypesSheet({
  open,
  onOpenChange,
  onConfirm,
}: DocumentTypesSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} className="pt-9">
      <div className="flex flex-col gap-0.5">
        <BottomSheetTitle>쏙쏙은 아래 문서를 지원해요</BottomSheetTitle>
        <BottomSheetDescription>
          다른 문서는 내용을 정확하게 읽지 못할 수 있어요
        </BottomSheetDescription>
      </div>
      <ul className="mt-6 flex flex-col items-start gap-2.5">
        {supportedDocuments.map((name) => (
          <li key={name}>
            <DocumentChip>{name}</DocumentChip>
          </li>
        ))}
      </ul>
      <p className="mt-[22px] text-caption-l-regular text-gray-300">
        *추후에 더 많은 문서들을 지원할 예정이에요
      </p>
      <CtaButton className="mt-[31px]" onClick={onConfirm}>
        이해했어요
      </CtaButton>
    </BottomSheet>
  )
}
