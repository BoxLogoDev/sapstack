#!/usr/bin/env bash
# check-img-references.sh — IMG 구성 가이드 형식 검증
#
# v1.6.0: IMG 가이드가 표준 형식을 따르는지 검증
# - overview.md 존재 여부
# - SPRO 경로 형식 (SPRO → 으로 시작)
# - 필수 섹션 존재 (구성 단계, 구성 검증)
#
# 사용법:
#   ./scripts/check-img-references.sh
#   ./scripts/check-img-references.sh --strict   # CI fail on issues

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

TOTAL=0
PASS=0
WARN=0
FAIL=0

echo "🔍 IMG Reference Check"
echo "═══════════════════════════════════════"

# 각 플러그인의 img/ 디렉토리 순회
for plugin_dir in plugins/*/; do
  plugin_id=$(basename "$plugin_dir")
  img_dir="$plugin_dir/skills/$plugin_id/references/img"

  # sap-session은 IMG 대상이 아님
  if [[ "$plugin_id" == "sap-session" ]]; then
    continue
  fi

  if [[ ! -d "$img_dir" ]]; then
    continue
  fi

  # overview.md 존재 확인
  if [[ ! -f "$img_dir/overview.md" ]]; then
    echo "  ⚠️  $plugin_id: overview.md 없음"
    WARN=$((WARN + 1))
  fi

  # 각 IMG 파일 검증
  for img_file in "$img_dir"/*.md; do
    if [[ ! -f "$img_file" ]]; then
      continue
    fi

    TOTAL=$((TOTAL + 1))
    filename=$(basename "$img_file")
    issues=""

    # SPRO 경로 형식 확인 (overview 제외)
    if [[ "$filename" != "overview.md" ]]; then
      if ! grep -q "SPRO" "$img_file" 2>/dev/null; then
        issues="${issues}SPRO 경로 누락; "
      fi
    fi

    # 구성 단계 섹션 확인 (overview 제외)
    if [[ "$filename" != "overview.md" ]]; then
      if ! grep -qE "구성 단계|Configuration Steps" "$img_file" 2>/dev/null; then
        issues="${issues}구성 단계 섹션 누락; "
      fi
    fi

    # 구성 검증 섹션 확인 (overview 제외)
    if [[ "$filename" != "overview.md" ]]; then
      if ! grep -qE "구성 검증|Verification|검증" "$img_file" 2>/dev/null; then
        issues="${issues}구성 검증 섹션 누락; "
      fi
    fi

    if [[ -z "$issues" ]]; then
      PASS=$((PASS + 1))
    else
      echo "  ❌ $plugin_id/$filename: $issues"
      FAIL=$((FAIL + 1))
    fi
  done
done

echo ""
echo "═══════════════════════════════════════"
echo "📊 결과: $TOTAL 파일 검사 — ✅ $PASS 통과, ⚠️ $WARN 경고, ❌ $FAIL 실패"

if [[ $FAIL -gt 0 && $STRICT -eq 1 ]]; then
  echo "❌ --strict 모드: $FAIL개 실패로 종료"
  exit 1
fi

if [[ $WARN -gt 0 && $STRICT -eq 1 ]]; then
  echo "⚠️  --strict 모드: $WARN개 경고 (overview.md 누락)"
fi

echo "✅ IMG Reference Check 완료"
