# EWM 적치 전략 (Putaway Strategy) IMG 구성 가이드

## SPRO 경로

```
SPRO → SCM Extended Warehouse Management → Goods Receipt Process → Strategies → Putaway Strategies
또는 T-code: /SCWM/STRAT 또는 /SCWM/SLOC (Strategy Maintenance)
```

## 필수 선행 구성

- [ ] Storage Type (저장타입) 정의 — T-code: /SCWM/STDEF
- [ ] Storage Location (저장위치) 정의 — T-code: /SCWM/LOCL
- [ ] Bin (빈, 위치) 정의 — T-code: /SCWM/DEFAB

## 구성 단계

### 1단계: 고정 위치 적치 (Fixed Bin Strategy)

```
T-code: /SCWM/STRAT → Strategy Type: Fixed Bin Allocation
```

#### 용도 및 특징

```
프로세스:
- Material → Fixed Bin (사전 정의된 위치)
- Incoming Goods → Check Bin → Place & Done
- 장점: 빠른 적치, 간단한 로직
- 단점: 공간 활용도 낮음 (특정 상품만 집중)

적용 시나리오:
- 고정 고객 (계약 고객)의 상품
- 특수 보관 조건 (온도, 습도)
- 회전율 높은 상품 (ABC-A)
- 폭발물/의약품 (규제 물품)

설정:
T-code: /SCWM/LOCL → Material Master
  └─ Assigned Fixed Bin: BIN_A_001
  └─ Valid From: 2024-01-01
  └─ Quantity Limit: 500 units (적치 제한)

예시 (한국 의약품 회사):
Medication "Aspirin 500mg"
  ├─ Storage Type: 01 (Climate-controlled)
  ├─ Storage Location: 01-A-01 (콜드체인 영역)
  ├─ Fixed Bin: BIN_C_001_005 (온도 2~8도)
  ├─ Quantity Limit: 200 units
  └─ Remark: Temperature Sensitive, Expiry Tracking
```

#### Fixed Bin 설정 방법

```
T-code: /SCWM/STRAT → Create Fixed Bin Mapping

Material Assignment:
├─ Material: ASPRIN500
├─ Storage Location: 01-A-01
├─ Bin: BIN_C_001_005
├─ Validity Period: 2024-01-01 ~ 9999-12-31
├─ Quantity Capacity: 200 units
├─ Override Allowed: No (강제)
└─ Reason: Medication (특수)

수정 시 영향:
- 현재 적치된 상품 = 그대로 유지
- 신규 입하 = 새 Fixed Bin으로 적치 (기존과 분리)
- 혼합 금지 (서로 다른 제품)
```

### 2단계: 자동 빈 선택 (Next Empty Bin)

```
T-code: /SCWM/STRAT → Strategy Type: Next Empty Bin
```

#### 용도 및 특징

```
프로세스:
- Material → Search Available Bin → Place Goods → Done
- 로직:
  1. Storage Type에서 가장 가까운 빈 찾기
  2. Available Capacity 확인 (수량 부족 시 다음 빈)
  3. 다중 빈 사용 허용 (같은 Material도 여러 빈 가능)
- 장점: 공간 활용도 높음, 동적 배치
- 단점: Picking 때 여러 위치 검색 필요

적용 시나리오:
- 다양한 상품 입하 (다품종)
- 계절 상품 (수량 불규칙)
- 식품류 (회전율 높음)
- 표준 상품 (제약 없음)

설정:
T-code: /SCWM/STRAT → Create Strategy
  ├─ Strategy Type: NEXT_EMPTY_BIN
  ├─ Priority:
  │  1. Nearest Distance (가장 가까운 거리)
  │  2. Largest Capacity (가장 큰 용량)
  │  3. Empty First (빈 빈 우선)
  ├─ Bin Selection Sequence: Left-to-Right, Bottom-to-Top
  └─ Mixed Material: Allowed (여러 상품 혼재 가능)
```

#### Next Empty Bin 선택 알고리즘

```
예시: Product "Widget A" Incoming (100 units)

Storage Location: 01-B-01 (표준 창고)

1단계: 가능한 모든 Bin 스캔
  ├─ BIN_B_001_001: 50/200 (사용 가능, 거리 2m)
  ├─ BIN_B_001_002: 200/200 (Full, Skip)
  ├─ BIN_B_001_003: 0/200 (Empty, 거리 3m)
  ├─ BIN_B_002_001: 100/150 (혼재 상품, Skip)
  └─ BIN_B_002_002: 0/200 (Empty, 거리 5m)

2단계: 정책 우선순위 적용
  Policy 1: Nearest Distance → BIN_B_001_001 (거리 2m)
    └─ 용량 확인: 50/200, 남은 용량 150 (100 수용 가능)
    └─ 선택!

3단계: 적치 실행
  ├─ Place 100 units into BIN_B_001_001
  ├─ Updated: 50 + 100 = 150/200
  └─ Remaining Capacity: 50 units

결과: Widget A 전부 1개 Bin에 적치 (효율적)

만약 Bin 용량이 작은 경우:
  BIN_B_001_001: 30/100
  └─ Place 30 units → Remaining 70 units
  └─ Next bin: BIN_B_001_003 (Empty)
  └─ Place 70 units → Done
  결과: Widget A가 2개 Bin에 분산
```

