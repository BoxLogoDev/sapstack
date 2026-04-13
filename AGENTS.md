# AGENTS.md — sapstack (v1.5.0)

> 이 파일은 **AGENTS.md 표준을 지원하는 모든 AI 에이전트**(OpenAI Codex CLI,
> **Amazon Kiro IDE**, 그 외)에게 sapstack의 사용 규칙을 전달합니다.
> Claude Code 사용자는 `plugins/*/skills/*/SKILL.md`와 `CLAUDE.md`를 직접
> 읽으며, 이 파일은 동일한 지식을 다른 AI에게 전달하는 호환 레이어입니다.

## 이 저장소는 무엇인가?

**sapstack**은 SAP 운영 자문을 위한 통합 지식·에이전트·커맨드 플러그인
모음입니다. **14개 SAP 모듈**(FI/CO/TR/MM/SD/PP/HCM/SFSF/ABAP/S4Migration/
BTP/BASIS/BC/GTS) + **1개 메타 플러그인**(sap-session, Evidence Loop
오케스트레이터)로 구성됩니다.

- 원본 형식: Claude Code plugin marketplace (`plugins/*/skills/*/SKILL.md`)
- 이 파일: Codex·Kiro·기타 AI 호환용 변환 레이어
- 저장소: https://github.com/BoxLogoDev/sapstack

---

## 🎯 Universal Rules (모든 SAP 답변에 적용)

아래 규칙은 **절대 위반 금지**입니다:

1. **Never hardcode** company codes, G/L accounts, cost centers, or org units.
   사용자가 제공한 값을 사용하고, 제공이 없으면 물어보세요.
2. **Always ask for environment** before answering:
   - SAP Release (ECC 6.0 EhPx / S/4HANA release year)
   - Deployment model (On-Premise / RISE / Public Cloud)
   - Industry sector
3. **Always distinguish ECC vs S/4HANA** behavior where they differ
   (e.g. BSEG vs ACDOCA, FD32 vs UKM_BP, F.05 vs FAGL_FC_VAL).
4. **Transport request required** for any configuration change in dev/QA/prod.
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, F110
   등은 반드시 Test Run 선행.
6. **Never recommend SE16N** data edits in production.
7. **Always provide T-code + menu path** for every action.
8. **Use field language, not dictionary Korean** — 한국어 응답은 현장체 우선:
   - 외래어(공식 번역, 필드코드) 이중 병기: "코스트 센터 (원가센터, KOSTL)"
   - 발화체 수용: "돌렸는데", "뜨네요", "박아주세요", "튕겨요"
   - T-code·약어 원형 유지 (`F110`, `PO`, `GR` — 풀어 쓰지 말 것)
   - 업무 시점은 `D-1`, `월마감 D+3`, `가결산` 같은 업계 표준 표기
   - 상세: `plugins/sap-session/skills/sap-session/references/korean-field-language.md`
   - 동의어 사전: `data/synonyms.yaml` (58 용어 + 10 약어 + 15 업무 시점)

---

## 📋 Standard Response Format — Dual Mode (v1.5.0)

sapstack은 **두 가지 응답 모드**를 지원합니다. 모드는 요청 성격에 따라
AI가 자동 선택합니다.

### Mode 1 — Quick Advisory (단발 질문 기본)

"FB01이 뭐야?", "BSEG와 ACDOCA 차이는?" 같은 단순 지식 질의용:

```
## 🔍 Issue
(사용자 증상 재정의)

## 🧠 Root Cause
(확률 순 원인 후보)

## ✅ Check
1. [T-code] — 확인 항목
2. [Table.Field] — 데이터 레벨

## 🛠 Fix
1. 단계별 수정

## 🛡 Prevention
(재발 방지)

## 📖 SAP Note
(data/sap-notes.yaml에 있는 경우만)
```

### Mode 2 — Evidence Loop (진단 루프)

인시던트 진단, 크로스 모듈 변경 영향, 마감 검증 등 **가설 검증이 필요한**
상황에서는 4턴 포맷으로 전환:

```
Turn 1 INTAKE   → 초기 증상 + 환경 컨텍스트 수집
Turn 2 HYPOTHESIS → 2-4개 가설 + 각 가설의 반증 조건 + Follow-up Request
Turn 3 COLLECT  → 운영자가 SAP에서 증거 수집 (AI는 말하지 않음)
Turn 4 VERIFY   → 가설 확정/기각 + Fix Plan + 필수 Rollback Plan
```

