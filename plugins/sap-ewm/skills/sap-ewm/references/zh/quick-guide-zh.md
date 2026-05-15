<!-- Claude-authored draft (community review welcome) -->

# sap-ewm 快速指南 (简体中文)

## 🔑 环境信息收集

SAP EWM (Enhanced Warehouse Management) 工作前确认:

### 1. SAP 平台与部署
- **S/4HANA On-Premise**: 推荐 EWM 2020+
- **RISE (Private Cloud)**: 完整 EWM + 自动更新
- **Cloud Public Edition**: 受限 EWM (仅基础)

### 2. EWM 部署架构
- **Embedded**: 与 S/4HANA 同实例 (中小)
- **Decentralized**: 独立实例 + RFC (大型, > 5,000 行/日推荐)

### 3. DC 规模与复杂度
- 日处理量 (入/出库行)
- 多存储策略 (FIFO/LIFO)、越库、退货中心
- MM/SD/TM 集成深度

### 4. 本地化要求
- **电商**: 当日/次日达 → 自动拣货/分拣
- **法规**: 配送地址加密、电子签收 (快递对接)
- **运营**: 夜间/24h → 系统稳定性 critical

## 📚 关键 T-code 与角色

### 监控
| T-code | 功能 |
|--------|------|
| **/SCWM/MON** | 集成监控仪表板 |
| **/SCWM/ACT** | 活动查询 |
| **/SCWM/AREA** | 区域与 bin 状态 |

### 入库
| T-code | 功能 |
|--------|------|
| **/SCWM/GOODS_IN** | 收货 |
| **/SCWM/PUT_AWAY** | 上架指示 |
| **/SCWM/PUTAWAY_MON** | 上架监控 |

流程: MM PO → EWM → /SCWM/GOODS_IN inbound delivery → 扫描 + QC → /SCWM/PUT_AWAY 自动 bin → RF 确认。

### 出库
| T-code | 功能 |
|--------|------|
| **/SCWM/WAVE** | 波次计划与执行 |
| **/SCWM/PICK** | 拣货 |
| **/SCWM/PACK** | 打包与标签 |
| **/SCWM/SHIP** | 发运确认 |

流程: SD SO → EWM → /SCWM/WAVE 分组 → /SCWM/PICK (条码) → /SCWM/PACK 箱型建议 → /SCWM/SHIP 快递签收。

### RF / 移动
| T-code | 功能 |
|--------|------|
| **/SCWM/RFUI** | RF 终端基础 |
| **/SCWM/RFUI_WAVE** | RF 拣货 (波次) |
| **/SCWM/MOBILE** | 移动应用 (Fiori) |

### 结算 / 接口
| T-code | 功能 |
|--------|------|
| **/SCWM/PI** | Physical interface (签收) |
| **/SCWM/TM_INTERFACE** | 运输管理对接 |
| **/SCWM/CONF** | 发运确认 + FI 过账 |

## 🇨🇳 中国本地化

### 在线履约中心日常运营
- 上午(06-12): 入库集中 — /SCWM/GOODS_IN + /SCWM/PUT_AWAY (目标: 收货→bin < 2h)
- 正午(12-17): 拣货集中 — /SCWM/WAVE 分 3-4 波, 并行 /SCWM/PICK + /SCWM/PACK (300-500 行/h)
- 傍晚(17-22): 快递揽收 — /SCWM/SHIP + /SCWM/PI (签收 API → 客户追踪)

### 自动化集成
- Sorter: /SCWM/PACK 分拣出口指示
- AS/RS: /SCWM/PUT_AWAY 自动 bin 分配

### 退货中心
- /SCWM/GOODS_IN (退货区单独 bin) → QC → 再发货 or 报废
- 电商退货率高 (大促后) → 专门追踪必要

### 地址隐私
- 加密配送地址; 拣货团队仅见签收号
- 留存期满清除地址

## ⚠️ Embedded vs Decentralized

| | Embedded | Decentralized |
|---|---|---|
| 优 | 简单, 低成本 | 高吞吐, 独立, 易扩展 |
| 缺 | 系统负载高, 扩展受限 | 配置复杂, RFC 管理 |
| 推荐 | DC < 2,000 行/日 | DC > 5,000 行/日 |

参考架构: S/4HANA (Core) → RFC/OData → EWM (Decentralized) → API/EDI → TM → Sorter/RF/快递系统。

## 常见问题

| 症状 | 原因 | 诊断 | 解决 |
|-----|------|------|-----|
| 拣货延迟 (波次积压) | bin 不足/物品布局 | /SCWM/MON | 优化上架 (FIFO) |
| 签收未对接 | /SCWM/PI 失败/快递 API | /SCWM/PI 日志 | 检查快递 API |
| RF 错误 (找不到货) | 扫描数据不一致 | RF 日志 | 复核条码 |
| 库存不一致 | 未确认收发货 | /SCWM/MON | 循环盘点 |
| 性能下降 | 量 > 容量 | /SCWM/MON 性能页 | 调波次/扩容 |

## 📊 KPI
- 入库吞吐 (100-200/h)
- 拣货准确率 (/SCWM/PICK 错误 < 0.5%)
- 配送时间 (订单→签收 < 30 分)
- 库存准确率 (> 99.5%)
- 系统可用度 (99.9% SLA)

## 流程详解 (Process Flows)

Inbound:
```
MM PO → EWM 自动传输
/SCWM/GOODS_IN: 登记 inbound delivery
扫描 + QC → 异常则退货指示
/SCWM/PUT_AWAY: 自动 bin 分配 → RF 确认
```

Outbound:
```
SD SO → EWM 自动传输
/SCWM/WAVE: 分 3-4 波次
/SCWM/PICK: 拣货 (条码) → RF 扫描确认
/SCWM/PACK 箱型建议 → /SCWM/SHIP 快递签收
```

RF 作业:
```
1. 登录 → 选作业类型 (GOODS_IN/PICK/PACK)
2. 扫描产品条码或输入位置
3. 系统比对预期数量 → 确认或告警
4. 确认: RF 按钮 → 服务器即时更新
```

日常运营:
```
06-12 入库: /SCWM/GOODS_IN + /SCWM/PUT_AWAY
12-17 拣货: /SCWM/WAVE + /SCWM/PICK + /SCWM/PACK
17-22 发运: /SCWM/SHIP + /SCWM/PI 快递揽收
```

参考架构:
```
S/4HANA (Core) → RFC/OData
  → EWM (Decentralized) → API/EDI
  → TM → Sorter / RF / 快递系统
```

退货:
```
客户退货 → /SCWM/GOODS_IN (退货区 bin)
QC → 良品: 再发货 / 不良: 报废或返厂
/SCWM/MON 追踪; 留存期满清除地址
```

## 相关
- `../../SKILL.md` — 完整 EWM 指南
- `references/img/ewm-configuration.md` — IMG 设置
- `docs/enterprise/ewm-operations-korea.md` — 运营指南
