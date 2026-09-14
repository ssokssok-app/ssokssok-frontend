#!/usr/bin/env node
/**
 * 디자인 규칙 검사 (`pnpm check` 에 포함). 규칙은 .claude/rules/styling.md.
 *
 * 1. 색 값 직접 쓰기 금지: 화면 코드(src/components/ui 제외)에 bg-[#2c62ea], shadow-[0_0_4px_rgba(…)],
 *    style={{ color: '#fff' }} 같은 색 값이 있으면 실패한다. 색은 src/index.css 의 토큰만 쓴다.
 *    디자이너가 색을 바꿔도 토큰을 쓴 곳만 따라 바뀌고, 팔레트에 없는 색이 조용히 섞이기 때문이다.
 * 2. shadcn 컴포넌트 추가 금지: src/components/ui/ 에 아래 허용 목록에 없는 파일이 생기면 실패한다.
 *    공용 컴포넌트는 Base UI 로 src/components/ 에 만든다. 꼭 필요하면 사용자와 정한 뒤 목록에 추가한다.
 * 성공하면 아무것도 출력하지 않는다.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'src')
const UI_DIR = 'src/components/ui/'

// 이번 디자인 시스템 전에 설치돼 있던 shadcn 원본
const ALLOWED_UI_FILES = new Set(['button.tsx'])

const COLOR_VALUE = String.raw`(?:#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\()`
// Tailwind 임의 값 · 임의 속성 안의 색: bg-[#fff], shadow-[0_0_4px_rgba(0,0,0,0.1)], [color:#fff]
const ARBITRARY_COLOR = new RegExp(
  String.raw`\[[^\]\s'"\`]*${COLOR_VALUE}[^\]\s'"\`]*\]`,
  'g',
)
// 문자열 안의 색만 있는 값: '#fff', "rgba(0,0,0,0.5)" (인라인 style 등)
const STRING_COLOR = new RegExp(
  String.raw`['"\`]\s*${COLOR_VALUE}[^'"\`]*['"\`]`,
  'g',
)

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(relative(root, full))
  }
  return files
}

const problems = []

for (const file of walk(srcDir)) {
  if (file.startsWith(UI_DIR) || file === 'src/routeTree.gen.ts') continue
  const lines = readFileSync(join(root, file), 'utf8').split('\n')
  lines.forEach((line, index) => {
    // 주석에 적은 색(예: Figma 값 설명)은 코드가 아니므로 제외
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
    for (const [match] of [
      ...code.matchAll(ARBITRARY_COLOR),
      ...code.matchAll(STRING_COLOR),
    ]) {
      problems.push(
        `${file}:${index + 1}  ${match} — 색 값을 직접 썼음. src/index.css 의 색 토큰(bg-blue-500 등)을 쓰세요. 없는 색이면 토큰을 먼저 추가합니다.`,
      )
    }
  })
}

for (const name of readdirSync(join(root, UI_DIR))) {
  if (!ALLOWED_UI_FILES.has(name)) {
    problems.push(
      `${UI_DIR}${name} — shadcn 컴포넌트를 새로 추가했음. 공용 컴포넌트는 Base UI 로 src/components/ 에 만드세요. 꼭 필요하면 사용자와 정한 뒤 scripts/check-design.mjs 의 허용 목록에 추가합니다.`,
    )
  }
}

if (problems.length > 0) {
  console.error(`디자인 규칙 위반 (${problems.length}건):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
