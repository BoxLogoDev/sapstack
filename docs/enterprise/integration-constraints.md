# SAP 연동 현실 제약 — sapstack의 포지셔닝

## 개요

"우리 SAP와 연결해서 자동으로 데이터 가져와"라는 요청은 매력적이지만, **현실은 상당히 복잡**하다. 인증, 망분리, 감사, 변경관리 때문에 직접 API 연동은 대기업에서 거의 불가능하다.

**sapstack의 핵심 통찰**: AI가 SAP를 조작하지 않고, **인간 오퍼레이터를 안내하는 도구**로 포지셔닝하면, 모든 제약을 우회할 수 있다.

---

## 1. SAP API 직접 연동의 현실적 제약

### 1.1 인증 (Authentication)

**SAP 보안의 복잡도**:

```
SAP User Authentication Methods:

1. Basic Authentication (User + Password)
   ├─ RFC Function Call: RFC protocol (SAP 고유)
   ├─ REST API: User + Password (deprecated 2020)
   ├─ Risk: Plain text 전송 (암호화 필수)
   └─ Limitation: MFA 미지원 (legacy)

2. Certificate-based Authentication
   ├─ X.509 Client Certificate
   ├─ Setup: Digital Certificate (CMS 발급)
   ├─ Complexity: Certificate Renewal (연 1회)
   └─ SAP Portal: Certificate Management (T-code STRUST)

3. OAuth 2.0 (SAP Cloud Platform)
   ├─ Cloud 전용 (On-Premise 미지원)
   ├─ Token-based (JWT)
   └─ Scope: Fiori Apps only (Backend RFC 미지원)

4. SAML 2.0 (Enterprise SSO)
   ├─ Identity Provider (AD, Okta, Azure)
   ├─ Setup: Metadata Exchange
   └─ Use Case: Portal Logon only (API 미지원)

한국 대기업 현실:
  ├─ 대부분: Basic Auth + Service User (비추천)
  ├─ 상급사: Certificate + Firewall IP Whitelist
  ├─ 클라우드: OAuth (SAP Cloud)
  └─ 문제: Service User 암호 주기적 변경 → 자동화 어려움
```

**실제 사용 예시**:

```
RFC Connection Setup (T-code: SM59):

Destination: SAP_EXTERNAL_SYSTEM
├─ Connection Type: 3 (ABAP)
├─ Host: sap.company.com
├─ System Number: 00
├─ Client: 100
│
├─ Authentication:
│   ├─ User: RFC_SERVICE_USER
│   ├─ Password: ••••••••••• (변경 주기: 90일)
│   ├─ Logon Language: EN
│   └─ Timeout: 30 seconds
│
├─ Security:
│   ├─ Logon Type: Cert. & Logon (Double Auth)
│   ├─ SSL/TLS: TLS 1.3
│   ├─ IP Restriction: YES
│   │   └─ Whitelist: 10.20.30.40, 10.20.30.50
│   │
│   └─ Gateway:
│       ├─ Gateway Host: gwhost.company.com
│       ├─ Gateway Service: 3300
│       └─ SNC Name: p/cn=sap/o=company/c=kr

Problem:
  └─ "외부 시스템이 매달 암호를 변경해야 함"
     (IT Security Policy: Service Account 90일 주기 변경)
     → 자동화 도구가 매월 깨짐
     → 수동 개입 필수
```

### 1.2 네트워크 제약 (Firewall & Network Segmentation)

**한국 대기업 표준: 망분리**

