# 창고 프로세스 유형 (Warehouse Process Type) IMG 구성 가이드

## SPRO 경로

```
SPRO → SCM Extended Warehouse Management → Cross-Process Settings → Warehouse Process Type
또는 T-code: /SCWM/MDEF
```

## 필수 선행 구성

- [ ] Storage Type (저장타입) 정의 — T-code: /SCWM/STDEF
- [ ] Storage Location (저장위치) 정의 — T-code: /SCWM/LOCL
- [ ] Warehouse Organization (창고 기본정보) — T-code: /SCWM/WAREH

## 구성 단계

### 1단계: 입하 프로세스 유형 (Inbound Process Types)

```
T-code: /SCWM/MDEF → Warehouse Process Type → Inbound
```

#### GRPO (Goods Receipt + Putaway Only)

```
프로세스 정의:
- Process Code: GRPO
- Process Name: Goods Receipt + Putaway Operations
- Flow:
  1. Purchase Order (MM) → Goods Receipt
  2. Quality Inspection (Optional)
  3. Putaway to Storage (자동 또는 수동)
  4. Stock Update

적용 시나리오:
- 신뢰할 수 있는 공급업체 (Trusted Vendor)
- 검사 불필요 (Vendor-managed QC)
- 표준 부품 (Raw Materials)

설정:
- Inbound Profile: GRPO
- Putaway Mandatory: Y (즉시 적치)
- Quality Inspection: N (스킵)
- Stock Type: Unrestricted Stock (자유 재고)

T-code: /SCWM/INIT → Process Type GRPO 선택
  └─ Inbound Integration: Activate GR → EWM Auto
```

#### GRPI (Goods Receipt + Putaway + Inventory)

```
프로세스 정의:
- Process Code: GRPI
- Process Name: Goods Receipt + Putaway + Inventory Check
- Flow:
  1. Goods Receipt (MM)
  2. Goods Inspection (수량/품질 검증)
  3. Putaway
  4. Inventory Check (재고실사)
  5. Stock Update (또는 Correction)

적용 시나리오:
- 신규 공급업체 (New Vendors)
- 품질 검사 필수 (Certification Required)
- 특수 부품/의약품 (Controlled Items)
- 수입품 (Import Goods)

설정:
- Inbound Profile: GRPI
- Putaway Mandatory: Y
- Quality Inspection: Y (IM Inspection Lot)
- Stock Type: Restricted Stock (검사 재고)
- Inventory Check: Y (실사 결과 반영)

한국 특화:
- 통관 서류 첨부 (Import Document)
- HS Code 확인 (HS-Code Validation)
- 과세/비과세 구분
```

#### GRPO vs GRPI 선택 기준

| 항목 | GRPO | GRPI |
|------|------|------|
| **검사 시간** | 없음 | 24~72시간 |
| **부품 사용 시간** | 즉시 | 검사 완료 후 |
| **재고 비용** | 낮음 | 높음 (검사 중) |
| **불량품 관리** | 공급업체 반품 | 사내 격리 |
| **공급업체** | 신뢰도 높음 | 신뢰도 낮음/신규 |

### 2단계: 출고 프로세스 유형 (Outbound Process Types)

```
T-code: /SCWM/MDEF → Warehouse Process Type → Outbound
```

#### GIPO (Goods Issue + Picking Operations)

```
프로세스 정의:
- Process Code: GIPO
- Process Name: Goods Issue + Picking
- Flow:
  1. Sales Order (SD) → Warehouse Task (자동)
  2. Picking (피킹)
  3. Goods Issue (출고 포스팅)
  4. Ship (배송)

적용 시나리오:
- 표준 주문-대금제 거래
- 납기일이 넉넉한 경우 (3~5일)
- B2B 대량 거래
- 도매/유통업체

설정:
- Outbound Profile: GIPO
- Warehouse Task Creation: Automatic (자동)
- Picking Strategy: FIFO (First In First Out)
- Packing Required: N (Bulk Shipment)
- Wave Release: Manual (수동)

T-code: /SCWM/INIT → Outbound Settings
  └─ Wave Creation Rule: Release on demand (수요 기반)
  └─ Task Creation: Immediate (즉시)
```

#### GIPI (Goods Issue + Picking + Inventory)

