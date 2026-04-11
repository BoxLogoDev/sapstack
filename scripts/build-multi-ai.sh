#!/usr/bin/env bash
# build-multi-ai.sh — sapstack 호환 레이어 자동 생성/검증 (v1.4.0)
#
# 기능:
#   - 호환 레이어 파일 존재·버전·플러그인 수 일관성 검증
#   - 플러그인 목록·버전 블록을 자동 생성해 sync block에 주입
#   - --check: diff만 출력 (CI 모드)
#   - --write: 실제 파일 갱신
#
# 자동 생성되는 "sync block"은 파일 내에서
# <!-- BEGIN sapstack-auto: plugin-list --> ... <!-- END sapstack-auto: plugin-list -->
# 로 둘러싸인 영역입니다. 이 마커 밖은 수동 편집 보존됩니다.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

MODE="check"
VERBOSE=0

for arg in "$@"; do
  case "$arg" in
    --check) MODE="check" ;;
    --write) MODE="write" ;;
    --verbose) VERBOSE=1 ;;
  esac
done

log() {
  if (( VERBOSE )); then
    echo "[build-multi-ai] $*"
  fi
}

# ────────────────────────────────────────────────────
# 1. 메타데이터 추출
# ────────────────────────────────────────────────────
VERSION=$(grep -E '^\s*"version"' package.json | head -1 | sed 's/.*: "\([^"]*\)".*/\1/')
PLUGIN_COUNT=$(find plugins -maxdepth 1 -mindepth 1 -type d | wc -l)
AGENT_COUNT=$(find agents -maxdepth 1 -name '*.md' -type f 2>/dev/null | wc -l)
COMMAND_COUNT=$(find commands -maxdepth 1 -name '*.md' -type f 2>/dev/null | wc -l)

log "version=$VERSION plugins=$PLUGIN_COUNT agents=$AGENT_COUNT commands=$COMMAND_COUNT"

# ────────────────────────────────────────────────────
# 2. 플러그인 목록 생성 (stats.md 블록)
# ────────────────────────────────────────────────────
generate_stats_block() {
  cat <<EOF
<!-- BEGIN sapstack-auto: stats -->
- **sapstack 버전**: v${VERSION}
- **플러그인**: ${PLUGIN_COUNT}개
- **서브에이전트**: ${AGENT_COUNT}개
- **슬래시 커맨드**: ${COMMAND_COUNT}개
<!-- END sapstack-auto: stats -->
EOF
}

# ────────────────────────────────────────────────────
# 3. sync block 주입/갱신
# ────────────────────────────────────────────────────
inject_block() {
  local file="$1"
  local block_name="$2"
  local new_content="$3"

  if [[ ! -f "$file" ]]; then
    return 1
  fi

  local begin="<!-- BEGIN sapstack-auto: ${block_name} -->"
  local end="<!-- END sapstack-auto: ${block_name} -->"

  if ! grep -qF "$begin" "$file"; then
    log "no block '$block_name' in $file — skipping"
    return 0
  fi

  local tmp_file
  tmp_file=$(mktemp)
  awk -v begin="$begin" -v end="$end" -v new="$new_content" '
    BEGIN { in_block=0 }
    $0 == begin { print; print new; in_block=1; next }
    $0 == end   { in_block=0; print; next }
    !in_block { print }
  ' "$file" > "$tmp_file"

  if diff -q "$file" "$tmp_file" >/dev/null 2>&1; then
    log "$file — no changes"
    rm -f "$tmp_file"
    return 0
  fi

  if [[ "$MODE" == "write" ]]; then
    mv "$tmp_file" "$file"
    echo "✏️  updated: $file"
  else
    echo "📝 diff needed: $file (run with --write to apply)"
    if (( VERBOSE )); then
      diff "$file" "$tmp_file" || true
    fi
    rm -f "$tmp_file"
    return 2
  fi
}

# ────────────────────────────────────────────────────
# 4. 호환 레이어 파일 검증
# ────────────────────────────────────────────────────
COMPAT_FILES=(
  "AGENTS.md"
  ".github/copilot-instructions.md"
  ".cursor/rules/sapstack.mdc"
  ".continue/config.yaml"
  "CONVENTIONS.md"
)

MISSING=0
for file in "${COMPAT_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ 누락: $file"
    MISSING=$((MISSING + 1))
  fi
done

if (( MISSING > 0 )); then
  echo "❌ 호환 레이어 파일 ${MISSING}개 누락"
  exit 1
fi

# ────────────────────────────────────────────────────
# 5. 버전 일관성
# ────────────────────────────────────────────────────
MARKETPLACE_VERSION=$(grep -E '^\s*"version"' .claude-plugin/marketplace.json | head -1 | sed 's/.*: "\([^"]*\)".*/\1/')
if [[ "$VERSION" != "$MARKETPLACE_VERSION" ]]; then
  echo "❌ 버전 불일치: package.json=$VERSION vs marketplace.json=$MARKETPLACE_VERSION"
  exit 1
fi

# ────────────────────────────────────────────────────
# 6. 플러그인 수 일관성
# ────────────────────────────────────────────────────
MARKETPLACE_PLUGINS=$(grep -c '"id":' .claude-plugin/marketplace.json || echo 0)
if [[ "$MARKETPLACE_PLUGINS" != "$PLUGIN_COUNT" ]]; then
  echo "❌ 플러그인 수 불일치: dir=$PLUGIN_COUNT vs marketplace=$MARKETPLACE_PLUGINS"
  exit 1
fi

# ────────────────────────────────────────────────────
# 7. stats 블록 주입 (있는 파일에만)
# ────────────────────────────────────────────────────
STATS_BLOCK=$(generate_stats_block)
DIFF_COUNT=0
for file in "${COMPAT_FILES[@]}" "README.md" "docs/multi-ai-compatibility.md"; do
  [[ ! -f "$file" ]] && continue
  stats_content=$(echo "$STATS_BLOCK" | awk '/BEGIN/{flag=1;next}/END/{flag=0}flag')
  if inject_block "$file" "stats" "$stats_content"; then
    :
  else
    rc=$?
    if [[ $rc == 2 ]]; then
      DIFF_COUNT=$((DIFF_COUNT + 1))
    fi
  fi
done

# ────────────────────────────────────────────────────
# 8. 결과 리포트
# ────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "sapstack v${VERSION} 호환 레이어 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 호환 레이어 파일:     ${#COMPAT_FILES[@]}개 모두 존재"
echo "✅ 플러그인:             ${PLUGIN_COUNT}개"
echo "✅ 서브에이전트:         ${AGENT_COUNT}개"
echo "✅ 슬래시 커맨드:        ${COMMAND_COUNT}개"
echo "✅ 버전 일관성:          package.json == marketplace.json == $VERSION"
if [[ "$MODE" == "check" ]]; then
  if (( DIFF_COUNT > 0 )); then
    echo "📝 Drift 발견:           ${DIFF_COUNT}개 파일 (--write 로 갱신)"
  else
    echo "✅ Sync block:           drift 없음"
  fi
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$MODE" == "check" && $DIFF_COUNT -gt 0 ]]; then
  exit 1
fi

exit 0
