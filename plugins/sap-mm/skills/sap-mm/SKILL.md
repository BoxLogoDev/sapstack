---
name: sap-mm
description: >
  This skill handles SAP MM (Materials Management) including purchase requisitions,
  purchase orders, goods receipts, invoice verification, inventory management,
  GR/IR clearing, material master, vendor evaluation, and period-end closing.
  Use when user mentions MM, purchasing, procurement, MIGO, MIRO, ME21N, ME23N,
  MB52, MR11, GR/IR, material master, inventory, stock, MRP, info record,
  outline agreement, MMPV, account determination, OBYC, movement type,
  physical inventory, batch management, valuation class.
allowed-tools: Read, Grep
---

# SAP Materials Management (MM) Skill

## 0. Environment Intake and Safety Contract

Before diagnosing or recommending an MM action, collect:

- **Release**: ECC 6.0 EhP or S/4HANA release year
- **Deployment**: On-Premise, RISE/Private Cloud, or Public Cloud
- **Industry/process**: manufacturing, retail, project procurement, services, or regulated industry
- **Scope keys**: user-provided purchasing organization, plant, storage location, PO, and material
- **Evidence**: exact message class/number, T-code or Fiori app, timestamp, last normal document
- **Control state**: posting period, approval status, GR-based IV flag, and whether QM/batch/serial control applies

Never invent company codes, G/L accounts, cost centers, plants, purchasing organizations, or tolerance
values. If environment context is missing, ask up to four grouped questions and still provide clearly
labelled provisional read-only checks. Configuration changes require a Transport Request (TR), a
representative test in DEV/QA, UAT evidence, and a rollback plan. Never edit production tables with
`SE16N`.

## 1. Procurement Cycle

```
PR (ME51N) → RFQ (ME41) → Quotation (ME47) → PO (ME21N)
→ GR (MIGO 101) → IV (MIRO) → Payment (F110)
```

Shortcut flows:
- Without RFQ: PR → PO (ME58 — auto-convert PR to PO)
- Consignment: PO item cat K → GR → settlement (MRKO)
- Subcontracting: PO item cat L → GI components → GR finished

---

## 2. Purchase Order Issues

**Account assignment errors**
- Category K (cost center): cost center must exist and be active
- Category A (asset): asset master must exist, depreciation area active
- Category F (internal order): order must be in Released status
- Category P (project/WBS): WBS element must be open for costs

**Tolerance check (MIRO)**
- OMR6 → tolerance keys: BD (amount) / VP (moving avg price variance) / PP (price)
- Tolerance = percentage + absolute amount — both must be within limits

**GR-based invoice verification**
- PO item → Invoice tab → GR-Based IV flag = X
- With flag: MIRO only possible after GR; invoice quantity = GR quantity

---

## 3. Goods Receipt (MIGO)

### Key Movement Types

| MVT | Description | Notes |
|-----|-------------|-------|
| 101 | GR for purchase order | Standard GR |
| 102 | Reversal of 101 GR | Reference the original GR document |
| 122 | Return delivery to vendor | With return PO |
| 161 | GR for return PO | For returns with credit |
| 201 | GI to cost center | Free goods issue |
| 261 | GI for production order | Component consumption |
| 301 | Transfer plant to plant (1 step) | Same company code |
| 311 | Transfer storage location to storage location | Same plant |
| 551 | Scrapping | Write-off to loss account |

### Account Determination (OBYC)

- Transaction key BSX: inventory posting (stock G/L account)
- Transaction key WRX: GR/IR clearing account
- Transaction key PRD: price difference account (standard price)
- Transaction key GBB: goods issue / offsetting accounts
- Valuation class (material master → Accounting 1) links material to G/L accounts

---

## 4. Invoice Verification (MIRO)

**Blocking reasons**

| Code | Reason | Release T-code |
|------|--------|----------------|
| R | Manual block | MR02 / MRBR |
| A | Amount exceeds tolerance | MRBR (automatic) |
| D | Date issue | MRBR |
| Q | Quantity variance | MRBR |
| P | Price variance | MRBR |

**Parked invoices**: `MIR7`에서 park/complete 상태를 구분하고 `MIR4`에서 문서와 후속 상태를 조회한다.
Blocked invoice release는 parked invoice 처리와 섞지 말고 `MRBR`의 blocking reason 기준으로 별도 진단한다.

