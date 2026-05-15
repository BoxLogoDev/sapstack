<!-- Claude-authored draft (community review welcome) -->

# sap-co Quick Guide (English)

## 🔑 Environment Intake
1. SAP release (ECC / S/4HANA) — S/4 defaults to Account-based CO-PA
2. Company code + Controlling Area
3. Product costing method (Standard / Actual / Mixed)
4. CO-PA type (Costing-based / Account-based)

## 📚 Module Essentials

### CCA (Cost Center Accounting)
- **KS01/KS02**: Create/change cost center
- **KSU5**: Assessment
- **KSV5**: Distribution
- Planning: **KP06** (by cost element), **KP26** (activity type)

### PCA (Profit Center Accounting)
- **KE51**: Create profit center
- S/4HANA: PCA integrated with New G/L — not a separate ledger
- **KE5Z**: PCA actual line items

### IO (Internal Order)
- **KO01**: Create IO
- **KO88**: Settlement
- Mind Real vs Statistical distinction

### CO-PC (Product Costing)
- **CK11N**: Create cost estimate
- **CK24**: Price update (apply standard cost)
- **KKS1/KKS2**: Variance analysis
- **CKMLCP** (S/4): Actual Costing Run

### CO-PA (Profitability Analysis)
- **KE30**: Run report
- S/4HANA: **Account-based CO-PA** is default — uses ACDOCA
- ECC: Costing-based CO-PA uses separate tables (CE1~CE4)

## 🌍 Locale Considerations
- **Management accounting + tax reconciliation** often required together (large enterprises)
- **Standard cost calculation** is month-close critical path — CK24 timing matters
- **Material cost volatility**: high raw-material FX swings → consider Actual Costing

## 🤖 Related Commands
- `/sap-fi-closing` (CO depends on FI close)

## 📖 References
- `../period-end.md`
