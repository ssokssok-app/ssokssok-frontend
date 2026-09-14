import { Button } from '@base-ui/react/button'
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'

import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import profilePlaceholderImage from '@/assets/images/profile-placeholder.svg'
import { CtaButton } from '@/components/cta-button'
import { Divider } from '@/components/divider'
import { Gnb, GnbIconButton } from '@/components/gnb'
import { type Account, useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

import { LoginSheet } from './-auth/login-sheet'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const providerNames = {
  kakao: '카카오',
  google: '구글',
}

/**
 * 설정 (Figma 비로그인 156:2468 · 로그인 151:2298).
 * 로그인 버튼은 홈과 같은 로그인 시트를 띄운다. 로그아웃하면 이 화면에서 비로그인 모습으로 바뀐다.
 */
function SettingsPage() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const canGoBack = useCanGoBack()
  const showToast = useToast()
  const { account, login, logout } = useAuth()
  const [loginSheetOpen, setLoginSheetOpen] = useState(false)

  function goBack() {
    // 주소로 바로 들어왔으면 돌아갈 곳이 없어 홈으로 간다
    if (canGoBack) router.history.back()
    else navigate({ to: '/' })
  }

  // 연결할 곳(문의 채널 · 약관 페이지 · 탈퇴 API)이 정해지지 않은 메뉴 (docs/product.md "확인 필요")
  function showNotReady() {
    showToast('아직 준비 중이에요')
  }

  return (
    <div className="min-h-dvh bg-white pt-[env(safe-area-inset-top)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Gnb
        tone="dark"
        title="설정"
        left={
          <GnbIconButton
            label="뒤로 가기"
            icon={ArrowBackIosIcon}
            onClick={goBack}
          />
        }
      />

      {/* Figma: 로그인하면 구역 사이 26px, 비로그인은 28px */}
      <main
        className={cn('flex flex-col pt-6', account ? 'gap-[26px]' : 'gap-7')}
      >
        {account ? (
          <AccountSection account={account} onLogout={logout} />
        ) : (
          <section className="flex flex-col gap-5 px-5">
            <p className="text-subtitle-semibold text-gray-900">
              로그인 후 쏙쏙을 이용해보세요!
            </p>
            {/* Figma 는 48px · 둥글기 8px 버튼이지만, 같은 역할의 CTA md(50px · 10px)를 쓴다 */}
            <CtaButton size="md" onClick={() => setLoginSheetOpen(true)}>
              로그인
            </CtaButton>
          </section>
        )}

        {/* Figma 설정 화면의 구역 띠는 기본 Divider(Gray/90)보다 옅은 Gray/80 이다 */}
        <Divider variant="section" className="bg-gray-80" />

        <nav aria-label="설정 메뉴" className="flex flex-col gap-4 px-5">
          <MenuButton onClick={showNotReady}>1:1 문의</MenuButton>
          <MenuButton onClick={showNotReady}>개인정보처리방침</MenuButton>
          <MenuButton onClick={showNotReady}>서비스이용약관</MenuButton>
          {account && <MenuButton onClick={showNotReady}>탈퇴하기</MenuButton>}
        </nav>
      </main>

      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
        onLogin={(provider) => {
          login(provider)
          setLoginSheetOpen(false)
        }}
      />
    </div>
  )
}

function AccountSection({
  account,
  onLogout,
}: {
  account: Account
  onLogout: () => void
}) {
  return (
    <section
      aria-label="계정"
      className="flex items-center justify-between gap-3 px-5"
    >
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={profilePlaceholderImage}
          alt=""
          className="size-12 shrink-0"
        />
        <div className="flex min-w-0 flex-col">
          <p className="text-body-semibold text-gray-900">현재 로그인된 계정</p>
          {/* 백엔드 연결 전에는 이메일을 몰라 로그인한 서비스 이름을 보여 준다 */}
          <p className="text-body-regular text-gray-600">
            {account.email ?? `${providerNames[account.provider]} 계정`}
          </p>
        </div>
      </div>
      {/* 보이는 높이는 Figma(테두리 포함 32px) 그대로 두고, 누르는 영역만 위아래로 4px 씩 넓힌다 */}
      <Button
        onClick={onLogout}
        className="relative shrink-0 rounded-md border border-gray-100 px-3 py-[3px] text-body-medium text-gray-900 select-none before:absolute before:-inset-y-1 before:inset-x-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-80"
      >
        로그아웃
      </Button>
    </section>
  )
}

/** 설정 메뉴 한 줄. 글자는 24px 높이지만 누르는 영역은 위아래로 8px 씩 넓혀 40px 로 만든다 */
function MenuButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      className="-my-2 w-full py-2 text-left text-body-medium text-gray-700 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:text-gray-900"
    >
      {children}
    </Button>
  )
}
