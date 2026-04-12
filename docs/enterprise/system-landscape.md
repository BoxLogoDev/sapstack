# SAP 시스템 랜드스케이프 설계

## 개요

대규모 SAP 환경에서는 **단일 인스턴스**로 운영하지 않는다. Development → Quality → Production의 3-tier 표준이 필수이며, Sandbox, Training 등 추가 시스템이 필요하다.

**sapstack의 역할**: 분산된 여러 SAP 시스템의 상태를 일괄 모니터링하고, Transport 경로의 병목을 식별하며, System Refresh 후 데이터 일관성을 검증한다.

---

## 1. 3-Tier 표준 아키텍처

### 기본 구조

```
┌─────────────────────────────────────────────────────────┐
│                   SAP Landscape                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DEV System              QAS System              PRD    │
│  (ERP-DEV)             (ERP-QAS)              (ERP-PRD) │
│                                                         │
│  ├─ Client 000        ├─ Client 000         ├─ Client  │
│  │  (System)          │  (Sandbox)           │  000     │
│  │                    │                      │  (Ref)   │
│  ├─ Client 100        ├─ Client 100         ├─ Client  │
│  │  (Development)     │  (UAT/QA)           │  100     │
│  │                    │                      │  (Gold)  │
│  ├─ Client 200        ├─ Client 200         ├─ Client  │
│  │  (Train)           │  (Training)         │  200     │
│  │                    │                      │  (Test)  │
│  └─ Client 300        └─ Client 300         └─ Client  │
│     (Sandbox)            (Extended)            300     │
│                                                │  (Prod) │
│                                                         │
│  Database: H2 (in-memory)    HANA (10GB)      HANA     │
│  Size: Small                 Medium           (2.5TB)  │
│  Backup: Daily               Daily            Hourly   │
│  Users: 50-100               500-1000         1000+    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 각 계층의 역할

| 계층 | 목적 | 사용자 | 데이터 | 백업 주기 |
|------|------|--------|--------|----------|
| **DEV** | 설계, 개발, 테스트 | 개발자 (100명) | 마스터 복사본 (60%) | 주 1회 |
| **QAS** | UAT, 통합테스트, 성능테스트 | QA (500명), 사용자 그룹 | PRD 기반 (주 1회 갱신) | 일 1회 |
| **PRD** | 실제 운영 | End User (1000+) | Live Data | 시간 1회 |

---

## 2. Client 전략

### SAP Client 개념

Client는 **회사별 독립 데이터 공간**. 마스터 데이터는 공유 가능하나, 거래 데이터는 격리된다.

### 표준 Client 구성

#### DEV System

```
Client 000 (System Reference)
  ├─ Master Data: 모든 회사 기준 데이터
  ├─ Configuration: 표준 설정 (CoA, Plant, Material Type)
  ├─ Read-Only: Transport 소스로만 사용
  └─ Owner: System Administrator

Client 100 (Development)
  ├─ Company Code: 1000 (한국 본사 Mock)
  ├─ Master Data: 실제 테스트용 복사본
  ├─ Configuration: 개발자가 커스터마이징
  ├─ Users: 개발자 80명
  └─ Reset Frequency: 월 1회 (Client 000에서 복사)

Client 200 (Training)
  ├─ Scenario: 신입 직원 교육용 프로세스 샘플
  ├─ Master Data: 단순화된 구조 (회사 1, 플랜트 1, 자재 100)
  ├─ Users: 교육담당 + 신입 (최대 20명/배치)
  ├─ Read-Only: 교육용이므로 데이터 변경 최소화
  └─ Reset Frequency: 주 1회

Client 300 (Sandbox)
  ├─ Purpose: POC, Prototype, "What-If" Analysis
  ├─ Master Data: 샘플 데이터만 포함
  ├─ Configuration: 실험적 설정 허용
  ├─ Users: Consultant, IT Manager (권한 제한 없음)
  └─ Reset Frequency: 요청 시 (On-Demand)
```

#### QAS System (준운영 환경)

```
Client 000 (Reference)
  └─ 읽기 전용

