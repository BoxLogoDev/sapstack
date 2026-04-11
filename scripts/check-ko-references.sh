#!/usr/bin/env bash
# check-ko-references.sh — 모든 플러그인에 한국어 quick-guide가 있는지 검증
#
# v1.3.0: 13개 모든 모듈에 references/ko/quick-guide.md 보장
#
# 사용법:
#   ./scripts/check-ko-references.sh
#   ./scripts/check-ko-references.sh --strict   # CI fail on missing

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

MISSING=0
PRESENT=0
FULL_TRANSLATION=0

# 각 플러그인 순회
for plugin_dir in plugins/*/; do
  plugin_id=$(basename "$plugin_dir")
  skill_dir="$plugin_dir/skills/$plugin_id"
  ko_dir="$skill_dir/references/ko"
  quick_guide="$ko_dir/quick-guide.md"
  full_skill_ko="$ko_dir/SKILL-ko.md"

  if [[ ! -f "$quick_guide" ]]; then
    echo "❌ [$plugin_id] 한국어 퀵가이드 누락: $quick_guide"
    MISSING=$((MISSING + 1))
    continue
  fi

  PRESENT=$((PRESENT + 1))

  # 전문 번역본이 있으면 표시
  if [[ -f "$full_skill_ko" ]]; then
    FULL_TRANSLATION=$((FULL_TRANSLATION + 1))
    echo "✅ [$plugin_id] 퀵가이드 + 전문 번역 보유"
  else
    echo "✅ [$plugin_id] 퀵가이드 보유 (전문 번역 없음)"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "퀵가이드 있음:  $PRESENT 개"
echo "전문 번역 있음: $FULL_TRANSLATION 개"
echo "누락:           $MISSING 개"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( STRICT && MISSING > 0 )); then
  echo "❌ Strict 모드: 누락된 한국어 퀵가이드가 있습니다"
  exit 1
fi

exit 0
