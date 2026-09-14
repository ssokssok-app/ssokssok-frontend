import { BottomSheet, BottomSheetTitle } from '@/components/bottom-sheet'
import { LoginButton } from '@/components/login-button'

interface LoginSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: () => void
}

/** 홈 - 로그인 유도 시트 (Figma 70:1309). 촬영 · 첨부는 로그인해야 쓸 수 있어, 로그인하지 않았으면 문서를 넣기 전에 뜬다. */
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
        <LoginButton provider="kakao" onClick={onLogin} />
        <LoginButton provider="google" onClick={onLogin} />
      </div>
    </BottomSheet>
  )
}
