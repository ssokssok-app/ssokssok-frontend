---
paths:
  - 'src/**/*.tsx'
  - 'src/index.css'
---

# 스타일 · 컴포넌트 규칙

## 글자 · 큰글씨 모드

- 글자는 Figma 글자 스타일과 1:1 인 토큰만 쓴다. Figma `Body/Semibold` → `text-body-semibold`. 크기 · 줄높이 · 자간 · 굵기가 한 클래스에 들어 있으니 `font-semibold` · `leading-*` 를 덧붙이지 않는다.
- Figma `Body2/Regular` · `Body2/Medium` 은 `text-body2-regular` · `text-body2-medium` 이다. 글자는 Body 와 같고 문단 간격 8px 이 더해진 스타일이라, 문단들을 감싼 요소에 `gap-body2` 를 함께 준다 (예: 소제목 없는 쉬운 본문, 원문 보기). Body 와 값이 같아 보여도 Figma 가 Body2 를 쓴 곳에는 Body2 를 쓴다.
- 쓰지 않는 것: 임의 크기(`text-[13px]`, 큰글씨 모드에서 안 커짐), Tailwind 기본 단계(`text-sm` 등, shadcn 컴포넌트용). `pnpm check:font-scale` 이 막는다.
- 글자 토큰을 추가하면 `src/index.css` 의 `html[data-font-scale='large']` 에 +0.25rem 값도 넣는다. 빠지면 같은 검사가 실패한다.
- 원리와 값은 `src/index.css` 주석, 모드 상태는 `src/hooks/useFontScale.ts` 의 `useFontScale()`.
- UI 를 바꾸면 일반 · 큰글씨 두 모드에서 모두 화면을 확인한다.

## 공용 컴포넌트

- Figma 컴포넌트는 `@base-ui/react` 부품(Button, Dialog, Switch …)에 Figma 모양을 직접 입혀 `src/components/` 에 만든다. shadcn 컴포넌트는 새로 추가하지 않는다 (기본 스타일을 전부 덮어써야 해서 Figma 와 맞추기 어렵다). `pnpm check:design` 이 막는다.
- 파일 이름은 kebab-case, 컴포넌트 이름은 PascalCase 로 짓는다. 예: Figma CTA → 파일 cta-button.tsx, 컴포넌트 CtaButton.
- Figma 의 고정 폭 · 높이(353px, 64px)를 그대로 쓰지 않는다. 폭은 부모를 따르고 높이는 여백으로 잡아, 큰글씨 모드에서 글자가 잘리지 않고 늘어나게 한다.
- 컴포넌트는 모양과 동작만 맡는다. API 호출 · 화면 이동은 페이지에서 props 로 넘긴다.
- 새 컴포넌트나 variant 를 만들면 개발 모드 카탈로그(`/dev/components`)에 추가하고, Figma 와 일반 · 큰글씨 두 모드로 비교한다. 섹션은 `src/routes/dev/-catalog/` 에 두고 `src/routes/dev/components.tsx` 에서 모은다.
- 링크에 버튼 모양이 필요하면 cva 스타일 함수를 컴포넌트 파일과 다른 파일로 빼서 export 한다. 컴포넌트 파일에서 함수를 같이 export 하면 oxlint 가 경고한다 (Fast Refresh).
- Figma 에 없는 상태(눌림 · 비활성)는 같은 팔레트에서 한 단계 진한 색(active) · 투명도 40%(disabled)로 맞춘다.
- 누를 수 있는 요소는 `<button>` 이나 Base UI 부품(역할이 붙음)으로 만든다. 데스크톱 손가락 커서는 `src/index.css` 전역 규칙이 이 요소들에만 주므로, `cursor-pointer` 를 따로 붙이지 않는다.
- Base UI 는 Radix 와 달리 `asChild` 가 없고 `render` prop 을 쓴다. API 가 헷갈리면 설치된 버전 문서 `node_modules/@base-ui/react/docs/` 를 본다.
- 클래스 병합은 `cn` (`@/lib/utils`). `src/index.css` 에 직접 만든 토큰은 `cn` 설정에도 등록해야 병합 때 지워지지 않는다. 빠뜨리면 `pnpm check:tokens` 가 실패한다.

