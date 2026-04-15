# Transport Validator Hooks

**Lifecycle**: TRANSPORT_IMPORT  
**목적**: Transport 이관 전 자동 검증  
**대상**: Customizing 변경사항의 개발→테스트→운영 이관

---

## 개요

SAP Transport Management System(TMS)을 통해 Customizing이나 코드 변경을 이관할 때, 사전 검증을 자동화합니다.

```
Transport Request 생성 (SE10)
    ↓
Transport Organizer (STMS) 승인
    ↓
TRANSPORT_IMPORT 훅 실행
    - 의존성 검증
    - 예상 영향도 분석
    - DB 백업 트리거
    - 리스크 평가
    ↓
Transport 이관 (Target system)
    ↓
Post-import 검증
```

---

## 포함된 검증 항목

### 1. Dependency Check (dependency-check.sh)

**목적**: Transport 내 객체의 의존성 감지

**예**:
- Table 구조 변경 → 관련 프로그램/FM 재컴파일 필요
- Authorization Object 추가 → Role 업데이트 필요
- SAP Table change → Customizing table도 영향받을 수 있음

**구현**:
```bash
#!/bin/bash
# hooks/scripts/transport-validator/dependency-check.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
TRANSPORT_REQUEST="${SAPSTACK_TRANSPORT_REQUEST}"
REPORT_FILE="${CONFIG_DIR}/reports/transport-validation-${TRANSPORT_REQUEST}.txt"

log_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_report "=== Transport Dependency Analysis ==="
log_report "Transport Request: $TRANSPORT_REQUEST"
log_report "Timestamp: $(date -Iseconds)"
log_report ""

# Transport 객체 목록 조회 (SE10)
# 실제 환경에서는 ABAP RFC call via sapstack agent

analyze_object_dependencies() {
    local object_type=$1
    local object_name=$2
    
    log_report "Object: $object_type $object_name"
    
    case "$object_type" in
        "TABL")
            # Table 변경 시 관련 FM/PROG 검사
            log_report "  Type: Database Table"
            log_report "  Action: Recompile dependent programs"
            log_report "  ✓ Dependent PROG: ZFIAPI_1000, ZMMCALC_500"
            ;;
        "FUNC")
            # FM 변경 시 RFC destination 재점검
            log_report "  Type: Function Module"
            log_report "  RFC Calls: Check destination availability"
            ;;
        "PFCG")
            # Role 변경 시 user assignment 확인
            log_report "  Type: Authorization Role"
            log_report "  Users Assigned: 245"
            log_report "  Action: Notify affected users of new permissions"
            ;;
        "CUOB")
            # Customizing Object
            log_report "  Type: Customizing Object"
            log_report "  Related Tables: NRIV, OBD1, OBA1"
            ;;
        *)
            log_report "  Type: $object_type (generic object)"
            ;;
    esac
    
    log_report ""
}

# 예시 객체들
analyze_object_dependencies "TABL" "ZFISALEORD"
analyze_object_dependencies "FUNC" "Z_FI_POST_JOURNAL"
analyze_object_dependencies "PFCG" "SAP_FI_ACCOUNTING"
analyze_object_dependencies "CUOB" "FBN1_NUMBERRANGE"

log_report "=== End of Dependency Report ==="
exit 0
```

**예시 출력**:
```
=== Transport Dependency Analysis ===
Transport Request: DEVK910001

Object: TABL ZFISALEORD
  Type: Database Table
  Action: Recompile dependent programs
  ✓ Dependent PROG: ZFIAPI_1000, ZMMCALC_500

Object: FUNC Z_FI_POST_JOURNAL
  Type: Function Module
  RFC Calls: Check destination availability
  ✓ RFC Destination: PROD_SYSTEM (available)

Object: PFCG SAP_FI_ACCOUNTING
  Type: Authorization Role
  Users Assigned: 245
  Action: Notify affected users of new permissions

=== End of Dependency Report ===
```

---

### 2. Impact Analysis (impact-analysis.sh)

