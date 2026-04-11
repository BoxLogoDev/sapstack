---
name: sap-sfsf
description: >
  This skill handles SAP SuccessFactors (SFSF) topics including Employee Central
  (EC), Employee Central Payroll (ECP), Recruiting Management, Onboarding, Learning
  Management System (LMS), Performance and Goals, Succession and Development,
  Compensation, People Analytics, Workforce Planning, and integration with SAP
  S/4HANA or on-premise HCM. Use when user mentions SuccessFactors, SFSF, Employee
  Central, EC, ECP, Recruiting, Onboarding, Learning, Performance, Goals,
  Compensation, People Analytics, MDF, position management, business rules,
  role-based permissions, RBP, integration center, compound employee API, SFAPI,
  OData API, iFlow, HCM migration, talent management, cloud HR, Employee Central Payroll.
allowed-tools: Read, Grep
---

## 1. Environment Detection

```
□ Which SF modules are active? (EC / ECP / Recruiting / LMS / Performance / Compensation / etc.)
□ Is on-premise HCM still running? (hybrid or full cloud?)
□ Integration middleware? (SAP Integration Suite / BTP / Dell Boomi / MuleSoft / other)
□ SF datacenter region? (affects API base URLs, data residency, release timing)
□ Release version? (SF releases twice per year: 1H = March/April, 2H = September/October)
```

---

## 2. SAP SuccessFactors Module Map

```
Core HR & Payroll
├── Employee Central (EC)            ← System of record — replaces PA/OM
│   ├── Position Management          ← Replaces OM positions
│   ├── Time Off                     ← Replaces IT2001/2002 (partial)
│   └── Time Tracking                ← Replaces PT60 (partial)
└── Employee Central Payroll (ECP)   ← SAP payroll engine, SF UI

Talent Management
├── Recruiting Management (RCM)      ← Job req → offer → hire
├── Onboarding 2.0                   ← New hire experience
├── Learning (LMS)                   ← Training, compliance, certifications
├── Performance & Goals (PMGM)       ← Goal setting, reviews, ratings
├── Succession & Development         ← Talent pool, career development
└── Compensation                     ← Merit, bonus, equity planning

Analytics & Planning
├── People Analytics                 ← Stories (reports), tiles, dashboards
└── Workforce Planning               ← Headcount scenarios, workforce modeling
```

---

## 3. Employee Central (EC) Core Concepts

**Data model** (fundamentally different from HCM infotypes):
- **Person** → **Employment** → **Job Information** (portlets, not infotypes)
- All data is date-effective — changes create new effective-dated records
- No "time constraint" concept — any portlet can have any number of records

**Key framework components**:
- **MDF (Metadata Framework)**: generic object type → create custom business objects
- **Business Rules**: condition-based automation → triggered by data changes
- **Workflows**: approval chains for master data changes → multi-step, conditional routing

**Admin configuration areas**:
- Manage Business Configuration (BCUI): picklist values, field labels, field visibility
- Role-Based Permissions (RBP): who can see/edit what for whom
- Manage Data: portlet field configuration, required fields

### Common EC Issues

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Field not visible to user | RBP field-level permission missing | Admin Center → Permission Roles → User Permissions → portlet → field |
| Workflow not triggered | Business rule condition false / target population wrong | Check rule trigger; verify employee in target population |
| Hire wizard — position not found | Position not open / not active / date mismatch | Check position in Manage Positions: open headcount flag, effective dates |
| Data change not saved | Required field empty / validation rule failed | Check completeness; review business rule validation |

---

## 4. Employee Central Payroll (ECP)

**Architecture**: SAP ABAP payroll engine embedded in SF-managed environment

### ECP vs On-Premise HCM Payroll

| Aspect | On-Premise HCM | Employee Central Payroll (ECP) |
|--------|---------------|-------------------------------|
| UI | SAP GUI (PA03, PC00) | Fiori Payroll Control Center (PCC) |
| Engine | ABAP payroll engine | Same ABAP engine |
| Access | Full SE38 / SE80 | Restricted managed environment |
| Schemas/PCRs | Direct PE01/PE02 | Same logic — limited direct edit |
| Monitoring | PA03 status | PCC dashboard |
| FI posting | PC00_Mxx_CIPE | Same — triggered from PCC |

### ECP Monitoring

- **Payroll Control Center (PCC)**: central monitoring → replaces PA03 for status management
- Replication monitor: Admin Center → Monitor Replication → EC → ECP sync status
- Pay statement integration: EC → Payslip portlet → pulls from payroll cluster
- OAuth 2.0 config: report **RP_HRSFEC_PAY_OAUTH_CONFIG** automates setup

### Common ECP Issues