```
프로세스 정의:
- Process Code: GIPI
- Process Name: Goods Issue + Picking + Inventory (with Inspection)
- Flow:
  1. Sales Order (SD)
  2. Inventory Check (정확한 재고 확인)
  3. Picking (품질 검증 포함)
  4. Goods Issue
  5. Packing (검사 후)
  6. Ship

적용 시나리오:
- 반품/교환 상품 (재확인 필요)
- 의약품/식품 (유통기한 확인)
- 고가 제품 (검증 필수)
- 고객 클레임 많음 (품질 중심)

설정:
- Outbound Profile: GIPI
- Inventory Check: Y
- Picking Validation: Strict
- Packing Verification: Full
- Quality Check Point: Pre-Ship
```

#### GIPO vs GIPI 선택 기준

| 항목 | GIPO | GIPI |
|------|------|------|
| **처리 시간** | 빠름 (1~2일) | 느림 (3~5일) |
| **검증 수준** | 최소 | 전체 |
| **오류율** | 1~2% | 0.1% |
| **비용** | 낮음 | 높음 (인력) |
| **고객 만족** | 중간 | 높음 (신뢰도) |

### 3단계: 내부 이동 프로세스 유형 (Internal Movement Types)

```
T-code: /SCWM/MDEF → Warehouse Process Type → Internal Movements
```

#### RPLN (Replenishment)

```
프로세스 정의:
- Process Code: RPLN
- Process Name: Replenishment (보충)
- Flow:
  1. Monitor Storage Location Capacity
  2. Generate Replenishment Task (자동 또는 수동)
  3. Pick from Reserve (Bulk Area)
  4. Place in Pick Area (활발한 영역)

목적:
- Pick Location 상시 재고 유지
- Picking Efficiency 향상
- 창고 인건비 최적화

설정:
- Replenishment Type: Automatic (자동)
- Trigger Level: Min/Max (최소/최대)
- Source: Reserve Area (H저장소 → B저장소)
- Frequency: Daily (일일, 자정 실행)

예시:
```
┌─────────────────────────────────┐
│ Reserve Area (H-Shelf Storage)  │
│ Product A: 1,000 units          │
│ Min Level: 500, Max Level: 1000 │
└──────────────┬──────────────────┘
               │ Replenishment Task
               ▼
┌─────────────────────────────────┐
│ Pick Area (B-Bin Storage)       │
│ Product A: 100 units (Low!)     │
│ Min Level: 200, Max Level: 500  │
│ Target: Refill to 500           │
└─────────────────────────────────┘

Replenishment Qty = 500 - 100 = 400 units
Task: Pick 400 from H → Place in B
```

#### REAR (Rearrangement)

```
프로세스 정의:
- Process Code: REAR
- Process Name: Rearrangement (정렬/최적화)
- Flow:
  1. Analyze Warehouse Layout (AI/ML 기반)
  2. Identify Slow Movers (회전율 낮은 상품)
  3. Relocate to Far Bins (먼 위치로)
  4. Relocate Fast Movers to Near Bins (가까운 위치로)

목적:
- 피킹 거리 최소화 (Picking Distance Reduction)
- 작업 시간 단축
- 인건비 절감

설정:
- Rearrangement Type: Automated (자동화된 분석)
- Sort Criteria: ABC Analysis (회전율 기반)
- Frequency: Weekly (주간, 토요일 실행)
- Exclude Items: Heavy items, Hazmat (제외 항목)

ABC 분석 예:
- A Items (빠른 회전): 가장 가까운 위치 (1~2미터)
  예: 인기 전자제품
- B Items (중간 회전): 중간 위치 (3~5미터)
  예: 계절 상품
- C Items (느린 회전): 먼 위치 (6+미터)
  예: 특수 부품
```

#### PCHG (Posting Change)

```
프로세스 정의:
- Process Code: PCHG
- Process Name: Posting Change (재고 수정)
- Flow:
  1. System Inventory ≠ Physical Count
  2. Adjustment Task (차이 기록)
  3. Stock Correction (글 수정)
  4. Report (차이 분석)

적용 시나리오:
- 월간/분기별 재고실사 후 차이
- 손상/분실품 발견
- 시스템 오류 (예: 중복 입력)

