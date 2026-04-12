---
name: sap-wm
description: >
  This skill handles SAP WM (Warehouse Management — ECC legacy module) including Warehouse Structure 
  (LS01N/LS02N), Storage Type/Section/Bin (LS01/LS03N), Transfer Order (LT01/LT03/LT0E), 
  Transfer Requirement (LB01/LB10), Picking/Putaway Strategies, WM-MM/SD Integration, Physical Inventory 
  (LI01N/LI02N), and Decentralized WM (MWMII). Also covers ECC WM → S/4HANA migration (WM deprecated in S/4HANA; use EWM instead).
  Use when user mentions WM, 창고관리, warehouse, storage bin, 저장위치, transfer order, 이관오더, 
  putaway, 입고적치, picking, 피킹, storage type, 저장유형, quant, decentralized WM, LS01N, LS03N, LT01, LB01, LI01N, MWMII.
allowed-tools: Read, Grep
---

## 1. Environment Intake (Critical)

**ECC vs S/4HANA Alert**: WM is **DEPRECATED in S/4HANA (all releases)**. 
- **S/4HANA on-premise / RISE**: Use embedded EWM (`sap-ewm` skill) or Stock Room Management
- **ECC 6.0**: WM fully supported through extended maintenance (2025)
- **Dual-run transition**: ECC WM → S/4HANA EWM requires process redesign (not 1:1 mapping)

**Questions to ask user**:
1. ECC 6.0 (which EhP?) or S/4HANA already?
2. Warehouse network: single, multi, or 3PL outsourced?
3. RF terminal / barcode capability active?
4. Current issue: process bottleneck, data accuracy, integration, or migration planning?

---

## 2. Warehouse Structure (LS01N / LS03N / LQUA)

### Hierarchy & Tables

| Level | T-code | Definition | Table |
|-------|--------|------------|-------|
| **Warehouse** | LS01N | Top container, assigned to plants | LAGP |
| **Storage Type** | LS01 | Physical zone (rack, yard, high-bay, flow) | LTYP |
| **Storage Section** | LS03N | Sub-zone (aisle, row) | LEIN |
| **Storage Bin** | LS03N | Individual slot (address: WH-ST-SEC-BIN) | LQUA |

### Warehouse Master (LAGP) Key Fields
- **LGNUM**: Warehouse number (2 chars, e.g., "01")
- **LGSYS**: Flag — `W` (WM system) or `D` (Decentralized)
- **WERKS**: Plant assignment
- **LGPLA** format: 3-digit ST + 3-digit section + 3-digit bin (e.g., "001001001")

### Issue: "Cannot create storage bins"

**Root Cause**: Missing storage section linking
**Check**: SE16N → LEIN (verify section exists); SE16N → LQUA (verify bins)
**Fix**: LS03N → Create Section → Create Bins (batch entry) → Trigger MRP

---

## 3. Transfer Order (LT01 / LT03 / LT0E / LT06)

### Key T-codes

| T-code | Function | Field |
|--------|----------|-------|
| **LT01** | Create TO manually | LGPLA (from), LGPLB (to) |
| **LT03** | Release picking TO | Qty by storage section |
| **LT0E** | Release putaway TO | Destination bin |
| **LT0A** | Confirm TO execution | Updates LQUA stock |
| **LT0G** | RF execution (handheld) | Worker mobile entry |
| **LT04** | Cancel TO | Full reversal |

### Process Flow
```
GR (MIGO 101) → TR created → LB10 batch → TO created (LT01)
  ↓
Release (LT03/LT0E) → RF Execute (LT0G) → Confirm (LT0A)
  ↓
Stock in LQUA, available for picking
```

### Tables (LTAK / LTAP)

**LTAK** (header):
- LGNUM, TANUM (TO number)
- TPTYP (10=picking, 20=putaway, 30=inventory)
- KZVLP (two-phase picking flag)

**LTAP** (lines):
- LGPLA (source bin), LGPLB (dest bin)
- MATKX (material), MENGE (qty), ERFME (UOM)
- LGMNG (actually moved qty)

### Issue: "Transfer Order stuck in Pick phase"

**Root Cause**: Partial RF execution + system failure
**Check**: SE16N → LTAP: LGMNG vs MENGE; LT01 → Messages tab
**Fix**: LT0A (resume confirm) OR LT04 (cancel & recreate)

---

## 4. Transfer Requirement (LB01 / LB10)

### Auto-Creation Triggers

| Source | T-code | Type |
|--------|--------|------|
| GR | MIGO 101 | Putaway TR |
| Delivery | VL01N | Picking TR |
| Production | PP | Component withdrawal TR |
| Inventory diff | LI07 | Correction TR |

