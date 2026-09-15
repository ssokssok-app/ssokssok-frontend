import type { DocumentResult } from '@/types/document-result'

/*
 * 촬영 · 첨부 변환 결과 목데이터. Figma "문서 인식 결과" 화면(94:2448)의 건강보험료 안내문을 그대로 옮겼다.
 * 지원하지 않는 문서 종류(other)라 꼭 확인하세요 · 해야할 일 · 더 알아보기가 없는(null) 경우를 보여 준다.
 * 원문은 Figma 에 없어 sourceLines 가 비어 있고, 원문 보기는 샘플(국민연금)로 확인한다.
 * 백엔드 변환 API 에 연결하면 이 파일은 지운다.
 */
export const mockConversionResult: DocumentResult = {
  kind: 'other',
  category: '안내문',
  title: '10월 1일부터 건강보험료를 직접 내야 할 수 있어요',
  summary:
    '지금은 가족의 건강보험 피부양자로 등록되어 있지만,\n10월 1일부터는 지역가입자로 변경될 예정이에요.',
  paragraphs: [
    {
      id: 'p1',
      title: null,
      body: '현재는 가족의 직장 건강보험에 함께 등록되어 있어서 건강보험료를 따로 내지 않고 있어요. 이런 상태를 ‘피부양자’라고 해요.',
      sourceLineIds: null,
    },
    {
      id: 'p2',
      title: null,
      body: '그런데 국민건강보험공단에서 소득과 재산 정보를 확인한 결과, 가족의 건강보험에 함께 등록될 수 있는 소득 기준을 넘은 것으로 확인됐어요.',
      sourceLineIds: null,
    },
    {
      id: 'p3',
      title: null,
      body: '그래서 2024년 10월 1일부터 가족의 건강보험에서 빠질 예정이에요. 이후에는 본인이 건강보험에 따로 가입하는 ‘지역가입자’로 바뀌어요.',
      sourceLineIds: null,
    },
    {
      id: 'p4',
      title: null,
      body: '지역가입자가 되면 건강보험료를 직접 내야 할 수 있어요. 내야 할 금액은 소득과 재산 등을 기준으로 계산하며, 정확한 금액은 나중에 별도의 안내문으로 알려드려요.',
      sourceLineIds: null,
    },
    {
      id: 'p5',
      title: null,
      body: '공단에서 확인한 소득과 재산 정보가 맞다면 지금 따로 해야 할 일은 없어요.',
      sourceLineIds: null,
    },
    {
      id: 'p6',
      title: null,
      body: '하지만 확인된 정보가 실제와 다르다고 생각한다면 국민건강보험공단에 문의해 주세요. 확인을 위해 소득이나 재산을 증명하는 서류가 필요할 수 있어요.',
      sourceLineIds: null,
    },
    {
      id: 'p7',
      title: null,
      body: '궁금한 점은 국민건강보험공단 고객센터 1577-1000으로 문의할 수 있어요.',
      sourceLineIds: null,
    },
  ],
  sourceLines: [],
  mustCheck: null,
  todos: null,
  faqs: null,
}
