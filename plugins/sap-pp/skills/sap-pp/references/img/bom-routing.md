# BOM & 라우팅(Bills of Materials & Routings) IMG 구성 가이드

## SPRO 경로
`SPRO → Production Planning and Control (PP) → Master Data → Bills of Materials & Routings`

Primary T-codes: **CS01** (BOM 생성), **CA01** (라우팅 생성), **CA47** (Production Versions)

## 필수 선행 구성
- [ ] 자재 마스터 (MM01)
- [ ] Work Center (CR01)
- [ ] Low-level Code (OMIW)

## 핵심 개념: BOM과 Routing의 역할

```
자재: TEST-PD-001 (최종제품)
├─ BOM (CS01)
│  ├─ 부품 구성 (What to make)
│  ├─ 자재: TEST-RM-001 + TEST-RM-002
│  └─ 수량: 2 EA + 1 EA
│
└─ Routing (CA01)
   ├─ 생산 공정 (How to make it)
   ├─ Operation 1: Cutting (15분)
   ├─ Operation 2: Assembly (30분)
   └─ Operation 3: Testing (10분)
   → 총 55분 (1시간)
```

## 구성 단계

### 1단계: BOM Type 및 Usage 이해

#### BOM Type (STPO-STLTY)

| BOM Type | 코드 | 용도 | 예시 |
|---|---|---|---|
| **Material BOM** | M | 최종 제품 구성 | 완제품 (자동차, 냉장고) |
| **Sales BOM** | Z | 판매 구성품 | 번들 상품 |
| **Configurable BOM** | X | 고객맞춤형 | 커스텀 PC 구성 |
| **Network BOM** | N | 프로젝트 구조 | 건설 프로젝트 |
| **Equipment BOM** | D | 설비 구성 | 기계 부품 리스트 |

**권장: Material BOM(M) — 생산용**

#### BOM Usage (STPO-STLAL)

| Usage | 번호 | 용도 | 선택 | 
|---|---|---|---|
| **Production** | 1 | 생산오더(CO01) 기본 | ✓ |
| **Engineering** | 2 | 설계 문서 | ☐ |
| **Sales** | 3 | 판매 카탈로그 | ☐ |
| **Costing** | 4 | 원가계산용 | ✓ |
| **Inspection** | 5 | QM 검사 대상 | ☐ |
| **Spare Parts** | 6 | 부품 구성표 | ☐ |

**권장: Usage 1(생산) + Usage 4(원가) 설정**

### 2단계: BOM 생성 (CS01)

T-code: **CS01** (Create Bill of Material)

```
화면:
┌─────────────────────────────────┐
│ Create Bill of Material         │
├─────────────────────────────────┤
│ Material: TEST-PD-001           │
│ Plant: 1000 (Berlin)            │
│ BOM Type: M (Material)          │
│ BOM Usage: 1 (Production)       │
│                                 │
│ Header Data:                    │
│ ├─ BOM Number: (자동)           │
│ ├─ Valid From: 2026-01-01       │
│ ├─ Valid To: 2026-12-31         │
│ ├─ Status: 1(Active)            │
│ ├─ Engineering Change #: (선택) │
│ └─ Description: "Assembly BOM"  │
│                                 │
│ BOM Items (부품 목록):          │
│ ├─ Item 1:                      │
│ │  ├─ Material: TEST-RM-001     │
│ │  ├─ Qty: 2 EA                 │
│ │  ├─ Unit: EA                  │
│ │  ├─ Component Scrap (%): 5%   │
│ │  ├─ Lead Time: 3 days         │
│ │  └─ Supplier: SUPP-001        │
│ │                               │
│ ├─ Item 2:                      │
│ │  ├─ Material: TEST-RM-002     │
│ │  ├─ Qty: 1 EA                 │
│ │  ├─ Unit: EA                  │
│ │  ├─ Component Scrap: 0%       │
│ │  └─ Lead Time: 2 days         │
│ │                               │
│ └─ Item 3:                      │
│    ├─ Material: TEST-RM-003     │
│    ├─ Qty: 10 ML (packaging)    │
│    ├─ Unit: ML                  │
│    ├─ Lead Time: 1 day          │
│    └─ (Packaging/Label material)│
│                                 │
│ [ Create ] → BOM #00001         │
└─────────────────────────────────┘
```

#### CS01 상세 설정 — 항목(Item) 레벨

**Item 1: 주요부품**

