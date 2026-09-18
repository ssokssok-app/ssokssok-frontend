/**
 * 안드로이드 앱 안 브라우저(카카오톡 · 네이버 등)에서 열리면 바깥 브라우저로 다시 연다.
 *
 * 앱 안 브라우저(안드로이드 WebView)는 기기 음성을 지원하지 않아 듣기 버튼이 보이지 않고(2026-09-18 사용자 제보),
 * 파일 내려받기(저장하기)도 안 될 수 있다. 링크를 카카오톡으로 주고받는 일이 많아, 앱을 열 때 바로 넘긴다
 * (docs/product.md "UX 원칙").
 *
 * - 카카오톡: 카카오톡이 주는 주소(kakaotalk://web/openExternal)로 기기 기본 브라우저에서 연다
 * - 그 밖의 앱 안 브라우저(네이버 등): 안드로이드 intent 주소로 크롬에서 연다.
 *   크롬이 없으면 intent 가 같은 주소를 다시 열어, 아래 표시로 되풀이하지 않고 그대로 쓴다
 * - 아이폰의 앱 안 브라우저는 제보된 문제가 없어 넘기지 않는다
 * - 한 탭에서 한 번만 넘긴다. sessionStorage 접근은 이 파일에서만 한다
 */

const TRIED_KEY = 'external-browser-tried'

/** 바깥 브라우저로 여는 주소. 넘길 필요가 없으면 null */
export function externalBrowserUrl(userAgent: string, url: URL): string | null {
  if (!/Android/i.test(userAgent)) return null
  if (/KAKAOTALK/i.test(userAgent)) {
    return `kakaotalk://web/openExternal?url=${encodeURIComponent(url.href)}`
  }
  // 안드로이드 WebView 는 "; wv)" 를 붙여 알린다. 크롬 맞춤 탭은 크롬과 같아서 넘기지 않는다
  if (!/; wv\)/.test(userAgent)) return null
  const scheme = url.protocol.replace(':', '')
  const fallback = encodeURIComponent(url.href)
  // 앱은 주소의 # 을 쓰지 않는다. # 뒤는 intent 설정 자리라 붙이지 않는다
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallback};end`
}

/** 앱을 열 때 한 번 부른다 (src/main.tsx). 넘기지 못해도 지금 화면은 그대로 뜬다 */
export function openInExternalBrowser() {
  const target = externalBrowserUrl(
    navigator.userAgent,
    new URL(window.location.href),
  )
  if (!target) return
  try {
    if (sessionStorage.getItem(TRIED_KEY)) return
    sessionStorage.setItem(TRIED_KEY, '1')
  } catch {
    // 저장소를 못 쓰면 되풀이를 막을 수 없어 넘기지 않는다
    return
  }
  window.location.href = target
}
