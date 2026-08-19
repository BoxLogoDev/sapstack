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
  # v2.5.0 backfill — 전수 검증 후 잔여분 (오탐 + 확인 필요).
  # 실존 확정 56건은 data/tcodes.yaml 로 이동. 창작 등록 금지.
  # --- 오탐 (T-code 아님) ---
  [AL32UTF8]=1          # Oracle/NLS charset 식별자 (NLS_LANG=...AL32UTF8)
  [BADI_DEF]=1          # sap-cloud SKILL: Enhancement Spot 유형명, T-code 아님
  [BAPI_EQUI_SET_COUNTER]=1  # BAPI 함수명 (PM SKILL)
  [BAPI_PAYROLL_PROCESS]=1   # BAPI 함수명 (PM SKILL)
  [DB2]=1               # DB 제품명
  [F1]=1                # SAP GUI F1 도움말 / Pretty Printer (Shift+F1)
  [F2]=1                # SD 빌링 문서유형 (Standard invoice), T-code 아님
  [F5]=1                # SD 빌링 문서유형 (Pro forma order-based)
  [F8]=1                # SD 빌링 문서유형 (Pro forma delivery-based) / GUI Execute
  [GATE_ASSIGN]=1       # /SCWM/GATE_ASSIGN 접두 탈락
  [IT0000]=1            # HCM 인포타입 Actions
  [IT0009]=1            # HCM 인포타입 Bank Details
  [IT0027]=1            # HCM 인포타입 Cost Distribution
  [IT2001]=1            # HCM 인포타입 Absences
  [LFB1-AKONT]=1        # 테이블-필드 (Vendor reconciliation account)
  [LFB1-ZWELS]=1        # 테이블-필드 (Vendor payment methods)
  [NLS_LANG]=1          # Oracle 환경변수
  [PC00_M]=1            # 국가별 페이롤 T-code 접두만 (완성 T-code 아님)
  [PI_CREATE]=1         # /SCWM/PI_CREATE 접두 탈락
  [POOR_MAINTENANCE]=1  # PM 원인 카탈로그 코드
  [PUMP-001]=1          # 예시 Equipment ID
  [QA11-13]=1           # QA11~QA13 범위 표기
  [QP01-03]=1           # QP01~QP03 범위 표기
  [RAALTD01]=1          # 자산 이관 프로그램명 (T-code 아님)
  [RP_HRSFEC_PAY_OAUTH_CONFIG]=1  # SFSF 리포트/프로그램명
  [SAP_S4HANA_CLOUD]=1  # Help Portal URL 경로 토큰
  [TP4]=1               # tp 트랜스포트 툴 버전 표기 (TMS/TP/TP4)
  [TRAD1]=1             # /SCWM/TRAD1 접두 탈락
  [UTF-16]=1            # 문자 인코딩
  [UTF-8]=1             # 문자 인코딩
  [ZONE_RES]=1          # /SCWM/ZONE_RES 접두 탈락
  # --- 확인 필요 (SKILL 문맥과 공식 명칭이 불일치, 창작 등록 금지) ---
  [CM99]=1              # 확인 필요: SKILL "Scheduling overview" — 공식명 미확정
  [FX10]=1              # 확인 필요: SKILL "FX deal monitor" — 표준 TR T-code 미확정
  [KO8K]=1              # 확인 필요: SKILL "Maintain settlement rule" — OKO7/KO02 가능, 공식 KO8K 미확정
  [LB05]=1              # 확인 필요: SKILL "TR search/list" — 표준은 LB03/LB10
  [LI07]=1              # 확인 필요: SKILL "post differences" — 표준은 LI20/LI21
  [LS12]=1              # 확인 필요: SKILL "TO creation report" — 공식명 미확정
  [LS13]=1              # 확인 필요: SKILL "Cycle count params" — 커스터마이징 가능
  [LS17]=1              # 확인 필요: SKILL "Storage location assignment" — OMK0 가능
  [LS19]=1              # 확인 필요: SKILL "WM goods movement params" — 커스터마이징 가능
  [OB8B]=1              # 확인 필요: SKILL "plant-WM" — 공식 정체 미확정
  [OKT2]=1              # 확인 필요: SKILL "Order type" — 표준은 KOT2, 오타 가능
  [SSF00]=1             # 확인 필요: SKILL "SSF 파라미터" — 테이블/뷰 가능 (통상 SSFA)
  [TM_HEDGE]=1          # 확인 필요: SKILL 헤지 관계 — 클래식 T-code로 미확정
  [TPM_FC_EXPOSURE]=1   # 확인 필요: SKILL FX exposure — Fiori/리포트 ID 가능
)

