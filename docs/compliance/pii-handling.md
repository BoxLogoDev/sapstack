# PII Handling Guide (개인정보 처리 가이드)

## Overview

**PII** (Personally Identifiable Information) = 개인을 식별할 수 있는 정보.

**sapstack PII**: Evidence Bundles에 포함될 수 있는 개인정보 범주:
- 직원 정보 (입사번호, 성명, 부서, 직급)
- 연락처 (휴대전화, 이메일, 사내 주소)
- 금융 정보 (계좌 소유자, 계좌번호 마지막 4자리)
- 거래처 정보 (대표자명, 연락처)

**sapstack 원칙**: "Privacy by Default"
- 자동 마스킹 활성화 (기본값)
- 운영자는 마스킹된 데이터만 봄
- 감사인이 필요시 unmasked 접근 승인 후 MFA로 검증

---

## PII 분류 (Data Classification)

### Tier 1: 개인식별 정보 (RESTRICTED)

```
한국 주민번호 (Jumin Number)
  Format: XXXXXX-XXXXXXX (예: 123456-1234567)
  Risk: 높음 (신원도용, 금융 사기)
  Scrub: ######-####### (완전 마스킹)
  
한국 사업자등록번호 (Business Registration Number)
  Format: XXX-XX-XXXXX (예: 123-45-67890)
  Risk: 높음 (기업 사칭, 세무 사기)
  Scrub: ###-##-##### (완전 마스킹)
  
신용카드 번호 (Credit Card)
  Format: XXXX-XXXX-XXXX-XXXX 또는 XXXXXXXXXXXXXXXX
  Risk: 높음 (결제 사기)
  Scrub: ****-****-****-1234 (마지막 4자리만 표시)
  
계좌번호 (Bank Account)
  Format: XXX-XX-XXXXXX 또는 자유형식
  Risk: 높음 (부정 송금)
  Scrub: ****-**-****** (마지막 2-3자리만 표시)
```

### Tier 2: 연락처 (CONFIDENTIAL)

```
휴대전화 (Mobile Phone)
  Format: 010-XXXX-XXXX 또는 +82-10-XXXX-XXXX
  Risk: 중간 (스팸, 사회공학 공격)
  Scrub: 010-****-**** (앞 3자리만 표시)
  
일반전화 (Fixed Phone)
  Format: 02-XXXX-XXXX (서울) 또는 기타 지역번호
  Risk: 중간
  Scrub: 02-****-**** (앞 2자리만 표시)
  
이메일 (Email)
  Format: firstname.lastname@company.com
  Risk: 중간 (사회공학, 스팸)
  Scrub: f****@company.com (첫 글자만 표시)
  
집주소 (Residential Address)
  Format: 자유형식
  Risk: 중간 (개인 보안, 사회공학)
  Scrub: [Location masked] (완전 제거)
```

### Tier 3: 업무 정보 (INTERNAL)

```
입사번호 (Employee ID)
  Format: E123456 또는 자유형식
  Risk: 낮음 (내부 조직도 인식 가능)
  Scrub: E****** (앞 1자리만 표시)
  
직급 & 부서 (Position & Department)
  Format: 자유형식
  Risk: 낮음 (조직 구조는 공개정보)
  Scrub: [Position masked] (역할만 유지, 이름 제거)
  
성명 (Name)
  Format: 자유형식
  Risk: 중간 (성명 + 부서 = 신원 파악)
  Scrub: [First char]****(J****) (성만 표시)
```

---

## Regex Patterns & Masking Algorithm

### Pattern Library (한국 PII)

