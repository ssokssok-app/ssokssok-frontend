#!/usr/bin/env node
/**
 * Stop — Claude 가 응답을 끝내려 할 때
 * 1. 이번 세션에 바뀐 파일이 있으면 `pnpm check` 를 돌리고, 실패하면 종료를 막고 에러를 돌려준다.
 * 2. 통과했는데 문서가 언급하는 파일을 바꾸고 문서는 안 고쳤다면, 문서 갱신 여부를 확인하라고 알린다.
 *
 * 바뀐 파일 = PostToolUse 훅이 기록한 파일 ∪ git 이 보는 미커밋 변경 (Bash 로 고친 파일까지 잡기 위해).
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  isDocFile,
  loadState,
  projectDir,
  readInput,
  respond,
  saveState,
  tail,
} from './lib.mjs'

/** 같은 실패로 종료를 막는 최대 횟수. 넘기면 사용자에게 넘긴다 */
const MAX_BLOCKS = 3

const input = await readInput()
// 백그라운드 작업을 기다리는 중이면 작업이 끝난 게 아니므로 검사하지 않는다
if (input.background_tasks?.length > 0) process.exit(0)

const state = loadState(input.session_id)

/** git 미커밋 변경 목록과, 내용이 바뀌었는지 비교할 지문. git 저장소가 아니면 null */
function gitSnapshot() {
  const status = spawnSync('git', ['status', '--porcelain=v1', '-z', '-uall'], {
    cwd: projectDir,
    encoding: 'utf8',
  })
  if (status.status !== 0) return null

  const files = []
  const entries = status.stdout.split('\0').filter(Boolean)
  for (let i = 0; i < entries.length; i++) {
    const code = entries[i].slice(0, 2)
    files.push(entries[i].slice(3))
    if (code.includes('R') || code.includes('C')) i++ // 이름 변경은 원래 경로가 한 칸 더 온다
  }

  const hash = createHash('sha1')
  for (const file of files) {
    const full = join(projectDir, file)
    hash.update(
      `${file}:${existsSync(full) ? statSync(full).mtimeMs : 'deleted'}\n`,
    )
  }
  return { files, fingerprint: hash.digest('hex') }
}

const before = gitSnapshot()
const trackedChanges = state.changed ?? []
const gitChanged =
  before &&
  before.files.length > 0 &&
  before.fingerprint !== state.verifiedFingerprint
if (trackedChanges.length === 0 && !gitChanged) process.exit(0)

const changedFiles = [
  ...new Set([...trackedChanges, ...(gitChanged ? before.files : [])]),
]

// ── 1. 검증 ──────────────────────────────────────────────
const check = spawnSync('pnpm', ['check'], {
  cwd: projectDir,
  encoding: 'utf8',
  timeout: 110_000,
})

if (check.error) {
  respond({
    systemMessage: `Stop 훅: pnpm check 를 실행하지 못했습니다 (${check.error.message})`,
  })
}

if (check.status !== 0) {
  state.failures = (state.failures ?? 0) + 1
  saveState(input.session_id, state)
  if (state.failures > MAX_BLOCKS) {
    respond({
      systemMessage: `pnpm check 실패가 ${MAX_BLOCKS}번 넘게 이어져 Stop 훅이 더 이상 종료를 막지 않습니다. 직접 확인해 주세요.`,
    })
  }
  respond({
    decision: 'block',
    reason: [
      '`pnpm check` 가 실패했습니다. 고친 뒤에 끝내세요.',
      '이번 작업과 무관한 기존 문제라면 고치지 말고, 무엇이 실패하는지 사용자에게 알린 뒤 끝내세요.',
      '',
      tail(check.stdout + check.stderr),
    ].join('\n'),
  })
}

state.changed = []
state.failures = 0
state.verifiedFingerprint = gitSnapshot()?.fingerprint ?? null

// ── 2. 문서 최신화 알림 ───────────────────────────────────
function listDocs() {
  const docs = existsSync(join(projectDir, 'CLAUDE.md')) ? ['CLAUDE.md'] : []
  const walk = (dir) => {
    if (!existsSync(join(projectDir, dir))) return
    for (const entry of readdirSync(join(projectDir, dir), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${entry.name}`
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.md')) docs.push(path)
    }
  }
  ;['docs', '.claude/rules', '.claude/skills'].forEach(walk)
  return docs.map((path) => ({
    path,
    lines: readFileSync(join(projectDir, path), 'utf8').split('\n'),
  }))
}

function findMentions(docs, needle) {
  const hits = []
  for (const doc of docs) {
    doc.lines.forEach((line, index) => {
      if (line.includes(needle)) hits.push(`${doc.path}:${index + 1}`)
    })
  }
  return hits
}

const docsTouched = changedFiles.some(isDocFile)
const reminded = new Set(state.docReminded ?? [])
const candidates = changedFiles.filter(
  (file) => !isDocFile(file) && !reminded.has(file),
)

if (docsTouched || candidates.length === 0) {
  saveState(input.session_id, state)
  process.exit(0)
}

const docs = listDocs()
const findings = []

for (const file of candidates) {
  // 문서가 경로(또는 루트 설정 파일 이름)로 직접 언급하는 파일
  const mentions = findMentions(docs, file)
  if (mentions.length > 0) {
    findings.push(`- ${file} ← ${mentions.slice(0, 3).join(', ')}`)
    continue
  }
  // src 바로 아래에 문서에 없는 새 폴더가 생긴 경우
  const topDir = file.match(/^src\/[^/]+\//)?.[0]
  if (topDir && findMentions(docs, topDir).length === 0) {
    findings.push(
      `- ${file} ← \`${topDir}\` 폴더가 docs/architecture.md 에 없음`,
    )
  }
}

candidates.forEach((file) => reminded.add(file))
state.docReminded = [...reminded]
saveState(input.session_id, state)

if (findings.length > 0) {
  respond({
    hookSpecificOutput: {
      hookEventName: 'Stop',
      additionalContext: [
        '`pnpm check` 는 통과했습니다. 다만 이번에 바꾼 파일 중 에이전트 문서가 다루는 것이 있는데 문서는 수정되지 않았습니다:',
        ...findings,
        '',
        '해당 문서 줄이 아직 사실인지 확인하세요. 틀렸으면 고치고, 여전히 맞으면 아무것도 하지 말고 한 줄로 확인만 남긴 뒤 끝내세요.',
      ].join('\n'),
    },
  })
}
