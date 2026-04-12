# Key User Extensibility (Tier 1) — Custom Fields, Logic, CDS Views, Business Objects

## Tier 1 기본 개념

**Tier 1**은 "Key User" (비개발자, 함수팀장/회계팀장 수준의 기술 이해도)도 사용할 수 있는 확장을 의미합니다.

| 카테고리 | 기술 | 수행자 | 학습곡선 | 배포시간 |
|---------|------|--------|----------|----------|
| **Custom Fields** | Fiori UI (low-code) | 비개발자 가능 | 1~2시간 | 즉시 |
| **Custom Logic** | CDS Validation / Calculation | 함수팀장 + ABAP기초 | 1~2주 | 1~2일 |
| **Custom CDS Views** | CDS + OData (analytics) | ABAP 경험자 | 1주 | 1~2일 |
| **Custom Business Objects** | RAP + Event Handlers | ABAP 개발자 | 2주 | 3~5일 |

---

## 1. Custom Fields (필드 확장)

### 1.1 When to Use

- 표준 필드로 부족한 정보 저장
- 추가 비즈니스 컨텍스트 (예: "승인 코드", "프로젝트 ID", "부서별 예산 코드")
- No transactional logic needed (단순 저장/조회만)

### 1.2 How to Create (Fiori 기반)

**Step 1: Fiori 앱 시작**
- **App Name**: "Manage Custom Fields"
- **Fiori Role**: 시스템 관리자 또는 함수설정 권한자

**Step 2: Object 선택**
예) Purchase Order (PO Header / PO Item)
```
Object: Purchasing Document (PO)
  ├─ PO Header
  ├─ PO Item
  └─ PO Attachment
```

**Step 3: Custom Field 생성**
```
Field Name:            ZZ_APPROVAL_CODE
Data Type:             Text (max 20 characters)
Label (Korean):        승인 요청 코드
Label (English):       Approval Request Code
Help Text:             관리부 승인번호 (필수 입력)
Mandatory:             YES / NO
Default Value:         (blank) / (customer-provided)
Dropdown (if needed):  A001, A002, A003, ...
Field Length:          20
Decimal:               N/A (text field)
```

**Step 4: Activation**
- Click "Activate"
- Result: Custom field automatically appears in relevant Fiori UIs (PO create/edit, display)

### 1.3 Custom Fields 제약사항

- ✗ Cannot have validation logic (use Custom Logic instead)
- ✗ Cannot derive from other fields (use Calculated Field / Custom Logic)
- ✗ Cannot trigger workflows (use Custom Logic or Tier 2 BTP)
- ✓ Can be:
  - Text, Numeric, Date, Time, Boolean
  - Linked to dropdown (value list)
  - Required or optional
  - Hidden or visible per role
  - Used in standard reports (with custom UI enhancement)

### 1.4 Korean Example

**Scenario:** 구매팀이 모든 PO에 "발주 부서코드" (cost center sub-division)를 추가하고 싶음.

**Solution:** Custom Field on PO Header

```
Field Name:         ZZ_COST_CENTER_DIV
Data Type:          Text (10 chars)
Label:              원가센터 세부코드
Description:        구매부서 내 팀 레벨 구분 (10, 11, 12, ...)
Dropdown Values:    
  - 10: 생산관리팀
  - 11: 자재팀
  - 12: 외주팀
  - 13: 수입관리팀
Mandatory:          YES
Default Value:      (blank — 입력 강제)
Field Length:       10
```

**Result:**
- PO create 시 "원가센터 세부코드" 필드 표시
- PO report에 해당 column 자동 추가 (Fiori Analytics)
- 권한: 구매팀만 수정 가능 (role-based visibility)

**Limitation:**
- "세부코드별 승인 프로세스 분기" 같은 로직은 불가 → Custom Logic (Step 2) 필요

---

## 2. Custom Logic (검증 & 계산)

### 2.1 When to Use

- Validation: "이 필드 값은 저 범위 내여야 함"
- Calculation: "Invoice Amount = Net + Tax" (자동계산)
- Default values: "사용자 기본 cost center 자동 입력"
- Conditional Required: "특정 조건 시 필드 필수"

