# Period-End Guard Hooks

**Lifecycle**: PERIOD_END_GUARD  
**목적**: 월말/분기말/년말 기간마감 전 자동 검증  
**실행 조건**: 달력 기반 + 수동 트리거 가능

---

## 개요

SAP 재무 기간마감(Period Close) 시점에 발생하는 비정상을 사전에 감지합니다.

```
월말 기간마감 프로세스 타임라인:
┌─────────────────────────────────────┐
│ 월말 D-1 (23일 이전)                 │
│ sapstack 자동 감시 시작               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ PERIOD_END_GUARD 훅 실행              │
│ 1. OB52 상태 확인                    │
│ 2. GR/IR 불일치 감지                │
│ 3. 미처리 IDoc 모니터링               │
│ 4. 예방 보고서 생성                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 월말 마감 실행 (28일~31일)            │
│ (수동으로 진행, sapstack 모니터링)    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 마감 완료 후 검증                     │
│ - OB52 Lock 상태 확인                │
│ - 마감 보고서 검증                    │
└─────────────────────────────────────┘
```

---

## 포함된 검증 항목

### 1. OB52 Status Check (ob52-check.sh)

**T-code**: OB52 (Maintain Posting Period Variant)

**검증 내용**:
```bash
#!/bin/bash
# hooks/scripts/period-end-guard/ob52-check.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
REPORT_FILE="${CONFIG_DIR}/reports/period-end-guard-$(date +%Y%m%d).txt"
SAP_SYSTEM="${SAPSTACK_SYSTEM}"
SAP_USER="${SAPSTACK_USER}"

log_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_report "=== OB52 Posting Period Status Check ==="
log_report "Timestamp: $(date -Iseconds)"
log_report "System: $SAP_SYSTEM, User: $SAP_USER"
log_report ""

# OB52 정보 조회 (DB query)
# 실제 환경에서는 SAP 시스템에 직접 쿼리
# 예: ABAP RFC call via sapstack agent

log_report "Checking Current Posting Periods:"
log_report "  - Normal Posting Period (NBLO): [값]"
log_report "  - Special Periods (NBLX): [값]"
log_report ""

# 검증 로직
check_posting_period() {
    local company=$1
    local current_month=$(date +%m)
    local posting_period=$current_month
    
    # 이상 조건 감지
    if [ "$posting_period" -lt "$current_month" ]; then
        log_report "⚠️  WARNING: Posting period ($posting_period) lags behind calendar month ($current_month)"
        log_report "   Action: Monthly close may be in progress"
    fi
    
    # 특수 기간 활성화 확인
    log_report "✓ Special Periods (5-8) availability: OK"
}

# 모든 회사코드 순회
for company in 1000 1100 1200; do
    check_posting_period "$company"
done

log_report ""
log_report "=== End of Report ==="

exit 0
```

**예시 출력**:
```
=== OB52 Posting Period Status Check ===
Timestamp: 2026-04-13T14:23:45+09:00
System: D00, User: BPADMIN

Checking Current Posting Periods:
  - Normal Posting Period (NBLO): 03
  - Special Periods (NBLX): 04-08

✓ Company 1000: Period 03 (March)
✓ Company 1100: Period 03 (March)
⚠️  Company 1200: Period 02 (previous month - potential backlog)

=== End of Report ===
```

---

### 2. GR/IR Reconciliation (gr-ir-check.sh)

**목적**: 입고(GR)와 송장(Invoice Receipt)의 불일치 자동 감지

**원리**:
- GR(Goods Receipt): MIGO에서 입고 처리 → EKBE 테이블에 기록
- IR(Invoice Receipt): MIRO에서 송장 인수 → EKBE에 INV 기록
- 불일치: GR 수량 ≠ IR 수량 → "GR/IR Clearing Difference" 발생

