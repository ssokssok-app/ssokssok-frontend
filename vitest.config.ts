import { defineConfig } from 'vitest/config'

/*
 * 로직 테스트 설정 (docs/ci.md "지금 도는 검사").
 * vite.config.ts 를 그대로 쓰면 라우트 생성 · 타입 검사 플러그인까지 돌아서, 테스트에 필요한 경로 별칭(@/*)만 따로 둔다.
 * 화면을 띄우지 않는 순수 함수 · 응답 확인만 테스트해 브라우저 흉내(jsdom)는 쓰지 않는다.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
