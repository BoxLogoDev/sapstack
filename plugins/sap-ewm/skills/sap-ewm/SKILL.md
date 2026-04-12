---
name: sap-ewm
description: >
  This skill handles SAP EWM (Extended Warehouse Management — S/4HANA modern replacement) including 
  Warehouse Process Types, Warehouse Order (/SCWM/MON), Inbound/Outbound Processing, Wave Management 
  (/SCWM/WAVE), Packing (/SCWM/PACK), RF Framework (/SCWM/RFUI), Physical Inventory (/SCWM/PI), 
  Resource Management, Yard Management, Labor Management, and EWM-TM Integration. Covers Embedded EWM 
  (S/4HANA on-premise/RISE) and Decentralized EWM.
  Use when user mentions EWM, 확장창고관리, extended warehouse, warehouse order, 창고오더, 
  wave, 파도, packing, 패킹, RF, 핸드헬드, putaway strategy, 적치전략, yard management, 야드관리, 
  embedded EWM, decentralized EWM, /SCWM, 웹 기반 작업자, 리소스 관리, 라벨 프린팅.
allowed-tools: Read, Grep
---

## 1. Environment Intake (Critical)

**S/4HANA Mandatory**: EWM only runs on S/4HANA (on-premise, RISE, or Cloud PE).
- **Embedded EWM**: Integrated in same S/4HANA instance (typical for manufacturing)
- **Decentralized EWM**: Separate EWM system, multiple S/4HANA instances (complex networks)

**Questions to ask user**:
1. Embedded or Decentralized EWM?
2. S/4HANA release year? (1909, 2020, 2021, 2022+?)
3. Warehouse network complexity? (single, multi-plant, 3PL outsourced?)
4. RF capability? (web-based, native app, mobile device?)
5. Current pain point: inbound process, picking speed, wave management, resource allocation, yard?

---

## 2. EWM Architecture (Embedded vs Decentralized)

### Embedded EWM (typical)

Single S/4HANA instance runs both FI/MM/SD **and** warehouse operations.

| Component | Table Prefix | Purpose |
|-----------|--------|---------|
| **Warehouse Master** | /SCWM/ | Warehouse structure, zones, resources |
| **Inbound Order** | /SCWM/OBO | ASN → goods receipt → putaway |
| **Outbound Order** | /SCWM/OBO | Sales delivery → picking → packing → ship |
| **Warehouse Order** | /SCWM/OI... | Movement instructions (pick/put/pack) |
| **Quant** | /SCWM/QUANT | Stock holder (replaces LQUA from WM) |
| **Resource** | /SCWM/RESRC | Labor, equipment (forklifts, scanners) |

**Data flow**:
```
MM/SD document (MKPF/VBEP) → Warehouse Order (/SCWM/OI...) 
  ↓
RF/Web worker executes → Confirmation
  ↓
Post goods receipt/issue back to MM/SD (MKPF/VBEP updated)
```

### Decentralized EWM (complex networks)

Separate EWM system (own database, own S/4HANA or legacy) manages warehouse. Multiple plants connect.

**Use when**: 
- 3PL outsourced warehouse (external operator)
- Multi-region distribution (each region own WH system)
- Existing legacy warehouse system to preserve

**Challenge**: ALE/IDocs for MM/SD ↔ EWM synchronization

---

## 3. Warehouse Structure & Master Data

### Warehouse Configuration (/SCWM/MIGO_SAC or /SCWM/INIT)

| Entity | T-code | Definition | Table |
|--------|--------|------------|-------|
| **Warehouse** | /SCWM/WM01 | Top container (plant level) | /SCWM/WHSC |
| **Warehouse Process Type** | /SCWM/WM02 | Logical zone (receiving, picking, packing) | /SCWM/WOTY |
| **Warehouse Zone** | /SCWM/WM03 | Physical area (aisle, bay, level) | /SCWM/WHZONE |
| **Storage Bin** | /SCWM/WM04 | Individual location | /SCWM/BINLOC |
| **Resource** | /SCWM/RES01 | Worker, equipment, gate | /SCWM/RESRC |

