import type { SampleId } from '@/api/samples'
import sampleFinePhoto from '@/assets/images/sample-fine.jpg'
import sampleHouseContractPhoto from '@/assets/images/sample-house-contract.jpg'
import samplePensionNoticePhoto from '@/assets/images/sample-pension-notice.jpg'
import sampleWorkContractPhoto from '@/assets/images/sample-work-contract.jpg'

/**
 * 샘플 촬영한 문서 확인 화면에 넣어 두는 예시 사진 (Figma Screen 섹션 근로계약서 111:1458 · 임대차계약서 94:1015 · 국민연금 77:2914 · 과태료고지서 111:1461).
 * 디자이너가 만든 가상 문서다 (이름 · 주소 · 번호 모두 가짜, 2026-09-16 사용자 확인). 원본을 폭 900px JPEG 로 줄였다.
 */
export const samplePhotos: Record<SampleId, string> = {
  'work-contract': sampleWorkContractPhoto,
  'house-contract': sampleHouseContractPhoto,
  'pension-notice': samplePensionNoticePhoto,
  fine: sampleFinePhoto,
}
