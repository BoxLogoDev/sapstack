# K-SOX (한국 기업 회계관리법) Compliance Mapping

## Overview

**K-SOX** (한국 기업 회계관리제도) is the Korean Sarbanes-Oxley equivalent. It requires:
- Public companies to maintain effective Internal Control over Financial Reporting (ICFR)
- Quarterly/annual CEO + CFO certification
- Disclosure of material weaknesses and changes in control
- External auditor assessment of ICFR design and operating effectiveness

**sapstack role**: Provide audit evidence for **ITGC (IT General Controls)**, specifically:
- Access control & segregation of duties (SAP authorization)
- Change management (transport requests, SAP Basis changes)
- System operations (GL posting, payment runs, closing procedures)
- System integrity (data accuracy, completeness, timeliness)

---

## Control Framework: ITGC (IT General Controls)

K-SOX requires organizations to evaluate IT controls in five domains:

| Domain | K-SOX Requirement | sapstack Contribution |
|--------|-------------------|------------------------|
| **1. Organization & Segregation** | Roles & responsibilities segregated (no one person does authorization + posting + approval) | Session audit trail maps who performed each action |
| **2. System Security & Access** | Only authorized users access SAP data; access logged | Evidence Bundle classification restricts viewer access |
| **3. System Change Management** | All changes via transport request; test + approval before production | Audit trail correlates SAP change order with Evidence Bundle timestamp |
| **4. System Operations** | Daily/weekly monitoring; error detection & correction | Evidence Loop documents discovery + remediation of GL errors |
| **5. Data Backup & Recovery** | Regular backups; tested restoration | Not sapstack responsibility (SAP BASIS team); sapstack provides audit trail of diagnostic activities |

---

## Detailed Control Mappings

### 1. Organization & Segregation of Duties

**Control**: No single person should have authority to authorize → execute → record → approve the same transaction.

**Example Problem**:
```
Issue: Finance Analyst JohnDoe can:
  1. Create GL posting (FB01) in SAP
  2. Approve the posting (as cost center manager)
  3. Reconcile the GL monthly (as accountant)
  → Fraud risk: JohnDoe can hide unauthorized transactions
```

**sapstack Evidence**:

```json
{
  "session_id": "sess_segregation_audit_001",
  "environment": "ECC 6.0 SAP001",
  "created_at": "2026-04-13T09:00:00Z",
  "hypothesis": "GL posting authorization segregated by role?",
  "evidence_bundle": {
    "tables_queried": ["AGR_USERS", "USR04", "PFCG_AUTH"],
    "findings": [
      {
        "user": "JOHNDOE",
        "roles": ["FIN_ANALYST", "GL_APPROVER", "MONTH_CLOSE_MGR"],
        "transactions_authorized": {
          "FB01": "GL posting creation",
          "FB02": "GL posting modification",
          "FK01": "Approval (cost center)",
          "FMDB": "Balance reconciliation"
        },
        "issue": "User has 4/4 roles for full GL transaction cycle",
        "severity": "HIGH"
      }
    ]
  },
  "remediation_plan": {
    "action": "Remove FIN_ANALYST role from JOHNDOE (approval authority retained)",
    "responsible": "SAP Basis team",
    "transport_request": "TR-2026-04-0456",
    "test_plan": "Verify JOHNDOE cannot post GL; verify JOHNDOE can still approve",
    "test_result": "PASS",
    "approved_by": "FINANCE_DIRECTOR",
    "approval_date": "2026-04-13",
    "deployed_to_production": "2026-04-14"
  },
  "audit_trail": [
    {
      "timestamp": "2026-04-13T09:15:00Z",
      "who": "sapstack-operator",
      "what": "Queried AGR_USERS for role segregation",
      "why": "K-SOX ITGC audit evidence"
    },
    {
      "timestamp": "2026-04-13T10:30:00Z",
      "who": "finance-manager",
      "what": "Reviewed evidence; approved remediation",
      "why": "Control deficiency sign-off"
    }
  ]
}
```

