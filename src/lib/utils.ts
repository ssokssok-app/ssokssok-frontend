import { createCn } from 'cn/config'

/**
 * Tailwind 클래스 병합.
 *
 * src/index.css 에 직접 정의한 토큰(Figma 글자 스타일, 그라디언트)은 Tailwind 기본에 없는 이름이라
 * 여기에 등록해야 한다. 등록하지 않으면 `cn('text-body-semibold', 'text-gray-500')` 에서
 * 글자 토큰이 색과 충돌로 오인돼 지워진다. 빠뜨리면 `pnpm check:tokens` 가 실패한다.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'caption-s-semibold',
            'caption-l-regular',
            'caption-l-medium',
            'caption-l-semibold',
            'body-regular',
            'body-medium',
            'body-semibold',
            'body-bold',
            'body2-regular',
            'body2-medium',
            'subtitle-semibold',
            'title-semibold',
            'headline-s-semibold',
            'headline-m-semibold',
            'headline-l-semibold',
          ],
        },
      ],
      'bg-image': [
        {
          bg: [
            'gradient-background',
            'gradient-desktop',
            'gradient-main',
            'gradient-header',
            'gradient-line',
            'gradient-must-header',
          ],
        },
      ],
      shadow: [
        {
          shadow: [
            'knob',
            'modal',
            'popover',
            'sticky',
            'card',
            'float',
            'menu',
          ],
        },
      ],
      'drop-shadow': [{ 'drop-shadow': ['bubble'] }],
      'max-w': [{ 'max-w': ['app'] }],
      gap: [{ gap: ['body2'] }],
      app: [{ app: ['column-inset'] }],
    },
  },
})

/** 서버 응답 · 저장소에서 읽은 값처럼 모양을 모르는 값이 객체인지 확인한다 (`as` 단언 대신) */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