### 2.2 기술: CDS (Core Data Services)

CDS는 클라우드 native 데이터 모델링 언어. ABAP 코딩 없이 선언형 문법.

**CDS 기본 구조 (예: PO Validation)**

```
// CDS View + Validation Rule
define view entity ZC_PURCHASEORDER_CUSTOM {
  
  // Fields
  key PO_ID : PO_ID;
  PO_QUANTITY : QUANTITY;
  UNIT_PRICE : PRICE;
  CONTRACT_QTY : QUANTITY;
  
  // Validation Rule
  validation ZZ_CheckQtyVsContract on save {
    condition PO_QUANTITY > CONTRACT_QTY
    message 'Qty exceeds contract maximum'
    severity error;
  }
}
```

**Logic Flow:**
```
PO Create/Edit Input
  ↓
CDS Validation Rule executed
  ↓
If validation fails → Error message, block save
  ↓
If validation passes → Save to database
```

### 2.3 Custom Logic 개발 (Step by Step)

**Prerequisite:** ABAP 개발 환경 (DEV tenant의 ABAP Workbench)

**Step 1: CDS View 생성**

ABAP Workbench → File → New → CDS View

```
Entity Name: ZC_PO_CUSTOM
Namespace: SAP example (or customer namespace Z_...)

DEFINE VIEW ENTITY ZC_PO_CUSTOM {
  
  // 기본 필드 (Source table에서)
  key PO_ID,
  PO_QUANTITY,
  UNIT_PRICE,
  VENDOR_ID,
  
  // 계산 필드 (derived)
  LINE_AMOUNT: PO_QUANTITY * UNIT_PRICE,
  
  // Association (join to contract table)
  association to ZC_CONTRACT: CONTRACT
  
}
```

**Step 2: Validation Rule 추가**

```
validation ZZ_CheckQtyLimit on save {
  condition: LINE_AMOUNT > $session.user_limit
  message: 'PO amount exceeds user authorization limit'
  severity: error;
}
```

**Step 3: Custom Event Handler 추가**

```
class ZCL_PO_HANDLER definition ...

on_save( io_entity TYPE cds_model... ) {
  
  // Qty vs. Contract check
  if io_entity-po_qty > contract_qty then
    raise exception with message 'Qty exceeds contract'
  endif.
  
  // Auto-fill cost center from user default
  if io_entity-cost_center is initial then
    io_entity-cost_center = sy-user. // get user's default CC
  endif.
  
}
```

**Step 4: CDS 활성화 및 배포**

- Activate CDS View in ABAP Workbench
- Create CSP Package (Custom Software Package)
- Upload to Cloud ALM
- Deploy to target tenant (DEV → TEST → PROD)

### 2.4 Korean Example: PO Quantity Validation

**Scenario:** 구매팀 정책 — "PO 수량은 계약 수량의 120% 초과 불가"

**CDS Validation:**

```
DEFINE VIEW ENTITY ZC_PURCHASEORDER_CUSTOM {
  
  KEY PO_ID,
  PO_QUANTITY,
  CONTRACT_QTY,
  
  // Virtual field for max allowed
  CALCULATED_FIELD MAX_ALLOWED_QTY: CONTRACT_QTY * 1.2,
  
  VALIDATION ZZ_QuantityExceeded ON SAVE {
    CONDITION PO_QUANTITY <= MAX_ALLOWED_QTY
    MESSAGE '발주 수량이 계약 수량의 120%를 초과합니다'
    SEVERITY ERROR;
  }
}
```

**Result:**
- User enters PO with Qty = 1200, Contract Qty = 900 (1200 > 1080 (120%))
- Error: "발주 수량이 계약 수량의 120%를 초과합니다"
- PO save blocked

---

## 3. Custom CDS Views (분석 & 리포팅)

### 3.1 When to Use

- Custom analytics (표준 reports 부족)
- Data cube (measure + dimension)
- Read-only views (no INSERT/UPDATE/DELETE)
- Fiori Analytical App 데이터 소스