**Evidence for External Auditor**:
```
Q1 2026 GL Posting Segregation Audit
====================================
Finding:   User JOHNDOE had 4 roles enabling GL cycle completion
Control:   FAIL (Design deficiency)
Remediation: Transport TR-2026-04-0456 removed FIN_ANALYST role
Test:      Verified post-remediation; user can no longer post
Approval:  Finance Director, 2026-04-13
Evidence:  .sapstack/sessions/sess_segregation_audit_001/
```

---

### 2. System Security & Access Control

**Control**: Access to SAP must be restricted to authorized users; activity logged.

**K-SOX Requirement**: Organizations must maintain a log of who accessed what data, when, and for what reason.

**sapstack Evidence**:

```yaml
# .sapstack/audit-trail.jsonl (append-only, tamper-evident)
{"timestamp": "2026-04-13T08:00:00Z", "who": "FIN_OPERATOR", "transaction": "FBL3N", "description": "GL Receivables aging", "why": "Month-end aging review", "data_accessed": "GL account 1101000 balance", "session_id": "sess_feb_close_001"}
{"timestamp": "2026-04-13T08:15:00Z", "who": "FIN_OPERATOR", "transaction": "F.32", "description": "Credit memo posting", "why": "Customer refund processing", "data_accessed": "GL account 1101000 modified", "session_id": "sess_feb_close_001"}
{"timestamp": "2026-04-13T14:30:00Z", "who": "FIN_MANAGER", "transaction": "FMDB", "description": "Balance reconciliation", "why": "Monthly GL variance investigation", "data_accessed": "GL account 1101000 = 5,234,567 KRW", "session_id": "sess_feb_close_001"}
```

**Segregation by Role**:
```
Operator (FIN_OPERATOR):
  Can read: FBL3N, FBL1N (GL aging)
  Cannot read: FMDB (balance confirmation — manager only)
  
Manager (FIN_MANAGER):
  Can read: FMDB, FK15A (GL reconciliation)
  Can approve: GL variances
  Cannot modify: Unauthorized (read-only after certification)
```

**Evidence Format for Auditor**:
- Monthly access report (who accessed, what, when)
- Segregation matrix (role → authorized T-codes)
- Variance log (when someone accessed outside normal pattern)
- MFA attestation (who authenticated, success/failure)

---

### 3. System Change Management

**Control**: All SAP configuration changes must follow transport request process.

**K-SOX Requirement**: 
- Change request + approval before transport
- Testing in non-production environment
- Documented rollback procedure
- Post-implementation review

**sapstack Evidence Workflow**:

```bash
# Step 1: Identify SAP change (e.g., GL account master data update)
sapstack evidence-loop --mode "change-control" \
  --description "Add new GL account 8401 for Q2 2026 cost center reorg" \
  --transport-request "TR-2026-04-0789" \
  --approver "finance-director@company.local"

# Output: .sapstack/sessions/sess_tr_2026_04_0789/state.yaml
session_id: sess_tr_2026_04_0789
environment: ECC 6.0 SAP001 (Production)
transport_request: TR-2026-04-0789
status: OPEN
change_details:
  what: "Add GL account master 8401 (Temp Expense Q2 2026)"
  who: FIN_BASIS_TEAM
  when_requested: 2026-04-01
  when_approved: 2026-04-05
  approver: FINANCE_DIRECTOR
  business_rationale: "Cost center reorganization per Q2 2026 plan"
  test_plan: "Post 1000 KRW dummy entry to 8401; verify GL reconciliation"
  test_result: PASS (test GL environment)
  rollback_plan: "Reverse TR-2026-04-0789; GL account 8401 will be deleted"

# Step 2: Execute change
# (SAP Basis team posts transport in production)

# Step 3: Verify change success
sapstack evidence-loop --mode "post-implementation-review" \
  --transport-request "TR-2026-04-0789"

# Output: Verification evidence
evidence_bundle:
  tables_checked:
    - SKA1 (GL master): GL account 8401 exists ✓
    - BSEG (GL items): 1000 KRW test entry found ✓
    - COEP (CO posting): Assigned to cost center Z001 ✓
  test_result: PASS
  verified_by: FIN_CONTROLLER
  verified_date: 2026-04-06
```

