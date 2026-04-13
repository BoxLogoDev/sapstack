# GDPR Article 32: Technical Measures for Data Protection

## Overview

**GDPR Article 32** (General Data Protection Regulation, EU Regulation 2016/679) requires data processors to implement "appropriate technical and organisational measures" to ensure a level of security appropriate to the risk.

**sapstack scope**: sapstack provides guidance on implementing Article 32 measures for Evidence Bundles that may contain personal data (이메일, 이름, 과 직원 ID).

**Applicability**: 
- Organizations serving EU customers or subjects
- Data processors (service providers like sapstack integrators)
- Data controllers (your company)

---

## Article 32 Technical Measures

Article 32(1) requires "appropriate technical and organisational measures" considering:

```
a) Pseudonymization & encryption
b) Ability to ensure ongoing confidentiality, integrity, availability, resilience
c) Ability to restore availability & access in timely manner (disaster recovery)
d) Process for regular testing, assessing effectiveness of measures
```

---

## Mapping: sapstack Controls to Article 32 Measures

### Measure A: Pseudonymization & Encryption

#### A.1 Pseudonymization (PII Masking)

**GDPR Requirement**: Personal data identifiable by means other than by the data subject or by persons authorized to process data shall be pseudonymized.

**sapstack Implementation**:

```typescript
// mcp/pii-scrubber.ts — Automatic PII masking

Masked Fields:
  입사번호 (Employee ID)         → EMP-****    (e.g., "EMP-5678")
  이메일 (Email)                → user****@example.com
  성명 (Name)                  → [First char]****  (e.g., "J****")
  전화번호 (Phone)             → 010-****-****
  회사명 (Company)             → Company A (anonymized)

Example before:
{
  "gl_posting": {
    "user_id": "john.doe@company.eu",
    "cost_center": "CC100",
    "amount": 5000,
    "created_by": "Jane Smith"
  }
}

Example after (pseudonymized):
{
  "gl_posting": {
    "user_id": "j****@company.eu",    ← PSEUDONYMIZED
    "cost_center": "CC100",
    "amount": 5000,
    "created_by": "J****"              ← PSEUDONYMIZED
  }
}
```

**Implementation in sapstack**:

```yaml
# config.yaml
compliance:
  pii_scrubbing:
    enabled: true
    patterns:
      - "email"
      - "employee_id"
      - "name"
      - "phone"
      - "company_name"
    mask_character: "*"
    scrub_on_export: true  # Always scrubbed before leaving sapstack

data_handling:
  evidence_bundles:
    pseudonymization: true
    encryption_recommended: "AES-256"  # User implements
```

**Evidence for GDPR Auditor**:
- Evidence Bundles showing masked PII (no readable emails, names, IDs)
- Config.yaml showing scrubbing enabled by default
- Monthly masking report (X emails masked, Y names masked, etc.)

**Gap**: Add audit logging of masking operations (which fields masked, when, why).

#### A.2 Encryption at Rest

**GDPR Requirement**: Personal data encrypted to prevent unauthorized access.

**sapstack Implementation** (recommendations to user):

```bash
# sapstack itself does NOT encrypt Evidence Bundles
# (architecture: processing, not storage)
# But provides recommendations for user-deployed encryption:

Encryption at Rest Recommendations:
  1. File System Encryption
     - Linux: LUKS (dm-crypt)
     - Windows: BitLocker
     - macOS: FileVault 2
     
  2. Cloud Storage Encryption
     - AWS S3: Server-side encryption (SSE-S3 or SSE-KMS)
     - Azure Blob: Client-side encryption + Microsoft-managed keys
     - Google Cloud: Application-layer encryption (Cloud KMS)
  
  3. Database Encryption
     - PostgreSQL: pgcrypto extension
     - MySQL: Transparent Data Encryption (TDE)
     
Configuration in sapstack:
  $ sapstack config set encryption.at_rest "aes-256"
  # Note: This is a SETTING only. Encryption enforcement is user's responsibility.
```

**Evidence for GDPR Auditor**:
- sapstack config showing encryption.at_rest enabled
- User's encryption deployment documentation
- Example encrypted Evidence Bundle (unreadable without decryption key)

#### A.3 Encryption in Transit

**GDPR Requirement**: Personal data protected during transmission.

**sapstack Implementation**:

```bash
# MCP stdio communication (internal)
# - Runs on same machine (localhost)
# - No network exposure (local UNIX socket or named pipe)
# - Risk: Low (attacker must have OS-level access already)

# When transmitting to external systems:
# - Use HTTPS/TLS 1.2+ for any API calls
# - Use encrypted SSH for file transfer
# - Never transmit Evidence Bundles over unencrypted HTTP

Configuration:
  $ sapstack config set encryption.in_transit "tls-1.2"
  $ sapstack config set https_only true  # Reject non-HTTPS uploads
```

---

### Measure B: Confidentiality, Integrity, Availability, Resilience

#### B.1 Confidentiality (Access Control)

**GDPR Requirement**: Only authorized persons access personal data.

**sapstack Implementation**:

```yaml
# Role-based Access Control
access_control:
  operator:
    can_view: "masked_evidence_bundles_only"
    mfa_required: false
  
  analyst:
    can_view: "masked_evidence_bundles"
    can_export: "aggregated_reports"
    mfa_required: false
  
  auditor:
    can_view: "unmasked_evidence_bundles"    # For compliance review
    requires_approval: "data_protection_officer"
    requires_mfa: true
    logs_all_access: true
  
  admin:
    full_access: true
    mfa_required: true
    all_actions_audited: true

Access Control Implementation:
  - Evidence Bundles tagged with classification (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED)
  - Role check before response (API middleware)
  - Audit trail (who accessed what, when)
  - Denial logging (access attempts blocked, logged)
```

**Evidence for GDPR Auditor**:
- Role definitions + access control policy
- Evidence Bundles showing classification tags
- Audit trail showing access grants/denials
- Test: Verify operator cannot access unmasked data

#### B.2 Integrity (Tamper Detection)

**GDPR Requirement**: Personal data protected against unauthorized modification.

**sapstack Implementation**:

```
Integrity Protection Mechanisms:

1. Append-Only Audit Trail (JSONL)
   - JSONL format: no random writes, only append
   - Cannot delete or modify historical entries
   - SHA256 hash chain links consecutive entries
   
2. Immutable Storage
   - Store audit trail on WORM (Write-Once-Read-Many) media
   - AWS S3 Object Lock (prevents deletion for X days)
   - Azure Immutable Blobs (locked for retention period)
   
3. Evidence Bundle Hash Verification
   - Each bundle includes SHA256 hash of contents
   - Detect if modified after creation
   - Verify in import: $ sapstack verify-bundle bundle.json

Example Hash Chain:
  Entry 1 (2026-01-01): hash=abc123, prev_hash=null
  Entry 2 (2026-01-02): hash=def456, prev_hash=abc123  ← links to entry 1
  Entry 3 (2026-01-03): hash=ghi789, prev_hash=def456  ← links to entry 2
  
  To forge entry 2: Would need to recalculate entry 3's hash (breaks chain)
```

**Evidence for GDPR Auditor**:
- Audit trail demonstrating tamper-evident format
- Test: Modify audit trail entry → verify rejection
- Hash verification report (monthly)
- Storage policy showing immutability period

#### B.3 Availability & Resilience

**GDPR Requirement**: Data available when needed; system can recover from failures.

**sapstack Implementation**:

```yaml
# Availability & Resilience Measures

session_resumption:
  mechanism: "YAML state files in .sapstack/sessions/{id}/"
  recovery: "Restart session from last checkpoint"
  data_loss: "None (all state persisted)"
  
backup_strategy:
  audit_trail_backups: "Daily snapshots to separate storage"
  evidence_bundle_backups: "Weekly archival to cloud storage"
  retention: "5-7 years (K-SOX compliance)"
  recovery_test: "Quarterly restoration drill"
  
disaster_recovery:
  rpo: "1 day" (Recovery Point Objective — max data loss)
  rto: "4 hours" (Recovery Time Objective — max downtime)
  backup_location: "Geographically separated region"
  
monitoring:
  health_checks: "Hourly audit trail integrity check"
  alerts: "Email notification if check fails"
  redundancy: "No single point of failure for audit trail"
```

**Evidence for GDPR Auditor**:
- Backup procedures document
- Quarterly disaster recovery test results
- Monitoring logs showing ongoing health checks
- RTO/RPO targets documented + met

---

### Measure C: Regular Testing & Assessment

**GDPR Requirement**: Organization shall regularly test, assess, and evaluate the effectiveness of technical measures.

**sapstack Implementation**:

