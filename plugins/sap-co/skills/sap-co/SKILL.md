---
name: sap-co
description: >
  This skill handles all SAP CO (Controlling) topics: cost center accounting,
  profit center accounting, internal orders, product costing, profitability
  analysis (CO-PA), assessment and distribution cycles, actual vs plan postings,
  settlement, and CO period-end closing. Use when user mentions CO, cost center,
  profit center, internal order, KSU5, KSV5, KO88, CK11N, CO-PA, COPA, assessment,
  distribution, settlement, variance, controlling area, allocation cycle, activity type,
  KSB1, KSB5, cost element, plan vs actual, product cost collector.
allowed-tools: Read, Grep
---

## 1. Environment Questions

Ask before answering:

- Controlling area (KOKRS) — single or cross-company code?
- Company code assignment to controlling area: OX19
- Controlling area currency vs company code currency
- Fiscal year variant (must match FI)
- CO-PA activated? If yes: costing-based, account-based, or both?
- Material Ledger foundation active? S/4HANA에서는 inventory valuation의 기반이며,
  actual costing run 활성화 여부는 별도로 확인한다.

---

## 2. Cost Center Accounting (CCA)

### Period-End Sequence

1. Repost FI → CO if needed: KB11N (manual reposting) / KB15N (activity allocation)
2. Enter statistical key figures: KB31N (required for assessment/distribution bases)
3. Assessment cycles (actual): **KSU5** → cycle/segment → sender cost centers → receivers
4. Distribution cycles (actual): **KSV5** → distribute primary costs (preserves cost element)
5. Indirect activity allocation: KB65 (if applicable)
6. Variance analysis: S_ALR_87013611

### Cycle Configuration

- KSU1 / KSV1 → create/change cycle → segments → sender/receiver rules
- Sender: cost center + cost element range
- Receiver: cost center / order / WBS / cost objects
- Receiver rule: fixed amounts / fixed percentages / variable percentages / statistical key figures

### Common Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "No valid receiver found" | Receiver in cycle not active or no postings | Check cycle segment receiver list: KSU1 |
| "Period already closed for CO" | CO period locked | OKP1 → open period for controlling area |
| "CO document not generated" | account assignment, real/statistical object, integration setting 불일치 | 원천 FI 문서와 CO line item을 read-only로 대조하고 release별 reconciliation 절차 확인 |
| "Sender has no costs" | Nothing posted to sender cost center | KB11N or check primary cost posting |

---

## 3. Profit Center Accounting (PCA)

### ECC vs S/4HANA

| Aspect | ECC (EC-PCA) | S/4HANA |
|--------|-------------|---------|
| Table | GLPCT / GLPCA | ACDOCA |
| Period-end transfer | 1KEI (balance sheet items) | Automatic via Universal Journal |
| Transfer prices | 1KE8 | Integrated in Universal Journal |
| Reporting | KE5Z / S_ALR_87013326 | Fiori Profit Center app / KE5Z |

### Profit Center Derivation

- `OKB9`는 cost element별 default CO account assignment에 쓰이며 profit center의
  일반 default 도구로 단정하지 않는다.
- Material master → Costing 2 view → profit center
- Sales order item의 profit center는 material/plant 및 configured substitution 등
  실제 derivation trace로 확인한다.
- Manual entry 허용 여부는 field status, substitution, validation과 권한에 따라 다르다.

---

## 4. Internal Orders

### Order Lifecycle

```
Create (KO01) → governed release → Post costs → Settle (KO88) → TECO → Close status
```

### Configuration

- Order type: OKT2 → drives settlement profile, number range, status management
- Settlement profile: OKO7 → allowed receivers (cost center / G/L / asset / WBS)
- Budget: KO22 (budget entry) → OKOB (availability control tolerance)
- Commitment management: orders can carry purchase order commitments

### Settlement (KO88)

- KO88: individual order settlement
- Always simulate first (test run)
- Settlement rule: inspect the sender master from the settlement context; maintain
  receivers and percentages only through the approved master-data process

### Common Errors

| Error | Fix |
|-------|-----|
| "Order is locked" | Inspect sender system/user status; request governed release only when business prerequisites are met |
| "No settlement rule defined" | Inspect sender settlement data; create the approved receiver rule through the master-data owner |
| "Receiver not valid" | Check settlement profile allows this receiver type |
| "Budget exceeded" | KO22 → increase budget or KO26 (supplement) |

