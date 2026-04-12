---
name: sap-pm
description: >
  This skill handles SAP PM (Plant Maintenance / 설비보전) including Equipment Master
  (IE01/IE02/IE03), Functional Location (IL01/IL02/IL03), Maintenance Notifications
  (IW21/IW22/IW23), Maintenance Orders (IW31/IW32/IW33), Preventive Maintenance (IP01/IP10/IP30),
  Task Lists (IA01/IA05), Maintenance Planning, and Plant Maintenance Reporting (IW28/IW29/IW38/IW39).
  Use when user mentions PM, 설비보전, 설비관리, equipment, 설비, maintenance order, 보전오더,
  고장, breakdown, 고장코드, preventive maintenance, 예방보전, functional location, 기능위치,
  MTBF, MTTR, 점검, 정비, serial number, 시리얼, refurbishment, 재생정비, maintenance planning,
  maintenance strategy, 정비전략, equipment history, 설비이력, preventive tasks, 예방점검.
allowed-tools: Read, Grep
---

## 1. Environment Intake Checklist

Before answering PM questions, collect:
- **SAP Release**: ECC 6.0 (which EhP?) or S/4HANA (which release year?)
- **Deployment model**: On-premise / RISE / Cloud Public Edition
- **PM Organization**: Planning Plant, Maintenance Plant, Maintenance Coordination Plant
- **Industry sector**: Manufacturing (automotive, chemicals, electronics), energy, pharma, food & beverage
- **Equipment strategy**: Single-level (equipment only) vs. two-level (equipment + functional locations)
- **Maintenance type focus**: Breakdown, preventive, predictive, contract, or combination?
- **Integration requirements**: MES, predictive maintenance (PAI), mobile (SAP Asset Manager), analytics

---

## 2. Equipment Master Data (IE01/IE02/IE03)

### Equipment Creation (IE01)

**Key T-codes & Menu Path**
- IE01: Create Equipment (SPRO → Plant Maintenance → Master Data → Equipment → Create)
- IE02: Change Equipment
- IE03: Display Equipment
- IE10: Create Fleet (for mass equipment with identical configuration)

### Critical Fields (EQUI Table)

| Field | Meaning | Mandatory | Notes |
|-------|---------|-----------|-------|
| EQUNR | Equipment number | Y | Unique 18-char ID; can be internal/external assigned |
| EQKTX | Equipment description | Y | 40 chars; recommend English + Korean |
| EQART | Equipment category | Y | PUMPE (pump), MOTOR (motor), KOMPR (compressor) etc. |
| MATNR | Material master | N | Links to inventory; if serial-tracked material, serializes equipment |
| SERGE | Serial number | N | Hardware serial from nameplate; used in warranty tracking |
| HEQUI | Higher-level equipment | N | Parent equipment (e.g. pump is part of production line) |
| ILOAN | Functional location | Y | Must exist in IFLO before assignment |
| MANDT | Company code | Y | Set at creation; cannot change |
| WERKS | Plant | Y | Maintenance-executing plant |
| KMFID | Manufacturer | N | Free-text; recommend SAP vendor master LIFNR |
| GEWICHT | Weight | N | For spare parts estimation |
| INBDT | Startup date | N | Important for MTBF calculation period |

### Equipment Classification

Table KLAH (classification header) + KLASP (assignment):
- Class type: EQUIPMENT, ZEQUIP (custom)
- Characteristics: Model, Manufacturer, Voltage, Capacity, Brand
- Used for: spare parts list filtering, maintenance strategy assignment, reporting

### Serial Number Management

- Equipment must link to material master (EQUI.MATNR)
- Material → Accounting 1 view → Valuation Class + Serial Number Profile (MMSL)
- Serial Number Profile (MMSL): defines when system forces serial entry during GR, GI, MIGO
- Equipment History (EQUZ): automatic log of changes (creation, equipment change, tag changes)

### Equipment Deletion

- Equipment cannot be deleted if it has maintenance history (QMEL, AUFK exist)
- Workaround: Flag EQUI-LOEKZ (deletion flag) = X → equipment hidden in selection, kept for history

---

## 3. Functional Location Master Data (IL01/IL02/IL03)

