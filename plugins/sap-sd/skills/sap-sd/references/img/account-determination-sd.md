# SD 계정결정(Account Determination) IMG 구성 가이드

## SPRO 경로
`SPRO → Sales and Distribution → Basic Functions → Account Assignment → Account Determination`

Primary T-code: **VKOA** (Account Determination for Sales/Distribution)

## 필수 선행 구성
- [ ] Chart of Accounts (회계부) → FI-GL 계정 생성
- [ ] 판매조직/유통채널 정의 (OV01~03)
- [ ] 계정결정 전반 이해 (FI-GL)

## 핵심 개념: SD 계정결정 매트릭스

```
판매/배송 거래
    ↓
Account Key 결정 (거래 유형별)
    ├─ ERL: 매출(Revenue)
    ├─ ERS: 매출공제(Reduction)
    ├─ FRL: 운송비(Freight)
    └─ MWS: 세금(Tax)
    ↓
Chart of Accounts (회사코드별)
    ↓
GL Account (일반계정과목)
```

## 구성 단계

### 1단계: Account Key 이해

**표준 SD Account Keys:**

| Account Key | 명칭 | 용도 | GL Account 예 |
|---|---|---|---|
| **ERL** | Revenue | 판매수익 | 400000 (Sales Revenue) |
| **ERS** | Revenue Reduction | 할인/반품/공제 | 401000 (Sales Deductions) |
| **FRL** | Freight | 운송비 | 404000 (Transportation Revenue) |
| **MWS** | Sales Tax | 부가세 (Liability) | 172000 (Sales Tax Payable) |
| **TXJ** | Tax on Freight | 운송비 부가세 | 172100 (Tax on Transport) |
| **UMS** | Turnover Tax | 거래세(구 항목) | (사용 안함) |

### 2단계: VKOA 매트릭스 정의

T-code: **VKOA** (Determine Account Determination)

```
화면 구조:
┌────────────────────────────────────┐
│ Sales/Distribution Account Assign.  │
├────────────────────────────────────┤
│ Company Code: 1000                 │
│ Sales Organization: 1000           │
│ (Distribution Channel: Optional)   │
│                                    │
│ Account Determination Type:         │
│ ├─ Condition Type: (조건유형)     │
│ └─ Or Account Key: (직접 지정)    │
│                                    │
│ GL Account Assignment:             │
│ ├─ Account Key (행)                │
│ ├─ GL Account (열)                 │
│ └─ Chart of Accounts               │
└────────────────────────────────────┘
```

#### VKOA 행렬 예시

**회사코드 1000 (독일, INT CoA):**

```
┌──────────┬──────┬─────────────────────┬─────────────┐
│ Acct Key │ Doc. │ GL Account Debit    │ GL Account  │
│          │ Type │ (분개용)            │ Credit      │
├──────────┼──────┼─────────────────────┼─────────────┤
│ ERL      │ RV   │ 112100(AR/Receivabl)│ 400000(Sale)│
│          │      │ (고객채권)          │             │
├──────────┼──────┼─────────────────────┼─────────────┤
│ ERS      │ RV   │ 401000(Deductions)  │ 112100(AR)  │
│          │      │ (할인/반품)         │             │
├──────────┼──────┼─────────────────────┼─────────────┤
│ FRL      │ RV   │ 112100(AR)          │ 404000      │
│          │      │                     │ (Freight)   │
├──────────┼──────┼─────────────────────┼─────────────┤
│ MWS      │ RV   │ 112100(AR)          │ 172000      │
│          │      │                     │ (VAT Paybl) │
└──────────┴──────┴─────────────────────┴─────────────┘
```

**회사코드 1000 (판매문서 DR로 표시):**

```
실제 자동전기:
├─ Line 1: DR 112100 (AR) — 고객채권 증가
├─ Line 2: CR 400000 (Revenue) — 매출 인식
├─ Line 3: CR 172000 (VAT) — 부가세 채무 증가
└─ Line 4: CR 404000 (Freight) — (운송비 있을 경우)
```

### 3단계: 조건유형(Condition Type) 기반 계정결정

