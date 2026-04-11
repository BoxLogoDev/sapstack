# FI T-Code Reference

## AP — Accounts Payable

| T-code | Description |
|--------|-------------|
| FB60 | Enter vendor invoice |
| FB65 | Enter vendor credit memo |
| FV60 | Park vendor invoice |
| MIR7 | Park invoice (MM-IV) |
| MIRO | Enter invoice (MM-based) |
| FK01 | Create vendor (accounting) |
| FK02 | Change vendor (accounting) |
| XK01 | Create vendor (centrally) |
| XK02 | Change vendor (centrally) |
| FBL1N | Vendor line items display |
| F110 | Automatic payment run |
| F-47 | Down payment request (vendor) |
| F-48 | Post down payment (vendor) |
| F-54 | Clear down payment (vendor) |
| F-55 | Statistical posting (vendor guarantee) |
| WTAD | Withholding tax — country assignment |
| FKMT | Vendor master changes (dual control) |
| FK05 | Block / unblock vendor (accounting) |
| FBZP | Payment program configuration |
| FI12 | House bank / bank account config |

## AR — Accounts Receivable

| T-code | Description |
|--------|-------------|
| FB70 | Enter customer invoice |
| FB75 | Enter customer credit memo |
| FV70 | Park customer invoice |
| FD01 | Create customer (accounting) |
| FD02 | Change customer (accounting) |
| XD01 | Create customer (centrally) |
| XD02 | Change customer (centrally) |
| FBL5N | Customer line items display |
| F150 | Dunning run |
| F-37 | Down payment request (customer) |
| F-29 | Post down payment (customer) |
| F-39 | Clear down payment (customer) |
| FD32 | Customer credit limit (ECC) |
| UKM_MY_LIMIT | Customer credit limit (S/4HANA FSCM) |
| VKM1 | Release blocked sales orders |
| VKM3 | Release blocked deliveries |

## GL — General Ledger

| T-code | Description |
|--------|-------------|
| FB01 | Post document (general) |
| F-02 | Enter GL document |
| FB50 | Enter GL account posting |
| FBV0 | Post parked document |
| FBS1 | Enter accrual / deferral document |
| F.81 | Reverse accrual / deferral documents |
| F.13 | Automatic clearing |
| F.16 | Balance carryforward (ECC) |
| FAGLGVTR | Balance carryforward (S/4HANA) |
| F.05 | Foreign currency valuation (ECC) |
| FAGL_FC_VAL | Foreign currency valuation (S/4HANA) |
| F.19 | Intercompany reconciliation |
| OB52 | Open/close posting periods |
| FS00 | G/L account master |
| OBC4 | Field status groups (document types) |
| OB14 | Field status groups (posting keys) |
| OBYA | Intercompany clearing accounts |

## AA — Asset Accounting

| T-code | Description |
|--------|-------------|
| AS01 | Create asset master |
| AS02 | Change asset master |
| AS03 | Display asset master |
| AS91 | Create legacy asset (with values) |
| F-90 | Acquisition posting (external) |
| ABUMN | Asset transfer |
| ABAVN | Asset retirement without revenue |
| ABAON | Asset retirement with revenue |
| AFAB | Depreciation run |
| AFBP | Depreciation posting log |
| AJAB | Fiscal year close (assets) |
| AJRW | Open new fiscal year (assets) |
| AW01N | Asset explorer |
| AO90 | Asset G/L account determination |
| AFAMA | Depreciation key configuration |

## Configuration

| T-code | Description |
|--------|-------------|
| OBY6 | Company code global settings |
| OBC4 | Document type field status |
| OB14 | Posting key field status |
| FS00 | G/L account (chart of accounts) |
| FBZP | Payment methods / bank determination |
| FI12 | House banks |
| OBYA | Intercompany clearing config |
| OBXT | AP Special G/L account determination |
| OBXR | AR Special G/L account determination |
| FTXP | Tax codes |
| OBB8 | Payment terms |
| OBD3 | Customer account groups |
| OBD4 | Vendor account groups |
| OMR6 | Invoice tolerance (MM-IV) |

## Reports

| T-code | Description |
|--------|-------------|
| F.01 | Financial statements |
| S_ALR_87012284 | Balance sheet / P&L |
| S_ALR_87012085 | AP aging analysis |
| S_ALR_87012078 | AR aging analysis |
| S_ALR_87012132 | Cash position |
| S_ALR_87012133 | Liquidity forecast |
| MB5S | GR/IR account analysis |
| F.08 | GL balance |
| FS10N | G/L account balance display |
| FBL3N | G/L line items |
