# 회사간 거래(IC: Intercompany) 처리 가이드

## 개요

다중 회사코드 환경에서 회사 간 거래(Intercompany Transaction)는 피할 수 없다. 상품 판매, 서비스 제공, 자금 이동, 비용 배부 등 모든 거래가 IC 거래가 될 수 있으며, 연결 결산 시 모두 소거되어야 한다.

**sapstack의 역할**: IC 거래의 생성부터 소거까지 추적하고, 미소거 건을 식별하며, 이전가격(Transfer Pricing) 준수 여부를 검증한다.

---

## 1. IC 거래 유형

### 1.1 상품 매매 (Goods Sales)

**구조**:

```
Company Code 1000 (한국)
  └─ Plant 1100 (서울)
      └─ Material: ABC-001
      
⬇️ (판매)

Company Code 1100 (일본)
  └─ Plant 2100 (도쿄)
      └─ 입고

Accounting:
  CC 1000: Revenue ↑ (이전가격 기준)
  CC 1100: COGS ↑ (이전가격 기준)
  Elimination (연결): 상계 → Group 외부 매출/원가만 남김
```

**처리**:

| 단계 | T-code | 기록 |
|------|--------|------|
| 수주 | VA01 | Sales Order (SO 번호) |
| 배송 | MB1B | Outbound Delivery |
| 청구서 | VF04 | 매출 인식 (매출 계정 ↑) |
| 입고 | MB1C | Stock ↑, IC Payable ↑ |
| 결제 | F110 | AP ↓, Bank ↓ |

**sapstack 추적**:

```
Evidence Loop:
1. VA01 → "SO-000100: CC 1000 → CC 1100, Qty 1000, Price 10,000"
2. VF04 → "Invoice-000100: Billed, Amount 10,000,000 KRW"
3. FBL3N (CC 1000) → "Customer IC-CC1100: AR 10,000,000 (미수금)"
4. FBL3N (CC 1100) → "Vendor IC-CC1000: AP 10,000,000 (미지급금)"
5. FB09 (연결 결산) → "GL 190000 (Due-to): 상계 확인?"

문제 탐지:
- "IC 청구서는 있는데, 일본 회사의 입고 기록 미흡"
- "미수금/미지급금 대사 5일 지연"
```

---

### 1.2 서비스 제공 (Service Delivery)

**예시**: 본사 총무팀이 자회사에 교육/컨설팅 제공

```
Company Code 1000 (한국)
  └─ Cost Center: 0100 (총무팀)
      └─ Service: "HR Training"
      
⬇️ (서비스 제공)

Company Code 1100 (일본) 직원 10명
  └─ 2주 교육 프로그램
      └─ Cost: 500만 원 × 10 = 5,000만 원

Accounting:
  CC 1000: Service Revenue 50,000,000
  CC 1100: HR Expense 50,000,000 (비용 배부)
  Elimination: Gross-up (순 비용 = 0)
```

**처리**:

```
Step 1: Billing (CC 1000에서 발행)
  T-code: FB50 (Manual Posting)
  └─ DR 50,000,000 | GL 150100 (IC Receivable) | CC 1100
  └─ CR 50,000,000 | GL 600100 (Service Revenue) | CC 1000

Step 2: Cost Center Allocation (CC 1100에서 수령)
  T-code: KB11N (Cost Element)
  └─ DR 50,000,000 | GL 400200 (HR Expense) | CC 1100
  └─ CR 50,000,000 | GL 150100 (IC Payable) | CC 1000
  (자동 생성 또는 수동)

Step 3: Payment (CC 1100에서 송금)
  T-code: F110 (Payment)
  └─ CC 1100 Bank → CC 1000 Bank: 50,000,000
  
Step 4: Elimination (연결 결산)
  T-code: OBYA (IC Clearing)
  └─ GL 150100: +50M (1000) - 50M (1100) = 0
```

---

### 1.3 자금 이동 (Intercompany Loan)

**구조**:

```
Company Code 1000 (한국): 잉여 현금 1,000억
Company Code 1100 (일본): 자금 부족 (운영자금 필요)

⬇️ (대여)

Loan Agreement:
  Amount: 500억 원
  Duration: 3년
  Interest Rate: 3% p.a. (연 15억 원)
```

