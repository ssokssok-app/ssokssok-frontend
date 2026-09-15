# CI · 레포 설정

## 지금 도는 검사

| 검사            | 설정 위치                                    | 언제                                                     | 하는 일                                                                                                                                            |
| --------------- | -------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify`        | `.github/workflows/ci.yml`                   | PR, `main` push                                          | `pnpm verify` 실행(로직 테스트 `pnpm test` 는 그 안의 `pnpm check` 에서 돈다, 2026-09-16 도입), 생성 파일(`routeTree.gen.ts` 등)을 커밋했는지 확인 |
| `pr-title`      | `.github/workflows/pr-title.yml`             | PR 열기 · 제목 수정 · push                               | PR 제목이 `docs/git.md` 커밋 형식인지 확인                                                                                                         |
| CodeQL          | GitHub 설정 (Code security → default setup)  | PR, `main` push, 주기적                                  | JS/TS · 워크플로 보안 취약점 스캔                                                                                                                  |
| Vercel 배포     | Vercel 프로젝트 설정 + `vercel.json`         | PR push(미리보기), `main` push(실서비스)                 | 빌드해서 배포하고 PR 에 미리보기 주소를 코멘트로 단다. 병합 필수 조건은 아니다. 자세한 내용은 아래 "배포"                                          |
| Codex 코드 리뷰 | ChatGPT Codex 설정 (Code review) + GitHub 앱 | PR 에 `@codex review` 코멘트, 자동 리뷰를 켰으면 PR 마다 | `AGENTS.md` 의 `## Code Review Rules` 기준으로 리뷰 코멘트. 병합 필수 조건은 아니다. 한 번만 초점을 줄 때는 `@codex review for 개인정보` 처럼 쓴다 |

## 레포 설정 (파일 없이 GitHub 에서 관리)

- **`main` 규칙 (Settings → Rules → Rulesets → `main`)**
  - PR 을 거쳐야만 병합할 수 있다. 직접 push, 강제 push, 브랜치 삭제는 금지다.
  - `verify` · `pr-title` 을 통과해야 병합된다.
  - 저장소 관리자는 PR 화면에서만 규칙을 우회해 병합할 수 있다 (급할 때용).
- **병합 방식:** squash merge 만 허용한다. PR 제목이 커밋 제목이 되고, 병합한 브랜치는 자동 삭제된다.
- **보안:** 비밀값 스캔과 푸시 차단(push protection)이 켜져 있다. 토큰 같은 값이 든 커밋은 push 단계에서 막힌다.

## 배포 (Vercel)

`main` 에 병합되면 실서비스 주소 `https://www.ssokssok.site` 에 배포되고, PR 마다 미리보기 주소가 생긴다.

### 레포에 있는 설정 (`vercel.json`)

JSON 이라 주석을 달 수 없어 여기에 이유를 적는다.

- `framework` · `buildCommand` · `outputDirectory`: Vite 로 `pnpm build` 해서 `dist` 를 올린다. 설치 명령은 적지 않는다. Vercel 이 `pnpm-lock.yaml` 을 보고 pnpm 으로 설치한다 (설치 명령을 직접 적으면 오래된 pnpm 이 쓰일 수 있다)
- `rewrites` `/api`: `https://ssokssok-backend.fly.dev/api` 로 넘긴다. 프론트와 같은 도메인이라 리프레시 토큰 쿠키가 우리 사이트 쿠키가 되고 CORS 가 필요 없다 (`docs/api-contract.md` "웹 토큰 저장"). 넘긴 요청은 백엔드가 120초 안에 응답을 시작해야 한다 (변환은 작업 ID 를 바로 받고 폴링하므로 해당 없음)
- `/api` 캐시 끄기(`x-vercel-enable-rewrite-caching: 0`): 2026-04-06 이후 만든 Vercel 프로젝트는 넘긴 응답을 백엔드 캐시 헤더대로 CDN 에 캐시한다. 개인 문서 · 음성 · 계정 응답이 다른 사람에게 가지 않게 끈다
- `rewrites` 나머지: 파일이 없는 주소는 모두 `index.html` 을 돌려준다. 화면 이동은 브라우저에서 하므로, 없으면 `/samples/fine` 에서 새로고침하거나 주소를 바로 열 때 404 가 난다. 빌드 파일이 담긴 assets 주소와 `/api` 는 빼서, 새로 배포한 뒤 사라진 옛 파일을 요청하면 HTML 대신 404 를 준다
- assets 주소 1년 캐시: 파일 이름에 내용 해시가 붙어 내용이 바뀌면 이름도 바뀐다
- 보안 헤더: `X-Content-Type-Options: nosniff`(파일 종류 추측 금지), `Referrer-Policy`(다른 사이트로 갈 때 주소 전체를 넘기지 않음), `X-Frame-Options: DENY`(다른 사이트가 iframe 으로 넣어 누르게 하는 공격 방지)
- Node 버전: Vercel 은 `.nvmrc` 를 읽지 않고 `package.json` 의 `engines.node` 를 쓴다. 둘이 다르면 `pnpm check:ci` 가 실패한다

