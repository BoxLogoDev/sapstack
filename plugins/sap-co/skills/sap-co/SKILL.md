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
- Material Ledger active? (mandatory in S/4HANA)

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
| "CO document not generated" | FI-CO reconciliation gap | KALC → reconciliation ledger update |
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

- Substitution rule: OKB9 → G/L account → profit center (default)
- Material master → Costing 2 view → profit center
- Sales order → profit center from customer / material / org
- Manual override: document entry → profit center field

---

## 4. Internal Orders

### Order Lifecycle

```
Create (KO01) → Release (KO02 / KOAB) → Post costs → Settle (KO88) → TECO → Close (CLSD)
```

### Configuration

- Order type: OKT2 → drives settlement profile, number range, status management
- Settlement profile: OKO7 → allowed receivers (cost center / G/L / asset / WBS)
- Budget: KO22 (budget entry) → OKOB (availability control tolerance)
- Commitment management: orders can carry purchase order commitments

### Settlement (KO88 / KO8G)

- KO88: individual order settlement
- KO8G: collective settlement (selection by order type / plant / group)
- Always simulate first (test run)
- Settlement rule: KO02 → Settlement → define receivers and percentages

### Common Errors

| Error | Fix |
|-------|-----|
| "Order is locked" | KO02 → check status → release if in CRTD |
| "No settlement rule defined" | KO02 → Settlement tab → create rule |
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
- **Costing-based PA**: uses value fields → mapping from SD conditions → COPA tables

### Key Configuration

- Derivation rules: KE4C / KE4I → derive characteristics from other data (customer → region / industry)
- SD → CO-PA transfer: KE4C → condition type → value field mapping
- Plan data: KE13 (manual planning) / KE1C (copy actual to plan)

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
| Profit center mandatory | No | Yes — mandatory on every posting |
| Segment reporting | FAGLFLEXT | ACDOCA |
| Material Ledger | Optional | Mandatory |
| Actual costing | CKMLCP optional | CKMLCP mandatory |
| CO-PA (account-based) | Optional | Default / primary |

---

## 8. References

- `references/period-end.md` — CO period-end full checklist with T-codes and sequence
