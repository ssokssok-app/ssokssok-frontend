/**
 * 올리기 전에 사진을 줄인다 (docs/api-contract.md "업로드": 긴 변 2000px, JPEG 품질 80%).
 * 휴대폰 사진은 한 장에 수 MB 라, 줄이면 업로드가 빨라지고 배터리 · 데이터를 덜 쓴다.
 *
 * - 사진의 방향 정보(EXIF)를 반영해 그린다. 세로로 찍은 사진이 눕지 않는다
 * - PNG · HEIC 등 브라우저가 열 수 있는 사진은 모두 JPEG 로 바뀐다
 */
const MAX_EDGE = 2000
const JPEG_QUALITY = 0.8

export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('사진을 줄일 캔버스를 만들지 못했어요')
  }
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  if (!blob) throw new Error('사진을 JPEG 로 바꾸지 못했어요')

  const name = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}
