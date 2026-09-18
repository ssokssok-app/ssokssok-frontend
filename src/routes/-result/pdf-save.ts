import { ApiError } from '@/api/errors'

/*
 * 결과 저장하기(PDF 내려받기)에서 계산만 하는 부분 (src/routes/-result/use-pdf-save.ts 가 쓴다).
 */

// 윈도우 · 맥 · 휴대폰에서 파일 이름에 쓸 수 없는 글자와 제어 문자
// oxlint-disable-next-line no-control-regex
const forbiddenFileNameChars = /[\\/:*?"<>|\x00-\x1f]/g
const MAX_NAME_LENGTH = 80

/** 저장할 PDF 파일 이름. 결과 제목을 쓰고, 파일 이름에 못 쓰는 글자는 빼며, 비면 "쏙쏙 결과" 로 둔다 */
export function pdfFileName(title: string): string {
  const name = title
    .replace(forbiddenFileNameChars, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim()
  return `${name || '쏙쏙 결과'}.pdf`
}

/**
 * 저장한 파일을 다시 찾는 곳 안내 (저장 완료 창의 설명).
 * 아이폰 · 아이패드는 "파일" 앱의 다운로드 폴더에 들어가고, 안드로이드 · 컴퓨터는 다운로드 폴더다.
 * 아이패드는 컴퓨터(Macintosh)처럼 알려 와서, 터치 화면인지로 가린다.
 */
export function savedLocationText(
  userAgent: string,
  maxTouchPoints: number,
): string {
  const isAppleMobile =
    /iPhone|iPad|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  return isAppleMobile
    ? "'파일' 앱의 '다운로드' 폴더에서\n다시 볼 수 있어요."
    : "'다운로드' 폴더에서\n다시 볼 수 있어요."
}

/**
 * 저장하지 못했을 때 알림 문구. 읽어야 하는 내용이라 모달로 띄운다.
 * 결과는 완료 뒤 30분만 서버에 있어서(JOB_EXPIRED), 그 뒤에는 다시 눌러도 안 되니 처음부터 다시 하라고 알린다.
 */
export function pdfSaveErrorCopy(error: unknown): {
  title: string
  description: string
} {
  if (
    error instanceof ApiError &&
    (error.code === 'JOB_EXPIRED' || error.code === 'JOB_NOT_FOUND')
  ) {
    return {
      title: '저장할 수 있는 시간이 지났어요',
      description: '결과는 잠시만 보관돼요.\n처음부터 다시 해주세요.',
    }
  }
  return {
    title: '저장하지 못했어요',
    description: '인터넷 연결을 확인하고\n다시 시도해주세요.',
  }
}
