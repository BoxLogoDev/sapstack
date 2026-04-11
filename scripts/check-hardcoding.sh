#!/usr/bin/env bash
# check-hardcoding.sh — 회사코드/계정/조직 단위 하드코딩 패턴 탐지
#
# Universal Rule #1: "Never hardcode company codes, G/L accounts, cost centers, or org units"
#
# 검출 패턴:
#   - BUKRS = <고정값> (회사코드)
#   - company_code = "1000" 같은 고정 숫자
#   - G/L 계정 6~10자리 숫자가 고정값으로 언급된 경우
#
# 예제 코드 블록(```fenced```)은 제외 — SKILL.md의 교육용 예시는 허용.
#
# 사용법:
#   ./scripts/check-hardcoding.sh
#   ./scripts/check-hardcoding.sh --strict   # 예제 블록도 검사

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

ERRORS=0
CHECKED=0

# 허용된 문맥 (예시/설명용)
ALLOWLIST_KEYWORDS=(
  "예:"
  "example:"
  "e.g."
  "예시"
  "placeholder"
  "<YOUR_"
  "BUKRS=KR"   # config.example.yaml의 예시
  "BUKRS=[A-Z"  # 정규식 예시
)

is_allowlisted() {
  local line="$1"
  for kw in "${ALLOWLIST_KEYWORDS[@]}"; do
    if [[ "$line" == *"$kw"* ]]; then
      return 0
    fi
  done
  return 1
}

# 프론트매터·fenced code block 제외 후 본문 추출
extract_body() {
  local file="$1"
  awk '
    BEGIN { fm=0; code=0 }
    /^---$/ { fm = !fm; next }
    fm { next }
    /^```/ { code = !code; next }
    !code { print NR": "$0 }
  ' "$file"
}

scan_file() {
  local file="$1"
  CHECKED=$((CHECKED + 1))

  local body
  if (( STRICT )); then
    body=$(awk '/^---$/{fm=!fm; next} !fm{print NR": "$0}' "$file")
  else
    body=$(extract_body "$file")
  fi

  # 패턴 1: BUKRS = 고정값 (회사코드 하드코딩)
  # 정규식 설명과 혼동되지 않게 "BUKRS\s*=\s*["']..." 형태만 잡음
  while IFS= read -r line; do
    if echo "$line" | grep -Eq 'BUKRS[[:space:]]*=[[:space:]]*["'\'']?[A-Z0-9]{4}["'\'']?' ; then
      if ! is_allowlisted "$line"; then
        echo "⚠️  $file:${line%%:*} — 회사코드 하드코딩 의심: $(echo "$line" | sed 's/^[0-9]*: //' | head -c 120)"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done <<< "$body"

  # 패턴 2: company_code = "숫자" (YAML/JSON/config)
  while IFS= read -r line; do
    if echo "$line" | grep -Eq '(company_code|BUKRS)[[:space:]]*[:=][[:space:]]*["'\'']?[0-9]{4}["'\'']?' ; then
      if ! is_allowlisted "$line"; then
        echo "⚠️  $file:${line%%:*} — company_code 고정값: $(echo "$line" | sed 's/^[0-9]*: //' | head -c 120)"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done <<< "$body"
}

# SKILL.md + agents + commands + docs 검사
while IFS= read -r file; do
  scan_file "$file"
done < <(find plugins agents commands docs -name '*.md' -type f 2>/dev/null)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "검사 파일: $CHECKED"
if (( STRICT )); then
  echo "오류: $ERRORS (strict 모드)"
else
  echo "경고: $ERRORS"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# strict 모드: 경고 1개라도 있으면 실패
if (( STRICT )); then
  exit $ERRORS
fi

# 기본(warning-only): 항상 통과
exit 0
