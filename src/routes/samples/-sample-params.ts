import { notFound } from '@tanstack/react-router'

import { isSampleId, type SampleId } from '@/api/samples'

/** 샘플 주소의 $sampleId 확인. 모르는 샘플이면 404 다. 샘플 확인 화면과 결과 화면이 같이 쓴다 */
export const sampleParams = {
  parse: ({ sampleId }: { sampleId: string }): { sampleId: SampleId } => {
    if (!isSampleId(sampleId)) throw notFound()
    return { sampleId }
  },
  stringify: ({ sampleId }: { sampleId: SampleId }) => ({ sampleId }),
}
