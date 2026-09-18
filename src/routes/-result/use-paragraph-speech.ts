import { useEffect, useRef, useState } from 'react'

import type { ListeningSpeed } from '@/components/listening-popover'
import { useScreenWakeLock } from '@/hooks/useScreenWakeLock'
import type { ResultParagraph } from '@/types/document-result'

import { pickKoreanVoice, splitSentences } from './paragraph-speech'

// 목소리 속도. 브라우저 기본 1 을 "보통" 으로 두고, 느림은 또박또박 들리게 더 늦추고 빠름은 덜 빠르게 했다 (2026-09-18 회의)
const rates: Record<ListeningSpeed, number> = {
  slow: 0.6,
  normal: 1,
  fast: 1.2,
}

// 크롬은 목소리 목록을 처음 물어본 뒤에 채운다. 채워지기 전에 누르면 이만큼 기다린 뒤 정한다
const VOICES_WAIT_MS = 1000

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const { speechSynthesis } = window
  return new Promise((resolve) => {
    function done() {
      clearTimeout(timer)
      speechSynthesis.removeEventListener('voiceschanged', done)
      resolve(speechSynthesis.getVoices())
    }
    const timer = setTimeout(done, VOICES_WAIT_MS)
    speechSynthesis.addEventListener('voiceschanged', done)
  })
}

/** 읽고 있거나 읽을 차례가 남았을 때만 멈춘다. 사파리는 아무것도 없을 때 멈춘 직후의 새 읽기를 놓치기도 한다 */
function cancelSpeech() {
  const { speechSynthesis } = window
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel()
  }
}

/**
 * 쉬운 본문 듣기. 기기에 들어 있는 음성(브라우저 음성 합성, Web Speech API)으로 문단을 차례로 읽는다.
 *
 * - 요금 때문에 서버 음성(네이버 클로바) 대신 기기 음성을 쓴다 (2026-09-18 회의, docs/product.md "결과 화면")
 * - 문단을 문장씩 나눠 읽고, 지금 읽는 문단 번호를 화면에 알려 준다 (크롬은 긴 글 하나를 읽다가 멈추는 문제가 있다)
 * - 목소리는 기기 안 한국어 목소리 중에서 고른다 (src/routes/-result/paragraph-speech.ts). 인터넷 목소리는 결과 글(개인정보)이
 *   구글 등으로 나가서 쓰지 않고, 기기 안 목소리가 없으면 읽지 않고 onUnavailable 로 알린다. 버튼은 숨기지 않는다 (2026-09-18 사용자와 정함)
 * - 읽는 동안은 휴대폰 화면이 저절로 꺼지지 않게 한다. 꺼지면 아이폰은 읽기를 멈춘다
 * - 다른 앱으로 가거나 화면을 끄면 멈춘다. 사파리는 이때 읽기를 말없이 멈춰서, 그대로 두면 정지 버튼만 남는다
 * - 화면이 사라지면 소리를 멈춘다
 */
export function useParagraphSpeech(
  paragraphs: ResultParagraph[],
  { onUnavailable }: { onUnavailable: () => void },
) {
  const [readingIndex, setReadingIndex] = useState<number | null>(null)
  // 시작 · 멈춤마다 늘린다. 멈춘 읽기의 끝 이벤트가 다음 문장을 이어서 읽지 않게 하는 표시다
  const sessionRef = useRef(0)
  // 읽는 중인 문장을 붙잡아 둔다. 크롬 · 사파리는 붙잡는 곳이 없으면 읽는 도중에 치워 버려 끝 이벤트가 오지 않는다
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const supported = 'speechSynthesis' in window
  const isReading = readingIndex !== null

  useScreenWakeLock(isReading)

  function stop() {
    sessionRef.current += 1
    utteranceRef.current = null
    cancelSpeech()
    setReadingIndex(null)
  }

  /**
   * 처음부터 읽는다. 목소리 목록이 이미 있으면 누른 자리에서 바로 읽는다 (아이폰은 누른 순간에 시작해야 소리가 난다).
   * 목록이 비어 있으면(크롬이 아직 채우는 중) 잠깐 기다린 뒤 정한다.
   */
  function start(speed: ListeningSpeed) {
    stop()
    const session = sessionRef.current
    function begin(voices: SpeechSynthesisVoice[]) {
      const voice = pickKoreanVoice(voices)
      if (voice) read(session, voice, speed)
      else onUnavailable()
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      begin(voices)
      return
    }
    void waitForVoices().then((loaded) => {
      if (session === sessionRef.current) begin(loaded)
    })
  }

  function read(
    session: number,
    voice: SpeechSynthesisVoice,
    speed: ListeningSpeed,
  ) {
    // 문단 번호를 붙인 문장 목록. 소제목도 한 문장으로 먼저 읽는다
    const sentences = paragraphs.flatMap((paragraph, index) =>
      [
        ...(paragraph.title ? [paragraph.title] : []),
        ...splitSentences(paragraph.body),
      ].map((text) => ({ index, text })),
    )

    function speak(position: number) {
      if (session !== sessionRef.current) return
      const sentence = sentences[position]
      if (!sentence) {
        utteranceRef.current = null
        setReadingIndex(null)
        return
      }
      const utterance = new SpeechSynthesisUtterance(sentence.text)
      utterance.lang = 'ko-KR'
      utterance.voice = voice
      utterance.rate = rates[speed]
      utterance.onend = () => speak(position + 1)
      utterance.onerror = () => {
        if (session === sessionRef.current) stop()
      }
      utteranceRef.current = utterance
      setReadingIndex(sentence.index)
      window.speechSynthesis.speak(utterance)
    }

    speak(0)
  }

  useEffect(() => {
    if (!isReading) return
    // stop() 과 같은 일이다. stop 은 렌더마다 새로 만들어져 의존성에 넣지 않고 여기서 직접 한다
    function stopWhenHidden() {
      if (document.visibilityState !== 'hidden') return
      sessionRef.current += 1
      utteranceRef.current = null
      cancelSpeech()
      setReadingIndex(null)
    }
    document.addEventListener('visibilitychange', stopWhenHidden)
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden)
    }
  }, [isReading])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    // 크롬은 목록을 처음 물어볼 때 목소리를 불러오기 시작한다. 듣기를 누르기 전에 미리 불러 둔다
    window.speechSynthesis.getVoices()
    return () => {
      sessionRef.current += 1
      utteranceRef.current = null
      cancelSpeech()
    }
  }, [])

  return {
    supported,
    readingIndex,
    isReading,
    start,
    stop,
  }
}
