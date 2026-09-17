import {
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { isLoginProvider, loginWithCode } from '@/api/auth'
import { hasSession } from '@/api/client'
import { LOGIN_ENABLED } from '@/lib/features'
import {
  getRedirectUri,
  type LoginReturnTo,
  takePendingLogin,
} from '@/routes/-auth/social-login'
import { ResultError } from '@/routes/-result/result-error'

interface CallbackSearch {
  code?: string
  state?: string
  /** 사용자가 취소하면 access_denied */
  error?: string
}

function parseCallbackSearch(search: Record<string, unknown>): CallbackSearch {
  const pick = (value: unknown) =>
    typeof value === 'string' ? value : undefined
  return {
    code: pick(search.code),
    state: pick(search.state),
    error: pick(search.error),
  }
}

/** 돌아갈 화면으로 보내는 redirect. resume 이면 홈에서 문서 넣기를 이어 간다 */
function redirectToReturn(returnTo: LoginReturnTo, resume: boolean) {
  if (returnTo.to === '/settings') {
    return redirect({ to: '/settings', replace: true })
  }
  const search = resume && returnTo.resume ? { resume: returnTo.resume } : {}
  return redirect({ to: '/', search, replace: true })
}

/*
 * 카카오 · 구글 로그인 콜백. 주소에 붙어 온 코드로 로그인을 마치고 원래 화면으로 돌아간다.
 * 코드는 한 번만 쓸 수 있어서, 개발 모드에서 두 번 실행되는 effect 대신 loader 에서 한 번 처리한다.
 * 성공 · 취소는 곧바로 이동하고(주소의 코드가 방문 기록에 남지 않게 replace), 실패만 이 화면을 보여 준다.
 */
export const Route = createFileRoute('/auth/$provider/callback')({
  validateSearch: parseCallbackSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps, abortController }) => {
    // 로그인을 꺼 두면 이 화면으로 올 일이 없다. 주소를 직접 친 경우 홈으로 보낸다 (src/lib/features.ts)
    if (!LOGIN_ENABLED) throw redirect({ to: '/', replace: true })

    const { provider } = params
    if (!isLoginProvider(provider)) throw notFound()

    // 앱을 켤 때의 로그인 되살리기는 루트 라우트가 먼저 기다려서, 늦게 끝난 갱신이 새 로그인을 덮어쓰지 않는다

    const pending = takePendingLogin()
    if (!pending) {
      // 로그인한 뒤 휴대폰 뒤로 가기로 로그인 화면을 거쳐 다시 왔거나, 이미 끝난 로그인을 취소한 경우
      if (hasSession() || deps.error === 'access_denied') {
        throw redirect({ to: '/', replace: true })
      }
      return { returnTo: { to: '/' } satisfies LoginReturnTo }
    }

    const { returnTo } = pending
    // state 가 다르면 이 탭에서 시작한 로그인이 아니다 (남이 만든 로그인 링크)
    if (pending.provider !== provider || deps.state !== pending.state) {
      return { returnTo }
    }
    if (deps.error === 'access_denied') throw redirectToReturn(returnTo, false)
    if (deps.error || !deps.code) return { returnTo }

    try {
      await loginWithCode(
        { provider, code: deps.code, redirectUri: getRedirectUri(provider) },
        abortController.signal,
      )
    } catch {
      // 코드 만료 · 등록되지 않은 콜백 주소(INVALID_REQUEST) · 네트워크 오류 모두 같은 실패 화면을 보여 준다
      return { returnTo }
    }
    throw redirectToReturn(returnTo, true)
  },
  pendingComponent: LoginPending,
  component: LoginFailed,
})

function LoginPending() {
  return (
    <main
      role="status"
      className="flex min-h-dvh items-center justify-center bg-gradient-background px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center"
    >
      <p className="text-headline-m-semibold text-gray-900">
        로그인하고 있어요
      </p>
    </main>
  )
}

/** Figma 에 없는 화면이라 결과 오류 화면과 같은 임시 모양을 쓴다 (docs/product.md "확인 필요") */
function LoginFailed() {
  const { returnTo } = Route.useLoaderData()
  const navigate = useNavigate()

  function goBack() {
    if (returnTo.to === '/settings')
      navigate({ to: '/settings', replace: true })
    else navigate({ to: '/', replace: true })
  }

  return (
    <ResultError
      title="로그인하지 못했어요"
      description="다시 로그인해주세요."
      primaryAction={{ label: '돌아가기', onClick: goBack }}
    />
  )
}
