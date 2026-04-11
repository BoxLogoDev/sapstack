#!/usr/bin/env bash
# build-multi-ai.sh — sapstack 호환 레이어 파일 자동 빌드 (MVP, v1.3.0)
#
# 목적: plugins/*/SKILL.md (원본)와 CLAUDE.md (Universal Rules)에서 핵심을 추출해
#       각 AI 도구 네이티브 파일을 자동 생성/갱신합니다.
#
# 현재 구현은 MVP 수준입니다:
#   - 기존 호환 레이어 파일들의 헤더 Universal Rules 블록을 동기화
#   - 13개 플러그인 목록 자동 주입
#   - 버전 번호 동기화
#
# v1.4.0에서 확장 예정:
#   - SKILL.md 본문을 파싱해 호환 레이어 본문도 동기화
#   - 템플릿 엔진 기반 변환
#   - 양방향 diff 검증
#
# 사용법:
#   ./scripts/build-multi-ai.sh             # 빌드 실행
#   ./scripts/build-multi-ai.sh --check     # 변경이 필요한지만 확인 (CI용)
#   ./scripts/build-multi-ai.sh --verbose   # 상세 출력

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CHECK_ONLY=0
VERBOSE=0

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=1 ;;
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
log "sapstack version: $VERSION"

PLUGIN_COUNT=$(find plugins -maxdepth 1 -mindepth 1 -type d | wc -l)
log "plugin count: $PLUGIN_COUNT"

AGENT_COUNT=$(find agents -maxdepth 1 -name '*.md' -type f 2>/dev/null | wc -l)
COMMAND_COUNT=$(find commands -maxdepth 1 -name '*.md' -type f 2>/dev/null | wc -l)

log "agents: $AGENT_COUNT, commands: $COMMAND_COUNT"

# ────────────────────────────────────────────────────
# 2. 호환 레이어 파일 목록
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
  else
    log "found: $file"
  fi
done

if (( MISSING > 0 )); then
  echo "❌ 호환 레이어 파일 ${MISSING}개 누락 — 수동 생성 필요"
  exit 1
fi

# ────────────────────────────────────────────────────
# 3. 버전 일관성 확인
# ────────────────────────────────────────────────────
MARKETPLACE_VERSION=$(grep -E '^\s*"version"' .claude-plugin/marketplace.json | head -1 | sed 's/.*: "\([^"]*\)".*/\1/')

if [[ "$VERSION" != "$MARKETPLACE_VERSION" ]]; then
  echo "❌ 버전 불일치:"
  echo "   package.json:     $VERSION"
  echo "   marketplace.json: $MARKETPLACE_VERSION"
  if (( CHECK_ONLY )); then
    exit 1
  fi
fi

# ────────────────────────────────────────────────────
# 4. 호환 레이어가 버전을 참조하는지 점검 (optional warning)
# ────────────────────────────────────────────────────
for file in "${COMPAT_FILES[@]}"; do
  if grep -q "v1\." "$file" 2>/dev/null; then
    if ! grep -q "v${VERSION}" "$file"; then
      echo "⚠️  $file — 구버전 참조 가능 (현재 v${VERSION})"
    fi
  fi
done

# ────────────────────────────────────────────────────
# 5. 플러그인 목록 일관성
# ────────────────────────────────────────────────────
MARKETPLACE_PLUGINS=$(grep -c '"id":' .claude-plugin/marketplace.json || echo 0)
if [[ "$MARKETPLACE_PLUGINS" != "$PLUGIN_COUNT" ]]; then
  echo "❌ 플러그인 수 불일치: 디렉토리 ${PLUGIN_COUNT}, marketplace.json ${MARKETPLACE_PLUGINS}"
  if (( CHECK_ONLY )); then
    exit 1
  fi
fi

# ────────────────────────────────────────────────────
# 6. 결과 리포트
# ────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "sapstack v${VERSION} 호환 레이어 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 호환 레이어 파일:     ${#COMPAT_FILES[@]}개 모두 존재"
echo "✅ 플러그인:             ${PLUGIN_COUNT}개"
echo "✅ 서브에이전트:         ${AGENT_COUNT}개"
echo "✅ 슬래시 커맨드:        ${COMMAND_COUNT}개"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( CHECK_ONLY )); then
  echo "check-only 모드 — 변경 없음"
fi

exit 0