---

## 5. Product Costing (CO-PC)

### Standard Cost Estimate Flow

```
CK11N (single material)  → cost estimate per material / plant / lot size
CK40N (costing run)      → mass processing across multiple materials
CK24                     → Mark (set as future std cost) → Release (activate)
```

### Configuration Elements

- Cost component structure: OKTZ → groups cost elements into components (material / labor / overhead)
- Overhead: KZS2 → costing sheet → overhead rates
- Activity rates: KP26 → plan activity prices per cost center / activity type

### Common Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "No valid price found" | Missing purchase info record or activity rate | ME11 (info record) or KP26 (activity price) |
| "BOM not found" | BOM not created or not assigned to plant | CS01 / CS03 → check usage = 1 (production) |
| "Routing not found" | No routing for material/plant | CA01 → create routing |
| "Costing variant not assigned" | Plant not assigned to costing variant | OKKN → costing variant → valuation |

---

## 6. CO-PA (Profitability Analysis)

### Types

- **Account-based PA**: uses G/L accounts directly → S/4HANA default → ACDOCA
- **Costing-based PA**: uses value fields → configured SD condition/value-field transfer와
  operating concern의 segment-level line items

### Key Configuration

- Characteristic derivation은 operating concern의 derivation strategy와 trace를 기준으로
  검증하며, condition/value-field assignment와 혼동하지 않는다.
- SD → costing-based CO-PA transfer는 billing condition과 value field assignment,
  transfer status를 함께 확인한다.
- Planning은 시스템 release와 활성 planning framework에 따라 classic planning 또는
  `KEPM` planning framework를 사용한다.

### Reporting

- KE30: report painter → custom PA reports
- KE24: line item display → drill down by characteristic
- KE5T: profitability segment display

### S/4HANA CO-PA Notes

- Account-based PA is the primary approach (costing-based is optional add-on)
- Universal Journal (ACDOCA) is the single source → no separate CO-PA tables needed for account-based
- Real-time derivation: profitability characteristics derived at time of posting

---

## 7. S/4HANA CO Changes

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| Primary cost tables | COSP / COSS | ACDOCA |
| Profit center accounting | GLPCT / GLPCA | ACDOCA |
| Profit center | classic PCA/ledger와 account assignment에 따라 저장 | Universal Journal derivation 중심; 모든 posting에 무조건 수동 입력이라고 단정 금지 |
| Segment reporting | FAGLFLEXT | ACDOCA |
| Material Ledger | Optional | Mandatory |
| Actual costing | Material Ledger 활성 범위에서 선택 | Material Ledger foundation과 별개로 actual costing은 활성 범위에서 실행 |
| CO-PA (account-based) | Optional | Default / primary |

---

## 8. Diagnostic Response Contract

For a single fact question, use Quick Advisory. For settlement failure, allocation
variance, missing CO-PA value, or period-end imbalance, use the Evidence Loop.

### 8.1 Required intake

Collect these facts before proposing a configuration change:

- SAP release and feature pack/year
- deployment: ECC On-Premise, S/4HANA On-Premise/Private, or Public Cloud
- industry and controlling design: controlling area, currencies, fiscal-year variant
- affected period, ledger/version, actual or plan, and close calendar stage
- sender object type and receiver object type
- exact message class/number and the full run log
- whether the issue is isolated to one object or reproducible for the same rule
- last successful period/run and transports moved since that point

Never invent company codes, cost elements, cost centers, orders, WBS elements,
profitability segments, or cycle names. Use the values supplied in the evidence.

### 8.2 Safety boundary

- Start with display/report/log evidence and a Test Run.
- A configuration or master-data correction requires a transport strategy and QA proof.
- A mass allocation or settlement rerun requires an impact list and duplicate-posting check.
- Never change totals or line items directly in a table browser.
- A Fix is incomplete without a matching Rollback Plan.
- Public Cloud uses released apps and configuration activities for the selected scope.

### 8.3 Standard answer shape

