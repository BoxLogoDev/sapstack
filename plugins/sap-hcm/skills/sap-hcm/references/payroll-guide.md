# HCM Payroll Reference Guide

## Country-Specific Payroll T-codes

| Country | Calc T-code | Posting T-code | DME T-code | Notes |
|---------|-------------|----------------|------------|-------|
| Germany (DE) | PC00_M01_CALC | PC00_M01_CIPE | PC00_M01_CDTADME | Schema: D000 |
| USA (US) | PC00_M10_CALC | PC00_M10_CIPE | PC00_M10_CDTA | Schema: U000 |
| Great Britain (GB) | PC00_M08_CALC | PC00_M08_CIPE | PC00_M08_CDTA | Schema: G000 |
| Japan (JP) | PC00_M23_CALC | PC00_M23_CIPE | PC00_M23_CDTA | Schema: J000 |
| Korea (KR) | PC00_M26_CALC | PC00_M26_CIPE | PC00_M26_CDTA | Schema: K000 |
| Australia (AU) | PC00_M12_CALC | PC00_M12_CIPE | PC00_M12_CDTA | Schema: A000 |
| France (FR) | PC00_M06_CALC | PC00_M06_CIPE | PC00_M06_CDTA | Schema: F000 |
| Canada (CA) | PC00_M07_CALC | PC00_M07_CIPE | PC00_M07_CDTA | Schema: C000 |
| Switzerland (CH) | PC00_M04_CALC | PC00_M04_CIPE | PC00_M04_CDTA | Schema: Q000 |
| Netherlands (NL) | PC00_M11_CALC | PC00_M11_CIPE | PC00_M11_CDTA | Schema: N000 |

---

## Payroll Schema Structure

### Schema Hierarchy

```
Country Schema (e.g., D000 for Germany)
  └── Sub-schema: XAL0 — Gross Pay calculation
  └── Sub-schema: XAL1 — Net Pay / Deductions
  └── Sub-schema: XAL2 — Tax calculation
  └── Sub-schema: X013 — Time-related wage types
  └── Sub-schema: X020 — Factoring / Partial periods
  └── Sub-schema: XCU1 — Currency conversion
  └── Sub-schema: XEND — End of payroll processing
```

### Schema Editing (PE01)

- PE01: payroll schema editor
- Each line in schema: Function code + Parameter 1/2/3/4 + Description
- Key functions:

| Function | Description |
|----------|-------------|
| COPY | Include sub-schema |
| BLOCK | Begin / end block (BEG/END) |
| IF | Conditional processing |
| ACTIO | Call to a PCR (Personnel Calculation Rule) |
| P0001 | Read infotype 0001 |
| P0008 | Read infotype 0008 (basic pay) |
| GEN | Generate wage types from time data |
| MULTI | Multiplication of wage types |

---

## PCR (Personnel Calculation Rule) Logic

### PCR Structure (PE02)

Each PCR processes wage types through:
1. Selection of wage type(s)
2. Reading of variables
3. Conditional operations
4. Output / result

### Key PCR Operations

| Operation | Description |
|-----------|-------------|
| ADDWT | Add wage type to result table |
| SUBWT | Subtract wage type |
| MULTI | Multiply by factor |
| AMT=  | Set amount |
| NUM=  | Set number |
| ELIMI | Delete wage type from table |
| VARST | Set variable |

### Operation Classes

| Class | Table | Description |
|-------|-------|-------------|
| A | RT (Result Table) | Current payroll result |
| B | BT (Benefits Table) | Benefits wage types |
| T | IT (Input Table) | Input wage types |
| G | CRT (Cumulation Result) | Cumulated results |

---

## Wage Type Configuration Reference

### Wage Type Tables

| Table | Description |
|-------|-------------|
| V_T512W | Wage type characteristics (amount / number / rate) |
| V_T512W_B | Permissibility per infotype (IT0008, IT0014, IT0015) |
| V_T512W_D | Dialog characteristics (display on screen) |
| V_T512W_O | Processing classes (processing in schema) |
| T512Z | Cumulation wage types |

### Processing Classes (V_T512W_O)

| Class | Description |
|-------|-------------|
| 01 | Cumulation wage type (for cumulation to other wage types) |
| 20 | Net payment processing |
| 30 | Tax processing |
| 71 | Statistics reporting |
| 76 | Evaluation basis for average |

---

## Payroll Status Management (PA03)

### Payroll Status Flow

```
Initial
  → Released for payroll    (PA03: Release payroll)
  → Released for correction  (PA03: Release for correction — if errors found)
  → Exited                  (PA03: Exit payroll — after posting complete)
```

### PA03 Actions

| Action | Description | When |
|--------|-------------|------|
| Release payroll | Allow payroll run | Before PC00_Mxx_CALC |
| Release for correction | Allow master data changes after run | When errors found in log |
| Exit payroll | Close period — no more changes | After FI posting complete |
| Set payroll status back | Reset to earlier status | Emergency — document reason |

---

## FI/CO Posting Reference

### Mapping Chain

```
Wage type (V_T512W)
  → Processing class 20 attribute
    → Symbolic account (V_T52EL)
      → G/L account (SPRO: Payroll → Reporting for Posting → Set Up Symbolic Accounts → Assign G/L Accounts)
        → FI document (creditor: employee vendor / debtor: salary expense)
```

### Key Posting Tables

| Table | Description |
|-------|-------------|
| V_T52EL | Wage type → symbolic account assignment |
| T52EK | Symbolic account definition |
| OHKA* | Country-specific G/L account assignment |

### Cost Distribution (IT0027)

- Multiple cost centers / orders from one employee's pay
- Distribution by percentage or fixed amount
- If IT0027 not maintained: cost goes to IT0001 cost center
