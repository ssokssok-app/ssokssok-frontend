/**
 * 문서 변환 결과. 백엔드 응답(Swagger 의 `DocumentResult`)과 필드 이름 · 모양을 1:1 로 맞춘다 (docs/api-contract.md "3. 결과 데이터").
 * 샘플 결과도 같은 모양이다. 화면이 쓰기 좋게 가공하는 일(원문 발췌 등)은 여기가 아니라 화면 쪽(src/routes/-result/)에서 한다.
 */

/** 문서 종류 코드. 결과 화면 맨 위 일러스트를 정한다. 지원하지 않는 문서는 other */
export type DocumentKind =
  'labor_contract' | 'lease_contract' | 'fine' | 'notice' | 'other'

export interface DocumentResult {
  kind: DocumentKind
  /** 이름표. 근로계약서 · 임대차계약서 · 과태료 · 안내문 · 그 외 */
  category: string
  /** 한 줄 요약 제목. 예: "국민연금 가입 신고가 필요해요" */
  title: string
  /** 제목 아래 설명 (1~2문장). 줄바꿈(\n)을 그대로 보여 준다 */
  summary: string
  /** 쉬운 본문 문단들. 원문 순서 그대로다 */
  paragraphs: ResultParagraph[]
  /** OCR 로 읽은 원문 줄 목록. 문단의 sourceLineIds 가 이 목록의 id 를 가리킨다 */
  sourceLines: SourceLine[]
  /** 꼭 확인하세요. 지원하지 않는 문서 종류(other)면 null */
  mustCheck: MustCheckItem[] | null
  /** 해야할 일. 지원하지 않는 문서 종류면 null */
  todos: string[] | null
  /** 더 알아보기 (자주 묻는 질문). 지원하지 않는 문서 종류면 null */
  faqs: FaqEntry[] | null
}

export interface ResultParagraph {
  /** p1, p2, … */
  id: string
  /** 원문에 있는 소제목. 소제목이 없는 문서는 null */
  title: string | null
  body: string
  /** 이 문단을 만든 원문 줄의 id 목록. 원문을 찾지 못했으면 null (원문 보기를 띄우지 않는다) */
  sourceLineIds: string[] | null
}

/** OCR 로 읽은 원문 한 줄 (사진에서 눈으로 보는 한 줄). id 는 e1, e2, … */
export interface SourceLine {
  id: string
  text: string
}

export interface MustCheckItem {
  /** 파란 이름표. 예: "기한" */
  label: string
  /** 내용. 줄바꿈(\n)을 그대로 보여 준다 */
  value: string
}

/** 백엔드 이름은 FaqItem 이지만, 같은 이름의 컴포넌트(src/components/faq.tsx)와 헷갈리지 않게 Entry 로 둔다 */
export interface FaqEntry {
  question: string
  answer: string
}
