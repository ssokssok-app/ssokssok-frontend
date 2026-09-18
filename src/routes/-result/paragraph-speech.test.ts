import { describe, expect, it } from 'vitest'

import { pickKoreanVoice, splitSentences } from './paragraph-speech'

describe('splitSentences', () => {
  it('마침표 · 물음표 · 느낌표 뒤 빈칸에서 나눈다', () => {
    expect(
      splitSentences('신고가 필요해요. 꼭 해야 하나요? 네! 지금 하세요.'),
    ).toEqual(['신고가 필요해요.', '꼭 해야 하나요?', '네!', '지금 하세요.'])
  })

  it('줄바꿈에서도 나누고, 빈 줄 · 앞뒤 빈칸은 버린다', () => {
    expect(splitSentences('  첫 줄\n\n둘째 줄  ')).toEqual(['첫 줄', '둘째 줄'])
  })

  it('숫자 뒤 마침표(날짜 · 번호)에서는 나누지 않는다', () => {
    expect(
      splitSentences('2024. 11. 14.까지 신고하세요. 1. 신고서 쓰기'),
    ).toEqual(['2024. 11. 14.까지 신고하세요.', '1. 신고서 쓰기'])
  })

  it('소수점처럼 마침표 뒤에 빈칸이 없으면 나누지 않는다', () => {
    expect(splitSentences('보험료가 1.5배 올라요.')).toEqual([
      '보험료가 1.5배 올라요.',
    ])
  })

  it('빈 글이면 빈 목록이다', () => {
    expect(splitSentences('')).toEqual([])
    expect(splitSentences('   ')).toEqual([])
  })
})

function voice(
  name: string,
  options: { lang?: string; localService?: boolean; default?: boolean } = {},
) {
  return {
    name,
    lang: options.lang ?? 'ko-KR',
    localService: options.localService ?? true,
    default: options.default ?? false,
  }
}

describe('pickKoreanVoice', () => {
  it('한국어 목소리가 없으면 고르지 않는다', () => {
    expect(pickKoreanVoice([])).toBeUndefined()
    expect(pickKoreanVoice([voice('Samantha', { lang: 'en-US' })])).toBe(
      undefined,
    )
  })

  it('목록 앞의 기계음 목소리 대신 유나를 고른다 (맥 크롬 목록 순서)', () => {
    const yuna = voice('유나')
    expect(
      pickKoreanVoice([
        voice('Eddy (한국어(대한민국))'),
        voice('Grandma (한국어(대한민국))'),
        yuna,
      ]),
    ).toBe(yuna)
  })

  it('고품질 목소리가 있으면 먼저 쓴다', () => {
    const suhyun = voice('수현(고품질)')
    expect(pickKoreanVoice([voice('유나', { default: true }), suhyun])).toBe(
      suhyun,
    )
    const enhanced = voice('Suhyun (Enhanced)')
    expect(pickKoreanVoice([voice('Yuna'), enhanced])).toBe(enhanced)
  })

  it('인터넷 목소리보다 기기 안 목소리를 먼저 쓴다', () => {
    const local = voice('유나')
    expect(
      pickKoreanVoice([voice('Google 한국의', { localService: false }), local]),
    ).toBe(local)
  })

  it('인터넷 목소리밖에 없으면 그것을 쓴다', () => {
    const google = voice('Google 한국의', { localService: false })
    expect(pickKoreanVoice([voice('Alex', { lang: 'en-US' }), google])).toBe(
      google,
    )
  })

  it('기계음 목소리밖에 없으면 그것이라도 쓴다', () => {
    const eddy = voice('Eddy (한국어(대한민국))')
    expect(pickKoreanVoice([eddy])).toBe(eddy)
  })

  it('안드로이드 옛 크롬의 ko_KR 도 한국어로 본다', () => {
    const android = voice('한국어 대한민국', { lang: 'ko_KR' })
    expect(pickKoreanVoice([android])).toBe(android)
  })
})