### Key Difference from WM

| Aspect | ECC WM | S/4HANA EWM |
|--------|--------|-----------|
| **Bin address** | Fixed 9-char (ST-SEC-BIN) | Flexible identifier |
| **Quant structure** | Simple (material + location) | Rich (batch, serial, shelf-life) |
| **Resource mgmt** | NOT built-in | Built-in (workers, equipment, capacity) |
| **Yard mgmt** | NOT available | Built-in (vehicle queue, gate management) |
| **Wave picking** | NOT standard | Standard feature |
| **RF technology** | Proprietary WM RF (LT0G) | Web-based (HTML5) + native app |
| **Integration** | TR/TO intermediate | Direct order integration |

---

## 4. Inbound Processing (Goods Receipt → Putaway)

### Complete Flow

```
1. Purchase Order (ME21N) confirmed
2. ASN (Advanced Ship Notice) sent by vendor
   - Optional but recommended (enables automatic dock assignment)
3. Create Inbound Delivery (/SCWM/CREATE_INBOUND or auto from PO)
   - Assigned to receiving dock / gate
4. Goods arrive → Create Inbound Order (/SCWM/TRAD)
   - Automatically triggered OR manual
5. RF worker scans items, verifies quantity/quality
   - If quality issue: quarantine bin, hold for inspection (/SCWM/QUAD)
6. Confirm goods receipt → moves to putaway queue
7. Putaway wave created (automatic or manual batch)
8. RF worker executes putaway → bins stock according to putaway rule
9. Stock available for picking (same or next day)
```

### Key Transactions

| T-code | Function | Audience |
|--------|----------|----------|
| **/SCWM/TRAD** | Create Inbound Order manually | Planner (exception) |
| **/SCWM/TRAD1** | Inbound Order list | Planner (daily monitoring) |
| **/SCWM/MON** | Warehouse Order monitor (all types) | Supervisor |
| **/SCWM/IQUANT** | Quality hold / Quarantine bins | QC (if inspection needed) |
| **/SCWM/GOODS_RECEIPT** | Post GR to MM (after putaway confirm) | System automatic |

### Tables

**Inbound Order Header** (/SCWM/ORDICT):
- **LGNUM**: Warehouse
- **ORDERID**: Inbound order number (auto-generated)
- **STATUS**: 01=created, 02=ready-to-execute, 03=in-execution, 04=completed

**Warehouse Order** (/SCWM/ORDIM_*):
- ORDIM_O (outbound header), ORDIM_C (confirmation)
- Task type: 01=pick, 02=pack, 03=putaway, 04=transfer, 05=count

### Putaway Strategy

Unlike WM (LS0N), EWM uses **Putaway Rules** (customizable ABAP exit).

**Standard putaway logic**:
1. **Fixed bin**: High-value A-items (configured in material master)
2. **Slotting**: AI-driven optimal bin assignment (distance, capacity)
3. **FIFO/LIFO**: Material master setting (FIFO typical for perishables)
4. **Consolidation**: Add to existing partial quantity if space allows
5. **Next empty**: Default fallback

**Configuration**: CUSTOMIZING → (cross-module integration) → Warehouse Management → Inbound Processing → Putaway

### Issue: "Goods received but not moving to putaway"

**Root Cause**: Putaway wave not created, or quarantine hold active
**Check**: 
- /SCWM/MON → filter by warehouse → check "Warehouse Orders" pending putaway
- /SCWM/IQUANT → quarantine active? If yes, QC must release
- /SCWM/WAVE → putaway wave exist for this receipt date?

**Fix**:
1. /SCWM/WAVE → create putaway wave manually
2. /SCWM/IQUANT → release from quarantine if ready
3. /SCWM/MON → monitor RF execution (worker must scan & confirm)

---

## 5. Outbound Processing (Picking → Packing → Shipping)

### Complete Flow

