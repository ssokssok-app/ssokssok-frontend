/**
 * `import.meta.env` 로 읽는 VITE_* 환경 변수. 번들에 그대로 들어가므로 공개돼도 되는 값만 둔다.
 * 로컬은 `.env.local`, 배포는 Vercel 환경 변수에 넣는다 (docs/architecture.md "백엔드 연동").
 */
interface ImportMetaEnv {
  /** 카카오 로그인 REST API 키 */
  readonly VITE_KAKAO_REST_API_KEY?: string
  /** 구글 로그인 클라이언트 ID */
  readonly VITE_GOOGLE_CLIENT_ID?: string
}
