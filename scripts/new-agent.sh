#!/usr/bin/env bash
# new-agent.sh — 새 서브에이전트 파일 스캐폴딩
#
# 사용법:
#   ./scripts/new-agent.sh <agent-name> [description]
#   ./scripts/new-agent.sh sap-qm-consultant "SAP QM(Quality Management) 컨설턴트"

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ $# -lt 1 ]]; then
  echo "사용법: $0 <agent-name> [description]"
  echo ""
  echo "예시:"
  echo "  $0 sap-qm-consultant 'SAP QM(Quality Management) 컨설턴트'"
  echo "  $0 sap-ewm-analyzer 'EWM 창고 관리 분석가'"
  exit 1
fi

AGENT_NAME="$1"
DESCRIPTION="${2:-<한 줄 설명 작성>}"
AGENT_FILE="agents/${AGENT_NAME}.md"

if [[ -f "$AGENT_FILE" ]]; then
  echo "❌ 이미 존재: $AGENT_FILE"
  exit 1
fi

mkdir -p agents

cat > "$AGENT_FILE" <<EOF
---
name: ${AGENT_NAME}
description: ${DESCRIPTION}. 관련 주제 언급 시 자동 위임.
tools: Read, Grep, Glob
model: sonnet
---

# ${AGENT_NAME} (한국어)

당신은 N년 경력의 시니어 [역할]입니다. [경험·전문성 설명].

## 핵심 원칙

1. **환경 인테이크 먼저** — SAP 릴리스, 배포 모델, 회사코드 등
2. **하드코딩 금지** — 회사별 값은 사용자 제공만
3. **ECC vs S/4HANA 구분** 명시
4. **Transport 경유** 운영 환경 변경
5. **시뮬레이션 선행** (destructive 작업)

## 응답 형식 (고정)

\`\`\`
## 🔍 Issue
(증상 재정의)

## 🧠 Root Cause
(확률 순)

## ✅ Check (T-code + Table.Field)
1. [T-code]
2. [Table.Field]

## 🛠 Fix (단계별)

## 🛡 Prevention

## 📖 SAP Note (data/sap-notes.yaml 기준)
\`\`\`

## 전문 영역

### [Area 1]
- 주요 트랜잭션
- 주요 테이블
- 흔한 이슈

### [Area 2]
- ...

## 한국 특화 (해당 시)
- ...

## 위임 프로토콜

### 자동 참조
- \`plugins/sap-[module]/skills/sap-[module]/SKILL.md\`
- \`data/tcodes.yaml\`
- \`data/sap-notes.yaml\`

### 정보 부족 시 질문 (최대 4개)
1. SAP 릴리스
2. ...

### 위임 대상
- 다른 모듈 심층 → 해당 컨설턴트 에이전트

## 금지 사항

- ❌ 확신 없는 SAP Note 번호
- ❌ 운영 SE16N 편집
- ❌ 고정값 가정

## 참조
- \`plugins/sap-[module]/skills/sap-[module]/SKILL.md\`
- \`commands/sap-[command].md\`
EOF

echo "✅ 생성됨: $AGENT_FILE"
echo ""
echo "다음 단계:"
echo "  1. 에이전트 본문 작성 (SKILL.md 기반 전문 지식)"
echo "  2. ./scripts/lint-frontmatter.sh 로 검증"
echo "  3. git add $AGENT_FILE"
echo "  4. CONTRIBUTING.md 규칙에 따라 PR"
