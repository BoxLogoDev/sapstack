#!/usr/bin/env bash
# install-claude-desktop.sh — sapstack MCP를 Claude Desktop에 1줄 설치 (macOS / Linux)
#
# 사용법:
#   bash scripts/install-claude-desktop.sh           # 기본 설치
#   bash scripts/install-claude-desktop.sh --dry-run # 변경 사항만 표시
#   bash scripts/install-claude-desktop.sh --uninstall
#
# 동작:
#   1. Claude Desktop 설정 파일 경로 자동 감지
#      - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
#      - Linux: ~/.config/Claude/claude_desktop_config.json
#   2. mcpServers 키에 sapstack 항목 추가/갱신
#   3. 사용자가 npx @boxlogodev/sapstack-mcp 로 실행하도록 구성

set -euo pipefail

DRY_RUN=0
UNINSTALL=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --uninstall) UNINSTALL=1 ;;
    --help|-h)
      echo "Usage: $0 [--dry-run] [--uninstall]"
      exit 0
      ;;
  esac
done

# OS 감지 및 설정 경로
if [[ "$(uname)" == "Darwin" ]]; then
  CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$(uname)" == "Linux" ]]; then
  CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
else
  echo "❌ 지원하지 않는 OS: $(uname)"
  echo "   Windows는 scripts/install-claude-desktop.ps1 사용"
  exit 1
fi

CONFIG_DIR=$(dirname "$CONFIG_PATH")
echo "📂 Config: $CONFIG_PATH"

# 디렉토리 생성 (없으면)
if [[ ! -d "$CONFIG_DIR" ]]; then
  if (( DRY_RUN )); then
    echo "[dry-run] mkdir -p \"$CONFIG_DIR\""
  else
    mkdir -p "$CONFIG_DIR"
  fi
fi

# 기존 설정 읽기 (없으면 빈 객체)
if [[ -f "$CONFIG_PATH" ]]; then
  EXISTING=$(cat "$CONFIG_PATH")
else
  EXISTING='{}'
fi

# jq 필수
if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq 가 필요합니다. (brew install jq / apt install jq)"
  exit 1
fi

# 설치 또는 제거
if (( UNINSTALL )); then
  NEW_CONFIG=$(echo "$EXISTING" | jq 'del(.mcpServers.sapstack)')
  ACTION="제거"
else
  NEW_CONFIG=$(echo "$EXISTING" | jq '
    .mcpServers = (.mcpServers // {}) |
    .mcpServers.sapstack = {
      "command": "npx",
      "args": ["-y", "@boxlogodev/sapstack-mcp@latest"]
    }
  ')
  ACTION="설치"
fi

echo ""
echo "🔧 sapstack MCP $ACTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( DRY_RUN )); then
  echo "[dry-run] 변경 후 config:"
  echo "$NEW_CONFIG" | jq .
  echo ""
  echo "(dry-run 모드 — 파일은 변경되지 않음)"
else
  echo "$NEW_CONFIG" > "$CONFIG_PATH"
  echo "✅ $CONFIG_PATH 갱신 완료"
  echo ""
  echo "다음 단계:"
  echo "  1. Claude Desktop 종료 후 재실행"
  echo "  2. 새 대화에서 'sapstack MCP가 연결됐는지 확인해줘' 라고 질문"
fi
