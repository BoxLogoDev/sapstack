---
name: sap-pp
description: >
  This skill handles SAP PP (Production Planning) including MRP, production orders,
  process orders, shop floor control, capacity planning, BOM management, routing,
  and PP-PI for process industries. Use when user mentions PP, MRP, MD01, MD04,
  production order, CO01, CO11N, MFBF, BOM, routing, work center, capacity,
  planned order, operation, confirmation, goods issue, backflush, MRP Live,
  MPS, demand management, scheduling, process order, PP-PI, KANBAN.
---

## 1. MRP (Material Requirements Planning)

### Planning Run

- **MD01** (ECC / S/4HANA): classic MRP run → plant-level or single material
- **MD01N** (S/4HANA): MRP Live → HANA-optimized, faster, recommended
- **MD02**: single-item, multi-level MRP (for testing / selective re-planning)
- **MD03**: single-item, single-level

### MRP Types (Material Master MRP 1 view)

| Type | Description |
|------|-------------|
| PD | MRP — demand-driven (standard) |
| VB | Manual reorder point |
| VM | Automatic reorder point |
| ND | No MRP |
| MF | Make-to-order (individual requirements) |

### Lot Sizing Procedures

| Key | Description |
|-----|-------------|
| EX | Lot-for-lot (exact demand quantity) |
| FX | Fixed lot size |
| WB | Weekly lot size |
| MB | Monthly lot size |
| HB | Replenishment up to maximum stock level |

### Exception Messages (MD04)

| Exception | Meaning | Action |
|-----------|---------|--------|
| 10 | Reschedule in | Move order earlier |
| 15 | Reschedule out | Push order later |
| 20 | Firm planned order — reschedule | Evaluate manually |
| 25 | Surplus | Cancel or reduce |
| 30 | New order required | Convert planned order |

---

## 2. Production Order

### Lifecycle

```
CO01 (Create) → Release (CO02 / KOAB batch) → Goods Issue (MIGO 261)
→ Confirmation (CO11N) → Final Confirmation → TECO (technically complete)
→ Settlement (KO88) → CLSD (closed)
```

### Key T-codes

| T-code | Description |
|--------|-------------|
| CO01 | Create production order |
| CO02 | Change production order |
| CO03 | Display production order |
| CO11N | Production order confirmation |
| CO13 | Cancel confirmation |
| CO24 | Missing parts list (component shortage) |
| COOIS | Production order information system |
| MIGO | Goods issue (261) / GR (101) for order |

### Goods Issue

- Manual: MIGO → movement type 261 → production order number
- Backflush: CO11N → backflush checkbox → automatic at confirmation
- Partial GI: allowed — tracks remaining requirements in MD04

### Settlement

- KO88: individual order → settlement to: cost center / G/L / material (product cost collector)
- KO8G: collective settlement → mass processing
- Always simulate first → check receivers and amounts before actual posting
- Variance categories: input price / input quantity / output price / output quantity / remaining input

---

## 3. Process Orders (PP-PI)

Used in: chemical, pharmaceutical, food & beverage industries

| T-code | Description |
|--------|-------------|
| COR1 | Create process order |
| COR2 | Change process order |
| COR6N | Process order confirmation |
| CORK | PI sheet (process instruction) execution |
| CORZ | Process order scheduling |

Process instructions (PI sheets): define what operators enter during production
Master recipe (C201): replaces routing for process industries

---

## 4. BOM Management

### Key T-codes

| T-code | Description |
|--------|-------------|
| CS01 | Create BOM |
| CS02 | Change BOM |
| CS03 | Display BOM |
| CS11 | BOM explosion (multi-level) |
| CS14 | BOM comparison |
| CS15 | Where-used list |

### BOM Usages

| Usage | Description |
|-------|-------------|
| 1 | Production |
| 2 | Engineering / design |
| 3 | Universal |
| 5 | Sales |
| 6 | Costing |

- Alternative BOMs: same material, multiple production methods (alt. 1, 2, 3...)
- Selection method: MRP 4 view → BOM explosion / selection method

---

## 5. Routing and Work Centers

**Work Center (CR01 / CR02)**
- Define: capacity category, available capacity, costing formulas, scheduling formulas
- Capacity: CR11 → available capacity per shift (machine / labor)

**Routing (CA01 / CA03)**
- Operations: sequence → work center → standard values (setup / machine / labor time)
- Control key: determines: confirmation required / goods movement / costing / scheduling

**Reference Operation Sets (CA11)**
- Reusable operation templates → assign to multiple routings

---

## 6. Capacity Planning

| T-code | Description |
|--------|-------------|
| CM01 | Capacity load overview (work center) |
| CM21 | Capacity leveling (interactive) |
| CM50 | Variable capacity planning |
| CM99 | Scheduling overview |

- Finite scheduling: material's MRP considers capacity constraints
- Infinite scheduling: MRP ignores capacity → capacity leveling done separately
- Bottleneck analysis: CM50 → identify overloaded work centers

---

## 7. Demand Management

- MD61: planned independent requirements (make-to-stock strategy)
- MD62: change planned independent requirements
- Strategy group (MRP 3 view): determines how sales orders consume PIRs
  - Strategy 10: make-to-stock (no individual requirements)
  - Strategy 20: make-to-order (each order = separate production)
  - Strategy 40: planning with final assembly

---

## 8. S/4HANA PP Changes

| Feature | ECC | S/4HANA |
|---------|-----|---------|
| MRP run | MD01 | MD01N (MRP Live) recommended |
| MRP performance | Slower (sequential) | Parallel HANA-based |
| Exception handling | MD04 list | Enhanced exception management |
| Scheduling board | CM21 | Production Scheduling Board (Fiori) |
| Shop floor | COOIS | Manufacturing Execution Fiori apps |
| eWM integration | External WM | Embedded eWM (same system) |
| pMRP | Not available | Predictive MRP (AI-based exception detection) |
