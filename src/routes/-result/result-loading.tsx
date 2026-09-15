import { useEffect, useState } from 'react'

import CheckedIcon from '@/assets/icons/20/checked.svg?react'
import UncheckedIcon from '@/assets/icons/20/unchecked.svg?react'
import loadingDocumentsPoster from '@/assets/images/loading-documents.png'
import loadingDocumentsMov from '@/assets/videos/loading-documents.mov'
import loadingDocumentsWebm from '@/assets/videos/loading-documents.webm'
import { useScreenWakeLock } from '@/hooks/useScreenWakeLock'
import { cn } from '@/lib/utils'

import { creepProgress, getWaitMessage } from './loading-progress'

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
  /**
   * 실제 변환을 시작한 시각. 주면 걸리는 시간 안내 · 오래 걸릴 때 문구 · 막대 천천히 채우기 · 화면 꺼짐 막기를 한다.
   * 금방 끝나는 샘플은 주지 않는다
   */
  startedAt?: number
}

/**
 * 문서 읽기 로딩 (Figma 2:360). 변환 결과를 기다리는 동안 보인다.
 *
 * 일러스트는 Figma 의 투명 배경 GIF(2.5MB)를 동영상으로 옮겼다.
 * 사파리는 투명 배경 HEVC(.mov), 크롬 · 파이어폭스는 투명 배경 WebM 을 고른다 (크롬은 video/quicktime 을 재생하지 않아 건너뛴다).
 * .mov 에는 sRGB 감마 색 태그(colr 1/13/1)가 들어 있어야 한다. 없으면 사파리가 방송 영상 감마로 해석해 배경보다 밝게 그린다 (docs/architecture.md "폴더").
 * 동작 줄이기 설정이면 첫 장면 그림만 보여 준다.
 *
 * 실제 변환(startedAt)은 1~2분 걸려서, 걸리는 시간과 화면을 닫지 말라는 안내를 보여 주고 시간이 지나면 문구를 바꾼다.
 * 휴대폰 화면이 저절로 꺼지지 않게 하고, 서버 진행률 사이에는 막대를 천천히 채워 멈춘 것처럼 보이지 않게 한다.
 */
export function ResultLoading({
  activeStep: serverStep,
  progress,
  startedAt,
}: ResultLoadingProps) {
  const [timedStep, setTimedStep] = useState(0)
  const activeStep = Math.min(serverStep ?? timedStep, steps.length - 1)
  // Figma 첫 단계의 막대 길이(43/233)만큼은 처음부터 채워 둔다
  const serverRatio = Math.max(
    progress ?? (activeStep + 0.75) / steps.length,
    0.75 / steps.length,
  )
  const isConversion = startedAt !== undefined
  const [now, setNow] = useState(() => Date.now())
  const [creptRatio, setCreptRatio] = useState(serverRatio)
  const barRatio = isConversion
    ? Math.max(creptRatio, serverRatio)
    : serverRatio
  const message = isConversion
    ? getWaitMessage(now - startedAt, progress ?? 0)
    : '조금만 기다려주세요'

  useScreenWakeLock(isConversion)

  // 실제 변환: 1초마다 지난 시간을 다시 재고 막대를 조금 채운다
  useEffect(() => {
    if (!isConversion) return
    const timer = setInterval(() => {
      setNow(Date.now())
      setCreptRatio((shown) => creepProgress(shown, serverRatio))
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [isConversion, serverRatio])

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
        {/* 문구가 바뀌면 스크린리더도 읽는다. Figma 문구("조금만 기다려주세요")는 샘플에만 쓴다 (docs/product.md "결과 화면") */}
        <p
          aria-live="polite"
          className="text-title-semibold whitespace-pre-line text-gray-400"
        >
          {message}
        </p>
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
          className="h-full rounded-lg bg-blue-500 transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
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
