import documentErrorImage from '@/assets/images/document-error.png'
import { CtaButton } from '@/components/cta-button'

interface ResultErrorAction {
  label: string
  onClick: () => void
}

interface ResultErrorProps {
  title?: string
  /** 무엇이 안 됐는지 · 다음에 할 일. 서버 message 를 그대로 넣지 않는다 (conversion-error.ts) */
  description?: string
  primaryAction: ResultErrorAction
  secondaryAction?: ResultErrorAction
}

/**
 * 오류 화면 (Figma 에러창 - 종류 230:4890 · 에러창 - 인식오류 230:4942).
 * 가운데에 일러스트 · 제목 · 설명, 아래에 버튼을 둔다. 변환 오류뿐 아니라 샘플 · 로그인 실패도 같은 모양을 쓴다.
 * 제목 · 설명의 줄바꿈(\n)은 그대로 보여 준다.
 */
export function ResultError({
  title = '결과를 불러오지 못했어요',
  description = '잠시 뒤에 다시 시도해주세요.',
  primaryAction,
  secondaryAction,
}: ResultErrorProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-white px-5 pt-[env(safe-area-inset-top)] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      {/* Figma 는 내용이 정가운데보다 위에 있어, 아래 여백을 더 줘서 올린다 (852px 화면에서 Figma 위치) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-[29px] pt-10 pb-[max(2.5rem,23dvh)] text-center">
        <img src={documentErrorImage} alt="" className="size-[175px]" />
        <div className="flex flex-col gap-2.5">
          <h1 className="text-headline-m-semibold whitespace-pre-line text-gray-900">
            {title}
          </h1>
          <p className="text-title-semibold whitespace-pre-line text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <CtaButton onClick={primaryAction.onClick}>
          {primaryAction.label}
        </CtaButton>
        {secondaryAction && (
          <CtaButton variant="secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </CtaButton>
        )}
      </div>
    </main>
  )
}