**회계 처리**:

| 시기 | 항목 | CC 1000 | CC 1100 | GL 계정 |
|------|------|---------|---------|---------|
| **Disbursement** | Loan 자금 송금 | Bank ↓ 500M | Bank ↑ 500M | IC Loan Receivable / IC Loan Payable |
| **월 이자** | Interest 계산 | Bank ↑ 1.25M | Bank ↓ 1.25M | Interest Income / Interest Expense |
| **연말 평가** | Exchange 조정 | 환율 변동분 | 환율 변동분 | Forex Gain/Loss |
| **상환(1년 후)** | Principal 회수 | Bank ↑ 500M | Bank ↓ 500M | IC Loan Receivable / IC Loan Payable |

**설정 (T-code: FI12)**:

```
Intercompany Account Configuration:
├─ Due-to Account (CC 1000): GL 190000
├─ Due-from Account (CC 1100): GL 190100
├─ Interest GL Account: GL 830000 (Interest Income)
├─ Tolerance: ±100,000 (미소거 허용액)
└─ Auto Clearing: [X] (자동 소거 활성)
```

---

### 1.4 비용 배부 (Cost Allocation)

**예시**: 본사 관리비를 사업부별 배부

```
Company Code 1000 (한국)
  └─ Total Management Cost: 1,000,000,000 KRW
      ├─ IT Operations: 300M
      ├─ Finance & Audit: 400M
      ├─ Legal & HR: 200M
      └─ Facilities: 100M

배부 대상:
├─ CC 1000 (한국 제조): 40% → 400M
├─ CC 1100 (일본 판매): 30% → 300M
├─ CC 1200 (미국 물류): 20% → 200M
└─ CC 1300 (인도 IT): 10% → 100M
```

**배부 과정**:

```
Step 1: Cost Center Allocation (T-code: KOAK)
  Cost Center 0100 (총무팀)
  └─ Total Costs: 1,000M
      ├─ Cost Element 4000 (급여): 500M
      ├─ Cost Element 4100 (복리): 300M
      └─ Cost Element 4200 (시설료): 200M

Step 2: Periodic Reposting (T-code: KB31)
  Allocation Rule
  ├─ Sender Cost Center: 0100
  ├─ Receiver Cost Centers:
  │   ├─ 1000-0110 (제조): 40%
  │   ├─ 1100-0210 (판매): 30%
  │   ├─ 1200-0310 (물류): 20%
  │   └─ 1300-0410 (IT): 10%
  ├─ Basis: Sales (by CC)
  └─ Execution: Monthly (자동)

Step 3: GL Auto-Posting (T-code: FB60)
  CC 1000 (공급자):
    └─ DR 400M   | GL 611000 (비용 배부)
    └─ CR 1000M  | GL 400100 (급여)
    └─ CR 300M   | GL 400100 (복리)
    └─ CR 200M   | GL 400100 (시설료)
    
  CC 1100 (수령):
    └─ DR 300M   | GL 611100 (비용 배부)
    └─ CR 300M   | GL 150200 (IC Due-to CC 1000)

  CC 1200, CC 1300 (마찬가지)
```

**sapstack 검증**:

```
Evidence Loop:
1. KOAK Execution Log → "KB31 배부 실행 여부 확인"
2. FB09 → "CC 1000 GL 611000 vs CC 1100 611100 합계일치?"
3. FBL3N → "IC 미결제 건: CC 1100→1000 미수금 300M 확인"

문제 탐지:
- "KB31이 특정 월에만 미실행 → 배부 누락"
- "배부 비율이 실제 매출과 불일치 (예: 실제 39.8% vs 설정 40%)"
- "미수금 회수 지연: 3개월 이상 미정산"
```

---

## 2. FI: IC 거래 자동 전기

### OBYA 설정

**T-code: OBYA** (Define Document Types for IC Transactions)

