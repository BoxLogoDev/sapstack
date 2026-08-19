---
name: sap-tr
description: >
  This skill handles SAP Treasury and Cash Management including liquidity
  forecasting, cash position reporting, bank statement processing, payment runs,
  house bank configuration, and treasury instruments. Use when user mentions
  TR, treasury, FF7A, FF7B, liquidity, cash position, FLQDB, FLQITEM, bank statement,
  MT940, FF_5, FEBAN, F110, house bank, FI12, payment method, DME, BCM,
  bank account management, One Exposure, cash forecast, planning level,
  check management, FCHI, bank communication.
allowed-tools: Read, Grep
---

## 1. Environment Detection

Ask before answering:

```
□ Classic Cash Management (ECC / S/4HANA pre-1909) or
  S/4HANA Advanced Cash Management (One Exposure hub)?
□ Bank Communication Management (BCM) active?
□ Transaction Manager (TRM) activated? (money market / FX / derivatives)
□ Which SAP release? (impacts available tools significantly)
□ Bank statement format: MT940 / BAI2 / CAMT.053 / proprietary?
```

---

## 2. Liquidity Forecast Troubleshooting

### FF7A / FF7B Missing Items

**Step 1 — Check active cash-management model and derivation**
- Classic Liquidity Planner: confirm source document, planning group/level, liquidity
  item derivation, date logic, and report selection.
- S/4HANA Advanced Cash Management: confirm active One Exposure source application,
  flow type/certainty level, liquidity item derivation, and app filter.

**Step 2 — Check cash-flow line-item evidence**
- Use the supported classic report or released Cash Flow Analyzer/Check Cash Flow
  Items app, filtered by the user's company code and planning date range.
- Distinguish “item exists but report filter excludes it” from “source did not
  generate a cash-management flow.”

**Step 3 — Rebuild only through the release-specific supported procedure**
- Do not recommend delete-and-rebuild from a generic symptom.
- First preserve counts/control totals, isolate source/company/date scope, prove the
  derivation correction in QA, and obtain close/treasury approval.
- Use the documented classic reconstruction or S/4 Flow Builder initialization path
  for the exact release; include a restore/reconciliation plan.

### Planning Level Strategy

| Level Type | Description | Source |
|-----------|-------------|--------|
| Actual | Bank-confirmed transactions | posted bank statement |
| Memo records | Manually entered forecast | FF63 (memo records) |
| Forecast | Open items / expected payments | AP/AR open items |
| Plan | Long-range planning | Manual or interface |

---

## 3. Bank Statement Processing

### MT940 Import Flow

```
Bank file received → FF_5 (import) → Parsing/interpretation → FEBAN postprocessing → FI posting/clearing
```

**FF_5**: Electronic bank statement import for the supported format/configuration
**FEBAN**: Electronic bank statement postprocessing for items requiring review

### Common Bank Statement Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "No account found" | G/L account not mapped to bank account | FI12 → house bank → G/L account |
| "Posting rule not found" | Transaction type not mapped | OT83 → transaction types → posting rules |
| "Amount mismatch" | statement amount/reference does not satisfy posting/clearing design | inspect posting rule, interpretation algorithm, open-item match and authorized tolerance design |
| "Note to payee not found" | Reference format doesn't match search string | OT83 → search string config |

### House Bank Setup (FI12)

```
FI12 → Company Code → House Banks → House Bank ID
  → Bank Accounts → Account ID → G/L Account → Currency
```

Manual bank statement: **FF67** → enter manually without file

---

## 4. Payment Run (F110)

### Pre-Flight Checklist

```
□ Open items exist with correct due dates
□ Vendor master has payment method assigned (LFB1-ZWELS)
□ Payment method assigned to company code (FBZP → Payment Methods in Company Code)
□ House bank ranking maintained (FBZP → Bank Determination → Ranking Order)
□ Bank determination, available-amount/value-date control, and funding decision reviewed
□ No posting period lock for payment date
```

### Execution Flow