**Credit memos**: MIRO → transaction = Credit Memo → reverses original invoice logic

---

## 5. Inventory Management

**Physical inventory process**
1. MI01: create physical inventory document → print count sheet
2. MI04: enter count results (MI09 is a separate count-without-document process)
3. MI07: post inventory differences → generates MM document + FI document
4. MI20: list of inventory differences for review

**Key reports**

| T-code | Report |
|--------|--------|
| MMBE | Stock overview (all stock types) |
| MB52 | Warehouse stocks of material |
| MB53 | Plant stock availability |
| MB5B | Stocks for posting date |
| MB51 | Material document list |

---

## 6. Material Master Key Views

| View | Key Fields |
|------|-----------|
| MRP 1 | MRP type, MRP controller, lot size procedure |
| MRP 2 | Planned delivery time, safety stock |
| MRP 3 | Strategy group (make-to-stock vs make-to-order) |
| MRP 4 | BOM explosion, individual/collective requirements |
| Accounting 1 | Valuation class, price control (S/V), standard/moving avg price |
| Purchasing | Purchasing group, info update, GR processing time |
| Plant Data/Stor.1 | Storage conditions, shelf life, batch management |

Extend to new plant: MM01 → select org levels → plant / storage location

---

## 7. MM Period Close

- **MMPV**: close MM posting period — FI 오픈 기간과 인터페이스 cut-off를 대조하고 회사의 승인된 마감 순서에 맞춰 실행
- **MMRV**: allow posting to previous MM period (emergency use only — document reason)
- Check open GR/IR before closing: MB5S → identify items needing MR11

---

## 8. S/4HANA MM Differences

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| Material document persistence | MKPF / MSEG | MATDOC; compatibility access depends on release |
| Read model | Classic tables/reports | Released CDS views and Fiori analytics preferred for extensions |
| Supplier master | Vendor master transactions and LFA* data | Business Partner with CVI; validate conversion status |
| Material Ledger | Optional by valuation area | Mandatory foundation; Actual Costing remains optional |
| MRP run | MD01/classic MRP | MD01N MRP Live plus supported classic functions |
| Purchase order history | EKBE | EKBE remains relevant; released CDS/API is preferred for clean-core extensions |

---

## 9. Operator Action Map — T-code + Menu Path

Every recommendation must pair the executable surface with its menu path. Fiori-only actions must say
`T-code: none` rather than inventing a GUI code.

| Action | T-code / app | Menu path |
|---|---|---|
| Display PO and history | `ME23N` | SAP Easy Access > Logistics > Materials Management > Purchasing > Purchase Order > Display |
| Change PO after approval | `ME22N` | SAP Easy Access > Logistics > Materials Management > Purchasing > Purchase Order > Change |
| List POs by document | `ME2N` | SAP Easy Access > Logistics > Materials Management > Purchasing > Purchase Order > List Displays > By PO Number |
| Post or reverse goods movement | `MIGO` | SAP Easy Access > Logistics > Materials Management > Inventory Management > Goods Movement > Goods Movement |
| Enter logistics invoice | `MIRO` | SAP Easy Access > Logistics > Materials Management > Logistics Invoice Verification > Document Entry > Enter Invoice |
| Display logistics invoice | `MIR4` | SAP Easy Access > Logistics > Materials Management > Logistics Invoice Verification > Further Processing > Display Invoice Document |
| Review blocked invoices | `MRBR` | SAP Easy Access > Logistics > Materials Management > Logistics Invoice Verification > Further Processing > Release Blocked Invoices |
| Display material master | `MM03` | SAP Easy Access > Logistics > Materials Management > Material Master > Material > Display > Display Current |
| Maintain purchasing info record | `ME11` | SAP Easy Access > Logistics > Materials Management > Purchasing > Master Data > Info Record > Create |
| Display material documents | `MB51` | SAP Easy Access > Logistics > Materials Management > Inventory Management > Environment > List Displays > Material Documents |
| Display stock overview | `MMBE` | SAP Easy Access > Logistics > Materials Management > Inventory Management > Environment > Stock > Stock Overview |
| Create physical inventory document | `MI01` | SAP Easy Access > Logistics > Materials Management > Physical Inventory > Physical Inventory Document > Create |
| Enter physical count | `MI04` | SAP Easy Access > Logistics > Materials Management > Physical Inventory > Count > Enter |
| Review count differences | `MI20` | SAP Easy Access > Logistics > Materials Management > Physical Inventory > Difference > Difference List |
| Post count differences | `MI07` | SAP Easy Access > Logistics > Materials Management > Physical Inventory > Difference > Post |
| Review GR/IR candidates | `MR11` | SAP Easy Access > Logistics > Materials Management > Logistics Invoice Verification > GR/IR Account Maintenance > Maintain |
| Close MM period | `MMPV` | SAP Easy Access > Logistics > Materials Management > Material Master > Other > Close Period |

