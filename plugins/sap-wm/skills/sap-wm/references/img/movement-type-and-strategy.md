# WM 이동유형 & 입출고 전략 구성 가이드

## SPRO 경로
```
SPRO → Logistics Execution → Warehouse Management
├── Movement Type (이동유형)
│   ├── Define Movement Type (SPRO)
│   └── 2-Step Movement: GR → Storage
├── Putaway Strategy (적치 전략)
│   ├── Fixed Bin
│   ├── Open Storage
│   └── Based on Material Class
└── Picking Strategy (피킹 전략)
    ├── FIFO / LIFO
    ├── By Quantity (Large/Small)
    └── By Zone (Aisle-based)
```

## 필수 선행 구성
- [ ] Warehouse, Storage Type, Bin 정의 완료
- [ ] Material Master (Movement Type Indicator)
- [ ] Plant-Warehouse Assignment

## 구성 단계

### 1단계: WM 이동유형 정의

**T-code: SPRO > Logistics Execution > Warehouse Management > Movement Type**

MM(자재관리) 이동유형과 WM 이동유형을 연계합니다.

#### 예시: 입고(GR) 이동유형 매핑

```
MM Movement Type: 101 (Goods Receipt)
└─→ 자동으로 WM 2-Step Movement 생성:

Step 1: GR Post → Inbound Staging (ST 010)
├── System: MM01 입고 처리
├── Stock: 검사 스톡 또는 Q-Stock
└─→ Storage Bin: 010-01-01-01 (입고 존 기본 위치)

Step 2: Putaway Task 자동 생성
├── System: WM에서 자동 발생
├── Task: "Move from Inbound → Storage (001)"
├── Putaway Strategy: 자재 특성에 따라 자동 배치
└─→ Storage Bin: 001-A-01-01-01-01 (고정 bin) 또는 002-001-005 (개방 영역)
```

### 2단계: 적치 전략 (Putaway Strategy) 정의

**T-code: SPRO > WM → Putaway Strategy**

#### 전략 1: 고정 빈 (Fixed Bin)

```
Strategy Code: FIXED-ONLY

Rules:
├── Inbound Material: BEARING-NSK
│   ├── Fixed Bin Assignment: 001-A-05-02-03-01
│   ├── Max Qty: 500 pcs (Shelf capacity)
│   └── Always use same bin (같은 위치만 사용)
├── IF Fixed Bin Full → Error (다른 자재 혼합 불가)
└── Use Case: 고가 부품, 추적 필수 자재
```

#### 전략 2: 개방 저장소 (Open Storage)

```
Strategy Code: OPEN-BULK

Rules:
├── Inbound Material: PLASTIC-SHEET
│   ├── Storage Type: 002 (Open)
│   ├── Bin Selection: Next Empty Bin (자동)
│   ├── Mix Allowed: ✅ (같은 자재는 혼합 가능)
│   └── Zone-based: A Zone (원재료 영역)
├── IF Zone Full → Overflow to B Zone
└── Use Case: 대량 구매, 가격 민감 자재
```

#### 전략 3: 추가 및 새 빈 (Addition to Existing, Next Empty)

```
Strategy Code: SMART-PLACEMENT

Rules:
├── IF Material already in Bin X with stock < Max capacity
│   └─→ Add to Bin X (같은 빈에 추가)
├── ELSE IF No Bin with Material Y
│   └─→ Allocate New Bin (새 빈 할당)
├── Priority: Minimize bin usage (빈 개수 최소화)
└── Use Case: 중간 가격, 회전율 높은 자재
```

### 3단계: 피킹 전략 (Picking Strategy) 정의

**T-code: SPRO > WM → Picking Strategy**

#### 전략 1: FIFO (First In, First Out)

