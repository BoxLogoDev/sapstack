# 생산오더유형(Production Order Type) IMG 구성 가이드

## SPRO 경로
`SPRO → Production Planning and Control (PP) → Production Orders → Production Order Type`

Primary T-codes: **OPL8** (생산오더유형 정의), **OPL7** (번호범위), **OPU1** (확인프로파일)

## 필수 선행 구성
- [ ] 문서유형 번호범위 (OPL7)
- [ ] 이동유형 (OMJJ) — 생산 GR(Movement Type 101)
- [ ] Work Center (CR01)

## 핵심 개념: Production Order Type 3가지

```
Production Order Type Selection:
├─ PP01: Discrete Manufacturing (표준 생산)
│  ├─ 일회성 주문 생산
│  ├─ 원자재 → 반제품 → 완제품
│  └─ 원가계산: 실제원가 기준
├─ PP02: Rework/Retest (재작업)
│  ├─ 부정합 제품 처리
│  ├─ 검사 재실행
│  └─ Original Order 참조
└─ PP03: Process Manufacturing (공정 생산)
   ├─ 대량 연속 생산
   ├─ 화학/식품/제약
   └─ 원가: 공정 평균원가
```

## 구성 단계

### 1단계: Production Order Type 정의 (OPL8)

T-code: **OPL8** (Define Production Order Types)

```
화면:
┌────────────────────────────────────┐
│ Production Order Type Maintenance  │
├────────────────────────────────────┤
│ Order Type: PP01                   │
│ Description: "Discrete Production" │
├────────────────────────────────────┤
│ Basic Data:                        │
│ ├─ Order Type (코드): PP01         │
│ ├─ Name: "Standard Production"     │
│ ├─ Document Category: 1(Production)│
│ ├─ Number Range: 1000000~1999999  │
│ └─ Description: "일반 생산오더"    │
│                                    │
│ Costing/Variance:                  │
│ ├─ Actual Costing: ☑               │
│ │  (실제 투입액 기반)              │
│ ├─ Standard Costing: ☐             │
│ └─ Cost Collection:               │
│    └─ Cost Element per Item       │
│                                    │
│ Confirmation:                      │
│ ├─ Confirmation Profile: 1         │
│ │  (CO11N 확인 설정)              │
│ ├─ Partial Confirmation: ☑         │
│ │  (진행 중 부분 확인 가능)        │
│ └─ Backflushing:                  │
│    ├─ Enabled: ☐ (비활성)         │
│    └─ (자재 자동공제)             │
│                                    │
│ GR Posting:                        │
│ ├─ Goods Receipt Posting: Auto    │
│ ├─ Movement Type: 101 (PO GR)     │
│ └─ Goods Issue Movement: 201      │
│    (부제품 처리용)                │
│                                    │
│ Goods Issue:                       │
│ ├─ Manual GI: ☑                   │
│ │  (BOM 계획이 아닌 수동)         │
│ └─ Backflushing: ☐                │
│    (자재 자동 공제)               │
└────────────────────────────────────┘
```

#### OPL8 상세 설정 — PP01 (표준 생산)

