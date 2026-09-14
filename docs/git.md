# Git 규칙

## 커밋 메시지

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/ko/v1.0.0/) 형식에 제목만 한국어로 쓴다.

```text
type(scope): 제목

본문 (선택)

푸터 (선택)
```

### type

| type       | 언제                                    |
| ---------- | --------------------------------------- |
| `feat`     | 사용자가 느끼는 기능 추가 · 변경        |
| `fix`      | 버그 수정                               |
| `refactor` | 동작은 그대로 두고 구조만 바꿈          |
| `perf`     | 성능 개선                               |
| `style`    | 포맷만 바꿈 (동작 · 구조 변화 없음)     |
| `test`     | 테스트 추가 · 수정                      |
| `docs`     | 문서만 바꿈 (`CLAUDE.md`, `docs/` 포함) |
| `build`    | 의존성, 빌드 설정                       |
| `ci`       | CI 설정                                 |
| `chore`    | 그 밖의 잡무                            |
| `revert`   | 이전 커밋 되돌리기                      |

### scope

선택이다. 화면이나 도메인 이름을 영어 소문자로 쓴다 (`documents`, `auth`, `font-scale`, `harness`).

### 제목

- 한국어 명사형으로 끝낸다: "~추가", "~수정", "~분리", "~제거".
- 50자 이내로 쓰고 마침표를 찍지 않는다.
- "무엇을 했는지"를 쓴다. "수정함", "작업" 같은 모호한 말은 쓰지 않는다.

### 본문 · 푸터

본문에는 코드만 봐서는 알 수 없는 "왜"를 쓴다.

호환이 깨지는 변경은 type 뒤에 `!` 를 붙이고 푸터에 `BREAKING CHANGE:` 를 쓴다.

### 예시

```text
feat(documents): 문서 목록 화면 추가
fix(font-scale): 새로고침하면 큰글씨 설정이 풀리는 문제 수정
refactor(api): 문서 조회 queryOptions 를 도메인 파일로 분리
docs: 라우트 규칙을 .claude/rules 로 이동
build: vite 8.3 으로 업그레이드

feat(api)!: 변환 결과 응답 형식 변경

문단별로 쉬운 설명을 붙이려면 문자열 하나로는 표현할 수 없음

BREAKING CHANGE: result 가 string 에서 paragraphs 배열로 바뀜
```

### 커밋 단위

- 한 커밋에는 한 가지 변경만 담는다. 포맷 변경과 기능 변경을 섞지 않는다.
- 코드 변경으로 문서가 달라지면 문서 수정도 같은 커밋에 넣는다.

## 브랜치

- 기본 브랜치는 `main` 이다.
- 작업 브랜치는 `type/짧은-설명` 형식으로 영어 소문자와 하이픈만 쓴다. 이슈가 있으면 번호를 앞에 붙인다: `feat/12-document-list`.

## PR

- 제목도 커밋 메시지 형식으로 쓴다. squash merge 하면 PR 제목이 그대로 커밋 메시지가 된다.
- 본문에는 다음을 적는다.
  - 무엇을 왜 바꿨는지
  - 어떻게 검증했는지 (`pnpm verify` 결과)
  - 화면이 바뀌었으면 일반 · 큰글씨 모드 스크린샷

## Claude 가 커밋할 때

- 사용자가 요청할 때만 커밋 · push · PR 을 만든다.
- 커밋 전에 `pnpm verify` 가 통과해야 한다.
- 아직 commitlint 같은 도구로 강제하지 않는다. 커밋 전에 위 형식을 직접 확인한다.