### Vercel 에서 관리하는 설정 (파일 없음)

- **Git 연결:** `ssokssok-app/ssokssok-frontend`, 실서비스 브랜치 `main`
- **환경 변수:**
  - `ENABLE_EXPERIMENTAL_COREPACK=1`. `package.json` 의 `packageManager` 에 적은 pnpm 버전으로 설치해 CI 와 맞춘다
  - `VITE_KAKAO_REST_API_KEY` · `VITE_GOOGLE_CLIENT_ID` (Production). 번들에 들어가는 공개 값이라 Sensitive 가 아닌 일반 값으로 둔다 (`docs/architecture.md` "백엔드 연동"). 빌드할 때 들어가므로 값을 바꾸면 다시 배포해야 반영된다
- **도메인:** `www.ssokssok.site` 가 대표 주소, `ssokssok.site` 는 대표 주소로 넘긴다 (Vercel 권장. www 는 CNAME 으로 연결돼 Vercel 이 트래픽을 더 유연하게 돌릴 수 있다). DNS 는 도메인을 산 곳에서 A · CNAME 레코드로 연결한다 (값은 Vercel Domains 화면에 나오는 값). 카카오 · 구글 로그인 콘솔에는 대표 주소를 등록한다
- **Deployment Protection:** 미리보기 주소를 누가 볼 수 있는지 정한다. Hobby 기본값(Standard Protection)은 Vercel 에 로그인한 프로젝트 소유자만 미리보기를 볼 수 있다

### 아직 없는 것

- 사진 여러 장 업로드 확인: Vercel 이 넘기는 요청의 본문 크기 제한은 문서에 없다 (함수의 4.5MB 제한과 다름). 배포에서 10장(약 10MB) 변환을 올려 확인한다. 막히면 업로드만 백엔드 주소로 바로 보내고 CORS 를 연다
- CSP(불러올 수 있는 스크립트 · 주소 제한): 로그인 · 클로바 · 백엔드가 붙어 불러올 주소가 정해지면 추가한다
- 없는 주소 화면(404): 지금은 라우터 기본 문구가 보인다

## 워크플로 작성 규칙

- 액션은 태그가 아니라 **커밋 SHA 로 고정**하고 옆에 버전을 주석으로 적는다. 태그는 바꿔치기될 수 있다.
- 액션 업데이트는 수동으로 한다 (Dependabot 은 쓰지 않기로 했다). 올릴 때는 릴리스 노트에서 깨지는 변경을 확인한다.
- 워크플로마다 `permissions` 를 최소로 선언하고 `concurrency` 와 `timeout-minutes` 를 둔다.
- `run:` 안에 PR 제목 · 본문 · 브랜치 이름 같은 외부 입력을 직접 넣지 않는다. 필요하면 `env:` 로 넘긴다.
- **job 이름(`verify`, `pr-title`)은 `main` 규칙의 필수 체크 이름이다.** 바꾸면 규칙도 같이 바꾼다. 안 바꾸면 모든 PR 이 병합 대기 상태로 멈춘다.
- Node 버전의 기준은 `.nvmrc`(배포용 `engines.node` 도 같이 바꾼다), pnpm 버전의 기준은 `package.json` 의 `packageManager` 다.

## 나중에 추가할 것

조건이 되면 추가하고, 이 목록에서 지운 뒤 위 "지금 도는 검사"로 옮긴다.
1번은 잊지 않도록 `pnpm check:ci` 가 조건을 감지하면 실패시킨다. 로직 테스트(Vitest)는 이미 옮겼고, 테스트 파일이 있는데 CI 가 `pnpm test` 를 돌리지 않으면 같은 검사가 실패시킨다.

| #   | 언제                   | 무엇을                                                                     | 메모                                                                                                                                                     |
| --- | ---------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 백엔드 API 가 안정되면 | **Playwright E2E + axe 접근성 검사** + CI 에 `test:e2e` 스크립트 단계 추가 | 일반 · 큰글씨 두 모드 모두 검사. 이 서비스에서 가장 중요한 CI. 주요 화면은 이미 있고, 백엔드 응답을 흉내 낼 준비가 커서 API 가 자주 바뀌는 동안은 미룬다 |
| 2   | 배포 이후              | **Lighthouse CI**, 번들 크기 검사                                          | 저사양 기기 · 느린 네트워크 사용자 고려                                                                                                                  |
| 3   | 필요해지면             | 주기적 문서 점검 에이전트                                                  | API 키와 비용이 든다. PR 리뷰는 Codex 로 하고 있다 (위 표)                                                                                               |
| 4   | 사진 넣기를 고칠 때    | `useDocumentDraft` · 사진 줄이기 테스트                                    | 파일 · 캔버스를 흉내 내야 해서(jsdom 등) 로직 테스트에서 뺐다                                                                                            |
