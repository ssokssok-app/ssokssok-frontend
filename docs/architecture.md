# 아키텍처

## 폴더

| 경로              | 역할                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/`     | 화면. 파일 기반 라우트 (규칙: `.claude/rules/routes.md`)                                                                                                                  |
| `src/api/`        | 백엔드 호출 함수와 TanStack Query `queryOptions`. 도메인별 파일 하나씩. 응답 모양 확인 함수는 같은 폴더에 둔다 (`documents.ts`)                                           |
| `src/components/` | Figma 공용 컴포넌트 (Base UI 기반, 규칙: `.claude/rules/styling.md`). `src/components/ui/` 는 shadcn 원본                                                                 |
| `src/assets/`     | Figma 에서 받은 파일. `icons/{크기}/` 아이콘 · `logos/` 로고(SVG, `?react` 로 불러옴), `images/` 일러스트(PNG · SVG, 투명 영역이 없으면 JPG), `videos/` 움직이는 일러스트 |
| `src/hooks/`      | 여러 화면에서 쓰는 훅                                                                                                                                                     |
| `src/lib/`        | 앱 전역 인스턴스 · 유틸 (`query-client.ts`, `utils.ts`, `wait.ts`)                                                                                                        |
| `src/types/`      | 여러 곳에서 쓰는 타입. 백엔드 응답 타입(`document-result.ts` · `conversion.ts` · `auth.ts`)은 Swagger 와 1:1 로 맞춘다 (`docs/api-contract.md`)                           |
| `scripts/`        | 하네스 검사 스크립트 (`docs/harness.md`)                                                                                                                                  |

`src/` 바로 아래에 이 표에 없는 폴더를 만들면 표에 한 줄 추가한다. 추가하지 않으면 Stop 훅이 알려 준다.

## 앱 시작 순서

`src/main.tsx` 가 다음 순서로 앱을 띄운다.

1. 라우터를 만든다. `context` 에 `queryClient` 를 넣고, 링크에 마우스를 올리면 미리 불러오게 한다.
2. `initFontScale()` 로 저장된 큰글씨 설정을 첫 렌더 전에 적용한다.
3. `initSession()` (`src/api/client.ts`) 이 로그인한 적이 있으면 쿠키로 액세스 토큰을 다시 받기 시작하고, 다른 탭의 로그인 · 로그아웃을 따라가게 한다. 로그인이 바뀔 때마다 사용자 정보 캐시(`usersQueryKey`)를 지우도록 구독한다.
4. `QueryClientProvider` 와 `RouterProvider` 를 렌더한다.

루트 라우트 `src/routes/__root.tsx` 는 `beforeLoad` 에서 로그인 되살리기가 끝날 때까지 기다린 뒤 화면을 그린다. 보통 0.1~0.3초라 바로 뜨고, 1초가 넘을 때만 "잠시만 기다려주세요" 대기 화면을 보여 준다 (보이면 0.5초는 유지). 루트 레이아웃은 모든 화면을 `ToastProvider` 로 감싼다. 화면 어디서든 `useToast()` (`src/hooks/useToast.ts`) 로 알림을 띄운다.
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
- 서버 응답은 받은 모양 그대로 쓰고, 화면용 가공(원문 발췌 등)은 화면 폴더의 순수 함수로 둔다 (`src/routes/-result/source-excerpt.ts`). 응답 타입과 화면이 어긋나면 타입을 고치지 않고 가공 함수를 고친다
- 변환하려고 고른 사진 · PDF 는 파일이라 주소에 담을 수 없어 `src/hooks/useDocumentDraft.ts` 가 메모리에 둔다 (홈 → 확인 → 결과). 사진은 넣을 때 `src/lib/compress-image.ts` 로 줄인다. 홈으로 돌아오면 비우고, 미리보기 주소는 비울 때 해제한다.
- 문서 변환은 사용자가 누른 순간 `src/hooks/useConversionSession.ts` 가 파일을 올려 작업 ID 를 받는다 (화면이 그려질 때 요청하면 개발 모드에서 두 번 나간다). 결과 화면(`src/routes/result.tsx`)은 작업 ID 로 `src/api/conversion.ts` 의 상태 조회를 TanStack Query `refetchInterval` 로 반복하고, 라우트 `onLeave` 에서 변환을 취소한다. 나가기 확인은 `useBlocker` 로 홈 · 닫기 · 뒤로 가기를 한곳에서 막는다.
- 서버와 무관한 UI 상태는 컴포넌트 state 에 둔다.
- 브라우저에 저장하는 설정은 `useFontScale.ts` · `usePrivacyNotice.ts` 처럼 `useSyncExternalStore` 훅 하나로 감싸고, `localStorage` 접근을 그 파일 안에만 둔다. 예외로 "로그인한 적 있음" 표시는 토큰과 함께 `src/api/client.ts` 가 다룬다.

## 백엔드 연동

- 백엔드는 FastAPI 이고 별도 레포(`ssokssok-app/ssokssok-backend`)다. 배포 주소는 `https://ssokssok-backend.fly.dev` (Fly.io 도쿄, 최소 1대 상시), 모든 API 는 `/api` 아래에 있다.
- 코드에서는 항상 상대 경로 `/api/...` 로 부른다. 개발 중에는 Vite 프록시가 배포된 백엔드로 넘기고(`vite.config.ts`), 로컬 백엔드를 띄웠으면 `.env.local` 에 `API_PROXY_TARGET=http://localhost:8000` 을 둔다. 개발 중 변환 테스트도 실제 OCR · AI 비용이 든다.
- 개발 서버는 5173 포트로 고정이다. 카카오 · 구글 콘솔에 등록한 로컬 콜백 주소가 `http://localhost:5173` 이라, 포트가 차 있으면 다른 포트로 뜨지 않고 멈춘다.
- 배포(Vercel, `https://www.ssokssok.site`)에서는 `vercel.json` 이 `/api` 를 백엔드로 넘긴다. 같은 도메인이라 CORS 가 필요 없다 (`docs/ci.md` "배포").
- `VITE_*` 환경 변수는 번들에 그대로 들어간다. 비밀값은 넣지 않는다.
- 소셜 로그인 공개 키: `VITE_KAKAO_REST_API_KEY`(카카오 REST API 키) · `VITE_GOOGLE_CLIENT_ID`(구글 클라이언트 ID). 로컬은 git 에 올리지 않는 `.env.local`, 배포는 Vercel 환경 변수에 둔다. 로그인 페이지로 가는 주소에 어차피 드러나는 값이라 공개돼도 되고, 두 시크릿은 백엔드에만 있다. 콘솔 설정은 `docs/api-contract.md` "로그인"
- API 계약은 `docs/api-contract.md` 에 있다. Swagger 는 `https://ssokssok-backend.fly.dev/docs`
- 정해진 것 (2026-09-14 백엔드 답변): 오류 응답은 `{ error: { code, message } }`, 인증은 JWT(액세스 + 리프레시 토큰), 변환은 작업 ID + 폴링
- **요청 함수:** 백엔드 요청은 `src/api/client.ts` 의 `apiRequest` 로 보낸다. JSON 본문은 `json`, 파일 올리기는 `form`(FormData) 으로 준다. 실패하면 `ApiError`(`src/api/errors.ts`)를 던진다. 로그인이 필요한 요청은 `auth: true` 로 액세스 토큰을 붙이고, 401 이면 갱신한 뒤 한 번 다시 보낸다
- **웹 토큰 (2026-09-15 결정):** 액세스 토큰은 `src/api/client.ts` 메모리에만 두고, 리프레시 토큰은 백엔드가 심는 HttpOnly 쿠키라 프론트 코드가 다루지 않는다 (응답 본문의 `refreshToken` 은 앱용이라 읽지 않는다). 토큰은 localStorage · sessionStorage · URL 에 두지 않는다. 이유와 백엔드 쪽 조건은 `docs/api-contract.md` "웹 토큰 저장"
  - 앱을 켤 때 갱신 요청으로 로그인을 되살린다. 쿠키는 읽을 수 없어 "로그인한 적 있음" 표시(참/거짓)만 localStorage 에 두고, 표시가 없으면 갱신 요청을 보내지 않는다 (비로그인 사용자의 헛된 요청을 줄인다)
  - 되살리기는 루트 라우트가 첫 화면 전에 한 번 기다린다. 화면마다 따로 기다리면 빠뜨리는 곳이 생겨(예: 개인정보 안내 확인 직후) 이미 로그인한 사람에게 로그인 시트가 뜰 수 있어서다. 화면은 `useAuth()` 의 로그인 여부를 바로 쓴다
  - 다른 탭에서 로그인 표시가 바뀌면(`storage` 이벤트) 이 탭도 로그아웃하거나 쿠키로 따라 되살린다
  - 여러 요청이 동시에 만료로 실패해도 갱신은 한 번만 보내고 나머지는 그 결과를 기다린다. 갱신이 401 이면 로그인이 끝난 것으로 보고, 네트워크 · 서버 오류는 로그인을 지우지 않는다
  - 로그인이 바뀌면(로그인 · 로그아웃 · 탈퇴 · 만료 · 다른 탭) `src/main.tsx` 가 한 곳에서 `usersQueryKey` 쿼리를 지운다. 사용자별 데이터는 이 키 아래에 둔다
