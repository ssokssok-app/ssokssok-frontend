import { useEffect } from 'react'

/**
 * 켜져 있는 동안 휴대폰 화면이 저절로 꺼지지 않게 한다 (Screen Wake Lock API).
 *
 * - 문서 변환은 1~2분 걸리는데 휴대폰은 보통 30초~1분이면 화면이 꺼진다. 꺼지면 진행 확인이 멈춰
 *   주 사용자가 끝난 줄 알거나 멈춘 줄 알 수 있어, 기다리는 동안만 켜 둔다.
 * - 다른 앱으로 갔다 오면 브라우저가 잠금을 풀어서, 화면이 다시 보일 때 새로 요청한다.
 * - 지원하지 않는 브라우저 · 거절(배터리 절약 모드 등)은 조용히 넘어간다. 화면이 꺼질 뿐 변환에는 영향이 없다.
 */
export function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let active = true

    async function request() {
      if (document.visibilityState !== 'visible' || sentinel) return
      try {
        const next = await navigator.wakeLock.request('screen')
        // 요청하는 사이에 화면을 떠났으면 바로 푼다
        if (!active) {
          void next.release()
          return
        }
        sentinel = next
        next.addEventListener('release', () => {
          if (sentinel === next) sentinel = null
        })
      } catch {
        // 지원 안 함 · 거절: 화면이 꺼질 수 있을 뿐이라 알리지 않는다
      }
    }

    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', request)
      void sentinel?.release()
    }
  }, [enabled])
}
