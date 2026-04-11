---
name: sap-s4-migration
description: >
  This skill supports SAP S/4HANA migration projects including approach selection
  (brownfield, greenfield, bluefield), SAP Readiness Check analysis, simplification
  item resolution, Business Partner migration, custom code remediation via ATC,
  Universal Journal migration, and post-cutover validation. Use when user mentions
  S/4HANA migration, system conversion, greenfield, brownfield, SUM, DMO, readiness
  check, simplification item, BP migration, custom code, ACDOCA, Clean Core,
  RISE with SAP, S/4HANA Cloud, selective data transition, H4S4, conversion project.
allowed-tools: Read, Grep
---

## 1. Approach Decision Tree

```
Q1: Keep existing configuration and historical data?
  YES  → System Conversion (Brownfield)
  NO   → New Implementation (Greenfield)
  SOME → Selective Data Transition (Bluefield / Shell Conversion)

Q2: Target deployment model?
  On-premise        → Full flexibility; custom code with restrictions
  RISE (PCE)        → Managed infrastructure; same S/4HANA functionality
  S/4HANA Cloud PE  → Clean Core only — no modifications, no ABAP CBO
```

### Approach Comparison

| Aspect | Brownfield | Greenfield | Bluefield |
|--------|-----------|-----------|----------|
| Data migration | Automatic (SUM/DMO) | Manual (LTMC) | Selective |
| Configuration | Carried over | Redesigned | Mix |
| Custom code | Must remediate | Can replace with standard | Must remediate |
| Project duration | Shorter | Longer | Longest |
| Risk | Medium | Lower (for processes) | High (complex) |
| Best for | Large existing systems | Major transformation | Demerger / consolidation |

---

## 2. SAP Readiness Check — Critical Simplification Items

### FI / Accounting

| Item ID | Impact | Description | Resolution |
|---------|--------|-------------|-----------|
| S4TWL_ACDOCA | High | Universal Journal mandatory; BSEG becomes secondary | Ensure New GL active; run Universal Journal migration |
| S4TWL_NEWGL | High | Classic GL not supported — New GL must be active | Activate New GL in ECC before SUM run |
| S4TWL_ASSETACCTG | High | New Asset Accounting mandatory; Classic AA removed | Run RAALTD01 migration report; verify parallel ledgers |
| S4TWL_MATERIAL_LEDGER | High | Material Ledger is mandatory in S/4HANA | Activate ML in ECC first if possible |
| S4TWL_BP | High | Business Partner mandatory; vendor/customer must become BP | Run BP migration (FLBPD1/FLBPD3) before conversion |
| S4TWL_COFI_RECONCILIATION | Medium | FI-CO reconciliation ledger removed | Ensure no open reconciliation items |

### MM / Logistics

| Item ID | Impact | Description | Resolution |
|---------|--------|-------------|-----------|
| S4TWL_INVENTORY | High | Inventory tables restructured; MBEW→ACDOCA | No direct MBEW access — use CDS |
| S4TWL_PLANT | High | Valuation area must equal plant (1:1) | Consolidate if multiple valuation areas per plant |
| S4TWL_CENTRALPURCHORG | Medium | Central purchasing org restrictions | Review org structure |

### SD / Revenue

| Item ID | Impact | Description |
|---------|--------|-------------|
| S4TWL_SD_CRM | Medium | CRM integration changes | Review CRM integration scope |
| S4TWL_REVENUE_RECOGNITION | High | VBREVN replaced by IFRS 15 POB approach | Design POB-based revenue recognition |

### ABAP / Custom Code

| Item ID | Impact | Description |
|---------|--------|-------------|
| S4TWL_COMPATIBILITY_SCOPE | High | Defines which classic APIs still supported | Run ATC check to identify custom code impact |

---

## 3. Business Partner Migration (Mandatory for All Conversions)

Every customer and vendor must be converted to a Business Partner before go-live.

### Migration Steps