```
Order Type Code: PP01
├─ Identification:
│  ├─ Order Type: PP01
│  ├─ Description: "Standard Manufacturing"
│  └─ Order Type Text: "표준 생산오더"
│
├─ Number Range Assignment (OPL7과 연계):
│  └─ Number Range: 01 (1000000~1999999)
│
├─ Costing:
│  ├─ Costing Variant: STANDARD (표준)
│  │  └─ Actual costs tracked per order
│  ├─ Costs Incurred:
│  │  ├─ Material Costs (BOM based)
│  │  ├─ Labor Costs (Routing based)
│  │  ├─ Machine Costs (Work Center Overhead)
│  │  └─ External Processing (Subcontracting)
│  └─ Variance Analysis:
│     ├─ Material Usage Variance
│     ├─ Labor Efficiency Variance
│     └─ Overhead Spending Variance
│
├─ Confirmation:
│  ├─ Confirmation Profile: PROD_CONF(CO11N)
│  │  └─ Defines which fields require input
│  ├─ Partial Confirmation: ✓ (권장)
│  │  ├─ Example: 50% 완료 → 중간 확인
│  │  └─ GR 부분기록, WIP 유지
│  ├─ Backflushing: ☐ (비활성)
│  │  └─ 수동 GI로 자재 공제 (더 정확)
│  └─ Automatic GI: ☐
│     (확인 시 BOM 자동 공제 — 스킵)
│
├─ Goods Receipt:
│  ├─ Auto GR Posting: ☑ (확인 시 자동 입고)
│  ├─ Movement Type: 101 (생산 입고)
│  ├─ GR Account Determination:
│  │  └─ OBVB(계정결정) 자동 조회
│  └─ Stock Type Target:
│     ├─ Unrestricted (자유사용)
│     ├─ Quality Insp. (검사대기)
│     └─ Blocked (차단)
│
├─ Goods Issue:
│  ├─ Manual GI: ☑ (필수)
│  │  └─ MIGO with Order Reference
│  ├─ Backflush Option: ☐ (미사용)
│  │  └─ BOM 기준 자동공제 (구식)
│  └─ Alternative:
│     ├─ BOM으로부터 자동계산
│     └─ 확인(CO11N) 시 적용
│
└─ Special Settings:
   ├─ Rework Type: ☐
   ├─ Process Order: ☐ (PP03용)
   └─ Order Category: "Standard"
```

#### OPL8 설정 — PP02 (재작업)

```
Order Type Code: PP02
├─ Description: "Rework Order"
├─ Number Range: 02 (2000000~2999999)
│
├─ Special Features:
│  ├─ Reference to Original Order:
│  │  ├─ Link to Original PO: Mandatory
│  │  ├─ Example: Rework PO #2000001 → Ref PO #1000234
│  │  └─ Original materials 추적
│  │
│  ├─ Costing:
│  │  ├─ Additional Costs Only (추가원가만)
│  │  ├─ Original Material Cost: 기존 유지
│  │  └─ Rework Labor + Overhead: 신규 계산
│  │
│  ├─ Quality Gate:
│  │  ├─ Mandatory Inspection: ☑
│  │  ├─ QM Inspection Plan: C001 (재검사)
│  │  └─ Pass/Fail Result → Original or Scrap
│  │
│  └─ Status Management:
│     ├─ Original PO Status: "Rework in Progress"
│     └─ Rework PO Status: "Open"
│
└─ Number Range Assignment (OPL7):
   └─ Range 02: 2000000~2999999
```

#### OPL8 설정 — PP03 (공정 생산, 화학/식품)

```
Order Type Code: PP03
├─ Description: "Process Order"
├─ Number Range: 03 (3000000~3999999)
│
├─ Process Specific:
│  ├─ Document Type: Process Order (PP docs)
│  ├─ BOM Type: Process BOM (다중 Co-products)
│  │  ├─ Example: 1T 우유 → Cream 200kg + Whey 800kg
│  │  └─ Recipe 기반
│  │
│  ├─ Routing:
│  │  ├─ Operations per Phase
│  │  ├─ Setup Time (사전준비)
│  │  ├─ Processing Time (가열/혼합/냉각)
│  │  └─ Cleanup Time (정소)
│  │
│  ├─ By-products Handling:
│  │  ├─ Co-products (부산물)
│  │  ├─ Co-product Yield Calc
│  │  └─ Value Allocation
│  │
│  ├─ Capacity Planning:
│  │  ├─ Batch Size: 1000L (최대 1회 용량)
│  │  ├─ Lead Time: 2.5 days
│  │  └─ Lot Sizing: FX (고정량)
│  │
│  └─ Costing:
│     ├─ Process Cost (공정비 평균)
│     ├─ Joint Cost Allocation (부산물 배분)
│     └─ Yield Variance (수율차이)
│
└─ Backflushing: ☑ (필수)
   └─ 자재는 수율 기준 자동 공제
```

### 2단계: 번호범위 정의 (OPL7)

T-code: **OPL7** (Number Ranges for Production Orders)

