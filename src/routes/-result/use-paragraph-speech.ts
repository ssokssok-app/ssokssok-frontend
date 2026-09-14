import { useEffect, useRef, useState } from 'react'

import type { ListeningSpeed } from '@/components/listening-popover'
import type { ResultParagraph } from '@/types/document-result'

// 목소리 속도. 브라우저 기본 1 을 "보통" 으로 두고 위아래로 조금씩 벌렸다
const rates: Record<ListeningSpeed, number> = {
  slow: 0.8,
  normal: 1,
  fast: 1.3,
}

/**
 * 쉬운 본문 듣기. 브라우저 음성 합성(Web Speech API)으로 문단을 차례로 읽는다.
 *
 * - 실제 음성은 네이버 클로바를 백엔드를 거쳐 쓰기로 정했다 (docs/api-contract.md "듣기 · 저장하기").
 *   API 가 나오기 전까지의 임시 구현이라, 바뀌면 이 파일 안만 고치고 화면은 그대로 둔다
 * - 문단마다 따로 읽어서, 지금 읽는 문단 번호를 화면에 알려 준다 (크롬은 긴 글 하나를 읽다가 멈추는 문제도 있다)
 * - 화면이 사라지면 소리를 멈춘다
 */
export function useParagraphSpeech(paragraphs: ResultParagraph[]) {
  const [readingIndex, setReadingIndex] = useState<number | null>(null)
  // 시작 · 멈춤마다 늘린다. 멈춘 읽기의 끝 이벤트가 다음 문단을 이어서 읽지 않게 하는 표시다
  const sessionRef = useRef(0)
  const supported = 'speechSynthesis' in window

  function stop() {
    sessionRef.current += 1
    window.speechSynthesis.cancel()
    setReadingIndex(null)
  }

  function start(speed: ListeningSpeed) {
    stop()
    const session = sessionRef.current

    function speak(index: number) {
      if (session !== sessionRef.current) return
      const paragraph = paragraphs[index]
      if (!paragraph) {
        setReadingIndex(null)
        return
      }
      const utterance = new SpeechSynthesisUtterance(
        paragraph.title
          ? `${paragraph.title}. ${paragraph.body}`
          : paragraph.body,
      )
      utterance.lang = 'ko-KR'
      utterance.rate = rates[speed]
      utterance.onend = () => speak(index + 1)
      utterance.onerror = () => {
        if (session === sessionRef.current) setReadingIndex(null)
      }
      setReadingIndex(index)
      window.speechSynthesis.speak(utterance)
    }

    speak(0)
  }

  useEffect(() => {
    return () => {
      sessionRef.current += 1
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  return {
    supported,
    readingIndex,
    isReading: readingIndex !== null,
    start,
    stop,
  }
}
