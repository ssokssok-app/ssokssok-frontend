import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  redirect,
  useBlocker,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { useEffect } from 'react'

import { conversionStatusQueryOptions } from '@/api/conversion'
import { ApiError } from '@/api/errors'
import warningImage from '@/assets/images/warning.png'
import { ConfirmModal } from '@/components/modal'
import {
  endConversionSession,
  getConversionSession,
  startConversionSession,
  useConversionSession,
} from '@/hooks/useConversionSession'
import {
  clearDocumentDraft,
  getDocumentDraft,
  getDraftFiles,
} from '@/hooks/useDocumentDraft'
import { useToast } from '@/hooks/useToast'
import type { ConversionStatus } from '@/types/conversion'

import { parseParagraphSearch } from './-result/paragraph-search'
import { ResultError } from './-result/result-error'
import { ResultLoading } from './-result/result-loading'
import { ResultView } from './-result/result-view'
import { SourceView } from './-result/source-view'

/*
 * 촬영 · 첨부한 문서의 결과. 변환은 앞 화면에서 누른 순간 시작되고(useConversionSession), 여기서 진행 상태를 조회한다.
 * 결과는 저장되지 않아서 새로고침하면 사라지고, 나갈 때는 확인을 받는다.
 */
export const Route = createFileRoute('/result')({
  beforeLoad: () => {
    if (!getConversionSession()) throw redirect({ to: '/' })
  },
  validateSearch: parseParagraphSearch,
  // 결과 화면을 떠나면 진행 중인 변환을 취소하고, 고른 파일을 메모리에서 비운다 (원문 보기처럼 주소만 바뀌면 부르지 않는다)
  onLeave: () => {
    endConversionSession()
    clearDocumentDraft()
  },
  component: ResultPage,
})

// 상태 조회 간격: 처음엔 2초, 1분이 넘으면 4초 (docs/api-contract.md "백엔드에 보낼 제안" 2번)
const POLL_INTERVAL_MS = 2000
const SLOW_POLL_INTERVAL_MS = 4000
const SLOW_POLL_AFTER_MS = 60_000

// 다시 골라야 해결되는 오류. 나머지는 같은 파일로 다시 시도할 수 있다 (docs/api-contract.md "백엔드에 보낼 제안" 5번)
const reselectErrorCodes = new Set([
  'UNSUPPORTED_FORMAT',
  'FILE_TOO_LARGE',
  'TOO_MANY_FILES',
  'IMAGE_UNREADABLE',
  'JOB_NOT_FOUND',
  'JOB_EXPIRED',
])

function isFinished(status: ConversionStatus | undefined) {
  return (
    status?.status === 'done' ||
    status?.status === 'failed' ||
    status?.status === 'canceled'
  )
}

/** 서버 진행 단계 → 로딩 화면 4단계. simplifying 은 "이해 중" · "변환 중" 두 단계라 진행률 절반에서 나눈다 */
function toLoadingStep(status: ConversionStatus | undefined) {
  switch (status?.stage) {
    case undefined:
    case 'analyzing':
      return 0
    case 'simplifying':
      return status.progress < 0.5 ? 1 : 2
    default:
      return 3
  }
}

function ResultPage() {
  const session = useConversionSession()
  const navigate = Route.useNavigate()
  const { paragraph } = Route.useSearch()
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const showToast = useToast()

  const jobId = session?.status === 'started' ? session.jobId : ''
  const statusQuery = useQuery({
    ...conversionStatusQueryOptions(jobId),
    enabled: jobId !== '',
    retry: 2,
    refetchInterval: (query) => {
      if (isFinished(query.state.data)) return false
      const elapsed = Date.now() - (session?.startedAt ?? Date.now())
      return elapsed > SLOW_POLL_AFTER_MS
        ? SLOW_POLL_INTERVAL_MS
        : POLL_INTERVAL_MS
    },
  })
  const status = statusQuery.data
  const result = status?.status === 'done' ? status.result : undefined

  // 결과가 나오면 나가기 · 새로고침 전에 확인을 받는다. 원문 보기처럼 같은 화면 안에서 주소만 바뀌는 건 막지 않는다
  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => current.pathname !== next.pathname,
    disabled: !result,
    enableBeforeUnload: Boolean(result),
    withResolver: true,
  })

  // 결과를 받았으면 올린 파일은 더 필요 없으니 메모리에서 비운다
  useEffect(() => {
    if (result) clearDocumentDraft()
  }, [result])

  // 화면을 떠나는 중이면(onLeave 가 세션을 비움) 그리지 않는다
  if (!session) return null

  function goHome() {
    navigate({ to: '/' })
  }

  function retry() {
    const draft = getDocumentDraft()
    if (!draft) {
      goHome()
      return
    }
    startConversionSession(getDraftFiles(draft))
  }

  const error =
    session.status === 'upload-failed'
      ? session.error
      : status?.status === 'failed' && status.error
        ? new ApiError(status.error)
        : status?.status === 'canceled'
          ? new ApiError({
              code: 'CANCELED',
              message: '변환이 취소됐어요.',
            })
          : statusQuery.error

  if (error) {
    const needsReselect =
      error instanceof ApiError && reselectErrorCodes.has(error.code)
    return (
      <ResultError
        title="문서를 읽지 못했어요"
        description={error instanceof ApiError ? error.message : undefined}
        primaryAction={
          needsReselect
            ? { label: '홈으로 가기', onClick: goHome }
            : { label: '다시 시도하기', onClick: retry }
        }
        secondaryAction={
          needsReselect ? undefined : { label: '홈으로 가기', onClick: goHome }
        }
      />
    )
  }

  if (!result) {
    return (
      <ResultLoading
        activeStep={toLoadingStep(status)}
        progress={status?.progress ?? 0}
      />
    )
  }

  function closeSource() {
    // 원문 보기를 열 때 주소를 하나 쌓았으니 뒤로 가서 닫는다
    if (canGoBack) router.history.back()
    else navigate({ search: {}, replace: true, resetScroll: false })
  }

  return (
    <>
      <ResultView
        result={result}
        onExit={goHome}
        onOpenSource={(paragraphIndex) =>
          navigate({
            search: { paragraph: paragraphIndex },
            resetScroll: false,
          })
        }
        onSave={() => showToast('저장하기는 아직 준비 중이에요')}
      />
      <SourceView
        paragraph={
          paragraph === undefined
            ? null
            : (result.paragraphs[paragraph] ?? null)
        }
        onClose={closeSource}
      />
      {/* 홈 · 닫기 · 휴대폰 뒤로 가기 모두 이 확인을 거친다 (Figma 156:5881) */}
      <ConfirmModal
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
        illustration={warningImage}
        title="정말 나가시겠어요?"
        description={
          '이 결과는 따로 저장되지 않아요.\n지금 나가면 다시 볼 수 없어요.'
        }
        confirmLabel="나가기"
        onConfirm={() => blocker.proceed?.()}
      />
    </>
  )
}