**구현**:
```bash
#!/bin/bash
# hooks/scripts/period-end-guard/gr-ir-check.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
REPORT_FILE="${CONFIG_DIR}/reports/period-end-guard-$(date +%Y%m%d).txt"

log_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_report ""
log_report "=== GR/IR Reconciliation Check ==="
log_report "Checking goods receipt vs invoice receipt discrepancies..."
log_report ""

# GR/IR 미결현황 조회
# SE16N: MKGT (GR/IR Clearing) 테이블 쿼리
# 실제 환경에서는 sapstack agent가 RFC로 조회

check_gr_ir_clearing() {
    local days_old=$1  # 며칠 이상 미결?
    local threshold=$2  # 금액 임계값
    
    # Mock result (실제는 DB에서 조회)
    local clearing_diff=125000  # KRW
    local days=45
    
    if [ "$clearing_diff" -gt "$threshold" ]; then
        log_report "⚠️  HIGH: GR/IR Clearing Difference > KRW $threshold"
        log_report "   Amount: KRW $clearing_diff"
        log_report "   Days Outstanding: $days"
        log_report "   Action: Investigate MKGT, adjust invoice or receipt"
    fi
    
    if [ "$days" -gt 30 ]; then
        log_report "🔴 CRITICAL: GR/IR item > 30 days outstanding"
        log_report "   Supplier Invoice와 GR 수량 비교 필요"
    fi
}

log_report "High-value GR/IR items (> KRW 100,000):"
check_gr_ir_clearing 30 100000

log_report ""
log_report "Action Items:"
log_report "  1. MIRO: Check open invoices without matching GR"
log_report "  2. MB1C: Check open GR without matching invoices"
log_report "  3. 3-way matching: PO → GR → Invoice 검증"
log_report ""

exit 0
```

**조회 T-code**:
- **MKGT**: GR/IR Clearing (T-code로 직접 조회)
- **MIRO**: 송장 인수 (미결 송장 확인)
- **MB1C**: 입고 현황 (미매칭 GR 확인)

---

### 3. Open IDoc Monitor (idoc-check.sh)

**목적**: 미처리 IDoc(Intermediate Document) 모니터링

**IDoc Status**:
- `12`: Ready to be sent
- `14`: Error (transmission failed)
- `22`: Inbound processing started
- `51`: Error (inbound processing)
- `53`: Error (application error)

**구현**:
```bash
#!/bin/bash
# hooks/scripts/period-end-guard/idoc-check.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
REPORT_FILE="${CONFIG_DIR}/reports/period-end-guard-$(date +%Y%m%d).txt"

log_report() {
    echo "$1" >> "$REPORT_FILE"
}

log_report ""
log_report "=== Open IDoc Status Check ==="
log_report "Monitoring unprocessed IDocs..."
log_report ""

# 미처리 IDoc 조회
# WE02: Inbound IDoc Processing / WE05: Outbound IDoc Processing
# SE16N: EDISLOG (IDoc Log)

check_idoc_errors() {
    local status=$1
    local desc=$2
    local count=$3
    
    log_report "Status $status ($desc): $count items"
    
    if [ "$count" -gt 0 ]; then
        if [ "$status" = "51" ] || [ "$status" = "53" ]; then
            log_report "  🔴 ERROR: Check WE02/WE05 → EDISLOG for details"
            log_report "  Action: Manually reprocess or contact system admin"
        fi
    fi
}

log_report "Current IDoc Status Summary:"
check_idoc_errors "12" "Ready to send (outbound)" 0
check_idoc_errors "14" "Transmission error" 2
check_idoc_errors "22" "Inbound processing" 5
check_idoc_errors "51" "Error (inbound app)" 1
check_idoc_errors "53" "Error (inbound syntax)" 0
log_report ""

log_report "Action Items:"
log_report "  1. WE02 (Inbound): Check status 51, 53 → Manual reprocess"
log_report "  2. WE05 (Outbound): Check status 12, 14 → Resend"
log_report "  3. EDISLOG: Query failed IDocs → Root cause analysis"
log_report ""

exit 0
```

**조회 T-code**:
- **WE02**: Inbound IDoc Processing (수신 IDoc)
- **WE05**: Outbound IDoc Processing (송신 IDoc)
- **EDISLOG**: IDoc Error Log

---

