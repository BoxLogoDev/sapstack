<!-- Claude-authored draft (community review welcome) -->

# sap-integration-cloud 快速指南 (简体中文)

> SAP BTP 集成平台 — Integration Suite (CPI) + Datasphere + API Management + Event Mesh + Open Connectors。

## 🔑 环境信息收集

1. **集成范围** — CPI / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 / SuccessFactors / Ariba / 外部系统?
3. **协议** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **认证** — OAuth / Basic / Cert / SAML?

## 📚 核心组件

### Integration Suite
| 组件 | 用途 |
|---|---|
| **CPI** | 云集成 (原 HCI) — iFlow 消息路由/转换 |
| **API Mgmt** | 网关 · throttling · 安全 |
| **Event Mesh** | pub/sub 消息 |
| **Open Connectors** | 非 SAP 预构建连接器 |

### Datasphere
- 原 DWC (Data Warehouse Cloud)
- Space (隔离) + Local Table + View + Federation
- Data Provisioning Agent 连接本地

## 🇨🇳 中国本地化

### 常见模式

#### 政府系统对接
- **金税电子发票**: CPI iFlow + 国密证书
- **社保 EDI**: SFTP + 政府标准
- **税务局接口**: 专用 API + 认证

#### 银行对接
- **MT940 解析**: 清算标准 + 各银行 dialect
- **转账文件生成**: DMEE 格式 + 银行代码

#### 内部集成
- **总部 ↔ 子公司**: 多国数据整合 (Datasphere)
- **遗留 ERP ↔ S/4**: 迁移期 hybrid

### 网络隔离环境
- Cloud Connector + DMZ Proxy
- 外部通信经安全网关
- 证书: STRUST (S/4) + BTP Keystore

## 🚨 常见问题

### "iFlow 不处理消息"
- Sender adapter 状态 (REST·SFTP·OData)
- Polling 调度
- 证书过期
- 消息格式 (schema 不一致)
→ Monitor → Messages → 按状态确认

### "映射错误"
- Source/Target schema 不一致
- 必填字段缺失
- 类型转换 (String → Integer)
- Groovy script 语法

### "内存溢出"
- 大 payload (10MB+ 单条消息)
- 建议加 Splitter
- 使用 streaming 模式

### "证书过期"
- BTP Keystore 识别临期证书
- 提前 30 天启动续签
- 本地 CA 专用流程

### "Cloud Connector 连不上"
- 出站 443 端口防火墙
- 区域 endpoint (kr/eu/us)
- Virtual Host 映射 (internal vs external)

## 🔧 推荐模式

### S/4 → SuccessFactors 同步
1. S/4 ABAP CDS view 暴露
2. CPI iFlow: S/4 OData → mapping → SFSF OData
3. SFSF write API
4. Error → email/Slack 告警 + Reprocess

### MT940 银行文件解析
1. SFTP polling (Sender adapter)
2. MT940 → XML (Standard adapter)
3. Mapping → S/4 FF.5 input
4. RFC call to S/4

### Datasphere → SAC
1. Datasphere Space 设计分析模型
2. SAC Live Connection
3. Story 中 consume 模型

## 📚 参考

- `references/iflow-patterns.md` — iFlow 设计模式 (TBD)
- `references/datasphere-modeling.md` — Datasphere 建模 (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP 环境
- `../../../sap-sac/skills/sap-sac/SKILL.md` — SAC 集成
- `../../../sap-sfsf/skills/sap-sfsf/SKILL.md` — SFSF 集成

## ⚠️ 非目标

- BW/4HANA 本地数据仓库 (BW)
- 非 SAP iPaaS (Boomi, MuleSoft, Workato)
- PO/PI (旧 SAP 集成 — 已弃用; 迁移到 CPI)
