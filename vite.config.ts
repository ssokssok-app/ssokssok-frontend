import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // react()보다 먼저 와야 라우트 생성·코드 스플리팅이 동작한다
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
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
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
