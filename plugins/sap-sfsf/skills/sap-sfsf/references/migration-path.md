# HCM to SuccessFactors Migration Path

## Phase-by-Phase Activity Detail

### Phase 1 — Discover (4–6 weeks)

**Goals**: Understand current state, define target architecture, identify gaps

| Activity | Owner | Output |
|----------|-------|--------|
| Current HCM landscape assessment | IT / Consulting | System inventory (modules, customizations, interfaces) |
| HCM process inventory | HR + IT | Process catalog with complexity rating |
| SuccessFactors module fit analysis | Consulting | Module selection recommendation |
| Interface / integration inventory | IT | List of all HCM integrations (payroll → FI, time → attendance, etc.) |
| Data quality assessment | HR + IT | Data quality report (duplicates, missing fields, encoding issues) |
| Country-specific requirement check | HR / Legal | List of legal/regulatory requirements per country |
| Decision: hybrid vs full cloud | Management | Migration strategy document |

---

### Phase 2 — Prepare (6–10 weeks)

**Goals**: Configure SuccessFactors, design integration, prepare data

| Activity | Owner | Output |
|----------|-------|--------|
| SF tenant provisioning | SAP / Partner | Dev + QA SF instances ready |
| Employee Central data model design | Consulting | EC object type and portlet design document |
| Business rule design | Consulting | Business rule catalog |
| Role-Based Permission (RBP) design | Consulting | RBP matrix (role → permission → target population) |
| Integration design | IT / Integration team | Integration architecture diagram + iFlow design |
| Data migration template preparation | IT + HR | HRDP workbook with field mapping |
| HCM Infotype → EC portlet mapping | Consulting | Field-level mapping document |
| Test scenario design | QA + HR | Test case catalog |

---

### Phase 3 — Realize (12–20 weeks)

**Goals**: Build, configure, test, iterate

| Activity | Owner | Output |
|----------|-------|--------|
| EC configuration (core HR) | Consulting | Configured SF development instance |
| RBP configuration | Consulting | Roles, permission groups, targets defined |
| Business rules development | Consulting | Rules tested in dev instance |
| Workflow configuration | Consulting | Approval workflows active |
| Integration development (iFlows) | IT | Integration flows built + unit tested |
| Data migration (test load 1) | IT + HR | First data load → reconciliation report |
| Data migration (test load 2 — reconciliation) | IT + HR | Corrected load → sign-off |
| User acceptance testing (UAT) | HR users | Test sign-off document |
| Performance testing | IT | Load test results |
| Training material development | Change Management | Training guides, videos, quick cards |

---

### Phase 4 — Deploy (4–6 weeks)

**Goals**: Go-live, cutover, stabilize

| Activity | Owner | Output |
|----------|-------|--------|
| Final data migration (production load) | IT + HR | Production EC data verified |
| Integration activation (production) | IT | iFlows active and tested in production |
| Cutover weekend execution | IT + HR + Project | Go-live confirmation |
| HCM system freeze | IT | No master data changes in HCM from cutover date |
| User training delivery | Change Management | Training completion report |
| Hypercare support (4–8 weeks) | Consulting + IT | Issue log + resolution |
| SF admin handover | IT | Internal SF admin team operational |

---

## HCM Infotype → EC Portlet Mapping

| HCM Infotype | EC Portlet / Object | Key Fields Mapped |
|-------------|--------------------|--------------------|
| IT0000 Actions | Employment (action reason) | Action type, reason, effective date |
| IT0001 Org Assignment | Job Information | Company code → Legal Entity; Pers.Area → Location; Position → Position; EG/ESG → Employee Class |
| IT0002 Personal Data | Personal Information | First/last name, birth date, gender, nationality |
| IT0006 Addresses | Address Information | Street, city, postal code, country |
| IT0007 Planned Working Time | Job Information (work schedule) | Work schedule rule → Work Schedule |
| IT0008 Basic Pay | Compensation Information | Wage type → Pay Component; amount → Pay Component Value |
| IT0009 Bank Details | Payment Information | Bank key, account number, currency |
| IT0014 Recurring Payments | Compensation (recurring) | Wage type → recurring pay component |
| IT0015 Additional Payments | Compensation (one-time) | Wage type → one-time payment |
| IT0027 Cost Distribution | Cost Center Assignment (portlet) | Cost center, percentage |
| IT0041 Date Specifications | Employment (date fields) | Seniority date → custom date field |
| IT0016 Contract Elements | Employment Details | Contract type, contract end date |

---

## Integration Content — SAP Business Accelerator Hub

Pre-built iFlows available for download:

| iFlow Name | Direction | Description |
|-----------|-----------|-------------|
| Replicate Employee from SuccessFactors to SAP S/4HANA | SF → S/4HANA | Employee master data sync |
| Replicate Cost Center from S/4HANA to SuccessFactors | S/4HANA → SF | Cost center sync for org assignment |
| Replicate G/L Account from S/4HANA to SuccessFactors | S/4HANA → SF | G/L accounts for payroll posting |
| Replicate Payroll Results from ECP to S/4HANA | ECP → S/4HANA | Payroll posting (FI document) |
| Replicate Organizational Units from SF to S/4HANA | SF → S/4HANA | Org unit sync |

Access: https://api.sap.com → Integration → SAP SuccessFactors

---

## Go-Live Cutover Checklist

```
T-5 weeks:
□ Final data quality check completed
□ All interfaces tested end-to-end in QA
□ All UAT sign-offs received
□ Training completed for all user groups
□ HCM freeze plan communicated to HR

T-2 weeks:
□ Cutover plan rehearsal completed
□ Production data migration dry run done
□ Rollback plan documented and reviewed
□ Hypercare team schedule confirmed

Cutover weekend (Friday evening – Sunday night):
□ HCM system locked (no master data changes)
□ Final data extract from HCM
□ Production EC data load executed
□ Data reconciliation: HCM employee count vs EC employee count
□ Integration flows activated in production
□ RBP permissions verified for key users
□ Business rules tested with real production data
□ Key user smoke test: hire / terminate / pay change workflow

Go-live day (Monday):
□ SF Help Desk active
□ Hypercare team on-call
□ Issue log tracking active
□ Daily check-in call scheduled for first 2 weeks
```

---

## Data Migration Quality Rules

### Mandatory Quality Checks Before Production Load

1. **Employee count**: HCM active headcount = EC active headcount (±0)
2. **Effective dates**: no employee with future-dated start before migration date
3. **Org assignment**: every employee has valid Legal Entity + Location + Position
4. **Compensation**: no employee with zero pay (unless intentional — e.g., volunteers)
5. **Bank details**: all employees with payroll have bank account (if direct deposit required)
6. **Manager chain**: no employee assigned to non-existent manager position
7. **Duplicate check**: no duplicate Person IDs or duplicate Employment IDs
8. **Encoding**: all text fields UTF-8 compatible (especially names with special characters)
