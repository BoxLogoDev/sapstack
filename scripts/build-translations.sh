#!/usr/bin/env bash
# build-translations.sh — sapstack SKILL.md → 5개 언어 quick-guide 자동 초안 생성
#
# v2.2.0 Phase 3 인프라: 영문 SKILL.md를 source로 zh/ja/de/vi/en quick-guide
# 초안을 LLM API로 자동 생성. 사람 검수는 핵심 5 모듈만 수행하고 나머지는
# "machine-translated, community review pending" 배지를 부착.
#
# 사용 LLM: Anthropic Claude (기본) 또는 OpenAI GPT (--provider openai)
#
# 사용법:
#   ./scripts/build-translations.sh --target zh                  # 중국어만 일괄 생성
#   ./scripts/build-translations.sh --target all                 # 5개 언어 일괄
#   ./scripts/build-translations.sh --module sap-fi --target ja  # 특정 모듈
#   ./scripts/build-translations.sh --dry-run                    # 비용/대상 추정만
#
# 환경 변수:
#   ANTHROPIC_API_KEY — Claude API key (기본 provider)
#   OPENAI_API_KEY    — OpenAI API key (--provider openai)
#
# 출력:
#   plugins/{module}/skills/{module}/references/{lang}/quick-guide-{lang}.md
#   - 첫 줄에 자동 배지: "<!-- machine-translated draft, community review pending -->"

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 기본 설정
PROVIDER="anthropic"
MODEL="claude-sonnet-4-6"
MAX_TOKENS=8000
TEMPERATURE=0.3
DRY_RUN=0
TARGET_LANG=""
TARGET_MODULE=""
SUPPORTED_LANGS=("en" "zh" "ja" "de" "vi")
LANG_NAMES_DECLARED='en="English" zh="Simplified Chinese (Mandarin)" ja="Japanese" de="German" vi="Vietnamese"'
declare -A LANG_NAMES
eval "LANG_NAMES=( $LANG_NAMES_DECLARED )"

# 옵션 파싱
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)        TARGET_LANG="$2"; shift 2 ;;
    --module)        TARGET_MODULE="$2"; shift 2 ;;
    --provider)      PROVIDER="$2"; shift 2 ;;
    --model)         MODEL="$2"; shift 2 ;;
    --dry-run)       DRY_RUN=1; shift ;;
    --max-tokens)    MAX_TOKENS="$2"; shift 2 ;;
    --temperature)   TEMPERATURE="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,28p' "$0"
      exit 0
      ;;
    *)
      echo "❌ Unknown option: $1"
      exit 1
      ;;
  esac
done

# 검증
if [[ -z "$TARGET_LANG" ]]; then
  echo "❌ --target <lang|all> 필수"
  echo "   지원 언어: ${SUPPORTED_LANGS[*]} 또는 all"
  exit 1
fi

if [[ "$TARGET_LANG" != "all" ]] && ! printf '%s\n' "${SUPPORTED_LANGS[@]}" | grep -qx "$TARGET_LANG"; then
  echo "❌ 지원 안 되는 언어: $TARGET_LANG"
  echo "   지원: ${SUPPORTED_LANGS[*]}"
  exit 1
fi

# Target 언어 리스트 구성
if [[ "$TARGET_LANG" == "all" ]]; then
  LANGS_TO_BUILD=("${SUPPORTED_LANGS[@]}")
else
  LANGS_TO_BUILD=("$TARGET_LANG")
fi

# API key 확인 (dry-run이 아니면)
if [[ $DRY_RUN -eq 0 ]]; then
  case "$PROVIDER" in
    anthropic)
      if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
        echo "❌ ANTHROPIC_API_KEY 환경변수 미설정"
        echo "   export ANTHROPIC_API_KEY=sk-ant-..."
        exit 1
      fi
      ;;
    openai)
      if [[ -z "${OPENAI_API_KEY:-}" ]]; then
        echo "❌ OPENAI_API_KEY 환경변수 미설정"
        exit 1
      fi
      ;;
    *)
      echo "❌ 지원 안 되는 provider: $PROVIDER (anthropic|openai)"
      exit 1
      ;;
  esac
fi

# Source SKILL.md 수집
if [[ -n "$TARGET_MODULE" ]]; then
  SOURCES=("plugins/$TARGET_MODULE/skills/$TARGET_MODULE/SKILL.md")
  if [[ ! -f "${SOURCES[0]}" ]]; then
    echo "❌ 모듈 SKILL.md 없음: ${SOURCES[0]}"
    exit 1
  fi
else
  mapfile -t SOURCES < <(find plugins -name SKILL.md -type f | sort)
fi