```
IC 거래용 Document Type 정의:

Document Type: "AB" (Automatic Intercompany Posting)
├─ Description: "자동 회사간 전기"
├─ Posting: [X]
├─ Batch Input Allowed: [X]
├─ Clearing Accounts:
│   ├─ Due-to GL Account: 190000
│   ├─ Due-from GL Account: 190100
│   ├─ Tolerance Level: 100,000 KRW (±)
│   └─ Auto Clearing: [X]
│
├─ Number Range:
│   ├─ From: 7000000000
│   └─ To: 7999999999
│
└─ Posting Date Logic:
    ├─ Document Date = Posting Date (기본)
    └─ Period Validation: Current Open Period
```

### 자동 전기 메커니즘

**프로세스**:

```
Step 1: 송신 회사 (CC 1000)에서 거래 입력

  User: Finance Analyst
  T-code: FB50 (Manual Entry)
  
  Document Type: AB (IC 자동 전기)
  Posting Date: 2024-04-10
  
  Line 1: DR 500,000 | GL 150100 (IC Receivable)    | CC 1100 (거래 상대)
          (설명: "IC Sale Materials ABC-001")
  
  Line 2: CR 500,000 | GL 600100 (Sales Revenue)     | CC 1000 (우리)
          (설명: "Transfer Pricing 가격")

Step 2: SAP System (자동)

  ① Document Type AB 인식
  ② Due-to/Due-from GL Accounts 검색 (OBYA)
  ③ Receiving Company Code 감지 (Line 1 CC 1100)
  ④ 자동 역분기 전표 생성:
  
     CC 1100 (자동 생성):
     ├─ DR 500,000 | GL 150200 (IC Payable)     | CC 1000 (거래 상대)
     └─ CR 500,000 | GL 400100 (Materials)      | CC 1100 (우리)
     
     Status: "Posted" ✓
     
  ⑤ Log 기록 (FI05)
     - Source Document: FB50-0000000001
     - Auto-Generated: AB-7000000001
     - Timestamp: 2024-04-10 14:35:21

Step 3: GL 최종 상태

  CC 1000 입장:
    GL 150100 (IC Receivable): +500,000
    GL 600100 (Sales): +500,000
    GL 190000 (Due-to): 0 (대체 계정, 미사용)
  
  CC 1100 입장:
    GL 150200 (IC Payable): -500,000
    GL 400100 (Materials): +500,000
    GL 190100 (Due-from): 0 (대체 계정, 미사용)
  
  → 양쪽 합산: Balance ✓

Step 4: 연결 결산 (Consolidation)

  T-code: OBYA → Cross-Company Clearing 자동 실행
  
  Effect:
    Group 입장:
    ├─ Sales (CC 1000): -500,000 (소거)
    ├─ Materials (CC 1100): -500,000 (소거)
    └─ Group External Sales/COGS만 남음
```

---

## 3. SD-MM: IC 판매 프로세스

### 3-Way Delivery 구조

**시나리오**: CC 1000의 주문회사가 CC 1100 판매회사로부터 구매, CC 1200 플랜트에서 배송

