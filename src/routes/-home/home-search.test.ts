import { describe, expect, it } from 'vitest'

import { parseHomeSearch } from './home-search'

describe('parseHomeSearch', () => {
  it('아는 입력 방법이면 이어서 진행한다', () => {
    expect(parseHomeSearch({ resume: 'camera' })).toEqual({ resume: 'camera' })
    expect(parseHomeSearch({ resume: 'gallery' })).toEqual({
      resume: 'gallery',
    })
    expect(parseHomeSearch({ resume: 'file' })).toEqual({ resume: 'file' })
  })

  it('모르는 값 · 다른 타입 · 없는 값이면 이어서 진행하지 않는다', () => {
    expect(parseHomeSearch({ resume: 'video' })).toEqual({})
    expect(parseHomeSearch({ resume: 1 })).toEqual({})
    expect(parseHomeSearch({})).toEqual({})
  })
})
