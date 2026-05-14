# S/4 마이그레이션 Cutover·Post Go-Live (Tier 2) Best Practice

## Cutover D-Day

### D-3 ~ D-1 (사전)
- [ ] 최종 사용자 차단 일정 공지 (D-7부터)
- [ ] 백업 전부 완료
- [ ] DR 사이트 대기
- [ ] 비상 연락망 활성

### D-Day
- [ ] **Cutover 시작** — 모든 잡 정지·사용자 차단
- [ ] **DMO/SUM 실행** — 시간별 진행률
- [ ] **Sanity Check** — 핵심 거래 데이터 검증
- [ ] **사용자 부서 통보** — 단계별 진행 보고

### Post-Cutover (D+1 ~ D+3)
- [ ] **시스템 가동** — 사용자 점진 access 허용
- [ ] **첫 거래 검증** — FI/MM/SD 핵심
- [ ] **잡 재가동** — 표준 batch jobs
- [ ] **24시간 모니터링** — 운영팀 상주

## Post Go-Live Stabilization (D+30)

### Week 1
- [ ] ST22 — 매시간 신규 덤프 확인
- [ ] 사용자 피드백 일간 수집
- [ ] 핵심 거래 SLA 모니터링
- [ ] Regression 이슈 우선 fix

### Week 2-4
- [ ] 잡 성능 안정화 (이전 대비 ±20%)
- [ ] 사용자 만족도 조사
- [ ] 새로운 기능 활용 가이드 (Fiori 등)

## 분기 마감 (마이그레이션 후 첫)

### 사전 점검 (D-7)
- [ ] **마이그레이션 영향 영역 재검증**
  - FI: ACDOCA 통합 회계
  - CO: Profitability Analysis 변화
  - MM: New Asset Accounting
- [ ] **결산 시뮬레이션** — 마이그레이션 전 결과와 비교

### D-Day
- [ ] 결산 잡 진행률 모니터링 (이전과 다른 동작 가능)
- [ ] 이전 회계기간과 비교 (anomaly detection)

### Post-Closing (D+5)
- [ ] 회계 임원 검토
- [ ] 외부 회계법인 사전 공유 (감사 대비)

## 연 마감 (마이그레이션 후 첫)

- 추가 신중함 — 첫 연 마감은 risk 큼
- **F.16/FAGLGVTR** — Universal Journal로 이월 검증
- 한국 K-SOX 평가 — 마이그레이션 통제 검증
- 외부 감사인 마이그레이션 적정성 평가

## 연관 문서
- `operational.md`, `governance.md`