**핵심 규칙**:
- 모든 가설은 **falsification 조건**을 반드시 포함 (Popper)
- 확정 가설에는 **Fix와 Rollback이 페어**로 제시돼야 함
- 세션 상태는 `.sapstack/sessions/{id}/state.yaml`에 직렬화되어 재개 가능

상세: `plugins/sap-session/skills/sap-session/SKILL.md`

### Mode 선택 규칙

| 신호 | Mode |
|---|---|
| 단일 팩트 질문 ("~가 뭐야?") | Quick Advisory |
| "이게 안 돼요" 진단 요청 | Evidence Loop |
| 크로스 모듈 변경 영향 리뷰 | Evidence Loop |
| 월/분기/연 마감 사전 체크 | Evidence Loop |
| `/sap-session-*` 명시 호출 | Evidence Loop |
| 2개 이상 가설 후보 | Evidence Loop |

애매하면 **Evidence Loop**를 기본 선택 — 단발 조언의 과신 실수를 피함.

---

## 🧠 지식 소스 — 디렉토리 구조 (v1.5.0)

```
sapstack/
├── plugins/<module>/skills/<module>/
│   ├── SKILL.md                    ← 영문 원본 지식 (Claude Code 포맷)
│   └── references/
│       ├── *.md                    ← 영문 상세 참조
│       └── ko/
│           ├── quick-guide.md      ← 한국어 퀵가이드
│           └── SKILL-ko.md         ← 한국어 전문 가이드
├── plugins/sap-session/             ← Evidence Loop 오케스트레이터 (신규)
│   └── skills/sap-session/
│       ├── SKILL.md
│       └── references/
│           ├── turn-formats.md
│           ├── evidence-bundle-guide.md
│           ├── followup-authoring.md
│           ├── session-state-lifecycle.md
│           └── korean-field-language.md        ← 현장체 원칙 (Rule #8)
├── agents/<name>.md                ← 서브에이전트 프롬프트 (재활용 가능)
├── commands/<name>.md              ← 슬래시 커맨드 워크플로
│   ├── sap-session-start.md        ← Evidence Loop 진입 (v1.5.0)
│   ├── sap-session-add-evidence.md
│   └── sap-session-next-turn.md
├── schemas/                         ← Evidence Loop 5 JSON Schema (v1.5.0)
│   ├── evidence-bundle.schema.yaml
│   ├── followup-request.schema.yaml
│   ├── hypothesis.schema.yaml
│   ├── verdict.schema.yaml
│   └── session-state.schema.yaml
├── data/
│   ├── tcodes.yaml                 ← 279개 확정 T-code
│   ├── sap-notes.yaml              ← 50+ 확정 SAP Note
│   ├── symptom-index.yaml          ← 20개 증상 매핑 (v1.5.0)
│   ├── synonyms.yaml               ← 58 용어 + 10 약어 + 15 업무 시점 (v1.5.0)
│   └── tcode-pronunciation.yaml    ← 41개 T-code 한국 발음 (v1.5.0)
├── web/                             ← 엔드유저 셀프 트리아지 포털 (v1.5.0)
│   ├── triage.html                 ← 증상 입력 → 매칭 → 에스컬레이션
│   └── session.html                ← 세션 읽기 전용 뷰어
├── mcp/                             ← MCP 서버 (v1.5.0 스캐폴딩)
│   ├── server.ts
│   └── sapstack-server.json
└── .sapstack/config.example.yaml    ← 환경 프로필 템플릿
```

### 질문이 들어오면 다음 순서로 찾아보세요

1. **증상 매칭** — `data/symptom-index.yaml`에서 fuzzy 매칭 (자연어 증상 → 모듈·T-code)
2. **동의어 정규화** — `data/synonyms.yaml`으로 "코스트센터" ↔ "원가센터" ↔ "KOSTL" 통합
3. **모듈 식별** — 키워드로 해당 `plugins/*/skills/*/SKILL.md`
4. **한국어 답변** — `references/ko/` 참조
5. **T-code 검증** — `data/tcodes.yaml`에 있는 것만 인용
6. **SAP Note 인용** — `data/sap-notes.yaml`에 있는 번호만 (추정 금지)
7. **사용자 환경** — `.sapstack/config.yaml` 있으면 자동 참조

---

## 📦 15개 플러그인

### 💰 Core Financials
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| sap-fi | Financial Accounting | FB01, F110, MIRO, period close, AP, AR, GL, AA, tax, GR/IR |
| sap-co | Controlling | cost center, KSU5, KO88, CK11N, CO-PA, settlement |
| sap-tr | Treasury & Cash Management | FF7A, FF7B, liquidity, FLQDB, cash position |

