import { describe, expect, it } from 'vitest'

import { creepProgress, getWaitMessage } from './loading-progress'

const ESTIMATE = '1~2분 정도 걸려요.\n화면을 닫지 말고 기다려주세요.'
const ALMOST_DONE = '거의 다 됐어요.\n화면을 닫지 말고 기다려주세요.'
const TAKING_LONG = '평소보다 오래 걸리고 있어요.\n조금만 더 기다려주세요.'

describe('getWaitMessage', () => {
  it('처음에는 걸리는 시간을 알린다', () => {
    expect(getWaitMessage(0, 0)).toBe(ESTIMATE)
    expect(getWaitMessage(59_999, 0.9)).toBe(ESTIMATE)
  })

  it('1분이 지나고 절반을 넘으면 거의 다 됐다고 알린다', () => {
    expect(getWaitMessage(60_000, 0.5)).toBe(ALMOST_DONE)
  })

  it('1분이 지나도 절반을 못 갔으면 거의 다 됐다고 하지 않는다', () => {
    expect(getWaitMessage(90_000, 0.49)).toBe(ESTIMATE)
  })

  it('2분이 넘으면 진행률과 상관없이 오래 걸린다고 알린다', () => {
    expect(getWaitMessage(120_000, 0.1)).toBe(TAKING_LONG)
    expect(getWaitMessage(150_000, 0.9)).toBe(TAKING_LONG)
  })
})

describe('creepProgress', () => {
  /** 서버 값이 그대로인 채 여러 번 채운다 (1초마다 부르는 것과 같다) */
  function creepTimes(shown: number, server: number, times: number) {
    let value = shown
    for (let i = 0; i < times; i++) value = creepProgress(value, server)
    return value
  }

  it('서버 값이 그대로여도 조금씩 찬다', () => {
    const next = creepProgress(0.25, 0.25)

    expect(next).toBeGreaterThan(0.25)
    expect(creepTimes(0.25, 0.25, 10)).toBeGreaterThan(next)
  })

  it('서버 값보다 10% 넘게 앞서지 않는다', () => {
    expect(creepTimes(0.25, 0.25, 1000)).toBeLessThanOrEqual(0.35 + 1e-9)
  })

  it('서버 값이 앞서면 바로 서버 값까지 올라간다', () => {
    expect(creepProgress(0.2, 0.55)).toBeGreaterThanOrEqual(0.55)
  })

  it('서버 값이 보이는 막대보다 작게 와도 줄어들지 않는다', () => {
    expect(creepProgress(0.33, 0.3)).toBeGreaterThanOrEqual(0.33)
  })

  it('결과를 받기 전에는 끝까지 차지 않는다', () => {
    expect(creepTimes(0.95, 0.95, 1000)).toBeLessThanOrEqual(0.97 + 1e-9)
    expect(creepTimes(1, 1, 10)).toBe(1)
  })
})
