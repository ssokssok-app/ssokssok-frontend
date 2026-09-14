---
paths:
  - 'src/routes/**'
---

# 라우트 규칙 (TanStack Router, 파일 기반)

- `src/routeTree.gen.ts` 는 생성물이다. 직접 고치지 않는다. dev 서버나 `pnpm routes:generate` 가 다시 만든다.
- 파일 이름 → URL
  - `index.tsx`: 그 폴더 경로 자체 (`capture/index.tsx` → `/capture/`)
  - `$sampleId.tsx`: 경로 파라미터 → `Route.useParams()`
  - `__root.tsx`: 루트 레이아웃
  - `_` 로 시작: URL 에 나타나지 않는 레이아웃 라우트
  - `-` 로 시작: 라우트에서 제외. 그 화면에서만 쓰는 컴포넌트를 같은 폴더에 둘 때 쓴다 (`-home/`). 여러 라우트가 같이 쓰면 routes 바로 아래에 둔다 (`-result/`).
- 페이지 컴포넌트는 라우트 파일 안에 export 하지 않은 함수로 둔다. `autoCodeSplitting` 이 알아서 분리한다.
- 데이터 로딩(loader + TanStack Query) 패턴은 `docs/architecture.md` 의 "데이터 흐름"을 따른다.
