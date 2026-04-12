---
name: sap-qm
description: >
  This skill handles SAP QM (품질관리) tasks including Inspection Lot (QA01/QA02/QA03), Inspection Plan (QP01/QP02/QP03), Results Recording (QE01/QE51N), Usage Decision (QA11/QA12/QA13), Quality Notification (QM01/QM02/QM03), Quality Certificate (QC01/QC21), Quality Info Record (QI01/QI02/QI03), and Stability Study.
  Use when user mentions QM, 품질관리, 품질검사, inspection lot, 검사로트, inspection plan, 검사계획, usage decision, 사용결정, quality notification, 품질통보, MIC, 검사특성, quality certificate, 인증서, sampling, 샘플링.
allowed-tools: Read, Grep
---

# SAP Quality Management (QM) Skill

## 1. Environment Intake Checklist

Before starting QM troubleshooting or configuration, collect:

- **SAP Release**: ECC 6.0 (SP number), S/4HANA 1909+, S/4HANA Cloud
- **Deployment**: On-premise (ECC/S/4 OP) | Private Cloud (RISE) | Public Cloud (SAP QMS)
- **QM Activation**: `SPRO > SAP Customizing for Quality Management` configured?
- **Scope**: 구매(MM) 수입검사 | 생산(PP) 공정검사 | 판매(SD) 납품검사
- **Industry**: 제조업(일반) | 화학 | 제약(GMP) | 식품(HACCP) | 자동차(IATF 16949)
- **Quality Strategy**: 100% 검사 | Sampling plan (AQL-based) | Zero-inspection (trusted supplier)
- **Integration**: MM-QM 구매검사 | PP-QM 공정검사 | SD-QM 납품검사 | QM-PM 통지서 연동

**Skill will adapt all answers to user's specific SAP release, deployment, and industry context.**

---

## 2. Quality Planning (QP01/QP02/QP03, QS21/QS31, QDV1)

### 2.1 Inspection Plan Structure (검사계획)

**Transaction**: QP01 (Create), QP02 (Change), QP03 (Display)

**Logical hierarchy**:
```
Inspection Plan Header (PLKO)
├─ Plan Number (PLNNR): 자동 또는 수동 부여
├─ Material (PLKO-MATNR) + Plant (PLKO-WERKS)
├─ Inspection Type (PLKO-LOART):
│  ├─ 01: Purchasing (구매 입고 검사)
│  ├─ 03: Production (공정 검사)
│  ├─ 04: Sales (판매 출고 검사)
│  └─ 08/09: Recurring/Source
├─ Valid from/to (PLKO-GDATU ~ PLKO-GDATU_END)
└─ Status: 1=Created, 2=Released, 3=Locked
    └─ Inspection Operations (PLPO) — 검사 단계별
        ├─ Operation number (OPNR): 10, 20, 30...
        ├─ MICs (Master Inspection Characteristics — PLMK)
        └─ Sampling Procedure (QDV1 reference)
```

**Key Tables**:
- `PLKO`: Plan header (Inspection plan name, type, dates)
- `PLPO`: Plan operations (Operation sequencing, MIC assignment)
- `PLMK`: Plan-MIC assignment (QPMK reference)
- `QPMK`: Master Inspection Characteristics (검사특성 마스터)

**한국 현장 팁**: IATF 16949 대비 각 Operation마다 _검사기준(Specification)_ 명확히 입력 필수. LSL/Target/USL 3개 다 입력.

### 2.2 Master Inspection Characteristics (MIC) — QS21/QS31

**QS21 Transaction** (Create MIC):
- MIC Code (QPMK-MERKM): 산도, 경도, 수분율, Tensile strength 등
- Type (QPMK-MERTY): 1=Quantitative (수치), 2=Qualitative (합격/불합격)
- Unit of measure (QPMK-MEINS): mg/L, HV, %, ppm
- Valuation (QPMK-BWFL): A=Automatic, B=Manual, C=Reference sample

**Specification Definition** (QS31 — Material에 대한 MIC 기준값):
- LSL (Lower Spec Limit): QPSP-LSL
- Target (Nominal): QPSP-ZIELW
- USL (Upper Spec Limit): QPSP-USL
- Tolerance (±): QPSP-ABWG

**예시** (제약 API 수분율):
```
MIC Code: MOISTURE
Type: Quantitative
Unit: %
Specification:
  LSL: 1.0%
  Target: 2.5%
  USL: 5.0%
Valuation: Automatic (측정값 vs LSL/USL 자동 비교)
```

### 2.3 Sampling Procedure Configuration (QDV1)

**Purpose**: Lot size에 따른 샘플 크기 결정 (ISO 2859-1 AQL 기반)

**Three sampling schemes**:
- **Single**: 1차 샘플링으로 최종 판정 (Accept/Reject)
- **Double**: 1차 inconclusive → 2차 샘플링
- **Sequential**: 합격 판정될 때까지 계속 샘플링

**AQL Parameters**:
- AQL (Acceptable Quality Level): 예) 1.0% = 최대 1% 불량 허용
- Sample size letter (A~M): ISO 2859-1 lookup table (QPSA 테이블)
- Acceptance number (Ac): "합격" 수량
- Rejection number (Re): "불합격" 수량

**Configuration Path**: `SPRO > QM > Quality Planning > Sampling > Define Sampling Procedure`

**Key Tables**: 
- QPSA: Sampling header
- QPSX: Sampling level (Normal/Tightened/Reduced)

