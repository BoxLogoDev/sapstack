# 글로벌 롤아웃 전략

## 개요

SAP 도입은 단일 회사가 아닌 **글로벌 다중 회사, 다중 지역, 다중 언어**를 포함하는 복잡한 프로젝트다. Template 방식과 Phased 방식이 상충하고 있으며, 한국 대기업들은 고유한 "템플릿 + 현지화" 하이브리드를 선택하고 있다.

**sapstack의 역할**: 글로벌 롤아웃 과정에서 Master Data의 일관성을 유지하고, 지역별 Customization 편차를 추적하며, Transport 경로의 병렬 실행을 모니터링한다.

---

## 1. 글로벌 롤아웃 아키텍처

### 1.1 Template 접근법

**Core Template**:

```
Phase 1: Core Template 수립 (3개월)
  └─ Scope: 한국 본사 (Company Code 1000)
     ├─ FI (Finance): GL, Vendor, Customer
     ├─ CO (Controlling): Cost Center, Profit Center
     ├─ MM (Materials): Material Master, Plant
     ├─ SD (Sales): Sales Organization, Pricing
     ├─ HR (Human Capital): Organizational Structure, Payroll
     └─ Configuration: CoA (H1), Chart, Period Logic
     
  Template Output:
    ├─ "SAP_TEMPLATE_2024_KR.trp" (Transport Package)
    ├─ Master Data (Vendor, Material, Customer)
    └─ Configuration (Tax Rules, Pricing Logic, GL Account)

Phase 2: Regional Extensions (1개월/지역)
  └─ Japan Instance
     ├─ Template Import (Core Template)
     ├─ Local Extensions
     │   ├─ Tax Rules (Japan-specific: 소비세 8%)
     │   ├─ Bank Code (일본 은행 마스터)
     │   ├─ GL Account (일본 회계기준)
     │   └─ Payroll (일본 급여규칙)
     │
     └─ Validation:
         ├─ GL Balance ✓
         ├─ Vendor Count ✓
         └─ Configuration Completeness ✓

Phase 3: Rollout by Company Code
  └─ New Company Code 추가 (1주/회사)
     ├─ Clone from Template (Company Code 1000)
     ├─ Customize:
     │   ├─ Company Code Number (2000, 2100, 2200)
     │   ├─ Currency (USD, GBP, JPY)
     │   ├─ Tax ID (사업자등록번호)
     │   ├─ GL Accounts (지역 맞춤)
     │   └─ Payroll Rules (지역 맞춤)
     │
     └─ Test & Validation
         └─ "Go-Live Date: [Date]"
```

### 1.2 Phased Rollout vs Big Bang

**Phased Approach (권장)**:

```
Wave 1 (Month 1): Financial Module (FI/CO)
  ├─ Go-live: Korea (CC 1000)
  ├─ Scope: GL, AP, AR, Controlling
  ├─ Users: Finance Team (100 명)
  ├─ Benefits: GL Consolidation 자동화, Reporting 개선
  └─ Contingency: Old System (Legacy) 병행

Wave 2 (Month 3): Supply Chain (MM/SD)
  ├─ Go-live: Korea + Japan
  ├─ Scope: Purchase Order, Sales Order, Inventory
  ├─ Users: Procurement + Sales (300명)
  ├─ Benefits: End-to-End Order Visibility
  └─ Risk: Supply Chain Disruption 최소화 (필수 테스트)

Wave 3 (Month 6): Human Capital (HCM)
  ├─ Go-live: All Regions
  ├─ Scope: Payroll, Time & Attendance, Recruiting
  ├─ Users: HR + Employees (500명)
  ├─ Benefits: Payroll Automation
  └─ Risk: Employee Dissatisfaction (communication critical)

Wave 4 (Month 9): Analytics & Integration
  ├─ Go-live: All Regions
  ├─ Scope: Analytics Cloud, Fiori Launchpad
  ├─ Users: Executives + Power Users (200명)
  └─ Benefits: Real-time Reporting & Self-Service
```

