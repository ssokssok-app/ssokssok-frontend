import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiRequest } from './client'
import { getConversionStatus, startConversion } from './conversion'
import { ApiError } from './errors'

vi.mock('./client', () => ({ apiRequest: vi.fn() }))

const mockedApiRequest = vi.mocked(apiRequest)
const signal = new AbortController().signal

beforeEach(() => {
  mockedApiRequest.mockReset()
})

async function expectInvalidResponse(promise: Promise<unknown>) {
  const error = await promise.catch((caught: unknown) => caught)
  expect(error).toBeInstanceOf(ApiError)
  expect((error as ApiError).code).toBe('INVALID_RESPONSE')
}

describe('startConversion', () => {
  it('파일을 로그인해서 올리고 작업 ID 를 돌려준다', async () => {
    mockedApiRequest.mockResolvedValue({ jobId: 'job-1', status: 'queued' })
    const file = new File(['사진'], 'page1.jpg', { type: 'image/jpeg' })

    await expect(startConversion([file], signal)).resolves.toEqual({
      jobId: 'job-1',
    })
    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/api/documents/convert',
      expect.objectContaining({ method: 'POST', auth: true }),
    )
  })

  it('작업 ID 가 없으면 INVALID_RESPONSE 를 던진다', async () => {
    mockedApiRequest.mockResolvedValue({ status: 'queued' })

    await expectInvalidResponse(startConversion([], signal))
  })
})

describe('getConversionStatus', () => {
  it('실패면 서버가 준 오류 code 를 그대로 돌려준다 (종류 섞임 · 인식 불가)', async () => {
    for (const code of ['MIXED_DOCUMENT_TYPE', 'DOCUMENT_UNRECOGNIZED']) {
      mockedApiRequest.mockResolvedValue({
        status: 'failed',
        stage: 'structuring',
        progress: 1,
        error: { code, message: '서버 문구' },
      })

      await expect(getConversionStatus('job-1', signal)).resolves.toEqual({
        status: 'failed',
        stage: 'structuring',
        progress: 1,
        error: { code, message: '서버 문구' },
      })
    }
  })

  it('실패인데 오류 내용이 없으면 CONVERT_FAILED 로 본다', async () => {
    mockedApiRequest.mockResolvedValue({ status: 'failed', progress: 0.3 })

    const status = await getConversionStatus('job-1', signal)

    expect(status.error?.code).toBe('CONVERT_FAILED')
  })

  it('모르는 단계는 첫 단계로 보고, 진행률은 0~1 로 자른다', async () => {
    mockedApiRequest.mockResolvedValue({
      status: 'processing',
      stage: 'translating',
      progress: 1.4,
    })

    await expect(getConversionStatus('job-1', signal)).resolves.toMatchObject({
      stage: 'analyzing',
      progress: 1,
    })

    mockedApiRequest.mockResolvedValue({ status: 'queued', progress: -1 })
    await expect(getConversionStatus('job-1', signal)).resolves.toMatchObject({
      progress: 0,
    })
  })

  it('완료면 결과 모양까지 확인한다', async () => {
    mockedApiRequest.mockResolvedValue({
      status: 'done',
      stage: 'done',
      progress: 1,
      result: { title: '결과' },
    })

    await expectInvalidResponse(getConversionStatus('job-1', signal))
  })

  it('모르는 상태면 INVALID_RESPONSE 를 던진다', async () => {
    mockedApiRequest.mockResolvedValue({ status: 'paused' })

    await expectInvalidResponse(getConversionStatus('job-1', signal))
  })

  it('작업 ID 는 주소에 안전하게 넣는다', async () => {
    mockedApiRequest.mockResolvedValue({ status: 'queued' })

    await getConversionStatus('a/b', signal)

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/api/documents/convert/a%2Fb',
      expect.objectContaining({ auth: true }),
    )
  })
})
