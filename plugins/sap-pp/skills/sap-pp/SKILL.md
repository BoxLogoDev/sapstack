---
name: sap-pp
description: >
  This skill handles SAP PP (Production Planning) including MRP, production orders,
  process orders, shop floor control, capacity planning, BOM management, routing,
  and PP-PI for process industries. Use when user mentions PP, MRP, MD01, MD04,
  production order, CO01, CO11N, MFBF, BOM, routing, work center, capacity,
  planned order, operation, confirmation, goods issue, backflush, MRP Live,
  MPS, demand management, scheduling, process order, PP-PI, KANBAN.
allowed-tools: Read, Grep
---

## 1. MRP (Material Requirements Planning)

### Planning Run

- **MD01** (ECC / S/4HANA): classic total planning run for the configured planning scope
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

### Lot Sizing Procedures

| Key | Description |
|-----|-------------|
| EX | Lot-for-lot (exact demand quantity) |
| FX | Fixed lot size |
| WB | Weekly lot size |
| MB | Monthly lot size |
| HB | Replenishment up to maximum stock level |

### Exception Messages (MD04)

Do not memorize a universal numeric lookup table. Interpret the exception text,
exception group, element type, requirement/receipt dates, firming state, and the
plant's rescheduling horizon/tolerance settings shown in the actual system.
An exception is a planning signal, not authorization to move or delete supply.

---

## 2. Production Order

### Lifecycle

