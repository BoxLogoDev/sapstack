<div align="center">

# 🏛 sapstack

### AI Coding Assistant for SAP Enterprise Operations

**20 plugins · 16 agents · MCP runtime · VS Code extension · 6 languages · Compliance ready**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## What is sapstack?

**sapstack** is an open-source platform that injects **SAP domain expertise** into AI tools like Claude, Copilot, and Cursor. It covers the entire SAP operations lifecycle — **Configure → Implement → Operate → Diagnose → Optimize** — with evidence-based diagnostics.

```
┌──────────────────────────────────────────────────────────────┐
│ SAP Operator ─────┐                                          │
│                  ├─→ [AI Tool] ←── sapstack ──→ SAP Domain  │
│ Trainer ─────────┤      ↓                      + IMG Guides  │
│                  ├── Evidence Loop              + Best Pract. │
│ Consultant ──────┘    (4-Turn Diagnosis)       + Compliance  │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 🎯 Complete SAP Module Coverage
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 15 Specialist Agents + 1 SAP Tutor
11 Module Consultants + ABAP Developer + BASIS Consultant + Integration Advisor + S/4 Migration Advisor + **SAP Tutor** (employee onboarding)

### 🔁 Evidence Loop (v1.5+)
Diagnosis without live SAP access — **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4-turn structure, falsification criteria required, rollback pair mandatory

### 🏗 IMG Configuration Framework (v1.6+)
55+ SPRO-based configuration guides — setup steps, ECC vs S/4 differences, validation methods included

### 📋 3-Tier Best Practice
**Operational** (daily) · **Period-End** (closing) · **Governance** (audit) — applied systematically across 11 modules

### 🌐 6-Language Support (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt

### ☁️ S/4HANA Cloud PE Ready
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — run full Evidence Loop in Claude Desktop. 5 read tools + 3 write tools.

### 💻 VS Code Extension (v2.0+)
Session sidebar · YAML validation · Webview rendering · File Watcher

### 🛡 Compliance Ready (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · Air-gapped deployment · Automatic PII masking

---

## Quick Start

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP Server)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
Search "sapstack" in VS Code Marketplace → Install

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Other Platforms (Codex / Copilot / Cursor / Continue.dev / Aider)
Clone repository → auto-detected. Details: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universal Rules

1. **Never hardcode company codes** — No fixed company codes, GL accounts, cost centers, or organizational units
2. **Environment intake first** — Confirm SAP release, deployment model, and company structure upfront
3. **Explicit ECC vs S/4HANA** — Version-specific behavior must be clearly distinguished
4. **Transport requirement** — All production changes require transport request
5. **Simulation before execution** — Run AFAB, F.13, FAGL_FC_VAL, MR11, F110 in test first
6. **No SE16N edits** — Production data direct modification not recommended
7. **T-code + SPRO path** — Provide both for every action
8. **Evidence-based diagnosis** — Every hypothesis needs falsification criteria

---

## Learning Path

| Level | Path |
|-------|------|
| 🆕 **Beginner** | [Tutorial (15 min)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **Practical** | [5 Scenarios](docs/scenarios/) → [Glossary](docs/glossary.md) |
| 🏗 **Advanced** | [Architecture](docs/architecture.md) → [Multi-AI Guide](docs/multi-ai-compatibility.md) |
| 🔒 **Security** | [SECURITY.md](SECURITY.md) → [Compliance](docs/compliance/) |
| 🤝 **Contribute** | [CONTRIBUTING](CONTRIBUTING.md) → [Roadmap](docs/roadmap.md) |

---

## Data Assets

| Asset | Qty | File |
|-------|-----|------|
| Validated T-codes | 340+ | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Natural Language Symptom Index | 62 (6 langs) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP Notes | 57+ | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Multilingual Synonyms | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Period-End Sequence | 24 steps | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Industry Matrix | 3 sectors | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Plugin Catalog

| Domain | Plugins |
|--------|---------|
| 💰 **Finance** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistics** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Human Capital** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Technology** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| 🌍 **Global** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## License & Contributing

**MIT License** — free for commercial and non-commercial use. Attribution required.

- 🐛 [Report Bug](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Request Feature](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Start Discussion](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Contribution Guide](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for SAP professionals worldwide · Open source for the global community

</div>
