<!-- Claude-authored draft (community review welcome) -->

# sap-tr Quick Guide (English)

## 🔑 Environment Intake
1. SAP release + TRM (Treasury Risk Management) active?
2. Transaction currencies (local/USD/JPY ...)
3. Bank interface method (MT940 / H2H / SaaS)

## 📚 Essentials

### Cash Management
- **FF7A**: Cash position
- **FF7B**: Liquidity forecast
- **FLQDB / FLQITEM**: Liquidity Item master
- Bank statement upload: **FF_5**, **FEBAN**

### Payment
- **F110**: Payment run (shared with FI)
- **DMEE**: Payment medium format (bank-specific)
- **FI12 / BAM (S/4)**: House bank management

### Bank Integration
- Major banks often have **proprietary firm-banking formats**
- Non-MT940 **XML/EDI** common in many cases
- Local clearing-house e-banking standards apply
- Auto-debit, virtual accounts often need custom development

### TRM (optional)
- **FTR_CREATE**: Create financial transaction
- Derivatives (FX forward, IRS, CRS) accounting complex — IFRS disclosure care

## 🌍 Locale Considerations
- **Local-currency liquidity forecast** is the most common use case
- External FX rate feeds (central-bank/market rates) common in projects
- **Regulatory FX reporting**: cross-border transaction reporting thresholds

## ⚠️ Cautions
- Production House Bank change requires Transport + simulation
- MT940 test environment mandatory — no production first-try
