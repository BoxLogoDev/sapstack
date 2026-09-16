<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="标准小姐 — sapstack 吉祥物" width="280" />

_"在 SAP 里这是标准，所以改不了。" — 标准小姐（[品牌指南](MASCOT.md)）_

### 面向 SAP 运维的 AI 桌面应用

**装上就能问 — 从标准流程到贵公司的自定义（Z/Y）程序。**

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**Windows 桌面应用 v2.6.0 · 24 插件 · 21 智能体 · 23 命令 · CBO 快照 · 支持隔离网络 · 6 种语言 · 合规就绪**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack 是什么？

**sapstack** 是面向 SAP 业务用户和顾问的**SAP 专用 AI 桌面应用**。
不需要 ADT、开发权限或自己的 API 密钥 — 打开应用，输入一个问题即可。

```
"运行 F110 付款时出错"          → 4 轮 Evidence Loop 诊断（假设→证据→验证→回滚）
"月结顺序是什么？"              → 期末结账序列 + T-code/菜单路径
"ZFI0042 是做什么的程序？"      → 读取贵公司自定义代码（CBO 快照）并用业务语言解释
```

底层是覆盖 SAP 运维全生命周期（**Configure → Implement → Operate → Diagnose → Optimize**）的
24 个模块知识、IMG 指南、最佳实践与合规内容；同样的知识也可在 Claude Code、MCP、VS Code 中
使用（→ [面向开发者与高级用户的集成](#-面向开发者与高级用户的集成)）。

> 决策原则见 [**ETHOS.md**](ETHOS.md) — 基于事实 · 证据优先 · 禁止硬编码 · ECC≠S/4 · 现场术语 · 由操作员决定。

---

## 👥 适合谁

| 你是… | sapstack 桌面这样帮你 |
|---|---|
| **SAP 业务用户**（赶结账、无开发权限） | 在主屏输入问题即可 — 故障自动进入 **4 轮 Evidence Loop**，事实性问题直接回答。**贵公司的 Z/Y 程序**也能基于快照解释（不猜测，始终注明快照基准日）。 |
| **管理员 / IT** | 一个 `provision.yaml` 实现**零配置部署** — 用户解压运行 exe 即可。CBO 快照夜间自动采集 → 发布到共享文件夹 → 应用自动刷新。隔离网络用内置本地 LLM。 |
| **SAP 顾问 / 合作伙伴** | 24 个模块知识 + IMG 配置 + 三层最佳实践 + 合规，桌面与 AI 工具两侧可用 — 按客户环境快速套用。 |

---

## 🖥 桌面应用能做什么

### 💬 从一个问题开始
在主屏输入即可 — 故障/事故进入 **Evidence Loop**（INTAKE→HYPOTHESIS→COLLECT→VERIFY，
必须给出证伪条件与回滚方案），事实性问题走 **Quick Advisory** 自动分流。示例问题标签可直接套用。

### 🗂 CBO 快照 — 询问贵公司的自定义代码
管理员将自定义 ABAP（Z/Y）源码导出为快照后，应用**无需连接 SAP** 即可读取副本，用业务语言
回答"这个程序是干什么的？"。三种交付渠道 — 随发行 ZIP 附带 · 共享文件夹自动更新 ·
设置中"从 ZIP 导入"。所有回答均注明**快照基准日**。→ [docs/cbo-snapshot.md](docs/cbo-snapshot.md)

### 📦 零配置批量部署（管理员预配置）
在 exe 旁附带一个 `provision.yaml`，首次启动即自动配置 LLM 连接（公司密钥·网关·本地模型）、
SAP 环境与业务用户模式 — **用户不会看到任何设置界面。** 换密钥只需提升 version 后重新分发。
→ [docs/provisioning.md](docs/provisioning.md)

### 🙋 业务用户模式
以提问为中心的简洁主页（3 张卡片 + 示例标签），隐藏开发者菜单，无工具审批弹窗
（默认只读）。在 设置 → 外观 中切换。

### 🔒 支持隔离网络（网络分离）
内置 `llama-server`（llama.cpp）本地推理引擎 — 用 U 盘带入 GGUF 模型包即可离线运行。
`air_gapped: true` 时连崩溃上报与更新轮询也会关闭。
→ [docs/compliance/air-gapped-deployment.md](docs/compliance/air-gapped-deployment.md)

### 📚 底层 SAP 知识（所有回答的依据）
- **24 个模块**：FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · Cloud PE · Session 等
- **21 个智能体**：16 个模块顾问 + ABAP developer + Integration/S4 migration advisor + SAP tutor（新人培训） + **CBO explainer**（面向业务用户的自定义代码讲解）
- **IMG 配置框架**：76 个基于 SPRO 的指南（含 ECC vs S/4 差异、验证方法）
- **三层最佳实践**：Operational · Period-End · Governance
- **6 种语言**：한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt（24 模块 × 5 语言 quick-guide）
- **合规**：K-SOX · SOC 2 · ISO 27001 · GDPR · PII 自动脱敏

---

## ✅ 实际使用示例

**场景 1**：_"用 MIGO 过账收货总是失败。"_ — Evidence Loop 用证据收敛而非武断结论。

```
Turn 1 · INTAKE      先确认环境：ECC(EhP?) / S/4(版本?)、移动类型(MvT)、
                     完整错误消息(M7 xxx)。
Turn 2 · HYPOTHESIS  假设 A：过账期间未打开 — 验证：MMRV 当前期间与过账日期
                     是否一致？（若一致则否定 A）
                     假设 B：移动类型/科目确定(OBYC)问题 — 验证：…
Turn 3 · COLLECT     （操作员查询 MMRV 并反馈结果）
Turn 4 · VERIFY      确认期间不一致 → 修复：用 MMPV 结转期间（先模拟，
                     经由 Transport）。附回滚计划 + 相关 SAP Note 指引。
```

**场景 2**：_"ZFI0042 是干什么的？"_ — 基于 CBO 快照（虚构示例）按此格式回答：

```
一句话总结   （从快照源码头注释/目录派生的程序目的）
在哪里使用   执行画面·按钮功能（T-code 映射不在快照范围内则如实说明）
处理流程     权限检查 → 查询 → 列表/打印 等从源码读出的真实流程
注意事项     业务用户会遇到的消息及应对（禁止猜测 — 快照里没有就答"没有"）
基准日       本回答基于 YYYY-MM-DD 快照。
```

> 每个假设都有**证伪标准**，每个修复都有**回滚计划**。只提供指引、不直接改生产 — 由操作员决定。（→ [ETHOS](ETHOS.md)）

---

## 快速开始

### 🖥 桌面应用（推荐 — 业务用户与顾问）

**拿到发行 ZIP 的话**：解压后运行 `sapstack-Desktop-*-Portable-x64.exe` — 完成。
（若管理员附带了 provision.yaml，则无需任何设置即可提问。）

**自行安装**：从 [GitHub Releases](https://github.com/BoxLogoDev/sapstack/releases) 下载
`sapstack-Desktop-<版本>-Setup-x64.exe`（NSIS，per-user，无需管理员权限）或 Portable 版。
需要 Git for Windows（Git Bash），约 249MB（v2.4.1 实测）。
→ 安装：[docs/desktop-install.md](docs/desktop-install.md) · 分发打包：[docs/provisioning.md](docs/provisioning.md)

**SAP 数据的 3 条路径** — 都不会修改 SAP：
① 默认复制粘贴 ② ADT 只读桥（设置 > SAP 连接，[docs/adt-bridge.md](docs/adt-bridge.md)）
③ CBO 快照（离线副本，[docs/cbo-snapshot.md](docs/cbo-snapshot.md)）

### ⚡ 5 分钟上手（基于仓库）
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   仅检查: ./setup.sh --check
```
详见：[docs/quickstart-5min.md](docs/quickstart-5min.md)

---

## 🔧 面向开发者与高级用户的集成

使用同一套 SAP 知识的其他入口。

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM（MCP 服务器）— 23 工具 + 12 提示 + 9 资源
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code 扩展
在 VS Code Marketplace 搜索 "sapstack" → Install ·（或直接安装 [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases) 中的 `.vsix`）

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### 其他（Codex / Copilot / Cursor / Continue.dev / Aider）
克隆仓库 → 自动识别。详见：[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

### 🧭 Golden Path — 什么情况用什么
完整指南：[docs/workflow.md](docs/workflow.md)

| 你想要 | 路径 |
|---|---|
| 快速的事实性回答 | **Quick Advisory** — 直接问 |
| 故障诊断 | **Evidence Loop**（4 轮）→ 模块顾问 / 症状命令 |
| 了解自定义（Z/Y）程序 | 在桌面主页直接问 / `/sap-cbo-explain` |
| 不知道属于哪个模块 | `sap-tutor`（分类后转交专家） |
| 配置（IMG）问题 | `/sap-img-guide` |
| 期末结账 | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |

---

## Universal Rules

1. **绝不硬编码** — 禁用固定的公司代码、总账科目、组织单元
2. **环境信息优先** — 先确认 SAP 版本、部署模型、公司代码
3. **明确区分 ECC 与 S/4HANA** — 说明版本间行为差异
4. **必须走 Transport** — 生产环境变更一律经由 Transport
5. **先模拟** — AFAB、F.13、FAGL_FC_VAL、MR11、F110 等
6. **禁止 SE16N 编辑** — 不建议直接修改生产数据
7. **T-code + SPRO 路径** — 每个操作都同时给出两者
8. **韩语优先现场用语** — 如 "코스트 센터 (원가센터, KOSTL)" 双重标注

> 规则背后的*为什么*见 [**ETHOS.md**](ETHOS.md)，完整运行规则见 [CLAUDE.md](CLAUDE.md)。

---

## 学习路径

| 级别 | 路径 |
|------|------|
| 🆕 **入门** | [教程（15 分钟）](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 🖥 **桌面运维** | [安装](docs/desktop-install.md) → [预配置](docs/provisioning.md) → [CBO 快照](docs/cbo-snapshot.md) |
| 📘 **实战** | [5 个场景](docs/scenarios/) → [术语表](docs/glossary.md) |
| 🧭 **工作流** | [Golden Path](docs/workflow.md) → [完成度差距分析](docs/gstack-gap-analysis.md) |
| 🏗 **深入** | [架构](docs/architecture.md) → [Multi-AI 指南](docs/multi-ai-compatibility.md) |
| 🔒 **安全** | [SECURITY.md](SECURITY.md) → [合规](docs/compliance/) |
| 🤝 **贡献** | [CONTRIBUTING](CONTRIBUTING.md) → [路线图](docs/roadmap.md) |

---

## 数据资产

| 资产 | 数量 | 文件 |
|------|------|------|
| 确认的 T-code | 472 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 自然语言症状索引 | 90（6 种语言） | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| 确认的 SAP Note/KBA | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 多语言同义词 | 80+ 术语 × 6 语言 | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 期末结账序列 | 24 步 | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 行业矩阵 | 7 个行业 | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## 插件目录

| 领域 | 插件 |
|------|----------|
| 💰 **财务** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **物流** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **人力** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **技术** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **云/集成** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **韩国/全球** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **元** | [sap-session](plugins/sap-session/)（Evidence Loop） |

---

## 多语言审校贡献

5 种语言（en/zh/ja/de/vi）的 quick-guide 均为 **Claude 撰写的草稿**。欢迎各语言母语者 + SAP 领域专家审校。

- 流程·评审标准·PR 格式：**[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- 反馈：[Translation Feedback issue](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-code/Note 编号不翻译（保持原样）

---

## 许可证与贡献

**MIT License** — 商用/非商用皆可自由使用。保留版权声明。

- 🐛 [Bug 报告](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [功能请求](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [讨论](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [贡献指南](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
