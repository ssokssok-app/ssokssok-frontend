export interface ParagraphSearch {
  /** 원문 보기로 연 쉬운 문단 번호. 주소에 두어 휴대폰 뒤로 가기로 닫히게 한다 */
  paragraph?: number
}

/** 결과 화면 라우트의 validateSearch. 0 이상의 정수가 아니면 원문 보기를 열지 않는다 */
export function parseParagraphSearch(
  search: Record<string, unknown>,
): ParagraphSearch {
  const { paragraph } = search
  return typeof paragraph === 'number' &&
    Number.isInteger(paragraph) &&
    paragraph >= 0
    ? { paragraph }
    : {}
}
