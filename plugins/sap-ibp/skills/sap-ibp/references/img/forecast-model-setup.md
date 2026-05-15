# IBP Forecast Model & Demand Sensing 구성 가이드

## SPRO 경로

클라우드 SaaS — 전통 SPRO IMG 미해당. IBP Web UI 경로 사용:

```
IBP Web UI → Configuration → Forecast Models
    → (Algorithms / Pre-/Post-processing / Demand Sensing)
```

## 필수 선행 구성

- [ ] Planning Area 활성화 완료 (`planning-area-configuration.md` 참조)
- [ ] History key figure에 충분한 시계열 데이터 적재
- [ ] Product/Location 마스터 매핑 완료

## 구성 단계 (Configuration Steps)

### 1. Forecast Model 생성
1. Configuration → Forecast Models → New
2. Assignment: 어느 Planning Area / Planning Level 대상인지
3. Input/Output key figure 지정 (history → statistical forecast)

### 2. 알고리즘 선택
1. Forecast Algorithm 추가 — 예: Exponential Smoothing, Croston(간헐 수요), Multiple Linear Regression, Gradient Boosting
2. Algorithm 파라미터 (alpha/beta/gamma, seasonality periods)
3. **Best-fit** 전략 사용 시 후보 알고리즘 풀 + 선정 error measure(MAPE 등)

### 3. Pre-/Post-processing
1. Pre-processing: outlier correction, history cleansing
2. Post-processing: lifecycle(NPI/EOL), promotion lift 분리
3. Snap/round 규칙

### 4. Demand Sensing (단기)
1. Demand Sensing 모델 별도 생성 (short-term)
2. 입력: 단기 actuals, open orders, sales orders
3. Sensing horizon 설정 (보통 1~4주)

### 5. Application Job 스케줄
1. Application Jobs → Forecast Run 스케줄
2. 주기(주간/일간) + 대상 version/scenario

## 구성 검증 (Verification)

- [ ] Forecast Run 수동 실행 → Application Job Monitor에서 성공 확인
- [ ] Output key figure에 예측값 생성 (Planning View로 확인)
- [ ] Error measure(MAPE/MASE)가 합리적 범위
- [ ] Best-fit이 history 부족 품목에 fallback 알고리즘 적용하는지
- [ ] Demand Sensing이 단기 actuals 반영해 baseline 보정하는지

## 한국 현장 체크

- 추석/설 음력 시즌성이 seasonality period에 반영됐는지
- 신제품(NPI): history 부족 → like-modeling 또는 manual override
- 프로모션 영향: baseline forecast와 event lift 분리

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| 예측 안 나옴 | Forecast Model assignment / history 길이 / 마스터 매핑 |
| 예측 정확도 낮음 | algorithm 적합성 / outlier / seasonality 설정 |
| Demand Sensing 미반영 | 단기 input key figure 적재 / sensing horizon |
