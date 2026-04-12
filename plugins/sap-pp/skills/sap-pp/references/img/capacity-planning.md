# 용량계획(Capacity Planning) IMG 구성 가이드

## SPRO 경로
`SPRO → Production Planning and Control (PP) → Capacity Planning & Execution → Capacity Planning`

Primary T-codes: **CR01** (Work Center 정의), **CAPP** (생산 달력), **CM01** (Workload Analysis), **CM25** (Capacity Leveling)

## 필수 선행 구성
- [ ] 플랜트 (OC04)
- [ ] 급여관리 조직 (Cost Center) — CO (Controlling)
- [ ] 작업 달력 (SCAL 또는 CAPP)

## 핵심 개념: Work Center와 Capacity

```
Work Center (작업장)
    ├─ 정의: 생산 자원의 논리적 그룹
    ├─ 예: "Cutting Machine #1", "Assembly Line A"
    │
    └─ Capacity (용량)
       ├─ Available Capacity = Base Time × No. of Resources × Utilization Factor
       ├─ Example: 480 min/day (1 shift) × 2 machines × 90% = 864 minutes
       └─ 이 내에서 생산 계획 수립
```

## 구성 단계

### 1단계: Work Center 정의 (CR01)

T-code: **CR01** (Create Work Center)

```
화면:
┌──────────────────────────────────┐
│ Work Center Maintenance          │
├──────────────────────────────────┤
│ Work Center Code: WC-101         │
│ Description: "Cutting Machine"   │
│ Plant: 1000 (Berlin)             │
│                                  │
│ Basic Data:                      │
│ ├─ Work Center Category: 001     │
│ │  (001=Machine, 002=Labor)      │
│ ├─ Location: Hall 1, Zone A      │
│ ├─ Department: Production        │
│ │  └─ Cost Center: CC-PROD-001   │
│ │     (원가귀속)                  │
│ └─ Responsible Person:           │
│    └─ Supervisor: John (ID 12345)│
│                                  │
│ Capacity:                        │
│ ├─ Resource (자원):              │
│ │  ├─ Count: 2 (machine 개수)    │
│ │  ├─ Shift: 1 (1교대)           │
│ │  ├─ Work Time: 480 min/day     │
│ │  │  (8시간 = 480분)            │
│ │  ├─ Setup Time per Lot: 30 min │
│ │  ├─ Queue Time: 120 min        │
│ │  │  (대기시간)                  │
│ │  └─ Utilization %: 90%         │
│ │     (목표 가동율)              │
│ │                                │
│ │→ Available Capacity:           │
│ │  480 × 2 × 0.9 = 864 min/day  │
│ │                                │
│ ├─ Cost:                         │
│ │  ├─ Machine Cost/Hour: 50 EUR  │
│ │  ├─ Labor Cost/Hour: 30 EUR    │
│ │  └─ (CK11N 원가계산에 사용)    │
│ │                                │
│ └─ Scheduling:                   │
│    ├─ Forward Scheduling: ☑      │
│    │  (주문 가능 빠르게)         │
│    ├─ Backward Scheduling: ☑     │
│    │  (배송일 역계산)            │
│    └─ Finite/Infinite: Infinite  │
│       (무제한 오버로드 허용)      │
└──────────────────────────────────┘
```

#### CR01 상세 설정 — Capacity Category 002 (Labor)

**WC-102: Assembly Line — 수작업 자원**

```
Work Center: WC-102
├─ Category: 002 (Labor)
├─ Location: Hall 2
├─ Cost Center: CC-PROD-002
│
├─ Resources:
│  ├─ Count: 5 (workers)
│  ├─ Shift: 1 (단일교대, 8시간)
│  ├─ Work Time: 480 min/shift
│  │  → Total: 480 × 5 = 2400 min/day
│  ├─ Setup Time: 10 min
│  ├─ Queue Time: 60 min (조립 라인 대기)
│  └─ Utilization: 85%
│     → Available: 2400 × 0.85 = 2040 min/day
│
├─ Labor Costs:
│  ├─ Hourly Rate: 30 EUR/hour
│  ├─ Skill Level: Semi-skilled
│  └─ (CO 원가계산에서 사용)
│
├─ Scheduling:
│  ├─ Forward: ☑ (작업 가능한 빨리 시작)
│  ├─ Backward: ☑ (납기일부터 역계산)
│  └─ Finite Scheduling: ☑ (용량 제한)
│     → 2040 min 초과 주문 시 경고
│
└─ Special:
   ├─ Bottleneck: ☑ (병목공정)
   │  (이 자원이 전체 생산 제약)
   └─ Critical: Yes (모니터링)
```

