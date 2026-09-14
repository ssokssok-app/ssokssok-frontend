# AGENTS.md

쏙쏙(ssokssok) 웹 프론트엔드. 계약서 · 안내문 · 과태료 통지서 같은 어려운 문서를 AI 로 쉬운 정보로 바꿔 주는 모바일 웹이다.
주 사용자는 고령층 · 발달장애인 · 외국인 노동자다. **앱 화면 자체가 쉽게 읽히고, 크게 보이고, 누르기 쉬워야 한다.**

이 파일은 모든 코딩 에이전트(Codex, Claude 등)가 읽는 공통 안내다. 작업 규칙의 원문은 아래 문서에 있고, 여기서는 가리키기만 한다.

## 기준 문서

| 필요할 때                                  | 문서                            |
| ------------------------------------------ | ------------------------------- |
| 작업 흐름 · 반드시 지킬 것                 | `CLAUDE.md`                     |
| 사용자 · UX 원칙 · Figma 와 다르게 정한 것 | `docs/product.md`               |
| 폴더 역할 · 데이터 흐름                    | `docs/architecture.md`          |
| 스타일 · 공용 컴포넌트 · 아이콘            | `.claude/rules/styling.md`      |
| 라우트                                     | `.claude/rules/routes.md`       |
| 커밋 · 브랜치 · PR                         | `docs/git.md`                   |
| CI · 자동 검사                             | `docs/ci.md`, `docs/harness.md` |

## 명령어

- `pnpm install`: 의존성 설치
- `pnpm dev`: 개발 서버. `/dev/components` 에서 공용 컴포넌트 카탈로그를 본다
- `pnpm check`: lint · 타입 · 포맷 · 규칙 검사 (빌드 제외)
- `pnpm verify`: `pnpm check` + 프로덕션 빌드. 작업을 끝내기 전에 통과해야 한다

## Code Review Rules

이 서비스 사용자에게 실제로 영향이 있는 문제에 집중한다. 컴포넌트 · 디자인 시스템 기준은 `src/components/AGENTS.md` 에 따로 있다.

### 리뷰 방식

- 코멘트는 한국어로 쓴다. PR 은 디자이너 · 기획자도 읽는다.
- "무엇이 문제인지 → 사용자에게 어떤 영향이 있는지 → 어떻게 고치면 되는지" 순서로 쓰고, 근거가 되는 문서 경로를 붙인다.
- 코드로 확인한 것만 단정한다. 확실하지 않으면 확실하지 않다고 쓴다.

### CI 가 이미 막는 것 (지적하지 않는다)

- 포맷(Prettier), lint(oxlint), 타입 오류, 빌드 실패
- 임의 글자 크기 · Tailwind 기본 글자 단계: `pnpm check:font-scale`
- 색 값 직접 쓰기 · shadcn 컴포넌트 추가: `pnpm check:design`
- 커스텀 토큰의 `cn` 등록 누락: `pnpm check:tokens`
- 문서 속 경로 · 명령어 끊김: `pnpm check:docs`. PR 제목 형식: `pr-title` 워크플로
- 생성 · 원본 파일의 diff 내용: `src/routeTree.gen.ts`, `pnpm-lock.yaml`, `src/assets/` (Figma 원본을 해시로 대조해 넣는다)

### 개인정보 · 보안 (P0)

사용자가 올리는 문서에는 이름 · 주소 · 주민등록번호 · 계좌 · 급여 같은 개인정보가 들어 있다. 앱은 사용자에게 "변환에만 쓰고 저장하지 않는다"고 안내한다.

- 문서 원문 · 촬영 이미지 · 변환 결과를 `console`, 분석 도구, 에러 리포트에 남기는 코드
- 문서 내용을 localStorage · sessionStorage · IndexedDB · URL(쿼리 · 해시)에 저장하는 코드. 브라우저에는 큰글씨 같은 설정값만 저장한다
- 백엔드(`/api`)가 아닌 곳으로 문서 내용을 보내는 코드
- AI · OCR 결과를 `dangerouslySetInnerHTML` 이나 `innerHTML` 로 넣는 코드. 결과는 텍스트로만 렌더링한다
- `VITE_*` 환경 변수의 비밀값, 공개 저장소에 올라가는 Figma 파일 링크 · 내부 주소 · 토큰

### 큰글씨 · 접근성 (P1)

주 사용자가 실제로 읽고 누를 수 있는지가 이 서비스의 핵심 품질이다. 큰글씨 모드는 `<html data-font-scale="large">` 에서 모든 글자를 4px 키운다.

- 글자가 들어가는 요소에 고정 높이(`h-[64px]`, `max-h-*`)나 `overflow-hidden` · `truncate` · `line-clamp-*` · `whitespace-nowrap` 을 줘서, 큰글씨 모드에서 글자가 잘리거나 겹치는 경우. 안전한 방법: `min-h-*` 와 여백으로 크기를 잡고 줄바꿈을 허용한다
- 누를 수 있는데 `div` · `span` 에 onClick 만 단 경우 (키보드 · 스크린리더로 쓸 수 없다). Base UI `Button` 이나 `<button>` · `<a>` 를 쓴다
- 아이콘만 있는 버튼에 한국어 `aria-label` 이 없거나, 누르는 영역이 40×40px 보다 작은 경우. 안전한 방법: 보이는 크기는 두고 `-m-2 p-2` 로 영역만 넓힌다
- `focus-visible` 표시를 없애고 대신할 표시를 두지 않은 경우
- 정보를 담은 이미지에 대체 텍스트가 없는 경우. 꾸밈 이미지는 `alt=""`
- 본문에 `break-all` 을 줘서 한국어 단어가 중간에서 끊기는 경우 (앱 전체가 단어 단위 줄바꿈이다)
- 사용자에게 보이는 문구가 어렵거나 헷갈리는 경우: 영어, 전문 용어, 이중 부정("다시 안보지 않기" 같은). 행동을 결정하는 버튼 · 안내 문구면 반드시 지적한다

### 데이터 · 라우트 (P1)

- 서버 데이터를 `useEffect` + `fetch` 로 직접 가져오는 코드. `src/api/` 의 `queryOptions` 와 라우트 loader 패턴을 따른다 (`docs/architecture.md`)
- 개발용 라우트(`src/routes/dev/`)에서 프로덕션 차단(`beforeLoad` 의 `notFound`)을 없앤 경우
- `localStorage` 를 전용 훅 파일 밖에서 직접 읽고 쓰는 경우 (`src/hooks/useFontScale.ts` 방식을 따른다)
- 큰글씨 설정이 첫 렌더 전에 적용되지 않아 글자 크기가 깜빡이게 되는 변경 (`src/main.tsx` 의 `initFontScale()`)

### 문서

- 동작 · 구조가 바뀌었는데 그것을 설명하는 문서(`docs/`, `.claude/rules/`, `AGENTS.md`)가 그대로라 서로 모순되는 경우. 경로 끊김은 CI 가 잡으니 내용이 틀린 경우만 지적한다
