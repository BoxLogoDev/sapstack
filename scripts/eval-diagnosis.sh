#!/usr/bin/env bash
# eval-diagnosis.sh — 진단 품질 eval 오케스트레이터 (로컬 전용)
#
# scripts/eval/run.mjs 를 호출해 gold-set 케이스를 LLM-judge 로 채점한다.
# js-yaml 은 mcp/node_modules 에서 NODE_PATH 로 해결 (발행 패키지 무오염).
#
# 사용:
#   ./scripts/eval-diagnosis.sh --dry-run                  # API 없이 계획만
#   ./scripts/eval-diagnosis.sh --case eval-fi-f110-no-payment-method
#   ./scripts/eval-diagnosis.sh --module FI
#   ./scripts/eval-diagnosis.sh --all --limit 5
#
# 실제 채점에는 ANTHROPIC_API_KEY 필요. 없으면 자동으로 dry-run 전환.
# 비용 통제: per-PR/CI 자동 실행 아님 — 개발자가 의도적으로 로컬 실행.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ node 가 필요합니다 (>=20)"
  exit 1
fi

# js-yaml 해결 경로
export NODE_PATH="$REPO_ROOT/mcp/node_modules"
if [[ ! -d "$NODE_PATH/js-yaml" ]]; then
  echo "❌ js-yaml 없음 — 먼저 'cd mcp && npm install' 실행"
  exit 1
fi

exec node "$REPO_ROOT/scripts/eval/run.mjs" "$@"
