/** 문서를 넣는 방법. 홈의 큰 버튼 세 개와 짝이다 */
export type InputMethod = 'camera' | 'gallery' | 'file'

const inputMethods: readonly unknown[] = ['camera', 'gallery', 'file']

export function isInputMethod(value: unknown): value is InputMethod {
  return inputMethods.includes(value)
}

export interface HomeSearch {
  /**
   * 문서를 넣다가 로그인하러 다녀왔을 때, 이어서 진행할 입력 방법.
   * 로그인 뒤 콜백이 붙여 보내고, 홈은 지원 문서 안내부터 이어 띄운 뒤 주소에서 지운다.
   */
  resume?: InputMethod
}

/** 홈 라우트의 validateSearch. 모르는 값이면 이어서 진행하지 않는다 */
export function parseHomeSearch(search: Record<string, unknown>): HomeSearch {
  return isInputMethod(search.resume) ? { resume: search.resume } : {}
}
