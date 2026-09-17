/**
 * 기기 번호 (`docs/api-contract.md` "9. 기기 번호 · 이용 횟수").
 *
 * 백엔드는 토큰이 없는 요청을 이 번호로 가른다. 하루 이용 횟수를 세고, 변환 작업의 주인을 확인해
 * 다른 기기가 남의 결과를 보지 못하게 막는다. 모든 백엔드 요청에 `X-Device-Id` 로 붙이고,
 * 빠지면 400 `DEVICE_ID_REQUIRED` 로 실패한다 (`src/api/client.ts`).
 *
 * 토큰이 아니라 "이 브라우저" 를 가리키는 값이라 localStorage 에 둔다. 가져가도 남의 결과를 볼 수
 * 없고 문서 내용과도 무관하다 (`AGENTS.md` "개인정보 · 보안"). localStorage 접근은 이 파일에서만 한다.
 *
 * 저장소를 쓸 수 없으면(사파리 private 모드, 저장소 차단) 메모리에만 두고 쓴다. 탭을 닫으면 사라져
 * 이용 횟수가 다시 채워지지만, 번호가 빠져 요청이 통째로 실패하는 것보다 낫다.
 */

const STORAGE_KEY = 'device-id'

let cached: string | null = null

/** 이 브라우저의 기기 번호. 없으면 만들어 저장하고, 같은 탭에서는 늘 같은 값을 돌려준다 */
export function getDeviceId(): string {
  cached ??= readStored() ?? createDeviceId()
  return cached
}

function readStored(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? stored : null
  } catch {
    // 저장소를 읽지 못하면 없는 것으로 보고 새로 만든다
    return null
  }
}

function createDeviceId(): string {
  const id = crypto.randomUUID()
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // 남기지 못하면 이 탭에서만 쓴다
  }
  return id
}
