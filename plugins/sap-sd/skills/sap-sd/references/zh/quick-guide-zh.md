<!-- Claude-authored draft (community review welcome) -->

# sap-sd 快速指南 (简体中文)

## 🔑 环境信息收集
1. 销售组织 / 分销渠道 / 部门 (用户提供)
2. 信用管理方式 (ECC FD32 / S/4 FSCM UKM)
3. 收入确认 (Revenue Recognition) 方式

## 📚 要点

### Order-to-Cash
- **VA01/VA02**: 销售订单
- **VL01N**: 交货 (Delivery)
- **VF01**: 开票 (Billing)
- **VF04**: 开票 Due List
- **VA05**: 销售订单列表

### Pricing
- **V/08**: 定价过程
- **VK11/VK12**: 条件记录
- **VOFM**: 例程 (定价逻辑)

### Credit Management
- **ECC**: FD32 (信用额度) + VKM1 (订单冻结) + VKM3 (交货冻结)
- **S/4 FSCM**: UKM_BP (信用段) + rule-based check
- **FD33**: 查询额度

### Billing
- **VF03**: 查询开票凭证
- **VF11**: 取消开票
- Copy Control: **VTFA** (Order→Billing), **VTFL** (Delivery→Billing)

## 🇨🇳 中国本地化
- **金税电子发票开具** — VF01 过账时自动联动 (DRC 或第三方)
- **价税分离/含税** 混合 — B2C 含税价显示常为法定
- **红字发票** 流程支持需求时定制

## ⚠️ 注意
- VF01 取消 (VF11) **条件严格** — 注意与红字发票冲突
- 信用常涉及 **总部担保** (大型企业) → 信用段复杂