```
화면:
┌────────────────────────────────────┐
│ Production Order Number Ranges      │
├────────────────────────────────────┤
│ Range Object: AUFNR (Order Type)   │
│                                    │
│ Range 01: (PP01 — Standard)        │
│ ├─ From: 1000000                   │
│ ├─ To: 1999999                     │
│ ├─ Current: 1000567 (마지막 발번) │
│ └─ Interval: 1                     │
│                                    │
│ Range 02: (PP02 — Rework)          │
│ ├─ From: 2000000                   │
│ ├─ To: 2999999                     │
│ ├─ Current: 2000034                │
│ └─ Interval: 1                     │
│                                    │
│ Range 03: (PP03 — Process)         │
│ ├─ From: 3000000                   │
│ ├─ To: 3999999                     │
│ ├─ Current: 3000000                │
│ └─ Interval: 1                     │
│                                    │
│ Range 04: (Special Orders)         │
│ ├─ From: 4000000                   │
│ ├─ To: 4999999                     │
│ └─ Current: 4000000                │
└────────────────────────────────────┘
```

### 3단계: 확인프로파일(Confirmation Profile) 정의 (OPU1)

T-code: **OPU1** (Confirmation Profile)

```
화면:
┌────────────────────────────────────┐
│ Confirmation Profile Maintenance   │
├────────────────────────────────────┤
│ Profile: PROD_CONF                 │
│ Description: "Production Order Conf"
│                                    │
│ Screen Sequence:                   │
│ ├─ Screen 1 (Header):              │
│ │  ├─ Order Number (자동): Required
│ │  ├─ Material (read-only)         │
│ │  ├─ Actual Start Date: Required  │
│ │  ├─ Actual Finish Date: Required │
│ │  └─ Status: (읽기 전용)          │
│ │                                  │
│ ├─ Screen 2 (Item-level):          │
│ │  ├─ Good Quantity: Required      │
│ │  ├─ Scrap Quantity: Optional     │
│ │  ├─ Rework Quantity: Optional    │
│ │  └─ Total Confirmation Qty       │
│ │                                  │
│ ├─ Screen 3 (Activity — Time):     │
│ │  ├─ Actual Work: Required        │
│ │  ├─ Setup Time: Optional         │
│ │  ├─ Machine Time: Optional       │
│ │  └─ Rework Time: Optional        │
│ │                                  │
│ └─ Screen 4 (Goods Issue):         │
│    ├─ Backflush Option: Yes/No     │
│    ├─ Manual GI Components: List   │
│    └─ Goods Receipt: (CO11N check) │
│                                    │
│ Profile Variant: DEFAULT           │
│ └─ (동일 프로파일을 모든 PP01에 적용)
└────────────────────────────────────┘
```

### 4단계: 제어키(Control Key) 설정 (라우팅과 연계)

T-code: **CA01** (Create Routing) 시 "Control Key" 선택

```
라우팅: TEST-PD-001

Operation:
├─ Op 10: Cutting
│  ├─ Work Center: WC-101 (Machine)
│  ├─ Control Key: PP01 ← In-house Production
│  ├─ Std Time: 15 minutes
│  └─ Machine Hours: 10 minutes
│
├─ Op 20: Assembly
│  ├─ Work Center: WC-102 (Labor)
│  ├─ Control Key: PP01 (자제)
│  ├─ Std Time: 30 minutes
│  └─ Machine Hours: 0 (수작업)
│
└─ Op 30: Coating (외주)
   ├─ Work Center: WC-XXX (외주사)
   ├─ Control Key: F ← External Proc/Subcontracting
   ├─ Std Time: 120 minutes
   └─ (외주사에 배송 → 비용: PO로 처리)
```

**Control Key 의미:**
```
PP01: In-house Production (자체 생산)
F: External Processing (외주)
```

## 구성 검증

### 검증 1: OPL8에서 Order Type 확인
```
T-code: OPL8 → Display Mode
├─ Order Type PP01: "Discrete Production" ✓
│  ├─ Number Range: 01 ✓
│  ├─ Confirmation Profile: PROD_CONF ✓
│  ├─ Auto GR: Yes ✓
│  ├─ Movement Type 101: Yes ✓
│  └─ Backflushing: No ✓
├─ Order Type PP02: "Rework" ✓
│  ├─ Number Range: 02 ✓
│  └─ Reference to Original: Required ✓
└─ Order Type PP03: "Process" ✓
   ├─ Number Range: 03 ✓
   └─ Backflushing: Yes ✓
```

