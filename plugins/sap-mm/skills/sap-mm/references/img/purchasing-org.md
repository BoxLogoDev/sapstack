# 구매조직(Purchasing Organization) IMG 구성 가이드

## SPRO 경로
`SPRO → Materials Management → Purchasing → Organization → (여러 하위 활동)`

Primary T-codes: **OM00** (Org. Assignment), **OME4** (Purchasing Groups), **ME28** (Release Strategy)

## 필수 선행 구성
- [ ] 회사코드 정의 (OB22)
- [ ] 플랜트 정의 (OC04)
- [ ] 계정결정 (OBYC)

## 핵심 개념: Organizational Hierarchy

```
Client (시스템 최상위)
    ↓
Company Code (회사코드, 회계 단위)
    ├─ Plant 1 (플랜트, 재고 단위)
    ├─ Plant 2
    └─ Plant N
        ↓
    Purchasing Organization (구매조직, 조달 단위)
        ├─ Purchasing Group (구매그룹, 구매 담당자)
        └─ Vendor (공급자)
```

## 구성 단계

### 1단계: 구매조직 정의 (OM00)

T-code: **OM00** (Organizational Units — Purchasing Organization)

```
화면 구조:
┌─────────────────────────────────┐
│ Organizational Units (Hierarchy) │
├─────────────────────────────────┤
│ Client: 001 (최상위)             │
│ └─ Company Code: 1000            │
│    ├─ Plant: 1000 (Berlin)       │
│    │  └─ Purchasing Org: 1000    │
│    │     ├─ Name: "PO 1000 (DE)" │
│    │     └─ Currency: EUR         │
│    ├─ Plant: 2000 (Hamburg)      │
│    │  └─ Purchasing Org: 2000    │
│    │     ├─ Name: "PO 2000 (DE)" │
│    │     └─ Currency: EUR         │
│    └─ Plant: 9999 (Central)      │
│       └─ Purchasing Org: 9999    │
│          ├─ Name: "Central PO"   │
│          └─ Currency: EUR         │
└─────────────────────────────────┘
```

#### OM00 기본 설정

**구매조직 1000 (Berlin Plant용):**

```
Organizational Unit: Purchasing Organization
├─ Code: 1000
├─ Org. Unit Name: "PO 1000 (Berlin)"
├─ Company Code: 1000
├─ Default Currency: EUR
├─ Language: DE (독일어)
├─ Responsible User:
│  └─ Chief Purchaser: (사용자ID 할당)
└─ Contact Data:
   ├─ Address: Unter den Linden 1, 10117 Berlin
   └─ Phone: +49-30-xxx-xxxx
```

**구매조직 2000 (Hamburg Plant용):**

```
Code: 2000
├─ Org. Unit Name: "PO 2000 (Hamburg)"
├─ Company Code: 1000
├─ Default Currency: EUR
├─ Language: DE
├─ Responsible User: (Hamburg Procurement Manager)
└─ Contact Data: (Hamburg address)
```

**구매조직 9999 (중앙 구매 조직 — Cross-Plant PO용):**

```
Code: 9999
├─ Org. Unit Name: "Central Purchasing Organization"
├─ Company Code: 1000
├─ Default Currency: EUR
├─ Scope: Multiple Plants (1000, 2000 모두)
├─ Authority: 모든 카테고리 구매 권한
└─ Use Case:
   ├─ Framework Agreements (원자재 계약)
   └─ Centralized Vendor Management
```

### 2단계: 구매조직에 회사코드/플랜트 할당

같은 T-code OM00에서:

```
Company Code: 1000
├─ Purchasing Organization: 1000 (Berlin)
│  └─ Assignments:
│     ├─ Plant: 1000 ✓
│     └─ Can purchase from this plant
├─ Purchasing Organization: 2000 (Hamburg)
│  └─ Assignments:
│     ├─ Plant: 2000 ✓
│     └─ Can purchase from this plant
└─ Purchasing Organization: 9999 (Central)
   └─ Assignments:
      ├─ Plant: 1000 ✓
      ├─ Plant: 2000 ✓
      └─ Can purchase for multiple plants
```