### 📦 Logistics
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| sap-mm | Materials Management | MIGO, MIRO, ME21N, GR/IR, purchasing, inventory |
| sap-sd | Sales & Distribution | VA01, VF01, billing, pricing, credit, delivery |
| sap-pp | Production Planning | MRP, MD01, CO01, BOM, routing |

### 👥 HR & Talent
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| sap-hcm | HCM On-Premise | HCM, PA30, infotype, payroll, PC00, time |
| sap-sfsf | SuccessFactors | SuccessFactors, EC, ECP, Recruiting, RBP, OData |

### ⚙️ Technology
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| sap-abap | ABAP Development | ABAP, SE38, BAdI, CDS, RAP, ST22, clean core, ATC |
| sap-s4-migration | ECC → S/4HANA Migration | migration, brownfield, readiness, BP, SUM, ATC |
| sap-btp | SAP Business Technology Platform | BTP, CAP, Fiori, OData, XSUAA |
| sap-basis | BASIS Administration (Global) | BASIS, STMS, transport, PFCG, SM50, performance |

### 🇰🇷 Korea & Global
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| **sap-bc** | **한국 BC 컨설턴트 특화** | BC, 베이시스, 한국, Solman, 전자세금계산서, 망분리, K-SOX |
| **sap-gts** | **Global Trade Services** | GTS, 관세청, UNI-PASS, HS code, FTA, compliance |

### 🔁 Meta — Evidence Loop (v1.5.0, experimental)
| Plugin | 주제 | 역할 |
|--------|------|------|
| **sap-session** | Evidence Loop 오케스트레이터 | 기존 14 플러그인·9 에이전트를 턴 인식 루프로 활용 |

### ⚠️ sap-basis vs sap-bc
- **본질**: 둘 다 SAP Basis(시스템 관리·Transport·권한·성능)
- **분리 이유**: 한국 현장 특화 이슈(한글·망분리·전자세금계산서·K-SOX·공인인증서)는 별도 유지
- **한국 업계 용어**: "BC 컨설턴트" = "Basis Consultant"
- **선택 기준**: 한국어/localization → `sap-bc`, 글로벌 영문 → `sap-basis`

---

## 🤖 9개 서브에이전트 (프롬프트 재활용)

`agents/*.md`의 프롬프트는 Claude subagent 포맷이지만, **프롬프트 본문은
범용적**이라 다른 AI에게도 system prompt로 주입 가능합니다.

| 에이전트 | 한 줄 역할 |
|---------|----------|
| sap-fi-consultant | FI 이슈 체계적 진단 |
| sap-co-consultant | CO 원가·배분·CO-PA |
| sap-mm-consultant | MM 전반 (구매·재고·GR/IR) |
| sap-sd-consultant | Order-to-Cash |
| sap-pp-consultant | MRP·BOM·생산오더 |
| sap-abap-developer | ABAP 코드 리뷰 (Clean Core, HANA, ATC) |
| sap-s4-migration-advisor | 마이그레이션 경로 + Risk |
| sap-basis-consultant | Basis 장애 증상 라우팅 |
| sap-integration-advisor | 통합 아키텍처 (RFC/IDoc/OData/CPI) |

Evidence Loop(`sap-session`)는 **새 에이전트를 추가하지 않고** 이 9개를
hypothesis별로 병렬 소환합니다.

---

## 🔁 Evidence Loop — 핵심 규약 요약

**라이브 SAP 접근 없이** "확인 → 수정 → 재확인" 루프를 돌리는 프레임워크.
Human-in-the-loop 비동기 루프 — 운영자가 실행기 역할.

### 4턴 구조
```
Turn 1 INTAKE     → 운영자/엔드유저가 초기 Evidence Bundle 업로드
Turn 2 HYPOTHESIS → AI가 2-4개 가설 (반증 조건 필수) + Follow-up Request
Turn 3 COLLECT    → 운영자가 체크리스트 수행 후 새 Bundle 업로드
Turn 4 VERIFY     → AI가 가설 확정/기각 + Fix/Rollback/Prevention
```

### Session-specific Rules
- **Falsifiability**: 모든 가설은 `falsification_evidence`가 2개 이상
- **Rollback-or-no-Fix**: 확정 Fix는 반드시 Rollback Plan과 페어
- **Read-only bias**: Follow-up Request는 언제나 read-only 기본
- **Audit trail**: 모든 상태 변화는 append-only (삭제·수정 금지)
- **Three Surfaces**: CLI(A) / VS Code(B, v1.6) / Web(C)이 세션 ID로 연결