Client 100 (UAT/QA)
  ├─ Master Data: PRD에서 주 1회 복사 (KPIO)
  ├─ Transaction Data: 테스트용 샘플 + PRD 스냅샷
  ├─ Configuration: DEV에서 Transport된 정의 그대로
  ├─ Users: QA 팀 (500명), 사용자 그룹 대표
  ├─ Reset Frequency: 월 2회 (PRD 동기화)
  └─ SLA: "PRD와 동일한 성능 환경" (98% 일치)

Client 200 (Training)
  ├─ Master Data: DEV와 동일 (월 1회 갱신)
  ├─ Users: 신입 교육 (공식 프로세스)
  └─ Access: "DEV Client 200과 동일 구조"

Client 300 (Extended QA)
  ├─ Purpose: 장기 통합테스트 (예: 90일 프로세스)
  ├─ Master Data: 실제와 유사하되 익명화
  ├─ Example: 고객명 "CUST-0001" (실제 고객명 제거)
  └─ GDPR 준수: 개인정보 마스킹 필수
```

#### PRD System (운영)

```
Client 000 (Reference)
  └─ 읽기 전용 (감사, 추적용)

Client 100 (Production)
  ├─ Master Data: 실제 회사 기준 데이터
  ├─ Transaction Data: Live (과거 10년)
  ├─ Users: 전 직원 (1000+)
  ├─ Backup: Hourly (RPO = 1시간)
  ├─ Archive: 7년 이상 데이터 Archive (SARA)
  └─ Access Control: 엄격한 권한 관리 (SoD)

Client 200 (Optional Testing)
  ├─ Purpose: 본운영 직전 Final Test
  ├─ Master Data: PRD와 동일 (일일 동기화)
  ├─ Use Case: "새 세금계산서 프로세스 최종 검증"
  └─ Users: 선정된 파워 유저 (50명)

Client 300 (Support/Hotfix)
  ├─ Purpose: 긴급 패치 검증 (본운영 배포 전)
  ├─ Master Data: PRD와 동일
  ├─ Lifecycle: "패치 검증 후 삭제" (저장하지 않음)
  └─ Users: Support 팀만 (5명)
```

---

## 3. Transport 경로 및 변경관리

### Transport 개념

변경 사항(Code, Configuration, Master Data)을 DEV → QAS → PRD로 단계별 이동시키는 프로세스.

### 표준 Transport 경로 (STMS)

```
┌──────────────────────────────────────────────────────────┐
│        Transport Management System (TMS)                 │
└──────────────────────────────────────────────────────────┘

Transport Domain:
  Default Route:
    DEV (Source)
      │
      └─→ YDEP (S4000001001) 
          └─→ Quality Assurance Layer
              │
              └─→ QAS (Quality)
                  │
                  └─→ YDEP (S4000001002)
                      └─→ Production Layer
                          │
                          └─→ PRD (Production)
```

### Transport 생성 및 배포

**T-code: SE10** (Transport Organizer)

```
1. Development (DEV Client 100)
   └─ Customizing Request 생성
      ├─ Request Type: "Normal"
      ├─ Description: "FI: New GL Account for IFRS 16"
      ├─ T-codes Modified:
      │   ├─ FS00 (G/L Master)
      │   ├─ OKB1 (Controlling Area)
      │   └─ FS06 (Document Header)
      └─ Request ID: DEVK900001

2. Quality Check (DEV)
   └─ SE10 → "DEVK900001" 선택
      ├─ Syntax Check
      ├─ Authorization Check
      └─ Release
      
3. Transport to QAS
   └─ T-code: STMS (Transport Mgmt)
      ├─ Select DEVK900001
      ├─ Target System: QAS
      ├─ Forward
      └─ Status: "Imported to QAS"

4. UAT Testing (QAS Client 100)
   └─ Functional Team 검증
      ├─ GL Account 생성 확인
      ├─ Controlling Area 업데이트 확인
      └─ Result: PASS ✓

5. Transport to PRD
   └─ STMS → Forward to PRD
      ├─ Change Advisory Board (CAB) 승인 필수
      ├─ Maintenance Window: 일요일 22:00-06:00
      └─ Status: "Imported to PRD"

6. Post-Implementation Verification
   └─ PRD Client 100에서 확인
      ├─ GL Account 조회 (FS10N)
      ├─ Controlling 계산 재실행 (KOAK)
      └─ Result: PASS ✓
