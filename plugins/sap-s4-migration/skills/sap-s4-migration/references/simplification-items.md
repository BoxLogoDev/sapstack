# Top Simplification Items — S/4HANA Migration Reference

## How to Read This Document

- **Impact**: H = High (blocker or major rework) / M = Medium / L = Low
- **Effort**: estimated person-days for resolution (varies by system complexity)
- **Resolution**: action required before or during conversion

---

## FI — Financial Accounting (8 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_ACDOCA | H | Universal Journal is mandatory. BSEG becomes secondary index. All reporting must shift to ACDOCA. | Ensure New GL is active. Migrate custom reports from BSEG to CDS views (`I_JournalEntryItem`). | 10–20d |
| S4TWL_NEWGL | H | Classic GL (without New GL) is not supported in S/4HANA. | Activate New GL in ECC system BEFORE running SUM/DMO. FI-SL special ledgers must be migrated. | 5–15d |
| S4TWL_ASSETACCTG | H | New Asset Accounting is mandatory. Classic AA is removed. | Run RAALTD01 migration report. Activate parallel ledger for IFRS/local GAAP. Verify depreciation areas. | 5–10d |
| S4TWL_MATERIAL_LEDGER | H | Material Ledger (ML) is mandatory in S/4HANA regardless of valuation method. | Activate ML in ECC before conversion. For actual costing: CKMLCP must run at period end. | 5–10d |
| S4TWL_BP | H | Business Partner (BP) is mandatory. All customers and vendors must be converted to BP before go-live. | Run PREC_CUST + PREC_VEND. Configure BUPA_PRE_MERGE. Execute FLBPD1 (vendor) and FLBPD3 (customer). | 10–20d |
| S4TWL_WITHHOLDING_TAX | M | Extended Withholding Tax is mandatory. Classic WT removed. | Activate extended WT in ECC. Migrate classic WT configuration to extended WT. | 5–10d |
| S4TWL_COFI_RECONCILIATION | M | FI-CO reconciliation ledger is removed in S/4HANA (no longer needed — Universal Journal reconciles automatically). | Ensure no open reconciliation items. Adjust period-end processes that relied on reconciliation. | 2–5d |
| S4TWL_DOCUMENT_SPLITTING | M | Document splitting behavior changes. Active splits are carried over; new rules apply post-migration. | Review document splitting configuration. Validate that all mandatory characteristics are assigned. | 3–8d |

---

## CO — Controlling (3 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_COPA_ACCOUNT_BASED | M | Account-based CO-PA is default in S/4HANA. Costing-based CO-PA is optional add-on. | Evaluate if costing-based PA still needed. Adjust reporting to use account-based (ACDOCA-based). | 5–15d |
| S4TWL_PROFIT_CENTER | H | Profit center is mandatory on all postings in S/4HANA. EC-PCA tables (GLPCT/GLPCA) no longer used as primary. | Ensure profit center derivation is complete for all account assignments. Fix any missing derivation rules. | 5–10d |
| S4TWL_MATERIAL_LEDGER_CO | M | Material Ledger integration with CO changes. Actual costing via CKMLCP is mandatory if ML activated. | Plan CKMLCP execution in period-end sequence. Adjust CO reporting for ML actual cost data. | 3–5d |

---

## MM — Materials Management (5 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_INVENTORY | H | Inventory management tables restructured. MKPF/MSEG → MATDOC. Valuation: MBEW data moves to ACDOCA. | Migrate custom reports from MKPF/MSEG to `I_MaterialDocumentItem` CDS view. | 5–15d |
| S4TWL_PLANT | H | Valuation area must equal plant (1:1 mandatory). Multiple valuation areas per plant not allowed. | Consolidate valuation areas if needed. Impacts: material valuation, transfer pricing. | 5–15d |
| S4TWL_CENTRALPURCHORG | M | Central purchasing organization configuration restrictions apply. | Review purchasing org setup. Adjust if central purch org used for multiple company codes. | 2–5d |
| S4TWL_BATCH_MANAGEMENT | M | Batch management changes for some scenarios. | Review batch-managed materials. Test batch determination in key scenarios. | 2–5d |
| S4TWL_SERIAL_NUMBER | L | Serial number management minor changes. | Test serial number scenarios in conversion system. | 1–3d |