1. **F110** → Parameters → enter company codes, payment methods, next payment date
2. Proposal run (simulate): F110 → Proposal → Start immediately → Review log
3. Review exceptions: F110 → Proposal → Display proposal → check blocked items
4. Payment run (actual): F110 → Payment run → Start immediately
5. DME / print: F110 → Printout/data medium → generate files

### Payment Run Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "No items selected" | Due date filter, payment method mismatch | Check open items in FBL1N, verify vendor master |
| "House bank not found" | Bank determination ranking incomplete | FBZP → bank determination → add ranking |
| "Payment method not allowed" | PM not assigned to vendor country | FBZP → payment methods in country |
| "Blocking reason" | Item manually or automatically blocked | FBL1N → remove block / release in MRBR |

### Blocking / Unblocking

- FK05: block / unblock vendor for payment (company code level)
- FBL1N → change → payment block field on line item level
- MRBR: release automatically blocked MM invoices

---

## 5. House Bank Configuration

### Structure

```
FI12:
  Company Code
  └── House Bank (Bank Key + Bank Name)
      └── Account ID (internal ID)
          ├── Bank Account Number
          ├── Currency
          └── G/L Account (clearing account)
```

### Check Management

| T-code | Purpose |
|--------|---------|
| FCHI | Define check lots (number ranges) |
| FCHV | Void check |
| FCH5 | Void issued check |
| FCH6 | Reprint check |
| FCHN | Check register report |
| FCHK | Check information display |

---

## 6. Treasury Instruments (TRM — if activated)

**Money Market**
- FTR_CREATE → transaction type MM (money market) → create deal
- TM01 → display / change money market transactions

**FX (Foreign Exchange)**
- FTR_CREATE → transaction type FX → create FX deal
- FX10 → FX deal monitor

**Exposure Management**
- TPM_FC_EXPOSURE → foreign currency exposure overview
- Hedging relationship: TM_HEDGE → assign hedge instrument to exposure

**Mark-to-Market Valuation**
- TPM10 → periodic valuation of financial instruments
- Integrates to FI via posting specifications

---

## 7. S/4HANA Cash Management Differences

| Feature | ECC / Classic | S/4HANA Advanced |
|---------|--------------|-----------------|
| Liquidity tables | FLQDB / FLQITEM | One Exposure hub |
| Bank account mgmt | FI12 (T-code) | BAM Fiori apps |
| Bank statement | `FF_5` import and `FEBAN` postprocessing | released import/postprocessing apps plus configured formats |
| Cash position report | FF7A | Fiori: Cash Position app |
| Liquidity forecast | FF7B | Fiori: Liquidity Forecast app |
| Bank communication | EDI/file | SAP Multi-Bank Connectivity (MBC) |
| Check management | FCHI/FCH5 | Same T-codes (limited change) |

**One Exposure Hub**: collection/storage point for activated operational cash sources.
Its actual sources depend on configuration; classic Liquidity Planner persistence is
not automatically the live source merely because compatibility objects remain.

---

## 8. Diagnostic Response Contract

Use Quick Advisory for a stable definition. Use the Evidence Loop for bank-statement
posting failures, payment proposal exceptions, house-bank selection issues, cash-flow
gaps, or any issue that can create/reverse FI documents or outbound payment files.

### 8.1 Required intake

- SAP release and deployment: ECC, S/4HANA On-Premise/Private, or Public Cloud
- industry, company code, country, currency, time zone, and close/payment calendar
- classic Cash Management/Liquidity Planner or Advanced Cash Management scope
- BCM/MBC/payment approval and Bank Account Management activation
- house bank/account ID and bank account only as masked identifiers
- statement format, statement ID/date, external transaction, and exact message
- payment run date/ID, proposal/payment stage, payment method, and exception log
- last successful file/run and configuration/master/transport changes since then
- whether an FI/material/payment medium document was already created

Never request or reproduce full bank account numbers, IBANs, credentials, signing
keys, unmasked payment files, or personal payee data. Use masked evidence.

### 8.2 Safety boundary

