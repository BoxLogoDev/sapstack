# 허용한도(Tolerance Limits) IMG 구성 가이드

## SPRO 경로
`SPRO → Materials Management → Purchasing → Purchase Order Processing → Define Tolerances for Purchase Orders`

Primary T-codes: **OMR6** (가격 허용한도), **OMRM** (수량 허용한도), **OMS2** (조직 할당)

## 필수 선행 구성
- [ ] 회사코드 및 구매조직 정의 (OM00)
- [ ] 공급자 마스터 (XK01, XK02) — 공급자별 기본 허용그룹 할당
- [ ] Invoice Verification (MIRO) 기본 설정

## 핵심 개념: 3-Way Match vs 2-Way Match

```
기존 2-Way Match (과거):
PO 금액 vs 송장금액 (수량 무시)
  └─ 오류율: 높음 (기입 오류, 조정 불명확)

권장 3-Way Match (현대):
PO 금액 vs GR(Goods Receipt) vs 송장금액
  ├─ PO: 주문량/금액 기준
  ├─ GR(MIGO): 실제 입고 확정
  └─ IV(MIRO): 송장 연결
```

## 구성 단계

### 1단계: 가격 허용한도 정의 (OMR6)

T-code: **OMR6** (Define Tolerances — Price)

```
Screen Structure:
┌──────────────────────────────────┐
│ Company Code: 1000               │
│ Tolerance Key: (자동 생성)       │
├──────────────────────────────────┤
│ Tolerance Limit (가격%)          │
│ ├─ Lower Limit: -2.00 %          │
│ ├─ Upper Limit: +3.00 %          │
│ └─ Fixed Amount: ±100 USD        │
│                                  │
│ Variance Reason Code:            │
│ └─ Required: ☐ (필수 입력)       │
│                                  │
│ Action (초과시 조치):            │
│ └─ Block / Warn / Accept         │
└──────────────────────────────────┘
```

#### OMR6 세부 설정

**기본 항목 설정:**

```
Row 1: Standard Tolerance
├─ Company Code: 1000
├─ Tolerance Key: (System assigns: 001, 002, ...)
├─ Lower Limit: -2.00 %
├─ Upper Limit: +3.00 %
├─ Fixed Amount: ±100 USD
├─ Partial Invoice: ☑ (부분송장 허용)
└─ Variance Reason Required: ☑ (이유코드 필수)

Row 2: Tight Tolerance (높은 정확도 필요 자재)
├─ Tolerance Key: 002
├─ Lower Limit: -0.50 %
├─ Upper Limit: +0.50 %
├─ Fixed Amount: ±20 USD
├─ Partial Invoice: ☑
└─ Variance Reason Required: ☑

Row 3: Loose Tolerance (일괄 구매/수입)
├─ Tolerance Key: 003
├─ Lower Limit: -5.00 %
├─ Upper Limit: +10.00 %
├─ Fixed Amount: ±500 USD
├─ Partial Invoice: ☑
└─ Variance Reason Required: ☐
```

**Action Control (超過時 처리):**

```
MIRO에서 가격 초과 시:
├─ Block: MIRO 진행 불가 → 승인 대기
├─ Warn: 경고만 표시 → MIRO 계속 가능
└─ Accept: 자동 수락 (권장 안 함)
```

### 2단계: 수량 허용한도 정의 (OMRM)

T-code: **OMRM** (Define Tolerances — Quantity)

```
Screen Structure:
┌──────────────────────────────────┐
│ Company Code: 1000               │
│ Tolerance Key: (자동 생성)       │
├──────────────────────────────────┤
│ Quantity Tolerance (수량)        │
│ ├─ Lower Limit: -5.00 %          │
│ ├─ Upper Limit: +5.00 %          │
│ └─ Fixed Qty: ±2 EA              │
│                                  │
│ Overdelivery:                    │
│ ├─ Unlimited: ☐                 │
│ ├─ Limited: ☑ (상한 %)          │
│ └─ Not Allowed: ☐               │
│                                  │
│ Short Delivery:                  │
│ ├─ Permitted: ☑                 │
│ └─ Percentage: -10 %             │
└──────────────────────────────────┘
```

#### OMRM 구체적 예시

**Row 1: Standard Qty Tolerance**

```
Tolerance Key: 001
├─ Lower Limit: -5.00 %  (부족배송)
├─ Upper Limit: +5.00 %  (과다배송)
├─ Fixed Qty: ±2 EA
├─ Overdelivery: Limited to +5%
├─ Short Delivery: Permitted (최대 5% 차단가능)
└─ Reason Code Required: ☑
```

