# 화면 (src/routes)

파일 기반 라우트와 각 화면의 동작이다. 규칙 원문은 `.claude/rules/routes.md` 와 `docs/architecture.md` 의 "데이터 흐름", 전체 리뷰 기준은 루트 `AGENTS.md`.

## Code Review Rules

### 카메라 · 사진 · 파일 (P0 · P1)

문서는 카메라 촬영, 사진첩 선택, PDF 파일로 넣는다.

- (P0) 화면을 떠나거나 촬영을 마친 뒤에도 카메라가 켜져 있는 경우. `getUserMedia` 로 받은 스트림은 컴포넌트가 사라질 때 모든 트랙을 `stop()` 한다
- 카메라 권한을 거부했거나 카메라가 없을 때 안내 없이 멈추는 경우. 이유를 쉬운 말로 알리고 사진첩 선택 같은 다른 방법을 보여 준다
- 파일 형식(이미지 · PDF)과 크기를 올리기 전에 확인하지 않아, 한참 기다린 뒤에야 실패하는 경우
- `URL.createObjectURL` 로 만든 미리보기 주소를 다 쓴 뒤 `URL.revokeObjectURL` 하지 않는 경우 (여러 장을 찍으면 메모리가 계속 는다)

### 결과 화면 (P1)

변환 결과는 따로 저장되지 않는다 (나가기 확인 모달 문구: "지금 나가면 다시 볼 수 없어요").

- 결과 화면에서 홈 · 닫기 · 뒤로 가기로 나갈 때 확인(`ConfirmModal`) 없이 결과를 잃는 경우. 다시 열 수 있는 샘플 결과는 제외
- 듣기(글 읽어 주기)를 켠 채 화면을 떠나도 소리가 계속 나는 경우. 화면이 사라질 때 멈춘다

### React (P1)

이 프로젝트는 React Compiler 를 쓴다.

- 렌더링 중에 props · state · 바깥 변수를 바꾸거나 `ref.current` 를 읽는 코드 (Compiler 가 잘못 최적화할 수 있다)
- 이벤트 처리나 props 로 계산할 수 있는 값을 `useEffect` 로 처리하는 경우
- 서버 데이터를 `useState` 에 복사해 두고 따로 고치는 경우. TanStack Query 캐시를 그대로 쓴다

### TanStack Query · Router (P1)

- `queryKey` 에 요청에 쓰는 값(문서 ID 등)이 빠져서 다른 데이터가 섞여 보이는 경우
- 데이터를 바꾸는 요청(mutation) 뒤에 관련 쿼리를 무효화 · 갱신하지 않아 화면에 옛 값이 남는 경우
- loader + `useSuspenseQuery` 를 쓰는 라우트에 오류 · 로딩 화면(`errorComponent` · `pendingComponent` 또는 상위 경계)이 없는 경우
- 경로를 문자열로 이어 붙여 이동하는 경우. `Link` · `navigate` 에 `to` 와 `params` 를 따로 넘겨 타입 검사를 받는다
- 검색 파라미터를 `validateSearch` 없이 읽어 잘못된 값에 화면이 깨지는 경우