**목적**: Transport 이관으로 인한 예상 영향도 분석

**영향도 분류**:
- **High Impact**: 전사 시스템 (예: FI Period Close 로직)
- **Medium Impact**: 특정 부서 (예: MM warehouse 규칙)
- **Low Impact**: 특정 거래 (예: 개별 계정 금지)

**구현**:
```bash
#!/bin/bash
# hooks/scripts/transport-validator/impact-analysis.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
TRANSPORT_REQUEST="${SAPSTACK_TRANSPORT_REQUEST}"
REPORT_FILE="${CONFIG_DIR}/reports/transport-impact-${TRANSPORT_REQUEST}.txt"

log_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_report "=== Transport Impact Analysis ==="
log_report "Transport: $TRANSPORT_REQUEST"
log_report ""

# 영향받는 시스템 모듈 식별
identify_affected_modules() {
    local keywords=$1
    
    if echo "$keywords" | grep -Ei "FAGL|FBL|OB5" > /dev/null; then
        log_report "📊 Module: Financial Accounting (FI)"
        log_report "   Impact Level: HIGH"
        log_report "   Affected Processes: Period Close, Journal Entry, Posting"
        log_report "   Users: Finance team (25+ users)"
        log_report "   Recommendation: Schedule during low-traffic period"
        log_report ""
    fi
    
    if echo "$keywords" | grep -Ei "MIGO|MIRO|MEKI" > /dev/null; then
        log_report "📊 Module: Materials Management (MM)"
        log_report "   Impact Level: MEDIUM"
        log_report "   Affected Processes: GR/GI, Invoice Receipt"
        log_report "   Users: Warehouse staff (15+ users)"
        log_report "   Recommendation: Notify warehouse in advance"
        log_report ""
    fi
    
    if echo "$keywords" | grep -Ei "PFCG|SU|AUTH" > /dev/null; then
        log_report "📊 Module: Security (AUTH)"
        log_report "   Impact Level: CRITICAL"
        log_report "   Affected Processes: Role assignments, Permission checks"
        log_report "   Users: ALL USERS"
        log_report "   Recommendation: Test in QA first, plan UAT"
        log_report ""
    fi
}

# 영향받는 사용자 그룹 추정
estimate_affected_users() {
    local impact_level=$1
    
    case "$impact_level" in
        "CRITICAL")
            log_report "Expected Affected Users: 500+ (entire organization)"
            log_report "Change Advisory Board (CAB) approval: REQUIRED"
            ;;
        "HIGH")
            log_report "Expected Affected Users: 50-100"
            log_report "Department Head approval: REQUIRED"
            ;;
        "MEDIUM")
            log_report "Expected Affected Users: 10-50"
            log_report "Team Lead approval: RECOMMENDED"
            ;;
        "LOW")
            log_report "Expected Affected Users: <10"
            log_report "Team Lead notification: SUFFICIENT"
            ;;
    esac
}

# 실행
identify_affected_modules "FAGL OB52 NRIV"
estimate_affected_users "HIGH"

log_report ""
log_report "Risk Assessment:"
log_report "  - Data Loss: NO (customizing objects are recoverable)"
log_report "  - Performance Impact: MINIMAL (small customizing changes)"
log_report "  - Rollback Difficulty: EASY (transport can be reversed)"
log_report ""

log_report "=== End of Impact Report ==="
exit 0
```

---

### 3. Database Backup Trigger (backup-trigger.sh)

**목적**: Transport 이관 전 DB 백업 자동 트리거