### 3단계: 기존 재고 추가 (Addition to Existing Stock)

```
T-code: /SCWM/STRAT → Strategy Type: Add to Existing
```

#### 용도 및 특징

```
프로세스:
- Material → Find Existing Bin (같은 상품 기존) → Place
- 로직: 같은 상품의 기존 저장 위치에 추가 적치
- 장점: 같은 상품 재고 통합 (Picking 효율성)
- 단점: 기존 위치가 멀면 비효율적

적용 시나리오:
- FIFO 준수 (First In First Out)
- 유통기한 관리 필수 (식품, 의약품)
- 로트 추적 필요 (배치 관리)
- 수량 추적 (Lot 별 분리)

설정:
T-code: /SCWM/STRAT → Create Strategy
  ├─ Strategy Type: ADD_TO_EXISTING
  ├─ Matching Criteria:
  │  ├─ Material (필수)
  │  ├─ Lot Number (Batch)
  │  ├─ Expiry Date (유통기한)
  │  └─ Vendor (공급업체)
  ├─ Priority:
  │  1. Oldest Expiry First (FIFO)
  │  2. Smallest Quantity (작은 수량 먼저)
  └─ New Bin Fallback: Use Next Empty (만약 없으면)
```

#### FIFO 기반 적치 예시

```
상품: Medicine "Paracetamol 500mg"
입하 1: Batch A, 수량 100, 유통기한 2026-06-30
입하 2: Batch B, 수량 50, 유통기한 2027-06-30

1단계: 첫 번째 입하 (Batch A)
  ├─ 기존 재고: 없음 (첫 입하)
  ├─ Action: Next Empty Bin → BIN_C_001_001
  └─ Store: 100 units, Batch A, Exp 2026-06-30

2단계: 두 번째 입하 (Batch B)
  ├─ 기존 재고 검색: BIN_C_001_001 (Batch A 유)
  ├─ Matching Check:
  │  └─ Material: ✓ (같음)
  │  └─ Expiry: Batch A < Batch B (2026 < 2027)
  │  └─ Action: 기존 Bin 사용 (FIFO 준수!)
  ├─ Capacity Check: 100/200 (100 여유)
  ├─ Place 50 units → BIN_C_001_001
  └─ Result: 동일 Bin에 두 Batch 혼재 (FIFO 순서 유지)

최종 상태:
BIN_C_001_001: 150/200
  ├─ Layer 1 (아래): Batch A, 100, Exp 2026-06-30
  ├─ Layer 2 (위): Batch B, 50, Exp 2027-06-30
  └─ Picking: Batch A부터 먼저 꺼냄 (FIFO)

만약 FIFO 없이 "Next Empty"만 사용:
  └─ Batch B → BIN_C_002_001 (새 Bin)
  └─ 나중에 Batch A와 B 모두 스캔해야 함 (비효율)
```

### 4단계: 슬롯팅 (Slotting - 최적 위치 자동 결정)

```
T-code: /SCWM/STRAT → Strategy Type: Slotting
또는 T-code: /SCWM/SLOT (Advanced Slotting)
```

#### 용도 및 특징

```
프로세스:
- AI/ML 기반 상품 위치 최적화
- 입하 → 분석 → 최적 Bin 제시 (거리, 회전율 고려)
- 장점: 인건비 최소화, 효율성 극대화
- 단점: 설정 복잡, 데이터 필요

적용 시나리오:
- 대규모 창고 (1,000+ SKU)
- 높은 처리량 (10,000+ picks/day)
- 자동화 설비 있음 (Conveyor, WMS 시스템)
- ROI 계산 필요

알고리즘:
  1. ABC 분석 (회전율)
     ├─ A Items (빠름): 가까운 위치
     ├─ B Items (중간): 중간 위치
     └─ C Items (느림): 먼 위치

  2. Picking Distance 최소화
     ├─ 측정: 입하점 → 저장점 거리 (미터)
     ├─ 목표: 평균 거리 < 50미터

  3. Bin 용량 최적화
     ├─ 측정: 사용 용량 / 총 용량
     ├─ 목표: > 85% 활용율
```

