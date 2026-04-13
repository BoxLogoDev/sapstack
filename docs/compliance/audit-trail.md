# Audit Trail: 감사추적 생성 및 검증 가이드

## Overview

**Audit Trail** (감시추적) = 누가, 무엇을, 언제, 왜 했는지 기록하는 불변 로그.

**sapstack Audit Trail**: `.sapstack/audit-trail.jsonl`
- 포맷: JSONL (JSON Lines — 라인당 1 JSON object)
- 특징: Append-only (추가만 가능, 수정/삭제 불가)
- 무결성: SHA256 해시 체인 (tamper detection)
- 보관: 5-7년 (한국 법령, 감사 목적)

**용도**:
1. K-SOX 컴플라이언스 (분기별 내부통제 평가)
2. 외부감사 (연말 SAP 감시 감사)
3. 포렌식 조사 (문제 발생 시 root cause analysis)
4. 규제 대응 (감시원, 감사원 자료 요청)

---

## Audit Trail 구조

### Basic Entry Format

```jsonl
{
  "timestamp": "2026-04-13T10:00:00.000Z",
  "entry_id": "001234",
  "who": "FIN_OPERATOR",
  "action": "create_session",
  "session_id": "sess_001",
  "resource": "n/a",
  "classification": "INTERNAL",
  "result": "success",
  "details": {
    "purpose": "Month-end GL reconciliation",
    "sap_environment": "ECC 6.0"
  }
}
```

### Required Fields

| Field | Purpose | Example |
|-------|---------|---------|
| **timestamp** | UTC 시간 (ISO8601) | 2026-04-13T10:00:00.000Z |
| **entry_id** | 순번 (6자리) | 001234 |
| **who** | 사용자 (LDAP/AD user, not email) | FIN_OPERATOR, AUDITOR_ALICE |
| **action** | 수행한 작업 | create_session, query_gl, approve, delete |
| **session_id** | 관련 세션 (추적용) | sess_001 |
| **resource** | 영향받은 리소스 | GL 1101000, Evidence Bundle sess_001 |
| **classification** | 데이터 민감도 | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED |
| **result** | 성공/실패 | success, denied, error |
| **details** | 추가 컨텍스트 (JSON object) | {reason, error_msg, data_volume, ...} |

### Optional Fields (status에 따라)

```jsonl
{
  "...core fields...",
  "mfa_verified": true,           // MFA 사용 여부
  "ip_address": "192.168.1.100",  // 요청 출처 (로컬은 127.0.0.1 또는 unix socket)
  "data_volume": 1234,            // 처리된 행 수
  "execution_time_ms": 245,       // 실행 시간
  "error_code": "AUTH_DENIED",    // 실패 원인
  "reason": "Insufficient rights", // 사람이 읽을 수 있는 설명
  "parent_entry_id": "001230"     // 관련 이전 항목
}
```

---

## Audit Trail 생성 — 주요 이벤트

### 1. Session Management

```jsonl
// Session 생성
{"timestamp": "2026-04-13T10:00:00Z", "entry_id": "001001", "who": "FIN_OP", "action": "create_session", "session_id": "sess_001", "resource": "n/a", "classification": "INTERNAL", "result": "success", "details": {"purpose": "Month-end GL reconciliation", "sap_env": "ECC 6.0"}}

// Session에 첫 Evidence Bundle 추가
{"timestamp": "2026-04-13T10:15:00Z", "entry_id": "001002", "who": "FIN_OP", "action": "add_evidence_bundle", "session_id": "sess_001", "resource": "evidence_001.json", "classification": "CONFIDENTIAL", "result": "success", "details": {"bundle_size_kb": 256, "pii_scrubbed": true, "masking_hits": 5}}

// Session 종료 (확정)
{"timestamp": "2026-04-13T11:00:00Z", "entry_id": "001003", "who": "FIN_OP", "action": "close_session", "session_id": "sess_001", "resource": "n/a", "classification": "INTERNAL", "result": "success", "details": {"duration_minutes": 60, "bundles_collected": 1, "findings": 0}}
```

### 2. Data Access & Querying