**Hierarchical structure** — represents plant's physical/logical organization

### Functional Location Creation (IL01)

**Key T-codes**
- IL01: Create Functional Location (SPRO → Plant Maintenance → Master Data → Technical Objects → Functional Location)
- IL02: Change Functional Location
- IL03: Display Functional Location

### Hierarchy Example (Two-Level Strategy)

```
Production Line A (ZFUNCLOC-PRODLINE-A)
├─ Section 1 (ZFUNCLOC-PRODLINE-A-SEC1)
│  ├─ Equipment: Motor, Pump, Control Panel
└─ Section 2 (ZFUNCLOC-PRODLINE-A-SEC2)
   ├─ Equipment: Conveyor, Sensor
```

### Critical Fields (IFLO + IFLOT Tables)

| Field | Table | Meaning | Notes |
|-------|-------|---------|-------|
| TPLNR | IFLO | Functional location ID | 40-char hierarchical, e.g., PROD-001-002 |
| TXTMI | IFLOT | Description (multilingual) | Store in DE, EN, KO |
| FLTYP | IFLO | Functional location type | e.g., PUMPING_STATION, MOTOR_ROOM |
| GEWRK | IFLO | Responsible work center (PM team) | Links to CR01 work center |
| HFLOC | IFLO | Higher-level functional location | Parent node |
| STRNO | IFLO | Building/hall number | Organizational reference |
| MANDT | IFLO | Company code | Assigned at creation |

### Account Assignment

- Cost center (KOSTL): for cost tracking of maintenance labor + materials
- Internal order (AUFNR): for project-based maintenance (e.g., annual overhaul)
- Profit center: for P&L attribution
- WBS element: for capital project maintenance

---

## 4. Maintenance Notification (IW21/IW22/IW23)

**Entry point for all maintenance requests** — whether breakdown or planned

### Notification Types (QMNUM Table)

| Notification Type | ID | Trigger | Example Use Case |
|-------------------|----|---------|----|
| Malfunction (고장) | M1 | Breakdown reported by operator | "Motor stopped working" |
| Maintenance request | M2 | Preventive or user-initiated task | "Annual pump inspection needed" |
| Activity report (업무보고) | M3 | Post-maintenance completion record | "Replaced bearings on motor" |
| Calibration notification | M4 | Instrument calibration schedule | "Pressure gauge needs recalibration" |

### Key T-codes

| T-code | Description |
|--------|-------------|
| IW21 | Create notification |
| IW22 | Change notification |
| IW23 | Display notification |
| IW24 | List of notifications (selection) |
| IW28 | Notification listing (reporting) |
| IW29 | Notification analysis (OLAP) |

### Critical Fields (QMEL + QMIH Tables)

| Field | Table | Meaning | Max Length |
|-------|-------|---------|-----------|
| QMNUM | QMEL | Notification number | 12 digits (internal/external assigned) |
| QMTXT | QMEL | Short description | 40 chars |
| LTXT | QMEL | Long text | 2500 chars (ALV memo) |
| EQUNR | QMEL | Equipment or... | 18 chars |
| TPLNR | QMEL | Functional location | 40 chars (either EQUNR or TPLNR required) |
| SCHAD | QMEL | Damage/fault code | 4 chars; must exist in custom table (e.g., ZMAINTCODES) |
| URSACHE | QMIH | Root cause code | 4 chars; ABAP table maintained via SPRO |
| AKTIVITAET | QMIH | Activity code (work type) | 4 chars; e.g., REPAIR, INSPECT, REPLACE |
| ANLDAT | QMEL | Notification creation date | Auto-filled |
| MERDAT | QMEL | Reported date/time | User-entered (when problem was discovered) |
| PRIO | QMEL | Priority (1=urgent, 4=low) | Links to SLA |
| ARBPL | QMEL | Assigned work center | CR01 resource pool |
| AUART | QMIH | Associated order type | e.g., PM01, PM02 (links to maintenance order) |

### Damage Code & Root Cause Workflow

**Damage codes (Schädigungen)** → categorize **what broke**
- Table maintained in: SPRO → Plant Maintenance → Notification → Configure Notification Type → Damage Codes
- Example: BEARING (Lagerschaden), SEAL (Dichtungsschaden), MOTOR_COIL (Motorwicklung)

