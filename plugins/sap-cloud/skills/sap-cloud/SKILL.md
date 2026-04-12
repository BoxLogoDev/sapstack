---
name: sap-cloud
description: >
  This skill handles SAP S/4HANA Cloud Public Edition tasks including Clean Core principles,
  Key User Extensibility (Custom Logic, Custom Fields, Custom CDS Views, Custom Business Objects),
  3-Tier Extension Model (Tier 1 Key User, Tier 2 Side-by-Side, Tier 3 On-Stack),
  Fit-to-Standard workshops, Cloud ALM (Application Lifecycle Management),
  Feature Scope Description (FSD), Quarterly Release management, and CSP (Custom Software Package) deployment.
  Use when user mentions Cloud PE, Public Cloud, Clean Core, Key User Extensibility, Custom Logic, Custom Fields,
  Custom CDS, Fit-to-Standard, Cloud ALM, FSD, quarterly release, CSP, 클라우드, 퍼블릭 클라우드, 클린 코어.
allowed-tools: Read, Grep
---

## 1. Environment Intake Checklist

When any Cloud PE issue or extension task is reported, collect before answering:

- **Cloud PE Version**: 2401 / 2402 / 2403 / 2405 / (specific release month/year)
- **Tenant Type**: Production / Non-Production (Test / Staging)
- **Extension Tier**: Tier 1 (Key User Extensibility) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
- **Deployment Model**: Cloud PE (never mention on-premise SE38/SE80/SMOD/CMOD — they are forbidden)
- **Industry Sector**: Manufacturing / Finance / Retail / Public Sector / Other
- **Change Control**: Are you in Fit-to-Standard phase or Operations phase?

---

## 2. Clean Core Principles (Non-Negotiable)

SAP S/4HANA Cloud PE enforces **Clean Core** — no modifications to SAP standard code or tables.

| Activity | On-Premise (ECC/S/4HANA OP) | Cloud PE |
|----------|------------------------------|----------|
| ABAP Modifications (SE38) | ✓ Allowed | ✗ FORBIDDEN |
| Function Module Enhancements (SMOD/CMOD) | ✓ Allowed | ✗ FORBIDDEN |
| Workflow Customizing (SWDD) | ✓ Allowed | △ Limited (no code exits) |
| IMG Configuration | ✓ Full (SPRO) | △ Limited (Manage Your Solution) |
| BAdI Implementation | ✓ Standard (SE19) | ✗ FORBIDDEN (use RAP instead) |
| Enhancement Spots | ✓ Full (BADI_DEF) | ✗ FORBIDDEN |
| Standard Table Modifications | ✓ Allowed (append structures) | ✗ FORBIDDEN |
| Transport Mechanism | ✓ TMS (TP/TP4) | ✗ Direct upload to Cloud ALM |

**Forbidden T-codes in Cloud PE:**
- SE11 (ABAP Dictionary modifications)
- SE38 (Classic ABAP program creation)
- SE80 (Object Navigator for custom code)
- SMOD / CMOD (Exit/Enhancement modification)
- SWDD (Classic Workflow definition)
- SPAM / SAINT (Transport/patch — managed by SAP)

---

## 3. Key User Extensibility — Tier 1 (Self-Service)

### 3.1 Custom Fields (Extensibility Add-Ons)

Enable end users (non-developers) to add business fields without coding.

**How to Create Custom Fields:**

1. **In Cloud PE UI** → **Manage Your Solution** → **Custom Fields**
2. Select object (Purchase Order, Sales Order, Material Master, etc.)
3. Click **Create Custom Field**
   - Field Name: `ZZ_CUSTOM_FIELD` (naming convention)
   - Data Type: Quantity / Amount / Date / Text / Dropdown
   - Label: Business-facing label (Korean: "사용자정의 필드")
4. **Deploy**: Activation is immediate (no transport)
5. **UI Integration**: Auto-added to relevant screens (Fiori UIs)

**Limitations:**
- No transactional logic (no derived fields)
- No cross-object validation
- Max 200 custom fields per object
- Field length: Text max 255 characters

