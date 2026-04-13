# Security Policy

## Overview

This document defines sapstack's security posture, threat model, data handling principles, and compliance recommendations for enterprise deployment. sapstack is an **open-source plugin framework** — organizations remain responsible for their own security controls and compliance certifications.

## Threat Model

sapstack operates in three principal threat domains:

### 1. Evidence Bundle Exposure
- Evidence Bundles may contain production SAP system data including:
  - **PII**: Employee IDs, names, bank accounts, tax numbers (주민번호, 사업자번호)
  - **Financial**: GL balances, cost allocations, payment methods
  - **Operational**: Stock levels, customer orders, vendor contracts
  - **Configuration**: Authorization roles, IMG settings, transport logs
- **Risk**: Lateral movement if bundle leaked; supply chain reconnaissance
- **Mitigation**: Automatic PII scrubbing, classification metadata, encryption at rest

### 2. Air-Gap Deployment (망분리 환경)
- Korean financial/defense/public sector frequently require offline-first architectures
- MCP stdio connection may cross security boundaries
- **Risk**: Unauthorized data exfiltration if CLI process compromised
- **Mitigation**: `--offline` mode, bundled npm tarball validation, signed releases (roadmap)

### 3. Supply Chain Risk
- 15 npm transitive dependencies (audit tracked weekly)
- Third-party MCP servers (Claude, OpenAI Codex via plugin)
- **Risk**: Typosquatting, abandoned package takeover, zero-day in dependency
- **Mitigation**: `npm audit` gating in CI, Dependabot PRs, no unapproved transitive deps, vendor locking

## Data Handling

### Evidence Bundle Structure

Evidence Bundles are JSON/YAML snapshots of SAP diagnostics collected during sessions.

**Data Classification Levels:**
```
[PUBLIC]       → SAP T-code documentation, configuration patterns (no company data)
[INTERNAL]     → Employee identifiers, organization structure, cost center hierarchy
[CONFIDENTIAL]  → GL account balances, cost allocations, payment details
[RESTRICTED]   → PII (주민번호, 사업자번호), confidential contracts, audit findings
```

**Storage Recommendations:**
- At-rest encryption: AES-256 (user-deployed, sapstack does not encrypt internally)
- Access control: Role-based, signed audit trail
- Retention: Minimum 5 years for K-SOX (한국 기업 회계법 기준), configurable
- Deletion: Secure wipe (not recoverable via undelete tools)

### PII Scrubbing Guidelines

Evidence Bundles are **automatically scrubbed** of Korean personal identifiers before storage.

**Patterns Masked:**
```
주민번호 (Jumin)           → ######-#######     (e.g., 123456-1234567)
사업자등록번호 (BizNum)      → ###-##-#####       (e.g., 000-00-00000)
휴대전화 (Phone Mobile)    → 010-****-****     (e.g., 010-1234-5678)
일반전화 (Phone Fixed)     → 02-****-****      (e.g., 02-1234-5678)
이메일 (Email)            → user****@example.com
신용카드번호 (Credit Card)  → ****-****-****-1234
계좌번호 (Bank Account)   → ###-##-######
```

**Implementation**: See `mcp/pii-scrubber.ts` for regex patterns and masking algorithm.

**When NOT to Scrub:**
- Diagnostic necessity: If a field's actual value is required to root-cause an error, document the decision and restrict access
- Contractual requirement: If client explicitly requests unmasked data for audit, apply additional encryption + role-based controls

**Legal Basis:**
- 개인정보보호법 (PIPA) Article 15 — Safe storage of personal data
- 정보통신망법 (IMNSA) Article 29 — User data protection
- 신용정보보호법 (CCPA) Article 21 — Technical safeguards

---

## Air-Gapped Deployment (망분리 환경)

### Pre-Deployment

1. **Download Bundle**
   ```bash
   # On connected machine
   npm pack sapstack
   # Output: sapstack-1.7.0.tgz (15 MB)
   
   # Verify checksum against GitHub Release
   sha256sum sapstack-1.7.0.tgz
   # Compare: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.7.0
   ```

