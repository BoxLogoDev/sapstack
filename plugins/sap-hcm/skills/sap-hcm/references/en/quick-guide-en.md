<!-- Claude-authored draft (community review welcome) -->

# sap-hcm Quick Guide (English)

## 🔑 Environment Intake
1. HCM deployment (ECC HCM / H4S4 / SuccessFactors hybrid)
2. Country Payroll version
3. FI Posting integration?

## 📚 Essentials

### Personnel Administration
- **PA30**: Maintain infotypes
- **PA40**: Personnel actions (hire/leave/promotion)
- Key infotypes:
  - 0001 (org assignment), 0002 (personal data), 0006 (address)
  - 0008 (basic pay), 0014 (recurring deduction), 0015 (one-time)

### Time Management
- **PT60**: Time evaluation
- **PT01**: Work schedule rule
- **CAT2**: Time entry

### Payroll (country-specific)
- **PC00_M{cc}_CALC**: Payroll calculation
- **PC00_M{cc}_CDTA**: Payment data creation
- **PC00_M{cc}_CEDT**: Pay slip
- Tax reporting: country-specific withholding driver

### FI Posting
- **PC00_M99_CIPE**: Payroll → FI posting

## 🌍 Locale Considerations
- **National ID masking** mandatory (personal-data protection law)
- **Statutory insurances** (pension/health/employment/accident) auto-calc
- **Year-end tax adjustment** — country payroll standard process
- **Withholding tax tables** updated per tax-authority schedule
- **Retirement pension** (DB/DC) handling

## ⚠️ Cautions
- Personal-data access strictly restricted via **PFCG P_ORGIN** auth object
- **No production payroll changes** — strictly dev → QA → prod transport
- Year-end adjustment season → prepare for concurrent-user spike