#### CR01 상세 설정 — Capacity Category 001 (외주 - Subcontracting)

**WC-EXT-001: Third-party Lab — 외주사**

```
Work Center: WC-EXT-001
├─ Category: 001 (Machine, 외주용으로 전용)
├─ Description: "Quality Testing Lab"
├─ Supplier: TEST-LAB-001
│
├─ Capacity:
│  ├─ Count: 1 (외주사는 단일로 표현)
│  ├─ Shift: 1
│  ├─ Work Time: 480 min/day
│  │  (외주사 작업 시간, 참고용)
│  ├─ Queue Time: 2880 min (배송 4.8시간)
│  └─ Lead Time: 5 days
│
├─ Costs:
│  ├─ External Cost/Unit: 8 EUR
│  ├─ Transport Cost: 50 EUR (batch)
│  └─ (PO 자동 생성 시 비용)
│
├─ Control:
│  ├─ Purchasing Organization: 1000
│  ├─ Vendor Agreement: Required
│  └─ Material Group: Services
│
└─ Scheduling:
   ├─ Infinite (용량 제약 없음)
   │  (외주사이므로 별도 체크 안함)
   └─ Lead Time: 5 days (고정)
```

### 2단계: 작업 달력(Working Calendar) 정의 (CAPP 또는 SCAL)

T-code: **CAPP** (Production Planning Calendar) 또는 **SCAL** (Shift Calendar)

```
화면:
┌──────────────────────────────────┐
│ Production Calendar              │
├──────────────────────────────────┤
│ Factory Calendar: FACA (독일)     │
│ Plant: 1000                      │
│ Year: 2026                       │
│                                  │
│ Working Days:                    │
│ ├─ Monday~Friday: Working (W)    │
│ ├─ Saturday: Holiday (H)         │
│ ├─ Sunday: Holiday (H)           │
│ │                                │
│ ├─ 2026-01-01: Holiday (New Year)│
│ ├─ 2026-12-25: Holiday (Christmas)
│ └─ ...                           │
│                                  │
│ Shifts (by Day):                 │
│ ├─ Shift 1: 06:00~14:00 (8h)    │
│ ├─ Shift 2: 14:00~22:00 (8h)    │
│ └─ Shift 3: 22:00~06:00 (8h)    │
│    (선택적 — 야간/야간근무)      │
│                                  │
│ Calendar Assignment to Work Ctr: │
│ └─ WC-101: 1 Shift (06~14:00)   │
│    WC-102: 2 Shifts (06~22:00)  │
│    WC-103: 3 Shifts (24시간)    │
│                                  │
└──────────────────────────────────┘
```

#### 달력의 Shift 계산

```
Work Center: WC-102 (Assembly) 예시

Calendar Setup:
├─ Shift 1: 06:00~14:00 (480 min)
├─ Shift 2: 14:00~22:00 (480 min)
└─ WC-102 할당: 2 shifts

Effective Capacity:
├─ Monday~Friday: 480 × 2 = 960 min/day
│  (5 workers × 2 shifts = 10 worker-shifts)
├─ Saturday: 0 min (Holiday)
├─ Sunday: 0 min (Holiday)
│
├─ Week Capacity: 960 × 5 = 4800 min
│  (다만 Utilization 85% → 4080 min 실제 사용)
│
└─ Example: Mon-Fri 작업
   ├─ Demand: 8000 min for assembly
   ├─ Available: 4080 min/week
   ├─ Weeks Needed: 8000 / 4080 = 1.96 weeks (~2주)
   └─ Planned Start: Today → Finish in 2 weeks
```

### 3단계: Capacity Planning 실행 (CM01)

T-code: **CM01** (Workload Analysis)

