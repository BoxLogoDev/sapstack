# ISO 27001:2022 Annex A Control Mapping

## Overview

**ISO 27001** is the international standard for Information Security Management Systems (ISMS). Annex A contains 93 controls across 14 control groups.

**sapstack scope**: sapstack addresses **8 critical controls** (A.5, A.9, A.12, A.14, A.16, A.18) relevant to data processing integrity and confidentiality. Organizations must implement the remaining controls (physical security, business continuity, etc.) independently.

**Roadmap**: sapstack aims for ISO 27001 certification by 2027 H1 (third-party audit).

---

## Control Mapping Table

| Group | Control | sapstack Implementation | Gap Analysis |
|-------|---------|------------------------|---------------|
| **A.5** | Information Security Policies | Config-driven policy enforcement | ✓ Implemented |
| **A.9** | Access Control | Role-based access to Evidence Bundles | ✓ Implemented |
| **A.12** | Operations Security | Audit trail, logging, monitoring | ✓ Implemented |
| **A.14** | System Acquisition, Dev, Maintenance | Schema validation, dependency audit | ✓ Partial |
| **A.16** | Information Security Incident Mgmt | Vulnerability disclosure process | ✓ Implemented |
| **A.18** | Compliance (audit, regulatory) | Audit evidence generation | ✓ Implemented |

---

## A.5 Information Security Policies

### A.5.1 Management Direction

**Requirement**: Organization shall establish, document, communicate, and review information security policies.

**sapstack Implementation**:
```
Document: /SECURITY.md (enterprise-grade security policy)
Content:
  1. Threat model (Evidence Bundle exposure, air-gap deployment, supply chain)
  2. Data handling (PII classification, scrubbing rules)
  3. Access control (role-based, audit trail)
  4. Vulnerability disclosure (responsible disclosure, 90-day embargo)
  5. K-SOX/SOC 2/ISO 27001 compliance mappings

Configuration: config.yaml (policy enforcer)
  compliance:
    pii_scrub: true              # Policy enforcement
    audit_trail_immutable: true  # Non-repudiation
    classification_required: true # Classification mandate
```

**Evidence for Auditor**:
- SECURITY.md document (signed, version-controlled)
- config.yaml showing policy enforcement
- Monthly policy review meeting minutes

**Gap**: None — policy fully defined and enforced.

### A.5.2 Information Security Roles & Responsibilities

**Requirement**: Define roles and responsibilities for information security.

**sapstack Implementation**:
```yaml
# config.yaml
roles:
  - name: "sapstack_operator"
    responsibilities:
      - Create Evidence Bundles
      - Run diagnostic sessions
      - View masked data only
    cannot_do:
      - Approve changes
      - Access unmasked GL data
      - Delete evidence bundles
  
  - name: "sapstack_auditor"
    responsibilities:
      - Review Evidence Bundles (unmasked)
      - Generate compliance reports
      - Verify audit trail integrity
      - Approve data exports
    cannot_do:
      - Create Evidence Bundles
      - Modify evidence
  
  - name: "sapstack_admin"
    responsibilities:
      - Manage user accounts
      - Configure security policies
      - Monitor audit logs
      - Respond to incidents
    cannot_do:
      - Modify historical Evidence Bundles
```

**Evidence for Auditor**:
- Role definitions document
- Role assignment log (who has what role, since when)
- Segregation of duties matrix (operator vs auditor vs admin)

**Gap**: Implement periodic role certification (annual attestation by manager).

---

## A.9 Access Control

### A.9.1 Access Control Policy

**Requirement**: Organizations shall base access control on the principle of least privilege.

**sapstack Implementation**:
```
Principle: Operator = Read-only, Masked GL data
           Auditor   = Read-only, Unmasked GL data, requires MFA
           Admin     = Full access, logs all actions

Implementation: Role-based access control (RBAC) enforced at:
  1. Evidence Bundle read (filter by classification & role)
  2. API endpoint (role check before response)
  3. Audit trail (role implicit in "who" field)
```

**Evidence for Auditor**:
```bash
# Access control audit
sapstack verify-access-control --role operator --bundle CONFIDENTIAL

Output:
  Operator attempting to read CONFIDENTIAL bundle: DENIED ✓
  Operator attempting to read INTERNAL bundle: ALLOWED ✓
  Operator attempting to modify bundle: DENIED ✓
```

### A.9.2 User Registration & Access Rights Provisioning

**Requirement**: Access rights be granted, reviewed, and revoked in a timely manner.

