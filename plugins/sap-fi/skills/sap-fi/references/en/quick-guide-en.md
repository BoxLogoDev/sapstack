<!-- Claude-authored draft (community review welcome) -->

# sap-fi Quick Guide (English)

> Concise quick reference for SAP FI (Financial Accounting). Full details in `SKILL.md` and `references/closing-checklist.md`.

## 🔑 Environment Intake

1. SAP release (ECC 6.0 EhPx / S/4HANA 19xx-23xx)
2. Deployment (on-premise / RISE / Cloud PE)
3. Fiscal year variant (K4 calendar or custom)
4. Company code (user provides — never assume)
5. Error message number + T-code where it occurred

## 📚 Core Modules

### AP — Accounts Payable
- **FB60 / MIRO** posting errors:
  - Tax code unassigned → **FTXP** check
  - Tolerance exceeded → **OMR6** limit per company code
  - GR-based IV mismatch → PO item Invoice tab vs goods receipt qty
- **F110** payment run:
  - Payment method missing (LFB1-ZWELS)
  - House bank not determined → **FBZP**
  - DME not generated → **DMEE** tree per payment method
- Withholding tax (extended) — **WTAD** + SPRO assignment

### AR — Accounts Receivable
- **FD32** (ECC) / **UKM_BP** (S/4 FSCM): credit management
- **F150** dunning → **FBMP** dunning procedure
- **VKM1 / VKM3**: release credit-blocked orders / deliveries
- Down payment: **F-37** (request), **F-29** (post), **F-39** (clear)

### GL — General Ledger
- Field status conflict — three sources: **OBC4** (doc type) + **OB14** (posting key) + **FS00** (account)
- Foreign currency valuation — **FAGL_FC_VAL** (always Test Run first)
- Automatic clearing — **F.13** (Test Run first)
- Balance carry forward — **F.16** (ECC) / **FAGLGVTR** (New G/L)

### AA — Asset Accounting
- Depreciation run — **AFAB**
- Asset transfer — **ABUMN**
- Year-end **AJAB** (close fiscal year)

## 🚨 Common Issues

### "FB01 won't post to vendor reconciliation account"
- Root: LFB1-AKONT is a recon account
- Fix: Use **FB60** (vendor invoice) or Special G/L (F-47/F-48). FB01 cannot post directly to recon accounts.

### "F110 selects nothing"
- Vendor missing payment method (XK03 → LFB1.ZWELS empty)
- Or items not yet due — check open item due date
- Or company code not active in payment run

### "Tax code mismatch on MIRO"
- Tax code disabled for posting (FTXP)
- Or company code-specific tax procedure changed
- Reverse + re-enter with correct code

### "Period closed — cannot post"
- OB52 → adjust authorization group (don't open prior period casually)
- Cross-check year-end carry forward status (F.16 / FAGLGVTR)

## 🔧 Key T-codes Cheatsheet

| Area | T-code |
|---|---|
| Doc posting | FB01, FB50, FB60, FB70 |
| Doc display | FB03 |
| GL line items | FBL3N (LI), FAGLB03 (balance) |
| Vendor LI | FBL1N |
| Customer LI | FBL5N |
| Payment | F110, F-58 |
| Closing | F.05, F.13, F.16, FAGL_FC_VAL, FAGLGVTR |
| Period | OB52 |
| Config | FBZP, FBMP, FTXP, OMR6, OBYC |
| Recon | F.50 |

## ECC vs S/4HANA Highlights

- **GL**: BSEG/BKPF → ACDOCA (Universal Journal in S/4)
- **AR Credit**: FD32 → UKM_BP (FSCM)
- **AA**: classic AA → New Asset Accounting (mandatory in S/4)
- **Bank**: FI12 → BAM (Bank Account Management)

## ⚠️ Out of Scope

- Sales invoice (use SD)
- Cost center accounting (use CO)
- Production cost tracking (use CO + PP)
- Treasury (use TR plugin)

## 📚 References

- `closing-checklist.md` — month/quarter/year-end checklist
- `tcode-reference.md` — full T-code list
- `../../../sap-co/skills/sap-co/SKILL.md` — Cost accounting integration
- `../../../sap-tr/skills/sap-tr/SKILL.md` — Treasury integration
