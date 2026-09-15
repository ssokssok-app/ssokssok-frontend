#!/usr/bin/env node
/**
 * CI 누락 검사 (`pnpm check` 에 포함).
 *
 * docs/ci.md 의 "나중에 추가할 것" 중 코드로 알아챌 수 있는 조건을 검사한다.
 * 테스트나 E2E 설정을 추가했는데 CI 가 그것을 돌리지 않으면 실패해서, 잊지 않고 CI 에 붙이게 한다.
 * CI(.nvmrc)와 배포(Vercel, package.json engines)의 Node 주 버전이 다르면 실패한다.
 * 성공하면 아무것도 출력하지 않는다.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ciPath = '.github/workflows/ci.yml'
const ci = existsSync(join(root, ciPath))
  ? readFileSync(join(root, ciPath), 'utf8')
  : ''

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else files.push(relative(root, full))
  }
  return files
}

const problems = []

const unitTests = walk(join(root, 'src')).filter((file) =>
  /\.(test|spec)\.[jt]sx?$/.test(file),
)
if (unitTests.length > 0 && !/pnpm (run )?test(\s|$)/m.test(ci)) {
  problems.push(
    `테스트 파일이 있는데(${unitTests[0]} 등) ${ciPath} 가 \`pnpm test\` 를 돌리지 않음 → docs/ci.md "나중에 추가할 것"의 단위 테스트 항목대로 CI 에 추가하세요.`,
  )
}

const hasPlaywright = ['ts', 'js', 'mjs'].some((ext) =>
  existsSync(join(root, `playwright.config.${ext}`)),
)
if (hasPlaywright && !/pnpm (run )?test:e2e/.test(ci)) {
  problems.push(
    `playwright.config 가 있는데 ${ciPath} 가 \`pnpm test:e2e\` 를 돌리지 않음 → docs/ci.md "나중에 추가할 것"의 E2E · 접근성 항목대로 CI 에 추가하세요.`,
  )
}

// Vercel 은 .nvmrc 를 읽지 않고 engines.node 로 버전을 고른다 (docs/ci.md "배포")
const nvmrcMajor = readFileSync(join(root, '.nvmrc'), 'utf8')
  .trim()
  .split('.')[0]
const engineNode = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  .engines?.node
if (engineNode !== `${nvmrcMajor}.x`) {
  problems.push(
    `package.json 의 engines.node(${engineNode ?? '없음'})가 .nvmrc(${nvmrcMajor})와 다름 → CI 와 배포의 Node 버전이 같도록 engines.node 를 "${nvmrcMajor}.x" 로 맞추세요.`,
  )
}

if (problems.length > 0) {
  console.error(`CI · 배포 설정에 문제가 있습니다 (${problems.length}건):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