**sapstack Implementation**:
```yaml
# User provisioning workflow
user_provisioning:
  request_process:
    - User manager submits access request via ticket
    - Security approver validates business need
    - Admin creates account + assigns role
    - All provisioning logged in audit trail
    
  access_review:
    frequency: "quarterly"  # Every 90 days
    process:
      - Query current user roles
      - Compare to authorized list
      - Document exceptions
      - Remediate within 2 weeks
    
  deprovisioning:
    trigger: "employee termination"
    process:
      - Remove user account
      - Revoke all role assignments
      - Verify no access within 24 hours
      - Log in audit trail
```

**Evidence for Auditor**:
- Provisioning request log (with approvals)
- Quarterly access review documentation
- Deprovisioning records (termination → revocation timeline)

### A.9.4 Information Classification

**Requirement**: Information shall be classified and marked with its sensitivity level.

**sapstack Implementation**:
```
Classification Levels (4-tier):
  [PUBLIC]       → No sensitive data (documentation, T-code guides)
  [INTERNAL]     → Company-specific but non-confidential (org structure)
  [CONFIDENTIAL]  → Business-sensitive (GL balances, cost allocations)
  [RESTRICTED]   → Highest sensitivity (PII, board decisions, auditor reports)

Implementation:
  - Evidence Bundle created with classification tag
  - Operator sees [PUBLIC] + [INTERNAL] only (masked)
  - Auditor can request [CONFIDENTIAL] + [RESTRICTED] (unmasked)
  - All access logged with classification level

Example Evidence Bundle:
{
  "session_id": "sess_mar_2026_close",
  "classification": ["CONFIDENTIAL", "RESTRICTED"],
  "pii_masked": true,
  "requires_mfa_to_view": true,
  "findings": [
    {
      "type": "gl_variance",
      "amount": "*** KRW",  # MASKED
      "classification": "CONFIDENTIAL"
    }
  ]
}
```

**Evidence for Auditor**:
- Classification policy (in config.yaml)
- Evidence Bundles with classification tags
- Access logs showing [PUBLIC] vs [CONFIDENTIAL] usage by role

---

## A.12 Operations Security

### A.12.4 Logging

**Requirement**: User activities, exceptions, and security-relevant events shall be recorded, retained, and reviewed.

**sapstack Implementation**:

**Audit Trail Format** (JSONL, append-only):
```jsonl
{"timestamp": "2026-04-13T08:00:00Z", "user": "FIN_OP", "action": "create_session", "session_id": "sess_001", "result": "success"}
{"timestamp": "2026-04-13T08:15:00Z", "user": "FIN_OP", "action": "query_gl", "table": "bseg", "rows_returned": 1234, "classification": "CONFIDENTIAL"}
{"timestamp": "2026-04-13T08:30:00Z", "user": "auditor", "action": "request_unmasked", "bundle_id": "bundle_001", "approval_required": "true"}
{"timestamp": "2026-04-13T09:00:00Z", "user": "admin", "action": "approve_unmasked_access", "bundle_id": "bundle_001", "granted_to": "auditor"}
{"timestamp": "2026-04-13T09:15:00Z", "user": "auditor", "action": "view_bundle", "bundle_id": "bundle_001", "pii_unmasked": true, "classification_level": "RESTRICTED"}
```

**Logging Features**:
- **Immutable**: JSONL format prevents deletion (append-only)
- **Complete**: Every action logged (read, write, approve, deny)
- **Traceable**: user, timestamp, action, result fields always present
- **Searchable**: Query via timestamp, user, or action type
- **Retained**: 5-7 year retention policy (K-SOX + legal hold)

**Evidence for Auditor**:
- 12-month audit trail export (JSONL)
- Integrity verification (SHA256 chain, no gaps)
- Sample queries showing system can retrieve specific actions
- Retention policy documentation

### A.12.4.1 Event Logging

**Requirement**: Recording of user activities shall include: identification of user, type of event, date/time, outcome.

**sapstack Evidence Logging**:
```
✓ User identification: User field present + LDAP/AD mapping
✓ Type of event: action field (create_session, query_gl, approve, etc.)
✓ Date & time: ISO8601 timestamp with timezone
✓ Outcome: result field (success, denied, error, pending)

Additional fields:
  - session_id (for correlation)
  - bundle_id (for tracing data)
  - classification (sensitive data touched?)
  - rows_returned (data volume)
  - exception (if action failed)
```

**Evidence for Auditor**:
- Sample audit trail showing all 4 required fields
- Documentation that all actions are logged
- Logs demonstrating denied access attempts

### A.12.4.2 Protection of Log Information

**Requirement**: Log files shall be protected against tampering, unauthorized access, and removal.

