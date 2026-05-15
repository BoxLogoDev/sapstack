# IBP Planning Area 구성 가이드

## SPRO 경로

클라우드 SaaS — 전통 SPRO IMG 미해당. IBP Web UI 경로 사용:

```
IBP Web UI → Configuration → Planning Areas
    → (Time Profiles / Attributes / Master Data Types / Key Figures)
```

## 필수 선행 구성

- [ ] Time Profile 정의 (예: 주/월/분기 레벨)
- [ ] Attributes & Master Data Types (Product, Location, Customer)
- [ ] Planning Area 베이스 결정 — 표준(SAPIBP1 Unified, SAP7 Sample) vs 커스텀

## 구성 단계 (Configuration Steps)

### 1. Time Profile 생성
1. Configuration → Time Profiles → New
2. Level 정의 (Technical Week / Month / Quarter / Year)
3. Periodicity & horizon 설정 (과거 history + 미래 planning)

### 2. Master Data Type & Attributes
1. Configuration → Attributes → 기준 속성 등록 (PRDID, LOCID, CUSTID 등)
2. Master Data Types 생성 후 Attributes 매핑
3. Compound Master Data (Product-Location 등) 정의

### 3. Planning Area 생성
1. Configuration → Planning Areas → Copy from SAPIBP1 (권장) 또는 New
2. Time Profile / Master Data Types / Attributes 할당
3. **Key Figures** 정의 — base/calculated, aggregation/disaggregation 규칙
4. Planning Levels 정의 (어느 attribute 조합에서 입력/표시)
5. Version & Scenario 활성화

### 4. 활성화 (Activate)
1. Planning Area → Consistency Check 실행
2. Activate — 활성화 후 master data load 가능

## 구성 검증 (Verification)

- [ ] Consistency Check 0 error로 통과
- [ ] Sample master data load 후 Planning View(Excel)에서 key figure 표시
- [ ] Aggregation/disaggregation 규칙이 의도대로 동작 (상위↔하위 레벨)
- [ ] Version copy 후 격리 확인 (baseline vs scenario)

## 한국 현장 체크

- 추석/설 음력 이벤트 → Time Profile에 별도 marker 또는 Time Event Master
- 다국가 모델(한국+베트남/중국) → Location attribute에 국가 코드 + 통화
- 신제품(NPI)/단종(EOL) → Product lifecycle attribute 필수

## 관련 T-code (연동 측 S/4)

| T-code | 용도 |
|---|---|
| MD63 | 릴리스된 PIR 표시 (S/4) |
| MD05 | MRP List 개별 표시 |
| MDBT | MRP 백그라운드 실행 |
