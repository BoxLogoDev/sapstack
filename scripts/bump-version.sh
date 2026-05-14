#!/usr/bin/env bash
# bump-version.sh — sapstack 버전 일괄 업데이트 및 sync 검증
#
# 사용법:
#   ./scripts/bump-version.sh 2.2.0       # 모든 version field 업데이트
#   ./scripts/bump-version.sh --check     # version 일치 검증 (CI용, 변경 없음)
#
# 업데이트 대상 (single source of truth):
#   - package.json (root)
#   - .claude-plugin/marketplace.json
#   - mcp/package.json
#   - mcp/sapstack-server.json
#   - extension/package.json
#
# Phase 0 (v2.2.0) 확장: root package.json + sapstack-server.json 추가,
# --check 모드 도입으로 CI에서 sync 위반 자동 감지.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 대상 파일 목록 (의미적 그룹화)
TARGETS=(
  "package.json"
  ".claude-plugin/marketplace.json"
  "mcp/package.json"
  "mcp/sapstack-server.json"
  "extension/package.json"
)

# version 필드를 추출 (jq 없이 sed로, 첫 매치만)
extract_version() {
  local file="$1"
  [[ -f "$file" ]] || { echo ""; return; }
  sed -nE 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$file" | head -1
}

# --check 모드: 모든 파일의 version이 동일한지 검증
if [[ "${1:-}" == "--check" ]]; then
  echo "🔍 sapstack 버전 sync 검증"
  echo ""

  declare -A versions
  mismatch=0
  for f in "${TARGETS[@]}"; do
    if [[ ! -f "$f" ]]; then
      echo "  ⚠️  $f — 파일 없음 (skip)"
      continue
    fi
    v=$(extract_version "$f")
    versions["$f"]="$v"
    echo "  📄 $f → $v"
  done
  echo ""

  # 기준 버전 = root package.json
  ref_version="${versions[package.json]:-}"
  if [[ -z "$ref_version" ]]; then
    echo "❌ 기준 파일(package.json)에서 version을 찾을 수 없음"
    exit 1
  fi

  for f in "${!versions[@]}"; do
    if [[ "${versions[$f]}" != "$ref_version" ]]; then
      echo "❌ Mismatch: $f = ${versions[$f]} (기준: $ref_version)"
      mismatch=1
    fi
  done

  if [[ $mismatch -eq 1 ]]; then
    echo ""
    echo "❌ 버전 sync 실패. ./scripts/bump-version.sh <version> 으로 일괄 갱신 필요."
    exit 1
  fi

  # 최신 git tag와 비교 (있는 경우 정보 제공)
  if git rev-parse --git-dir >/dev/null 2>&1; then
    latest_tag=$(git tag --sort=-version:refname 2>/dev/null | head -1 | sed 's/^v//')
    if [[ -n "$latest_tag" && "$latest_tag" != "$ref_version" ]]; then
      echo ""
      echo "ℹ️  참고: 최신 git tag = v$latest_tag, package.json = $ref_version"
      echo "    릴리스 직전이면 ./scripts/bump-version.sh $latest_tag 또는 새 버전 부여"
    fi
  fi

  echo ""
  echo "✅ 모든 파일의 version 일치: $ref_version"
  exit 0
fi

# 인자 검증
if [[ $# -ne 1 ]]; then
  echo "사용법: $0 <new-version> | --check"
  echo "예시:  $0 2.2.0"
  echo "       $0 --check"
  exit 1
fi

NEW_VERSION="$1"

# semver 검증
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]+)?$ ]]; then
  echo "❌ 잘못된 버전 형식: $NEW_VERSION"
  echo "   올바른 예: 2.2.0, 2.2.0-rc.1, 3.0.0"
  exit 1
fi

echo "📦 sapstack 버전 업데이트: $NEW_VERSION"
echo ""

# 각 파일에서 version 필드 치환 (첫 번째 매치만 안전하게)
update_version() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "  ⚠️  $file — 파일 없음 (skip)"
    return
  fi
  # macOS/BSD/GNU sed 호환을 위해 -i.bak 사용
  sed -i.bak -E "0,/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/s//\"version\": \"$NEW_VERSION\"/" "$file" 2>/dev/null || \
    sed -i.bak -E "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$file"
  rm -f "$file.bak"
  echo "  ✅ $file"
}

for f in "${TARGETS[@]}"; do
  update_version "$f"
done

echo ""
echo "✅ 버전 업데이트 완료: $NEW_VERSION"
echo ""
echo "검증:"
echo "  ./scripts/bump-version.sh --check"
echo ""
echo "다음 단계:"
echo "  1. CHANGELOG.md 업데이트 (## [$NEW_VERSION] - $(date +%Y-%m-%d))"
echo "  2. git diff 확인"
echo "  3. git commit -am \"chore: bump version to $NEW_VERSION\""
echo "  4. git tag v$NEW_VERSION"
echo "  5. git push origin main --tags"