```jsonl
// GL 잔액 조회
{"timestamp": "2026-04-13T10:20:00Z", "entry_id": "001004", "who": "FIN_OP", "action": "query_gl", "session_id": "sess_001", "resource": "GL_1101000", "classification": "CONFIDENTIAL", "result": "success", "details": {"table": "bseg", "rows_returned": 1234, "amount_total": "5234567000 KRW", "period": "2026-03"}}

// AR 나이별 분석 조회
{"timestamp": "2026-04-13T10:25:00Z", "entry_id": "001005", "who": "FIN_OP", "action": "query_ar_aging", "session_id": "sess_001", "resource": "AR_SUMMARY", "classification": "CONFIDENTIAL", "result": "success", "details": {"rows_returned": 250, "overdue_count": 15}}
```

### 3. Authorization & Access Control

```jsonl
// 정상 접근
{"timestamp": "2026-04-13T10:30:00Z", "entry_id": "001006", "who": "AUDITOR_ALICE", "action": "view_evidence_bundle", "session_id": "sess_001", "resource": "evidence_001.json", "classification": "CONFIDENTIAL", "result": "success", "details": {"access_level": "unmasked", "mfa_verified": true, "approval_id": "req_abc123"}}

// 접근 거부
{"timestamp": "2026-04-13T10:31:00Z", "entry_id": "001007", "who": "OPERATOR_BOB", "action": "view_evidence_bundle", "session_id": "sess_001", "resource": "evidence_001.json", "classification": "RESTRICTED", "result": "denied", "details": {"reason": "Insufficient rights (operator cannot view RESTRICTED bundles)", "required_role": "auditor", "user_role": "operator"}}
```

### 4. Data Modification & Remediation

```jsonl
// GL 거래 수정 (reversal + repost)
{"timestamp": "2026-04-13T14:00:00Z", "entry_id": "001015", "who": "FIN_OPERATOR", "action": "reverse_posting", "session_id": "sess_001", "resource": "GL_posting_1223", "classification": "CONFIDENTIAL", "result": "success", "details": {"posting_id": 1223, "original_amount": 10000, "reason": "Invoice number typo", "reversal_posting_id": 1250, "approval_required": true, "approver": "FINANCE_MANAGER"}}

{"timestamp": "2026-04-13T14:15:00Z", "entry_id": "001016", "who": "FINANCE_MANAGER", "action": "approve_reversal", "session_id": "sess_001", "resource": "GL_posting_1250", "classification": "CONFIDENTIAL", "result": "success", "details": {"posting_id": 1250, "approval_timestamp": "2026-04-13T14:15:00Z"}}
```

### 5. Change Management

```jsonl
// Transport Request 생성
{"timestamp": "2026-04-13T09:00:00Z", "entry_id": "001100", "who": "SAP_BASIS", "action": "create_transport_request", "session_id": "sess_change_001", "resource": "TR-2026-04-0456", "classification": "INTERNAL", "result": "success", "details": {"transport_id": "TR-2026-04-0456", "type": "Customizing", "description": "Add GL account 8401 for Q2 cost center reorg", "target_systems": ["DEV", "QA", "PROD"]}}

// Transport 테스트 완료
{"timestamp": "2026-04-13T16:00:00Z", "entry_id": "001101", "who": "QA_TESTER", "action": "complete_transport_test", "session_id": "sess_change_001", "resource": "TR-2026-04-0456", "classification": "INTERNAL", "result": "success", "details": {"test_result": "PASS", "test_cases_run": 5, "test_cases_passed": 5, "test_duration_minutes": 120, "gl_account_8401_verified": true}}

// Transport 프로덕션 배포
{"timestamp": "2026-04-14T22:00:00Z", "entry_id": "001102", "who": "PROD_RELEASE_MGR", "action": "deploy_transport", "session_id": "sess_change_001", "resource": "TR-2026-04-0456", "classification": "INTERNAL", "result": "success", "details": {"target_system": "PROD", "deployment_time_utc": "2026-04-14T22:00:00Z", "duration_seconds": 120, "post_deployment_validation": "PASS"}}
```