For S/4HANA Cloud Public Edition, verify the released Fiori app and business role in the user's tenant.
Classic T-code availability must not be assumed.

---

## 10. PO → GR → IR Evidence Chain

Treat the document flow as four independent gates. A green upstream status does not prove that the
next gate completed.

```text
Gate A: PR/source/master data
  → Gate B: PO creation and approval
  → Gate C: GR and material/FI documents
  → Gate D: IR, three-way match, payment block
```

### 10.1 Gate A — PR, Source, and Master Data

Start with read-only master data checks:

1. `[T-code: ME53N | menu: Logistics > Materials Management > Purchasing > Purchase Requisition > Display]`
   — confirm requested quantity, delivery date, account assignment, source assignment, and processing status.
2. `[T-code: MM03 | menu: Logistics > Materials Management > Material Master > Material > Display > Display Current]`
   — confirm base UoM, purchasing/MRP views, plant extension, valuation class, batch and serial controls.
3. `[T-code: ME23N | menu: Logistics > Materials Management > Purchasing > Purchase Order > Display]`
   — verify which source and master attributes were copied to the created PO.

Use the following evidence fields; do not modify them directly:

| Object | Table.Field | Diagnostic meaning |
|---|---|---|
| PR | `EBAN-BANFN`, `EBAN-BNFPO` | PR identity |
| PR | `EBAN-MATNR`, `EBAN-WERKS`, `EBAN-MENGE` | Material, plant, requested quantity |
| Material | `MARA-MTART`, `MARA-MEINS` | Material type and base UoM |
| Plant data | `MARC-WERKS`, `MARC-EKGRP`, `MARC-DISMM` | Plant extension, purchasing group, MRP type |
| Valuation | `MBEW-BKLAS`, `MBEW-VPRSV` | Valuation class and price control |
| UoM conversion | `MARM-UMREZ`, `MARM-UMREN` | Alternative/base UoM conversion |
| Info record | `EINA-MATNR`, `EINA-LIFNR`, `EINE-EKORG` | Supplier-material and purchasing-org segment |
| Source list | `EORD-MATNR`, `EORD-WERKS`, `EORD-VDATU`, `EORD-BDATU` | Source validity interval |

**Hypothesis A1 — source is invalid for the requested date.**

- Supporting evidence: no valid `EORD` interval, or the PO source differs from the approved source.
- Falsification: a valid fixed/allowed source covers the requested date and the same source is copied to the PO.
- Fix: correct source master data through the approved master-data workflow, then recreate or deliberately
  update the affected document in DEV/QA first.
- Rollback: restore the previous source validity record and document selection using the approved change log;
  do not delete source records from tables.

**Hypothesis A2 — UoM conversion causes an apparent quantity mismatch.**

- Supporting evidence: PO order unit differs from `MARA-MEINS`, and `MARM` conversion does not match the supplier pack.
- Falsification: order/base quantities reconcile exactly with `MARM-UMREZ/UMREN`.
- Fix: correct the governed UoM master or the document order unit after impact review.
- Rollback: revert the master/document change and re-run the same quantity comparison.

### 10.2 Gate B — PO Content and Approval

At `[T-code: ME23N | menu: Logistics > Materials Management > Purchasing > Purchase Order > Display]`,
inspect header, item, schedule line, account assignment, conditions, confirmations, and PO history.

