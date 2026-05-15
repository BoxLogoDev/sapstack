# SAC Planning Model & Data Locking 구성 가이드

## SPRO 경로

SAC 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
SAC → Modeler → Planning Model
SAC → Files → (Planning Story / Data Action / Multi Action)
SAC → ⚙ System → Administration → Data Locking
```

## 필수 선행 구성

- [ ] Planning-enabled Data Model 생성 (Import 기반 — Live는 제한적)
- [ ] Version 전략 (Public actual/plan, Private workspace)
- [ ] 입력 권한 role 설계

## 구성 단계 (Configuration Steps)

### 1. Planning Model
1. Modeler → New Model → Planning 활성
2. Time dimension(필수) + Category(version) dimension
3. Data Action / Allocation / Currency conversion 정의

### 2. Version 관리
1. Public version: Actual / Plan / Forecast
2. 사용자는 Private version에서 작업 → Publish로 Public 반영
3. Version별 권한 (publish 권한 분리)

### 3. Data Locking
1. System → Administration → Data Locking 활성
2. Locking dimension 지정 (예: Version + Org)
3. Lock state: Open / Restricted / Locked
4. Data Locking Task로 영역별 잠금 스케줄

### 4. Data Action / Multi Action
1. Data Action: copy / spread / advanced formula
2. Multi Action: Data Action + version publish + predictive 체이닝
3. Trigger: 수동 / 스케줄

## 구성 검증 (Verification)

- [ ] Private version 입력 → Publish → Public 반영 확인
- [ ] Data Locking: Locked 영역에 입력 차단되는지
- [ ] Data Action 실행 결과가 의도대로 (copy/spread 정확)
- [ ] 동시 편집 충돌 시 잠금 메시지 표시
- [ ] 권한 없는 사용자 입력 거부

## 한국 현장 체크

- 본사/자회사 분리 버전에서 권한 경계
- 월마감/가결산 주기에 맞춘 Data Locking Task 스케줄
- 다국가 통화: currency conversion 환율 테이블 최신화

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| 입력 잠김 | Public version lock / Data Locking Task scope / write 권한 |
| Data Action 결과 이상 | formula scope / version target / 동시 편집 |