**sapstack Implementation**:
```
Protection measures:
  1. Format: JSONL (append-only, no random access writes)
  2. Immutability: Each entry SHA256 hashed; subsequent entry includes previous hash
  3. Access control: Only admins can read logs
  4. Retention: Immutable storage (WORM media or cloud immutable blob storage)
  5. Monitoring: Hash verification runs daily; alerts if tampering detected

Example (hash chain):
{
  "timestamp": "2026-01-01T08:00:00Z",
  "user": "FIN_OP",
  "action": "query_gl",
  "hash": "abc123...",
  "hash_of_previous_entry": null
}
{
  "timestamp": "2026-01-01T08:15:00Z",
  "user": "auditor",
  "action": "approve",
  "hash": "def456...",
  "hash_of_previous_entry": "abc123..."  ← Chain verification
}
```

**Evidence for Auditor**:
- Demonstrate hash chain verification
- Show attempt to modify log → failure
- Logs protected via file permissions (400, owned by app)
- Logs on immutable storage (AWS S3 Object Lock, Azure Immutable Blobs)

---

## A.14 System Acquisition, Development & Maintenance

### A.14.1 Information Security Requirements in System Acquisition

**Requirement**: Security requirements shall be defined for all new system acquisitions.

**sapstack Implementation**:
```
Development process:
  1. Design phase: Threat model defined (SECURITY.md)
  2. Implementation: Schema validation, input sanitization
  3. Testing: Dependency audit (npm audit), security scanning
  4. Release: Signed commits, vulnerability disclosure process

Security requirements documented in:
  - SECURITY.md (threat model, data handling)
  - CODE_OF_CONDUCT.md (acceptable use)
  - docs/compliance/* (regulatory mappings)
```

### A.14.2.1 Secure Development Policy

**Requirement**: Development & maintenance shall be performed in secure manner.

**sapstack Implementation**:
```
Secure coding practices:
  1. Input validation: All user inputs validated at system boundary
  2. Error handling: Errors logged without exposing sensitive data
  3. Cryptography: Encryption recommendations (not enforced, user-deployed)
  4. Code review: PRs require 1+ approval before merge
  5. Testing: Jest/Vitest required; 80%+ coverage
  6. Dependency audit: npm audit gated in CI

Enforced in CI/CD:
  - GitHub Actions: npm audit, tsc --strict, eslint, test coverage
  - Failed checks block merge to main
```

**Evidence for Auditor**:
- GitHub PR history showing code reviews
- CI/CD pipeline output (audit, lint, test results)
- Dependency audit report (no unremitted vulnerabilities)

### A.14.2.5 Access Control in Development

**Requirement**: Development, test, and production environments shall be separated.

**sapstack Implementation**:
```
Environments:
  - Development: Local machine, feature branches, no real data
  - Staging: Pre-release testing, anonymized data, shared by team
  - Production: Main branch, encrypted Evidence Bundles, restricted access

Access control:
  - Only maintainers can merge to main
  - Production deploys require CI/CD gates
  - No direct production database access (read-only audit interface)
```

**Gap**: Add environment-specific credential management (vault for production keys).

---

## A.16 Information Security Incident Management

### A.16.1 Event & Weakness Reporting

**Requirement**: Users shall report information security events and weaknesses.

**sapstack Implementation**:
```
Reporting channels:
  1. GitHub Issues (public) — Non-sensitive bugs/feature requests
  2. GitHub Security Advisory (private) — Vulnerabilities
  3. Email (security@...) — Private disclosure, no GitHub needed

Reporting process:
  - Reporter submits evidence (PoC, reproduction steps, CVSS score)
  - Maintainer acknowledges within 48 hours
  - Maintainer provides timeline (5 days critical, 30 days high, 90 days medium)
  - Fix published in release notes + credits reporter

Evidence:
  - SECURITY.md documents process
  - GitHub advisories show response times
  - Release notes document fixes
```

### A.16.1.1 Incident Response Plan

**Requirement**: Incident response procedure shall exist and be tested.

**sapstack Implementation**:
```
Incident lifecycle:
  Detection → Reporting → Triage → Fix → Testing → Release → Disclosure

Example: Command injection vulnerability in script
  1. Detection: Researcher reports via security advisory
  2. Reporting: Maintainer acknowledges in 24 hours
  3. Triage: Confirm vulnerability, assess impact
  4. Fix: Code fix + test case
  5. Testing: Verify fix prevents attack
  6. Release: GitHub release + npm publish
  7. Disclosure: GitHub advisory published, credits issued
```

