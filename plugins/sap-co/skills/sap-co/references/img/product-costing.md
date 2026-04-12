# 제품원가(Product Costing) IMG 구성 가이드

## SPRO 경로
```
SPRO → Controlling → Product Costing
    → Costing Runs → Valuation Variants
```

## 필수 선행 구성

- [ ] OKKP: 관리회계영역 정의
- [ ] KS01: 원가센터 정의
- [ ] KA06/FS00: 원가요소 정의
- [ ] MM02: 자재 마스터 정의 (자재번호, 평가클래스)

## 원가추정 변형 (T-code: OKKN)

**SPRO 경로**: `SPRO → Controlling → Product Costing → Costing Runs → Valuation Variants → Define Costing Variants`

### 구성 단계

```
T-code: OKKN 실행

Costing Variant: V1
Description: 표준 원가 추정
Costing Method: 10 (Standard Costing)
Controlling Area: KOR
```

**주요 필드**:

| 필드 | 설명 | 값 | 용도 |
|------|------|-----|------|
| Costing Variant | 변형명 | V1, V2 등 | 고유 |
| Description | 설명 | 표준 원가 추정 | 관리 |
| Costing Method | 방식 | 10 (표준) | 계산 알고리즘 |
| BOM Explosion | BOM 전개 | 1 (정상) | 자재 구조 계산 방식 |
| Routing Explosion | 공정경로 전개 | 1 (정상) | 공정 비용 계산 |
| Scrap % | 손품율 | 2.0 | 손품비 포함 |
| Overhead Key | 간접비키 | OHD-001 | 제조간접비 배분 |

**여러 변형 유형**:

```
표준 원가:
  변형 V1 (Standard Costing)
    └─ 일반적 원가 추정

활동기준 원가:
  변형 V2 (ABC Costing)
    └─ 활동별 원가 배분

실제 원가:
  변형 V3 (Actual Costing)
    └─ 월별 실제 비용 적용
```

---

## 원가구성요소 구조 (T-code: OKTZ)

**SPRO 경로**: `SPRO → Controlling → Product Costing → Settings → Define Cost Component Structure`

**목적**: 원가를 어떻게 세분화할 것인가

### 구성 단계

```
T-code: OKTZ 실행

Cost Component Structure: 01
Description: 표준 구성요소
Controlling Area: KOR
```

**구성요소 정의**:

```
Level 1 - 자재비 (Materials)
  ├─ 직재료비 (Raw Materials) — GL 501000
  ├─ 반제품 (Semi-finished) — GL 502000
  └─ 자재 간접비 (Material Overhead) — GL 509000

Level 2 - 가공비 (Labor & Overhead)
  ├─ 직접 인건비 (Direct Labor) — GL 510000
  ├─ 제조 간접비 (Manufacturing OH) — GL 520000
  └─ 라인별 간접비 (Line Specific) — GL 521000

Level 3 - 제조비
  └─ 총 제조비 (Total Mfg Cost) — GL 599000

Level 4 - 행정비
  └─ 관리비 (Admin OH) — GL 640000
```

**필드 설명**:

| 필드 | 설명 | 값 |
|------|------|-----|
| Cost Component | 구성요소 코드 | 01~10 |
| Description | 설명 | 자재비, 인건비 등 |
| Cost Element Group | 원가요소 그룹 | MAT, LBR 등 |
| G/L Account | GL 계정 | 501000 등 |
| Level | 계층 | 1, 2, 3 |

---

## 제품원가 계산 플로우

### Step 1: 자재 원가 계산 (T-code: CK11N)

**SPRO 경로**: `SPRO → Controlling → Product Costing → Actual Costing → Material Cost Estimate`

```
T-code: CK11N 실행

Material: HW-COMP-001 (반도체 부품)
Plant: 1001
Costing Variant: V1
Date: 01.01.2024

결과:
  구매가: 100,000 원
  운송비: 2,000 원
  관세: 1,000 원
  ========
  총 원가: 103,000 원
```

**자재 원가 결정 요소**:

| 요소 | 설명 | 값 | 포함 여부 |
|------|------|-----|---------|
| 표준가 | 구매처 기본가 | 100,000 | O |
| 운송료 | 입고 운송비 | 2,000 | O |
| 관세 | 수입세 | 1,000 | O (수입재료) |
| 보관료 | 창고 보관비 | 500 | △ (정책) |

### Step 2: 제품 원가 계산 (T-code: CK40N)

**SPRO 경로**: `SPRO → Controlling → Product Costing → Actual Costing → Product Cost Estimate`

```
T-code: CK40N 실행

Product: PROD-001 (최종제품)
Plant: 1001
Costing Variant: V1
Date: 01.01.2024
```

**계산 프로세스**:

```
1. BOM 전개 (Bill of Materials)
   PROD-001 구성:
   ├─ HW-COMP-001 (반도체) × 2개 @ 103,000 = 206,000
   ├─ HW-COMP-002 (커넥터) × 1개 @ 5,000 = 5,000
   ├─ PKG-001 (패키징) × 1개 @ 10,000 = 10,000
   └─ (소재료비) = 221,000

2. 공정경로 원가 계산 (Routing)
   PROD-001 공정:
   ├─ 조립공정 (1시간) @ 50,000/hr = 50,000
   ├─ 검사공정 (0.5시간) @ 30,000/hr = 15,000
   └─ (가공비) = 65,000

3. 간접비 배분
   제조간접비 배분율: 자재비의 30%
   = 221,000 × 30% = 66,300

4. 총 제품 원가
   자재비: 221,000
   가공비: 65,000
   간접비: 66,300
   =========
   총합: 352,300 원
```