### Key Transactions

| T-code | Function | Audience |
|--------|----------|----------|
| **LB01** | Create TR manually | Planner |
| **LB03** | Release TR for TO | Coordinator |
| **LB10** | Auto-convert TR → TO | Batch job |
| **LB05** | TR search/list | Daily monitoring |

### LB10 Batch Job (Auto TO Creation)

**Purpose**: Convert released TRs → TOs using putaway strategy
**Execution**: Nightly (e.g., 23:00) — if fails, goods stuck in receiving
**Monitor**: SM37 (job log) or LS12 (TO creation report)

**Table LTBK** (TR header):
- LGNUM, TRID (TR number)
- TDRTY (01=putaway, 02=picking, 03=replenish)

---

## 5. Putaway & Picking Strategies

### Putaway Strategy (LS0N)

Determines **destination bin** for incoming stock.

| Strategy | Name | Best For | Logic |
|----------|------|----------|-------|
| **00** | Fixed Bin | High-value A-items | Always same bin |
| **01** | High-Rack (ASRS) | High-bay volume | Empty level/aisle |
| **02** | Addition Strategy | Normal WM | Same bin + space, else next-empty |
| **03** | Next Empty | Flexible rack | Always first available |
| **10** | Manual | Special cases | Planner override |

### Issue: "Putaway directs to wrong bin"

**Root Cause**: Strategy misconfiguration or bin full
**Check**: LS0N → strategy assignment; SE16N → LQUA: LGMNG vs LTCAP
**Fix**: Increase capacity (LS03N) OR change strategy (LS0N) OR manual override (LT01)

### Picking Strategy (LS20)

| Strategy | Name | Use Case |
|----------|------|----------|
| **00** | Fixed Bin | Slow-movers |
| **01** | FIFO | Perishables, batch-tracked |
| **02** | LIFO | Frozen goods |
| **03** | Bulk / Open | Palletized high-volume |
| **10** | Manual | Flexible picking |

### Issue: "Picking TO shows 'No stock available' despite inventory"

**Root Cause**: Stock in wrong section or strategy mismatch
**Check**: SE16N → LQUA: locked status? Strategy allows section? SE16N → LTAP: which bins picked?
**Fix**: Move stock via TO (LT01) OR override strategy (LT01 manual) OR unlock section (LS16)

---

## 6. WM-MM Integration (Goods Receipt → Warehouse)

### Complete Flow

```
PO (ME21N) → GR (MIGO 101, MVT 101) → Material doc (MKPF/MSEG)
  ↓
If WM active: TR created (LTBK, putaway)
  ↓
Putaway strategy applied (LS0N)
  ↓
LB10 batch: TR → TO (LTAK/LTAP)
  ↓
RF execution (LT0G) → TO confirmed (LT0A)
  ↓
Stock in LQUA, available for sales/picking
```

### Config: Activate WM (LS19 - Goods Movement Parameters)

- **KZLTAP**: Auto-create TR on GR? `X` = yes
- **KZLTAU**: Auto-create TO from TR? `X` = yes (if LB10 running)
- **KZLTPE**: Two-phase picking? `X` = pick → staging → ship

### Issue: "GR posted but TR never created"

**Root Cause**: WM not activated or storage location not assigned
**Check**: LS17 (storage location assignment), OB8B (plant-WM), MIGO (warehouse field)
**Fix**: LS17 → create assignment OR repeat GR

---

## 7. WM-SD Integration (Delivery → Picking)

### Complete Flow

```
Sales Order (VA01) → Delivery (VL01N)
  ↓
Auto-create picking TR (if LPICK = X in VL0N)
  ↓
LB10: TR → picking TO (strategy 01=FIFO typical)
  ↓
RF picking (LT0G) → staging bin
  ↓
PGI (VF01) → invoice created
```

### Config: Enable Picking in Warehouse

**VL0N** (delivery type):
- **LPICK**: Picking required? `X` = yes

**OB8C** (storage location):
- **LSORT**: Use for WM? `X` = yes

### Issue: "Delivery created, picking TR not auto-created"

**Root Cause**: LPICK disabled or storage location not WM-enabled
**Check**: VL0N (LPICK flag), OB8C (LSORT flag), SE16N → LTBK (any TR created?)
**Fix**: VL0N → set LPICK = `X` → recreate delivery

---

## 8. Physical Inventory in WM (LI01N / LI02N)

### Types

