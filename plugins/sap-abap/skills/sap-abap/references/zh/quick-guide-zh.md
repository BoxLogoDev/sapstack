<!-- Claude-authored draft (community review welcome) -->

# sap-abap 快速指南 (简体中文)

> SAP ABAP 开发速查参考. 完整细节见 `SKILL.md` 和 `references/clean-core-patterns.md`.

## 🔑 环境信息收集

1. ABAP 平台 (ECC 版本 / S/4HANA 发布年份)
2. HANA 原生开发范围 (CDS, AMDP, RAP)
3. ATC 检查变式配置

## 📚 核心开发主题

### Clean Core 原则
- 禁止直接修改标准 SAP 对象
- 使用 **BAdI** / **Enhancement Point** / **CDS View 扩展**
- Access Key 使用是**警示信号** (审计追踪)

### HANA 优化 SQL
- ❌ `SELECT * FROM ...`
- ✅ 只选必要字段 + `INTO TABLE`
- `FOR ALL ENTRIES` 注意事项:
  - 使用前检查空表
  - `SORT ... DELETE ADJACENT DUPLICATES` 去重
  - 小型查找 → 改用 **JOIN**
- **Push-down** — 通过 CDS View, AMDP 将逻辑下推到 HANA

### CDS Views
- **@ObjectModel.text.element** — 语言独立文本
- **@Semantics.amount.currencyCode** — 货币字段标注
- **@EndUserText.label** — i18n 支持

### RAP (RESTful ABAP Programming)
- Business Object → Service Definition → Service Binding
- Behavior Implementation
- Fiori Elements 自动生成

### 性能分析
- **ST05** — SQL 跟踪
- **SAT** — 运行时分析 (替代 SE30)
- **ST22** — 短转储分析
- **SM50 / SM66** — 工作进程监控

## 🇨🇳 中国本地化

- **金税系统集成** — 增值税专用发票接口 (SNOTE 2400284)
- **GB18030 编码** — 中文字符处理 (Unicode 转换)
- **国密 SM3/SM4** — 部分金融行业要求
- **本地化消息类** 翻译缺失导致 MESSAGE_TYPE_X

## ⚠️ 禁止事项

- ❌ 修改标准 SAP 对象 (违反 Clean Core)
- ❌ 生产环境直接运行 SE38 (白名单报表除外)
- ❌ 缺少 `AUTHORITY-CHECK` (SOX 审计风险)
- ❌ 动态 SQL 拼接用户输入 (SQL 注入)

## 🤖 代码审查委托
```
/sap-abap-review <文件路径或对象名>
```
→ `sap-abap-developer` 子代理按 Clean Core + HANA + ATC 标准审查

## 📖 参考
- `../clean-core-patterns.md`
- `../code-review-checklist.md`
