/*
 * 쉬운 본문 듣기에서 계산만 하는 부분 (src/routes/-result/use-paragraph-speech.ts 가 쓴다).
 * 브라우저 음성 합성(Web Speech API)은 기기마다 목소리 · 동작이 달라서, 무엇을 어떤 목소리로 읽을지를 여기서 정한다.
 */

/**
 * 글을 문장으로 나눈다. 크롬의 인터넷 목소리는 긴 글을 한 번에 읽다가 15초쯤에서 말없이 멈추는 문제가 있어 문장씩 읽는다.
 *
 * - 마침표 · 물음표 · 느낌표 뒤에 빈칸이 오는 곳과 줄바꿈에서 나눈다
 * - 숫자 뒤 마침표(2024. 11. 14. · 1. 첫째)는 날짜 · 번호라 나누지 않는다
 * - 빈 문장은 버린다
 */
export function splitSentences(text: string): string[] {
  const sentences: string[] = []
  let start = 0
  for (const match of text.matchAll(/[.?!…]+(?=\s)|\n/g)) {
    if (match[0] !== '\n' && /\d/.test(text[match.index - 1] ?? '')) continue
    const end = match.index + match[0].length
    sentences.push(text.slice(start, end))
    start = end
  }
  sentences.push(text.slice(start))
  return sentences.map((sentence) => sentence.trim()).filter(Boolean)
}

type Voice = Pick<
  SpeechSynthesisVoice,
  'name' | 'lang' | 'localService' | 'default'
>

// 애플 기기에 여러 언어로 같은 이름으로 들어 있는 기계음 목소리 (Eloquence). 크롬 · 사파리 목록에서 유나보다 앞에 온다
const roboticVoiceNames = [
  'Eddy',
  'Flo',
  'Grandma',
  'Grandpa',
  'Reed',
  'Rocko',
  'Sandy',
  'Shelley',
]

// 기기에서 따로 받는 좋은 목소리. 예: 맥 크롬의 "수현(고품질)", 영어 설정에서는 "Suhyun (Enhanced)"
const highQualityPattern = /고품질|프리미엄|enhanced|premium/i

function voiceRank(voice: Voice): number {
  if (roboticVoiceNames.some((name) => voice.name.startsWith(name))) return 0
  let rank = 1
  if (highQualityPattern.test(voice.name)) rank += 2
  if (voice.default) rank += 1
  return rank
}

/**
 * 기기 안 한국어 목소리 중 가장 알맞은 것. 없으면 undefined 이고, 그때는 읽지 않는다.
 *
 * 인터넷 목소리(localService: false, 예: PC 크롬의 "Google 한국의")는 읽을 글을 구글 · 마이크로소프트 서버로 보낸다.
 * 결과 글에는 이름 · 주소 같은 개인정보가 있어 쓰지 않는다 (AGENTS.md "개인정보 · 보안", 2026-09-18 Codex 리뷰).
 * 목소리를 비워 브라우저에 맡겨도 인터넷 목소리를 고를 수 있어, 고를 목소리가 없으면 읽지 않는 것이다.
 * 안드로이드 크롬은 목소리를 모두 기기 안(localService: true)으로 알려 준다.
 *
 * 순위: 고품질 > 기기 기본 목소리. 기계음 목소리는 다른 한국어 목소리가 없을 때만 쓴다.
 */
export function pickKoreanVoice<T extends Voice>(
  voices: readonly T[],
): T | undefined {
  let best: T | undefined
  for (const voice of voices) {
    if (!voice.localService) continue
    // 안드로이드 옛 크롬은 ko_KR 처럼 밑줄로 준다
    if (!/^ko([-_]|$)/i.test(voice.lang)) continue
    if (!best || voiceRank(voice) > voiceRank(best)) best = voice
  }
  return best
}