```
화면:
┌──────────────────────────────────┐
│ Workload Analysis (용량 분석)    │
├──────────────────────────────────┤
│ Work Center: WC-102              │
│ Planning Period: Apr 2026        │
│                                  │
│ Summary:                         │
│ ├─ Available Capacity: 4080 min  │
│ ├─ Planned Requirement: 6500 min │
│ │  (현재 계획의 총 작업량)       │
│ ├─ Overload: 2420 min (+59%)     │
│ │  (red flag — 과부하)           │
│ └─ Utilization: 159% (목표 100%)│
│                                  │
│ Detailed by Week:                │
│ ├─ Week 1: 1200 min (30% util) ✓ │
│ ├─ Week 2: 1800 min (44% util) ✓ │
│ ├─ Week 3: 2100 min (51% util) ✓ │
│ ├─ Week 4: 1400 min (34% util) ✓ │
│                                  │
│ Problems:                        │
│ └─ Orders due Apr 25~30:        │
│    ├─ PO #1000234: 2000 min    │
│    ├─ PO #1000235: 1500 min    │
│    ├─ Total: 3500 min           │
│    └─ Available in Apr 25-30:   │
│       (480 × 1.5 days = 720 min)
│       → 3500 min는 불가능!     │
│       (Overload)                │
│                                  │
│ Recommendations:                 │
│ ├─ [ ] Reschedule to May        │
│ ├─ [ ] Use alternative WC       │
│ ├─ [ ] Add overtime (shift 추가) │
│ └─ [ ] Reduce order qty         │
│                                  │
└──────────────────────────────────┘
```

### 4단계: Capacity Leveling (CM25)

T-code: **CM25** (Capacity Leveling)

Capacity Leveling은 과부하(Overload)를 자동으로 해결:

```
상황 (Before CM25):
├─ WC-102 (Assembly):
│  ├─ Week 1~3: OK (50% util)
│  └─ Week 4: Over (150% util, 병목)
│
├─ WC-101 (Cutting):
│  ├─ Week 1~3: Over (80% util)
│  └─ Week 4: Under (30% util, 여유)

CM25 Leveling Rules:
├─ Rule 1: Reschedule orders backward (앞으로 당기기)
│  ├─ If predecessor available → Move PO earlier
│  └─ Example: WC-101의 고위험 PO를 이전 주로
│
├─ Rule 2: Reschedule forward (뒤로 미루기)
│  ├─ If bottleneck found → Delay non-critical orders
│  └─ Example: WC-102 병목 → WC-101 upstream 미루기
│
└─ Rule 3: Alternative Work Center
   ├─ If available → Reassign to parallel WC
   └─ Example: WC-102 과부하 → WC-103으로 이동

[ Execute CM25 ]
    ↓
Result (After):
├─ WC-101 (Cutting):
│  ├─ Week 1: 80% (move forward 후 증가)
│  ├─ Week 2: 70%
│  ├─ Week 3: 70%
│  └─ Week 4: 40% (원래 over였던 작업을 이전으로)
│
├─ WC-102 (Assembly):
│  ├─ Week 1: 65%
│  ├─ Week 2: 75%
│  ├─ Week 3: 75%
│  └─ Week 4: 60% (균형)
│
└─ Result: All WC均衡 ~ 70% ✓
```

## 구성 검증

### 검증 1: CR01에서 Work Center 확인
```
T-code: CR01 → Display Mode
├─ Work Center WC-101:
│  ├─ Category: 001 (Machine) ✓
│  ├─ Count: 2 ✓
│  ├─ Available Capacity: 864 min/day ✓
│  └─ Cost Center: CC-PROD-001 ✓
├─ Work Center WC-102:
│  ├─ Category: 002 (Labor) ✓
│  ├─ Count: 5 workers ✓
│  ├─ Available Capacity: 2040 min/day ✓
│  └─ Bottleneck: ☑ ✓
└─ Work Center WC-EXT-001:
   ├─ External/Subcontractor ✓
   ├─ Lead Time: 5 days ✓
   └─ Cost/Unit: 8 EUR ✓
```

### 검증 2: CAPP/SCAL에서 달력 확인
```
T-code: CAPP (또는 SCAL)
├─ Factory Calendar: FACA ✓
├─ Plant: 1000 ✓
├─ Working Days:
│  ├─ Mon~Fri: W (Working) ✓
│  ├─ Sat~Sun: H (Holiday) ✓
│  └─ Special days: Holiday ✓
└─ Shifts:
   ├─ Shift 1: 06:00~14:00 ✓
   ├─ Shift 2: 14:00~22:00 ✓
   └─ WC assignment ✓
```

