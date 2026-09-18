import { describe, expect, it } from 'vitest'

import { externalBrowserUrl } from './external-browser'

const url = new URL('https://www.ssokssok.site/samples/fine?paragraph=2')

const ua = {
  kakaoAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-S918N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.127 Mobile Safari/537.36 KAKAOTALK 10.9.1',
  naverAndroid:
    'Mozilla/5.0 (Linux; Android 13; SM-A536N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.8.2)',
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  samsungInternet:
    'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
  kakaoIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.9.1',
  desktopChrome:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
}

describe('externalBrowserUrl', () => {
  it('안드로이드 카카오톡은 카카오톡 주소로 기본 브라우저에서 연다', () => {
    expect(externalBrowserUrl(ua.kakaoAndroid, url)).toBe(
      `kakaotalk://web/openExternal?url=${encodeURIComponent(url.href)}`,
    )
  })

  it('안드로이드 네이버 등 그 밖의 앱 안 브라우저는 크롬 intent 로 연다', () => {
    expect(externalBrowserUrl(ua.naverAndroid, url)).toBe(
      'intent://www.ssokssok.site/samples/fine?paragraph=2#Intent;scheme=https;package=com.android.chrome;' +
        `S.browser_fallback_url=${encodeURIComponent(url.href)};end`,
    )
  })

  it('주소의 # 뒤는 intent 설정과 겹치지 않게 뺀다', () => {
    const withHash = new URL('https://www.ssokssok.site/privacy#top')
    expect(externalBrowserUrl(ua.naverAndroid, withHash)).toMatch(
      /^intent:\/\/www\.ssokssok\.site\/privacy#Intent;/,
    )
  })

  it('안드로이드 크롬 · 삼성 인터넷은 넘기지 않는다', () => {
    expect(externalBrowserUrl(ua.chromeAndroid, url)).toBeNull()
    expect(externalBrowserUrl(ua.samsungInternet, url)).toBeNull()
  })

  it('아이폰 카카오톡 · 컴퓨터는 넘기지 않는다', () => {
    expect(externalBrowserUrl(ua.kakaoIphone, url)).toBeNull()
    expect(externalBrowserUrl(ua.desktopChrome, url)).toBeNull()
  })
})
