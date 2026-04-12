# 품질통보유형(Quality Notification Type) IMG 구성 가이드

## SPRO 경로
```
SPRO → Quality Management → Quality Notification
├── Define Notification Type (통보유형)
│   ├── Q1 — Customer Complaint (고객클레임)
│   ├── Q2 — Internal Defect (내부불량)
│   └── Q3 — Supplier Issue (공급업체불량)
├── Catalog Definition (카탈로그)
│   ├── Defect Code (결함코드)
│   ├── Cause Code (원인코드)
│   └── Activity Code (활동코드)
├── Partner Determination (파트너결정)
└── Follow-up Actions (후속조치)
    ├── RCA (Root Cause Analysis)
    ├── 8D Report
    └── SCAR (Supplier Corrective Action Request)
```

## 필수 선행 구성
- [ ] Inspection Types 정의 완료 (01, 03, 04)
- [ ] Usage Decision Rules 설정 (ACCEPTED, REJECTED, CONDITIONAL)
- [ ] Work Centers 정의 (QA 팀)
- [ ] Workflow 설정 (승인 프로세스)

## 구성 단계

### 1단계: 품질통보유형 정의 (QM01)

**T-code: QM01** (Create Notification Type — Quality)

#### Q1 — 고객클레임 (Customer Complaint)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `Q1` | 고객 클레임 |
| Description | `고객 클레임` | 한국어 가능 |
| Notification Category | Quality | QM 분류 |
| Is a Complaint | ✅ (체크) | 외부 클레임 |
| Partner Determination | ✅ | Sales/Customer Service 자동 배정 |
| Catalog Profile | Q1-DEFECT | 결함 카탈로그 |

**Q1 프로세스**:
```
Customer Complaint (고객 불만)
└─→ T-code: IW21 (Create Notification Q1)
    ├── Customer: ABC Co. (고객사)
    ├── Product: BEARING-NSK-25 (제품)
    ├── Issue: "베어링에서 소음 발생"
    ├── Defect Code: NOISE_ABNORMAL (소음)
    ├── Required End Date: 7일 (긴급)
    └─→ Save
└─→ Q1-000001 자동 생성
└─→ Partner Determination: Sales Manager + Product Engineer 배정
└─→ Follow-up: RCA 진행
    ├── Root Cause: Bearing lubrication failure
    ├── Corrective Action: Engineering review + Design change
    └─→ 전체 배치 Recall 가능성 평가
```

**특징**:
- 외부 고객과 커뮤니케이션 필수
- 반응 시간 (Response Time) SLA: 24시간
- Recall 가능성 평가 필요

#### Q2 — 내부불량 (Internal Defect)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `Q2` | 내부 불량 |
| Description | `내부 불량` | 생산/검사 발견 불량 |
| Notification Category | Quality | QM |
| Is a Complaint | ❌ (미체크) | 내부 이슈 |
| Partner Determination | ❌ | 수동 배정 (생산팀, 품질팀) |
| Catalog Profile | Q2-DEFECT | 결함 카탈로그 |

**Q2 프로세스**:
```
QA 검사 중 불합격 발견 (Usage Decision = REJECTED)
└─→ 자동 Q2 Notification 생성 (또는 수동)
    ├── Batch: 202401-BBB (생산 배치)
    ├── Defect: Dimension out of tolerance
    ├── Cause: Machine calibration drift
    └─→ Q2-000001 자동 생성
└─→ Partner Determination: Production Manager + Quality Engineer
└─→ RCA 진행:
    ├── 원인: Machine tool accuracy (-0.2mm)
    ├── Corrective Action: Re-calibration + Re-check
    ├── Timeline: 즉시 (같은 날)
    └─→ Impact: 이전 배치 (202401-AAA)도 재검사 필요?
└─→ Document: Internal Audit Report
```

**특징**:
- 내부 팀 협력 (생산, 품질, 엔지니어링)
- Root Cause 파악 (공정 안정성 개선)
- 정량적 분석 필요 (불량률, 원가 손실)

#### Q3 — 공급업체불량 (Supplier Issue)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `Q3` | 공급업체 불량 |
| Description | `공급업체 불량 신고` | 입고 불량 |
| Notification Category | Quality | QM |
| Is a Complaint | ❌ | 공급 체인 이슈 |
| Partner Determination | ✅ | 공급업체 자동 배정 |
| Catalog Profile | Q3-DEFECT | 공급업체 결함 카탈로그 |
| Approval Required | ✅ | 구매담당자 승인 후 발송 |

