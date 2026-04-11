#!/usr/bin/env bash
# new-command.sh — 새 슬래시 커맨드 파일 스캐폴딩

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ $# -lt 1 ]]; then
  echo "사용법: $0 <command-name> [description]"
  echo ""
  echo "예시:"
  echo "  $0 sap-goods-receipt-debug 'GR 포스팅 에러 진단'"
  exit 1
fi

CMD_NAME="$1"
DESCRIPTION="${2:-<한 줄 설명 작성>}"
CMD_FILE="commands/${CMD_NAME}.md"

if [[ -f "$CMD_FILE" ]]; then
  echo "❌ 이미 존재: $CMD_FILE"
  exit 1
fi

mkdir -p commands

cat > "$CMD_FILE" <<EOF
---
description: ${DESCRIPTION}
argument-hint: [인수 힌트]
---

# ${CMD_NAME}

입력: \`\$ARGUMENTS\`

## 🎯 목표
(이 커맨드가 무엇을 하는지 한 문단)

## 🔒 안전 규칙
- (Test Run 선행, 승인 경로 등)

## 실행 순서

### Step 1 — 환경 확인
사용자에게 질문:
1. SAP 릴리스
2. 회사코드
3. 에러 메시지
4. ...

### Step 2 — [첫 체크]
- **[T-code]**: ...
- 체크 항목:

### Step 3 — [두 번째 체크]
- ...

### Step 4 — [수정]
- 케이스별 Fix

### Step 5 — [검증]
- 결과 확인

## 📤 출력 형식

\`\`\`
## 🔍 Issue
## 🧠 Root Cause
## ✅ Check
## 🛠 Fix
## 🛡 Prevention
## 📖 SAP Note
\`\`\`

## 🤖 위임
- 복잡 시 → [에이전트 이름]

## 참조
- \`plugins/sap-[module]/skills/sap-[module]/SKILL.md\`
- \`agents/[agent].md\`
EOF

echo "✅ 생성됨: $CMD_FILE"
echo ""
echo "다음 단계:"
echo "  1. 커맨드 본문 작성"
echo "  2. ./scripts/lint-frontmatter.sh 검증"
echo "  3. CONTRIBUTING.md 규칙 준수"