**예:**
- "월별 구매 금액 vs. 예산 비교"
- "카테고리별 공급자 성능 scorecard"
- "비용 센터별 지출 현황 dashboard"

### 3.2 CDS Analytics View 구조

```
DEFINE VIEW ZC_MONTHLY_SPEND {
  
  // Dimensions (grouping)
  key COST_CENTER,
  key MONTH,
  key VENDOR_CATEGORY,
  
  // Measures (aggregations)
  TOTAL_SPEND: sum(LINE_AMOUNT),
  AVG_PRICE: avg(UNIT_PRICE),
  ORDER_COUNT: count(*),
  
  // Ratio
  BUDGET_VARIANCE: (TOTAL_SPEND / BUDGET_AMOUNT) * 100,
  
  // Filter (optional)
  association to ZC_COST_CENTER: CC
    on CC.ID = COST_CENTER
}
```

### 3.3 배포 및 소비

**Deployment:**
1. CDS View 생성 (ABAP Workbench)
2. Activate → **자동 OData 생성** (no additional coding)
3. CSP Package → Cloud ALM upload → Deploy

**Consumption:**
```
Fiori Analytical App
  (Fiori Elements template)
  ↓
CDS View (OData)
  ↓
SAP Analytics Cloud (SAC)
  (optional, if purchased)
  ↓
Excel / Power BI
  (if OData connector enabled)
```

### 3.4 한국 예제: 월별 부가세 분석

**Scenario:** 회계팀이 "월별 부가세 매입/매출 현황" 대시보드 필요

**CDS Analytics View:**

```
DEFINE VIEW ZC_MONTHLY_VAT_REPORT {
  
  key FISCAL_MONTH,
  key COMPANY_CODE,
  key VAT_CATEGORY, // Input / Output / Reverse charge
  
  SALES_AMOUNT: sum(INV_GROSS_AMT),
  INPUT_VAT: sum(INPUT_VAT_AMT),
  OUTPUT_VAT: sum(OUTPUT_VAT_AMT),
  VAT_PAYABLE: OUTPUT_VAT - INPUT_VAT,
  
  association to ZC_COMPANY: COMPANY
    on COMPANY.CODE = COMPANY_CODE
}
```

**Result:**
- Fiori app 자동 생성: 월별 부가세 분석 (차트, 테이블, KPI 타일)
- No coding needed for UI (Fiori Elements + CDS = auto-UI)

---

## 4. Custom Business Objects (Transactional Entities)

### 4.1 When to Use

- SAP 표준 객체로 모델링 불가능
- 새로운 비즈니스 엔티티 (예: "내부 서비스 요청", "보조금 신청")
- Full CRUD (Create, Read, Update, Delete) 필요
- Transactional consistency 필수

### 4.2 기술: RAP (Restful ABAP Programming)

RAP = CDS + Event Handlers + OData (together = complete transactional API)

**Architecture:**

```
Fiori UI
  ↓
OData V4 API (auto-generated)
  ↓
RAP Application (CDS root entity + behavior)
  ↓
Event Handlers (Create, Update, Delete logic)
  ↓
Database (custom Z-table or standard table append)
```

### 4.3 Custom Business Object 개발 (예: Service Request)

**Step 1: Root Entity (CDS View)**

```
DEFINE ROOT VIEW ENTITY ZC_SERVICE_REQUEST {
  
  key REQUEST_ID: String;
  REQUEST_DATE: DateTime;
  REQUESTER: String;
  TITLE: String;
  DESCRIPTION: String;
  STATUS: String; // NEW / IN_PROGRESS / COMPLETED / CLOSED
  PRIORITY: String; // HIGH / MEDIUM / LOW
  
  // Associations
  association to /DMO/C_EMPLOYEE: EMPLOYEE
    on EMPLOYEE.employee_id = REQUESTER,
    
  association to ZC_SERVICE_REQUEST_ITEM: ITEMS
    on ITEMS.request_id = REQUEST_ID
}
```

