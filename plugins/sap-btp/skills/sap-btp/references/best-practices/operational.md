# BTP 일상 운영 (Tier 1) Best Practice

## 적용 범위
- **BTP Cloud Foundry**: ✓
- **BTP Kyma**: ✓
- **S/4 Cloud PE 연동**: ✓
- **한국 특화**: ✓ (서울 리전·망분리 게이트웨이)

## 일간 운영

### 서브어카운트 헬스
- [ ] **BTP Cockpit** — 서브어카운트 별 quota 사용율
- [ ] **Entitlement** — 서비스 활성 상태
- [ ] **Cloud Connector** — On-Prem 연동 상태 (GREEN)

### Cloud Connector
- [ ] **Application Tunnel** — 모든 destination 정상
- [ ] **Tunnel HA** — Secondary 정상
- [ ] **로그** — 비정상 종료 알림

### Identity Authentication Service (IAS)
- [ ] 로그인 실패 비율 < 5%
- [ ] SSO/MFA 정상
- [ ] 사용자 동기화 (SCIM)

### Integration Suite (CPI)
- [ ] iFlow 실패율 < 1%
- [ ] Message queue (deferred messages) 감시
- [ ] API 호출 빈도 비정상 추세

## 주간

### 비용·라이선스
- [ ] **Usage Report** — 메트릭별 사용량
- [ ] 라이선스 임계 80% 초과 시 알림
- [ ] 불필요 서비스 정리 (cost optimization)

### 보안
- [ ] **Audit Log** — 비정상 패턴
- [ ] **Vulnerability Scan** — Cloud Foundry buildpack 패치

## 한국 특화

- BTP 서울 리전 (eu10-canary 아닌 ap-northeast-2)
- 망분리: Private endpoint + IP allowlist
- 한국어 IAS 메시지 (자체 customizing)

## 연관 문서
- `period-end.md`, `governance.md`