- **미정 (정해지면 여기에 적는다):** API 타입 생성 방식(Swagger 에서 만들지)
- **소셜 로그인 흐름:**
  1. 로그인 시트의 버튼이 `src/routes/-auth/social-login.ts` 의 `startSocialLogin` 을 부른다. `state`(무작위 값)와 돌아갈 화면(홈 · 설정 중 하나)을 sessionStorage 에 두고 카카오 · 구글 로그인 화면으로 이동한다. 로그인 화면에 다녀오면 페이지가 새로 열려 메모리가 비기 때문이다. 토큰이 아니라 한 번 쓰고 지우는 확인 값이라 괜찮다
  2. 콜백 라우트 `src/routes/auth/$provider/callback.tsx` 의 loader 가 앱 시작 때의 로그인 되살리기를 기다린 뒤(늦게 끝난 갱신이 새 로그인을 덮어쓰지 않게), 저장한 값을 꺼내 지우고 `state` 를 비교하고, `src/api/auth.ts` 의 `loginWithCode` 로 코드를 넘긴다. 코드는 한 번만 쓸 수 있어 개발 모드에서 두 번 실행되는 effect 대신 loader 에서 처리한다
  3. 돌아갈 화면으로 replace 이동한다(코드가 방문 기록에 남지 않게). 홈이면 `?resume=` 을 붙여 지원 문서 안내부터 이어 가고, 홈이 한 번 쓰고 주소에서 지운다
- **로그아웃 · 탈퇴:** `src/api/auth.ts` 의 `logout` 은 백엔드가 쿠키를 지워야 끝나므로, 실패하면 로그인 상태를 두고 오류를 던진다. `deleteAccount` 는 탈퇴 응답이 쿠키를 지우지 않아 로그아웃을 한 번 더 부른다
- **변환 요청 (2026-09-15 연결):** `src/api/conversion.ts` 가 파일을 multipart 로 올려 작업 ID 를 받고(POST), 상태를 조회하고(GET), 취소한다(DELETE). 응답 모양은 `src/api/documents.ts` 의 `parseDocumentResult` 와 상태 파서가 확인하고, 다르면 `INVALID_RESPONSE` 오류다. 개발 중에도 실제 OCR · AI 를 부른다
- **샘플 (2026-09-15 연결):** `src/api/samples.ts` 가 목록(Figma 문구, 프론트 고정)과 결과 `queryOptions` 를 가진다. 결과는 `GET /api/documents/samples/{id}` 로 받아 `parseDocumentResult` 로 확인한다. 변환 과정을 체험하도록 로딩 화면을 최소 2초 보여 준다 (`src/lib/wait.ts`)
