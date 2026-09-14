# 공용 컴포넌트

Figma Component 섹션을 옮긴 공용 컴포넌트다. 규칙 원문은 `.claude/rules/styling.md`, 전체 리뷰 기준은 루트 `AGENTS.md`.

## Code Review Rules

### Figma 디자인 시스템 (P1)

- 이미 같은 역할의 컴포넌트가 있는데 비슷한 모양을 새로 만든 경우 (예: CTA 모양 버튼을 따로 만듦). 기존 컴포넌트에 variant 를 추가한다
- 화면 코드에서 shadcn 의미 토큰(`bg-primary`, `text-muted-foreground`)을 쓴 경우. Figma 이름(`bg-blue-500`, `text-gray-500`)을 쓴다. 의미 토큰은 `src/components/ui/` 가 Figma 색을 따르게 하는 연결용이다
- 글자 토큰(`text-body-semibold`)에 `font-*` · `leading-*` · `tracking-*` 를 덧붙여 Figma 글자 스타일과 달라지는 경우
- 아이콘을 `<svg>` 로 직접 그리거나 lucide 같은 다른 아이콘을 쓴 경우. `src/assets/icons/` 의 Figma 원본을 `?react` 로 불러온다
- Figma 스타일에 없는 새 토큰을 `src/index.css` 에 추가하면서 어디서 온 값인지(Figma 레이어 · 결정 문서) 주석이 없는 경우

### 컴포넌트 경계 (P1)

- 컴포넌트 안에서 API 호출 · 화면 이동 · 전역 상태 변경을 하는 경우. 페이지에서 props 로 넘긴다. 예외: `BigFontSwitch` · `HomeGnb` 는 큰글씨 설정을 직접 읽고 바꾼다
- 새 컴포넌트나 variant 를 카탈로그(`src/routes/dev/-catalog/`)에 추가하지 않은 경우. 카탈로그에서 Figma 와 일반 · 큰글씨 두 모드로 비교한다
- `className` 을 `cn()` 없이 문자열로 이어 붙여, 밖에서 준 클래스가 기본 클래스를 덮어쓰지 못하는 경우

### Base UI (P1)

- Base UI 가 주는 역할 · 키보드 동작을 깨는 경우: 대화상자에 `Dialog.Title` 이 없음, 닫을 방법이 없음, `render` prop 에 버튼이 아닌 요소를 넣으면서 `nativeButton={false}` 를 주지 않음
- 나가기 · 삭제처럼 되돌릴 수 없는 행동을 확인받는 창을 `AlertDialog` 가 아닌 `Dialog` 로 만들어, 바깥을 누르면 닫히는 경우