| Object | Table.Field | Check |
|---|---|---|
| Header | `EKKO-BSART`, `EKKO-LIFNR`, `EKKO-EKORG`, `EKKO-BUKRS` | Document type, supplier, org assignments |
| Item | `EKPO-MATNR`, `EKPO-WERKS`, `EKPO-MENGE`, `EKPO-NETPR` | Material, plant, quantity, PO price |
| Invoice controls | `EKPO-WEBRE`, `EKPO-EREKZ` | GR-based IV and final-invoice indicator |
| Delivery control | `EKPO-ELIKZ` | Delivery-completed indicator |
| Schedule | `EKET-EINDT`, `EKET-MENGE`, `EKET-WEMNG` | Due date, scheduled and GR quantities |
| Classic release | `EKKO-FRGGR`, `EKKO-FRGSX`, `EKKO-FRGKE` | ECC/classic strategy state |

#### ECC classic release

Use `ME23N` read-only status and release-strategy fields to determine whether the strategy was determined,
which release remains, and whether a value/characteristic change reset the status. Do not bypass the
strategy by changing classification or document value in production.

#### S/4HANA flexible workflow

Use `[T-code: none | menu: Fiori Launchpad > My Inbox]` for the approver work item and
`[T-code: none | menu: Fiori Launchpad > Manage Workflows for Purchase Orders]` for workflow definition.
Compare start-condition evaluation, recipient determination, work-item status, and document status.
Workflow configuration changes require a governed transport and test workflow with a non-production PO.

**Hypothesis B1 — PO is blocked by approval, not by GR processing.**

- Supporting evidence: `ME23N` shows incomplete release or My Inbox has an open/failed work item.
- Falsification: the PO is fully released and no active workflow item remains.
- Fix: correct agent/recipient or release configuration in DEV, transport to QA, test approve/reject paths,
  and then let the authorized approver decide the production work item.
- Rollback: restore the prior workflow/rule version and verify that new test POs route as before.

**Hypothesis B2 — delivery or final-invoice completion was set prematurely.**

- Supporting evidence: `EKPO-ELIKZ` or `EKPO-EREKZ` is set while open business quantity remains.
- Falsification: completion indicators are blank or justified and PO history fully reconciles.
- Fix: have the document owner correct the indicator through `ME22N` after PO-history review.
- Rollback: restore the captured original indicator and revalidate open quantity; never change `EKPO` directly.

### 10.3 Gate C — MIGO Goods Receipt

Before posting, use the check function in `[T-code: MIGO | menu: Logistics > Materials Management >
Inventory Management > Goods Movement > Goods Movement]`. Validate reference document, movement type,
posting/document dates, quantity/UoM, plant/storage location, stock type, batch/serial, and item OK status.

Evidence sequence:

1. `ME23N` PO History — identify the exact GR and any reversal.
2. `MB51` — compare material document number, year, movement type, quantity, posting date, and user.
3. `MMBE` or `MB52` — confirm current stock category and location after posting.
4. FI document display, when generated, must be reviewed with the FI consultant; MM document success alone
   does not prove correct account determination.

#### ECC evidence

- Header: `MKPF-MBLNR`, `MKPF-MJAHR`, `MKPF-BUDAT`, `MKPF-CPUDT`
- Item: `MSEG-MATNR`, `MSEG-WERKS`, `MSEG-LGORT`, `MSEG-BWART`, `MSEG-MENGE`

#### S/4HANA evidence

- Primary persistence: `MATDOC-MBLNR`, `MATDOC-MJAHR`, `MATDOC-MATNR`, `MATDOC-WERKS`,
  `MATDOC-LGORT`, `MATDOC-BWART`, `MATDOC-MENGE`, `MATDOC-BUDAT_MKPF`
- Use released CDS/API surfaces for custom extensions; do not build a new direct-update process on `MATDOC`.

**Hypothesis C1 — no eligible open PO quantity exists.**

- Supporting evidence: schedule/PO history shows full GR, reversal chain changes the net quantity, or
  `EKPO-ELIKZ` is set.
- Falsification: open PO quantity is positive, the item is released, and no completion block applies.
- Fix: correct the business document or reference the correct PO item; do not post an unreferenced GR to mask it.
- Rollback: reverse only the identified incorrect material document via `MIGO` with reference after warehouse/FI approval.

**Hypothesis C2 — account determination blocks posting.**

- Supporting evidence: message identifies transaction key/valuation class and `MBEW-BKLAS` has no matching
  governed `OBYC` entry.