---

## SD — Sales and Distribution (4 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_SD_CRM | M | SAP CRM integration to SD changes. Some CRM-SD integration scenarios deprecated. | Assess CRM integration scope. Determine if CRM functionality moves to C4C/SAP Sales Cloud. | 5–10d |
| S4TWL_REVENUE_RECOGNITION | H | Classic revenue recognition (VBREVN / VF44) replaced by IFRS 15 POB approach. | Design performance obligation (POB) based revenue recognition. Custom ABAP reports on VBREVN must be replaced. | 10–20d |
| S4TWL_BILLING_PLAN | M | Billing plan functionality changes in S/4HANA. | Test all billing plan scenarios in conversion system. | 2–5d |
| S4TWL_SD_REBATE | M | Rebate processing (VB01-VB07) changes. Settlement Mgmt replaces classic rebates. | Evaluate migration to Settlement Management (MEI). Or keep classic if existing agreements. | 5–10d |

---

## PP — Production Planning (3 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_MRP | M | MRP Live (MD01N) replaces classic MRP (MD01) as primary tool in S/4HANA. | Test MRP Live results vs classic MRP. Adjust exception handling processes. | 3–5d |
| S4TWL_KANBAN | L | KANBAN management minor changes. | Test KANBAN scenarios post-conversion. | 1–3d |
| S4TWL_PRODUCTION_VERSIONS | M | Production version handling changes in some scenarios. | Review production version configuration. Test production order creation. | 2–5d |

---

## HR / HCM (3 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_HCM_CORE | H | Classic HCM (PA/OM/PY/TM) not available in S/4HANA without H4S4 business function. Compatibility Pack expired end of 2025. | Activate H4S4_1 business function (IRREVERSIBLE — impact assess first via SAP Note 3091160). Or migrate to SuccessFactors. | 10–30d |
| S4TWL_HCM_DEPRECATIONS | H | H4S4_1 activation deprecates certain PA/TM/PY functionalities. | Review SAP Note 3091160 for full list. Design replacements for deprecated features before activating. | 5–15d |
| S4TWL_ESS_MSS | M | Employee / Manager Self-Service (ESS/MSS) changes. NetWeaver Portal-based ESS/MSS replaced by Fiori apps. | Redesign self-service on Fiori launchpad. Map existing ESS/MSS scenarios to Fiori equivalents. | 5–10d |

---

## ABAP / Custom Code (4 Items)

| ID | Impact | Description | Resolution | Effort |
|----|--------|-------------|-----------|--------|
| S4TWL_COMPATIBILITY_SCOPE | H | Defines which classic ABAP APIs are still available in S/4HANA. Custom code must not use deprecated APIs. | Run ATC check on all Z/Y objects. Fix Priority 1 (blockers) and Priority 2 (high) findings before go-live. | 15–40d |
| S4TWL_BSEG_SELECT | H | Direct SELECT from BSEG without full key is a compatibility issue. ACDOCA is primary in S/4HANA. | Replace BSEG access with CDS: `I_JournalEntryItem` / `I_AccountingDocumentItem`. | Per program: 0.5–2d |
| S4TWL_MKPF_MSEG | M | Direct SELECT from MKPF/MSEG deprecated. MATDOC is primary. | Replace with `I_MaterialDocumentItem` CDS view. | Per program: 0.5–1d |
| S4TWL_CALL_TRANSACTION | M | CALL TRANSACTION in background-capable programs is a compatibility risk. | Replace with BAPI or RAP action where possible. | Per program: 1–3d |

---

## Notes

- **Effort estimates** are rough guidelines. Actual effort depends on: number of affected objects, system complexity, team experience.
- **Always run SAP Readiness Check** on the actual system to get system-specific findings with actual counts.
- **Priority**: fix H (High) items first — these are go-live blockers.
- **SAP Notes**: always check latest SAP Note for each simplification item — details change with releases.