1. **Issue** — object, period, scope, exact symptom
2. **Primary Root Cause** — strongest evidence first
3. **Alternative Hypotheses** — two to four, each with at least two falsifiers
4. **Check** — T-code plus menu path, selection values, fields, expected result
5. **Fix** — sandbox/QA first, owner and transport
6. **Rollback** — reversal or prior configuration restoration, stop condition
7. **Prevention** — close checklist, ownership, reconciliation control

---

## 9. Settlement Failure Playbook — `KO88` and `CJ88`

Settlement diagnosis begins by separating the sender object. Internal orders and
projects can share settlement concepts, but status, source structures, results
analysis, and receiver rules are not interchangeable.

### 9.1 Safe entry points

| Sender | Action | T-code and menu path | First evidence |
|---|---|---|---|
| Internal order | individual settlement | `KO88` — SAP Easy Access > Accounting > Controlling > Internal Orders > Period-End Closing > Single Functions > Settlement > Individual Processing | Test Run log, sender balance, rule, period |
| Project/WBS | individual settlement | `CJ88` — SAP Easy Access > Accounting > Project System > Financials > Period-End Closing > Single Functions > Settlement | Test Run log, WBS status, results-analysis dependency, rule |

Always capture the Test Run selection screen and complete message log. A green
technical completion with zero settled value is not proof that the business result
is correct.

### 9.2 Evidence sequence

1. Confirm sender object, controlling area, fiscal year, period, settlement type,
   processing type, and posting date from the run log.
2. From the `KO88` sender context, open the linked sender master in display mode and
   inspect system/user status, settlement rule, validity, distribution percentages/
   equivalence numbers, receiver category, and full/periodic settlement type.
3. For a project sender, use `CJ88` in Test Run and compare the WBS/project status,
   results-analysis requirement, and settlement rule captured by the PS owner.
4. Reconcile sender actual balance by cost element and period. Distinguish a true
   zero balance from excluded costs, already-settled values, commitments, and plan.
5. Verify posting periods in both FI and CO; do not open a period only to suppress
   an error without close-owner approval.
6. Verify the settlement profile, allocation/source structure, PA transfer structure,
   and receiver master validity for the sender's order/project type.
7. Execute the identical selection as Test Run in QA with representative data.
8. Only after expected debit/credit, profitability characteristics, and document date
   are reconciled may the approved actual run be scheduled.

### 9.3 Hypothesis matrix

| Hypothesis | Supporting evidence | Falsification evidence |
|---|---|---|
| Settlement rule missing or invalid for the period | log names rule/receiver; rule validity misses posting period | valid rule covers the period and the same sender settles in QA |
| Sender status blocks processing | sender is not released/technically complete as required; status-specific message | allowed status is active and another sender with the same status fails differently |
| Source/allocation structure misses a cost element | unsettled balance remains on a specific cost element; log reports unassigned source | every residual cost element is assigned and Test Run maps it to a receiver |
| Receiver is invalid or closed | receiver validity/status error; master end date precedes posting date | receiver accepts a controlled posting in the same period and rule points to that exact receiver |
| Period or posting-date mismatch | FI/CO period error or posting date outside allowed interval | both periods are open for the authorized interval and error persists unchanged |
| Prior settlement/reversal state explains zero value | prior document flow equals sender value; reversal log exists | no prior settlement document exists and unsettled actual balance is nonzero |

Each hypothesis needs at least two concrete observations. Do not confirm a cause
from message text alone when the same message can be raised by status, validity,
or source-structure errors.

### 9.4 Fix and rollback pairs

| Confirmed cause | Fix in development/QA | Rollback |
|---|---|---|
| Rule missing/invalid | maintain the approved receiver and validity in sender master, then Test Run | restore the prior rule snapshot; stop processing affected senders |
| Profile/structure mapping gap | change configuration through a transport and prove one representative sender | import the approved backout transport or restore prior assignment, then rerun Test Run |
| Closed/invalid receiver | correct business validity/status through its owning process | restore prior validity/status if downstream reconciliation fails |
| Period mismatch | close owner authorizes the minimum opening window and posting date | close the temporary window immediately after controlled run and reconcile documents |
| Duplicate/incorrect settlement | use the standard settlement reversal for the exact document and period | if reversal preconditions are not met, stop and obtain FI/CO change approval |

Do not compensate an incorrect settlement with an unexplained manual FI posting.
Preserve the original document chain and audit trail.