**Big Bang (대규모만 가능)**:

```
장점:
  ├─ "한번에 끝남" (병행 운영 비용 ↓)
  ├─ Process Standardization 빠름
  └─ Master Data 일관성 높음

단점:
  ├─ 위험도 극대 (실패 시 전체 다운)
  ├─ Testing 시간 부족
  ├─ Go-Live 지원 복잡
  └─ Cutover 3-5일 고위험 (매년 1-2회사만 성공)

한국 사례: 삼성은 phased, SK그룹은 regional big bang 선택
```

---

## 2. Localization 전략

### 2.1 한국 특수 설정

**Tax & Legal**:

```
VAT (부가세):
  ├─ Standard Rate: 10%
  ├─ Reduced Rate: 0% (식품 등)
  ├─ Tax Code Setup (T-code FTXP):
  │   ├─ Code A0: 10% (일반)
  │   ├─ Code A1: 0% (면세)
  │   └─ Code A2: 0% (영세)
  │
  └─ e-Invoice (전자세금계산서):
      ├─ Format: XML (NTS 표준)
      ├─ Submission: T-code MVBU
      └─ Deadline: 발행일 + 3일

Income Tax (소득세):
  ├─ Corporate Rate: 10-25% (매출 기준)
  ├─ Withholding Tax: 3-20% (거래 유형별)
  └─ Filing: Annual (부가가치세 신고와 동시)

Social Insurance (사회보험):
  ├─ National Pension: 9% (회사 + 직원 4.5%)
  ├─ Health Insurance: 7% (회사 + 직원 3.5%)
  ├─ Employment Insurance: 0.9% (회사)
  └─ SAP Configuration (T-code PA61):
      └─ Payroll Rules로 자동 계산
```

**Chart of Accounts (K-IFRS 기준)**:

```
GL Structure (H1):
├─ 1xxxx: 자산
│   ├─ 10: 유동자산
│   │   ├─ 101: 현금및현금등가물
│   │   ├─ 102: 단기투자
│   │   ├─ 103: 미수금
│   │   └─ 104: 재고자산
│   │
│   └─ 15: 비유동자산
│       ├─ 151: 장기투자
│       └─ 152: 유형자산
│
├─ 2xxxx: 부채
│   ├─ 20: 유동부채
│   │   ├─ 201: 미지급금
│   │   └─ 202: 단기차입금
│   │
│   └─ 25: 비유동부채
│       ├─ 251: 장기차입금
│       └─ 252: 충당금
│
├─ 3xxxx: 자본
├─ 4xxxx: 수익
└─ 5xxxx: 비용
```

**Banking & Payment**:

```
T-code: FI12 (Payment Program)
├─ Bank Setup (T-code: FI12):
│   ├─ Bank Name: 국민은행, 신한은행, 우리은행
│   ├─ Account Format: 12-digit 계좌번호
│   └─ Payment Method: Domestic Wire, Check, Bill of Exchange
│
└─ Domestic Wire (국내 송금):
    ├─ SWIFT Code: 불필요 (국내)
    ├─ Bank Code + Account: 충분
    └─ Transmission Format: 전자금융
```

### 2.2 일본 Localization

**Tax & Legal**:

```
Consumption Tax (소비세):
  ├─ Standard Rate: 10%
  ├─ Reduced Rate: 8% (식품)
  ├─ Registration: 매출 3,000만 엔 이상

Income Tax (법인税):
  ├─ Central Rate: 23.2%
  ├─ Local Allocation Tax: 12.6% (지자체별 변동)
  └─ Total Effective: 約 36%

Social Insurance (社会保険):
  ├─ Employees' Pension Insurance: 9.15% (회사 + 직원 반반)
  ├─ Health Insurance: 10% (회사 + 직원 반반)
  └─ Employment Insurance: 0.95% (회사)
```

**Chart of Accounts (일본 회계기준)**:

