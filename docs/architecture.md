# 아키텍처

## 폴더

| 경로              | 역할                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/routes/`     | 화면. 파일 기반 라우트 (규칙: `.claude/rules/routes.md`)                                                       |
| `src/api/`        | 백엔드 호출 함수와 TanStack Query `queryOptions`. 도메인별 파일 하나씩                                         |
| `src/components/` | Figma 공용 컴포넌트 (Base UI 기반, 규칙: `.claude/rules/styling.md`). `src/components/ui/` 는 shadcn 원본      |
| `src/assets/`     | Figma 에서 받은 파일. `icons/{크기}/` 아이콘 · `logos/` 로고(SVG, `?react` 로 불러옴), `images/` 일러스트(PNG) |
| `src/hooks/`      | 여러 화면에서 쓰는 훅                                                                                          |
| `src/lib/`        | 앱 전역 인스턴스 · 유틸 (`query-client.ts`, `utils.ts`)                                                        |
| `src/types/`      | 여러 곳에서 쓰는 타입 (API 응답 타입 등)                                                                       |
| `scripts/`        | 하네스 검사 스크립트 (`docs/harness.md`)                                                                       |

`src/` 바로 아래에 이 표에 없는 폴더를 만들면 표에 한 줄 추가한다. 추가하지 않으면 Stop 훅이 알려 준다.

## 앱 시작 순서

`src/main.tsx` 가 다음 순서로 앱을 띄운다.

1. 라우터를 만든다. `context` 에 `queryClient` 를 넣고, 링크에 마우스를 올리면 미리 불러오게 한다.
2. `initFontScale()` 로 저장된 큰글씨 설정을 첫 렌더 전에 적용한다.
3. `QueryClientProvider` 와 `RouterProvider` 를 렌더한다.

루트 레이아웃 `src/routes/__root.tsx` 는 모든 화면을 `ToastProvider` 로 감싼다. 화면 어디서든 `useToast()` (`src/hooks/useToast.ts`) 로 알림을 띄운다.

## 데이터 흐름

- 서버 데이터는 모두 TanStack Query 가 가지고 캐시한다. 라우터 자체의 preload 캐시는 꺼 두었다.
- 라우트 loader 가 미리 받고, 컴포넌트는 같은 `queryOptions` 로 읽는다.

```ts
// src/api/documents.ts
export const documentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['documents', id],
    queryFn: () => getDocument(id),
  })

// src/routes/documents/$id.tsx
export const Route = createFileRoute('/documents/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(documentQueryOptions(params.id)),
  component: DocumentDetailPage,
})

function DocumentDetailPage() {
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(documentQueryOptions(id))
}
```

- 서버와 무관한 UI 상태는 컴포넌트 state 에 둔다.
- 브라우저에 저장하는 설정은 `useFontScale.ts` 처럼 `useSyncExternalStore` 훅 하나로 감싸고, `localStorage` 접근을 그 파일 안에만 둔다.

## 백엔드 연동

- 백엔드는 FastAPI 이고 별도 레포에서 준비 중이다.
- 개발 중에는 Vite 가 `/api` 요청을 `http://localhost:8000` 으로 넘긴다 (`vite.config.ts`). 코드에서는 항상 상대 경로 `/api/...` 로 부른다.
- `VITE_*` 환경 변수는 번들에 그대로 들어간다. 비밀값은 넣지 않는다.
- **미정 (정해지면 여기에 적는다):** fetch 래퍼와 에러 형식, 인증(토큰 저장 위치 · 갱신), API 타입 생성 방식(OpenAPI 등)
