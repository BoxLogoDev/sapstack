---
name: sap-fi
description: >
  This skill handles all SAP FI (Financial Accounting) tasks including document
  posting errors, account determination, period and year-end closing, vendor and
  customer master data, reconciliation accounts, tax configuration, withholding tax,
  special G/L transactions (down payments, guarantees), GR/IR management, foreign
  currency valuation, and asset accounting. Use this skill whenever the user mentions
  FI, GL, AP, AR, AA, FB01, F-02, FB60, MIRO, F110, period close, year-end, tax code,
  special G/L, down payment, GR/IR, asset, depreciation, AFAB, clearing, or posting error.
allowed-tools: Read, Grep
---

## 1. Environment Intake Checklist

When any FI issue is reported, collect before answering:

- SAP Release (ECC 6.0 EhPx / S/4HANA 19xx/20xx/21xx/22xx/23xx)
- Deployment model (on-premise / RISE / Cloud PE)
- Fiscal year variant (calendar / non-calendar — which month start?)
- Error message number and T-code where it occurred
- Company code (user provides — never assume)

---

## 2. AP — Accounts Payable

Top issues with T-code + table-level diagnosis:

**Vendor invoice posting errors (FB60 / MIRO)**
- Tax code not assigned: check FTXP → tax procedure → company code assignment
- Tolerance exceeded: OMR6 → tolerance key per company code (amount / percentage)
- GR-based IV mismatch: PO item → invoice tab → GR-based IV flag vs. goods receipt qty

**Payment run (F110)**
- No items selected: check open item due date, payment method on vendor master (LFB1-ZWELS), house bank assigned
- House bank not determined: FBZP → bank determination → ranking order → house bank / account ID
- DME file not generated: DMEE → payment medium tree format assigned to payment method

**Withholding tax missing**
- WTAD → withholding tax type not assigned to company code
- SPRO → FI → Withholding Tax → Extended Withholding Tax → Company Code → Assign Withholding Tax Types

**Vendor master dual control**
- FKMT → pending changes awaiting second approval
- Check: LFA1/LFB1 tables → field change log

**Reconciliation account cannot be posted directly**
- Root cause: LFB1-AKONT is a recon account (FS00 → recon account type = K)
- Fix: use FB60 (vendor invoice) or Special G/L (F-47/F-48) — never FB01 direct

---

## 3. AR — Accounts Receivable

**Customer invoice**
- FB70 (FI direct) / VF01 (SD billing — preferred for SD-integrated flows)
- Dispute management: UDM_DISPUTE (S/4HANA FSCM)

**Dunning (F150)**
- Dunning procedure: FBMP → dunning levels, minimum amounts, interest
- Dunning area: company code → dunning area assignment
- Block from dunning: FD02 → correspondence tab → dunning block

**Credit management**
- ECC: FD32 → credit limit per credit control area
- S/4HANA FSCM: UKM_BP → credit segment → limit / rule-based check
- Release blocked orders: VKM1 (orders) / VKM3 (deliveries)

**Down payment process (AR)**
- Request: F-37 (Special G/L indicator F)
- Down payment: F-29 (post to Special G/L)
- Clear against invoice: F-39

---

## 4. GL — General Ledger

**Field status conflict (most restrictive rule wins)**
- Check three sources: OBC4 (document type FSG) + OB14 (posting key FSG) + FS00 (G/L account FSG)
- Rule: Required > Optional > Suppressed — if any source requires, field is required

**Posting period control**
- OB52 → period variant → open/close periods per account type (A/D/K/M/S)
- Special periods 13–16: year-end audit / tax adjustment periods
- Assign variant to company code: OBY6

**Balance carryforward**
- ECC: F.16 (carry forward P&L to retained earnings account)
- S/4HANA: FAGLGVTR (Universal Journal carryforward)
- Must run after all year-end postings are complete

**Foreign currency valuation**
- ECC: F.05 → per valuation method, G/L account selection
- S/4HANA: FAGL_FC_VAL → ledger-based, parallel currency support
- Valuation method config: OB59 → exchange rate type, loss/gain accounts

**Intercompany clearing**
- OBYA → due-to / due-from clearing accounts per company code pair
- Cross-company document: one header, postings in two company codes automatically

---

## 5. Special G/L Transactions (Universal)

