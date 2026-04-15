# Hook: post-session-end

> Evidence Loop 세션 종료 후 자동 실행

## 트리거 조건

- 세션 상태가 `done` 또는 `archived`로 전환될 때
- `verdict`이 확정되어 audit_trail에 기록될 때

## 표준 동작

1. **state.yaml 백업** — `.sapstack/sessions/{id}/state.yaml.archive`
2. **audit log append** — 중앙 감사 로그에 verdict 요약 추가
3. **외부 알림** (선택) — Slack, Teams, Jira, Craft Daily Note
4. **메트릭 집계** (opt-in) — 가설 정확도, 모듈별 분포

## 사용 사례

### 사례 1: Slack 알림
```bash
# .sapstack/hooks/scripts/notify-slack.sh
SESSION_ID="$1"
VERDICT_FILE=".sapstack/sessions/${SESSION_ID}/verdict.yaml"
SUMMARY=$(yq '.resolutions[0].confirmed_root_cause' "$VERDICT_FILE")

curl -X POST "${SLACK_WEBHOOK_URL}" \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"sapstack 세션 ${SESSION_ID} 종료\\n*원인*: ${SUMMARY}\"}"
```

### 사례 2: Craft Daily Note 기록
```javascript
// .sapstack/hooks/scripts/craft-record.js
const sessionId = process.argv[2];
const verdict = require(`./sessions/${sessionId}/verdict.yaml`);
await mcp.markdownAdd({
  daily_note: 'today',
  content: `### sapstack 세션 ${sessionId}\n- ${verdict.resolutions[0].confirmed_root_cause}`
});
```

### 사례 3: Jira Ticket 자동 종결
```bash
# 세션 시작 시 Jira ticket ID를 state.yaml에 저장한 경우
TICKET_ID=$(yq '.metadata.jira_ticket' state.yaml)
gh api POST /jira/$TICKET_ID/comments -f body="sapstack 진단 완료"
```

## 등록 예시 (.sapstack/hooks.json)
```json
{
  "hooks": {
    "PostSessionEnd": [
      {
        "matcher": "verdict-confirmed",
        "hooks": [
          { "type": "command", "command": "bash hooks/scripts/notify-slack.sh ${SESSION_ID}" },
          { "type": "command", "command": "node hooks/scripts/craft-record.js ${SESSION_ID}" }
        ]
      }
    ]
  }
}
```

## 보안 고려사항

- 외부 시스템(Slack, Jira) 호출 시 PII 자동 마스킹
- 망분리 환경: 외부 호출 차단 → 로컬 audit log만
- 인증 정보는 환경 변수 또는 OS keychain (절대 hooks.json에 평문 금지)

## 한국 환경
- 망분리 시: Slack/Teams 외부 호출 불가 → 사내 메신저(NAVER WORKS) 또는 그룹웨어 연동
- K-SOX: audit log 외부 SIEM 동기화 필수
