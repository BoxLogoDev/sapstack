# 가격결정절차(Pricing Procedure) IMG 구성 가이드

## SPRO 경로
`SPRO → Sales and Distribution → Pricing → Pricing Control → Pricing Procedures`

Primary T-codes: **V/08** (절차 정의), **V/06** (조건유형), **V/07** (Access Sequence), **OVKK** (절차 할당)

## 필수 선행 구성
- [ ] 조건유형 정의 (V/06)
- [ ] Access Sequence 정의 (V/07)
- [ ] 조건테이블 (V/03, V/04, V/05)

## 핵심 개념: 가격결정 4계층

```
Pricing Procedure (전체 가격 결정 로직)
    ↓
Condition Type (개별 조건, 예: 기본가격, 할인)
    ↓
Access Sequence (조건검색 순서)
    ↓
Condition Table (실제 데이터, 예: 고객별 가격)
```

## 구성 단계

### 1단계: 조건유형(Condition Type) 정의 (V/06)

T-code: **V/06** (Maintain Condition Types)

```
화면:
┌──────────────────────────────┐
│ Condition Type: PR00         │
├──────────────────────────────┤
│ Description: "Price"         │
│ Condition Category: 1        │
│ Condition Type Name (Long):  │
│ "Base Price for Material"    │
│                              │
│ Calculation Type: *          │
│ ├─ * (Absolute amount)       │
│ ├─ % (Percentage)            │
│ ├─ FX (Fixed quantity)       │
│ └─ DU (Discount / Increase)  │
│                              │
│ Condition Unit (원화 기본):  │
│ ├─ Unit: EUR                 │
│ └─ Decimal: 2                │
│                              │
│ Rounding: (반올림)          │
│ ├─ Rounding Code: 1          │
│ └─ Rounding Decimal: 2       │
│                              │
│ Price Determination:         │
│ ├─ Pricing Type: 1 (Price)  │
│ └─ Group: (가격그룹)        │
│                              │
│ Statistics & Control:        │
│ ├─ Count Quantity: ☑         │
│ ├─ Manual Input: ☑           │
│ └─ Printable: ☑              │
└──────────────────────────────┘
```

#### 표준 조건유형 예시

| Condition Type | 명칭 | 계산 | 용도 |
|---|---|---|---|
| **PR00** | Base Price | Abs(EUR) | 기본가격 |
| **K004** | Customer Discount | %(%) | 고객할인 |
| **K005** | Volume Discount | %(%) | 수량할인 |
| **K006** | Promotion | Abs | 프로모션 |
| **MWST** | Sales Tax | %(%) | 부가세(독일: 19%) |
| **FRL1** | Freight | %(%) | 운송비 |
| **RLBD** | Rebate | %(%) | 리베이트(연중정산) |

### 2단계: Access Sequence 정의 (V/07)

T-code: **V/07** (Maintain Access Sequences)

Access Sequence는 조건을 검색하는 **순서와 우선순위**를 정의:

```
예시: PR00(기본가격) Access Sequence

화면:
┌────────────────────────────────┐
│ Access Sequence: 001             │
│ Description: "Price / Customer"  │
├────────────────────────────────┤
│ Step 1: Customer + Material      │
│ Step 2: Customer + Material Type │
│ Step 3: Material                 │
│ Step 4: Material Class           │
│ Step 5: (Standard Price)         │
└────────────────────────────────┘
```

**Sequence 결정 로직:**

```
오더 입력:
├─ Customer: C00001 (Siemens)
├─ Material: MAT-001
└─ Qty: 100 EA

Access Sequence 001 실행:
├─ Step 1: Find(Customer=C00001 + Material=MAT-001)
│  └─ 결과: 99 EUR/EA (고객전용가)
│     → 종료, 다음 Step 스킵
│
├─ Step 2-5: 스킵됨
│
└─ Final Price: 99 EUR/EA ✓
```

**만약 Step 1 미설정:**