**Root cause codes** → categorize **why it broke**
- Maintained in: SPRO → Plant Maintenance → Notification → Configure Notification Type → Cause Codes
- Example: OVERLOAD (Überbelastung), POOR_MAINTENANCE (Schlechte Instandhaltung), DESIGN_DEFECT

**Activity codes** → actions taken
- INSPECTION, REPAIR, REPLACEMENT, ADJUSTMENT, CALIBRATION

### Notification Workflow

```
IW21 (Create) → IW22 (Edit, assign to equipment/FL) 
→ Create Maintenance Order (IW31) or Assign Existing (IW81)
→ Complete Notification (IW21 → Status = COMPLETED)
→ Archive / History Report (IW28, IW29)
```

---

## 5. Maintenance Order (IW31/IW32/IW33)

**Execution unit** — operationalizes a notification into scheduled work with costing

### Order Types & Lifecycle

| Order Type | Purpose | Settlement | Workflow |
|-----------|---------|-----------|----------|
| PM01 | Preventive maintenance | Cost center or internal order | Recurring |
| PM02 | Breakdown maintenance | Cost center or internal order | Ad-hoc |
| PM03 | Corrective action / temporary fix | Internal order | One-time |
| PM10 | Maintenance by vendor/contract | Purchase order line | Outsourced |
| ER01 | Emergency order (fast-track) | Cost center | Expedited release |

### Lifecycle (Status Flow)

```
CRTD (Created) → PLAN (Planning) → RELD (Released) 
→ TECO (Technically Complete) → CLSD (Closed)
```

**Key transitions:**
- CRTD → RELD: IW32 (Change) → Release button (Authorization: PM.ORD.R)
- RELD → TECO: CO11N (confirmation) or manual in IW32
- TECO → CLSD: Settlement (KO88) → automatic CLSD after successful posting

### Key T-codes

| T-code | Description |
|--------|-------------|
| IW31 | Create maintenance order |
| IW32 | Change maintenance order |
| IW33 | Display maintenance order |
| IW38 | Maintenance order list (with statuses) |
| IW39 | Maintenance order analysis (OLAP) |
| COOIS | Production order info system (includes maintenance orders) |

### Critical Fields (AUFK + AFKO + AFIH Tables)

| Field | Table | Meaning | Key Link |
|-------|-------|---------|----------|
| AUFNR | AUFK | Maintenance order number | 12 digits |
| AUART | AUFK | Order type (PM01, PM02...) | Defines cost collection rules |
| EQUNR | AUFK | Equipment | Equipment master (EQUI) |
| TPLNR | AUFK | Functional location | FL master (IFLO) |
| QMNUM | AUFK | Notification reference | Notification (QMEL) |
| KOSTL | AUFK | Cost center (account assignment) | GL posting account |
| INAUFNR | AUFK | Internal order (account assignment) | Alternative to cost center |
| ERDAT | AUFK | Creation date | Audit trail |
| GSTDT | AUFK | Scheduled start date | Capacity planning |
| GETDT | AUFK | Scheduled end date | Capacity planning |
| FZDAT | AUFK | Actual start date | Filled by TECO or confirm |
| FZEND | AUFK | Actual end date | Filled by TECO or confirm |
| GGRTXT | AUFK | Order description | 40 chars |
| MGVST | AUFK | Total planned labor hours | Sum of operations (AFIH.LAH) |
| STATUS | JEST | Order status (via object key AUFK + status cat P) | Links to JEST table (status management) |

### Operations & Component Planning

**Operations (AFIH table)** — individual tasks within maintenance order

| Field | Meaning | Type |
|-------|---------|------|
| LTEXT | Operation description | Text, e.g., "Replace pump seal" |
| LAH | Standard labor hours | Decimal, e.g., 4.5 |
| MGH | Standard machine hours | Used for resource capacity planning |
| ARBPL | Work center | CR01 resource (e.g., MAINT_TEAM_A) |
| LTXA | Operation long text | Detail work instructions |

**Components (BOM link)** — spare parts required