**Example:** Add "승인 요청 코드" (approval code) to PO header:
- T-code: MANAGE_CUSTOM_FIELDS (Fiori)
- Object: Purchasing Document (PO)
- Field: ZZ_APPR_CODE (Text, length 20)
- Result: Auto-visible in PO Fiori app (no coding needed)

---

### 3.2 Custom Logic (ABAP Cloud with RAP)

For business logic beyond custom fields — use **Restricted ABAP Programming (RAP)** on released SAP APIs.

**What is RAP (Restful ABAP Programming)?**
- Cloud-native ABAP development model (CDS-based)
- No classic ABAP (SELECT, MODIFY, DELETE) — replaced by CDS + Event Handler
- Event-driven (Create, Update, Delete hooks)
- Published as OData V4 APIs automatically

**Tier 1 Custom Logic Entry Points (Key User-friendly):**

1. **Calculations/Derivations** — Automatic field computation
   - Example: "Invoice Amount = Net Amount + Tax" (tax auto-calc on item save)
   - Implementation: CDS Calculation / Transient Field

2. **Validations** — Block invalid data
   - Example: "PO quantity must not exceed contract qty"
   - Implementation: CDS Validation (CDS element WITH ... , associations)

3. **Default Values** — Pre-fill fields on creation
   - Example: "Set cost center from user default"
   - Implementation: CDS Default Handler

**ABAP Cloud Restrictions:**
- ✗ SELECT FROM database table (use CDS instead)
- ✗ MODIFY table directly
- ✗ CALL FUNCTION (classic RFC)
- ✓ CALL API (SAP standard APIs released)
- ✓ SQL queries via CDS Views
- ✓ OData consumption via HTTP

**Example:** Validate PO quantity vs. contract

```
CDS View: ZC_PO_CUSTOM
  element ZZ_CONTRACT_QTY : Contract Qty;
  
Validation Rule:
  if (PO_QTY > ZZ_CONTRACT_QTY) {
    raise_severity(error, 'Qty exceeds contract');
  }
```

---

### 3.3 Custom CDS Views (Read-Only Analytics)

Expose custom data models for reporting without modifying SAP tables.

**Use Case:** Create custom analytics on top of SAP data.

- Example: "Monthly spend by cost center vs. budget"
- Technology: CDS (Core Data Services)
- Consumption: Fiori Analytical App / Excel / Analytics Cloud

**Steps:**

1. **ABAP Workbench** (in Cloud PE) → **Create CDS View**
2. Define associations to standard SAP tables (PO, Invoice, GL, etc.)
3. Add calculations (SUM, AVG, COUNT)
4. **Publish as OData** (automatic)
5. Create Fiori app or connect to Analytics Cloud (SAC)

**Limitations:**
- Read-only (no CRUD operations)
- Max 100M rows per query (performance limits)
- Must use released SAP tables (not custom Z-tables)

---

### 3.4 Custom Business Objects (Transactional Objects)

For completely new entities (not extending existing SAP objects).

**Example:** "Internal Service Request" (separate from Purchase Order)

**Technology:** ABAP Cloud Business Objects (BO, OData)

**Development Steps:**

1. Create CDS View (root entity)
2. Define structure (header / items)
3. Create event handler (Create / Update / Delete)
4. Publish as OData V4
5. Create Fiori UI (using SAP Fiori Elements)

---

## 4. 3-Tier Extension Model

### Decision Tree: Which Tier for Your Use Case?

```
START
  ↓
Does your need fit Cloud PE standard?
  ├─→ YES → Use Standard Configuration (no extension needed)
  ├─→ NO → Does it require custom fields only?
  │          ├─→ YES → TIER 1 (Custom Fields only, end-user self-service)
  │          ├─→ NO → Does it require business logic (validation, calc) OR analytics?
  │                    ├─→ YES → TIER 1 (Custom Logic via RAP / CDS Views)
  │                    ├─→ NO → Do you need external integration (non-SAP APIs)?
  │                              ├─→ YES → TIER 2 (BTP side-by-side app)
  │                              ├─→ NO → Do you need classic ABAP OR table modifications?
  │                                        ├─→ YES → TIER 3 (On-Stack ABAP Cloud)
  │                                        └─→ NO → Evaluate Tier 2 (cleaner architecture)
```

