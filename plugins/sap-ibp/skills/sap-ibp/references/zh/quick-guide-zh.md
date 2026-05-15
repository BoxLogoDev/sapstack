<!-- Claude-authored draft (community review welcome) -->

# sap-ibp 快速指南 (简体中文)

> SAP IBP (Integrated Business Planning) — S/4 时代云原生需求/供应计划平台。APO 后继。

## 🔑 环境信息收集

1. **IBP 版本** — 季度发布 (2402 / 2308 / 2305 等)
2. **部署** — 仅 BTP SaaS (无本地部署)
3. **模块** — Demand / S&OP / Supply / Inventory / Response / Control Tower
4. **集成** — S/4HANA → CPI Integration Content, 或 BW
5. **Excel UI 版本** — 计划员工作站的 IBP Excel Add-In
6. **Planning Area** — 标准 (SAP7, SAPIBP1) 或自定义

## 📚 模块概览

| 模块 | 用途 |
|---|---|
| **Demand** | 统计预测 · 需求感知 (DS) |
| **S&OP** | 销售运营 — 需求/供应/财务整合 |
| **Supply** | 多级供应链 (heuristic/optimizer) |
| **Inventory** | 安全库存 · 再订货优化 |
| **Response & Supply** | ATP · 分配 · gating |
| **Control Tower** | KPI · 异常检测 |

## 🇨🇳 中国本地化

### 需求预测模式
- **农历节日 (春节/中秋) 与电商大促 (618/双11)**: 注册到 Time Event Master
- **短保质期品类**: 食品/化妆品/半导体 → 短 horizon
- **停产/新品导入**: 显式 Product Lifecycle (NPI/EOL)
- **促销影响分离**: baseline vs event lift

### 多工厂运营
- 中国总部 + 海外子公司 → 多国模型
- **币种**: CNY + USD 全球换算
- **转移定价**: 整合到 S&OP

### 常见场景
- "新车型上市 → 提前通知零部件供应商 (PIR 释放)"
- "原材料进口依赖 → 汇率情景分析"
- "交期缩短要求 → 库存 vs 响应计划平衡"

## 🔧 关键 UI / T-code

IBP 是 BTP SaaS — 无 SAP GUI T-code。改用:

| UI | 用途 |
|---|---|
| **IBP Web UI** | 主数据 · 配置 · 执行 |
| **IBP Excel Add-In** | 日常计划 (计划员) |
| **IBP App (Fiori)** | 移动 KPI |
| **SAP Cloud ALM** | 监控 |

集成侧 S/4 T-code:
- **MD01N/MD02** — MRP (PIR 接收后运行)
- **CO40/CO41** — 生产订单转换 (PIR → Production Order)
- **VOFM/VFX3** — 销售订单 (Response & Supply 结果)

## 🚨 常见问题

### "预测出不来"
- 原因: 算子定义缺失, 历史不足, 主数据映射错误
- 诊断:
  1. Planning Area Configuration → Forecast Model
  2. Planning Run 日志 (Application Job Monitor)
  3. 主数据映射 (Product, Location)

### "Excel UI 很慢"
- 原因: Planning View 太大, 并发用户多
- 解决:
  1. 缩小 Planning View (≤ 10K cells)
  2. 使用 batch refresh
  3. 按模块拆分视图

### "CPI 集成失败"
- 原因: 消息映射错误, S/4 主数据变更后 ID mismatch
- 诊断: CPI tenant → Monitor → Messages → 分类错误
- 解决: IBP Configuration → External Codes 重新映射

## 🔄 与 PP 配对

S/4 PP 执行 IBP 制定的计划:
- **PIR (Planned Independent Requirement)** — 需求 → 释放到 S/4 PP
- **MRP Run (MD01N)** — 基于 PIR 的物料计划
- **生产订单转换** — CO40/CO41

故障时追踪卡在哪一段:
1. IBP → PIR 释放正常? (IBP Application Job)
2. S/4 → MD63 中可见 PIR?
3. S/4 MRP 运行结果?

## 📚 参考

- `references/forecast-models.md` — 统计模型对比 (TBD)
- `references/cpi-integration.md` — CPI 消息映射 (TBD)
- `../../../sap-pp/skills/sap-pp/SKILL.md` — PP 集成
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CPI 指南

## ⚠️ 非目标

- 短期生产排程 (PP/DS, MES)
- 非 SAP 工具 (Anaplan, o9, Kinaxis)
- APO 运营 (已弃用; APO 用户参考 IBP 迁移指南)