```
Step 1: 주문 생성 (CC 1000, Sales Org 1000_SO)
  T-code: VA01
  ├─ Order Type: IC (Intercompany Order)
  ├─ Sold-to Party: CC 1000
  ├─ Ship-to Party: CC 1100
  ├─ Material: ABC-001
  ├─ Qty: 1,000 EA
  ├─ Price: 10,000 KRW (IC Price)
  └─ Delivery Plant: 1200 (CC 1200 물류 담당)

Step 2: IC 판매 주문 자동 생성 (CC 1100, Sales Org 1100_SO)
  T-code: (시스템 자동)
  ├─ 역방향 PO 생성: "구매 회사 CC 1000에서 판매"
  ├─ 공급사: CC 1100_SO
  ├─ 예상 배송: Plant 1200
  └─ Link: 원본 주문과 자동 연결

Step 3: 배송 준비 (Plant 1200)
  T-code: VL10B (Outbound Delivery)
  ├─ Delivery Material: ABC-001
  ├─ From: Plant 1200
  ├─ To: CC 1100 (최종 고객)
  ├─ Route: Plant 1200 → CC 1100
  └─ Expected Delivery: 2024-04-20

Step 4: 배송 실행
  T-code: MB1B (Goods Issue)
  ├─ Plant 1200 재고: -1,000 EA
  ├─ GL Posted (Plant 1200):
  │   └─ DR 10,000,000 | GL 150100 (IC Receivable from 1100)
  │   └─ CR 10,000,000 | GL 600000 (COGS)

Step 5: 입고 (Receiving)
  T-code: MB1C (Goods Receipt)
  ├─ Receiving Plant: CC 1100 Plant 2100
  ├─ Stock Increase: +1,000 EA
  ├─ GL Posted (CC 1100):
  │   └─ DR 10,000,000 | GL 101100 (Inventory)
  │   └─ CR 10,000,000 | GL 150200 (IC Payable to CC 1200)

Step 6: 청구서 수령 (Invoicing)
  T-code: MIRO (Vendor Invoice Entry)
  ├─ Vendor: CC 1200
  ├─ Invoice Amount: 10,000,000
  ├─ Reference: Delivery Note
  ├─ GL Posted (CC 1100):
  │   └─ Update GL 150200 (IC Payable): -10,000,000

Step 7: 결제 (Payment)
  T-code: F110 (Payment Run)
  ├─ Vendor: CC 1200
  ├─ Amount: 10,000,000 KRW
  └─ GL Posted (CC 1100):
      └─ GL 150200 (IC Payable): 0 ✓ (결제 완료)

Step 8: 연결 회계 (Consolidation)
  Group 입장:
  ├─ Revenue (CC 1100 Sales): 10,000,000 (우리)
  ├─ COGS (Plant 1200): -10,000,000 (우리)
  └─ IC Elimination: 0 (자동 상계)
  
  Result: Group External Sale (100%)
```

### sapstack 검증

```
Evidence Loop:
1. VA01 → "Order #000100: VA to CC 1100, Plant 1200"
2. VL10B → "Delivery #000001: from 1200 to 1100"
3. MB1B → "GI #000001: Plant 1200 재고 -1000 EA"
4. MB1C → "GR #000001: Plant 2100 재고 +1000 EA"
5. MIRO → "Invoice #IC-200-001: Vendor CC 1200, Amount 10M"
6. FBL3N (CC 1100) → "IC Payable to 1200: Status Paid ✓"
7. FB09 → "GL 150100 (CR) vs 150200 (DR): 상계 확인"

문제 탐지:
- "Order-Delivery-GR-Invoice 체인 끊김" 
  (예: GI는 있는데 GR 미진행)
- "IC Price vs Standard Cost 차이 이상" 
  (예: IC Price 12,000 vs Standard Cost 8,000 차이 50%)
- "3-way reconciliation 미일치"
  (예: PO 수량 vs GR 수량 vs Invoice 수량 차이)
```

---

## 4. 이전가격(Transfer Pricing) 설정

### 규제 배경

**K-세법 및 국제 기준**:

- **OECD Transfer Pricing Guidelines**: "Arm's Length Principle" (독립 제3자 가격 기준)
- **한국 국세청**: IC 거래에 대해 "근거 서류" 3년 보관 의무 (법인세법 제47조)
- **K-IFRS**: IC 거래의 "공정 가치" 산정 필수

### SAP 설정 (OKU1)

**T-code: OKU1** (IC Transfer Pricing Rules)

```
Material: ABC-001
├─ Transfer Pricing Method:
│   ├─ [X] Standard Cost + Markup
│   │   └─ Standard Cost: 8,000 KRW
│   │   └─ Markup %: 25%
│   │   └─ IC Price = 10,000 KRW
│   │
│   ├─ [ ] Market Price (Benchmark)
│   │   └─ External Market Price: 11,000 KRW
│   │
│   └─ [ ] Full Cost
│       └─ Cost Allocation included
│
├─ Pricing Authority: CFO (결재자)
├─ Valid From: 2024-01-01
├─ Documentation Reference:
│   └─ "Transfer Pricing Study_2024.pdf"
│       (경영진 승인, 감사팀 보존)
│
└─ Validation Rules:
    ├─ IC Price >= Standard Cost (반드시)
    └─ IC Price <= Market Price (권장)
```

### 근거 문서

**필수 기록 (K-SOX 감시)**:

```
Transfer Pricing Documentation:
├─ Year 1 (수립)
│   ├─ Executive Summary
│   │   └─ "ABC-001 IC Price = 10,000 (Standard Cost 25% 마진)"
│   │
│   ├─ Comparables Analysis
│   │   └─ "Market Research: 경쟁사 가격 9,500~11,500, 중앙값 10,500"
│   │   └─ "Our IC Price 10,000은 합리적 범위 내"
│   │
│   ├─ Board Approval
│   │   └─ "2024-01-15 이사회 승인"
│   │
│   └─ Compliance Sign-off
│       └─ "CFO, General Counsel 서명"

├─ Year 2-3 (보관)
│   └─ Annual Confirmation Letter
│       └─ "IC Price 변경 없음 (또는 변경 사유)"

└─ Audit Trail
    └─ SAP Archive (SAP_ARCHIVE)
        └─ 감시관청 요청 시 3년 이내 제출
```

### sapstack 검증

```
Evidence Loop:
1. OKU1 → "Transfer Pricing Rule: ABC-001 = 10,000"
2. VA01 (IC Orders) → "최근 100건 주문 가격"
   ├─ 최고: 10,200 (±2%, OK)
   ├─ 최저: 9,800 (±2%, OK)
   └─ 평균: 10,005 (Rule과 일치 ✓)
3. FBL3N → "IC Revenue vs COGS 합계 검증"
4. Document Archive → "Transfer Pricing Study 최신 여부"

문제 탐지:
- "IC Order Price가 Rule을 초과: 11,500 (10,000 vs 15% 차이)"
- "IC Price가 표준원가보다 낮음: 7,500 vs 8,000 (위반!)"
- "Transfer Pricing 근거 문서 부재"
  (예: 2023년 문서는 있는데 2024년 신규 규칙 미증명)

sapstack Recommendation:
"Transfer Pricing Compliance 위험 3건:
1. ABC-001 IC Price 이상치 (11,500) → 근거 확인 필수
2. DEF-002 IC Price 원가 이하 → 즉시 수정 (법위반)
3. 2024년 TP 문서 미정비 → 감시 시 적발 위험

Action Plan:
- P1: DEF-002 IC Price 8,000 → 9,000으로 수정
- P2: ABC-001 Comparables Analysis 업데이트
- P3: 2024년 Transfer Pricing Study 수립 및 이사회 승인"
```

---

## 5. IC 소거(Elimination)

### 연결 결산에서의 소거

**원리**: IC 거래는 그룹 내 거래이므로, 연결 재무제표에서는 완전히 상계되어야 한다.

```
Individual Company Financials:
  CC 1000 Revenue: 1,000M
  CC 1000 → 1100 IC Sales: 100M
  Net External Revenue: 900M
  
  CC 1100 COGS: 800M
  CC 1100 Materials from CC 1000: 100M
  Net External COGS: 700M

Consolidated (Group):
  Total Revenue: 1,000M - 100M (IC) = 900M (External only)
  Total COGS: 800M - 100M (IC) = 700M
  Group Gross Margin: 200M / 900M = 22.2%
```

### Elimination 프로세스

**T-code: OBYA** (Automatic Elimination)

```
Step 1: IC 거래 식별
  ├─ Sales (CC 1000): +100M
  ├─ COGS (CC 1100): +100M (IC 재료 입고 기준)
  └─ Status: "Posted" (개별 결산 완료)

Step 2: 소거 기준 설정
  T-code: OBYA
  ├─ Clearing Account (Due-to/Due-from):
  │   ├─ Due-to GL Account: 190000
  │   ├─ Due-from GL Account: 190100
  │   └─ Tolerance: 100,000
  │
  ├─ Elimination Method: [Automatic]
  │   └─ Criteria: "GL 190000 ≠ 0인 경우 자동 상계"
  │
  └─ Schedule: Monthly (월말 자동 실행)

Step 3: 자동 소거 실행
  T-code: FB09 (before elimination)
  ├─ GL 600100 (Sales): +100M
  ├─ GL 400100 (COGS): +100M
  ├─ GL 190000 (Due-to): -100M (신규 수동 입력)
  ├─ GL 190100 (Due-from): +100M (신규 수동 입력)
  └─ Status: "Unmatched" (미소거)

  T-code: FB09 (after FI12 elimination)
  ├─ GL 600100 (Sales): 0 (소거됨!)
  ├─ GL 400100 (COGS): 0 (소거됨!)
  ├─ GL 190000 (Due-to): 0 (상계됨)
  ├─ GL 190100 (Due-from): 0 (상계됨)
  └─ Status: "Cleared" ✓

Step 4: Consolidation Report
  T-code: FS10N (Consolidated Balance Sheet)
  ├─ Revenue (External): 900M (= 1,000M - 100M IC)
  ├─ COGS (External): 700M (= 800M - 100M IC)
  └─ Gross Profit: 200M
```

