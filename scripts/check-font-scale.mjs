#!/usr/bin/env node
/**
 * 큰글씨 모드 검사 (`pnpm check` 에 포함).
 *
 * 큰글씨 모드는 --text-* 변수 값을 키우는 방식이라, `text-[13px]` 같은 임의 크기는 커지지 않는다.
 * - src/ (components/ui 제외): 임의 글자 크기 사용을 막는다.
 * - src/components/ui: shadcn 원본은 고치지 않으므로, 쓰인 임의 크기마다
 *   src/index.css 의 html[data-font-scale='large'] 보정 규칙이 있는지 확인한다.
 * 성공하면 아무것도 출력하지 않는다.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'src')
const UI_DIR = 'src/components/ui/'
const ARBITRARY_FONT_SIZE = /\btext-\[(\d*\.?\d+(?:px|rem|em))\]/g

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(relative(root, full))
  }
  return files
}

// index.css 에 보정 규칙이 있는 값: `.text-\[0\.8rem\]` → 0.8rem
const css = readFileSync(join(srcDir, 'index.css'), 'utf8')
const scaledValues = new Set(
  [
    ...css.matchAll(/data-font-scale='large'\]\s+\.text-\\\[([^\s{]+?)\\\]/g),
  ].map(([, value]) => value.replaceAll('\\', '')),
)

const problems = []

for (const file of walk(srcDir)) {
  const lines = readFileSync(join(root, file), 'utf8').split('\n')
  lines.forEach((line, index) => {
    for (const [match, value] of line.matchAll(ARBITRARY_FONT_SIZE)) {
      const where = `${file}:${index + 1}`
      if (!file.startsWith(UI_DIR)) {
        problems.push(
          `${where}  ${match} — 큰글씨 모드에서 커지지 않음. text-xs, text-sm, text-base 같은 스케일 클래스로 바꾸세요.`,
        )
      } else if (!scaledValues.has(value)) {
        problems.push(
          `${where}  ${match} — shadcn 컴포넌트의 임의 크기에 큰글씨 보정이 없음. ` +
            `src/index.css 의 @layer utilities 에 html[data-font-scale='large'] .text-\\[${value.replaceAll('.', '\\.')}\\] 규칙을 추가하세요 (+0.25rem).`,
        )
      }
    }
  })
}

if (problems.length > 0) {
  console.error(`큰글씨 모드 규칙 위반 (${problems.length}건):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