```
GL Structure (H2):
├─ 1xxxx: 資産
├─ 2xxxx: 負債
├─ 3xxxx: 純資産
├─ 4xxxx: 売上高
├─ 5xxxx: 売上原価
├─ 6xxxx: 販管費
└─ 7xxxx: 営業外損益
```

**Payroll Specifics**:

```
T-code: PA30 (Employee Master)
├─ Employment Type: 正社員 (Full-time), 契約社員 (Contract)
├─ Base Salary: 月給 (Monthly)
├─ Bonus: 夏季・冬季・決算賞与 (3회/연)
└─ Overtime: 割増賃金 (1.25x, 1.5x)

T-code: PT01 (Payroll Run)
├─ Payroll Period: 毎月1日～月末
├─ Payment: 毎月25日（銀行振込）
└─ GL Posting: 自動（給与費用）
```

### 2.3 미국 Localization

**Tax & Legal**:

```
Sales Tax (판매세):
  ├─ Federal: 없음
  ├─ State: 0-10% (주별 상이)
  │   ├─ California: 7.25%-8.75%
  │   ├─ New York: 4%-8.875%
  │   └─ Texas: 6.25%-8.25%
  ├─ Local: City/County 추가 세금
  └─ Nexus 판정: 온라인 판매도 가우디함

Income Tax (소득세):
  ├─ Federal: 21% (Corporate)
  ├─ State: 0-13.3% (주별)
  │   └─ California: 8.84% (기업)
  │   └─ Texas: 0% (경쟁 유리)
  └─ Local: 도시별 추가

Payroll Specifics:
  ├─ Federal Income Tax: 급여에서 공제
  ├─ FICA (Social Security + Medicare):
  │   ├─ Social Security: 6.2% (회사 + 직원 각각)
  │   ├─ Medicare: 1.45% (회사 + 직원 각각)
  │   └─ Medicare Surtax: 0.9% (고소득층)
  │
  ├─ State Income Tax: 주별 상이 (또는 없음)
  └─ Unemployment Tax (FUTA): 0.6-6% (회사 부담)
```

---

## 3. Master Data Governance

### 3.1 Global vs Local Ownership

**책임 모델**:

```
Master Data Governance Framework:

GL Account (Chart of Accounts):
  ├─ Ownership: Global (CFO Office)
  ├─ Rule: "Core GL은 수정 불가, Local Extensions만 허용"
  ├─ Number Range:
  │   ├─ 1xxxx-3xxxx: Global (Core)
  │   ├─ 4xxxx-9xxxx: Global (Core)
  │   └─ 91xx-99xx: Local (Region-specific) ← 허용
  │
  └─ Change Process:
      ├─ Local Request → Region Finance Manager
      ├─ Approval → Global CoE (Center of Excellence)
      ├─ Transport → All Instances (표준화)
      └─ Communication → All Users (영향도 전파)

Vendor Master (공급업체):
  ├─ Ownership: Local (Region Procurement Manager)
  ├─ Rule: "로컬에서 자유 생성, 단 글로벌 기준 준수"
  ├─ Mandatory Fields:
  │   ├─ Vendor ID (중앙에서 사전 할당)
  │   ├─ Name (Local Language OK)
  │   ├─ Tax ID (국세청 등록번호)
  │   ├─ Payment Terms (기본값: Net 30)
  │   └─ Currency (로컬 통화 기본)
  │
  └─ Data Quality Rules:
      ├─ Duplicate Check (같은 세금ID, 이름): 차단
      ├─ Mandatory Validation: 자동
      └─ Annual Cleanup (SAP JobScheduler): 비활성 벤더 검증

Material Master:
  ├─ Ownership: Shared
  ├─ Strategy:
  │   ├─ Global Materials: Headquarters 관리 (일반 재료, 부품)
  │   └─ Local Materials: Region 관리 (지역 특산, 규정품)
  │
  ├─ Key Fields:
  │   ├─ Material ID (Global Sync)
  │   ├─ Description (Local Language OK)
  │   ├─ Unit of Measure (로컬 기준)
  │   ├─ GL Account (로컬 선택, Core GL만)
  │   └─ Pricing (각 지역 입력)
  │
  └─ Conflict Resolution:
      ├─ "같은 Material, 다른 설정" → Global Sync 우선
      └─ "로컬 변형 필요" → Material Variant (MM01_V)로 생성
```

