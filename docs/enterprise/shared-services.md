# SSC(공유서비스센터) 운영 모델

## 개요

Shared Services Center(SSC)는 FI(재무), HR(인사), PO(조직), IT 기능을 중앙 집중식으로 운영하는 조직 모델이다. 대규모 글로벌 기업(포천 500)에서는 필수 구조이며, 한국 대기업도 2010년대부터 도입하고 있다.

**sapstack의 역할**: SSC 환경에서 다중 회사코드 + 다중 사용자 → 단일 거래 프로세스로 인한 오류를 조기 감지하고, SLA 위반 거래를 추적한다.

---

## 1. SSC 개념과 가치

### SSC 구성

```
Global Company (Head Office)
  │
  ├─ Core Finance Center (BPO)
  │   ├─ Accounts Payable (AP)
  │   ├─ Accounts Receivable (AR)
  │   ├─ General Ledger (GL)
  │   └─ Travel & Expense (T&E)
  │
  ├─ HR Service Center
  │   ├─ Payroll Processing
  │   ├─ Employee Self-Service (ESS)
  │   └─ Benefits Administration
  │
  └─ IT Operations Center
      ├─ Help Desk (SD)
      ├─ Infrastructure
      └─ Change Management
```

### 가치

| 가치 | 정량화 | 한국 사례 |
|------|--------|---------|
| **원가 절감** | 30-40% FTE 감소 | 삼성: AP 처리 비용 33% ↓ |
| **프로세스 표준화** | 프로세스 편차 ↓ 80% | LG: 결산 기간 15일→8일 |
| **확장성** | 신사업 인수 시 IT 투자 최소화 | 현대차그룹: 인수 시간 70% ↓ |
| **감시 능력** | 감사 효율성 ↑ 50% | 한국은행: 콤플라이언스 위반 0 |

---

## 2. SAP 구현 패턴

### 패턴 1: Single Instance (권장)

**구조**:

```
Single SAP Instance (ERP-PRD)
  │
  ├─ Company Code 1000 (한국)
  ├─ Company Code 1100 (일본)
  ├─ Company Code 1200 (미국)
  └─ Company Code 1300 (인도)

SSC Users (AP Team)
  ├─ User AP_KR_001 (한국 회계)
  ├─ User AP_JP_001 (일본 회계)
  ├─ User AP_US_001 (미국 회계)
  └─ User AP_IN_001 (인도 회계)
  
각 사용자는 자신의 회사코드에만 액세스
```

**장점**:
- 단일 데이터베이스 → 실시간 대사
- Master Data 동기화 자동
- Transport 1회만 실행
- 감사 추적 간결

**단점**:
- 인스턴스 다운타임 영향 범위 큼
- 권한 관리 복잡 (1,000+ 사용자)
- 보안: 데이터 격리 미흡

### 패턴 2: Multi-Instance + MDG (Master Data Governance)

**구조**:

```
Core SAP Instance (글로벌 SSC용)
  └─ Master Company Code 1000 (Template)
  
Regional Instances
  ├─ SAP-APAC (AP, JP, IN)
  ├─ SAP-EMEA (UK, DE, FR)
  └─ SAP-AMER (US, CA, MX)

MDG System (Central Hub)
  └─ Master Data 동기화
      (GL, Vendor, Customer, Material)
```

**장점**:
- 지역별 독립 운영 (야간 배치 분산)
- 재해복구(DR) 용이
- 지역 규정 준수 (GDPR, K-IFRS)

**단점**:
- MDG 복잡도 ↑ (Master Data 불일치 위험)
- Transport 3회 이상 필요
- 통합 보고 지연 (6시간)

### 한국 기업 표준: Single + BTP 연동

```
On-Premise SAP S/4HANA (Korea)
  ├─ Finance Module (FI)
  ├─ Controlling (CO)
  └─ Human Capital Management (HCM)

SAP Business Technology Platform (BTP)
  ├─ Fiori Launchpad (ESS/MSS)
  ├─ Analytics (BW/4HANA)
  └─ Workflow (WorkforcePlanning)

SSC Users
  → Fiori Apps (모바일/웹)
  → SAP 프로세스 (백엔드)
```

---

## 3. SSC 권한 설계

### 핵심: Segregation of Duties (SoD)

**규칙**: 한 사용자가 **생성 → 승인 → 기록**을 모두 할 수 없다.

