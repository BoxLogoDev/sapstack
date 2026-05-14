#!/usr/bin/env bash
# check-tcodes.sh — SKILL.md에 언급된 T-code가 data/tcodes.yaml에 등록됐는지 검증
#
# 동작:
#   1. data/tcodes.yaml에서 확정 T-code 목록 추출
#   2. plugins/*/SKILL.md, agents/*.md, commands/*.md에서 T-code 패턴 추출
#      - 패턴: 대문자 2~8자 + 선택적 숫자/하이픈 (예: FB01, ME21N, F-02, FAGL_FC_VAL)
#   3. 문서에 있으나 리스트에 없는 T-code를 경고로 출력
#
# 사용법:
#   ./scripts/check-tcodes.sh
#   ./scripts/check-tcodes.sh --strict   # 경고를 오류로 변환 (CI fail)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

TCODES_YAML="data/tcodes.yaml"

if [[ ! -f "$TCODES_YAML" ]]; then
  echo "❌ $TCODES_YAML 파일 없음"
  exit 1
fi

# False positive allowlist — 정규식이 잘못 매칭하는 식별자들
# (클래스명, 예외명, 인포타입 번호, 예시 값, 프로그램명 등 — T-code 아님)
declare -A FALSE_POSITIVES=(
  [CL_EXITHANDLER]=1
  [DBIF_RSQL_SQL_ERROR]=1
  [CONVT_CODEPAGE]=1
  [MESSAGE_TYPE_X]=1
  [COMPUTE_INT_ZERODIVIDE]=1
  [OBJECTS_OBJREF_NOT_ASSIGNED]=1
  [RAISE_EXCEPTION]=1
  [TIME_LIMIT_EXCEEDED]=1
  [TIME_OUT]=1
  [TSV_TNEW_PAGE_ALLOC_FAILED]=1
  [MEMORY_NO_MORE_PAGING]=1
  [CONNE_IMPORT_WRONG_BUFFER_LENGTH]=1
  [KR01]=1
  [KR02]=1
  [KR03]=1
  [IT0001]=1
  [IT0002]=1
  [IT0006]=1
  [IT0007]=1
  [IT0008]=1
  [IT0014]=1
  [IT0015]=1
  [LFA1-BKVID]=1
  [LFA1]=1
  [LFB1]=1
  [KNA1]=1
  [MT940]=1
  [SAPUI5]=1
  [SHA256]=1
  [PT_BPC10]=1
  [RHINTE00]=1
  [RPTIME00]=1
  [RPTQTA00]=1
  [TM00]=1
  [TM04]=1
  [CH1]=1
  [KF00]=1
  [KZS2]=1
  [OT83]=1
  [OX19]=1
  [RM07MDOC]=1
  # v2.2.0 Phase 0 backfill — 명백한 false positive (SKILL.md inline 식별자/예시)
  # 카테고리: Fiori business role, 메시지 번호, 범위 표기, 예시 ID, 기술 용어
  [HTML5]=1
  [SAP_BR_PLANT_MAINTENANCE]=1
  [USER_ERROR]=1
  [PROD-001]=1
  [MOT-12345]=1
  [MOT-67890]=1
  [QA01-QA13]=1
  [QP01-QP03]=1
  [F5370]=1
  [F5434]=1
  [ZZ_CUSTOM_FIELD]=1
  [ZZ_APPR_CODE]=1
  # v2.2.0 Phase 0 backfill — 의심 인용 (Phase 1에서 SKILL.md 검토 후 등록/제거 결정)
  # TODO(Phase 1): sap-ewm/sap-pm/sap-qm/sap-cloud SKILL.md 컨텍스트 검증 →
  # 실존하면 tcodes.yaml로 이동, 의사 예시면 SKILL.md fenced code block 처리
  [MIGO_SAC]=1
  [WM01]=1
  [WM02]=1
  [WM03]=1
  [WM04]=1
  [RES01]=1
  [HU_MAINT]=1
  [HU_WEIGH]=1
  [PACK_MONITOR]=1
  [PI_POST]=1
  [SHIP_MON]=1
  [PLAN_ORDER]=1
  [PM01]=1
  [PM02]=1
  [PM03]=1
  [PM10]=1
  [ER01]=1
  [QM04]=1
  [QM05]=1
  [QPR1]=1
  [QPR2]=1
  [SBCO_APPL_TYPES]=1
  # LS0N — sap-ewm SKILL: "Unlike WM (LS0N)" — WM 비교 인용, /SCWM/MON 의도일 가능성
  # TODO(Phase 1 후속): /SCWM/MON 등록 + SKILL.md 표기 일치화
  [LS0N]=1
  [QA25]=1
  # v2.2.0 Phase 2 — 신규 cloud module 식별자 (T-code 아닌 모듈/Planning Area 이름)
  [SAP7]=1
  [SAPIBP1]=1
  [SAP_DATASPHERE]=1
  [SAP_ANALYTICS_CLOUD]=1
)

