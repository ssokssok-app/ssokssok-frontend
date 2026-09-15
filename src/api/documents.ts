import { isRecord } from '@/lib/utils'
import type {
  DocumentKind,
  DocumentResult,
  FaqEntry,
  MustCheckItem,
  ResultParagraph,
  SourceLine,
} from '@/types/document-result'

import { ApiError } from './errors'

/**
 * 결과 응답(Swagger `DocumentResult`)의 모양을 확인해 타입으로 만든다 (docs/api-contract.md "결과 데이터").
 * 변환 결과와 샘플 결과가 같이 쓴다.
 *
 * - 필수 항목이 없거나 모양이 다르면 INVALID_RESPONSE 를 던진다 (`as` 단언으로 넘기지 않는다)
 * - 없어도 되는 항목(소제목, 원문 줄, 꼭 확인하세요 · 해야할 일 · 더 알아보기)은 없으면 null 로 둔다
 * - 모르는 kind 는 other 로 본다. 백엔드가 문서 종류를 늘려도 결과는 보이게 한다
 */

const documentKinds: readonly DocumentKind[] = [
  'labor_contract',
  'lease_contract',
  'fine',
  'notice',
  'other',
]

function invalid(what: string) {
  return new ApiError({
    code: 'INVALID_RESPONSE',
    message: `결과 응답의 ${what} 모양이 달라요.`,
  })
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/** 없거나 null 이면 null, 배열이면 항목마다 확인한다 (mustCheck · todos · faqs) */
function parseNullableList<T>(
  value: unknown,
  what: string,
  parseItem: (item: unknown) => T,
): T[] | null {
  if (value === undefined || value === null) return null
  if (!Array.isArray(value)) throw invalid(what)
  return value.map(parseItem)
}

function parseParagraph(value: unknown): ResultParagraph {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.body !== 'string'
  ) {
    throw invalid('paragraphs')
  }
  return {
    id: value.id,
    title: typeof value.title === 'string' ? value.title : null,
    body: value.body,
    sourceLineIds: isStringArray(value.sourceLineIds)
      ? value.sourceLineIds
      : null,
  }
}

function parseSourceLine(value: unknown): SourceLine {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.text !== 'string'
  ) {
    throw invalid('sourceLines')
  }
  return { id: value.id, text: value.text }
}

function parseMustCheckItem(value: unknown): MustCheckItem {
  if (
    !isRecord(value) ||
    typeof value.label !== 'string' ||
    typeof value.value !== 'string'
  ) {
    throw invalid('mustCheck')
  }
  return { label: value.label, value: value.value }
}

function parseTodo(value: unknown): string {
  if (typeof value !== 'string') throw invalid('todos')
  return value
}

function parseFaq(value: unknown): FaqEntry {
  if (
    !isRecord(value) ||
    typeof value.question !== 'string' ||
    typeof value.answer !== 'string'
  ) {
    throw invalid('faqs')
  }
  return { question: value.question, answer: value.answer }
}

export function parseDocumentResult(body: unknown): DocumentResult {
  if (
    !isRecord(body) ||
    typeof body.category !== 'string' ||
    typeof body.title !== 'string' ||
    typeof body.summary !== 'string' ||
    !Array.isArray(body.paragraphs) ||
    !Array.isArray(body.sourceLines)
  ) {
    throw invalid('결과')
  }
  const kind = body.kind
  return {
    kind: documentKinds.find((known) => known === kind) ?? 'other',
    category: body.category,
    title: body.title,
    summary: body.summary,
    paragraphs: body.paragraphs.map(parseParagraph),
    sourceLines: body.sourceLines.map(parseSourceLine),
    mustCheck: parseNullableList(
      body.mustCheck,
      'mustCheck',
      parseMustCheckItem,
    ),
    todos: parseNullableList(body.todos, 'todos', parseTodo),
    faqs: parseNullableList(body.faqs, 'faqs', parseFaq),
  }
}