```
1. Sales Order (VA01) created
2. Outbound Delivery (VL01N) created → Warehouse Order auto-created
3. Picking wave created (/SCWM/WAVE)
   - Consolidation: group multiple orders for multi-pick (efficiency)
4. RF worker picks items per warehouse order (pick + confirm)
   - Staging area: items held until all picks complete
5. Packing task assigned (/SCWM/PACK_MONITOR)
   - Box/pallet assignment
   - Weight/dimension verification
   - Handling Unit (HU) creation
6. Shipping label printed (barcode, address)
7. Post Goods Issue (VF01) → PGI document updates inventory
8. Invoice created → delivery closed
```

### Wave Management (/SCWM/WAVE)

**Purpose**: Group multiple outbound orders into a single picking wave.

**Wave types**:
- **Consolidation wave**: Multiple customers, same delivery date → Multi-pick efficiency
- **Zone-based wave**: All items in zone 1, then zone 2 (minimize RF movement)
- **Batch wave**: Time-based (e.g., all orders between 08:00–10:00)
- **Route-based wave**: Group by customer route (if using TM — Transportation Mgmt)

**Configuration**: /SCWM/WAVEDEF (wave definition template) → trigger settings (time, qty, manual)

### Packing (/SCWM/PACK)

**Handling Unit (HU)** = container (box, pallet, carton)

| Task | T-code | Function |
|------|--------|----------|
| **Create HU** | /SCWM/HU_MAINT | Define box type, dimensions, tare weight |
| **Pack monitor** | /SCWM/PACK_MONITOR | Assign items to HU, print label |
| **Verify HU** | /SCWM/HU_WEIGH | Weight check (label vs actual) |
| **Stage HU** | /SCWM/STAGE | Queue HU for shipment |

**HU structure**:
```
Outbound Order (SO line items)
  ↓
Warehouse Order (pick tasks)
  ↓
Handling Unit (container)
  ├─ Item 1 (qty X)
  ├─ Item 2 (qty Y)
  └─ Item 3 (qty Z)
```

**Label printing**: Integrated with label printer (ZPL format typical)

### Issue: "Picking complete but delivery not ready to ship"

**Root Cause**: Packing not completed, or HU weight verification failed
**Check**: 
- /SCWM/PACK_MONITOR → all items packed into HU?
- /SCWM/HU_WEIGH → weight variance flagged? (system blocks if tare ±10% diff)
- /SCWM/MON → warehouse order status: completed picking but not packed?

**Fix**:
1. /SCWM/PACK_MONITOR → pack remaining items
2. /SCWM/HU_WEIGH → confirm weights (or override if acceptable variance)
3. /SCWM/STAGE → move HU to shipping staging
4. VF01 → post goods issue (MM updated, available for invoice)

---

## 6. RF Framework (/SCWM/RFUI)

EWM uses **Web-based RF** (HTML5), replacing the legacy proprietary RF in WM.

### Key Advantages

| Feature | EWM RF | WM RF (LT0G) |
|---------|--------|------------|
| **Technology** | Web/Mobile browser | Proprietary (device-specific) |
| **Retraining** | Minimal (familiar UI) | Device-specific learning |
| **Devices** | Any mobile, tablet, handheld | Specific terminals (Zebra, Symbol) |
| **Real-time sync** | Network-based | Batch reconciliation |
| **Barcode/RFID** | Both supported | Barcode primary |
| **Offline mode** | Limited (local queue) | Robust (offline queue) |

### RF Transaction Types

| T-code / Menu | Function | Worker Input |
|---|---|---|
| **/SCWM/RFUI** | Main RF menu (entry point) | Worker ID, password |
| **Putaway RF** | Receive bin location, scan, confirm | Scan item barcode → bin location |
| **Picking RF** | Pick items per order, scan confirms | Scan item → qty → confirm |
| **Packing RF** | Scan items into HU, verify weight | Scan item → HU ID → confirm |
| **Counting RF** | Physical inventory entry | Scan location → bin → qty |
| **Cycle count** | Continuous mini-inventories | Workers scan, system compares |

### Configuration

**RF Menu Customization** (/SCWM/RES01 → Resource Profile):
- **RF verification profile**: Strictness of scanning (batch/serial required? etc.)
- **User authorization**: Which RF transactions available per worker role
- **Task assignment**: Automatic vs manual queue pull