### 3.2 Master Data Synchronization

**Tool: SAP Master Data Governance (MDG)**

```
Architecture:

Governing System (Central Hub)
  └─ Master Data Repository (모든 회사의 기준 데이터)
      ├─ GL Account (H1)
      ├─ Vendor Master (LFA1)
      ├─ Customer Master (KNA1)
      ├─ Material Master (MARA)
      └─ Plant Master (T001W)

Regional Instances (Asia, EMEA, Americas)
  └─ Subset Replication (자신의 지역만 동기화)
      ├─ Push: Governing System → Regional (일일)
      ├─ Pull: Regional → Governing System (오류 보고)
      └─ Conflict Resolution: Automated or Manual

Synchronization Rules (T-code: MDGH):

GL Account:
  ├─ Rule: "100% Sync from Governing System"
  ├─ Frequency: Weekly (목요일 22:00)
  ├─ Conflict: Reject Change (로컬 수정 차단)
  └─ Manual Extension:
      └─ "91xx-99xx 범위는 로컬 자유 추가"

Vendor:
  ├─ Rule: "Sync ± Allow Local Extension"
  ├─ Frequency: Daily (실시간)
  ├─ Conflict: Merge (로컬 추가정보 보존)
  └─ Example:
      ├─ Governing System: VEN-0001, Name "ABC Corp"
      ├─ Regional Instance (Japan): Name "ABC Corp", Tax ID "9999999999"
      └─ Sync Result: 양쪽 통합 (Name + Tax ID 모두 저장)

Conflict Detection:
  ├─ Duplicate Vendor (같은 세금ID, 다른 ID): 경고
  ├─ Pricing Variance (>10% regional diff): 확인 요청
  └─ Reconciliation Report (월 1회 자동)
```

---

## 4. Transport 전략

### 4.1 Global Template Transport

**Single Transport Package**:

```
Transport Package: SAP_GLOBAL_TEMPLATE_2024

Contents:
├─ Customizing Objects
│   ├─ OBYA (Document Types)
│   ├─ OBDA (GL Account Config)
│   ├─ OKB1 (Controlling Area)
│   ├─ FTXP (Tax Code)
│   └─ VOFM (Pricing Logic)
│
├─ Master Data
│   ├─ GL Accounts (H1): 2000개
│   ├─ Vendor Master (Baseline): 100개 (공급사)
│   ├─ Customer Master (Baseline): 50개 (핵심 고객)
│   ├─ Material Master (Baseline): 500개 (핵심 상품)
│   └─ Plant Master: 10개 (모든 지역 플랜트)
│
└─ Transport Layer Protection:
    ├─ "Core Objects" (OBYA, GL Account): READ-ONLY
    │   └─ Regional Instances에서 변경 불가
    │
    ├─ "Extended Objects" (Vendor, Material): EXTENDABLE
    │   └─ Regional에서 추가 가능, 덮어쓰기 불가
    │
    └─ "Local Objects" (Regional Customizing): WRITABLE
        └─ Regional에서 자유 수정 가능
```

### 4.2 Regional Transport 경로

**Multi-Region Deployment**:

```
Transport Route (STMS Configuration):

Central Hub (Governing System)
  │
  ├─→ Asia Instance
  │    ├─ QAS-Asia
  │    └─ PRD-Asia (Korea, Japan, India)
  │
  ├─→ EMEA Instance
  │    ├─ QAS-EMEA
  │    └─ PRD-EMEA (Germany, UK, France)
  │
  └─→ Americas Instance
       ├─ QAS-Americas
       └─ PRD-Americas (USA, Canada, Mexico)

Timeline:

Phase 1: Governing System Release (Week 1)
  └─ T-code: SE10 (Release DEVK900001)
     ├─ Status: Released
     ├─ Contents: Global Template + Config
     └─ Delivery: Immediate

Phase 2: Regional Import (Week 2-3)
  ├─ Asia: Forward to QAS-Asia
  │   ├─ T-code: STMS (Import)
  │   ├─ Date: 2024-04-15
  │   └─ Status: "Imported to QAS"
  │
  ├─ EMEA: Forward to QAS-EMEA
  │   ├─ Date: 2024-04-16
  │   └─ Status: "Imported to QAS"
  │
  └─ Americas: Forward to QAS-Americas
      ├─ Date: 2024-04-17
      └─ Status: "Imported to QAS"

Phase 3: Regional UAT (Week 3-4)
  ├─ Asia: Parallel Testing (3회사 동시)
  │   └─ Focus: GL Consolidation, Local Tax Rules
  │
  ├─ EMEA: Parallel Testing (4회사 동시)
  │   └─ Focus: GDPR Compliance, Local Regulations
  │
  └─ Americas: Parallel Testing (3회사 동시)
      └─ Focus: Sales Tax, Federal Withholding

Phase 4: Production Deployment (Week 5)
  ├─ Asia PRD: 2024-05-01 (야간 10pm-6am)
  ├─ EMEA PRD: 2024-05-01 (야간 20:00-06:00 CET)
  └─ Americas PRD: 2024-05-02 (야간 20:00-06:00 EST)
```

### 4.3 Local Customization Transport

**Regional Isolation**:

```
Regional Transport (별도 경로):

QAS-Asia (Local Customization)
  ├─ Request: ASQK900001 (Japan Tax Rules)
  │   └─ Contents: Consumption Tax 8% Config
  │
  └─ Forward to:
      └─ PRD-Asia (Japan Instance)

이 경로는 Global Template Transport와 독립적으로 실행됨.

Protection:
  ├─ Core GL Account (1xxxx-9xxxx): "Block Change" (Global 보호)
  ├─ Tax Code (Local): "Allow Create" (91xx 범위 허용)
  └─ Validation: Regional transport는 로컬 GL만 수정 가능
```

---

## 5. 한국 기업의 글로벌 롤아웃 사례

### Case Study: Samsung Global SAP Rollout (2018-2023)

**Timeline**:

```
Phase 1: Core System (한국)
  ├─ Period: 2018-2019 (18개월)
  ├─ Scope: S/4HANA Core (FI, CO, MM, SD, HCM)
  ├─ Go-live: 2019-09-01
  ├─ Investment: $200M
  └─ Result: 성공 (매출 통합 보고 시간 3주 → 2일)

Phase 2: Asia Rollout
  ├─ Period: 2020-2021 (12개월)
  ├─ Countries: Japan, China, Vietnam, India
  ├─ Go-live: 2021-06-01
  ├─ Key Success:
  │   ├─ Template Approach (Korea → Clone)
  │   ├─ Localization Team (지역별 5명)
  │   └─ Master Data Reuse (70% 재사용)
  │
  └─ Challenge:
      ├─ China: Multi-invoice VAT 규정 복잡 (추가 3개월)
      └─ India: GST 변경 빈번 (Update Cycle 단축)

Phase 3: Global Rollout
  ├─ Period: 2022-2023 (12개월)
  ├─ Countries: USA, Germany, UK, Mexico, Brazil
  ├─ Go-live: 2023-01-01
  └─ Result: 50개 국가, 100개 회사 통합 (단일 ERP)

Post-Rollout: Continuous Improvement
  ├─ Year 1: Stabilization (버그 픽스, 성능 최적화)
  ├─ Year 2-3: Enhancement (BTP Integration, Analytics)
  └─ Year 4+: Innovation (AI/ML, Predictive Analytics)
```

**Key Success Factors**:

```
1. Template Discipline
   ├─ Core Template (Korea) 엄격한 보호
   ├─ Regional Extension만 허용
   └─ 변경 요청: Global CoE 승인 필수

2. Localization Excellence
   ├─ Local Tax Expert 배치 (각 국가)
   ├─ Quarterly Update Cycle (세법 변경)
   └─ Best Practice Sharing (Regional Forum)

3. Parallel Operations 최소화
   ├─ Old System: 결산 마감 후 폐지 (90일 경과)
   ├─ Cutover: 월초 (거래량 최소)
   └─ Rollback Plan: 프로토콜 수립 후 실행 안 함 (신뢰도 99.8%)

4. User Adoption
   ├─ Training: 각국 언어 (70개 세션)
   ├─ Support: Offshore + Onshore (24/7)
   └─ Change Management: "Explain Why" (저항 감소)

5. Data Quality
   ├─ Pre-Rollout Cleanse: 3개월
   ├─ Duplicate Elimination: 20,000+ 제거
   └─ Validation Rule: 99.5% 정확도 기준
```

---

## 6. Multi-Language 지원

### 6.1 SAP Translation (T-code: SE63)

```
Scope:

1. Menu Items (메뉴)
   ├─ Original (English): "Accounts Receivable"
   ├─ Korean: "외상금관리"
   ├─ Japanese: "売掛金管理"
   └─ German: "Forderungsverwaltung"

2. Field Labels
   ├─ GL Account: "총계정원장계정" (한국)
   ├─ Vendor Name: "仕入先名" (일본)
   └─ Customer Address: "Kundenadresse" (독일)

3. Messages & Notifications
   ├─ "Invoice posted successfully"
   │   → "송장이 게시되었습니다"
   │   → "送状が転記されました"
   │   → "Beleg wurde erfolgreich gebucht"
   │
   └─ Error Messages (T-code: SM01)
       └─ "GL Account does not exist"
           → "총계정원장계정이 존재하지 않습니다"

4. Reports (보고서)
   ├─ "Balance Sheet"
   │   → "재무제표"
   │   → "貸借対照表"
   │
   └─ "Profit & Loss"
       → "손익계산서"
       → "損益計算書"

Process (T-code: SE63):
  Step 1: Create Translation Task
  ├─ Language: Korean, Japanese, German
  ├─ Scope: All Modules
  └─ Translator Assignment: 언어별 1-2명

  Step 2: Batch Translation
  ├─ Tool: Google Translate (초안) + Manual Review
  ├─ QA: Double-check (금융용어, 법적 용어)
  └─ Timeline: 3개월 (모든 언어)

  Step 3: Validation
  ├─ SAP Client 로그온 (로컬 언어)
  ├─ System 메뉴 확인
  └─ Report Output 검증

  Step 4: Deployment
  ├─ Transport: SE10로 언어 Transport 패키지 생성
  ├─ Distribution: 모든 인스턴스
  └─ Go-live: Parallel 모든 지역
```

### 6.2 Fiori App Localization

**Fiori Launchpad (Portal)**:

```
Scope:

1. Fiori Shell (포탈 기본)
   ├─ Language Selector: 사용자 로그온 시 선택
   ├─ Default: Logon Language (SU01 설정)
   └─ Change: Fiori Settings → Language → Save

2. Fiori Apps (개별 앱)
   ├─ App Title: "Manage Invoices"
   │   → "송장 관리"
   │   → "請求書を管理"
   │
   ├─ App Buttons: "Save", "Cancel", "Submit"
   │   → "저장", "취소", "제출"
   │   → "保存", "キャンセル", "提出"
   │
   └─ Error Messages (App-specific)
       └─ Multiple languages embedded

3. OData Service Labels
   ├─ Backend Metadata (Service Definition)
   ├─ Field Labels in OData $metadata
   └─ Translation (SAP Fiori Element)

Implementation (T-code: FE2):

  Step 1: Enable Translation in Fiori App
  ├─ Use Resource Model (i18n)
  ├─ Define Translation Keys
  └─ Example: "lblInvoice" → "Invoice"

  Step 2: Manage Translations
  ├─ Tool: SAPUI5 Development Toolkit
  ├─ Upload translations (per language)
  └─ Format: JSON or Properties File

  Step 3: Deploy
  ├─ App Update (T-code: FE4 Publish)
  ├─ Cache Clear (Frontend)
  └─ Go-live (All Users)
```