### 6. Compliance & Audit

```jsonl
// 분기별 컴플라이언스 평가 시작
{"timestamp": "2026-04-01T08:00:00Z", "entry_id": "002001", "who": "INTERNAL_AUDITOR", "action": "start_compliance_review", "session_id": "sess_q1_audit", "resource": "Q1_2026_review", "classification": "INTERNAL", "result": "success", "details": {"framework": "k-sox", "quarter": "Q1", "scope": "ITGC testing", "planned_duration_days": 10}}

// 내부감시 발견
{"timestamp": "2026-04-05T14:00:00Z", "entry_id": "002005", "who": "INTERNAL_AUDITOR", "action": "log_finding", "session_id": "sess_q1_audit", "resource": "FINDING-2026-Q1-001", "classification": "INTERNAL", "result": "success", "details": {"finding_title": "User JOHNDOE has excessive GL authorization", "severity": "HIGH", "control_area": "Segregation of Duties", "remediation_plan": "Remove FIN_ANALYST role from JOHNDOE"}}

// 발견 사항 해결
{"timestamp": "2026-04-06T16:00:00Z", "entry_id": "002006", "who": "JOHNDOE", "action": "remediate_finding", "session_id": "sess_q1_audit", "resource": "FINDING-2026-Q1-001", "classification": "INTERNAL", "result": "success", "details": {"action_taken": "Role FIN_ANALYST removed", "transport_request": "TR-2026-04-0456", "verification_date": "2026-04-06", "remediation_status": "CLOSED"}}
```

---

## Audit Trail 무결성 보증

### Append-Only Protection

```jsonl
// 각 Entry는 이전 Entry의 해시를 포함 (해시 체인)

{"entry_id": "001", "timestamp": "...", "who": "...", "hash": "abc123def456", "prev_hash": null}
{"entry_id": "002", "timestamp": "...", "who": "...", "hash": "ghi789jkl012", "prev_hash": "abc123def456"}  ← 이전 해시 참조
{"entry_id": "003", "timestamp": "...", "who": "...", "hash": "mno345pqr678", "prev_hash": "ghi789jkl012"}  ← 해시 체인 유지

위변조 감지:
  Entry 002를 수정하려고 시도:
    Before: prev_hash="abc123def456"
    After:  prev_hash="xyz999"  ← 변경됨
    
  Entry 003을 읽으면:
    Expected: prev_hash="ghi789jkl012" (modified entry 002)
    Actual:   prev_hash="ghi789jkl012" (original entry 002)
    Result:   MISMATCH → 위변조 감지 ✓
```

### Immutable Storage

```bash
# Audit trail을 WORM (Write-Once-Read-Many) 저장소에 배치

옵션 1: AWS S3 Object Lock
  $ aws s3 cp audit-trail.jsonl s3://sapstack-audit/ \
    --metadata '{"x-amz-object-lock-mode":"GOVERNANCE", "x-amz-object-lock-retain-until-date":"2031-04-13"}'
  
  결과: 2031년까지 수정/삭제 불가능

옵션 2: Azure Immutable Blobs
  $ az storage blob upload \
    --container audit \
    --file audit-trail.jsonl \
    --account-name myaccount \
    --tier-to-archive false \
    --immutable-policy-retention-days 2555

옵션 3: 온프레미스 파일 시스템
  # Linux: chmod 000 (root만 read)
  $ chmod 400 audit-trail.jsonl
  $ chattr +i audit-trail.jsonl  # immutable flag (even root cannot modify)
```

### Hash Verification (월별)

```bash
# 매달 해시 체인 검증
sapstack audit-trail-verify --month 2026-04 --output report.json

처리:
  1. .sapstack/audit-trail.jsonl 읽음
  2. 각 Entry의 해시 재계산
  3. prev_hash 필드와 비교
  4. 체인 완결성 확인 (gaps 없음?)
  5. 보고서 생성

결과:
{
  "period": "2026-04",
  "total_entries": 5000,
  "hash_verification": {
    "status": "PASS",
    "entries_verified": 5000,
    "chain_integrity": "UNBROKEN",
    "gaps_detected": 0,
    "tamper_attempts": 0
  },
  "report": "All 5000 entries verified. No tampering detected.",
  "signed_by": "sapstack audit system",
  "signature": "-----BEGIN DIGITAL SIGNATURE-----..."
}
```