```
Item 100: TEST-RM-001 (원자재)
├─ Item Number: 100 (순서)
├─ Material: TEST-RM-001
├─ Qty Per Unit (기본수량): 2 EA
│  └─ 최종제품 1개 = 부품 2개 필요
├─ Unit: EA
├─ Component Scrap (%): 5%
│  └─ 손실율 5% → MRP 시 106.25개 주문
├─ Lead Time: 3 days
│  └─ BOM-Routing: 3일 전 주문
├─ Supplier: SUPP-001 (선호 공급자)
├─ Validity:
│  ├─ Valid From: 2026-01-01
│  └─ Valid To: 2026-12-31
├─ Alternative Material: (선택)
│  ├─ TEST-RM-001A (대체부품)
│  └─ Qty: 2 EA (동일)
└─ Document Information:
   ├─ Reference Document: (설계도면)
   └─ Remark: "Core component"
```

**Item 2: 소량부품**

```
Item 200: TEST-RM-002 (소부품)
├─ Material: TEST-RM-002
├─ Qty Per Unit: 1 EA
├─ Unit: EA
├─ Component Scrap: 0% (정확)
├─ Lead Time: 2 days
└─ Supplier: SUPP-002
```

**Item 3: Packaging (선택항목)**

```
Item 300: TEST-RM-003 (포장재)
├─ Material: TEST-RM-003
├─ Qty Per Unit: 10 ML
├─ Unit: ML (밀리리터 — 액체)
├─ Component Scrap: 2%
├─ Lead Time: 1 day
├─ Item Type: ☐ (기본 부품)
│              ☑ (Packaging/Label)
│              ☐ (Byproduct)
└─ (포장은 자동 추출용)
```

### 3단계: 라우팅 생성 (CA01)

T-code: **CA01** (Create Routing)

```
화면:
┌─────────────────────────────────┐
│ Create Routing                  │
├─────────────────────────────────┤
│ Material: TEST-PD-001           │
│ Plant: 1000                     │
│ Routing Type: N (Normal)        │
│                                 │
│ Header:                         │
│ ├─ Routing Number: (자동)       │
│ ├─ Valid From: 2026-01-01       │
│ ├─ Valid To: 2026-12-31         │
│ ├─ Status: Active               │
│ └─ Lot Size Range:              │
│    └─ From 1 to 999999 EA       │
│                                 │
│ Operations:                     │
│ ├─ Op 10: Cutting              │
│ │  ├─ Work Center: WC-101      │
│ │  ├─ Control Key: PP01        │
│ │  ├─ Description: "Cutting"   │
│ │  ├─ Std Time (minutes): 15   │
│ │  ├─ Machine Time: 10         │
│ │  └─ Labor Time: 5            │
│ │                               │
│ ├─ Op 20: Assembly             │
│ │  ├─ Work Center: WC-102      │
│ │  ├─ Control Key: PP01        │
│ │  ├─ Description: "Assemble"  │
│ │  ├─ Std Time: 30 minutes     │
│ │  ├─ Machine Time: 0 (수작업) │
│ │  └─ Labor Time: 30           │
│ │                               │
│ └─ Op 30: Testing              │
│    ├─ Work Center: WC-103      │
│    ├─ Control Key: PP01        │
│    ├─ Description: "QC Test"   │
│    ├─ Std Time: 10 minutes     │
│    └─ Labor Time: 10           │
│                                 │
│ [ Create ] → Routing #00002    │
└─────────────────────────────────┘
```

#### CA01 상세 설정 — Operation 레벨

**Operation 10: Cutting**

```
Sequence: 10 (선행순서)
├─ Work Center: WC-101
│  ├─ Category: 001 (Machine)
│  ├─ Capacity: 480 minutes/day
│  └─ Shift: 2 shifts (16시간)
├─ Control Key: PP01 (자체 생산)
├─ Description: "Cutting Machine"
├─ Standard Times:
│  ├─ Setup (사전준비): 5 minutes
│  │  └─ 라인 초기화 한 번만
│  ├─ Process Time (단위당): 10 minutes
│  │  └─ 1개 제품당 10분
│  ├─ Teardown (정소): 2 minutes
│  │  └─ 작업 후 정리
│  └─ Total per Batch (100 EA):
│     = 5 + (100 × 10) + 2 = 1007 minutes
│
├─ Inspection (검사):
│  ├─ Inspection Type: Standard
│  └─ (QM 통합 시 자동)
│
├─ Printing:
│  ├─ Print Routing: ☑ (작업지시서)
│  └─ Work Instructions: Auto-generate
│
└─ Capacity Requirement:
   ├─ Auto-calc: ☑
   └─ Bottleneck: ☐ (병목공정 아님)
```

**Operation 20: Assembly**

