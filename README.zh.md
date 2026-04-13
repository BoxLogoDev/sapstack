<div align="center">

# 🏛 sapstack

### AI 编码助手的 SAP 企业运营平台

**20 个插件 · 16 个代理 · MCP 运行时 · VS Code 扩展 · 6 种语言 · 合规就绪**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack 是什么？

**sapstack** 是一个开源平台，将 **SAP 领域专业知识**注入到 Claude、Copilot 和 Cursor 等 AI 工具中。它覆盖整个 SAP 运营生命周期——**配置 → 实施 → 运营 → 诊断 → 优化**——提供基于证据的诊断。

```
┌──────────────────────────────────────────────────────────────┐
│ SAP 运营者 ────┐                                              │
│              ├─→ [AI 工具] ←── sapstack ──→ SAP 领域知识     │
│ 培训师 ────────┤      ↓                      + IMG 指南       │
│              ├── 证据循环                    + 最佳实践      │
│ 顾问 ─────────┘   (四轮诊断)                 + 合规          │
└──────────────────────────────────────────────────────────────┘
```

---

## 核心功能

### 🎯 完整 SAP 模块覆盖
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4 迁移 · GTS · BC · **Cloud PE** · Session

### 🤖 15 位专家代理 + 1 位 SAP 导师
11 位模块顾问 + ABAP 开发人员 + BASIS 顾问 + 集成顾问 + S/4 迁移顾问 + **SAP 导师**（员工入职）

### 🔁 证据循环 (v1.5+)
无需实时 SAP 访问的诊断——**进度表 → 假设 → 收集 → 验证**四轮结构，需要反证条件，强制回滚配对

### 🏗 IMG 配置框架 (v1.6+)
55+ 基于 SPRO 的配置指南——设置步骤、ECC vs S/4 差异、验证方法包含其中

### 📋 3 层最佳实践
**运营**（日常）· **期末**（结算）· **治理**（审计）——系统应用于 11 个模块

### 🌐 6 种语言支持 (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt

### ☁️ S/4HANA Cloud PE 就绪
Clean Core · 关键用户扩展 · 3 层扩展 · Fit-to-Standard · Cloud ALM

### 🚀 MCP 运行时 (v2.0+)
`@boxlogodev/sapstack-mcp` — 在 Claude Desktop 中运行完整证据循环。5 个读工具 + 3 个写工具。

### 💻 VS Code 扩展 (v2.0+)
会话侧栏 · YAML 验证 · Webview 渲染 · 文件监视器

### 🛡 合规就绪 (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · 空气隙部署 · 自动 PII 屏蔽

---

## 快速开始

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

### VS Code 扩展
在 VS Code Marketplace 中搜索"sapstack" → 安装

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### 其他平台 (Codex / Copilot / Cursor / Continue.dev / Aider)
克隆存储库 → 自动检测。详情：[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## 通用规则

1. **永远不要硬编码公司代码** — 没有固定的公司代码、GL 账户、成本中心或组织单位
2. **环境进度表优先** — 首先确认 SAP 发布版本、部署模型和公司结构
3. **明确区分 ECC vs S/4HANA** — 版本特定行为必须清楚区分
4. **运输请求必需** — 所有生产变更都需要运输请求
5. **执行前模拟** — 先在测试中运行 AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **无 SE16N 编辑** — 不建议直接修改生产数据
7. **T-code + SPRO 路径** — 为每项操作提供两者
8. **基于证据的诊断** — 每个假设都需要反证条件

---

## 学习路径

| 级别 | 路径 |
|-------|------|
| 🆕 **入门** | [教程（15 分钟）](docs/tutorial.md) → [常见问题](docs/faq.md) |
| 📘 **实践** | [5 个场景](docs/scenarios/) → [术语表](docs/glossary.md) |
| 🏗 **高级** | [架构](docs/architecture.md) → [Multi-AI 指南](docs/multi-ai-compatibility.md) |
| 🔒 **安全** | [SECURITY.md](SECURITY.md) → [合规性](docs/compliance/) |
| 🤝 **贡献** | [CONTRIBUTING](CONTRIBUTING.md) → [路线图](docs/roadmap.md) |

---

## 数据资产

| 资产 | 数量 | 文件 |
|-------|------|------|
| 已验证 T-codes | 340+ | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 自然语言症状索引 | 62（6 种语言） | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP 注释 | 57+ | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 多语言同义词 | 80+ 个术语 × 6 种语言 | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 期末序列 | 24 个步骤 | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 行业矩阵 | 3 个行业 | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## 插件目录

| 域 | 插件 |
|-------|---------|
| 💰 **财务** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **物流** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **人力资本** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **技术** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| 🌍 **全球** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **元** | [sap-session](plugins/sap-session/) (证据循环) |

---

## 许可证和贡献

**MIT 许可证** — 允许商业和非商业使用。需要注明出处。

- 🐛 [报告错误](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [请求功能](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [开始讨论](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [贡献指南](CONTRIBUTING.md)

---

<div align="center">

**由 [@BoxLogoDev](https://github.com/BoxLogoDev) 用 🇰🇷 创建**
为全球 SAP 专业人士打造 · 开源社区共享

</div>
