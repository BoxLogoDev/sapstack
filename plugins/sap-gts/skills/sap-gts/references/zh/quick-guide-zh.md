<!-- Claude-authored draft (community review welcome) -->

# sap-gts 快速指南 (简体中文)

> SAP GTS (Global Trade Services) — 进出口贸易合规摘要。

## 🔑 环境信息收集
1. GTS 部署 (Standalone / Embedded in S/4)
2. 是否对接海关电子通关
3. 交易类型 (出口 / 进口 / 双向)
4. FTA 目标国家

## 📚 核心领域

### Compliance
- **SPL Screening** — 制裁名单筛查
- **Embargo Check** — 禁运国家
- **Legal Control** — 许可证需求

### Customs
- **出口申报** (Export Declaration)
- **进口申报** (Import Declaration)
- **Transit** — 过境 / 转运

### Risk
- **L/C Management** — 信用证
- **Preference** — 原产地 / FTA
- **Restitution** — 出口退税

## 🇨🇳 中国本地化
- **中国电子口岸 / 海关单一窗口** (海关总署电子通关)
- **HS 编码** — 中国商品 HS 编码 (10/13 位)
- **两用物项与技术管制** — 出口管制
- **FTA 网络** — 原产地证明 (多协定)

## 📋 T-code
- `/SAPSLL/*` 命名空间
- 例: `/SAPSLL/MENU_LEGALR3`, `/SAPSLL/COMPLR3`, `/SAPSLL/PRODUCT_R3`

## ⚠️ 注意
- CA 证书 (STRUST) 注册必须
- HS 编码错误 → 关税追征
- 各 FTA 原产地标准不同

## 🤖 相关
- `/plugins/sap-sd` — 出口
- `/plugins/sap-mm` — 进口
- `/agents/sap-integration-advisor.md` — 海关电子通关集成
