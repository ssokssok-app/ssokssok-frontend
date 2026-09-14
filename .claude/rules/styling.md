---
paths:
  - 'src/**/*.tsx'
  - 'src/index.css'
---

# 스타일 · 컴포넌트 규칙

## 큰글씨 모드

- 글자 크기는 `text-xs` ~ `text-4xl` 스케일 클래스만 쓴다. 임의 크기(`text-[13px]`)는 큰글씨 모드에서 커지지 않는다. `pnpm check:font-scale` 이 막는다.
- 원리와 값은 `src/index.css` 상단 주석, 모드 상태는 `src/hooks/useFontScale.ts` 의 `useFontScale()`.
- UI 를 바꾸면 일반 · 큰글씨 두 모드에서 모두 화면을 확인한다.

## shadcn / Base UI

- `src/components/ui/` 는 shadcn 레지스트리 원본이다. 직접 고치지 않는다 (다음 `shadcn add` 때 덮어쓰기 충돌). 바꿔야 하면 `src/components/` 에 감싸는 컴포넌트를 만든다.
- 추가는 `pnpm dlx shadcn@latest add <name>`, 그다음 `pnpm check:font-scale` 로 새 임의 크기에 큰글씨 보정이 필요한지 확인한다.
- 이 프로젝트의 shadcn 스타일(base-nova)은 **Base UI** 기반이다. Radix 예제의 `asChild` 는 없고 `render` prop 을 쓴다. API 가 헷갈리면 설치된 버전 문서 `node_modules/@base-ui/react/docs/` 를 본다.
- 링크를 버튼처럼 보이게 할 때 `<Button render={<Link />}>` 를 쓰지 않는다 (Base UI 는 버튼 의미를 강제한다). `<Link className={buttonVariants({ variant: 'outline' })}>` 처럼 스타일만 입힌다.
- 클래스 병합은 `cn` (`@/lib/utils`).

## 색 · 테마

- 색은 토큰 클래스(`bg-primary`, `text-muted-foreground` …)만 쓴다. 색 값을 직접 쓰지 않는다. 토큰 정의는 `src/index.css` 의 `:root` / `.dark`.