| Issue | Fix |
|-------|-----|
| Employee not in payroll | Check EC→ECP replication: Admin Center → Monitor Job |
| Payroll error | PCC → payroll log → same structure as PC00 log → wage type / schema |
| FI posting failed | Check symbolic account → G/L mapping; cost center assignment in EC Job Info |
| "Employee not replicated" | Check employee hire status in EC; replication rules in integration |

---

## 5. Recruiting Management (RCM)

**Core flow**:
```
Job Requisition → Sourcing → Candidate Application
→ Screening → Interview Scheduling → Offer → Hire (EC)
```

**Key configuration areas**:
- Requisition template: field visibility, approval workflow definition
- Candidate profile template: application form fields, screening questions
- Offer letter template: merge tokens mapping to requisition/candidate data
- Job board posting: Indeed, LinkedIn, Glassdoor connector setup

**Common issues**:

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Approval not routing | Proxy settings / dynamic group membership | Check workflow: who = target user; is approval enabled? |
| Candidate status stuck | Pipeline configuration missing transition | Check recruiting pipeline: status set rule config |
| Offer letter merge blank | Token not mapped to data source | Review offer letter template: token → data source mapping |

---

## 6. Role-Based Permissions (RBP) — Cross-Module

RBP is the **universal access control** across all SF modules:

```
Permission Group (WHO) → Permission Role (WHAT) → Target Population (FOR WHOM)
```

**Troubleshooting access issues**:

1. Admin Center → Manage Permission Roles → find the relevant role
2. **User Permissions** tab → check which features/fields are granted
3. **Grant this role to** → which permission group is assigned
4. **Permission group** → which users or dynamic group are members
5. For field-level: Employee Data section → specific portlet → field list

**Standard role patterns**:

| Role Type | Typical Permissions | Target Population |
|-----------|--------------------|--------------------|
| HR Admin | Full read/write on all employee data | Business unit / location |
| Manager | Read/write own direct reports; read org | Direct and indirect reports |
| Employee | Self-service portlets only | Self only |

---

## 7. Integration Scenarios

### SF ↔ S/4HANA On-Premise (Hybrid)

```
EC (system of record) → SAP Integration Suite (iFlow) → S/4HANA
  Employee replication → update cost center, create BP/vendor
  Payroll posting → FI document in S/4HANA
```

Pre-built integration content: **SAP Business Accelerator Hub** → SuccessFactors section
Key iFlows: Employee Replication, Cost Center Replication, Payroll Posting

### SF APIs

| API Type | Usage | Access |
|----------|-------|--------|
| OData V2/V4 | Entity CRUD operations | SF API Explorer (api.sap.com) |
| SFAPI (SOAP) | Legacy — some entities only support SFAPI | SF API Explorer |
| Compound Employee API | Bulk employee data extraction | Scheduled job or on-demand |
| Integration Center | No-code integration builder | Admin Center → Integration Center |

### Common Integration Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| "Employee not found in target" | Replication lag or mapping error | Wait 30 min; check replication log |
| "Cost center does not exist" | S/4HANA master data not yet created | Create cost center first in S/4HANA |
| "Auth error 401" | OAuth2 token expired | Admin Center → OAuth2 → regenerate client credentials |
| "Field mapping error" | Source field value not mapped to target | Review iFlow mapping / Integration Center field mapping |

---

## 8. HCM → SuccessFactors Migration Path

### Phased Approach (Most Common)

```
Phase 1 — Talent Hybrid
  Keep PA / OM / PY on-premise
  Add SF Recruiting + Learning + Performance
  Connect via SAP Integration Suite

Phase 2 — Core Hybrid
  Migrate PA / OM to Employee Central
  EC becomes system of record
  Keep payroll on-premise or move to ECP

Phase 3 — Full Cloud (Optional)
  Migrate payroll to ECP
  Decommission on-premise HCM
  Full SF suite operational
```

### Migration Tools

- EC Data Migration Templates (HRDP workbook): defines field mapping HCM IT → EC portlet
- Admin Center → Import & Export Data → Employee Import: CSV-based mass load
- Historical data strategy: bring minimum — EC is a forward-looking system

**HCM Infotype → EC Portlet Mapping (common)**:

| HCM Infotype | EC Portlet |
|-------------|-----------|
| IT0001 Org Assignment | Job Information |
| IT0002 Personal Data | Personal Information |
| IT0006 Addresses | Address Information |
| IT0008 Basic Pay | Compensation Information |
| IT0009 Bank Details | Payment Information |

---

## 9. SF Release Governance

- Releases: **1H** (March/April) and **2H** (September/October) annually
- Preview instance: available ~4 weeks before production upgrade
- Required actions: review What's New → test in preview → communicate changes to users
- Release notes: help.sap.com → SAP SuccessFactors → What's New Viewer

For on-premise HCM topics, refer to the **sap-hcm** skill.

---

## 10. References

- `references/migration-path.md` — HCM to SF phased migration detail, data mapping, cutover checklist