```typescript
// mcp/pii-scrubber.ts 기본 패턴

export const KOREAN_PII_PATTERNS = [
  {
    name: "주민번호",
    pattern: /\d{6}-[1-4]\d{6}/g,
    classification: "RESTRICTED",
    mask: (match) => "######-#######",
    example: "123456-1234567 → ######-#######"
  },
  {
    name: "사업자번호",
    pattern: /(\d{3})-(\d{2})-(\d{5})/g,
    classification: "RESTRICTED",
    mask: (match) => "###-##-#####",
    example: "123-45-67890 → ###-##-#####"
  },
  {
    name: "신용카드",
    pattern: /(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})/g,
    classification: "RESTRICTED",
    mask: (match, g1, g2, g3, g4) => `****-****-****-${g4}`,
    example: "1234-5678-9012-3456 → ****-****-****-3456"
  },
  {
    name: "계좌번호",
    pattern: /(\d{3})-(\d{2})-(\d{6})/g,
    classification: "RESTRICTED",
    mask: (match) => "***-**-****",
    example: "123-45-678901 → ***-**-****"
  },
  {
    name: "휴대전화",
    pattern: /(?:\+82-?|0)1[0-9]-?\d{3,4}-?\d{4}/g,
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const prefix = match.split("-")[0] || "010";
      return `${prefix}-****-****`;
    },
    example: "010-1234-5678 → 010-****-****"
  },
  {
    name: "일반전화",
    pattern: /0\d{1,2}-\d{3,4}-\d{4}/g,
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const [area, , rest] = match.split("-");
      return `${area}-****-****`;
    },
    example: "02-123-4567 → 02-****-****"
  },
  {
    name: "이메일",
    pattern: /([\w.-]+)@([\w.-]+\.\w+)/g,
    classification: "CONFIDENTIAL",
    mask: (match, local, domain) => {
      const first = local[0];
      return `${first}****@${domain}`;
    },
    example: "john.doe@company.com → j****@company.com"
  },
  {
    name: "성명 (한글)",
    pattern: /(?:[가-힣]{2,4})\b/g,  // 2-4자 한글 성명
    classification: "CONFIDENTIAL",
    mask: (match) => {
      const first = match[0];
      return first + "*".repeat(match.length - 1);
    },
    example: "김철수 → 김***"
  },
  {
    name: "입사번호",
    pattern: /E\d{5,8}/g,
    classification: "INTERNAL",
    mask: (match) => match[0] + "*".repeat(match.length - 1),
    example: "E123456 → E****"
  }
];
```

### Masking Algorithm (Replacement Logic)

```typescript
// mcp/pii-scrubber.ts - 마스킹 실행

export interface ScrubResult {
  scrubbed_text: string;
  findings: Finding[];
  hit_count: number;
  patterns_matched: string[];
}

export interface Finding {
  pattern_name: string;
  classification: string;
  count: number;
  locations: number[];  // Character offsets
  examples: string[];   // Before/after examples (sanitized)
}

export function scrub(
  text: string,
  opts?: ScrubberOptions
): ScrubResult {
  let scrubbed = text;
  const findings: Finding[] = [];
  
  for (const pattern of KOREAN_PII_PATTERNS) {
    const matches = [...text.matchAll(pattern.pattern)];
    
    if (matches.length > 0) {
      findings.push({
        pattern_name: pattern.name,
        classification: pattern.classification,
        count: matches.length,
        locations: matches.map(m => m.index),
        examples: matches
          .slice(0, 3)  // 처음 3개만 (본인 프라이버시)
          .map(m => ({ before: m[0], after: pattern.mask(m[0], ...m.slice(1)) }))
      });
      
      // 실제 마스킹 수행
      scrubbed = scrubbed.replace(
        pattern.pattern,
        (match) => pattern.mask(match)
      );
    }
  }
  
  return {
    scrubbed_text: scrubbed,
    findings,
    hit_count: findings.reduce((sum, f) => sum + f.count, 0),
    patterns_matched: findings.map(f => f.pattern_name)
  };
}
```

---

## Evidence Bundle에서의 PII 처리

### Pre-Scrub: 데이터 수집 전

```bash
# Evidence Loop 시작할 때 자동 확인
sapstack evidence-loop \
  --description "GL reconciliation" \
  --pii-risk-check true

출력:
  PII Risk Assessment:
    ✓ GL queries will not return employee names: NO
    ✓ GL queries will not return email addresses: YES (risk: low)
    ✓ Vendor master queries may return supplier contact: YES (risk: medium)
  
  Recommendation: Proceed with PII scrubbing enabled (default)
```

### During Collection: 수집 중 마스킹

```json
// 마스킹 전 (수집된 원본 데이터 — 로컬 메모리만)
{
  "gl_items": [
    {
      "posting_date": "2026-04-01",
      "user": "john.doe@company.com",
      "amount": 5000,
      "reference": "INV-2026-0001",
      "vendor": "Korean Supplier Inc.",
      "vendor_contact": "010-1234-5678"
    }
  ]
}

// 마스킹 후 (저장/내보내기 시)
{
  "gl_items": [
    {
      "posting_date": "2026-04-01",
      "user": "j****@company.com",      ← MASKED
      "amount": 5000,
      "reference": "INV-2026-0001",
      "vendor": "Korean Supplier Inc.",
      "vendor_contact": "010-****-****"  ← MASKED
    }
  ],
  "pii_scrubbing": {
    "enabled": true,
    "timestamp": "2026-04-01T15:30:00Z",
    "patterns_applied": ["email", "phone"],
    "fields_masked": 2,
    "masking_report": ".sapstack/sessions/{id}/pii-report.json"
  }
}
```

### Post-Export: 내보내기 후 검증