**Step 2: Child Entity (Items)**

```
DEFINE VIEW ENTITY ZC_SERVICE_REQUEST_ITEM {
  
  key REQUEST_ID,
  key ITEM_NUM,
  ITEM_DESCRIPTION,
  ESTIMATED_HOURS,
  ASSIGNED_TO,
  
  association to ZC_SERVICE_REQUEST: REQUEST
    on REQUEST.REQUEST_ID = REQUEST_ID
}
```

**Step 3: Behavior (Create/Update/Delete Logic)**

```
DEFINE BEHAVIOR FOR ZC_SERVICE_REQUEST...

  CREATE;
  UPDATE;
  DELETE;
  
  mapping for persistence {
    // CDS field → DB table field
    REQUEST_ID to REQUEST_ID;
    REQUEST_DATE to REQ_DATE;
    STATUS to REQ_STATUS;
  }
  
  validation check_priority on save {
    if PRIORITY not in ('HIGH', 'MEDIUM', 'LOW') then
      fail with 'Invalid priority value'
    endif;
  }
  
  action mark_completed parameter {}
    result [1] $self;
}
```

**Step 4: Event Handler (Business Logic)**

```
CLASS ZCL_SERVICE_REQUEST_HANDLER DEFINITION.
  
  METHODS:
    on_create FOR BEHAVIOR
    IMPORTING entities FOR CREATE sr,
    
    on_update FOR BEHAVIOR
    IMPORTING entities FOR UPDATE sr.

ENDCLASS.

METHOD on_create.
  // Auto-assign request number
  REQUEST_ID = get_next_request_id().
  
  // Auto-set current date
  REQUEST_DATE = sy-datlo.
  
  // Auto-notify requester (if Tier 2 integration enabled)
  SEND_NOTIFICATION(
    requester = REQUESTER,
    message = 'Service request #' && REQUEST_ID && ' created'
  ).
END METHOD.
```

**Step 5: Fiori UI (Auto-Generated or Custom)**

```
Fiori Elements
  (SAP template-based, no UI coding needed)
  ↓
Root List (Service Requests)
  + Create button
  + Edit button
  + Delete button
  ↓
Detail View (Request Items sub-list)
  + Actions (mark_completed button)
```

**Deployment:**
- ABAP Workbench → CSP Package → Cloud ALM → Deploy

---

## Tier 1 vs. Tier 2/3 결정 기준

### 의사결정 플로우차트

```
START: 새로운 확장 필요?
  ↓
Q1: 표준 Custom Fields로 충분?
  ├─→ YES → TIER 1 CUSTOM FIELDS ✓
  ├─→ NO → Q2로
  
Q2: 검증 또는 계산 로직 필요?
  ├─→ YES → TIER 1 CUSTOM LOGIC (CDS Validation) ✓
  ├─→ NO → Q3로
  
Q3: 분석/리포팅만?
  ├─→ YES → TIER 1 CUSTOM CDS VIEW ✓
  ├─→ NO → Q4로
  
Q4: 새로운 비즈니스 객체 (완전 신규 엔티티)?
  ├─→ YES → TIER 1 CUSTOM BUSINESS OBJECT (RAP) ✓
  ├─→ NO → Q5로
  
Q5: 외부 시스템 통합 또는 복잡한 워크플로우?
  ├─→ YES → TIER 2 (BTP side-by-side)
  ├─→ NO → Q6로
  
Q6: Classic ABAP 코드 또는 table 수정 필요?
  ├─→ YES → TIER 3 (On-Stack ABAP Cloud) 또는 Fit-to-Standard 재설계
  └─→ NO → DONE
```

---

## 참고

- **Custom Fields**: immediate activation, no deployment needed
- **Custom Logic**: 1~2일 배포 (CSP via Cloud ALM)
- **Custom CDS Views**: 1~2일 배포
- **Custom Business Objects**: 3~5일 배포 (개발 + 테스트)
- **Rollback**: Cloud PE는 instant rollback 가능 (green/blue deployment)

관련: `overview.md`, `../../best-practices/governance.md`