- AFIH → STPO (BOM item) → material + quantity
- Component status: Available / Withdrawn / On PO / Missing (CO24)
- Backflush: if enabled, components auto-issue at confirmation (MIGO 261 automatic)

### Maintenance Labor & Costs

**Labor hours collection (CO11N confirmation)**
- Actual labor time entered at operation level
- Overtime multipliers applied (customizable per order type)

**Spare parts cost (MIGO)**
- GI from warehouse → MIGO 261 → charged to maintenance order
- Vendor-supplied parts → PO line → GR → invoice → cost posting

**Overhead allocation (KO88)**
- Settlement rule: Actual cost + overhead (%) → Cost center or internal order
- Example: Order cost = 5,000 EUR → + 20% overhead = 6,000 EUR → posted to cost center

### External Services (Subcontracting)

- Maintenance order header → Services tab → Create purchase requisition (BANF)
- Service material type: automatically creates PR → RFQ → PO → GR → IV (MIRO)
- Typical service materials: OUTSOURCE_REPAIR, INSPECTION_LABOR

---

## 6. Preventive Maintenance (IP01/IP10/IP30)

**Automated scheduling of recurring maintenance tasks**

### Maintenance Plans (IP01/IP02)

| T-code | Description |
|--------|-------------|
| IP01 | Create maintenance plan |
| IP02 | Change maintenance plan |
| IP03 | Display maintenance plan |
| IP10 | Call object scheduling (run planner) |
| IP30 | Deadline monitoring |

### Plan Types

| Plan Type | Trigger Condition | Interval |
|-----------|-------------------|----------|
| Time-based (Z1) | Calendar days | e.g., every 30 days, every 1 January |
| Counter-based (Z2) | Equipment counter (QMSREC) | e.g., every 10,000 operating hours |
| Multiple-counter (Z3) | Multiple counters (e.g., hours + days) | Whichever comes first |
| Performance-based (Z4) | Equipment performance KPI | e.g., when efficiency drops below 95% |

### Maintenance Strategy (IP11)

**Strategy = grouping of maintenance tasks** → optimize scheduling

Example: **Monthly production line maintenance (STRAT_PRODLINE_M)**
- Task 1: Bearing lubrication (5 hours, cost center MAINT_OIL)
- Task 2: Filter replacement (3 hours, material M-FILTER-001, cost center MAINT_PARTS)
- Task 3: Inspection (4 hours, cost center MAINT_LABOR)
- Total plan: 12 labor hours, materials + labor cost per execution

### Scheduling Strategy (IP11 → PLTYP / IPRFL Table)

| Field | Meaning | Example |
|-------|---------|---------|
| BESCHREIBUNG | Strategy name | "MOTOR_BEARING_MAINTENANCE" |
| MPLNR | Maintenance plan number | "MPLAN-MOTOR-001" |
| IPRFL | Task list (group of tasks) | "TASKLIST-BEARING-005" |
| ISCHA | Scheduling parameter | e.g., "EVERY_30_DAYS" |
| LETWZ | Calendar rule | "MON" (Monday), "D" (daily) |
| MAINT_TYPE | Maintenance type | "PREVENTIVE", "PREDICTIVE" |

### Task Lists for Maintenance (IA01/IA05)

**Reusable checklists & instructions**

| T-code | Description |
|--------|-------------|
| IA01 | Create task list (general) |
| IA05 | Create task list (maintenance) |
| IA06 | Maintain task list status |

**Task list structure (PLKO + PLPO)**
- Header: task list ID, description, equipment/FL applicable
- Operations: step 10, 20, 30... each with work center + time + materials

**Example: Pump Inspection Task List (TASKLIST-PUMP-INSPECT)**
```
Step 10: Visual inspection (0.5 hrs, work center: MAINT_VISUAL)
Step 20: Vibration check (1.0 hr, equipment: VIBRATION_METER)
Step 30: Temperature measurement (0.5 hrs, sensor: TEMP_PROBE_001)
Step 40: Oil sampling (0.25 hrs, material: OIL_SAMPLE_BOTTLE)
Step 50: Report findings (0.5 hrs, work center: MAINT_ADMIN)
Total: 2.75 hours
```

---

## 7. Maintenance Scheduling (IP10 / IP30)

### IP10 — Call Object Scheduling

