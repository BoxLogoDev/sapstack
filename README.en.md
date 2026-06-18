<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="Ms. Standard — the sapstack mascot" width="280" />

_"In SAP, it's standard, so it can't be changed." — Ms. Standard ([brand guide](MASCOT.md))_

### AI Coding Assistant for SAP Enterprise Operations

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**24 plugins · 20 agents · 22 commands · MCP 23 tools (npm) · VS Code extension v2.3.3 · 8 AI tool compat · 6 countries · 6 languages · Compliance ready**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## What is sapstack?

**sapstack** injects **SAP domain expertise** into AI tools like Claude, Copilot, and Cursor. It covers the full SAP operations lifecycle — **Configure → Implement → Operate → Diagnose → Optimize**.

```
┌──────────────────────────────────────────────────────────────┐
│ SAP operator ─┐                                               │
│              ├─→ [AI Tool] ←── sapstack ──→ SAP knowledge    │
│ New-hire ─────┤      ↓                       + IMG guides     │
│ trainer      ├── Evidence Loop               + Best Practice  │
│ Consultant ───┘   (4-turn diagnosis)         + Compliance     │
└──────────────────────────────────────────────────────────────┘
```

> Decision principles live in [**ETHOS.md**](ETHOS.md) — Ground-truth · Evidence first · No hardcoding · ECC≠S/4 · Field language · Operator decides.

---

## 👥 Who this is for

| You are… | sapstack does this |
|---|---|
| **SAP operator** (on the floor, racing the close) | Diagnose incidents via the **Evidence Loop (4 turns)** — hypothesis→evidence→verify→rollback, no live access needed. Jump straight in with symptom commands (`/sap-migo-debug`, `/sap-payment-run-debug` …). |
| **New-hire trainer / new joiner** | `sap-tutor` classifies your question, delegates to a module specialist, and translates the answer into beginner language. T-code + menu path always paired. |
| **SAP consultant / partner** | Inject 24 modules of knowledge + IMG configuration + 3-Tier Best Practice + compliance into your AI tools, adapted per client landscape. |

---

## 🧭 Golden Path — what to use when

Not scattered tools, but **one path**. Full guide: **[docs/workflow.md](docs/workflow.md)** · Completeness gap analysis: [docs/gstack-gap-analysis.md](docs/gstack-gap-analysis.md)

| What you want | The path |
|---|---|
| A quick factual answer | **Quick Advisory** — just ask |
| Incident diagnosis | **Evidence Loop** (4 turns) → module consultant / symptom command |
| Don't know the module | `sap-tutor` (classifies, delegates to a specialist) |
| Config (IMG) issue | `/sap-img-guide` |
| Period-end close | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |
| Contribute to the project | Maintainer Golden Path |

> Stuck? Go one level up (Evidence Loop). Lost? Start with `sap-tutor`.

---

## ✅ See it work

**Scenario**: _"I'm trying to post a goods receipt in MIGO but it keeps failing."_ — the Evidence Loop narrows down with evidence, not assertions.

```
Turn 1 · INTAKE      Environment first: ECC(EhP?) / S/4(release?), movement type (MvT),
                     full error message (M7 xxx).
Turn 2 · HYPOTHESIS  A: posting period not open — check: does MMRV show the current
                     period matching the posting date? (falsify: if it matches, drop A)
                     B: movement type / account determination (OBYC) — check: …
Turn 3 · COLLECT     (operator runs MMRV → reports the result)
Turn 4 · VERIFY      Period mismatch confirmed → Fix: roll the period with MMPV
                     (simulate first, via Transport). Rollback plan + relevant SAP Note pointer.
```

> Every hypothesis carries a **falsification criterion**; every fix carries a **rollback plan**. No direct production writes — the operator decides. (→ [ETHOS](ETHOS.md))

---

## Core Features

