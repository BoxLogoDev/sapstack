<!-- Claude-authored draft (community review welcome) -->

# sap-gts Quick Guide (English)

> SAP GTS (Global Trade Services) — import/export trade compliance summary.

## 🔑 Environment Intake
1. GTS deployment (Standalone / Embedded in S/4)
2. Customs authority e-clearing integration?
3. Transaction type (export / import / both)
4. FTA target countries

## 📚 Core Areas

### Compliance
- **SPL Screening** — sanctioned-party list search
- **Embargo Check** — embargoed countries
- **Legal Control** — license requirement

### Customs
- **Export Declaration**
- **Import Declaration**
- **Transit** — pass-through / transshipment

### Risk
- **L/C Management** — letter of credit
- **Preference** — origin / FTA
- **Restitution** — export refund

## 🌍 Locale Considerations
- **Customs e-clearing portal** (national customs authority)
- **HS code** — country-specific tariff code length
- **Strategic goods control** — export-control regime
- **FTA network** — origin certification (numerous agreements)

## 📋 T-codes
- `/SAPSLL/*` namespace
- e.g. `/SAPSLL/MENU_LEGALR3`, `/SAPSLL/COMPLR3`, `/SAPSLL/PRODUCT_R3`

## ⚠️ Cautions
- CA certificate (STRUST) registration mandatory
- Wrong HS code → tariff back-charge
- Origin criteria differ per FTA

## 🤖 Related
- `/plugins/sap-sd` — export
- `/plugins/sap-mm` — import
- `/agents/sap-integration-advisor.md` — customs e-clearing integration