| Type | T-code | Scope | Frequency |
|------|--------|-------|-----------|
| **Full** | LI01N | All warehouse stock | Annual |
| **Sample** | LI02N | Selected sections | Quarterly |
| **Cycle** | LI03N | Material/section | Monthly/continuous |

### Flow

```
LI01N (create doc) → LI04 (print sheet) → Count physical stock
  ↓
LI04 (enter results) → LI07 (post differences)
  ↓
MM doc created (401/402 MVT) → LQUA adjusted
```

### WM PI vs MM PI

| Aspect | WM (LI01N) | MM (LI01) |
|--------|-----------|---------|
| **Scope** | Warehouse bins (LQUA detail) | Storage locations (MARD) |
| **Granularity** | By bin | By location |
| **Batch/Serial** | Full detail | Batch-level |

### Issue: "Count sheet shows zero system qty but WM has stock"

**Root Cause**: LQUA (WM) ≠ MARD (MM) — movements bypassed WM
**Check**: SE16N → LQUA (sum qtys), SE16N → MARD (compare), SE16N → MSEG (recent GI)
**Fix**: LI07 (post adjustment) OR manual TO correction (LT01)

---

## 9. Decentralized WM (MWMII)

Simple warehouse management without bins/sections. Each plant manages own goods movement.

**When to use**: Multi-plant independent operations (NO bins/sections/strategies)
**When NOT to use**: Need rack control, FIFO/LIFO, RF execution → use central WM instead

**Config**: SM30 → TWMII (plant-level settings)

---

## 10. ECC WM → S/4HANA Migration

### Why WM Deprecated

**S/4HANA has NO WM module**. Replaced by:
- **Embedded EWM** (enhanced warehouse management with resource management)
- **Stock Room Management** (simplified, basic movements)

### Migration Options

| Option | Effort | Best For |
|--------|--------|----------|
| ECC WM → EWM | HIGH | Large, complex warehouses |
| ECC WM → Stock Mgmt | MEDIUM | Small, simple operations |
| Keep ECC dual-run | MEDIUM | Transition period |

### Key Differences (WM → EWM)

| ECC WM | S/4HANA EWM |
|--------|----------|
| Storage Type (LTYP) | Warehouse Process Type |
| Transfer Order (LTAK) | Warehouse Order |
| Putaway Strategy (LS0N) | Putaway Rule (different config) |
| RF (LT0G) | RF Screen (/SCWM/RFUI — new tech) |
| ❌ Adds in EWM: Resource Mgmt, Yard Mgmt, Wave picking |

**Recommendation**: Use EWM for S/4HANA (see `sap-ewm` skill). WM 1:1 not possible.

---

## 11. Korean Logistics (한국 현장)

### Typical Setup: Manufacturing / 3PL

**Warehouse tiers**:
- **생산창고** (production WH) ← factory GR
- **물류센터** (logistics center) ← distribution hub
- **반납창고** (return WH) ← defects

**필수 기능**:
- **바코드/RF 터미널**: CJ, Coupang, Samsung parts (standard)
- **팔레트 관리**: 식료품, 전자부품 (high-volume)
- **냉장/냉동**: Separate ST with capacity limits
- **선입선출 (FIFO) 강제**: 식품/의약품 — picking strategy 01 MUST be used

### Example: Korean Food Distribution WH

```
Warehouse "PJ" (plant JP01, company 1000):
  ST 01 (rack, ambient) → Sec A1-A5 (fast-movers), Sec A6-A10 (slow)
  ST 02 (cold, 2-8°C) → Sec C1-C3 (yogurt, milk, frozen)
  ST 03 (returns) → Sec R1 (defects, quarantine)

Putaway: 02 (addition + next-empty)
Picking: 01 (FIFO — regulatory requirement)
RF Terminal: Symbol/Zebra with ZMM
Inventory: Monthly cycle count (LI03)
```

---

## 12. Key References

**Primary Tables**:
- LAGP: Warehouse master
- LTYP: Storage type
- LEIN: Storage section
- LQUA: Storage bin / quant
- LTBK: Transfer requirement
- LTAK: Transfer order (header)
- LTAP: Transfer order (lines)

**Configuration T-codes**:
- LS01N: Warehouse structure
- LS0N: Putaway strategies
- LS20: Picking strategies
- LS13: Cycle count params
- LS19: WM goods movement params
- LS17: Storage location assignment

**Standard Response Format**: Issue → Root Cause → Check (T-code + table) → Fix → Prevention → SAP Note

---

**Last Updated**: 2025 | **ECC Status**: Extended Support | **S/4HANA**: Use EWM skill

