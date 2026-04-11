#!/usr/bin/env bash
# check-links.sh — Markdown 파일의 내부 링크 유효성 검증
#
# 검증 대상:
#   - [text](relative/path.md) 형태의 상대 링크
#   - [text](../other/file.md) 상위 경로 참조
#   - [text](./same-dir.md) 명시적 현재 디렉토리
#
# 검증 제외:
#   - http(s):// 외부 링크
#   - mailto: 링크
#   - 앵커만 (#section)
#   - 이미지 (![])
#
# 사용법:
#   ./scripts/check-links.sh
#   ./scripts/check-links.sh --strict   # 끊어진 링크 있으면 CI fail

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

BROKEN=0
CHECKED=0

# 모든 .md 파일 순회
while IFS= read -r md_file; do
  CHECKED=$((CHECKED + 1))
  dir=$(dirname "$md_file")

  # Markdown 상대 링크 추출: [text](path.md) 형태, http(s) 제외, mailto 제외, 앵커 only 제외
  # 간단한 grep으로 링크 URL 추출
  while IFS= read -r link; do
    [[ -z "$link" ]] && continue

    # #anchor 제거
    target="${link%%#*}"
    [[ -z "$target" ]] && continue

    # 외부 링크 스킵
    case "$target" in
      http://*|https://*|mailto:*|ftp://*)
        continue
        ;;
    esac

    # 절대 경로는 repo root 기준
    if [[ "$target" = /* ]]; then
      check_path="${target#/}"
    else
      # 상대 경로는 파일 디렉토리 기준
      check_path="$dir/$target"
    fi

    # 경로 정규화 (../ 해결)
    # bash 기본으로는 안 되니 readlink -m 또는 Python 활용
    normalized=$(cd "$dir" && readlink -m "$target" 2>/dev/null || echo "$check_path")

    # repo root로 상대화
    rel_path="${normalized#$REPO_ROOT/}"

    if [[ ! -e "$rel_path" ]] && [[ ! -e "$normalized" ]]; then
      echo "❌ [$md_file] 끊어진 링크: $link"
      BROKEN=$((BROKEN + 1))
    fi
  done < <(grep -oE '\[[^]]*\]\([^)]+\)' "$md_file" 2>/dev/null | \
           grep -oE '\([^)]+\)' | \
           tr -d '()' | \
           grep -v '^!' || true)
done < <(find . -name '*.md' -type f \
         -not -path './.git/*' \
         -not -path './node_modules/*' \
         2>/dev/null)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "검사 파일: $CHECKED"
echo "끊어진 링크: $BROKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( STRICT && BROKEN > 0 )); then
  echo "❌ Strict 모드: 끊어진 링크가 발견되었습니다"
  exit 1
fi

exit 0