**Generates notifications/orders** based on maintenance plans

- Input: maintenance plans (IP01) + current equipment state
- Output: QMEL (notifications) or AUFK (orders) for upcoming maintenance
- Run frequency: typically nightly batch (transaction SM36)

### IP30 — Deadline Monitoring

**Tracks which equipment is overdue for maintenance**

| Status | Meaning |
|--------|---------|
| Green | On schedule |
| Yellow | Within lead time (e.g., due within 5 days) |
| Red | Overdue |

**Usage:**
- Filter by: planning plant, work center, priority
- Action: create maintenance orders (IW31) for overdue items

### Counter Readings (QMSREC Table)

**Equipment counters** — track usage-based maintenance triggers

| Counter Type | Example | Unit |
|--------------|---------|------|
| Operating hours | Production line hours | Hours |
| Cycles | Number of production runs | Cycles |
| Distance | Vehicle mileage (for mobile equipment) | km |
| Quantity | Material processed (e.g., tons in cement plant) | Units |

**Recording counter reads:**
- QM04: Single equipment counter read
- QM05: Multiple counters (batch entry)
- Readings feed into IP10 scheduling → if counter >= threshold, create notification

---

## 8. Breakdown Maintenance & MTBF/MTTR

### Breakdown Notification Entry (IW21)

**Operator or manager reports failure:**

1. IW21 → Equipment/FL + Damage code + Priority
2. System creates notification (e.g., NOTIF-2024-001234)
3. Assign to maintenance team (ARBPL — work center)
4. Create order (IW31 with order type PM02)
5. Release order (RELD status) → work begins
6. Confirm completion (CO11N) → TECO
7. Settle order (KO88) → cost posted

### Malfunction Start/End Time (QMEL / QMIH)

| Field | Table | Meaning | Impact on KPI |
|-------|-------|---------|---|
| MERDAT | QMEL | Time failure reported | Start of downtime clock |
| BEGDA | QMIH | Planned start of repair | Used in SLA tracking |
| FZDAT | AUFK | Actual repair start | Marks crew dispatch time |
| FZEND | AUFK | Actual repair end | End of downtime |

**Downtime calculation:**
- Total Downtime = FZEND - MERDAT
- Repair Time (MTTR) = FZEND - FZDAT
- Waiting Time = FZDAT - MERDAT (can indicate logistics delay)

### MTBF (Mean Time Between Failures) Calculation

**Formula:** Total Equipment Uptime / Number of Failures

**Uptime period:** INBDT (startup date) to current date or end date

**Failure count:** Sum of notifications with SCHAD = malfunction codes

**SAP tracking:**
- EQUI-INBDT: equipment startup date
- QMEL count by equipment (table function: SELECT COUNT(*) FROM QMEL WHERE EQUNR = 'PUMP-001')
- MTBF = (days_operating) / (failure_count)

Example:
- Equipment MOTOR-001 startup: 2022-01-01
- As of 2024-04-12: 861 days operating
- Malfunction notifications: 12 failures
- MTBF = 861 days / 12 = 71.75 days average between failures

### MTTR (Mean Time To Repair) Calculation

**Formula:** Total Repair Time / Number of Repairs

**Repair time sourced:**
- AUFK.FZEND - AUFK.FZDAT (actual hours spent on repair)
- Includes: labor hours (CO11N) + external service time (if PO-based)

**SAP tracking:**
- Table AUFK: all PM02 (breakdown) orders
- Filter: EQUNR = equipment + ORDER_TYPE = PM02
- Calculate: SUM(FZEND - FZDAT) / COUNT(*) = MTTR

Example:
- Motor MOTOR-001: 8 breakdowns over 12 months
- Total actual repair hours logged: 44 hours
- MTTR = 44 / 8 = 5.5 hours per breakdown

### KPI Reporting (IW28/IW29)

**IW28 — Notification Listing**
- Standard SAP query: All notifications with filters (date range, equipment, status)
- Output: Excel-friendly listing with damage code, priority, creation date, completion date

**IW29 — Notification Analysis (OLAP)**
- Multidimensional analysis: Equipment × Damage Code × Month
- Drilldown: which equipment/codes are failure-prone
- Used to drive preventive maintenance plan decisions

