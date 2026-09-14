# 아키텍처

## 폴더

| 경로              | 역할                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/`     | 화면. 파일 기반 라우트 (규칙: `.claude/rules/routes.md`)                                                                                                                  |
| `src/api/`        | 백엔드 호출 함수와 TanStack Query `queryOptions`. 도메인별 파일 하나씩. 백엔드 전 목데이터는 `mocks/`                                                                     |
| `src/components/` | Figma 공용 컴포넌트 (Base UI 기반, 규칙: `.claude/rules/styling.md`). `src/components/ui/` 는 shadcn 원본                                                                 |
| `src/assets/`     | Figma 에서 받은 파일. `icons/{크기}/` 아이콘 · `logos/` 로고(SVG, `?react` 로 불러옴), `images/` 일러스트(PNG · SVG, 투명 영역이 없으면 JPG), `videos/` 움직이는 일러스트 |
| `src/hooks/`      | 여러 화면에서 쓰는 훅                                                                                                                                                     |
| `src/lib/`        | 앱 전역 인스턴스 · 유틸 (`query-client.ts`, `utils.ts`)                                                                                                                   |
| `src/types/`      | 여러 곳에서 쓰는 타입. API 계약 초안 타입(`document-result.ts`, `docs/api-contract.md`)                                                                                   |
| `scripts/`        | 하네스 검사 스크립트 (`docs/harness.md`)                                                                                                                                  |

`src/` 바로 아래에 이 표에 없는 폴더를 만들면 표에 한 줄 추가한다. 추가하지 않으면 Stop 훅이 알려 준다.

## 앱 시작 순서

`src/main.tsx` 가 다음 순서로 앱을 띄운다.

1. 라우터를 만든다. `context` 에 `queryClient` 를 넣고, 링크에 마우스를 올리면 미리 불러오게 한다.
2. `initFontScale()` 로 저장된 큰글씨 설정을 첫 렌더 전에 적용한다.
3. `QueryClientProvider` 와 `RouterProvider` 를 렌더한다.

루트 레이아웃 `src/routes/__root.tsx` 는 모든 화면을 `ToastProvider` 로 감싼다. 화면 어디서든 `useToast()` (`src/hooks/useToast.ts`) 로 알림을 띄운다.
그 안에서 모든 화면을 앱 폭(`max-w-app`, 600px) 흰 기둥에 넣어 가운데 세운다. 기둥 바깥 배경은 `body` 가 칠한다 (`docs/product.md` "UX 원칙").

## 데이터 흐름

- 서버 데이터는 모두 TanStack Query 가 가지고 캐시한다. 라우터 자체의 preload 캐시는 꺼 두었다.
- 라우트 loader 가 미리 받고, 컴포넌트는 같은 `queryOptions` 로 읽는다.

```ts
// src/api/users.ts (예시)
export const meQueryOptions = () =>
  queryOptions({
    queryKey: ['users', 'me'],
    queryFn: ({ signal }) => getMe(signal),
  })

// src/routes/settings.tsx (예시)
export const Route = createFileRoute('/settings')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(meQueryOptions()),
  component: SettingsPage,
})

function SettingsPage() {
  const { data } = useSuspenseQuery(meQueryOptions())
}
```

- 예외: 기다리는 동안 전용 로딩 화면(문서 읽기 로딩)을 보여 줘야 하는 결과 화면은 loader 로 미리 받지 않고, 화면에서 `useQuery` 로 받으며 대기 · 오류 상태를 직접 그린다 (`src/routes/samples/$sampleId.tsx`).
- 여러 라우트가 같이 쓰는 화면 부품(결과 화면 등)은 `src/routes/-result/` 처럼 routes 바로 아래 `-` 폴더에 둔다.
- 화면 안의 겹친 화면(원문 보기 등)을 휴대폰 뒤로 가기로 닫아야 하면 검색 파라미터(`?paragraph=`)로 연다. 같은 라우트라 아래 화면과 스크롤 위치가 그대로 남는다. 이동할 때 `resetScroll: false` 를 준다.
- 변환하려고 고른 사진 · PDF 는 파일이라 주소에 담을 수 없어 `src/hooks/useDocumentDraft.ts` 가 메모리에 둔다 (홈 → 확인 → 결과). 사진은 넣을 때 `src/lib/compress-image.ts` 로 줄인다. 홈으로 돌아오면 비우고, 미리보기 주소는 비울 때 해제한다.
- 서버와 무관한 UI 상태는 컴포넌트 state 에 둔다.
- 브라우저에 저장하는 설정은 `useFontScale.ts` · `usePrivacyNotice.ts` 처럼 `useSyncExternalStore` 훅 하나로 감싸고, `localStorage` 접근을 그 파일 안에만 둔다.

## 백엔드 연동

- 백엔드는 FastAPI 이고 별도 레포에서 준비 중이다.
- 개발 중에는 Vite 가 `/api` 요청을 `http://localhost:8000` 으로 넘긴다 (`vite.config.ts`). 코드에서는 항상 상대 경로 `/api/...` 로 부른다.
- `VITE_*` 환경 변수는 번들에 그대로 들어간다. 비밀값은 넣지 않는다.
- API 계약은 `docs/api-contract.md` 에 있다. 로컬 백엔드는 `http://localhost:8000`, Swagger 는 `http://localhost:8000/docs`
- 정해진 것 (2026-09-14 백엔드 답변): 오류 응답은 `{ error: { code, message } }`, 인증은 JWT(액세스 + 리프레시 토큰), 변환은 작업 ID + 폴링
- **미정 (정해지면 여기에 적는다):** fetch 래퍼, 웹에서 토큰을 둘 곳과 갱신 방법, API 타입 생성 방식(Swagger 에서 만들지), 백엔드 경로에 `/api` 가 붙는지(안 붙으면 `vite.config.ts` 프록시에서 뗀다)
- **임시 로그인:** 인증이 정해지기 전까지 `src/hooks/useAuth.ts` 는 로그인 버튼을 누르면 탭 메모리에서만 로그인한 것으로 친다 (새로고침하면 풀림). 실제 소셜 로그인이 붙으면 이 파일 안만 바꾼다
- **샘플 목데이터:** `src/api/samples.ts` 가 샘플 목록과 결과 `queryOptions` 를 가지고, 결과 내용은 `src/api/mocks/sample-results.ts` 에 있다. 로딩 화면을 체험하도록 3.2초 뒤에 돌려준다. 백엔드가 준비되면 호출 함수 안만 바꾸고 목데이터는 지운다
