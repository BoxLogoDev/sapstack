<!-- Claude-authored draft (community review welcome) -->

# sap-s4-migration 快速指南 (简体中文)

> ECC → S/4HANA 迁移速查参考. 完整细节见 `SKILL.md` 和 `references/simplification-items.md`.

## 🔑 环境信息收集

1. 当前 ECC 版本 (EhP) + 数据库 + Unicode 状态
2. 目标 S/4HANA 版本 (2022/2023/2024)
3. 部署模式 (本地 / RISE / Cloud PE)
4. 国家本地化依赖度

## 🛣 三条路径

| 路径 | 说明 | 适用场景 |
|------|------|----------|
| **Brownfield (系统转换)** | 现有系统就地转换 | 保留流程的大型企业 |
| **Greenfield (全新实施)** | 新建 + 数据迁移 | 需要流程重塑的中型企业 |
| **Selective (选择性迁移)** | 按组织/周期/功能选择迁移 | 多子公司分阶段切换 |

## ⚠️ 主要风险

### Brownfield
- 大量自定义代码改造 (ACDOCA 适配)
- 直接引用 BSEG 的 Z 程序 → 必须转向 ACDOCA
- 国家特定 CVI 验证

### Greenfield
- 数据迁移范围与策略
- 主数据清理 (质量越差迁移越难)
- 流程再设计决策速度

### Selective
- 范围定义复杂度高
- 中间态数据一致性验证

## 📚 关键工具

- **Readiness Check**: `/SDF/RC_START_CHECK` — 自动分析简化项影响
- **SUM (Software Update Manager)**: Brownfield 主工具
- **DMO (Database Migration Option)**: 数据库 + 软件同步转换
- **SUMCT**: Unicode 转换 (ECC non-Unicode → Unicode)
- **SAP Note Analyzer**: 目标版本 Note 影响分析

## 🇨🇳 中国本地化风险

- **金税系统改造** — 增值税专用发票接口可能需重构 (考虑 SAP DRC)
- **CN CVI 简化项** — 增值税科目结构变更
- **中国版本 Note** — Country Version China 专属 Note 大量
- **国内 SI 依赖** — 用友、汉得、东软等加速器版本

## ⚠️ 必经步骤
1. 执行 **Readiness Check** (AS-IS 影响分析)
2. 执行 **Custom Code ATC** (`S4HANA_READINESS` 变式)
3. **双切换模拟** — 至少 2 轮
4. **业务用户 UAT** — 推荐 STG 环境

## 🤖 相关代理 / 命令
- `agents/sap-s4-migration-advisor.md`
- `/sap-s4-readiness --auto`

## 📖 参考
- `../simplification-items.md`
- `../atc-readiness-check.md`
