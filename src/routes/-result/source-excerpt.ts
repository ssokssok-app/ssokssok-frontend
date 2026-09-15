import type { ResultParagraph, SourceLine } from '@/types/document-result'

/** 원문 발췌의 한 조각. 강조 여부가 같은 이웃 줄은 하나로 합쳐져 있다 */
export interface SourceExcerptSegment {
  text: string
  /** 선택한 쉬운 문단을 만든 줄이면 true */
  highlighted: boolean
}

/** 강조한 줄 앞뒤로 강조 없이 함께 보여 주는 줄 수 (docs/product.md "결과 화면") */
const CONTEXT_LINES = 2

/**
 * 쉬운 문단의 원문 발췌를 만든다 (docs/api-contract.md "3. 결과 데이터").
 *
 * - 문단이 가리키는 원문 줄(sourceLineIds)을 강조하고, 읽는 흐름을 위해 앞뒤 줄을 강조 없이 같이 준다
 * - 가리키는 줄이 하나도 없으면 null 이다 (원문 보기를 띄우지 않는다). AI 가 없는 id 를 적을 수 있어 실제로 있는 줄만 센다
 * - 원문 줄은 사진의 한 줄이라 짧다. 줄마다 따로 보여 주면 끊겨 읽혀서, 강조 여부가 같은 이웃 줄은 한 조각으로 잇는다
 */
export function getSourceExcerpt(
  sourceLines: SourceLine[],
  paragraph: ResultParagraph,
): SourceExcerptSegment[] | null {
  const ids = new Set(paragraph.sourceLineIds)
  let first = -1
  let last = -1
  sourceLines.forEach((line, index) => {
    if (!ids.has(line.id)) return
    if (first === -1) first = index
    last = index
  })
  if (first === -1) return null

  const segments: SourceExcerptSegment[] = []
  for (const line of sourceLines.slice(
    Math.max(0, first - CONTEXT_LINES),
    last + 1 + CONTEXT_LINES,
  )) {
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