### Tier 1: Key User Extensibility (In-Cloud, No Coding*)

| Capability | Tier 1 | Delivery | Ownership |
|---|---|---|---|
| Custom Fields | ✓ | Immediate (Fiori UI) | End User / Functional consultant |
| Custom Validations | ✓ | 1-2 days (CDS Validation) | Functional consultant (no ABAP needed) |
| Custom Calculations | ✓ | 1-2 days (CDS Calculation) | Functional consultant |
| Custom CDS Views | ✓ | 3-5 days | ABAP Cloud developer |
| Standard APIs | ✓ | 3-5 days (RAP event handler) | ABAP Cloud developer |
| Custom UI (Fiori) | ✓ | 1-2 weeks | SAP Fiori developer (low-code) |

*No Classic ABAP (SE38); ABAP Cloud is light-weight, CDS-centric.

**Release Cycle:** Delivered in next **Cloud PE Monthly Release** (no need to wait for quarterly)

---

### Tier 2: Side-by-Side Extension (BTP, Managed Service)

For use cases requiring:
- External systems integration (CRM, ERP, custom legacy system)
- Non-SAP data models
- Complex workflows (beyond SAP workflows)
- Custom UIs (Web app, Mobile, IoT)

**Technology Stack:**

- **BTP** (Business Technology Platform)
- **CAP** (Cloud Application Programming model)
- **JavaScript/TypeScript** (Node.js backend)
- **Fiori / Custom HTML5** (Frontend)
- **Event Mesh** (async integration)

**Architecture:**

```
Cloud PE SAP
     ↓
  APIs (OData)
     ↓
BTP CAP App ← Custom Logic
     ↓
External Services (3rd-party APIs)
     ↓
Custom UI (Fiori, Mobile, Web)
```

**Example:** Integration with vendor procurement system

```
Cloud PE → API Gateway → BTP CAP Service → Vendor System
   ↑_________________________↓
      (async: purchase order created → notify vendor)
```

**Development Effort:** 4-8 weeks (includes BTP setup, CAP, testing, deployment)

**Release Cycle:** Flexible (deployed directly to BTP, not tied to Cloud PE quarterly release)

---

### Tier 3: On-Stack ABAP Cloud (High-Control, Complex Logic)

For use cases requiring:
- Transactional consistency (multi-step atomic operations)
- Table structure extensions (fields not available via Custom Fields)
- Business object enhancements (complex workflows, side effects)
- Legacy code conversion (ABAP Classic → ABAP Cloud)

**Constraints:**
- Must use **released SAP APIs only** (CHECK `/IWBEP/SBCO_APPL_TYPES`)
- No classic ABAP (no SELECT ... FROM ... statements — use CDS)
- No standard table modifications (use Custom Fields + RAP)
- Code deployed via **Cloud ALM** (Custom Software Package)

**Technology:**

- **ABAP Cloud** (subset of ABAP on Cloud PE)
- **RAP** (Restful ABAP Programming)
- **CDS** (Core Data Services)
- **Event Handlers** (Create/Update/Delete/Save)

**Example:** Complex PO validation

```
ABAP Cloud Event Handler (Tier 3):

CLASS zcl_po_validation DEFINITION FINAL CREATE PRIVATE
  ...
  METHODS validate( po_data TYPE STRUCT ) RAISING EXCEPTION;
    
    IF po_data-qty > contract_qty THEN
      RAISE EXCEPTION ...
    ENDIF.
    
    IF po_data-price > price_limit THEN
      RAISE EXCEPTION ...
    ENDIF.
END CLASS.
```

**Release Cycle:** Deployed via **Cloud ALM** (can be mid-cycle if urgent, coordinated with SAP)

---

## 5. Fit-to-Standard Methodology

**Goal:** Minimize custom extensions by adapting business process to SAP Cloud PE standard.