---

## 7. sapstack의 글로벌 롤아웃 지원

### 7.1 Master Data Quality Check (Pre-Rollout)

```
Evidence Loop:

1. Vendor Master Validation
   T-code: FK03 (Read)
   ├─ Total Vendors: 50,000 (기대값)
   ├─ Duplicate Check:
   │   └─ Same Tax ID, Different Vendor ID: 2,453건 발견!
   │   └─ Action: Merge / Delete (사전 정리)
   │
   ├─ Mandatory Field Validation:
   │   ├─ Vendor Name: 100% ✓
   │   ├─ Country: 99.8% (150건 미흡)
   │   ├─ Payment Terms: 85% (7,500건 미흡) ⚠️
   │   └─ Tax ID: 80% (10,000건 미흡) 🔴
   │
   └─ Completeness: 85% → Action: 15% 데이터 정제

2. GL Account Configuration Check
   T-code: FS10N
   ├─ Chart of Accounts: H1 (기대)
   ├─ GL Accounts Created: 2,000개 (기대값)
   ├─ Posting Enabled: 99% (20개 비활성)
   └─ Regional Extensions:
       ├─ Korea (91xx-91zz): 150개 생성
       ├─ Japan (92xx-92zz): 120개 생성
       └─ USA (93xx-93zz): 100개 생성

3. Master Data Consistency
   ├─ Material Master (MARA)
   │   ├─ Total Materials: 5,000
   │   ├─ GL Account Assignment: 98% ✓
   │   └─ Plant Assignment: 100% ✓
   │
   └─ Plant Master (T001W)
       ├─ Total Plants: 50
       ├─ Company Code Assignment: 100% ✓
       └─ Storage Location: 85% (15개 누락)
```

### 7.2 Transport Monitoring (Rollout Phase)

```
Real-time Transport Status Dashboard

┌─────────────────────────────────────────────────────┐
│        Global SAP Rollout Transport Status          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Governing System                                    │
│   DEVK900050 "Global Template" ────→ RELEASED ✓   │
│                                                     │
│ Asia Instance                                       │
│   │ Import Status:  ▓▓▓▓▓▓░░░░ 60% (ETA: 2h)     │
│   │ QAS Testing:    ▓▓▓▓▓▓▓░░░ 70% (15건 오류)   │
│   │ Production:     ░░░░░░░░░░  0% (미개시)      │
│   └─ Risk: 오류 15건, 화요일 배포 예정 ⚠️        │
│                                                     │
│ EMEA Instance                                       │
│   │ Import Status:  ▓▓▓▓▓▓▓▓░░ 80% (ETA: 1h)     │
│   │ QAS Testing:    ▓▓▓▓▓░░░░░ 50% (순조)        │
│   │ Production:     ░░░░░░░░░░  0%               │
│   └─ Status: GREEN ✓ (목요일 배포 예정)           │
│                                                     │
│ Americas Instance                                   │
│   │ Import Status:  ░░░░░░░░░░  0% (미개시)      │
│   │ QAS Testing:    ░░░░░░░░░░  0%               │
│   │ Production:     ░░░░░░░░░░  0%               │
│   └─ Status: PENDING (금요일 개시 예정)           │
│                                                     │
└─────────────────────────────────────────────────────┘

sapstack Action:
- Asia: Transport 오류 분석 → 원인: "Regional GL Account 중복 생성"
  → 수정 권고: Regional CoE에 GL Account 정정 요청
  
- EMEA: Smooth 진행, 모니터링 계속

- Americas: 대기 중, 48시간 전 개시 알림
```

### 7.3 Post-Rollout Validation