```
Purchase Requisition (PR)
├─ Create:    PO Creation Analyst (권한: ME51)
├─ Approve:   Finance Manager (권한: F.16)
└─ Post:      General Accountant (권한: FI)

Vendor Master Change
├─ Create:    Vendor Admin (권한: FK01)
├─ Approve:   Procurement Manager (권한: F.16 + Change Approval)
└─ Post:      System (자동)
```

### SSC 롤 표준 구조 (PFCG)

| 롤 | T-code 권한 | 회사코드 | 거래 유형 |
|------|-----------|----------|---------|
| AP_PROCESSOR | F-53 (Vendor Invoice) | CC 1000-1300 | Create + Post |
| AP_APPROVER | F.16 (FI Approval) | CC 1000-1300 | Approve + Verify |
| AR_PROCESSOR | F-27 (Customer Invoice) | CC 1000-1300 | Create + Post |
| GL_ACCOUNTANT | FB60, FB50 | CC 1000-1300 | Manual Entry |
| SSC_MANAGER | FC00 (Period Close) | CC 1000-1300 | Monitor + Override |
| COMPLIANCE | FSA5, FB05 (Audit) | All | Read-Only |

### Cross-Company Code Authorization

**OBYA 설정** (Document Type Authorization):

```
Document Type AB (Cross-Company-Code Posting)
└─ GL Account: 190000 (Due-to/Due-from)
   ├─ Debit Company Code: 1000
   └─ Credit Company Code: 1100
   
T-code FBU1 (Cross-Company Clearing)
  → User SSCP_INT_001에게만 권한 부여
  → 월 2회 (5일, 20일) 실행 권한만 부여
```

### 최소 권한 원칙 (Least Privilege)

**Forbidden Authority Combinations** (Conflict of Interest):

| 충돌 | 분리 방법 |
|------|---------|
| Create Invoice + Approve Invoice | 2명 이상 필수 |
| Approve Payment + Post Payment | 2명 이상 필수 |
| Change Vendor Master + Process Vendor | 2명 이상 필수 |
| Create PO + Receive Goods | 2명 이상 필수 |
| Authorize GL Account + Use GL Account | 2명 이상 필수 |

**감시**: SUIM (User Information System)

```
T-code: SUIM
Report: "Users Possessing Conflicting Authorizations"
Output: 비준 중인 충돌 권한자 리스트 → CFO 보고
```

---

## 4. Cross-Company Code Posting (Document Type AB)

### 개념

Single Transaction으로 2개 이상의 회사코드에 자동 분기되는 거래 유형.

**예시**: 중앙 SSC의 AP 처리

```
Vendor Invoice 도착 (공급업체 XYZ)
  └─ 상품: 50만원 (CC 1000), 20만원 (CC 1100)

SSC Accountant (중앙에서 1건 입력)
  └─ T-code: F-43 (Document Type AB)
     ├─ Line 1: DR 500000 | CC 1000 | GL 600100 (원재료비)
     └─ Line 2: DR 200000 | CC 1100 | GL 600100 (원재료비)
     └─ Line 3: CR 700000 | CC 1000 | GL 200200 (미지급금) ← 자동 생성
```

### OBYA 설정

**T-code: OBYA** (Define Document Types)

```
Document Type: AB (Cross-Company Posting)
├─ Number Range: 0700000000 ~ 0799999999
├─ Posting Period: Auto (Open Period)
├─ Test Mode: [OFF]
├─ Batch Input: [ON]
├─ Posting: [ON]
├─ Due-to Account:    190000 (CC 1000)
├─ Due-from Account:  190100 (CC 1100)
└─ Automatic Clearing: [Y]
```

### 회계 처리

**CC 1000 입력 기록**:

```
DR 500000 GL 600100 (원재료비)      CC 1000
DR 200000 GL 600100 (원재료비)      CC 1100
CR 700000 GL 200200 (미지급금)      CC 1000
CR   0000 GL 190000 (Due-to)        CC 1100 (자동)
```

**CC 1100 입력 기록** (자동 생성):

```
DR   0000 GL 190100 (Due-from)      CC 1100
CR   0000 GL 190000 (Due-to)        CC 1000
```

**결산 시 소거**:

```
CC 1000: GL 190000 = 0
CC 1100: GL 190100 = 0
→ 연결 재무제표에서 전액 상계
```

### sapstack 검증

