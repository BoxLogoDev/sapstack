<!-- Claude-authored draft (community review welcome) -->

# sap-mm 快速指南 (简体中文)

> SAP MM (物料管理) — 采购、库存、发票验证、GR/IR.

## 🔑 环境信息收集

1. SAP 版本 (ECC EhPx / S/4HANA 19xx-23xx)
2. 部署模式 (本地 / RISE / Cloud PE)
3. 采购类型 (服务 / 间接 / 直接 / 委外加工 / 寄售)
4. 工厂 / 公司代码 (用户提供)
5. 错误消息 + T-code

## 📚 核心模块

### 采购申请
- **ME51N / ME52N / ME53N** — 创建 / 修改 / 显示 PR
- 科目分配: 成本中心 (K)、订单 (F)、资产 (A)、项目 (P)
- 审批策略: T-code OMGS (配置), CL30 (审批组/策略)

### 采购订单
- **ME21N / ME22N / ME23N** — 创建 / 修改 / 显示 PO
- PO 类型: NB (标准)、FO (框架)、UB (库存转移)、RA (退货)
- 输出 (打印/邮件): ME9F → 手动输出, NACE (配置)

### 收货
- **MIGO** — 移动类型 101 (收货)、102 (冲销)、161 (退货)
- 入库通知 (集成 EWM): VL31N → VL32N → MIGO
- 库存类型: 非限制 (自由)、质量 (Q)、冻结 (S)

### 发票校验
- **MIRO** — 发票接收 (3 向匹配: PO/GR/Invoice)
- 容差: OMR6 (按公司代码)
- 冻结: 行项 payment block → 释放 MRBR

### 主数据
- **MM01/MM02/MM03** — 物料主数据
- **XK01/XK02/XK03** — 供应商主数据 (ECC)
- **BP** — 业务伙伴 (S/4 统一)
- **ME11/ME12/ME13** — 信息记录

## 🚨 常见问题

### "MIGO 入库失败 — M7 错误"
- 期间已关闭 (MMRV / MMPV)
- 物料过账冻结 (MM02 → 工厂数据)
- 科目确定缺失 (OBYC)
- 特别库存 (E/Q/K) 要求

### "MIRO 3 向匹配失败"
- 数量容差超限 — OMR6
- 价格容差超限 — OMR6
- PO 税码 ≠ 发票 — 手动更正
- GR 基础 IV 标志不匹配

### "MMBE 库存不正确"
- 交叉检查: MB52 (按物料/工厂)、MB5B (期间库存)、MB51 (移动列表)
- 预留 (MD04) 占用库存?
- 质量库存 (MB52 → 库存类型 Q) 忽略?

## 🔧 核心 T-code

| 区域 | T-code |
|---|---|
| PR | ME51N/52N/53N, ME54N (审批) |
| PO | ME21N/22N/23N, ME9F (输出) |
| GR | MIGO (101/102/161), MB51 (列表) |
| IV | MIRO, MRBR (释放冻结) |
| 库存 | MMBE, MB52, MB5B, MB5T (在途) |
| 主数据 | MM01/02/03, XK01/02/03 (ECC), BP (S/4) |
| 信息记录 | ME11/12/13 |
| 货源清单 | ME01 |
| 框架协议 | ME31K (合同), ME31L (调度) |

## ECC vs S/4HANA

- **供应商**: XK → BP (统一业务伙伴)
- **物料**: 同 MM01-03 但 MARA 结构简化
- **EWM 集成**: S/4 更深 (内置 EWM)
- **集中采购 (Centralized Sourcing)**: S/4 独有

## 🇨🇳 中国本地化考虑

- **增值税**: 13%, 9%, 6% 税率 — FTXP 配置
- **金税系统连接**: 通过中国本地化接口集成
- **进口关税**: 报关单导入 → SAP GTS 推荐
- **多币种结算**: 人民币本位 + 外币 (FAGL_FC_VAL)
- **海关 (Customs)**: 进出口贸易合规 → 与 sap-gts 集成

## ⚠️ 不在范围

- 销售 (使用 SD)
- 仓库内部移动 (WM/EWM)
- 战略采购 / RFx (使用 Ariba)
- 生产物料发放 (使用 PP)

## 📚 参考

- `references/img/account-determination.md` — OBYC 配置
- `../../../sap-fi/skills/sap-fi/SKILL.md` — 发票过账集成
- `../../../sap-ariba/skills/sap-ariba/SKILL.md` — 战略采购