### 9.5 Project-specific `CJ88` checks

- Determine whether the affected WBS is an account-assignment element and whether
  its status permits settlement.
- Establish whether results analysis must run before settlement for this project type.
- Confirm settlement profile and allocation structure from the project profile and
  object-specific rule; do not copy assumptions from internal orders.
- For assets under construction or final-asset settlement, verify capitalization date,
  receiver readiness, and full/periodic settlement semantics with FI-AA.
- If a hierarchy has multiple account-assignment WBS elements, reconcile each sender;
  a successful parent selection does not prove every lower object settled.

---

## 10. CO-PA Mapping and Planning — `KEI1` and `KEPM`

First identify whether the question concerns Margin Analysis/account-based CO-PA,
costing-based CO-PA, or both. A value-field mapping answer is not automatically
applicable to account-based actuals in the Universal Journal.

### 10.1 PA transfer structure with `KEI1`

`[T-code: KEI1 | menu: SPRO > Controlling > Profitability Analysis > Flows of
Actual Values > Order and Project Settlement > Define PA Transfer Structure]`

The PA transfer structure groups source cost elements or source assignments and
maps them to costing-based CO-PA value fields for relevant settlement flows.

Read-only diagnosis before change:

1. Identify the exact transfer structure used by the sender's settlement profile.
2. Compare the residual/source cost element with assignment-line coverage.
3. Verify that ranges/groups do not overlap in a way that creates ambiguous mapping.
4. Check the target value field and fixed/variable treatment against the operating
   concern definition.
5. Trace one settlement document to CO-PA line-item evidence; do not infer mapping
   solely from the customizing screen.
6. For Margin Analysis, reconcile the G/L account and profitability characteristics
   in the Universal Journal rather than forcing a value-field interpretation.

Any `KEI1` change is configuration: capture before/after evidence, use a transport,
run regression settlement in QA, and include every affected sender type in scope.

#### Mapping hypothesis example

- **Hypothesis**: the source cost element is outside the assignment line used by the
  active settlement profile.
- **Supports**: residual value equals that source; Test Run says source assignment is
  missing; active profile points to the inspected transfer structure.
- **Falsifies**: the exact source is covered without overlap; Test Run maps it to the
  expected value field; the same transport level succeeds for a comparable sender.
- **Fix**: add the approved source-to-target assignment in development, transport to
  QA, and repeat settlement plus CO-PA reconciliation.
- **Rollback**: restore the previous transfer structure with a backout transport and
  reverse only documents produced by the failed controlled test.

### 10.2 Planning framework with `KEPM`

`[T-code: KEPM | menu: SAP Easy Access > Accounting > Controlling > Profitability
Analysis > Planning > Planning Framework]`

The planning framework organizes planning levels, packages, and parameter sets.
When plan data is missing or not editable, inspect in this order:

1. operating concern and planning type/framework selected by the release
2. plan version, fiscal year/period, currency and valuation view
3. planning level characteristics and package restriction
4. parameter-set method and layout assignment
5. user authorization and personalization/profile assignment
6. lock ownership and concurrent planning process
7. actual-versus-plan reporting selection and zero suppression

Do not treat `KEPM` as the universal planning route for every S/4HANA or Public
Cloud scope. Confirm whether classic CO-PA planning remains in use, or whether the
customer uses an approved planning product/app and integration flow.

#### Planning falsification pattern

| Candidate | Supports | Falsifies |
|---|---|---|
| Package restriction excludes segment | excluded characteristic is outside package selection | segment is inside active package and visible to another authorized user |
| Wrong version/period | data exists in a different version/period | selected version/period contains the same records in a read-only report |
| Authorization gap | trace denies planning object/activity | user has required authorization and identical access works in the same client |
| Lock conflict | lock owner/time aligns with failure | no lock exists and failure reproduces in an isolated QA session |

---

## 11. Cost Element Master — ECC vs S/4HANA

### 11.1 ECC

`[T-code: KA01 | menu: SAP Easy Access > Accounting > Controlling > Cost Element
Accounting > Master Data > Cost Elements > Individual Processing > Create Primary]`

- Primary cost elements correspond to relevant FI G/L accounts and have validity
  and a cost-element category in the controlling area.