- Import/postprocess only a sanitized QA copy when testing bank files.
- `F110` Proposal is mandatory before the Payment Run.
- Before retrying an import, posting, payment, or payment-medium generation, prove
  whether the previous attempt committed any document or file.
- House-bank, posting-rule, search-string, payment-method, and bank-determination
  configuration changes require a transport and QA regression.
- Bank-account master changes require treasury/bank-account governance and the
  release-specific workflow; do not assume they are Customizing.
- Every Fix includes a Rollback Plan and a reconciliation/control total.

### 8.3 Standard response shape

1. **Issue** — bank/run/item, stage, exact symptom
2. **Primary Root Cause** — strongest evidence first
3. **Hypotheses** — two to four, each with at least two falsifiers
4. **Check** — T-code plus menu path or released app plus navigation
5. **Fix** — minimum change, transport/workflow, representative QA proof
6. **Rollback** — reversal/backout and stop condition
7. **Prevention** — file/run controls, monitoring, ownership

---

## 9. Electronic Bank Statement — `FF_5` to `FEBAN`

### 9.1 Entry points

`[T-code: FF_5 | menu: SAP Easy Access > Accounting > Financial Accounting >
Banks > Incomings > Bank Statement > Import]`

`[T-code: FEBAN | menu: SAP Easy Access > Accounting > Financial Accounting >
Banks > Incomings > Bank Statement > Postprocessing]`

`[T-code: OT83 | menu: SPRO > Financial Accounting > Bank Accounting > Business
Transactions > Payment Transactions > Electronic Bank Statement > Make Global Settings]`

Use the paths supported by the installed release. In Public Cloud, use the released
Manage/Monitor/Postprocess Bank Statements apps and configuration activities.

### 9.2 Stage model

| Stage | Evidence | Typical failure class |
|---|---|---|
| File intake | filename/hash, format, encoding, bank/account, statement ID/date | unreadable/unsupported file, wrong format, duplicate statement |
| Parse | header, opening/closing balance, line count, currencies | malformed tag/record, inconsistent control total |
| Interpretation | external transaction, posting rule, algorithm, search string | mapping absent, reference not extracted |
| Account determination | account symbol, currency, house bank/account, G/L | missing/invalid account mapping |
| Posting/clearing | posting area, document type/date, open-item candidate | period, tolerance, account assignment, no unique match |
| Postprocessing | item status, error message, candidate list | ambiguous/unresolved exception |

Do not collapse these stages into “`FF_5` failed.” The same bank line can import
successfully and still require `FEBAN` postprocessing.

### 9.3 Read-only evidence sequence

1. Mask the file and record file hash, format/version, encoding, line count, opening/
   closing balance, statement ID/date, currency, and account identity.
2. Confirm no statement with the same bank/account/statement identity has already
   imported or posted. A renamed duplicate file is still a duplicate.
3. In `FF_5` via the menu path above, capture format parameters and import log; do
   not retry until duplicate/commit state is known.
4. For the failed line, record external transaction, sign, amount/currency, value/
   posting date, masked note-to-payee, bank reference, and item status.
5. In `OT83` via the menu path above, inspect without saving the bank-specific
   transaction mapping, posting rule, account symbols, interpretation algorithm,
   posting areas, and search-string dependency.
6. In `FEBAN` via the menu path above, inspect proposed posting/clearing candidates,
   exact message, and whether an accounting document exists.
7. Compare one successful line with the failed line from the same bank/format and
   configuration level.
8. Reconcile imported line count and amounts to posted, cleared, and exception totals.

### 9.4 Hypothesis matrix

| Hypothesis | Supporting evidence | Falsification evidence |
|---|---|---|
| External transaction is unmapped | failed code has no active posting-rule assignment; peers with mapped codes post | exact code/sign is mapped to the active rule and log shows that rule was selected |
| Interpretation cannot extract reference | masked note format changed; no candidate is proposed | extracted reference matches an open item and algorithm trace succeeds |
| Account symbol/house-bank account is incomplete | log names account determination; mapping misses currency/account | exact account symbol resolves to valid account and controlled posting reaches clearing stage |
| Multiple open items make clearing ambiguous | several candidates share amount/reference | one unique candidate satisfies the configured algorithm and date/amount logic |
| Posting period/date is invalid | error names period/date; statement date is outside open interval | authorized interval is open for the exact posting date and error persists |
| File is duplicate | statement identity/hash/control totals match prior import | no prior statement identity exists and bank confirms a distinct sequence |

