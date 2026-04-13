# Compliance Framework for sapstack

## Overview

This directory contains **guidance documents** for organizations deploying sapstack in regulated environments (financial services, public sector, defense contracting in Korea and globally).

**Important Disclaimer**: sapstack is **open-source software** and does NOT provide certified compliance against any framework (SOC 2, ISO 27001, K-SOX, GDPR). Organizations remain **solely responsible** for their own compliance certifications and security controls.

These documents are **templates and reference materials** designed to:
1. Help organizations map sapstack features to their own compliance requirements
2. Provide evidence generation workflows that auditors expect
3. Guide the implementation of controls around sapstack deployments

---

## Why sapstack Needs Compliance Guidance

### The Problem
SAP environments frequently handle:
- **Regulated data**: PII, financial records, audit trails
- **Compliance obligations**: K-SOX (한국 기업 회계관리법), GDPR, SOC 2, ISO 27001
- **Audit requirements**: External auditors, regulatory agencies, internal controls

sapstack collects diagnostic "Evidence Bundles" from SAP systems to help diagnose problems. These bundles may inadvertently include sensitive data (GL balances, cost allocations, employee identifiers).

### The Solution
sapstack provides:
1. **Automatic PII scrubbing** — Masks 주민번호, 사업자번호, 이메일, 계좌번호 before storage
2. **Data classification** — Metadata tags (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
3. **Audit trail generation** — Append-only logs that auditors can verify
4. **Session isolation** — Evidence bundles are scoped by session_id, preventing cross-contamination
5. **Offline-first design** — Air-gapped (망분리) deployments with no internet dependency

This compliance framework explains **how to use** these features to satisfy regulatory obligations.

---

## Compliance Frameworks Covered

| Framework | Document | Scope | Audience |
|-----------|----------|-------|----------|
| **K-SOX** | `k-sox.md` | Korean public companies + subsidiaries | CFO, Internal Audit, External Auditors |
| **SOC 2 Type II** | `soc2-readiness.md` | SaaS providers, cloud integrators | CIO, Security team |
| **ISO 27001** | `iso-27001-annex-a.md` | Global information security management | CISO, ISO certification body |
| **GDPR Article 32** | `gdpr-article-32.md` | EU data processors, global services | Data Protection Officer (DPO) |
| **Operational** | `air-gapped-deployment.md` | Korean defense, finance, public sector | IT Operations, Security Operations |
| **Data Handling** | `pii-handling.md` | All regulated environments | Data Governance, Legal |
| **Audit Trail** | `audit-trail.md` | Forensic investigation, compliance proof | Internal Audit, External Auditors |

---

## How to Use This Framework

### Step 1: Identify Your Compliance Obligations

**For Korean Organizations:**
- Public company? → Start with `k-sox.md`
- Financial institution? → Add `gdpr-article-32.md` (if you serve EU customers) + air-gap guidance
- Government/Defense? → `air-gapped-deployment.md` + `k-sox.md`

**For Global Organizations:**
- Serving EU customers? → `gdpr-article-32.md`
- SaaS provider? → `soc2-readiness.md`
- Multi-country? → `iso-27001-annex-a.md` (universal baseline)

### Step 2: Map sapstack to Your Controls

Each document contains a **control mapping table** showing:
- **Control requirement** (from the framework)
- **sapstack contribution** (what sapstack provides out-of-box)
- **Integration point** (where to hook your own controls)
- **Evidence format** (what an auditor will verify)

**Example** (K-SOX Access Control):
```
Control:        Change Management → Transport Request
sapstack part:  Audit trail records SAP change transport #
Your part:      You manage transport request sign-off + testing
Evidence:       .sapstack/audit-trail.jsonl shows [who requested, 
                 when, which transport, rollback plan]
Auditor sees:   Correlation between Evidence Bundle and TR history
```

### Step 3: Configure sapstack for Your Audit

**Configuration file**: `.sapstack/config.yaml`

```yaml
# Compliance settings
compliance:
  framework: "k-sox"  # or "soc2", "iso27001", "gdpr"
  retention_days: 1825  # 5 years for K-SOX (상법)
  pii_scrub: true
  classification_required: true
  audit_trail_immutable: true
  
# Data handling
data:
  evidence_bundles:
    location: "/secure/data/bundles"  # Encrypted volume
    encryption: "aes-256-gcm"
    retention_policy: "5-year-hold-then-wipe"
  
# Access control
access:
  audit_role:
    read_unmasked: true     # Auditors can see original data
    require_mfa: true
  operator_role:
    read_masked: true       # Operators see scrubbed data only
    write_permission: false # Append-only

# Audit
audit:
  trail_location: ".sapstack/audit-trail.jsonl"
  log_format: "jsonl"       # Tamper-evident format
  tamper_detection: true
```

### Step 4: Generate Audit Evidence

Run compliance-oriented Evidence Loop sessions:

```bash
sapstack evidence-loop --compliance-mode k-sox \
  --environment "SAP ECC 6.0 (QA2)" \
  --description "Month-end GL reconciliation — Cost Center Z001" \
  --transport-request "TR-2026-04-0123" \
  --approver "finance-manager@company.local"
```

Output:
```
.sapstack/sessions/sess_abc123/
├── state.yaml            # Session metadata + classification
├── evidence-bundle.json  # Diagnostic snapshot (PII scrubbed)
├── audit-trail.jsonl     # Immutable action log
└── compliance-report.md  # Auto-generated for auditors
```

---

## Audit Delivery Package

When external auditors request evidence:

1. **Prepare the package**:
   ```bash
   sapstack export-audit \
     --framework k-sox \
     --period "2026-Q1" \
     --output audit-package-2026-Q1.tar.gz
   ```

2. **Contents**:
   - `compliance-summary.md` — Control attestation
   - `evidence-bundles/` — Anonymized diagnostic data
   - `audit-trails/` — JSONL logs (chain of custody)
   - `control-mappings.xlsx` — Detailed control evidence matrix
   - `remediation-log.md` — Any findings + fixes

3. **Deliver**:
   - Via encrypted transfer (AES-256, PGP key exchange)
   - Document chain of custody (who received, when, signature)
   - Store audit copies in WORM (Write-Once-Read-Many) media if required

---

## Common Scenarios

### Scenario 1: Financial Institution, SAP ECC 6.0, On-Premise

**Regulations**: K-SOX (기업 회계관리법) + GDPR (if EU customers)

**Steps**:
1. Read `k-sox.md` → understand ITGC (IT General Controls)
2. Apply `pii-handling.md` → configure PII scrubbing for GL/employee data
3. Implement air-gap from `air-gapped-deployment.md` → offline bundle import
4. Use `audit-trail.md` → document all SAP GL changes via Evidence Loop
5. Deliver to external auditor via `compliance/export-audit` tool

**Timeline**: 3-month implementation, 1-week audit readiness

---

### Scenario 2: SaaS Company, Serving Global Customers

**Regulations**: SOC 2 Type II (US), GDPR (EU), Potential ISO 27001

**Steps**:
1. Read `soc2-readiness.md` → Security criterion (access logs, change control)
2. Map `iso-27001-annex-a.md` → Universal controls for A.5, A.9, A.12, A.14, A.16
3. Establish `audit-trail.md` + `pii-handling.md` → Audit trail generation for SOC 2 testing
4. Document evidence collection process in policy docs
5. Engage SOC 2 audit firm → 6-month attestation engagement

**Timeline**: 6-month SOC 2, ongoing ISO 27001 alignment

---

### Scenario 3: Government Agency, S/4HANA RISE (SAP Cloud)

**Regulations**: K-SOX (if public agency accounting) + 정보보안 기준 (ISMS) + 개인정보보호법

**Steps**:
1. Read `k-sox.md` → Government agencies have stricter ITGC requirements
2. Read `air-gapped-deployment.md` → Offline bundle handling for classified data
3. Apply `pii-handling.md` with high sensitivity → Government data = restricted classification
4. Implement `gdpr-article-32.md` measures → Encryption, access control
5. Coordinate with ISMS audit team for certification

**Timeline**: 4-6 month ISMS certification engagement

---

### Scenario 4: Defense Contractor, Production SAP System

**Regulations**: K-SOX + 방위사업법 보안 (Defense Industry Security Act)

**Steps**:
1. **Do NOT use Evidence Loop in production** — evidence bundles contain classified data
2. Instead, use sapstack in **staging/test environment only**
3. If production diagnostics absolutely necessary:
   - Evidence bundle never leaves secured terminal (no file export)
   - Manual review by authorized officer
   - Destroy session after diagnosis
4. Document in security plan per TS-2023-1 (SAP Baseline Security for Defense)

**Timeline**: Design → 2-week integration → security accreditation

---

## Roadmap: Compliance-as-Code

**v1.8.0 (2026 H2)**
- `sapstack audit-ready` → Automated compliance readiness report
- SOC 2 Type II certification engagement (third-party audit)
- HIPAA-ready mode (for healthcare customers in US)

**v2.0 (2027 H1)**
- Continuous compliance monitoring (CloudWatch/Prometheus)
- Anomaly detection for audit trail (ML-based)
- Multi-framework simultaneous mapping (K-SOX + ISO 27001 + GDPR in one report)

---

## Disclaimer & Liability

**sapstack provides guidance ONLY.** Compliance is the responsibility of the implementing organization.

- sapstack is **not a compliance tool** — it's a diagnostic plugin for SAP
- sapstack **does not provide legal advice** — consult your organization's legal team
- sapstack **is not certified** against any compliance framework
- Organizations must engage third-party auditors for formal compliance certifications
- sapstack maintainers **accept no liability** for regulatory violations or failed audits

**Use at your own risk.** When in doubt, consult your compliance officer or external auditor.

---

## Contact & Support

For questions about compliance application of sapstack:

1. **Check the documentation**: Start here (`docs/compliance/`)
2. **Ask the community**: GitHub Discussions (tag: `compliance`)
3. **Report a gap**: GitHub Issues (include your framework + scenario)
4. **Professional consulting**: Contact a SAP compliance specialist (not BoxLogoDev)

---

**Last Updated**: 2026-04-13  
**Framework Version**: 1.0  
**Applicable to**: sapstack v1.7.0+