```
Network Architecture:

┌──────────────────────────────────────────────────────┐
│                  Internet Segment                    │
│  ├─ Public Website                                  │
│  ├─ Cloud Services (AWS, Azure, SAP BTP)           │
│  └─ EDI Partners (해외 거래처)                       │
└──────────────────────────────────────────────────────┘
                        │
                 Firewall & DMZ
                        │
┌──────────────────────────────────────────────────────┐
│            Business Network (Intranet)              │
│  ├─ SAP System (10.20.30.40:3300)                  │
│  ├─ Finance PCs (10.20.31.0/24)                    │
│  ├─ Supply Chain PCs (10.20.32.0/24)               │
│  └─ HR PCs (10.20.33.0/24)                         │
└──────────────────────────────────────────────────────┘
                        │
                Firewall (Logical Separation)
                        │
┌──────────────────────────────────────────────────────┐
│              Development Network                    │
│  ├─ Dev PCs (10.30.40.0/24)                        │
│  ├─ GIT Repository (10.30.41.0/24)                 │
│  └─ CI/CD Server (10.30.42.0/24)                   │
└──────────────────────────────────────────────────────┘

Practical Issues:

1. Direct API Call (인터넷 → SAP) 불가능
   ├─ Inbound 방향 완전 차단
   ├─ SAP는 Business Network에만 존재
   └─ 외부에서 직접 접근 불가

2. SAP → 외부 API Call 제약
   ├─ Outbound 포트 제한 (443만 열림)
   ├─ HTTP/REST만 가능, RFC 불가
   ├─ Proxy 필수 (인증서 검증)
   └─ 정책: "필요한 도메인만 Whitelist"

3. 예시: 전자세금계산서 연동
   ├─ SAP (Business Network)
   ├─ GW (Gateway, DMZ)
   ├─ 국세청 NTS (Internet)
   │
   └─ Data Flow:
       SAP → GW (Private, 안전) ✓
       GW → NTS (Internet, 암호화 필수) ✓
       
   문제: "외부 스타트업이 GW 없이 직접 SAP 접근 불가"
```

**Firewall Rule의 현실**:

```
T-code: SM59 (Destination 설정)

허용되는 연결:
├─ RFC Destination (SAP → SAP): 포트 3300
│   └─ Example: SAP PRD → SAP DEV (원격 지원용)
│
├─ HTTP/HTTPS (Outbound): 포트 443
│   └─ Example: SAP → NTS (전자세금계산서), SAP → BTP
│
├─ Database: 포트 35013 (HANA)
│   └─ Example: SAP Application → HANA Database
│
└─ Printing: 포트 515 (LPD)
    └─ Example: SAP → Network Printer

허용 안 되는 연결:
├─ SSH: 포트 22 (접근 차단)
├─ Telnet: 포트 23
├─ Database Direct: 포트 3306 (MySQL)
└─ Custom Port: 8001, 9000 등 (사전 승인 필수)

결론:
└─ "외부 AI 도구가 SAP에 직접 접근할 수 없다"
   (Firewall이 모든 Inbound 차단)
```

### 1.3 감사(Audit) 요구사항

**K-SOX & J-SOX 규제**:

```
한국 기업 (코스피 상장):
  ├─ 내부회계관리제도 (K-SOX)
  │   └─ "정보시스템 감시 강화" (2023년 강화)
  │
  ├─ 감시항목:
  │   ├─ 누가 (User) 무엇을 (Transaction) 했는가 (Audit Log)
  │   ├─ 언제 (Timestamp) 어디서 (IP) 접근했는가
  │   ├─ 승인 (Approval) 없이 실행된 거래가 있는가
  │   └─ 접근 권한(Authorization)이 부적절한가 (SoD)
  │
  └─ 보관 요구사항:
      ├─ Audit Log: 최소 3년 보관
      ├─ Change Document: 최소 5년 보관
      └─ Transaction Approval: 영구 보관 (법정)

실제 감시:
  T-code: SM20 (Audit Log Activation)
  ├─ Activated: YES
  ├─ Filters:
  │   ├─ FI Module (모든 거래)
  │   ├─ Sensitive Tables (LFA1, KNA1, MARA)
  │   └─ Authorization Changes (T-code PFCG)
  │
  └─ Capture:
      ├─ User ID: ADMIN
      ├─ Action: Vendor Master Change (FK02)
      ├─ Field Changed: GL Account
      ├─ Old Value: 400100 → New Value: 400200
      ├─ Timestamp: 2024-04-10 14:35:21
      └─ IP Address: 10.20.31.100

AI가 SAP 거래를 직접 실행하면:
  ├─ Audit Log: "User: RFC_SERVICE_USER"
  │   └─ 누가 실행했는가? 분명하지 않음 (사람 vs 시스템)
  │
  ├─ Approval: "자동 실행"
  │   └─ 누가 승인했는가? 레코드가 없음 (감사 위반)
  │
  └─ 감시인의 질문:
      "이 거래는 누가 요청했고, 누가 승인했는가?"
      → AI의 답: "I analyzed the data and decided" (감사 불가능)
      → 결론: "RFC 기반 자동화는 감사 준법 위반"
```

