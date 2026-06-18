#!/usr/bin/env bash
# check-eval-goldset.sh — eval gold-set 참조 무결성 검증 (API 불필요, CI 편입용)
#
# 동작 (LLM 호출 0 — 비용 0):
#   1. data/eval/gold-set.yaml 의 case id 중복 검사
#   2. 각 case 의 symptom_ref 가 data/symptom-index.yaml 에 실재하는지
#   3. 각 case 의 expected.must_tcodes 가 data/tcodes.yaml 에 실재하는지
#      (따옴표 슬래시 T-code "V/08", "/SCWM/WAVE" 포함)
#   4. 필수 필드(id, symptom_ref, must_tcodes) 누락 검사
#
# 사용법:
#   ./scripts/check-eval-goldset.sh
#   ./scripts/check-eval-goldset.sh --strict   # 경고를 오류로 (CI fail)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

GOLD="data/eval/gold-set.yaml"
SYM="data/symptom-index.yaml"
TC="data/tcodes.yaml"

for f in "$GOLD" "$SYM" "$TC"; do
  if [[ ! -f "$f" ]]; then
    echo "❌ 필수 파일 없음: $f"
    exit 1
  fi
done

# ── 알려진 집합 추출 ───────────────────────────────────────────
# 알려진 symptom id
KNOWN_SYMS=$(grep -E '^  - id: sym-' "$SYM" | sed 's/.*id: //' | sort -u)
# 알려진 T-code (최상위 키, 따옴표/슬래시 포함). 들여쓰기·주석 제외, 첫 콜론 앞만.
KNOWN_TCODES=$(awk '/^[^[:space:]#]/ { l=$0; sub(/:.*/,"",l); gsub(/"/,"",l); if(l!="") print l }' "$TC" | sort -u)

ERRORS=0
WARN=0

# ── case id 중복 검사 ─────────────────────────────────────────
DUP=$(grep -E '^  - id: eval-' "$GOLD" | sed 's/.*id: //' | sort | uniq -d || true)
if [[ -n "$DUP" ]]; then
  echo "❌ 중복 case id:"
  echo "$DUP" | sed 's/^/   - /'
  ERRORS=$((ERRORS + 1))
fi

CASE_COUNT=$(grep -cE '^  - id: eval-' "$GOLD")

# ── case 단위 검증 ────────────────────────────────────────────
# awk 로 (id, symptom_ref, must_tcodes 인라인) 를 TAB 구분으로 평탄화
PARSED=$(awk '
  /^  - id: eval-/ { if(cur!="") emit(); cur=$0; sub(/.*id: /,"",cur); sref=""; mtc="" }
  /^    symptom_ref:/ { sref=$0; sub(/.*symptom_ref: /,"",sref) }
  /^      must_tcodes:/ {
    mtc=$0; sub(/.*must_tcodes:[[:space:]]*\[/,"",mtc); sub(/\].*/,"",mtc)
  }
  END { if(cur!="") emit() }
  function emit() { printf "%s\t%s\t%s\n", cur, sref, mtc }
' "$GOLD")

while IFS=$'\t' read -r id sref mtc; do
  [[ -z "$id" ]] && continue

  # 필수 필드
  if [[ -z "$sref" ]]; then
    echo "❌ [$id] symptom_ref 누락"
    ERRORS=$((ERRORS + 1))
  else
    if ! grep -qxF "$sref" <<< "$KNOWN_SYMS"; then
      echo "❌ [$id] symptom_ref '$sref' 가 symptom-index 에 없음"
      ERRORS=$((ERRORS + 1))
    fi
  fi

  if [[ -z "$mtc" ]]; then
    echo "❌ [$id] expected.must_tcodes 누락/비어있음"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # must_tcodes 인라인 배열 분해 (쉼표 분리, 따옴표/공백 제거)
  IFS=',' read -ra TCS <<< "$mtc"
  for raw in "${TCS[@]}"; do
    t=$(echo "$raw" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//; s/^"//; s/"$//')
    [[ -z "$t" ]] && continue
    if ! grep -qxF "$t" <<< "$KNOWN_TCODES"; then
      echo "❌ [$id] must_tcode '$t' 가 tcodes.yaml 에 없음"
      ERRORS=$((ERRORS + 1))
    fi
  done
done <<< "$PARSED"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "gold-set case: ${CASE_COUNT}건"
echo "알려진 symptom: $(echo "$KNOWN_SYMS" | grep -c . )개 / T-code: $(echo "$KNOWN_TCODES" | grep -c .)개"
echo "오류: ${ERRORS}건 / 경고: ${WARN}건"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( ERRORS > 0 )); then
  echo "❌ gold-set 참조 무결성 검증 실패"
  exit 1
fi

echo "✅ gold-set 참조 무결성 OK"
exit 0
