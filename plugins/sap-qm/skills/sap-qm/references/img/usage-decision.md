# 사용결정(Usage Decision) IMG 구성 가이드

## SPRO 경로
```
SPRO → Quality Management → Quality Control
├── Usage Decision (사용결정)
│   ├── Define Usage Decision Codes (QA34)
│   ├── Follow-up Actions (후속 조치)
│   └── Automatic UD Rules (자동 UD 규칙)
└── Stock Posting Rules
    ├── Accept → Unrestricted Stock
    ├── Reject → Return / Scrap / Rework
    └── Conditional → Restricted / Inspection Pending
```

## 필수 선행 구성
- [ ] Inspection Types 정의 완료 (01, 03, 04)
- [ ] Inspection Plans 생성 완료 (QP01, QP02)
- [ ] Stock Posting Rules 설정 완료
- [ ] Cost Centers 정의 (반품/폐기 비용 계정)

## 구성 단계

### 1단계: 사용결정 코드 정의 (QA34)

**T-code: QA34** (Create Usage Decision) 또는 **SPRO > QM > Usage Decision**

사용결정은 검사 결과에 따른 최종 판정입니다.

#### 표준 사용결정 코드

| 코드 | 결정 | 설명 | 재고 이동 | 비용 영향 |
|------|------|------|---------|---------|
| A | ACCEPTED (합격) | 검사 합격, 사용 가능 | Unrestricted | 원가 인식 |
| R | REJECTED (불합격) | 검사 불합격 | Scrap/Return | 폐기비용 or 반품 |
| C | CONDITIONAL (조건부) | 일부 선별/재검사 필요 | Restricted | 선별비용 |

#### ACCEPTED (A) — 합격

```
Usage Decision: ACCEPTED

Trigger Conditions:
├── Inspection Results: All characteristics ✅
├── Defects: 0 (또는 AQL 허용 범위 내)
└── Sampled Qty: 모두 합격 또는 Sample ✅

Post Acceptance Actions:
├── Stock Movement:
│   ├── Source: Q-Stock (검사 스톡)
│   └── Target: Unrestricted Stock (자유재고) 또는 Unrestricted-Use
├── Financial Impact:
│   ├── Goods Receipt (GR) 완성
│   ├── Material Cost 확정
│   └── Supplier Quality Rating: +1 point per 100 pcs
├── Production Impact (공정검사):
│   ├── Release Production for Next Operation
│   └── Update BOM Compliance
└── Document: Acceptance Certificate (자동 생성 가능)
```

**설정** (QA34 화면):
```
Inspection Lot: 202401-001
├── Inspection Type: 01 (Incoming)
├── Lot Qty: 500 pcs
├── Sample Qty: 50 pcs
├── Inspection Result: All ✅
└─→ Usage Decision = A (ACCEPTED)

Result Actions:
├── Post Q-Stock to Unrestricted
├── Print Acceptance Certificate
├── Update Vendor Rating (+1)
└─→ Complete
```

#### REJECTED (R) — 불합격

```
Usage Decision: REJECTED

Trigger Conditions:
├── Inspection Results: Defects found
├── Defect Qty: ≥ Acceptance limit
└── Example: AQL 1.0 → Accept ≤ 0 defects → 1 defect = REJECT

Sub-decision: Rejection Reason (필수 선택)
├── R1 — Return to Vendor (반품)
│   └─→ 공급업체에 반품, 대금 회수
├── R2 — Scrap (폐기)
│   └─→ 폐기 처리, 손실 인식
├── R3 — Rework Possible (재작업 가능)
│   └─→ 내부 선별/수리 → 재검사
└── R4 — Use as-is (감가 사용)
    └─→ 완전히 불합격이나 비용상 사용 (드물음)

Post Rejection Actions:
├── Stock Movement:
│   ├── Source: Q-Stock
│   └── Target: Returns / Scrap / Rejected Stock
├── Purchase Management:
│   ├── Create Return / Claim (환수 프로세스)
│   ├── Contact Vendor
│   └── Issue Credit Memo
├── Financial Impact:
│   ├── Debit: Defective Material Cost
│   ├── Credit: Return/Scrap Loss Account
│   └── Supplier Rating: -2 points per 100 pcs
├── Quality Notification (자동 생성):
│   ├── Q2 (Internal Defect) → RCA 진행
│   └── Q3 (Supplier Issue) → Vendor 통보
└── Follow-up Document:
    ├── Rejection Report (자동 생성)
    └── Supplier Corrective Action Request (SCAR)
```

**설정 예시** (불합격 부품 반품):
```
Inspection Lot: 202401-002
├── Inspection Type: 01
├── Lot Qty: 500 pcs
├── Defects Found: 3 pcs (불합격)
├── AQL: 1.0 → Accept ≤ 0 → REJECT
└─→ Usage Decision = R1 (RETURN TO VENDOR)

Rejection Actions:
├── Create Purchase Return Order
│   ├── Material: BEARING-NSK
│   ├── Qty: 500 pcs (전체 로트 반품)
│   └── Reason: Quality Defect
├── Send Email to Supplier: NSK
│   ├── Attachment: Rejection Report
│   └── Request: Credit Memo
├── Vendor Rating: -2 (Quality Score 감소)
└─→ FI Credit Memo 자동 생성 (Accounts Receivable)
```

