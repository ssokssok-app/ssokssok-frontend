#!/usr/bin/env node
/**
 * 문서 최신성 검사 (`pnpm check` 에 포함).
 *
 * 에이전트용 문서(CLAUDE.md, 모든 AGENTS.md, docs/, .claude/rules, .claude/skills)에 적힌
 * - `pnpm <script>` 명령어가 package.json 에 실제로 있는지
 * - 인라인 코드로 적은 파일·폴더 경로와 상대 링크가 실제로 있는지
 * 확인한다. 코드가 바뀌었는데 문서가 그대로면 여기서 실패한다.
 *
 * 코드 블록(```) 안은 예시로 보고 검사하지 않는다. 존재하지 않는 경로를 예로 들 때는 코드 블록에 쓴다.
 * 성공하면 아무것도 출력하지 않는다.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.tanstack'])
const PATH_ROOTS = [
  'src/',
  'docs/',
  'scripts/',
  'public/',
  '.claude/',
  '.github/',
]
const FILE_EXT = /\.(json|ts|tsx|mjs|js|md|css|html|ya?ml)$/
const PNPM_BUILTINS = new Set([
  'add',
  'create',
  'dlx',
  'exec',
  'i',
  'install',
  'remove',
  'up',
  'update',
  'why',
])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else files.push(relative(root, full))
  }
  return files
}

const allFiles = walk(root)
const basenames = new Set(allFiles.map((file) => file.split('/').at(-1)))
const scripts =
  JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts ?? {}

const docFiles = allFiles.filter(
  (file) =>
    file === 'CLAUDE.md' ||
    // Codex 등이 읽는 리뷰 기준. 루트와 하위 폴더에 있다
    file.split('/').at(-1) === 'AGENTS.md' ||
    (file.endsWith('.md') &&
      (file.startsWith('docs/') ||
        file.startsWith('.claude/rules/') ||
        file.startsWith('.claude/skills/'))),
)

function pathExists(path) {
  const clean = path.replace(/\/$/, '')
  if (existsSync(join(root, clean))) return true
  // `@/lib/utils` 같은 import 별칭
  if (clean.startsWith('@/')) {
    const base = join(root, 'src', clean.slice(2))
    return ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].some((ext) =>
      existsSync(base + ext),
    )
  }
  return false
}

/** 인라인 코드 하나를 검사하고, 문제가 있으면 이유를 돌려준다 */
function checkCode(code) {
  const pnpm = code.match(/^pnpm (?:run )?([a-z][\w:-]*)/)
  if (pnpm) {
    const [, name] = pnpm
    if (PNPM_BUILTINS.has(name) || name in scripts) return null
    return `package.json 에 "${name}" 스크립트가 없음`
  }

  if (/\s|[<>{}]|^https?:/.test(code)) return null
  const path = code.replace(/[:#]\d+$/, '')

  // 글롭은 글롭이 시작되기 전 디렉터리만 확인한다 (src/routes/** → src/routes)
  if (path.includes('*')) {
    const prefix = path.slice(0, path.indexOf('*')).replace(/[^/]*$/, '')
    return prefix === '' || pathExists(prefix) ? null : `경로 없음: ${prefix}`
  }

  const isRootedPath =
    PATH_ROOTS.some((prefix) => path.startsWith(prefix)) ||
    path.startsWith('@/')
  const isBareFile = !path.includes('/') && FILE_EXT.test(path)
  if (isRootedPath) return pathExists(path) ? null : '경로 없음'
  // 파일 이름만 적은 경우(`vite.config.ts`, `routeTree.gen.ts`)는 저장소 어딘가에 있으면 통과
  if (isBareFile)
    return basenames.has(path) ? null : '이 이름의 파일이 저장소에 없음'
  return null
}

const problems = []

for (const docFile of docFiles) {
  const lines = readFileSync(join(root, docFile), 'utf8').split('\n')
  let inFence = false

  lines.forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      return
    }
    if (inFence) return
    const where = `${docFile}:${index + 1}`

    for (const [, code] of line.matchAll(/`([^`]+)`/g)) {
      const reason = checkCode(code.trim())
      if (reason) problems.push(`${where}  \`${code}\` — ${reason}`)
    }

    const withoutCode = line.replace(/`[^`]*`/g, '')
    for (const [, target] of withoutCode.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue
      const resolved = join(
        dirname(join(root, docFile)),
        target.replace(/#.*$/, ''),
      )
      if (
        !existsSync(resolved) ||
        (target.endsWith('/') && !statSync(resolved).isDirectory())
      ) {
        problems.push(`${where}  (${target}) — 링크 대상이 없음`)
      }
    }
  })
}

if (problems.length > 0) {
  console.error(`문서가 실제 코드와 어긋났습니다 (${problems.length}건):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(
    '\n코드가 맞다면 문서를 고치세요. 문서가 맞다면 코드가 의도대로 바뀌었는지 확인하세요.' +
      '\n존재하지 않는 경로를 예시로 들어야 한다면 코드 블록(```) 안에 쓰세요.',
  )
  process.exit(1)
}
