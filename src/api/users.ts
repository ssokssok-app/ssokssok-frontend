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
  // 로그인을 켜 두면 토큰을 붙여야 변환 요청과 같은 기준(계정)으로 센다.
  // 토큰이 없으면 헤더가 붙지 않아 백엔드가 기기 번호로 센다
  return parseUsage(await apiRequest('/api/usage', { auth: true, signal }))
}

/**
 * 오늘 남은 변환 횟수. 로그인 여부와 상관없이 부른다.
 * 백엔드가 토큰이 있으면 계정 기준, 없으면 기기 번호 기준으로 센다 (docs/api-contract.md "9. 기기 번호 · 이용 횟수").
 * 알려 주기만 하는 값이고 실제 제한은 서버가 변환 요청에서 막으니(RATE_LIMITED), 실패하면 다시 묻지 않고 말풍선을 숨긴다
 */
export const usageQueryOptions = () =>
  queryOptions({
    queryKey: [...usersQueryKey, 'usage'],
    queryFn: ({ signal }) => getUsage(signal),
    retry: false,
  })
