#!/usr/bin/env bash
# aggregate-sessions.sh — 세션 집계 메트릭 + gold-set 환류 후보 (Learning Loop)
# 상세: scripts/learning/aggregate.mjs · docs/learning-loop.md
#
# opt-in·로컬·읽기전용. 메트릭만 출력(자유 텍스트 미노출).
#
# 사용:
#   ./scripts/aggregate-sessions.sh                          # .sapstack/sessions
#   ./scripts/aggregate-sessions.sh --dir scripts/learning/fixtures
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
command -v node >/dev/null 2>&1 || { echo "❌ node 필요 (>=20)"; exit 1; }
export NODE_PATH="$REPO_ROOT/mcp/node_modules"
[[ -d "$NODE_PATH/js-yaml" ]] || { echo "❌ js-yaml 없음 — 'cd mcp && npm install'"; exit 1; }
exec node "$REPO_ROOT/scripts/learning/aggregate.mjs" "$@"
