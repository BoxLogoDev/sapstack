<!-- Claude-authored draft (community review welcome) -->

# sap-sac 快速指南 (简体中文)

> SAP Analytics Cloud — 云端 BI/计划/预测一体化平台。

## 🔑 环境信息收集

1. **租户区域** — kr/eu/us/ap?
2. **版本** — BI / Planning / Smart Predict?
3. **连接方式** — Live (HANA · S4 CDS) vs Import (Datasphere · 文件)
4. **数据源** — S/4HANA / BW / Datasphere / 外部 DB
5. **用例** — Story / Analytic App / Planning / Predict

## 📚 核心概念

| 项 | 含义 |
|---|---|
| Live Connection | 实时查询 (无数据副本) |
| Import Connection | 周期加载 (保留副本) |
| Story | 仪表板 (拖放) |
| Analytic Application | 可脚本应用 (JS) |
| Planning Model | 可输入 · 版本 · 分摊 |
| Predictive Model | 回归 · 分类 · 时间序列 |

## 🇨🇳 中国本地化

### 常见场景
- **高管仪表板**: KPI 卡片 + drill-down (月/季/年)
- **财务报告**: Planning Model + S/4 actuals + 预算对比
- **销售分析**: Geo Map + 客户·产品矩阵
- **需求预测**: Smart Predict + IBP 集成
- **合规报告**: 数据出境/网络安全法考量, 数据脱敏

### 本地化 UI
- Story 标题/标签/文本可本地化
- Dimension name 建议英文 (跨租户兼容)
- 日期格式: 区域标准 (YYYY-MM-DD)

## 🚨 常见问题

### "Story 画面空白"
- 检查权限: Story → Sharing → Role
- 检查模型权限: Modeler permission
- 检查 Filter: 成员是否变更

### "与 S/4 数字不一致"
- Live vs Import 差异 (cache 时点)
- 币种/单位换算
- 会计年度变式 (K4 vs K1)

### "Live 连接失败"
- Cloud Connector GREEN
- TLS 证书 (STRUST) 是否过期
- BTP destination 配置

### "Planning 保存不了"
- 版本状态 (Public Locked?)
- Dimension Lock 设置
- Write 权限不足

## 🔧 推荐模式

### S/4 → SAC 集成
1. S/4: 暴露 Released CDS View (`I_*`)
2. BTP Cloud Connector 配置
3. SAC: Live Connection → Cloud Connector
4. Story 中由 CDS View 创建 Model

### 数据建模
- Time Dimension: 季/月/周/日 hierarchy
- Currency/Unit conversion
- Account dimension: 符号规则 (Income vs Expense)

## 📚 参考

- `references/connectivity-guide.md` — 连接模式 (TBD)
- `references/planning-best-practices.md` — Planning 最佳实践 (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP 环境
- `../../../sap-cloud/skills/sap-cloud/SKILL.md` — Cloud PE 集成

## ⚠️ 非目标

- BW 数据流设计 (BW/4HANA)
- Datasphere 建模 (sap-integration-cloud)
- 非 SAC BI 工具 (Tableau, Power BI)
