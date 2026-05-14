#!/usr/bin/env bash
# check-translation-parity.sh — sapstack 다국어 quick-guide의 구조 정합성 검증
#
# v2.2.0 Phase 3 Quality Gate: 영문 SKILL.md를 source로 5개 언어(en/zh/ja/de/vi)
# quick-guide-{lang}.md가 동등한 구조를 유지하는지 자동 검증.
#
# 검증 항목:
#   - H2 헤딩 개수 (±2 허용)
#   - H3 헤딩 개수 (±3 허용)
#   - T-code 인용 개수 (정확 일치)
#   - 코드 블록 (```) 개수 (정확 일치)
#   - 라인 수 (source 대비 50% ~ 110% 범위)
#
# 사용법:
#   ./scripts/check-translation-parity.sh
#   ./scripts/check-translation-parity.sh --strict   # 위반 시 CI fail

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

LANGS=("en" "zh" "ja" "de" "vi")

# 카운트 함수
count_h2() { grep -cE '^##\s' "$1" 2>/dev/null || echo 0; }
count_h3() { grep -cE '^###\s' "$1" 2>/dev/null || echo 0; }
count_codeblocks() { grep -cE '^```' "$1" 2>/dev/null || echo 0; }
count_tcodes() {
  # SAP T-code 패턴 — SKILL inline 인용
  grep -oE '\b([A-Z]{2,8}[0-9]+|F-[0-9]+|F\.[0-9]+|/SCWM/[A-Z0-9_]+)\b' "$1" 2>/dev/null | wc -l
}
count_lines() { wc -l < "$1" 2>/dev/null; }

TOTAL_MODULES=0
TOTAL_TRANSLATIONS=0
WARNINGS=0
ERRORS=0

echo "🔍 Translation Parity Check"
echo "═══════════════════════════════════════"

# 모든 모듈 순회
while IFS= read -r src; do
  module=$(basename "$(dirname "$(dirname "$src")")")
  TOTAL_MODULES=$((TOTAL_MODULES + 1))

  src_h2=$(count_h2 "$src")
  src_h3=$(count_h3 "$src")
  src_code=$(count_codeblocks "$src")
  src_tcodes=$(count_tcodes "$src")
  src_lines=$(count_lines "$src")

  module_issues=0
  for lang in "${LANGS[@]}"; do
    target="plugins/$module/skills/$module/references/$lang/quick-guide-$lang.md"

    if [[ ! -f "$target" ]]; then
      # 없으면 skip (build-translations로 생성 예정)
      continue
    fi

    TOTAL_TRANSLATIONS=$((TOTAL_TRANSLATIONS + 1))

    t_h2=$(count_h2 "$target")
    t_h3=$(count_h3 "$target")
    t_code=$(count_codeblocks "$target")
    t_tcodes=$(count_tcodes "$target")
    t_lines=$(count_lines "$target")

    issue_msgs=()

    # H2 카운트 (±2)
    h2_diff=$((src_h2 - t_h2))
    if (( ${h2_diff#-} > 2 )); then
      issue_msgs+=("H2 카운트 차이 $src_h2 vs $t_h2")
      ERRORS=$((ERRORS + 1))
    fi

    # H3 카운트 (±3)
    h3_diff=$((src_h3 - t_h3))
    if (( ${h3_diff#-} > 3 )); then
      issue_msgs+=("H3 카운트 차이 $src_h3 vs $t_h3")
      WARNINGS=$((WARNINGS + 1))
    fi

    # Code block (정확 일치)
    if (( src_code != t_code )); then
      issue_msgs+=("Code block 카운트 $src_code vs $t_code")
      ERRORS=$((ERRORS + 1))
    fi

    # T-code 카운트 (90% 이상 보존)
    if (( src_tcodes > 0 )); then
      min_tcodes=$((src_tcodes * 9 / 10))
      if (( t_tcodes < min_tcodes )); then
        issue_msgs+=("T-code 보존 부족 $t_tcodes / $src_tcodes (>=90% 필요)")
        ERRORS=$((ERRORS + 1))
      fi
    fi

    # 라인 수 (50% ~ 110%)
    min_lines=$((src_lines * 5 / 10))
    max_lines=$((src_lines * 11 / 10))
    if (( t_lines < min_lines || t_lines > max_lines )); then
      issue_msgs+=("라인 수 범위 이탈 $t_lines vs $src_lines (target 50~110%)")
      WARNINGS=$((WARNINGS + 1))
    fi

    if (( ${#issue_msgs[@]} > 0 )); then
      module_issues=$((module_issues + 1))
      echo ""
      echo "❌ $module / $lang"
      for msg in "${issue_msgs[@]}"; do
        echo "   - $msg"
      done
    fi
  done

  if (( module_issues == 0 )); then
    : # silent on success per module
  fi

done < <(find plugins -name SKILL.md -type f | sort)

echo ""
echo "═══════════════════════════════════════"
echo "📊 결과 요약"
echo "   대상 모듈:       $TOTAL_MODULES"
echo "   검사한 번역:     $TOTAL_TRANSLATIONS"
echo "   ❌ 오류:         $ERRORS"
echo "   ⚠️  경고:         $WARNINGS"
echo "═══════════════════════════════════════"

if (( STRICT && (ERRORS > 0 || WARNINGS > 0) )); then
  echo "❌ Strict 모드: 번역 정합성 위반 발견"
  exit 1
fi

if (( ERRORS > 0 )); then
  exit 1
fi

exit 0
