import { ApiError } from '@/api/errors'
import { MAX_PAGES } from '@/hooks/useDocumentDraft'

/**
 * 변환 오류를 화면 문구와 버튼으로 바꾼다 (docs/api-contract.md "백엔드에 보낼 제안" 5번).
 *
 * 화면 문구는 서버 message 를 쓰지 않고 code 로 여기서 정한다. 주 사용자가 읽을 문구라 쉬운 말인지 한곳에서 검토하고,
 * 서버 문구가 영어 · 내부 표현이어도 화면에 나오지 않게 하기 위해서다. 모르는 code · 네트워크 오류는 기본 문구를 쓴다.
 */

interface ConversionErrorCopy {
  title: string
  description: string
  /** 다시 골라야 해결되는 오류. 같은 파일로 다시 시도하지 않고 홈으로 보낸다 */
  needsReselect: boolean
}

const fallbackCopy: ConversionErrorCopy = {
  title: '문서를 읽지 못했어요',
  description: '잠시 뒤에 다시 시도해주세요.',
  needsReselect: false,
}

const copyByCode: Record<string, ConversionErrorCopy> = {
  UNSUPPORTED_FORMAT: {
    title: '올릴 수 없는 파일이에요',
    description: '사진이나 PDF 파일을 골라주세요.',
    needsReselect: true,
  },
  FILE_TOO_LARGE: {
    title: '파일이 너무 커요',
    description: '더 작은 파일을 골라주세요.',
    needsReselect: true,
  },
  TOO_MANY_FILES: {
    title: '사진이 너무 많아요',
    description: `사진은 ${MAX_PAGES}장까지 올릴 수 있어요.`,
    needsReselect: true,
  },
  IMAGE_UNREADABLE: {
    title: '글자를 읽을 수 없어요',
    description:
      '사진이 흐리거나 문서가 아닌 것 같아요.\n문서를 다시 찍어주세요.',
    needsReselect: true,
  },
  UNAUTHORIZED: {
    title: '로그인이 필요해요',
    description: '홈에서 다시 로그인해주세요.',
    needsReselect: true,
  },
  JOB_NOT_FOUND: {
    title: '결과를 찾을 수 없어요',
    description: '처음부터 다시 해주세요.',
    needsReselect: true,
  },
  JOB_EXPIRED: {
    title: '결과가 사라졌어요',
    description: '결과는 잠시만 보관돼요.\n처음부터 다시 해주세요.',
    needsReselect: true,
  },
  TIMEOUT: {
    title: '시간이 너무 오래 걸렸어요',
    description: '잠시 뒤에 다시 시도해주세요.',
    needsReselect: false,
  },
  CANCELED: {
    title: '문서 읽기가 멈췄어요',
    description: '다시 시도해주세요.',
    needsReselect: false,
  },
}

export function getConversionErrorCopy(error: unknown): ConversionErrorCopy {
  if (!(error instanceof ApiError)) return fallbackCopy
  return copyByCode[error.code] ?? fallbackCopy
}