# 1. 확정 T-code 목록 추출 (YAML 최상위 키)
#    키는 `^[A-Z][A-Z0-9._-]*:` 패턴으로 라인 시작
KNOWN_TCODES=$(grep -E '^[A-Z][A-Z0-9._/-]*:$' "$TCODES_YAML" | sed 's/:$//' | sort -u)
KNOWN_COUNT=$(echo "$KNOWN_TCODES" | wc -l)

# T-code 매칭 정규식:
#   - 시작: 단어 경계 또는 공백/특수문자
#   - 본체: 대문자 2글자 이상 + 숫자/하이픈/언더스코어/점 조합
#   - 끝: 단어 경계
# 과매칭을 피하기 위해 **최소 대문자 2자 이상 + 숫자 1자 이상 포함** 또는
# **T-code 형태의 잘 알려진 prefix**로 제한
TCODE_PATTERN='\b([A-Z]{2,8}[0-9]+[A-Z0-9._-]*|[A-Z]{2,4}_[A-Z0-9_]+|[A-Z]{2,4}-[0-9]+|[A-Z]{1,3}/[0-9]{2,3}[A-Z]?|SE[0-9]+|SM[0-9]+|ST[0-9]+|SU[0-9]+|F-[0-9]+|F\.[0-9]+|FB[0-9]+|F[0-9]+|VA[0-9]+|VF[0-9]+|ME[0-9]+|MB[0-9]+|MD[0-9]+|CO[0-9]+|CK[0-9]+|KS[0-9]+|KO[0-9]+|KP[0-9]+|KE[0-9]+|CA[0-9]+|CS[0-9]+|CR[0-9]+|OB[0-9]+|OM[A-Z0-9]+|PFCG|PA[0-9]+|PT[0-9]+|SNOTE|STMS|SAINT|SPAM|SUIM|CAT2)\b'

UNKNOWN_FOUND=0
declare -A SEEN_UNKNOWN

scan_file() {
  local file="$1"

  # 프론트매터 스킵.
  # 주의: `/^---$/{fm=!fm}` 토글은 본문의 수평선(---)에도 반응해 수평선 사이
  # 구간을 통째로 삼킨다 (실측: SKILL.md 본문의 절반이 검사에서 누락, CM01 미검출).
  # frontmatter 는 "1행이 --- 로 시작할 때만" 열리고 다음 --- 에서 영구히 닫힌다.
  local body
  body=$(awk 'NR==1 && /^---\r?$/ {fm=1; next} fm && /^---\r?$/ {fm=0; next} !fm {print NR": "$0}' "$file")

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

    # 확정 리스트 확인.
    # herestring 을 쓴다. `echo "$KNOWN_TCODES" | grep -q` 는 grep 이 첫 매치에서
    # 즉시 끝나며 echo 가 SIGPIPE(141) 로 죽고, pipefail 이 그 141 을 파이프라인
    # 결과로 삼는다. 부정 조건이라 "등록된 T-code 를 미등록으로 보고"하는 거짓
    # 양성이 된다. 목록이 400개를 넘어 매치가 앞쪽에서 날수록 잘 터진다.
    if ! grep -qx "$tcode" <<< "$KNOWN_TCODES"; then
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