**한국 자동차**: 보통 AQL 2.5% or 4.0% (supplier 신뢰도에 따라 분화)

### 2.4 Dynamic Modification Rules (QDR1)

**목적**: 연속 검사 결과에 따라 샘플 크기 동적 조정

**Transition Rules**:
- **Normal → Tightened**: N개 불합격 로트 발견 시 (예: 5회)
- **Tightened → Normal**: M개 연속 합격 로트 (예: 5회)
- **Normal → Reduced**: K개 연속 합격 + 조건 만족 시 (예: 25회)
- **Reduced → Normal**: 불합격 또는 OOS 검출

**설정 예**:
```
Tightened entry: 불합격 횟수 = 5
Tightened exit: 합격 횟수 = 5
Reduced entry: 합격 횟수 = 25 AND 불합격률 < 0.5%
Reduced exit: 불합격 1회 (즉시)
```

**생산 관점**: Tightened 진입 시 생산 속도 저하 (샘플 size ↑) → 원인 파악 및 시정 urgency ↑

---

## 3. Quality Inspection — Inspection Lot & Results Recording

### 3.1 Inspection Lot Creation (QA01)

**Inspection types** (검사유형, QALS-LOART):
- **01**: GR Inspection (구매 입고 검사) — MIGO 후 자동 또는 수동
- **03**: In-process (생산 공정 검사) — 공정 단계별 타이밍
- **04**: GI Inspection (판매 출고 검사) — MIGO GI 전
- **08**: Recurring inspection (반복 검사) — 정기적 재검사
- **09**: Source inspection (원산지 검사) — 공급사 공장에서

**Automatic Creation Flow**:
```
Material Master (MM02):
  QM Control Level (IQMC) = "01" 또는 "02"
    ↓
Purchasing Info Record (ME11) 또는 Quality Info Record (QI01):
  Inspection plan flag = "X"
    ↓
MIGO (GR posting):
  자동 → Inspection Lot 생성 (QALS)
    ↓
QA25 (Background job):
  Daily/Hourly run → 대량 검사로트 생성
```

**Manual Creation** (QA01 T-code):
```
QA01 Screen:
├─ Material Number (QALS-MATNR)
├─ Quantity (QALS-MENGE)
├─ UoM (QALS-MEINS)
├─ Supplier (QALS-LIFNR) — Type 01 구매의 경우
├─ Inspection Type: 01/03/04/08/09
├─ Inspection Plan: 자동 상속 (PLKO → QALS-PLNNR)
└─ Lot number (QALS-LOSNR): Auto/Manual
```

**Key Table**: QALS (Inspection Lot Header)

### 3.2 Sample Definition (QPR1/QPR2)

**Sample Determination** (샘플 결정):
1. Inspection Plan → Sampling Procedure (QDV1) lookup
2. Lot size입력 → Sample size 자동 계산 (ISO 2859-1)
3. Sample selection strategy:
   - Sequential: Units 1, 2, 3... n
   - Random: SAP random number generator
   - Every nth: e.g. 매 5번째 unit

**Sample Recording** (QPR1 Transaction):
```
QPR1:
├─ Select Inspection Lot (QALS)
├─ System proposes sample size & strategy
├─ Assign sample units (팔레트/박스 ID 또는 연번)
└─ Print sample labels (for inspection lab)
```

**Key Tables**: QASE (Sample header), QASV (Individual sample values)

### 3.3 Results Recording (QE01/QE51N)

**QE01 Transaction** (Classic GUI):
```
QE01:
├─ Select Inspection Lot (QALS)
├─ Record per Characteristic (MIC):
│  ├─ Quantitative: 수치 입력 (예: 98.5 mg/L)
│  │  → 자동 vs LSL/USL 비교 → Pass/Fail
│  └─ Qualitative: Accept/Reject 선택
├─ Record Defects (optional):
│  ├─ Defect code (QMFE-MFEHL, e.g. CRACK, BURN)
│  └─ Quantity affected
└─ Save (QASR 테이블에 기록)
```

**QE51N (Fiori App — Mobile inspection input)**:
- 모바일 친화 UI
- QR code 스캔 → sample 빠른 접근
- 검사기기 API 직접 연동 (자동 수치 입력)
- Offline mode 지원

**Result Evaluation** (자동):
- Individual MIC result: Pass (수치가 LSL~USL 범위) / Fail (Out of spec)
- Lot-level judgment: 별도 UD (Usage Decision) transaction에서 수행

**Key Tables**: 
- QASR (Result header — Lot별)
- QASV (Sample value — 개별 샘플 수치)
- QAVE (Evaluation — 최종 Pass/Fail 기록)

### 3.4 Statistical Process Control (SPC) — 관리도

**SPC Configuration** (Quality Control 메뉴):
```
SPRO > QM > Quality Control > Define Control Chart
```

**Chart Types**:
- **X-bar & R chart**: 연속 공정 (mean ± std dev tracking)
- **p-chart**: Proportion defective (불량률 추적)
- **c-chart**: Defect count (결함 개수)

**Triggers**:
- 관리한계(Control limit) 벗어남 → QM notification 자동 생성
- 추세(Trend): 8개 연속 point가 center line 한쪽 → 경고
- Rule violations → Root cause investigation 유도

**생산 현장 활용**: 공정능력(Cpk) 사전 평가 후 매 로트마다 모니터링 — 즉시 이상 감지