### 5.1 Fit-to-Standard Workshop (Day 1-3)

**Participants:** Business analyst, functional consultant, IT lead, SAP solution architect

**Phase 1: Current State (Day 1)**
1. Map customer's current business processes (draw swimlanes)
2. Document all deviations from SAP standard
   - Custom fields in use?
   - Custom screens?
   - Custom reports?
   - Manual workarounds?

**Phase 2: Future State — Standard SAP (Day 2)**
1. Walk through SAP Cloud PE standard processes
2. Identify which customer requirements are **already satisfied** by SAP
3. Document remaining gaps (true business needs vs. legacy habits)

**Phase 3: Gap Analysis (Day 2-3)**
1. For each gap, decide:
   - **Fit**: Change business process to match SAP standard (no extension needed)
   - **Extend**: Custom field / custom logic (use Tier 1/2/3)
   - **Workaround**: Manual process (not ideal, but sometimes business decision)

**Example Gap Resolution:**

| Current (Legacy) | SAP Standard | Decision |
|---|---|---|
| "Approval workflow must go to 3 approvers" | SAP workflows support multi-level approval | **Fit** — use standard SAP workflow (no custom code) |
| "Cost center must be auto-filled from cost center master" | Standard provides default values | **Fit** — configure default values (no custom logic) |
| "Invoice must reject if VAT% doesn't match contract" | SAP validation engine (CDS) exists | **Extend** — Tier 1 Custom Logic (1-2 days) |
| "System must call legacy SMTP gateway for email" | SAP Cloud PE cannot call legacy on-premise | **Workaround** — use BTP Email Service or Tier 2 |

### 5.2 Delta Design (Post-Workshop)

Create document (delivered to customer):

```
DELTA DESIGN DOCUMENT
====================

1. Processes Fitting Standard (0 extensions needed)
   - Purchasing (PO to GR to IV)
   - Accounts Payable
   - Sales Order to Invoice

2. Required Extensions (Tier 1/2/3)
   a) Custom Field: Cost Center Sub-Division (Tier 1)
      Effort: 2 days
      Release: Next monthly release
   
   b) Custom Logic: PO Approval Workflow (Tier 1, CDS validation)
      Effort: 5 days
      Release: Next monthly release
   
   c) Side-by-Side: Vendor Portal (Tier 2, BTP CAP)
      Effort: 6 weeks
      Deployment: Separate BTP tenant

3. Workarounds (Manual Steps)
   - Monthly reconciliation report generation (IT manual export)
   - Legacy data migration (via LSMW, one-time)

TOTAL EXTENSION EFFORT: 7 weeks (vs. 6 months if no Fit-to-Standard)
CUSTOM CODE FOOTPRINT: 2 Tier 1 + 1 Tier 2 (minimal maintenance)
```

---

## 6. Cloud ALM (Application Lifecycle Management)

SAP's governance tool for Cloud PE updates, extensions, and quality assurance.

### 6.1 Cloud ALM Phases

```
IMPLEMENTATION PHASE (Go-Live Preparation)
  ├─ Test cycles (SIT, UAT)
  ├─ Regression testing
  ├─ Go-live cutover planning
  └─ Data load validation

OPERATIONS PHASE (Post Go-Live)
  ├─ Quarterly SAP release upgrades (automatic)
  ├─ Custom extensions deployment
  ├─ Hotfix management
  └─ Issue management & change requests
```

### 6.2 Deployment via Custom Software Package (CSP)

**CSP** = deliverable unit for Tier 1 / Tier 3 custom extensions.

**Contents:**
- CDS Views (custom logic, analytics)
- RAP Behavior (validations, calculations)
- Fiori UI components
- Custom business objects
- Transport artifacts

**Deployment Process:**

1. **Developer** → Package extension in ABAP Workbench
2. **Quality Gate** → Run Cloud ALM quality checks (ABAP Unit, Integration tests)
3. **SAP Review** (optional, for Tier 3) → SAP validates against released API list
4. **Upload to Cloud ALM** → CSP package
5. **Cloud PE Apply** → Deploy to production tenant (with rollback capability)