```
Step 1: Pre-checks
  PREC_CUST  → customer readiness check
  PREC_VEND  → vendor readiness check
  Fix all errors before proceeding

Step 2: BP configuration
  BUPA_PRE_MERGE → BP grouping and number range configuration
  Define BP grouping: customer grouping / vendor grouping

Step 3: Mass creation
  FLBPD1  → vendor → Business Partner (mass conversion)
  FLBPD3  → customer → Business Partner (mass conversion)

Step 4: Verification
  BP transaction → check grouping, roles (FLVN00 / FLCU00)
  FBL1N / FBL5N → verify AP/AR still works via BP ↔ vendor/customer link

Step 5: Post-migration check
  BUPA_CHECK → Business Partner consistency check
  Reconcile customer/vendor count vs BP count
```

### Common BP Migration Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "Duplicate BP for vendor" | Vendor already linked to a BP | Check existing BP link: LFA1-BKVID |
| "Number range not defined" | BP grouping number range missing | BUBA → maintain number ranges |
| "Missing mandatory field" | BP grouping requires field not in vendor | Map fields in customizing |

---

## 4. Custom Code Remediation (ATC — ABAP Test Cockpit)

### Most Common ATC Findings

| Finding | Root Cause | S/4HANA Replacement |
|---------|-----------|---------------------|
| SELECT from BSEG | Table no longer primary storage | CDS: `I_JournalEntryItem` |
| SELECT * from MARA | Performance + table changes | Targeted CDS with specific fields |
| SELECT from MKPF/MSEG | MATDOC is new primary | CDS: `I_MaterialDocumentItem` |
| SELECT from BSID/BSAD | ACDOCA is source | CDS: `I_CustomerLineItem` |
| SELECT from BSIK/BSAK | ACDOCA is source | CDS: `I_SupplierLineItem` |
| CALL TRANSACTION | Compatibility issues | BAPI or RAP action |
| Logical database PNPCE | Deprecated | Direct SELECT + AUTHORITY-CHECK |
| Old BAdI (CL_EXITHANDLER) | Classic BAdI | New BAdI (GET BADI / SE19) |
| Non-Unicode strings | S/4HANA is Unicode-only | String templates `\|...\|` |

### ATC Check Process

1. SE80 / ATC → run check on custom package
2. Filter results: Priority 1 (blocker) and Priority 2 (high) must be fixed
3. Priority 3/4: fix before go-live but not hard blockers
4. Document findings → assign to developers → track remediation

---

## 5. Universal Migration Timeline

```
Phase 1 — Discover (3–4 weeks)
  □ SAP Readiness Check → download simplification item report
  □ ATC custom code analysis → categorize findings by priority
  □ BP migration pre-checks (PREC_CUST / PREC_VEND)
  □ Fit-gap assessment: standard S/4HANA vs current processes

Phase 2 — Prepare (4–6 weeks)
  □ Solution design per simplification item
  □ BP migration configuration (BUPA_PRE_MERGE)
  □ Custom code remediation (Priority 1 + 2 items)
  □ New GL activation if not already active (ECC)
  □ Material Ledger activation if not active (ECC)

Phase 3 — Realize (12–16 weeks)
  □ DEV system conversion (SUM / DMO tool)
  □ Custom code migration and unit testing
  □ Integration testing (all modules)
  □ Parallel run for financials (if required)
  □ User acceptance testing (UAT)

Phase 4 — Deploy (4–6 weeks)
  □ QAS system conversion
  □ QAS regression testing
  □ Cutover planning and rehearsal
  □ PRD system conversion (go-live weekend)
  □ Hypercare (4 weeks minimum)
```

---

## 6. Post-Migration Validation Checklist

```
FI:
□ Trial balance matches pre-migration (FS10N)
□ AP open items correct (FBL1N — count and amount)
□ AR open items correct (FBL5N — count and amount)
□ Asset spot check (AW01N — 10% sample of assets)
□ ACDOCA reconciliation report clean

MM:
□ Stock quantities match (MB52 pre vs post)
□ Open PO / GR / IR correct (ME2M)
□ Material prices correct (MM03 → Accounting 1)

SD:
□ Open sales orders correct (VA05)
□ Billing due list correct (VF04)
□ Credit limits migrated (FD32 / UKM_BP)

ABAP:
□ ST22: zero short dumps in first 3 days post go-live
□ SM21: no system error messages
□ Custom reports executed with expected output
□ Background jobs running on schedule (SM37)
```

---

## 7. References

- `references/simplification-items.md` — top 30 simplification items by module with impact, resolution, effort