- Falsification: valuation class and all required transaction-key mappings exist for the valuation area.
- Fix: `[T-code: OBYC | menu: SPRO > Materials Management > Valuation and Account Assignment >
  Account Determination > Configure Automatic Postings]`; configure in DEV, attach TR, test `MIGO` Check,
  and validate the generated FI document in QA.
- Rollback: transport the captured previous mapping back through the landscape and repeat the posting simulation.

**Hypothesis C3 — technical update or authorization failed after user input.**

- Check `[T-code: SM13 | menu: SAP Easy Access > Tools > Administration > Monitor > Update]` for update failure.
- Check `[T-code: ST22 | menu: SAP Easy Access > Tools > ABAP Workbench > Test > Dump Analysis]` for a dump.
- Check `[T-code: SU53 | menu: SAP GUI > System > Utilities > Display Authorization Check]` immediately
  after an authorization error.
- Falsification: no matching update record/dump exists and the failed authorization object is not reproduced.
- Fix/Rollback: delegate code defects to ABAP/BASIS and role changes to security; test the narrowest correction
  in QA and retain the prior transport/version for rollback.

### 10.4 Gate D — MIRO Invoice and Three-Way Match

At `[T-code: MIRO | menu: Logistics > Materials Management > Logistics Invoice Verification >
Document Entry > Enter Invoice]`, use Simulate before Post. Compare PO price/quantity, eligible GR,
invoice quantity/amount, tax, currency, exchange-rate date, planned delivery costs, and duplicate reference.

Read-only evidence:

| Object | Table.Field | Meaning |
|---|---|---|
| Invoice header | `RBKP-BELNR`, `RBKP-GJAHR`, `RBKP-BLDAT`, `RBKP-BUDAT` | Invoice identity and dates |
| External reference | `RBKP-XBLNR` | Duplicate-invoice comparison key |
| Invoice item | `RSEG-EBELN`, `RSEG-EBELP`, `RSEG-MENGE`, `RSEG-WRBTR` | PO reference, quantity, amount |
| PO history | `EKBE-EBELN`, `EKBE-EBELP`, `EKBE-VGABE`, `EKBE-MENGE` | GR/IR event chain |
| PO history value | `EKBE-WRBTR`, `EKBE-SHKZG`, `EKBE-BELNR`, `EKBE-GJAHR` | Value, sign, document reference |

#### Three-way match logic

1. **PO basis** — agreed quantity, order unit, price conditions, tax and delivery-cost terms.
2. **GR basis** — actual accepted quantity net of reversals/returns.
3. **IR basis** — vendor invoice quantity and value assigned to the same PO item.
4. **Control** — `EKPO-WEBRE` decides whether invoice matching is tied to individual GR history;
   `OMR6` tolerance keys decide warning/block behavior for configured variance categories.

Do not describe three-way match as a single universal percentage. The applicable tolerance key, absolute
and percentage limits, GR-based IV flag, item type, and company policy all matter.

**Hypothesis D1 — GR-based IV has no eligible GR quantity.**

- Supporting evidence: `EKPO-WEBRE` is set and `EKBE` shows no available GR after reversals/prior invoices.
- Falsification: an eligible unmatched GR exists for the same PO item and quantity.
- Fix: correct the GR/reversal sequence or invoice reference; do not clear the flag merely to post.
- Rollback: reverse only the incorrect test document and restore the original PO control if it was changed.

**Hypothesis D2 — price or quantity variance exceeded configured tolerance.**

- Supporting evidence: PO/GR/IR comparison reproduces the variance and `OMR6` shows the matching tolerance key.
- Falsification: recalculated variance is within both configured absolute and percentage limits.
- Fix: correct PO, GR, or invoice according to the commercial truth. Change `OMR6` only when policy itself
  is approved for change, using DEV/QA, TR, and boundary tests below/at/above the threshold.
- Rollback: restore the prior tolerance configuration via controlled transport and rerun all boundary tests.

**Hypothesis D3 — invoice is posted but payment-blocked.**

- Supporting evidence: `MIR4` shows a posted document and block reason; `MRBR` lists it.
- Falsification: no invoice document exists, or the block is not present.
- Fix: resolve the underlying PO/GR/invoice variance first. `[T-code: MRBR | menu: Logistics > Materials
  Management > Logistics Invoice Verification > Further Processing > Release Blocked Invoices]` is a
  control step, not a substitute for root-cause correction.