Sales Order에서 조건유형이 Account Key로 자동 매핑:

```
예시: 판매오더 VA01 생성

조건유형: PR00(기본가격)
├─ Account Key: ERL (매출)
└─ VKOA 조회:
   ├─ Company Code: 1000
   ├─ Sales Org: 1000
   ├─ Account Key: ERL
   └─ GL Account (CR): 400000 (Sales Revenue) ✓

조건유형: K004(고객할인)
├─ Account Key: ERS (매출공제)
└─ VKOA 조회:
   ├─ Company Code: 1000
   ├─ Sales Org: 1000
   ├─ Account Key: ERS
   └─ GL Account (CR): 401000 (Sales Deductions) ✓

조건유형: MWST(부가세)
├─ Account Key: MWS (세금)
└─ VKOA 조회:
   ├─ Company Code: 1000
   ├─ Account Key: MWS
   └─ GL Account (CR): 172000 (VAT Payable) ✓
```

### 4단계: 판매오더 → 빌링 자동전기

**판매오더 생성 (VA01) 시:**

```
Line Item:
├─ Material: MAT-001
├─ Qty: 100 EA
├─ Unit Price: 100 EUR
├─ Discount: -5 EUR
├─ Tax: +19 EUR
└─ Total: 114 EUR

조건별 매핑:
├─ PR00 (기본 100 EUR) → ERL (Revenue 400000)
├─ K004 (-5 EUR) → ERS (Deduction 401000)
└─ MWST (+19 EUR) → MWS (VAT 172000)

Billing (VF01) 실행 시:
└─ 자동 FI 전기:
   ├─ DR 112100 (AR) 114 EUR
   │  (고객채권 증가)
   ├─ CR 400000 (Revenue) 100 EUR
   │  (매출 인식)
   ├─ CR 401000 (Deduction) 5 EUR
   │  (할인 차감)
   └─ CR 172000 (VAT) 19 EUR
      (부가세 채무)
```

### 5단계: 판매오더 대금 회수 (AR → Cash)

**Invoice Received & Payment (FI 영역):**

```
FI 문서:
├─ Payment Received (고객 입금)
└─ AR Clearing:
   ├─ DR 110000 (Bank) 114 EUR
   └─ CR 112100 (AR/Receivable) 114 EUR
      → AR 계정 0 (정산완료)
```

## 특수 계정결정: 환불/반품 (Returns)

### 반품 (Movement Type 201 역방향)

```
반품 판매오더 (VA01 with Return Request):
├─ Original SO: #4500001
├─ Return Qty: -50 EA (음수)
└─ Return Amount: -5700 EUR (-50 × 114)

자동 전기:
├─ DR 401000 (Return Deduction) 5000 EUR
│  (반품 수익공제)
├─ DR 172000 (VAT Return) -950 EUR
│  (부가세 환급)
└─ CR 112100 (AR) 5700 EUR
   (고객 환급채무 증가)
```

## 구성 검증

### 검증 1: VKOA에서 매트릭스 확인
```
T-code: VKOA → Display Mode
├─ Company Code: 1000
├─ Sales Org: 1000
├─ Account Key ERL:
│  ├─ GL Account (CR): 400000 ✓
│  └─ Description: "Sales Revenue"
├─ Account Key ERS:
│  ├─ GL Account (CR): 401000 ✓
│  └─ Description: "Sales Deductions"
├─ Account Key FRL:
│  ├─ GL Account (CR): 404000 ✓
│  └─ Description: "Freight Revenue"
└─ Account Key MWS:
   ├─ GL Account (CR): 172000 ✓
   └─ Description: "Sales Tax Payable"
```

### 검증 2: 조건유형 → Account Key 매핑 (V/06)
```
T-code: V/06 → Display Mode
├─ Condition Type PR00:
│  ├─ Pricing Type: 1 (Price) ✓
│  └─ Account Key: (PR00 → ERL로 자동 매핑)
├─ Condition Type K004:
│  ├─ Pricing Type: 2 (Discount) ✓
│  └─ Account Key: (K004 → ERS로 자동 매핑)
└─ Condition Type MWST:
   ├─ Pricing Type: 3 (Tax) ✓
   └─ Account Key: (MWST → MWS로 자동 매핑)
```