```
├─ Step 1: 데이터 없음
│
├─ Step 2: Find(Customer=C00001 + MaterialType=Electrical)
│  └─ 결과: 102 EUR/EA (고객+자재유형 가격)
│     → 종료
│
└─ Final Price: 102 EUR/EA
```

### 3단계: 조건테이블 정의 (V/03, V/04, V/05)

T-code: **V/03~V/05** (Maintain Condition Tables)

조건테이블은 **실제 가격데이터**를 저장하는 DB 테이블:

#### V/03: 간단한 구조 테이블 (Key 1~2개)

```
테이블: 001 (Customer + Material)

구조:
├─ Key Field 1: Customer (고객코드)
├─ Key Field 2: Material (자재번호)
└─ Data Field: Price (가격)

예시 데이터:
┌─────────────┬──────────┬────────┐
│ Customer    │ Material │ Price  │
├─────────────┼──────────┼────────┤
│ C00001      │ MAT-001  │ 99.00  │
│ C00001      │ MAT-002  │ 89.50  │
│ C00002      │ MAT-001  │ 101.00 │
└─────────────┴──────────┴────────┘
```

#### V/04: 중간 구조 테이블 (Key 3~4개)

```
테이블: 002 (Customer + Material + Plant + Validity Date)

구조:
├─ Key 1: Customer
├─ Key 2: Material
├─ Key 3: Plant
├─ Key 4: Valid From
└─ Data: Price

예시:
┌────────┬────────┬────────┬──────────┬────────┐
│ Cust.  │ Mat.   │ Plant  │ Val.From │ Price  │
├────────┼────────┼────────┼──────────┼────────┤
│ C00001 │ MAT-001│ 1000   │ 2025-01  │ 99.00  │
│ C00001 │ MAT-001│ 2000   │ 2025-01  │ 98.50  │
└────────┴────────┴────────┴──────────┴────────┘
```

#### V/05: 복잡한 구조 테이블 (사용자정의, 최대 8개 Key)

```
테이블: 999 (사용자정의 예시)
├─ Customer
├─ Material Class
├─ Qty From
├─ Qty To
├─ Currency
└─ Price

용도: 수량 구간별 가격책정
```

### 4단계: Pricing Procedure 정의 (V/08)

T-code: **V/08** (Maintain Pricing Procedures)

Pricing Procedure는 **전체 가격 계산 프로세스**를 정의:

```
화면:
┌────────────────────────────────────┐
│ Pricing Procedure: 01              │
│ Description: "Standard Procedure"  │
├────────────────────────────────────┤
│ Step │ Cond Type │ Abs│ Rqd│ Seq │
├──────┼───────────┼────┼────┼─────┤
│ 10   │ PR00      │ ✓  │ ✓  │ 001 │ ← 기본가격
│ 20   │ K004      │    │    │ 002 │ ← 고객할인
│ 30   │ K005      │    │    │ 003 │ ← 수량할인
│ 40   │ K006      │    │ ✓  │ 004 │ ← 프로모션(조건부)
│ 50   │ FRL1      │    │    │ 005 │ ← 운송비
│ 60   │ MWST      │    │ ✓  │ 006 │ ← 세금(필수)
└────────────────────────────────────┘
```

#### V/08 상세 필드 설명

**Step 10: PR00(기본가격)**

```
Condition Type: PR00
├─ Sequence: 001 (검색 순서)
├─ Rqd (Required): ✓ (필수조건)
├─ Abs (Absolute): ✓ (절대값, 음수 불가)
├─ Alt (Alternative): ☐ (대체값)
└─ Manual Input: ✓ (수동입력 가능)

오더 입고 시:
└─ 기본가격 반드시 입력/조회
```

**Step 20: K004(고객할인)**

```
Condition Type: K004
├─ Sequence: 002
├─ Rqd: ☐ (선택)
├─ Abs: ☐ (퍼센테이지로 표시)
├─ Alt: ☐
└─ Subtotal Target (소계수준)

오더 계산:
├─ PR00(기본가격): 100 EUR
└─ K004(할인): -5% = -5 EUR
   → 소계: 95 EUR
```