### 1.4 변경관리 (Change Management)

**IT Governance**:

```
SAP 변경의 3가지 방법:

방법 1: Function (RFC) 추가
  ├─ Developer: ABAP 코더
  ├─ T-code: SE37 (Create Function)
  ├─ Process:
  │   1. Code 작성 (3-5일)
  │   2. Unit Test (2-3일)
  │   3. Code Review (IT Team, 1일)
  │   4. Transport to QAS (1일)
  │   5. UAT (User Test, 3-5일)
  │   6. CAB Approval (변경 자문위, 5일 대기)
  │   7. Transport to PRD (1일)
  │   8. Post-Implementation Verification (1일)
  │
  └─ 총 소요시간: 3-4주 (급해도 2주 불가)

방법 2: Configuration (Customizing) 변경
  ├─ Configuration Object 예시:
  │   ├─ OBYA (Document Type)
  │   ├─ OBDA (GL Account Config)
  │   ├─ FTXP (Tax Code)
  │   └─ OMS2 (Material Valuation)
  │
  ├─ Process:
  │   1. Change Request 제출 (Business Analyst)
  │   2. Design (Functional Consultant, 3-5일)
  │   3. Implementation (TechConsultant, 2-3일)
  │   4. Unit Test (Functional, 2-3일)
  │   5. CAB Approval (5-7일 대기)
  │   6. Transport (1일)
  │   └─ 총 소요시간: 2-3주
  │
  └─ Issue: "Configuration 변경은 누구나 할 수 없음"
      (권한: 특정 Consultant만 가능)

방법 3: Manual Data Entry (매월 거래)
  ├─ User: Finance Analyst
  ├─ T-code: FB50 (Manual Posting)
  ├─ Approval: Manager (F.16, Approval Workflow)
  └─ Audit: 즉시 Audit Log 기록

결론:
└─ "RFC 기반 자동화는 변경관리 오버헤드가 크므로,
    대기업은 거의 하지 않는다"
```

---

## 2. 읽기 전용(Read-Only) 진단의 한계와 대안

### 2.1 Read-Only 접근의 장점

```
Advantages:

1. 감사(Audit) 완벽 준수
   ├─ No Write Operation
   ├─ No Authorization Required (읽기만 가능)
   └─ No Approval Workflow

2. 보안 위험 최소화
   ├─ Data Corruption 불가능
   ├─ Unauthorized Change 불가능
   └─ No Backdoor Entry

3. 구현 신속성
   ├─ No RFC Function 개발 필요
   ├─ No Testing Cycle
   ├─ No Transport Management
   └─ 구현: 1-2주 (vs RFC: 3-4주)

4. 유지보수 간편
   ├─ SAP 버전 업그레이드 무관
   ├─ Patch 적용 시 수정 불필요
   └─ Cost 극소화
```

### 2.2 Read-Only 진단 도구

**T-code 기반 정보 추출**:

```
1. Performance Trace (T-code: ST05)
   ├─ 목적: SQL Query Performance 분석
   ├─ 활성화:
   │   1. ST05 실행
   │   2. Activate Trace (활성화 후 비즈니스 프로세스 실행)
   │   3. Deactivate Trace
   │
   ├─ 결과:
   │   ├─ SQL Statements Executed
   │   ├─ Database Time (ms)
   │   ├─ Fetch Counts
   │   └─ Lock Contention
   │
   ├─ Export: TXT, CSV로 다운로드
   └─ 예시:
       "SELECT * FROM VBAK WHERE ERDAT = '2024-04-10'"
       Rows Returned: 1,000
       Time: 523ms ← 느림 (Index 부족?)

2. System Log (T-code: SM21)
   ├─ 목적: System-wide Event Logging
   ├─ 정보:
   │   ├─ User Logon/Logoff
   │   ├─ Failed Authorization Checks
   │   ├─ Batch Job Execution
   │   ├─ Database Errors
   │   └─ Termination Codes (ABEND)
   │
   ├─ Export: SM21 → Analysis Tools
   │   ├─ Log Download (일일)
   │   ├─ Filter by Date/User/Message Type
   │   └─ Analysis
   │
   └─ 예시:
       "User ADMIN attempted to access LFA1 (Vendor)
        but Authorization P_PURCHASING is missing"

3. Batch Job Log (T-code: SM37)
   ├─ 목적: Background Job Status
   ├─ 정보:
   │   ├─ Job Name, Job Number
   │   ├─ Created By, Run Date/Time
   │   ├─ Status (Scheduled, Running, Completed, Failed)
   │   ├─ Return Code (0 = OK, >0 = Error)
   │   └─ Spool Output (Log)
   │
   ├─ Analysis:
   │   ├─ Job Duration (기대값 vs 실제)
   │   ├─ Failure Trends
   │   └─ Resource Usage (CPU, Memory)
   │
   └─ 예시:
       Job: RFBILJK0 (Reconciliation Job)
       Duration: 120 minutes (정상)
       Status: COMPLETED ✓
       Return Code: 0

4. Data Browser (T-code: SE16N)
   ├─ 목적: Table Data Read (No Modify)
   ├─ Scope:
   │   ├─ All Tables (LFA1, KNA1, MARA, VBAK 등)
   │   ├─ Filter & Sort
   │   └─ Export to Excel
   │
   ├─ 제약:
   │   ├─ Read-Only (수정 불가)
   │   ├─ Performance: Large Tables 조회 느림
   │   └─ Sensitive Data: 정책상 접근 제한 가능
   │
   └─ 예시:
       Table: VBAK (Sales Order Header)
       Filter: ERDAT >= 2024-04-01
       Result: 50,000 records exported to Excel

5. GL Account Analysis (T-code: FB09)
   ├─ 목적: General Ledger Balance
   ├─ 정보:
   │   ├─ Account Number
   │   ├─ Company Code
   │   ├─ Period Balances
   │   ├─ Year-to-Date Balance
   │   └─ Document Details (Line Items)
   │
   ├─ Export:
   │   ├─ ALV to Excel
   │   ├─ PDF
   │   └─ SAP List Viewer (SALV)
   │
   └─ 예시:
       GL Account: 400100 (Salary Expense)
       CC 1000: 500M (April YTD)
       CC 1100: 250M (April YTD)
       Total: 750M
```

### 2.3 sapstack의 Evidence Loop 방법론

**Read-Only 정보 조합으로 근본원인 분석**:

