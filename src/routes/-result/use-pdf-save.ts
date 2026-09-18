import { useRef, useState } from 'react'

import { downloadBlob } from '@/lib/download'

import { pdfFileName, pdfSaveErrorCopy, savedLocationText } from './pdf-save'

interface PdfSaveNotice {
  title: string
  description: string
  failed: boolean
}

/**
 * 결과 저장하기. 서버가 만든 PDF 를 받아 기기에 내려받고, 저장한 파일을 다시 찾는 곳을 모달로 알려 준다
 * (docs/product.md "결과 화면"). 어떤 PDF 를 받을지(촬영 결과 · 샘플)는 페이지가 fetchPdf 로 정한다.
 *
 * - 받는 동안 다시 누르면 무시한다. 여러 번 눌러 파일이 여러 개 생기지 않게 한다
 * - 실패하면 무엇이 안 됐는지 모달로 알린다. 읽어야 하는 내용이라 Toast 가 아니다
 */
export function usePdfSave(fetchPdf: () => Promise<Blob>, title: string) {
  const savingRef = useRef(false)
  // 닫히는 동안에도 문구가 보이도록 내용과 열림을 따로 둔다
  const [notice, setNotice] = useState<PdfSaveNotice | null>(null)
  const [noticeOpen, setNoticeOpen] = useState(false)

  async function save() {
    if (savingRef.current) return
    savingRef.current = true
    try {
      const pdf = await fetchPdf()
      downloadBlob(pdf, pdfFileName(title))
      setNotice({
        title: 'PDF 파일로 저장했어요',
        description: savedLocationText(
          navigator.userAgent,
          navigator.maxTouchPoints,
        ),
        failed: false,
      })
    } catch (error) {
      setNotice({ ...pdfSaveErrorCopy(error), failed: true })
    } finally {
      savingRef.current = false
    }
    setNoticeOpen(true)
  }

  return { save, notice, noticeOpen, setNoticeOpen }
}
