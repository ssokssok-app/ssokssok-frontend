import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * 기기 번호는 모듈 안에 한 번 담아 두므로, 경우마다 모듈을 새로 불러온다.
 */

/** store 가 null 이면 저장소 자체를 쓸 수 없는 상태다 (사파리 private 모드, 저장소 차단) */
function stubStorage(store: Map<string, string> | null) {
  vi.stubGlobal('localStorage', {
    getItem(key: string) {
      if (!store) throw new Error('저장소를 쓸 수 없어요')
      return store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      if (!store) throw new Error('저장소를 쓸 수 없어요')
      store.set(key, value)
    },
  })
}

async function loadGetDeviceId() {
  vi.resetModules()
  return (await import('./device-id')).getDeviceId
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getDeviceId', () => {
  it('한 번 만든 번호를 저장해 두고 다시 켜도 같은 값을 준다', async () => {
    const store = new Map<string, string>()
    stubStorage(store)

    const first = (await loadGetDeviceId())()
    const second = (await loadGetDeviceId())()

    expect(first).toBe(second)
    expect(store.get('device-id')).toBe(first)
  })

  it('저장소를 쓸 수 없어도 번호를 준다 (빠지면 요청이 400 으로 실패한다)', async () => {
    stubStorage(null)
    const getDeviceId = await loadGetDeviceId()

    const id = getDeviceId()

    expect(id).not.toBe('')
    // 남기지는 못해도 같은 탭에서는 메모리에 담아 둔 같은 값을 쓴다
    expect(getDeviceId()).toBe(id)
  })

  it('저장된 값이 비어 있으면 새로 만든다', async () => {
    const store = new Map([['device-id', '']])
    stubStorage(store)

    const id = (await loadGetDeviceId())()

    expect(id).not.toBe('')
    expect(store.get('device-id')).toBe(id)
  })
})