```
Scenario: "월말 결산이 10일 지연되고 있다"

Traditional Approach (근본원인 분석 실패):
  1. "왜 지연되나요?"
  2. "모르겠어요" (데이터 분석 없음)
  3. "대충 추측: 시스템이 느린 것 같은데..."
  4. 결과: 문제 해결 못 함

sapstack Evidence Loop (근본원인 파악):

1단계: SM21 (System Log) 분석
  ├─ Issue: "FI-CL Period Close 권한 오류"
  ├─ User FINANCE_MANAGER:
  │   └─ "FC00 (Period Close Monitor) 권한 부재"
  │
  └─ Finding: 권한 문제가 근본 원인일 가능성 ✓

2단계: FCMONITOR (Close Monitor) 확인
  ├─ Status:
  │   ├─ CC 1000: COMPLETED ✓
  │   ├─ CC 1100: PENDING (7일 지연)
  │   └─ CC 1200: NOT_STARTED
  │
  └─ Finding: CC 1100이 병목 ✓

3단계: SM21 (CC 1100 관련 로그)
  ├─ Error: "GL Account 190000 불일치"
  │   └─ Due-to/Due-from 미결제
  │
  └─ Finding: IC 거래 미소거 ✓

4단계: FBL3N (CC 1100 미수금 조회)
  ├─ IC Receivable (from CC 1000):
  │   ├─ Expected: 0 (결제 완료)
  │   ├─ Actual: 50M (미정산)
  │   └─ Variance: 50M (= SL 미소거 금액)
  │
  └─ Finding: IC 대사 미진행 ✓

5단계: FB09 (GL 150000 분석)
  ├─ GL 150000 (IC Due-to):
  │   ├─ CC 1000: -50M
  │   ├─ CC 1100: +45M
  │   └─ Mismatch: -5M (차이 원인 불명)
  │
  └─ Finding: 5M 차이의 원인 조사 필요 ✓

sapstack Diagnosis (종합):

"결산 지연 원인 분석 완료:

Primary Issue: CC 1100의 IC 거래 미소거 (50M)
  ├─ 원인: FBU1 (Cross-Company Clearing) 미실행
  ├─ 발견 근거:
  │   ├─ SM21: GL 불일치 오류 로그
  │   ├─ FBL3N: CC 1100 미수금 50M
  │   ├─ FB09: GL 150000 양측 불일치
  │   └─ FCMONITOR: CC 1100 Period Close Pending
  │
  └─ Impact: Period Close 불가 (GL Balance 깨짐)

Secondary Issue: 5M 차이 미설명
  ├─ 가능성:
  │   ├─ 환율 변동 (JPY/KRW) → 3M 추정
  │   ├─ 반품 미기록 → 2M 추정
  │   └─ 기타 → 부족
  │
  └─ Recommendation: Manual Reconciliation 필요

Remediation Steps:
  Step 1: FBU1 실행 (T-code: T-code FBU1)
          → 정산 금액 50M 입력
          → 결과: CC 1100 GL 150000 = 0 ✓
  
  Step 2: 5M 차이 분석
          → Finance Manager가 송금 기록 재검토
          → 3M 환율조정, 2M 반품 확인
          → GL adjustment: +5M 입력
  
  Step 3: GL 재검증
          → FB09 다시 실행
          → GL 150000: 0 ✓
  
  Step 4: FCMONITOR 다시 실행
          → CC 1100 Period Close: COMPLETED ✓

Expected Outcome:
  └─ Period Close 10일 지연 → 즉시 해결
     (FBU1 실행 1시간 + 재검증 30분)

This is how Read-Only diagnostics enable human-driven remediation
WITHOUT requiring write access or RFC development."
```

---

## 3. sapstack의 포지셔닝: "AI는 안내자, 인간은 실행자"

### 3.1 핵심 아이디어

```
Traditional AI-SAP Integration (문제):
  ┌─────────────────────────────────┐
  │ External AI System              │
  │ (스타트업 도구, Claude API)    │
  └────────┬────────────────────────┘
           │ RFC Call
           ↓
  ┌─────────────────────────────────┐
  │ SAP System (ERP)                │
  │ (온프레미스, 망분리 환경)      │
  └────────┬────────────────────────┘
           │ Write Operation
           ↓
  
  문제점:
  1. Firewall/Network 차단
  2. Authentication Complexity
  3. Audit Trail 불명확
  4. Change Management 오버헤드
  5. → 결국 작동 불가능

sapstack: Evidence Loop 모델 (해결책):
  
  ┌──────────────────────────────────────┐
  │ sapstack (Claude-powered AI)        │
  │ ├─ ST05 (SQL Trace) 분석            │
  │ ├─ SM21 (System Log) 수집            │
  │ ├─ FBL3N (GL Ledger) 쿼리           │
  │ └─ FB09 (Balance Sheet) 조회         │
  │ → 모두 READ-ONLY ✓                  │
  └──────────────────────────────────────┘
           │ (정보만 수집)
           ↓
  ┌──────────────────────────────────────┐
  │ SAP System (데이터 소스로만 사용)   │
  │ ├─ No Write Operation                │
  │ ├─ No RFC Function                   │
  │ ├─ No Authentication Risk            │
  │ └─ Audit-Compliant ✓                │
  └──────────────────────────────────────┘
           │ (정보 출력)
           ↓
  ┌──────────────────────────────────────┐
  │ Finance Manager (인간 의사결정)     │
  │ ├─ "근본원인이 무엇인가?"            │
  │ ├─ "다음 액션은?"                   │
  │ └─ "승인하시겠습니까?"               │
  └──────────────────────────────────────┘
           │ (이제 Manager가 T-code 실행)
           ↓
  ┌──────────────────────────────────────┐
  │ SAP System (인간이 조작)            │
  │ ├─ Manager: F.16 (Approval) 실행   │
  │ ├─ FBU1 (Cross-Company Clearing)   │
  │ ├─ FB50 (Manual Posting)           │
  │ └─ Audit Log: "User: FINANCE_MGR" ✓│
  └──────────────────────────────────────┘

Why This Works:
  ✓ No Network/Firewall Barriers
  ✓ Audit Trail Clear (Manager가 실행, Log에 기록)
  ✓ Authorization Verified (Manager 권한으로 실행)
  ✓ Change Management 우회 (새 RFC 개발 불필요)
  ✓ Compliance-Ready (K-SOX, J-SOX 만족)
```

