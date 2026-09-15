import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import checker from 'vite-plugin-checker'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // /api 를 넘길 백엔드. 기본은 배포된 백엔드이고, 로컬 백엔드를 띄웠으면 .env.local 에 API_PROXY_TARGET=http://localhost:8000
  // VITE_ 로 시작하지 않아 번들에 들어가지 않는다
  const { API_PROXY_TARGET = 'https://ssokssok-backend.fly.dev' } = loadEnv(
    mode,
    process.cwd(),
    'API_',
  )

  return {
    plugins: [
      // react()보다 먼저 와야 라우트 생성·코드 스플리팅이 동작한다
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      // `import CloseIcon from '@/assets/icons/24/close.svg?react'` 로 SVG 를 컴포넌트로 불러온다
      svgr(),
      checker({
        typescript: true,
        oxlint: true,
        // 빌드 시 검사는 `pnpm verify`가 담당하므로 dev 오버레이 용도로만 사용
        enableBuild: false,
      }),
    ],
    resolve: {
      // tsconfig.json의 paths(@/*)를 그대로 사용
      tsconfigPaths: true,
    },
    server: {
      // 카카오 · 구글 콘솔에 등록한 로컬 콜백 주소가 localhost:5173 이다. 포트가 차 있으면 다른 포트로 뜨지 않고 멈춘다
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: API_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
  }
})