2. **Verify Signatures** (Roadmap for v1.8.0)
   ```bash
   gpg --verify sapstack-1.7.0.tgz.sig sapstack-1.7.0.tgz
   ```

### Installation (Offline)

```bash
# On air-gapped machine (no outbound internet)
npm install --offline \
  --registry file:///local/npm-cache \
  --no-optional \
  --no-package-lock \
  sapstack-1.7.0.tgz

# Verify installation
./node_modules/.bin/sapstack --version
```

### MCP Server Runtime

```bash
# Start MCP server in offline mode
./scripts/mcp-server.sh --offline --config .sapstack/config.yaml

# MCP server reads/writes to local files only:
# - .sapstack/sessions/*.yaml        (session state)
# - .sapstack/audit-trail.jsonl      (append-only audit log)
# - .sapstack/evidence-bundles/*.json (evidence snapshots)

# No outbound connections (Claude API calls happen outside MCP, in user's application)
```

### Session Management

All session state is **local-only** in air-gapped mode:
```yaml
# .sapstack/sessions/{session-id}/state.yaml
session_id: "sess_abc123..."
created_at: "2026-04-13T10:00:00Z"
environment: "ECC 6.0 (SAP Basis 7.52)"
evidence_bundle:
  classification: [INTERNAL, CONFIDENTIAL]
  scrubbed_at: "2026-04-13T10:05:00Z"
  masking_hits: 12  # 12 PII patterns removed
audit_trail:
  who: "operator@company.local"  # LDAP user, not internet email
  what: "GL balance inquiry for cost center Z001"
  when: "2026-04-13T10:05:00Z"
  why: "Month-end reconciliation"
```

### Update Process (Quarterly)

```bash
# Q2 2026: Media transfer of sapstack-1.8.0.tgz via USB/encrypted disk
# IT admin:
1. Verify checksum on transfer medium
2. Run integration tests in staging air-gap
3. Deploy to production via change control
4. Audit trail records: who approved, when, reason
```

### Enterprise Examples

**금융기관 (Financial Services)**
- 망분리 Tier 1: 서버-클라이언트 분리 (별도 계정)
- Quarterly updates via IT Operations
- Evidence bundles stored in HSM (Hardware Security Module)
- 감사원 조회 시 unmasked access via encrypted audit interface

**공공기관 (Government)**
- 정보보안 기준 (ISMS) 인증 필수
- All bundles classified as RESTRICTED (법령상 국가정보)
- Handoff to external auditor via encrypted USB only
- 3년 보관 후 폐기

**방산업체 (Defense Contractor)**
- 군 보안 지침 준수 (TS-2023-1)
- MCP server runs in DMZ isolation
- Evidence bundles never leave secured terminal
- "Need to know" basis for audit access

---

## Dependency Security (Supply Chain)

### npm Audit Gating

Every commit triggers CI check:
```bash
npm audit --audit-level=moderate
# Fails CI if any dependency has moderate+ vulnerability
# Maintainer response: 48 hours for critical, 2 weeks for moderate
```

### Transitive Dependency Lock

```json
{
  "dependencies": {
    "js-yaml": "4.1.0",      // locked, no ^ or ~
    "pino": "8.16.0",        // pinned version
    "node-red": "3.0.2"      // no auto-update
  },
  "blockUnreviewedTransitive": true  // custom npm hook
}
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    allow:
      - dependency-type: "all"
    reviewers:
      - "BoxLogoDev"
    assignees:
      - "BoxLogoDev"
    commit-message:
      prefix: "chore: bump npm"
```

### Vendor Locking (Private Cloud)

For air-gapped deployments:
```bash
# Generate vendored dependencies
npm ci --production --offline

# Archive with checksum
tar czf sapstack-vendor-1.7.0.tar.gz node_modules/
sha256sum sapstack-vendor-1.7.0.tar.gz > vendor.sha256

# Transfer to air-gap via secure media
# No live npm registry access required
```

---

## Vulnerability Disclosure & Response

### Reporting Channels

