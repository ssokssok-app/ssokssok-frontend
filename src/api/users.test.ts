import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiRequest } from './client'
import { ApiError } from './errors'
import { meQueryOptions, usageQueryOptions, usersQueryKey } from './users'

vi.mock('./client', () => ({ apiRequest: vi.fn() }))

const mockedApiRequest = vi.mocked(apiRequest)

beforeEach(() => {
  mockedApiRequest.mockReset()
})

describe('usageQueryOptions (오늘 남은 이용 횟수)', () => {
  it('로그인 여부와 상관없이 남은 횟수를 받는다', async () => {
    mockedApiRequest.mockResolvedValue({ remaining: 2, limit: 3 })

    await expect(
      new QueryClient().fetchQuery(usageQueryOptions()),
    ).resolves.toEqual({ remaining: 2, limit: 3 })
    // 변환 요청과 같은 기준으로 세도록 토큰을 붙인다. 토큰이 없으면 백엔드가 기기 번호로 센다
    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/api/usage',
      expect.objectContaining({ auth: true }),
    )
  })

  it('모양이 다르면 INVALID_RESPONSE 로 실패해 말풍선을 숨기게 한다', async () => {
    mockedApiRequest.mockResolvedValue({ remainingConversions: 2 })

    const error = await new QueryClient()
      .fetchQuery(usageQueryOptions())
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('INVALID_RESPONSE')
  })

  it('실패해도 다시 묻지 않는다 (말풍선만 숨기고 문서 넣기는 막지 않는다)', () => {
    expect(usageQueryOptions().retry).toBe(false)
  })

  it('로그인이 바뀔 때 지우는 사용자별 키 아래에 둔다', () => {
    expect(usageQueryOptions().queryKey.slice(0, 1)).toEqual([...usersQueryKey])
    expect(meQueryOptions().queryKey.slice(0, 1)).toEqual([...usersQueryKey])
  })
})

describe('meQueryOptions (내 정보)', () => {
  it('카카오처럼 이메일이 없으면 null 로 둔다', async () => {
    mockedApiRequest.mockResolvedValue({
      id: 'u1',
      nickname: '쏙쏙',
      provider: 'kakao',
      email: null,
    })

    await expect(
      new QueryClient().fetchQuery(meQueryOptions()),
    ).resolves.toEqual({
      id: 'u1',
      nickname: '쏙쏙',
      provider: 'kakao',
      email: null,
    })
  })

  it('모르는 로그인 방법이면 INVALID_RESPONSE 를 던진다', async () => {
    mockedApiRequest.mockResolvedValue({
      id: 'u1',
      nickname: '쏙쏙',
      provider: 'naver',
    })

    const error = await new QueryClient()
      .fetchQuery(meQueryOptions())
      .catch((caught: unknown) => caught)

    expect((error as ApiError).code).toBe('INVALID_RESPONSE')
  })
})
