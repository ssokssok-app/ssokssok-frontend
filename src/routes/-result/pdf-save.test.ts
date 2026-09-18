import { describe, expect, it } from 'vitest'

import { ApiError } from '@/api/errors'

import { pdfFileName, pdfSaveErrorCopy, savedLocationText } from './pdf-save'

describe('pdfFileName', () => {
  it('결과 제목을 파일 이름으로 쓴다', () => {
    expect(pdfFileName('국민연금 가입 신고가 필요해요')).toBe(
      '국민연금 가입 신고가 필요해요.pdf',
    )
  })

  it('파일 이름에 못 쓰는 글자는 빈칸으로 바꾸고 빈칸을 하나로 줄인다', () => {
    expect(pdfFileName('보증금/월세: 꼭 확인?  "계약서"')).toBe(
      '보증금 월세 꼭 확인 계약서.pdf',
    )
  })

  it('제목이 비었거나 못 쓰는 글자뿐이면 "쏙쏙 결과" 로 둔다', () => {
    expect(pdfFileName('')).toBe('쏙쏙 결과.pdf')
    expect(pdfFileName(' /:*? ')).toBe('쏙쏙 결과.pdf')
  })

  it('너무 긴 제목은 80자에서 자른다', () => {
    const name = pdfFileName('가'.repeat(100))
    expect(name).toBe(`${'가'.repeat(80)}.pdf`)
  })
})

describe('savedLocationText', () => {
  const iphone =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15'
  const ipad =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
  const android =
    'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 Chrome/128.0'

  it('아이폰은 "파일" 앱의 다운로드 폴더를 알려 준다', () => {
    expect(savedLocationText(iphone, 5)).toContain("'파일' 앱")
  })

  it('컴퓨터처럼 알려 오는 아이패드도 터치 화면이면 "파일" 앱이다', () => {
    expect(savedLocationText(ipad, 5)).toContain("'파일' 앱")
  })

  it('맥 컴퓨터 · 안드로이드는 다운로드 폴더를 알려 준다', () => {
    expect(savedLocationText(ipad, 0)).toBe(
      "'다운로드' 폴더에서\n다시 볼 수 있어요.",
    )
    expect(savedLocationText(android, 5)).toBe(
      "'다운로드' 폴더에서\n다시 볼 수 있어요.",
    )
  })
})

describe('pdfSaveErrorCopy', () => {
  it('결과 보관 시간(30분)이 지났으면 처음부터 다시 하라고 알린다', () => {
    for (const code of ['JOB_EXPIRED', 'JOB_NOT_FOUND']) {
      expect(pdfSaveErrorCopy(new ApiError({ code, message: '' })).title).toBe(
        '저장할 수 있는 시간이 지났어요',
      )
    }
  })

  it('그 밖의 오류 · 네트워크 오류는 다시 시도하라고 알린다', () => {
    expect(
      pdfSaveErrorCopy(new ApiError({ code: 'UNKNOWN', message: '' })).title,
    ).toBe('저장하지 못했어요')
    expect(pdfSaveErrorCopy(new TypeError('Failed to fetch')).title).toBe(
      '저장하지 못했어요',
    )
  })
})
