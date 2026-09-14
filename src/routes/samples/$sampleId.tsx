import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  notFound,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'

import { isSampleId, sampleResultQueryOptions } from '@/api/samples'
import { useToast } from '@/hooks/useToast'

import { parseParagraphSearch } from '../-result/paragraph-search'
import { ResultError } from '../-result/result-error'
import { ResultLoading } from '../-result/result-loading'
import { ResultView } from '../-result/result-view'
import { SourceView } from '../-result/source-view'

/*
 * 샘플 문서 결과. 로그인 없이 볼 수 있다.
 * 변환 과정(로딩 화면)을 체험하게 하려고 loader 로 미리 받지 않고, 화면에서 받으면서 로딩 화면을 보여 준다.
 */
export const Route = createFileRoute('/samples/$sampleId')({
  params: {
    parse: ({ sampleId }) => {
      if (!isSampleId(sampleId)) throw notFound()
      return { sampleId }
    },
    stringify: ({ sampleId }) => ({ sampleId }),
  },
  validateSearch: parseParagraphSearch,
  component: SampleResultPage,
})

function SampleResultPage() {
  const { sampleId } = Route.useParams()
  const { paragraph } = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const showToast = useToast()
  const { data, isPending, isError, refetch } = useQuery(
    sampleResultQueryOptions(sampleId),
  )

  if (isPending) return <ResultLoading />
  if (isError) {
    return (
      <ResultError
        primaryAction={{ label: '다시 시도하기', onClick: () => refetch() }}
        secondaryAction={{
          label: '홈으로 가기',
          onClick: () => navigate({ to: '/' }),
        }}
      />
    )
  }

  function openSource(paragraphIndex: number) {
    navigate({ search: { paragraph: paragraphIndex }, resetScroll: false })
  }

  function closeSource() {
    // 원문 보기를 열 때 주소를 하나 쌓았으니 뒤로 가서 닫는다. 주소로 바로 들어왔다면 결과 주소로 바꾼다
    if (canGoBack) router.history.back()
    else navigate({ search: {}, replace: true, resetScroll: false })
  }

  return (
    <>
      <ResultView
        result={data}
        // 샘플은 다시 열 수 있어서, 결과가 사라진다는 나가기 확인 없이 홈으로 간다
        onExit={() => navigate({ to: '/' })}
        onOpenSource={openSource}
        onSave={() => showToast('저장하기는 아직 준비 중이에요')}
      />
      <SourceView
        paragraph={
          paragraph === undefined ? null : (data.paragraphs[paragraph] ?? null)
        }
        onClose={closeSource}
      />
    </>
  )
}
