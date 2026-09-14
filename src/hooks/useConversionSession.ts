import { useSyncExternalStore } from 'react'

import { cancelConversion, startConversion } from '@/api/conversion'

/**
 * 진행 중인 문서 변환 한 건 (파일 올리기 → 작업 ID).
 *
 * - 변환은 "다 찍었어요" · PDF 선택처럼 사용자가 누른 순간에 시작한다. 화면이 그려질 때 시작하면
 *   개발 모드(StrictMode)에서 두 번 그려지며 요청도 두 번 나가기 때문이다
 * - 결과 화면(/result)이 작업 ID 로 상태를 조회하고, 화면을 떠나면 endConversionSession() 으로 취소한다
 * - 결과를 저장하지 않으므로 이 탭의 메모리에만 둔다. 새로고침하면 사라진다
 */

export type ConversionSession =
  | { status: 'uploading'; startedAt: number }
  | { status: 'started'; startedAt: number; jobId: string }
  | { status: 'upload-failed'; startedAt: number; error: unknown }

let current: ConversionSession | null = null
let uploadController: AbortController | null = null
const listeners = new Set<() => void>()

function setSession(next: ConversionSession | null) {
  current = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getConversionSession() {
  return current
}

/** 파일을 올리고 변환을 시작한다. 이미 진행 중인 변환이 있으면 취소하고 새로 시작한다 */
export function startConversionSession(files: File[]) {
  endConversionSession()
  const controller = new AbortController()
  uploadController = controller
  const session: ConversionSession = {
    status: 'uploading',
    startedAt: Date.now(),
  }
  setSession(session)

  startConversion(files, controller.signal).then(
    ({ jobId }) => {
      // 올리는 동안 화면을 떠났다면 이미 만들어진 작업을 취소한다
      if (current !== session) {
        void cancelQuietly(jobId)
        return
      }
      uploadController = null
      setSession({ status: 'started', startedAt: session.startedAt, jobId })
    },
    (error: unknown) => {
      if (current !== session) return
      uploadController = null
      setSession({
        status: 'upload-failed',
        startedAt: session.startedAt,
        error,
      })
    },
  )
}

/** 변환을 끝낸다: 올리는 중이면 멈추고, 작업이 있으면 취소한 뒤 비운다 */
export function endConversionSession() {
  uploadController?.abort()
  uploadController = null
  if (current?.status === 'started') void cancelQuietly(current.jobId)
  if (current) setSession(null)
}

// 화면을 떠나며 보내는 취소라, 실패해도 사용자에게 알릴 화면이 없다. 서버는 작업 시간이 지나면 스스로 정리한다
async function cancelQuietly(jobId: string) {
  try {
    await cancelConversion(jobId)
  } catch {
    // 위 주석 참고
  }
}

export function useConversionSession() {
  return useSyncExternalStore(subscribe, getConversionSession)
}
