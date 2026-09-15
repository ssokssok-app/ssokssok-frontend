import { describe, expect, it } from 'vitest'

import { ApiError } from '@/api/errors'

import { getConversionErrorCopy, USAGE_LIMIT_NOTICE } from './conversion-error'

function copyOf(code: string) {
  return getConversionErrorCopy(new ApiError({ code, message: '서버 문구' }))
}

describe('getConversionErrorCopy', () => {
  it('종류가 섞인 문서는 한 종류만 넣으라고 알리고 다시 찍게 한다', () => {
    expect(copyOf('MIXED_DOCUMENT_TYPE')).toMatchObject({
      title: '한 종류의 문서만 넣어주세요',
      next: 'retake',
    })
  })

  it('글자를 못 읽음과 무슨 문서인지 모름은 같은 인식오류 화면이다', () => {
    const unreadable = copyOf('IMAGE_UNREADABLE')

    expect(unreadable).toMatchObject({
      title: '문서를 정확하게 읽지 못했어요',
      next: 'retake',
    })
    expect(copyOf('DOCUMENT_UNRECOGNIZED')).toEqual(unreadable)
  })

  it('다시 골라도 안 되는 오류는 홈으로만 보낸다', () => {
    for (const code of [
      'UNAUTHORIZED',
      'TOKEN_EXPIRED',
      'JOB_NOT_FOUND',
      'JOB_EXPIRED',
    ]) {
      expect(copyOf(code).next, code).toBe('home')
    }
  })

  it('오늘 횟수를 다 쓰면 홈에서 막을 때와 같은 문구로 홈으로 보낸다', () => {
    expect(copyOf('RATE_LIMITED')).toEqual({
      ...USAGE_LIMIT_NOTICE,
      next: 'home',
    })
  })

  it('파일을 다시 골라야 하는 오류는 다시 고르게 한다', () => {
    for (const code of [
      'UNSUPPORTED_FORMAT',
      'FILE_TOO_LARGE',
      'TOO_MANY_FILES',
    ]) {
      expect(copyOf(code).next, code).toBe('retake')
    }
  })

  it('같은 파일로 다시 해 볼 수 있는 오류는 다시 시도하게 한다', () => {
    expect(copyOf('TIMEOUT').next).toBe('retry')
    expect(copyOf('CANCELED').next).toBe('retry')
  })

  it('모르는 code 와 네트워크 오류는 기본 문구로 다시 시도하게 한다', () => {
    const fallback = {
      title: '문서를 읽지 못했어요',
      description: '잠시 뒤에 다시 시도해주세요.',
      next: 'retry',
    }

    expect(copyOf('SOMETHING_NEW')).toEqual(fallback)
    expect(getConversionErrorCopy(new TypeError('Failed to fetch'))).toEqual(
      fallback,
    )
  })

  it('서버 message 를 화면 문구로 쓰지 않는다', () => {
    const copy = copyOf('MIXED_DOCUMENT_TYPE')

    expect(copy.title).not.toContain('서버 문구')
    expect(copy.description).not.toContain('서버 문구')
  })
})