---

## 4. Usage Decision (QA11/QA12/QA13)

### 4.1 UD Creation & Codes

**Transactions**:
- QA11: Create Usage Decision
- QA12: Change
- QA13: Display

**UD Codes** (최종 판정):
- **A**: Accept (합격) — 재고로 입고 가능, 다음 공정/판매 진행
- **R**: Reject (불합격) — 재고 차단, 반품/폐기 예정
- **B**: Conditional (조건부) — 고객 승인 대기 또는 재작업
- **S**: Return to supplier (공급사 반송 — 수입검사 Type 01에서만)

**UD Creation Flow**:
```
QA11:
├─ Select Inspection Lot (QALS-LOSNR)
├─ System shows all MIC results (QASR 요약)
├─ Judge UD Code:
│  ├─ All MIC pass + No defects → "A" (Auto-recommend)
│  ├─ Any MIC fail OR Defects found → "R"
│  └─ Marginal case → "B" (with reason text)
├─ Optional: Partial acceptance (Accepted qty ≠ Lot qty)
└─ Save (QAVE 테이블)
```

**Key Table**: QAVE (Usage Decision record)

### 4.2 Post-UD Actions (Follow-up Processing)

**Accept (A) → Stock Posting**:
```
MIGO blocked GR → Auto-completed
↓
Inventory: Material received into active stock
↓
Next process (Production consume, Sales ship) can proceed
```

**Reject (R) → Stock Management**:
```
QALS → QAVE (UD=R)
↓
Blocked stock (QMSL, 품질보류 재고)
↓
Options:
├─ Scrap posting (MIGO Scrap)
├─ Return to supplier (Vendor credit memo)
└─ Rework (if internally caused failure)
```

**Conditional (B) → Quality Hold**:
```
QAVE (UD=B, reason= "고객확인대기")
↓
Stock in Quality Hold (QM block)
↓
Customer approval → Update UD to "A" → GR completes
   OR Denial → Change to "R" → Scrap
```

**Quality Notification Trigger** (자동):
```
If UD = R:
  → QM01 자동 생성 (Customizing 설정)
  → Defect history 기록
  → Supplier evaluation score 반영
```

### 4.3 Partial Lot Acceptance (부분 합격)

**Scenario**: 100개 로트 → 98개 OK, 2개 불량

**QA11 Handling**:
```
QA11:
├─ Select QALS (Qty=100)
├─ UD Code = "A" (Accept partial)
├─ Enter "Accepted qty" = 98
├─ Enter "Rejected qty" = 2
└─ Save
    ↓
MIGO posting: +98 to active stock, +2 to blocked stock
    ↓
결과: 총 100개 중 98개만 사용 가능 (GR 재무 기장도 98개 기준)
```

**Key Field**: QAVE-MNGEA (Accepted qty), QAVE-MNGEB (Rejected qty)

### 4.4 Automatic UD Processing (QA32)

**Purpose**: 검사 완료되었으나 UD 수동 미생성 로트 자동 판정

**설정**:
```
SPRO > QM > Quality Inspection > Inspection Lot > 
  Define Automatic Usage Decision
    ↓
Rule 설정:
├─ All samples passed AND no defects → Auto "A"
├─ Any sample failed OR Defects → Auto "R"
└─ Automatic update flag = X
```

**QA32 실행**:
```
QA32 Report:
├─ Selection: Lot status 04 (Results recorded, UD pending)
├─ Execute → Background job
└─ Result: UD records created for matching lots
```

**생산 관점**: 월마감 전 일괄 처리로 미결 검사로트 정리

---

## 5. Quality Notification (QM01/QM02/QM03)

### 5.1 Notification Structure & Types

**Transactions**:
- QM01: Create Notification
- QM02: Change
- QM03: Display

**Notification Types** (QMEL-QMART):
- **Q1**: Customer Complaint (고객 클레임)
- **Q2**: Internal QM (내부 품질 문제, 불합격 로트 등)
- **Q3**: Vendor (공급사 품질 불량)
- **L1**: General Complaint (총괄)

**Typical Triggers**:
- QA11 UD=R → Auto-create Q2
- Customer call → Manual create Q1
- Source inspection fail → Manual create Q3

### 5.2 8D Methodology → SAP Fields

**8D 단계별 SAP 매핑**:

| 8D Step | SAP Field | T-code | 설명 |
|---------|-----------|--------|------|
| 1. Team | QMEL-QMNUM + Task assignment | QM01 → QMMA | 담당자 지정 |
| 2. Problem | QMTXT (Free text), Attachment (QMMA-FILES) | QM01 | 문제 상세 기술 |
| 3. Containment | Task (QMMA-ASNR) URGENT | QM01 | 즉시 대응 기한 설정 |
| 4. Root Cause | Defect code (QMFE-MFEHL) + free text | QM01 → QMFE | RCA 분석 결과 기록 |
| 5. Corrective Action | Task (APTY="Corrective") | QM01 → QMMA | CA 태스크 생성 |
| 6. Implementation | Task status (TSTA) tracking | QMMA → status change | 진행 추적 |
| 7. Verification | Re-inspection results (QE01) | QA01/QE01 → QASR | 재검사 증빙 |
| 8. Closure | QMEL-QMSTAT = "E" (Closed) | QM02 | 통보 종료 |

### 5.3 Defect & Root Cause Entry (QMFE table)