**Evidence for External Auditor**:
```
Transport Request TR-2026-04-0789: GL Account 8401 Addition
===========================================================
Change Type:       GL Master Data
Requested By:      FIN_BASIS_TEAM
Requested Date:    2026-04-01
Approved By:       FINANCE_DIRECTOR
Approved Date:     2026-04-05
Testing Completed: YES (2026-04-06)
Production Date:   2026-04-06
Post-Impl Review:  PASS (verified GL balance reconciliation)
Evidence Location: .sapstack/sessions/sess_tr_2026_04_0789/

Auditor Verification:
✓ Change was approved before execution
✓ Testing completed before production
✓ Rollback procedure documented
✓ Post-implementation verification successful
✓ Evidence audit trail is immutable (JSONL format)
```

---

### 4. System Operations & Data Integrity

**Control**: GL balances must be complete, accurate, and reconciled monthly.

**K-SOX Requirement**: Monthly GL reconciliation to subsidiary ledgers (AR, AP, Bank).

**sapstack Evidence Workflow** (Month-End Close):

```bash
# Start monthly close audit session
sapstack evidence-loop --mode "period-close-validation" \
  --period "2026-03" \
  --environment "ECC 6.0 SAP001" \
  --description "Month-end GL reconciliation & close validation"

# Session captures:
evidence_bundle:
  gl_balance_query:
    query: "SELECT SUM(dmbtr) FROM bseg WHERE bukrs=1000 AND gjahr=2026 AND monat=03"
    result: "GL Ending Balance: 123,456,789 KRW"
    timestamp: "2026-04-03T15:00:00Z"
  
  subsidiary_ledgers:
    ar_balance:
      query: "SELECT SUM(dmbtr) FROM bsid WHERE bukrs=1000 AND gjahr=2026 AND monat=03"
      result: "AR Ending Balance: 45,678,901 KRW"
      variance_to_gl: "0 KRW"
      status: "RECONCILED"
    
    ap_balance:
      result: "AP Ending Balance: 32,123,456 KRW"
      variance_to_gl: "0 KRW"
      status: "RECONCILED"
    
    bank_reconciliation:
      bank_balance: "45,654,333 KRW (per bank statement 2026-03-31)"
      gl_bank_account: "45,654,333 KRW"
      variance: "0 KRW"
      status: "RECONCILED"
  
  error_analysis:
    - error_id: "ERROR-2026-03-001"
      timestamp: "2026-03-15T10:30:00Z"
      description: "GL posting 1223 (AR invoice) not matched in BSID"
      root_cause: "Invoice number typo (INV-000123 vs INV-123)"
      remediation: "Reverse posting; repost with correct invoice number"
      remediation_date: "2026-03-16"
      verification: "Post-remediation GL reconciliation PASS"
  
  audit_trail:
    - who: "FIN_OPERATOR", when: "2026-03-31T15:00:00Z", what: "Started GL reconciliation"
    - who: "FIN_OPERATOR", when: "2026-03-31T16:30:00Z", what: "Identified variance in AR"
    - who: "FIN_MANAGER", when: "2026-04-01T09:00:00Z", what: "Reviewed variance; approved remediation"
    - who: "FIN_OPERATOR", when: "2026-04-01T10:00:00Z", what: "Posted reversal + correction"
    - who: "FIN_CONTROLLER", when: "2026-04-03T15:00:00Z", what: "Final GL balance certification"
```

**Evidence for External Auditor**:
```
Q1 2026 GL Month-End Close Audit Trail
=======================================
Period:           March 2026
GL Ending Bal:    123,456,789 KRW
AR Reconciliation: PASS (variance 0 KRW)
AP Reconciliation: PASS (variance 0 KRW)
Bank Reconciliation: PASS (variance 0 KRW)

Exceptions Handled:
  - 1 posting error (invoice typo) → Corrected 2026-04-01
  - All remediation documented & approved
  - GL final certification by FIN_CONTROLLER 2026-04-03

Evidence Location: .sapstack/sessions/sess_march_2026_close/
```

---

### 5. Authorization & Master Data Maintenance