```bash
# Evidence Bundle 내보낸 후 최종 확인
sapstack verify-pii-scrubbing bundle.json

결과:
  Scanning bundle.json for unmasked PII...
  
  Pattern Check (Regex):
    ✓ 주민번호: 0 found (expected 0)
    ✓ 사업자번호: 0 found (expected 0)
    ✓ 신용카드: 0 found (expected 0)
    ✓ 이메일: 2 found, all masked (j****@, f****@) ✓
    ✓ 전화번호: 1 found, masked (010-****-****) ✓
  
  Classification Check:
    ✓ RESTRICTED fields: 0 unmasked (expected 0) ✓
    ✓ CONFIDENTIAL fields: 0 unmasked (expected 0) ✓
    ✓ INTERNAL fields: 2 partially masked ✓
  
  Overall: PASS — Bundle safe to export ✓
  
  Generated: .sapstack/sessions/{id}/scrubbing-verification.json
```

---

## Unmasked Access: 마스킹 해제 절차

### 상황: 감사인이 원본 데이터 필요

```
감사인: "GL 거래처 성명 확인이 필요합니다."
운영자: "PII이므로 unmasked 요청이 필요합니다."

절차:
1. 감사인이 요청 제출 (이유: 감사 검증)
2. DPO (Data Protection Officer) 승인 (또는 Finance Director)
3. 운영자가 unmasked 번들 생성
4. 감사인이 MFA로 인증 후 접근
5. 모든 접근 기록 (audit trail)
```

### Implementation

```yaml
# config.yaml — 언마스킹 정책

pii_handling:
  default_scrubbing: true        # 기본값: 마스킹 ON
  
  unmasked_access:
    enabled: true
    require_approval: true       # 필수: 승인자 approval
    approver_role: "dpo"         # or "finance_director"
    approval_sla: "24-hours"     # 24시간 내 승인
    require_mfa: true
    audit_trail: "detailed"      # 모든 접근 기록
    
  unmasked_retention:
    max_days: 7                  # 최대 7일만 보관
    auto_delete: true            # 자동 삭제
    secure_wipe: true            # NIST SP800-88 기준
```

### 언마스킹 API

```bash
# Step 1: Unmasked 버전 요청
sapstack request-unmasked-bundle \
  --session sess_2026_04_001 \
  --reason "External audit verification" \
  --requester john@audit-firm.com \
  --output /tmp/bundle-unmasked.json

Output:
  Request submitted.
  Request ID: req_abc123
  Approver: finance-director@company.local
  Status: PENDING
  Expires: 2026-04-14 (24 hours)

# Step 2: DPO/Manager가 승인
sapstack approve-unmasked-access \
  --request req_abc123 \
  --approver finance-director \
  --approval-reason "Annual SAP audit, external auditor verified"

Output:
  Approval granted.
  Access valid: 2026-04-13T16:00:00Z - 2026-04-20T16:00:00Z (7 days)
  MFA token: [MFA secret generated]

# Step 3: 감사인이 MFA로 접근
sapstack download-unmasked-bundle \
  --session sess_2026_04_001 \
  --request req_abc123 \
  --mfa-token [MFA code from authenticator app]

Output:
  bundle-unmasked.json downloaded
  PII present: Names, email, phone numbers UNMASKED
  
  Audit Trail Entry:
  {
    "timestamp": "2026-04-13T16:05:00Z",
    "who": "john@audit-firm.com",
    "action": "download_unmasked_bundle",
    "session": "sess_2026_04_001",
    "request_id": "req_abc123",
    "mfa_verified": true,
    "bundle_size": 2.3MB,
    "pii_fields_accessed": ["names", "emails", "phone_numbers"],
    "retention_period": "7 days"
  }
```

---

## Retention & Deletion

### 보관 정책 (Retention Policy)

```yaml
# 한국 법령 기준

retention:
  # K-SOX (기업 회계)
  financial_data: 5-years
  
  # 상법 (Commercial Code)
  business_records: 5-years
  
  # 개인정보보호법 (PIPA)
  pii: 7-days (unless longer needed)
  
  # 정보통신망법 (IMNSA)
  logs: 3-years
  
  # sapstack 정책 (보수적)
  audit_trail: 7-years
  evidence_bundles: 5-years
  
삭제:
  after_retention_expires:
    method: "secure-wipe"  # NIST SP800-88
    verification: "re-read & verify zeros"
    audit_log: "deletion recorded in immutable log"
```

### 삭제 프로세스