---

## 9. Refurbishment & Serial Number Management

### Equipment Refurbishment (Instandsetzung)

**Complete overhaul of equipment** — treated as major maintenance project

**Order type:** PM03 or special project order

**Process:**
1. Create maintenance order (IW31, order type PM03)
2. Assign refurbishment checklist (task list IA05)
3. GI all old/faulty parts (MIGO 261)
4. GR refurbished components (MIGO 101)
5. Update equipment master with new serial numbers if components replaced (IE02)
6. Confirmation (CO11N) → record actual hours + components replaced
7. Settlement (KO88) → post refurb cost to internal order or asset

### Serial Number Management (SERGE / EQUI-SERGE)

**Link between equipment and material master (MATNR)**

#### Setup in Material Master (MM01)

- Org level: Plant
- Accounting view: Valuation class + Serial Number Profile (MMSL field)
- Serial Number Profile (MMSL):
  - Determines if serial numbers are **required** (batch posting) or **optional** (normal)
  - e.g., MMSL = "001" → Serial number required for all GR/GI of this material

#### Recording Serial Number in Equipment (IE01/IE02)

**Field:** EQUI-SERGE (equipment serial number)
- Max 30 chars
- Validated against material's serial number profile
- Used in: warranty tracking, spare parts traceability, recall management

#### Serial Number Change History (EQUZ)

**Automatic log in EQUZ table**
- Timestamp, user ID, old serial → new serial
- Useful for: component replacement audits, warranty period recalculation

Example: **Motor Refurbishment Event**
- Equipment MOTOR-001, Original Serial: "MOT-12345-ABC"
- Refurb replaces motor, New Serial: "MOT-67890-XYZ"
- EQUZ records: Date, User, Field=SERGE, Old=MOT-12345-ABC, New=MOT-67890-XYZ
- Warranty restart: if refurb qualifies, set INBDT to refurb completion date

---

## 10. PM-CO Integration & Cost Collection

### Settlement (KO88)

**Posts maintenance costs from AUFK to receiver** (cost center or internal order)

**Key T-codes:**
- KO88: Settle individual order
- KO8G: Settle multiple orders (batch)
- KO8K: Maintain settlement rule (assignment of order type → receiver type)

### Settlement Rule Setup (SPRO → Controlling → Orders → Settled Costs)

| Rule ID | From (Order Type) | To (Receiver) | Cost Element |
|---------|---|---|---|
| RULE-PM01 | PM01 (preventive) | Cost center + 400100 (PM labor) | 400100 |
| RULE-PM02 | PM02 (breakdown) | Cost center + 400200 (Repair) | 400200 |
| RULE-PM03 | PM03 (refurb) | Internal order + project code | 400300 |

### Variance Calculation (KO88 — Simulate before Actual)

**Variance categories:**
1. **Input price variance** (ABV): Material cost differences (actual price ≠ standard price)
2. **Input quantity variance** (AMV): More/fewer materials used
3. **Overhead variance** (SCRAP): Overhead surcharge % deviation
4. **Remaining input** (RESTINPUT): Unconfirmed costs still open

**Best practice:**
- Always run KO88 with "Simulate" first (F8 or simulation button)
- Review variance report → approve variances if acceptable
- Run actual settlement separately → creates FI documents (Controlling: 1200 Maintenance Costs)

### Cost Planning (KALKULATIONSSCHEMA)

**Annual maintenance budget planning** — by equipment category, order type, cost center

Example budget structure:
- Category: Motors → Preventive (PM01) budget = 50,000 EUR
- Category: Motors → Breakdown (PM02) budget = 30,000 EUR (contingency)
- Total annual motor maintenance budget = 80,000 EUR

**Tracking:**
- AUFK-KOSTL → cost center commitment
- Monthly report (S_ALR_87013612 — Cost Center Actual vs. Budget) → compares maintenance spend vs. plan

---

## 11. ECC vs S/4HANA — PM Specific Differences

