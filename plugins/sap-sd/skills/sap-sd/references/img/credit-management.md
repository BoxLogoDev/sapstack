# 여신관리(Credit Management) IMG 구성 가이드

## SPRO 경로
**ECC**: `SPRO → Sales and Distribution → Master Data → Credit Control Area`
**S/4**: `SPRO → Financial Management → Credit Management`

T-codes: **FD32** (ECC Classic), **UKM** (S/4 Modern), **OB01** (Risk Category), **OVA8** (Credit Check)

## 필수 선행 구성
- [ ] 회사코드 및 통화 설정 (OB22)
- [ ] 고객 마스터 (XD01, XD02)
- [ ] 판매조직 (OV01)

## 핵심 개념: ECC vs S/4 여신관리

```
ECC (Classic Credit Management)
├─ T-code: FD32 (독립 모듈)
├─ 고객별 credit limit 수동 관리
├─ Credit Status 모니터링
└─ 자동 블로킹 규칙

S/4HANA (Modern Credit Management)
├─ T-code: UKM (Business Partner 통합)
├─ 신용도 점수 (Credit Score)
├─ 리스크 평가 자동화
├─ Exception Management
└─ 머신러닝 기반 예측 (향후)
```

## 구성 단계

### 1단계: Risk Categories 정의 (OB01)

T-code: **OB01** (Define Risk Category)

Risk Category는 고객의 신용도를 분류하는 카테고리:

```
화면:
┌────────────────────────────────┐
│ Risk Category Maintenance       │
├────────────────────────────────┤
│ Risk Category 01: "Low Risk"    │
│ Description: "우량 고객"        │
│ ├─ Credit Rating: AAA           │
│ ├─ Default Probability: 0.5%    │
│ └─ Credit Limit: 500,000 EUR    │
│                                │
│ Risk Category 02: "Medium Risk" │
│ Description: "일반 고객"        │
│ ├─ Credit Rating: BBB           │
│ ├─ Default Probability: 5%      │
│ └─ Credit Limit: 100,000 EUR    │
│                                │
│ Risk Category 03: "High Risk"   │
│ Description: "관찰 고객"        │
│ ├─ Credit Rating: CCC           │
│ ├─ Default Probability: 20%     │
│ └─ Credit Limit: 20,000 EUR     │
└────────────────────────────────┘
```

#### OB01 구체적 설정

**Risk Category 01 (우량)**

```
Code: 01
├─ Description: "Low Risk / AAA Rating"
├─ Credit Rating: AAA (Standard & Poor's)
├─ Probability of Default: 0.5% (연간)
├─ Credit Limit: 500,000 EUR
├─ Credit Validity: 12 Months
├─ Dunning Level: Level 0 (우선순위 낮음)
│  └─ 연체 60일까지 경고만
├─ Automatic Blocking: ☐ (미적용)
└─ Special Privileges:
   ├─ Early Payment Discount: ☑ 2%
   └─ Extended Payment Terms: 60 days
```

**Risk Category 02 (보통)**

```
Code: 02
├─ Description: "Medium Risk / BBB Rating"
├─ Credit Rating: BBB
├─ Probability of Default: 5%
├─ Credit Limit: 100,000 EUR
├─ Credit Validity: 6 Months (재검토)
├─ Dunning Level: Level 1
│  └─ 연체 30일 → 경고서 1호
├─ Automatic Blocking: ☑ (Credit Limit 초과 시)
└─ Standard Terms:
   ├─ Payment Terms: Net 30
   └─ Discount: 1% (10일 이내)
```

**Risk Category 03 (위험)**

```
Code: 03
├─ Description: "High Risk / CCC Rating"
├─ Credit Rating: CCC
├─ Probability of Default: 20%
├─ Credit Limit: 20,000 EUR
├─ Credit Validity: 3 Months (빈번한 검토)
├─ Dunning Level: Level 2
│  └─ 연체 15일 → 경고서 2호 + 이자
├─ Automatic Blocking: ☑ (즉시)
│  └─ Block Type: Hard Block (수동 해제 필요)
└─ Restrictions:
   ├─ Payment Terms: Net 14 (짧음)
   ├─ Discount: None
   └─ Order Limit: 20,000 EUR/month
```