### 3단계: 구매그룹 정의 (OME4)

T-code: **OME4** (Define Purchasing Groups)

```
화면 구조:
┌─────────────────────────────────┐
│ Purchasing Group Maintenance    │
├─────────────────────────────────┤
│ Purchasing Organization: 1000   │
│                                 │
│ Group 01:                       │
│ ├─ Code: 01                     │
│ ├─ Name: "Raw Materials"        │
│ ├─ Description: "원자재 구매"   │
│ ├─ Responsible User: JOHN       │
│ └─ Email: john@company.de       │
│                                 │
│ Group 02:                       │
│ ├─ Code: 02                     │
│ ├─ Name: "Services"             │
│ ├─ Description: "용역/서비스"   │
│ ├─ Responsible User: MARY       │
│ └─ Email: mary@company.de       │
│                                 │
│ Group 03:                       │
│ ├─ Code: 03                     │
│ ├─ Name: "Fixed Assets"         │
│ ├─ Responsible User: ROBERT     │
│ └─ Email: robert@company.de     │
└─────────────────────────────────┘
```

#### OME4 구매그룹별 책임 및 권한

**그룹 01: 원자재(Raw Materials)**

```
Code: 01
├─ Name: "Raw Materials"
├─ Categories: RM(원자재), C(부품)
├─ Typical Vendors: Samsung, LG, Intel
├─ Responsible Person: JOHN (ID: 123456)
├─ Phone/Email: john@company.de
├─ Approval Limit: 100,000 EUR
├─ Release Strategy: CL20N (2-step)
│  ├─ Step 1: Purchasing Group Manager (JOHN)
│  └─ Step 2: Director of Procurement (BOSS)
└─ Commodity Code: HS 8471** (ECC 내부)
```

**그룹 02: 용역/서비스(Services)**

```
Code: 02
├─ Name: "Services"
├─ Categories: SRV(용역)
├─ Typical Vendors: Consulting firms, Logistics
├─ Responsible Person: MARY (ID: 234567)
├─ Approval Limit: 50,000 EUR
├─ Release Strategy: CL20N (1-step 또는 2-step)
└─ Special Handling: Invoicing via Project Cost (CO)
```

**그룹 03: 자산(Fixed Assets)**

```
Code: 03
├─ Name: "Fixed Assets"
├─ Categories: FA(고정자산)
├─ Typical Vendors: Machinery suppliers, IT vendors
├─ Responsible Person: ROBERT (ID: 345678)
├─ Approval Limit: 500,000 EUR (높음)
├─ Release Strategy: CL20N (3-step)
│  ├─ Step 1: Purchasing Group (ROBERT)
│  ├─ Step 2: Finance Director
│  └─ Step 3: CEO Approval (금액 초과 시)
└─ Integration: Fixed Asset Master (AA)로 자산화
```

### 4단계: Release Strategy 설정 (ME28)

T-code: **ME28** (Purchasing Document Release Strategy)

Release Strategy는 PO(Purchase Order) 생성 후 자동으로 승인 프로세스를 트리거함:

```
화면:
┌──────────────────────────────────┐
│ Release Strategy Maintenance      │
├──────────────────────────────────┤
│ Purchasing Organization: 1000    │
│ Release Strategy: 01(2-Step)     │
│                                  │
│ Strategy Name: "Standard 2-Way"  │
│ Description: "일반 구매오더"     │
│                                  │
│ Release Codes:                   │
│ ├─ Code 1: PG Manager (JOHN)    │
│ │  └─ Limit: 50,000 EUR          │
│ ├─ Code 2: Procurement Director  │
│ │  └─ Limit: 100,000 EUR         │
│ └─ Code 3: CEO (금액 초과)       │
│                                  │
│ Item Category Applicability:     │
│ ├─ Item Cat 100: RM 구매 ✓       │
│ └─ Item Cat 110: 용역 ✓          │
└──────────────────────────────────┘
```

#### Release Strategy 결정 로직

