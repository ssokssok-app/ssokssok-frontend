#!/usr/bin/env node
/**
 * 큰글씨 모드 검사 (`pnpm check` 에 포함).
 *
 * 큰글씨 모드는 --text-* 변수 값을 키우는 방식이라, `text-[13px]` 같은 임의 크기는 커지지 않는다.
 * - src/ (components/ui 제외): 임의 글자 크기와 Tailwind 기본 단계(text-sm 등)를 막는다.
 *   화면 코드는 Figma 글자 토큰(text-body-regular 등)만 쓴다.
 * - src/components/ui: shadcn 원본은 고치지 않으므로, 쓰인 임의 크기마다
 *   src/index.css 의 html[data-font-scale='large'] 보정 규칙이 있는지 확인한다.
 * - src/index.css: @theme 에 정의한 --text-* 토큰마다 큰글씨 모드 값이 있는지 확인한다.
 * 성공하면 아무것도 출력하지 않는다.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'src')
const UI_DIR = 'src/components/ui/'
const ARBITRARY_FONT_SIZE = /\btext-\[(\d*\.?\d+(?:px|rem|em))\]/g
// Tailwind 기본 글자 단계. shadcn 컴포넌트용으로만 남겨 둔다
const DEFAULT_FONT_SIZE =
  /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g

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

// @theme 의 글자 토큰(--text-body-regular: …)마다 큰글씨 모드 재정의가 있어야 한다.
// --text-body-regular--line-height 같은 하위 속성은 크기가 아니므로 제외한다
const LARGE_BLOCK = /html\[data-font-scale='large'\]\s*\{([^}]*)\}/
const textTokenNames = (block) =>
  new Set(
    [...block.matchAll(/--text-([\w-]+?):/g)]
      .map(([, name]) => name)
      .filter((name) => !name.includes('--')),
  )
const largeBlock = css.match(LARGE_BLOCK)?.[1] ?? ''
const scaledTokens = textTokenNames(largeBlock)
for (const name of textTokenNames(css.replace(LARGE_BLOCK, ''))) {
  if (!scaledTokens.has(name)) {
    problems.push(
      `src/index.css  --text-${name} — 큰글씨 모드 값이 없음. html[data-font-scale='large'] 에 +0.25rem 값을 추가하세요.`,
    )
  }
}

for (const file of walk(srcDir)) {
  const lines = readFileSync(join(root, file), 'utf8').split('\n')
  lines.forEach((line, index) => {
    const where = `${file}:${index + 1}`
    if (!file.startsWith(UI_DIR)) {
      for (const [match] of line.matchAll(DEFAULT_FONT_SIZE)) {
        problems.push(
          `${where}  ${match} — Tailwind 기본 단계는 shadcn 컴포넌트용. Figma 글자 토큰(text-body-regular 등, src/index.css)으로 바꾸세요.`,
        )
      }
    }
    for (const [match, value] of line.matchAll(ARBITRARY_FONT_SIZE)) {
      if (!file.startsWith(UI_DIR)) {
        problems.push(
          `${where}  ${match} — 큰글씨 모드에서 커지지 않음. Figma 글자 토큰(text-body-regular 등, src/index.css)으로 바꾸세요.`,
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
