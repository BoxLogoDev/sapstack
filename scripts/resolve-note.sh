#!/usr/bin/env bash
# resolve-note.sh — 키워드로 SAP Note 번호를 검색
#
# 사용법:
#   ./scripts/resolve-note.sh <keyword>
#   ./scripts/resolve-note.sh korea
#   ./scripts/resolve-note.sh "custom code"
#   ./scripts/resolve-note.sh CONVT_CODEPAGE
#
# 출력: 매칭된 Note ID, 제목, 모듈, URL

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

NOTES_YAML="data/sap-notes.yaml"

if [[ ! -f "$NOTES_YAML" ]]; then
  echo "❌ $NOTES_YAML 파일 없음"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "사용법: $0 <keyword> [keyword2] ..."
  echo ""
  echo "예시:"
  echo "  $0 korea"
  echo "  $0 migration ACDOCA"
  echo "  $0 CONVT_CODEPAGE"
  exit 1
fi

# 모든 키워드를 소문자로 정규화
QUERY=$(echo "$*" | tr '[:upper:]' '[:lower:]')

# YAML 파싱 — awk로 간단히 (jq/yq 미사용, 순수 bash)
awk -v query="$QUERY" '
BEGIN {
  in_note = 0
  current_id = ""
  current_title = ""
  current_keywords = ""
  current_modules = ""
  current_url = ""
  matched = 0
}

/^  - id:/ {
  # 이전 엔트리 매칭 체크
  if (in_note && current_id != "") {
    check_match()
  }

  in_note = 1
  current_id = $0
  sub(/^  - id: *"?/, "", current_id)
  sub(/"?$/, "", current_id)
  current_title = ""
  current_keywords = ""
  current_modules = ""
  current_url = ""
  next
}

in_note && /^    title:/ {
  current_title = $0
  sub(/^    title: *"?/, "", current_title)
  sub(/"?$/, "", current_title)
  next
}

in_note && /^    keywords:/ {
  current_keywords = $0
  sub(/^    keywords: *\[/, "", current_keywords)
  sub(/\].*$/, "", current_keywords)
  next
}

in_note && /^    modules:/ {
  current_modules = $0
  sub(/^    modules: *\[/, "", current_modules)
  sub(/\].*$/, "", current_modules)
  next
}

in_note && /^    url:/ {
  current_url = $0
  sub(/^    url: */, "", current_url)
  next
}

/^meta:/ {
  if (in_note && current_id != "") {
    check_match()
  }
  in_note = 0
}

END {
  if (in_note && current_id != "") {
    check_match()
  }
  if (matched == 0) {
    print "해당 키워드에 매칭되는 SAP Note가 없습니다: " query
    print ""
    print "제안:"
    print "  - 키워드를 더 짧게 (예: \"S/4HANA migration\" → \"migration\")"
    print "  - 영문으로 시도 (korea → Korea, 전자세금계산서 → etax)"
    print "  - data/sap-notes.yaml에 새 엔트리 추가 기여 환영"
  }
}

function check_match() {
  haystack = tolower(current_id " " current_title " " current_keywords " " current_modules)
  # 쿼리의 모든 단어가 포함됐는지 확인 (AND 매칭)
  n = split(query, words, " ")
  all_match = 1
  for (i = 1; i <= n; i++) {
    if (index(haystack, words[i]) == 0) {
      all_match = 0
      break
    }
  }
  if (all_match) {
    matched++
    print "📖 Note " current_id
    print "   " current_title
    print "   모듈: [" current_modules "]"
    print "   URL:  " current_url
    print ""
  }
}
' "$NOTES_YAML"
