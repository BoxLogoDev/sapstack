# IBP 일상 운영 (Tier 1) Best Practice

## 적용 범위
- **ECC**: △ (BW 경유 연동만)
- **S/4 HANA**: ✓ (CPI Integration Content)
- **Cloud PE**: ✓
- **한국 특화**: ✓ (음력 시즌성, 다국가 모델)

---

## 체크리스트

### 📊 일간 (Daily) 운영

#### Application Job 모니터링
- [ ] **IBP Web UI → Application Jobs** — 야간 Forecast/Planning Run 결과
  - 왜: 예측/계획 미생성 조기 발견
  - 빈도: 일간 (오전, 야간 배치 직후)
  - 담당: Demand Planner / IBP 운영자
  - 확인항목:
    - 모든 scheduled job 성공 (failed 0)
    - 예측 output key figure 생성 확인
    - 실패 시 로그 → 마스터 매핑/history 점검

#### CPI 연동 상태
- [ ] **CPI Monitor → Message Processing** (S/4 ↔ IBP)
  - 왜: 마스터/트랜잭션 미동기 → 계획 정확성 훼손
  - 빈도: 일간
  - 담당: 통합 담당
  - 확인항목: error 메시지 0, External Codes mismatch 0

#### Demand Sensing 반영
- [ ] **Planning View (Excel)** — 단기 actuals 반영 확인
  - 왜: 단기 수요 변동 미반영 시 공급 차질
  - 빈도: 일간
  - 담당: Demand Planner

### 📅 주간 (Weekly) 운영

- [ ] Forecast accuracy(MAPE/MASE) 추세 리뷰 — 악화 품목 알고리즘 재점검
- [ ] PIR 릴리스 → S/4 수신 정합 (MD63/MD05 sample)
- [ ] Planning View 성능 — 10K cells 초과 view 분리
- [ ] Supply heuristic 결과 vs capacity 제약 검토

## 한국 현장 체크
- 추석/설 음력 이벤트가 다가오는 시즌 — Time Event Master 사전 등록
- 다국가(한국+베트남/중국) 모델: 통화/이전가 일관성
- 신차/신모델 부품 PIR을 협력사 알림 타이밍에 맞춰 릴리스

## 관련 참조
- `../img/forecast-model-setup.md`
- `../img/s4-cpi-integration.md`
- `period-end.md` — S&OP 주기 운영
