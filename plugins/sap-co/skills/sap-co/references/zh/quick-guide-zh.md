<!-- Claude-authored draft (community review welcome) -->

# sap-co 快速指南 (简体中文)

## 🔑 环境信息收集
1. SAP 版本 (ECC / S/4HANA) — S/4 默认 Account-based CO-PA
2. 公司代码 + Controlling Area
3. 产品成本方式 (Standard / Actual / Mixed)
4. CO-PA 类型 (Costing-based / Account-based)

## 📚 模块要点

### CCA (Cost Center Accounting)
- **KS01/KS02**: 创建/修改成本中心
- **KSU5**: Assessment (分摊)
- **KSV5**: Distribution (分配)
- Planning: **KP06** (按成本要素), **KP26** (作业类型)

### PCA (Profit Center Accounting)
- **KE51**: 创建利润中心
- S/4HANA: PCA 与新总账整合 — 非独立 ledger
- **KE5Z**: PCA 实际行项目

### IO (Internal Order)
- **KO01**: 创建内部订单
- **KO88**: 结算 (Settlement)
- 注意 Real vs Statistical 区分

### CO-PC (Product Costing)
- **CK11N**: 创建成本估算
- **CK24**: 价格更新 (应用标准成本)
- **KKS1/KKS2**: 差异分析
- **CKMLCP** (S/4): 实际成本核算运行

### CO-PA (Profitability Analysis)
- **KE30**: 运行报表
- S/4HANA: 默认 **Account-based CO-PA** — 使用 ACDOCA
- ECC: Costing-based CO-PA 使用独立表 (CE1~CE4)

## 🇨🇳 中国本地化
- **管理会计 + 税务调整** 常同时要求 (大型企业)
- **标准成本计算** 是月结关键路径 — CK24 时点重要
- **材料成本波动**: 原材料汇率波动大 → 考虑 Actual Costing

## 🤖 相关命令
- `/sap-fi-closing` (CO 依赖 FI 结账)

## 📖 参考
- `../period-end.md`
