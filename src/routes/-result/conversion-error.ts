import { ApiError } from '@/api/errors'
import { MAX_PAGES } from '@/hooks/useDocumentDraft'

/**
 * 변환 오류를 화면 문구와 버튼으로 바꾼다 (docs/api-contract.md "백엔드에 보낼 제안" 5번).
 *
 * 화면 문구는 서버 message 를 쓰지 않고 code 로 여기서 정한다. 주 사용자가 읽을 문구라 쉬운 말인지 한곳에서 검토하고,
 * 서버 문구가 영어 · 내부 표현이어도 화면에 나오지 않게 하기 위해서다. 모르는 code · 네트워크 오류는 기본 문구를 쓴다.
 */

/**
 * 오류 화면에서 다음에 할 일.
 * - retake: 다른 사진 · 파일로 다시 해야 해결된다. 같은 방법(촬영 · 사진첩 · 파일)으로 다시 고르러 간다
 * - home: 다시 골라도 안 되는 오류(로그인 · 횟수 · 결과 만료). 홈으로만 보낸다
 * - retry: 같은 파일로 다시 시도하면 될 수 있다
 */
export type ConversionErrorNext = 'retake' | 'home' | 'retry'

interface ConversionErrorCopy {
  title: string
  description: string
  next: ConversionErrorNext
}

const fallbackCopy: ConversionErrorCopy = {
  title: '문서를 읽지 못했어요',
  description: '잠시 뒤에 다시 시도해주세요.',
  next: 'retry',
}

/** 오늘 변환 횟수를 다 썼을 때. 홈에서 미리 막을 때와 서버가 막았을 때(RATE_LIMITED) 같은 문구를 쓴다 */
export const USAGE_LIMIT_NOTICE = {
  title: '오늘 이용 횟수를 모두 썼어요',
  description: '내일 다시 이용해주세요.',
}

/** 글자를 못 읽었거나 무슨 문서인지 모를 때. 둘 다 문서를 다시 찍으면 해결돼 Figma "에러창 - 인식오류"(230:4942) 한 화면을 쓴다 */
const unrecognizedCopy: ConversionErrorCopy = {
  title: '문서를 정확하게 읽지 못했어요',
  description: '글자가 잘 보이도록\n문서 전체를 다시 촬영해주세요.',
  next: 'retake',
}

const loginRequiredCopy: ConversionErrorCopy = {
  title: '로그인이 필요해요',
  description: '홈에서 다시 로그인해주세요.',
  next: 'home',
}

const copyByCode: Record<string, ConversionErrorCopy> = {
  UNSUPPORTED_FORMAT: {
    title: '올릴 수 없는 파일이에요',
    description: '사진이나 PDF 파일을 골라주세요.',
    next: 'retake',
  },
  FILE_TOO_LARGE: {
    title: '파일이 너무 커요',
    description: '더 작은 파일을 골라주세요.',
    next: 'retake',
  },
  TOO_MANY_FILES: {
    title: '사진이 너무 많아요',
    description: `사진은 ${MAX_PAGES}장까지 올릴 수 있어요.`,
    next: 'retake',
  },
  IMAGE_UNREADABLE: unrecognizedCopy,
  DOCUMENT_UNRECOGNIZED: unrecognizedCopy,
  // Figma "에러창 - 종류" (230:4890)
  MIXED_DOCUMENT_TYPE: {
    title: '한 종류의 문서만 넣어주세요',
    description: '서로 다른 문서를 함께 넣으면\n정확하게 읽기 어려워요.',
    next: 'retake',
  },
  UNAUTHORIZED: loginRequiredCopy,
  // 갱신한 토큰으로도 거절된 경우 (src/api/client.ts)
  TOKEN_EXPIRED: loginRequiredCopy,
  // 다른 기기 · 탭에서 먼저 다 써서 홈의 남은 횟수가 옛 값이었던 경우
  RATE_LIMITED: { ...USAGE_LIMIT_NOTICE, next: 'home' },
  JOB_NOT_FOUND: {
    title: '결과를 찾을 수 없어요',
    description: '처음부터 다시 해주세요.',
    next: 'home',
  },
  JOB_EXPIRED: {
    title: '결과가 사라졌어요',
    description: '결과는 잠시만 보관돼요.\n처음부터 다시 해주세요.',
    next: 'home',
  },
  TIMEOUT: {
    title: '시간이 너무 오래 걸렸어요',
    description: '잠시 뒤에 다시 시도해주세요.',
    next: 'retry',
  },
  CANCELED: {
    title: '문서 읽기가 멈췄어요',
    description: '다시 시도해주세요.',
    next: 'retry',
  },
}

export function getConversionErrorCopy(error: unknown): ConversionErrorCopy {
  if (!(error instanceof ApiError)) return fallbackCopy
  return copyByCode[error.code] ?? fallbackCopy
}