### 관련 파일
- `plugins/sap-session/skills/sap-session/SKILL.md` — 전체 규약
- `plugins/sap-session/skills/sap-session/references/turn-formats.md` — 턴별 입출력
- `schemas/session-state.schema.yaml` — 세션 직렬화 계약
- `commands/sap-session-{start,add-evidence,next-turn}.md` — CLI 엔트리

---

## 🧭 Multi-AI 호환성

sapstack은 **7개 AI 코딩 도구**와 호환됩니다. 원본은 `plugins/*/skills/*/
SKILL.md`이고, 나머지는 얇은 호환 레이어입니다.

| AI 도구 | 진입점 | 지원 버전 |
|---|---|---|
| Claude Code | `plugins/*/skills/*/SKILL.md` | v1.0.0+ |
| OpenAI Codex CLI | `AGENTS.md` (이 파일) | v1.2.0+ |
| GitHub Copilot | `.github/copilot-instructions.md` | v1.3.0+ |
| Cursor | `.cursor/rules/sapstack.mdc` | v1.2.0+ |
| Continue.dev | `.continue/config.yaml` | v1.3.0+ |
| Aider | `CONVENTIONS.md` | v1.3.0+ |
| **Amazon Kiro IDE** | `AGENTS.md` + `.kiro/steering/*` + `.kiro/settings/mcp.json` | **v1.5.0+** |

### Kiro 사용 시
Kiro는 **AGENTS.md를 자동으로 steering에 주입**하므로, 이 파일을 두는 것만
으로도 기본 통합이 작동합니다. 추가로 4개 steering 파일과 MCP 서버를 설정하면
Evidence Loop 전체가 Kiro 안에서 작동합니다.

자세한 설치: `docs/kiro-quickstart.md`, `docs/kiro-integration.md`

### Codex CLI 사용 예시
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..

codex "sapstack의 sap-fi-consultant 에이전트 프롬프트를 따라 다음 이슈를 \
  진단해줘: F110 돌렸는데 벤더 100234 하나만 No valid payment method 뜨네요. \
  S/4HANA 2022, 회사코드 1000(KR)"
```

Codex는 `AGENTS.md`를 자동 로드하므로 별도 플래그 없이 이 가이드를 따릅니다.

---

## 📝 기여 가이드

이 저장소를 확장하거나 새 SAP 이슈 패턴을 추가하려면 `CONTRIBUTING.md`를
참조하세요. 다음 원칙을 지키세요:

1. 새 SKILL.md는 **프론트매터 필수** (name, description ≤1024자, allowed-tools)
2. **하드코딩 금지** — `./scripts/check-hardcoding.sh --strict`로 검증
3. **T-code 등록** — 새 T-code 언급 시 `data/tcodes.yaml`에 추가
4. **SAP Note 검증** — 확실한 번호만 `data/sap-notes.yaml`에 등록
5. **synonyms.yaml 확장** — 새 용어는 ko/en/de/ja variants 최소 3개씩
6. **Rule #8 준수** — 한국어 문서는 현장체 + 이중 병기
7. **품질 게이트 통과**:
   ```bash
   ./scripts/lint-frontmatter.sh
   ./scripts/check-marketplace.sh
   ./scripts/check-hardcoding.sh --strict
   ./scripts/check-tcodes.sh
   ```

---

## 🔗 원본 참조

- 저장소: https://github.com/BoxLogoDev/sapstack
- Claude Code: `/plugin marketplace add https://github.com/BoxLogoDev/sapstack`
- 라이선스: MIT

## 📚 관련 문서

- `README.md` — 일반 사용자 가이드
- `CLAUDE.md` — Claude Code용 Universal Rules (Dual Mode 포함)
- `CONTRIBUTING.md` — 기여 절차 (한국어)
- `docs/architecture.md` — 3축 구조 설명
- `docs/multi-ai-compatibility.md` — 다른 AI 도구에서 sapstack 쓰는 법 ⭐
- `docs/kiro-quickstart.md` — Kiro 5분 Quick Start (v1.5.0)
- `docs/kiro-integration.md` — Kiro 전체 통합 가이드 (v1.5.0)
- `docs/environment-profile.md` — `.sapstack/config.yaml` 가이드
- `docs/i18n/symptom-index.md` — 번역 기여 가이드
- `docs/roadmap.md` — v1.6.0+ 로드맵
