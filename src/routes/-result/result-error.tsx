import { CtaButton } from '@/components/cta-button'

interface ResultErrorAction {
  label: string
  onClick: () => void
}

interface ResultErrorProps {
  title?: string
  /** 서버가 준 문구가 있으면 그대로 보여 준다 */
  description?: string
  primaryAction: ResultErrorAction
  secondaryAction?: ResultErrorAction
}

/**
 * 결과를 받지 못했을 때. Figma 에 오류 화면이 없어 임시로 둔 모양이다 (docs/product.md "확인 필요").
 */
export function ResultError({
  title = '결과를 불러오지 못했어요',
  description = '잠시 뒤에 다시 시도해주세요.',
  primaryAction,
  secondaryAction,
}: ResultErrorProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-gradient-background px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-headline-m-semibold text-gray-900">{title}</h1>
        <p className="text-body-medium text-gray-700">{description}</p>
      </div>
      <div className="flex w-full max-w-[353px] flex-col gap-2.5">
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