# Dry-run: 대상·비용 추정만
if [[ $DRY_RUN -eq 1 ]]; then
  echo "🧮 Dry-run — 비용·대상 추정"
  echo ""
  total_chars=0
  for src in "${SOURCES[@]}"; do
    chars=$(wc -c < "$src")
    total_chars=$((total_chars + chars))
  done
  total_calls=$((${#SOURCES[@]} * ${#LANGS_TO_BUILD[@]}))
  # 각 SKILL이 각 언어마다 1번씩 처리됨 = total_chars × num_langs
  # System prompt + overhead: 각 call마다 ~500 tokens 추가
  estimated_input_tokens=$((total_chars / 4 * ${#LANGS_TO_BUILD[@]} + total_calls * 500))
  estimated_output_tokens=$((estimated_input_tokens * 6 / 10))  # 번역은 input의 ~60% 토큰 (compression)
  total_tokens=$((estimated_input_tokens + estimated_output_tokens))

  echo "  대상 모듈:           ${#SOURCES[@]}"
  echo "  대상 언어:           ${LANGS_TO_BUILD[*]}"
  echo "  총 API 호출:         $total_calls"
  echo "  추정 input tokens:   $estimated_input_tokens"
  echo "  추정 output tokens:  $estimated_output_tokens"
  echo "  추정 총 tokens:      $total_tokens"
  echo ""
  echo "비용 추정 (Claude Sonnet 4.6 기준 — \$3/M input + \$15/M output):"
  cost_in=$(awk "BEGIN{printf \"%.2f\", $estimated_input_tokens / 1000000 * 3}")
  cost_out=$(awk "BEGIN{printf \"%.2f\", $estimated_output_tokens / 1000000 * 15}")
  total_cost=$(awk "BEGIN{printf \"%.2f\", $cost_in + $cost_out}")
  echo "  Input cost:  \$$cost_in"
  echo "  Output cost: \$$cost_out"
  echo "  Total:       \$$total_cost"
  echo ""
  echo "실제 실행:"
  echo "  export ANTHROPIC_API_KEY=sk-ant-..."
  echo "  $0 --target <lang|all> [--module <id>]"
  exit 0
fi

# 실제 번역 실행
echo "🌐 sapstack multilingual translation"
echo "   Provider: $PROVIDER, Model: $MODEL"
echo "   Source modules: ${#SOURCES[@]}, Target langs: ${LANGS_TO_BUILD[*]}"
echo ""

# 번역 시스템 프롬프트 (언어별)
get_system_prompt() {
  local lang="$1"
  local lang_name="${LANG_NAMES[$lang]}"
  cat <<PROMPT
You are an expert SAP consultant translator. Translate the input English SAP
SKILL document into $lang_name, producing a concise quick-guide style summary.

Critical rules:
1. KEEP all T-codes (e.g., F110, MIGO, ST22) in original form — NEVER translate.
2. KEEP all SAP technical terms in original (BAPI, CDS, ABAP, IDoc, etc.) but
   you may add a brief native-language explanation in parentheses on first
   occurrence.
3. KEEP all SAP Note numbers, table names (BSEG, MARA), field names (LFB1-ZWELS),
   and program names exactly as-is.
4. Translate prose, headings, and bullet points naturally into idiomatic
   $lang_name.
5. PRESERVE markdown structure: # H1, ## H2, ### H3, tables, code blocks,
   lists, bold/italic.
6. Add a brief native-language section "현장 시나리오" / corresponding native
   equivalent if the original mentions "Korean Context" — replace with that
   country's typical industrial context if applicable.
7. First line MUST be: <!-- machine-translated draft, community review pending -->
8. Total length should be ~60-80% of input (quick-guide compression).

Output ONLY the translated markdown. No preamble, no explanation.
PROMPT
}

# API 호출 (Anthropic)
call_anthropic() {
  local system_prompt="$1"
  local user_content="$2"

  local payload
  payload=$(jq -n \
    --arg model "$MODEL" \
    --argjson max_tokens "$MAX_TOKENS" \
    --argjson temp "$TEMPERATURE" \
    --arg system "$system_prompt" \
    --arg user "$user_content" \
    '{model: $model, max_tokens: $max_tokens, temperature: $temp, system: $system, messages: [{role: "user", content: $user}]}')

  curl -sS -X POST https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "$payload" \
    | jq -r '.content[0].text // empty'
}

# 모듈별·언어별 처리
total=0
success=0
failed=0

for src in "${SOURCES[@]}"; do
  module=$(basename "$(dirname "$(dirname "$src")")")
  src_content=$(cat "$src")
  echo "📦 $module"

  for lang in "${LANGS_TO_BUILD[@]}"; do
    total=$((total + 1))
    out_dir="plugins/$module/skills/$module/references/$lang"
    out_file="$out_dir/quick-guide-$lang.md"

    # 이미 존재하면 스킵
    if [[ -f "$out_file" ]]; then
      echo "  ⏭️  $lang (already exists, skip)"
      continue
    fi

    echo "  🌐 $lang ... "
    mkdir -p "$out_dir"

    system_prompt=$(get_system_prompt "$lang")
    translation=""
    case "$PROVIDER" in
      anthropic)
        translation=$(call_anthropic "$system_prompt" "$src_content" || echo "")
        ;;
      *)
        echo "❌ Provider $PROVIDER not implemented"
        exit 1
        ;;
    esac

    if [[ -z "$translation" ]]; then
      echo "     ❌ API call returned empty"
      failed=$((failed + 1))
      continue
    fi

    # 첫 줄 배지 강제
    if ! head -1 <<< "$translation" | grep -q "machine-translated draft"; then
      translation="<!-- machine-translated draft, community review pending -->\n\n$translation"
    fi

    printf '%b\n' "$translation" > "$out_file"
    success=$((success + 1))
    echo "     ✅ written ($(wc -l < "$out_file") lines)"

    # Rate limit 회피 (호출 간 0.5초)
    sleep 0.5
  done
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "총 시도:  $total"
echo "성공:     $success"
echo "실패:     $failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "  1. bash scripts/check-translation-parity.sh --strict"
echo "  2. 핵심 5 모듈 (sap-fi/sap-mm/sap-abap/sap-s4-migration/sap-btp) 사람 검수"
echo "  3. git add plugins/*/skills/*/references/{en,zh,ja,de,vi}/"
echo "  4. git commit + push + PR"
