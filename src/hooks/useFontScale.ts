import { useSyncExternalStore } from 'react'

/**
 * 큰글씨 모드.
 *
 * - 선택값은 `<html data-font-scale="...">` 속성으로 반영되고,
 *   실제 글자 크기는 src/index.css 의 `--text-*` 변수가 결정한다.
 * - localStorage 접근은 이 파일에서만 한다.
 */

export const FONT_SCALES = ['normal', 'large'] as const
export type FontScale = (typeof FONT_SCALES)[number]

const STORAGE_KEY = 'font-scale'
const DEFAULT_FONT_SCALE: FontScale = 'normal'

let currentFontScale: FontScale = DEFAULT_FONT_SCALE
const listeners = new Set<() => void>()

function isFontScale(value: unknown): value is FontScale {
  return FONT_SCALES.includes(value as FontScale)
}

// 사파리 private 모드, 저장소 차단 등에서는 localStorage 접근 자체가 throw 할 수 있다
function readStoredFontScale(): FontScale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isFontScale(stored) ? stored : DEFAULT_FONT_SCALE
  } catch {
    return DEFAULT_FONT_SCALE
  }
}

function writeStoredFontScale(fontScale: FontScale) {
  try {
    localStorage.setItem(STORAGE_KEY, fontScale)
  } catch {
    // 저장에 실패해도 현재 탭에는 적용된다
  }
}

function applyFontScale(fontScale: FontScale) {
  currentFontScale = fontScale
  document.documentElement.dataset.fontScale = fontScale
  listeners.forEach((listener) => listener())
}

// 다른 탭에서 값이 바뀌면 따라간다 (key === null 은 localStorage.clear())
function handleStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return
  applyFontScale(readStoredFontScale())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentFontScale
}

function setFontScale(fontScale: FontScale) {
  writeStoredFontScale(fontScale)
  applyFontScale(fontScale)
}

function toggleFontScale() {
  setFontScale(currentFontScale === 'large' ? 'normal' : 'large')
}

/**
 * 첫 렌더 전에 main.tsx 에서 한 번 호출한다.
 * 저장된 값을 즉시 `<html>`에 반영해 글자 크기가 뒤늦게 바뀌는 깜빡임을 막는다.
 */
export function initFontScale() {
  applyFontScale(readStoredFontScale())
  window.addEventListener('storage', handleStorage)
}

export function useFontScale() {
  const fontScale = useSyncExternalStore(subscribe, getSnapshot)

  return {
    fontScale,
    isLarge: fontScale === 'large',
    setFontScale,
    toggleFontScale,
  }
}