### 검증 3: 판매오더 생성 및 자동전기 검증 (VA01)
```
T-code: VA01 (Create SO)
├─ Sales Org: 1000
├─ Customer: C00001
├─ Material: MAT-001
├─ Qty: 100 EA
├─ [Save]
└─ Document: #4500001 생성

T-code: VF01 (Create Billing)
├─ Sales Order: 4500001
├─ [Create] → Billing Document: #9000001

T-code: FB03 (Display Document)
├─ Document: 9000001 (자동생성 FI Doc)
├─ Line 1: DR 112100 (AR) 114 EUR ✓
├─ Line 2: CR 400000 (Revenue) 100 EUR ✓
├─ Line 3: CR 401000 (Deduction) 5 EUR ✓
└─ Line 4: CR 172000 (VAT) 19 EUR ✓
   → Total: Balanced ✓
```

### 검증 4: 특정 조건 없을 때 기본값 확인

```
시나리오: 할인이 없는 주문
├─ VA01: PR00만 있음 (K004 없음)
├─ [Save] → Billing

FI Document:
├─ Line 1: DR 112100 100 EUR
├─ Line 2: CR 400000 100 EUR
└─ (Line 3 K004: 생략) ✓
```

## 다중 판매조직 설정 (Multi-Org)

### 같은 회사코드, 다른 판매조직

```
회사코드: 1000
├─ 판매조직 1000 (B2C Domestic)
│  └─ VKOA:
│     ├─ ERL → 400000 (Domestic Sales)
│     └─ MWS → 172000 (Domestic VAT)
│
└─ 판매조직 2000 (B2B Export)
   └─ VKOA:
      ├─ ERL → 400100 (Export Sales) ← 다른 계정
      ├─ FRL → 404100 (Export Freight)
      └─ MWS → 172200 (Export VAT) ← 세금율 다름
```

## 주의사항

### 1. VKOA 매트릭스 불완전 → 거래 전기 실패
**문제**: VKOA에서 Account Key ERL은 설정했으나 MWS(세금) 누락
```
결과: VA01 판매오더 생성 → Billing → 세금 전기 실패
```
**해결**: VKOA → 모든 Account Key(ERL, ERS, FRL, MWS) 필수 설정

### 2. GL Account 오류 → 잘못된 계정 전기
**문제**: VKOA에서 Account Key ERL의 GL을 301000(Cost)로 잘못 설정
```
결과: 매출이 수익 400000 대신 비용 301000으로 전기
```
**해결**: VKOA 재확인 + FB03로 전기 검증

### 3. 판매조직별 계정 미분리 → 보고 정확도 감소
**문제**: 판매조직 1000과 2000 모두 Account Key ERL → 400000(동일)
```
결과: 국내/수출 매출을 분리하여 분석 불가
```
**해결**: VKOA → 판매조직별로 다른 GL 계정 할당

### 4. 환율 변동 시 다중 통화 미지원
**문제**: 회사코드가 EUR 기반인데 USD 판매 (VKOA에 USD 별도 계정 미설정)
```
결과: 환차 손익 처리 불명확
```
**해결**: OB22로 다중통화 설정 + 환율 차이 계정 (VKOA에 추가)

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| VKOA 구조 | Company + Sales Org | Company + Sales Org + (Valuation Area) |
| Account Key | 고정 (ERL, ERS, FRL, MWS) | 동일 (확장 가능) |
| 자동전기 | Billing 후 | GR(예정) 후 자동화 |
| Revenue Recognition | 수동(Billing 기준) | RAR(Revenue Accrual) 자동 (향후) |
| 다중통화 | 별도 처리 | 자동 환전 (S/4 2020+) |

## 참고 자료

- **SAP 공식**: IMG → SD → Account Assignment & Determination
- **T-codes**: VKOA(계정), V/06(조건유형), VF01(Billing), FB03(검증)
- **심화**: OVA9(판매 규칙), RAR(Revenue Accrual Recognition)