Each confirmed cause needs evidence from configuration/log plus the actual line. A
note-to-payee pattern alone does not prove that the active algorithm used it.

### 9.5 Fix and rollback pairs

| Cause | Fix | Rollback |
|---|---|---|
| Missing transaction mapping | add approved external-transaction/posting-rule mapping in development; transport and replay sanitized QA file | import backout transport; keep affected lines in postprocessing |
| Search-string/algorithm gap | add the narrowest validated pattern and test positive plus negative examples | restore previous search-string/algorithm transport; reverse only QA documents created by test |
| Account determination gap | correct owned account-symbol/house-bank mapping after FI/Treasury approval | restore prior mapping and reconcile every test posting |
| Ambiguous clearing | manually select only with documented evidence or improve governed matching design | reverse the exact clearing document if wrong and return item to controlled postprocessing |
| Period issue | use close-owner-approved posting date/window | close temporary window after posting and reconciliation |

Never modify an imported bank-statement line or FI document directly in a table.
Never delete a statement merely to make a duplicate-import error disappear.

---

## 10. Payment Run — `F110`

`[T-code: F110 | menu: SAP Easy Access > Accounting > Financial Accounting >
Accounts Payable > Periodic Processing > Payments]`

### 10.1 Controlled run sequence

1. Record run date/identification, posting date, documents entered up to, next
   payment date, company codes, payment methods, customer/vendor selection, and
   additional log selections.
2. Validate due open items, payment block, payment method, partner bank/bank details,
   currency, minimum/maximum amounts, and required payment data.
3. Start **Proposal** only and archive proposal log, exception list, selected items,
   house-bank/account selection, amounts, and payment-method split.
4. Reconcile proposal total to the approved payment batch and treasury funding.
5. Resolve exceptions at their true owner; regenerate the proposal only after the
   reason and change delta are documented.
6. Obtain payment approval, then execute the **Payment Run**.
7. Reconcile accounting/payment documents and statuses before generating or sending
   the payment medium.
8. Confirm file/hash/control total, approval/signing status, bank acknowledgement,
   and duplicate-submission control.

Changing parameters after proposal approval invalidates that approval. Recreate and
reconcile the proposal.

### 10.2 Exception hypotheses

| Symptom | Candidate | Falsification evidence |
|---|---|---|
| No items selected | due-date horizon, payment block, special G/L, selection, already paid/proposed | item is open/due/unblocked, in selection, and not held by another run |
| No valid payment method | master/item/company/country/currency/amount constraint mismatch | one method is allowed at all relevant levels and log accepts it |
| No house bank/account | bank determination, ranking, currency, available amount/value date, account usability | active ranking yields a valid funded account and proposal selects it |
| Item blocked | explicit payment block, invoice verification/workflow status | no payment block/status applies and proposal still excludes it |
| Payment medium missing | payment run incomplete, format/config/variant or approval step | payment documents complete and configured medium step starts successfully |

### 10.3 Safe corrections

- Item/master payment data: change only the business-correct source field with AP
  approval; rollback by restoring the prior value and rerunning Proposal.
- `FBZP` configuration: transport minimum change and test multiple currencies,
  amount bands, vendors, and negative cases; rollback with backout transport.
- House-bank funding: treasury may choose another approved account or adjust funding;
  do not falsify available amounts solely to force selection.
- Payment block: remove only after the blocking reason/workflow is resolved; restore
  the block if the approval is withdrawn.

If the Payment Run or medium may already have completed, stop. Establish accounting
documents, medium/file identity, transmission and bank acknowledgement before retry.

---

## 11. House Bank and Payment Account Determination

### 11.1 ECC/classic house-bank evidence

