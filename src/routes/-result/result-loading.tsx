import { useEffect, useState } from 'react'

import CheckedIcon from '@/assets/icons/20/checked.svg?react'
import UncheckedIcon from '@/assets/icons/20/unchecked.svg?react'
import loadingDocumentsPoster from '@/assets/images/loading-documents.png'
import loadingDocumentsMov from '@/assets/videos/loading-documents.mov'
import loadingDocumentsWebm from '@/assets/videos/loading-documents.webm'
import { cn } from '@/lib/utils'

const steps = [
  '문서 분석 중...',
  '어려운 내용 이해 중...',
  '쉬운 글로 변환 중...',
  '중요 정보 정리 중...',
]

// 진행 단계를 받지 않을 때(샘플) 시간에 맞춰 단계를 넘기는 간격. 샘플 최소 로딩 2초 안에 4단계가 모두 체크되고 잠깐 보이도록 0.5초
const STEP_INTERVAL_MS = 500
// 실제 변환에서 지난 시간 · 막대를 다시 계산하는 간격
const TICK_MS = 1000

interface ResultLoadingProps {
  /** 서버가 알려 준 진행 단계(0~3). 주지 않으면 시간에 맞춰 넘기는 연출을 한다 */
  activeStep?: number
  /** 서버가 알려 준 진행률(0~1). 주지 않으면 단계에 맞춰 막대를 채운다 */
  progress?: number
}

/**
 * 문서 읽기 로딩 (Figma 2:360). 변환 결과를 기다리는 동안 보인다.
 *
 * 일러스트는 Figma 의 투명 배경 GIF(2.5MB)를 동영상으로 옮겼다.
 * 사파리는 투명 배경 HEVC(.mov), 크롬 · 파이어폭스는 투명 배경 WebM 을 고른다 (크롬은 video/quicktime 을 재생하지 않아 건너뛴다).
 * 동작 줄이기 설정이면 첫 장면 그림만 보여 준다.
 */
export function ResultLoading({
  activeStep: serverStep,
  progress,
}: ResultLoadingProps) {
  const [timedStep, setTimedStep] = useState(0)
  const activeStep = Math.min(serverStep ?? timedStep, steps.length - 1)
  // Figma 첫 단계의 막대 길이(43/233)만큼은 처음부터 채워 둔다
  const barRatio = Math.max(
    progress ?? (activeStep + 0.75) / steps.length,
    0.75 / steps.length,
  )

  useEffect(() => {
    if (serverStep !== undefined || timedStep >= steps.length - 1) return
    const timer = setTimeout(
      () => setTimedStep(timedStep + 1),
      STEP_INTERVAL_MS,
    )
    return () => clearTimeout(timer)
  }, [serverStep, timedStep])

  return (
    <main
      aria-busy
      className="flex min-h-dvh flex-col items-center justify-center bg-gradient-background px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="size-[233px] shrink-0">
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          poster={loadingDocumentsPoster}
          className="size-full motion-reduce:hidden"
        >
          <source
            src={loadingDocumentsMov}
            type='video/quicktime; codecs="hvc1"'
          />
          <source src={loadingDocumentsWebm} type="video/webm" />
        </video>
        <img
          src={loadingDocumentsPoster}
          alt=""
          className="hidden size-full motion-reduce:block"
        />
      </div>

      <div className="mt-[23px] flex flex-col items-center gap-2.5 text-center">
        <h1 className="text-headline-l-semibold text-gray-900">
          문서를 읽고 있어요
        </h1>
        <p className="text-title-semibold text-gray-400">조금만 기다려주세요</p>
      </div>

      <div
        role="progressbar"
        aria-label="진행 상황"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={activeStep + 1}
        className="mt-7 h-[9px] w-[233px] overflow-hidden rounded-lg bg-gray-100"
      >
        <div
          className="h-full rounded-lg bg-blue-500 transition-[width] duration-500"
          style={{ width: `${barRatio * 100}%` }}
        />
      </div>

      <ol className="mt-[59px] flex flex-col items-start gap-3.5">
        {steps.map((step, index) => {
          const done = index <= activeStep
          const Icon = done ? CheckedIcon : UncheckedIcon
          return (
            <li key={step} className="flex items-center gap-3.5">
              <Icon
                aria-hidden
                className={cn(
                  'size-5 shrink-0',
                  done ? 'text-blue-500' : 'text-gray-300',
                )}
              />
              <span
                className={cn(
                  'text-body-semibold',
                  done ? 'text-blue-500' : 'text-gray-400',
                )}
              >
                {step}
              </span>
            </li>
          )
        })}
      </ol>
      <p aria-live="polite" className="sr-only">
        {steps[activeStep]}
      </p>
    </main>
  )
}
