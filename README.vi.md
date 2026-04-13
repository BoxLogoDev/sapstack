<div align="center">

# 🏛 sapstack

### Nền tảng SAP Enterprise Operations cho AI Coding Assistants

**20 plugins · 16 agents · 18 commands · 55+ IMG guides · 43+ best practices · 6 languages · SAP AI ready**

🌐 **Languages**: [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](https://github.com/BoxLogoDev/sapstack/releases/tag/v1.7.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/BoxLogoDev/sapstack/actions)
[![Vietnamese](https://img.shields.io/badge/Tiếng%20Việt-Universal-red.svg)](README.vi.md)
[![Multi-AI](https://img.shields.io/badge/AI%20tools-7-purple.svg)](docs/multi-ai-compatibility.md)
[![Kiro](https://img.shields.io/badge/Kiro-ready-00D4AA.svg)](docs/kiro-quickstart.md)

<p>
  <a href="docs/tutorial.md"><b>Hướng dẫn</b></a> ·
  <a href="docs/faq.md"><b>Câu hỏi thường gặp</b></a> ·
  <a href="docs/glossary.md"><b>Thuật ngữ</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>Hướng dẫn Multi-AI</b></a> ·
  <a href="docs/roadmap.md"><b>Lộ trình</b></a>
</p>

</div>

---

## ⚡ Giới thiệu 30 giây

sapstack chuyển đổi **AI coding assistants thành SAP operations consultants** — một nền tảng doanh nghiệp cho toàn bộ vòng đời hoạt động SAP. Phiên bản 1.6.0 bao gồm Cấu hình → Triển khai → Vận hành → Chẩn đoán → Tối ưu hóa.

- 🎯 **18 mô-đun SAP + Evidence Loop orchestrator** — FI/CO/TR/MM/SD/PP/PM/QM/WM/EWM/HCM/SFSF/ABAP/S4 Migration/BTP/BASIS/BC/GTS
- 🤖 **15 agents** — 14 module consultants + **SAP Tutor** (onboarding nhân viên mới)
- ⚙️ **18 slash commands** — đóng cửa kỳ, gỡ lỗi, Evidence Loop, IMG, best practices, chẩn đoán
- 🏗 **52 IMG configuration guides** — SPRO paths, thiết lập từng bước, ECC vs S/4 khác biệt, xác thực
- 📋 **40+ best practices** — 3-Tier framework (Operational·Period-End·Governance)
- 🏢 **Enterprise documentation** — multiple company codes, SSC, intercompany, global rollouts
- 🏭 **Industry-specific guides** — manufacturing, retail, financial services
- 🌐 **7 AI tools compatible** — Claude Code, Codex CLI, Copilot, Cursor, Continue.dev, Aider, Kiro
- 🇰🇷 **Korean field language layer** — 80+ synonyms, 62 symptom index, 41 T-code pronunciations (Korean enterprises focus)
- 📊 **340+ T-codes · 57 SAP Notes · 8 data assets**
- 🔁 **Evidence Loop** — INTAKE → HYPOTHESIS → COLLECT → VERIFY (falsification criteria + mandatory rollback)
- 🛡 **11 quality gates** — IMG, best practices, industry checks, strict CI

---

## 🚀 Bắt đầu nhanh

### 1️⃣ Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack sap-bc@sapstack
```

### 2️⃣ Amazon Kiro IDE ⭐ MỚI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack/mcp && npm install && npm run build && cd ../..
cp sapstack/.kiro/settings/mcp.json .kiro/settings/mcp.json
cp sapstack/.kiro/steering/*.md .kiro/steering/
```
Trong Kiro chat: "Tìm các cost centers thay đổi gần đây" → automatic synonym expansion matching.
Chi tiết: **[docs/kiro-quickstart.md](docs/kiro-quickstart.md)** · **[docs/kiro-integration.md](docs/kiro-integration.md)**

### 3️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..
codex "Chẩn đoán F110 payment run: vendor hiển thị lỗi 'No payment method'"
```

### 4️⃣ GitHub Copilot (VS Code)
Clone repository hoặc sao chép `.github/copilot-instructions.md` → tự động phát hiện

### 5️⃣ Cursor / Continue.dev / Aider
Tự động tải `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md`

Chi tiết: **[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 Kiến trúc — Cấu trúc 5 trục (v1.6.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                     sapstack v1.6.0                              │
│         SAP Enterprise Operations Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Configure] → [Implement] → [Operate] → [Diagnose] → [Optimize]│
│   52 IMG       Enterprise   15 agents    Evidence    40+ Best   │
│   guides       6 docs       18 commands  Loop 62     Practices  │
│   SPRO paths   3 industries 340+ T-codes symptoms   3-Tier     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ① Active Advisors          ② Context Persistence              │
│  • 19 SKILL.md              • .sapstack/config.yaml             │
│  • 15 sub-agents            • .sapstack/sessions/*/state.yaml   │
│  • 18 commands              • 5 JSON schemas                    │
│  • 80+ synonyms             • Audit trail (append-only)         │
│                                                                  │
│  ③ Evidence Loop            ④ Quality Gates (11 CI types)       │
│  • 4-turn diagnosis loop    • lint / marketplace / hardcoding   │
│  • Falsifiability required  • tcodes / references / links       │
│  • Fix + Rollback pair      • ecc-s4-split / multi-ai build     │
│                              • img-refs / best-practices        │
│  ⑤ Enterprise Layer 🆕                                          │
│  • IMG Configuration (52 guides)                                │
│  • Best Practice (3-Tier: Operational/Period-End/Governance)    │
│  • Enterprise Scenarios (Multi-CC, SSC, IC, Global Rollout)     │
│  • Industry Guides (Manufacturing, Retail, Financial)           │
└─────────────────────────────────────────────────────────────────┘
```

Chi tiết: [docs/architecture.md](docs/architecture.md) · Evidence Loop: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md)

---

## 🔁 Evidence Loop — Từ Advice Bot đến Diagnosis Partner (v1.5.0)

sapstack v1.5.0 chuyển từ **single-turn advice** thành **turn-aware diagnosis partner**. Ngay cả không có truy cập SAP trực tiếp, vòng lặp "kiểm tra → sửa → xác minh" vẫn hoạt động không đồng bộ.

### Cấu trúc 4 lượt
```
Lượt 1 INTAKE     → Operator cung cấp triệu chứng ban đầu + bằng chứng
Lượt 2 HYPOTHESIS → AI tạo 2-4 giả thuyết (yêu cầu phản chứng) + yêu cầu tiếp theo
Lượt 3 COLLECT    → Operator thu thập bằng chứng từ SAP (AI chờ)
Lượt 4 VERIFY     → Xác nhận/từ chối giả thuyết + fix plan + bắt buộc rollback
```

### 3 bề mặt truy cập
| Bề mặt | Người dùng | Công cụ |
|---|---|---|
| **A — CLI** | Operator | `/sap-session-{start,add-evidence,next-turn}` |
| **B — IDE** | Operator | VS Code Extension (v1.6 lập kế hoạch) |
| **C — Web** | End user | `web/triage.html` + `web/session.html` (tĩnh, không máy chủ) |

Cả ba bề mặt kết nối qua **cùng session ID** để chuyển giao. Luồng điển hình: người dùng cuối bắt đầu chẩn đoán trên web, operator tiếp tục qua CLI.

### Nguyên tắc cốt lõi
- **Falsifiability**: Mỗi giả thuyết yêu cầu tiêu chí phản chứng
- **Rollback-or-no-Fix**: Các sửa chữa được xác nhận phải có cặp rollback
- **Audit trail**: Tất cả thay đổi trạng thái được ghi lại (chỉ nối thêm)
- **No live SAP**: Operator hoạt động như executor (human-in-the-loop async loop)

Chi tiết: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md) · Ví dụ thực tế: [aidlc-docs/sapstack/f110-dog-food.md](aidlc-docs/sapstack/f110-dog-food.md)

---

## 📦 Danh mục 20 Plugin (18 miền + 2 meta)

### 💰 Core Financials
| Plugin | Chủ đề | Từ khóa |
|--------|-------|----------|
| [`sap-fi`](plugins/sap-fi/) | Financial Accounting | FB01, F110, MIRO, period close, GR/IR, tax |
| [`sap-co`](plugins/sap-co/) | Controlling | cost center, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | Treasury & Cash | FF7A, FF7B, liquidity, MT940, DMEE |

### 📦 Logistics & Supply Chain
| Plugin | Chủ đề | Từ khóa |
|--------|-------|----------|
| [`sap-mm`](plugins/sap-mm/) | Materials Management | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | Sales & Distribution | VA01, VF01, FD32, pricing, credit |
| [`sap-pp`](plugins/sap-pp/) | Production Planning | MRP, MD01/MD04, CO01, BOM, routing |
| [`sap-pm`](plugins/sap-pm/) 🆕 | Plant Maintenance | IE01, IW31, IP01, MTBF/MTTR |
| [`sap-qm`](plugins/sap-qm/) 🆕 | Quality Management | QA01, QP01, QA11, QM01, ISO/GMP/HACCP |
| [`sap-wm`](plugins/sap-wm/) 🆕 | Warehouse Mgmt (ECC) | LT01, LS01N, ⚠️ S/4 deprecated |
| [`sap-ewm`](plugins/sap-ewm/) 🆕 | Extended Warehouse Mgmt | /SCWM/MON, Wave, RF |

### 👥 Human Resources
| Plugin | Chủ đề | Từ khóa |
|--------|-------|----------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM On-Premise (ECC + H4S4) | PA30, PC00_M46, payroll, tax |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, recruiting, LMS, RBP |

### 💻 Technology
| Plugin | Chủ đề | Từ khóa |
|--------|-------|----------|
| [`sap-abap`](plugins/sap-abap/) | ABAP Development | SE38, BAdI, CDS, RAP, ST22 |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | Brownfield, Greenfield, SUM, ATC |
| [`sap-btp`](plugins/sap-btp/) | Business Technology Platform | CAP, Fiori, OData, XSUAA |
| [`sap-basis`](plugins/sap-basis/) | BASIS Administration | STMS, SM50, PFCG, Kernel |

### 🇰🇷 Korea Specialization + 🌍 Global Trade
| Plugin | Chủ đề | Từ khóa |
|--------|-------|----------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | BASIS — Korea Edition | BC, network isolation, e-tax invoice, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | Global Trade Services | HS code, UNI-PASS, FTA, export/import |

### 🔁 Meta — Evidence Loop Orchestrator (v1.5.0 thử nghiệm)
| Plugin | Chủ đề | Vai trò |
|--------|-------|------|
| [`sap-session`](plugins/sap-session/) 🔁 | Evidence Loop Orchestrator | Kết hợp 18 plugins và 15 agents thành turn-aware diagnostic loop. Chỉ orchestration layer. |

---

## 🤖 15 Agents

### Module Consultants (14)
| Agent | Vai trò | Khi nào upgrade |
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
| Agent | Vai trò | Khi nào upgrade |
|-------|------|---|
| `sap-tutor` 🆕 | New hire onboarding | SAP basics, module intro, terminology |

---

## ⚙️ 18 Slash Commands

```bash
# Period-end closing
/sap-fi-closing monthly <company-code>     # Monthly checklist
/sap-quarter-close <cc> <quarter>          # Quarterly close (IFRS + SOX)
/sap-year-end <cc> <year>                  # Year-end (tax + audit)

# Debug
/sap-migo-debug <error-code> <mv-type>     # MIGO posting error
/sap-payment-run-debug <vendor-code>       # F110 payment run
/sap-transport-debug <TR-id>               # STMS failure diagnosis
/sap-tax-invoice-debug <type>              # E-tax invoice issues
/sap-performance-check <target>            # Performance diagnostics

# Analysis & Review
/sap-abap-review <file-path>               # ABAP code review delegation
/sap-s4-readiness --auto                   # S/4 migration assessment

# Evidence Loop
/sap-session-start "<symptom>"             # Turn 1 INTAKE
/sap-session-add-evidence <id> <files...>  # Turn 1 extend or Turn 3 response
/sap-session-next-turn <session-id>        # Auto advance Turn 2/4

# v1.6.0 🆕 — IMG / Best Practice / Diagnostics
/sap-img-guide <module> <area>             # IMG configuration guide
/sap-master-data-check [vendor|material]   # Master data pre-validation
/sap-bp-review <module> [operational|all]  # Best practice compliance check
/sap-pm-diagnosis [equipment|symptom]      # Equipment failure diagnosis
/sap-qm-inspection [inspection-lot|material] # Quality inspection analysis
```

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

**Design principle**: "One source of truth (SKILL.md) + N thin compatibility layers". Bất kỳ AI nào bạn sử dụng, **Universal Rules + Response Format + knowledge quality** vẫn nhất quán.

---

## 🛡 Universal Rules

Tất cả câu trả lời SAP **phải** tuân theo 8 quy tắc cốt lõi:

1. **NEVER hardcode** company codes, G/L accounts, hoặc organizational units
2. **ALWAYS ask** for environment (release, deployment, company code)
3. **ALWAYS distinguish** ECC vs S/4HANA behavior
4. **Transport request required** for any configuration change
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **Never recommend SE16N** data edits in production
7. **Always provide T-code + SPRO menu path**
8. 🆕 **Use field language** — Trả lời bằng ngôn ngữ của người dùng (ko/en/zh/ja/de/vi); field terms ở lại tiếng Anh

---

## 🌐 Multilingual + Korean Field Language Layer

Không chỉ dịch, mà là **real Korean SAP workplace vocabulary** — chấp nhận field-native expressions như "코스트 센터" (cost center) với dual notation "(코스트 센터, KOSTL)".

- ✅ **19/19 modules** quick guides + professional translation
- ✅ **80+ term synonyms** ([data/synonyms.yaml](data/synonyms.yaml))
- ✅ **Abbreviations + business time markers**
- ✅ **41 T-code Korean pronunciations**
- ✅ **62 natural language symptom index** (18 modules)
- ✅ 🆕 **Field language style guide**
- ✅ **sap-bc** — Korea BC consultant specialization
- ✅ 🆕 **Synonym matching engine** — auto-unifies variants

### 🌐 Multilingual Support (v1.7.0 — 6 languages)
| Ngôn ngữ | symptom-index | synonyms | Trạng thái |
|---|---|---|---|
| 🇰🇷 Korean (ko) | 62/62 | 80+ | Primary |
| 🇬🇧 English (en) | 62/62 | 80+ | Full |
| 🇨🇳 Chinese (zh) | 62/62 | 40+ | 🆕 v1.7 |
| 🇯🇵 Japanese (ja) | 62/62 | 40+ | 🆕 v1.7 |
| 🇩🇪 German (de) | 62/62 | 40+ | 🆕 v1.7 |
| 🇻🇳 Vietnamese (vi) | 62/62 | 40+ | 🆕 v1.7 |

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
| 🆕 Period-End Sequence | **24 steps** | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) | **v1.6.0** |
| 🆕 Master Data Rules | **5 master types** | [`data/master-data-rules.yaml`](data/master-data-rules.yaml) | **v1.6.0** |
| 🆕 Industry Matrix | **3 industries** | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) | **v1.6.0** |

### 🌐 Web UI (v1.5.0 expanded)
| Page | Purpose |
|---|---|
| [`web/index.html`](web/index.html) | SAP Note Resolver — 50+ verified notes |
| 🆕 [`web/triage.html`](web/triage.html) | **End-user self-triage** — symptom input → synonym expansion → operator escalation |
| 🆕 [`web/session.html`](web/session.html) | **Evidence Loop viewer** — state.yaml reader |

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
./scripts/check-ecc-s4-split.sh --strict   # ECC/S4 separation
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

## 🏛 Related Projects

- [Amazon Kiro IDE](https://kiro.dev/) — native sapstack integration since v1.5.0
- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0 scaffolding
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
