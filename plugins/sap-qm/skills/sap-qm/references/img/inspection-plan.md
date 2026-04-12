# 검사계획(Inspection Plan) IMG 구성 가이드

## SPRO 경로
```
SPRO → Quality Management → Quality Planning
├── Inspection Plan (검사계획)
│   ├── QP01 — Routing-based Plan (공정 경로 기반)
│   ├── QP02 — Material-based Plan (자재 기반)
│   └── QP03 — Material-Routing Combined (자재+공정 통합)
├── Sampling Procedure (샘플링 절차)
│   ├── QDV1 — Attributes Sampling (정성적)
│   ├── QDV2 — Variables Sampling (정량적)
│   └── Dynamic Modification (QDR1 — AQL 동적 조정)
└── Inspection Characteristics (검사 특성)
    ├── Test Instrument (검사 장비)
    ├── Characteristics (측정 항목)
    └── Acceptance Criteria (합격 기준)
```

## 필수 선행 구성
- [ ] Material Master 생성 (MM01)
- [ ] Routing 생성 (CA01 for PP / 또는 구매 경로)
- [ ] Work Center 정의 (QM01 등 검사 작업중심)
- [ ] Inspection Characteristics 정의

## 구성 단계

### 1단계: 검사 특성(Characteristics) 정의

**T-code: IA01** (Create Characteristics) 또는 **SPRO > QM > Inspection Characteristics**

검사 특성은 측정 항목(예: 직경, 무게, 색상)을 정의합니다.

#### 예시: 베어링 부품 검사 특성

```
Characteristic 1:
├── Code: BEARING-OD (외경)
├── Description: Outer Diameter
├── Type: Variables (정량적, 숫자)
├── Unit: mm
├── Target Value: 25.00
├── Tolerance: ±0.05 (24.95 ~ 25.05)
├── Measurement Method: Micrometer
└── Priority: 1 (Critical Dimension)

Characteristic 2:
├── Code: BEARING-ID (내경)
├── Type: Variables
├── Unit: mm
├── Target: 15.00
├── Tolerance: ±0.03
└── Priority: 1 (Critical)

Characteristic 3:
├── Code: BEARING-RADIAL (동심도)
├── Type: Variables
├── Unit: mm
├── Target: < 0.02
├── Priority: 2 (Important)

Characteristic 4:
├── Code: SURFACE-FINISH (표면 상태)
├── Type: Attributes (정성적, 합격/불합격)
├── Grades: Fine / Acceptable / Rough
├── Acceptance: Fine 또는 Acceptable only
└── Priority: 2
```

### 2단계: 검사계획 생성 (QP01 — Routing-based)

**T-code: QP01** (Create Inspection Plan)

공정 경로(Routing) 기반 검사계획은 생산 공정 중 어느 단계에서 검사할지 정의합니다.

#### 예시: 축전 조립 공정 검사계획

```
Inspection Plan: QP01-ASSEMBLY-BEARING

Header:
├── Plant: 1000
├── Routing/Sequence: BEARING-ASSEMBLY (생산 라우팅)
├── Plan Type: 01 (Routing-based)
└── Validity: 2024-01-01 ~ 2099-12-31

Operation 10: Material Inspection (입고 검사)
├── Sequence Point: Before Assembly Start
├── Inspection Lot Source: GR (입고)
├── Characteristics to Check:
│   ├── BEARING-OD
│   ├── BEARING-ID
│   └── SURFACE-FINISH
├── Sampling: QDV1 (Attributes) — AQL 1.0
├── Sample Size: 125 per 1000 (12.5%)
└── Accept Criteria: All ✅

Operation 20: In-Process Inspection (공정검사)
├── Sequence Point: After Assembly OP 30
├── Inspection Lot Source: PP Confirmation
├── Characteristics:
│   ├── RADIAL-RUNOUT
│   ├── DIMENSIONAL CHECK
│   └── LOAD TEST
├── Sampling: QDV2 (Variables) — AQL 0.65
├── Sample Size: 20 per batch
└── Accept Criteria: All within tolerance ±0.03

Operation 30: Final Inspection (출하 전 검사)
├── Sequence Point: Before Packing
├── Characteristics: All 4 characteristics re-check
├── Sampling: 100% (No sampling for critical part)
└── Accept Criteria: All ✅
```

### 3단계: 검사계획 생성 (QP02 — Material-based)

**T-code: QP02**

자재 기반 검사계획은 입고 검사나 완제품 검사에 사용됩니다.

#### 예시: 베어링 완성 부품 검사계획

