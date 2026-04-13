<div align="center">

# 🏛 sapstack

### Enterprise SAP Operations Platform for AI Coding Assistants

**20 plugins · 16 agents · 18 commands · 55+ IMG guides · 43+ best practices · 6 languages · SAP AI ready**

🌐 **Languages**: [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](https://github.com/BoxLogoDev/sapstack/releases/tag/v1.7.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/BoxLogoDev/sapstack/actions)
[![English](https://img.shields.io/badge/English-Universal-blue.svg)](README.en.md)
[![Multi-AI](https://img.shields.io/badge/AI%20tools-7-purple.svg)](docs/multi-ai-compatibility.md)
[![Kiro](https://img.shields.io/badge/Kiro-ready-00D4AA.svg)](docs/kiro-quickstart.md)

<p>
  <a href="docs/tutorial.md"><b>Tutorial</b></a> ·
  <a href="docs/faq.md"><b>FAQ</b></a> ·
  <a href="docs/glossary.md"><b>Glossary</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>Multi-AI Guide</b></a> ·
  <a href="docs/roadmap.md"><b>Roadmap</b></a>
</p>

</div>

---

## ⚡ 30-Second Introduction

sapstack turns **AI coding assistants into SAP operations consultants** — an enterprise platform for entire SAP operational lifecycle management. Version 1.6.0 covers Configure → Implement → Operate → Diagnose → Optimize across all SAP modules.

- 🎯 **18 SAP modules + Evidence Loop orchestrator** — FI/CO/TR/MM/SD/PP/PM/QM/WM/EWM/HCM/SFSF/ABAP/S4Mig/BTP/BASIS/BC/GTS
- 🤖 **15 agents** — 14 module consultants + **SAP Tutor** (new hire onboarding)
- ⚙️ **18 slash commands** — period-end closing, debugging, Evidence Loop, IMG, best practices, diagnostics
- 🏗 **52 IMG configuration guides** — SPRO paths, step-by-step setup, ECC vs S/4 differences, validation
- 📋 **40+ best practices** — 3-Tier framework (Operational · Period-End · Governance)
- 🏢 **Enterprise documentation** — multi-company codes, SSC, intercompany, global rollouts, system landscape
- 🏭 **Industry-specific guides** — manufacturing, retail, financial services
- 🌐 **7 AI tools compatible** — Claude Code, Codex CLI, Copilot, Cursor, Continue.dev, Aider, Kiro
- 🇰🇷 **Korean field language layer** — 80+ synonyms, 62 symptom index, 41 T-code pronunciations (primary focus for Korean enterprises)
- 📊 **340+ T-codes · 57 SAP Notes · 8 data assets**
- 🔁 **Evidence Loop** — INTAKE → HYPOTHESIS → COLLECT → VERIFY (falsification criteria + mandatory rollback)
- 🛡 **11 quality gates** — IMG, best practices, industry checks, strict CI

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
In Kiro chat: "Find recently changed cost centers" → automatic synonym expansion matching.
Details: **[docs/kiro-quickstart.md](docs/kiro-quickstart.md)** · **[docs/kiro-integration.md](docs/kiro-integration.md)**

### 3️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..
codex "Diagnose F110 payment run: vendor showing 'No payment method' error"
```

### 4️⃣ GitHub Copilot (VS Code)
Clone repository or copy `.github/copilot-instructions.md` → auto-detected

### 5️⃣ Cursor / Continue.dev / Aider
Automatically load `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md`

Details: **[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 Architecture — 5-Axis Structure (v1.6.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                     sapstack v1.6.0                              │
│            Enterprise SAP Operations Platform                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Configure]  →  [Implement]  →  [Operate]  →  [Diagnose]  →  [Optimize]  │
│   52 IMG guides    Enterprise     15 agents     Evidence Loop   40 Best     │
│   SPRO paths       6 docs         18 commands    62 symptoms    Practices  │
│   11 modules       3 industries   340+ T-codes   4-turn loop    3-Tier     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ① Active Advisors          ② Context Persistence              │
│  • 19 SKILL.md              • .sapstack/config.yaml             │
│  • 15 subagents             • .sapstack/sessions/*/state.yaml   │
│  • 18 commands              • 5 JSON schemas                    │
│  • 80+ synonyms             • Audit trail (append-only)         │
│                                                                  │
│  ③ Evidence Loop            ④ Quality Gates (11 CI types)       │
│  • 4-turn diagnosis loop    • lint / marketplace / hardcoding   │
│  • Falsifiability required  • tcodes / references / links       │
│  • Fix + Rollback pair      • ecc-s4-split / multi-ai build     │
│                              • img-refs / best-practices         │
│  ⑤ Enterprise Layer 🆕                                          │
│  • IMG Configuration (52 guides)                                │
│  • Best Practice (3-Tier: Operational/Period-End/Governance)    │
│  • Enterprise Scenarios (Multi-CC, SSC, IC, Global Rollout)     │
│  • Industry Guides (Manufacturing, Retail, Financial)           │
└─────────────────────────────────────────────────────────────────┘
```

Details: [docs/architecture.md](docs/architecture.md) · Evidence Loop: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md)

---

## 🔁 Evidence Loop — From Advice Bot to Diagnosis Partner (v1.5.0)

sapstack v1.5.0 shifts from **single-turn advice** to **turn-aware diagnosis partner**. Even without live SAP access, the "check → fix → verify" loop works asynchronously.

### 4-Turn Structure
```
Turn 1 INTAKE     → Operator provides initial symptom + evidence
Turn 2 HYPOTHESIS → AI generates 2-4 hypotheses (falsification required) + follow-up request
Turn 3 COLLECT    → Operator gathers evidence from SAP (AI waits)
Turn 4 VERIFY     → Hypothesis confirmed/rejected + fix plan + mandatory rollback
```

### 3 Access Surfaces
| Surface | User | Tool |
|---|---|---|
| **A — CLI** | Operator | `/sap-session-{start,add-evidence,next-turn}` |
| **B — IDE** | Operator | VS Code Extension (v1.6 planned) |
| **C — Web** | End user | `web/triage.html` + `web/session.html` (static, serverless) |

All three surfaces connect via **same session ID** for handoff. Typical flow: end-user starts diagnosis on web, operator continues via CLI.

### Core Principles
- **Falsifiability**: Every hypothesis requires falsification criteria
- **Rollback-or-no-Fix**: Confirmed fixes must have rollback pair
- **Audit trail**: All state changes recorded (append-only)
- **No live SAP**: Operator acts as executor (human-in-the-loop async loop)

Details: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md) · Real example: [aidlc-docs/sapstack/f110-dog-food.md](aidlc-docs/sapstack/f110-dog-food.md)

---

## 📦 20-Plugin Catalog (18 domain + 2 meta)

### 💰 Core Financials
| Plugin | Topic | Keywords |
|--------|-------|----------|
| [`sap-fi`](plugins/sap-fi/) | Financial Accounting | FB01, F110, MIRO, period close, GR/IR, tax |
| [`sap-co`](plugins/sap-co/) | Controlling | cost center, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | Treasury & Cash | FF7A, FF7B, liquidity, MT940, DMEE |

### 📦 Logistics & Supply Chain
| Plugin | Topic | Keywords |
|--------|-------|----------|
| [`sap-mm`](plugins/sap-mm/) | Materials Management | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | Sales & Distribution | VA01, VF01, FD32, pricing, credit |
| [`sap-pp`](plugins/sap-pp/) | Production Planning | MRP, MD01/MD04, CO01, BOM, routing |
| [`sap-pm`](plugins/sap-pm/) 🆕 | Plant Maintenance | IE01, IW31, IP01, MTBF/MTTR, equipment |
| [`sap-qm`](plugins/sap-qm/) 🆕 | Quality Management | QA01, QP01, QA11, QM01, ISO/GMP/HACCP |
| [`sap-wm`](plugins/sap-wm/) 🆕 | Warehouse Mgmt (ECC) | LT01, LS01N, ⚠️ S/4 deprecated |
| [`sap-ewm`](plugins/sap-ewm/) 🆕 | Extended Warehouse Mgmt | /SCWM/MON, Wave, RF |

### 👥 Human Resources
| Plugin | Topic | Keywords |
|--------|-------|----------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM On-Premise (ECC + H4S4) | PA30, PC00_M46, payroll, tax |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, recruiting, LMS, RBP |

### 💻 Technology
| Plugin | Topic | Keywords |
|--------|-------|----------|
| [`sap-abap`](plugins/sap-abap/) | ABAP Development | SE38, BAdI, CDS, RAP, ST22 |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | Brownfield, Greenfield, SUM, ATC |
| [`sap-btp`](plugins/sap-btp/) | Business Technology Platform | CAP, Fiori, OData, XSUAA |
| [`sap-basis`](plugins/sap-basis/) | BASIS Administration | STMS, SM50, PFCG, Kernel |

### 🇰🇷 Korea Specialization + 🌍 Global Trade
| Plugin | Topic | Keywords |
|--------|-------|----------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | BASIS — Korea Edition | BC, network isolation, e-tax invoice, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | Global Trade Services | HS code, UNI-PASS, FTA, export/import, customs |

### 🔁 Meta — Evidence Loop Orchestrator (v1.5.0 experimental)
| Plugin | Topic | Role |
|--------|-------|------|
| [`sap-session`](plugins/sap-session/) 🔁 | Evidence Loop Orchestrator | Combines 18 plugins + 15 agents into turn-aware diagnostic loop. Orchestration layer only. |

> **💡 BC vs Basis**: In Korean SAP industry, "BC consultant" = "Basis Consultant". `sap-bc` is the Korea-specific variant of `sap-basis` (Korean Unicode, network isolation, e-tax invoice, K-SOX). **Recommended for Korean projects: install both**.

---

## 🤖 15 Agents

### Module Consultants (14)
| Agent | Role | Escalate when |
|-------|------|---|
| `sap-fi-consultant` | Financial Accounting | journal entry, period-end, tax, GR/IR |
| `sap-co-consultant` | Controlling | cost center, allocation, CO-PA, product costing |
| `sap-tr-consultant` 🆕 | Treasury & Cash | liquidity, bank reconciliation, DMEE |
| `sap-mm-consultant` | Materials Management | purchase, inventory, GR/IR, MIGO |
| `sap-sd-consultant` | Sales & Distribution | order, shipment, billing, credit |
| `sap-pp-consultant` | Production Planning | MRP, BOM, manufacturing order |
| `sap-hcm-consultant` 🆕 | HR Management | payroll, time, tax, year-end accounting |
| `sap-pm-consultant` 🆕 | Plant Maintenance | equipment, maintenance order, MTBF/MTTR |
| `sap-qm-consultant` 🆕 | Quality Management | inspection, release decision, ISO/GMP |
| `sap-ewm-consultant` 🆕 | Warehouse Mgmt | wave, picking, RF, WM migration |
| `sap-abap-developer` | ABAP Code Review | code quality, Clean Core |
| `sap-basis-consultant` | Basis Triage | dump, work process, transport |
| `sap-s4-migration-advisor` | S/4HANA Readiness | migration questions |
| `sap-integration-advisor` | Integration Architecture | RFC, IDoc, OData, CPI |

### 🎓 SAP Tutor (1) 🆕
| Agent | Role | Escalate when |
|-------|------|---|
| `sap-tutor` 🆕 | New hire onboarding | SAP basics, module intro, terminology |

> **💡 sap-tutor**: Routes questions from new hires to module consultants, translates answers to beginner-friendly language. Great for "What is this?", "Why do we do this that way?" questions.

---

## ⚙️ 18 Slash Commands

```bash
# Period-end closing
/sap-fi-closing monthly <company-code>     # Monthly checklist
/sap-quarter-close <cc> <quarter>          # Quarterly close (IFRS + SOX)
/sap-year-end <cc> <year>                  # Year-end (tax + audit)

# Debug (single-turn Quick Advisory mode)
/sap-migo-debug <error-code> <mv-type>     # MIGO posting error
/sap-payment-run-debug <vendor-code>       # F110 payment run
/sap-transport-debug <TR-id>               # STMS failure diagnosis
/sap-tax-invoice-debug <type>              # E-tax invoice issues
/sap-performance-check <target>            # Performance diagnostics

# Analysis & Review
/sap-abap-review <file-path>               # ABAP code review delegation
/sap-s4-readiness --auto                   # S/4 migration assessment

# Evidence Loop (turn-aware mode)
/sap-session-start "<symptom>"             # Turn 1 INTAKE — new session
/sap-session-add-evidence <id> <files...>  # Turn 1 extend or Turn 3 response
/sap-session-next-turn <session-id>        # Auto advance Turn 2/4 (state-based)

# v1.6.0 🆕 — IMG / Best Practice / Diagnostics
/sap-img-guide <module> <area>             # IMG configuration guide
/sap-master-data-check [vendor|material]   # Master data pre-validation
/sap-bp-review <module> [operational|all]  # Best practice compliance check
/sap-pm-diagnosis [equipment|symptom]      # Equipment failure diagnosis
/sap-qm-inspection [inspection-lot|material] # Quality inspection analysis
```

> **💡 Mode selection**: Simple knowledge query ("What is FB01?") → single-turn quick command. Real incident diagnosis or cross-module review → `/sap-session-*` loop. CLAUDE.md's **Dual Response Format** auto-selects.

---

## 🌐 Multi-AI Compatibility (7 tools)

| AI Tool | Entry File | Added |
|---------|-----------|-------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md` (native) | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | v1.2.0 |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | v1.3.0 |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | v1.3.0 |
| **Amazon Kiro IDE** 🆕 | [`AGENTS.md`](AGENTS.md) + [`.kiro/steering/`](.kiro/steering/) | **v1.5.0** |

**Design principle**: "One source of truth (SKILL.md) + N thin compatibility layers". Whatever AI you use, **Universal Rules + Response Format + knowledge quality** stays consistent.

**Kiro integration highlight**: All steering files use `#[[file:...]]` **reference syntax** to inject sapstack source in real-time — no copying, no drift, auto-updates with sapstack releases. Details: [docs/kiro-quickstart.md](docs/kiro-quickstart.md) · [docs/kiro-integration.md](docs/kiro-integration.md)

**v1.5.0 new**: **MCP server scaffolding** ([mcp/server.ts](mcp/server.ts)) — 5 read tools (`resolve_symptom`, `check_tcode`, `list_sessions`, `resolve_sap_note`, `list_plugins`) **work immediately**. Write tools (`start_session`, `add_evidence`, `next_turn`) planned for v1.6.0.

📖 **Real examples**: [docs/examples/](docs/examples/) — actual session screenshots & usage for 6 tools

---

## 🛡 Universal Rules

All SAP answers **must** follow 8 core rules:

1. **NEVER hardcode** company codes, G/L accounts, or org units
2. **ALWAYS ask** for environment (release, deployment, company code)
3. **ALWAYS distinguish** ECC vs S/4HANA behavior where they differ
4. **Transport request required** for any configuration change
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **Never recommend SE16N** data edits in production
7. **Always provide T-code + SPRO menu path**
8. 🆕 **Use field language** — Respond in user's language (ko/en/zh/ja/de/vi); field terms remain English

> **💡 SAP Notes**: Only cite notes in `data/sap-notes.yaml` registry — no speculative citations. See [plugins/sap-session/skills/sap-session/references/](plugins/sap-session/skills/sap-session/references/).

---

## 🌐 Multilingual + Korean Field Language Layer

Not just translation, but **real Korean SAP workplace vocabulary** — accepting field-native expressions like "코스트 센터" (cost center) with dual notation "(코스트 센터, KOSTL)".

- ✅ **19/19 modules** quick guides + professional translation
- ✅ **80+ term synonyms** ([data/synonyms.yaml](data/synonyms.yaml)) — FI/CO/MM/SD/PP/PM/QM/WM/EWM/BASIS
- ✅ **Abbreviations + business time markers** (D-1, month-end D+3, provisional close, final close)
- ✅ **41 T-code Korean pronunciations** ([data/tcode-pronunciation.yaml](data/tcode-pronunciation.yaml))
- ✅ **62 natural language symptom index** ([data/symptom-index.yaml](data/symptom-index.yaml)) — 18 modules
- ✅ 🆕 **Field language style guide** ([korean-field-language.md](plugins/sap-session/skills/sap-session/references/korean-field-language.md)) — dual notation, conversational patterns, abbreviation usage, business time markers
- ✅ **sap-bc** — Korea BC consultant specialization (network isolation, e-tax invoice, K-SOX, Korean Unicode)
- ✅ 🆕 **Synonym matching engine** — auto-unifies "코스트센터" + "원가센터" + "KOSTL" as one concept (web/triage.js, mcp/server.ts)

### 🌐 Multilingual Support (v1.7.0 — 6 languages)
| Language | symptom-index | synonyms | UI i18n | Status |
|---|---|---|---|---|
| 🇰🇷 Korean (ko) | 62/62 | 80+ | Full | Primary |
| 🇬🇧 English (en) | 62/62 | 80+ | Full | Full |
| 🇨🇳 Chinese (zh) | 62/62 | 40+ | Full | 🆕 v1.7 |
| 🇯🇵 Japanese (ja) | 62/62 | 40+ | Full | 🆕 v1.7 |
| 🇩🇪 German (de) | 62/62 | 40+ | Full | 🆕 v1.7 |
| 🇻🇳 Vietnamese (vi) | 62/62 | 40+ | Full | 🆕 v1.7 |

Contribute translations: [docs/i18n/symptom-index.md](docs/i18n/symptom-index.md)

### Enable in Config
```yaml
# .sapstack/config.yaml
preferences:
  language: en
  country: us    # Localization hint for region-specific checks
```

---

## 📊 Data Assets

| Asset | Count | File | Version |
|-------|-------|------|---------|
| Verified T-codes | **340+** | [`data/tcodes.yaml`](data/tcodes.yaml) | v1.6.0 |
| Verified SAP Notes | **57** | [`data/sap-notes.yaml`](data/sap-notes.yaml) | v1.6.0 |
| Symptom Index | **62** (ko/en complete) | [`data/symptom-index.yaml`](data/symptom-index.yaml) | v1.6.0 |
| Synonyms | **80+ terms** | [`data/synonyms.yaml`](data/synonyms.yaml) | v1.6.0 |
| T-code Pronunciation | **41** (Korean) | [`data/tcode-pronunciation.yaml`](data/tcode-pronunciation.yaml) | v1.5.0 |
| Evidence Loop Schemas | **5 JSON Schema** | [`schemas/`](schemas/) | v1.5.0 |
| 🆕 Period-End Sequence | **24 steps** (dependency graph) | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) | **v1.6.0** |
| 🆕 Master Data Rules | **5 master types** | [`data/master-data-rules.yaml`](data/master-data-rules.yaml) | **v1.6.0** |
| 🆕 Industry Matrix | **3 industries** | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) | **v1.6.0** |
| Config schema | ✅ | [`.sapstack/config.schema.yaml`](.sapstack/config.schema.yaml) | v1.3.0 |

### Search Tools
```bash
./scripts/resolve-note.sh migration ACDOCA  # Multi-keyword search
grep -q "^FAGL_FC_VAL:" data/tcodes.yaml   # T-code registry validation
```

### 🌐 Web UI (v1.5.0 expanded)
| Page | Purpose |
|---|---|
| [`web/index.html`](web/index.html) | SAP Note Resolver — 50+ verified notes |
| 🆕 [`web/triage.html`](web/triage.html) | **End-user self-triage** — symptom input → synonym expansion → operator escalation |
| 🆕 [`web/session.html`](web/session.html) | **Evidence Loop viewer** — drag & drop state.yaml, read-only sharing |

All **static sites** (no server, no SAP connection) — deploy to GitHub Pages.

---

## ✅ Installation Verification

```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# Run all 11 quality gates
./scripts/lint-frontmatter.sh              # Frontmatter validation
./scripts/check-marketplace.sh             # marketplace.json structure
./scripts/check-hardcoding.sh --strict     # No hardcoded company codes
./scripts/check-tcodes.sh --strict         # T-code registry
./scripts/check-links.sh --strict          # Internal link validation
./scripts/check-ecc-s4-split.sh --strict   # ECC/S/4 separation
./scripts/build-multi-ai.sh --check        # Compatibility layer drift
./scripts/check-img-references.sh          # 🆕 IMG configuration guides
./scripts/check-best-practices.sh          # 🆕 Best Practice 3-Tier
./scripts/check-industry-refs.sh           # 🆕 Industry-specific guides
```

All gates pass = ✅ Ready to use. Same steps run in CI automatically.

---

## 🎓 Learning Paths

| Level | Path |
|-------|------|
| 🆕 **Beginners** | [Tutorial — 15 min](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **Intermediate** | [5 real scenarios](docs/scenarios/) → [Glossary](docs/glossary.md) |
| 🏗 **Advanced** | [Architecture](docs/architecture.md) → [Multi-AI guide](docs/multi-ai-compatibility.md) |
| 🤝 **Contributors** | [CONTRIBUTING](CONTRIBUTING.md) → [Plugin scaffolding](scripts/new-plugin.sh) |
| 🔒 **Security** | [SECURITY](SECURITY.md) → [CoC](CODE_OF_CONDUCT.md) |

---

## 🧪 Extended Tools

### v1.7.0 NEW
- 🌐 **6-language support** — ko, en, zh, ja, de, vi (symptom-index + synonyms + UI)
- ☁️ **SAP Cloud PE** ([plugins/sap-cloud/](plugins/sap-cloud/)) — S/4HANA Cloud Public Edition specialist
- 🤖 **SAP AI/Joule research** ([docs/sap-ai-integration.md](docs/sap-ai-integration.md)) — Joule vs sapstack positioning, synergy strategy
- 🔧 **Agent refinement** — basis→consultant, abap→developer, new cloud agent

### v1.6.0
- 🏗 **IMG Configuration Framework** — 52 SPRO-based guides, 11 modules
- 📋 **Best Practice Framework** — 3-Tier (Operational/Period-End/Governance), 40 docs
- 🏢 **Enterprise Scenarios** — multi-company, SSC, intercompany, global rollouts, system landscape
- 🏭 **Industry Guides** — manufacturing, retail, financial services
- 🎓 **SAP Tutor Agent** — new hire onboarding
- 🔧 **4 new modules** — PM, QM, WM, EWM

### v1.5.0
- 🔁 **Evidence Loop Framework** ([plugins/sap-session/](plugins/sap-session/)) — turn-aware diagnosis + 5 JSON schemas
- 🔌 **MCP Server Runtime** ([mcp/server.ts](mcp/server.ts)) — 5 read tools working, write tools v1.6.0
- 🩺 **Triage Portal** ([web/triage.html](web/triage.html)) — end-user self-triage
- 📖 **Session Viewer** ([web/session.html](web/session.html)) — read-only state.yaml viewer
- 🇰🇷 **Korean field language** ([data/synonyms.yaml](data/synonyms.yaml)) — 58 terms + 10 abbreviations + 15 time markers
- ⚡ **Kiro integration** ([.kiro/steering/](.kiro/steering/)) — 4 steering files + MCP config

### v1.4.0 and earlier
- 🎨 **VS Code Extension** ([extension/](extension/)) — session command contracts redefined (stub v1.6 TS port)
- 🌐 **Note Resolver** ([web/index.html](web/index.html)) — static SAP Note search
- 🏗 **Scaffolding scripts** — `scripts/new-{agent,command,plugin}.sh`
- 🔄 **Reusable CI** — `.github/workflows/sapstack-ci-reusable.yml`

---

## 🏛 Related Projects

- [Amazon Kiro IDE](https://kiro.dev/) — native sapstack integration since v1.5.0 (AGENTS.md + steering + MCP)
- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0 scaffolding, v1.6.0 write-path
- [SAP Help Portal](https://help.sap.com/) — official documentation
- [SAP Support Portal](https://launchpad.support.sap.com/) — SAP Notes source
- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — DESIGN.md inspiration

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

**Commercial use, modification, and distribution all permitted** with copyright notice retained.

---

## 🤝 Contributing

- 🐛 **Bug reports**: [Issues](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ **Feature requests**: [Feature Request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 📦 **New module proposals**: [New Module](https://github.com/BoxLogoDev/sapstack/issues/new?template=new_module.md)
- 💬 **Discussion**: [Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 **Contributing guide**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**

Built for Korean SAP consultants, shared with the global community.

[⬆ Back to top](#-sapstack)

</div>
