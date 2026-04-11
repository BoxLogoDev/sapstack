# Month-End / Year-End Closing Checklist

## Day 1–3: Pre-Close Activities

| Step | Activity | T-code | Responsible | ECC | S/4HANA |
|------|----------|--------|-------------|-----|---------|
| 1 | Close MM posting period | MMPV | MM Team | ✓ | ✓ |
| 2 | Allow previous period posting (emergency) | MMRV | MM Team | ✓ | ✓ |
| 3 | Review AP aging report | S_ALR_87012085 | AP Team | ✓ | ✓ |
| 4 | Review AR aging report | S_ALR_87012078 | AR Team | ✓ | ✓ |
| 5 | Check parked documents (AP) | FBV0 / MIR7 | AP Team | ✓ | ✓ |
| 6 | Check parked documents (AR) | FBV0 | AR Team | ✓ | ✓ |

## Day 3–5: Clearing and Reconciliation

| Step | Activity | T-code | Responsible | ECC | S/4HANA |
|------|----------|--------|-------------|-----|---------|
| 7 | GR/IR analysis | MB5S | MM/FI Team | MB5S | GRIR Fiori |
| 8 | GR/IR clearing — simulate | MR11 (test) | MM/FI Team | ✓ | ✓ |
| 9 | GR/IR clearing — actual | MR11 | MM/FI Team | ✓ | ✓ |
| 10 | Open item clearing — simulate | F.13 (test) | GL Team | ✓ | ✓ |
| 11 | Open item clearing — actual | F.13 | GL Team | ✓ | ✓ |
| 12 | Manual bank statement reconciliation | FF67 / FEBP | Treasury | ✓ | ✓ |

## Day 5–7: Valuation and Adjustment

| Step | Activity | T-code | Responsible | ECC | S/4HANA |
|------|----------|--------|-------------|-----|---------|
| 13 | Foreign currency valuation — simulate | F.05 / FAGL_FC_VAL | GL Team | F.05 | FAGL_FC_VAL |
| 14 | Foreign currency valuation — post | F.05 / FAGL_FC_VAL | GL Team | F.05 | FAGL_FC_VAL |
| 15 | Intercompany reconciliation | F.19 / FBICR | GL Team | ✓ | ✓ |
| 16 | Post accruals / deferrals | FBS1 | GL Team | ✓ | ✓ |
| 17 | Verify accrual reversal settings | FBS1 → reversal date | GL Team | ✓ | ✓ |

## Day 7–10: Costing and Allocation

| Step | Activity | T-code | Responsible | ECC | S/4HANA |
|------|----------|--------|-------------|-----|---------|
| 18 | Asset depreciation — test run | AFAB (test) | AA Team | ✓ | ✓ |
| 19 | Asset depreciation — post | AFAB | AA Team | ✓ | ✓ |
| 20 | Check depreciation log | AFBP | AA Team | ✓ | ✓ |
| 21 | CO assessment cycle — test | KSU5 (test) | CO Team | ✓ | ✓ |
| 22 | CO assessment cycle — actual | KSU5 | CO Team | ✓ | ✓ |
| 23 | CO distribution cycle — actual | KSV5 | CO Team | ✓ | ✓ |
| 24 | Material Ledger period-end | CKMLCP | CO/MM Team | Optional | Mandatory |

## Day 10–15: Reporting and Close

| Step | Activity | T-code | Responsible | ECC | S/4HANA |
|------|----------|--------|-------------|-----|---------|
| 25 | Trial balance review | FS10N / S_ALR_87012284 | GL Team | ✓ | ✓ |
| 26 | Profit center report review | S_ALR_87013326 | CO Team | ✓ | ✓ |
| 27 | Financial statements | F.01 | GL Team | ✓ | ✓ |
| 28 | Close FI posting period | OB52 | FI Admin | ✓ | ✓ |

## Year-End Additional Steps

| Step | Activity | T-code | Responsible | ECC | S/4HANA |
|------|----------|--------|-------------|-----|---------|
| YE-1 | Asset fiscal year close | AJAB | AA Team | ✓ | ✓ |
| YE-2 | Open new asset fiscal year | AJRW | AA Team | ✓ | ✓ |
| YE-3 | Balance carryforward (GL) | F.16 / FAGLGVTR | GL Team | F.16 | FAGLGVTR |
| YE-4 | Balance carryforward (AA) | Automatic after AJRW | AA Team | ✓ | ✓ |
| YE-5 | Open new fiscal year periods | OB52 | FI Admin | ✓ | ✓ |

## Notes

- **ALWAYS simulate** before actual run for: MR11, F.13, FAGL_FC_VAL, AFAB, KSU5, KSV5
- MM period (MMPV) **must close before** FI period (OB52)
- Asset depreciation (AFAB) **must run before** CO allocations
- Balance carryforward (YE-3) runs **after** all year-end FI postings are final