| Type | Description | Vendor T-codes | Customer T-codes |
|------|-------------|----------------|------------------|
| A/F  | Down Payment Request | F-47 | F-37 |
| F    | Down Payment | F-48 | F-29 |
| —    | Down Payment Clearing | F-54 | F-39 |
| B/G  | Guarantee (statistical) | F-55 | F-49 |
| W/V  | Bills of Exchange | F-36 | F-33 |

Configuration check path:
- OBXT → AP Special G/L → automatic account determination
- OBXR → AR Special G/L → automatic account determination
- TBSLT → Special G/L indicator properties (noted item / statistical / free offsetting)

---

## 6. Asset Accounting — FI-AA

**Asset master creation**
- AS01 (new asset) / AS91 (legacy data transfer with historical values)
- Asset class drives: depreciation key, useful life, G/L accounts (AO90)

**Asset postings**
- Acquisition: F-90 (external purchase) / MIGO 101+PO (goods receipt → capitalization)
- Transfer between assets: ABUMN (within same company code)
- Partial/full retirement: ABAVN (without revenue) / ABAON (with revenue)

**Depreciation run (AFAB)**
- ALWAYS run test mode first → review AFBP (depreciation posting log) for errors
- Repeat run: if depreciation posted with errors → AFAB → repeat run for period
- Depreciation key config: AFAMA → period control method → base value

**Year-end asset procedures**
- AJAB: fiscal year close for asset accounting → prevents further postings to closed year
- AJRW: open new fiscal year → required before any posting in new year

**S/4HANA difference**
- New Asset Accounting only (classic AA not supported)
- Parallel ledgers mandatory for multi-GAAP scenarios
- APC values stored in ACDOCA (Universal Journal) — not separate AA tables

---

## 7. GR/IR Account Management

Universal clearing process:

1. **MB5S** → analyze GR/IR balances → identify aged / mismatched items
2. **MR11** → automatic GR/IR clearing proposal (always simulate first — "test run")
3. Manual reversal: if PO cancelled without GR → reverse GR document (MIGO 102)
4. Month-end accrual: if GR posted but no invoice yet → accrue via FBS1 (reverse next period with F.81)

**S/4HANA**: GRIR Fiori app (Manage GR/IR Accounts) replaces MB5S for operational use

---

## 8. Universal Month-End / Year-End Closing Sequence

| Step | Activity | T-code | ECC | S/4HANA |
|------|----------|--------|-----|---------|
| 1 | Close MM period | MMPV | ✓ | ✓ |
| 2 | AP aging review | S_ALR_87012085 | ✓ | ✓ |
| 3 | AR aging review | S_ALR_87012078 | ✓ | ✓ |
| 4 | GR/IR analysis | MB5S / MR11 | MB5S | GRIR Fiori |
| 5 | Open item clearing (simulate) | F.13 | ✓ | ✓ |
| 6 | Open item clearing (actual) | F.13 | ✓ | ✓ |
| 7 | FC valuation | F.05 / FAGL_FC_VAL | F.05 | FAGL_FC_VAL |
| 8 | Intercompany recon | F.19 / FBICR | ✓ | ✓ |
| 9 | Accruals (reverse next period) | FBS1 → F.81 | ✓ | ✓ |
| 10 | Asset depreciation (test first) | AFAB | ✓ | ✓ |
| 11 | CO allocations | KSU5 / KSV5 | ✓ | ✓ |
| 12 | Financial statements | F.01 / S_ALR_87012284 | ✓ | ✓ |
| 13 | Balance carryforward (year-end) | F.16 / FAGLGVTR | F.16 | FAGLGVTR |

---

## 9. ECC vs S/4HANA Key Differences

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| GL line item tables | BSEG + BSID/BSAD/BSIK/BSAK | ACDOCA (Universal Journal) |
| Asset Accounting | Classic AA or New AA | New Asset Accounting only |
| Credit management | FD32 | FSCM / UKM_MY_LIMIT |
| Dunning | F150 | F150 (same) |
| FC Valuation | F.05 | FAGL_FC_VAL |
| Balance carryforward | F.16 | FAGLGVTR |
| Material Ledger | Optional | Mandatory |
| Profit Center | EC-PCA (optional) | Mandatory in Universal Journal |
| GR/IR monitoring | MB5S | GRIR Fiori app |

---

## 10. References

- `references/tcode-reference.md` — complete FI T-code list by area (AP / AR / GL / AA / Config / Reports)
- `references/closing-checklist.md` — printable month-end closing checklist with day-by-day breakdown