### 3.2 sapstack의 실제 가치

**"분석" 역량만으로도 CFO의 70% 시간 절감**:

```
Before sapstack:

Monday Morning (매주 월요일 9:00 AM)
  └─ Finance Manager
      ├─ "지난주 결산은 어떻게 됐나요?"
      ├─ Manual Log Check:
      │   ├─ SM21 열기 (5분)
      │   ├─ "에러가 몇 개 보이는데..." (Scroll through 100+ entries)
      │   ├─ "어느 건이 중요한지 몰라서..." (스크린샷 저장)
      │   └─ 결국 IT한테 물어봄 (메일 + 회신 대기 2시간)
      │
      ├─ Manual Reconciliation:
      │   ├─ FBL3N 조회 (매번 filter 수동 입력)
      │   ├─ Excel Export (10분)
      │   ├─ 손으로 계산 (또는 수식 작성, 15분)
      │   └─ "차이가 있는데..." (근본원인 불명)
      │
      ├─ Manual GL Analysis:
      │   ├─ FB09 5-6번 실행
      │   ├─ 각 계정별 데이터 정리 (30분)
      │   └─ "음... 이 숫자가 대략 맞는 것 같은데"
      │
      └─ 결국: 정확한 진단 없이 "문제 있을 것 같은데, 자세히는 몰라"

Actual Outcome: 3시간 시간 낭비, 근본원인 불명 → 문제 반복
```

**After sapstack**:

```
Monday Morning (매주 월요일 9:05 AM)
  └─ Finance Manager
      ├─ Slack에 sapstack Report 받음
      │   ├─ "Period Close Status: CC 1000 ✓, CC 1100 ⚠️"
      │   ├─ "Root Cause: IC Receivable 미결제 50M (FBU1 미실행)"
      │   ├─ "근거:"
      │   │   ├─ SM21 Log: "GL 190000 불일치"
      │   │   ├─ FBL3N: "CC 1100 AR 50M vs 기대값 0"
      │   │   └─ FB09: "GL 150000 양측 +45M/-50M 불일치"
      │   │
      │   ├─ "Action Items:"
      │   │   ├─ 1. FBU1 실행 (소요시간: 15분)"
      │   │   ├─ 2. GL 재검증 (소요시간: 10분)"
      │   │   └─ 3. FCMONITOR 확인 (소요시간: 5분)"
      │   │
      │   └─ "Impact: Period Close 지연 해결 (예상)"
      │
      └─ Manager: "아, FBU1이구나. 지금 바로 실행할게"
         (T-code FBU1 실행, 15분 후 완료)

Actual Outcome: 30분 만에 근본원인 파악 + 해결 (vs 3시간 전)
```

---

## 4. 미래 전망: On-Premise 망분리의 지속성

### 4.1 S/4HANA Cloud vs On-Premise

**트렌드 분석**:

```
SAP Adoption Trend (2024-2030):

Global (USA, 유럽):
  ├─ S/4HANA Cloud: 60% (증가 추세)
  ├─ On-Premise: 25% (감소, 레거시만)
  └─ Hybrid: 15% (전환 기간)

Asia-Pacific (한국, 일본, 중국):
  ├─ S/4HANA Cloud: 20% (증가 중)
  ├─ On-Premise: 70% (여전히 주류)
  │   └─ 이유: 망분리 요구, 규제, 데이터 주권
  └─ Hybrid: 10%

한국 특수 (금융, 제조, 대기업):
  ├─ On-Premise: 80% (계속 유지)
  │   └─ 이유:
  │       ├─ 망분리 (국방부 기준)
  │       ├─ SOC 자체 운영 (IT 투자)
  │       ├─ 규제 (금융감독청, 개인정보 보호)
  │       └─ 레거시 시스템 (20년 운영, 변경 비용 > Cloud 비용)
  │
  └─ Cloud: 5% (신규 프로젝트만)
      └─ 예: Fiori Launchpad, Analytics Cloud (Hybrid)
```