- Rollback: do not mass-release. If a release was incorrect, follow the approved AP/payment-block restoration
  process and verify the document in `MIR4` before payment selection.

---

## 11. GR/IR Reconciliation and Period-End

GR/IR is a timing and document-flow control account. A balance is not automatically an error.

### 11.1 Read-only candidate build

1. ECC: `[T-code: MB5S | menu: Logistics > Materials Management > Inventory Management >
   Environment > Balance Sheet Valuation > GR/IR Balances]` for PO-item candidates.
2. S/4HANA: `[T-code: none | menu: Fiori Launchpad > Reconcile GR/IR Accounts]` or the released
   app available in the user's release; do not assume `MB5S` behavior is identical.
3. `ME23N` PO History — build the signed GR, reversal, IR, credit memo, and return sequence.
4. `MIR4` and `MB51` — open the source documents, not just the aggregate balance.

### 11.2 Root-cause buckets

| Balance pattern | Likely business cause | Falsification evidence |
|---|---|---|
| GR without IR | Invoice not received, parked elsewhere, timing cutoff | Matching posted IR exists against same PO item |
| IR without GR | Invoice before receipt, missing reference, GR posted elsewhere | Eligible signed GR exists and is matched |
| GR reversal after IR | Return/cancellation sequence incomplete | Net GR and net IR quantities/values reconcile |
| Small residual | UoM, price, exchange rate, planned delivery cost | Recalculation yields zero without clearing entry |
| Old open item | PO completion/final invoice status not governed | Business obligation is still valid and documented |

### 11.3 MR11 control

`[T-code: MR11 | menu: Logistics > Materials Management > Logistics Invoice Verification >
GR/IR Account Maintenance > Maintain]` must always start with Test Run. Export the candidate list,
record selection parameters and cutoff date, obtain MM/FI/business-owner sign-off, then run the actual
posting only for confirmed no-obligation residuals.

**Falsification**: if an open invoice, return, dispute, or future delivery still exists, “stale residual” is
false and the item must not be cleared.

**Rollback plan**: before actual run, capture candidate PO item, amount, currency, generated document type,
and approvers. If an incorrect clearing is posted, stop further batches and use the release-supported,
auditable reversal procedure agreed by FI/MM; never repair GR/IR by table editing.

### 11.4 MM period close

Before `[T-code: MMPV | menu: Logistics > Materials Management > Material Master > Other > Close Period]`:

- reconcile late GR/IR and backdated warehouse documents;
- confirm FI posting-period coordination with the FI owner;
- confirm interfaces, physical inventory, and goods-movement queues are complete;
- reproduce the close in QA or use the release-supported check mode where available;
- record the current period and approved target period.

Period shift may not have a simple business rollback. Do not run `MMPV` in production until the recovery
procedure is documented and approved. Emergency previous-period posting is not a substitute for governance.

---

## 12. Inventory and Physical Inventory Diagnostics

### 12.1 Stock discrepancy ladder

1. `[T-code: MMBE | menu: Logistics > Materials Management > Inventory Management > Environment >
   Stock > Stock Overview]` — identify plant, storage location, batch, special stock, and stock type.
2. `[T-code: MB52 | menu: Logistics > Materials Management > Inventory Management > Environment >
   Stock > Warehouse Stocks]` — compare the selected organizational scope and key date assumptions.
3. `[T-code: MB5B | menu: Logistics > Materials Management > Inventory Management > Environment >
   Stock > Stock for Posting Date]` — reconstruct book stock at the cutoff date.
4. `[T-code: MB51 | menu: Logistics > Materials Management > Inventory Management > Environment >
   List Displays > Material Documents]` — trace receipts, issues, transfers, reversals, and posting dates.

Do not compare unrestricted stock in one report with total stock across quality/blocked/special categories in
another. Align unit, key date, plant, storage location, batch, special-stock indicator, and valuation scope first.

### 12.2 Physical inventory cycle

```text
MI01 document and scope
  → count-sheet control / warehouse count
  → MI04 count entry
  → MI20 difference review and approval
  → MI07 difference posting
  → MB51/MMBE reconciliation
```

- Header evidence: `IKPF-IBLNR`, `IKPF-GJAHR`, `IKPF-BUDAT`
- Item evidence: `ISEG-MATNR`, `ISEG-WERKS`, `ISEG-LGORT`
- Material document evidence: ECC `MKPF/MSEG`; S/4HANA `MATDOC`

