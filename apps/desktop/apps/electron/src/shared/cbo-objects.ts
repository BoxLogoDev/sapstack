/**
 * 커스텀 오브젝트(Z/Y) 이름 인식 — renderer(안내 프롬프트의 CBO 감지)와 main(변경 요청 초안) 공용.
 * 현업이 오류 팝업에서 보는 형태 그대로 잡는다: ZFI0171, zfi0171이(조사 붙음), SAPMZFI0010(모듈풀),
 * SAPLZFI01(함수그룹 메인), ZCL_FI_UTIL(클래스).
 */
const TOKEN_RE = /(?:^|[^A-Za-z0-9_])((?:SAP[ML])?[ZY][A-Za-z0-9_]{3,})/gi

/** 영어 문장의 your/zero/yesterday 같은 일반 단어를 걸러낸다 — 숫자·밑줄이 있거나 전부 대문자여야 오브젝트로 본다 */
function looksLikeObjectName(token: string): boolean {
  return /[0-9_]/.test(token) || token === token.toUpperCase()
}

/** 등장 순서 유지·대문자·중복 제거 */
export function extractCboObjects(text: string): string[] {
  const out: string[] = []
  for (const match of text.matchAll(TOKEN_RE)) {
    const token = match[1]
    if (!looksLikeObjectName(token)) continue
    const name = token.toUpperCase()
    if (!out.includes(name)) out.push(name)
  }
  return out
}

export function hasCboObject(text: string): boolean {
  return extractCboObjects(text).length > 0
}