```
Evidence Loop:
1. FBL3N (CC 1000) → "Due-to 잔액 50만원 (예상: 0)"
2. FBL3N (CC 1100) → "Due-from 잔액 45만원 (예상: 0)"
3. FB09 → "CC 간 미소거 잔액 5만원 차이"
4. FB05 (Document Log) → "Cross-Company Posting AB 12/15 기록"

진단:
"CC 1100의 Due-from 입력 중 환율 변동으로 5만원 차이 발생.
예상 원인: 환율 조정 미실행 또는 부분 입력."

추천:
- OB94 (Exchange Rate Adjustment) 실행
- FB09로 재검증
- 미소거 건은 FBU1 (Cross-Company Clearing)으로 정산
```

---

## 5. 서비스 요청 관리 (Service Desk)

### SLA(Service Level Agreement) 정의

**FI Service Desk Example**:

| 서비스 | 요청 내용 | SLA | 담당자 |
|--------|---------|------|--------|
| AP Invoice | 수입 증명서 처리 | 48시간 | SSC AP Team |
| AR Credit Memo | 반품 신용메모 | 24시간 | SSC AR Team |
| GL Manual Entry | 수동 전표 입력 | 2시간 | GL Specialist |
| Vendor Onboarding | 신규 공급업체 | 5영업일 | Vendor Admin |
| Period Close | 월별 마감 | 10영업일 | CFO + SSC |
| GL Reconciliation | 장부 대사 | 15영업일 | Audit Team |

### Solution Manager Service Desk 통합

**T-code: SLWC** (Service Catalog)

```
Catalog: "Finance Services"
├─ Process: "Invoice Receipt"
│   ├─ Child Task 1: Scan Document
│   ├─ Child Task 2: Data Entry (T-code F-43)
│   ├─ Child Task 3: Approval (T-code F.16)
│   └─ Child Task 4: Post (Automatic)
│
├─ KPI: "% Invoices Processed On-Time"
│   └─ Target: 95%
│   └─ Actual: 92% (Last Month)
│   └─ Alert: RED (3% Miss)
│
└─ Resource Plan
    ├─ FTE Required: 12
    ├─ FTE Allocated: 10 (부족!)
    └─ Recommendation: +2 FTE or +1 Outsourcing Partner
```

### Request Workflow (Workflow Code: WS40000001)

```
1. Request Submit
   └─ User: Department Manager
   └─ T-code: FB50 (Manual Entry)
   └─ Details: Journal Entry, Amount, Cost Center, GL Account

2. Data Validation (자동)
   └─ Rule 1: GL Account는 "Posting" 플래그 = Y
   └─ Rule 2: Cost Center는 활성
   └─ Rule 3: Amount > 0 and < 999,999,999
   └─ Status: PASS/FAIL

3. Manager Approval
   └─ Approver: Cost Center Manager (결재 권한)
   └─ Approval Duration: 4시간 이내
   └─ Decision: Approve / Reject

4. Post (자동)
   └─ System: SAP FI
   └─ Status: Posted ✓
   └─ Notification: 요청자에게 완료 메일
```

### sapstack KPI 추적

```
Service Metrics:
┌──────────────────────────────────────┐
│ Metric              │ Target │ Actual │
├──────────────────────────────────────┤
│ Invoice SLA (48h)   │ 95%    │ 87%    │ ⚠️ 
│ GL Entry (2h)       │ 100%   │ 98%    │ ✓
│ Vendor Onboard (5d) │ 90%    │ 85%    │ ⚠️
│ Period Close (10d)  │ 100%   │ 100%   │ ✓
└──────────────────────────────────────┘

sapstack 진단:
"Invoice SLA 미충족 8% (원인: CC 1200 US 요청 증가 45%).
현재 FTE 10명 → 12명 필요 추정.
또는 Workflow 자동화 (예: RPA) 도입 필요."
```

---

## 6. Cross-Function 프로세스 예시: Procure-to-Pay (P2P)

### End-to-End 프로세스