**BOM 구조** (T-code: CS01 또는 MM02):

```
최종 제품 PROD-001
  ├─ 부품 HW-COMP-001 (반도체)
  │   ├─ 기판 STD-BASE
  │   └─ 칩셋 CHIP-SET
  ├─ 부품 HW-COMP-002 (커넥터)
  └─ 패키징 PKG-001
```

**공정경로** (T-code: CA01):

```
PROD-001 공정경로:
  ├─ 공정 10: 조립 (Cost Center 1010)
  │   └─ 시간: 1.0, 비용: 50,000
  ├─ 공정 20: 검사 (Cost Center 1020)
  │   └─ 시간: 0.5, 비용: 15,000
  └─ 공정 30: 포장 (Cost Center 1030)
      └─ 시간: 0.3, 비용: 5,000
```

### Step 3: 원가 전개 (T-code: CK24)

**SPRO 경로**: `SPRO → Controlling → Product Costing → Actual Costing → Variance Calculation`

**목적**: 표준 원가 vs 실제 원가 비교

```
T-code: CK24 실행

Product: PROD-001
Period: 202401
Variant: V1

결과:
  표준 원가: 352,300 원
  실제 원가: 358,500 원
  차이: +6,200 원 (1.76% 초과)
  
차이 분석 (Variance Analysis):
  ├─ 자재 차이: +3,000 (가격 상승)
  ├─ 가공 차이: +2,000 (초과근무)
  ├─ 간접비 차이: +1,200 (할당 차이)
  └─ 합계: +6,200
```

---

## 자재원장 (Material Ledger, T-code: CKML)

**용도**: 자재별 가격 변동 추적 (S/4HANA 필수)

```
T-code: CKML 실행

Material: HW-COMP-001
Plant: 1001
Period: 202401

월별 원가 변동:
  1월: 103,000 원
  2월: 105,000 원 (가격 상승)
  3월: 104,500 원 (조정)
  
평가 조정:
  1월 재고: 1,000개 @ 103,000 = 103,000,000
  2월 인상분: 1,000개 × 2,000 = 2,000,000
  조정 전기: Debit 530000, Credit 520000
```

---

## S/4HANA 신 원가 계산

### 신 자재원장 활성화 (S_BCE_68001639)

```
기존 (ECC):
  - CK11N: 자재 원가 독립 계산
  - CK40N: 제품 원가 독립 계산
  - CKML: 별도 추적

신 (S/4):
  - 자재원장 필수
  - ACDOCA 기반 자동 계산
  - 월별 자동 평가 조정
```

---

## 월별 원가 운영 절차

### 월초
```
1. 표준 원가 확인
   - 자재 가격 업데이트 (CK11N)
   - BOM/Routing 검토
   
2. 원가 변형 선택
   - V1 (표준): 분기별
   - V2 (실제): 월별
```

### 월말
```
1. 실제 거래 수집
   - 자재 입고 (MIGO)
   - 가공비 귀속 (CO 거래)
   
2. 원가 계산
   - CK40N 실행
   - 차이 분석 (CK24)
   
3. 평가 조정
   - CKML 확인
   - 자재원장 조정 전기
   
4. 보고
   - 제품별 원가 분석
   - 차이 원인 보고
```

---

## 주의사항

1. **BOM/Routing 정확성**
   - 원가 계산의 기초
   - 월별 BOM 변경이 반영되는가 확인
   - 수량 단위 일관성 검토

2. **간접비 배분 기준**
   - 자재비 % vs 가공시간 % 선택
   - 일관성 유지 필수
   - 변경 시 비교 불가능

3. **손품율 설정**
   - 통상 1~5% 범위
   - 산업별 차이 크므로 정확한 측정 필수
   - 과다 설정 시 원가 왜곡

4. **자재원장 활성화 (S/4HANA)**
   - 신GL 도입 필수 전제
   - 마이그레이션 시 주의 필요
   - 역산 불가능

---

## 관련 T-codes

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **OKKN** | 원가변형 정의 | 초기 설정 |
| **OKTZ** | 원가구성 정의 | 초기 설정 |
| **CK11N** | 자재 원가 계산 | 월초 |
| **CK40N** | 제품 원가 계산 | 월말 |
| **CK24** | 원가 전개/차이 | 월말 |
| **CKML** | 자재원장 | 검증 |
| **CS01** | BOM 생성 | 제품개발 |
| **CA01** | 공정경로 | 제품개발 |

## 체크리스트

- [ ] OKKN: 원가변형 정의 (최소 2개)
- [ ] OKTZ: 원가구성요소 정의
- [ ] MM02: 자재 원가 필드 입력
- [ ] CS01: 주요 제품 BOM 정의
- [ ] CA01: 공정경로 정의
- [ ] CK11N: 자재 원가 테스트
- [ ] CK40N: 제품 원가 테스트
- [ ] CK24: 차이 분석 프로세스 수립
