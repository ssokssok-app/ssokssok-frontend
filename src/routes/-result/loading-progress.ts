/**
 * 실제 변환 로딩 화면의 안내 문구와 막대 계산 (src/routes/-result/result-loading.tsx, docs/product.md "결과 화면").
 * 실제 변환은 1~2분 걸린다 (2026-09-16 측정 1분~1분 30초). 오래 기다려도 멈춘 것처럼 보이지 않게 안내를 바꾸고 막대를 채운다.
 */

const ALMOST_DONE_AFTER_MS = 60_000
const TAKING_LONG_AFTER_MS = 120_000
// 서버 진행률은 문단 하나가 끝날 때마다 뛰어서, 사이에는 막대를 천천히 채운다. 서버 값보다 이만큼까지만 앞선다
const CREEP_MAX_AHEAD = 0.1
// 막대가 끝까지 찬 것처럼 보이지 않게 결과를 받기 전에는 여기서 멈춘다
const CREEP_LIMIT = 0.97
// 한 번 채울 때 앞설 수 있는 남은 거리의 이 비율만큼 채운다 (1초마다 부르면 30초면 거의 다 참)
const CREEP_RATE = 0.08

/** 변환을 시작하고 지난 시간 · 서버 진행률(0~1)에 맞는 설명 문구 */
export function getWaitMessage(elapsedMs: number, progress: number) {
  if (elapsedMs >= TAKING_LONG_AFTER_MS)
    return '평소보다 오래 걸리고 있어요.\n조금만 더 기다려주세요.'
  // 1분이 지나도 절반을 못 갔으면 "거의 다" 라고 하지 않는다
  if (elapsedMs >= ALMOST_DONE_AFTER_MS && progress >= 0.5)
    return '거의 다 됐어요.\n화면을 닫지 말고 기다려주세요.'
  return '1~2분 정도 걸려요.\n화면을 닫지 말고 기다려주세요.'
}

/** 한 번 채운 뒤의 막대 길이(0~1). 줄어들지 않고, 서버 값보다 CREEP_MAX_AHEAD 넘게 앞서지 않는다 */
export function creepProgress(shown: number, server: number) {
  const base = Math.max(shown, server)
  const cap = Math.min(server + CREEP_MAX_AHEAD, CREEP_LIMIT)
  return base >= cap ? base : base + (cap - base) * CREEP_RATE
}