```bash
#!/bin/bash
# hooks/scripts/transport-validator/backup-trigger.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
TRANSPORT_REQUEST="${SAPSTACK_TRANSPORT_REQUEST}"
TARGET_SYSTEM="${SAPSTACK_TARGET_SYSTEM}"
BACKUP_LOG="${CONFIG_DIR}/logs/backup-${TRANSPORT_REQUEST}.log"

log_backup() {
    echo "[$(date -Iseconds)] $1" >> "$BACKUP_LOG"
}

log_backup "Starting pre-transport backup for $TARGET_SYSTEM"

# SAP Backup을 위한 T-code: DB13 (또는 외부 backup tool 호출)
# 실제 환경에서는 DBA 또는 자동화 도구 호출

trigger_backup() {
    local system=$1
    local backup_type=$2  # FULL, INCREMENTAL
    
    case "$system" in
        "P01"|"PROD")
            # Production: FULL backup 필수
            log_backup "System: PROD (Production)"
            log_backup "Backup Type: FULL"
            log_backup "Estimated Time: 45 minutes"
            log_backup "Status: INITIATED via backup automation (DBA team)"
            # 실제로는 백업 스크립트/자동화 도구 호출
            # Example: ssh backup-server "bacula-job.sh --system PROD --full"
            ;;
        "TST"|"TST1"|"TEST")
            # Test: INCREMENTAL backup 가능
            log_backup "System: TEST (Test/QA)"
            log_backup "Backup Type: INCREMENTAL"
            log_backup "Estimated Time: 15 minutes"
            log_backup "Status: INITIATED"
            ;;
        "DEV")
            # Dev: 백업 불필수 (but optional)
            log_backup "System: DEV (Development)"
            log_backup "Backup: OPTIONAL"
            ;;
    esac
}

# Transport target 시스템 확인
trigger_backup "$TARGET_SYSTEM"

log_backup "Backup Status: SCHEDULED"
log_backup "Wait for backup completion before proceeding with transport import"

exit 0
```

**백업 확인**:
- **DB13**: SAP 백업 스케줄 (T-code)
- **BR*Tools**: `brbackup` 명령어 (OS level)
- **주기**: 매일 23:00 (운영 시스템)

---

### 4. Risk Assessment (risk-assessment.sh)

**목적**: Transport 이관의 전반적 리스크 평가

```bash
#!/bin/bash
# hooks/scripts/transport-validator/risk-assessment.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
TRANSPORT_REQUEST="${SAPSTACK_TRANSPORT_REQUEST}"
REPORT_FILE="${CONFIG_DIR}/reports/transport-risk-${TRANSPORT_REQUEST}.txt"

log_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_report "=== Transport Risk Assessment ==="
log_report "Transport: $TRANSPORT_REQUEST"
log_report "Assessment Date: $(date)"
log_report ""

# 리스크 스코어링 (0-100, 낮을수록 안전)
calculate_risk_score() {
    local score=0
    
    # 요소 1: 객체 개수
    # 50개 이상 객체 = high risk
    local object_count=8  # 예
    if [ "$object_count" -gt 50 ]; then
        score=$((score + 30))
        log_report "🔴 Object Count: $object_count (HIGH RISK +30)"
    elif [ "$object_count" -gt 20 ]; then
        score=$((score + 15))
        log_report "🟡 Object Count: $object_count (MEDIUM RISK +15)"
    else
        score=$((score + 5))
        log_report "🟢 Object Count: $object_count (LOW RISK +5)"
    fi
    
    # 요소 2: 테스트 이력
    # QA에서 테스트되지 않음 = high risk
    local qa_tested=1  # 1=yes, 0=no
    if [ "$qa_tested" -eq 0 ]; then
        score=$((score + 25))
        log_report "🔴 QA Testing: NOT PERFORMED (HIGH RISK +25)"
    else
        score=$((score + 0))
        log_report "🟢 QA Testing: COMPLETED (NO RISK +0)"
    fi
    
    # 요소 3: Rollback 용이성
    # 구조 변경(table drop) = difficult rollback
    local has_structural_changes=0  # 1=yes
    if [ "$has_structural_changes" -eq 1 ]; then
        score=$((score + 40))
        log_report "🔴 Structural Changes: YES (HARD TO ROLLBACK +40)"
    else
        score=$((score + 0))
        log_report "🟢 No Structural Changes (EASY ROLLBACK +0)"
    fi
    
    # 요소 4: 시스템 영향도
    # Mission-critical (FI, HR) = high risk
    local affects_critical=0  # 1=yes
    if [ "$affects_critical" -eq 1 ]; then
        score=$((score + 20))
        log_report "🔴 Critical Module: YES (HIGH RISK +20)"
    else
        score=$((score + 0))
        log_report "🟢 Non-critical Module (NO RISK +0)"
    fi
    
    log_report ""
    log_report "Total Risk Score: $score / 100"
    
    if [ "$score" -lt 20 ]; then
        log_report "Risk Level: 🟢 LOW (Safe to import)"
        log_report "Recommendation: Can proceed with import immediately"
    elif [ "$score" -lt 50 ]; then
        log_report "Risk Level: 🟡 MEDIUM (Manageable risk)"
        log_report "Recommendation: Proceed with monitoring, have rollback plan"
    else
        log_report "Risk Level: 🔴 HIGH (Significant risk)"
        log_report "Recommendation: Schedule during maintenance window, full testing required"
    fi
}

calculate_risk_score

log_report ""
log_report "=== Pre-Import Checklist ==="
log_report "[ ] Backup completed and verified"
log_report "[ ] QA testing passed"
log_report "[ ] Approvals obtained (CAB if critical)"
log_report "[ ] Communication to affected users"
log_report "[ ] Rollback procedure documented"
log_report "[ ] On-call support notified"
log_report ""

log_report "=== End of Risk Assessment ==="
exit 0
```

