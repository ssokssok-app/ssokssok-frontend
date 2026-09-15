import { queryOptions } from '@tanstack/react-query'

import { isRecord } from '@/lib/utils'
import type { Me, Usage } from '@/types/auth'

import { isLoginProvider } from './auth'
import { apiRequest } from './client'
import { ApiError } from './errors'

/** 로그인 여부가 바뀌면(로그인 · 로그아웃 · 탈퇴) 다른 사람 정보가 남지 않게 이 키로 지운다 */
export const usersQueryKey = ['users'] as const

function parseMe(body: unknown): Me {
  if (
    isRecord(body) &&
    typeof body.id === 'string' &&
    typeof body.nickname === 'string' &&
    isLoginProvider(body.provider)
  ) {
    return {
      id: body.id,
      nickname: body.nickname,
      provider: body.provider,
      email: typeof body.email === 'string' ? body.email : null,
    }
  }
  throw new ApiError({
    code: 'INVALID_RESPONSE',
    message: '내 정보 응답 모양이 달라요.',
  })
}

async function getMe(signal: AbortSignal): Promise<Me> {
  return parseMe(await apiRequest('/api/users/me', { auth: true, signal }))
}

export const meQueryOptions = () =>
  queryOptions({
    queryKey: [...usersQueryKey, 'me'],
    queryFn: ({ signal }) => getMe(signal),
  })

function parseUsage(body: unknown): Usage {
  if (
    isRecord(body) &&
    typeof body.remaining === 'number' &&
    typeof body.limit === 'number'
  ) {
    return { remaining: body.remaining, limit: body.limit }
  }
  throw new ApiError({
    code: 'INVALID_RESPONSE',
    message: '이용 횟수 응답 모양이 달라요.',
  })
}

async function getUsage(signal: AbortSignal): Promise<Usage> {
  return parseUsage(
    await apiRequest('/api/users/me/usage', { auth: true, signal }),
  )
}

/**
 * 오늘 남은 변환 횟수. 로그인했을 때만 부른다.
 * 알려 주기만 하는 값이고 실제 제한은 서버가 변환 요청에서 막으니(RATE_LIMITED), 실패하면 다시 묻지 않고 말풍선을 숨긴다.
 * 백엔드가 아직 만들지 않아(docs/api-contract.md "백엔드에 보낼 제안" 13번) 지금은 404 로 실패한다
 */
export const usageQueryOptions = () =>
  queryOptions({
    queryKey: [...usersQueryKey, 'usage'],
    queryFn: ({ signal }) => getUsage(signal),
    retry: false,
  })
