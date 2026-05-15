<!-- Claude-authored draft (community review welcome) -->

# sap-fi 快速指南 (简体中文)

> SAP FI (财务会计) 速查参考. 完整细节见 `SKILL.md` 和 `references/closing-checklist.md`.

## 🔑 环境信息收集

1. SAP 版本 (ECC 6.0 EhPx / S/4HANA 19xx-23xx)
2. 部署模式 (本地部署 / RISE / Cloud PE)
3. 会计年度变式 (K4 日历年或自定义)
4. 公司代码 (用户提供 — 不要假设)
5. 错误消息号 + 发生的 T-code

## 📚 核心模块

### AP — 应付账款
- **FB60 / MIRO** 过账错误:
  - 税码未分配 → 检查 **FTXP**
  - 容差超限 → **OMR6** 按公司代码设置限额
  - GR 基础发票校验不匹配 → PO 行 Invoice 标签 vs 收货数量
- **F110** 付款运行:
  - 付款方式缺失 (LFB1-ZWELS)
  - 银行未确定 → **FBZP**
  - DME 文件未生成 → **DMEE** 按付款方式配置
- 预扣税 (扩展) — **WTAD** + SPRO 分配

### AR — 应收账款
- **FD32** (ECC) / **UKM_BP** (S/4 FSCM): 信用管理
- **F150** 催款 → **FBMP** 催款程序
- **VKM1 / VKM3**: 释放信用冻结的订单 / 交货
- 预收款: **F-37** (请求), **F-29** (过账), **F-39** (清账)

### GL — 总账
- 字段状态冲突 — 三个来源: **OBC4** (凭证类型) + **OB14** (记账码) + **FS00** (科目)
- 外币评估 — **FAGL_FC_VAL** (始终先做测试运行)
- 自动清账 — **F.13** (先测试运行)
- 余额结转 — **F.16** (ECC) / **FAGLGVTR** (新总账)

### AA — 资产会计
- 折旧运行 — **AFAB**
- 资产转移 — **ABUMN**
- 年末 — **AJAB** (关闭会计年度)

## 🚨 常见问题

### "FB01 无法对供应商对账科目过账"
- 根因: LFB1-AKONT 是对账科目
- 解决: 使用 **FB60** (供应商发票) 或特别总账 (F-47/F-48). FB01 不能直接过账到对账科目.

### "F110 未选中任何项目"
- 供应商缺少付款方式 (XK03 → LFB1.ZWELS 为空)
- 或项目尚未到期 — 检查到期日
- 或公司代码未在付款运行中激活

### "MIRO 上税码不匹配"
- 税码禁用过账 (FTXP)
- 或公司代码特定税务程序变更
- 冲销 + 用正确税码重新输入

### "期间已关闭 — 无法过账"
- OB52 → 调整授权组 (不要随意打开前期)
- 交叉检查年终结转状态 (F.16 / FAGLGVTR)

## 🔧 核心 T-code 速查表

| 区域 | T-code |
|---|---|
| 凭证过账 | FB01, FB50, FB60, FB70 |
| 凭证显示 | FB03 |
| GL 行项目 | FBL3N (行项目), FAGLB03 (余额) |
| 供应商行项目 | FBL1N |
| 客户行项目 | FBL5N |
| 付款 | F110, F-58 |
| 结账 | F.05, F.13, F.16, FAGL_FC_VAL, FAGLGVTR |
| 期间 | OB52 |
| 配置 | FBZP, FBMP, FTXP, OMR6, OBYC |
| 对账 | F.50 |

## ECC vs S/4HANA 要点

- **GL**: BSEG/BKPF → ACDOCA (S/4 通用日记账)
- **AR 信用**: FD32 → UKM_BP (FSCM)
- **AA**: 经典 AA → 新资产会计 (S/4 强制)
- **银行**: FI12 → BAM (银行账户管理)

## 🇨🇳 中国本地化考虑

- **增值税 (Golden Tax 金税)**: 与 SAP 的发票模块通过中国本地化接口集成
- **税务系统连接**: 使用 SAP Note 1854830 (Golden Tax Integration) 检查
- **会计准则**: ASBE (中国企业会计准则) — 通常单独账簿与 IFRS/GAAP 并行
- **多币种**: 人民币本位 + 外币结算 (FAGL_FC_VAL 配置)
- **SAFE 外汇管理**: 外汇收支报告

## ⚠️ 不在范围内

- 销售发票 (使用 SD)
- 成本中心核算 (使用 CO)
- 生产成本追踪 (使用 CO + PP)
- 资金管理 (使用 TR 插件)

## 📚 参考

- `closing-checklist.md` — 月度/季度/年度结账清单
- `tcode-reference.md` — 完整 T-code 列表
- `../../../sap-co/skills/sap-co/SKILL.md` — 成本核算集成
- `../../../sap-tr/skills/sap-tr/SKILL.md` — 资金管理集成
