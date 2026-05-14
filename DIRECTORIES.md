# sapstack Directory Structure — New Additions

**Created**: 2026-04-13  
**Purpose**: Operations-focused SAP diagnostics catalog (not ABAP development)

---

## Directory 1: `exceptions/` — SAP Exception Class Catalog

Comprehensive catalog of real SAP CX_* exception classes, organized by module.

### Files

| File | Lines | Content |
|------|-------|---------|
| `README.md` | 120 | Overview, classification system, Evidence Loop integration |
| `financial.md` | 150 | FI exceptions (9 real classes) |
| `logistics.md` | 150 | MM/SD exceptions (8 real classes) |
| `abap-runtime.md` | 120 | ABAP runtime exceptions (7 real classes) |

### Real SAP Exceptions Covered

**Financial (FI)**:
- `CX_FAGL_NUMBERRANGE_DEFINITION` — Missing number range for fiscal year
- `CX_FAGL_PERIOD_CLOSED` — Period already closed (OB52)
- `CX_FAGL_ACCOUNT_NOT_FOUND` — GL account doesn't exist
- `CX_FAGL_DUPLICATE_HEADER` — Duplicate document header
- `CX_FAGL_POSTING_LOCK` — GL account posting blocked
- `CX_FI_CUSTOMIZING_ERROR` — Incomplete customizing setup
- `CX_FAGL_COST_CENTER_NOT_FOUND` — Missing cost center
- `CX_FAGL_INTER_COMPANY_POSTING` — Intercompany config error
- (1 additional)

**Logistics (MM/SD)**:
- `CX_MD_MATERIAL_NOT_FOUND` — Material doesn't exist in DB
- `CX_MD_STORAGE_LOCATION_NOT_FOUND` — Storage location undefined
- `CX_MD_GR_BLOCK` — Goods receipt blocked (quality inspection)
- `CX_MD_INVENTORY_VARIANCE` — Physical ≠ System inventory
- `CX_MD_BATCH_EXPIRED` — Batch expired (shelf life)
- `CX_SD_SALES_ORDER_BLOCKED` — SO blocked (credit limit exceeded)
- `CX_SD_DELIVERY_SHORTAGE` — Insufficient inventory
- (1 additional)

**ABAP Runtime (SY/Technical)**:
- `CX_SY_DYN_CALL_ILLEGAL_TYPE` — PERFORM parameter type mismatch
- `CX_SY_NO_HANDLER` — Unhandled exception (TRY-CATCH missing)
- `CX_SY_OPEN_SQL_DB` — Database error (lock, timeout, space)
- `CX_SY_CONVERSION_NO_NUMBER` — Cannot convert to numeric
- `CX_SY_ASSIGN_TYPE_CONFLICT` — Type assignment mismatch
- `CX_SY_RFCSDK_ERROR` — RFC connection failure
- (1 additional)

### Template Format (per exception)

```markdown
### CX_CLASSNAME
**Category**: Module / Area
**SAP Class Hierarchy**: CX_ROOT → ... → CX_CLASSNAME
**Occurs in Version**: ECC 5.0+ / S/4HANA

**Symptoms**: (사용자가 봤을 화면)
**Diagnosis**: (조회 T-code, 테이블)
**Common Causes**: (발생 이유 순)
**Resolution**: (해결 절차 step-by-step)
**Prevention**: (재발 방지)
**Related SAP Note**: (공식 SAP)
**Korean Enterprise Case**: (국내 사례)
```

### sapstack Integration

- **Evidence Loop**: Auto-detect exception class name from user input → lookup in catalog
- **Intelligent Diagnosis**: Present T-codes, tables, common causes to user for self-diagnosis
- **Knowledge Base**: SAP Notes, internal case studies, historical fixes

---

## Directory 2: `hooks/` — sapstack Automation Hooks

Lifecycle-based automation hooks for Evidence collection, diagnosis, and verdict execution.

### Files

