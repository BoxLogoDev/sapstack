<!-- Claude-authored draft (community review welcome) -->

# sap-tr 快速指南 (简体中文)

## 🔑 环境信息收集
1. SAP 版本 + TRM (Treasury Risk Management) 是否激活
2. 交易币种 (CNY/USD/JPY ...)
3. 银行接口方式 (MT940 / H2H / SaaS)

## 📚 要点

### Cash Management
- **FF7A**: 现金头寸
- **FF7B**: 流动性预测
- **FLQDB / FLQITEM**: Liquidity Item 主数据
- 银行对账单上传: **FF_5**, **FEBAN**

### Payment
- **F110**: 付款运行 (与 FI 共享)
- **DMEE**: 付款介质格式 (各银行)
- **FI12 / BAM (S/4)**: House Bank 管理

### 银行对接
- 主要银行常有 **专有企业网银格式**
- 非 MT940 的 **XML/EDI** 使用案例多
- 参考本地清算机构电子金融标准
- 自动扣款、虚拟账户多需定制

### TRM (可选)
- **FTR_CREATE**: 创建金融交易
- 衍生品 (远期外汇、IRS、CRS) 会计处理复杂 — IFRS 披露注意

## 🇨🇳 中国本地化
- **本币流动性预测** 是最常见 use case
- 外部汇率源 (人行中间价/市场汇率) 项目多
- **跨境外汇申报**: 跨境交易申报阈值义务

## ⚠️ 注意
- 生产环境 House Bank 变更必须 Transport + 模拟
- MT940 测试环境必备 — 禁止生产 first try