**Control**: Only authorized personnel can create/modify GL accounts, cost centers, payment terms.

**Example**: Finance should not be able to modify payment terms in Vendor Master (XK02) — that's Procurement.

**sapstack Evidence**:

```bash
sapstack evidence-loop --mode "master-data-audit" \
  --description "Verify segregation of master data maintenance duties"

evidence_bundle:
  vendor_master_xk02_access:
    authorized_roles: ["PROCURE_MANAGER", "PROCURE_ADMIN"]
    actual_access_by_role:
      PROCURE_MANAGER: [VENDOR_A, VENDOR_B, VENDOR_C]
      PROCURE_ADMIN: [ALL_VENDORS]
      FINANCE_ANALYST: []  # Should NOT have access ✓
      GL_APPROVER: []
  
  gl_account_master_fs00_access:
    authorized_roles: ["GL_ADMIN", "GL_MASTER_DATA"]
    actual_access_by_role:
      GL_ADMIN: [GL_1101000, GL_1102000, ...]
      GL_MASTER_DATA: [subset of accounts by business area]
      PROCURE_ADMIN: []  # Should NOT have access ✓
  
  control_status: "PASS — Segregation is effective"
```

---

## 외부감사인 (External Auditor) Interaction

### Pre-Audit Coordination

**Timing**: 6-8 weeks before year-end audit

**Auditor Request**:
> "Please provide evidence that GL posting and approval are segregated. Also, provide evidence of any exceptions or policy violations during the year."

**sapstack Response** (automated):

```bash
sapstack export-audit --framework k-sox --period "2026-01-01:2026-12-31"

# Output: Audit-Package-2026.tar.gz
# Contents:
audit-package-2026/
├── executive-summary.md
│   └── "GL segregation control: Design PASS, Operating PASS"
│       "1 finding: User JOHNDOE had 4 GL roles — remediated TR-2026-04-0456"
├── control-evidence/
│   ├── segregation-of-duties-matrix.xlsx
│   │   └── Matrix: 1000 users × 50 key GL transactions
│   │       Shows who can POST, APPROVE, RECONCILE, REVERSE
│   ├── gl-posting-logs-2026.jsonl
│   │   └── 50,000+ GL posting audit trail (who/what/when/why)
│   └── change-management-log-2026.xlsx
│       └── All transport requests (test + approval evidence)
├── findings-and-remediation/
│   ├── 2026-Q1-finding-johndoe-segregation.md
│   │   └── Issue, root cause, fix (TR-2026-04-0456), verification
│   ├── 2026-Q2-findings.md
│   │   └── (none)
│   ├── 2026-Q3-findings.md
│   └── 2026-Q4-findings.md
└── technical-appendix/
    ├── pii-scrubbing-report.md
    │   └── "6,240 PII patterns masked (주민번호, 사업자번호, 이메일)"
    └── integrity-verification.md
        └── SHA256 checksums (tamper detection proof)
```

### Audit Working Papers

**Auditor will examine**:

1. **Control design** — Are roles properly segregated in SAP?
   - Evidence: `segregation-of-duties-matrix.xlsx`

2. **Operating effectiveness** — Did the control actually prevent unauthorized GL postings?
   - Evidence: `gl-posting-logs-2026.jsonl` (no violations found)

3. **Changes during the year** — Were all SAP changes approved and tested?
   - Evidence: `change-management-log-2026.xlsx` (100% transport-based)

4. **Exceptions** — Were any violations properly remediated?
   - Evidence: `findings-and-remediation/` (1 JOHNDOE finding, fixed)

5. **Data integrity** — Is the audit trail tamper-evident?
   - Evidence: `integrity-verification.md` (SHA256 chain, JSONL append-only)

### Questions Auditors Typically Ask