**Row 2: Production Materials (엄격한 수량 관리)**

```
Tolerance Key: 002
├─ Lower Limit: -2.00 %
├─ Upper Limit: +2.00 %
├─ Fixed Qty: ±0.5 EA
├─ Overdelivery: Not Allowed
├─ Short Delivery: Not Permitted
└─ Reason Code Required: ☑ (필수)
```

**Row 3: Bulk Materials (관대한 수량 관리)**

```
Tolerance Key: 003
├─ Lower Limit: -10.00 %
├─ Upper Limit: +15.00 %
├─ Fixed Qty: ±5 EA
├─ Overdelivery: Unlimited
├─ Short Delivery: Permitted
└─ Reason Code Required: ☐ (선택)
```

### 3단계: 조직별 허용그룹 할당 (OMS2)

T-code: **OMS2** (Assign Tolerance Keys to Organizations)

```
화면 구조:
┌──────────────────────────────────┐
│ Organization Assignment          │
├──────────────────────────────────┤
│ Company Code: 1000               │
│ Purchasing Organization: 1000    │
│ Plant: 1000                      │
│ Supplier (공급자): (Optional)    │
│                                  │
│ Tolerance Keys:                  │
│ ├─ Price Tolerance (OMR6): 001   │
│ ├─ Qty Tolerance (OMRM): 001     │
│ └─ Invoice Tolerance: 002        │
└──────────────────────────────────┘
```

#### OMS2 할당 예시

**결정 로직 (Top-to-Bottom Priority):**

```
Level 1: 공급자별 (가장 구체적)
└─ Purchasing Org: 1000 + Supplier: 100001 (Samsung)
   ├─ Price Tolerance: 002 (Tight)
   ├─ Qty Tolerance: 002 (Strict)
   └─ 이유: 반도체 납기 엄격

Level 2: 구매조직별 (중간)
└─ Purchasing Org: 1000 (기본)
   ├─ Price Tolerance: 001 (Standard)
   ├─ Qty Tolerance: 001 (Standard)
   └─ 이유: 대부분의 공급자

Level 3: 회사코드별 (기본값)
└─ Company Code: 1000
   ├─ Price Tolerance: 001
   ├─ Qty Tolerance: 001
   └─ (OMS2 미설정 시 자동 적용)
```

### 4단계: 이유코드 정의 (OMRC)

T-code: **OMRC** (Define Variance Reason Codes)

```
화면:
Variance Reason Code: (2자리)
├─ 01: Price Correction by Vendor
├─ 02: Debit Note for Damaged Goods
├─ 03: Invoice Error (부분배송)
├─ 04: Currency Variation
├─ 05: Agreed Discount Not Applied
└─ 06: (Custom — 사용자 정의)
```

## 구성 검증

### 검증 1: OMR6 설정 확인
```
T-code: OMR6 → Display Mode
└─ Company Code 1000
   ├─ Tolerance Key 001:
   │  ├─ Lower Limit: -2.00% ✓
   │  ├─ Upper Limit: +3.00% ✓
   │  └─ Fixed Amount: ±100 USD ✓
   └─ Tolerance Key 002:
      ├─ Lower Limit: -0.50% ✓
      └─ Upper Limit: +0.50% ✓
```

### 검증 2: OMRM 설정 확인
```
T-code: OMRM → Display Mode
└─ Company Code 1000
   ├─ Tolerance Key 001:
   │  ├─ Lower Limit: -5% ✓
   │  ├─ Upper Limit: +5% ✓
   │  └─ Fixed Qty: ±2 EA ✓
   └─ Tolerance Key 002:
      ├─ Lower Limit: -2% ✓
      └─ Upper Limit: +2% ✓
```

### 검증 3: OMS2 할당 확인
```
T-code: OMS2 → Display Mode
└─ Purchasing Org 1000:
   ├─ Price Tolerance Key: 001 ✓
   ├─ Qty Tolerance Key: 001 ✓
   └─ (Supplier 100001은 002로 Override)
```

### 검증 4: 실제 MIRO 거래로 엔드-투-엔드 테스트

**시나리오: 가격 초과 테스트**