```
Inspection Plan: QP02-BEARING-NSK

Header:
├── Plant: 1000
├── Material: BEARING-NSK-25 (베어링 OD 25mm)
├── Plan Type: 02 (Material-based)
├── Supplier: NSK (공급업체)
└── Validity: 2024-01-01 ~ 2099-12-31

Single Item:
├── Inspection Point: Incoming (입고)
├── Characteristics to Check:
│   ├── BEARING-OD (필수)
│   ├── BEARING-ID (필수)
│   ├── RADIAL-RUNOUT (필수)
│   └── SURFACE-FINISH (필수)
├── Sampling Procedure: QDV1 — AQL 1.0
├── Sample Size Table:
│   ├── 1~100 pcs → Sample 13 pcs (13%)
│   ├── 101~1000 pcs → Sample 50 pcs (5%)
│   ├── 1001~10000 pcs → Sample 125 pcs (1.25%)
│   └── > 10000 pcs → Sample 315 pcs (3.15%)
└── Acceptance Rule:
    ├── Accept If: Sample defects ≤ 0
    ├── Reject If: Defects ≥ 1
    └── → Reject entire lot, Return to Vendor
```

### 4단계: 샘플링 절차 정의 (QDV1, QDV2)

**T-code: QDV1** (Attributes Sampling) / **QDV2** (Variables Sampling)

#### QDV1 — 정성적 샘플링 (Attributes)

AQL(Acceptable Quality Level) 기반으로 합격/불합격을 판정합니다.

```
Sampling Plan: QDV1-ATTRIBUTES-AQL-1.0

Sampling Procedure:
├── AQL Level: 1.0 (표준)
├── Inspection Level: II (표준 검사 강도)
├── Standard: ANSI Z1.4 / ISO 2859-1

Sample Size Determination (자동 계산):
├── Lot Size 1~100:        Sample 13  (Accept ≤ 0 defects)
├── Lot Size 101~500:      Sample 32  (Accept ≤ 0 defects)
├── Lot Size 501~1,200:    Sample 50  (Accept ≤ 0 defects)
├── Lot Size 1,201~3,200:  Sample 80  (Accept ≤ 1 defect)
├── Lot Size 3,201~10,000: Sample 125 (Accept ≤ 1 defect)
└── Lot Size > 10,000:     Sample 200 (Accept ≤ 1 defect)

Double Sampling (이단계 샘플링):
├── First Sample: 50 pcs
│   ├── IF Defects = 0 → ACCEPT
│   ├── IF Defects ≥ 3 → REJECT
│   └── IF Defects = 1~2 → Go to Second Sample
└── Second Sample: 50 pcs (추가)
    ├── Total Defects = First + Second
    ├── IF Total ≤ 2 → ACCEPT
    └── IF Total ≥ 3 → REJECT
```

**T-code: QDV1 설정**:
```
Sampling Procedure Code = QDV1-AQL-1.0
├── Sampling Type: Attributes (정성적)
├── Standard: ISO 2859-1
├── AQL: 1.0
├── Inspection Level: II (Normal)
└── Accept/Reject Criteria: Auto-calculated
```

#### QDV2 — 정량적 샘플링 (Variables)

측정 수치(직경, 무게 등)를 통계 분석하여 합격/불합격 판정합니다.

```
Sampling Plan: QDV2-VARIABLES-AQL-0.65

Sample Size: 5~10 pcs (Attributes보다 작음 — 통계 분석)

Calculation Method:
├── Sample Mean (평균): Avg of all samples
├── Standard Deviation (표준편차): σ
├── Upper Spec Limit (USL): Target + Tolerance
├── Lower Spec Limit (LSL): Target - Tolerance

Acceptance Criteria:
├── IF Mean + 1.96σ < USL AND Mean - 1.96σ > LSL
│   └─→ ACCEPT (정상)
├── IF Mean + 1.96σ ≥ USL OR Mean - 1.96σ ≤ LSL
│   └─→ REJECT (불합격)
└── Critical Dimension (중요도 높음):
    ├── Tighter σ limit (σ ≤ 0.3 × Tolerance)
    └─→ Reduce sample size, increase sampling frequency
```

**예시 계산**:
```
Characteristics: BEARING-OD
├── Target: 25.00 mm
├── Tolerance: ±0.05 mm (LSL=24.95, USL=25.05)
├── Sample: [25.01, 24.98, 25.02, 24.99, 25.03] (n=5)
├── Mean: 25.006 mm
├── σ: 0.018 mm

Acceptance Check:
├── Mean + 1.96σ = 25.006 + 0.035 = 25.041 < USL(25.05) ✅
├── Mean - 1.96σ = 25.006 - 0.035 = 24.971 > LSL(24.95) ✅
└─→ ACCEPT (정상 범위)
```