설정:
- Tolerance Level: ±2% (허용 범위)
- Variance Report: Weekly
- Approval: Required (결재)
- GL Impact: Cost Center별 영향 분석
```

### 4단계: Activity Area 할당 (Activity Area Assignment)

```
T-code: /SCWM/MDEF → Activity Area
```

#### Activity Area 정의

```
Activity Area = 작업 그룹 (작업자/팀 할당)

예시 (한국 제조사):
1. Inbound Team (입하)
   ├─ GR Validation: 2명
   ├─ Quality Check: 1명
   └─ Putaway: 3명 (총 6명)

2. Picking Team (피킹)
   ├─ Picking (Low): 2명
   ├─ Picking (High): 1명
   ├─ Verification: 1명
   └─ Packing: 2명 (총 6명)

3. Replenishment Team (보충)
   ├─ Monitoring: 1명
   └─ Execution: 2명 (총 3명)

4. Rearrangement Team (정렬)
   └─ Execution: 2명 (주말 근무) (총 2명)

총 인원: 17명

T-code: /SCWM/MDEF → Activity Area Assignment
- Process Type: GRPO → Activity Area: 01_INBOUND
- Process Type: GIPO → Activity Area: 02_PICKING
- Process Type: RPLN → Activity Area: 03_REPLENISH
```

### 5단계: Warehouse Order 생성 규칙 (Warehouse Task Creation)

```
T-code: /SCWM/INIT → Warehouse Order Creation Rules
```

#### 자동 vs 수동 생성

```
자동 생성 (Automatic)
- 조건: Sales Order Released
- Trigger: Immediately (즉시)
- 예: GIPO 프로세스 → 자동 Wave 생성
- 장점: 빠른 처리
- 단점: 일괄 처리 어려움

수동 생성 (Manual)
- 조건: 관리자 명령
- Trigger: On Demand (수요 기반)
- 예: GIPO 프로세스 → Wave Release 수동 승인
- 장점: 일괄 처리, 최적화 가능
- 단점: 처리 지연

T-code: /SCWM/INIT 설정:
- GRPO: Automatic (입하는 빨라야 함)
- GIPO: Manual (일괄 파도 처리)
- RPLN: Automatic (백그라운드 작업)
- REAR: Manual (시간이 오래 걸림)
```

## 구성 검증

```
T-code: /SCWM/INIT (Process Type Maintenance)
- 모든 프로세스 타입 확인
- Inbound (GRPO, GRPI) 설정 검증
- Outbound (GIPO, GIPI) 설정 검증
- Internal (RPLN, REAR) 설정 검증

T-code: /SCWM/MONI (Warehouse Monitoring)
- 현재 진행 중인 Task 확인
- Process 통계 (평균 처리 시간)
- Exception (예외 사항) 확인

테스트:
1. 입하 테스트
   - PO 생성 → GR Posting → 자동 Task 생성 확인

2. 출고 테스트
   - SO 생성 → Wave Release → Picking Task 확인

3. 보충 테스트
   - Replenishment Task 자동 생성 확인
```

## 주의사항

### 공통 실수

1. **Process Type과 Activity Area 불일치**
   - 예: GRPO는 정의했으나 Activity Area 할당 안 함
   - 결과: 작업자에게 Task 할당 못함
   - 해결: /SCWM/MDEF에서 Activity Area 필수 할당

2. **Warehouse Task 자동 생성 미설정**
   - 예: GIPO 프로세스 설정 후 Task 생성 규칙 누락
   - 결과: SO 생성 후 피킹 작업 미생성
   - 해결: /SCWM/INIT → Creation Rule 설정

3. **Trigger 조건 오류**
   - 예: Wave 생성을 "Manual Only"로 설정
   - 결과: 자정 자동 Wave 릴리즈 실패
   - 확인: /SCWM/INIT → Trigger Condition 검증

### EWM 특정 주의사항 (S/4HANA)

- Real-time Integration: Process Type 변경 시 즉시 영향 (백그라운드 처리 불가)
- Process 중단 중 변경 금지 (진행 중 Task 혼동)
- Wave 대량 처리 시 성능 테스트 필수

---

**연관 문서**: [적치 전략](putaway-strategy-ewm.md) | [RF 프레임워크](rf-framework.md) | [Wave/Packing](wave-packing.md)