### 4.2 OData API 확대 (미래 개선)

```
S/4HANA Cloud의 강점: 표준 OData API

T-code: /IWFND/C_SERV_CATALOG (Service Catalog)

Available OData Services (S/4HANA Cloud):
├─ C_GLAccountBalance
├─ C_InvoiceHeaderStatus
├─ C_PurchaseOrderItemBasic
├─ C_SalesOrderItem
├─ C_VendorList
└─ ... (500+ Pre-built APIs)

Benefits:
  ├─ Standard REST (vs SAP-proprietary RFC)
  ├─ Modern Authentication (OAuth)
  ├─ Documentation (Swagger/OpenAPI)
  └─ SDK Support (Java, Python, Node.js)

Limitation:
  └─ On-Premise는 여전히 제한적 (Custom RFC or OData Adapter)
```

### 4.3 SAP Business AI의 영향

```
SAP Business AI (2024 새로 출시):

Scope:
  ├─ Anomaly Detection (이상 거래 감지)
  ├─ Predictive Maintenance (공장 설비 예측)
  ├─ Demand Forecasting (매출 예측)
  └─ Fraud Detection (부정 거래 적발)

Architecture:
  ├─ On-Premise: Limited (Connector via Cloud)
  ├─ Cloud: Full (Native Integration)
  └─ Hybrid: Recommended

How It Relates to sapstack:
  ├─ Overlap: Anomaly Detection (sapstack도 함)
  ├─ Difference:
  │   ├─ SAP AI: Built-in, Black-box
  │   ├─ sapstack: Transparent, Evidence-based
  │   └─ Positioning: Complementary (Not competitive)
  │
  └─ Future: "sapstack + SAP AI" 통합 가능
      (sapstack은 진단, SAP AI는 예측)
```

---

## 5. sapstack의 장기 포지셔닝

### 5.1 Unique Value Proposition

```
경쟁사 vs sapstack 비교:

SAP Activate (SAP 공식 Methodology):
  ├─ 강점: SAP 내부 expertise
  ├─ 약점: High-touch (비용 $1M+), 느림 (6-12개월)
  └─ 한계: On-Premise 망분리 환경 미지원

EY, Deloitte (Big 4 Consultant):
  ├─ 강점: 경험 풍부, 전역 지원
  ├─ 약점: Cost prohibitive ($5M+), 시간 (12-18개월)
  └─ 한계: 일반 Methodology, SAP 특화 부족

Automation Tools (RPA, Integration Platforms):
  ├─ UiPath, Blue Prism
  ├─ 강점: 자동화 능력
  ├─ 약점: RFC 쓰기 불가능 (Firewall), "how" 분석 약함
  └─ 한계: AI 분석 능력 없음

sapstack:
  ├─ 강점:
  │   ├─ Read-Only diagnostics (Firewall 우회)
  │   ├─ Evidence-based reasoning (근본원인 파악)
  │   ├─ AI-driven (저비용, 빠름)
  │   ├─ On-Premise 망분리 친화적
  │   └─ Compliance-ready (감사 준법)
  │
  ├─ 약점:
  │   ├─ "Read-Only 진단만 가능" (쓰기 불가능)
  │   └─ 인간 실행자 필요 (완전 자동화 아님)
  │
  └─ 포지셔닝:
      "금융/제조 대기업의 망분리 환경에서
       감사 준법을 유지하면서
       SAP 운영 효율을 높이는 AI 진단 도구"
```

### 5.2 한국 시장 적응성

