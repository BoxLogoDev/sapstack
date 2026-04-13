#!/usr/bin/env bash
# generate-release-notes.sh — CHANGELOG.md에서 해당 버전 릴리즈 노트 추출
#
# 사용법:
#   ./scripts/generate-release-notes.sh 2.0.0
#
# 출력:
#   해당 버전 섹션만 stdout으로 출력

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ $# -ne 1 ]]; then
  echo "사용법: $0 <version>" >&2
  echo "예시:  $0 2.0.0" >&2
  exit 1
fi

VERSION="$1"
CHANGELOG="CHANGELOG.md"

if [[ ! -f "$CHANGELOG" ]]; then
  echo "❌ CHANGELOG.md 파일이 없습니다" >&2
  exit 1
fi

# awk로 해당 버전 섹션만 추출
# "## [X.Y.Z]" 부터 다음 "## [" 또는 파일 끝까지
awk -v version="$VERSION" '
  BEGIN { found = 0; done = 0 }
  /^## \[/ {
    if (done) exit
    if (index($0, "[" version "]") > 0) {
      found = 1
      next
    }
    if (found) {
      done = 1
      exit
    }
  }
  found && !done { print }
' "$CHANGELOG"
