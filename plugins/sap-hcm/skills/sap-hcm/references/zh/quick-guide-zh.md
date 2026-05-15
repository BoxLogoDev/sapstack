<!-- Claude-authored draft (community review welcome) -->

# sap-hcm 快速指南 (简体中文)

## 🔑 环境信息收集
1. HCM 部署 (ECC HCM / H4S4 / SuccessFactors 混合)
2. 国家薪资版本
3. 是否 FI Posting 集成

## 📚 要点

### Personnel Administration
- **PA30**: 维护信息类型
- **PA40**: 人事措施 (入职/离职/晋升)
- 主要信息类型:
  - 0001 (组织分配), 0002 (个人信息), 0006 (地址)
  - 0008 (基本工资), 0014 (经常性扣款), 0015 (一次性)

### Time Management
- **PT60**: Time Evaluation
- **PT01**: Work Schedule Rule
- **CAT2**: 考勤录入

### Payroll (国家特定)
- **PC00_M{cc}_CALC**: 薪资计算
- **PC00_M{cc}_CDTA**: 支付数据生成
- **PC00_M{cc}_CEDT**: 工资单
- 个税申报: 国家特定代扣 driver

### FI Posting
- **PC00_M99_CIPE**: 薪资 → FI 过账

## 🇨🇳 中国本地化
- **身份证号** 脱敏必须 (个人信息保护法 PIPL)
- **五险一金** (养老/医疗/失业/工伤/生育 + 公积金) 自动计算
- **个税专项附加扣除** — 中国薪资标准流程
- **个税累计预扣预缴表** 按税务局周期更新
- **企业年金** (DB/DC) 处理

## ⚠️ 注意
- 个人信息查询经 **PFCG P_ORGIN** 权限对象严格限制
- **薪资生产环境禁改** — 必须 开发 → QA → 生产 transport
- 年度汇算季 (次年初) 注意并发用户激增