### 🎯 Full SAP module coverage
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 19 specialist agents + 1 SAP tutor
16 module consultants (FI·CO·TR·MM·SD·PP·PM·QM·EWM·HCM·IBP·SAC·Ariba·Integration-Cloud·Cloud·BASIS) + ABAP developer + Integration advisor + S4 migration advisor + **SAP tutor** (new-hire training)

### 🔁 Evidence Loop (v1.5+)
Diagnose without live SAP access — **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4-turn structure, falsification criteria required, rollback pairing required

### 🏗 IMG Configuration Framework (v1.6+)
76 SPRO-based configuration guides — config steps, ECC vs S/4 differences, verification methods

### 📋 3-Tier Best Practice
**Operational** (daily) · **Period-End** (closing) · **Governance** — applied across 23 modules

### 🌐 6-language support (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt — 24 modules × 5 languages = 120 quick-guides

### ☁️ S/4HANA Cloud PE ready
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — run the full Evidence Loop from Claude Desktop. **23 tools + 12 prompts + 9 resources**.

### 💻 VS Code Extension (v2.3.3)
Session sidebar · YAML validation · Webview rendering · File Watcher

### 🛡 Compliance ready (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · air-gapped deployment · automatic PII masking

---

## Quick Start

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP server)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
Search "sapstack" in the VS Code Marketplace → Install · (or install the `.vsix` directly from a [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases))

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Others (Codex / Copilot / Cursor / Continue.dev / Aider)
Clone the repo → auto-detected. Details: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universal Rules

1. **Never hardcode** — no fixed company codes, GL accounts, or org units
2. **Environment intake first** — confirm SAP release, deployment model, company code
3. **Distinguish ECC vs S/4HANA** — be explicit about version-specific behavior
4. **Transport required** — production changes always go through a Transport
5. **Simulate first** — AFAB, F.13, FAGL_FC_VAL, MR11, F110, etc.
6. **No SE16N edits** — never recommend direct production data edits
7. **T-code + SPRO path** — provide both for every action
8. **Field language first (Korean)** — dual notation "코스트 센터 (원가센터, KOSTL)"

> The *why* behind these rules is in [**ETHOS.md**](ETHOS.md); the full operating rules in [CLAUDE.md](CLAUDE.md).

---

## Learning Path

| Level | Path |
|------|------|
| 🆕 **Start** | [Tutorial (15 min)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **Practice** | [5 scenarios](docs/scenarios/) → [Glossary](docs/glossary.md) |
| 🧭 **Workflow** | [Golden Path](docs/workflow.md) → [Gap analysis](docs/gstack-gap-analysis.md) |
| 🏗 **Deep dive** | [Architecture](docs/architecture.md) → [Multi-AI guide](docs/multi-ai-compatibility.md) |
| 🔒 **Security** | [SECURITY.md](SECURITY.md) → [Compliance](docs/compliance/) |
| 🤝 **Contribute** | [CONTRIBUTING](CONTRIBUTING.md) → [Roadmap](docs/roadmap.md) |

---

## Data Assets

| Asset | Count | File |
|------|------|------|
| Verified T-codes | 361 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Natural-language symptom index | 90 (6 languages) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| Verified SAP Notes/KBAs | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Multilingual synonyms | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Period-end sequence | 24 steps | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Industry matrix | 7 industries | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Plugin Catalog

| Area | Plugins |
|------|----------|
| 💰 **Finance** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistics** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **HR** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Technology** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **Cloud/Integration** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **Korea/Global** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Translation Review — Contributions Welcome

The 5-language (en/zh/ja/de/vi) quick-guides are **Claude-authored drafts**. Review by native speakers + SAP domain experts is welcome.

- Process · criteria · PR format: **[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- Feedback: [Translation Feedback issue](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-code/Note numbers are not translated (kept verbatim)

---

## License & Contributing

**MIT License** — free for commercial and non-commercial use. Keep the copyright notice.

- 🐛 [Bug report](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Feature request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Contributing guide](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