```
한국 대기업의 현실 문제:

1. 망분리 (Network Isolation)
   └─ 문제: "IT 팀과 AI 시스템이 분리된 망에 있음"
   └─ sapstack: "Read-Only 진단이므로 접근 가능"
   └─ 가치: "유일한 솔루션" ✓

2. SOX 감시 (Internal Audit)
   └─ 문제: "자동화가 감사 기록을 지우면 안 됨"
   └─ sapstack: "인간이 실행, Log에 기록"
   └─ 가치: "감사팀이 인증함"

3. 회계 결산 기간 단축
   └─ 문제: "월말 10일이 필수 (수동 검증)"
   └─ sapstack: "근본원인 1시간 내 파악"
   └─ 가치: "결산 1-2일 단축 (CPA시간 감소)" ✓

4. 비용 압박
   └─ 문제: "Big 4 consultant는 $5M 이상"
   └─ sapstack: "월 $5K-$10K" (1/1000 비용)
   └─ 가치: "ROI 12개월 이내" ✓

5. 인력 부족 (보유 인력만으로 운영)
   └─ 문제: "FP&A 팀이 적음, 컨설턴트 고용 불가"
   └─ sapstack: "AI가 보조, 사람은 의사결정만"
   └─ 가치: "유한한 인력으로 더 많이 분석" ✓
```

---

## 결론: "읽기는 쓰기보다 낫다"

### Core Philosophy

```
Traditional Integration:
  AI → Write to SAP
  
Problem:
  ├─ Network barriers
  ├─ Security concerns
  ├─ Audit trail issues
  ├─ Change management overhead
  └─ Compliance risk
  
Result: FAILS in regulated enterprise (망분리 환경)

sapstack Approach:
  AI → Read from SAP → Analyze → Recommend to Humans
  
Why It Works:
  ├─ No network barriers (Read-only is allowed)
  ├─ No security concerns (No write access)
  ├─ Clear audit trail (Human executes, SAP logs it)
  ├─ No change management (No RFC development)
  └─ Compliance-safe (Meets K-SOX, J-SOX)
  
Result: SUCCEEDS in regulated enterprise ✓

Key Insight:
└─ "The most powerful AI in finance is one that
    empowers humans to make better decisions,
    not one that tries to replace them."
```

### sapstack의 최종 포지셔닝

```
타겟 시장:
  ├─ 망분리 환경 (한국, 일본, 중국, 싱가포르)
  ├─ SOX 감시 기업 (상장사)
  ├─ 결산 효율화 필요 (월말 기간 단축)
  └─ IT 예산 제약 (Big 4 Consultant 비용 불가)

가치 제안:
  ├─ "SAP 문제를 1시간 내 진단" (vs 2-3일 수동)
  ├─ "감사 준법" (Read-Only, 인간 실행)
  ├─ "저비용" ($5K/월, vs Big 4의 $5M)
  └─ "빠른 구현" (2주, vs 6개월)

성공 지표:
  ├─ 결산 기간 10% 단축 (예: 10일 → 9일)
  ├─ FP&A 팀 시간 30% 절감
  ├─ 오류 감지 99% (vs 수동 80%)
  └─ ROI 12개월 내 (비용 회수)

"sapstack은 현실적이고 실현 가능한 Enterprise SAP AI Solution이다."
```

---

## 부록: Read-Only T-code 활용 매뉴얼

**자주 사용하는 진단용 T-code**:

| T-code | 목적 | 출력물 | 빈도 |
|--------|------|--------|------|
| ST05 | SQL Trace | Query Log + Performance | Weekly |
| SM21 | System Log | Error/Warning Messages | Daily |
| SM37 | Batch Job Log | Job Status + Return Code | Daily |
| SE16N | Data Browser | Table Data (Excel) | As-needed |
| FB09 | GL Account Balance | GL Balance + Line Items | Daily |
| FBL3N | Vendor Ledger | AR/AP Aging | Daily |
| FBL1N | Customer Ledger | Customer Balance | Daily |
| MIRO | Invoice Status | Invoice Log | Weekly |
| VA01 | Sales Order | Order Trace | Weekly |
| MB51 | Material Movement | Stock History | Weekly |
| FCMONITOR | Period Close | Close Status + Timeline | Monthly |
| PFCG | Role/User | Authorization Report | Monthly |

모두 **Read-Only**, 모두 **Export 가능**, 모두 **Audit-safe**.

이것이 sapstack의 기반이다.
