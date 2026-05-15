<!-- Claude-authored draft (community review welcome) -->

# sap-sfsf 快速指南 (简体中文)

## 🔑 环境信息收集
1. SuccessFactors 模块 (EC / ECP / Recruiting / LMS / Performance)
2. 数据中心 (区域 — 如 APJ/EU/US)
3. ECC/H4S4 集成 (混合 / 全云)

## 📚 要点

### Employee Central (EC)
- **Admin Center → Manage Employee Files**
- Foundation Objects: Legal Entity, Business Unit, Division, Department
- MDF (Metadata Framework): 自定义对象创建
- Business Rules: 声明式逻辑 (workflow 触发, 值计算)

### Role-Based Permissions (RBP)
- **Manage Permission Roles**
- **Permission Groups** — 动态组 (基于查询)
- 大型企业特点: 层级审批 (CEO→事业部长→团队长→成员) 复杂

### ECP (Employee Central Payroll)
- 云托管运行国家 HR 薪资逻辑
- 与 H4S4 本地薪资共享代码库

### Recruiting
- Job Requisition Templates
- Application Form Templates
- Candidate Data Model

### Integration
- **Integration Center** — SFSF 内置集成工具
- **SAP Cloud Integration (CPI)** — 基于 BTP
- OData API (Query + Upsert)

## 🇨🇳 中国本地化
- **身份证号** — 区域 DC 存储合规性需法务审查
- **五险一金** — 仅路由到 ECP 时计算
- **本地化 UI** — SFSF 标准 i18n 支持
- **个税汇算** — 由 ECP 或本地 H4S4 处理 (SFSF 本身不计算)

## ⚠️ 注意
- **Admin Center 权限变更** — 先在 Preview instance 测试
- **数据模型变更** (XML import/export) — 必须备份
- 本地化字段 — 用 Picklist (禁止硬编码)

## 📖 迁移指南
参见 `../migration-path.md`。