| Feature | ECC 6.0 | S/4HANA |
|---------|---------|---------|
| **Notification tables** | QMEL, QMIH, QMSM (separate) | Simplified data model; same QMEL but CDS views (I_MaintenanceNotification) |
| **Equipment table** | EQUI, EQUZ, EQAO (sparse) | EQUI same, but ZN prefix views for S/4 (C_EquipmentActive) |
| **Maintenance order status** | JEST (complex, multi-object) | JEST same but MBC (Maintenance Business Config) replaces IMG |
| **Fiori apps** | Limited (IW21, IW31 desktop) | **My Maintenance Notifications** (fiori), **My Work Orders** (fiori), **Equipment Health Dashboard** (Analytics) |
| **Mobile maintenance** | Mobile client (add-on) | **SAP Asset Manager** (native iOS/Android) — real-time counter reads, photo capture |
| **Preventive maintenance** | IP10 (batch scheduler) | IP10N (HANA-optimized) + **Predictive Maintenance (SAP Data Intelligence, PAI)** integration |
| **Reporting** | IW28, IW29 (ALV) | IW28/IW29 same, BUT **Analytics Cloud (SAC)** dashboards + Predictive MTBF modeling |
| **GR/IR for spare parts** | Standard MIGO 101/261 | Same, but embedded eWM (optional storage location barcode scanning) |
| **External services** | PO-based services in order | Same, but integrated procurement (SAP Fieldglass if on Cloud) |
| **Serial number** | Manual IE02 or GR barcode scan | Automatic scanner integration (IoT) in Asset Manager |
| **Integration to PM** | MES external interface (IDOC, RFC) | Native REST API for counter pushes from MES / Predictive Maintenance Engine |
| **User authorization** | PFCG (single-user role) | SAP_BR_PLANT_MAINTENANCE role (Fiori-based) — simplified role model |
| **Equipment history** | EQUZ log only | Equipment history + **Process intelligence** (audit trail of all changes) |

---

## 12. 한국 현장 특이점 (Korean Manufacturing Context)

### 삼성/LG/현대 공장의 SAP PM 운영 특징

**설비 가동률 (Equipment Availability) 관리**
- 한국 제조 표준: 최소 95% 가용율 목표 (글로벌 85% vs)
- 목표 달성: 예방보전 비율 70%, 고장정비 비율 30% 이상
- SAP tracking: IW29 → "설비가동 중단 시간 분석" 월간 report (OEE 연계)

**3교대 근무 환경에서의 설비 관리**
- Maintenance team: 24시간 교대근무 (Day / Evening / Night shifts)
- Notification 입력: 실시간 (각 라인의 작업자 → QMS 담당자 → PM팀에 자동 통보)
- 야간 고장 처리: 긴급 외주(Emergency Vendor) 연동 (AUFK.AUART = ER01)
- 근무 시간 외 작업 (야간할증 30%): CO11N 확인 시 "야간작업" 활동코드로 구분

**안전관리와 PM 법적 연계 (산업안전보건법 제23조)**
- 설비점검 이력: **무조건 5년 보관** (SAP Archive에 IW28 스냅샷)
- 부정기 점검 기록: QMEL-AUFK 링크 완전성 검증 필수 (감시원 감사 대비)
- 위험설비 (크레인, 보일러, 압력용기): 고용노동부 특별감시 → PM과 QM 완전 통합
  - 고장코드 SCHAD = "PRESSURE_RELIEF_FAIL" 발생 시 자동으로 QM 검사 오더(QM10) 생성
  - AUFK → QAIN (inspection) → 외부검사기관 위탁 처리

**MES ↔ SAP PM 실시간 연동**
- MES (현대 DAPS, LG MES) → 설비 상태 센서 데이터 → 5분 간격 HTTP/SOAP 호출
- SAP BAPI: `BAPI_EQUI_SET_COUNTER` → Equipment counter 자동 갱신
- Trigger: Counter >= Preventive Maintenance Threshold → IP10 자동 IP30 Yellow 상태 전환
- Example: Motor operating hours 10,000 threshold → MES 전송 → SAP 자동 "점검 예정" notification

**외주 보전 관리 (Contract Maintenance with Vendors)**
- 전문 정비업체 위탁: AUFK.AUART = PM10 + Purchase Order (ME21N) 연동
- 위탁사 작업 추적: Vendor EQUI-MFBF (equipment responsibility matrix) → 정기 외주사별 KPI 평가
- 비용: PO line → GR (MIGO 101 services) → IV (MIRO) → Cost analysis (KO88 settle to cost center)

