# sapstack 기여 가이드

**sapstack**에 기여해주셔서 감사합니다. 이 문서는 새 모듈·에이전트·커맨드를 추가하거나 기존 컨텐츠를 개선할 때 따라야 하는 규칙을 정리합니다.

---

## 📚 기본 원칙 (모든 기여가 반드시 지킬 것)

1. **하드코딩 금지** — 회사코드·G/L 계정·원가요소·조직 단위는 절대 고정값으로 쓰지 마세요
2. **ECC vs S/4HANA 구분** — 두 릴리스에서 동작이 다르면 명시적으로 표기
3. **환경 인테이크 선행** — 답변 전에 사용자 환경을 확인하는 구조
4. **Transport 필수** — 운영 환경 변경은 항상 Transport 경유 안내
5. **시뮬레이션 먼저** — AFAB/F.13/F110/FAGL_FC_VAL 등은 Test Run 선행
6. **T-code + 메뉴 경로** 둘 다 제공
7. **SE16N 데이터 직접 편집 금지** (운영 환경)

자세한 내용은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

---

## 🧩 새 플러그인 추가하기

### 1. 디렉토리 구조
```
plugins/
└── sap-<module>/
    └── skills/
        └── sap-<module>/
            ├── SKILL.md
            └── references/
                ├── <topic>.md
                └── ko/
                    └── quick-guide.md
```

### 2. SKILL.md 프론트매터 스펙

```yaml
---
name: sap-<module>
description: >
  This skill handles <module> tasks including ... Use when the user
  mentions <trigger keyword 1>, <trigger keyword 2>, ...
allowed-tools: Read, Grep
---
```

**필수 규칙:**
- `name`은 반드시 디렉토리명(`sap-<module>`)과 일치
- `description`은 **3인칭**, **1024자 이하**, 트리거 키워드 포함
- `allowed-tools`는 필요 최소한만 (기본 `Read, Grep`)

### 3. 본문 작성 규칙

`SKILL.md` 본문에 다음 섹션을 권장:
1. **Environment Intake Checklist** — 환경 확인 질문
2. **Module별 주요 이슈** — T-code + 테이블 레벨 진단
3. **ECC vs S/4HANA 차이점**
4. **Standard Response Format** — Issue → Root Cause → Check → Fix → Prevention → SAP Note

### 4. marketplace.json 등록

`.claude-plugin/marketplace.json`의 `plugins[]` 배열에 엔트리를 추가하세요:

```json
{
  "id": "sap-<module>",
  "name": "SAP <Module Display Name>",
  "version": "1.0.0",
  "description": "한 줄 설명",
  "path": "plugins/sap-<module>",
  "keywords": ["<trigger1>", "<trigger2>", ...],
  "compatibility": { "ecc": true, "s4hana": true, "btp": false }
}
```

### 5. 품질 게이트 통과

로컬에서 린터를 실행하세요:
```bash
./scripts/lint-frontmatter.sh
./scripts/check-marketplace.sh
./scripts/check-hardcoding.sh
```

CI (`.github/workflows/ci.yml`)도 PR 생성 시 같은 검사를 실행합니다.

---

## 🤖 새 서브에이전트 추가하기

### 파일 위치: `agents/<name>.md`

### 프론트매터 스펙
```yaml
---
name: <agent-name>
description: (한국어) 이 에이전트가 무엇을 하는지, 언제 자동 위임되어야 하는지
tools: Read, Grep, Glob
model: sonnet
---
```

### 본문 구조 권장
1. **역할 선언** — "당신은 N년 경력의 ..."
2. **핵심 원칙** — 하드코딩 금지, 환경 인테이크 등
3. **응답 형식** (고정) — 모든 답변이 따라야 하는 템플릿
4. **위임 프로토콜** — 언제 SKILL.md를 참조하고, 언제 질문을 던지는지
5. **금지 사항** — 하지 말아야 할 것

### 참고 예시
- `agents/sap-fi-consultant.md`
- `agents/sap-abap-reviewer.md`
- `agents/sap-s4-migration-advisor.md`

---

## 🎯 새 슬래시 커맨드 추가하기

### 파일 위치: `commands/<name>.md`

### 프론트매터 스펙
```yaml
---
description: 커맨드가 하는 일 (한국어)
argument-hint: [인수 힌트]
---
```

### 본문 구조
1. **🎯 목표** — 한 문단
2. **진단/실행 순서** — Step 1, 2, 3 ...
3. **각 단계의 체크 항목**
4. **출력 형식** 템플릿
5. **참조** — 관련 SKILL.md 및 에이전트

### 참고 예시
- `commands/sap-fi-closing.md`
- `commands/sap-migo-debug.md`

---

## 🇰🇷 한국어 References 추가

기존 영문 SKILL.md를 유지하면서 한국어 퀵가이드를 추가하는 경우:

1. `plugins/sap-<module>/skills/sap-<module>/references/ko/` 디렉토리 생성
2. `quick-guide.md` 작성 — 한국 현장 관점 요약
3. SKILL.md의 "관련 참고 자료" 섹션에 링크 추가

**주의:** SKILL.md 본문 자체를 한국어로 번역하지 마세요. 영문 본문을 유지해야 Claude Code의 keyword 기반 자동 활성화가 일관되게 동작합니다.

---

## ✅ PR 체크리스트

PR을 생성하기 전 아래를 모두 확인하세요:

- [ ] 하드코딩된 회사코드·계정·조직 단위가 없다
- [ ] ECC vs S/4HANA 차이가 명시되었다 (해당되는 경우)
- [ ] `scripts/lint-frontmatter.sh` 통과
- [ ] `scripts/check-marketplace.sh` 통과
- [ ] `scripts/check-hardcoding.sh` 경고 검토 완료
- [ ] 새 플러그인이면 `marketplace.json`에 등록되었다
- [ ] 커밋 메시지는 Conventional Commits 형식
- [ ] `CHANGELOG.md`에 변경 사항 기록

---

## 📝 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) + 한국어 허용:

```
feat(sap-fi): 외화평가 섹션 추가
fix(scripts): lint-frontmatter.sh의 multi-line description 파싱 수정
docs(korean): sap-abap 한국어 퀵가이드 작성
chore(release): v1.2.0 릴리스 준비
```

---

## 💬 문의

- **버그 리포트**: [Issues](https://github.com/BoxLogoDev/sapstack/issues)
- **아이디어/논의**: Issue 생성 후 `discussion` 라벨
- **빠른 질문**: README의 연락처 참조

감사합니다! 🙏