---

## Audit Trail Export & Delivery

### Export Format for Auditors

```bash
# 외부감사인이 요청하면:
sapstack export-audit-trail \
  --period "2026-01-01:2026-12-31" \
  --framework "k-sox" \
  --format "jsonl" \
  --include-hash-verification \
  --output audit-package-2026.tar.gz

패키지 내용:
audit-package-2026.tar.gz
├── audit-trail-2026.jsonl              (1000만+ 줄)
├── hash-verification-report.pdf        (무결성 증명)
├── entry-index.xlsx                    (빠른 검색용)
├── summary-statistics.md               (통계)
└── README.txt                          (안내)

Entry Index (Excel):
  Date Range | User | Action | Count | Status
  2026-01-01 | FIN_OP | query_gl | 250 | success
  2026-01-01 | AUDITOR_ALICE | view_bundle | 1 | success
  ...
```

### Chain of Custody

```markdown
# Audit Trail Delivery Certificate

Date: 2026-04-13
Delivered by: IT Manager (kim.it@company.local)
Received by: External Auditor (alice.auditor@audit-firm.com)

Contents:
  - audit-package-2026.tar.gz (2.3 GB)
  - Checksum: sha256: abc123def456...
  - Encryption: AES-256 (key via separate channel)

Delivery Method:
  - USB drive (encrypted via BitLocker)
  - Transfer Date: 2026-04-13
  - Signature (delivery): ___________
  - Signature (receipt):  ___________

Audit Trail Period:
  - Start: 2026-01-01T00:00:00Z
  - End: 2026-12-31T23:59:59Z
  - Total Entries: 5,234,890
  - Hash Chain: VERIFIED (no gaps, no tampering)

Retention:
  - Auditor retention: Until audit completion (est. 2026-06-30)
  - Company retention: 7 years (per K-SOX)
```

---

## Audit Trail Analysis & Investigation

### 포렌식 조회 (Forensic Query)

```bash
# 문제 발생 시 root cause 찾기

# 예시: GL 1101000 잔액이 감소했는데 원인을 모름
sapstack search-audit-trail \
  --resource "GL_1101000" \
  --action "modify,reverse" \
  --date-range "2026-03-25:2026-04-01" \
  --output /tmp/forensic-report.json

결과:
[
  {
    "timestamp": "2026-03-31T14:30:00Z",
    "entry_id": "001245",
    "who": "FIN_OPERATOR",
    "action": "reverse_posting",
    "posting_id": 1223,
    "amount": 5000,
    "reason": "Invoice INV-000123 typo correction"
  },
  {
    "timestamp": "2026-03-31T14:35:00Z",
    "entry_id": "001246",
    "who": "FINANCE_MANAGER",
    "action": "approve_reversal",
    "posting_id": 1223,
    "approval_status": "success"
  }
]

분석: GL 1101000은 2026-03-31에 5000 KRW 감소. 원인: 오류 청산 (예정된 것).
결론: 정상 작업. 문제 없음.
```

### Anomaly Detection (로드맵 v2.0)

```
미래 기능 (2027 H1):
  - ML 기반 이상 패턴 감지
  - 예: 정상 업무 시간 외 data export
  - 예: 특정 사용자의 비정상 접근 패턴
  - 예: GL balance 급격한 변화
  
구현:
  $ sapstack enable-anomaly-detection --model "k-sox-baseline"
  
  # 학습 기간 (30일)
  # 30일 후: 자동 알림 (비정상 감지 시)
```

---

## Retention & Archival

### Retention Schedule

```yaml
# K-SOX 기준 (한국)

retention:
  audit_trail:
    period: "7-years"  # 상법 + 감시 요구사항
    storage: "immutable (WORM or encrypted archive)"
    
  evidence_bundles:
    period: "5-years"  # 기업 회계 기준
    
  session_metadata:
    period: "7-years"
    
  pii_data (unmasked):
    period: "7-days"   # Minimal retention
    
  deletion:
    method: "secure-wipe (NIST SP800-88)"
    verification: "re-read & verify zeros"
    audit_log: "deletion recorded"
```