**Preferred: GitHub Security Advisory**
1. Navigate to https://github.com/BoxLogoDev/sapstack/security/advisories
2. Click "Report a vulnerability"
3. Fill form with details below

**Fallback: Email**
- Contact: security@boxlogodev.io (or repository maintainer)
- GPG Key: [future release v1.8.0]

### Required Information

```
Vulnerability Title
===================
[e.g., "Command Injection in scripts/validate-excel.sh"]

Type
====
[ ] Code Execution (RCE)
[ ] Information Disclosure
[ ] Privilege Escalation
[ ] Denial of Service
[ ] Cryptographic Weakness
[ ] Other: __________

Affected Files
==============
- scripts/validate-excel.sh (lines 45-52)
- mcp/data-import.ts (function parseUserInput)

Reproduction Steps
==================
1. Create evidence bundle with malicious payload: `"; rm -rf / #"`
2. Run `sapstack import --bundle bundle.json`
3. Observe command execution in audit log

Root Cause Analysis
===================
Script uses $USER_INPUT directly in shell metacharacter context
without quoting or escaping (bash code injection).

Suggested Fix
=============
Replace line 47:
  - OLD: eval "process_file $1"
  + NEW: process_file "$1"  # quote expansion

CVSS 3.1 Score
==============
CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:U/C:H/I:H/A:H
Score: 8.7 (HIGH)

Proof of Concept (Optional)
============================
[Attach minimal PoC code, NOT full exploit]
```

### Response Timeline

| Severity | Stage           | Target |
|----------|-----------------|--------|
| CRITICAL | Receipt ACK     | 24 hours |
|          | Initial analysis| 48 hours |
|          | Fix deployed    | 5 days |
| HIGH     | Receipt ACK     | 48 hours |
|          | Initial analysis| 5 days |
|          | Fix deployed    | 14 days |
| MEDIUM   | Receipt ACK     | 7 days |
|          | Fix deployed    | 30 days |
| LOW      | Acknowledged    | Next planned release |

### CVE Assignment

High/Critical vulnerabilities eligible for CVE-ID assignment.
Coordinated disclosure: Reporter can request embargo period (default 30 days).

### Public Disclosure

After fix is published:
- GitHub Release notes include vulnerability summary + fix
- `docs/security-credits.md` credits reporter (with consent)
- Postmortem analysis published (lessons learned)

---

## Compliance Mappings

sapstack provides **guidance** for integrators building compliant SAP solutions. sapstack itself is **not certified** against any compliance framework; organizations are responsible for their certification.

### SOC 2 Type II (Trust Services Criteria)

| Criterion | sapstack Contribution |
|-----------|------------------------|
| **CC1.1** Access Control Architecture | MCP server access via stdio (no external auth); session state role metadata |
| **CC1.2** Preventive/Detective Controls | Audit trail (append-only JSONL); PII masking |
| **CC6.1** Logical Segregation | Evidence bundles isolated by session_id |
| **CC6.2** Resource Protection | Recommended encryption for evidence storage |
| **CC7.1** System Change Review | Transport request required for config changes |
| **CC7.2** System Monitoring | Session audit_trail captures who/what/when |
| **C1.3** Confidentiality Protection | PII scrubbing (auto); classification metadata |

**Roadmap**: SOC 2 Type II certification (2026 H2) — awaiting third-party audit scope clarification.

See `docs/compliance/soc2-readiness.md` for full mapping.

### ISO 27001 Annex A (Information Security)

| Control | sapstack Implementation |
|---------|------------------------|
| **A.5.1** Access Control Policy | Session roles (operator/auditor/admin) in state.yaml |
| **A.9.1** Access Control | Evidence bundles read-only except by session owner |
| **A.9.4** Information Classification | Classification metadata in Evidence Bundle headers |
| **A.12.4.1** Event Logging | Audit trail (JSONL format, tamper-evident) |
| **A.14.1.1** Information Security Req. | PII scrubbing + encryption recommendations |
| **A.16.1.1** Event Detection | Anomaly detection framework (roadmap v2.0) |