```

### Transport 유형

| 유형 | 대상 | 예시 | 승인 |
|------|------|------|------|
| **Customizing** | Configuration | CoA, Tax Code 정의 | Manager |
| **Workbench** | Code, Form | ABAP Program, ALV Report | Developer Lead |
| **User-Specific** | End User 설정 | Role, Variant | System Admin |
| **Language Transport** | Translation | 메뉴 번역, 라벨 | 번역팀 |

---

## 4. System Refresh (PRD → QAS 복사)

### Refresh 목적

PRD의 실제 데이터로 QAS를 주기적으로 갱신하여, QAS가 PRD 환경과 일치하도록 유지.

### Refresh 절차 (T-code: KPIO)

```
1. Preparation Phase (PRD)
   ├─ Full Backup (SAP 백업 + Database 백업)
   ├─ Archive Log: 보존용 백업 생성 (SARA)
   ├─ Notification: 사용자에게 Downtime 공지
   └─ Lock: PRD 읽기 전용 모드 (23:00)

2. Database Copy
   ├─ Source: PRD Database (2.5 TB)
   ├─ Target: QAS Database (기존 데이터 덮어쓰기)
   ├─ Method: SAP Database Export/Import
   ├─ Time: 약 4시간
   └─ Verification: Checksum 비교

3. Post-Refresh (QAS)
   ├─ Client Lock/Unlock
   │   ├─ Client 100: Unlock (UAT 진행)
   │   ├─ Client 200: Lock (교육 데이터 보존)
   │   └─ Client 300: 삭제 또는 Refresh
   │
   ├─ Master Data Verification
   │   ├─ T-code SM4: "Check logical systems"
   │   ├─ T-code KPCO: "Verify CO configuration"
   │   └─ T-code OBYA: "Check document types"
   │
   ├─ Batch Job 정책
   │   ├─ PRD Batch Jobs: 모두 비활성화
   │   │   (예: 자동 결산, 급여 처리 등)
   │   ├─ QAS Test Batch Jobs: 활성화
   │   │   (예: 통합 테스트용 데이터 생성)
   │   └─ Schedule: 월 1회 (월요일 06:00)
   │
   ├─ User 초기화 (SU01)
   │   ├─ External User (Partner): 비활성화
   │   ├─ QA User (Internal): 활성화
   │   ├─ Password Reset: 임시 패스워드 생성
   │   └─ Security: RFC 암호 초기화 (설정에서만 접근 가능)
   │
   └─ Data Privacy (GDPR 준수)
       ├─ Personal Data Masking (이름, 이메일)
       └─ Sensitive Data Encryption (급여, 계약금액)

4. Notification & Release (06:00 이후)
   └─ Email: "QAS Refresh 완료"
      ├─ "Client 100: PRD와 동기화됨 (데이터: 2024-04-10 23:00 기준)"
      ├─ "프로세스 테스트 개시 가능"
      └─ "문제 발생 시 helpdesk@company.com 연락"
```

### sapstack의 역할: Refresh 검증

```
Post-Refresh Validation (자동):

1. Data Completeness
   ├─ Table Count Check: PRD vs QAS
   │   └─ MARA (Material Master): PRD 50,000 vs QAS 50,000 ✓
   │   └─ KNA1 (Customer): PRD 20,000 vs QAS 20,000 ✓
   │   └─ LFA1 (Vendor): PRD 10,000 vs QAS 10,000 ✓
   │
   ├─ GL Balance Check: PRD vs QAS
   │   └─ Total Assets: PRD 1,000억 vs QAS 999,999,999천원 (±1천원, OK)
   │   └─ Retained Earnings: PRD vs QAS 일치율 99.99%
   │
   └─ Transaction Volume:
       └─ April 거래: PRD 100,000건 vs QAS 100,000건 ✓

2. Configuration Integrity
   ├─ CoA (Chart of Accounts): "H1" 확인
   ├─ Controlling Area: "KOREA_CO" 정의 확인
   ├─ Company Code: 1000-1300 모두 활성 확인
   └─ Sales Organization: 모든 region 동기화 확인

3. Batch Job Status
   ├─ Check: SM37 (Job Log)
   ├─ Issue: "PRD의 자동 급여 처리 job이 여전히 활성화됨"
   └─ Action: "QAS에서 비활성화 (T-code SM36)"