#### CONDITIONAL (C) — 조건부

```
Usage Decision: CONDITIONAL

Trigger Conditions:
├── Inspection Results: Partial defects (경미한 불합격)
├── Defect Qty: Within acceptable range
├── Possible Correction: Yes (선별/재검사 가능)
└── Example: Surface finish slightly rough → 선별 후 재검사 가능

Sub-decision: Conditional Actions
├── C1 — Sorting (선별)
│   ├── Action: Manual selection → Remove defectives
│   ├── Target: Achieve 100% quality
│   └─→ Re-inspected → Accept/Reject
├── C2 — Inspection Hold (재검사)
│   ├── Action: Hold material for re-inspection
│   ├── Timing: After supplier corrective action
│   └─→ Rework → Re-inspection → Accept/Reject
├── C3 — Restricted Use (제한 사용)
│   ├── Action: Use for non-critical application
│   ├── Example: Slight color variation → Use for internal parts
│   └─→ Restricted Stock for Limited Use
└── C4 — Conditional Accept (조건부 합격)
    ├── Action: Accept with quality note
    ├── Tracking: Material Lot Number → Traceability
    └─→ Use with monitoring

Post Conditional Actions:
├── Stock Movement:
│   ├── Source: Q-Stock
│   └── Target: Restricted Stock (제한 재고)
├── Cost Accounting:
│   ├── Debit: Sorting/Re-inspection Cost
│   └── Credit: Labor/Overhead Account
├── Production Impact:
│   ├── Notify Production: Hold material
│   ├── Schedule Re-inspection
│   └─→ Release when Accept decision made
└── Documents:
    ├── Conditional Acceptance Report
    ├── Lot Traceability Record
    └─→ Archive for warranty/recall
```

**설정 예시** (표면 불량 선별):
```
Inspection Lot: 202401-003
├── Inspection Type: 01
├── Lot Qty: 500 pcs
├── Defects: 15 pcs (표면 거칠음, 기능 정상)
├── AQL: 1.0 → Normally REJECT
└─→ Usage Decision = C1 (CONDITIONAL — Sorting)

Conditional Actions:
├── Create Sorting Task:
│   ├── Qty to Sort: 500 pcs (전체 로트)
│   ├── Defect Type: Surface Finish
│   ├── Expected Yield: 97% (15 pcs 제거 후 485 pcs)
│   └── Worker Assigned: QC Team
├── Move Stock: Q-Stock → Restricted-Sort
├── After Sorting Complete:
│   ├── Good Qty: 485 pcs → Accept (ACCEPTED)
│   ├── Bad Qty: 15 pcs → Reject (REJECTED)
│   └─→ Both decisions update Vendor Rating
└─→ Total Cost: Original + Sorting Labor
```

### 2단계: 자동 UD 규칙 (Automatic Usage Decision Rules)

**T-code: SPRO > QM > Quality Control → Automatic UD Rules**

검사 결과에 따라 사용결정을 자동으로 생성할 수 있습니다.

```
Automatic UD Rule Set:

Rule 1: 100% Acceptance
├── IF Lot Defects = 0
├── THEN Auto-generate: UD = ACCEPTED
└── Process: Q-Stock → Unrestricted (자동)

Rule 2: Automatic Rejection
├── IF Lot Defects ≥ 5% of Lot Size
├── THEN Auto-generate: UD = REJECTED (R2 — Scrap)
└── Process: Q-Stock → Scrap (자동) + Cost posting

Rule 3: Conditional with Sorting
├── IF Lot Defects = 1~2% AND Defect Type = Surface
├── THEN Auto-generate: UD = CONDITIONAL (C1 — Sorting)
├── Process: Q-Stock → Restricted-Sort
└── Wait for Manual Sorting → Final UD

Rule 4: Vendor Rating Integration
├── IF 3 consecutive rejections from same vendor
├── THEN: Auto-change Inspection Type 01 → MANDATORY (필수 검사)
└── Block Material Purchase from vendor until corrective action complete
```

**설정 (SPRO)**:
```
SPRO > Quality Management > Quality Control
→ Automatic Usage Decision Rules

Create Rule:
├── Rule Code: AUTO-UD-001
├── Description: Standard Acceptance Rule
├── Trigger Event: Inspection Lot Completed
├── Condition: Lot Defects = 0
├── Action: Create Usage Decision
│   ├── Type: ACCEPTED
│   ├── Posting Rule: Q-Stock → Unrestricted
│   └── Auto-post: ✅ (Manual approval 불필요)
└── Valid From: 2024-01-01
```

### 3단계: 후속 조치 (Follow-up Actions)

**T-code: SPRO > QM → Follow-up Actions**

사용결정 후 자동으로 실행되는 업무 프로세스입니다.

#### REJECTED → Supplier Notification