```
CO01 (Create) → governed Release → Goods Issue (MIGO 261)
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

- Classic MRP quantity/date planning does not by itself prove finite capacity
  feasibility; evaluate and level capacity separately or use the configured detailed
  scheduling solution.
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
| pMRP | Not available | simulation capability for identifying potential capacity issues; scope/release dependent |

---

## 9. Diagnostic Response Contract

Use Quick Advisory only for a stable single fact. Use the Evidence Loop when MRP
created an unexpected proposal, a confirmation failed, ATP differs from the stock/
requirements list, automatic goods movement is stuck, or capacity is overloaded.

### 9.1 Required intake

- SAP release and deployment model
- industry and production type: discrete, repetitive, process, engineer-to-order
- plant, MRP area if used, material, production version, and planning strategy
- order/planned-order and operation where applicable
- exact message class/number and long text
- affected requirement/receipt dates, quantities, units, and time zone
- MRP run type, planning date/time, scope, processing key, and last successful run
- integration scope: QM, EWM, batch/serial, subcontracting, APO/PPDS, MES
- recent master-data, configuration, interface, or transport change

Never invent plant, material, work center, order, operation, storage location, batch,
or capacity values. Ask for the real keys or use placeholders in a template.

### 9.2 Safety boundary

- Start with display lists, logs, and simulation/evaluation.
- Never convert, reschedule, firm, release, confirm, or reprocess a document solely
  because an exception message appears.
- Before confirmation or goods-movement retry, prove the original posting state to
  avoid duplicate quantity and duplicate inventory posting.
- Master/configuration changes require a transport and regression in QA.
- Mass MRP, mass release, mass confirmation, and capacity dispatching require an
  approved selection list and stop condition.
- Every Fix must have a Rollback Plan that preserves document flow and audit trail.

### 9.3 Standard evidence answer

1. **Issue** — material/order/operation, date, quantity, exact symptom
2. **Primary Root Cause** — strongest evidence first
3. **Hypotheses** — two to four with at least two falsifiers each
4. **Check** — T-code and menu path, fields, expected observation
5. **Fix** — representative QA case before actual processing
6. **Rollback** — standard cancellation/reversal or prior master/config restore
7. **Prevention** — monitoring, ownership, master-data validation

---

## 10. MRP Exception Interpretation — `MD04`

`[T-code: MD04 | menu: SAP Easy Access > Logistics > Production > MRP >
Evaluations > Stock/Requirements List]`

`MD04` is a dynamic stock/requirements view. Read the full time-phased chain; do
not make a decision from one exception number or one line in isolation.

### 10.1 Read sequence

1. Confirm material, plant/MRP area, planning segment, and current timestamp.
2. Record available quantity at the first relevant date and identify the requirement
   that changes the projected balance.
3. Identify element category: stock, sales/PIR/dependent requirement, reservation,
   planned order, purchase requisition/order, production/process order, or transfer.
4. Compare requirement date, receipt date, opening date, start/finish date, and any
   firming indicator.
5. Open element details and document linkage; confirm whether quantity/date has
   already changed since the MRP run.
6. Read exception short text and group from the live system, then relate it to
   rescheduling horizon, tolerance, firming fence, lot size, and procurement time.
7. Compare the last planning run log and master-data change timestamp.
8. For ATP questions, switch to `CO09`; `MD04` is not a substitute for the ATP scope
   of check or confirmed-quantity view.

### 10.2 Exception families

| Family | What it signals | Required checks before action |
|---|---|---|
| Reschedule in/out | receipt date no longer aligns with net requirement | firming, vendor/production feasibility, dependent dates, tolerance horizon |
| Cancel/reduce | supply appears excessive in current planning picture | later demand, safety stock, lot size, pegged requirement, contract/order commitment |
| Create procurement proposal | shortage remains after receipts | procurement type, source, lot size, lead time, MRP controller review |
| Opening/start date in past | procurement/production should already have started | actual execution status, calendar, lead time, release/availability blocks |
| Firmed proposal exception | MRP cannot automatically adapt the firmed element | who firmed it, time fence, downstream commitment, manual change approval |
| Master-data inconsistency | planning parameter or BOM/routing/source is missing/invalid | validity dates, production version, special procurement, status, selection ID |

### 10.3 Hypothesis and falsification examples

**H1 — A firming boundary prevents MRP from correcting the receipt.**

- Supports: firming indicator exists; exception begins at/inside time fence; MRP log
  says proposal was not changed.
- Falsifies: element is unfirmed; no time fence applies; a controlled rerun changes
  the same proposal automatically.

**H2 — Lead-time/master-data dates drive the late receipt.**

- Supports: in-house/GR processing time or routing schedule reproduces the date;
  recent master change aligns with onset.
- Falsifies: scheduling log uses different valid master data; manual simulation with
  current data yields the expected date.

**H3 — Demand duplication creates an apparent shortage.**

- Supports: PIR and sales requirement coexist contrary to consumption design; the
  duplicate quantity equals the shortage.
- Falsifies: strategy and consumption correctly reduce PIR; both requirements are
  independently valid business demand.

**H4 — A receipt is absent from the planning segment.**

- Supports: receipt exists but belongs to another MRP area/special-stock segment;
  segment-specific list explains the difference.
- Falsifies: receipt and requirement are in the same segment and participate in net
  requirements calculation.

### 10.4 Fix/rollback patterns

- Date/quantity master defect: change the owned master data in development/QA,
  rerun a single-material plan, compare proposal delta; rollback the prior values
  if unrelated materials or dates shift outside the approved scope.
- Incorrect demand: correct or cancel only the source demand document through its
  business process; rollback via the source document's standard change history.
- Firmed proposal: obtain planner approval before unfirming/changing; rollback by
  restoring the prior firming/date/quantity if downstream commitments reject it.
- Configuration defect: transport the minimum change and test the same planning
  scenario plus adjacent strategies/procurement types; use a backout transport.

---

## 11. Production Confirmation Failure — `CO11N`

`[T-code: CO11N | menu: SAP Easy Access > Logistics > Production > Shop Floor
Control > Confirmation > Enter > For Operation > Time Ticket]`

### 11.1 Pre-save evidence

Before retrying, capture:

- order and operation/suboperation
- system/user status and whether the operation is confirmable
- yield, scrap, rework, unit, posting date, actual work and activity quantities
- final/partial/clear-open-reservation indicators
- personnel/work center if required by the profile
- goods-movement proposal and every message in the log
- whether a confirmation number/counter was already created

Do not simply press Save again after a timeout. First verify whether the confirmation
and any goods movements committed in the backend.

### 11.2 Failure matrix

| Symptom | Likely causes | Falsification evidence |
|---|---|---|
| Order/operation not confirmable | order not released, operation deleted/closed, sequence/control-key rule | active releasable status and same operation accepts a zero-save display simulation |
| Quantity exceeds open quantity | prior/parallel confirmation, unit conversion, final confirmation | open quantity and confirmed counters support the entered amount |
| Posting period error | posting date outside MM/FI/CO open interval | all relevant periods are open for the exact date and error persists |
| Activity valuation error | cost center/activity type validity or price missing | correct valid assignment/price exists for posting date and controlled confirmation succeeds |
| Goods movement error on save | component/batch/storage/EWM/account determination issue | confirmation without that proposed movement still fails with identical message |
| Lock/update timeout | parallel user/job or update failure | no lock/update error exists and issue reproduces serially in QA |

### 11.3 Safe fix and rollback

1. Confirm current backend state and identify whether only confirmation, only goods
   movement, both, or neither posted.
2. Fix the confirmed root cause in its owning domain: PP status/quantity, MM stock/
   batch, FI period/account, CO activity, EWM queue, or Basis update issue.
3. Repeat with the smallest valid quantity in QA or a designated test order.
4. Reconcile confirmation counter, order progress, component consumption, GR, and
   activity posting.
5. If the confirmation itself is wrong, use the standard confirmation cancellation
   process and verify its reversal documents before entering a corrected confirmation.
6. If only an automatic goods movement failed, do not cancel a correct confirmation
   by default; follow the `COGI` reprocessing path below.

Rollback is the standard cancellation/reversal tied to the exact confirmation and
material documents. Never delete confirmation records or material documents in a
table browser.

---

## 12. Automatic Goods Movement Errors — `COGI`

`[T-code: COGI | menu: SAP Easy Access > Logistics > Production > Shop Floor
Control > Confirmation > Reprocessing > Automatic Goods Movements]`

`COGI` holds/reprocesses failed automatic goods movements from confirmation-related
processing. It is not a generic inventory correction queue.

### 12.1 Read-only triage

1. Select the narrowest authorized plant/date/order scope and export the error list.
2. Record order, operation, material, movement direction/type, quantity/unit,
   storage location, batch/special stock, and exact message.
3. Check whether the confirmation exists and whether any material document already
   posted for the same business event.
4. Group errors by root cause rather than correcting each row independently.
5. Confirm whether the required stock/master/config/interface state has changed
   since the failed attempt.

### 12.2 Common root causes

- insufficient or wrong stock segment
- missing/invalid storage location or batch determination
- batch/serial/HU requirement not satisfied
- posting period closed
- material/account determination or valuation error
- EWM-managed location integration/queue failure
- unit-of-measure conversion or component master inconsistency
- duplicate/parallel processing lock

### 12.3 Reprocess control

- Correct the source master/config/stock/interface cause first.
- Reprocess a single representative entry and verify its material document.
- Check reservation reduction, order component consumption, stock and accounting.
- Expand to the approved group only after the representative case reconciles.
- Stop if a duplicate material document, unexpected batch, wrong quantity, or new
  account assignment appears.
- Rollback with the standard material-document reversal and, if needed, confirmation
  cancellation in dependency order; never remove queue rows just to clear the list.

---

## 13. ATP Evidence — `CO09` vs `MD04`

`[T-code: CO09 | menu: SAP Easy Access > Logistics > Sales and Distribution >
Sales > Environment > Availability > Availability Overview]`

`CO09` evaluates ATP according to the selected checking rule, scope of check,
organizational/special-stock level, and whether requirements are included. It can
show confirmed quantities that `MD04` is not designed to explain as ATP evidence.

### 13.1 Required comparison

| Input | `CO09` | `MD04` |
|---|---|---|
| Material/plant/MRP area | must match ATP check context | must match planning segment |
| Checking rule/scope | determines included receipts/issues and horizon | not an ATP scope-of-check simulation |
| Special stock | sales order/WBS/consignment context may be required | displayed in its planning segment |
| Dates | ATP date/confirmed schedule-line interpretation | time-phased requirement/receipt dates |
| Result | ATP quantity and confirmations | projected stock/requirements picture |

### 13.2 Hypotheses

- **Different scope of check**: supported when an element appears in `MD04` but is
  excluded by the active checking rule; falsified when scope includes it and ATP
  still ignores the element for another documented reason.
- **Different organizational/special-stock level**: supported when stock exists in
  another segment; falsified when the exact segment has sufficient eligible stock.
- **Stale or shifted receipt**: supported when the receipt failed/was rescheduled;
  falsified when it is firm, ATP-relevant, and available before requirement date.
- **Existing confirmation consumes ATP**: supported when confirmed issues account
  for the difference; falsified when no relevant confirmation exists.

Do not “fix ATP” by altering stock or confirmations without tracing the originating
document and checking rule.

---

## 14. Capacity Load Diagnosis — `CM01`

`[T-code: CM01 | menu: SAP Easy Access > Logistics > Production > Capacity
Planning > Evaluation > Work Center View > Load]`

`CM01` is a work-center load evaluation. It compares capacity requirements with
available capacity using the selected overall/evaluation profiles and horizons; it
does not itself prove that MRP planned finitely.

### 14.1 Read sequence

1. Confirm plant, work center, capacity category, hierarchy if used, and selection
   and evaluation periods.
2. Verify available-capacity intervals, factory calendar, shift sequence, breaks,
   utilization, number of individual capacities, and unit.
3. Drill into capacity requirements and identify planned/production/process/project/
   maintenance orders contributing load.
4. Verify scheduling and capacity formulas, standard values, operation dates,
   splits, and distribution keys.
5. Separate dispatched from undispatched requirements and backlog.
6. Compare the same work center/profile/date selection with the last known-good run.
7. Only then simulate leveling or master-data correction in QA.

### 14.2 Capacity hypotheses and falsifiers

| Hypothesis | Supports | Falsifies |
|---|---|---|
| Available capacity calendar is wrong | shift/calendar delta matches overload start | intervals and calendar match approved roster |
| Routing standard value/formula overstates load | one operation contributes disproportionate requirement | formula and confirmed runtime reproduce approved load |
| Duplicate/obsolete order requirement remains | duplicate order/operation appears in detail | each requirement maps to a valid unique demand |
| Evaluation profile/horizon hides or inflates picture | alternate approved profile changes aggregation only | raw detail and capacity totals remain inconsistent |
| MRP was assumed finite | dates are feasible materially but overload remains | configured detailed scheduling already dispatched feasibly |

### 14.3 Fix/rollback patterns

- Calendar/shift error: correct owned capacity intervals with effective dates,
  transport where configuration applies, and restore the prior interval if labor/
  machine availability reconciliation fails.
- Routing/formula error: change master data under engineering approval, reschedule a
  representative order, and restore the previous change number/version if impact
  extends beyond the approved materials.
- Order priority/date decision: simulate leveling, obtain planner/shop-floor approval,
  then dispatch through the configured tool; rollback by restoring prior operation
  dates/dispatch state if dependent material or delivery commitments break.

---

## 15. ECC / S/4HANA / Public Cloud Boundary

| Topic | ECC 6.0 | S/4HANA On-Premise/Private | Public Cloud |
|---|---|---|---|
| MRP engine | classic MRP | MRP Live plus fallback/scope rules by release | released MRP apps/jobs |
| Stock/requirements | `MD04` classic list | `MD04` plus Fiori monitoring by scope | released monitor apps |
| Confirmation | classic GUI confirmation | GUI/Fiori/API depending scenario | released confirmation apps/APIs |
| Goods-movement reprocessing | `COGI` | `COGI`/released app depending scope and EWM integration | released reprocessing app |
| Capacity | classic evaluation/leveling | classic and/or Fiori/PPDS options | released capacity scheduling apps |
| ATP | classic ATP with checking rule | aATP may be active for supported scenarios | released aATP scope/apps |

Always name the actual ATP and detailed-scheduling solution. Do not assume that
S/4HANA means aATP or embedded PP/DS is active.

---

## 16. Anti-Patterns and Operator Checklist

### Anti-patterns

- ❌ interpret an `MD04` exception number without its live text/group/context
- ❌ treat `MD04` projected availability as an ATP confirmation answer
- ❌ retry `CO11N` after timeout without checking commit state
- ❌ clear a `COGI` row without correcting and reconciling its source cause
- ❌ infer finite capacity feasibility from a successful MRP run
- ❌ change work-center calendar or routing time directly in production
- ❌ reprocess a mass queue before a single representative case reconciles
- ❌ update planning, confirmation, or material-document tables directly

### Operator checklist

- [ ] Release, deployment, production type, plant/MRP area confirmed
- [ ] Exact object keys, dates, quantities, units, and message captured
- [ ] Last successful run and change delta identified
- [ ] At least two falsifiers per hypothesis
- [ ] `MD04`, `CO09`, `CO11N`, `COGI`, or `CM01` evidence uses the correct context
- [ ] Posting state checked before retry/reprocess
- [ ] ECC/S/4/Public Cloud and ATP/scheduling scope stated
- [ ] Master/config change has transport or governed master-data workflow
- [ ] QA representative case and regression scope passed
- [ ] Fix paired with standard cancellation/reversal or prior-state restoration