**Evidence for Auditor**:
- Incident response procedure (SECURITY.md)
- GitHub advisories showing incident timeline
- Release notes documenting fixes

---

## A.18 Compliance

### A.18.1 Compliance with Legal & Regulatory Requirements

**Requirement**: Organization shall identify & comply with applicable laws, regulations, contractual obligations.

**sapstack Implementation**:
```
Compliance mapping:
  - K-SOX (한국 기업 회계관리법) → docs/compliance/k-sox.md
  - SOC 2 (US service orgs) → docs/compliance/soc2-readiness.md
  - GDPR (EU data privacy) → docs/compliance/gdpr-article-32.md
  - ISO 27001 (global ISMS) → docs/compliance/iso-27001-annex-a.md

Data residency:
  - No data stored in sapstack (user-deployed, air-gap capable)
  - Audit trail local-only (JSONL files in .sapstack/ directory)
  - PII handled per local data protection laws (PIPA, GDPR, etc.)
```

### A.18.1.1 Identification of Applicable Legislation

**Requirement**: All applicable legislation, regulation, contractual clauses shall be identified.

**sapstack Evidence**:
```
Identified legal requirements:
  1. K-SOX (한국): Public companies must maintain ICFR controls
     sapstack contribution: Audit trail, access control, change management
     
  2. GDPR (EU): Data processors must provide technical safeguards (Article 32)
     sapstack contribution: PII scrubbing, encryption recommendations, audit trail
     
  3. HIPAA (US): Healthcare data must be encrypted at rest/transit
     sapstack contribution: Encryption recommendations (user implements)
     
  4. SOC 2 (US): Service orgs must demonstrate processing integrity + confidentiality
     sapstack contribution: Audit trail, error detection, access control
     
  5. ISO 27001 (Global): ISMS certification requires 93 controls
     sapstack contribution: A.5, A.9, A.12, A.14, A.16, A.18 (partial)

For each:
  - Identified? ✓ (documented in compliance/ directory)
  - Applicable? ✓ (mapped to sapstack use cases)
  - Implemented? ✓ (features exist in code)
  - Tested? ✓ (compliance-mode Evidence Loop exists)
```

### A.18.2 Information Security Compliance Audits

**Requirement**: Compliance with information security controls shall be audited.

**sapstack Implementation**:
```
Audit mechanisms:
  1. Monthly Evidence Loop with compliance-mode flag
     $ sapstack evidence-loop --compliance-mode iso27001
     
  2. Quarterly control assessment (design + operating effectiveness)
  
  3. Annual third-party audit (external SOC 2 / ISO 27001 firm)

Audit evidence:
  - Audit trail (JSONL, tamper-evident)
  - Evidence Bundles (PII scrubbed)
  - Control test results (no unremitted findings)
  - Remediation log (issues found & fixed)
```

---

## Implementation Roadmap: ISO 27001 Certification

### Phase 1 (Q2 2026): Gap Assessment
- [ ] Map sapstack features to ISO 27001 Annex A (this document)
- [ ] Identify gaps (physical security, BC/DR, etc. — out of scope)
- [ ] Document remediation plan

### Phase 2 (Q3 2026): Control Implementation
- [ ] Implement missing controls (A.5.2 role certification, etc.)
- [ ] Document control design
- [ ] Prepare evidence collection procedures

### Phase 3 (Q4 2026): Testing & Evidence Collection
- [ ] Run 6-month operating effectiveness tests
- [ ] Collect audit trail, logs, test results
- [ ] Document any findings & remediation

### Phase 4 (H1 2027): External Audit
- [ ] Engage ISO 27001 certification body
- [ ] Provide 6-month evidence + control design docs
- [ ] Participate in auditor interviews
- [ ] Address findings

### Phase 5 (H1 2027): Certification
- [ ] Receive ISO 27001:2022 certificate
- [ ] Publish certificate on sapstack website
- [ ] Maintain ongoing compliance (annual surveillance audits)

---

## FAQ

**Q: Does sapstack mean we're ISO 27001 compliant?**
A: No. sapstack implements 8 of 93 controls. You must implement the remaining 85 (physical security, BC/DR, etc.).

**Q: What controls does sapstack NOT cover?**
A: Physical security, business continuity, personnel security, supplier relationships, asset management, etc.

**Q: Can we use sapstack as "evidence" for ISO certification?**
A: Yes, sapstack Audit Trail + Evidence Bundles can be part of your audit evidence package.

**Q: When will sapstack be ISO 27001 certified?**
A: Roadmap: 2027 H1 (awaiting third-party audit).

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+
