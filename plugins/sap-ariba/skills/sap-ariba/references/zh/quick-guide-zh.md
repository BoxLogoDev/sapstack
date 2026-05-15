<!-- Claude-authored draft (community review welcome) -->

# sap-ariba 快速指南 (简体中文)

> SAP Ariba — 全球采购云。Sourcing · Contracts · Procurement · Network (供应商协作)。

## 🔑 环境信息收集

1. **Ariba 版本** — Sourcing / Procurement / SLP / Network?
2. **S/4 集成** — CIG (Cloud Integration Gateway)
3. **供应商生态** — Ariba Network 连接供应商数量
4. **场景** — 寻源事件 / 合同 / PR-to-PO / Network 通信

## 📚 模块

| 模块 | 用途 |
|---|---|
| **Sourcing** | 战略寻源 — RFI/RFP/RFQ + e-Auction |
| **Contracts** | 合同管理 — template·redline·续签 |
| **Procurement** | 采购 — catalog·PR·PO·invoice |
| **SLP** | 供应商生命周期 — 资质·风险 |
| **Spend Analysis** | 支出分类·节约追踪 |
| **Network** | 供应商协作 — 单据交换·状态 |

## 🇨🇳 中国本地化

### 采购流程
```
S/4 PR (ME51N) → Ariba 寻源 (战略品类)
   → 发送 RFx → 投标 → 授标
   → 创建 Ariba Contract
   → 注册目录 → 用户采购
   → S/4 PO (ME21N) → GR/IV → 付款
```

### 常见模式
- **国内供应商**: Network 加入率低 → 分阶段 onboarding
- **全球集团**: 总部 Ariba + 子公司 → 共享目录/合同
- **公共招标**: 政府平台优先 (Ariba 为民营)

### 本地化集成问题
- **增值税**: 中国税码 → Ariba tax mapping
- **统一社会信用代码**: Ariba 供应商主数据自定义字段
- **银行/付款**: 中国银行代码 → DMEE 格式

## 🚨 常见问题

### "供应商没收到 RFx"
- 确认 ANID (Ariba Network ID) — 已 onboarding 供应商?
- 确认邮件送达 (垃圾箱)
- Network 连接正常 (供应商登录)

### "PR 不审批"
- 确认 Approver delegation
- 部门变更后 approver 未自动刷新

### "PO 没传给供应商"
- 供应商 Network 状态 (Trading Relationship)
- 传输方式 (Network / Email / cXML)
- 消息队列 (CIG monitor)

### "Invoice mismatch"
- 3-way match (PO-GR-Invoice)
- 税码 mapping
- 汇率 (外币发票)

## 🔧 集成诊断

CIG (Cloud Integration Gateway) 流程:
1. S/4: ERP Integration Add-on for Ariba 激活
2. CIG Worker (Cloud Connector) GREEN
3. Ariba Realm 配置
4. 消息 mapping (Material, Vendor, PR, PO)

故障时:
- CIG monitor → Messages → 按状态分类
- S/4 SLG1 → Application Log → CIG namespace
- Ariba Network → Buyer login → System Updates

## 📚 参考

- `references/sourcing-event-types.md` — RFx 类型 (TBD)
- `references/network-onboarding.md` — 供应商 onboarding (TBD)
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM 集成
- `../../../sap-fi/skills/sap-fi/SKILL.md` — 增值税·付款
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CIG/CPI

## ⚠️ 非目标

- 非 Ariba 采购系统 (SRM, Coupa, Jaggaer)
- 详细库存管理 (MM)
- 公共采购平台
