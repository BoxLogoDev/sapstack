# SOC 2 Type II Readiness Checklist

## Overview

**SOC 2** (Service Organization Control 2) is a US framework for assessing the security, availability, processing integrity, confidentiality, and privacy controls of a service provider.

**sapstack scope**: sapstack contributes to **Processing Integrity** and **Confidentiality** controls that SaaS providers and integrators using sapstack must implement.

**sapstack does NOT provide**:
- Availability controls (uptime SLA, redundancy — that's your infrastructure)
- User access controls to YOUR systems (that's your application)
- Incident response (that's your security team)

**sapstack DOES provide**:
- Data processing integrity (Evidence Bundle validation, audit trail)
- Confidentiality controls (PII masking, classification, encryption recommendations)
- Evidence generation for auditors (audit trail, session logs)

---

## Trust Services Criteria (TSC)

### CC — Common Criteria (applies to all organizations)

| Criterion | sapstack Implementation | Auditor Evidence |
|-----------|------------------------|-------------------|
| **CC1.1** Governance — The entity obtains or generates information to identify risks | Session metadata captures diagnostic intent (why was this Evidence Bundle created?) | `state.yaml` → "why" field documents business rationale |
| **CC1.2** Governance — The entity implements policies & procedures to achieve objectives | Config.yaml documents classification policy; PII scrubbing enabled by default | `config.yaml` governance section |
| **CC6.1** System Monitoring — Monitoring detects exceptions | Evidence Loop hypothesis validation detects GL discrepancies | Session evidence_bundle finding field |
| **CC6.2** Monitoring Tools — Continuous monitoring tools deploy | Audit trail captures all actions; anomaly detection roadmap v2.0 | `.sapstack/audit-trail.jsonl` |
| **CC7.2** Logging — System generates, records & preserves audit trails | JSONL append-only audit trail with tamper detection | `audit-trail.jsonl` (immutable) |

### PI — Processing Integrity (Data accuracy, completeness, timeliness)

| Criterion | sapstack Implementation | Auditor Evidence |
|-----------|------------------------|-------------------|
| **PI1.1** Data Validation — Unauthorized, incomplete or inaccurate data is prevented | Evidence Bundle schema validation (JSON Schema) | `schemas/evidence-bundle.json` |
| **PI1.2** Data Processing — Errors detected & corrected | Finding detection (GL variance, missing reconciliation) | `evidence_bundle.findings[]` array |
| **PI1.3** Stored Data — Stored data accuracy & completeness assured | GL balance query includes source (which table, which filter) | `evidence_bundle.tables_queried[]` |
| **PI2.1** Data Availability — Required data available & accessible | Evidence Bundles indexed by session_id for fast retrieval | `.sapstack/sessions/` directory structure |
| **PI2.2** Processing Timeliness — Data processed & delivered per contract | Month-end close Evidence Loop completed before reporting deadline | Session timestamps |
| **PI2.3** Data Retention — Data retained per legal/contractual requirement | Retention policy: 5 years (K-SOX) or organization-configurable | `config.yaml` retention_policy |

### C — Confidentiality (Information protected from unauthorized disclosure)

| Criterion | sapstack Implementation | Auditor Evidence |
|-----------|------------------------|-------------------|
| **C1.1** Confidentiality Policies — Policies prevent unauthorized disclosure | PII scrubbing policy defined in SECURITY.md | `SECURITY.md` → PII Scrubbing section |
| **C1.2** Classification & Handling — Information classified & handling specified | Evidence Bundle classification: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED | `evidence_bundle.classification[]` |
| **C2.1** Logical/Physical Segregation — Confidential data segregated | Session access control: operator sees masked, auditor sees unmasked | `config.yaml` access_control section |
| **C2.2** Access Control — Only authorized users access confidential data | Evidence Bundles read-only after certification; signed audit trail | Role-based access via session_role |

---

## SOC 2 Type II Readiness Stages

### Stage 1: Scoping (Week 1-2)

**Question**: What parts of your service use sapstack?

**Answer Template**:
```
sapstack is used for:
- SAP diagnostic data collection (GL balance inquiries, GL posting logs)
- Audit evidence generation (month-end close validation)
- Compliance evidence delivery to auditors

sapstack is NOT used for:
- User access control to customer SAP systems (customer's responsibility)
- Infrastructure availability (AWS/Azure/on-premise, customer's responsibility)
- Incident response (customer's security team)

In Scope for SOC 2: Evidence Bundle generation, audit trail, PII handling
Out of Scope: Infrastructure, authentication, incident response
```

**Deliverable**: SOC 2 Scoping Document (1-2 pages)

### Stage 2: Control Design Testing (Week 3-6)

**Question**: Does sapstack have controls designed to meet SOC 2 criteria?

**Checklist**:

```
✓ Data Validation (PI1.1)
  - Evidence Bundle schema enforced (JSON Schema validation)
  - Invalid bundles rejected with error message
  - Test: Try importing malformed JSON → rejection

✓ Processing Accuracy (PI1.2)
  - GL balance variance detection
  - Missing reconciliation detection
  - Test: Create GL posting, verify it appears in Evidence Bundle within 5 minutes

✓ Data Availability (PI2.1)
  - Evidence Bundles indexed by session_id
  - Query time < 500ms for 1-year archive
  - Test: Retrieve Q1 2026 sessions; measure query time

✓ PII Confidentiality (C1.1, C1.2, C2.1)
  - PII scrubbing enabled by default
  - Evidence classification metadata
  - Role-based access (operator=masked, auditor=unmasked)
  - Test: Export Evidence Bundle with unmasked GL data; verify PII masked

✓ Audit Trail (CC7.2)
  - Append-only JSONL format
  - Immutable (SHA256 chain)
  - Test: Attempt to modify audit trail; verify failure

✓ Change Log (CC1.2)
  - Transport request tracking
  - Test & approval before production
  - Test: Verify all GL master changes have corresponding TR
```

**Deliverable**: Control Design Assessment (20-30 pages, per SOC 2 framework)

### Stage 3: Operating Effectiveness Testing (Month 2-6)

**Question**: Did the controls actually prevent/detect errors over time?

**Evidence Collection Period**: Minimum 6 months (SOC 2 standard)

**Testing Plan**:

```
Test 1: PII Masking Effectiveness (Monthly)
- Random sample 100 Evidence Bundles
- Grep for patterns: 주민번호, 사업자번호, 이메일, 계좌번호
- Result: 0 unmasked PII found (expected)
- Frequency: Monthly
- Test period: Jan 2026 - Jun 2026

Test 2: GL Variance Detection (Month-End)
- Run GL reconciliation Evidence Loop on month-end GL balance
- Verify all GL variances > 1,000 KRW detected & logged
- Sample: Jan, Feb, Mar 2026 month-ends
- Result: 100% detection rate (3/3 variance months detected)

Test 3: Change Management (Quarterly)
- Random sample 10 transport requests from Q1, Q2
- Verify: TR → test evidence → approval → production log
- Result: 100% of TRs have full documentation trail

Test 4: Audit Trail Integrity (Quarterly)
- Verify audit-trail.jsonl is append-only
- Hash first 100 entries; verify they remain unchanged in subsequent exports
- Test: Try to delete an entry from JSONL; verify system rejects

Test 5: Role-Based Access (Quarterly)
- Verify FIN_OPERATOR can see masked GL balance only
- Verify AUDITOR can see unmasked GL balance
- Verify API rejects requests from unauthorized roles
```

**Deliverable**: Operational Effectiveness Evidence (200+ pages of test logs, screenshots)

### Stage 4: External Audit (Month 7-12)

**Auditor Engagement**:
- SOC 2 Type II auditor (Big 4 firm recommended)
- 6-month testing period completed
- Evidence package ready for delivery

**Auditor Testing** (they will):
1. Review control design (does it exist on paper?)
2. Test 10-20 transactions manually (did it actually work?)
3. Interview management (do they understand the controls?)
4. Inspect logs (is the audit trail complete & tamper-evident?)

**Auditor Evidence Collection**:
```
FROM sapstack:
- Control design documentation (SECURITY.md + config.yaml)
- Evidence Bundles (sample of 20 from different periods)
- Audit trail exports (Jan-Jun 2026, JSONL format)
- PII masking test results (monthly sampling)
- Change management evidence (transport requests + test logs)
- Access control test results (role segregation verification)

FROM you (integrator):
- Incident response logs (did any data leaks occur?)
- Customer complaints (any confidentiality breaches?)
- Change control approvals (who approved the changes?)
- Policy documents (do your SOC 2 policies exist?)
```

---

## Remediation Checklist: Gaps to Close

If your organization using sapstack does NOT have these controls, address them:

### Gap 1: No Evidence Retention Policy
**Problem**: Evidence Bundles not retained; can't prove controls worked historically
**Solution**:
```bash
# Add to config.yaml
audit:
  retention_days: 1825  # 5 years
  deletion_policy: "secure-wipe"  # NIST SP800-88 compliant
```
**Evidence for auditor**: Config file + 1-year archive sample

### Gap 2: No PII Classification
**Problem**: Auditor asks "how do you identify which data is PII?" — no documented process
**Solution**:
```yaml
# .sapstack/config.yaml
compliance:
  pii_scrubbing:
    enabled: true
    patterns: ["jumin", "biznum", "phone_kr", "email", "credit_card", "bank_account"]
    scrub_on_export: true
```
**Evidence for auditor**: Configuration policy + monthly scrubbing report

### Gap 3: No Access Control
**Problem**: Anyone can read Evidence Bundles (even unmasked GL balances)
**Solution**:
```yaml
access_control:
  operator_role:
    access_level: "read_masked"
    bundles_visible: true
    unmasked_access: false
  manager_role:
    access_level: "read_full"
    bundles_visible: true
    unmasked_access: false  # Need explicit approval
  auditor_role:
    access_level: "read_unmasked"
    require_mfa: true
    require_approval: "audit-committee"
```
**Evidence for auditor**: Configuration + access logs showing enforcement

### Gap 4: No Audit Trail
**Problem**: No record of who accessed/modified Evidence Bundles
**Solution**:
```bash
# Enable audit trail
sapstack config set audit.enabled true
sapstack config set audit.location ".sapstack/audit-trail.jsonl"
sapstack config set audit.immutable true

# Test: verify all read/write operations logged
grep "read" .sapstack/audit-trail.jsonl | wc -l
# Should show 1000+ entries after 1 month of normal operations
```
**Evidence for auditor**: 6-month audit trail export (JSONL)

### Gap 5: No Change Control
**Problem**: GL configurations changed without documentation
**Solution**:
```bash
# Require transport request for all changes
sapstack config set change_management.transport_required true
sapstack config set change_management.test_evidence_required true
sapstack config set change_management.rollback_plan_required true

# All changes must include:
# - Transport request number
# - Test results (before/after)
# - Rollback procedure
```
**Evidence for auditor**: 10-20 sample transports with full documentation

---

## 6-Month Implementation Plan

### Month 1: Design
- [ ] Read this document + SECURITY.md
- [ ] Design SOC 2 scope (what controls apply to sapstack?)
- [ ] Draft control descriptions (CC7.2, PI1.1, C1.2, etc.)
- [ ] Document current state (what controls exist today?)

### Month 2: Configure
- [ ] Enable PII scrubbing in config.yaml
- [ ] Set up Evidence Bundle classification
- [ ] Implement access control roles (operator, auditor)
- [ ] Configure audit trail (JSONL, immutable)

### Month 3: Test Design
- [ ] Run design testing for each control (CC, PI, C)
- [ ] Document any gaps
- [ ] Create remediation plan for gaps

### Month 4: Operate
- [ ] Run normal operations (GL reconciliation, change management)
- [ ] Generate monthly test evidence
- [ ] Log all operations to audit trail

### Month 5: Evidence Collection
- [ ] Export 5-month audit trail
- [ ] Collect PII masking test results
- [ ] Gather all Evidence Bundles
- [ ] Compile control evidence documentation

### Month 6: Audit Readiness
- [ ] Package evidence for external auditor
- [ ] Answer pre-audit questionnaire
- [ ] Schedule audit engagement
- [ ] Prepare management interviews

---

## Deliverables for External Auditor

**When audit firm arrives, be ready with**:

### 1. Control Documentation (20 pages)
```
File: SOC2-Control-Documentation.pdf
Content:
  - CC1.1: How governance risks are identified
  - CC7.2: How audit trails are generated/maintained
  - PI1.1: How data validation prevents errors
  - C1.2: How PII is classified & protected
  - [8 more controls...]
```

### 2. Evidence Bundles (Sample)
```
Directory: evidence-bundles-sample/
Files:
  - 2026-01-GL-Reconciliation.json (PII scrubbed)
  - 2026-02-GL-Reconciliation.json
  - 2026-03-Change-Management.json
  - [10 more samples...]
```

### 3. Audit Trail (6 months)
```
File: audit-trail-2026-01-to-06.jsonl
Size: ~50 MB (100,000+ entries)
Format: Append-only JSONL (tamper-evident)
Content:
  {"timestamp": "2026-01-01T08:00:00Z", "who": "FIN_OP", ...}
  {"timestamp": "2026-01-01T08:15:00Z", "who": "FIN_OP", ...}
  ...
```

### 4. Test Results
```
File: SOC2-Testing-Results.xlsx
Sheets:
  - PII Masking (12 months, 0 unmasked PII found)
  - GL Variance Detection (100% detection rate)
  - Change Management (100% TRs properly tested)
  - Role-Based Access (operator/auditor segregation verified)
  - Audit Trail Integrity (append-only verified)
```

### 5. Control Gaps & Remediation
```
File: Remediation-Log.md
Content:
  Finding 1: No access control [REMEDIATED 2026-03-15]
  Finding 2: PII not masked [REMEDIATED 2026-02-20]
  [List any issues found & how fixed]
```

---

## Success Criteria: SOC 2 Type II Certification

After 6-month audit period + external audit engagement:

- ✅ All controls operating effectively (no unremitted exceptions)
- ✅ Audit trail complete & tamper-evident (100% of transactions logged)
- ✅ PII masking working (0 unmasked sensitive data in exports)
- ✅ Change management effective (100% of changes properly tested)
- ✅ No scope limitations noted by auditor

**Outcome**: External auditor issues **SOC 2 Type II Report** (valuable for customer trust)

---

## FAQ

**Q: Does sapstack make us SOC 2 compliant?**
A: No. sapstack contributes controls; you must implement the full governance framework.

**Q: How long does SOC 2 take?**
A: Audit + certification typically 6-12 months total.

**Q: Can we use sapstack in production during SOC 2 audit?**
A: Yes, but be prepared to document all usage in the audit trail.

**Q: What if we find a bug in sapstack?**
A: Report via security@ contact; we'll issue fix in subsequent version.

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+