```
Sequence: 20 (Cutting 다음)
├─ Work Center: WC-102
│  ├─ Category: 002 (Labor)
│  ├─ Available Workers: 5명
│  └─ Shift: 1 shift (8시간)
├─ Control Key: PP01
├─ Description: "Manual Assembly"
├─ Standard Times:
│  ├─ Setup: 0 minutes (없음)
│  ├─ Process Time: 30 minutes/unit
│  └─ Teardown: 0 minutes
│
├─ Labor Assignment:
│  ├─ Worker Class: Semi-skilled
│  ├─ Hourly Rate: 25 EUR
│  └─ (Cost Collection: 자동)
│
└─ Dependent on Prior Op:
   ├─ Op 10 (Cutting)은 100% 완료
   ├─ 병렬 불가능 (Sequential)
   └─ Start: Op 10 완료 다음 날
```

**Operation 30: Testing (외주)**

```
Sequence: 30 (마지막)
├─ Work Center: WC-EXT-001 (외주사)
│  ├─ Category: Subcontractor
│  ├─ Location: External Lab
│  └─ (배송 필요)
├─ Control Key: F (External Processing)
│  └─ (PO 자동생성, 배송 → 외주비)
├─ Description: "Third-party QC Lab"
├─ Standard Times:
│  ├─ Lead Time: 5 days
│  │  └─ 외주사 회송 포함
│  ├─ Processing: 120 minutes (Lab)
│  └─ Transport: 2 days (Courier)
│
├─ Subcontractor:
│  ├─ Supplier: TEST-LAB-001
│  ├─ Cost per Unit: 8 EUR
│  └─ PO Auto-create: ☑
│
├─ Quality Gate:
│  ├─ Mandatory Inspection: ☑
│  ├─ QM Inspection Plan: Q001
│  └─ Pass/Fail: Blocks SO receipt
│
└─ Scheduling:
   ├─ Start: Op 20 완료 + 1 day
   └─ Finish: 배송 + 처리
```

### 4단계: Production Versions (CA47) — Lot-Size-Dependent BOM/Routing

T-code: **CA47** (Create Production Version)

복수의 BOM/Routing을 로트 크기별로 관리:

```
Material: TEST-PD-001

Version 1: Small Batch (1~50 EA)
├─ BOM: #00001 (기본)
├─ Routing: #00002 (기본)
├─ Valid Qty: From 1 To 50
└─ (표준 부품, 표준 공정)

Version 2: Medium Batch (51~500 EA)
├─ BOM: #00001-A (일부 부품 변경)
│  └─ TEST-RM-002 (원가 낮은 대체품)
├─ Routing: #00002-A (병렬 조립 가능)
│  └─ Op 20 Parallel with Op 10
├─ Valid Qty: From 51 To 500
└─ (대량 할인 부품 사용)

Version 3: Large Batch (501~999999 EA)
├─ BOM: #00001-B (전자동 부품)
│  └─ TEST-RM-002-AUTO (자동화용)
├─ Routing: #00002-B (자동화 공정)
│  ├─ Op 10: Automatic Cutting Machine
│  ├─ Op 20: Robotic Assembly
│  ├─ Op 30: Automated Test
│  └─ Std Time: 5 minutes (극도로 감소)
├─ Valid Qty: From 501 To 999999
└─ (자동화 라인, 낮은 단가)

MRP/CO01 동작:
├─ Demand Qty: 300 EA
├─ MD01/CO01에서 자동으로 Version 2 선택
└─ BOM #00001-A + Routing #00002-A 적용
```

## Low-Level Code 재계산 (OMIW) — 필수!

T-code: **OMIW** (Recalculate Low-Level Codes)

```
시나리오:
자재계층:
├─ Level 0: TEST-PD-001 (최종제품)
├─ Level 1: TEST-RM-001, TEST-RM-002
├─ Level 2: (없음)
└─ Level 3: (없음)

BOM 변경: TEST-RM-001이 TEST-PD-001의 부품에서 → TEST-RM-002의 부품으로 변경

변경 후:
├─ Level 0: TEST-PD-001 (최종제품)
├─ Level 1: TEST-RM-002
├─ Level 2: TEST-RM-001 ← 레벨 상향 (자동 재계산 필요)
└─ Level 3: (없음)

OMIW 실행:
└─ System recalculates all low-level codes
   ├─ Before: TEST-RM-001 = Level 1
   ├─ After: TEST-RM-001 = Level 2 ✓
   └─ MRP 순서: TEST-RM-002 먼저 → TEST-RM-001 나중
```

**OMIW 실행 방법:**

```
T-code: OMIW
├─ Plant: 1000
├─ [Execute]
│
└─ Result:
   ├─ Materials Updated: 3개
   ├─ Low-level Codes Recalculated: OK ✓
   └─ Log: (파일 저장 가능)
```