4. User Access
   ├─ External User (Partner): "3000명 모두 비활성 확인 ✓"
   ├─ QA User (Internal): "500명 모두 활성 확인 ✓"
   └─ Warning: "임시 패스워드 설정 모드로 로그인 필수"

sapstack Report:
"QAS Refresh Status: GREEN ✓
Data Sync: 99.99% (허용 범위)
Configuration: 100% Aligned
Ready for UAT: YES"
```

---

## 5. 한국 특수: 망분리 환경

### 망분리 구조

```
Internet Segment (인터넷망)
  ├─ SAP Cloud (BTP, Fiori)
  ├─ External Communication (EDI, Portal)
  └─ 3rd Party Integration (Google, AWS)

Firewall (방화벽)
  └─ DMZ (접근 제어 서버)

Business Network (업무망)
  ├─ SAP System (On-Premise)
  │   ├─ ERP-DEV
  │   ├─ ERP-QAS
  │   └─ ERP-PRD
  │
  ├─ Database
  │   └─ HANA, Backup Storage
  │
  └─ Office Network
      ├─ Finance Team PC (Finance.company.com)
      ├─ Supply Chain Team PC
      └─ HR Team PC

Dev Network (개발망)
  ├─ Development PC
  ├─ GIT Repository
  └─ CI/CD Pipeline
```

### 접근 제어

**IPAddress Whitelist (방화벽 규칙)**:

```
SAP PRD System (10.20.30.40)
  ├─ Inbound
  │   ├─ Finance Network (10.20.30.0/24): Port 3300 (nisp)
  │   ├─ AP Team (10.20.31.0/24): Port 3300
  │   ├─ SSC Center (10.20.32.0/24): Port 3300
  │   ├─ Support Desk (10.20.33.0/24): Port 3300
  │   └─ (기타 IP 모두 DENY)
  │
  └─ Outbound
      ├─ Database Server (10.20.30.50): Port 3606 (HANA)
      ├─ Backup Storage (10.20.40.0/24): Port 445 (SMB)
      ├─ Printer (10.20.30.100): Port 515 (LPD)
      └─ (인터넷 모두 DENY)

sapstack Monitoring:
"Policy Check: IP Whitelist vs 실제 로그인 IP"
├─ 정상: "User AP_KR_001 from 10.20.30.15" ✓
├─ 경고: "User ADMIN from 10.40.50.60 (미승인 IP)" ⚠️
└─ 조치: "비정상 로그인 차단, IT Security 알림"
```

---

## 6. S/4HANA 특수: Embedded BTP & Fiori

### 아키텍처

```
On-Premise S/4HANA 2023
  ├─ SAP System Core
  │   └─ ERP (FI, CO, MM, SD, HCM, ...)
  │
  ├─ HANA Database
  │   └─ In-Memory Computing (계산 가속)
  │
  └─ Embedded BTP (SAP Business Technology Platform)
      ├─ SAP Fiori Launchpad (Portal)
      │   └─ Fiori Apps (모바일/웹 UI)
      │
      ├─ Integration Suite
      │   └─ Cloud Connector (On-Prem ↔ Cloud 통신)
      │
      └─ Analytics (SAP Analytics Cloud)
          └─ Dashboard, KPI 추적
```

### Fiori App 배포

**Fiori 롤아웃 전략**:

```
Phase 1: DEV (2주)
  └─ Fiori App 개발 (SAP Fiori Elements, SAPUI5)
     ├─ App: Invoice Approval
     ├─ OData Service: /sap/opu/odata/sap/C_INVOICEBILLPROJECTION
     ├─ Launchpad Role: "AP_MANAGER"
     └─ Test: "Approve Invoice 기능 검증"

Phase 2: QAS (3주)
  └─ Transport: DEVK900002
     ├─ OData Service 배포
     ├─ Fiori App 배포
     ├─ Launchpad Tile 설정
     └─ UAT: "사용자 그룹 테스트"

Phase 3: PRD (1주)
  └─ CAB 승인 + Deployment
     ├─ Fiori App Live
     ├─ User Training (2시간)
     └─ Go-Live Support (첫 1주)
```

### BTP Integration (클라우드 연동)

**예: 전자세금계산서 연동**

```
On-Premise (Private)
  └─ SAP FI Module
      └─ Invoice Data (VBILLx 테이블)