| File | Lines | Content |
|------|-------|---------|
| `README.md` | 140 | Lifecycle stages, hook schema, context variables |
| `pre-evidence-collect.md` | 120 | PRE_EVIDENCE_COLLECT hooks (PII scan, classify, auth check) |
| `period-end-guard.md` | 100 | PERIOD_END_GUARD hooks (month-end validation) |
| `transport-validator.md` | 120 | TRANSPORT_IMPORT hooks (dependency, impact, backup) |
| `sample-hooks.json` | 80 | Real JSON config (copy to `.sapstack/hooks.json`) |

### Hook Lifecycle

```
SESSION_START
    ↓
PRE_EVIDENCE_COLLECT (pii-scan, classify, validate-auth, assess-sensitivity)
    ↓
EVIDENCE_COLLECTED (exception-matcher, dump-analyzer)
    ↓
POST_DIAGNOSIS (save-diagnosis)
    ↓
VERDICT_CONFIRMED (notify-slack, create-jira-issue, notify-teams)
    ↓
PERIOD_END_GUARD (ob52-check, gr-ir-check, idoc-check, checklist)
    ↓
TRANSPORT_IMPORT (dependency-check, impact-analysis, backup-trigger, risk-assessment)
    ↓
SESSION_END (session-backup, sync-to-craft)
```

### Hook Scripts Implemented

**Pre-Evidence Collection**:
- `pii-scan.sh` — Auto-mask Korean PII (주민번호, 사원번호, 이메일, 전화, 계좌, 신용카드)
- `classify.sh` — Auto-categorize evidence (FI/MM/SD/PP/HR/SY/IF/SEC)
- `validate-auth.sh` — Detect sensitive T-codes (SE38, PFCG, SU01) for K-SOX audit
- `assess-sensitivity.sh` — Classify sensitivity level (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED)

**Period-End Guard** (기간마감 전):
- `ob52-check.sh` — Verify posting period status (normal + special periods)
- `gr-ir-check.sh` — Reconcile GR/IR clearing differences (via MKGT)
- `idoc-check.sh` — Monitor open IDocs (status 12/14/22/51/53)
- `checklist.sh` — Generate month-end close checklist (Cash/Payables/Inventory/Assets/GL/Compliance)

**Transport Validator** (Customizing 이관 전):
- `dependency-check.sh` — Analyze impact on dependent programs/FMs/roles
- `impact-analysis.sh` — Identify affected modules (FI/MM/SD) and users
- `backup-trigger.sh` — Auto-trigger DB backup (FULL for PROD, INCREMENTAL for QA)
- `risk-assessment.sh` — Score transport risk (0-100) based on object count, testing, structural changes

### Hook Configuration (sample-hooks.json)

```json
{
  "version": "2.0",
  "enabled": true,
  "hooks": {
    "PreEvidenceCollect": [
      { "matcher": "*", "command": "bash hooks/scripts/pii-scan.sh" },
      { "matcher": "*", "command": "bash hooks/scripts/classify.sh" },
      ...
    ],
    "PeriodEndGuard": [
      { "matcher": "period:month_end", "command": "bash hooks/scripts/period-end-guard.sh" }
    ],
    "TransportImport": [
      { "matcher": "transport:*", "command": "bash hooks/scripts/transport-validator.sh" }
    ]
  }
}
```

**To activate**: Copy `sample-hooks.json` → `.sapstack/hooks.json`

### Context Variables (auto-set)

```bash
SAPSTACK_SESSION_ID              # Current session UUID
SAPSTACK_USER                    # SAP user (from WD_USERNAME)
SAPSTACK_SYSTEM                  # SAP system (D00, P01, TST)
SAPSTACK_EVENT_TYPE              # Hook type (PRE_EVIDENCE_COLLECT, etc.)
SAPSTACK_EVIDENCE_FILE           # Path to evidence input
SAPSTACK_EXCEPTION_MATCHED       # Detected exception class name
SAPSTACK_TRANSPORT_REQUEST       # Transport ID (for transport hooks)
SAPSTACK_TARGET_SYSTEM           # Target system for transport
SAPSTACK_SLACK_WEBHOOK           # From env variable
SAPSTACK_JIRA_TOKEN              # From env variable
SAPSTACK_CONFIG_DIR              # ~/.sapstack
```

---

