/**
 * 문서 변환 결과 (API 계약 초안).
 *
 * Figma 결과 화면이 필요로 하는 데이터를 프론트가 먼저 정한 모양이고, 백엔드가 이 모양을 기준으로 만들기로 했다.
 * 필드 이름 표기 · 원문 강조 단위가 정해지면 바뀔 수 있다. 설명과 남은 질문은 docs/api-contract.md 에 있다.
 */

/** 문서 종류. 결과 화면 맨 위 일러스트와 기본 이름표를 정한다. 지원하지 않는 문서는 basic */
export type DocumentKind =
  'work-contract' | 'house-contract' | 'notice' | 'fine' | 'basic'

export interface DocumentResult {
  kind: DocumentKind
  /** 이름표 (계약서, 안내문 …). 없으면 문서 종류의 기본 이름을 쓴다 */
  category?: string
  /** 한 줄 요약 제목. 예: "국민연금 가입 신고가 필요해요" */
  title: string
  /** 제목 아래 설명. 줄바꿈(\n)을 그대로 보여 준다 */
  summary: string
  /** 쉬운 본문 문단들 */
  paragraphs: ResultParagraph[]
  /** 꼭 확인하세요. 이 문서 종류에서 만들 수 없으면 null */
  mustCheck: MustCheckItem[] | null
  /** 해야할 일. 이 문서 종류에서 만들 수 없으면 null */
  todos: string[] | null
  /** 더 알아보기 (자주 묻는 질문). 만들 수 없으면 null */
  faqs: FaqEntry[] | null
}

export interface ResultParagraph {
  /** 소제목. 소제목이 없는 문서는 null (백엔드 답변) */
  title?: string | null
  body: string
  /** 이 문단을 만든 원문 부분. 찾지 못했으면 null (원문 보기를 띄우지 않는다) */
  source: SourceParagraph[] | null
}

/** 원문의 한 문단. 여러 조각으로 나눠 이 쉬운 문단과 관련된 조각만 강조한다 */
export type SourceParagraph = SourceSegment[]

export interface SourceSegment {
  text: string
  /** 선택한 쉬운 문단과 직접 관련된 부분이면 true */
  highlighted: boolean
}

export interface MustCheckItem {
  /** 파란 이름표. 예: "기한" */
  label: string
  /** 내용. 줄바꿈(\n)을 그대로 보여 준다 */
  value: string
}

export interface FaqEntry {
  question: string
  answer: string
}