**Q3 프로세스**:
```
입고 검사 불합격 (Usage Decision = REJECTED)
└─→ Q3 Notification 자동 생성 (QA34 UD 결정 후)
    ├── Supplier: NSK (공급업체)
    ├── Lot: NSK-20240101-500 (입고 로트)
    ├── Qty: 500 pcs
    ├── Defect: Bearing outer diameter OD = 24.88mm (Spec: 25.00±0.05)
    ├── Qty Defective: 50 pcs (10%)
    └─→ Q3-000001 자동 생성
└─→ Approval: Purchasing Manager 검토 + 승인
└─→ Partner Determination: Supplier Quality Manager에게 이메일
    ├── Subject: "Quality Issue — Lot NSK-20240101-500"
    ├── Attachment: Inspection Report + Measurement Data
    └─→ Request SCAR (Supplier Corrective Action Request) — 5일 내 제출
└─→ Follow-up Actions:
    ├── Stock: 500 pcs Blocked (Return to Vendor)
    ├── Finance: Create Credit Memo (환수 요청)
    ├── Supplier Rating: -3 points
    └─→ If 3 consecutive rejections → Block from purchasing
```

**특징**:
- 공급업체와의 공식 커뮤니케이션
- SCAR (Corrective Action Request) 요구
- 재계약/감시 대상자 평가

### 2단계: 결함 카탈로그 (Defect Code)

**T-code: SPRO > QM → Catalog Definition**

#### Q1 고객클레임용 결함코드

| 코드 | 결함명 | 설명 | 심각도 |
|------|--------|------|--------|
| DIM-OUT | 규격초과 | 크기/무게 부족 | 높음 |
| NOISE-ABNORMAL | 비정상 소음 | 운영 중 소음 발생 | 높음 |
| NO-FUNCTION | 기능불가 | 전혀 작동하지 않음 | 최고 |
| SURFACE-DEFECT | 표면결함 | 스크래치, 녹슴 | 중간 |
| ASSEMBLY-ISSUE | 조립오류 | 부품 누락, 잘못된 조립 | 높음 |
| DURABILITY-SHORT | 수명 단축 | 보증 기간 내 고장 | 높음 |
| INTERMITTENT | 간헐적 불량 | 가끔 작동 안 함 | 높음 |

#### Q2 내부불량용 결함코드

| 코드 | 결함명 | 설명 | 발생처 |
|------|--------|------|--------|
| DIM-ERROR | 치수 오류 | 측정치 규격 초과 | 생산 공정 |
| ASSEMBLY-ERROR | 조립 오류 | 부품 누락, 잘못된 순서 | 조립 라인 |
| CONTAMINATION | 오염 | 먼지, 칩 포함 | 공정 환경 |
| MATERIAL-DEFECT | 재료 결함 | 내부 기공, 균열 | 입고 재료 |
| OPERATION-SKILL | 작업 오류 | 작업자 실수 | 인적 오류 |
| EQUIPMENT-ISSUE | 설비 오류 | 기계 정확도 부족 | 설비 미정비 |

#### Q3 공급업체불량용 결함코드

| 코드 | 결함명 | 설명 | 처리 방법 |
|------|--------|------|---------|
| INCOMING-DIM | 입고 규격 초과 | Supplier SPC 부족 | 환수 + SCAR |
| MATERIAL-QUALITY | 재료품질 부족 | Raw material issue | 공급업체 변경 |
| DELIVERY-DAMAGE | 배송 손상 | 운송 중 손상 | 배송사 클레임 |
| BATCH-MIX | 로트 혼합 | 잘못된 배치 출하 | 추적 시스템 강화 |
| PACKAGING | 포장 불량 | 포장 손상, 약함 | 포장 규격 개선 |
| LATE-DELIVERY | 납기 지연 | 계약 납기 미준수 | Lead time 재검토 |

### 3단계: 원인 및 활동 코드

**원인코드 (Cause Code)**:
- Q1: SUPPLIER-QUALITY, DESIGN-FLAW, OPERATOR-ERROR, STORAGE-DAMAGE
- Q2: MACHINE-DRIFT, MATERIAL-BATCH, PROCEDURE-MISS, SKILL-GAP
- Q3: SPC-POOR, RAW-MATERIAL, TRANSPORTATION, SUPPLIER-PROCESS

**활동코드 (Activity Code)**:
- INVESTIGATION (조사)
- ENGINEER-REVIEW (엔지니어 검토)
- SUPPLIER-MEETING (공급업체 회의)
- PROCESS-ADJUSTMENT (공정 조정)
- DESIGN-CHANGE (설계 변경)
- REWORK (재작업)
- SCRAP (폐기)
- RETURN-TO-SUPPLIER (반품)
- CUSTOMER-REPLACEMENT (고객 교체)
- RECALL (리콜)

### 4단계: 파트너결정 (Partner Determination)

**T-code: SPRO > QM → Partner Determination**

