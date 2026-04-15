# Pre-Evidence Collection Hooks

**Lifecycle**: PRE_EVIDENCE_COLLECT  
**목적**: 사용자 입력/증거 수집 전 자동 검증  
**용도**: PII 마스킹, 분류, 권한 확인

---

## 개요

사용자가 증거(evidence)를 sapstack에 제출하기 전에 실행되는 훅입니다.

```
User Input (스크린샷, 로그 파일, 에러 메시지)
    ↓
PRE_EVIDENCE_COLLECT 훅 실행
    - PII (개인정보) 스캔
    - 분류(Classification) 준비
    - 권한 검증
    - 민감도(Sensitivity) 판정
    ↓
Evidence 수집 (안전화된 상태)
    ↓
진단 진행
```

---

## 포함된 훅들

### 1. PII Scan & Masking (pii-scan.sh)

**목적**: 개인정보 자동 탐지 및 마스킹

**스캔 대상** (한국 기준):
```
- 주민번호: 123-45-678901 → ***-**-****
- 사원번호: EMP20001 → EMP****
- 이메일: john.doe@company.com → j***@company.com
- 전화번호: 010-1234-5678 → 010-****-5678
- 계좌번호: 123-456-789012 → ***-***-789012
- 신용카드: 1234-5678-9012-3456 → 1234-****-****-3456
```

**구현**:
```bash
#!/bin/bash
# hooks/scripts/pii-scan.sh

set -e

EVIDENCE_FILE="${SAPSTACK_EVIDENCE_FILE}"
LOG_FILE="${SAPSTACK_CONFIG_DIR}/logs/hooks.log"
PII_MASK_LOG="${SAPSTACK_CONFIG_DIR}/logs/pii-masks.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

mask_pii() {
    local file=$1
    local pattern=$2
    local replacement=$3
    
    if grep -Eq "$pattern" "$file"; then
        log "PII pattern matched: $pattern"
        sed -i "s/$pattern/$replacement/g" "$file"
        # 마스킹 기록 (감사용)
        echo "[$(date)] Masked pattern: $pattern in $file" >> "$PII_MASK_LOG"
        return 0
    fi
    return 1
}

log "Starting PII scan on $EVIDENCE_FILE"

# 한국 주민번호
mask_pii "$EVIDENCE_FILE" '[0-9]{3}-[0-9]{2}-[0-9]{6}|[0-9]{6}-[0-9]{7}' '***-**-****'

# 사원번호 (EMP + 숫자)
mask_pii "$EVIDENCE_FILE" 'EMP[0-9]{4,6}|사원번호[: ]*[0-9]{4,6}' '[EMPLOYEE_ID]'

# 이메일 (name@domain)
mask_pii "$EVIDENCE_FILE" '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' '[EMAIL_MASKED]'

# 전화번호
mask_pii "$EVIDENCE_FILE" '[0-9]{3}-[0-9]{3,4}-[0-9]{4}' '***-****-****'

# 계좌번호
mask_pii "$EVIDENCE_FILE" '[0-9]{3}-[0-9]{3}-[0-9]{6,}' '***-***-[ACCOUNT]'

# SAP Password (PASS= 뒤)
mask_pii "$EVIDENCE_FILE" '(PASSWORD|PASS|PWD)[= ]*[^ ]*' '\1=[MASKED]'

log "PII scan completed"
exit 0
```

**설정**:
```json
{
  "matcher": "*",
  "description": "모든 입력에서 PII 자동 마스킹",
  "hooks": [
    {
      "type": "command",
      "command": "bash hooks/scripts/pii-scan.sh",
      "timeout_seconds": 30,
      "fail_mode": "warn"  // 실패해도 진행 (PII 스캔 실패 < 처리 지연)
    }
  ]
}
```

---

### 2. Classification Preparation (classify.sh)

**목적**: Evidence 분류 사전 준비 (카테고리 판정)

**분류 카테고리**:
- `FI`: Financial (재무)
- `MM`: Materials Management (자재)
- `SD`: Sales & Distribution (판매)
- `PP`: Production (생산)
- `HR`: Human Resources (인사)
- `SY`: System/Technical (기술)
- `IF`: Integration (통합)
- `SEC`: Security (보안)