```
PO 생성 (ME21N)
    ↓
Release Strategy Check (CL20N의 Release Code)
    ├─ PO Amount: 35,000 EUR
    ├─ Purchasing Group: 01 (Raw Materials)
    ├─ User: JOHN (PG Manager)
    │
    └─ Strategy Match: 01 (2-Way)
       ├─ Level 1: JOHN ≤ 50,000 EUR ✓
       │  └─ Status: "Release 1 Approved"
       ├─ Level 2: Director ≤ 100,000 EUR
       │  └─ Status: "Awaiting Release 2"
       └─ Workflow Notification:
          └─ Director 받은 편지함에 PO 승인 요청 표시
```

### 5단계: 조직 계층 검증 (BOM-계층 조회)

T-code: **OME6** (Summarized Info — Purchasing Groups)

```
조회:
Purchasing Organization: 1000
    ├─ Group 01 (Raw Materials)
    │  ├─ Vendor: 100001 (Samsung)
    │  ├─ Vendor: 100002 (LG)
    │  └─ (30+ 공급자)
    ├─ Group 02 (Services)
    │  ├─ Vendor: 200001 (Consulting A)
    │  └─ (10+ 용역사)
    └─ Group 03 (Fixed Assets)
       ├─ Vendor: 300001 (Machinery Inc)
       └─ (5+ 자산 공급자)
```

## 실제 구매 프로세스에서의 역할

### 프로세스 흐름

```
1. 자재 요청 (MR) / 구매요청 (PR)
   └─ Requesting Plant: 1000 (Berlin)
   └─ Material: TEST-RM-001
   └─ Qty: 100 EA
   
2. Purchasing Org 결정 (자동)
   └─ Plant 1000 → Purchasing Org 1000 (Berlin)
   
3. Purchasing Group 결정 (자동 또는 수동)
   └─ Material Type: RM → Group 01 (Raw Materials)
   └─ Responsible: JOHN
   
4. Vendor Selection
   └─ Group 01 공급자 목록에서 선택
   └─ Vendor: 100001 (Samsung)
   
5. PO 생성 (ME21N)
   ├─ Purchasing Org: 1000
   ├─ Purchasing Group: 01
   ├─ Vendor: 100001
   ├─ PO Amount: 10,000 USD
   └─ Status: "For Release"
   
6. Release Strategy 자동 실행 (CL20N)
   ├─ Strategy: 01 (2-Way)
   ├─ Level 1: JOHN (PG Manager) 승인
   │  └─ Status: "Release 1"
   ├─ Level 2: Director 승인
   │  └─ Status: "Release 2"
   └─ Final Status: "Released"
   
7. Goods Receipt (MIGO)
   └─ PO Qty: 100 EA 수입고 확인
   
8. Invoice Verification (MIRO)
   └─ Tolerance Check (OMR6, OMRM)
   └─ Finance 자동 전기
```

## 구성 검증

### 검증 1: OM00에서 조직 구조 확인
```
T-code: OM00 → Display Mode (Organizational Units)
├─ Company Code: 1000
├─ Purchasing Org 1000: ✓ (Berlin)
├─ Purchasing Org 2000: ✓ (Hamburg)
└─ Purchasing Org 9999: ✓ (Central)
   └─ Plants assigned: 1000, 2000 ✓
```

### 검증 2: OME4에서 구매그룹 확인
```
T-code: OME4 → Display Mode
├─ Purchasing Organization: 1000
├─ Group 01 (Raw Materials): ✓
├─ Group 02 (Services): ✓
└─ Group 03 (Fixed Assets): ✓
   ├─ Responsible: JOHN, MARY, ROBERT ✓
   └─ Email notifications 설정 ✓
```

### 검증 3: ME28에서 Release Strategy 확인
```
T-code: ME28 → Display Mode
├─ Purchasing Organization: 1000
├─ Release Strategy 01 (2-Way):
│  ├─ Level 1: JOHN (50,000 EUR) ✓
│  ├─ Level 2: Director (100,000 EUR) ✓
│  └─ Level 3: CEO (unlimited) ✓
└─ Strategy applies to Group 01, 02 ✓
```