**QM01 → Defects Tab**:
```
QMFE Entry:
├─ Defect code (MFEHL): SAP-정의된 코드 lookup
│  예) CRACK, DISCOLORATION, CHEMICAL_BURN, DIMENSION_OOS
├─ Defect description (free text): 추가 설명
├─ Quantity affected (FEHLM): 몇 개 유닛 영향
├─ Cause code (UAQZ):
│  ├─ O: Original (근본원인)
│  └─ I: Immediate (직접 원인)
└─ Link to related defects (if multi-cause)
```

**예시** (제약 변색 클레임):
```
Defect: DISCOLORATION
Qty affected: 50 units (전체 케이스 중)
Immediate cause: Storage temperature exceeded 30°C
Root cause: Warehouse A/C malfunction
Related defect: Shelf-life reduction (expiration moved from Y+3 to Y+1)
```

### 5.4 Corrective Action Task Creation

**QM01 → Activities Tab**:
```
QMMA (Activity/Task) Creation:
├─ Activity type (APTY):
│  ├─ "Corrective" — CA task
│  ├─ "Diagnostic" — RCA investigation
│  └─ "Preventive" — Future prevention
├─ Description: "Replace warehouse A/C unit"
├─ Responsible person (AQUA): Maintenance manager
├─ Due date (FDZZ): 7 days urgency
├─ Budget code (if applicable): Cost center assignment
└─ Status (TSTA): 01=Created, 02=In progress, 03=Completed
```

**Task Monitoring** (QMMA table):
- Progress tracking (% complete)
- Evidence upload (documents, photos)
- Verification meeting schedule

### 5.5 Integration with PM (Production Maintenance)

**Cross-module Flow**:
```
QM Notification (Quality issue detected)
  ├─ Defect code = "Equipment malfunction"
  ├─ Task type = "Maintenance required"
  └─ Create PM Notification (Type PM, QMEL-QMART)
      ↓
PM01 Maintenance notification created
      ↓
PM order (IW32) generated
      ↓
Maintenance execution, cost tracking
      ↓
Feedback: Equipment repaired → QM closes Q2
```

**한국 현장**: 생산 일정(PP) ↔ 설비 정비(PM) ↔ 품질 이슈(QM) 동시 조정 필요

---

## 6. Quality Certificate (QC01/QC21)

### 6.1 Certificate Profile Configuration (QC01)

**QC01 Transaction** (Certificate profile 정의):
```
QC01:
├─ Certificate name/ID (예: "CoA_PHARMA_ENG_v2")
├─ Material assignment (특정 material에만 cert 발행)
├─ Certification rule:
│  ├─ Automatic: 모든 delivery마다 자동 생성
│  ├─ Manual: QC21에서 수동 생성
│  └─ On-demand: 고객 요청 시만
├─ Language variant (EN, DE, ZH, KO 등)
├─ Form/Template: SMARTFORM (ZQC_*) 또는 Adobe Forms
└─ Archive setting: E-signature required?
```

**Key Fields**:
- ZQCMO-VRSNO: Version tracking (변경 이력)
- ZQCMO-SPRACHE: Language code (EN, DE 등)
- ZQCMO-FMNAME: Form name (출력 양식)

### 6.2 Certificate of Analysis (CoA) Content & Generation

**CoA 구성**:
```
Header Section:
├─ Company: 법인명, 주소
├─ Material: 제품명, 규격 코드
├─ Lot/Batch: 로트번호, 유효기간
└─ MFG Date, Expiry Date

Test Results Table:
├─ Characteristic (MIC code)
├─ Specification (LSL-Target-USL)
├─ Test result (실제 측정값)
├─ Unit of measure
├─ Status (Pass/Fail ✓/✗)
└─ Test date, Lab ID

Footer:
├─ Authorized signature block
├─ QA Manager stamp
├─ Archive reference
└─ QM lot number (추적용)
```

**Generation Methods**:

1. **Manual (QC21)**:
   ```
   QC21:
   ├─ Select QM Lot (QALS-LOSNR)
   ├─ System retrieves QASR results
   ├─ Generate PDF (SMARTFORM or Adobe)
   └─ Save to DMS or Email to customer
   ```

2. **Automatic (Delivery)**:
   ```
   SD Delivery (Packing stage)
   ├─ Check certificate requirement (QC01 flag)
   ├─ Link to QM lot UD (if type 04 inspection)
   ├─ Auto-trigger QC21 if UD=A
   └─ Attach to output (NAST message)
   ```

**Key Tables**:
- ZQCMO: Certificate master
- ZQCDR: Certificate data records (실제 인증서 발급 기록)

### 6.3 Outbound Certificate at Delivery (배송 인증서)

**Process Flow** (SD → QC21):
```
Sales Order (SO) → Delivery (Picking/Packing)
    ↓
QM Lot (Type 04, GI Inspection) UD = "A" ?
    ↓ YES
Execute QC21 automatically (Customizing)
    ↓
Generate CoA PDF → Archive + Email to customer
    ↓
NAST (Message configuration) — Invoice와 함께 첨부
    ↓
Customer receives: Packing note + CoA + Invoice
```

**NAST Configuration** (Output 설정):
```
NAST T-code:
├─ Application: V3 (Sales & Shipping)
├─ Message type: RD (Delivery note) or INVOICE
├─ Form: ZQC_COA (Certificate form)
├─ Trigger: 10 = Post goods issue
├─ Medium: 1=Print, 2=Email, 5=Archive
└─ Output program: RLQC_QC21_OUTPUT (standard SAP report)
```