**Step 30: K005(수량할인)**

```
Condition Type: K005
├─ Sequence: 003
├─ Rqd: ☐
├─ Subtotal Target (소계에만 적용)

오더 계산:
├─ 소계(기본가격 - 고객할인): 95 EUR
└─ K005(수량할인, 100~500 EA): -2% = -1.90 EUR
   → 소계: 93.10 EUR
```

**Step 50: FRL1(운송비)**

```
Condition Type: FRL1
├─ Sequence: 005
├─ Rqd: ☐
├─ Absolute Subtotal: Yes
   (수량/할인 무관, 절대값)

오더 계산:
├─ 소계(가격 - 할인): 93.10 EUR
└─ FRL1(운송비): +5 EUR(고정)
   → 총계: 98.10 EUR
```

**Step 60: MWST(부가세)**

```
Condition Type: MWST
├─ Sequence: 006
├─ Rqd: ✓ (필수)
├─ Tax Calculation: 19% (독일)

오더 계산:
├─ 세금 기준액: 98.10 EUR
└─ MWST(19%): +18.64 EUR
   → 최종가격: 116.74 EUR ✓
```

### 5단계: Pricing Procedure를 판매조직에 할당 (OVKK)

T-code: **OVKK** (Assign Pricing Procedures)

```
화면:
┌─────────────────────────────────────┐
│ Pricing Procedure Determination      │
├─────────────────────────────────────┤
│ Sales Organization: 1000            │
│ Distribution Channel: 01 (B2C)      │
│ Division: 00 (전체)                 │
│ Customer Pricing Procedure: 01       │
│ Document Pricing Procedure: (Blank) │
└─────────────────────────────────────┘
```

#### OVKK 할당 규칙

**기본 판매조직 1000 + 유통채널 01(B2C):**

```
Row 1:
├─ Sales Org: 1000
├─ Dist Channel: 01
├─ Division: (Blank = 전체)
├─ Cust. PP: 01 (Standard Procedure)
└─ Doc. PP: (미설정)
   → B2C 채널 모든 판매오더 = 절차 01 사용

Row 2:
├─ Sales Org: 1000
├─ Dist Channel: 02 (B2B)
├─ Division: (Blank)
├─ Cust. PP: 02 (B2B Discount Procedure)
└─ Doc. PP: (미설정)
   → B2B 채널 = 절차 02 사용
```

## 가격결정 실행 흐름 (VA01 - Create Sales Order)

```
1. 기본정보 입력:
   ├─ Sales Organization: 1000
   ├─ Distribution Channel: 01
   ├─ Division: 00
   └─ [Enter]

2. 절차 자동 결정:
   └─ OVKK 조회
      ├─ SO 1000 + DC 01 → Procedure 01 ✓
      └─ Procedure 정보 로드

3. 항목 입력:
   ├─ Material: MAT-001
   ├─ Qty: 100 EA
   ├─ Req. Date: 2026-05-01
   └─ [Enter] → 가격 조회 시작

4. 조건유형별 자동 조회:
   ├─ PR00(기본가격) Access Seq 001
   │  ├─ Step 1: Customer=C00001 + Material=MAT-001 → 99 EUR ✓
   │  └─ (검색 종료)
   │
   ├─ K004(할인) Access Seq 002
   │  ├─ Step 1: Customer + Material → 데이터 없음
   │  ├─ Step 2: Customer + Material Type → 5% ✓
   │  └─ (검색 종료)
   │
   ├─ K005(수량할인) Access Seq 003
   │  ├─ Step 1: Customer + Material + Qty → 2% ✓
   │  └─ (검색 종료)
   │
   └─ MWST(세금) 19% 자동

5. 가격 계산:
   ├─ 기본가격(PR00): 99.00 EUR
   ├─ 고객할인(K004): -4.95 EUR (-5%)
   ├─ 수량할인(K005): -1.89 EUR (-2%)
   ├─ 운송비(FRL1): +5.00 EUR
   ├─ 소계: 97.16 EUR
   ├─ 세금(MWST): +18.46 EUR (+19%)
   └─ 최종: 115.62 EUR/Line ✓
```