## 구성 검증

### 검증 1: CS01에서 BOM 확인
```
T-code: CS01 → Display Mode
├─ Material: TEST-PD-001
├─ Plant: 1000
├─ BOM Type: M ✓
├─ BOM Usage: 1 (Production) ✓
├─ Valid From: 2026-01-01 ✓
│
└─ Items:
   ├─ Item 100: TEST-RM-001, Qty 2 ✓
   ├─ Item 200: TEST-RM-002, Qty 1 ✓
   └─ Item 300: TEST-RM-003, Qty 10 ML ✓
```

### 검증 2: CA01에서 Routing 확인
```
T-code: CA01 → Display Mode
├─ Material: TEST-PD-001
├─ Plant: 1000
│
└─ Operations:
   ├─ Op 10: Cutting (WC-101) ✓
   │  ├─ Std Time: 15 min ✓
   │  └─ Setup: 5 min ✓
   ├─ Op 20: Assembly (WC-102) ✓
   │  ├─ Std Time: 30 min ✓
   │  └─ Labor: 30 min ✓
   └─ Op 30: Testing (WC-EXT) ✓
      ├─ Control Key: F (외주) ✓
      └─ Lead Time: 5 days ✓
```

### 검증 3: OMIW 재계산
```
T-code: OMIW
├─ Plant: 1000
├─ [Execute]
│
└─ Result:
   ├─ Low-level codes calculated ✓
   └─ Log: (검토)
      ├─ TEST-PD-001: Level 0 ✓
      ├─ TEST-RM-001: Level 1 ✓
      ├─ TEST-RM-002: Level 1 ✓
      └─ TEST-RM-003: Level 1 ✓
```

### 검증 4: 생산오더로 테스트 (CO01)
```
T-code: CO01 (Create Production Order)
├─ Order Type: PP01
├─ Material: TEST-PD-001
├─ Qty: 100 EA
├─ [Create]
│
└─ System:
   ├─ BOM 자동 로드: ✓
   │  ├─ TEST-RM-001: 200 EA
   │  ├─ TEST-RM-002: 100 EA
   │  └─ TEST-RM-003: 1000 ML
   ├─ Routing 자동 로드: ✓
   │  ├─ Op 10~30 모두 포함
   │  └─ Standard Times 계산: 55 minutes/unit
   └─ Capacity Requirement: ✓
      └─ WC-101, 102, EXT의 자동 할당
```

## 주의사항

### 1. BOM 없이 Routing만 존재 → MRP 혼란
**문제**: Routing #00002는 생성했으나 BOM #00001 누락
```
결과: MD01 실행 → 부품 주문 정보 없음 → 자재 계획 불가능
```
**해결**: BOM과 Routing은 항상 쌍으로 생성

### 2. Component Scrap 미설정 → 원가 오류
**문제**: BOM Item에서 Component Scrap = 0% (손실 무시)
```
결과: MRP 계획 200 EA, 실제 배송 189 EA (5% 손실)
      → 부품 부족
```
**해결**: Component Scrap을 현실적으로 설정 (보통 2~10%)

### 3. Low-level Code 미재계산 → MRP 순서 오류
**문제**: BOM 변경 후 OMIW 미실행
```
결과: MD01 → TEST-RM-001이 TEST-RM-002보다 먼저 주문
      (사실은 역순이어야 함) → 일정 틀림
```
**해결**: 매 BOM/Routing 변경 후 반드시 OMIW 실행

### 4. Control Key F(외주)를 CR01 Work Center가 아닌 자료로 설정
**문제**: Op 30에서 Control Key = F, 하지만 WC-EXT-001이 외주 Work Center 아님
```
결과: CO01에서 외주 PO 미자동생성 → 수동 발주 필요
```
**해결**: CA01 Op 30 Control Key = F + CR01에서 WC-EXT-001을 외주로 분류

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| BOM 저장 | MFHH(Header) + STPO(Item) | BILLOFMATERIAL(통합) |
| Routing | PLKO(Header) + PLPO(Op) | ROUTING(통합) |
| Production Version | CA47 | CA47 (강화) |
| Low-level Code | OMIW 수동 | OMIW (동일, 선택적) |
| BOM Variants | 수동 생성 | AI 자동 생성 (향후) |
| 3D Visualization | 없음 | (Add-on 가능) |

## 참고 자료

- **SAP 공식**: IMG → PP → Master Data → BOM & Routing
- **T-codes**: CS01(BOM), CA01(Routing), CA47(Version), OMIW(Low-level)
- **심화**: CK11N(원가계산), CO01(생산오더)
