import { getDeviceId } from '@/lib/device-id'
import { isRecord } from '@/lib/utils'

import { toApiError } from './errors'

/**
 * 백엔드 요청과 웹 토큰 (docs/api-contract.md "웹 토큰 저장", docs/architecture.md "백엔드 연동").
 *
 * - 모든 요청에 기기 번호(X-Device-Id)를 붙인다. 백엔드는 토큰이 없으면 이 번호로 이용 횟수를 세고
 *   작업의 주인을 확인한다. 번호를 만들고 저장하는 것은 src/lib/device-id.ts 가 맡는다.
 * - 액세스 토큰은 이 파일의 메모리에만 둔다. 리프레시 토큰은 백엔드가 심는 HttpOnly 쿠키라 코드가 다루지 않고,
 *   같은 도메인의 /api/auth 요청에 브라우저가 붙인다. 응답 본문에도 refreshToken 이 오지만 앱용이라 읽지 않는다.
 * - 로그인이 필요한 요청이 401 이면 갱신한 뒤 한 번 다시 보낸다. 여러 요청이 동시에 실패해도 갱신은 한 번만 나간다.
 * - 쿠키는 읽을 수 없어 로그인했는지 알 수 없다. 그래서 "로그인한 적 있음" 표시(참/거짓)만 localStorage 에 두고,
 *   표시가 없으면 앱을 켤 때 갱신 요청을 보내지 않는다. 토큰이 아니라 가져가도 쓸 수 없다. localStorage 접근은 이 파일에서만 한다.
 * - 이 표시가 다른 탭에서 바뀌면(로그인 · 로그아웃) 이 탭도 따라간다. 쿠키는 탭끼리 같이 쓰기 때문이다.
 */

const SESSION_HINT_KEY = 'has-session'

let accessToken: string | null = null
let refreshing: Promise<boolean> | null = null
let restoring: Promise<unknown> = Promise.resolve()
const listeners = new Set<() => void>()

// 사파리 private 모드, 저장소 차단 등에서는 localStorage 접근 자체가 throw 할 수 있다
function readSessionHint() {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === 'true'
  } catch {
    return false
  }
}

function writeSessionHint(loggedIn: boolean) {
  try {
    if (loggedIn) localStorage.setItem(SESSION_HINT_KEY, 'true')
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch {
    // 표시를 못 남기면 다음에 앱을 켤 때 로그인을 되살리지 못할 뿐이다
  }
}

function setAccessToken(
  next: string | null,
  { newSession = false }: { newSession?: boolean } = {},
) {
  const changed = newSession || (accessToken === null) !== (next === null)
  accessToken = next
  writeSessionHint(next !== null)
  // 갱신으로 같은 로그인의 토큰만 바뀐 때는 알리지 않는다
  if (changed) listeners.forEach((listener) => listener())
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function hasSession() {
  return accessToken !== null
}

/** 로그인 응답의 액세스 토큰으로 로그인을 시작한다. 이미 로그인 중이어도 다른 계정일 수 있어 알린다 */
export function beginSession(token: string) {
  setAccessToken(token, { newSession: true })
}

/** 로그아웃 · 탈퇴 뒤 메모리의 토큰과 로그인 표시를 지운다 */
export function endSession() {
  setAccessToken(null)
}

/** 앱을 켤 때 한 번 부른다 (src/main.tsx). 로그인한 적이 있으면 쿠키로 액세스 토큰을 다시 받고, 다른 탭의 로그인 여부를 따라간다 */
export function initSession() {
  if (readSessionHint()) restoring = refreshAccessToken()
  window.addEventListener('storage', handleStorage)
}

// 다른 탭에서 로그아웃하면 이 탭도 로그아웃하고, 로그인하면 쿠키로 따라 되살린다 (key === null 은 localStorage.clear())
function handleStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== SESSION_HINT_KEY) return
  const loggedInElsewhere = readSessionHint()
  if (!loggedInElsewhere && accessToken !== null) setAccessToken(null)
  else if (loggedInElsewhere && accessToken === null) {
    restoring = refreshAccessToken()
  }
}

/**
 * 로그인 되살리기가 끝날 때까지 기다린다.
 * 루트 라우트가 첫 화면을 그리기 전에 기다려서, 화면들은 따로 기다리지 않고 로그인 여부를 바로 본다.
 */
export function whenSessionRestored() {
  return restoring
}

/** 쿠키의 리프레시 토큰으로 액세스 토큰을 새로 받는다. 이미 갱신 중이면 그 결과를 같이 기다린다 */
function refreshAccessToken(): Promise<boolean> {
  refreshing ??= requestRefresh().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function requestRefresh(): Promise<boolean> {
  let response: Response
  try {
    response = await fetch('/api/auth/refresh', { method: 'POST' })
  } catch {
    // 네트워크 문제는 로그인이 끝난 게 아니라서 토큰과 표시를 그대로 둔다
    return false
  }
  // 쿠키가 없거나 만료 · 무효면 로그인이 끝난 것이다. 서버 오류(5xx)는 로그인을 지우지 않는다
  if (response.status === 401) {
    setAccessToken(null)
    return false
  }
  const token = response.ok ? readAccessToken(await readJson(response)) : null
  if (token) setAccessToken(token)
  return token !== null
}

/** 로그인 · 갱신 응답(TokenResponse)에서 액세스 토큰만 꺼낸다 */
export function readAccessToken(body: unknown): string | null {
  return isRecord(body) && typeof body.accessToken === 'string'
    ? body.accessToken
    : null
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    // 본문이 JSON 이 아니면 없는 것으로 본다. 실패 여부는 response.ok 로 따로 판단한다
    return null
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  /** JSON 으로 보낼 본문 */
  json?: unknown
  /** multipart/form-data 로 보낼 본문 (파일 올리기). Content-Type 은 브라우저가 경계 문자열과 함께 붙인다 */
  form?: FormData
  signal?: AbortSignal
  /** 로그인이 필요한 요청. 액세스 토큰을 붙이고, 401 이면 갱신한 뒤 한 번 다시 보낸다 */
  auth?: boolean
}

/**
 * 백엔드를 부르고 응답 본문(JSON)을 돌려준다. 실패하면 ApiError 를 던진다.
 * 개발 서버 프록시 · Vercel 이 백엔드로 넘기도록 항상 `/api/...` 상대 경로로 부른다.
 */
export async function apiRequest(
  path: `/api/${string}`,
  { method = 'GET', json, form, signal, auth = false }: ApiRequestOptions = {},
): Promise<unknown> {
  if (auth) await restoring

  const send = () => {
    const headers = new Headers()
    headers.set('X-Device-Id', getDeviceId())
    if (json !== undefined) headers.set('Content-Type', 'application/json')
    if (auth && accessToken)
      headers.set('Authorization', `Bearer ${accessToken}`)
    return fetch(path, {
      method,
      headers,
      body: json === undefined ? form : JSON.stringify(json),
      signal,
    })
  }

  let response = await send()
  // 액세스 토큰이 만료(TOKEN_EXPIRED)됐거나 서버가 모르는 토큰(UNAUTHORIZED)이면 갱신해 본다
  if (auth && response.status === 401 && (await refreshAccessToken())) {
    response = await send()
    // 새 토큰으로도 거절되면 로그인이 끝난 것이다
    if (response.status === 401) setAccessToken(null)
  }

  const body = await readJson(response)
  if (!response.ok) throw toApiError(body, response.status)
  return body
}
