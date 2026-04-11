---
name: sap-hcm
description: >
  This skill handles SAP HCM (Human Capital Management) on-premise topics
  covering ECC HCM and HCM for S/4HANA (H4S4). Includes personnel administration,
  organizational management, payroll, time management, benefits, and FI/CO posting
  integration. Use when user mentions HCM, HR, PA30, infotype, payroll, PC00,
  time management, PT60, org management, position, organizational unit, personnel area,
  employee subgroup, payroll area, absence, attendance, wage type, schema, PCR,
  H4S4, compatibility pack, PA, OM, PY, TM, ESS, MSS.
allowed-tools: Read, Grep
---

## 1. Environment Detection (Critical — Ask First)

```
□ Scenario A — ECC HCM (classic on-premise, pre-S/4HANA)
□ Scenario B — HCM Compatibility Pack on S/4HANA (2020 / 2021)
□ Scenario C — HCM for S/4HANA / H4S4 (S/4HANA 2022+, BF H4S4_1 active)
□ Payroll country? (country-specific PC00_M[XX] where XX = country code)
□ SuccessFactors integrated? (hybrid or standalone HCM?)
```

### ⚠️ Strategic Context — Always Share with User

- **ECC HCM** mainstream support ends **2027** (extended maintenance to 2030 with additional fee)
- **HCM Compatibility Pack** usage rights expired end of **2025**
- **H4S4_1 business function activation is IRREVERSIBLE** — warn before recommending activation
- H4S4 is a bridge — no major new functionality planned by SAP; SuccessFactors is strategic direction
- For SuccessFactors-specific topics, refer to the **sap-sfsf** skill

---

## 2. Personnel Administration (PA)

**Core concept**: infotype-based data model — all employee data stored in versioned, date-effective records

Key T-codes:
- **PA20**: display HR master data
- **PA30**: maintain HR master data (create / change / delete infotypes)
- **PA40**: personnel actions (hire / transfer / terminate)

### Key Infotypes

| IT | Name | Key Fields |
|----|------|-----------|
| 0000 | Actions | Action type, reason |
| 0001 | Org Assignment | Company code, pers.area, EG, ESG, position |
| 0002 | Personal Data | Name, birth date, nationality |
| 0006 | Addresses | Address type, street, city, country |
| 0007 | Planned Working Time | Work schedule rule, time mgmt status |
| 0008 | Basic Pay | Pay scale type/area/group, wage types, amounts |
| 0009 | Bank Details | Bank key, account number, payment method |
| 0014 | Recurring Payments/Deductions | Wage type, amount, frequency |
| 0015 | Additional Payments | One-time wage type, amount |
| 0027 | Cost Distribution | Cost center / order split for payroll posting |

### Common Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "Infotype record not found" | IT does not exist for employee | PA30 → create new record |
| "Feature ABKRS not maintained" | Payroll area derivation feature | PE03 → feature ABKRS → edit decision tree |
| "Time constraint violation" | Overlapping date-effective records | PA30 → delimit existing record before creating new |
| "No authorization" | Missing P_PERNR or PLOG auth | SU53 → check missing auth object |

---

## 3. Organizational Management (OM)

### Object Types

| Object | Type Code | Description |
|--------|-----------|-------------|
| Organizational Unit | O | Department / division |
| Position | S | Individual post (links to person) |
| Job | C | Job title / job description |
| Person | P | Individual employee (linked from PA) |
| User | US | SAP user account |

Key T-codes:
- **PP01**: general object maintenance
- **PPOCE**: org structure editor (hierarchical view)
- **PPOME**: org management for managers (MSS)

### Relationships

| Relationship | Description |
|-------------|-------------|
| A/B 002 | Reports to / is manager of |
| A/B 007 | Is described by / describes (Job ↔ Position) |
| A/B 008 | Is holder of / is occupied by (Position ↔ Person) |
| A/B 003 | Belongs to / includes (Org Unit ↔ Position) |

### Common Issues

| Issue | Fix |
|-------|-----|
| Position not showing in org chart | PP01 → check validity dates (start/end) and active flag |
| Person not linked to position | RHINTE00 → consistency check; then PA30 IT0001 → fix position assignment |
| Structural auth not working | T77PR / T77UA → check structural authorization profile assignment |

---

## 4. Payroll (PY)

### Payroll Flow

