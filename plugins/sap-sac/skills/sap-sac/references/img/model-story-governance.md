# SAC Data Model & Story Governance 구성 가이드

## SPRO 경로

SAC 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
SAC → Modeler (Data Model)
SAC → Files → Story
SAC → ⚙ System → Administration → Users & Roles (Analytic Privilege)
```

## 필수 선행 구성

- [ ] Connection 구성 완료 (`connection-setup.md`)
- [ ] 소스 모델/쿼리(BW query, CDS view) 식별
- [ ] 역할(Role) 설계 — Viewer / Modeler / Admin / Planner

## 구성 단계 (Configuration Steps)

### 1. Data Model
1. SAC → Modeler → New Model (Live: query 직접 / Import: dataset)
2. Dimension / Measure 정의, hierarchy 설정
3. Currency / Unit conversion (필요 시)
4. Model preferences (data access, default)

### 2. Story
1. Files → New Story → 모델 연결
2. Page / Widget(차트·테이블·geo) 배치
3. Filter / Linked Analysis / Input Control
4. Calculation (calculated measure, restricted)

### 3. Analytic Privilege & Role
1. System → Roles → Standard role 복제 후 커스터마이즈
2. Data Access Control(행 수준): 모델에 DAC 차원 지정
3. Role에 모델·스토리 권한 + DAC 매핑
4. 사용자에게 role 할당 (또는 IdP 그룹 매핑)

## 구성 검증 (Verification)

- [ ] Story가 의도한 데이터 표시 (집계/필터 정확)
- [ ] DAC: 권한 다른 사용자가 다른 행만 보는지 검증
- [ ] Live 모델: 소스 query 변경 시 모델 sync 동작
- [ ] 성능: 위젯/쿼리 수 적정, 응답 시간 허용 범위
- [ ] 권한 경계: Viewer가 Modeler 기능 접근 불가

## 한국 현장 체크

- 본사/자회사 분리: DAC로 회사코드/플랜트 행 수준 격리
- 한국어 라벨/i18n 표시 정상
- 추석/설 시즌성 필터/계산 반영

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| Story 느림 | 위젯/쿼리 과다 / 소스 query 미최적화 |
| 권한 다른데 같은 데이터 | DAC 차원 미지정 / role DAC 매핑 |
