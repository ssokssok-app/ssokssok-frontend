import type { ResultParagraph, SourceLine } from '@/types/document-result'

/** 원문 발췌의 한 조각. 강조 여부가 같은 이웃 줄은 하나로 합쳐져 있다 */
export interface SourceExcerptSegment {
  text: string
  /** 선택한 쉬운 문단을 만든 줄이면 true */
  highlighted: boolean
}

/** 원문 발췌. 묶음 하나가 화면의 원문 문단 하나다. 강조 구간이 멀리 떨어져 있으면 묶음이 여러 개다 */
export type SourceExcerpt = SourceExcerptSegment[][]

/** 강조한 줄 앞뒤로 강조 없이 함께 보여 주는 줄 수 (docs/product.md "결과 화면") */
const CONTEXT_LINES = 2

/**
 * 쉬운 문단의 원문 발췌를 만든다 (docs/api-contract.md "3. 결과 데이터").
 *
 * - 문단이 가리키는 원문 줄(sourceLineIds)을 강조하고, 읽는 흐름을 위해 앞뒤 줄을 강조 없이 같이 준다
 * - 가리키는 줄이 하나도 없으면 null 이다 (원문 보기를 띄우지 않는다). AI 가 없는 id 를 적을 수 있어 실제로 있는 줄만 센다
 * - 강조 줄이 앞뒤 줄로 이어지지 않을 만큼 멀면 묶음을 나눈다. 사이의 줄은 이 문단과 상관없어 보여 주지 않는다
 * - 원문 줄은 사진의 한 줄이라 짧다. 줄마다 따로 보여 주면 끊겨 읽혀서, 강조 여부가 같은 이웃 줄은 한 조각으로 잇는다
 */
export function getSourceExcerpt(
  sourceLines: SourceLine[],
  paragraph: ResultParagraph,
): SourceExcerpt | null {
  const ids = new Set(paragraph.sourceLineIds)
  const highlightedIndexes = sourceLines.flatMap((line, index) =>
    ids.has(line.id) ? [index] : [],
  )
  if (highlightedIndexes.length === 0) return null

  // 앞뒤 줄끼리 맞닿거나 겹치는 강조 줄은 한 묶음이다
  const groups: { first: number; last: number }[] = []
  for (const index of highlightedIndexes) {
    const current = groups.at(-1)
    if (current && index - current.last <= CONTEXT_LINES * 2 + 1) {
      current.last = index
    } else {
      groups.push({ first: index, last: index })
    }
  }

  return groups.map(({ first, last }) =>
    toSegments(
      sourceLines.slice(
        Math.max(0, first - CONTEXT_LINES),
        last + 1 + CONTEXT_LINES,
      ),
      ids,
    ),
  )
}

function toSegments(lines: SourceLine[], ids: Set<string>) {
  const segments: SourceExcerptSegment[] = []
  for (const line of lines) {
    const highlighted = ids.has(line.id)
    const previous = segments.at(-1)
    if (previous?.highlighted === highlighted) {
      previous.text += ` ${line.text}`
    } else {
      segments.push({ text: line.text, highlighted })
    }
  }
  return segments
}