**생산 관점**: 납품 직전 자동화로 수동 CoA 생성 일 감소

---

## 7. QM-MM Integration (구매/수입검사)

### 7.1 Quality Info Record (QI01/QI02/QI03)

**Purpose**: 공급사별, Material별 품질 관리 정책 정의

**QI01 Create**:
```
QI01:
├─ Supplier (LIFNR)
├─ Material (MATNR)
├─ Inspection plan (PLNNR reference) — source inspection plan
├─ Quantity exemption (QE): 이 수량 이상만 검사 필수
├─ Inspection control code (QZGTP):
│  ├─ 01: Inspection mandatory
│  ├─ 02: 100% inspection (까다로운 supplier)
│  └─ 03: No inspection (trusted source)
├─ Certificate requirement (INFE): CoA 필수?
└─ Quality weighting (GEWBP): 공급사 평가 가중치
```

**Key Table**: EINE (Info Record vendor-specific)

**예시** (신규 공급사 vs 우수 공급사):
```
Scenario 1: New supplier X
├─ Inspection plan: Standard (Type 01, AQL 2.5%)
├─ Certificate required: Yes
├─ Qty exemption: 0 (모든 로트)
├─ Control code: 01 (Mandatory)

Scenario 2: Preferred supplier Y (IATF 16949 certified)
├─ Inspection plan: Reduced (AQL 6.5%)
├─ Certificate required: No
├─ Qty exemption: 1000 (1000개 이상만 검사)
├─ Control code: 03 (No inspection)
```

### 7.2 Vendor Evaluation (공급사 평가 — ME61)

**Scoring Model** (공급사 점수):
- **Quality score**: (Accepted lots / Total lots) × 100 [%]
- **Delivery score**: On-time delivery %
- **Price performance**: Quoted price vs actual cost variance

**SAP Calculation**:
```
Quality score = Sum(QAVE UD="A") / Count(QAVE) × 100

Example:
├─ Total QM lots: 20
├─ Accepted (UD=A): 19
├─ Rejected (UD=R): 1
└─ Quality score = 19/20 × 100 = 95%
```

**Impact on Sourcing**:
```
Quality score tracking (ME61):
├─ > 98% → Preferred supplier, Reduced inspection
├─ 95-98% → Standard supplier, Normal inspection
├─ < 95% → At-risk supplier, Tightened inspection or hold PO
```

**Table**: EIVR (Evaluation record — 역사 추적)

**한국 현장**: 대기업 협력사 평가 (삼성 S-rating, 현대 Quality score) 연동

### 7.3 Blocked Stock Management (차단 재고)

**Stock Categories** (after QM inspection):
- **Inspection stock (QMSPL)**: 검사 진행 중 (reserved)
- **Quality hold**: Conditional UD (B) 대기 중
- **Blocked stock**: Reject UD (R) → 폐기/반품 예정

**Transaction MRB** (Return/Credit):
```
MRB (Goods return):
├─ Select Inspection Lot (QALS)
├─ Create Return PO
├─ Vendor credit memo (MIRO posting)
└─ Inventory: Reject qty → return to supplier
```

**Goods Movement**:
```
GR (Type 01 inspection):
├─ Initial: MIGO goods receipt 직후 → Inspection stock
├─ After UD=R: MIGO "Return" → Supplier return
├─ After UD=A: Automatic transfer to active stock
```

---

## 8. QM-PP Integration (생산/공정검사)

### 8.1 In-Process Inspection (공정 중 검사)

**Configuration** (PP Production Order):
```
Production Order (Auftragsart):
├─ Operation (공정단계): 포장, 테스트, 최종검사
├─ QM hold point: "X" (검사 완료까지 다음공정 금지)
├─ Inspection plan (Type 03): 공정 검사 계획 연결
└─ Sample size: 로트 크기 기반 자동 계산
```

**Flow**:
```
Production order start
    ↓
Perform operation (manufacturing)
    ↓
QM Lot creation (Type 03) — automatic or manual
    ↓
Inspection: Sample → QE01 results recording
    ↓
UD creation (QA11) — All OK?
    ├─ Yes (A) → Release hold → Next operation proceeds
    └─ No (R) → Block → Rework or scrap decision
```

**Impact**: 공정 지연 risk (불합격 시 다음 공정 정지)

### 8.2 Goods Receipt from Production (생산입고 검사)

**Scenario**: In-process inspection 완료 후, 완제품을 내부 warehouse에 GR

**Inspection Lot** (Type 01 GR):
```
MIGO GR (Production order completion):
├─ Auto-create Inspection Lot (Type 01)
├─ Inspection Plan (Material, Plant)
├─ Sample size lookup (QDV1)
└─ Status: Inspection stock (차단 재고)
    ↓
    QE01 Results recording
    ↓
    QA11 UD creation
    ↓
    If UD=A: Goods transfer to active stock
```

**Key Difference**: In-process (Type 03) vs GR (Type 01) — 수량, 샘플 크기, 통지서 연동이 다름

### 8.3 Batch Determination with QM Results

**Integration** (Batch traceability):
```
Batch Master Data (CHVW):
├─ Batch characteristic (예: Tensile strength)
├─ Value assigned from QM lot result (QASR)
└─ Batch determination rule (BDCR) lookup
```