```
Evidence Loop (Go-live 후 1주):

1. Data Integrity Check (각 지역)
   ├─ GL Balance: PRD vs Legacy System 대사
   │   ├─ Korea: ±0.01% (완벽)
   │   ├─ Japan: ±0.05% (OK)
   │   └─ USA: ±0.5% (환율 영향, 허용)
   │
   ├─ Transaction Count:
   │   ├─ April 거래: 예상 vs 실제
   │   ├─ Korea: 100,000 vs 99,999 (99.999% 일치)
   │   └─ Japan: 50,000 vs 50,005 (중복 감지? 조사 중)
   │
   └─ Master Data Count:
       ├─ Vendor: 예상 50K vs 실제 49,997 (3개 누락)
       ├─ Material: 예상 5K vs 실제 5,000 ✓
       └─ Customer: 예상 3K vs 실제 2,998 (2개 누락)

2. Process Execution Check
   ├─ Period Close (월말 결산):
   │   ├─ Korea: 10일 (정상)
   │   ├─ Japan: 12일 (1일 지연, 원인: HCM 급여 처리 지연)
   │   └─ USA: 8일 (우수)
   │
   ├─ AR/AP Collection:
   │   ├─ Invoice Processing SLA: 95% 충족
   │   └─ Payment SLA: 92% (분석 필요)
   │
   └─ Reporting:
       ├─ Executive Dashboard: 99% 정확
       ├─ Tax Reporting: 100% (자동 생성)
       └─ GL Reconciliation: 99.99%

3. User Adoption
   ├─ Logins (Daily Active Users):
   │   ├─ Korea: 1,200/1,200 (100%)
   │   ├─ Japan: 450/500 (90%, 50명 미사용 중)
   │   └─ USA: 350/400 (87.5%, 교육 중)
   │
   ├─ Help Desk Tickets:
   │   ├─ Total: 450건 (1주)
   │   ├─ Resolved: 380건 (84%)
   │   ├─ Pending: 70건 (SLA 초과 5건)
   │   └─ Top Issues:
   │       1. "Password 초기화" (150건)
   │       2. "Report 조회 방법" (80건)
   │       3. "GL Account 코드 조회" (60건)
   │       4. "권한 문제" (40건)
   │       5. "시스템 느림" (20건)
   │
   └─ Training Completion:
       ├─ Finance: 100% ✓
       ├─ Supply Chain: 92% (수정 중)
       └─ HR: 85% (추가 세션 필요)

sapstack Recommendation:
"Go-live 1주 검증 결과: GREEN ✓

주의 사항:
1. Japan HCM 급여 처리 지연 (원인: 복식 급여 규칙) 
   → 추가 테스트 필요, 5월부터 정상화 예상
   
2. Master Data 누락 (Vendor 3, Customer 2)
   → 즉시 복구 (Legacy에서 재입력 또는 Import)
   
3. User Training 미완료 (공급망 8%, HR 15%)
   → 2주 추가 교육 일정 (주말)

4. Help Desk 대응 개선
   → Password 초기화 자동화 (30% 감소 예상)
   → FAQ 시스템 배포

Expected Outcome: 4주 후 안정화 (예상 실제 결과율 98% 이상)
"
```

---

## 결론

글로벌 SAP 롤아웃은 **기술 프로젝트가 아니라 조직 변화 프로젝트**다.

**sapstack의 역할**:

1. **Template 보호** → Core Configuration Read-Only 강제, Regional Extension만 허용
2. **Master Data 일관성** → Pre-rollout Cleanse, Post-rollout Validation
3. **Transport 병렬 실행** → Multi-region Monitoring, Timeline 추적
4. **Localization 검증** → Tax Code, GL Account, Payroll Rule 지역별 정합성
5. **Post-rollout Stabilization** → Data Integrity, Process SLA, User Adoption 추적

성공의 척도는 "Go-live 속도"가 아니라 **"4주 후 안정성"**이다. sapstack이 그 안정성을 담보하는 도구다.