Cloud (BTP)
  └─ Integration Suite
      ├─ iFlow: SAP-to-NHISs (국세청)
      ├─ Scheduler: 일일 자동 동기화
      └─ Error Handling: Failed 거래 알림

Process:
1. PRD에서 Invoice 생성 (FBU1)
2. iFlow 자동 실행 → NHISs에 전자세금계산서 전송
3. NHISs 응답 → SAP GL 자동 게시 (성공/실패)
4. sapstack Monitoring: "Daily e-Invoice Sync Status"
   └─ Success Rate: 99.5%
   └─ Failed: 3건 (발송자 ID 오류 2건, 금액 차이 1건)
```

---

## 7. 멀티 인스턴스 vs 싱글 인스턴스

### 비교 분석

| 항목 | 싱글 인스턴스 | 멀티 인스턴스 |
|------|--------------|-------------|
| **구축 비용** | 낮음 ($500K) | 높음 ($1.5M) |
| **유지보수 비용** | 낮음 (1명) | 높음 (3-4명) |
| **데이터 동기화** | 실시간 | 시간 지연 (보통 6시간) |
| **확장성** | 중간 (2000명 한계) | 높음 (10000+ 가능) |
| **장애 격리** | 불가 (전체 다운) | 가능 (한 인스턴스만 다운) |
| **지역 규정 준수** | 어려움 | 용이 (각 인스턴스별 설정) |
| **Performance** | 좋음 (DB 통합) | 중간 (네트워크 지연) |
| **보안** | 중간 | 높음 (지역별 격리) |

### 한국 대기업 사례

**Samsung**: 싱글 인스턴스 (S/4HANA 2023)
```
Rationale:
- 그룹사 20개, 직원 30만 명
- 중앙 집중식 관제 선호
- 글로벌 실시간 보고 필요
- IT 투자 여력 충분

Landscape:
├─ ERP-DEV: 서울 데이터센터
├─ ERP-QAS: 서울 (Redundant)
└─ ERP-PRD: 서울 (Primary) + 대구 (HA)

Pros: Real-time GL consolidation, Single Master Data
Cons: Single point of failure (완화: HA/DR 투자)
```

**LG Electronics**: 멀티 인스턴스 (Regional Hubs)
```
Rationale:
- 지역별 회계 기준 다름 (한국, 일본, 미국)
- 독립적 IT 운영 조직
- 규제 준수 (GDPR, K-SOX)

Landscape:
├─ APAc Instance (한국 시드, 일본/인도 연결)
├─ EMEA Instance (독일 시드)
└─ AMER Instance (미국 시드)

MDG System (중앙 Hub)
  └─ Master Data 동기화 (일일 6시간)

Pros: Regional autonomy, Compliance, Disaster isolation
Cons: Master Data complexity, Consolidation lag
```

---

## 8. Transport 병목 분석 (sapstack 사용 사례)

### 시나리오: "Transport 지연 문제"

```
증상:
- 월별 Transport 14개 (정상: 10개)
- "QAS에서 3주 이상 대기" → PRD 배포 지연
- CFO: "새 GL Account가 3개월 지난 후 본운영 반영"

sapstack Evidence Loop:

1. STMS History 분석
   └─ DEVK900010: 4월 3일 생성
              │
              ├─ DEV 릴리스: 4월 10일 (7일 소요)
              ├─ QAS Import: 4월 10일
              ├─ QAS Testing: 4월 10-25일 (15일)
              │   └─ Issue: "GL Account 생성 OK, 하지만 보고서에서 누락"
              │   └─ Root Cause: "Controlling Area KOREA_CO에 신 GL을 매핑하지 않음"
              │
              ├─ Fix: 4월 26일 (새 Transport DEVK900011)
              │ (DEV로 복구 → 테스트 재실행 → 7일 소요)
              │
              ├─ QAS Re-Import: 5월 3일
              ├─ QAS Re-Testing: 5월 3-10일 (OK)
              │
              ├─ PRD 배포: 5월 15일 (CAB 승인 2주 기다림)
              │
              └─ 총 소요시간: 42일 (정상 대비 +32일)

2. Quality Assurance 프로세스 분석
   ├─ Issue 1: QAS에서 Configuration 검증 부족
   │   "Controlling Area 매핑 확인" 체크리스트 미흡
   │
   ├─ Issue 2: DEV 테스트 부족
   │   "신 GL을 report에서 조회하는 Integration Test 없음"
   │
   └─ Issue 3: Transport Scheduling 유연성 부족
       "매주 목요일만 QAS→PRD Transport 가능" (병목)