---

### 6.3 Quarterly Release Management

SAP releases Cloud PE updates **every month** (for security/minor features) and **major release every quarter** (functional features, UI updates).

| Activity | Frequency | Your Action |
|---|---|---|
| Security patches | Monthly (1st Tuesday) | Auto-applied by SAP (0 downtime) |
| Feature releases | Quarterly | Review FSD (Feature Scope Description) |
| Custom extension re-validation | Monthly | Check if your custom code still works |
| Regression testing | Quarterly | Full regression suite (Cloud ALM) |

**Key:** Cloud PE upgrades are **mandatory** and happen overnight (UTC). Plan testing for next day.

---

## 7. Feature Scope Description (FSD)

Before each quarterly release, SAP publishes **FSD** — detailed list of new features, deprecations, and breaking changes.

**How to Use FSD:**

1. **Download from SAP** (Cloud PE Release Notes)
2. **Filter for your industry** (Manufacturing / Finance / Retail / etc.)
3. **Identify business impact**
   - New features we want to enable → activate in Cloud ALM
   - Deprecated features we use → plan migration
   - Breaking changes → test custom extensions immediately

**Example FSD Entry:**

```
Feature: Enhanced PO Approval Workflow
Status: NEW
Availability: 2405 release (May 2024)
Industry: Manufacturing
Description: New approval levels, delegation support, email notifications
Business Impact: Can now retire custom approval system (Tier 2 BTP)
Action Required: Review current PO approval process, consider migration
Custom Code Impact: RAP validations will continue to work (backward compatible)
```

---

## 8. Korean Cloud PE Considerations

### 8.1 데이터 레지던시 (Data Residency)

SAP Cloud PE for Korea runs in **서울 Region (ap-northeast-2)** on AWS.

- **데이터는 한국에만 저장** (금융위원회 규정)
- **백업도 한국 리전** (재해복구 목적)
- **감사 추적 (audit log)** — 모든 변경사항 기록 (K-SOX 대비)

**Implication for Extensions:**
- Tier 2 BTP apps can call external APIs, but data must not leave Korea
- Tier 3 custom logic runs in-database (data stays in Korea)

### 8.2 한국 비즈니스 프로세스 특성

| Process | SAP Standard | Korean Adaptation | Extension Needed? |
|---|---|---|---|
| 부가세 (VAT) | EU VAT standard | 한국식 3단계 부가세 (조기환급, 선수금) | NO (standard config) |
| 원천세 (Withholding Tax) | Generic withholding tax | 한국 근로소득, 이자, 배당 세율 | NO (standard config) |
| 원가마감 (Period-End Cost Close) | Monthly/Quarterly | 한국 회사는 월마감 필수 | NO (standard config) |
| 자산회계 (Fixed Assets) | Standard depreciation | 한국식 감가상각법 (정액법, 정률법, 년수합계법) | NO (standard config) |
| 보조금 회계 (Subsidy Accounting) | Not standard | 정부지원금 추적 필요 (기업 특성) | YES (Tier 1 custom logic) |
| 관세 (Customs) | Not standard | 해외 수입/수출 관세 | YES (Tier 2 for customs broker integration) |
| 외환 (Foreign Exchange) | Standard FX module | 한국 은행 환율 & 선물환 | NO (standard config + daily exchange rate upload) |

### 8.3 IT 거버넌스 (한국 금융감독 대비)

- **감사증적** (Audit trail) — all changes to Financials module → stored 3년
- **이중승인** (Dual Control) — FI document posting requires 2 approvers (OBC4 configuration)
- **권한 분리** (Segregation of Duty) — Create ≠ Approve ≠ Post (role configuration)

---

## 9. ECC vs S/4HANA vs Cloud PE Differences

### Functional Comparison

