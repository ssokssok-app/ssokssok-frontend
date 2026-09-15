import { describe, expect, it } from 'vitest'

import type { ResultParagraph, SourceLine } from '@/types/document-result'

import { getSourceExcerpt } from './source-excerpt'

/** 원문 줄 e1 ~ e{count}. 글자는 "줄1" 처럼 번호로 둔다 */
function makeLines(count: number): SourceLine[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `e${index + 1}`,
    text: `줄${index + 1}`,
  }))
}

function paragraphOf(sourceLineIds: string[] | null): ResultParagraph {
  return { id: 'p1', title: null, body: '쉬운 문단', sourceLineIds }
}

describe('getSourceExcerpt', () => {
  const lines = makeLines(9)

  it('강조한 줄 앞뒤 2줄을 강조 없이 함께 보여 준다', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e5']))

    expect(excerpt?.groups).toEqual([
      [
        { text: '줄3 줄4', highlighted: false },
        { text: '줄5', highlighted: true },
        { text: '줄6 줄7', highlighted: false },
      ],
    ])
    expect(excerpt?.hasMoreBefore).toBe(true)
    expect(excerpt?.hasMoreAfter).toBe(true)
  })

  it('이웃한 강조 줄은 한 조각으로 잇는다', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e4', 'e5']))

    expect(excerpt?.groups[0]).toContainEqual({
      text: '줄4 줄5',
      highlighted: true,
    })
  })

  it('강조가 원문 맨 처음이면 앞에 더 있는 줄이 없다 (위를 흐리지 않음)', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e1']))

    expect(excerpt?.groups[0][0]).toEqual({ text: '줄1', highlighted: true })
    expect(excerpt?.hasMoreBefore).toBe(false)
    expect(excerpt?.hasMoreAfter).toBe(true)
  })

  it('강조가 원문 맨 끝이면 뒤에 더 있는 줄이 없다 (아래를 흐리지 않음)', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e9']))

    expect(excerpt?.groups[0].at(-1)).toEqual({
      text: '줄9',
      highlighted: true,
    })
    expect(excerpt?.hasMoreBefore).toBe(true)
    expect(excerpt?.hasMoreAfter).toBe(false)
  })

  it('앞 줄이 2줄보다 적어도 있는 만큼만 보여 준다', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e2']))

    expect(excerpt?.groups[0][0]).toEqual({ text: '줄1', highlighted: false })
    expect(excerpt?.hasMoreBefore).toBe(false)
  })

  it('강조 줄이 앞뒤 줄로 이어지지 않을 만큼 멀면 묶음을 나누고 사이 줄은 뺀다', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e1', 'e9']))

    expect(excerpt?.groups).toEqual([
      [
        { text: '줄1', highlighted: true },
        { text: '줄2 줄3', highlighted: false },
      ],
      [
        { text: '줄7 줄8', highlighted: false },
        { text: '줄9', highlighted: true },
      ],
    ])
    expect(excerpt?.hasMoreBefore).toBe(false)
    expect(excerpt?.hasMoreAfter).toBe(false)
  })

  it('앞뒤 줄이 맞닿는 강조 줄은 한 묶음이다', () => {
    const excerpt = getSourceExcerpt(lines, paragraphOf(['e3', 'e8']))

    expect(excerpt?.groups).toHaveLength(1)
  })

  it('원문이 짧아 앞뒤가 모두 들어가면 흐릴 쪽이 없다', () => {
    const excerpt = getSourceExcerpt(makeLines(3), paragraphOf(['e2']))

    expect(excerpt?.hasMoreBefore).toBe(false)
    expect(excerpt?.hasMoreAfter).toBe(false)
  })

  it('가리키는 줄이 없거나 없는 id 만 있으면 null 이다', () => {
    expect(getSourceExcerpt(lines, paragraphOf(null))).toBeNull()
    expect(getSourceExcerpt(lines, paragraphOf([]))).toBeNull()
    expect(getSourceExcerpt(lines, paragraphOf(['e99']))).toBeNull()
  })
})