| Question | sapstack Evidence |
|----------|-------------------|
| "How many people can modify GL accounts?" | `segregation-of-duties-matrix.xlsx` → 8 GL_ADMIN users (appropriate for 30-person finance team) |
| "Did anyone post a GL entry and approve it themselves?" | `gl-posting-logs-2026.jsonl` → 0 violations (all approvals by different user) |
| "When you found that segregation issue with JOHNDOE, how did you fix it?" | `findings-and-remediation/2026-Q1-finding-johndoe-segregation.md` → Documented TR, test, approval, rollback plan |
| "Can the GL posting log be modified?" | `integrity-verification.md` → JSONL format is append-only; SHA256 chain proves no tampering |
| "How do we know the evidence is complete?" | `.sapstack/audit-trail.jsonl` contains ALL GL actions (no sampling) |

---

## Implementation Roadmap (Quarterly)

### Q1 (Jan-Mar): Design Testing
```
Week 1-2: Document current GL controls (who can do what)
Week 3-4: Test segregation (run segregation-of-duties audit)
Week 5-6: Identify gaps (if any roles overlap)
Week 7-8: Plan remediation (submit transport requests)
Month-end: Close testing; deliver Q1 evidence to audit committee
```

### Q2 (Apr-Jun): Operating Effectiveness Testing
```
Month 1: GL posting segregation test (10 sample postings)
Month 2: Change management test (5 sample transports)
Month 3: GL reconciliation test (AR, AP, Bank)
End of Q: Quarterly close audit; prepare evidence package for external auditor
```

### Q3-Q4: Continued Monitoring
```
Ongoing: Monthly GL reconciliation with full audit trail
Ongoing: Transport request tracking + post-implementation reviews
Month 11: Begin pre-audit coordination (external auditor timeline)
Month 12: Annual control certification by CFO
```

---

## Configuration: .sapstack/config.yaml for K-SOX

```yaml
compliance:
  framework: "k-sox"
  fiscal_year: "calendar"  # Korean companies use calendar year
  retention_policy: "7-year"  # 상법 Article 45 requires 5 years; 7-year policy for buffer
  pii_scrub: true
  audit_trail_immutable: true
  
environment:
  sap_system: "ECC 6.0"
  company_codes: ["1000"]  # Multi-company tracking if applicable
  controlling_area: ["0001"]
  
evidence_collection:
  gl_transactions: true
  ar_reconciliation: true
  ap_reconciliation: true
  bank_reconciliation: true
  transport_requests: true
  change_log: true
  
access_control:
  operator_role:
    access_level: "read_masked"  # Sees GL balances, not GL items
    write_permission: false
  manager_role:
    access_level: "read_full"  # Sees GL items + supporting docs
    write_permission: false    # Approval only, no data modification
  auditor_role:
    access_level: "read_unmasked"  # Full access for compliance review
    require_mfa: true
  
audit_trail:
  location: ".sapstack/audit-trail.jsonl"
  retention: "7-year"
  format: "jsonl"  # Tamper-evident format
```

---

## Remediation Tracking

When an audit finding occurs, document in:

**File**: `.sapstack/findings-register.yaml`

```yaml
finding_id: "2026-Q1-001-SEGREGATION"
finding_title: "User JOHNDOE excessive GL authorization"
severity: "HIGH"
control_affected: "Segregation of Duties (GL Posting)"
root_cause: "Legacy role inheritance; no periodic access review"
remediation_action: "Remove FIN_ANALYST role from JOHNDOE"
transport_request: "TR-2026-04-0456"
target_completion: "2026-04-06"
actual_completion: "2026-04-06"
test_result: "PASS — JOHNDOE can no longer post GL"
approved_by: "FINANCE_DIRECTOR"
approval_date: "2026-04-05"
evidence_location: ".sapstack/sessions/sess_tr_2026_04_0456/"
preventive_action: "Quarterly user access review (every 90 days)"
status: "CLOSED"
```

---

## References

- [한국상법 제45조](https://www.law.go.kr/) — Record retention requirement (5 years)
- [자본시장법 시행령 제7장](https://www.law.go.kr/) — ICFR disclosure requirements
- [내부회계관리기준](https://www.ksox.or.kr/) — Official K-SOX framework
- [SAP Authorization Best Practices](https://support.sap.com/notes) — Segregation of duties
- [SAP Transport Management Guide](https://support.sap.com/crmchangelog) — Change control

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+, SAP ECC 6.0 / S/4HANA, Korean companies