### 검증 2: OPL7 번호범위 확인
```
T-code: OPL7 → Display Mode
├─ Range 01 (PP01): 1000000~1999999 ✓
├─ Range 02 (PP02): 2000000~2999999 ✓
├─ Range 03 (PP03): 3000000~3999999 ✓
└─ Current Issue Numbers:
   ├─ PP01: 1000567 ✓
   ├─ PP02: 2000034 ✓
   └─ PP03: 3000001 ✓
```

### 검증 3: OPU1 확인프로파일 확인
```
T-code: OPU1 → Display Mode
├─ Profile: PROD_CONF ✓
├─ Screen 1 (Header): Actual Dates Required ✓
├─ Screen 2 (Qty): Good/Scrap/Rework ✓
├─ Screen 3 (Activity): Time Tracking ✓
└─ Screen 4 (GI): Backflush Option ✓
```

### 검증 4: 실제 생산오더 생성 (CO01)
```
T-code: CO01 (Create Production Order)
├─ Order Type: PP01 ✓
├─ Material: TEST-PD-001
├─ Qty: 100 EA
├─ [Create]
│
└─ System:
   ├─ Order Number: 1000568 (OPL7에서 자동) ✓
   ├─ BOM 자동 로드
   ├─ Routing 자동 로드
   ├─ Capacity Requirement 계산
   └─ [Save] → Status: "Created"

다음: CO02 (Release Production Order)
├─ [Release] → Status: "Released"
└─ 실제 생산 시작 가능
```

### 검증 5: 확인 작업 (CO11N)
```
T-code: CO11N (Confirmation)
├─ Order: 1000568 (선택)
├─ Confirmation Profile: PROD_CONF (자동)
│
└─ Entry:
   ├─ Actual Finish Date: 2026-04-15
   ├─ Good Quantity: 95 EA (불량 5)
   ├─ Scrap Quantity: 5 EA
   ├─ Activity (Labor):
   │  └─ Actual Work: 420 minutes (계획 350)
   │     → Variance: +70 minutes (비효율)
   ├─ [Post] ✓
   │
   └─ System:
      ├─ Order Status: "Partially Completed"
      ├─ Stock Movement (GR): 95 EA 입고
      │  └─ GL 101300 (FG Inventory)
      ├─ Labor Cost Accrual: 계산
      └─ Variance: 420 vs 350 분 분석
```

## 주의사항

### 1. Confirmation Profile 미설정 → CO11N 실패
**문제**: OPL8에서 PP01 생성 후 Confirmation Profile 미할당
```
결과: CO11N 확인 → 화면 표시 오류 → 입력 불가능
```
**해결**: OPU1 → Profile 정의 후 OPL8의 "Confirmation Profile" 필드에 할당

### 2. 번호범위 소진 → Order Type 재정의 불가
**문제**: OPL7에서 Range 01 = 1000000~1999999, 이미 1999998 발번
```
결과: 다음 오더 생성 시 번호 오버플로우 → 오류
```
**해결**: 미리 OPL7을 수정하여 상한선 증가 (예: 1000000~9999999)

### 3. 자동 GR Posting 비활성 → 수동 작업 증가
**문제**: OPL8에서 "Auto GR Posting: No"
```
결과: CO11N 확인 후 따로 MIGO(GI) + MB01(GR) 수동 작업 필요
```
**해결**: OPL8 → "Auto GR Posting: Yes" (권장, MIGO 한 번만)

### 4. Backflushing 오사용 → 자재 이중공제
**문제**: OPL8에서 "Backflushing: Yes" + MIGO에서도 수동 GI
```
결과: BOM 자재가 2번 공제됨 → 음수 재고 오류
```
**해결**: Backflushing은 ON or OFF 중 선택 (보통 OFF, 수동 정확도 우선)

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| Order Type | OPL8 고정 | 동일 (유연성 증가) |
| Confirmation | CO11N | CO11N + Mobile App |
| Backflush | 수동 옵션 | 자동화 (향후) |
| Costing | Actual | Actual + Standard Hybrid |
| Process Order | PP03 별도 | 통합 프로세스 |
| Smart Manufacturing | 없음 | IoT 센서 연동 (향후) |

## 참고 자료

- **SAP 공식**: IMG → PP → Production Orders
- **T-codes**: OPL8(유형), OPL7(번호범위), OPU1(프로파일), CO01(생성), CO11N(확인)
- **심화**: CA01(라우팅), CS01(BOM), CM01(용량계획)