**Hypothesis P1 — scope mismatch, not count error.**

- Supporting evidence: report and count document use different storage location, batch, or stock category.
- Falsification: all scope dimensions and UoM are identical.
- Fix: correct the count scope through the standard physical-inventory process before difference posting.
- Rollback: cancel/recreate only through the supported document flow and retain the audit trail.

**Hypothesis P2 — cutoff movement caused the difference.**

- Supporting evidence: `MB51` shows posting/document-date crossover around the count freeze.
- Falsification: no movement exists between freeze, count, and posting timestamps.
- Fix: reconcile the movement with warehouse evidence; do not “adjust” the count to force zero.
- Rollback: reverse an incorrect goods movement only with its source document and approvals.

Before `MI07`, there may be no safe generic Test Run in every release. Use `MI20`, peer approval, a
representative QA rehearsal, and captured before/after stock values. After posting, verify both the material
document and the accounting impact.

---

## 13. Configuration Routes with Test and Rollback

### 13.1 Invoice tolerances — OMR6

Path: `[T-code: OMR6 | menu: SPRO > Materials Management > Logistics Invoice Verification >
Invoice Block > Set Tolerance Limits]`.

- Change only an approved tolerance key for a user-provided company code.
- Test below, exactly at, and above both absolute and percentage boundaries.
- Include PO quantity, GR quantity, invoice quantity, currency, tax, and exchange-rate cases.
- Transport the change; do not tune production tolerance to release one invoice.
- Roll back by restoring the captured prior values in a new controlled transport and repeating boundary tests.

### 13.2 Automatic account determination — OBYC

Path: `[T-code: OBYC | menu: SPRO > Materials Management > Valuation and Account Assignment >
Account Determination > Configure Automatic Postings]`.

Evidence chain: movement type/account modifier → valuation grouping → valuation class (`MBEW-BKLAS`) →
transaction key (`BSX`, `WRX`, `GBB`, `PRD`) → user-provided G/L account.

Test at least one GR, reversal, consumption, and invoice variance relevant to the change. Validate MM and FI
documents. Roll back with the recorded previous mapping via TR; never replace a production G/L account
without Finance approval.

### 13.3 Movement types — OMJJ

Path: `[T-code: OMJJ | menu: SPRO > Materials Management > Inventory Management and Physical
Inventory > Movement Types > Copy, Change Movement Types]`.

Movement type changes affect quantity update, value update, screen selection, account grouping, reversal,
and downstream WM/EWM/QM integration. Clone and test only in DEV, include positive/reversal/return paths,
and transport after integrated UAT. Roll back with the prior configuration version; never modify the standard
movement type in production to solve one document.

---

## 14. ECC vs S/4HANA Decision Matrix

| Diagnostic area | ECC 6.0 | S/4HANA On-Premise / Private Cloud | Public Cloud routing |
|---|---|---|---|
| Material documents | `MKPF/MSEG` persistence | `MATDOC` primary persistence; compatibility access is release-dependent | Released Fiori app/CDS/API only |
| Supplier master | Vendor master model; LFA* evidence | Business Partner with CVI; validate synchronization and roles | Maintain Business Partner app/business role |
| PO approval | Classic release strategy common | Classic strategy or Flexible Workflow by scope | Flexible Workflow/My Inbox |
| Inventory valuation | Material Ledger may be optional | Material Ledger foundation mandatory; Actual Costing optional | Scope-item and app dependent |
| MRP | Classic MRP functions | MRP Live plus supported classic functions | Fiori/background app by scope |
| GR/IR analytics | `MB5S` and classic reports | Reconcile GR/IR Fiori analytics preferred | Released reconciliation app |
| Extensions | User exits/BAdIs possible | Clean-core: released BAdI/CDS/API preferred | In-app/side-by-side released extension only |

Never tell an S/4 user to update a compatibility view, and never assume an ECC-only report exists in Public
Cloud. Ask for the exact release and deployed scope item before giving write steps.

---

## 15. Falsification Templates

### Template — “PO issue caused MIGO failure”

- Primary root cause: PO item is not eligible for GR.
- Falsification 1: `ME23N` shows a released item with positive open quantity.
- Falsification 2: schedule line and completion indicators allow receipt on the posting date.
- If falsified: move to period, master, QM/batch/serial, account determination, then technical update checks.