```
Purchase Requisition (PR) 생성
└─ Requestor (부서장): T-code ME51N
   └─ Company Code: CC 1000, Plant: 1100, Material: ABC123
   └─ Qty: 100, Requested Delivery: 2024-04-15

Purchase Order (PO) 생성
└─ Buyer (SSC Procurement): T-code ME21N
   └─ Auto-Matched: PR + PO
   └─ Vendor: VEN-001, Price: 10,000 KRW/EA
   └─ Total: 1,000,000 KRW

Goods Receipt (GR) 입력
└─ Warehouse: T-code MIGO
   └─ GR Date: 2024-04-16
   └─ Qty Received: 100
   └─ GL Posted: Stock ↑, GR/IR Account ↑

Invoice Receipt
└─ AP Specialist (SSC): T-code F-43 (Type AB)
   └─ Invoice #: VEN-001-2024-04-10
   └─ Invoice Amt: 1,000,000 KRW
   └─ GL Posted: Expense ↑, AP (Payable) ↑

Three-Way Match (자동)
└─ System Logic: PO Qty = GR Qty = IV Qty?
   ├─ 일치 → Auto-Post to GL
   └─ 불일치 → Exception Notification to Manager

Payment
└─ AP: T-code F110 (Payment Run)
   └─ Schedule: Weekly (Every Friday)
   └─ Amount: 1,000,000 KRW
   └─ GL Posted: AP ↓, Bank ↓

Reconciliation (월 1회)
└─ AP Accrual: FBL3N
   └─ Expected: 0 (모든 거래 정산)
   └─ Variance: < 1% (허용 오차)
```

### 다중 회사코드 처리

```
Scenario: CC 1000 (본사)에서 CC 1100 (일본) 소재 공급업체 구매

Step 1: PR (CC 1000)
  └─ PO (CC 1100 공급업체)
  └─ GR (CC 1000 or 1100? → STO 규칙)
  
Step 2: Invoice (CC 1100 입력)
  └─ Type AB: CC 1000 Expense ↑ | CC 1100 AP ↓
  
Step 3: Payment (CC 1100)
  └─ Bank Account CC 1100
  └─ But GL: CC 1000 & 1100 공동 정산
```

**sapstack 검증**:

```
Evidence Loop:
1. ME51N → "PR 승인 지연 (평균 4시간 → 지금 12시간)"
2. MIGO → "GR 입력 지연 (평균 24시간 → 지금 48시간)"
3. F-43 → "Invoice 미처리 (SLA 48시간, 73시간 경과)"
4. FBL3N → "AP Aging: 30-60일 33건, 60-90일 8건"
5. SM21 → "Exception Notification 발송 불구 후속 동작 부재"

진단:
"Procure-to-Pay 프로세스 병목: GR 입력.
원인: 창고 인원 부족 (1명 → 3명 필요).
영향: Invoice 처리 SLA 23% 미충족.
추천: RPA (UiPath) 도입 → GR 입력 자동화 (예상 80% 시간 절감)"
```

---

## 7. HR + FI 통합: Payroll-to-GL

### Payroll Processing (PAYROLL)

**프로세스**:

```
Time & Attendance (PA30)
  │
  ├─ Employee: E-1001
  │   └─ Working Hours: 160 (정상), OT: 20
  │   └─ Leave: 공가 8시간
  │   └─ Bonus: 100만원 (특별상여)
  │
  → Payroll Run (PT-01)
      └─ Month: 2024-04
      └─ Gross Salary: 3,000,000 KRW
      └─ Deductions:
          ├─ Income Tax: 300,000
          ├─ Health Insurance: 90,000
          ├─ Pension: 150,000
          └─ Union Fees: 10,000
      └─ Net Salary: 2,450,000 KRW
  
  → GL Auto-Posting (FB60)
      ├─ DR 3,000,000 | GL 400000 (급여비) | CC 1000
      ├─ DR    90,000 | GL 400010 (보건료) | CC 1000
      ├─ DR   150,000 | GL 400020 (연금) | CC 1000
      └─ CR 3,290,000 | GL 201000 (급여미지급금) | CC 1000
  
  → Payment (F110)
      └─ Payroll Account → Employee Bank
      └─ Amount: 2,450,000 KRW (= Gross - Deductions)
```

### GL Reconciliation (FI ↔ HR)

**FL 설정** (FICA: Payroll to GL):

```
T-code: FICA (Payroll → GL Posting Rules)

Wage Type: 1000 (Base Salary)
  └─ G/L Account: 400000 (Salary Expense)
  └─ Company Code: All CC
  └─ GL Posting: [X] (자동 전기)

Wage Type: 0100 (Bonus)
  └─ G/L Account: 400050 (Bonus Expense)
  └─ Company Code: All CC (그룹 보너스)
  └─ GL Posting: [X]

Wage Type: 0020 (Health Insurance)
  └─ G/L Account: 400010 (Insurance Expense)
  └─ GL Posting: [X]
  └─ Vendor Account: 200050 (Insurance Payable)
```

