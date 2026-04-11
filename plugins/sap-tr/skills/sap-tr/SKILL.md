---
name: sap-tr
description: >
  This skill handles SAP Treasury and Cash Management including liquidity
  forecasting, cash position reporting, bank statement processing, payment runs,
  house bank configuration, and treasury instruments. Use when user mentions
  TR, treasury, FF7A, FF7B, liquidity, cash position, FLQDB, FLQITEM, bank statement,
  MT940, FEBP, F110, house bank, FI12, payment method, DME, FLQC10, BCM,
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

**Step 1 — Check planning level assignment**
- FLQDB table → planning level per business transaction / G/L account / company code
- Each transaction type (vendor payment, customer receipt, bank transfer) must have a planning level

**Step 2 — Check FLQITEM line items**
- SE16N → FLQITEM → filter by company code + planning date range
- Identify if items exist but are not showing in FF7A/FF7B (display filter issue)
- Or if items are genuinely missing (source not generating entries)

**Step 3 — Recalculate (FLQC10)**
- Full recalculation: FLQC10 → company code → all planning levels → delete + rebuild
- Delta upload: FLQC10 → specific date range → faster, use for daily correction
- Use full recalculation after master data or config change

### Planning Level Strategy

| Level Type | Description | Source |
|-----------|-------------|--------|
| Actual | Bank-confirmed transactions | Bank statement (FEBP) |
| Memo records | Manually entered forecast | FF63 (memo records) |
| Forecast | Open items / expected payments | AP/AR open items |
| Plan | Long-range planning | Manual or interface |

---

## 3. Bank Statement Processing

### MT940 Import Flow

```
Bank file received → FF.5 (import) / FEBP (post) → Parsing → Account assignment → FI posting
```

**FF.5**: Electronic bank statement import (creates internal format)
**FEBP**: Post bank statement → creates FI clearing documents

### Common Bank Statement Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "No account found" | G/L account not mapped to bank account | FI12 → house bank → G/L account |
| "Posting rule not found" | Transaction type not mapped | OT83 → transaction types → posting rules |
| "Amount mismatch" | Tolerance exceeded for automatic clearing | FBZP → tolerance settings |
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
□ Sufficient balance in bank GL account
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
| Bank statement | FEBP / FF.5 | Same + CAMT.053 support |
| Cash position report | FF7A | Fiori: Cash Position app |
| Liquidity forecast | FF7B | Fiori: Liquidity Forecast app |
| Bank communication | EDI/file | SAP Multi-Bank Connectivity (MBC) |
| Check management | FCHI/FCH5 | Same T-codes (limited change) |

**One Exposure Hub**: unified data layer for all cash-relevant transactions
- Feeds from: FI open items, payment runs, bank statements, TRM deals, MM orders
- FLQDB/FLQITEM still exist but as feed into One Exposure framework

---

## 8. References

- `references/liquidity-guide.md` — planning level setup guide, FLQC10 recalculation steps