### Template — “Tolerance caused MIRO block”

- Primary root cause: quantity or price variance exceeds the applicable `OMR6` key.
- Falsification 1: recalculation is inside both absolute and percentage limits.
- Falsification 2: `MIR4` shows a different blocking reason.
- If falsified: inspect GR-based IV, duplicate check, tax, date, exchange rate, and delivery costs.

### Template — “GR/IR residual can be cleared”

- Primary root cause: no future business obligation remains.
- Falsification 1: open delivery, invoice, return, or dispute evidence exists.
- Falsification 2: net signed GR/IR quantity or value does not reconcile.
- If falsified: keep the item open and route it to the responsible buyer/AP/warehouse owner.

### Template — “Inventory difference is a count error”

- Primary root cause: physical count differs from book stock.
- Falsification 1: key-date reconstruction shows a cutoff movement explaining the full difference.
- Falsification 2: report scope/UoM differs from the physical inventory item.
- If falsified: correct scope or movement evidence, not the count.

---

## 16. Rollback Design by Change Type

| Change | Before evidence | Test | Rollback |
|---|---|---|---|
| PO master/document | Change log, original field values, approval state | Copy scenario in QA | Restore captured values through standard transaction and reapprove |
| Goods movement | Source document, stock/FI before state | `MIGO` Check and QA post | Reference-based reversal with warehouse/FI approval |
| Invoice | PO/GR/IR comparison, simulation output | `MIRO` Simulate | Use approved invoice reversal/correction process; retain audit trail |
| `OMR6` tolerance | Prior key values and policy approval | Boundary matrix | Revert values via controlled TR |
| `OBYC` mapping | Prior transaction-key mapping | GR/reversal/variance integration test | Revert mapping via controlled TR |
| `OMJJ` movement type | Full prior configuration and dependents | Integrated MM/FI/QM/WM/EWM UAT | Restore prior configuration transport |
| Physical inventory | Count document, approvals, stock snapshot | QA rehearsal and `MI20` review | Supported document reversal/correction; never table edit |

Rollback is not “manually change it back later.” It must name the artifact/document, owner, trigger,
sequence, and verification report before the fix is approved.

---

## 17. Anti-Patterns

- ❌ Set `EKPO-ELIKZ` or final invoice merely to hide an open PO item.
- ❌ Release all `MRBR` candidates without proving each blocking reason is resolved.
- ❌ Widen `OMR6` tolerance in production to pass a single invoice.
- ❌ Post a backdated GR solely to make the period-end report balance.
- ❌ Run actual `MR11` before Test Run and business-owner sign-off.
- ❌ Treat every GR/IR balance as an error or clear a valid timing difference.
- ❌ Compare `MMBE`, `MB52`, and `MB5B` without aligning stock type, key date, and UoM.
- ❌ Reverse a material document without checking linked invoice, QM, batch, serial, WM/EWM, and FI impact.
- ❌ Copy a movement type or account mapping straight into production without DEV/QA/TR.
- ❌ Read ECC `MSEG` guidance as S/4 primary persistence guidance.
- ❌ Assume S/4 Public Cloud exposes every classic GUI T-code.
- ❌ Update `EKKO`, `EKPO`, `EKBE`, `RBKP`, `RSEG`, `MKPF/MSEG`, or `MATDOC` directly with `SE16N`.
- ❌ Invent a SAP Note number, message meaning, company code, G/L account, plant, or tolerance percentage.

---

## 18. Standard Diagnostic Response

Use this format for an incident:

```text
## Issue
Exact symptom, document/item, environment, business impact, last normal timestamp

## Primary Root Cause
One evidence-backed leading hypothesis; alternatives are lower priority

## Falsification
At least two observations that would disprove the primary hypothesis

## Check (T-code + Table.Field)
At least two relevant read-only T-codes/apps, menu paths, and one reliable Table.Field

## Fix
Smallest safe correction, DEV/QA test, approval, TR, production verification

## Rollback
Artifact/document, owner, trigger, reverse sequence, verification

## Prevention
Control owner, monitoring report/app, cadence, threshold and escalation
```

For multi-cause incidents, cross-module changes, inventory close, or GR/IR close, switch to the Evidence
Loop. The operator collects evidence and decides; the skill does not perform production writes.
