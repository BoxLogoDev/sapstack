#!/usr/bin/env bash
# check-ecc-s4-split.sh — SKILL.md에서 ECC/S4 차이가 명시되는지 확인
#
# 로직:
#   ECC와 관련된 키워드(BSEG, FD32, F.05, F.16, MSEG, classic)가 언급되는 SKILL.md에
#   S/4HANA 관련 키워드(ACDOCA, UKM_BP, FAGL_FC_VAL, FAGLGVTR, MATDOC, new)도 같이
#   언급되는지 검증.
#
# 일부 모듈은 ECC/S4 구분이 불필요할 수 있어 **warning-only**로 운영.
#
# 사용법:
#   ./scripts/check-ecc-s4-split.sh
#   ./scripts/check-ecc-s4-split.sh --strict   # warning을 오류로 변환

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

# ECC 전용 키워드
ECC_KEYWORDS=(BSEG FD32 "F\.05" "F\.16" MSEG "classic")

# S/4 전용 키워드
S4_KEYWORDS=(ACDOCA UKM_BP FAGL_FC_VAL FAGLGVTR MATDOC "S/4HANA")

WARNINGS=0
CHECKED=0

for skill_file in $(find plugins -name SKILL.md -type f 2>/dev/null); do
  CHECKED=$((CHECKED + 1))

  # 프론트매터 제외 본문
  body=$(awk 'BEGIN{fm=0} /^---$/{fm=!fm; next} !fm{print}' "$skill_file")

  has_ecc=0
  has_s4=0

  for kw in "${ECC_KEYWORDS[@]}"; do
    if echo "$body" | grep -Eq "$kw"; then
      has_ecc=1
      break
    fi
  done

  for kw in "${S4_KEYWORDS[@]}"; do
    if echo "$body" | grep -Eq "$kw"; then
      has_s4=1
      break
    fi
  done

  # ECC만 있고 S4 없거나, 그 반대면 경고
  if (( has_ecc && ! has_s4 )); then
    echo "⚠️  $skill_file — ECC 키워드는 있으나 S/4HANA 구분 없음"
    WARNINGS=$((WARNINGS + 1))
  elif (( has_s4 && ! has_ecc )); then
    # S4만 있는 경우는 S4 전용 모듈(sap-btp, sap-sfsf 등)에 해당하므로 경고 아님
    :
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "검사 SKILL.md: $CHECKED"
echo "ECC/S4 구분 누락 의심: $WARNINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( STRICT && WARNINGS > 0 )); then
  echo "❌ Strict 모드: ECC/S4 구분이 불명확한 파일이 있습니다"
  exit 1
fi

exit 0
