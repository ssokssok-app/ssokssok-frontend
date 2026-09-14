import { type SampleId, sampleDocuments } from '@/api/samples'
import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
} from '@/components/bottom-sheet'
import { DocumentListItem } from '@/components/document-list-item'

interface SampleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (sampleId: SampleId) => void
}

/** 홈 - 샘플 체험 시트 (Figma 66:940). 로그인 없이 볼 수 있는 샘플 문서 목록이다. */
export function SampleSheet({
  open,
  onOpenChange,
  onSelect,
}: SampleSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      className="pt-[22px] pb-[50px]"
    >
      <div className="flex flex-col gap-0.5">
        <BottomSheetTitle>샘플 체험해보기</BottomSheetTitle>
        <BottomSheetDescription>
          사용해보고 싶은 문서를 선택해주세요
        </BottomSheetDescription>
      </div>
      <ul className="mt-[22px] flex flex-col gap-2">
        {sampleDocuments.map((sample) => (
          <li key={sample.id}>
            <DocumentListItem onClick={() => onSelect(sample.id)}>
              {sample.title}
            </DocumentListItem>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