### Archive Strategy

```bash
# 분기별 아카이브

sapstack archive-audit-trail --quarter 2026-Q1 \
  --destination s3://archive-bucket/sapstack-audit-2026-q1.tar.gz.aes \
  --encryption aes-256-gcm \
  --retention-until 2033-04-01 \
  --immutable-lock true

결과:
  - Q1 audit trail (1월~3월)
  - AES-256으로 암호화
  - AWS S3 Object Lock (2033년까지)
  - 로컬 .sapstack/audit-trail.jsonl에서 삭제 (스토리지 절약)
  - Archive index: archive-index.yaml (복구 경로)
  
복구:
  $ sapstack restore-audit-trail --quarter 2026-Q1 \
    --from s3://archive-bucket/sapstack-audit-2026-q1.tar.gz.aes \
    --decryption-key [key]
```

---

## Audit Trail와 Compliance 프레임워크의 연결

### K-SOX

```
K-SOX 요구사항:
  "IT General Controls 운영 효과성을 입증하기 위한 증거 필요"

sapstack Audit Trail 기여:
  1. Access Control → audit trail "view_bundle" entries (누가 접근?)
  2. Change Management → "create_transport, deploy_transport" entries
  3. Operations → "query_gl, approve_posting" entries (정상 업무 흐름)
  4. Segregation of Duties → "denied" entries (위반 시도 기록)

외부감사인이 검증:
  "2026년 동안 unauthorized GL posting이 있었나?"
  → audit trail에서 "posting" entries 검색
  → 모든 postings가 authorized users만 수행했나 확인
  → Result: "100% authorized, no violations"
```

### ISO 27001 (A.12.4 Logging)

```
ISO 요구사항:
  "User activities, exceptions, security-relevant events shall be recorded"

sapstack Audit Trail 기여:
  ✓ User activities: "who" + "action" + "timestamp"
  ✓ Exceptions: "result": "denied" 또는 "error" entries
  ✓ Security-relevant: "view_unmasked_bundle", "request_unmasked_access", etc.
  ✓ Retention: 7년 (요구사항: min 1년)
  ✓ Protection: JSONL append-only + hash chain + immutable storage

Auditor verification:
  "Audit logs are complete, protected, and retained?"
  → Show audit-trail.jsonl with hash verification
  → Demonstrate immutable storage (AWS S3 Object Lock, etc.)
  → Result: "COMPLIANT"
```

### SOC 2 (CC7.2 System Monitoring)

```
SOC 2 Criterion:
  "The organization detects, prevents, or mitigates..."

sapstack Audit Trail 기여:
  - CC7.2: "System monitoring detects unauthorized access"
    Evidence: "denied" entries in audit trail
    Example: FIN_OPERATOR attempted to view RESTRICTED bundle → DENIED
  
Auditor sample testing:
  Query: "Show me 10 denied access attempts during the audit period"
  Response: [10 denied entries from audit trail]
  Verification: Confirmed by user role check (operator indeed lacks auditor rights)
```

---

## FAQ

**Q: Audit trail이 너무 크지 않을까?**
A: 1개월 ~5MB (고가용성 시스템 기준). 7년 = 420MB. 현대 스토리지는 저렴하므로 문제 없음.

**Q: 해시 체인의 오버헤드가 있나?**
A: 최소함 (SHA256 = nanoseconds). 읽기 성능에 영향 없음.

**Q: Audit trail을 쿼리하려면?**
A: `sapstack search-audit-trail` 명령 또는 jq 활용:
   ```bash
   jq 'select(.who == "FIN_OP" and .action == "query_gl")' audit-trail.jsonl | wc -l
   ```

**Q: 외부감사인이 원본을 요청하면?**
A: Audit trail은 그대로 제공 (하지만 encrypted). 수정 불가능 (append-only이므로).

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+, K-SOX + ISO 27001 + SOC 2 compliance
