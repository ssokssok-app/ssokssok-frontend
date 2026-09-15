# 쏙쏙 (ssokssok) 웹 프론트엔드

어려운 글을 AI 로 **쉬운 정보**로 바꿔 주는 서비스다. 주 사용자는 고령층, 발달장애인, 외국인 노동자다.
글을 읽기 어려운 사람이 쓰는 앱이므로 **앱 화면 자체도 쉬워야 한다**. 화면은 Figma 디자인을 따른다. 자세한 내용은 `docs/product.md`.

## 스택

Vite 8 · React 19 (React Compiler) · TypeScript 7 · TanStack Router (파일 기반) · TanStack Query · Tailwind CSS v4 · Base UI (**Radix 아님**, 공용 컴포넌트의 바탕) · pnpm
백엔드는 FastAPI (별도 레포). dev 서버가 `/api` 를 `localhost:8000` 으로 프록시한다.

## 명령어

- `pnpm dev`: 개발 서버. `/dev/components` 에서 공용 컴포넌트 카탈로그를 본다 (개발 모드 전용)
- `pnpm check`: 라우트 생성 + lint + 타입 + 포맷 검사 + 하네스 검사 (빌드 제외, 빠름)
- `pnpm verify`: `pnpm check` + 프로덕션 빌드. **작업을 끝내기 전에 통과해야 한다**
- `pnpm format`: 포맷 자동 수정

전체 목록의 기준은 `package.json` 의 scripts 다.

## 작업 흐름

1. **탐색**: 아래 지도에서 관련 문서를 찾아 읽고, 고칠 코드를 먼저 읽는다.
2. **계획**: 여러 파일에 걸치거나 방향 선택이 필요한 작업은 구현 전에 계획을 보여 준다.
3. **구현**: 작은 단위로 나눠 진행한다.
4. **검증**: `pnpm verify` 를 통과시킨다. 화면을 바꿨으면 dev 서버를 띄워 브라우저에서 일반 · 큰글씨 두 모드를 확인한다.
5. **문서**: 아래 "문서 최신화"를 확인한다.
6. **보고**: 무엇을 바꿨는지와 검증 결과(실제 명령 출력)를 적는다. 확인하지 못한 것은 확인하지 못했다고 적는다.

## 지도

| 필요할 때                                 | 문서                       |
| ----------------------------------------- | -------------------------- |
| 사용자 · UX 판단, 화면 문구               | `docs/product.md`          |
| 폴더 역할, 데이터 흐름, API 연동          | `docs/architecture.md`     |
| API 계약 초안, 백엔드에 확인할 것         | `docs/api-contract.md`     |
| 커밋 · 브랜치 · PR                        | `docs/git.md`              |
| CI · 배포(Vercel) · 레포 설정             | `docs/ci.md`               |
| 훅 · 검사 스크립트 · 문서 체계            | `docs/harness.md`          |
| 스타일 · 컴포넌트 (tsx 작업 시 자동 로드) | `.claude/rules/styling.md` |
| 라우트 (routes 작업 시 자동 로드)         | `.claude/rules/routes.md`  |
| 코드 리뷰 기준 (Codex · Claude 공통)      | `AGENTS.md`                |

## 반드시 지킬 것

- `src/routeTree.gen.ts` 는 생성물이다. 직접 고치지 않는다.
- 공용 컴포넌트는 Figma 를 따라 Base UI 로 `src/components/` 에 만든다. `src/components/ui/` 는 shadcn 원본이라 고치지 않는다.
- 글자 크기 · 색은 Figma 토큰(`text-body-regular`, `bg-blue-500`)만 쓴다. 임의 크기는 큰글씨 모드에서 커지지 않는다.
- `VITE_*` 환경 변수에 비밀값을 넣지 않는다 (번들에 그대로 노출된다).
- 문서 · 코드 주석 · 커밋 메시지는 한국어로, 식별자는 영어로 쓴다.
- 커밋 · push · PR 은 사용자가 요청할 때만 한다.

## 하네스 (자동으로 도는 것)

- **파일 수정 직후**: Prettier 로 자동 포맷하고, oxlint 오류가 있으면 바로 알려 준다.
- **응답을 끝낼 때**: 변경이 있으면 `pnpm check` 가 돌고, 실패하면 끝낼 수 없다.
- **같은 실수가 두 번 나오면**: 이 파일에 문장을 보태기 전에 lint 규칙, `scripts/` 검사, 훅으로 막을 수 있는지 먼저 본다. 순서는 `docs/harness.md` 참고.

## 문서 최신화

코드와 문서가 다르면 문서가 틀린 것이다. 아래를 바꾸는 작업은 **같은 작업 안에서** 문서도 고친다.

- 명령어 · 스크립트 → 이 파일의 "명령어"
- 폴더 구조, 데이터 흐름, 라이브러리 추가 · 교체 → `docs/architecture.md`
- 스타일 · 컴포넌트 · 라우트 규칙 → `.claude/rules/`
- 훅 · 검사 스크립트 → `docs/harness.md`
- CI 워크플로 · 레포 설정 · 배포 설정(`vercel.json`), 테스트 도입 → `docs/ci.md`
- 제품 결정 (`docs/product.md` 의 "확인 필요" 항목이 정해짐) → `docs/product.md`

문서가 언급하는 경로 · 명령어가 사라지면 `pnpm check` 가 실패한다. 문서에서 다루는 파일을 고쳤는데 문서를 그대로 두면 종료 훅이 알려 준다.
문서 전체 점검은 `/sync-docs` 로 한다. 이 파일은 지도로만 쓰고 100줄을 넘기지 않는다. 세부 내용은 `docs/` 에 둔다.