**Example**:
```
Customer order request: "High-strength material (Tensile > 500 MPa)"
    ↓
SAP batch determination:
├─ Query batch characteristics in CHVW
├─ Filter: Batches with Tensile > 500 MPa
├─ Link to QM lot (QALS) to verify test date freshness
└─ Auto-assign batch to sales order
```

**생산 관점**: 품질 등급화로 다양한 customer requirement 대응

---

## 9. ECC vs S/4HANA — Quality Management Differences

| 기능 | ECC 6.0 (SP최신) | S/4HANA 1909+ | S/4HANA Cloud | 주요 변경 |
|------|---|---|---|---|
| **QM Master T-codes** | QA01-QA13, QE01, QC01 | 동일 (GUI) | Fiori-only | Web-based UX |
| **Inspection Planning** | QP01-QP03 (GUI) | QP01-QP03 + Fiori (F5370) | F5370 only | Mobile-first |
| **Results Recording** | QE01, QE05N (부분 Fiori) | QE51N (Mobile-optimized) | QE51N PWA | Mobile 우선순위 |
| **Automatic UD** | QA32 batch job | QA32 + Fiori (F5434) | F5434 Fiori | User-driven UI |
| **SPC/Analytics** | Manual QCCP lookup | SAP Analytics Cloud link | Embedded BI | Predictive QM |
| **Document Management** | Attachment (QMMA file) | SAP Content Server, Embedded storage | Cloud storage | Digitization |
| **Workflow** | SAP Workflow (WF-BATCH) | Fiori workflow tiles | Cloud workflow | User-friendly |
| **Certificate (CoA)** | SMARTFORMS (ZQC_*) | Adobe Forms + SMARTFORMS | Adobe Forms Native | E-signature 지원 |
| **Supplier Portal** | Not integrated | SCP (Cloud Platform) connector | Built-in supplier portal | Real-time visibility |
| **ML/AI** | Custom ABAP only | SAP Analytics Cloud ML | Embedded ML (anomaly) | Autonomous QM |
| **Integration** | RFC/IDOC (custom) | OData API + Analytics API | REST/GraphQL | Microservices |
| **Real-time Reporting** | BW cube (scheduled) | Embedded analytics (live) | Live dashboards (HANA) | HANA speed |

### Key S/4HANA Simplifications (단순화):
1. **Simplified Inspection Lot**: 결과 직접 UD 판정 (중간 단계 축소)
2. **Embedded Quality Dashboard**: BI 도구 불필요
3. **Fiori-first UX**: GUI transaction 단계적 폐지 (2026년 이후)
4. **Real-time Compliance**: 검사 완료 즉시 규제 보고 가능

---

## 10. Korean Industry & Regulatory Context

### 10.1 ISO 9001:2015 + IATF 16949 (자동차 심사 기준)

**ISO 9001 → SAP QM Mapping**:
- **Clause 8.6** (Quality evaluation): Inspection Plan (QP01-03), Sampling (QDV1) ✓
- **Clause 8.2.3** (Conformance confirmation): UD judgment (QA11-13) ✓
- **Clause 8.3** (Non-conforming product): Quality Notification (QM01) ✓

**IATF 16949 (자동차 부품)** — Auditor 체크리스트:
1. **FMEA 추적**: Defect code (QMFE) → FMEA ID 매핑 가능?
2. **Control Plan 문서**: QP01 output과 Control Plan 동일성?
3. **Traceability**: Lot/Batch → QM lot → Supplier/MFG date 추적 가능?
4. **메트릭 추적**: Cpk (공정능력) 계산 가능?

**Audit Evidence**:
- QP01/QP03 print (검사계획 approved version)
- QMEL closure record (8D compliance)
- ME61 Quality trend (공급사 score 개선 추세)

### 10.2 한국 제약 GMP (의약품 품질관리기준)

**식약처 기준** (GMP Annex 2 — Quality documentation):

1. **Sampling Plan 기록**:
   ```
   Requirement: 최소 3년 보존
   SAP: QP01-QP03 print → PDF archive (DMS 또는 파일시스템)
   Audit: "2023년 X 제품의 검사계획을 보여주세요"
   ```

2. **CoA (Certificate of Analysis)**:
   ```
   Requirement: 모든 원료약 납입 시 CoA 첨부 필수
   SAP: QC01/QC21 자동 생성 + E-signature (Adobe Forms)
   Audit: CoA 발행 이력 + Signed version 보존
   ```

3. **Batch Record** (배치 기록):
   ```
   Requirement: 생산 전 과정 기록 + QC 결과 통합
   SAP: Production Order (PP) + QM results 연계
        - Z-table 커스터마이즈 또는 SAP Add-on (QMS in S/4)
   Audit: "2023년 Batch A-001의 전체 생산/검사 기록"
   ```

4. **Stability Study**:
   ```
   Requirement: Long-term stability (3년+) 모니터링
   SAP: QM Lot + Characteristic tracking (X-bar chart)
   Auditor: "Batch A-001의 12개월 마다 검사 결과 추이"
   ```

**Configuration Checklist**:
```
SPRO > SAP Customizing for Quality Management:
  ├─ Industry code: Pharmaceutical
  ├─ GMP compliance flag: X
  ├─ Signature capture: Adobe Forms + digital signing
  └─ Retention: 36 months (자동 archive)
```

### 10.3 한국 식품 HACCP (위해요소중점관리기준)

**HACCP 12단계 → SAP 매핑**:

