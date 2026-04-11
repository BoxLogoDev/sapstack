---
applyTo: "**/*.md"
---

# Markdown Instructions (GitHub Copilot)

이 파일은 Markdown 파일을 편집할 때 적용되는 지침입니다. 특히 `SKILL.md`, `agents/*.md`, `commands/*.md`, `docs/*.md`에 해당합니다.

## SKILL.md (plugins/*/skills/*/SKILL.md)

### 프론트매터 필수
```yaml
---
name: sap-<module>
description: >
  This skill handles <module> tasks including ...
  Use when user mentions <trigger1>, <trigger2>, ...
allowed-tools: Read, Grep
---
```

### 규칙
- `name`은 디렉토리명과 일치
- `description`은 **3인칭**, **1024자 이하**, **트리거 키워드 포함**
- 본문은 영문 유지 (한국어 번역은 `references/ko/SKILL-ko.md`로)
- ECC vs S/4HANA 차이가 주요 주제라면 **명시적으로 구분**

### 본문 섹션 권장 순서
1. Environment Intake Checklist
2. 모듈별 주요 이슈 (T-code + 테이블 레벨)
3. ECC vs S/4HANA 차이
4. Standard Response Format
5. References

## agents/*.md

### 프론트매터
```yaml
---
name: <agent-name>
description: (한국어) 이 에이전트가 하는 일 + 자동 위임 트리거
tools: Read, Grep, Glob
model: sonnet
---
```

### 본문 구조
1. 역할 선언
2. 핵심 원칙
3. 응답 형식 (고정)
4. 위임 프로토콜
5. 금지 사항
6. 참조 (관련 SKILL.md, 데이터 자산)

## commands/*.md

### 프론트매터
```yaml
---
description: 커맨드 설명 (한국어)
argument-hint: [인수 힌트]
---
```

### 본문 구조
1. 🎯 목표
2. 실행 순서 (Step 1, 2, ...)
3. 각 단계의 체크 항목
4. 출력 형식 템플릿
5. 참조

## 기본 규칙

### 링크
- **내부 링크**는 **상대 경로** 사용 (절대 URL 금지)
- 파일 이동 시 링크 업데이트
- `scripts/check-links.sh` (v1.3.0)로 검증

### 코드 블록
- 언어 지정 필수 (\`\`\`bash, \`\`\`abap, \`\`\`yaml)
- T-code는 **bold** (`**MIRO**`)
- 테이블명/필드는 `FS00`, `LFB1.ZWELS` 형식

### 한국어 / 영문 혼용
- Universal Rules와 Standard Response Format은 **영문 유지** (글로벌 일관성)
- 한국 사용자 가이드는 **한국어** (references/ko/, docs/ 한국어 문서)
- 기술 용어는 영문 병기 허용 (예: "환율평가(FX Valuation)")

## 하드코딩 금지
Markdown 예시에 회사코드·G/L·조직 단위 고정값을 쓰지 마세요:
- ❌ "회사코드 1000에서..."
- ✅ "사용자의 회사코드(예: `<YOUR_COMPANY_CODE>`)에서..."

## 검증
```bash
./scripts/lint-frontmatter.sh
./scripts/check-links.sh            # v1.3.0
./scripts/check-ko-references.sh    # v1.3.0
./scripts/check-hardcoding.sh --strict
```
