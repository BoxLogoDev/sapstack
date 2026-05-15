<!-- Claude-authored draft (community review welcome) -->

# sap-btp 快速指南 (简体中文)

> SAP Business Technology Platform 速查参考. 完整细节见 `SKILL.md` 和 `references/cap-patterns.md`.

## 🔑 环境信息收集

1. BTP 运行时 (Cloud Foundry / Kyma / ABAP Environment)
2. 区域 (延迟考量)
3. 订阅类型 (Free / Trial / Standard / Enterprise)

## 📚 核心构建模块

### CAP (Cloud Application Programming)
- **cds init** — 项目初始化
- **db/schema.cds** — 数据模型
- **srv/*.cds** — 服务定义
- **srv/*.js** — 自定义逻辑
- Fiori Elements 自动生成

### Fiori / UI5
- **Launchpad** 配置
- **OData V2 / V4** 服务绑定
- i18n 资源包支持

### Integration Suite
- **iFlow 设计** — Open Connectors, Cloud Integration
- 主要 Adapter: HTTP/REST, SFTP, SOAP, OData, IDoc
- **API Management** — 限流, 策略

### Security
- **XSUAA** — OAuth2 认证/授权
- **Destination Service** — 后端系统连接
- **Cloud Connector** — 本地系统连接

## 🇨🇳 中国本地化

- **数据出境合规** — 网络安全法 / 数据安全法 / 个保法 (PIPL) 要求
- **中国区域可用性** — SAP 中国区 BTP 与全球区数据隔离
- **微信/支付宝集成** — XSUAA 自定义 IdP + Integration Suite iFlow
- **国内 CDN/对象存储** — 阿里云/腾讯云对接需 Cloud Connector

## 🤖 开发工作流
1. `cds init` + 本地建模
2. Git push → Cloud Foundry / Kyma 部署
3. Fiori Launchpad 注册
4. XSUAA role-collection 映射

## ⚠️ 注意事项
- **Cloud Foundry Space** 分离 — Dev/Test/Prod
- **Destination** 凭证存储需启用加密
- **XSUAA xs-security.json** 变更需重新部署

## 📖 参考
- `../cap-patterns.md`
- `../btp-security.md`
