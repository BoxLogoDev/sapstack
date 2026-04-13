# Cloud PE Period-End Best Practice (Tier 2)

## 적용 범위
- ECC: ✗ | S/4 Cloud PE: ✓
- 자동 업그레이드 영향 고려 필수

## Pre-flight 체크리스트 (D-3)
- [ ] **Quarterly Release Notes 확인** — 이번 분기 릴리즈가 마감에 영향을 주는지 검토
- [ ] **Custom Logic 동작 확인** — Key User Extensibility로 만든 BAdI 로직이 신규 릴리즈와 호환되는지
- [ ] **Cloud ALM 모니터링** — Open Issues, Test Automation 결과 점검
- [ ] **Integration 상태** — Cloud Integration 시나리오(iFlow) 정상 작동 확인

## 실행 순서

### D-2 ~ D-1: 마감 준비
- [ ] **Manage Your Solution** — 설정 변경 동결
- [ ] **Output Management** — 출력물 설정 확인 (Adobe Forms)
- [ ] **Custom CDS Views 성능** — 마감 리포트용 뷰 응답시간 체크

### D+1 ~ D+3: 마감 실행
- [ ] **Fiori Launchpad 기반 마감** — "Close Company" 타일 활용
- [ ] **Embedded Analytics** — Real-time 재무제표 자동 생성
- [ ] **Automated Workflow** — Cloud PE 표준 워크플로 기반 승인

### D+4 ~ D+5: 검증
- [ ] **Financial Statement Version** 출력
- [ ] **Intercompany Reconciliation** (Cloud PE 기본 제공)
- [ ] **Group Reporting** 연계 (해당 시)

## Cloud PE 특수 주의사항

### Quarterly Release 타이밍
- 분기 업그레이드는 SAP이 **주말 자동 실행** — 기간마감과 충돌 방지
- 2월/5월/8월/11월 말 업그레이드 주의
- 사전 공지 받으면 기간마감 일정 조정 고려

### Extension 영향도
- Tier 1 Key User: 자동 업그레이드 대응 (SAP 보장)
- Tier 2 Side-by-side (BTP): 수동 테스트 필요
- Tier 3 On-stack ABAP Cloud: Released API만 사용 시 안전

### 데이터 볼륨 관리
- Cloud PE는 HANA 인메모리 기반 — 데이터 볼륨 = 라이선스 비용
- **ILM (Information Lifecycle Management)** 필수 활용
- 아카이빙 정책 분기별 검토

## 참조
- `docs/best-practices/period-end-orchestration.md`
- Cloud ALM 마감 체크리스트