```bash
# Quarterly Compliance Testing

Test 1: PII Masking Effectiveness
  $ sapstack audit-compliance --test pii-masking
  
  Results:
    - Scanned 1,000 Evidence Bundles
    - Searched for email patterns: 0 found ✓
    - Searched for employee ID patterns: 0 found ✓
    - Searched for name patterns: 0 found ✓
    - Masking effectiveness: 100% ✓

Test 2: Access Control Enforcement
  $ sapstack audit-compliance --test access-control
  
  Results:
    - Operator attempted unmasked access: DENIED ✓
    - Analyst attempted admin function: DENIED ✓
    - Auditor with MFA accessed RESTRICTED: ALLOWED ✓
    - Non-authenticated user attempted read: DENIED ✓

Test 3: Audit Trail Integrity
  $ sapstack audit-compliance --test audit-trail-integrity
  
  Results:
    - Audit trail format: append-only ✓
    - Hash chain verification: unbroken ✓
    - Modification detection: working ✓
    - Retention period: 7 years set ✓

Test 4: Encryption Verification
  $ sapstack audit-compliance --test encryption
  
  Results:
    - At-rest encryption: AES-256 enabled ✓
    - In-transit encryption: TLS 1.2+ ✓
    - Key rotation: annual ✓

All tests: PASS (Q2 2026)
Evidence saved: .sapstack/compliance-reports/Q2-2026-assessment.json
```

**Evidence for GDPR Auditor**:
- Quarterly test reports (Q1, Q2, Q3, Q4)
- Test procedures documentation
- Results showing 100% effectiveness
- Remediation log (if any tests failed → fixes applied)

---

## Data Residency & GDPR Compliance

**Key Consideration**: GDPR permits EU personal data to be processed outside EU only if "adequate" safeguards exist.

**sapstack Implementation**:

```yaml
# Data Residency Options

Option 1: EU-Only Deployment (Safe)
  - Evidence Bundles stored in EU (Germany, Ireland, France)
  - Audit trail on EU servers
  - No data transfer outside EU
  - Result: Full GDPR compliance guaranteed
  
  Configuration:
    $ sapstack config set data_residency "eu"
    $ sapstack config set storage_location "eu-west-1"  # AWS Ireland

Option 2: US Deployment (Conditional)
  - US Data Transfer Agreement required (Standard Contractual Clauses, SCCs)
  - Evidence Bundles encrypted at rest
  - Audit trail immutable
  - Regular compliance certification
  
  Configuration:
    $ sapstack config set data_residency "us"
    $ sapstack config set data_processing_agreement "signed"  # With provider
    $ sapstack config set encryption.at_rest "aes-256"

Option 3: Hybrid (Multi-Cloud)
  - EU PII stored in EU
  - Non-PII analysis in other regions
  - Separation at application layer
  
  Configuration:
    $ sapstack config set data_residency "hybrid"
    $ sapstack config set pii_residency "eu-only"
```

**GDPR Documentation Required**:
- Data Processing Agreement (DPA) with service provider
- Demonstration of "adequate safeguards" (encryption, access control)
- Audit trail of who accessed data (when, where, why)
- Sub-processor list (if using third-party cloud)

---

## Privacy by Design Implementation

**GDPR Article 25** requires "Privacy by Design" — data protection built into systems from the start.

**sapstack Privacy-by-Design Features**:

```
1. Data Minimization
   - Collect only fields needed for diagnosis (not full GL download)
   - Example: "Balance of GL 1101000?" → Return only balance, not 1000 items
   
2. Purpose Limitation
   - Evidence Bundle created for specific diagnosis purpose
   - Tagged with purpose in metadata
   - Cannot be reused for other purposes without new authorization
   
   Example:
   {
     "purpose": "Q1 2026 GL reconciliation",
     "created_date": "2026-04-03",
     "authorized_for": ["gl_reconciliation", "month_end_close"],
     "not_authorized_for": ["performance_analysis", "data_export"]
   }

3. Storage Limitation
   - Evidence Bundles auto-deleted after retention period
   - 5 years for financial data (K-SOX)
   - 7 years for audit data (legal hold)
   - Secure wipe (NIST SP800-88 compliant)
   
4. Accuracy & Correction
   - If GL balance found to be inaccurate, correction tracked
   - Audit trail shows original + corrected value + timestamp + who approved
   - No deletion of historical records (audit trail requirement)
   
5. Transparency
   - Evidence Bundle metadata explains what data was collected, why, how long retained
   - Audit trail visible to data subject (on request)
```