`[T-code: FI12 | menu: SAP Easy Access > Accounting > Financial Accounting >
Banks > Master Data > House Banks]`

Confirm the complete identity chain:

- company code
- house bank ID and bank key
- account ID, currency, and masked bank account identity
- linked G/L/bank clearing design for the installed release
- payment method/currency eligibility
- electronic bank statement account mapping

Do not infer the correct G/L account from a similar house bank. Use the customer's
approved account design and masked source evidence.

### 11.2 Payment bank determination

`[T-code: FBZP | menu: SPRO > Financial Accounting > Accounts Receivable and
Accounts Payable > Business Transactions > Outgoing Payments > Automatic Outgoing
Payments > Payment Method/Bank Selection]`

Inspect these layers together:

1. payment method in country
2. payment method in company code
3. bank determination ranking order
4. bank accounts for the payment method/currency
5. available amounts and value-date design where used
6. payment medium/form/format assignment

`FI12` proves that a house bank/account exists; it does not by itself prove `F110`
will select it. `FBZP` proves configuration; it does not prove the account is funded,
approved, active, or usable in the current Bank Account Management process.

### 11.3 S/4HANA Bank Account Management

In applicable S/4HANA releases, house banks can be maintained with the **Manage
Banks** app or the release-supported house-bank transaction, while bank accounts and
their house-bank connectivity are governed in **Manage Bank Accounts**. Public Cloud
uses released apps/configuration activities and workflow.

Before changing connectivity:

- identify whether the object is configuration or bank-account master data
- confirm workflow status, validity, company code, account currency and signer roles
- verify there is not more than one unintended active house-bank-account connection
- update payment bank determination after an approved connectivity change
- regression-test `F110`, bank statement import/postprocessing, cash position, and
  payment medium for the affected account

### 11.4 Account-determination hypotheses

**H1 — Ranking points to a house bank without an eligible account.**

- Supports: `F110` log selects rank but rejects currency/payment method/account.
- Falsifies: active ranking produces an eligible account in the same proposal scope.

**H2 — Bank Account Management connectivity is incomplete or inactive.**

- Supports: bank account exists but no valid central house-bank-account connection;
  workflow/validity blocks use.
- Falsifies: valid connection is active and used successfully by another controlled
  payment in the same configuration level.

**H3 — Statement account mapping and payment account design diverged.**

- Supports: outgoing payment posts to one clearing design while statement mapping
  resolves another; reconciliation remains open.
- Falsifies: both flows hit the approved complementary accounts and clear correctly.

---

## 12. Missing Cash Flow — Classic vs One Exposure

### 12.1 Classic diagnostic path

`[T-code: FF7A | menu: SAP Easy Access > Accounting > Financial Supply Chain
Management > Cash and Liquidity Management > Cash Management > Information System > Cash Position]`

`[T-code: FF7B | menu: SAP Easy Access > Accounting > Financial Supply Chain
Management > Cash and Liquidity Management > Cash Management > Information System > Liquidity Forecast]`

For classic scope, compare the source document's planning date, planning level/group,
amount/currency, account/customer/vendor assignment, and report selections. Use
supported display/report evidence; never update classic liquidity tables directly.

### 12.2 One Exposure diagnostic path

Use **Cash Flow Analyzer > Cash Position/Liquidity Forecast/Actual Cash Flows** and
drill into **Check Cash Flow Items**.

Check:

1. source application is active for the company code
2. source document and lifecycle predecessor/successor exist
3. flow type/category and certainty level match the source stage
4. liquidity item/planning level derivation completed
5. bank account or planning group is assigned as expected
6. original system and source ID are correct
7. app filters, key date, currency conversion, and hierarchy include the item
8. Flow Builder/data setup job or interface log is successful

### 12.3 Flow hypotheses and falsifiers