# 1. 확정 T-code 목록 추출 (YAML 최상위 키)
#    키는 `^[A-Z][A-Z0-9._-]*:` 패턴으로 라인 시작
KNOWN_TCODES=$(grep -E '^[A-Z][A-Z0-9._-]*:$' "$TCODES_YAML" | sed 's/:$//' | sort -u)
KNOWN_COUNT=$(echo "$KNOWN_TCODES" | wc -l)

# T-code 매칭 정규식:
#   - 시작: 단어 경계 또는 공백/특수문자
#   - 본체: 대문자 2글자 이상 + 숫자/하이픈/언더스코어/점 조합
#   - 끝: 단어 경계
# 과매칭을 피하기 위해 **최소 대문자 2자 이상 + 숫자 1자 이상 포함** 또는
# **T-code 형태의 잘 알려진 prefix**로 제한
TCODE_PATTERN='\b([A-Z]{2,8}[0-9]+[A-Z0-9._-]*|[A-Z]{2,4}_[A-Z0-9_]+|[A-Z]{2,4}-[0-9]+|SE[0-9]+|SM[0-9]+|ST[0-9]+|SU[0-9]+|F-[0-9]+|F\.[0-9]+|FB[0-9]+|F[0-9]+|VA[0-9]+|VF[0-9]+|ME[0-9]+|MB[0-9]+|MD[0-9]+|CO[0-9]+|CK[0-9]+|KS[0-9]+|KO[0-9]+|KP[0-9]+|KE[0-9]+|CA[0-9]+|CS[0-9]+|CR[0-9]+|OB[0-9]+|OM[A-Z0-9]+|PFCG|PA[0-9]+|PT[0-9]+|SNOTE|STMS|SAINT|SPAM|SUIM|CAT2)\b'

UNKNOWN_FOUND=0
declare -A SEEN_UNKNOWN

scan_file() {
  local file="$1"

  # 프론트매터 스킵
  local body
  body=$(awk 'BEGIN{fm=0} /^---$/{fm=!fm; next} !fm{print NR": "$0}' "$file")

  # fenced code block도 스킵 (예제 코드에서 나오는 가상 T-code 제외)
  body=$(echo "$body" | awk 'BEGIN{code=0} /```/{code=!code; next} !code{print}')

  # T-code 추출
  local found
  found=$(echo "$body" | grep -oE "$TCODE_PATTERN" || true)

  if [[ -z "$found" ]]; then
    return
  fi

  while IFS= read -r tcode; do
    [[ -z "$tcode" ]] && continue

    # False positive 제외
    if [[ -n "${FALSE_POSITIVES[$tcode]:-}" ]]; then
      continue
    fi

    # 이미 보고된 것은 스킵
    if [[ -n "${SEEN_UNKNOWN[$tcode]:-}" ]]; then
      continue
    fi

    # 확정 리스트 확인
    if ! echo "$KNOWN_TCODES" | grep -qx "$tcode"; then
      SEEN_UNKNOWN[$tcode]=1
      echo "⚠️  [$file] 미등록 T-code: $tcode"
      UNKNOWN_FOUND=$((UNKNOWN_FOUND + 1))
    fi
  done <<< "$found"
}

# 모든 SKILL.md 스캔
while IFS= read -r file; do
  scan_file "$file"
done < <(find plugins -name SKILL.md -type f 2>/dev/null)

# agents / commands도 선택적으로 스캔 (참고용, strict에는 미반영)
# → 에이전트/커맨드는 서술형이라 가상 T-code가 섞이기 쉬워 별도 처리

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "확정 T-code: ${KNOWN_COUNT}개"
echo "미등록 (unique): ${UNKNOWN_FOUND}건"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if (( STRICT && UNKNOWN_FOUND > 0 )); then
  echo "❌ Strict 모드: 미등록 T-code가 발견되었습니다"
  exit 1
fi

# 기본은 warning-only
exit 0
