#!/usr/bin/env node
/**
 * 토큰 등록 검사 (`pnpm check` 에 포함).
 *
 * src/index.css 에 직접 만든 토큰(Tailwind 기본에 없는 이름)은 src/lib/utils.ts 의 cn 설정에도 등록해야 한다.
 * 등록하지 않으면 cn 이 `text-body-semibold` 와 `text-gray-500` 을 같은 종류로 오인해 하나를 지운다.
 * - @theme 의 --text-* · --shadow-* · --radius-* · --container-* · --spacing-* 중 Tailwind 기본 이름(sm, lg …)이 아닌 것
 * - @utility 로 만든 클래스 (bg-gradient-main → 'gradient-main')
 * 성공하면 아무것도 출력하지 않는다.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(root, 'src/index.css'), 'utf8')
const utils = readFileSync(join(root, 'src/lib/utils.ts'), 'utf8')

const TAILWIND_DEFAULT_NAME = /^(?:[23]xs|xs|sm|md|base|lg|xl|[2-9]xl)$/
const isRegistered = (name) => utils.includes(`'${name}'`)

const problems = []

// 하위 속성(--text-body-regular--line-height)과 와일드카드(--color-*)는 제외
for (const [, namespace, name] of css.matchAll(
  /--(text|shadow|radius|container|spacing)-([\w-]+?):/g,
)) {
  if (name.includes('--') || TAILWIND_DEFAULT_NAME.test(name)) continue
  if (!isRegistered(name)) {
    problems.push(
      `--${namespace}-${name} — src/lib/utils.ts 의 cn 설정에 '${name}' 이 없음`,
    )
  }
}

for (const [, utility] of css.matchAll(/@utility\s+([\w-]+)/g)) {
  const name = utility.replace(/^[a-z]+-/, '')
  if (!isRegistered(name)) {
    problems.push(
      `@utility ${utility} — src/lib/utils.ts 의 cn 설정에 '${name}' 이 없음`,
    )
  }
}

const unique = [...new Set(problems)]
if (unique.length > 0) {
  console.error(`cn 에 등록되지 않은 토큰 (${unique.length}건):\n`)
  for (const problem of unique) console.error(`  ${problem}`)
  console.error(
    '\n등록하지 않으면 cn() 으로 클래스를 합칠 때 토큰이 지워질 수 있습니다.',
  )
  process.exit(1)
}
