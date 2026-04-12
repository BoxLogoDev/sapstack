#!/usr/bin/env bash
# check-best-practices.sh — Best Practice 문서 3-Tier 구조 검증
#
# v1.6.0: 모듈별 BP가 3-Tier 구조 (operational/period-end/governance)를 따르는지 검증
#
# 사용법:
#   ./scripts/check-best-practices.sh
#   ./scripts/check-best-practices.sh --strict

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

TOTAL_MODULES=0
COMPLETE=0
PARTIAL=0
MISSING=0

TIERS=("operational.md" "period-end.md" "governance.md")

echo "🔍 Best Practice 3-Tier Check"
echo "═══════════════════════════════════════"

# 공통 BP 확인
echo ""
echo "📁 공통 Best Practice (docs/best-practices/)"
bp_common_dir="docs/best-practices"
if [[ -d "$bp_common_dir" ]]; then
  common_count=$(find "$bp_common_dir" -name "*.md" -not -name "README.md" | wc -l)
  echo "  ✅ $common_count개 공통 문서"
else
  echo "  ❌ docs/best-practices/ 디렉토리 없음"
fi

echo ""
echo "📁 모듈별 Best Practice"

# 각 플러그인의 best-practices/ 디렉토리 순회
for plugin_dir in plugins/*/; do
  plugin_id=$(basename "$plugin_dir")
  bp_dir="$plugin_dir/skills/$plugin_id/references/best-practices"

  # sap-session은 BP 대상이 아님
  if [[ "$plugin_id" == "sap-session" ]]; then
    continue
  fi

  TOTAL_MODULES=$((TOTAL_MODULES + 1))

  if [[ ! -d "$bp_dir" ]]; then
    echo "  ❌ $plugin_id: best-practices/ 없음"
    MISSING=$((MISSING + 1))
    continue
  fi

  tier_found=0
  tier_missing=""

  for tier in "${TIERS[@]}"; do
    if [[ -f "$bp_dir/$tier" ]]; then
      tier_found=$((tier_found + 1))
    else
      tier_missing="${tier_missing}${tier} "
    fi
  done

  if [[ $tier_found -eq 3 ]]; then
    echo "  ✅ $plugin_id: 3/3 Tier 완성"
    COMPLETE=$((COMPLETE + 1))
  elif [[ $tier_found -gt 0 ]]; then
    echo "  ⚠️  $plugin_id: $tier_found/3 — 누락: $tier_missing"
    PARTIAL=$((PARTIAL + 1))
  else
    echo "  ❌ $plugin_id: 0/3 — BP 파일 없음"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
echo "═══════════════════════════════════════"
echo "📊 결과: $TOTAL_MODULES 모듈 — ✅ $COMPLETE 완성, ⚠️ $PARTIAL 부분, ❌ $MISSING 누락"

if [[ $MISSING -gt 0 && $STRICT -eq 1 ]]; then
  echo "❌ --strict 모드: $MISSING개 모듈 BP 누락으로 종료"
  exit 1
fi

echo "✅ Best Practice Check 완료"