### 2단계: Credit Control Area 정의 (FD32 - ECC)

T-code: **FD32** (Define Credit Control Area)

Credit Control Area는 여신관리 범위를 정의:

```
화면:
┌────────────────────────────────┐
│ Credit Control Area Maintenance│
├────────────────────────────────┤
│ Credit Control Area: 1000      │
│ Description: "Germany Operations"
│ ├─ Company Code(s): 1000       │
│ ├─ Currency: EUR               │
│ ├─ Credit Limit Currency: EUR  │
│ ├─ Auto-Debit: (계약금)        │
│ ├─ Credit Limit Group:         │
│ │  └─ Central (회사별 통합)    │
│ ├─ Intercompany Limits:        │
│ │  └─ Included/Excluded        │
│ ├─ Exposure Calculation:       │
│ │  └─ Invoiced + Unconfirmed   │
│ │     (청구액 + 미배송액)      │
│ └─ Statistical Accounts:       │
│    └─ (분석용 GL 계정)        │
└────────────────────────────────┘
```

#### FD32 설정 상세

**Credit Control Area 1000:**

```
Parameter:
├─ Identification:
│  ├─ Credit Control Area: 1000
│  └─ Description: "German Finance Area"
│
├─ Scope:
│  └─ Company Code: 1000 (또는 1000, 1001, 1002)
│
├─ Credit Limit:
│  ├─ Currency: EUR
│  ├─ Credit Limit Group:
│  │  ├─ Individual (고객별)
│  │  ├─ Group (고객 그룹별)
│  │  └─ Central (회사/부서 통합)
│  └─ Recommendation: "Central" (권장)
│
├─ Exposure Calculation:
│  ├─ Credit Line Total (노출액):
│  │  ├─ Open Orders (미배송): 포함
│  │  ├─ Invoices (청구): 포함
│  │  ├─ Credit Memos (환불): 차감
│  │  └─ Payments (입금): 차감
│  └─ Formula: Total Exposure = Orders + AR - CM - Payments
│
├─ Dunning Area:
│  └─ Assign Dunning Area (collection): DUNDE1
│
└─ Statistical Accounts:
   └─ Credit Exposure (통계): GL 110000 (AR/Receivables)
```

### 3단계: 고객별 Credit Limit 설정 (XD02)

T-code: **XD02** (Customer Master Maintenance)

고객 마스터에서 직접 Credit Limit 할당:

```
고객: C00001 (Siemens)

Credit Management View:
├─ Credit Control Area: 1000
├─ Credit Limit: 500,000 EUR ← 최대 한도
├─ Risk Category: 01 (Low Risk)
├─ Credit Status:
│  ├─ Exposure Amount: 150,000 EUR (현재 노출)
│  │  ├─ Outstanding Orders: 80,000 EUR
│  │  ├─ Invoices (AR): 60,000 EUR
│  │  ├─ Credit Memos: -5,000 EUR
│  │  └─ Payments Received: -35,000 EUR (최근)
│  │  → Net Exposure: 150,000 EUR (80+60-5)
│  ├─ Available Credit: 350,000 EUR (500-150)
│  └─ Status: "OK" ✓ (한도 내)
├─ Credit Limit Valid From: 2025-01-01
├─ Credit Limit Valid To: 2025-12-31
└─ Promised Delivery: (특정 고객용)
```

### 4단계: Credit Check 활성화 (OVA8)

T-code: **OVA8** (Define Credit Check by Sales Org)

판매오더 생성 시 자동으로 여신검증:

```
화면:
┌────────────────────────────────┐
│ Define Credit Checks            │
├────────────────────────────────┤
│ Sales Organization: 1000       │
│ Distribution Channel: 01        │
│ Division: 00                   │
│                                │
│ Credit Check Option:           │
│ ├─ No Check: ☐                │
│ ├─ Check & Warn: ☑            │
│ │  (한도 초과 시 경고만)      │
│ ├─ Check & Block: ☐           │
│ │  (한도 초과 시 블로킹)      │
│ └─ Both Static & Dynamic: ☑   │
│                                │
│ Control:                       │
│ ├─ Static Limit Check: ☑       │
│ │  (현재 한도 vs 주문금액)    │
│ ├─ Dynamic Check: ☑            │
│ │  (미배송 포함)              │
│ └─ Order Blocking: (Hard/Soft) │
│    ├─ Hard Block: 수동 해제   │
│    └─ Soft Block: 자동 해제   │
└────────────────────────────────┘
```

#### OVA8 상세 설정

**Sales Org 1000 / DC 01 (B2C):**

```
Credit Check: ☑ (활성화)
├─ Check Type: Static + Dynamic
├─ Action:
│  ├─ Warn (경고만): 한도 초과액 < 50,000 EUR
│  └─ Block: 한도 초과액 >= 50,000 EUR
│
├─ Exception Handling:
│  └─ Risk Category 01: Warn만 (우량 고객)
│  └─ Risk Category 02: Warn or Block
│  └─ Risk Category 03: Block (즉시)
│
└─ Automatic Release:
   └─ Risk Category 01:
      ├─ Auto-Release after: 24 hours
│      └─ If Credit Improved
```

### 5단계: 판매오더에서의 신용검증 (VA01)

T-code: **VA01** (Create Sales Order)

```
판매오더 입력:
├─ Customer: C00001 (Siemens, Risk 01)
├─ PO Amount: 200,000 EUR
└─ [Create Item]

자동 Credit Check 실행:
├─ Current Exposure: 150,000 EUR (from XD02)
├─ Order Amount: 200,000 EUR
├─ New Total: 350,000 EUR
├─ Credit Limit: 500,000 EUR
│  └─ Available: 150,000 EUR
│
├─ Result: FAIL (350,000 > 500,000? NO)
│  → 실제: 350,000 < 500,000 ✓
│  → Status: "OK"
│  └─ [Save] → SO #4500001 생성 ✓

만약 Customer C00002 (Risk 03):
├─ Credit Limit: 20,000 EUR
├─ Current Exposure: 18,000 EUR
├─ Order Amount: 5,000 EUR
├─ New Total: 23,000 EUR (초과!)
│
├─ Result: BLOCK
│  └─ Message: "Credit Limit Exceeded"
│  └─ Options:
│     ├─ [Override] (경영진 승인)
│     ├─ [Reduce Amount] (금액 감소)
│     └─ [Cancel] (취소)
```

## S/4HANA Modern Credit Management (UKM)

### T-code: **UKM** (Credit Management)

S/4에서는 고객(Customer) 대신 Business Partner(BP) 단위로 여신관리:

```
화면:
┌────────────────────────────────┐
│ Credit Management (UKM)         │
├────────────────────────────────┤
│ Business Partner: 100001        │
│ (Customer #C00001 → BP #100001)|
│                                │
│ Credit Profile:                │
│ ├─ Credit Score: 750/1000      │
│ │  (머신러닝 기반 자동계산)    │
│ ├─ Risk Rating: BBB+            │
│ ├─ Credit Limit: 500,000 EUR   │
│ ├─ Exposure: 150,000 EUR       │
│ └─ Available Credit: 350,000 EUR│
│                                │
│ Credit Decision:               │
│ ├─ Auto-Approved Orders: 350k  │
│ ├─ Requires Review: 50~100k    │
│ └─ Auto-Blocked: >100k (Single)|
│                                │
│ Monitoring:                    │
│ ├─ Payment History: 95% On-time│
│ ├─ Dunning Level: 0 (Good)     │
│ └─ Last Review: 2026-02-15     │
└────────────────────────────────┘
```

## 구성 검증

### 검증 1: OB01에서 Risk Categories 확인
```
T-code: OB01 → Display Mode
├─ Risk Category 01: "Low Risk" ✓
│  └─ Credit Limit: 500,000 EUR
├─ Risk Category 02: "Medium Risk" ✓
│  └─ Credit Limit: 100,000 EUR
└─ Risk Category 03: "High Risk" ✓
   └─ Credit Limit: 20,000 EUR
```

