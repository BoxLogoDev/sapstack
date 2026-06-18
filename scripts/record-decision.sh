#!/usr/bin/env bash
# record-decision.sh — "왜 이렇게 설정했나"를 이벤트 소싱으로 보존 (Learning Loop / 결정 메모리)
#
# .sapstack/decisions.jsonl 에 한 줄(JSON)씩 append. gstack decisions.jsonl 의 SAP판.
# 설정/스키마/운영 결정의 근거를 세션을 넘어 보존 → 감사·온보딩·회고에 활용.
# 계약: schemas/decision-event.schema.yaml
#
# 사용:
#   ./scripts/record-decision.sh --decision "F110 페이먼트 메소드 기본값을 T로" \
#       --rationale "국내 이체가 표준, 지인 검증 완료" --actor operator --refs "sess-...,FBZP"
#
# 주의: .sapstack/decisions.jsonl 은 .gitignore 로 커밋 차단 (PII/내부정보 가능).
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DECISION="" RATIONALE="" ACTOR="unknown" REFS=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --decision)  DECISION="$2"; shift 2;;
    --rationale) RATIONALE="$2"; shift 2;;
    --actor)     ACTOR="$2"; shift 2;;
    --refs)      REFS="$2"; shift 2;;
    *) echo "알 수 없는 인자: $1"; exit 1;;
  esac
done

if [[ -z "$DECISION" || -z "$RATIONALE" ]]; then
  echo "사용: record-decision.sh --decision <텍스트> --rationale <근거> [--actor <role>] [--refs a,b]"
  exit 1
fi

# JSON 문자열 이스케이프 (역슬래시 → 따옴표 순서 중요, 제어문자 제거)
json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr -d '\000-\037'
}

# refs CSV → JSON 배열
refs_json="[]"
if [[ -n "$REFS" ]]; then
  refs_json="["
  IFS=',' read -ra arr <<< "$REFS"
  for i in "${!arr[@]}"; do
    r=$(echo "${arr[$i]}" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
    [[ $i -gt 0 ]] && refs_json+=","
    refs_json+="\"$(json_escape "$r")\""
  done
  refs_json+="]"
fi

TS="$(date +%Y-%m-%dT%H:%M:%S%z)"
OUT_DIR="$REPO_ROOT/.sapstack"
mkdir -p "$OUT_DIR"
LINE="{\"at\":\"$TS\",\"actor\":\"$(json_escape "$ACTOR")\",\"decision\":\"$(json_escape "$DECISION")\",\"rationale\":\"$(json_escape "$RATIONALE")\",\"refs\":$refs_json}"

# 유효 JSON 검증 (node 있으면)
if command -v node >/dev/null 2>&1; then
  echo "$LINE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{JSON.parse(s);})' \
    || { echo "❌ 생성된 JSON 이 유효하지 않음 — 입력 확인"; exit 1; }
fi

echo "$LINE" >> "$OUT_DIR/decisions.jsonl"
echo "✅ 기록됨 → .sapstack/decisions.jsonl"
echo "$LINE"
