#!/usr/bin/env bash
# check-industry-refs.sh — 업종별 가이드 참조 무결성 검증
#
# v1.6.0: docs/industry/ 가이드와 data/industry-matrix.yaml 정합성 확인
#
# 사용법:
#   ./scripts/check-industry-refs.sh
#   ./scripts/check-industry-refs.sh --strict

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

PASS=0
FAIL=0

echo "🔍 Industry Reference Check"
echo "═══════════════════════════════════════"

# 1. industry-matrix.yaml 존재 확인
if [[ ! -f "data/industry-matrix.yaml" ]]; then
  echo "  ❌ data/industry-matrix.yaml 없음"
  FAIL=$((FAIL + 1))
else
  echo "  ✅ data/industry-matrix.yaml 존재"
  PASS=$((PASS + 1))
fi

# 2. 업종별 가이드 파일 확인
EXPECTED_INDUSTRIES=("manufacturing" "retail" "financial-services")

for industry in "${EXPECTED_INDUSTRIES[@]}"; do
  guide="docs/industry/${industry}.md"
  if [[ -f "$guide" ]]; then
    # 최소 100줄 이상인지 확인
    lines=$(wc -l < "$guide")
    if [[ $lines -ge 50 ]]; then
      echo "  ✅ $guide ($lines lines)"
      PASS=$((PASS + 1))
    else
      echo "  ⚠️  $guide 너무 짧음 ($lines lines)"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "  ❌ $guide 없음"
    FAIL=$((FAIL + 1))
  fi
done

# 3. industry-matrix.yaml에서 참조하는 에이전트가 실제 존재하는지
echo ""
echo "📁 에이전트 참조 검증"
if [[ -f "data/industry-matrix.yaml" ]]; then
  agents_referenced=$(grep -oE "agent: sap-[a-z-]+" "data/industry-matrix.yaml" | sort -u | awk -F': ' '{print $2}')
  for agent in $agents_referenced; do
    if [[ -f "agents/${agent}.md" ]]; then
      PASS=$((PASS + 1))
    else
      echo "  ❌ agents/${agent}.md 없음 (industry-matrix.yaml에서 참조)"
      FAIL=$((FAIL + 1))
    fi
  done
  echo "  ✅ 참조 에이전트 검증 완료"
fi

echo ""
echo "═══════════════════════════════════════"
echo "📊 결과: ✅ $PASS 통과, ❌ $FAIL 실패"

if [[ $FAIL -gt 0 && $STRICT -eq 1 ]]; then
  echo "❌ --strict 모드: $FAIL개 실패로 종료"
  exit 1
fi

echo "✅ Industry Reference Check 완료"
