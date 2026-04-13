#!/usr/bin/env bash
# bump-version.sh — sapstack 버전 일괄 업데이트
#
# 사용법:
#   ./scripts/bump-version.sh 2.0.0
#
# 업데이트 대상:
#   - .claude-plugin/marketplace.json
#   - mcp/package.json
#   - extension/package.json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ $# -ne 1 ]]; then
  echo "사용법: $0 <new-version>"
  echo "예시:  $0 2.0.0"
  exit 1
fi

NEW_VERSION="$1"

# 버전 형식 검증 (semver)
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]+)?$ ]]; then
  echo "❌ 잘못된 버전 형식: $NEW_VERSION"
  echo "   올바른 예: 2.0.0, 2.0.0-rc.1, 2.1.0"
  exit 1
fi

echo "📦 sapstack 버전 업데이트: $NEW_VERSION"
echo ""

# 1. marketplace.json
if [[ -f ".claude-plugin/marketplace.json" ]]; then
  sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" .claude-plugin/marketplace.json
  rm -f .claude-plugin/marketplace.json.bak
  echo "  ✅ .claude-plugin/marketplace.json"
fi

# 2. mcp/package.json
if [[ -f "mcp/package.json" ]]; then
  sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" mcp/package.json
  rm -f mcp/package.json.bak
  echo "  ✅ mcp/package.json"
fi

# 3. extension/package.json
if [[ -f "extension/package.json" ]]; then
  sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" extension/package.json
  rm -f extension/package.json.bak
  echo "  ✅ extension/package.json"
fi

echo ""
echo "✅ 버전 업데이트 완료: $NEW_VERSION"
echo ""
echo "다음 단계:"
echo "  1. CHANGELOG.md 업데이트 (## [$NEW_VERSION] - $(date +%Y-%m-%d))"
echo "  2. git diff 확인"
echo "  3. git commit -am \"chore: bump version to $NEW_VERSION\""
echo "  4. git tag v$NEW_VERSION"
echo "  5. git push origin main --tags"