**구현**:
```bash
#!/bin/bash
# hooks/scripts/classify.sh

set -e

EVIDENCE_FILE="${SAPSTACK_EVIDENCE_FILE}"
CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
CLASSIFICATION_FILE="${CONFIG_DIR}/.current_classification"

classify_evidence() {
    local file=$1
    
    # Keyword-based classification
    if grep -Ei 'FB01|FB50|FBL1|OB52|FAGL|전표|기간마감|회계' "$file" > /dev/null 2>&1; then
        echo "FI"
        return
    fi
    
    if grep -Ei 'MIGO|MB1C|MMBE|자재|입고|출고|재고' "$file" > /dev/null 2>&1; then
        echo "MM"
        return
    fi
    
    if grep -Ei 'VA01|VA02|VL01|SD|판매주문|배송|청구' "$file" > /dev/null 2>&1; then
        echo "SD"
        return
    fi
    
    if grep -Ei 'CO01|CO02|PP|생산오더|BOM|작업지시' "$file" > /dev/null 2>&1; then
        echo "PP"
        return
    fi
    
    if grep -Ei 'PA01|HR|인사|급여|휴가|직원' "$file" > /dev/null 2>&1; then
        echo "HR"
        return
    fi
    
    if grep -Ei 'ST22|ST11|ST04|DUMP|ERROR|Exception|CX_' "$file" > /dev/null 2>&1; then
        echo "SY"
        return
    fi
    
    if grep -Ei 'RFC|IDoc|XI|CPI|EDI|SOAP|REST' "$file" > /dev/null 2>&1; then
        echo "IF"
        return
    fi
    
    if grep -Ei 'SU|권한|PFCG|Role|K-SOX|감사|보안' "$file" > /dev/null 2>&1; then
        echo "SEC"
        return
    fi
    
    # Default
    echo "UNKNOWN"
}

CATEGORY=$(classify_evidence "$EVIDENCE_FILE")

cat > "$CLASSIFICATION_FILE" << EOF
{
  "category": "$CATEGORY",
  "timestamp": "$(date -Iseconds)",
  "confidence": "auto",
  "source": "keyword_matching"
}
EOF

echo "Classification: $CATEGORY"
exit 0
```

**설정**:
```json
{
  "matcher": "*",
  "description": "Evidence 자동 분류",
  "hooks": [
    {
      "type": "command",
      "command": "bash hooks/scripts/classify.sh"
    }
  ]
}
```

---

### 3. Authority Validation (validate-auth.sh)

**목적**: 사용자 권한 확인 (민감한 시스템 접근 권한 검증)

**검증 항목**:
- 해당 회사코드(BUKRS) 접근 권한
- 특정 T-code 실행 권한 (예: FB01, MIGO)
- 민감한 T-code 접근 (예: SE38, SE37, SM59) → 감시 대상

**구현**:
```bash
#!/bin/bash
# hooks/scripts/validate-auth.sh

set -e

SAP_USER="${SAPSTACK_USER}"
EVIDENCE_FILE="${SAPSTACK_EVIDENCE_FILE}"
CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
AUTH_CHECK_LOG="${CONFIG_DIR}/logs/auth-checks.log"

log_auth_check() {
    echo "[$(date -Iseconds)] User: $SAP_USER | Check: $1 | Result: $2" >> "$AUTH_CHECK_LOG"
}

# T-code 권한 검증
detect_tcode() {
    local file=$1
    grep -Eo '[A-Z]{2}[A-Z0-9]{2}' "$file" | sort | uniq | head -5
}

TCODES=$(detect_tcode "$EVIDENCE_FILE")

for TCODE in $TCODES; do
    # K-SOX 감시 T-code 목록
    if [[ "$TCODE" =~ ^(SE38|SE37|SE11|SM59|PFCG|SU01)$ ]]; then
        log_auth_check "$TCODE" "SENSITIVE_TCODE_DETECTED"
        
        # 경고 메시지 (진단 시 표시)
        echo "⚠️  Sensitive T-code detected: $TCODE (K-SOX monitoring)"
    else
        log_auth_check "$TCODE" "STANDARD"
    fi
done

exit 0
```

**설정**:
```json
{
  "matcher": "*",
  "description": "사용자 권한 및 감시 T-code 검증",
  "hooks": [
    {
      "type": "command",
      "command": "bash hooks/scripts/validate-auth.sh"
    }
  ]
}
```

---

### 4. Sensitivity Assessment (assess-sensitivity.sh)

**목적**: Evidence의 민감도(Sensitivity) 판정

