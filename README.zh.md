<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="标准小姐 — sapstack 吉祥物" width="280" />

_“在 SAP 中这是标准，所以无法更改。” — 标准小姐 ([品牌指南](MASCOT.md))_

### AI 编码助手的 SAP 企业运营平台

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**24 个插件 · 20 个代理 · 22 个命令 · MCP 23 个工具 (npm) · VS Code 扩展 v2.4.0 · 兼容 8 个 AI 工具 · 6 个国家 · 6 种语言 · 合规就绪**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack 是什么？

**sapstack** 为 Claude、Copilot、Cursor 等 AI 工具**注入 SAP 专业知识**。覆盖 SAP 运营全生命周期 —— **Configure → Implement → Operate → Diagnose → Optimize**。

```
┌──────────────────────────────────────────────────────────────┐
│ SAP 运营人员 ─┐                                               │
│              ├─→ [AI Tool] ←── sapstack ──→ SAP 知识         │
│ 新员工培训师 ─┤      ↓                       + IMG 指南       │
│              ├── Evidence Loop               + 最佳实践       │
│ 顾问 ─────────┘   (4 轮诊断)                 + 合规           │
└──────────────────────────────────────────────────────────────┘
```

> 决策原则见 [**ETHOS.md**](ETHOS.md) —— 实证优先 · 证据先行 · 禁止硬编码 · ECC≠S/4 · 现场术语 · 运营者决定。

---

## 👥 适合谁

| 你是… | sapstack 这样帮你 |
|---|---|
| **SAP 运营人员**（一线，赶结账） | 用 **Evidence Loop（4 轮）** 诊断故障 —— 假设→证据→验证→回滚，无需实时访问。用症状命令（`/sap-migo-debug`、`/sap-payment-run-debug` …）直接开始。 |
| **新员工培训师 / 新人** | `sap-tutor` 对问题分类，委派给模块专家，并把答案翻译成初学者语言。始终同时给出 T-code 与菜单路径。 |
| **SAP 顾问 / 合作伙伴** | 把 24 个模块知识 + IMG 配置 + 3 层最佳实践 + 合规注入 AI 工具，按客户环境快速落地。 |

---

## 🧭 Golden Path — 何时用什么

不是零散的工具，而是**一条路径**。完整指南：**[docs/workflow.md](docs/workflow.md)** · 完成度差距分析：[docs/gstack-gap-analysis.md](docs/gstack-gap-analysis.md)

| 你想要的 | 路径 |
|---|---|
| 快速事实答案 | **Quick Advisory** — 直接提问 |
| 故障诊断 | **Evidence Loop**（4 轮）→ 模块顾问 / 症状命令 |
| 不确定模块 | `sap-tutor`（分类后委派专家） |
| 配置（IMG）问题 | `/sap-img-guide` |
| 期末结账 | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |
| 为项目贡献 | 维护者 Golden Path |

> 卡住了就上一层（Evidence Loop），不清楚就从 `sap-tutor` 开始。

---

## ✅ 实际效果 (See it work)

**场景**：_“我想在 MIGO 过账收货，但总是失败。”_ —— Evidence Loop 用证据而非断言逐步缩小范围。

```
Turn 1 · INTAKE      先确认环境：ECC(EhP?) / S/4(版本?)，移动类型 (MvT)，
                     完整错误信息 (M7 xxx)。
Turn 2 · HYPOTHESIS  A：过账期间未打开 —— 检查：MMRV 中当前期间是否与过账日期一致？
                     （证伪：若一致则排除 A）
                     B：移动类型 / 科目确定 (OBYC) —— 检查：…
Turn 3 · COLLECT     （运营者执行 MMRV → 反馈结果）
Turn 4 · VERIFY      确认期间不匹配 → 修复：用 MMPV 滚动期间（先模拟，经 Transport）。
                     附回滚计划 + 相关 SAP Note 指针。
```

> 每个假设都有**证伪标准**，每个修复都有**回滚计划**。不直接写入生产 —— 由运营者决定。(→ [ETHOS](ETHOS.md))

---

## 核心功能

### 🎯 SAP 全模块覆盖
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 19 个专家代理 + 1 个 SAP 导师
16 个模块顾问 (FI·CO·TR·MM·SD·PP·PM·QM·EWM·HCM·IBP·SAC·Ariba·Integration-Cloud·Cloud·BASIS) + ABAP developer + Integration advisor + S4 migration advisor + **SAP tutor**（新员工培训）

