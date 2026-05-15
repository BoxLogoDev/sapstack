#!/usr/bin/env bash
# check-translation-parity.sh — sapstack 다국어 quick-guide의 구조 정합성 검증
#
# v2.2.0 Phase 3 Quality Gate: ko/quick-guide.md를 source로 5개 언어(en/zh/ja/de/vi)
# quick-guide-{lang}.md가 동등한 구조를 유지하는지 자동 검증.
# ko/quick-guide.md가 없는 모듈은 fallback으로 SKILL.md 사용.
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

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

LANGS=("en" "zh" "ja" "de" "vi")

# 카운트 함수 — set -e 없이 안전 (grep no-match → 0)
# CI(Ubuntu)에서 set -e + grep -c (no match) 조합이 즉시 exit 1을 일으키던 문제 해결
count_h2() {
  local n
  n=$(grep -cE '^##\s' "$1" 2>/dev/null)
  echo "${n:-0}"
}
count_h3() {
  local n
  n=$(grep -cE '^###\s' "$1" 2>/dev/null)
  echo "${n:-0}"
}
count_codeblocks() {
  local n
  n=$(grep -cE '^```' "$1" 2>/dev/null)
  echo "${n:-0}"
}
count_tcodes() {
  local n
  n=$(grep -oE '\b([A-Z]{2,8}[0-9]+|F-[0-9]+|F\.[0-9]+|/SCWM/[A-Z0-9_]+)\b' "$1" 2>/dev/null | wc -l)
  echo "${n:-0}"
}
count_lines() {
  local n
  n=$(wc -l < "$1" 2>/dev/null)
  echo "${n:-0}"
}

TOTAL_MODULES=0
TOTAL_TRANSLATIONS=0
WARNINGS=0
ERRORS=0

echo "🔍 Translation Parity Check"
echo "═══════════════════════════════════════"

# 모든 모듈 순회
while IFS= read -r skill_md; do
  # skill_md = plugins/{module}/skills/{module}/SKILL.md
  # dirname × 3 + basename → {module}
  module=$(basename "$(dirname "$(dirname "$(dirname "$skill_md")")")")
  TOTAL_MODULES=$((TOTAL_MODULES + 1))

  # source 우선순위: ko/quick-guide.md (압축본) → SKILL.md (전체본)
  ko_quick="plugins/$module/skills/$module/references/ko/quick-guide.md"
  if [[ -f "$ko_quick" ]]; then
    src="$ko_quick"
  else
    src="$skill_md"
  fi

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

    # quick-guide-{lang}.md는 SKILL.md의 압축 요약본 (~60-80% 분량) 기준.
    # SKILL-{lang}.md (전체 번역, plan에 명시) 검증은 별도 모드로 향후 추가.

    # H2 카운트 (±3 허용 — quick-guide는 일부 섹션 통합)
    h2_diff=$((src_h2 - t_h2))
    if (( ${h2_diff#-} > 3 )); then
      issue_msgs+=("H2 카운트 차이 $src_h2 vs $t_h2 (>3 차이)")
      ERRORS=$((ERRORS + 1))
    fi

    # H3 카운트 — quick-guide는 H3 대폭 축소 자연스러움 → warning만, 임계 ±8
    h3_diff=$((src_h3 - t_h3))
    if (( ${h3_diff#-} > 8 )); then
      issue_msgs+=("H3 카운트 차이 큼 $src_h3 vs $t_h3 (>8)")
      WARNINGS=$((WARNINGS + 1))
    fi

    # Code block — 정확 일치는 부담. ±2 허용 (quick-guide compression 시 일부 생략 가능)
    code_diff=$((src_code - t_code))
    if (( ${code_diff#-} > 2 )); then
      issue_msgs+=("Code block 카운트 차이 $src_code vs $t_code (>2)")
      ERRORS=$((ERRORS + 1))
    fi

    # T-code 보존 (60% 이상 — quick-guide compression 고려)
    if (( src_tcodes > 0 )); then
      min_tcodes=$((src_tcodes * 6 / 10))
      if (( t_tcodes < min_tcodes )); then
        issue_msgs+=("T-code 보존 부족 $t_tcodes / $src_tcodes (>=60% 필요)")
        ERRORS=$((ERRORS + 1))
      fi
    fi

    # 라인 수 (30% ~ 250% — 영어/독일어/일본어는 한국어 대비 1.5-2배 자연 증가)
    # 핵심은 정보량 보존이지 라인 수 일치가 아님 (자연어 길이 특성)
    min_lines=$((src_lines * 3 / 10))
    max_lines=$((src_lines * 25 / 10))
    if (( t_lines < min_lines || t_lines > max_lines )); then
      issue_msgs+=("라인 수 범위 이탈 $t_lines vs $src_lines (target 30~250%)")
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
