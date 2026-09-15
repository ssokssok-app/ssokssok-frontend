import { describe, expect, it } from 'vitest'

import { parseDocumentResult } from './documents'
import { ApiError } from './errors'

/** 필수 항목만 있는 결과 응답 */
function minimalBody(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'notice',
    category: '안내문',
    title: '국민연금 가입 신고가 필요해요',
    summary: '요약',
    paragraphs: [{ id: 'p1', body: '쉬운 문단', sourceLineIds: ['e1'] }],
    sourceLines: [{ id: 'e1', text: '원문 줄' }],
    ...overrides,
  }
}

function expectInvalid(body: unknown) {
  try {
    parseDocumentResult(body)
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('INVALID_RESPONSE')
    return
  }
  throw new Error('INVALID_RESPONSE 를 던지지 않았다')
}

describe('parseDocumentResult', () => {
  it('필수 항목만 있으면 없어도 되는 항목은 null 로 채운다', () => {
    const result = parseDocumentResult(minimalBody())

    expect(result).toMatchObject({
      kind: 'notice',
      mustCheck: null,
      todos: null,
      faqs: null,
    })
    expect(result.paragraphs[0]).toEqual({
      id: 'p1',
      title: null,
      body: '쉬운 문단',
      sourceLineIds: ['e1'],
    })
  })

  it('모르는 문서 종류는 other 로 본다', () => {
    expect(parseDocumentResult(minimalBody({ kind: 'tax_notice' })).kind).toBe(
      'other',
    )
  })

  it('원문 줄 번호가 문자열 배열이 아니면 원문 없음(null)으로 둔다', () => {
    const result = parseDocumentResult(
      minimalBody({
        paragraphs: [{ id: 'p1', body: '문단', sourceLineIds: [1, 2] }],
      }),
    )

    expect(result.paragraphs[0].sourceLineIds).toBeNull()
  })

  it('꼭 확인하세요 · 해야할 일 · 더 알아보기가 오면 항목마다 확인한다', () => {
    const result = parseDocumentResult(
      minimalBody({
        mustCheck: [{ label: '기한', value: '11월 14일까지' }],
        todos: ['가입신고서 작성하기'],
        faqs: [{ question: '꼭 해야 하나요?', answer: '네.' }],
      }),
    )

    expect(result.mustCheck).toEqual([
      { label: '기한', value: '11월 14일까지' },
    ])
    expect(result.todos).toEqual(['가입신고서 작성하기'])
    expect(result.faqs).toHaveLength(1)
  })

  it('필수 항목이 없거나 모양이 다르면 INVALID_RESPONSE 를 던진다', () => {
    expectInvalid(null)
    expectInvalid(minimalBody({ title: undefined }))
    expectInvalid(minimalBody({ paragraphs: 'p1' }))
    expectInvalid(minimalBody({ paragraphs: [{ id: 'p1' }] }))
    expectInvalid(minimalBody({ sourceLines: [{ id: 'e1' }] }))
  })

  it('없어도 되는 목록이 배열이 아니거나 항목 모양이 다르면 INVALID_RESPONSE 를 던진다', () => {
    expectInvalid(minimalBody({ mustCheck: '기한' }))
    expectInvalid(minimalBody({ todos: [1] }))
    expectInvalid(minimalBody({ faqs: [{ question: '질문' }] }))
  })
})