### 수동 소거 (Manual Elimination)

**자동화 실패 시** (예: 양측 금액 불일치):

```
Scenario: IC AR/AP 미대사

CC 1000 (매도자):
  AR Balance (to CC 1100): 100M (완료, 회수됨)

CC 1100 (매수자):
  AP Balance (to CC 1000): 95M (미지급, 5M 원가 차이)

Manual Elimination:
  T-code: FB50 (Manual Posting)
  
  Document Type: Z4 (Manual Elimination)
  Description: "IC Manual Elimination - April 2024"
  
  Line 1: DR 95M   | GL 200100 (AP, CC 1100)
  Line 2: CR 95M   | GL 150100 (AR, CC 1000)
  
  Line 3: DR 5M    | GL 800900 (IC Adjustment) ← 차이 계정
  Line 4: CR 5M    | GL 150100 (AR, CC 1000)
  
  Result:
  ├─ GL 150100 (AR): 100M - 95M - 5M = 0 ✓
  ├─ GL 200100 (AP): 95M - 95M = 0 ✓
  └─ GL 800900 (Adjustment): 5M (조사 대기)
```

**차이 원인 분석**:

```
Investigation:
  5M 차이 원인:
  ├─ Hypothesis 1: 환율 변동 (달러 결제)
  │   └─ Actual: 환율 차이 3M, 설명 가능 (O)
  │
  ├─ Hypothesis 2: 반품 미기록
  │   └─ Actual: 반품 기록 발견 2M (O)
  │
  └─ Hypothesis 3: 오류 또는 기록 누락
      └─ Actual: 차이 0M (설명됨 ✓)

Final Adjustment:
  GL 800900 → Adjustment 결론
  ├─ 설명 가능 부분: 5M 전액 (환율 3M + 반품 2M)
  └─ Status: "Closed" (조사 완료)
```

---

## 6. IC 대사(Reconciliation)

### Monthly IC Reconciliation Process

**주기**: 월 2회 (5일, 20일)

```
Step 1: IC 거래 식별
  T-code: FBL3N (Vendor Ledger)
  
  Query:
  ├─ Vendor Type: "IC Company" (회사 1000-1300)
  ├─ Period: Current Month
  └─ Report:
      ├─ CC 1000 → CC 1100 AR: 500M
      ├─ CC 1000 → CC 1200 AR: 300M
      └─ CC 1100 → CC 1000 AP: ???

Step 2: 양측 금액 비교
  CC 1000 입장 (매도자):
    ├─ Sales: 500M (1100), 300M (1200)
    └─ Total: 800M
  
  CC 1100 입장 (매수자):
    ├─ Purchases: 500M (from 1000)
    └─ Payable: 500M (ok) ✓
  
  CC 1200 입장 (매수자):
    ├─ Purchases: 300M (from 1000)
    └─ Payable: 295M (불일치! -5M) ⚠️

Step 3: 불일치 원인 분석
  T-code: MB51 (Material Movement)
  ├─ GR (Goods Receipt): 300M 기준 300 EA @ 1M/EA
  ├─ Invoice: 295M 기준 295 EA @ 1M/EA ← 수량 차이!
  ├─ Issue: "GR 300 EA vs Invoice 295 EA (환수 5 EA)"
  ├─ Cause: "CC 1200에서 반품 5EA 미기록"
  └─ Action: "Credit Memo CRMEM-000005 생성 필요"

Step 4: 조정 (Correction)
  T-code: MIRO (Return Credit Memo)
  ├─ Original Invoice: IV-000300
  ├─ Return Qty: 5 EA
  ├─ Credit Amount: 5M
  └─ GL Posted:
      ├─ DR 5M | GL 101100 (Inventory)
      └─ CR 5M | GL 200100 (AP)
      
  Result: CC 1200 AP = 300M - 5M = 295M ✓

Step 5: Formal Reconciliation Report (월말)
  T-code: FB12 (Period-End Close)
  
  IC Reconciliation Report:
  ┌──────────────────────────────────────┐
  │ CC Pair   │ Amount │ Status │ Action │
  ├──────────────────────────────────────┤
  │ 1000→1100 │ 500M   │  OK    │   -    │
  │ 1000→1200 │ 300M   │  OK    │   -    │
  │ 1000→1300 │  50M   │  OK    │   -    │
  │ 1100→1000 │  10M   │  Diff  │ Adjust │
  ├──────────────────────────────────────┤
  │ TOTAL     │ 860M   │ 99.9%  │   OK   │
  └──────────────────────────────────────┘
  
  Tolerance Level: ±1% (OK, 860M × 0.01 = 8.6M)
  Status: "Reconciliation Complete" ✓
```

