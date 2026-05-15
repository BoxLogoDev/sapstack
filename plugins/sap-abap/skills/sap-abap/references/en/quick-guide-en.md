<!-- Claude-authored draft (community review welcome) -->

# sap-abap Quick Guide (English)

> Concise quick reference for SAP ABAP development. Full details in `SKILL.md` and `references/clean-core-patterns.md`.

## 🔑 Environment Intake

1. ABAP Platform (ECC release or S/4HANA release year)
2. HANA-native development scope (CDS, AMDP, RAP)
3. ATC Check Variant configured

## 📚 Core Development Topics

### Clean Core Principle
- Never modify standard SAP objects directly
- Use **BAdI** / **Enhancement Point** / **CDS View extension** instead
- Access Key usage is a **warning sign** (audit trail)

### HANA-Optimized SQL
- ❌ `SELECT * FROM ...`
- ✅ Select only required columns + `INTO TABLE`
- `FOR ALL ENTRIES` caveats:
  - Check empty table before usage
  - Deduplicate with `SORT ... DELETE ADJACENT DUPLICATES`
  - Small lookups → use **JOIN** instead
- **Push-down** — delegate logic to HANA via CDS View, AMDP

### CDS Views
- **@ObjectModel.text.element** — language-independent text
- **@Semantics.amount.currencyCode** — currency field annotation
- **@EndUserText.label** — i18n support

### RAP (RESTful ABAP Programming)
- Business Object → Service Definition → Service Binding
- Behavior Implementation
- Fiori Elements auto-generation

### Performance Analysis
- **ST05** — SQL Trace
- **SAT** — Runtime Analysis (replaces SE30)
- **ST22** — Dump analysis
- **SM50 / SM66** — Work Process monitoring

## 🌍 Locale Considerations
- **Naming Guideline** — enterprise customers often enforce Z*/Y* per BU
- **PII protection** — never log SSN/contact numbers, mask on screen
- **Unicode dumps**: CONVT_CODEPAGE — SNOTE 2452523
- **Message Class translation** gaps cause MESSAGE_TYPE_X errors

## ⚠️ Forbidden Practices

- ❌ Modifying standard SAP objects (Clean Core violation)
- ❌ Running SE38 directly in production (except whitelisted reports)
- ❌ Missing `AUTHORITY-CHECK` (SOX audit gap)
- ❌ Concatenating user input into Dynamic SQL (SQL Injection)

## 🤖 Code Review Delegation
```
/sap-abap-review <file path or object name>
```
→ `sap-abap-developer` sub-agent reviews against Clean Core + HANA + ATC

## 📖 References
- `../clean-core-patterns.md`
- `../code-review-checklist.md`