| HACCP 단계 | SAP QM | 필드 |
|-----------|--------|------|
| CCP 식별 | Inspection Plan (QP01) | CCP 플래그 |
| 관리 한계 설정 | MIC Specification (QPSP) | LSL/Target/USL |
| CCP 모니터링 | In-process inspection (QE01) | Temperature, pH, microbial |
| Sampling | QDV1 sampling procedure | Daily/Hourly frequency |
| 시정 조치 | Quality Notification (QM01) | Corrective action task |
| 기록 보존 | QALS/QASR archiving | 2년+ retention |
| 검증 | UD judgment (QA11) | Pass/Fail 최종 판정 |

**Configuration**:
```
Material Master (MM02):
├─ CCP flag = "X"
├─ Inspection plan (Type 03): Daily frequency
├─ Automatic alert: Out-of-spec → QM01 Q2 auto-create

SPRO > QM > Define Automatic Notification:
└─ Trigger: QASR (Temperature > 30°C) → Create QM01
```

### 10.4 수입검사 (관세청 UNI-PASS 연동)

**Regulatory Background** (한국):
- 통관 전 품질 증빙 요구 확대 (특히 식품, 화학, 의약품)
- UNI-PASS (통합관세시스템) ↔ SAP QM 연동 필요

**SAP Integration Point**:
```
Purchase Order (구매 발주):
├─ Customs declaration (USDOC field, PO header)
├─ Import supplier flag: "I"
└─ Inspection requirement: "Import Inspection"
    ↓
MIGO GR (goods receipt):
├─ Auto-create Inspection Lot (Type 01, Import)
├─ Inspection plan: Source inspection (Type 01 + Supplier)
└─ Block GR posting (차단)
    ↓
QE01 Results recording + UD (QA11):
├─ UD = "A" → Certificate generated (QC21)
├─ Send CoA to customs broker
└─ MIGO posting release → GR completes
```

**Blocking Logic** (SPRO customizing):
```
MIGO-GR Validation:
IF Material.Origin = "Import" AND Supplier.Country != "KR"
THEN Create Inspection Lot (Type 01)
    AND Block MIGO until UD = "A"
    AND Generate CoA (QC21)
    AND Notify customs broker (email extract)
```

**생산 관점**: 통관 지연 risk → 재고 운영 계획에 여유(Buffer) 필수

### 10.5 대기업 협력사 공급망 (삼성/현대)

**삼성전자 Quality Requirements**:
- Q-rating (3개월 rolling avg) > 98% 필수
- MES ↔ SAP QM 실시간 동기화 요청
- Supplier Portal access (QM data 공개)

**현대자동차 Quality Requirements**:
- IATF 16949 certification (필수, 미보유 공급사 차단)
- IQMS (In-house QMS) 준수
- Monthly quality review meeting (QM KPI export)

**SAP Configuration**:
```
ME61 Vendor Evaluation (자동 계산):
├─ Quality score = (Accepted lots / Total lots) × 100
├─ 3개월 rolling average
└─ Threshold alert: Score < 95%
    → Auto message to procurement manager
    → Recommendation: Reduce PO qty or pause orders

Export for supplier meeting:
├─ SAP Report (ALV format): ZQC_VENDOR_SCORECARD
├─ Data: Last 90 days QM lots, UD distribution, top defects
└─ Distribution: Email to supplier QA manager
```

**한국 특수성**: 대기업 공급망 평가 시스템(S-rating, Q-rating)이 SAP와 직결됨

---

## 11. Standard Response Format (문제해결 프로세스)

### Issue Description
사용자 문제 명확화:
- "검사로트가 생성되지 않음"
- "UD 합격 후에도 GR이 차단되어 있음"
- "CoA가 고객에게 안 보내짐"

### Root Cause Analysis (RCA)

**Step 1: Data Check** (테이블 조회):
- Material master (MM02): QM level 확인 (IQMC field)
- Quality Info Record (QI03): 공급사별 설정 확인 (QZGTP)
- Inspection Plan (QP03): 유효 범위 확인 (GDATU from/to)

**Step 2: Configuration Check** (`SPRO` navigat):
```
SPRO > SAP Customizing for Quality Management:
├─ Automatic Lot Creation Rules
├─ Stock Posting Logic (UD Code A/R/B mapping)
└─ Notification Triggers
```

**Step 3: System Activity Check**:
- Background job (SM37): QA25 execution log
- Error log (SM21): System message 확인
- Table data (QALS, QAVE): Expected 데이터 존재 여부

### Verification (재현 확인)
- Test material로 end-to-end 시뮬레이션
- Expected behavior vs actual behavior 비교
- Transaction trace (SE39 debug mode)

### Fix (시정)
1. **Customizing 변경** (Transport request 필요):
   - SPRO에서 설정 변경
   - Transport object 할당
   - Test system 적용 → UAT → Production

2. **Master data 수정**:
   - MM02 (Material), QI01 (Info Record), QP01 (Inspection Plan)
   - 변경 기록 (SNOW ticket 또는 Change management)

3. **ABAP 개발** (필요 시):
   - Z-report, BADi implementation, Enhancement
   - Code review, Unit test, Integration test

### Prevention (재발 방지)

1. **Documentation**:
   - Configuration guide 작성 (SNOW wiki)
   - Process diagram (Inspection lot flow)
   - Master data 준비 checklist

