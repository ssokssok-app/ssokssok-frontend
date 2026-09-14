import { Button } from '@base-ui/react/button'

import GoogleLogo from '@/assets/logos/google.svg?react'
import KakaoLogo from '@/assets/logos/kakao.svg?react'
import { cn } from '@/lib/utils'

/**
 * Figma Login. 소셜 로그인 버튼.
 * 로고와 브랜드 색은 Figma 그대로 두고 바꾸지 않는다.
 */
const providers = {
  kakao: {
    label: '카카오로 계속하기',
    Logo: KakaoLogo,
    className: 'bg-kakao text-black/85',
  },
  google: {
    label: '구글 로그인',
    Logo: GoogleLogo,
    className: 'bg-gray-90 text-black/54',
  },
}

interface LoginButtonProps extends Omit<
  Button.Props,
  'className' | 'children'
> {
  provider: keyof typeof providers
  className?: string
}

export function LoginButton({
  provider,
  className,
  ...props
}: LoginButtonProps) {
  const { label, Logo, className: providerClassName } = providers[provider]

  return (
    <Button
      className={cn(
        'flex min-h-14 w-full items-center justify-center gap-3.5 rounded-md px-3.5 py-3 text-body-semibold select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        providerClassName,
        className,
      )}
      {...props}
    >
      <Logo aria-hidden className="size-[18px] shrink-0" />
      {label}
    </Button>
  )
}