**설비별 소비자부품 (Consumable Parts) 자동 발주**
- 고빈도 부품: 오일, 필터, 그리스, 밀폐제 등
- PM 예방점검 task list → 필요 부품 자동 생성 (AUFK → PR → PO auto-release)
- Example: IP01 "Monthly bearing maintenance" → Task List에 "10kg Lubricant XYZ" 지정
- → IP10 실행 시 자동으로 PR 생성 → 구매 부서 자동 승인 (workflow) → PO release

**설비 성능 성과금(Incentive) 관리**
- KPI 연계: MTBF ≥ 90 days → PM팀 보너스 10%, MTTR ≤ 4 hours → +5%
- 월간: IW29 OLAP → Equipment별 MTBF/MTTR 계산 → 급여 시스템(HR) 연동 (BAPI_PAYROLL_PROCESS)

**설비 감가상각과의 연계 (Asset Management Integration)**
- Equipment EQUI-MATNR → Asset Master (AA) 자동 링크 (S/4: AA → FIAA table)
- Maintenance cost tracking: AUFK 누적비용 / Asset net book value > 60% → 기업회계 기준 "경영상 결정" 입력
- Example: Motor 구입가 100,000 EUR, 누적 maintenance cost 63,000 EUR → 신규 구입 검토 요청

---

## 13. Standard Response Format

Follow sapstack Universal Rules:

**Issue** → **Root Cause** → **Check (T-code + Table.Field)** → **Fix (Steps)** → **Prevention** → **SAP Note**

### Example: "Equipment shows MTBF 15 days — why so low?"

**Issue:** Motor MOTOR-001 has 8 failures in 4 months (MTBF = 15 days)

**Root Cause Hypotheses:**
1. Wrong damage/cause codes → notifications clustered by operator error
2. Operator misuse (overloading) → URSACHE = USER_ERROR
3. Design defect or component batch issue → QMSM-SERGE links to defective serial lot
4. Preventive maintenance never executed → check IP30 deadline monitoring

**Check:**
```
IE03 → MOTOR-001 → Equipment History tab (EQUZ)
IW24 → Filter EQUNR=MOTOR-001, date range 4 months
  → Count notifications (QMNUM)
  → Examine QMIH-URSACHE field (root cause codes)
IW28 → Report "Failure Frequency by Equipment & Cause"
  → Identify if URSACHE concentrated (indicates pattern)
IP30 → Search MOTOR-001
  → Check if any preventive tasks overdue (RED status)
```

**Fix (if preventive maintenance overdue):**
1. IP01 → Find assigned maintenance plan for MOTOR-001
2. IP10 → Force run "Deadline monitoring for plant ZPLANT"
3. Create overdue notifications for missed deadlines
4. Assign maintenance orders (IW31) + release (RELD)
5. Schedule work teams

**Fix (if root cause = design defect):**
1. Create RFC ticket with equipment vendor
2. Escalate to engineering (via AUFK internal order for redesign project)
3. Flag equipment in IE02 with equipment status "Restricted" (IFLOTA flag)
4. Increase spare parts stock (MM41) until replacement arrives

**Prevention:**
- Establish PM02 order type cost tracking → identify underbudgeted equipment
- Monthly review: IW29 MTBF by equipment class → correlate with age/design
- Upgrade task lists (IA05) → add inspection interval reduction for high-MTBF items
- Training: operator notification accuracy (damage codes) via HR learning module

**SAP Notes (if applicable):**
- Check SAP Support Portal (OSS) for "equipment MTBF analysis" + equipment model

---

## 14. References

- `references/ko/quick-guide.md` — Maintenance order creation workflow (fast path)
- `references/ko/SKILL-ko.md` — Korean field language guide for PM terms
- SAP Help: SAP PM module documentation (https://help.sap.com/docs/SAP_S4HANA_CLOUD/plant_maintenance)
- Configuration: SPRO → Plant Maintenance (all customization)
- Table documentation: EQUI, IFLO, QMEL, AUFK, IP01 (F1 in SAP GUI)