- Secondary cost elements represent internal CO value flows and are not treated as
  ordinary externally postable expense accounts.
- Before creation, confirm chart-of-accounts account, controlling-area assignment,
  validity start, category, quantity recording, and default assignment design.
- Master-data creation is not a workaround for incorrect automatic account
  determination; resolve ownership with FI and CO.

### 11.2 S/4HANA On-Premise/Private

`[T-code: FS00 | menu: SAP Easy Access > Accounting > Financial Accounting >
General Ledger > Master Records > G/L Accounts > Individual Processing > Centrally]`

- Cost elements are represented as a type of G/L account; separate classic cost
  element maintenance is replaced by G/L account maintenance for this purpose.
- The G/L account type and cost element category determine primary/secondary CO use.
- Validate chart-of-accounts data, company-code data where applicable, controlling
  attributes, and transport/master-data governance together.
- A secondary-cost account requires the correct internal allocation/settlement
  category; do not make it externally postable just to clear an error.

### 11.3 Public Cloud

Use the released Manage G/L Account/Chart of Accounts app and configuration
activity for the customer's scope. Do not prescribe classic GUI maintenance if it
is not released. Provide the app name plus the in-app navigation path.

### 11.4 Failure diagnosis

| Symptom | Likely cause | Evidence | Safe correction |
|---|---|---|---|
| account requires CO object | primary-cost account/category and field-status rule | posting line, account master, validation log | supply the real business object or correct governed account design |
| account not valid as settlement cost element | wrong category or source-structure gap | settlement log and account category | correct category/design through owned change process; Test Run |
| allocation produces no secondary posting | assessment cost element/category missing or invalid | cycle segment and account master | correct segment/category in development and regression-test |
| ECC works, S/4 fails after conversion | separate cost element assumptions remain | simplification item, converted G/L master, posting trace | align G/L/cost-element attributes and custom code |

---

## 12. Assessment and Distribution — `KSU5` / `KSV5`

### 12.1 Business distinction

- **Assessment (`KSU5`)** credits senders and debits receivers with configured
  secondary assessment cost elements; original primary cost-element detail is
  summarized according to cycle design.
- **Distribution (`KSV5`)** allocates eligible primary costs while preserving the
  original primary cost element on receivers.
- Choose based on reporting and allocation design, not because one transaction
  completed faster in a prior period.

### 12.2 Execution paths

`[T-code: KSU5 | menu: SAP Easy Access > Accounting > Controlling > Cost Center
Accounting > Period-End Closing > Single Functions > Allocations > Assessment]`

`[T-code: KSV5 | menu: SAP Easy Access > Accounting > Controlling > Cost Center
Accounting > Period-End Closing > Single Functions > Allocations > Distribution]`

Required sequence for either run:

1. Record controlling area, cycle, start date, fiscal year, period, version, and
   processing options from the selection screen.
2. Run Test Run with detail lists enabled and archive/export the sender/receiver log.
3. Reconcile sender input value to allocated, unallocated, and excluded values.
4. Validate tracing factor base at the same key date and period as the run.
5. Inspect segment order, sender rule, receiver rule, percentages/parts, and locks.
6. Confirm the run has not already posted or been reversed for that cycle/period.
7. In QA, compare expected and actual receiver totals before approving production.
8. Execute actual only in the close-owner window, then reconcile the generated CO
   documents and close checklist control total.

### 12.3 Common hypotheses and falsifiers

| Hypothesis | Supporting evidence | Falsification evidence |
|---|---|---|
| Sender has no eligible actual cost | sender detail is zero after cost-element filter | eligible line items exist in the exact period/version and cycle includes them |
| Tracing factor is zero/missing | receiver base report is zero or not posted by cutoff | valid base exists with the same key date and receiver selection |
| Receiver selection excludes intended object | receiver absent from detailed Test Run list | receiver is listed and receives a nonzero calculated share |
| Segment overlap/order changes result | same sender appears in earlier segment and residual changes | isolated QA run with reordered/non-overlap design yields same result |
| Prior run causes duplicate/zero residual | posted run/document exists for cycle-period | no run record exists and sender balance remains untouched |
| Assessment cost element invalid | `KSU5` log points to category/master issue | category and validity are correct and controlled posting succeeds |