### Issue: "RF worker can't see assigned task"

**Root Cause**: Task not assigned to worker's queue, or authorization blocked
**Check**:
- /SCWM/MON → filter by worker → any tasks pending?
- /SCWM/RES01 → worker resource profile → RF transaction authorization active?
- /SCWM/RFUI → worker logged in? Correct warehouse assignment?

**Fix**:
1. /SCWM/MON → manually assign task to worker (if system assignment failed)
2. /SCWM/RES01 → update authorization profile
3. /SCWM/RFUI → worker re-login (clears cache)

---

## 7. Physical Inventory in EWM (/SCWM/PI)

EWM inventory leverages quant-level detail (batch, serial, shelf-life).

### Cycle Counting (Standard)

```
1. /SCWM/PI_SELECT → Define scope (warehouse, zones, materials)
2. /SCWM/PI_CREATE → Generate PI docs → Print count sheets
3. RF worker scans quants, records qty → /SCWM/RFUI (PI task)
4. /SCWM/PI_POST → Post differences (generate MM doc)
5. Report variances → investigate root cause
```

### Continuous Inventory (24/7)

Workers scan every outbound/inbound transaction. System calculates variance in real-time.

**Activation**: Customize → Warehouse Management → Physical Inventory → Continuous Mode = X

### Key Difference: EWM PI vs WM PI

| Aspect | EWM | WM |
|--------|-----|-----|
| **Batch/Serial** | Full detail, shelf-life included | Batch-level only |
| **Quant matching** | Lot attributes compared | Basic location match |
| **Root-cause analysis** | System tracks variance by dimension (batch, shelf-life) | Manual investigation |
| **Shelf-life expiry** | Automatic flagging, removal recommendations | Manual review |

### Issue: "PI shows significant variance, batch split across bins"

**Root Cause**: Multiple putaway rules scattered same batch (inefficient consolidation)
**Check**:
- /SCWM/QUANT (table browser) → filter material + warehouse → count bins
- /SCWM/PI_POST → check variance report by batch/bin

**Fix**:
1. Create consolidation TO (transfer to single bin)
2. Update putaway rule to consolidate same batch
3. Re-run cycle count

---

## 8. Resource Management (Workers, Equipment, Labor)

EWM includes **labor allocation** & **capacity planning** — not available in WM.

### Resource Types

| Resource | T-code | Purpose |
|----------|--------|---------|
| **Worker** | /SCWM/RES01 | Human labor (skill level, availability) |
| **Equipment** | /SCWM/RES01 | Forklift, pallet jack, scanner (capacity) |
| **Gate** | /SCWM/GATE_ASSIGN | Dock assignment (inbound/outbound) |
| **Zone** | /SCWM/ZONE_RES | Worker specialization (only pick from Zone A) |

### Labor Management (/SCWM/LABOR)

Track actual vs planned labor hours.

**Use cases**:
- Forecast labor need (peak season: 20 workers, normal: 12)
- Monitor productivity (items per worker per hour)
- Adjust task assignment (prioritize fast-movers to experienced workers)

### Yard Management

**Vehicles in queue** for loading/unloading.

| Event | T-code | Action |
|-------|--------|--------|
| Vehicle arrives | /SCWM/YARD | Gate check-in, dock assignment |
| Loading in progress | /SCWM/YARD | Monitor HU placement onto truck |
| Vehicle departs | /SCWM/YARD | Gate check-out, shipment closed |
| Exception | /SCWM/YARD | Dock unavailable? Reroute to alternate dock |

---

## 9. EWM-TM Integration (Warehouse → Transportation)

**TM** (Transportation Management) optimizes shipping routes & consolidates shipments.

### Data Flow

```
Warehouse (EWM)
  ↓
Create Shipment (Handling Units ready)
  ↓
TM: Carrier assignment, route optimization
  ↓
Dock schedule assignment
  ↓
Freight booking, label printing
  ↓
Handoff to carrier (EDI-850, EDI-810)
```

### Key T-codes (TM side)

