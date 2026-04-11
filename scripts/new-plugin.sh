#!/usr/bin/env bash
# new-plugin.sh — 새 SAP 모듈 플러그인 전체 구조 스캐폴딩

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ $# -lt 1 ]]; then
  echo "사용법: $0 <plugin-id> [display-name]"
  echo ""
  echo "예시:"
  echo "  $0 sap-qm 'SAP Quality Management'"
  echo "  $0 sap-ewm 'SAP Extended Warehouse Management'"
  exit 1
fi

PLUGIN_ID="$1"
DISPLAY_NAME="${2:-SAP Module}"
PLUGIN_DIR="plugins/${PLUGIN_ID}"
SKILL_DIR="${PLUGIN_DIR}/skills/${PLUGIN_ID}"
REF_KO_DIR="${SKILL_DIR}/references/ko"

if [[ -d "$PLUGIN_DIR" ]]; then
  echo "❌ 이미 존재: $PLUGIN_DIR"
  exit 1
fi

mkdir -p "$REF_KO_DIR"

# SKILL.md
cat > "${SKILL_DIR}/SKILL.md" <<EOF
---
name: ${PLUGIN_ID}
description: >
  This skill handles ${DISPLAY_NAME} tasks including [주제 목록].
  Use when user mentions [트리거 키워드 영문, 한국어 혼용].
allowed-tools: Read, Grep
---

## 1. Environment Intake Checklist

Before answering, collect:
- SAP Release (ECC / S/4HANA)
- Deployment model
- Company code (user provides)
- Module-specific settings

---

## 2. [Area 1]

- **[T-code]**: 설명
- Related tables

---

## 3. [Area 2]

- ...

---

## 4. ECC vs S/4HANA

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| ... | ... | ... |

---

## 5. Standard Response Format

Follow sapstack Universal Rules:
**Issue → Root Cause → Check → Fix → Prevention → SAP Note**

---

## 6. References
- \`references/ko/quick-guide.md\`
- \`references/ko/SKILL-ko.md\`
EOF

# quick-guide.md
cat > "${REF_KO_DIR}/quick-guide.md" <<EOF
# ${PLUGIN_ID} 한국어 퀵가이드

## 🔑 환경 인테이크
1. SAP 릴리스
2. ...

## 📚 핵심
- 주요 T-code
- 흔한 이슈

## 🇰🇷 한국 특화
- ...

## 관련
- \`../../SKILL.md\` — 본문
- \`SKILL-ko.md\` — 한국어 전문 번역
EOF

# SKILL-ko.md
cat > "${REF_KO_DIR}/SKILL-ko.md" <<EOF
# ${DISPLAY_NAME} 한국어 전문 가이드

> \`plugins/${PLUGIN_ID}/skills/${PLUGIN_ID}/SKILL.md\`의 한국어 병렬 버전.

## 1. 환경 인테이크
- SAP 릴리스
- 회사코드 등

## 2. [영역 1]
...

## 표준 응답 형식
\`\`\`
## Issue
## Root Cause
## Check
## Fix
## Prevention
## SAP Note
\`\`\`

## 관련
- \`quick-guide.md\`
EOF

echo "✅ 생성됨: $PLUGIN_DIR"
echo ""
echo "  ${SKILL_DIR}/SKILL.md"
echo "  ${REF_KO_DIR}/quick-guide.md"
echo "  ${REF_KO_DIR}/SKILL-ko.md"
echo ""
echo "다음 단계:"
echo "  1. 세 파일의 본문을 작성"
echo "  2. .claude-plugin/marketplace.json에 엔트리 추가"
echo "  3. data/tcodes.yaml에 관련 T-code 추가 (필요 시)"
echo "  4. 품질 게이트 실행:"
echo "     ./scripts/lint-frontmatter.sh"
echo "     ./scripts/check-marketplace.sh"
echo "     ./scripts/check-ko-references.sh"
echo "  5. CONTRIBUTING.md 규칙에 따라 PR"