### 12.4 Fix/rollback patterns

- Missing statistical key figure or tracing basis: post/correct the governed basis
  through its normal business process, rerun Test Run, and reverse that basis entry
  if approval is withdrawn.
- Cycle selection/design defect: change the cycle in development with transport,
  compare before/after control totals in QA, and restore the prior cycle transport
  if receiver variance exceeds the agreed tolerance.
- Duplicate actual run: do not rerun. Use the standard cycle reversal for the exact
  run identity after confirming no dependent close step has consumed it.
- Period lock: obtain close-owner approval for the narrow interval; restore the lock
  immediately after reconciliation.

---

## 13. CO Close Dependency Order

Use the customer's close design, but establish these dependencies before execution:

1. FI/MM/SD source postings and corrections reach the cutoff.
2. Activity quantities, prices, and statistical key figures are complete.
3. Repostings and direct/indirect activity allocations are reconciled.
4. Distribution and assessment cycles complete in the approved order.
5. Results analysis, variance, and settlement run for relevant cost objects/projects.
6. CO-PA/Universal Journal receiver values are reconciled.
7. Material Ledger actual costing runs only if activated and scheduled in scope.
8. CO period lock follows signed control totals and exception approval.

Do not copy this as a universal job chain: order dependencies can vary by product
costing, project accounting, intercompany, ledger, and industry design.

---

## 14. ECC / S/4HANA / Public Cloud Boundary Matrix

| Topic | ECC 6.0 | S/4HANA On-Premise/Private | Public Cloud |
|---|---|---|---|
| Actual line-item foundation | classic CO totals/line-item tables plus FI reconciliation | Universal Journal is central; compatibility views may exist | released analytical apps/APIs |
| Cost element master | separate cost element maintenance | G/L account includes cost-element category | released G/L apps/configuration |
| Profitability actuals | account-based and/or costing-based by design | Margin Analysis/account-based is primary; costing-based can coexist by scope | released Margin Analysis scope/apps |
| Planning | classic CO/CO-PA tools possible | classic tools depend on scope; modern planning integration may be used | released planning integration/apps |
| Profit center | classic PCA/new G/L design dependent | derived into Universal Journal based on account assignment | released derivation/configuration |
| Material Ledger | optional by valuation design | inventory valuation foundation required; actual costing activation separate | scope/configuration dependent |

When behavior differs, state the selected column explicitly. Never present a
compatibility view as proof that the old persistence/update model is unchanged.

---

## 15. Anti-Patterns and Operator Checklist

### Anti-patterns

- ❌ run `KO88`, `CJ88`, `KSU5`, or `KSV5` actual without Test Run
- ❌ open FI/CO periods broadly to make an error disappear
- ❌ add a receiver or cost element without confirming the active profile/structure
- ❌ treat plan, commitment, actual, and settled value as the same balance
- ❌ change `KEI1` directly in production without transport and regression scope
- ❌ assume `KEPM` is the planning architecture for every S/4/Public Cloud tenant
- ❌ create a classic ECC cost element separately in S/4 without checking G/L design
- ❌ use manual FI posting to hide a settlement/allocation imbalance
- ❌ update CO or Universal Journal tables directly

### Operator checklist

- [ ] Release, deployment, industry, controlling area, period, version confirmed
- [ ] Exact object/cycle and full message log captured
- [ ] Prior successful run and recent transport delta identified
- [ ] At least two falsifiers written for each hypothesis
- [ ] Read-only evidence and Test Run complete
- [ ] Sender, receiver, rule/profile/structure, period, and status reconciled
- [ ] ECC/S/4/Public Cloud path stated
- [ ] Configuration change has owner, transport, QA proof, and regression set
- [ ] Fix paired with rollback and stop condition
- [ ] Actual run followed by document/control-total reconciliation

---

## 16. References

- `references/period-end.md` — CO period-end checklist and sequence; apply the
  release and actual-costing boundaries in this skill when the reference is terse.
- SAP Help Portal, **Cost Elements** — S/4HANA G/L account and cost-element model.
- SAP Help Portal, **Setting Up Planning Content** — planning level, package, and
  parameter-set model for CO-PA planning framework.
- SAP Help Portal, **Settling Orders/Projects** — CO-PA settlement and PA transfer
  structure semantics.