## 화면 폭 (데스크톱)

- 모든 화면은 루트 레이아웃의 앱 폭 기둥(`max-w-app`, 600px) 안에 그려진다. 페이지는 폭 제한(`max-w-md` 등)을 따로 두지 않고 기둥을 꽉 채운다.
- `fixed` 로 화면에 붙는 요소(아래 고정 버튼, 바텀시트 등)는 화면 전체가 아니라 기둥에 맞춘다: `fixed inset-x-0 mx-auto max-w-app`. `100vw` · `w-screen` 은 쓰지 않는다. 어두운 배경(backdrop)만 화면 전체를 덮는다.
- 넓은 화면에서도 확인한다 (예: 1440×900). 기둥 밖으로 넘치거나 기둥보다 넓게 붙는 요소가 없어야 한다.

## 아이콘

- Figma 아이콘은 `src/assets/icons/{20,24,32}/` 에 있다. `import CloseIcon from '@/assets/icons/24/close.svg?react'` 로 불러온다.
- 색은 `currentColor` 라서 `text-gray-500` 처럼 부모나 아이콘의 글자 색으로 정한다. 체크 아이콘(`checked`)은 흰 체크 표시만 고정이다.
- 아이콘을 직접 그리거나 lucide 등 다른 아이콘으로 바꾸지 않는다. 새 아이콘은 Figma 에서 SVG 로 내보내, 색만 `currentColor` 로 바꿔 추가한다.

## shadcn 원본

- `src/components/ui/` 는 shadcn 레지스트리 원본이다. 직접 고치지 않는다 (다음 `shadcn add` 때 덮어쓰기 충돌).
- 예외로 shadcn 컴포넌트를 추가해야 하면 먼저 사용자와 정하고, `scripts/check-design.mjs` 의 허용 목록에 넣는다. 추가는 `pnpm dlx shadcn@latest add <name>`, 그다음 `pnpm check:font-scale` 로 새 임의 크기에 큰글씨 보정이 필요한지 확인한다.
- 링크를 버튼처럼 보이게 할 때 `<Button render={<Link />}>` 를 쓰지 않는다 (Base UI 는 버튼 의미를 강제한다). `<Link className={buttonVariants({ variant: 'outline' })}>` 처럼 스타일만 입힌다.

## 색 · 테마

- 화면 코드의 색은 Figma 색 스타일 이름을 그대로 쓴다. Figma `Gray/500` → `text-gray-500`. 예외는 `Common/0` · `Common/100` → `black` · `white`, `Status/Red` → `status-red`.
- 그라디언트는 `bg-gradient-background` · `bg-gradient-main` · `bg-gradient-line` · `bg-gradient-must-header`, 그라디언트 테두리는 `border-gradient-line` (두께는 `border-[1.4px]` 처럼 따로), 모달 뒤 배경은 `bg-dimmed`.
- Figma 스타일에 없고 컴포넌트에만 쓰인 값도 `src/index.css` 에 토큰으로 모은다: `bg-kakao`, 그림자 `shadow-knob` · `shadow-modal` · `shadow-popover`. 새 값이 필요하면 같은 곳에 추가하고 `cn` 에 등록한다.
- 색 값(`bg-[#2c62ea]`, `shadow-[…rgba(…)]`, `style={{ color: '#fff' }}`)을 직접 쓰지 않는다. `pnpm check:design` 이 막는다. Tailwind 기본 색(`bg-red-500` 등)은 지워서 클래스가 생기지 않는다.
- shadcn 의미 토큰(`primary`, `muted-foreground` …)은 shadcn 컴포넌트가 Figma 색을 따르게 하는 연결이다. 연결 표는 `src/index.css` 의 `:root`. Figma 에 다크 디자인이 없어 `.dark` 는 shadcn 기본값 그대로다.