```bash
# 보관 기간 만료 후 자동 삭제 (또는 수동)

# 수동 삭제 (특정 세션)
sapstack delete-evidence-bundle \
  --session sess_2025_01_001 \
  --reason "Retention period expired (2026-04-01)" \
  --verify-secure-wipe true

프로세스:
  1. 번들 읽음 (메타데이터 확인)
  2. Deletion request 생성 (감사추적)
  3. Secure wipe 수행 (알고리즘: DoD 5220.22-M 또는 NIST guidelines)
  4. 재읽음으로 0이 확인됨 (다중 pass)
  5. 삭제 완료 기록

출력:
  Deletion scheduled for: 2026-04-13T23:59:59Z
  Bundle: sess_2025_01_001
  PII records affected: 12
  Deletion method: DoD 5220.22-M (3-pass wipe)
  Verification: ✓ Passed
  
  Audit Trail:
  {
    "timestamp": "2026-04-13T16:00:00Z",
    "what": "delete_evidence_bundle",
    "who": "admin@company.local",
    "session": "sess_2025_01_001",
    "reason": "retention_expired",
    "method": "secure-wipe",
    "verified": true
  }
```

---

## 데이터 주체의 권리 (Data Subject Rights)

### 접근권 (Right to Access, GDPR Art. 15)

```bash
# 직원이 자신의 데이터 조회 요청
sapstack request-data-copy \
  --employee john.doe@company.local \
  --period "2026-01-01:2026-04-13" \
  --format pdf

결과:
  Data Copy Report
  ===============
  Period: 2026-01-01 ~ 2026-04-13
  Requested by: john.doe@company.local
  
  1. Evidence Bundles mentioning you:
     - sess_2026_04_001 (GL reconciliation, 2026-04-01)
       Your involvement: GL posting user
     
  2. Audit Trail entries involving you:
     - 2026-04-01 08:00:00 — query_gl (table: bseg)
     - 2026-04-01 14:30:00 — approve_posting (GL 1101000)
  
  3. How data is used:
     - PII masked in Evidence Bundles (마스킹됨)
     - Access recorded in audit trail (감사추적)
     - Retained 5 years for compliance
  
  4. Your rights:
     - Rectification: Request correction of inaccurate data
     - Erasure: Request deletion (RESTRICTED only)
     - Restriction: Request processing pause
  
  Generated: 2026-04-13
  Valid through: [retention period]
```

### 정정권 & 삭제권 (Rectification & Erasure)

```bash
# 직원이 이메일 주소 변경 요청
sapstack request-rectification \
  --employee john.doe@company.local \
  --field email \
  --new-value john.smith@company.local \
  --reason "name change"

처리:
  1. Audit trail 업데이트 (원본값 유지, 수정값 추가)
  2. Future bundles는 새 이메일로 마스킹
  3. 과거 bundles: 원본 유지 (감사목적)

# 직원이 처리 중단 요청
sapstack request-processing-restriction \
  --employee john.doe@company.local \
  --reason "dispute"

처리:
  1. Future bundles: john.doe 정보 수집 중단
  2. Existing bundles: 마스킹 강화 (추가 보호)
  3. Flag: "restricted_processing" (감사추적)
```

---

## 법률 근거

### 한국 법령

| 법령 | 조항 | 요구사항 |
|------|------|---------|
| **개인정보보호법** | 제15조 | 안전한 보관 (암호화, 접근제어) |
| | 제18조 | 정보주체의 권리 (접근, 정정, 삭제) |
| | 제21조 | 기술적 조치 (보안) |
| **정보통신망법** | 제29조 | 사용자 정보 보호 |
| **상법** | 제45조 | 거래기록 보존 (5년) |
| **기업회계기준법** | 제10조 | ICFR 유지 (감사추적) |

### GDPR

| 조항 | 요구사항 |
|------|---------|
| **Article 15** | Right to Access (접근권) |
| **Article 16** | Right to Rectification (정정권) |
| **Article 17** | Right to Erasure (삭제권) |
| **Article 18** | Right to Restrict Processing (처리 제한권) |
| **Article 32** | Technical Measures (기술적 조치 — 본 문서의 별도 섹션) |

---

## FAQ

**Q: PII 마스킹이 진단에 방해가 되지 않는가?**
A: 대부분의 SAP 진단은 금액, 계정 잔액, 날짜 기반이므로 문제 없음. 거래처명이 필요하면 unmasked 요청.

**Q: 마스킹된 데이터로도 개인 식별이 가능한가?**
A: 가능성 있음 (예: 부서 + 직급 + 업무 = 신원 파악). 따라서 "맥락"도 보호 필요. sapstack은 context anonymization 로드맵 v2.0에 포함.

**Q: 실수로 마스킹 안 된 PII를 내보냈다면?**
A: 즉시 보고 → 번들 비활성화 → 재출 (마스킹된 버전). 감사인에게 투명 공시.

**Q: 삭제 후 되돌릴 수 있는가?**
A: 아니오. Secure wipe은 복구 불가능. 따라서 삭제 전 충분한 검토 필수.

---

**Last Updated**: 2026-04-13  
**Version**: 1.0  
**Applicable**: sapstack v1.7.0+, Korean PIPA compliance + GDPR
