#!/usr/bin/env bash
# check-marketplace.sh — .claude-plugin/marketplace.json 무결성 검사
#
# 검증 항목:
#   1. JSON 파싱 가능
#   2. plugins[].id 중복 없음
#   3. plugins[].path 실제 디렉토리 존재
#   4. plugins[].path/skills/<id>/SKILL.md 파일 존재
#   5. version 필드 존재

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

MARKETPLACE=".claude-plugin/marketplace.json"

if [[ ! -f "$MARKETPLACE" ]]; then
  echo "❌ $MARKETPLACE 파일 없음"
  exit 1
fi

# jq 필수
if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq가 설치되지 않음 — https://stedolan.github.io/jq/ 참고"
  exit 1
fi

# 1. JSON 파싱
if ! jq empty "$MARKETPLACE" 2>/dev/null; then
  echo "❌ JSON 파싱 실패: $MARKETPLACE"
  exit 1
fi

ERRORS=0

# 2. 중복 ID 검사
DUP_IDS=$(jq -r '.plugins[].id' "$MARKETPLACE" | sort | uniq -d)
if [[ -n "$DUP_IDS" ]]; then
  echo "❌ 중복 plugin id: $DUP_IDS"
  ERRORS=$((ERRORS + 1))
fi

# 3~4. path & SKILL.md 존재 검증
PLUGIN_COUNT=$(jq '.plugins | length' "$MARKETPLACE")
for ((i = 0; i < PLUGIN_COUNT; i++)); do
  id=$(jq -r ".plugins[$i].id" "$MARKETPLACE")
  path=$(jq -r ".plugins[$i].path" "$MARKETPLACE")
  version=$(jq -r ".plugins[$i].version // empty" "$MARKETPLACE")

  if [[ ! -d "$path" ]]; then
    echo "❌ [$id] path 없음: $path"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  skill_file="$path/skills/$id/SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    echo "❌ [$id] SKILL.md 없음: $skill_file"
    ERRORS=$((ERRORS + 1))
  fi

  if [[ -z "$version" ]]; then
    echo "⚠️  [$id] version 필드 없음"
  fi
done

# 5. 등록 안 된 플러그인 탐지 (역방향 검사)
REGISTERED=$(jq -r '.plugins[].path' "$MARKETPLACE" | sort)
ACTUAL=$(find plugins -maxdepth 1 -mindepth 1 -type d | sort)
for dir in $ACTUAL; do
  if ! echo "$REGISTERED" | grep -Fxq "$dir"; then
    echo "⚠️  $dir — marketplace.json에 미등록"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "플러그인: $PLUGIN_COUNT"
echo "오류: $ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
