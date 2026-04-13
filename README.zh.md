<div align="center">

# 🏛 sapstack

### SAP 运营企业平台（AI 编码助手专用）

**20 插件 · 16 个代理 · 18 条命令 · 55+ IMG 指南 · 43+ 最佳实践 · 6 种语言 · SAP AI 就绪**

🌐 **Languages**: [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](https://github.com/BoxLogoDev/sapstack/releases/tag/v1.7.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/BoxLogoDev/sapstack/actions)
[![Chinese](https://img.shields.io/badge/中文-Universal-red.svg)](README.zh.md)
[![Multi-AI](https://img.shields.io/badge/AI%20tools-7-purple.svg)](docs/multi-ai-compatibility.md)
[![Kiro](https://img.shields.io/badge/Kiro-ready-00D4AA.svg)](docs/kiro-quickstart.md)

<p>
  <a href="docs/tutorial.md"><b>教程</b></a> ·
  <a href="docs/faq.md"><b>FAQ</b></a> ·
  <a href="docs/glossary.md"><b>术语表</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>多 AI 指南</b></a> ·
  <a href="docs/roadmap.md"><b>路线图</b></a>
</p>

</div>

---

## ⚡ 30秒介绍

sapstack 将 **AI 编码助手转变为 SAP 运营顾问** — 一个涵盖整个 SAP 运营生命周期的企业平台。v1.6.0 覆盖配置→实施→运营→诊断→优化的所有阶段。

- 🎯 **18 个 SAP 模块 + Evidence Loop 编排器** — FI/CO/TR/MM/SD/PP/PM/QM/WM/EWM/HCM/SFSF/ABAP/S4迁移/BTP/BASIS/BC/GTS
- 🤖 **15 个代理** — 14 个模块顾问 + **SAP 导师**（新员工培训）
- ⚙️ **18 条斜杠命令** — 期末结算、调试、Evidence Loop、IMG、最佳实践、诊断
- 🏗 **52 个 IMG 配置指南** — SPRO 路径、分步设置、ECC vs S/4 差异、验证方法
- 📋 **40+ 最佳实践** — 3 层框架（运营·期末·治理）
- 🏢 **企业文档** — 多公司代码、SSC、内部交易、全球推出、系统架构
- 🏭 **行业指南** — 制造业、零售业、金融业
- 🌐 **7 个 AI 工具兼容** — Claude Code、Codex CLI、Copilot、Cursor、Continue.dev、Aider、Kiro
- 🇰🇷 **韩文现场语言层** — 80+ 同义词、62 个症状索引、41 个 T-code 发音（韩国企业重点）
- 📊 **340+ T-codes · 57 个 SAP Note · 8 个数据资产**
- 🔁 **Evidence Loop** — 进度表 → 假设 → 收集 → 验证（需要反证条件 + 强制回滚）
- 🛡 **11 个质量门** — IMG、最佳实践、行业检查、严格 CI

---

## 🚀 快速开始

### 1️⃣ Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack sap-bc@sapstack
```

### 2️⃣ Amazon Kiro IDE ⭐ 新增
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack/mcp && npm install && npm run build && cd ../..
cp sapstack/.kiro/settings/mcp.json .kiro/settings/mcp.json
cp sapstack/.kiro/steering/*.md .kiro/steering/
```
在 Kiro 聊天中：「找最近更改的成本中心」→ 自动同义词扩展匹配。
详情：**[docs/kiro-quickstart.md](docs/kiro-quickstart.md)** · **[docs/kiro-integration.md](docs/kiro-integration.md)**

### 3️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..
codex "诊断 F110 付款运行：供应商显示'无付款方法'错误"
```

### 4️⃣ GitHub Copilot（VS Code）
克隆仓库或复制 `.github/copilot-instructions.md` → 自动检测

### 5️⃣ Cursor / Continue.dev / Aider
自动加载 `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md`

详情：**[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 架构 — 5 轴结构（v1.6.0）

```
┌─────────────────────────────────────────────────────────────────┐
│                     sapstack v1.6.0                              │
│              SAP 运营企业平台                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [配置]  →  [实施]  →  [运营]  →  [诊断]  →  [优化]           │
│  52 个 IMG    企业      15 个代理   Evidence     40+ 最佳      │
│  SPRO 路径    6 个文档  18 条命令   Loop 62      实践 3-Tier  │
│  11 个模块    3 个行业  340+ T-codes 个症状    框架           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ① 主动顾问          ② 上下文持久化                            │
│  • 19 SKILL.md      • .sapstack/config.yaml                     │
│  • 15 个子代理      • .sapstack/sessions/*/state.yaml           │
│  • 18 条命令        • 5 个 JSON 架构                            │
│  • 80+ 同义词       • 审计追踪（仅追加）                       │
│                                                                  │
│  ③ Evidence Loop     ④ 质量门（11 种 CI）                      │
│  • 4 轮诊断循环      • lint / marketplace / 硬编码             │
│  • 需要可反驳性      • tcodes / references / links             │
│  • Fix + Rollback    • ecc-s4-split / 多 AI 构建              │
│                      • img-refs / best-practices                │
│  ⑤ 企业层 🆕                                                   │
│  • IMG 配置（52 个指南）                                       │
│  • 最佳实践（3 层：运营/期末/治理）                           │
│  • 企业场景（多 CC、SSC、IC、全球推出）                       │
│  • 行业指南（制造、零售、金融）                               │
└─────────────────────────────────────────────────────────────────┘
```

详情：[docs/architecture.md](docs/architecture.md) · Evidence Loop：[plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md)

---

## 🔁 Evidence Loop — 从建议机器人到诊断伙伴（v1.5.0）

sapstack v1.5.0 从**单轮建议**转变为**轮次感知诊断伙伴**。即使没有实时 SAP 访问，「检查→修复→验证」循环也能异步工作。

### 4 轮结构
```
第 1 轮 进度表     → 运营者提供初始症状 + 证据
第 2 轮 假设      → AI 生成 2-4 个假设（需反证） + 后续请求
第 3 轮 收集      → 运营者从 SAP 收集证据（AI 等待）
第 4 轮 验证      → 假设确认/拒绝 + 修复计划 + 强制回滚
```

### 3 个访问表面
| 表面 | 用户 | 工具 |
|---|---|---|
| **A — CLI** | 运营者 | `/sap-session-{start,add-evidence,next-turn}` |
| **B — IDE** | 运营者 | VS Code 扩展（v1.6 计划） |
| **C — Web** | 最终用户 | `web/triage.html` + `web/session.html`（静态、无服务器） |

所有三个表面通过**相同的会话 ID** 连接以进行切换。典型流程：最终用户在网络上开始诊断，运营者通过 CLI 继续。

### 核心原则
- **可反驳性**：每个假设都需要反证条件
- **回滚或无修复**：确认的修复必须有回滚对
- **审计追踪**：所有状态更改都记录（仅追加）
- **无实时 SAP**：运营者充当执行者（人在环异步循环）

详情：[plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md) · 真实示例：[aidlc-docs/sapstack/f110-dog-food.md](aidlc-docs/sapstack/f110-dog-food.md)

---

## 📦 20 插件目录（18 个领域 + 2 个元）

### 💰 核心财务
| 插件 | 主题 | 关键词 |
|--------|-------|----------|
| [`sap-fi`](plugins/sap-fi/) | 财务会计 | FB01, F110, MIRO, 期末结算, GR/IR, 税务 |
| [`sap-co`](plugins/sap-co/) | 成本控制 | 成本中心, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | 财务金融 | FF7A, FF7B, 流动性, MT940, DMEE |

### 📦 物流和供应链
| 插件 | 主题 | 关键词 |
|--------|-------|----------|
| [`sap-mm`](plugins/sap-mm/) | 物料管理 | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | 销售和分销 | VA01, VF01, FD32, 定价, 信用 |
| [`sap-pp`](plugins/sap-pp/) | 生产计划 | MRP, MD01/MD04, CO01, BOM, 工艺 |
| [`sap-pm`](plugins/sap-pm/) 🆕 | 设备维护 | IE01, IW31, IP01, MTBF/MTTR |
| [`sap-qm`](plugins/sap-qm/) 🆕 | 质量管理 | QA01, QP01, QA11, QM01, ISO/GMP/HACCP |
| [`sap-wm`](plugins/sap-wm/) 🆕 | 仓库管理（ECC） | LT01, LS01N, ⚠️ S/4 已弃用 |
| [`sap-ewm`](plugins/sap-ewm/) 🆕 | 扩展仓库管理 | /SCWM/MON, Wave, RF |

### 👥 人力资源
| 插件 | 主题 | 关键词 |
|--------|-------|----------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM 本地（ECC + H4S4） | PA30, PC00_M46, 薪资, 税务 |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, 招聘, LMS, RBP |

### 💻 技术
| 插件 | 主题 | 关键词 |
|--------|-------|----------|
| [`sap-abap`](plugins/sap-abap/) | ABAP 开发 | SE38, BAdI, CDS, RAP, ST22 |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | 棕地、绿地、SUM、ATC |
| [`sap-btp`](plugins/sap-btp/) | 业务技术平台 | CAP, Fiori, OData, XSUAA |
| [`sap-basis`](plugins/sap-basis/) | BASIS 管理 | STMS, SM50, PFCG, Kernel |

### 🇰🇷 韩国特化 + 🌍 全球贸易
| 插件 | 主题 | 关键词 |
|--------|-------|----------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | BASIS — 韩国版 | BC, 网络隔离, 电子税务, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | 全球贸易服务 | HS code, UNI-PASS, FTA, 进出口 |

### 🔁 元 — Evidence Loop 编排器（v1.5.0 实验）
| 插件 | 主题 | 角色 |
|--------|-------|------|
| [`sap-session`](plugins/sap-session/) 🔁 | Evidence Loop 编排器 | 将 18 个插件和 15 个代理组合为轮次感知诊断循环。仅编排层。 |

---

## 🤖 15 个代理

### 模块顾问（14 个）
| 代理 | 角色 | 何时升级 |
|-------|------|---|
| `sap-fi-consultant` | 财务会计 | 凭证、结算、税务、GR/IR |
| `sap-co-consultant` | 成本控制 | 成本中心、分配、CO-PA、产品成本 |
| `sap-tr-consultant` 🆕 | 财务金融 | 流动性、银行对账、DMEE |
| `sap-mm-consultant` | 物料管理 | 采购、库存、GR/IR、MIGO |
| `sap-sd-consultant` | 销售分销 | 订单、配送、开票、信用 |
| `sap-pp-consultant` | 生产计划 | MRP、BOM、生产订单 |
| `sap-hcm-consultant` 🆕 | 人力资源 | 薪资、出勤、税务、年终 |
| `sap-pm-consultant` 🆕 | 设备维护 | 设备、维护订单、MTBF/MTTR |
| `sap-qm-consultant` 🆕 | 质量管理 | 检验、不合格评定、ISO/GMP |
| `sap-ewm-consultant` 🆕 | 仓库管理 | Wave、拣选、RF、WM 迁移 |
| `sap-abap-developer` | ABAP 代码审查 | 代码质量、Clean Core |
| `sap-basis-consultant` | Basis 分诊 | Dump、WP 行、Transport |
| `sap-s4-migration-advisor` | S/4HANA 就绪 | 迁移问题 |
| `sap-integration-advisor` | 集成架构 | RFC, IDoc, OData, CPI |

### 🎓 SAP 导师（1 个）🆕
| 代理 | 角色 | 何时升级 |
|-------|------|---|
| `sap-tutor` 🆕 | 新员工培训 | SAP 基础、模块入门、术语 |

---

## ⚙️ 18 条斜杠命令

```bash
# 期末结算
/sap-fi-closing monthly <company-code>     # 月结清单
/sap-quarter-close <cc> <quarter>          # 季度结算（IFRS + SOX）
/sap-year-end <cc> <year>                  # 年度结算（税务 + 审计）

# 调试
/sap-migo-debug <error-code> <mv-type>     # MIGO 过账错误
/sap-payment-run-debug <vendor-code>       # F110 付款运行
/sap-transport-debug <TR-id>               # STMS 失败诊断
/sap-tax-invoice-debug <type>              # 电子税务发票问题
/sap-performance-check <target>            # 性能诊断

# 分析和审查
/sap-abap-review <file-path>               # ABAP 代码审查
/sap-s4-readiness --auto                   # S/4 迁移评估

# Evidence Loop
/sap-session-start "<symptom>"             # 第 1 轮 进度表
/sap-session-add-evidence <id> <files...>  # 第 1/3 轮
/sap-session-next-turn <session-id>        # 自动推进第 2/4 轮

# v1.6.0 🆕 — IMG / 最佳实践 / 诊断
/sap-img-guide <module> <area>             # IMG 配置指南
/sap-master-data-check [vendor|material]   # 主数据预验证
/sap-bp-review <module> [operational|all]  # 最佳实践审查
/sap-pm-diagnosis [equipment|symptom]      # 设备故障诊断
/sap-qm-inspection [inspection-lot|material] # 质量检验分析
```

---

## 🌐 多 AI 兼容（7 个工具）

| AI 工具 | 入口文件 | 添加于 |
|---------|-----------|-------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md`（原生） | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | v1.2.0 |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | v1.3.0 |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | v1.3.0 |
| **Amazon Kiro IDE** 🆕 | [`AGENTS.md`](AGENTS.md) + [`.kiro/steering/`](.kiro/steering/) | **v1.5.0** |

**设计原则**：「一个真实源（SKILL.md）+ N 个薄兼容层」。无论你使用哪个 AI，**通用规则 + 响应格式 + 知识质量**保持一致。

---

## 🛡 通用规则

所有 SAP 答案**必须**遵循 8 条核心规则：

1. **永不硬编码**公司代码、G/L 账户或组织单位
2. **始终询问**环境信息（发布版本、部署、公司代码）
3. **始终区分** ECC vs S/4HANA 行为
4. **需要传输请求**进行任何配置更改
5. **实际运行前模拟** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **生产中永不建议** SE16N 数据编辑
7. **始终提供 T-code + SPRO 菜单路径**
8. 🆕 **使用现场语言** — 用用户的语言回复（ko/en/zh/ja/de/vi）；字段术语保持英文

---

## 🌐 多语言 + 韩文现场语言层

不仅仅是翻译，而是**真实的韩文 SAP 工作场所词汇** — 接受现场本地表达如「코스트 센터」（成本中心），带双重符号「(코스트 센터, KOSTL)」。

- ✅ **19/19 个模块**快速指南 + 专业翻译
- ✅ **80+ 个术语同义词**（[data/synonyms.yaml](data/synonyms.yaml)）
- ✅ **缩写 + 业务时间标记**
- ✅ **41 个 T-code 韩文发音**
- ✅ **62 个自然语言症状索引**（18 个模块）
- ✅ 🆕 **现场语言样式指南**
- ✅ **sap-bc** — 韩国 BC 顾问专长
- ✅ 🆕 **同义词匹配引擎** — 自动统一变体

### 🌐 多语言支持（v1.7.0 — 6 种语言）
| 语言 | symptom-index | synonyms | 状态 |
|---|---|---|---|
| 🇰🇷 韩文（ko） | 62/62 | 80+ | 主要 |
| 🇬🇧 英文（en） | 62/62 | 80+ | 完整 |
| 🇨🇳 中文（zh） | 62/62 | 40+ | 🆕 v1.7 |
| 🇯🇵 日文（ja） | 62/62 | 40+ | 🆕 v1.7 |
| 🇩🇪 德文（de） | 62/62 | 40+ | 🆕 v1.7 |
| 🇻🇳 越南文（vi） | 62/62 | 40+ | 🆕 v1.7 |

---

## 📊 数据资产

| 资产 | 数量 | 文件 | 版本 |
|-------|-------|------|---------|
| 已验证 T-codes | **340+** | [`data/tcodes.yaml`](data/tcodes.yaml) | v1.6.0 |
| 已验证 SAP Notes | **57** | [`data/sap-notes.yaml`](data/sap-notes.yaml) | v1.6.0 |
| 症状索引 | **62**（ko/en 完整） | [`data/symptom-index.yaml`](data/symptom-index.yaml) | v1.6.0 |
| 同义词 | **80+ 个术语** | [`data/synonyms.yaml`](data/synonyms.yaml) | v1.6.0 |
| T-code 发音 | **41**（韩文） | [`data/tcode-pronunciation.yaml`](data/tcode-pronunciation.yaml) | v1.5.0 |
| Evidence Loop 架构 | **5 个 JSON Schema** | [`schemas/`](schemas/) | v1.5.0 |
| 🆕 期末序列 | **24 个步骤** | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) | **v1.6.0** |
| 🆕 主数据规则 | **5 个主类型** | [`data/master-data-rules.yaml`](data/master-data-rules.yaml) | **v1.6.0** |
| 🆕 行业矩阵 | **3 个行业** | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) | **v1.6.0** |

### 🌐 Web UI（v1.5.0 扩展）
| 页面 | 用途 |
|---|---|
| [`web/index.html`](web/index.html) | SAP Note 解析器 — 50+ 已验证 Notes |
| 🆕 [`web/triage.html`](web/triage.html) | **最终用户自诊** — 症状输入 → 同义词扩展 → 运营者升级 |
| 🆕 [`web/session.html`](web/session.html) | **Evidence Loop 浏览器** — state.yaml 查看器 |

全部**静态网站**（无服务器、无 SAP 连接）— 部署到 GitHub Pages。

---

## ✅ 安装验证

```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# 运行所有 11 个质量门
./scripts/lint-frontmatter.sh              # Frontmatter 验证
./scripts/check-marketplace.sh             # marketplace.json 结构
./scripts/check-hardcoding.sh --strict     # 无硬编码公司代码
./scripts/check-tcodes.sh --strict         # T-code 注册表
./scripts/check-links.sh --strict          # 内部链接验证
./scripts/check-ecc-s4-split.sh --strict   # ECC/S/4 分离
./scripts/build-multi-ai.sh --check        # 兼容层 drift
./scripts/check-img-references.sh          # 🆕 IMG 配置指南
./scripts/check-best-practices.sh          # 🆕 最佳实践 3-Tier
./scripts/check-industry-refs.sh           # 🆕 行业指南
```

所有门通过 = ✅ 准备就绪。CI 中自动运行相同步骤。

---

## 🎓 学习路径

| 级别 | 路径 |
|-------|------|
| 🆕 **初级** | [教程 — 15 分钟](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **中级** | [5 个真实场景](docs/scenarios/) → [术语表](docs/glossary.md) |
| 🏗 **高级** | [架构](docs/architecture.md) → [多 AI 指南](docs/multi-ai-compatibility.md) |
| 🤝 **贡献者** | [CONTRIBUTING](CONTRIBUTING.md) → [插件脚手架](scripts/new-plugin.sh) |
| 🔒 **安全** | [SECURITY](SECURITY.md) → [CoC](CODE_OF_CONDUCT.md) |

---

## 🏛 相关项目

- [Amazon Kiro IDE](https://kiro.dev/) — 自 v1.5.0 起本地 sapstack 集成
- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0 脚手架
- [SAP 帮助门户](https://help.sap.com/) — 官方文档
- [SAP 支持门户](https://launchpad.support.sap.com/) — SAP Notes 源
- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — DESIGN.md 灵感

---

## 📜 许可证

MIT 许可证 — 参见 [LICENSE](LICENSE) 了解详情。

**允许商业使用、修改和分发**，需保留版权声明。

---

## 🤝 贡献

- 🐛 **错误报告**：[Issues](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ **功能请求**：[Feature Request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 📦 **新模块建议**：[New Module](https://github.com/BoxLogoDev/sapstack/issues/new?template=new_module.md)
- 💬 **讨论**：[Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 **贡献指南**：[CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**由 [@BoxLogoDev](https://github.com/BoxLogoDev) 用 🇰🇷 制作**

为韩国 SAP 顾问构建，与全球社区分享。

[⬆ 回到顶部](#-sapstack)

</div>