| Hypothesis | Supports | Falsifies |
|---|---|---|
| Source application inactive | no flow for any new documents in source/company | source active and comparable document produces a flow |
| Derivation leaves liquidity item blank/wrong | flow exists with missing/unexpected derivation | active query/rule derives expected item in controlled test |
| Lifecycle replacement misunderstood | predecessor disappears when successor flow posts | both expected lifecycle stages are missing despite valid source documents |
| Report filter/currency hides flow | line item exists outside current filter/conversion | exact line item is absent from supported item display |
| Interface/data-setup failure | job/interface log fails at onset | job succeeds and source item arrives with correct identity |

### 12.4 Rebuild boundary

A rebuild is a last resort after derivation/source configuration is corrected. Before
any release-specific initialization or Flow Builder reconstruction:

- export counts and totals by source/company/date/currency
- define the exact delete/rebuild scope and original-system identity
- prove in QA that no duplicates or lifecycle breaks result
- obtain Treasury, FI, Basis, and close-owner approval
- schedule a freeze window and monitoring
- reconcile rebuilt counts/totals and downstream cash reports
- retain the prior-state evidence and backout/restore plan

---

## 13. ECC / S/4HANA / Public Cloud Boundary Matrix

| Topic | ECC 6.0 | S/4HANA On-Premise/Private | Public Cloud |
|---|---|---|---|
| Cash data model | classic Cash Management/Liquidity Planner | One Exposure when Advanced Cash Management active; classic coexistence/migration is scope-specific | One Exposure and released apps |
| House bank | `FI12` classic | Manage Banks/release-supported GUI plus Bank Account Management connectivity | released apps/configuration |
| Bank account | classic house-bank account data | governed bank-account master and connectivity where BAM applies | Manage Bank Accounts workflow |
| EBS | `FF_5` and `FEBAN` | GUI and/or released monitor/postprocessing apps | released import/postprocessing apps |
| Payment | `F110` plus classic medium | `F110`/apps, BCM/MBC and formats by scope | released payment/approval/connectivity scope |
| Cash analytics | `FF7A`/`FF7B` | Cash Flow Analyzer and apps when active | released Cash Management apps |

Do not infer that Advanced Cash Management, BCM, MBC, BAM workflow, or TRM is active
from the S/4HANA release alone.

---

## 14. Anti-Patterns and Operator Checklist

### Anti-patterns

- ❌ import the same bank statement again without checking statement identity/status
- ❌ treat `FF_5` import success as proof every line posted and cleared
- ❌ post a `FEBAN` item to the first amount-matching open item without reference proof
- ❌ change `OT83`, `FBZP`, or account mapping directly in production
- ❌ execute `F110` Payment Run before proposal reconciliation/approval
- ❌ regenerate or resend a payment medium without duplicate-submission control
- ❌ expose unmasked bank/payment/personal data in evidence
- ❌ use a generic delete-and-rebuild instruction for cash-flow inconsistency
- ❌ update FI, bank statement, classic liquidity, or One Exposure tables directly

### Operator checklist

- [ ] Release, deployment, country/industry, cash model and banking scope confirmed
- [ ] Masked bank/run/statement identity and exact stage/message captured
- [ ] Prior successful item/run and recent change delta identified
- [ ] Commit/document/file/transmission state checked before retry
- [ ] At least two falsifiers for each hypothesis
- [ ] Import/parse/interpret/account/post/clear stages separated
- [ ] `F110` Proposal reconciled before Payment Run
- [ ] House bank, BAM connectivity, `FBZP`, EBS mapping and funding reconciled
- [ ] ECC/S/4/Public Cloud path stated
- [ ] Transport/workflow, QA evidence, rollback and control totals documented

---

## 15. References

- `references/liquidity-guide.md` — classic planning-level guide; apply the rebuild
  safeguards and release boundaries in this skill before using terse repair steps.
- SAP Help Portal, **One Exposure from Operations** — source activation, flow types,
  certainty levels, lifecycle and authorization model.
- SAP Help Portal, **Banks and House Banks** and **Defining House Bank Accounts** —
  S/4HANA house-bank and bank-account connectivity model.
- SAP Help Portal, **Liquidity Forecast** and **Cash Flow Analyzer** — One Exposure
  analytics and drill-down behavior.