## Usage Examples

### 1. Exception Lookup (Manual)
```bash
# Search catalog for financial exceptions
grep -l "CX_FAGL" ./exceptions/*.md

# Read specific exception
cat exceptions/financial.md | grep -A 20 "CX_FAGL_PERIOD_CLOSED"
```

### 2. Enable All Hooks
```bash
# Copy sample config
cp hooks/sample-hooks.json ~/.sapstack/hooks.json

# Verify
sapstack hooks list

# Run pre-collect hooks on test file
sapstack hooks test --hook pre-evidence-collect --input ./test-screenshot.png
```

### 3. Period-End Guard (Manual trigger)
```bash
# Run all month-end checks
sapstack hooks trigger period-end-guard

# Check report
cat ~/.sapstack/reports/period-end-guard-$(date +%Y%m%d).txt
```

### 4. Transport Validation
```bash
# Validate before transport import
sapstack hooks trigger transport-import \
    --transport DEVK910001 \
    --target-system P01

# Review risk assessment
cat ~/.sapstack/reports/transport-risk-DEVK910001.txt
```

---

## File Structure

```
sapstack/
├── exceptions/
│   ├── README.md                    (목적, 분류체계, Evidence Loop 통합)
│   ├── financial.md                 (9개 FI 예외)
│   ├── logistics.md                 (8개 MM/SD 예외)
│   └── abap-runtime.md              (7개 ABAP 런타임 예외)
│
├── hooks/
│   ├── README.md                    (lifecycle, schema, context variables)
│   ├── pre-evidence-collect.md      (4개 훅: PII, classify, auth, sensitivity)
│   ├── period-end-guard.md          (4개 훅: OB52, GR/IR, IDoc, checklist)
│   ├── transport-validator.md       (4개 훅: dependency, impact, backup, risk)
│   └── sample-hooks.json            (실제 사용 설정)
│
└── (existing .sapstack/, AGENTS.md, CHANGELOG.md, etc.)
```

---

## Integration Points

### With Evidence Loop
1. User submits error screenshot/log
2. `PRE_EVIDENCE_COLLECT` hooks auto-mask PII + classify
3. `EVIDENCE_COLLECTED` hook detects exception class (CX_*)
4. sapstack loads matching entry from `exceptions/*.md`
5. Presents diagnosis (T-codes, common causes, SAP Notes)

### With Period-End Process
1. Monthly calendar trigger (25th) or manual `sapstack hooks trigger period-end-guard`
2. `PERIOD_END_GUARD` hooks run checks:
   - OB52 posting period status
   - GR/IR clearing reconciliation
   - Open IDoc monitoring
   - Month-end checklist
3. Reports saved to `~/.sapstack/reports/`

### With Transport Management (STMS)
1. Transport request created (SE10)
2. User runs `sapstack hooks trigger transport-import --transport DEVK910001 --target P01`
3. `TRANSPORT_IMPORT` hooks analyze:
   - Object dependencies
   - Module impact (FI/MM/SD users affected)
   - Backup completion
   - Risk score
4. Generates go/no-go decision + rollback plan

---

## Maintenance

### Quarterly Updates
- Add new exceptions to `exceptions/*.md` (from SAP Note analysis)
- Update hook scripts with improved error detection
- Refresh Korean enterprise case studies

### Hook Testing
```bash
# Dry-run all hooks
sapstack hooks test --all

# Test specific hook with sample file
sapstack hooks test --hook pii-scan --input sample-evidence.txt
```

---

## Related Documents

- **AGENTS.md** — sapstack diagnostic agent capabilities
- **CHANGELOG.md** — Version history (v1.0+)
- **CLAUDE.md** — Project rules (Korean preferred, K-SOX compliance)
- **`.sapstack/hooks.json`** — Active hook configuration (copy from `sample-hooks.json`)

---

**Last Updated**: 2026-04-13  
**Total Files**: 9 (4 exceptions + 5 hooks)  
**Total Content**: ~1,500 lines of documentation + real SAP class names + practical bash/Node.js scripts  
**Maintenance**: Quarterly (SAP Note sync, Korean case studies)
