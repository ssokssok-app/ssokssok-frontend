import { Toast } from '@base-ui/react/toast'

/**
 * 짧은 알림(Figma Toast)을 띄운다. src/components/toast.tsx 의 ToastProvider 안에서만 쓸 수 있다.
 *
 * ```tsx
 * const showToast = useToast()
 * showToast('듣기를 중단했어요')
 * ```
 */
export function useToast() {
  const toastManager = Toast.useToastManager()
  return (message: string) => toastManager.add({ title: message })
}
