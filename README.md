<div align="center">

# 🏛 sapstack

### SAP Operations Advisory Platform for AI Coding Assistants

**15 plugins · 9 subagents · 13 commands · 7 AI tools · 279 T-codes · 20 symptoms · 58 synonyms · Evidence Loop**

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/BoxLogoDev/sapstack/releases/tag/v1.5.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/BoxLogoDev/sapstack/actions)
[![Korean](https://img.shields.io/badge/Korean-Field%20Language-red.svg)](plugins/sap-session/skills/sap-session/references/korean-field-language.md)
[![Multi-AI](https://img.shields.io/badge/AI%20tools-7-purple.svg)](docs/multi-ai-compatibility.md)
[![Kiro](https://img.shields.io/badge/Kiro-ready-00D4AA.svg)](docs/kiro-quickstart.md)

<p>
  <a href="docs/tutorial.md"><b>튜토리얼</b></a> ·
  <a href="docs/faq.md"><b>FAQ</b></a> ·
  <a href="docs/glossary.md"><b>🇰🇷 용어집</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>Multi-AI 가이드</b></a> ·
  <a href="docs/roadmap.md"><b>로드맵</b></a>
</p>

</div>

---

## ⚡ 30초 소개

sapstack은 **AI 코딩 어시스턴트를 SAP 운영 컨설턴트로 만드는 지식 플랫폼**입니다.
v1.5.0부터는 **Evidence Loop 진단 파트너** — 단발 조언봇이 아닌 턴 인식 루프로
작동합니다.

- 🎯 **14개 SAP 모듈 + 1개 Evidence Loop 오케스트레이터** (sap-session)
- 🤖 **9개 서브에이전트** — Evidence Loop에서 병렬 소환
- ⚙️ **13개 슬래시 커맨드** — 기존 10개 + sap-session 3개
- 🌐 **7개 AI 도구 호환** — Claude Code · Codex CLI · GitHub Copilot · Cursor · Continue.dev · Aider · **Amazon Kiro** ⭐ NEW
- 🇰🇷 **한국 현장체 언어 레이어** — "코스트 센터 (원가센터, KOSTL)" 이중 병기 + 58 용어 동의어 사전
- 📊 **279 T-code + 50+ SAP Note + 20 증상 인덱스 + 41 T-code 발음** 데이터셋
- 🔁 **Evidence Loop 4턴 구조** — INTAKE → HYPOTHESIS → COLLECT → VERIFY (반증 조건·Rollback 필수)
- 🩺 **엔드유저 셀프 트리아지 웹 포털** — `web/triage.html` (정적, 서버 없음)
- 🛡 **8개 품질 게이트** — Strict 모드 CI

---

## 🚀 Quick Start

### 1️⃣ Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack sap-bc@sapstack
```

### 2️⃣ Amazon Kiro IDE ⭐ NEW
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack/mcp && npm install && npm run build && cd ../..
cp sapstack/.kiro/settings/mcp.json .kiro/settings/mcp.json
cp sapstack/.kiro/steering/*.md .kiro/steering/
```
그 뒤 Kiro chat에서: `"코스트 센터 바뀐거 찾아줘"` → 자동 synonym 확장 매칭.
상세: **[docs/kiro-quickstart.md](docs/kiro-quickstart.md)** · **[docs/kiro-integration.md](docs/kiro-integration.md)**

### 3️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..
codex "sapstack 규칙에 따라 F110 돌렸는데 벤더 하나만 No payment method 뜨는 경우 진단해줘"
```

### 4️⃣ GitHub Copilot (VS Code)
저장소 clone 또는 `.github/copilot-instructions.md` 복사 → 자동 인식

### 5️⃣ Cursor / Continue.dev / Aider
각각 `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md` 자동 로드

상세: **[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 아키텍처 — 4축 구조 (v1.5.0)

```
┌───────────────────────────────────────────────────────────┐
│                    sapstack v1.5.0                        │
├───────────────────────────────────────────────────────────┤
│  ① Active Advisors       ② Context Persistence           │
│     (위임형 컨설턴트)          (환경 프로필 + 세션 상태)    │
│  • 15 SKILL.md           • .sapstack/config.yaml          │
│  • 9 subagents           • .sapstack/sessions/*/state.yaml│
│  • 13 commands           • 5 JSON Schemas                 │
│  • 58 synonyms           • 한국 Localization              │
│           ▲                        ▲                      │
│           └──────────┬─────────────┘                      │
│                      ▼                                    │
│  ③ Evidence Loop 🆕     ④ Quality Gates (8종 CI)         │
│     (턴 인식 진단 루프)     • lint / marketplace          │
│  • Turn 1 INTAKE         • hardcoding / tcodes (strict)   │
│  • Turn 2 HYPOTHESIS     • ko-refs / links (strict)       │
│  • Turn 3 COLLECT        • ecc-s4-split (strict)          │
│  • Turn 4 VERIFY         • build-multi-ai (drift)         │
│  • Fix + Rollback 필수                                    │
└───────────────────────────────────────────────────────────┘
```

상세: [docs/architecture.md](docs/architecture.md) · Evidence Loop: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md)

---

## 🔁 Evidence Loop — 조언봇에서 진단 파트너로 (v1.5.0 🆕)

sapstack v1.5.0은 **단발 조언봇**에서 **턴 인식 진단 파트너**로 전환됩니다.
라이브 SAP 접근 없이도 "확인 → 수정 → 재확인" 루프가 돌아요.

### 4턴 구조
```
Turn 1 INTAKE     → 운영자가 초기 증상 + 증거 업로드
Turn 2 HYPOTHESIS → AI가 2-4개 가설 (반증 조건 필수) + Follow-up Request
Turn 3 COLLECT    → 운영자가 SAP에서 증거 수집 (AI는 말하지 않음)
Turn 4 VERIFY     → 가설 확정/기각 + Fix Plan + 필수 Rollback Plan
```

### 3 Surfaces (접근 경로)
| Surface | 사용자 | 도구 |
|---|---|---|
| **A — CLI** | 운영자 | `/sap-session-{start,add-evidence,next-turn}` |
| **B — IDE** | 운영자 | VS Code Extension (stub, v1.6 실장) |
| **C — Web** | 엔드유저 | `web/triage.html` + `web/session.html` (정적, 서버 없음) |

세 표면이 **같은 세션 ID**로 연결되어 핸드오프 가능. 엔드유저가 웹에서 시작한
진단을 운영자가 CLI로 이어받는 것이 대표 플로우입니다.

### 핵심 원칙
- **Falsifiability**: 모든 가설은 반증 조건(`falsification_evidence`) 필수
- **Rollback-or-no-Fix**: 확정 Fix에는 반드시 Rollback 페어
- **Audit trail**: 모든 상태 변화는 append-only 기록
- **No live SAP**: 운영자가 실행기 역할 (Human-in-the-loop 비동기 루프)

상세: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md) · 실전 예시: [aidlc-docs/sapstack/f110-dog-food.md](aidlc-docs/sapstack/f110-dog-food.md)

---

## 📦 15개 플러그인 카탈로그 (14 domain + 1 meta)

### 💰 Core Financials
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-fi`](plugins/sap-fi/) | Financial Accounting | FB01, F110, MIRO, period close, GR/IR, tax |
| [`sap-co`](plugins/sap-co/) | Controlling | cost center, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | Treasury &amp; Cash | FF7A, FF7B, liquidity, MT940, DMEE |

### 📦 Logistics
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-mm`](plugins/sap-mm/) | Materials Management | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | Sales &amp; Distribution | VA01, VF01, FD32, pricing, credit |
| [`sap-pp`](plugins/sap-pp/) | Production Planning | MRP, MD01/MD04, CO01, BOM, routing |

### 👥 Human Resources
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM On-Premise (ECC + H4S4) | PA30, PC00_M46, 4대보험, 연말정산 |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, Recruiting, LMS, RBP |

### 💻 Technology
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-abap`](plugins/sap-abap/) | ABAP Development | SE38, BAdI, CDS, RAP, ST22, Clean Core |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | Brownfield, Greenfield, SUM, ATC, BP |
| [`sap-btp`](plugins/sap-btp/) | Business Technology Platform | CAP, Fiori, OData, XSUAA, iFlow |
| [`sap-basis`](plugins/sap-basis/) | BASIS Administration (**Global**) | STMS, SM50, PFCG, Kernel |

### 🇰🇷 Korea Specialization + 🌍 Global Trade
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | **Basis — 한국 버전** | BC, 베이시스, 망분리, 전자세금계산서, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | Global Trade Services | HS code, UNI-PASS, FTA, 수출입, 관세청 |

> **💡 BC = Basis**: 한국 SAP 업계에서 "BC 컨설턴트"는 "Basis Consultant"와 동의어입니다. `sap-bc`는 `sap-basis`의 한국 현장 특화 버전(한글 Unicode·망분리·전자세금계산서·K-SOX)입니다. **한국 프로젝트는 둘 다 설치 권장**.

### 🔁 Meta — Evidence Loop Orchestrator (v1.5.0 🆕 experimental)
| Plugin | 주제 | 역할 |
|--------|------|-----|
| [`sap-session`](plugins/sap-session/) 🔁 | Evidence Loop 오케스트레이터 | 기존 14개 플러그인과 9개 컨설턴트 에이전트를 턴 인식 루프로 결합. 새 에이전트 추가 없이 **오케스트레이션 레이어**만 제공. |

> **💡 새 지식은 추가 없음**: sap-session은 기존 14개 플러그인의 내용을 건드리지 않습니다. Evidence Loop의 Turn 2(가설)에서 `impacted_modules`를 보고 해당 컨설턴트 에이전트를 병렬 소환할 뿐입니다. 기존 단발 `/sap-payment-run-debug` 등도 그대로 작동합니다 (Dual Mode).

---

## 🤖 9개 서브에이전트

| Agent | 역할 | 위임 시점 |
|-------|------|----------|
| `sap-fi-consultant` | FI 전반 체계적 진단 | 복잡한 FI 문제 |
| `sap-co-consultant` | CO 전반 | 원가·배부·CO-PA |
| `sap-mm-consultant` | MM 전반 | 구매·재고·GR/IR |
| `sap-sd-consultant` | SD Order-to-Cash | 주문·배송·빌링·여신 |
| `sap-pp-analyzer` | PP 생산계획 | MRP·BOM·생산오더 |
| `sap-abap-reviewer` | ABAP 코드 리뷰 | 코드 품질·Clean Core |
| `sap-basis-troubleshooter` | Basis 장애 라우팅 | 덤프·WP행·Transport |
| `sap-s4-migration-advisor` | S/4HANA 경로 추천 | 마이그레이션 질문 |
| `sap-integration-advisor` | 통합 아키텍처 | RFC·IDoc·OData·CPI |

---

## ⚙️ 13개 슬래시 커맨드

```bash
# 결산
/sap-fi-closing 월결산 <회사코드>         # 월결산 체크리스트
/sap-quarter-close <회사코드> <분기>      # 분기 결산 (K-IFRS + K-SOX)
/sap-year-end <회사코드> <연도>           # 연결산 (법인세·감사)

# 디버그 (단발 Quick Advisory Mode)
/sap-migo-debug <에러번호> <이동유형>     # MIGO 포스팅 에러
/sap-payment-run-debug <벤더번호>         # F110 지급실행
/sap-transport-debug <TR ID>              # STMS 실패 진단
/sap-korean-tax-invoice-debug <유형>      # 전자세금계산서
/sap-performance-check <대상>             # 성능 점검

# 분석
/sap-abap-review <파일경로>               # ABAP 리뷰 위임
/sap-s4-readiness --auto                  # S/4 마이그레이션 평가

# Evidence Loop (v1.5.0 🆕 Turn-aware Mode)
/sap-session-start "<증상>"               # Turn 1 INTAKE — 새 세션 시작
/sap-session-add-evidence <id> <파일...>  # Turn 1 확장 or Turn 3 Follow-up 응답
/sap-session-next-turn <session_id>       # 자동 Turn 2/4 진행 (상태 기반)
```

> **💡 Mode 선택**: 단순 지식 질의("`FB01이 뭐야?`")는 기존 단발 커맨드로 즉답, 실제 인시던트 진단·크로스모듈 리뷰는 `/sap-session-*` 루프. CLAUDE.md의 **Dual Response Format**이 자동 선택합니다.

---

## 🌐 Multi-AI 호환 (7개 도구)

| AI 도구 | 진입점 파일 | 추가된 버전 |
|---------|-----------|-------------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md` (네이티브) | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) + [instructions/](.github/instructions/) | v1.2.0 (v1.3.0 split) |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | v1.3.0 |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | v1.3.0 |
| **Amazon Kiro IDE** 🆕 | [`AGENTS.md`](AGENTS.md) + [`.kiro/steering/`](.kiro/steering/) + [`.kiro/settings/mcp.json`](.kiro/settings/mcp.json) | **v1.5.0** |

**설계 원칙**: "원본 1개 (SKILL.md) + 얇은 호환 레이어 N개". 어떤 AI를 쓰든 **Universal Rules + Response Format + 지식 품질**이 일관됩니다.

**Kiro 통합의 특이점**: 모든 steering 파일이 `#[[file:...]]` **참조 문법**으로
sapstack 원본을 실시간 주입 — 복사 없음, drift 없음, sapstack 업데이트 시 자동
최신화. 상세: [docs/kiro-quickstart.md](docs/kiro-quickstart.md) · [docs/kiro-integration.md](docs/kiro-integration.md)

**v1.5.0 신규**: **MCP server 스캐폴딩** ([mcp/server.ts](mcp/server.ts)) — 읽기 툴 5개(`resolve_symptom`, `check_tcode`, `list_sessions`, `resolve_sap_note`, `list_plugins`)는 **즉시 작동**. 쓰기 툴(`start_session`, `add_evidence`, `next_turn`)은 v1.6.0 실장 예정.

📖 **실전 예시**: [docs/examples/](docs/examples/) — 6개 도구별 실제 세션 스크린샷 & 사용법

---

## 🛡 Universal Rules

모든 SAP 답변이 **반드시** 따르는 8가지 규칙:

1. **NEVER hardcode** company codes, G/L accounts, or org units
2. **ALWAYS ask** for environment (release, deployment, company code)
3. **ALWAYS distinguish** ECC vs S/4HANA behavior
4. **Transport request** required for any config change
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **Never recommend SE16N** data edits in production
7. **Always provide T-code + SPRO menu path**
8. 🆕 **Use field language, not dictionary Korean** — 한국어 응답은 현장체 우선, 외래어(공식번역, 필드코드) 이중 병기, 발화체 수용, T-code·약어 원형 유지, `D-1`/`월마감 D+3` 같은 업계 표준 표기

> **💡 보조 원칙**: SAP Note 인용은 `data/sap-notes.yaml`에 등록된 번호만 — 추정 금지. 상세: [plugins/sap-session/skills/sap-session/references/korean-field-language.md](plugins/sap-session/skills/sap-session/references/korean-field-language.md) · 58 용어 동의어 사전: [data/synonyms.yaml](data/synonyms.yaml)

---

## 🇰🇷 한국 현장체 언어 레이어 (v1.5.0 🆕)

단순한 한국어 번역이 아닌 **한국 SAP 현장의 실제 발화체**를 수용하는 언어
레이어. 번역체 "원가센터"가 아닌 현장체 "코스트 센터 (원가센터, KOSTL)"로
이중 병기합니다.

- ✅ 14/14 모듈 **한국어 퀵가이드 + 전문 번역**
- ✅ 🆕 **58 용어 동의어 사전** ([data/synonyms.yaml](data/synonyms.yaml)) — FI 20 / CO 8 / MM 12 / SD 10 / BASIS 8
- ✅ 🆕 **10 약어** (TR, PO, GR, TR, PR, IO, WBS, BP, GI) + **15 업무 시점 표기** (D-1, 월마감 D+3, 가결산, 확정결산, H1/H2)
- ✅ 🆕 **41 T-code 한국 발음 사전** ([data/tcode-pronunciation.yaml](data/tcode-pronunciation.yaml)) — "에프백십"=F110, "엠아이고"=MIGO, "에스이십육엔"=SE16N
- ✅ 🆕 **20 자연어 증상 인덱스** ([data/symptom-index.yaml](data/symptom-index.yaml)) — `symptom_ko_variants` 4-5개씩
- ✅ 🆕 **현장체 스타일 가이드** ([korean-field-language.md](plugins/sap-session/skills/sap-session/references/korean-field-language.md)) — 이중 병기, 발화체 수용, 약어 정착성, 업무 시점 표기 4원칙 + 금기 표현 리스트
- ✅ **sap-bc** — 한국 BC 컨설턴트 특화 (망분리·전자세금계산서·K-SOX·한글 Unicode)
- ✅ 🆕 **매칭 엔진 synonym 확장** — "코스트센터"와 "원가센터"와 "KOSTL"을 같은 개념으로 자동 통합 (web/triage.js, mcp/server.ts)

### 다국어 지원 (v1.5.0 시드)
| 언어 | symptom-index | UI i18n | 상태 |
|---|---|---|---|
| 🇰🇷 한국어 (ko) | 20/20 | 완전 | Primary |
| 🇬🇧 English (en) | 20/20 | 완전 | Full |
| 🇩🇪 Deutsch (de) | 3/20 | 15% | 🌱 Seed |
| 🇯🇵 日本語 (ja) | 3/20 | 15% | 🌱 Seed |

번역 기여: [docs/i18n/symptom-index.md](docs/i18n/symptom-index.md)

### 한국어 답변 활성화
```yaml
# .sapstack/config.yaml
preferences:
  language: ko
  country: kr    # 로컬라이제이션 힌트 — sap-session의 localized_checks 주입
```

---

## 📊 데이터 자산

| Asset | 카운트 | 파일 | 버전 |
|-------|-------|------|-----|
| 확정 T-codes | **279개** | [`data/tcodes.yaml`](data/tcodes.yaml) | v1.4.0 |
| 확정 SAP Notes | **50+개** | [`data/sap-notes.yaml`](data/sap-notes.yaml) | v1.4.0 |
| 🆕 Symptom Index | **20개** (ko/en 완전, de/ja 시드) | [`data/symptom-index.yaml`](data/symptom-index.yaml) | **v1.5.0** |
| 🆕 Synonyms | **58 용어 + 10 약어 + 15 업무 시점** | [`data/synonyms.yaml`](data/synonyms.yaml) | **v1.5.0** |
| 🆕 T-code Pronunciation | **41개** (한국 발음) | [`data/tcode-pronunciation.yaml`](data/tcode-pronunciation.yaml) | **v1.5.0** |
| 🆕 Evidence Loop Schemas | **5개 JSON Schema** | [`schemas/`](schemas/) | **v1.5.0** |
| Config schema | ✅ | [`.sapstack/config.schema.yaml`](.sapstack/config.schema.yaml) | v1.3.0 |

### 검색 도구
```bash
./scripts/resolve-note.sh korea            # 한국 Note 검색
./scripts/resolve-note.sh migration ACDOCA # 복합 키워드
grep -q "^FAGL_FC_VAL:" data/tcodes.yaml   # T-code 검증
```

### 🌐 Web UI (v1.5.0 확장)
| 페이지 | 용도 |
|---|---|
| [`web/index.html`](web/index.html) | SAP Note Resolver — 50+ 확정 Note 검색 |
| 🆕 [`web/triage.html`](web/triage.html) | **엔드유저 셀프 트리아지** — 증상 입력 → synonym 확장 매칭 → 운영자 에스컬레이션 |
| 🆕 [`web/session.html`](web/session.html) | **Evidence Loop 세션 뷰어** — state.yaml 드래그앤드롭, 읽기 전용 공유 |

모두 **정적 사이트**(서버 없음, SAP 연결 없음) — GitHub Pages 배포 가능.

---

## ✅ 설치 후 검증

```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# 8개 품질 게이트 전부 실행
./scripts/lint-frontmatter.sh              # 프론트매터
./scripts/check-marketplace.sh             # marketplace.json
./scripts/check-hardcoding.sh --strict     # 하드코딩 금지
./scripts/check-tcodes.sh --strict         # T-code 레지스트리
./scripts/check-ko-references.sh --strict  # 한국어 references
./scripts/check-links.sh --strict          # 내부 링크
./scripts/check-ecc-s4-split.sh --strict   # ECC/S4 구분
./scripts/build-multi-ai.sh --check        # 호환 레이어 drift
```

모든 게이트가 통과하면 ✅. CI에서도 같은 스텝이 자동 실행됩니다.

---

## 🎓 학습 경로

| 레벨 | 경로 |
|------|------|
| 🆕 **처음** | [튜토리얼 — 15분](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **중급** | [실전 시나리오 5개](docs/scenarios/) → [용어집](docs/glossary.md) |
| 🏗 **고급** | [아키텍처](docs/architecture.md) → [Multi-AI 가이드](docs/multi-ai-compatibility.md) |
| 🤝 **기여자** | [CONTRIBUTING](CONTRIBUTING.md) → [스캐폴딩 스크립트](scripts/new-plugin.sh) |
| 🔒 **보안** | [SECURITY](SECURITY.md) → [CoC](CODE_OF_CONDUCT.md) |

---

## 🧪 확장 도구

### v1.5.0 신규
- 🔁 **Evidence Loop Framework** ([plugins/sap-session/](plugins/sap-session/)) — 턴 인식 진단 루프 + 5 JSON Schema
- 🔌 **MCP Server Runtime** ([mcp/server.ts](mcp/server.ts)) — 읽기 툴 5개 즉시 작동, 쓰기 툴 v1.6.0 예정
- 🩺 **Triage Portal** ([web/triage.html](web/triage.html)) — 엔드유저 셀프 트리아지, synonym 확장 매칭
- 📖 **Session Viewer** ([web/session.html](web/session.html)) — state.yaml 읽기 전용 뷰어
- 🇰🇷 **Korean Field Language Layer** ([data/synonyms.yaml](data/synonyms.yaml)) — 58 용어 + 10 약어 + 15 업무 시점
- ⚡ **Kiro Integration** ([.kiro/steering/](.kiro/steering/)) — 4개 steering + MCP 설정 (참조 문법으로 sapstack 원본 주입)

### v1.4.0 이전
- 🎨 **VS Code Extension** ([extension/](extension/)) — v1.5.0에서 Session 명령 계약 재정의 (stub 유지, v1.6 TS 실장)
- 🌐 **Note Resolver** ([web/index.html](web/index.html)) — SAP Note 검색 정적 사이트
- 🏗 **Scaffolding Scripts** — `scripts/new-{agent,command,plugin}.sh`
- 🔄 **Reusable CI** — `.github/workflows/sapstack-ci-reusable.yml`

---

## 🏛 관련 프로젝트

- [Amazon Kiro IDE](https://kiro.dev/) — v1.5.0부터 sapstack 네이티브 통합 (AGENTS.md + steering + MCP)
- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0 스캐폴딩 runtime, v1.6.0 write-path 실장 예정
- [SAP Help Portal](https://help.sap.com/) — 공식 문서
- [SAP Support Portal](https://launchpad.support.sap.com/) — SAP Notes 원본
- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — 이 프로젝트의 DESIGN.md 영감

---

## 📜 라이선스

MIT License — 자세한 내용은 [LICENSE](LICENSE) 참조.

**상업적 사용·수정·배포 모두 허용**, 저작권 표기 유지 필요.

---

## 🤝 기여하기

- 🐛 **버그 리포트**: [Issues](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ **기능 요청**: [Feature Request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 📦 **새 모듈 제안**: [New Module](https://github.com/BoxLogoDev/sapstack/issues/new?template=new_module.md)
- 💬 **토론**: [Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 **기여 가이드**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**

Built for Korean SAP consultants, shared with the global community.

[⬆ 맨 위로](#-sapstack)

</div>