2. **Training**:
   - 관련자 교육 (Inspection planning, Results recording, UD judgment)
   - Job aid, Screen 캡처

3. **Monitoring & Alert**:
   - BW query 또는 Fiori tile에서 자동 추적
   - Daily batch job 결과 모니터링
   - Anomaly alert (예: 일일 불합격률 > threshold)

### SAP Note Reference

**SAP Support Portal** (search by keyword):
- 예) "Inspection lot creation fails type 01"
  → Note 2345678 (applicable SAP version check)
- Apply via SNOTE T-code (transport 자동 생성)

---

## 12. References & Deep Dive

### Official Documentation
- **SAP Help Portal**: `help.sap.com/docs` → QM module
- **Quality Management Configuration (ECC)**: SAP 공식 PDF 가이드
- **SAP S/4HANA Quality Management**: Best Practices doc (SAP Download Center)

### Key Database Tables

**Inspection Lot & Results**:
- `QALS`: Inspection Lot Header (LOSNR 로트번호, MATNR 자재)
- `QALSD`: Lot Defects
- `QASE`: Sample Header
- `QASR`: Inspection Result (QMNUM 검사번호)
- `QASV`: Sample value (characteristic 별 수치)
- `QAVE`: Usage Decision (최종 판정 A/R/B/S)

**Planning & Master**:
- `PLKO`: Inspection Plan Header
- `PLPO`: Plan Operations
- `QPMK`: Master Inspection Characteristics
- `QPSP`: MIC Specification (LSL/USL)
- `QDV1`: Sampling procedures
- `EINA/EINE`: Purchasing Info Record (QI01)

**Notification & Tracking**:
- `QMEL`: Quality Notification header (통보)
- `QMFE`: Defect/Cause definition
- `QMMA`: Activity/Task (시정 조치)
- `EIVR`: Vendor Evaluation record

**Certificate**:
- `ZQCMO`: Certificate master (custom)
- `ZQCDR`: Certificate data records

### Transaction Quick Reference

| T-code | Purpose | 입력 | 산출 |
|--------|---------|------|------|
| **QP01** | Create Inspection Plan | Material, Plant, Type | PLKO (Plan) |
| **QA01** | Create Inspection Lot | Material, Qty, Supplier | QALS (Lot) |
| **QE01** | Record Results | QALS, Characteristic, Value | QASR, QASV |
| **QE51N** | Mobile results (Fiori) | Barcode/Material | QASR |
| **QA11** | Create Usage Decision | QALS, Judgment (A/R/B/S) | QAVE (UD) |
| **QA32** | Automatic UD Processing | Batch mode | Auto UD records |
| **QM01** | Create QM Notification | Defect, Cause, Supplier | QMEL (Notif) |
| **QC01** | Define Certificate Profile | Form, Material | Certificate template |
| **QC21** | Generate Certificate (CoA) | QALS or Delivery | PDF/Archive |
| **ME61** | Vendor Evaluation | Supplier, Date range | Quality score trend |
| **QI01** | Quality Info Record | Supplier, Material | EINE (QI record) |
| **QDV1** | Sampling Procedure | AQL, Lot size | Sample size table |

### Further Learning Resources
- **SAP QM Workshop**: IQMS-SAP 통합 심화 코스
- **IATF 16949 Alignment**: 자동차 공급망 특화 교육
- **Fiori QM Apps Training**: QE51N 모바일 검사 hands-on
- **GMP Compliance in SAP**: 제약 산업 GMP 맞춤 교육

---

## 12.1 Common Pitfalls & Solutions

### ❌ 검사로트 자동 생성 안 됨

**확인 순서**:
1. Material Master (MM02) → IQMC (QM Control Level) 필드 확인 (빈 값이면 검사 미트리거)
2. Quality Info Record (QI03) → QZGTP (QM control type) 확인
3. Background job QA25 실행 여부 (SM37 check, daily/hourly?)
4. Note: GR 직후 약간의 지연 후 QA25 실행 → QALS 생성 (동기X)

### ❌ 검사 완료 후에도 GR blocked

**원인 후보**:
- UD 미생성 → QA11에서 명시적 생성 필수
- UD code "R" (Reject) → Stock blocked
- UD code "B" (Conditional) → Quality hold 해제 필요

**해결**:
```
QA11 → Select QALS → Set UD code "A" (Accept)
    ↓
Save → MIGO GR posting 자동 완료
```

### ❌ Vendor 평가 점수 안 올라감

**확인**:
- ME61 거의 실시간 업데이트되지만 계산 기준 재확인
- EIVR (Evaluation record) 직접 조회: T-code SQVI → `SELECT * FROM EIVR`
- SPRO > MM > Purchasing > Vendor Evaluation 가중치 재확인

### ❌ 인증서(CoA) 생성 안 됨

**원인**:
- QC01 profile 미설정
- Material-Certificate 링크 미생성
- SMARTFORM 또는 Adobe Form 프로그래밍 에러

**해결**:
```
QC21 → Manual run → Check SM37 job log
    ↓
If error: SM39 (Form Routines debug) 또는 Adobe Form 재컴파일
    ↓
If success: Check DMS/Archive 저장 경로
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-04-12  
**Compatibility**: SAP ECC 6.0 SP최신 | S/4HANA 1909+ | S/4HANA Cloud  
**Target Audience**: SAP QM Functional Consultants, Quality Managers, Production Planners, Auditors  
**Language**: English + 한국어 (Industry context)