| Feature | ECC 6.0 | S/4HANA On-Prem | RISE (Managed) | Cloud PE |
|---|---|---|---|---|
| **Extensibility** | | | | |
| Custom ABAP (SE38) | ✓ Unlimited | ✓ Unlimited | ✓ Limited | ✗ Forbidden |
| Function Exits (SMOD) | ✓ | ✓ | ✓ | ✗ Forbidden |
| Table Append | ✓ | ✓ | ✓ | ✗ (use Custom Fields) |
| RAP / ABAP Cloud | ✗ | ✓ (S/4 2020+) | ✓ | ✓ (Tier 1/3) |
| Custom CDS Views | ✗ | ✓ | ✓ | ✓ (Tier 1) |
| **Integration** | | | | |
| RFC (synchronous) | ✓ | ✓ | ✓ | ✗ (use OData) |
| RFC (asynchronous) | ✓ | ✓ | ✓ | △ (Event Mesh) |
| Message Queue (MQ) | ✓ | ✓ | ✓ | ✓ (BTP Event Mesh) |
| EDI (IDOC) | ✓ | ✓ | ✓ | △ (Custom code needed) |
| **Operations** | | | | |
| OS-level patching | ✓ (customer) | ✓ (customer) | ✓ (SAP) | ✓ (SAP) |
| DB patching | ✓ (customer) | ✓ (customer) | ✓ (SAP) | ✓ (SAP) |
| Backup frequency | ✓ (customer decides) | ✓ (customer decides) | ✓ (SAP decides) | ✓ (SAP automated daily) |
| High Availability | ✓ (customer config) | ✓ (customer config) | ✓ (SAP-managed) | ✓ (SAP-managed) |
| Disaster Recovery | ✓ (customer setup) | ✓ (customer setup) | ✓ (SAP-managed) | ✓ (SAP-managed, Korea region) |
| **Release Management** | | | | |
| Major version cycle | ~3-4 years | Annual (S/4 2020→2021→2022...) | Continuous (SAP chooses) | Monthly + Quarterly feature release |
| Customization preservation | ✓ | ✓ | △ (some breakage risk) | ✗ (no custom code, so no breakage) |
| Upgrade planning window | 6-12 months | 3-6 months | 1-2 weeks (notice) | 0 weeks (automatic overnight) |

### Development & Deployment

| Aspect | ECC | S/4HANA On-Prem | Cloud PE |
|---|---|---|---|
| Development Environment | Same hardware (DEV/TEST/PROD separate) | Same hardware | Managed by SAP (separate DEV/Test/Prod tenants) |
| Code Promotion | TMS (Transport Management System) | TMS | Cloud ALM (cloud-native) |
| Zero-Downtime Deploy | ✗ (system restarts) | △ (with planning) | ✓ (built-in, no restart) |
| Rollback Capability | ✓ (backup restore, slow) | ✓ (backup restore, slow) | ✓ (instant, green/blue deployment) |

---

## 10. Standard Response Format

All answers follow this structure:

**Issue** (사용자 보고사항 재정의)
→ **Environment** (Cloud PE 버전, extension tier, current state)
→ **Root Cause** (가능한 원인)
→ **Check** (Fiori UI path / Cloud ALM check / T-code in dev tenantif applicable)
→ **Fix** (단계별 해결 방법)
→ **Prevention** (설정/governance 권장)
→ **References** (관련 SAP docs / FSD / Cloud ALM best practices)

---

## 11. References

- `plugins/sap-cloud/skills/sap-cloud/references/img/overview.md` — Cloud ALM IMG 구조
- `plugins/sap-cloud/skills/sap-cloud/references/img/key-user-extensibility.md` — Custom Fields/Logic/CDS 구성
- `plugins/sap-cloud/skills/sap-cloud/references/img/fit-to-standard.md` — 워크숍 절차
- `plugins/sap-cloud/skills/sap-cloud/references/best-practices/operational.md` — Cloud PE 일상 운영 BP
- `plugins/sap-cloud/skills/sap-cloud/references/best-practices/period-end.md` — 기간마감 BP
- `plugins/sap-cloud/skills/sap-cloud/references/best-practices/governance.md` — 거버넌스 (릴리즈, 확장 통제)
- `plugins/sap-cloud/skills/sap-cloud/references/ko/quick-guide.md` — 한국어 퀵가이드
