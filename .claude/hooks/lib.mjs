/**
 * 훅 스크립트 공용 유틸.
 * 훅은 매번 새 프로세스로 뜨므로, 세션 동안 유지할 값은 임시 폴더의 세션별 JSON 에 둔다.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectDir =
  process.env.CLAUDE_PROJECT_DIR ??
  join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 에이전트용 문서. 이 파일들이 바뀌면 "문서를 갱신했다"고 본다 */
export function isDocFile(file) {
  return (
    file === 'CLAUDE.md' ||
    file.startsWith('docs/') ||
    file.startsWith('.claude/rules/') ||
    file.startsWith('.claude/skills/')
  )
}

export async function readInput() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  return JSON.parse(raw || '{}')
}

function statePath(sessionId) {
  return join(
    tmpdir(),
    'ssokssok-claude-hooks',
    `${sessionId ?? 'unknown'}.json`,
  )
}

export function loadState(sessionId) {
  try {
    return JSON.parse(readFileSync(statePath(sessionId), 'utf8'))
  } catch {
    return {}
  }
}

export function saveState(sessionId, state) {
  const path = statePath(sessionId)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(state))
}

export function respond(output) {
  process.stdout.write(JSON.stringify(output))
  process.exit(0)
}

/** 출력이 길면 뒤쪽(보통 에러 요약이 있는 곳)만 남긴다 */
export function tail(text, maxLines = 60) {
  const lines = text.trim().split('\n')
  return lines.length > maxLines
    ? [
        `… (앞 ${lines.length - maxLines}줄 생략)`,
        ...lines.slice(-maxLines),
      ].join('\n')
    : lines.join('\n')
}
