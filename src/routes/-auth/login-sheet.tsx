import { BottomSheet, BottomSheetTitle } from '@/components/bottom-sheet'
import { LoginButton } from '@/components/login-button'
import type { LoginProvider } from '@/hooks/useAuth'

interface LoginSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (provider: LoginProvider) => void
}

/**
 * 로그인 유도 시트 (Figma 홈 70:1309). 카카오 · 구글로 로그인한다.
 * - 홈: 촬영 · 첨부는 로그인해야 쓸 수 있어, 로그인하지 않았으면 문서를 넣기 전에 뜬다
 * - 설정: 로그인 버튼을 누르면 뜬다 (설정 화면에는 따로 그린 로그인 시트가 없어 같은 시트를 쓴다)
 */
export function LoginSheet({ open, onOpenChange, onLogin }: LoginSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      className="gap-[46px] pt-[45px] pb-[26px]"
    >
      <BottomSheetTitle className="text-center text-headline-m-semibold">
        {'로그인하고 더 많은 문서를\n쉽게 읽어보세요'}
      </BottomSheetTitle>
      <div className="flex flex-col gap-2.5">
        <LoginButton provider="kakao" onClick={() => onLogin('kakao')} />
        <LoginButton provider="google" onClick={() => onLogin('google')} />
      </div>
    </BottomSheet>
  )
}