### 🔁 Evidence Loop (v1.5+)
无需实时 SAP 访问即可诊断 —— **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4 轮结构，必须有证伪条件，必须配回滚

### 🏗 IMG 配置框架 (v1.6+)
76 个基于 SPRO 的配置指南 —— 配置步骤、ECC 与 S/4 差异、验证方法

### 📋 3 层最佳实践
**Operational**（日常）· **Period-End**（期末）· **Governance**（治理）—— 应用于 23 个模块

### 🌐 6 种语言支持 (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt —— 24 模块 × 5 语言 = 120 quick-guide

### ☁️ S/4HANA Cloud PE 就绪
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` —— 在 Claude Desktop 中运行完整 Evidence Loop。**23 个工具 + 12 个提示 + 9 个资源**。

### 💻 VS Code Extension (v2.4.0)
会话管理侧栏 · YAML 校验 · Webview 渲染 · File Watcher

### 🛡 合规就绪 (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · 网络隔离部署 · PII 自动脱敏

---

## 快速开始

### ⚡ 5分钟上手（推荐起点）
非开发者也能用一条命令从安装到首次诊断。详情：[docs/quickstart-5min.md](docs/quickstart-5min.md)
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   仅检查: ./setup.sh --check
```

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP 服务器)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
在 VS Code Marketplace 搜索 "sapstack" → Install ·（或从 [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases) 直接安装 `.vsix`）

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### 其他 (Codex / Copilot / Cursor / Continue.dev / Aider)
克隆仓库 → 自动识别。详见：[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universal Rules

1. **绝不硬编码** —— 禁止固定公司代码、总账科目、组织单位
2. **环境采集优先** —— 先确认 SAP 版本、部署模式、公司代码
3. **明确区分 ECC 与 S/4HANA** —— 明确版本差异行为
4. **必须 Transport** —— 生产变更始终经 Transport
5. **先模拟** —— AFAB、F.13、FAGL_FC_VAL、MR11、F110 等
6. **禁止 SE16N 编辑** —— 不建议直接修改生产数据
7. **T-code + SPRO 路径** —— 每项操作两者都给
8. **韩语优先现场术语** —— 双标注 "코스트 센터 (원가센터, KOSTL)"

> 这些规则的*原因*见 [**ETHOS.md**](ETHOS.md)，完整运营规则见 [CLAUDE.md](CLAUDE.md)。

---

## 学习路径

| 级别 | 路径 |
|------|------|
| 🆕 **入门** | [教程 (15 分钟)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **实战** | [5 个场景](docs/scenarios/) → [术语表](docs/glossary.md) |
| 🧭 **工作流** | [Golden Path](docs/workflow.md) → [差距分析](docs/gstack-gap-analysis.md) |
| 🏗 **深入** | [架构](docs/architecture.md) → [Multi-AI 指南](docs/multi-ai-compatibility.md) |
| 🔒 **安全** | [SECURITY.md](SECURITY.md) → [合规](docs/compliance/) |
| 🤝 **贡献** | [CONTRIBUTING](CONTRIBUTING.md) → [路线图](docs/roadmap.md) |

---

## 数据资产

| 资产 | 数量 | 文件 |
|------|------|------|
| 确定 T-code | 361 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 自然语言症状索引 | 90（6 种语言） | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| 确定 SAP Note/KBA | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 多语言同义词 | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 期末序列 | 24 步 | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 行业矩阵 | 7 industries | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## 插件目录

| 领域 | 插件 |
|------|----------|
| 💰 **财务** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **物流** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **人力资源** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **技术** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **云/集成** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **韩国/全球** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **元** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## 多语言审校 — 欢迎贡献

5 种语言（en/zh/ja/de/vi）的 quick-guide 为 **Claude 撰写的初稿**。欢迎各语言母语者 + SAP 领域专家审校。

- 流程 · 标准 · PR 格式：**[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- 反馈：[Translation Feedback issue](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-code/Note 编号不翻译（保持原样）

---

## 许可证 & 贡献

**MIT License** —— 商业与非商业使用均自由。请保留版权声明。

- 🐛 [Bug 报告](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [功能请求](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [讨论](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [贡献指南](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