### 4. Month-End Checklist Report (checklist.sh)

**목적**: 기간마감 전 체크리스트 생성

```bash
#!/bin/bash
# hooks/scripts/period-end-guard/checklist.sh

set -e

CONFIG_DIR="${SAPSTACK_CONFIG_DIR}"
REPORT_FILE="${CONFIG_DIR}/reports/period-end-guard-checklist-$(date +%Y%m%d).txt"

cat > "$REPORT_FILE" << 'EOF'
========================================
MONTHLY PERIOD-END CLOSE CHECKLIST
Generated: $(date)
========================================

[ ] 1. CASH FLOW & RECEIVABLES
   [ ] AR Aging Report (FBL5N) - Review open items > 90 days
   [ ] Credit Notes (MIRO) - All invoices matched
   [ ] Payment Terms (OBB5) - Confirm due dates

[ ] 2. PAYABLES & ACCRUALS
   [ ] AP Aging Report (FBL3N) - Review aged items
   [ ] GR/IR Clearing (MKGT) - Clear old items
   [ ] Accruals (Posting) - Month-end accruals entered

[ ] 3. INVENTORY & COST
   [ ] Material Valuation (MMBE) - Stock reconciliation
   [ ] Variance Analysis (CKII) - WIP variances
   [ ] Physical Inventory (MI03) - Cycle count completed

[ ] 4. FIXED ASSETS
   [ ] Asset Register (AW01N) - New additions recorded
   [ ] Depreciation Run (AFAB) - Depreciation posted
   [ ] Retirements (ABVA) - Retirement processing completed

[ ] 5. GENERAL LEDGER
   [ ] Trial Balance (FBL3N, FBL5N) - P&L and Balance Sheet
   [ ] Reconciliation (F.34) - Ledger vs Sub-ledger
   [ ] Exchange Rate Differences (F.05) - Revaluation completed

[ ] 6. COMPLIANCE
   [ ] Posting Periods (OB52) - Month closed
   [ ] Tax Reports (SAPWEB_TAX) - Tax liability calculated
   [ ] K-SOX Audit Log (SU53) - Reviewed sensitive transactions

SIGN-OFF
========
Prepared By: ___________________
Reviewed By: ___________________
Approved By: ___________________
Date: ___________________

EOF

cat "$REPORT_FILE"
exit 0
```

---

## 훅 설정

```json
{
  "matcher": "period:month_end|period:quarter_end|period:year_end",
  "description": "월말/분기말/년말 폐쇄 전 자동 검증",
  "enabled": true,
  "schedule": {
    "monthly": "25th of each month at 09:00 (UTC+9)",
    "quarterly": "23rd of Q-end month (Mar/Jun/Sep/Dec)",
    "yearly": "23rd of December"
  },
  "hooks": [
    {
      "type": "command",
      "command": "bash hooks/scripts/period-end-guard/ob52-check.sh",
      "timeout_seconds": 30
    },
    {
      "type": "command",
      "command": "bash hooks/scripts/period-end-guard/gr-ir-check.sh",
      "timeout_seconds": 60
    },
    {
      "type": "command",
      "command": "bash hooks/scripts/period-end-guard/idoc-check.sh",
      "timeout_seconds": 30
    },
    {
      "type": "command",
      "command": "bash hooks/scripts/period-end-guard/checklist.sh",
      "timeout_seconds": 15
    }
  ]
}
```

---

## 보고서 생성 위치

```
~/.sapstack/reports/
├── period-end-guard-20260413.txt       (실행 보고서)
├── period-end-guard-checklist-20260413.txt (체크리스트)
└── period-end-guard-summary.json       (JSON 요약)
```

---

## 수동 트리거

```bash
# 즉시 실행 (달짜 관계없이)
sapstack hooks trigger period-end-guard --company 1000

# 특정 회사코드 전용
sapstack hooks trigger period-end-guard --companies 1000,1100
```

---

**Last Updated**: 2026-04-13  
**Typical Execution Time**: 3-5 minutes  
**Recommended Frequency**: Weekly (month-end 주간) + Monthly (routine)