```
1. Release payroll    PA03 → status: "Released for payroll"
2. Run payroll        PC00_M[XX]_CALC (XX = country code)
3. Check log          Display log → identify error employees
4. Corrections        PA03 → "Release for correction" → fix master data → re-run
5. Exit payroll       PA03 → "Exited"
6. Post to FI/CO      PC00_M[XX]_CIPE → SIMULATE first → then actual run
7. Bank transfer      PC00_M[XX]_CDTA → generate DME file
```

### Country-Specific Payroll T-codes (PC00_M[XX]_CALC)

| Country Code | Country |
|-------------|---------|
| PC00_M01_CALC | Germany (DE) |
| PC00_M10_CALC | USA |
| PC00_M08_CALC | Great Britain |
| PC00_M23_CALC | Japan |
| PC00_M26_CALC | Korea |
| PC00_M12_CALC | Australia |

### Key Concepts

- **Wage types**: dialog (Mxxx — customer-defined) / technical (/1xx — system-generated)
  - V_T512W: wage type configuration table
  - V_T512W_B: wage type permissibility per infotype
- **Schemas**: country-specific payroll logic (X000 DE / U000 US / etc.)
  - PE01: schema editor — edit payroll calculation logic
- **PCRs (Personnel Calculation Rules)**: PE02 — individual calculation rules within schema
- **Payroll periods**: T549Q → period parameters per payroll area
- **Retro accounting**: triggered automatically when backdated IT0008/IT0014/IT0015 changes

### Common Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "Payroll area locked" | Another run in progress or locked | PA03 → check status → unlock if safe |
| "No valid personal work schedule" | IT0007 missing or date gap | PA30 → IT0007 → fill gap |
| "Wage type not permitted" | V_T512W_B permissibility check | SPRO → Payroll → Wage Types → check permissibility |
| "FI posting error — account not found" | Symbolic account → G/L mapping missing | V_T52EL → wage type → symbolic account; SPRO → G/L assignment |

---

## 5. Time Management (TM)

### Configuration Hierarchy

```
Holiday Calendar (SCAL)
  → Factory Calendar (SCAL)
    → Daily Work Schedule (PT01 view)
      → Period Work Schedule
        → Work Schedule Rule
          → IT0007 (Planned Working Time)
```

### Key T-codes

| T-code | Description |
|--------|-------------|
| PT01 | Display/create work schedules |
| SCAL | Factory / holiday calendar |
| PT60 | Time evaluation (RPTIME00) |
| PT_BPC10 | Time accounts / leave quotas |
| RPTQTA00 | Quota generation run |
| CAT2 | CATS — cross-application time sheet |
| PT50 | Quota overview for employee |

### Common Issues

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Absence quota not generated | RPTQTA00 selection / IT0007 TM status ≠ 1 | Run RPTQTA00 with correct selection; check IT0007 TM status |
| Time evaluation errors | Schema logic / master data gap | PT60 → log → identify error → check schema TM00/TM04 in PE01 |
| Overtime not calculated | PCR threshold / daily-weekly limit | PE02 → time PCR → check overtime conditions |

---

## 6. FI/CO Integration (Payroll Posting)

### Posting Flow

```
PC00_Mxx_CIPE (simulation) → Preview FI document
  → PC00_Mxx_CIPE (actual) → HCM cluster posting document
    → PCRV / PUOC_xx → FI document in target company code
```

### Mapping Chain

```
Wage type → Symbolic account (V_T52EL) → G/L account (SPRO assignment)
```

### Cost Assignment

- IT0027 (Cost Distribution): split payroll costs across cost centers / internal orders / WBS
- Without IT0027: cost posted to cost center from IT0001 (Org Assignment)

---

## 7. H4S4 Guidance (S/4HANA 2022+)

### Before Recommending H4S4_1 Activation

- Run impact assessment: **SAP Note 3091160** — check which functionalities are deprecated
- Activation is IRREVERSIBLE — no rollback possible after activating H4S4_1 via SFW5
- Some PA / TM / PY functionalities deprecated — must have replacement plan

### What Changes with H4S4_1

- Fiori apps added: My Paystub, Leave Request, Team Calendar, Manager Self-Service apps
- Learning Solution: NOT available in Private Cloud → must use SuccessFactors Learning
- Some classic PA/TM reports replaced by Fiori equivalents

### What Stays the Same

- Core payroll engine — schemas, PCRs, wage types unchanged
- Infotype data model — PA30 still works
- Time management configuration — work schedules, PT60 unchanged
- FI/CO posting logic — PC00_Mxx_CIPE unchanged

---

## 8. References

- `references/payroll-guide.md` — country-specific payroll T-codes, schema structure overview, PCR logic