#### Slotting 설정 예시 (한국 물류센터)

```
물류센터: Seoul Distribution Center (2,000 m²)

상품 특성:
- Total SKU: 5,000개
- Fast Movers (A): 500개 (회전율 > 50/day)
- Medium (B): 1,500개 (회전율 10~50/day)
- Slow (C): 3,000개 (회전율 < 10/day)

Slotting Strategy:
┌─────────────────────────────────────────┐
│         Input Area                      │
│    (입하 지점, 0m 기준점)               │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┬──────────┬─────────┐
        │             │          │         │
        ▼             ▼          ▼         ▼
   Zone A (0~2m)  Zone B (2~5m) Zone C (5~10m)
   A Items        B Items       C Items
   500 fast       1,500 med     3,000 slow
   (가까움)       (중간)         (먼곳)

Benefits:
- Picking Distance 감소: 평균 60m → 30m (50% 감소)
- Picking Time 감소: 5분 → 2.5분 (인건비 절감)
- 월간 절감액: 100명 × 2.5분 × 8시간 × 20일 × 급여
            = 약 KRW 40,000,000/월 절감
```

### 5단계: 동선 기반 적치 (Layout-Oriented Putaway)

```
T-code: /SCWM/STRAT → Strategy Type: Layout-Based
```

#### 용도 및 특징

```
프로세스:
- 창고 동선(경로)을 고려한 적치
- 입하 후 순서대로 적치하여 동선 최소화
- 장점: 인건비 절감, 효율성
- 단점: 복잡한 설정, 정기적 재분석 필요

적용 시나리오:
- Pick-Pack-Ship 통합 라인
- Cross-docking 작업
- 직선형 창고 (Linear Layout)

설정:
  ├─ Aisle (통로) 정의
  ├─ Aisle Sequence (순서)
  └─ Bin 배치 (지그재그 또는 U자형)

예시:
┌────────────────────────────────────┐
│   INPUT                            │
│   (입하점)                          │
└─────────────────┬──────────────────┘
                  │
        ┌─────────▼─────────┐
        │  Aisle 1 (양쪽)   │
        │  → → → → → ← ← ← │
        │  좌측: BIN_01~20  │
        │  우측: BIN_21~40  │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  Aisle 2          │
        │  → → → → → ← ← ← │
        │  좌측: BIN_41~60  │
        │  우측: BIN_61~80  │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │ OUTPUT (출고 구간) │
        │ Consolidation     │
        └───────────────────┘

Putaway Logic:
  1. 입하된 상품 수량 = 100 units
  2. Aisle 1 좌측부터 순서대로 적치
     (짝수 Bin이면 우측, 동선 최소)
  3. 적치 경로: BIN_01 → BIN_02 → BIN_03
  4. 평균 동선: 일직선 (최단거리)
```

## 구성 검증

```
T-code: /SCWM/INIT → Putaway Strategy Testing
- 특정 Material 선택 → "Suggest Putaway" 버튼
- 제시된 Bin이 예상과 일치하는지 확인

T-code: /SCWM/MONI (Warehouse Monitoring)
- Putaway 완료 현황
- Bin Utilization Rate (용량 활용률)
- Average Putaway Time

T-code: /SCWM/LOCL → Bin Contents
- 각 Bin의 현황 확인
- 혼재된 상품 확인
- 비상 상황 검증

Pilot Test:
  1. 100개 상품 입하 → 자동 적치
  2. 적치 위치 기록
  3. Picking 효율 측정 (적치 전후)
```

## 주의사항

### 공통 실수

1. **Fixed Bin 오버라이드 문제**
   - 예: Fixed Bin 용량 초과 입하 (200 units 공간에 250 units)
   - 결과: 고급 설정에서 "Override Allow"하면 Bin 초과
   - 해결: Putaway Strategy에서 Fallback Bin 정의

2. **FIFO와 Slotting 충돌**
   - 예: Add-to-Existing (FIFO) + Slotting (거리 최적) 동시 적용
   - 결과: FIFO 위배 또는 거리 증가
   - 해결: 우선순위 명확히 (FIFO 우선 권장)

3. **Bin 용량 초과**
   - 예: BIN 최대 용량 200개인데 적치 시간에 250개 지정
   - 결과: 시스템 에러 또는 상품 손상
   - 확인: 적치 전 Capacity Check 활성화

### EWM 특정 주의사항 (S/4HANA)

- Real-time 적용: Strategy 변경 시 즉시 영향 (진행 중 Task도 영향)
- Performance: 5,000+ SKU 슬롯팅은 배치 처리 권장 (야간 실행)

---

**연관 문서**: [프로세스 유형](warehouse-process-type.md) | [RF 프레임워크](rf-framework.md)