3. Performance Analysis
   └─ Transport Wait Time by Phase:
       ├─ DEV Design & Testing: 7일 (정상)
       ├─ DEV to QAS: 0일 (자동)
       ├─ QAS Testing: 15일 (정상 대비 +5일) ← 병목!
       │   └─ 원인: Configuration 재검증
       │
       ├─ QAS to PRD Queue: 14일 (정상 대비 +7일) ← 병목!
       │   └─ 원인: CAB 승인 일정 (월 2회만 가능)
       │
       └─ PRD Deployment: 0일 (자동)

sapstack Diagnosis:
"Transport Cycle 42일 (표준 10일 대비 4배 초과).

병목 3가지:
1. QAS Testing 방법론 부족 (Integration Test 추가 필요)
2. CAB Approval 스케줄 병목 (월 2회 → 주 1회 확대 제안)
3. Transport Scheduling 유연성 부족 (Emergency Transport 절차 부재)

Recommendations (우선순위):

P1. QAS Testing Checklist 강화 (예상 효과: -5일)
    ├─ Configuration Mapping 자동 검증
    ├─ Integration Test Suite (ALV, Report)
    └─ Data Consistency Check (GL Balance, IC Reconciliation)

P2. CAB Meeting 주 2회 확대 (예상 효과: -7일)
    ├─ 기존: 월 1회 CAB (5월 15일)
    ├─ 신규: 주 2회 CAB (매주 월/목)
    └─ Impact: Transport 대기 시간 50% 감소

P3. Emergency Transport 절차 수립 (예상 효과: -3일)
    ├─ Urgency Level 3단계 정의 (Critical/High/Normal)
    ├─ Critical: 바로 배포 (예: 세금 규칙 변경)
    └─ High: 7일 이내 배포

Expected Outcome: 42일 → 27일 (35% 단축, 표준 10일으로 수렴)
"
```

---

## 9. System Landscape 체크리스트

### 분기별 검증

| 활동 | 담당 | T-code | 주기 |
|------|------|--------|------|
| Client Configuration 검증 | SysAdmin | SCC4, SM4 | 분기 1회 |
| Transport Queue 모니터링 | CoE Lead | STMS, SE10 | 주 1회 |
| System Refresh (PRD→QAS) | DBA | KPIO, SARA | 월 1회 |
| Batch Job 정책 검토 | Ops | SM36, SM37 | 월 1회 |
| User Distribution 분석 | Security | SU01, SUIM | 분기 1회 |
| DR/HA 테스트 | DBA | SAP Backup | 연 2회 |
| Performance Baseline | Performance | ST03, ST04 | 월 1회 |

### 문제 해결 체크리스트

| 증상 | 진단 | 처방 |
|------|------|------|
| Transport 실패 | SE10 → Error Log | Customizing Objects 재검증 |
| System Refresh 시간 초과 | KPIO Log | Database 크기 증가 확인 (DSPACE) |
| Batch Job 미실행 | SM37 → Job Log | Schedule 재설정 (SM36) 또는 Dependencies 확인 |
| 사용자 권한 문제 | SUIM → SoD Violation | Role 재할당 (PFCG) |
| Performance 저하 | ST03 → Response Time 분석 | Index 재생성 (DB02) 또는 Table Archive (SARA) |

---

## 결론

SAP 시스템 랜드스케이프는 **개발 생산성**, **품질 보증**, **운영 안정성**의 균형을 맞춰야 한다.

**sapstack의 역할**:

1. **Transport 병목 식별** → Historical Analysis (SE10 + STMS)
2. **System Refresh 검증** → Data Completeness & Configuration Integrity
3. **망분리 환경 모니터링** → IP Whitelist Compliance + Unauthorized Access Detection
4. **Performance Baseline 유지** → Landscape 간 비교 (DEV vs QAS vs PRD)
5. **Disaster Recovery 준비** → HA/DR 테스트 결과 추적

대규모 기업의 SAP 운영은 **"처리 속도"가 아니라 "안정성과 규정 준수"**가 핵심이다. sapstack이 이 요구사항을 자동화하는 도구다.