---

## Data Subject Rights (GDPR Articles 15-22)

**sapstack Support for Data Subject Rights**:

```bash
# Right to Access (Article 15)
$ sapstack export-data-subject-copy --email john.doe@company.eu

Output:
  - All Evidence Bundles mentioning john.doe (even pseudonymized)
  - All audit trail entries showing his actions
  - All timestamps/purposes
  - Format: Human-readable PDF

# Right to Rectification (Article 16)
$ sapstack correct-data --email john.doe@company.eu --correction "email=john.newcompany.eu"

Output:
  - Audit trail updated with correction
  - Original value preserved (no deletion)
  - Timestamp + approver logged
  
# Right to Erasure (Article 17 — "Right to be Forgotten")
$ sapstack delete-data-subject --email john.doe@company.eu --reason "employee_terminated"

Output:
  - PII pseudonymized (already masked, so no-op)
  - Data retention period shortened (delete after 1 year, not 5)
  - All processing of personal data stopped
  - Audit trail: deletion request + approver logged
  
# Right to Restrict Processing (Article 18)
$ sapstack restrict-processing --email john.doe@company.eu

Output:
  - No further Evidence Bundles created for this person
  - Existing bundles marked "restricted"
  - Can still be used for legal/compliance purposes (audit, K-SOX)
```

---

## International Data Transfers

**For organizations transferring personal data outside EU:**

```
Mechanism 1: Standard Contractual Clauses (SCCs) — Most Common
  - EU approved model clauses
  - Binding contract with processor
  - Requirements: appropriate safeguards (encryption, audit trail)
  
Mechanism 2: Adequacy Decision
  - EU deems country's laws equivalent to GDPR
  - Countries: Switzerland, Japan, South Korea, ...
  - sapstack in Korea? User must verify with DPA (Data Protection Authority)
  
Mechanism 3: Derogations (Limited)
  - Consent from data subject (rarely practical)
  - Necessary for contract performance
  - Legal proceedings
  
Implementation in sapstack:
  $ sapstack config set data_transfer_mechanism "scc"
  $ sapstack config set scc_executed "2026-03-15"  # Date of signed agreement
  $ sapstack config set processor "CloudProvider Inc."
```

---

## FAQ

**Q: Does sapstack encrypt data?**
A: No, sapstack does not encrypt internally. It pseudonymizes (masks) PII. Encryption is recommended to user and provided as configuration option.

**Q: Can we use sapstack for EU customer data?**
A: Yes, with conditions:
   1. Data Processing Agreement (DPA) signed
   2. PII masked by default (enabled)
   3. Encryption at rest + in transit (user-deployed)
   4. Audit trail logging (enabled)

**Q: What if a data subject requests deletion?**
A: 
   - PII already masked (pseudonymized), so no individual re-identification
   - Audit trail cannot be deleted (legal requirement)
   - Use `sapstack restrict-processing` to prevent future processing

**Q: Is sapstack GDPR compliant?**
A: No. sapstack provides tools; YOUR company must ensure GDPR compliance through legal agreement, encryption, access control, etc.

**Q: Which countries' data laws apply?**
A: It depends on your data subjects and storage location:
   - EU subjects + EU storage → GDPR
   - Korean subjects + Korean storage → PIPA (개인정보보호법)
   - Both → Both frameworks (use the stricter standard)

---

## Checklist for GDPR Compliance

- [ ] Data Processing Agreement (DPA) signed with sapstack provider (if SaaS)
- [ ] Personal data inventory completed (which fields are PII?)
- [ ] PII masking enabled in sapstack config
- [ ] Encryption at rest implemented (by user, verified)
- [ ] Encryption in transit (TLS 1.2+) verified
- [ ] Access control roles defined (operator, auditor, admin)
- [ ] Audit trail enabled & retained per policy
- [ ] Data subject rights procedures documented (access, rectification, erasure, restriction)
- [ ] International transfer mechanism documented (SCC, adequacy, etc.)
- [ ] Regular compliance testing (quarterly)
- [ ] Privacy by design checklist completed
- [ ] Data Protection Impact Assessment (DPIA) completed
- [ ] Data Protection Officer (DPO) consulted (if required)

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+, organizations serving EU data subjects