## 구성 검증

### 검증 1: V/06에서 조건유형 확인
```
T-code: V/06 → Display Mode
├─ Condition Type PR00: Base Price ✓
├─ Condition Type K004: Discount ✓
└─ Condition Type MWST: Tax ✓
```

### 검증 2: V/07에서 Access Sequence 확인
```
T-code: V/07 → Display Mode
├─ Sequence 001: Customer + Material ✓
├─ Sequence 002: Customer ✓
└─ Sequence 003: Material ✓
```

### 검증 3: V/08에서 Pricing Procedure 확인
```
T-code: V/08 → Display Mode
├─ Procedure 01:
│  ├─ Step 10: PR00 (Seq 001) ✓
│  ├─ Step 20: K004 (Seq 002) ✓
│  ├─ Step 30: K005 (Seq 003) ✓
│  └─ Step 60: MWST (Seq 006) ✓
└─ All steps properly sequenced ✓
```

### 검증 4: OVKK에서 할당 확인
```
T-code: OVKK → Display Mode
├─ Sales Org 1000 + DC 01
│  └─ Pricing Procedure: 01 ✓
└─ Sales Org 1000 + DC 02
   └─ Pricing Procedure: 02 ✓
```

### 검증 5: 실제 판매오더로 테스트 (VA01)
```
T-code: VA01 (Create Sales Order)
├─ Sales Org: 1000
├─ DC: 01
├─ Customer: C00001
├─ Material: MAT-001
├─ Qty: 100 EA
└─ [Enter] → Line Item
   ├─ Net Price: 99.00 EUR ✓
   ├─ Discount: 4.95 EUR ✓
   ├─ Qty Discount: 1.89 EUR ✓
   ├─ Net Amount: 9,116 EUR ✓
   ├─ Tax: 1,732 EUR ✓
   └─ Gross Amount: 10,848 EUR ✓
```

## 주의사항

### 1. Condition Type 중복 정의 → 가격 이중계산
**문제**: V/06에서 PR00을 두 개 다르게 정의
```
결과: VA01에서 기본가격이 이중으로 적용 → 가격오류
```
**해결**: V/06 → 코드(PR00) 고유성 확인

### 2. Access Sequence 순서 오류 → 잘못된 가격 조회
**문제**: V/07에서 Step 1 = Material, Step 2 = Customer로 설정 (역순)
```
결과: 고객전용가 무시, 자재 기본가 우선 조회 → 할인 손실
```
**해결**: V/07 → 구체적 조건(Customer + Material) → 일반 조건(Material) 순서 유지

### 3. 조건테이블 데이터 누락 → 가격 미조회
**문제**: V/03에서 Customer + Material 조합이 미입력
```
결과: VA01에서 고객별 가격 미조회 → 기본가격만 사용
```
**해결**: 데이터 마스터(Condition Records) VK11로 가격 입력

### 4. OVKK 할당 미설정 → 절차 미결정
**문제**: OVKK에서 Sales Org 1000은 정의했으나 DC별 할당 없음
```
결과: VA01에서 절차 결정 불가 → 에러
```
**해결**: OVKK → Sales Org + DC 조합별 모두 할당

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| V/08 절차 | 고정 체계 | 동일 (확장 기능) |
| Access Seq | 수동 정의 | 자동 제안 기능 |
| 조건 입력 | VK11(수동) | Pricing Workbench (UI5) |
| 가격최적화 | 없음 | ML 기반 Pricing (향후) |
| Multi-Currency | 환율 수동 | 자동 환전 |

## 참고 자료

- **SAP 공식**: IMG → SD → Pricing → Pricing Control
- **T-codes**: V/06(유형), V/07(Seq), V/08(절차), OVKK(할당)
- **심화**: VK11(가격조회), NWDI(절차 시뮬레이션)
