#!/usr/bin/env bash
# lint-frontmatter.sh — SKILL.md 및 agents/*.md 프론트매터 검증
#
# 검증 항목:
#   1. YAML 프론트매터 블록 존재 (--- ... ---)
#   2. name 필드 존재 + 디렉토리명 일치 (SKILL.md만)
#   3. description 존재 + 1024자 이하
#   4. allowed-tools 또는 tools 필드 존재
#
# 사용법:
#   ./scripts/lint-frontmatter.sh          # 전체 검사
#   ./scripts/lint-frontmatter.sh --verbose # 상세 출력

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

VERBOSE=0
if [[ "${1:-}" == "--verbose" ]]; then
  VERBOSE=1
fi

ERRORS=0
CHECKED=0

check_file() {
  local file="$1"
  local kind="$2"  # skill | agent | command
  CHECKED=$((CHECKED + 1))

  # 1. 프론트매터 블록 존재 확인
  if ! head -1 "$file" | grep -q '^---$'; then
    echo "❌ [$kind] $file — 프론트매터 시작 '---' 누락"
    ERRORS=$((ERRORS + 1))
    return
  fi

  # 프론트매터 끝 라인 번호
  local fm_end
  fm_end=$(awk '/^---$/{c++; if(c==2){print NR; exit}}' "$file")
  if [[ -z "$fm_end" ]]; then
    echo "❌ [$kind] $file — 프론트매터 종료 '---' 누락"
    ERRORS=$((ERRORS + 1))
    return
  fi

  local fm
  fm=$(sed -n "2,$((fm_end - 1))p" "$file")

  # 2. name 필드 (SKILL / agent만)
  if [[ "$kind" != "command" ]]; then
    if ! echo "$fm" | grep -Eq '^name:[[:space:]]*[a-zA-Z0-9_-]+'; then
      echo "❌ [$kind] $file — name 필드 누락 또는 형식 오류"
      ERRORS=$((ERRORS + 1))
      return
    fi
    # SKILL.md는 디렉토리명과 일치
    if [[ "$kind" == "skill" ]]; then
      local dir_name
      dir_name=$(basename "$(dirname "$file")")
      local name_val
      name_val=$(echo "$fm" | grep -E '^name:' | head -1 | awk '{print $2}')
      if [[ "$dir_name" != "$name_val" ]]; then
        echo "❌ [skill] $file — name '$name_val' ≠ 디렉토리명 '$dir_name'"
        ERRORS=$((ERRORS + 1))
        return
      fi
    fi
  fi

  # 3. description 필드 + 길이 검사
  if ! echo "$fm" | grep -Eq '^description:'; then
    echo "❌ [$kind] $file — description 필드 누락"
    ERRORS=$((ERRORS + 1))
    return
  fi
  # description 값 추출 (간단히 — multi-line 지원)
  local desc_len
  desc_len=$(echo "$fm" | awk '
    /^description:/ { inside=1; sub(/^description:[[:space:]]*>?[[:space:]]*/, ""); print; next }
    inside && /^[a-zA-Z_-]+:/ { exit }
    inside { print }
  ' | tr -d '\n' | wc -c)
  if (( desc_len > 1024 )); then
    echo "❌ [$kind] $file — description 길이 ${desc_len}자 (최대 1024자)"
    ERRORS=$((ERRORS + 1))
    return
  fi
  if (( desc_len < 10 )); then
    echo "❌ [$kind] $file — description 너무 짧음 (${desc_len}자)"
    ERRORS=$((ERRORS + 1))
    return
  fi

  # 4. allowed-tools (skill) 또는 tools (agent)
  if [[ "$kind" == "skill" ]]; then
    if ! echo "$fm" | grep -Eq '^allowed-tools:'; then
      echo "❌ [skill] $file — allowed-tools 필드 누락"
      ERRORS=$((ERRORS + 1))
      return
    fi
  elif [[ "$kind" == "agent" ]]; then
    if ! echo "$fm" | grep -Eq '^tools:'; then
      echo "⚠️  [agent] $file — tools 필드 누락 (선택이지만 권장)"
    fi
  fi

  if (( VERBOSE )); then
    echo "✅ [$kind] $file (desc ${desc_len}자)"
  fi
}

# SKILL.md 탐색
while IFS= read -r file; do
  check_file "$file" "skill"
done < <(find plugins -name SKILL.md -type f 2>/dev/null)

# agents/*.md 탐색
if [[ -d agents ]]; then
  while IFS= read -r file; do
    check_file "$file" "agent"
  done < <(find agents -maxdepth 1 -name '*.md' -type f 2>/dev/null)
fi

# commands/*.md 탐색
if [[ -d commands ]]; then
  while IFS= read -r file; do
    check_file "$file" "command"
  done < <(find commands -maxdepth 1 -name '*.md' -type f 2>/dev/null)
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "검사 파일: $CHECKED"
echo "오류: $ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