### 5단계: 동적 수정 규칙 (QDR1 — Dynamic Modification)

**T-code: QDR1** 또는 **SPRO > QM > Dynamic Modification**

AQL 수준을 동적으로 상향/하향 조정하여 검사 강도를 자동화합니다.

#### 전환 규칙 (Switching Rules)

```
Default State: NORMAL (표준 검사)
├── AQL: 1.0
├── Sample Size: 표준
└── Accept/Reject Criteria: 표준

Tightened State (강화 검사):
├── Trigger: 5개 연속 로트 불합격 또는 불합격률 > 5%
├── AQL: 0.65 (더 엄격)
├── Sample Size: 125% (25% 증가)
├── Accept Criteria: 0 defects only (더 엄격)
└── Duration: 5개 로트 연속 합격까지 유지

Reduced State (완화 검사):
├── Trigger: 10개 연속 로트 합격 AND 불합격률 < 1%
├── AQL: 2.5 (더 완화)
├── Sample Size: 50% (50% 감소)
├── Accept Criteria: ≤ 2 defects (더 완화)
└── Duration: 1개 불합격으로 즉시 NORMAL로 복귀

Transition Table (ISO 2859-1 기준):
┌──────────┬────────┬──────────┬──────────┐
│ State    │ AQL    │ Sample%  │ Accept   │
├──────────┼────────┼──────────┼──────────┤
│ Reduced  │ 2.5    │ 50%      │ ≤ 2 def  │
│ Normal   │ 1.0    │ 100%     │ ≤ 1 def  │
│ Tightened│ 0.65   │ 125%     │ 0 def    │
└──────────┴────────┴──────────┴──────────┘
```

**설정** (QDR1):
```
Dynamic Modification Rule: QDR1-STANDARD

Rule 1: NORMAL → TIGHTENED
├── Condition: 5 consecutive reject lots
├── Action: Switch to Tightened sampling
└── Duration: 5 consecutive accept lots

Rule 2: TIGHTENED → NORMAL
├── Condition: 5 consecutive accept lots
└── Action: Switch back to Normal

Rule 3: NORMAL → REDUCED
├── Condition: 10 consecutive accept lots AND defect rate < 1%
└── Action: Switch to Reduced sampling

Rule 4: REDUCED → NORMAL
├── Condition: 1 reject lot OR defect rate > 2.5%
└── Action: Switch back to Normal immediately
```

## 구성 검증

**T-code: QA32** (Create Inspection Lot with Plan 적용)

```
검증 체크리스트:

1. Plan 적용 테스트:
   ├── Material: BEARING-NSK
   ├── Create Lot (QA32)
   ├── Inspection Plan: QP02-BEARING-NSK 자동 선택됨 ✅
   └── Characteristics 자동 로드 확인

2. Sampling 검증:
   ├── Lot Qty: 500 pcs
   ├── QDV1 적용: Sample = 32 pcs (자동 계산)
   └── Expected Defects = 0 for Accept

3. 동적 수정 확인:
   ├── 5 consecutive reject → AQL 0.65로 자동 상향
   ├── 10 consecutive accept → AQL 2.5로 자동 하향
   └─→ QDR1 규칙 로그 확인 (QA36)
```

## 주의사항

### 1. Characteristics 중복 정의
❌ **하지 말 것**: 같은 항목을 여러 Characteristics로 정의
✅ **권장**: 중앙집중식 Characteristic 마스터 유지

### 2. Tolerance 오류
❌ **하지 말 것**: Target Value 없이 LSL/USL만 정의
✅ **권장**: Target ± Tolerance 형식 (통계 분석의 기초)

### 3. AQL 수준 오류
❌ **하지 말 것**: 모든 물품에 AQL 1.0 (과검사)
✅ **권장**: 중요도별 AQL 차등 (Critical: 0.65, Normal: 1.0, Non-critical: 2.5)

### 4. 샘플링 무작위성 부족
❌ **하지 말 것**: 처음 몇 개만 검사 (Bias)
✅ **권장**: 통계적 무작위 샘플링 (Random Stratified Sampling)

## S/4 HANA 신기능

### 1. AI 기반 Characteristics 제안
- ML 분석: 과거 불량 패턴 → 검사 특성 자동 추천
- "이 부품은 직경이 자주 탈나므로 직경 검사 우선순위 UP"

### 2. 통계 분석 자동화
- QDV2 (Variables) 계산 자동
- 신뢰도 95% 자동 적용
- Process Capability (Cpk, Ppk) 자동 계산

## 다음 단계
- 사용결정 규칙 정의 — `usage-decision.md` 참조
- 공급업체 평가 및 등급 관리 — Advanced
