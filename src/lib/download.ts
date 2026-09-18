// 사파리(아이폰)는 "다운로드할까요?" 를 묻는 동안에도 이 주소를 쓸 수 있어, 바로 지우지 않고 넉넉히 둔다
const REVOKE_AFTER_MS = 5 * 60_000

/**
 * 받은 파일을 기기에 내려받는다 (`<a download>`).
 * 휴대폰 · 컴퓨터 모두 다운로드 폴더에 들어가고, 아이폰은 "파일" 앱의 다운로드 폴더다.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // 문서에 붙어 있지 않은 링크는 누르기가 무시되는 브라우저가 있어 잠깐 붙였다 뗀다
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS)
}
