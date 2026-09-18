---
name: sync-docs
description: CLAUDE.md, docs/, .claude/rules 가 현재 코드와 맞는지 점검하고 낡거나 중복된 내용을 고친다. 큰 작업을 마친 뒤, 문서 내용이 코드와 다르다고 의심될 때, 사용자가 문서 정리를 요청할 때 사용한다.
---

# 문서 점검 (doc gardening)

에이전트 문서가 코드와 어긋나면 이후 모든 작업이 틀린 전제에서 시작한다. 아래 순서로 점검한다.

1. `pnpm check:docs` 를 돌려 끊어진 경로 · 명령어 · 링크부터 고친다.
2. 최근에 무엇이 바뀌었는지 파악한다. git 저장소면 최근 커밋 로그와 diff 통계를, 아니면 파일 수정 시각을 본다.
3. 문서의 주장 하나하나를 원본과 대조한다.
   - `CLAUDE.md` 의 명령어 ↔ `package.json` scripts
   - `docs/architecture.md` 의 폴더 표 ↔ 실제 `src/` 폴더, 데이터 흐름 ↔ 실제 코드
   - `.claude/rules/` ↔ `components.json`, `src/index.css`, `vite.config.ts`
   - `docs/harness.md` ↔ `.claude/settings.json`, `.claude/hooks/`, `scripts/`
   - `docs/product.md` 의 "확인 필요" 항목 중 코드나 대화로 확정된 것
   - `README.md` 의 기능 · 시작하기 · 명령어 ↔ 실제 화면, `package.json`, `.env.example`. 화면이 크게 바뀌었으면 `docs/images/` 사진도 다시 찍는다
4. 고친다.
   - 코드를 읽으면 알 수 있는 내용은 문서에서 지운다. 코드가 원본이다.
   - 같은 내용이 두 곳에 있으면 한 곳에만 남기고 나머지는 그곳을 가리키게 한다.
   - `CLAUDE.md` 는 지도다. 100줄을 넘으면 세부 내용을 `docs/` 나 `.claude/rules/` 로 옮긴다.
   - 서로 모순되는 규칙은 임의로 고르지 말고 사용자에게 묻는다.
   - 글로만 적힌 규칙 중 도구(oxlint 규칙, `scripts/` 검사, 훅)로 강제할 수 있는 것은 제안한다.
5. `pnpm check` 가 통과하면 문서별로 무엇을 왜 바꿨는지 짧게 보고한다.