**월 1회 Reconciliation** (T-code: F.08):

```
Balance Report: "Payroll vs GL"

Expected:
  HR Payroll GL 400000 Total: 15,000,000 KRW

Actual:
  FI GL 400000 Balance: 14,999,500 KRW

Variance: 500 KRW (±0.003%, OK)
```

### 다국가 Payroll

```
Company Code 1000 (한국)
  ├─ Payroll: PT-KR
  ├─ Wage Type: 기본급, 상여, 수당, 상여금
  ├─ Deduction: 소득세, 건강보험, 국민연금, 고용보험
  └─ GL Account: 4000xx (한국 회계규칙)

Company Code 1100 (일본)
  ├─ Payroll: PT-JP
  ├─ Wage Type: 기본給, ボーナス, 各種手当
  ├─ Deduction: 所得税, 厚生年金, 健康保険
  └─ GL Account: 4100xx (일본 회계규칙)

Company Code 1200 (미국)
  ├─ Payroll: PT-US
  ├─ Wage Type: Base, Bonus, Commission
  ├─ Deduction: Federal Tax, State Tax (NY/CA 다름), FICA
  └─ GL Account: 4200xx (GAAP 규칙)
```

---

## 8. SSC Best Practices

### 1. Process Standardization

```
Before SSC:
├─ Vendor Onboarding: 각 지역 15-30일
├─ Invoice Processing: 상이한 절차
└─ Reconciliation: Manual, 오류율 15%

After SSC:
├─ Vendor Onboarding: 통일된 5일 프로세스
├─ Invoice Processing: 표준화된 T-code (F-43 AB)
└─ Reconciliation: 자동화 (FICA, OBYA)
└─ Quality: 오류율 0.5% (97% 개선)
```

### 2. Service Level Management

```
Monthly SLA Review:
┌─────────────────────────────────────┐
│ Service     │ SLA  │ Actual │ Status │
├─────────────────────────────────────┤
│ Invoice     │ 95%  │  92%   │ Yellow │ ← Action Plan 필요
│ GL Entry    │ 100% │ 100%   │ Green  │ ✓
│ Payroll     │ 100% │ 100%   │ Green  │ ✓
│ Period Close│ 100% │  96%   │ Yellow │
└─────────────────────────────────────┘

Action Plan:
- Invoice SLA: +2 FTE 채용 or RPA 도입
- Period Close: Workflow 개선 (승인 단계 축소)
```

### 3. Continuous Improvement (Kaizen)

```
Q1 Initiative: "Invoice Processing Automation"
├─ Baseline: 수동 데이터 입력 80%
├─ Target: RPA로 자동화 60%
├─ Timeline: 12주
├─ Effort: 50 FTE-days (설계, 구현, 테스트)
└─ Expected Benefit: 
    - SLA 충족 95% → 99%
    - Cost: -15% (FTE 2명 감원)
    - Quality: Error Rate 2% → 0.2%

sapstack Role:
- Week 1-2: Current Process Mapping (Evidence Loop로 실제 데이터 추출)
- Week 3-6: RPA Bot Design & Build
- Week 7-11: UAT & Training
- Week 12: Go-Live & Monitoring
```

---

## 9. SSC 운영 체크리스트

### 월별 활동

| 주기 | 활동 | 담당 | T-code |
|------|------|------|--------|
| 매일 | Invoice 입력 | AP Team | F-43 (Type AB) |
| 매일 | Goods Receipt | Warehouse | MIGO |
| 매주 (금) | Payment Run | AP Manager | F110 |
| 매주 (월) | GL Reconciliation | GL Specialist | FB09, FBL1N |
| 월초 (1-5일) | Period Close | SSC Manager | FCMONITOR |
| 월 2회 | IC Clearing | FI Specialist | FBU1 |
| 월 1회 | Vendor Reconciliation | Vendor Admin | FK03, FBL3N |
| 월 1회 | SLA Review | SSC Director | Solution Manager |

### 분기별 활동

| 활동 | 담당 | 결과물 |
|------|------|--------|
| Process Audit | Internal Audit | Audit Report |
| SoD Review | Compliance | Conflict of Interest Report |
| Master Data Health | Data Governance | Quality Metrics |
| Workload Forecast | Capacity Planning | Staffing Plan |