---

## 7. 한국 특수: 세법 요구사항

### 7.1 전자세금계산서 (e-Tax Invoice)

**요구사항**:

```
IC 거래 (CC 1000 → CC 1100):
  ├─ CC 1000: 공급자 (사업자등록번호 1111111111)
  ├─ CC 1100: 실제 거래처가 아님
  │   └─ 문제: 자회사이므로 별도 사업자번호 필수
  │
  ├─ e-Tax Invoice 발급:
  │   ├─ Invoice Number: (예: 20240410-00001)
  │   ├─ Supplier: 1111111111 (CC 1000)
  │   ├─ Recipient: 2222222222 (CC 1100)
  │   ├─ Amount: 500,000 KRW (+ 부가세 50,000)
  │   └─ Issue Date: 2024-04-10
  │
  └─ National Tax Service 요구사항:
      ├─ "성실공시기업" 인증 필수 (IC 거래 투명성)
      ├─ Transfer Pricing 근거 서류
      └─ Annual IC Summary Report (연말 제출)
```

**SAP 연동**:

```
T-code: FB50 (Invoice Entry)
├─ Document Type: AB (IC Automatic)
├─ Tax Code: K0 (부가세 10%)
├─ GL Account: 600100 (Sales Revenue)
├─ Amount: 500,000 KRW
└─ e-Tax Invoice Flag: [X] (자동 발급)

Post-Completion:
  ├─ e-Tax Invoice Status: "Submitted to NTS"
  ├─ NTS Confirmation Number: NTS-2024-000001
  └─ SAP Archive: Document linked
```

### 7.2 원천징수 (Withholding Tax)

**IC 용역료 거래 시**:

```
CC 1000 → CC 1100: "교육 서비스 비용 50M"

한국 세법:
  ├─ 용역료 원천징수세: 3% (법인 간 거래, 특정 용역)
  ├─ 계산서 필수
  └─ 지급 시 원천징수

회계 처리:
  T-code: F-43 (Withholding Invoice)
  ├─ Gross Amount: 50,000,000 KRW
  ├─ Withholding Tax (3%): 1,500,000 KRW
  ├─ Net Payment: 48,500,000 KRW
  │
  └─ GL Posted:
      ├─ DR 50,000,000 | GL 150100 (Service Cost)
      ├─ CR 48,500,000 | GL 120100 (Bank)
      └─ CR 1,500,000  | GL 213000 (Withholding Tax Payable)
      
      (월말) → NTS에 신고 (원천징수 영수증 발급)
```

### 7.3 관계회사 공시 (Disclosure)

**K-IFRS 연결결산 시 필수**:

```
Annual Consolidated Report에 포함:
├─ Note 41: Related Party Transactions
│   ├─ "Company Code 1000과 1100 간 IC Sales"
│   │   └─ Amount: 1,200M (YoY +15%)
│   │   └─ Transfer Price: Cost + 25% Margin
│   │   └─ Board Approval: 2024-01-15
│   │
│   ├─ "Company Code 1000의 Service Cost 배부"
│   │   └─ Amount: 500M
│   │   └─ Basis: Proportional to Revenue
│   │
│   └─ "Company Code 1100 Loan from CC 1000"
│       └─ Principal: 500M
│       └─ Interest Rate: 3% p.a.
│       └─ Maturity: 2027-01-01
│
└─ Related Party Balances (Period-end)
    ├─ AR (to Affiliates): 800M
    ├─ AP (to Parent): 500M
    └─ Loans Payable: 500M
```

