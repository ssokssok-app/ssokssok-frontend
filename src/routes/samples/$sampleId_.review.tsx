import { createFileRoute } from '@tanstack/react-router'

import { sampleResultQueryOptions } from '@/api/samples'
import { useToast } from '@/hooks/useToast'

import { ReviewView } from '../-review/review-view'
import { samplePhotos } from './-sample-photos'
import { sampleParams } from './-sample-params'

/*
 * 샘플의 촬영한 문서 확인 (Figma 221:2840). 샘플 목록에서 고르면 먼저 이 화면에서 예시 사진 한 장을 보고,
 * "다 찍었어요" 를 누르면 로딩 화면을 거쳐 결과로 간다. 실제로 찍는 흐름을 그대로 체험하게 하려는 화면이다.
 * 예시 사진은 바꿀 수 없어서 추가 · 지우기는 누르면 짧은 알림만 띄운다 (반응이 없으면 고장으로 오해할 수 있어서).
 */
export const Route = createFileRoute('/samples/$sampleId_/review')({
  params: sampleParams,
  // 결과는 이 화면에 있는 동안 미리 받아 둔다. 로딩 화면은 결과 화면이 따로 최소 시간만큼 보여 준다
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(
      sampleResultQueryOptions(params.sampleId),
    )
  },
  component: SampleReviewPage,
})

function SampleReviewPage() {
  const { sampleId } = Route.useParams()
  const navigate = Route.useNavigate()
  const showToast = useToast()

  return (
    <ReviewView
      photos={[{ id: sampleId, src: samplePhotos[sampleId] }]}
      selectedIndex={0}
      onSelect={() => {}}
      onBack={() => navigate({ to: '/' })}
      onAdd={() => showToast('샘플에서는 사진을 추가할 수 없어요')}
      onDelete={() => showToast('샘플에서는 사진을 지울 수 없어요')}
      onConfirm={() =>
        navigate({ to: '/samples/$sampleId', params: { sampleId } })
      }
    />
  )
}