See `docs/compliance/iso-27001-annex-a.md` for full mapping.

### K-SOX (한국 기업 회계관리법)

| ITGC Area | sapstack Control |
|-----------|-----------------|
| **Access Management** | Evidence bundle role-based access (session_id → user mapping) |
| **Change Management** | Transport request + evidence of SAP change + rollback plan |
| **Operations** | Audit trail (who/what/when/why) per transaction |
| **Data Integrity** | PII masking before storage; hash verification for bundles |
| **Segregation of Duties** | Session state restricts diagnostic access by role |

See `docs/compliance/k-sox.md` for full mapping including 외부감사인 (external auditor) guidance.

### GDPR Article 32 (Technical Measures)

| Measure | sapstack Implementation |
|---------|------------------------|
| **Pseudonymization** | PII scrubber masks 주민번호, 사업자번호, 이메일, 계좌번호 |
| **Encryption** | Recommendations in docs/compliance/gdpr-article-32.md (user-deployed) |
| **Confidentiality** | Evidence bundles classified; role-based read control |
| **Integrity** | Hash verification for Evidence Bundle immutability |
| **Availability** | Session resumption via state.yaml (no single point of failure) |
| **Testing** | Evidence Loop sessions serve as periodic testing mechanism |

See `docs/compliance/gdpr-article-32.md` for full mapping.

---

## Out of Scope

sapstack is **not responsible** for security of:

- **SAP System Internals** → Report to SAP Support Portal
- **Claude / Codex / Copilot APIs** → Contact respective vendors
- **User's SAP Production Environment** → SAP consulting firm liability
- **bash / jq / git / Node.js** → Report to respective projects
- **Network infrastructure** → Customer's IT operations
- **Identity Management (LDAP/AD)** → Customer's IAM team

---

## Prohibited Activities

sapstack **explicitly forbids**:

- Automated credential harvesting from SAP systems
- Remote transaction execution (e.g., batch FB01 posts)
- Storage of unmasked PII in bundles without explicit consent
- Automatic production changes without human approval + transport request
- Unauthorized data export to third-party analytics

Any third-party extension violating these rules is **outside sapstack security scope** and must be reported to the extension maintainer.

---

## Sensitive Data Handling — sapstack Repository

### Prohibited in Code/Docs
```
# ❌ FORBIDDEN
Real company codes:        1000, 2000 (use XXXX, YYYY placeholders)
Real employee IDs:        E123456 (use EMPLOYEE_ID placeholder)
Real tax numbers:         123-45-67890 (use XXXXX-XXXXX placeholder)
Real GL accounts:         4101000 (use GL_ACCOUNT placeholder)
Real file paths:          /company/data/ (use /YOUR_COMPANY/data/)
Anonymized names:         Use generic "Company A", "Finance Dept"
Screenshots with metadata: Blur company name, logo, user ID
Actual configuration:     Use "typical" examples from SAP documentation
```

### User Responsibility

When sharing evidence bundles or logs in GitHub issues:
1. **Scrub company identifiers** — Use `mcp/pii-scrubber.ts --review` before posting
2. **Mask environment context** — "ECC 6.0 on-premise" OK; "SAP instance QA2.company.local" NOT OK
3. **Check audit logs** — Verify no GL balances, cost allocations, or employee data in output
4. **Ask maintainer** — When in doubt, share via private GitHub issue

---

## Credit & Attribution

sapstack recognizes and thanks researchers who responsibly disclose security issues.
Credited researchers are listed in `docs/security-credits.md` (with consent).

---

## References

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10 2024](https://owasp.org/www-project-top-ten/)
- [CVSS 3.1 Calculator](https://www.first.org/cvss/calculator/3.1)
- [KISA — 개인정보보호 가이드](https://www.kisa.or.kr/)
- [SAP Security Notes](https://support.sap.com/notes)
- [ISO 27001:2022 Standard](https://www.iso.org/standard/54534.html)

---

**Last Updated**: 2026-04-13  
**Status**: Active (v1.7.0)  
**Next Review**: 2026-06-13
