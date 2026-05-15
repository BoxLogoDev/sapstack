<!-- Claude-authored draft (community review welcome) -->

# sap-cloud 快速指南 (简体中文)

> SAP S/4HANA Cloud Public Edition (Cloud PE) — 强制 Clean Core, Key User 扩展, 季度发布。

## 🔑 环境信息收集
1. **Cloud PE 版本** — 2401/2402/2403/2405 (月/年发布)
2. **Extension Tier** — Tier 1 (Key User) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
3. **部署** — 仅 Cloud PE (禁止本地 SE38/SE80/SMOD/CMOD)
4. **Change Control** — Fit-to-Standard 阶段 vs Operations 阶段

## 📚 要点

### Clean Core 原则 (不可协商)
- 不修改 SAP 标准代码/表
- 无 Transport (TMS/tp) → 直接上传 Cloud ALM (CSP)
- 扩展仅通过 3-Tier 模型

### Key User Extensibility (Tier 1)
- **Custom Fields**: Manage Your Solution → Custom Fields (即时激活)
- **Custom Logic**: ABAP Cloud (RAP) — Key User 友好入口
- **Custom CDS Views**: 只读分析
- **Custom Business Objects**: RAP BO

### Fit-to-Standard
- 适配标准流程 — 仅 gap 转 Tier 1/2/3 扩展
- 工作坊 → scope 决策 → CBC 配置

### Cloud ALM
- 实施/运维生命周期 (替代 Solution Manager)
- CSP (Custom Software Package) 部署路径

## 🇨🇳 中国本地化
- **季度发布强制** — 无法回避升级; 提前审查 FSD
- **本地化** — 确认金税电子发票/国家 CVI 在 Cloud PE 标准 scope
- **Clean Core 培训** — 从定制 Z 开发转向 Key User 扩展

## 🚨 常见问题

### "找不到标准 T-code"
- 原因: Cloud PE 禁止 SE38/SE80/SMOD/CMOD
- 解决: 用 Key User Extensibility 替代 (Custom Logic/Fields)

### "季度发布后定制损坏"
- 原因: 使用 deprecated API
- 解决: FSD 预审 + Q-system 回归测试

## ⚠️ 禁止事项
- ❌ 假设本地 T-code (SE38/SE80/SMOD/CMOD/SE16N)
- ❌ 修改标准对象 (违反 Clean Core)
- ❌ 试图回避季度发布

## 📖 相关
- `../../SKILL.md` — 详细本文
- `../img/fit-to-standard.md` / `../img/key-user-extensibility.md`
- `sap-btp` — Tier 2 Side-by-Side
- `sap-s4-migration` — On-Prem → Cloud PE 转换