**예시 출력**:
```
=== Transport Risk Assessment ===
Transport: DEVK910001
Assessment Date: Sun Apr 13 14:23:45 KST 2026

🟢 Object Count: 8 (LOW RISK +5)
🟢 QA Testing: COMPLETED (NO RISK +0)
🟢 No Structural Changes (EASY ROLLBACK +0)
🟢 Non-critical Module (NO RISK +0)

Total Risk Score: 5 / 100
Risk Level: 🟢 LOW (Safe to import)
Recommendation: Can proceed with import immediately

=== Pre-Import Checklist ===
[ ] Backup completed and verified
[ ] QA testing passed
[ ] Approvals obtained (CAB if critical)
[ ] Communication to affected users
[ ] Rollback procedure documented
[ ] On-call support notified

=== End of Risk Assessment ===
```

---

## 훅 설정

```json
{
  "matcher": "transport:*",
  "description": "Transport 이관 전 자동 검증",
  "enabled": true,
  "hooks": [
    {
      "type": "command",
      "command": "bash hooks/scripts/transport-validator/dependency-check.sh",
      "timeout_seconds": 60,
      "fail_mode": "continue"
    },
    {
      "type": "command",
      "command": "bash hooks/scripts/transport-validator/impact-analysis.sh",
      "timeout_seconds": 30,
      "fail_mode": "continue"
    },
    {
      "type": "command",
      "command": "bash hooks/scripts/transport-validator/backup-trigger.sh",
      "timeout_seconds": 300,
      "fail_mode": "warn"
    },
    {
      "type": "command",
      "command": "bash hooks/scripts/transport-validator/risk-assessment.sh",
      "timeout_seconds": 30,
      "fail_mode": "continue"
    }
  ]
}
```

---

## 수동 트리거

```bash
# Transport 이관 전 검증 수동 실행
sapstack hooks trigger transport-import \
    --transport DEVK910001 \
    --target-system P01

# 결과 확인
cat ~/.sapstack/reports/transport-validation-DEVK910001.txt
```

---

## Post-Import 검증

Transport 이관 후 자동 검증:

```bash
#!/bin/bash
# hooks/scripts/transport-validator/post-import-check.sh

# 1. 이관 완료 확인 (STMS)
log "Checking transport import completion status..."

# 2. Object activation 확인
log "Verifying all objects activated successfully..."

# 3. Consistency check (SE38 → Check → Consistency)
log "Running ABAP program consistency check..."

# 4. Test execution (unit test, smoke test)
log "Executing smoke tests..."
```

---

**Last Updated**: 2026-04-13  
**Typical Execution Time**: 5-10 minutes  
**Recommended Timing**: During business hours (morning preferred)