### 연간 활동

| 활동 | 담당 | 결과물 |
|------|------|--------|
| Budget Planning | Finance Director | Annual Budget |
| Process Improvement | Process Owner | Kaizen Projects |
| Tool Evaluation | IT | Technology Roadmap |
| External Audit | Big 4 | Audit Opinion |

---

## 10. SSC 도입 실패 사례 & sapstack의 역할

### Case 1: "권한 충돌로 인한 부정 거래"

```
상황:
- 모 대기업 SSC 도입 2년차
- CFO: "연간 부정 행위 적발 0건"
- 실제: 내부 감사에서 Vendor Fraud 발견 (40억 원)

근본원인:
- SoD 정책: Vendor Master 생성 + Invoice 승인 분리
- 현실: "AP Team은 Vendor Admin 권한도 보유"
  (이유: 신규 벤더 긴급 등록 때문)
- 결과: 개별 담당자가 가짜 Vendor + Invoice 생성 → 자신이 승인

sapstack이 탐지했어야 할 것:
1. SUIM Report: "Conflicting Authorizations" → 
   "User X: FK01 (Vendor Create) + F.16 (Approval)" → 위험 신호
2. FBL3N → "Vendor VEN-4029는 지난 90일 Invoice만 1건 (비정상)"
3. SM21 → "Document Type AB 변경 기록: User X가 거의 모든 Transaction"
4. Exception Log → "Manual Post (FB50)가 비정상 시간대(야간)에만 발생"

sapstack Recommendation:
"권한 분리 미흡 3곳 발견:
- User X: FK01 + F.16 (Vendor Create + Approval)
- User Y: ME21 + MIGO (PO Create + GR)
- User Z: F-43 + F110 (Invoice + Payment)

Immediate Action:
1. 권한 재검토 (PFCG) → Least Privilege 재설정
2. Quarterly SoD Audit 자동화
3. Exception Monitoring (SK020) 강화"
```

### Case 2: "Period Close 지연"

```
증상:
- 월별 결산 목표 10일 → 현재 18일
- Stakeholder: "SSC 도입이 오히려 느려졌다"

근본원인 분석 (sapstack Evidence Loop):
1. FCMONITOR → "월별 Open Period가 3주로 연장됨"
   (이유: CC 1100, 1200에서 IC Clearing 미완료)
2. FBL3N → "CC 1100의 Due-from 미소거 150억 원"
3. FB09 → "GL 190000 (IC Due-to) 분석:"
   - CC 1000: -50억 (정상)
   - CC 1100: +40억 (불일치!)
   - CC 1200: +20억 (불일치!)
4. FM21 → "Cross-Company Clearing (FBU1) 미실행"
   (예상 실행: 매월 20일, 실제: 불규칙)

sapstack Diagnosis:
"IC 대사 미흡으로 인한 Period Close 8일 지연.
예상원인:
- FBU1 자동화 미흡 (수동 실행)
- 회사코드별 차이 누적 (Tolerance Level 기준 불명확)
- 권한: CC 1100의 담당자가 FBU1 권한 부재

Recommendation:
1. FBU1 월 2회 스케줄링 자동화 (T-code OBYN)
2. Cross-Company Clearing Tolerance: ±100만원 설정
3. 권한: Regional Finance Manager에게 FBU1 권한 부여
4. Monitoring: Weekly IC Balance Check (sapstack Automated)"

Expected Result: Period Close 18일 → 11일 (7일 단축)
```

---

## 결론

SSC는 **프로세스 표준화**, **비용 절감**, **규정 준수**의 삼각형이다.

하지만 **다중 회사코드 + 다중 사용자 + 자동 거래**는 오류의 증폭기가 될 수 있다.

**sapstack의 역할**:

1. **SoD Violation 조기 탐지** → SUIM + PFCG 자동 분석
2. **IC Reconciliation 모니터링** → FBL3N + FB09 지속 검증
3. **Period Close 병목 식별** → FCMONITOR Timeline 분석
4. **SLA 준수율 추적** → Service Desk 통합
5. **감사 증거 수집** → Document Trail + Exception Log

"SSC의 성공 = 인력 절감이 아니라 **에러율의 극소화**"이다. sapstack이 그 목표를 달성하는 도구다.