```
Action Flow:
UD = REJECTED (R1 또는 R3)
└─→ Auto-trigger: Create Quality Notification (Q3)
    ├── Notification Type: Q3 (Supplier Issue)
    ├── Defect Description: Auto-populated from Inspection Results
    ├── Reject Qty: {Lot Qty - Accepted Qty}
    ├── Root Cause: To be investigated by Supplier
    └─→ Partner Determination: Automatic Email to Vendor
        ├── To: Supplier Quality Manager
        ├── Subject: "Quality Issue — Lot {ID} — Corrective Action Required"
        ├── Attachment: Inspection Report + Photos
        └─→ Workflow: Supplier → Respond with SCAR (Supplier Corrective Action Request)

Workflow Integration:
├── Notification Approval: Quality Manager Review
├── Supplier Response Time: 5 business days
├── Follow-up: Auto-reminder after 3 days if no response
└─→ Rating Impact: -2 points until SCAR approved
```

#### CONDITIONAL → Auto-Scheduling

```
Action Flow:
UD = CONDITIONAL (C1 — Sorting or C2 — Re-inspection)
└─→ Auto-trigger: Create Maintenance Task
    ├── Task Type: QA Sorting / Re-inspection
    ├── Scheduled Date: Next 2 working days
    ├── Material: Lot {ID} in Restricted Stock
    ├── Labor Cost Center: QA (비용 계정)
    └─→ Fiori App: "QA Task Scheduling"
        └─→ QC Supervisor: Review & Assign Worker

Completion:
├── Post Sorting/Re-inspection Results
├── Create Final Usage Decision (ACCEPTED or REJECTED)
├── Update Stock Movement
└─→ Cost Posting (Sorting Labor + Material Loss)
```

## 구성 검증

**T-code: QA34** (Create Usage Decision with Auto Rules)

```
테스트 1: 100% 합격 로트
├── Inspection Lot: 500 pcs, 0 defects
├── Auto-UD Trigger: ACCEPTED (자동 생성)
├── Stock Check: Q-Stock 0, Unrestricted +500
└─→ System Behavior: ✅ Correct

테스트 2: 불합격 로트 (5% 불합격)
├── Inspection Lot: 500 pcs, 25 defects
├── Auto-UD Trigger: REJECTED (자동 생성)
├── Quality Notification: Q3 자동 생성
├── Stock Check: Q-Stock 0, Scrap +25, Return +475
└─→ Vendor Notification Email 발송됨 ✅

테스트 3: 조건부 (선별)
├── Inspection Lot: 500 pcs, 10 defects (2%)
├── Auto-UD Trigger: CONDITIONAL (C1)
├── Stock Move: Q-Stock → Restricted-Sort
├── Fiori Task: QA Sorting Task 생성 ✅
└─→ Wait for Manual Sorting → Final UD
```

## 주의사항

### 1. UD 생성 지연 (통보 미연계)
❌ **하지 말 것**: 검사 완료 후 UD 미생성 (재고 움직임 없음)
✅ **권장**: 자동 UD 규칙 설정 → 검사 결과 → 즉시 UD 생성

### 2. 불합격 통보 누락
❌ **하지 말 것**: REJECTED 결정 후 Supplier 통보 안 함
✅ **권장**: Q3 Notification 자동 생성 → 공급업체 이메일 발송

### 3. 비용 계정 오류
❌ **하지 말 것**: Scrap/Return 비용을 inventory 계정에 기록
✅ **권장**: Material Loss / Scrap Loss Account (별도 비용 계정) 사용

**설정**:
```
FI > Chart of Accounts
├── 5100: Material Loss (자재손실)
├── 5110: Scrap Loss (폐기손실)
└── 5120: Sorting & Rework Cost (선별비용)

QA34에서:
└─→ Stock Posting Rule → Scrap → Cost Center → Account 5110
```

### 4. Vendor Rating 미반영
❌ **하지 말 것**: UD (Accept/Reject) 시 Vendor 평가 미업데이트
✅ **권장**: REJECTED → Vendor Rating -2 automatic

### 5. 한국 현장: A/S 및 Recall 추적 부재
❌ **하지 말 것**: CONDITIONAL Accept 받은 재료의 추적 안 함
✅ **권장**: Lot Number Traceability → 향후 고객 클레임 시 원인 파악 가능

```
Process:
Conditional Accept (C4)
└─→ Material Lot Table (자재 로트 기록)
    ├── Lot ID, Incoming Date, Defect Type
    ├── User Department, Application
    └─→ 고객 클레임 발생 시 원인 추적 가능
```

## S/4 HANA 신기능

### 1. AI 기반 자동 UD
- ML: 과거 검사 패턴 → 자동 UD 정확도 98%
- 예: "이 공급업체 재료는 항상 Accept rate 95%" → Reduced 샘플링 자동 제안

### 2. Blockchain 기반 Traceability
- Material Lot → Production Lot → Delivery → Customer까지 전체 추적
- T-app: "Supply Chain Visibility" (옵션)

## 다음 단계
- 품질통보 카탈로그 정의 — `quality-notification-type.md` 참조
- RCA (Root Cause Analysis) 및 8D Report — Advanced
