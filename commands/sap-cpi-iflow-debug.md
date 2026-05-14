---
name: sap-cpi-iflow-debug
description: CPI iFlow 디버그 — 트리거·매핑·메모리·인증서·재처리 진단
allowed-tools: Read, Grep, Glob
---

# /sap-cpi-iflow-debug — CPI iFlow 종합 디버그

## 사용 시점
- iFlow가 메시지를 처리 안 함
- 매핑 오류로 fail
- 메모리 초과
- 인증서 만료 알림
- 메시지 재처리 필요

## 진단 단계

### Step 1: Sender Adapter
- [ ] Adapter type 정확 (REST·SFTP·OData 등)
- [ ] Polling 스케줄 활성
- [ ] 인증 (OAuth·Basic·Cert) 유효
- [ ] Allowed endpoint URL

### Step 2: 메시지 도착
- Monitor → Messages → 최근 N건
- 다음 분류:
  - Completed (성공)
  - Retry (재시도 중)
  - Failed (영구 실패)
  - Escalated (수동 개입 필요)

### Step 3: 매핑 검증
- Mapping step에서 실패 시:
  - Source schema 비교 — 모든 필드 존재?
  - Target schema 필수 필드 채움?
  - Type conversion (String → Integer, Date)
  - Groovy script syntax 에러?

### Step 4: 메모리·성능
- 단일 메시지 크기 (예: 10MB+ 시 위험)
- Splitter 추가 권장
- Streaming 모드 활성화

### Step 5: 인증서·연결
- BTP Keystore에서 인증서 만료일 확인
- Cloud Connector GREEN
- Receiver endpoint reachable

### Step 6: 재처리
- 실패 메시지 선택 → Retry 또는 Edit Payload 후 Reprocess
- 대량 재처리: Manage Messages → Filter → Bulk action

## 흔한 패턴

| 증상 | 원인 |
|---|---|
| 메시지 안 도착 | Sender adapter / Polling / Auth |
| 매핑 fail | Schema mismatch / Required field |
| Memory exceeded | Large payload / No splitting |
| Cert expired | BTP Keystore 갱신 안 함 |
| Receiver fail | Cloud Connector / Endpoint |

## Output

```
### iFlow 정보
- iFlow: [name]
- Tenant: [region]
- 실패 메시지 ID: [...]

### 진단 결과
- Stage: [Sender/Mapping/Receiver]
- Root Cause: ...
- Sample error: ...

### 해결책
1. ...
2. ...

### Prevention
- 모니터링 알림 설정
- 인증서 갱신 30일 전 알림
```

## 참조
- `plugins/sap-integration-cloud/skills/sap-integration-cloud/SKILL.md`
- `agents/sap-integration-cloud-consultant.md`