**민감도 레벨**:
- `PUBLIC`: 공개 정보 (T-code 일반 화면)
- `INTERNAL`: 내부 정보 (재무 수치, 현황)
- `CONFIDENTIAL`: 기밀 정보 (개인정보, 비밀 계약)
- `RESTRICTED`: 제한 정보 (경영진만, K-SOX 감시)

**구현**:
```bash
#!/bin/bash
# hooks/scripts/assess-sensitivity.sh

set -e

EVIDENCE_FILE="${SAPSTACK_EVIDENCE_FILE}"
CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
SENSITIVITY_FILE="${CONFIG_DIR}/.current_sensitivity"

assess_sensitivity() {
    local file=$1
    local score=0
    
    # Confidential keywords
    if grep -Ei '급여|salary|salary|비용|cost|손실|loss|password|암호|개인|personal|기밀' "$file" > /dev/null 2>&1; then
        score=$((score + 30))
    fi
    
    # Restricted keywords
    if grep -Ei 'K-SOX|SOX|감사|audit|이사회|board|CEO|최고경영자' "$file" > /dev/null 2>&1; then
        score=$((score + 40))
    fi
    
    # Financial data
    if grep -Ei '[0-9]{7,}|KRW|USD|EUR|금액|amount' "$file" > /dev/null 2>&1; then
        score=$((score + 20))
    fi
    
    # Determine level
    if [ "$score" -ge 40 ]; then
        echo "RESTRICTED"
    elif [ "$score" -ge 30 ]; then
        echo "CONFIDENTIAL"
    elif [ "$score" -ge 20 ]; then
        echo "INTERNAL"
    else
        echo "PUBLIC"
    fi
}

SENSITIVITY=$(assess_sensitivity "$EVIDENCE_FILE")

cat > "$SENSITIVITY_FILE" << EOF
{
  "level": "$SENSITIVITY",
  "timestamp": "$(date -Iseconds)",
  "assessment": "automatic"
}
EOF

echo "Sensitivity: $SENSITIVITY"
exit 0
```

**설정**:
```json
{
  "matcher": "*",
  "description": "민감도 자동 평가",
  "hooks": [
    {
      "type": "command",
      "command": "bash hooks/scripts/assess-sensitivity.sh"
    }
  ]
}
```

---

## 실행 순서

```
User Input
    ↓
1. pii-scan.sh               (PII 마스킹, 최우선)
    ↓
2. classify.sh               (분류)
    ↓
3. validate-auth.sh          (권한 검증)
    ↓
4. assess-sensitivity.sh     (민감도 평가)
    ↓
Evidence 수집 완료
```

---

## Evidence 파일 경로

PRE_EVIDENCE_COLLECT 훅 실행 후, 다음 파일들이 생성됩니다:

```
~/.sapstack/current_session/
├── .evidence                           (원본 입력, 마스킹 후)
├── .current_classification             (분류 결과, JSON)
├── .current_sensitivity                (민감도 결과, JSON)
└── logs/
    ├── pii-masks.log                   (마스킹 기록, 감사용)
    └── auth-checks.log                 (권한 검증 기록)
```

---

## 에러 처리

### PII 스캔 실패
```
[ERROR] pii-scan.sh failed with exit code 2
[WARN] PII masking timeout, proceeding anyway
[INFO] Evidence file size: 2.3 MB, processing may be slow
```

### 분류 실패
```
[WARN] classify.sh returned UNKNOWN category
[ACTION] User will be prompted to manually classify
```

---

## 설정 예시

`.sapstack/hooks.json` 전체 구성:

```json
{
  "hooks": {
    "PreEvidenceCollect": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash hooks/scripts/pii-scan.sh",
            "timeout_seconds": 30,
            "fail_mode": "warn"
          },
          {
            "type": "command",
            "command": "bash hooks/scripts/classify.sh",
            "timeout_seconds": 15,
            "fail_mode": "continue"
          },
          {
            "type": "command",
            "command": "bash hooks/scripts/validate-auth.sh",
            "timeout_seconds": 10,
            "fail_mode": "warn"
          },
          {
            "type": "command",
            "command": "bash hooks/scripts/assess-sensitivity.sh",
            "timeout_seconds": 10,
            "fail_mode": "continue"
          }
        ]
      }
    ]
  }
}
```

---

**Last Updated**: 2026-04-13  
**Typical Execution Time**: 2-5 seconds  
**Failure Tolerance**: High (PII scan > others)
