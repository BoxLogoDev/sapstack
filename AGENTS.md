# AGENTS.md — sapstack (for Codex CLI / OpenAI Codex)

> 이 파일은 **OpenAI Codex CLI** 및 **AGENTS.md 형식을 지원하는 모든 AI 에이전트**에게 sapstack의 사용 규칙을 전달합니다. Claude Code 사용자는 `plugins/*/skills/*/SKILL.md`를 직접 읽으며, 이 파일은 동일한 지식을 다른 AI에게 전달하는 호환 레이어입니다.

## 이 저장소는 무엇인가?

**sapstack**은 SAP 운영 자문을 위한 통합 지식·에이전트·커맨드 플러그인 모음입니다. 13개 SAP 모듈(FI/CO/TR/MM/SD/PP/HCM/SFSF/ABAP/S4Migration/BTP/BASIS/BC)을 다룹니다.

- 원본 형식: Claude Code plugin marketplace (`plugins/*/skills/*/SKILL.md`)
- 이 파일: Codex·기타 AI 호환용 변환 레이어
- 저장소: https://github.com/BoxLogoDev/sapstack

---

## 🎯 Universal Rules (모든 SAP 답변에 적용)

아래 규칙은 **절대 위반 금지**입니다:

1. **Never hardcode** company codes, G/L accounts, cost centers, or org units. 사용자가 제공한 값을 사용하고, 제공이 없으면 물어보세요.
2. **Always ask for environment** before answering:
   - SAP Release (ECC 6.0 EhPx / S/4HANA release year)
   - Deployment model (On-Premise / RISE / Public Cloud)
   - Industry sector
3. **Always distinguish ECC vs S/4HANA** behavior where they differ (e.g. BSEG vs ACDOCA, FD32 vs UKM_BP, F.05 vs FAGL_FC_VAL).
4. **Transport request required** for any configuration change in dev/QA/prod.
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, F110 등은 반드시 Test Run 선행.
6. **Never recommend SE16N** data edits in production.
7. **Always provide T-code + menu path** for every action.

---

## 📋 Standard Response Format

SAP 이슈 답변은 다음 구조를 반드시 따르세요:

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

---

## 🧠 지식 소스 — 디렉토리 구조

```
sapstack/
├── plugins/<module>/skills/<module>/
│   ├── SKILL.md                    ← 영문 원본 지식 (Claude Code 포맷)
│   └── references/
│       ├── *.md                    ← 영문 상세 참조
│       └── ko/
│           ├── quick-guide.md      ← 한국어 퀵가이드
│           └── SKILL-ko.md         ← 한국어 전문 가이드 (일부 모듈)
├── agents/<name>.md                ← Claude subagent 프롬프트 (재활용 가능)
├── commands/<name>.md              ← 슬래시 커맨드 워크플로
├── data/
│   ├── tcodes.yaml                 ← 확정 T-code 데이터셋
│   └── sap-notes.yaml              ← 확정 SAP Note 데이터셋
└── .sapstack/config.example.yaml   ← 환경 프로필 템플릿
```

### 질문이 들어오면 다음 순서로 찾아보세요

1. **키워드 매칭**으로 해당 모듈 SKILL.md 식별
   - "MIRO" → `plugins/sap-mm/skills/sap-mm/SKILL.md` + `plugins/sap-fi/skills/sap-fi/SKILL.md`
   - "ABAP dump" → `plugins/sap-abap/skills/sap-abap/SKILL.md`
   - "전자세금계산서" → `plugins/sap-bc/skills/sap-bc/SKILL.md`
2. **한국어 답변이 필요**하면 `references/ko/` 참조
3. **T-code 검증**: `data/tcodes.yaml`에서 존재 여부 확인
4. **SAP Note 인용**: `data/sap-notes.yaml`에 있는 번호만 언급 (추정 금지)
5. **사용자 환경**: `.sapstack/config.yaml` 있으면 자동 참조

---

## 📦 13개 모듈

| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| sap-fi | Financial Accounting | FB01, F110, MIRO, period close, AP, AR, GL, AA, tax, GR/IR |
| sap-co | Controlling | cost center, KSU5, KO88, CK11N, CO-PA, settlement |
| sap-tr | Treasury & Cash Management | FF7A, FF7B, liquidity, FLQDB, cash position |
| sap-mm | Materials Management | MIGO, MIRO, ME21N, GR/IR, purchasing, inventory |
| sap-sd | Sales & Distribution | VA01, VF01, billing, pricing, credit, delivery |
| sap-pp | Production Planning | MRP, MD01, CO01, BOM, routing |
| sap-hcm | HCM On-Premise | HCM, PA30, infotype, payroll, PC00, time |
| sap-sfsf | SuccessFactors | SuccessFactors, EC, ECP, Recruiting, RBP, OData |
| sap-abap | ABAP Development | ABAP, SE38, BAdI, CDS, RAP, ST22, clean core, ATC |
| sap-s4-migration | ECC → S/4HANA Migration | migration, brownfield, readiness, BP, SUM, ATC |
| sap-btp | SAP Business Technology Platform | BTP, CAP, Fiori, OData, XSUAA |
| sap-basis | BASIS Administration (Global, English) | BASIS, STMS, transport, PFCG, SM50, performance |
| **sap-bc** | **한국 BC 컨설턴트 특화 (BC = Basis의 한국 버전)** | BC, 베이시스, 한국, Solman, 전자세금계산서, 망분리, K-SOX |

### ⚠️ sap-basis vs sap-bc 관계
- **본질**: 둘 다 SAP Basis(시스템 관리·Transport·권한·성능)를 다룹니다.
- **분리 이유**: 한국 현장 특화 이슈(한글 Unicode·망분리·전자세금계산서·K-SOX·공인인증서)는 별도 파일로 분리하는 것이 유지보수에 유리합니다.
- **한국 업계 용어**: 한국 SAP 업계에서 "BC 컨설턴트"는 "Basis Consultant"와 동일한 의미로 쓰입니다. `BC = Basis` 입니다.
- **선택 기준**: 한국어 답변이나 한국 localization 이슈면 `sap-bc`, 글로벌 영문 주제면 `sap-basis`.

---

## 🤖 서브에이전트 프롬프트 재활용

`agents/*.md`의 프롬프트는 Claude Code 전용이지만, **프롬프트 본문 자체는 범용적**이라 다른 AI에게도 system prompt로 주입 가능합니다.

| 에이전트 | 한 줄 역할 |
|---------|----------|
| sap-fi-consultant | FI 이슈 체계적 진단 |
| sap-abap-reviewer | ABAP 코드 리뷰 (Clean Core, HANA, ATC) |
| sap-s4-migration-advisor | 마이그레이션 경로 추천 + Risk |
| sap-basis-troubleshooter | Basis 장애 증상 라우팅 |
| sap-mm-consultant | MM 전반 (구매·재고·GR/IR) |

### Codex CLI에서 사용 예시
```bash
# 저장소를 sub-directory로 가져옴
git submodule add https://github.com/BoxLogoDev/sapstack sapstack

# Codex에게 sapstack 맥락을 로드하도록 지시
codex "sapstack의 sap-fi-consultant 에이전트 프롬프트를 따라 다음 이슈를 진단해줘: MIRO에서 세금코드가 안 잡힙니다. S/4HANA 2023, 회사코드 KR01"
```

Codex는 `AGENTS.md`를 자동 로드하므로 별도 플래그 없이 이 가이드를 따릅니다.

---

## 📝 기여 가이드

이 저장소를 확장하거나 새 SAP 이슈 패턴을 추가하려면 `CONTRIBUTING.md`를 참조하세요. 다음 원칙을 지키세요:

1. 새 SKILL.md는 **프론트매터 필수** (name, description ≤1024자, allowed-tools)
2. **하드코딩 금지** — `./scripts/check-hardcoding.sh --strict`로 검증
3. **T-code 등록** — 새 T-code 언급 시 `data/tcodes.yaml`에 추가
4. **SAP Note 검증** — 확실한 번호만 `data/sap-notes.yaml`에 등록
5. **품질 게이트 통과**:
   ```bash
   ./scripts/lint-frontmatter.sh
   ./scripts/check-marketplace.sh
   ./scripts/check-hardcoding.sh --strict
   ./scripts/check-tcodes.sh
   ```

---

## 🔗 원본 참조

- 저장소: https://github.com/BoxLogoDev/sapstack
- Claude Code용 설치: `/plugin marketplace add https://github.com/BoxLogoDev/sapstack`
- 라이선스: MIT

## 📚 관련 문서

- `README.md` — 일반 사용자 가이드
- `CLAUDE.md` — Claude Code용 Universal Rules (영문)
- `CONTRIBUTING.md` — 기여 절차 (한국어)
- `docs/architecture.md` — 3축 구조 설명
- `docs/multi-ai-compatibility.md` — 다른 AI 도구에서 sapstack 쓰는 법 ⭐
- `docs/environment-profile.md` — `.sapstack/config.yaml` 가이드
- `docs/roadmap.md` — v1.2.0 이후 로드맵