```
Strategy Code: FIFO-STANDARD

Rules:
├── Material: BEARING-NSK (유통기한 있음)
├── Picking Order: Oldest Batch First
│   ├── Batch 2024-01: 200 pcs (1월 입고)
│   ├── Batch 2024-02: 150 pcs (2월 입고)
│   └─→ 1월 배치 먼저 출고
├── Bin Selection: 자동 (FIFO 순서)
└── Use Case: 식품, 의약품, 유통기한 관리 필수
```

#### 전략 2: LIFO (Last In, First Out)

```
Strategy Code: LIFO-LIQUIDATION

Rules:
├── Material: SEASONAL-PRODUCT (계절 상품)
├── Picking Order: Newest Batch First
├── Purpose: 재고 회전율 개선
└── Use Case: 가공식품, 온도 민감 제품
```

#### 전략 3: Large/Small 수량 분리

```
Strategy Code: LARGE-SMALL-SPLIT

Rules:
├── Large Qty Picking (≥ 100 pcs):
│   ├── Bin Selection: Bulk Area (ST 002)
│   └── Pick all from one bin (효율성)
├── Small Qty Picking (< 100 pcs):
│   ├── Bin Selection: Shelf Bins (ST 001)
│   └── Multiple bins allowed (조각 사용)
└── Use Case: 제조, 부품 조립
```

#### 전략 4: Zone-based Picking (Aisle-based)

```
Strategy Code: ZONE-BASED

Rules:
├── Zone A (Origin Materials): Picking Routes A1, A2, A3
├── Zone B (Components): Picking Routes B1, B2
├── Zone C (Finished Goods): Picking Route C1
└─→ Picking Task 순서: A → B → C (최적 동선)

Benefits:
├── 작업자 이동 거리 최소화
├── Picking time 30% 감소
└── Error rate 감소
```

## 구성 검증

**T-code: LT01** (Display/Change Transfer Requirement)

```
테스트 1: GR 입고 시 2-Step Movement
├── MIGO: 입고 처리 (MM)
├── Auto-create: Inbound Staging Task (WM)
└─→ LS14 (Putaway List) 확인 ✅

테스트 2: Putaway Task 확인
├── T-code: LS10 (Bin Display)
├── Inbound Bin (010): GR 수량 확인
├── Fixed Bin (001): 아직 0 (putaway 미완료)
└─→ LS14에서 putaway 실행 후 확인

테스트 3: Picking 자동화
├── SO (판매오더) 생성
├── Delivery 생성 (WEDO)
└─→ Auto-create: Picking Task (LS14)
    ├── Picking Route: Zone-based 순서
    └─→ 수행 후 Goods Issue (MIGO)
```

## 주의사항

### 1. 고정 빈 과포화
❌ **하지 말 것**: Fixed Bin 용량 미체크
✅ **권장**: Bin 용량 설정 필수 (무게, 부피)

### 2. Putaway 전략 충돌
❌ **하지 말 것**: Material마다 다른 strategy (혼란 야기)
✅ **권장**: Material Group별 통일된 전략

**설정**:
```
Material Group A (고가 부품) → FIXED-ONLY
Material Group B (대량 자재) → OPEN-BULK
Material Group C (일반 부품) → SMART-PLACEMENT
```

### 3. FIFO vs LIFO 오류
❌ **하지 말 것**: 식품에 LIFO 적용
✅ **권장**: 유통기한 품목 → FIFO 필수

### 4. 한국 현장: 다중 언어 label
❌ **하지 말 것**: Bin number (001-A-01-01) 만 사용
✅ **권장**: Bin label에 한국어 설명 추가 (QR code)

```
Label Format:
┌─────────────────┐
│ 001-A-01-01-01  │
│  원재료 영역 A   │
│  BEARING-NSK     │
│  Qty: 500pcs    │
└─────────────────┘
```

## S/4 EWM 전환 시 고려사항

WM → EWM:
1. 2-Step Movement → Warehouse Task (더 자동화)
2. Manual Putaway → Wave/Task기반 (효율성)
3. RF Device → Mobile (모바일 앱)

## 다음 단계
- 고급: RF Framework, Wave Management — EWM으로 전환 권장
