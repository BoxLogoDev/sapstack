<!-- Claude-authored draft (community review welcome) -->

# sap-pp 快速指南 (简体中文)

## 🔑 环境信息收集
1. 生产方式 (Discrete / Process / Repetitive / KANBAN)
2. MRP 方式 (Classic MRP / MRP Live — S/4)
3. 工厂及生产组织 (用户提供)

## 📚 要点

### Master Data
- **CS01/CS02**: BOM (物料清单)
- **CA01/CA02**: Routing (工艺路线)
- **CR01/CR02**: Work Center
- **MD04**: Stock/Requirements 列表

### MRP
- **MD01**: MRP Run (全厂 — 一般不推荐)
- **MD02**: MRP Run (单物料)
- **MD03**: MRP Run (单物料多层)
- **MD41/MD43**: Planning Evaluation
- S/4HANA: **MRP Live** (CDS + HANA push-down)

### Production Orders
- **CO01/CO02**: 创建/修改生产订单
- **CO11N**: 确认 (Confirmation)
- **CO15**: 取消确认
- **COGI**: 处理自动 GR 失败列表

### Repetitive Manufacturing
- **MFBF**: Backflush
- **MF50**: Planning Table

## 🇨🇳 中国本地化
- **制造业占比大** — PP 是核心模块
- **委外加工** (Subcontracting) 复杂 — 注意受托/委托区分
- **交付管控** 要求严格 (主机厂供应商标准)

## ⚠️ 注意
- 全厂 MRP (MD01) 仅 **运营时间外** 运行
- BOM 变更后必须重算 Low-level code (**OMIW**)