| T-code | Function |
|--------|----------|
| **/SCWM/SHIP_MON** | Shipment monitor (EWM → TM handoff) |
| **/SCWM/PLAN_ORDER** | Plan delivery order for TM |
| **/SCTM/ORDER_CREATE** | Create TM shipment order |

---

## 10. Embedded EWM vs Decentralized EWM vs WM

### Deployment Comparison

| Aspect | Embedded EWM | Decentralized EWM | ECC WM |
|--------|---|---|---|
| **Platform** | S/4HANA (same instance) | Separate EWM system | ECC 6.0 only |
| **Scope** | Single warehouse | Multi-plant, 3PL networks | Single plant |
| **Integration** | Direct DB (real-time) | ALE/IDocs (async) | TR/TO intermediate |
| **Complexity** | HIGH (learning curve) | VERY HIGH (sync complexity) | MEDIUM |
| **Maintenance** | Standard SAP support | Vendor-specific (if external) | Extended to 2025 |
| **RF** | Web-based | Web-based | Proprietary (LT0G) |
| **Resource mgmt** | Built-in | Built-in | None |
| **Best for** | Manufacturing, distribution | 3PL, multi-region networks | Legacy (sunset) |

---

## 11. ECC WM → S/4HANA EWM Migration

### Pre-Migration Checklist (12 months before cutover)

- [ ] Document warehouse structure (zones, bins, resources, capacity)
- [ ] Audit WM customizations (ABAP exits, reports) → map to EWM equivalents
- [ ] Plan RF terminal strategy (web-based rollout, device selection)
- [ ] Prepare data migration (quants, batch/serial records)
- [ ] Design putaway/picking rules in EWM (NOT 1:1 from WM)
- [ ] Identify process changes (wave picking, yard management new)
- [ ] Budget for retraining (WM staff → EWM operators)

### Key Warnings

**Process redesign required**:
- WM: TR → TO → manual override common
- EWM: Warehouse Orders auto-created, wave consolidation expected

**RF retraining**:
- WM: Device-specific (Symbol, Zebra proprietary menus)
- EWM: Web-based (same UI across all devices, but new workflows)