```
Rule 1: Q1 (고객클레임) 파트너 배정

Condition: Notification Type = Q1
├── Primary: Sales Manager (영업담당)
│   └─→ Customer communication, compensation negotiation
├── Secondary: Quality Engineer
│   └─→ RCA, technical analysis
└─→ Auto-email to both + Escalate to VP if Priority=1 (Critical)

Rule 2: Q2 (내부불량) 파트너 배정

Condition: Defect Code = DIM-ERROR or EQUIPMENT-ISSUE
├── Partner: Production Manager
├── Carbon Copy: Quality Manager, Maintenance
└─→ Email: "Immediate Production Stop & Machine Recalibration Required"

Rule 3: Q3 (공급업체불량) 파트너 배정

Condition: Notification Type = Q3 + Supplier = NSK
├── Primary: Supplier Contact Person (Database에서 자동 조회)
│   └─→ From: Purchasing Manager
│   └─→ Subject: "Quality Issue Notification — Corrective Action Required"
├── Require Approval: ✅ Purchasing Manager signing
└─→ Attach: Inspection Report + Measurement Data

Example Flow:
Q3-000001 Created (Supplier NSK, Batch 500 pcs)
└─→ Status = NEW
└─→ Purchasing Manager 검토 & 승인
└─→ Status = APPROVED
└─→ System 자동 발송:
    ├── Email To: NSK Quality Manager (contacts.nskorea@nsk.jp)
    ├── CC: Our Purchasing Manager, Quality Manager
    ├── Subject: "NSK Notification Q3-000001: Quality Issue on Lot 500pcs"
    └─→ Request: "Please provide SCAR within 5 business days"
```

## 구성 검증

**T-code: IW21** (Create Notification — Quality)

```
테스트 1: Q1 고객클레임 생성
├── Create Notification
├── Type: Q1 (Customer Complaint)
├── Customer: ABC Co.
├── Defect: NOISE-ABNORMAL
├── Auto-partners: Sales Manager, Quality Engineer 배정됨 ✅
├── Email Notification: 두 담당자에게 발송 ✅
└─→ Follow-up: RCA Task 자동 생성 ✅

테스트 2: Q3 공급업체불량 + 자동 SCAR 요청
├── Create Notification Q3
├── Supplier: NSK
├── Purchasing Manager 승인 필수 ✅
├── 승인 후 Email 자동 발송 ✅
├── Q3 Notification과 자동 Credit Memo 연결 ✅
└─→ Supplier Response 추적 (Follow-up)

테스트 3: 후속조치 자동화
├── Q2 Internal Defect 생성
├── RCA (Root Cause Analysis) Task 자동 생성 ✅
├── Corrective Action 입력 필드 제공 ✅
├── Follow-up Notification (재발 방지 여부) 일정 설정 ✅
└─→ KPI 자동 계산 (문제 해결 시간)
```

## 주의사항

### 1. 통보유형 활동코드 미정의
❌ **하지 말 것**: Activity Code 없이 자유 텍스트만 입력
✅ **권장**: 표준 Activity Code 사용 → 데이터 분석 가능

### 2. SCAR 추적 부재 (Q3)
❌ **하지 말 것**: 공급업체에 Q3 발송 후 응답 추적 안 함
✅ **권장**: 자동 Follow-up Reminder (3일, 7일)

**설정**:
```
Q3 Notification
└─→ Follow-up Task: "Supplier SCAR Response Due"
    ├── Due Date: +5 business days
    ├── Auto-reminder: +3 days (아직 미응답 시)
    └─→ Escalation: +7 days (미응답 시 Purchasing VP 통보)
```

### 3. 고객 정보 노출
❌ **하지 말 것**: 내부 Q2/Q3 Notification에서 고객정보 노출
✅ **권장**: Q1 (고객클레임)만 고객 정보 포함

### 4. 한국 현장: 소송 위험 관리
❌ **하지 말 것**: Q1 클레임 발생 후 법무팀 미통보
✅ **권장**: 클레임 심각도에 따라 법무 자동 CC

**설정**:
```
Q1 Notification
├── Priority = 1 (Critical, 고객 부상/재산 손실 가능)
└─→ Auto-email to Legal Department + Insurance
```

### 5. 통보 해결 기한 미설정
❌ **하지 말 것**: "빨리 처리" (모호한 기한)
✅ **권장**: SLA (Service Level Agreement) 정의

```
Q1 (고객클레임): 7일 내 1차 응답
Q2 (내부불량): 3일 내 RCA 완료
Q3 (공급업체): 5일 내 SCAR 제출
```

## S/4 HANA 신기능

### 1. AI 기반 자동 분류
- NLP: 고객 불만 텍스트 → 자동 Defect Code 분류
- 예: "베어링에서 이상한 소음이 나요" → NOISE-ABNORMAL 자동 인식

### 2. Recall 관리 자동화
- Material Batch 추적 + Customer Delivery 연결
- Recall 필요 시 영향받은 고객 자동 추출 (Blockchain 기반)

### 3. 품질 대시보드
- Fiori App: "Quality Notifications Dashboard"
- Real-time KPI: Defect rate, SCAR Response time, RCA Effectiveness

## 다음 단계
- RCA (Root Cause Analysis) 및 8D Report — Advanced
- Supplier Quality Management & Scorecarding — SQMR
- Warranty/Recall Management — S/4 신기능
