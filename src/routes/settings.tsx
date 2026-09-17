import { Button } from '@base-ui/react/button'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'

import { deleteAccount, logout } from '@/api/auth'
import { meQueryOptions } from '@/api/users'
import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import profilePlaceholderImage from '@/assets/images/profile-placeholder.svg'
import warningImage from '@/assets/images/warning.png'
import { CtaButton } from '@/components/cta-button'
import { Divider } from '@/components/divider'
import { Gnb, GnbIconButton } from '@/components/gnb'
import {
  ConfirmModal,
  Modal,
  ModalClose,
  ModalTextButton,
} from '@/components/modal'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CONTACT_EMAIL } from '@/lib/contact'
import { LOGIN_ENABLED } from '@/lib/features'
import { cn } from '@/lib/utils'

import { LoginSheet } from './-auth/login-sheet'
import {
  LOGIN_UNAVAILABLE_NOTICE,
  startSocialLogin,
} from './-auth/social-login'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

/**
 * 설정 (Figma 비로그인 156:2468 · 로그인 151:2298).
 * 로그인 버튼은 홈과 같은 로그인 시트를 띄운다. 로그아웃하면 이 화면에서 비로그인 모습으로 바뀐다.
 */
function SettingsPage() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const canGoBack = useCanGoBack()
  const showToast = useToast()
  const { isLoggedIn } = useAuth()
  const [loginSheetOpen, setLoginSheetOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  // 실패 알림. 읽어야 하는 오류라 Toast 대신 모달로 띄우고, 닫히는 동안에도 문구가 보이도록 내용과 열림을 따로 둔다
  const [notice, setNotice] = useState<{
    title: string
    description: string
  } | null>(null)
  const [noticeOpen, setNoticeOpen] = useState(false)

  function showNotice(next: { title: string; description: string }) {
    setNotice(next)
    setNoticeOpen(true)
  }

  function goBack() {
    // 주소로 바로 들어왔으면 돌아갈 곳이 없어 홈으로 간다
    if (canGoBack) router.history.back()
    else navigate({ to: '/' })
  }

  // 로그아웃은 확인 없이 바로 한다 (Figma 에 확인 창이 없다). 실패하면 쿠키가 남아 다시 로그인되므로 알린다.
  // 사용자 정보 캐시는 로그인이 바뀌면 src/main.tsx 가 지운다
  async function handleLogout() {
    try {
      await logout()
    } catch {
      showNotice({
        title: '로그아웃하지 못했어요',
        description: '인터넷 연결을 확인하고\n다시 시도해주세요.',
      })
    }
  }

  async function handleDeleteAccount() {
    // 창을 먼저 닫아 탈퇴 요청이 두 번 나가지 않게 한다
    setDeleteConfirmOpen(false)
    try {
      await deleteAccount()
    } catch {
      showNotice({
        title: '탈퇴하지 못했어요',
        description: '잠시 뒤에 다시 시도해주세요.',
      })
      return
    }
    navigate({ to: '/', replace: true })
    showToast('탈퇴했어요')
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
        className={cn(
          'flex flex-col pt-6',
          isLoggedIn ? 'gap-[26px]' : 'gap-7',
        )}
      >
        {/* 로그인을 꺼 두면 계정 구역과 그 아래 띠가 통째로 빠지고 메뉴만 남는다 (src/lib/features.ts) */}
        {LOGIN_ENABLED && (
          <>
            {isLoggedIn ? (
              <AccountSection onLogout={handleLogout} />
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
          </>
        )}

        {/* 서비스이용약관은 두지 않는다. 회원가입 · 결제 · 보관이 없어 약관이 규율할 것이 없고,
            만들 법적 의무도 없다 (2026-09-17 사용자와 정함, docs/product.md) */}
        <nav aria-label="설정 메뉴" className="flex flex-col gap-4 px-5">
          <MenuButton onClick={() => setContactOpen(true)}>1:1 문의</MenuButton>
          <MenuButton onClick={() => navigate({ to: '/privacy' })}>
            개인정보처리방침
          </MenuButton>
          {isLoggedIn && (
            <MenuButton onClick={() => setDeleteConfirmOpen(true)}>
              탈퇴하기
            </MenuButton>
          )}
        </nav>
      </main>

      {/* Figma 에 없는 확인 창이라 결과 나가기 확인과 같은 모양을 쓴다 (docs/product.md "확인 필요") */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        illustration={warningImage}
        title="정말 탈퇴할까요?"
        description={'탈퇴하면 계정 정보가 사라지고\n되돌릴 수 없어요.'}
        confirmLabel="탈퇴하기"
        onConfirm={handleDeleteAccount}
      />
      <Modal
        open={noticeOpen}
        onOpenChange={setNoticeOpen}
        illustration={warningImage}
        title={notice?.title ?? ''}
        description={notice?.description ?? ''}
      >
        <ModalClose>확인</ModalClose>
      </Modal>

      {/*
       * 문의 안내. Figma 에 없는 창이라 일러스트 없이 Modal 을 쓴다 (docs/product.md "확인 필요").
       * mailto 만 걸면 메일 앱이 없거나 계정이 설정되지 않은 기기에서 눌러도 아무 일이 없어,
       * 주 사용자가 고장으로 오해한다. 그래서 주소를 글자로도 보여 준다
       */}
      <Modal
        open={contactOpen}
        onOpenChange={setContactOpen}
        title="문의는 메일로 보내주세요"
        description={`${CONTACT_EMAIL}\n\n아래 버튼이 눌리지 않으면\n이 주소로 메일을 보내주세요.`}
      >
        <ModalClose
          onClick={() => {
            window.location.href = `mailto:${CONTACT_EMAIL}`
          }}
        >
          메일 보내기
        </ModalClose>
        <ModalTextButton onClick={() => setContactOpen(false)}>
          닫기
        </ModalTextButton>
      </Modal>

      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
        onLogin={(provider) => {
          // 로그인 화면으로 이동하고, 마치면 콜백이 이 화면으로 돌려보낸다
          if (!startSocialLogin(provider, { to: '/settings' })) {
            setLoginSheetOpen(false)
            showNotice(LOGIN_UNAVAILABLE_NOTICE)
          }
        }}
      />
    </div>
  )
}

function AccountSection({ onLogout }: { onLogout: () => void }) {
  const { data: me, isError } = useQuery(meQueryOptions())

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
          {/* 이메일 대신 닉네임을 보여 준다. 카카오는 이메일이 없고, 주 사용자에게 이름이 알아보기 쉽다 (2026-09-15 사용자와 정함) */}
          {/* 불러오는 동안에도 줄을 비워 두어, 닉네임이 들어올 때 화면이 밀리지 않게 한다 */}
          <p className="text-body-regular text-gray-600">
            {me?.nickname ??
              (isError ? '계정 정보를 불러오지 못했어요' : '\u00a0')}
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