### 검증 4: 실제 PO 생성으로 테스트 (ME21N)
```
T-code: ME21N (Create PO)
├─ Purchasing Organization: 1000 ✓
├─ Purchasing Group: 01 (자동 할당) ✓
├─ Vendor: 100001 ✓
├─ PO Amount: 35,000 EUR
└─ [Save]
   ├─ Status: "For Release" ✓
   ├─ Release Level 1 (JOHN): Awaiting ✓
   └─ Release Level 2 (Director): Pending ✓
```

### 검증 5: Release Strategy 실행 (CL20N)
```
T-code: CL20N (Release Codes)
└─ Purchasing Organization: 1000
   ├─ Release Code 1: JOHN (User ID: 123456)
   ├─ Release Code 2: Director (User ID: 666666)
   └─ Both users receive workflow notification ✓
```

## 중앙 구매조직(Central Purchasing Org) 운영 예시

### 시나리오: 다중 플랜트 Framework Agreement

```
상황:
├─ 회사코드: 1000 (전체)
├─ Plant 1000 (Berlin): 월 1000 EA 원자재 필요
├─ Plant 2000 (Hamburg): 월 800 EA 동일 자재 필요
└─ 공급자: Samsung (단가 협상 가능)

중앙 구매조직 사용:
├─ Purchasing Org: 9999 (Central)
├─ Strategy: Framework Agreement (FB, Release Order)
│  ├─ Framework Qty: 1800 EA/Month
│  ├─ Unit Price: 100 USD/EA (협상가)
│  └─ Validity: Jan 2026 ~ Dec 2026
│
└─ 각 플랜트의 실행:
   ├─ Plant 1000: 1000 EA/Month (Release Order)
   ├─ Plant 2000: 800 EA/Month (Release Order)
   └─ 중앙이 단가 교섭 → 양쪽 플랜트 공급
```

## 주의사항

### 1. Purchasing Org 중복 정의 → 혼란
**문제**: Plant 1000에 대해 Purchasing Org를 1000과 1001 두 개 정의
```
결과: PO 생성 시 어느 Org 선택할지 불명확 → 데이터 무결성 문제
```
**해결**: OM00 → Plant당 1개 Purchasing Org만 할당 (또는 중앙조직으로 통합)

### 2. Release Strategy 누락 → PO 승인 프로세스 불작동
**문제**: ME28에서 Release Strategy 설정 안 함
```
결과: PO 생성 → 자동 "Released" 상태 → 승인 프로세스 무시
```
**해결**: ME28 → Strategy 정의 후 CL20N에서 Release Code 할당

### 3. 구매그룹 미할당 → 책임자 불명확
**문제**: OME4에서 Group 01의 Responsible User 미설정
```
결과: 자재 문제 발생 시 담당자 추적 불가
```
**해결**: OME4 → 모든 그룹에 Responsible User + Email 필수 입력

### 4. 권한 한도 설정 오류 → 비용통제 실패
**문제**: CL20N에서 Release Code의 금액 한도를 너무 높게 설정 (예: 1M USD)
```
결과: 관리자의 승인 역할 무의미 → 무제한 PO 생성 가능
```
**해결**: CL20N → 현실적 한도 설정 (Org 규모별 위험도 고려)

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA |
|------|-----|---------|
| OM00 구조 | Plant → Purchasing Org 1:1 | Plant → Purchasing Org N:1 (Central 강화) |
| OME4 그룹 | 자유정의 | 표준 그룹 + Custom 확장 |
| ME28 Release | 수동 정의 | Workflow 자동화 (BRF+) |
| Approval 승인 | CL20N (코드 기반) | Exception Mgmt (Workflow 기반) |

## 참고 자료

- **SAP 공식**: IMG → MM → Purchasing → Organization
- **T-codes**: OM00(조직), OME4(그룹), ME28(Release Strategy), CL20N(Release Code)
- **심화**: SOOD(Purchasing Doc Approval), MEPO(Purchase Order Analysis)