### 검증 3: CM01로 용량 분석
```
T-code: CM01
├─ Work Center: WC-102 (병목)
├─ Period: April 2026
│
└─ Analysis:
   ├─ Available: 4080 min/week ✓
   ├─ Planned: 6500 min (계획의 합)
   ├─ Overload: 2420 min (문제!)
   └─ Action: Leveling 필요
```

### 검증 4: CM25로 Leveling 실행
```
T-code: CM25
├─ Plant: 1000
├─ Period: April 2026
├─ Leveling Strategies:
│  ├─ Reschedule Backward
│  ├─ Reschedule Forward
│  └─ Use Alternative WC
├─ [ Execute ]
│
└─ Result:
   ├─ WC-102 after: ~70% util ✓
   ├─ Orders rescheduled: 3개
   ├─ Alternative WC used: 1개
   └─ Log: (검토)
```

### 검증 5: 생산오더로 Capacity 영향 확인 (CO01)
```
T-code: CO01 (Create PO)
├─ Material: TEST-PD-001
├─ Qty: 100 EA
├─ [Create]
│
└─ System:
   ├─ Routing loaded: ✓
   ├─ Capacity requirements auto-calc:
   │  ├─ Op 10 (WC-101): 15 min × 100 = 1500 min
   │  ├─ Op 20 (WC-102): 30 min × 100 = 3000 min
   │  └─ Op 30 (WC-EXT): 5 days lead time
   │
   ├─ Capacity check:
   │  ├─ WC-101: 1500/864 = 174% 👉 OVER
   │  ├─ WC-102: 3000/2040 = 147% 👉 OVER
   │  └─ WC-EXT: 5 days (고정)
   │
   ├─ Warning: "Capacity Overloaded!"
   │  └─ [ ] Accept / [ ] Reschedule
   │
   └─ Decision:
      ├─ [ ] Accept (강제)
      └─ [x] Reschedule to next available slot
         └─ New start: 2026-04-20
```

## 주의사항

### 1. Work Center 용량 과다 설정 → 비현실적 계획
**문제**: WC-102를 480 × 5 workers = 2400 min으로 설정 (Utilization 100%)
```
결과: CM01 계획 → 항상 100% 활용 → 여유 없음
      실제 운영: 90% 효율 → 240 min 부족 → 일정 미스
```
**해결**: Utilization을 현실적으로 (85~90%) 설정

### 2. Shift 달력 미정의 → Scheduling 오류
**문제**: CR01에서 Shift 정의 후 CAPP에서 Work Center 미할당
```
결과: MD01 → CO01 계획 시 2-shift WC가 1-shift로 계산
      가능일정 2주 → 실제 필요 4주
```
**해결**: CAPP → Work Center마다 Shift 명확히 할당

### 3. Setup Time 과소 평가 → 실제 용량 부족
**문제**: CR01에서 Setup Time = 0 (무시)
```
결과: 계획 3000 min + 실제 Setup 500 min = 3500 min
      가용 2040 min < 3500 min → 일정 실패
```
**해결**: Setup Time 현실적으로 입력 (보통 1~10% of run time)

### 4. Bottleneck Work Center 미표시 → 계획 순서 오류
**문제**: WC-102(Assembly, 병목)를 CR01에서 Bottleneck = No로 설정
```
결과: Scheduling → WC-101(Cutting)만 중시
      WC-102 과부하 → 최종 배송 지연
```
**해결**: CR01 → 병목 자원 명확히 표시 (Bottleneck: Yes)

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| CR01 | 고정 구조 | 동일 (확장 가능) |
| Calendar | CAPP/SCAL 분리 | 통합 (SCAL) |
| CM01 Analysis | 정적 스냅샷 | 동적 (실시간) |
| CM25 Leveling | 수동 규칙 | AI 최적화 (향후) |
| Constraint-based | Infinite 중심 | Finite 자동 감지 |
| Real-time Capacity | 없음 | IoT Sensors (향후) |

## 참고 자료

- **SAP 공식**: IMG → PP → Capacity Planning
- **T-codes**: CR01(Work Center), CAPP(Calendar), CM01(분석), CM25(Leveling)
- **심화**: CA01(Routing에서 시간), PPIS(Predictive Scheduling)
