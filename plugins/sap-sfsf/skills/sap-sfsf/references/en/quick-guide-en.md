<!-- Claude-authored draft (community review welcome) -->

# sap-sfsf Quick Guide (English)

## 🔑 Environment Intake
1. SuccessFactors module (EC / ECP / Recruiting / LMS / Performance)
2. Data Center (region — e.g. APJ/EU/US)
3. ECC/H4S4 integration (hybrid / full cloud)

## 📚 Essentials

### Employee Central (EC)
- **Admin Center → Manage Employee Files**
- Foundation Objects: Legal Entity, Business Unit, Division, Department
- MDF (Metadata Framework): custom object creation
- Business Rules: declarative logic (workflow trigger, value calc)

### Role-Based Permissions (RBP)
- **Manage Permission Roles**
- **Permission Groups** — dynamic groups (query-based)
- Large-enterprise note: hierarchical approval (CEO→div head→team lead→member) is complex

### ECP (Employee Central Payroll)
- Runs country HR payroll logic cloud-hosted
- Shares codebase with H4S4 on-prem payroll

### Recruiting
- Job Requisition Templates
- Application Form Templates
- Candidate Data Model

### Integration
- **Integration Center** — SFSF built-in integration tool
- **SAP Cloud Integration (CPI)** — BTP-based
- OData API (Query + Upsert)

## 🌍 Locale Considerations
- **National ID** — legal review on regional DC storage permissibility
- **Statutory insurance** — calculated only when routed to ECP
- **Localized UI** — SFSF standard i18n support
- **Year-end tax adjustment** — handled by ECP or on-prem H4S4 (SFSF itself doesn't compute)

## ⚠️ Cautions
- **Admin Center permission changes** — test in Preview instance first
- **Data model changes** (XML import/export) — backup mandatory
- Locale-specific fields — use Picklist (no hardcoding)

## 📖 Migration Guide
See `../migration-path.md`.
