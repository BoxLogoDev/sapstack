#!/usr/bin/env bash
# codify-session.sh — 해결된 세션 → 재사용 가능한 symptom 후보 (Learning Loop)
# 상세: scripts/learning/codify.mjs · docs/learning-loop.md
#
# 사용:
#   ./scripts/codify-session.sh scripts/learning/fixtures/sess-20260601-a1b2c3
#   ./scripts/codify-session.sh --session-id sess-... --dir .sapstack/sessions
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
command -v node >/dev/null 2>&1 || { echo "❌ node 필요 (>=20)"; exit 1; }
export NODE_PATH="$REPO_ROOT/mcp/node_modules"
[[ -d "$NODE_PATH/js-yaml" ]] || { echo "❌ js-yaml 없음 — 'cd mcp && npm install'"; exit 1; }
[[ -f "$REPO_ROOT/mcp/dist/pii-scrubber.js" ]] || { echo "❌ mcp/dist/pii-scrubber.js 없음 — 'cd mcp && npm run build'"; exit 1; }
exec node "$REPO_ROOT/scripts/learning/codify.mjs" "$@"
