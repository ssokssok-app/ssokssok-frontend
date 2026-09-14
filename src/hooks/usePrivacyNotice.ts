import { useSyncExternalStore } from 'react'

/**
 * 개인정보 안내 모달의 "다시 보지 않기".
 *
 * - 누르면 브라우저에 저장해, 다음부터는 문서를 넣기 전에 안내를 띄우지 않는다.
 * - localStorage 접근은 이 파일에서만 한다.
 */

const STORAGE_KEY = 'privacy-notice-dismissed'

let dismissed: boolean | null = null
const listeners = new Set<() => void>()

// 사파리 private 모드, 저장소 차단 등에서는 localStorage 접근 자체가 throw 할 수 있다
function readStoredDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// 처음 읽을 때 한 번만 저장소를 본다
function getSnapshot() {
  dismissed ??= readStoredDismissed()
  return dismissed
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // 저장에 실패해도 이 탭에서는 다시 띄우지 않는다
  }
  dismissed = true
  listeners.forEach((listener) => listener())
}

export function usePrivacyNotice() {
  const isDismissed = useSyncExternalStore(subscribe, getSnapshot)

  return { isDismissed, dismiss }
}