**Custom code**:
- WM programs using LQUA, LTAK, LTAP must rewrite for /SCWM/* tables
- Function module LFEI_..., LTAK_..., LTAP_... have no direct EWM equivalent

**Fallback plan**:
- Parallel run 1-2 months (both WM and EWM active, separate ware houses)
- Cutover date: freeze WM, go-live EWM
- Rollback: keep WM DB snapshot, revert if critical issues

---

## 12. Korean Logistics Context (한국 현장)

### Typical EWM Setup: Korean E-commerce / 3PL

**Warehouse automation**:
1. **Automated Sortation System (Sorter)**: Coupang, GMarket (integrates with EWM picking)
2. **Conveyor belt**: Item movement between zones (putaway, pick, pack)
3. **Barcode/RFID**: Universal (all items labeled before warehouse entry)
4. **RF+Web hybrid**: Worker app on personal phone + warehouse display system

### Example: Korean Fulfillment Center (Coupang-style)

```
Warehouse "DFC" (Daegu Fulfillment Center):

Inbound Zone (receipt):
  ├─ Gate 1, 2, 3 (truck dock)
  ├─ QC area (damage inspection)
  └─ Sort carousel → zones A, B, C

Storage Zones:
  ├─ Zone A (fast movers, high-velocity items)
  ├─ Zone B (medium velocity)
  └─ Zone C (slow movers, bulky items)

Picking Zone:
  ├─ Wave 1 (08:00–11:00) → multi-pick consolidation
  ├─ Wave 2 (11:00–14:00) → same
  └─ Wave 3 (14:00–17:00) → same

Packing Zone:
  ├─ Manual packing (small items)
  ├─ Automated wrapper (large items)
  └─ Label printer → Shipping dock

Resource:
  ├─ 100 RF workers (morning shift)
  ├─ 10 Sorter operators
  └─ 5 QC inspectors

Integration:
  ├─ Inbound: Vendor ASN → EWM → Sorter
  ├─ Outbound: Sales Order → EWM Wave → Sorter → Packing → TM
  └─ Reporting: Real-time KPI (items/hour, accuracy%, variance%)
```

**한국 고유 규정**:
- **개인정보보호 (개인정보보호법)**: 배송 정보 암호화 필수 → RF시스템 보안 설정
- **택배 추적**: TM 연동으로 고객에게 실시간 배송 상태 제공
- **아이템 추적성 (Traceability)**: 배송 시 각 item barcode 스캔 필수 (분실 방지)
- **반품/교환**: 별도 반품센터 with separate EWM warehouse (same instance, different warehouse)

---

## 13. Standard Response Format

For EWM questions, use **Quick Advisory** mode:

**Format**: Issue → Root Cause → Check (/SCWM T-code + table) → Fix → Prevention → Related

**Example**:

> **Issue**: "Putaway RF task shows zero picks available"
>
> **Root Cause**: Inbound order not yet released from quarantine QC hold, OR putaway wave not created
>
> **Check**:
> - /SCWM/MON → filter warehouse + status = putaway pending
> - /SCWM/IQUANT → any quarantine holds active?
> - /SCWM/WAVE → putaway wave exist for this inbound date?
>
> **Fix**:
> 1. /SCWM/IQUANT → QC release quants (if inspection complete)
> 2. /SCWM/WAVE → create putaway wave manually (if auto-creation disabled)
> 3. /SCWM/MON → monitor RF execution (worker must scan & confirm)
>
> **Prevention**: Enable automatic wave creation (CUSTOMIZING → Warehouse Mgmt → Inbound → Auto Wave)
>
> **Related**: See section 4 (Inbound Processing) for full workflow.

---

## 14. Key References

**Primary Tables** (/SCWM prefix):
- /SCWM/WHSC: Warehouse master
- /SCWM/WOTY: Warehouse process type (zones)
- /SCWM/BINLOC: Storage bin / location
- /SCWM/QUANT: Stock holder (batch, serial, shelf-life)
- /SCWM/ORDIM_*: Warehouse order (header, items, confirmation)
- /SCWM/ORDICT: Inbound order header
- /SCWM/RESRC: Resource (worker, equipment, gate)

**Key T-codes** (Monitoring / Execution):
- /SCWM/MON: Warehouse Order monitor (central dashboard)
- /SCWM/WAVE: Wave management (picking, putaway consolidation)
- /SCWM/RFUI: RF terminal (worker entry point)
- /SCWM/PACK_MONITOR: Packing execution
- /SCWM/PI_CREATE: Physical inventory
- /SCWM/YARD: Yard management (dock scheduling)
- /SCWM/GATE_ASSIGN: Gate assignment (inbound/outbound docks)

**Configuration Paths**:
- CUSTOMIZING → Warehouse Management → Master Data → Define Warehouse
- CUSTOMIZING → Warehouse Management → Processing → Inbound / Outbound / Putaway Rules
- CUSTOMIZING → Warehouse Management → RF → RF Transaction Authorizations

**SAP Resources**:
- SAP Help Portal: help.sap.com (EWM 2020+)
- Note 1863880: EWM release notes
- Note 2685701: EWM vs WM migration guide

---

## 15. Troubleshooting Quick Links

| Issue | T-code | Likely Cause | Fix |
|-------|--------|---|---|
| Task not visible in RF | /SCWM/MON | Task not assigned to resource | Manually assign in /SCWM/MON |
| Picking qty mismatch | /SCWM/QUANT | Batch split, insufficient qty | Consolidate stock via transfer |
| HU weight rejected | /SCWM/HU_WEIGH | Tare variance > 10% | Override if acceptable, or recount |
| Inbound stuck in QC | /SCWM/IQUANT | Quarantine hold active | QC release quants |
| Wave not triggering | CUSTOMIZING | Auto-creation disabled | Enable in Customize → Wave |
| RF disconnects, task lost | /SCWM/MON | Offline queue not configured | Enable offline mode in RF profile |

---

**Last Updated**: 2025 | **Platform**: S/4HANA only | **ECC WM**: See sap-wm skill (sunset 2025)