```
1. 준비:
   ├─ PO 생성: TEST-PO-001
   ├─ Material: TEST-RM-001
   ├─ Qty: 100 EA
   └─ Unit Price: 100 USD → Total: 10,000 USD

2. Goods Receipt (MIGO):
   ├─ Movement Type: 101
   ├─ Qty: 100 EA ✓

3. Invoice Verification (MIRO):
   ├─ PO: TEST-PO-001
   ├─ Invoice Amount: 10,350 USD
   │  └─ 차이: 350 USD (3.5% 초과)
   │
   └─ MIRO Response:
      ├─ OMR6 Tolerance: -2% ~ +3%
      ├─ 실제 차이: +3.5% (초과)
      └─ Action: BLOCK or WARN
         ├─ BLOCK인 경우: 이유코드 입력 후 재시도
         └─ WARN인 경우: 경고만 → MIRO 계속 가능
```

**시나리오: 수량 부족 테스트**

```
1. PO: 100 EA @ 100 USD = 10,000 USD

2. GR (MIGO): 95 EA만 입고
   └─ 부족: 5 EA (5% 차단)

3. MIRO: 100 EA 송장
   └─ 불일치: GR 95 vs IV 100
      ├─ OMRM 설정: -5% ~+5% 허용
      ├─ 실제 차이: -5% (경계선)
      └─ Action: WARN or ACCEPT
```

## MIRO 자동화 & 3-Way Match 프로세스

### MIRO 거래 흐름 (Automatic GR/IR)

T-code: **MIRO** (Invoice Verification)

```
화면:
├─ Purchasing Document: TEST-PO-001 (입력)
│  └─ 자동 조회: PO + GR 내역 표시
│
├─ Invoice Details:
│  ├─ Invoice Date: (송장 날짜)
│  ├─ Invoice Amount: 10,350 USD
│  └─ Line Items:
│     ├─ Item 1: Material TEST-RM-001, Qty 100 EA, Price 103.5 USD
│     └─ Difference Check:
│        ├─ PO vs GR vs IV: 3-Way Match 자동 검증
│        ├─ OMR6 Tolerance 초과 검사
│        └─ OMRM Tolerance 초과 검사
│
├─ Tolerance Violation Detection:
│  └─ Price: +3.5% (초과 +3%)
│     ├─ Status: "Error"
│     ├─ Variance Reason Code: 필수 입력
│     └─ Approval workflow:
│        ├─ Finance Manager 승인 필요
│        └─ (또는 OMR6 조정)
│
└─ [Post] → 자동 G/L Entry
   ├─ 승인 후: 차변 GBB, 대변 Bank 또는 AP
   └─ 거절 후: 송장 반려 (Reject Invoice)
```

## 주의사항

### 1. 허용한도 설정 과도 → 오류 송장 통과
**문제**: OMR6에서 상한을 +50%로 설정
```
결과: 송장금액이 PO의 50% 초과해도 자동 수락 → 손실 발생
```
**해결**: OMR6 → 상한 +3~5%로 제한, 초과 시 MIRO에서 이유코드 강제

### 2. 이유코드 미입력 → MIRO 중단
**문제**: OMRM에서 "Reason Code Required" 체크 → 초과 시 이유 없음
```
결과: MIRO [Post] 불가 → 송장 처리 지연
```
**해결**: 이유코드 사전 정의 (OMRC) + MIRO에서 필수 입력

### 3. 공급자별 허용그룹 미할당 → 기본값만 적용
**문제**: OMS2에서 특정 공급자(Samsung)에 Tight Tolerance 할당 안 함
```
결과: Samsung 송장도 Standard Tolerance로 검증 → 품질 보증 부족
```
**해결**: OMS2 → Purchasing Org + Supplier 조합으로 Tolerance 할당

### 4. GR/IR 불일치 → MIRO 블로킹
**문제**: GR 50 EA 입고, IV 송장 100 EA 청구
```
결과: OMRM 수량 차이 초과 → MIRO 진행 불가
```
**해결**: PO 분할 또는 MIGO에서 전량 입고 확인 후 MIRO 진행

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| OMR6 (Price) | 회사코드 기반 | 회사코드 + Valuation Area |
| OMRM (Qty) | 회사코드 기반 | 회사코드 + Valuation Area |
| OMS2 할당 | Supplier 레벨 | Supplier + Material + Date Range |
| GR/IR Clearing | MIRO 수동 | 자동 (예정) |
| 승인 워크플로우 | 수동 + 규칙 | Exception Management (자동) |

## 참고 자료

- **SAP 공식**: IMG → MM → Purchasing → PO Processing → Tolerances
- **T-codes**: OMR6(가격), OMRM(수량), OMS2(할당), MIRO(검증), OMRC(이유코드)
- **심화**: SOOD(Purchasing Document Approval), NM06(GR Blocking Rules)
