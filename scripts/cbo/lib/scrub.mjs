/**
 * scrub.mjs — 스냅샷 PII 처리
 *
 * 원칙 (mcp/pii-scrubber.ts 에서 파생 — 형식이 강한 것만 자동 마스킹):
 * - 자동 마스킹: 주민등록번호(6-7, 성별자리 검증) / 신용카드(4-4-4-4) / 사업자번호(3-2-5)
 *   — 형식이 강해 오탐이 드물고, 소스에 있어선 안 되는 데이터다.
 * - 리포트만: 계좌번호(국내 표준 형식 없음 — 휴대폰·전표번호와 충돌) / 휴대전화 /
 *   이메일 / 하드코딩 비밀번호 의심 — 자동 변형하면 사본·주석이 훼손된다.
 * 마스킹은 자릿수 보존 형태(끝 4자리 유지)로 diff 안정성을 유지한다.
 */

const MASK_PATTERNS = [
  { kind: 'resident_id', re: /\b(\d{6})[-\s]?([1-4]\d{6})\b/g },
  { kind: 'credit_card', re: /\b(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})\b/g },
  { kind: 'business_id', re: /\b(\d{3})-(\d{2})-(\d{5})\b/g },
]

const REPORT_PATTERNS = [
  { kind: 'bank_account', re: /\b\d{3}[-\s]\d{2,6}[-\s]\d{2,8}\b/g },
  { kind: 'mobile_phone', re: /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/g },
  { kind: 'email', re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { kind: 'hardcoded_secret', re: /\b(?:PASSWORD|PASSWD|PWD)\s*(?:=|EQ)\s*'[^']+'/gi },
]

function maskValue(match) {
  const digitsOnly = match.replace(/\D/g, '')
  const tail = digitsOnly.slice(-4)
  return match.replace(/\d/g, '*').slice(0, Math.max(0, match.length - 4)) + tail
}

/**
 * @param {string} text 소스 내용
 * @param {'off'|'report'|'mask'} mode
 * @returns {{ text: string, findings: Array<{kind:string,line:number,masked:boolean}> }}
 */
export function scrubSource(text, mode = 'mask') {
  if (mode === 'off') return { text, findings: [] }
  const findings = []
  const lines = text.split('\n')

  const scan = (patterns, masked) => {
    for (let i = 0; i < lines.length; i++) {
      for (const { kind, re } of patterns) {
        re.lastIndex = 0
        if (!re.test(lines[i])) continue
        findings.push({ kind, line: i + 1, masked })
        if (masked) {
          re.lastIndex = 0
          lines[i] = lines[i].replace(re, (m) => maskValue(m))
        }
      }
    }
  }

  scan(REPORT_PATTERNS, false)
  if (mode === 'mask') scan(MASK_PATTERNS, true)
  else scan(MASK_PATTERNS, false)

  return { text: lines.join('\n'), findings }
}