---

## 8. IC 거래 모니터링 (sapstack)

### 자동 검증 규칙

```
Rule 1: IC Price vs Transfer Pricing Rule
  Condition: VA01 IC Order Price ≠ OKU1 Rule Price ± 2%
  Action: Warning Alert → Finance Manager
  Example: "Order ABC-001: 10,500 vs Rule 10,000 (5% 초과)"

Rule 2: IC AR/AP Reconciliation
  Condition: |FBL3N AR (CC 1000) - FBL3N AP (CC 1100)| > Tolerance
  Action: Blocking Alert (월 5일, 20일 자동 확인)
  Example: "IC Mismatch CC 1000→1100: 500M AR vs 495M AP (5M 차이)"

Rule 3: IC Aging Analysis
  Condition: IC AR/AP 미결제 > 90 days
  Action: Priority Alert → CFO
  Example: "IC Aged Receivable: 300M (120일 이상), 회수 추진 필요"

Rule 4: Transfer Pricing Documentation
  Condition: OKU1 변경 이력 vs Documentation 최신 여부
  Action: Reminder Alert
  Example: "Transfer Pricing Rule 변경됨 (2024-03-01), 근거 문서 업데이트 대기"

Rule 5: IC Elimination Completeness
  Condition: (Post-elimination GL Balance != 0) for IC Accounts
  Action: Blocking Alert (연결 결산 전)
  Example: "GL 190000 미소거: 10M (Tolerance 100K 초과), 조사 필수"
```

### Sample Report: Weekly IC Status

```
SAP-Integrated IC Monitoring Report
Weekly Report: 2024-04-08 ~ 2024-04-14

1. IC Volume Summary
   ├─ IC Sales (this week): 50M
   ├─ IC Purchases (this week): 50M
   └─ IC Pricing Compliance: 99.8% (1 exception)

2. Aging Analysis
   ├─ 0-30 days: 400M (80%) ✓
   ├─ 31-60 days: 80M (16%) ⚠️ (Action Plan Required)
   └─ 61+ days: 20M (4%) 🔴 (Urgent Collection)

3. Exceptions
   ├─ Exception 1: IC Price Variance
   │   └─ Material: DEF-002, Order #100120
   │   └─ Price: 11,500 (Rule 10,000, +15% exceed)
   │   └─ Owner: Finance Manager
   │   └─ Action: Comparables Review (Due: 2024-04-15)
   │
   └─ Exception 2: IC AR/AP Mismatch
       └─ CC Pair: 1000→1200
       └─ Difference: 5M (0.6%, within tolerance)
       └─ Status: Pending Credit Memo (Expected: 2024-04-10)

4. Transfer Pricing Compliance
   ├─ Documentation Status: Current ✓
   ├─ Rule Changes (YTD): 0
   └─ Next Review Date: 2024-06-30

5. Recommendations
   └─ "IC Aging 31-60일 건 중 80M은 CCR 계약 조건상 정상.
      단, 61+ 일 20M은 근로자 휴직으로 인한 지급 지연.
      예상 회수: 2024-05-01"
```

---

## 결론

IC 거래는 **다중 회사코드 환경의 필수 요소**이지만, **복잡도의 근원**이기도 하다.

**sapstack의 역할**:

1. **IC Price 모니터링** → Transfer Pricing Rule 준수 여부 실시간 확인
2. **AR/AP 대사** → 양측 금액 불일치 조기 탐지
3. **Elimination 검증** → 연결 결산 전 미소거 건 식별
4. **세법 준수** → 전자세금계산서, 원천징수, 공시 요구사항 추적
5. **근거 문서** → Transfer Pricing 최신성 및 감시 대응 준비

대기업 CFO의 관점에서 IC 거래는 "투명성과 규정 준수"의 시험대다. sapstack이 그 시험을 통과하도록 돕는 도구다.
