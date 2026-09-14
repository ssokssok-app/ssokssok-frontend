#!/usr/bin/env node
/**
 * PostToolUse(Edit|Write)
 * 1. 수정한 파일을 Prettier 로 포맷한다 (.prettierignore 대상은 건너뜀).
 * 2. JS/TS 파일이면 oxlint 결과를 Claude 에게 바로 돌려준다.
 * 3. 수정한 파일을 기록해 Stop 훅이 검증·문서 알림에 쓰게 한다.
 */
import { spawnSync } from 'node:child_process'
import { isAbsolute, join, relative } from 'node:path'
import {
  loadState,
  projectDir,
  readInput,
  respond,
  saveState,
  tail,
} from './lib.mjs'

const input = await readInput()
const filePath = input.tool_input?.file_path
if (!filePath) process.exit(0)

const file = relative(projectDir, filePath)
if (
  file.startsWith('..') ||
  isAbsolute(file) ||
  file.startsWith('node_modules/')
)
  process.exit(0)

const state = loadState(input.session_id)
state.changed = [...new Set([...(state.changed ?? []), file])]
saveState(input.session_id, state)

const bin = (name) => join(projectDir, 'node_modules', '.bin', name)
const run = (name, args) =>
  spawnSync(bin(name), args, {
    cwd: projectDir,
    encoding: 'utf8',
    timeout: 20_000,
  })

const notes = []

const prettier = run('prettier', [
  '--write',
  '--ignore-unknown',
  '--log-level',
  'warn',
  file,
])
if (prettier.status !== 0) {
  notes.push(
    `Prettier 포맷 실패 (문법 오류일 수 있음):\n${tail(prettier.stderr || prettier.stdout)}`,
  )
}

if (/\.(m?[jt]sx?)$/.test(file)) {
  const lint = run('oxlint', [file])
  const output = (lint.stdout + lint.stderr).trim()
  if (lint.status !== 0) {
    respond({
      decision: 'block',
      reason: `oxlint 오류 — 고치세요:\n${tail(output)}`,
    })
  }
  if (/warning/i.test(output) && !/Found 0 warnings/.test(output)) {
    notes.push(`oxlint 경고:\n${tail(output)}`)
  }
}

if (notes.length > 0) {
  respond({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: notes.join('\n\n'),
    },
  })
}
