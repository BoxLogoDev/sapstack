# sapstack Automation Hooks

## 개요

sapstack의 운영 워크플로를 자동화하기 위한 훅(Hooks) 시스템입니다.

Claude Code의 [PostToolUse/PreToolUse 훅](https://claude.com/hooks)과 유사하게, sapstack은 **Evidence 수집 → 분석 → 처방 → 실행** 단계에서 자동화된 액션을 실행합니다.

---

## 훅 실행 시점 (Lifecycle)

```
┌─────────────────────────────────────────────────────────────────┐
│ SESSION_START                                                     │
│ - sapstack 세션 초기화                                             │
│ - config.yaml 로드                                                │
│ - 이전 상태 복원                                                   │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ PRE_EVIDENCE_COLLECT                                              │
│ - User input 검증                                                 │
│ - PII (개인정보) 스캔 및 마스킹                                    │
│ - 분류(Classification) 시작                                       │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ EVIDENCE_COLLECTED                                                │
│ - Evidence 수집 완료                                              │
│ - Exception 자동 감지                                             │
│ - 진단 정보 로드 (exceptions/*.md)                                │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ POST_DIAGNOSIS                                                    │
│ - RCA(근본 원인) 분석 완료                                        │
│ - 솔루션 제안                                                      │
│ - 관련 SAP Note 추천                                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ VERDICT_CONFIRMED                                                 │
│ - 사용자 또는 관리자가 처방(Verdict) 승인                          │
│ - Slack/Teams 알림 송신                                          │
│ - Jira 이슈 자동 생성                                             │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ PERIOD_END_GUARD (특수 시점)                                     │
│ - 월말/분기말/년말 폐쇄 전                                        │
│ - OB52, GR/IR, 미처리 IDoc 자동 검증                              │
│ - 사전 예방 보고서 생성                                            │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ TRANSPORT_IMPORT (Customizing 이관)                              │
│ - Transport 이관 전 자동 검증                                      │
│ - 의존성 확인, 백업 트리거                                        │
│ - 영향도 분석                                                      │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│ SESSION_END                                                       │
│ - state.yaml 백업                                                │
│ - Audit log append                                               │
│ - Craft Daily Note 동기화                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 훅 설정 파일 (.sapstack/hooks.json)

```json
{
  "enabled": true,
  "hooks": {
    "PreEvidenceCollect": [
      {
        "matcher": "*",
        "description": "PII 스캔 (모든 입력)",
        "hooks": [
          {
            "type": "command",
            "command": "bash hooks/scripts/pii-scan.sh",
            "environment": {
              "SAPSTACK_MODE": "production"
            }
          }
        ]
      }
    ],
    "EvidenceCollected": [
      {
        "matcher": "exception:.*",
        "description": "Exception 감지 시 카탈로그 로드",
        "hooks": [
          {
            "type": "command",
            "command": "bash hooks/scripts/exception-matcher.sh"
          }
        ]
      }
    ],
    "PostDiagnosis": [
      {
        "matcher": "*.sap_error",
        "description": "SAP 에러 로그 분석",
        "hooks": [
          {
            "type": "command",
            "command": "node hooks/scripts/log-analyzer.js"
          }
        ]
      }
    ],
    "VerdictConfirmed": [
      {
        "matcher": "verdict:*",
        "description": "외부 시스템 알림",
        "hooks": [
          {
            "type": "webhook",
            "url": "https://hooks.slack.com/services/...",
            "method": "POST",
            "headers": {
              "Content-Type": "application/json"
            }
          }
        ]
      }
    ],
    "PeriodEndGuard": [
      {
        "matcher": "period:month_end",
        "description": "월말 폐쇄 전 자동 검증",
        "hooks": [
          {
            "type": "command",
            "command": "bash hooks/scripts/period-end-guard.sh"
          }
        ]
      }
    ],
    "TransportImport": [
      {
        "matcher": "transport:*",
        "description": "Transport 이관 전 검증",
        "hooks": [
          {
            "type": "command",
            "command": "bash hooks/scripts/transport-validator.sh"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "description": "세션 종료 후 상태 저장",
        "hooks": [
          {
            "type": "command",
            "command": "bash hooks/scripts/session-backup.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 훅 파일 구조

```
hooks/
├── README.md                           (이 파일)
├── pre-evidence-collect.md             (PRE_EVIDENCE_COLLECT 상세)
├── post-session-end.md                 (SESSION_END 상세)
├── period-end-guard.md                 (월말/기간마감 자동화)
├── transport-validator.md              (Transport 검증)
├── sample-hooks.json                   (실제 사용 예시)
└── scripts/
    ├── pii-scan.sh                     (PII 마스킹)
    ├── exception-matcher.sh             (Exception 감지)
    ├── log-analyzer.js                 (로그 분석)
    ├── period-end-guard.sh             (기간마감 검증)
    ├── transport-validator.sh          (Transport 검증)
    ├── notify-slack.js                 (Slack 알림)
    └── session-backup.sh               (상태 백업)
```

---

## 훅 Matcher 규칙

### Glob Pattern
```json
{
  "matcher": "*.sap_error",
  "description": "모든 SAP 에러 파일"
}
```

### Exception Pattern
```json
{
  "matcher": "exception:CX_FAGL_*",
  "description": "FI 관련 예외"
}
```

### Time-based
```json
{
  "matcher": "period:month_end",
  "description": "매월 말일 (28~31일)"
}
```

### Wildcard
```json
{
  "matcher": "*",
  "description": "모든 이벤트"
}
```

---

## Matcher 우선순위

1. **Exact match**: `verdict:RCA_COMPLETE` (가장 높음)
2. **Pattern match**: `exception:CX_FAGL_*`
3. **Glob**: `*.sap_error`
4. **Wildcard**: `*` (가장 낮음)

상위 우선순위가 매칭되면 하위는 실행되지 않습니다.

---

## 훅 콘텍스트 변수

각 훅 실행 시 다음 환경변수가 자동으로 설정됩니다:

```bash
# 세션 정보
SAPSTACK_SESSION_ID          # 현재 세션 ID (UUID)
SAPSTACK_USER                # SAP 현재 사용자
SAPSTACK_SYSTEM              # SAP System ID (예: D00, P01)
SAPSTACK_TIMESTAMP           # 훅 실행 시간 (ISO 8601)

# 이벤트 정보
SAPSTACK_EVENT_TYPE          # 훅 유형 (PRE_EVIDENCE_COLLECT 등)
SAPSTACK_EVENT_MATCHER       # 매칭된 패턴
SAPSTACK_EVENT_DATA          # JSON 형식 이벤트 데이터

# Evidence 정보
SAPSTACK_EVIDENCE_FILE       # 수집된 evidence 파일 경로
SAPSTACK_EVIDENCE_TYPE       # Evidence 타입 (screenshot, log, etc.)
SAPSTACK_CLASSIFICATION      # 분류 결과 (json)

# 진단 정보
SAPSTACK_EXCEPTION_MATCHED   # 감지된 exception class name
SAPSTACK_DIAGNOSIS_RESULT    # 진단 결과 (json)
SAPSTACK_RCA                 # RCA 텍스트

# 외부 시스템
SAPSTACK_SLACK_WEBHOOK       # Slack webhook URL (env에서 로드)
SAPSTACK_JIRA_TOKEN          # Jira API token
SAPSTACK_CONFIG_DIR          # ~/.sapstack 경로
```

---

## 훅 에러 처리

### Exit Code
- `0`: 성공
- `1`: 경고 (훅 실행 계속)
- `2`: 오류 (훅 실행 중단, 다음 훅은 실행 안 함)
- `3`: 사용자 개입 필요 (훅 중단, 대화형 확인 필요)

### 에러 로깅
```bash
# 모든 훅 에러는 자동으로 기록됨
~/.sapstack/logs/hooks.log
```

```json
{
  "timestamp": "2026-04-13T14:23:45Z",
  "hook": "pre-evidence-collect",
  "status": "FAILED",
  "exit_code": 2,
  "error_message": "PII scan timeout",
  "stderr": "..."
}
```

---

## 훅 개발 가이드

### Bash Script 예시
```bash
#!/bin/bash
# hooks/scripts/pii-scan.sh

set -e  # Exit on error

hook_name="pii-scan"
log_file="${SAPSTACK_CONFIG_DIR}/logs/hooks.log"

log_hook() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$hook_name] $1" >> "$log_file"
}

log_hook "Starting PII scan on $SAPSTACK_EVIDENCE_FILE"

# PII 마스킹 로직
if grep -Eq '[0-9]{3}-[0-9]{2}-[0-9]{4}|주민번호|사원번호' "$SAPSTACK_EVIDENCE_FILE"; then
    log_hook "PII detected, applying mask"
    
    # 마스킹 수행 (in-place)
    sed -i 's/[0-9]\{3\}-[0-9]\{2\}-[0-9]\{4\}/***-**-****/g' "$SAPSTACK_EVIDENCE_FILE"
    sed -i 's/사원번호: [^ ]*/사원번호: *****/g' "$SAPSTACK_EVIDENCE_FILE"
    
    log_hook "PII masked successfully"
else
    log_hook "No PII detected"
fi

exit 0
```

### Node.js Script 예시
```javascript
// hooks/scripts/notify-slack.js

const https = require('https');

const webhookUrl = process.env.SAPSTACK_SLACK_WEBHOOK;
const eventType = process.env.SAPSTACK_EVENT_TYPE;
const rca = process.env.SAPSTACK_RCA;

const message = {
    text: `sapstack Verdict Confirmed`,
    blocks: [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*RCA*:\n${rca}`
            }
        },
        {
            type: "divider"
        }
    ]
};

const data = JSON.stringify(message);

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

https.request(webhookUrl, options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Slack webhook failed: ${res.statusCode}`);
        process.exit(2);
    }
    process.exit(0);
}).on('error', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(2);
}).end(data);
```

---

## 훅 확인/테스트

### 훅 목록 조회
```bash
sapstack hooks list
```

```
PRE_EVIDENCE_COLLECT:
  ✓ pii-scan.sh (enabled)
  - 모든 입력에서 PII 스캔

VERDICT_CONFIRMED:
  ✓ notify-slack.js (enabled)
  - Slack 채널에 결과 전송
  ✓ create-jira-issue.sh (enabled)
  - Jira에 이슈 자동 생성
```

### 훅 테스트 실행
```bash
sapstack hooks test --hook pre-evidence-collect \
    --input ./test-evidence.txt
```

```
Testing: pre-evidence-collect
Running: bash hooks/scripts/pii-scan.sh
Result: PASS ✓
Time: 234ms
```

---

## Disable/Enable 훅

### 특정 훅 비활성화
```bash
sapstack hooks disable notify-slack
```

### 전체 훅 비활성화 (디버깅용)
```bash
sapstack hooks disable --all
```

---

## 참고 자료

- `.sapstack/hooks.json` — 실제 설정 파일
- `hooks/scripts/` — 훅 스크립트 구현
- `hooks/sample-hooks.json` — 설정 예시

---

**Last Updated**: 2026-04-13  
**Maintenance**: Hooks 추가/수정 시 본 README 함께 업데이트  
**Support**: hooks@sapstack.dev