### 검증 2: FD32에서 Credit Control Area 확인
```
T-code: FD32 → Display Mode
├─ Credit Control Area: 1000 ✓
├─ Company Code: 1000 ✓
├─ Currency: EUR ✓
├─ Credit Limit Group: Central ✓
└─ Dunning Area: DUNDE1 ✓
```

### 검증 3: 고객 신용한도 확인 (XD02)
```
T-code: XD02 → Customer Display
├─ Customer: C00001 (Siemens)
├─ Credit Control Area: 1000 ✓
├─ Credit Limit: 500,000 EUR ✓
├─ Risk Category: 01 ✓
├─ Exposure: 150,000 EUR
└─ Available: 350,000 EUR ✓
```

### 검증 4: OVA8에서 Credit Check 확인
```
T-code: OVA8 → Display Mode
├─ Sales Org: 1000
├─ DC: 01
├─ Check Enabled: Yes ✓
├─ Check Type: Static + Dynamic ✓
├─ Action: Warn/Block (금액별) ✓
└─ All parameters set correctly ✓
```

### 검증 5: 실제 판매오더로 테스트 (VA01)
```
T-code: VA01 (Create SO)
├─ Customer: C00001 (Limit 500k, Exposure 150k)
├─ Order Amount: 200,000 EUR
├─ [Create Item]
│
└─ Auto Credit Check:
   ├─ Current: 150,000 EUR
   ├─ Order: +200,000 EUR
   ├─ New Total: 350,000 EUR
   ├─ Limit: 500,000 EUR
   └─ Result: OK ✓
      └─ [Save] → SO #4500001

Test with Customer C00002 (Limit 20k, Exposure 18k):
├─ Order Amount: 5,000 EUR
├─ New Total: 23,000 EUR (초과)
│
└─ Result: BLOCK
   └─ Message: "Credit Limit Exceeded by 3,000 EUR"
      ├─ [Override] (Manager 승인)
      └─ [Cancel]
```

## 주의사항

### 1. Credit Check 미활성화 → 신용위험 증가
**문제**: OVA8에서 Credit Check 비활성화
```
결과: 신용불량 고객도 무제한 판매 → 외상 급증
```
**해결**: OVA8 → 모든 판매조직에 Credit Check 활성화

### 2. Credit Limit 너무 높게 설정 → 부실채권
**문제**: Risk Category 03(고위험) Customer에 100,000 EUR 한도
```
결과: 납입지연 고객도 과다 외상 → 손실 발생
```
**해결**: OB01 → Risk Category별 현실적 한도 설정

### 3. 노출액(Exposure) 계산 오류 → 잘못된 한도 판단
**문제**: FD32에서 미배송 오더를 노출액에서 제외
```
결과: 미배송 오더가 신용한도에 반영 안 됨 → 초과신청 가능
```
**해결**: FD32 → Exposure = Orders + AR (모두 포함)

### 4. 자동블로킹 과도 → 판매 기회 손실
**문제**: OVA8에서 모든 한도 초과 시 "Hard Block" (수동 해제)
```
결과: 긴급 주문도 블로킹 → 고객 불만
```
**해결**: OVA8 → Soft Block(자동 해제) 또는 Manager 빠른 승인 프로세스

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA |
|------|-----|---------|
| T-code | FD32 (독립) | UKM (BP 통합) |
| 신용도 평가 | 수동 Risk Category | 자동 Credit Score |
| 고객 단위 | Customer Master (XD02) | Business Partner (BP) |
| 노출액 계산 | 정적 | 동적 (실시간) |
| 자동화 | 규칙 기반 | ML 기반 (향후) |
| Exception 관리 | 수동 블로킹/해제 | 자동 워크플로우 |

## 참고 자료

- **SAP 공식**: IMG → FI or SD → Credit Management
- **T-codes**: FD32(ECC), UKM(S/4), OB01(Risk), OVA8(Check), XD02(Customer)
- **심화**: F110(Collection), SOOD(Order Approval Workflow)
