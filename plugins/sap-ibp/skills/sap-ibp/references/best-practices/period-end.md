# IBP 주기 운영 (Tier 2) Best Practice — S&OP Cycle

## 적용 범위
- **S/4 HANA**: ✓
- **Cloud PE**: ✓
- **한국 특화**: ✓ (월마감 연계, 분기 S&OP)

> IBP는 회계 "기간 마감"이 아니라 **S&OP 월간 사이클**이 주기 운영의 핵심.

---

## 체크리스트

### 📅 월간 S&OP 사이클 (5단계)

#### 1. Product Review (제품 검토)
- [ ] 신제품(NPI)/단종(EOL) lifecycle 갱신
  - 빈도: 월 1회 (사이클 1주차)
  - 담당: Product Manager
  - 확인: lifecycle attribute, like-modeling 적용

#### 2. Demand Review (수요 검토)
- [ ] 통계 예측 + consensus 조정
  - 담당: Demand Planner
  - 확인: forecast accuracy 리뷰, promotion lift 분리, override 근거 기록

#### 3. Supply Review (공급 검토)
- [ ] Supply heuristic/optimizer 실행 + 제약 검토
  - 담당: Supply Planner
  - 확인: capacity/material 제약, 대체 source

#### 4. Integrated Reconciliation (통합 조정)
- [ ] 수요-공급-재무 gap 조정 (S&OP)
  - 담당: S&OP Manager
  - 확인: 시나리오 비교, transfer pricing 반영

#### 5. Management Review (경영 검토)
- [ ] 최종 plan 승인 → version publish + PIR 릴리스
  - 담당: 경영진 / S&OP Manager
  - 확인: 승인된 version만 S/4 release

### 📅 분기 운영
- [ ] Planning Area / Forecast Model 파라미터 재튜닝
- [ ] Scenario 정리 (stale scenario 아카이브)
- [ ] IBP 분기 릴리스(2402 등) 영향도 검토

## 한국 현장 체크
- 월마감(D+3 가결산) 후 재무 actuals를 S&OP 통합 조정에 반영
- 분기 S&OP에 환율 시나리오(원자재 수입 의존) 통합
- 추석/설이 포함된 월은 시즌 lift 별도 합의

## 관련 참조
- `operational.md` — 일상 모니터링
- `governance.md` — 계획 승인 거버넌스
