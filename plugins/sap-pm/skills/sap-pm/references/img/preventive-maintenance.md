# 예방보전(Preventive Maintenance) IMG 구성 가이드

## SPRO 경로
```
SPRO → Plant Maintenance → Maintenance Planning
├── Maintenance Strategies (보전전략)
│   ├── IP11 — Define Package for Maintenance Strategy
│   ├── IP12 — Assign Package to Strategy
│   └── IP13 — Define Maintenance Strategy Cycles
├── Maintenance Plans (보전계획)
│   ├── IA01 — Create Maintenance Plan (Time-based)
│   ├── IA05 — Create Maintenance Plan (Counter-based)
│   └── IA06 — Assign Maintenance Plan to Equipment
├── Job Lists (작업목록)
│   ├── IA01 — Create Job List
│   └── IA41 — Create Measuring Points
└── Deadline Monitoring (IP30)
    └── IP30 — Execution Deadline Monitoring Settings
```

## 필수 선행 구성
- [ ] Equipment 및 Functional Location 마스터 생성 (IM01, IL01)
- [ ] Equipment Cost Center 할당 완료
- [ ] Maintenance Order Types (PM01, PM02, PM03) 정의 완료
- [ ] Number Ranges 설정 (Maintenance Plan: IA, IP)
- [ ] 보전팀 Resource 정의 (Work Center: PM01, PM02)

## 구성 단계

### 1단계: 보전패키지 정의 (IP11)

**T-code: IP11** (Create Package for Maintenance Strategy)

보전패키지는 설비의 수명 주기 상 주요 서비스 포인트를 정의합니다.

#### 예시 1: 회전기계 (모터, 펌프) 패키지

| 패키지 코드 | 패키지명 | 주기 | 작업 항목 | 비용 추정 |
|-----------|---------|------|---------|---------|
| 50H | 50시간 점검 | 50 시간 | 오일 교체, 필터 청소 | 500K |
| 100H | 100시간 정기점검 | 100 시간 | 축 정렬 확인, 베어링 점검 | 1M |
| 500H | 500시간 대점검 | 500 시간 | 분해 정검(Overhaul), 부품 교체 | 5M |
| 1000H | 1000시간 전체 점검 | 1000 시간 | Full Disassembly, 부품 재조정 | 10M |

#### 예시 2: 프레스기계 패키지

| 패키지 코드 | 패키지명 | 주기 | 작업 항목 | 비용 추정 |
|-----------|---------|------|---------|---------|
| DAILY | 일일 점검 | 1 일 | 오일 냉각, 안전 점검 | 100K |
| WEEKLY | 주간 점검 | 7 일 | 유압호스 점검, 청소 | 300K |
| MONTHLY | 월간 정기점검 | 30 일 | 동력 사이클 테스트, 진동 측정 | 1M |
| YEARLY | 연간 대점검 | 365 일 | Calibration, 안전 장치 테스트 | 5M |

**설정 단계** (IP11):
```
Package Code        = 50H
Package Description = 50 Hour Maintenance Service
Validity Date From  = 2024-01-01
Validity Date To    = 2099-12-31

Tasks Included:
├── Oil Change: 200K KRW
├── Filter Replacement: 150K KRW
├── Bearing Inspection: 150K KRW
└── Total Cost: 500K KRW
```

### 2단계: 보전전략 정의 (IP12 & IP13)

**T-code: IP12** (Create Maintenance Strategy)

보전전략은 패키지들을 조합하여 각 Equipment/FL에 대한 예방보전 계획을 수립합니다.

#### 전략 유형 1: Time-based (시간 기반)

**예시: 모터 연간 보전 전략**

| 패키지 | 시점 | 반복 주기 | 시작 기준 |
|--------|------|---------|---------|
| 50H | 50시간 | 매 50시간 | 운영 누적 시간 |
| 100H | 100시간 | 매 100시간 | 운영 누적 시간 |
| 500H | 500시간 | 연 1회 (500시간 = 연간 상근) | 운영 누적 시간 |
| 1000H | 1000시간 | 2년 주기 | 운영 누적 시간 |

**설정** (IP13):
```
Maintenance Strategy = MOTOR-STD
├── IP13-1: Package 50H
│   └── Cycle Unit = Hours, Interval = 50
├── IP13-2: Package 100H
│   └── Cycle Unit = Hours, Interval = 100
├── IP13-3: Package 500H
│   └── Cycle Unit = Hours, Interval = 500
└── IP13-4: Package 1000H
    └── Cycle Unit = Hours, Interval = 1000
```

#### 전략 유형 2: Calendar-based (달력 기반)

**예시: 프레스기계 연간 보전 전략**

| 패키지 | 일정 | 반복 주기 | 시작 기준 |
|--------|------|---------|---------|
| DAILY | 매일 09:00 | 1 일 | 운영 시작 |
| WEEKLY | 매주 월요일 08:00 | 7 일 | 주간 시작 |
| MONTHLY | 매월 1일 08:00 | 30/31 일 | 월초 |
| YEARLY | 12월 15일 | 12개월 | 년도 시작 |

**설정** (IP13):
```
Maintenance Strategy = PRESS-STD
├── IP13-1: Package DAILY
│   └── Cycle Unit = Days, Interval = 1
├── IP13-2: Package WEEKLY
│   └── Cycle Unit = Days, Interval = 7
├── IP13-3: Package MONTHLY
│   └── Cycle Unit = Days, Interval = 30
└── IP13-4: Package YEARLY
    └── Cycle Unit = Days, Interval = 365
```

#### 전략 유형 3: Multiple Counter (다중 카운터 기반)

회전기계의 경우 시간(Hours) + 사이클(Cycles) + 거리(km) 등 여러 카운터 모니터링:

```
Maintenance Strategy = PUMP-MULTI
├── Counter 1: Operating Hours (운영 시간)
│   └── Package: 100H (100시간마다)
├── Counter 2: Production Cycles (생산 사이클)
│   └── Package: 1000C (1000사이클마다)
└── Counter 3: Temperature Cycles (온도 사이클)
    └── Package: 50T (50개 온도 사이클마다)

우선순위: Counter 1 OR Counter 2 OR Counter 3 중 먼저 도달하면 실행
```

### 3단계: 작업목록(Job List) 생성 (IA01/IA05)

**T-code: IA01** (Create Time-based Job List) 또는 **IA05** (Counter-based)

작업목록은 보전전략의 세부 작업 단계를 정의합니다.

#### 예시: 모터 50시간 점검 작업목록

```
Job List Code       = 50H-MOTOR
Description         = Motor 50 Hour Service
Equipment           = MOT-PRESS-01
Validity From       = 2024-01-01
Validity To         = 2099-12-31

Operation Sequence:

┌──────────────────────────────────────────────────────────┐
│ Seq │ Operation      │ Work Center │ Time │ Skill │ Cost │
├──────────────────────────────────────────────────────────┤
│ 10  │ Visual Inspect │ PM01        │ 0.5H │ M-01  │ 50K  │
│ 20  │ Change Oil     │ PM01        │ 1.5H │ M-02  │ 200K │
│ 30  │ Clean Filter   │ PM01        │ 1.0H │ M-01  │ 150K │
│ 40  │ Check Bearing  │ PM01        │ 1.0H │ M-03  │ 100K │
└──────────────────────────────────────────────────────────┘

Resources Required:
├── Labor: 4 hours × 50K/hour (기술자) = 200K
├── Materials: Oil 1L (80K) + Filter (100K) = 180K
└── Total: 380K KRW (추정)
```

**IA01 설정 필드**:
| 필드 | 값 | 설명 |
|------|----|----|
| Job List Code | 50H-MOTOR | 고유 ID |
| Linked to | Equipment MOT-PRESS-01 | 또는 FL |
| Validity Period | 2024-01-01 ~ 2099-12-31 | |
| Category | Standard Job List | |
| Text (Header) | Motor 50 Hour Service | 한국어 가능 |

**작업 단계 (Operations)**:
```
Line Item 10:
├── Operation Code: 10
├── Operation Description: 모터 육안점검 (Visual Inspection)
├── Work Center: PM01 (보전작업중심)
├── Std Hours: 0.5 (표준 작업시간)
├── Material:
│   ├── Cleaning Cloth, Qty: 1
│   └── Inspection Tool (기본)
├── Cost: 50K (인건비 기반 추정)
└── Assign to: Next Maintenance Plan

Line Item 20:
├── Operation Code: 20
├── Operation Description: 오일 교체 (Oil Change)
├── Work Center: PM01
├── Std Hours: 1.5
├── Material:
│   ├── Motor Oil (ISO 46), Qty: 1L
│   └── Oil Filter, Qty: 1
├── Cost: 200K
└── Predecessor: Line 10 (선행 작업)
```

### 4단계: 보전계획 생성 (IA06 — Assign Maintenance Plan)

**T-code: IA06** 또는 **IA01에서 직접 할당**

Equipment 또는 Functional Location에 보전전략을 적용합니다.

#### 예시: Equipment MOT-PRESS-01에 보전계획 적용

```
Maintenance Plan Creation (IA06):

Plant                = 1000
Equipment            = MOT-PRESS-01
Maintenance Strategy = MOTOR-STD (IP12에서 정의)

Plan Generation:
├── Call Horizon = 90 days (계획 예정 범위: 향후 90일)
├── Start Date = 2024-01-01
├── Planning Date = 2024-01-01 (첫 주기 시작)
└── Generated Plan Lines:
    ├── Plan Line 1: 2024-02-20 (50시간 도달 예상)
    │   └── Linked Job List: 50H-MOTOR
    ├── Plan Line 2: 2024-04-10 (100시간 도달)
    │   └── Linked Job List: 100H-MOTOR
    └── Plan Line 3: 2024-10-01 (500시간 도달)
        └── Linked Job List: 500H-MOTOR
```

**IA06 화면 필드**:
```
General Data:
├── Maintenance Plan: 000001 (자동 채번)
├── Plant: 1000
├── Equipment/FL: MOT-PRESS-01
├── Maintenance Strategy: MOTOR-STD
└── Description: 프레스 메인 모터 정기점검

Scheduling Parameters:
├── Call Horizon: 90 days (계획 기간)
├── Tolerance Before Deadline: 7 days (완료 허용 선행)
├── Tolerance After Deadline: 14 days (완료 허용 후행)
├── Call Interval: 30 days (월 1회 계획 갱신)
└── Start Date: 2024-01-01

Linked Strategies:
├── Sequence 1: MOTOR-STD
│   └── Include Cycles: (체크)
```

### 5단계: 스케줄링 파라미터 (Scheduling Parameters)

**T-code: IA37** (Maintenance Schedule Monitoring)

| 파라미터 | 기본값 | 설명 |
|---------|-------|------|
| Call Horizon (계획 범위) | 90 days | 향후 90일 범위 내 예정된 보전 계획 표시 |
| Tolerance Before (선행 완료) | 7 days | 계획 기한 전 7일 이내 완료 시 인정 |
| Tolerance After (후행 완료) | 14 days | 계획 기한 후 14일 이내 완료 시 인정 |
| Call Interval (갱신 주기) | 30 days | 매 30일마다 새 계획 라인 생성 |
| Shift Factor (교대 팩터) | 1.0 | 다중 교대 작업 시 1.5~2.0 (시간 보정) |

**한국 제조업 권장값**:
```
Call Horizon    = 90 days (분기별 계획)
Tolerance Before = 3 days (신속 대응)
Tolerance After  = 7 days (준비 기한)
Call Interval    = 14 days (2주 주기 갱신)
Shift Factor     = 1.2 (3교대 운영 시)
```

**설정 경로**:
```
SPRO > Plant Maintenance > Maintenance Planning
→ Scheduling Parameters for Maintenance Plans (IA37)
→ Equipment MOT-PRESS-01의 파라미터 조정
```

### 6단계: 기한 모니터링 (IP30 — Deadline Monitoring)

**T-code: IP30** 또는 **IA38** (Maintenance Planning Workbench)

예방보전 계획의 현황을 모니터링하고 오더를 자동 생성합니다.

#### IA38 Workbench 화면

```
Maintenance Planning Workbench (IA38):

Filter Criteria:
├── Plant: 1000
├── Equipment/FL: (비워두면 전체)
└── Date Range: 2024-01-01 ~ 2024-03-31

Display Results:
┌────────────────────────────────────────────────────────────┐
│ Equipment │ Strategy │ Next Date │ Status  │ Days Left │ Act │
├────────────────────────────────────────────────────────────┤
│ MOT-P-01  │ MOTOR    │ 2024-02-20 │ Due    │ 5 days   │ [+]│
│ MOT-P-02  │ MOTOR    │ 2024-01-25 │ Overdue│ -5 days  │ [!]│
│ PUMP-01   │ PUMP     │ 2024-03-10 │ OK     │ 25 days  │ [ ]│
└────────────────────────────────────────────────────────────┘

Action Column [+]:
├── [+] = Create Maintenance Order 버튼
│   └─→ PM01 오더 자동 생성
├── [!] = Overdue Alert (기한 초과)
│   └─→ 긴급 PM02 (고장보전) 전환 권고
└── [ ] = Scheduled (정상 진행)
    └─→ 무시
```

**오더 자동 생성 규칙**:
```
IP30 설정:
├── Order Type When Creating: PM01 (예방보전)
├── Priority: 2 (높음)
├── Start Processing Date: 기한 날짜
└── Auto-Release: ✅ (체크 시 자동 배정)
   └─→ 체크 해제 권장 (검토 후 수동 배정)
```

## 구성 검증

**T-code: IA38** (Maintenance Planning Workbench)

```
검증 체크리스트:

1. Maintenance Plan 생성 확인:
   ├── Equipment = MOT-PRESS-01
   ├── Maintenance Plan = 000001 (자동 채번)
   └── Next Deadline = 계획된 날짜

2. Job List 연결 확인:
   ├── Plan Line 1 → Job List 50H-MOTOR
   ├── Plan Line 2 → Job List 100H-MOTOR
   └── Plan Line 3 → Job List 500H-MOTOR

3. Ordering Preview:
   ├── Click [+] on Plan Line 1
   └─→ PM01 오더 미리보기 (아직 생성 안 함)

4. Manual Order Creation Test:
   ├── T-code: IW31 (Manual Maintenance Order Creation)
   ├── Order Type = PM01
   ├── Equipment = MOT-PRESS-01
   └─→ Job List 자동 추천 확인
```

**T-code: IA37** (Schedule Monitoring)

```
실행:
├── Plant = 1000
├── Equipment = MOT-PRESS-01
└── Display:
   ├── Maintenance Plan: 000001
   ├── Next Deadline: 2024-02-20
   ├── Tolerance: ±7 days
   └─→ 정상 표시 (OK Status)
```

## 주의사항

### 1. Call Horizon 설정 너무 짧음
❌ **하지 말 것**: Call Horizon = 14 days (너무 짧음)
✅ **권장**: Call Horizon = 60~90 days (분기 계획 수립)

**이유**: 부품 구매, 외주 계약, 기술자 스케줄 조정에 최소 4주 소요

### 2. 보전전략 변경 시 기존 계획 미 업데이트
❌ **하지 말 것**: IP12 수정 후 기존 IA06 계획 유지
✅ **권장**: IA06 계획 재생성

**수정 절차**:
```
IA37에서 기존 Maintenance Plan 삭제
→ IA06에서 새로운 전략 적용
→ IA38에서 새 계획 라인 확인
```

### 3. Tolerance 파라미터 불합리
❌ **하지 말 것**: Tolerance Before = 30 days (너무 넓음)
✅ **권장**: Tolerance Before = 3~7 days

**문제**: Tolerance가 크면 계획의 의미 상실 (예: 1월 계획을 3월에 완료 인정)

### 4. Counter-based 카운터 미 등록
❌ **하지 말 것**: IA05 (Counter-based 계획) 정의만 하고 Counter 값 미입력
✅ **권장**: 정기적으로 T-code: IA41 (Measuring Point)에서 카운터 값 업데이트

**설정**:
```
T-code: IA41 → Equipment MOT-PRESS-01
├── Measuring Point: OPERATING-HOURS
├── Current Reading: 12450 (현재 누적 시간)
├── Last Recorded: 2024-01-15
└── Update Frequency: 주 1회 (수동/자동)
```

### 5. Shift Factor 미설정 (3교대 운영)
❌ **하지 말 것**: Shift Factor = 1.0 (표준 시간 기준)
✅ **권장**: Shift Factor = 1.5~2.0 (3교대 운영)

**계산 예**:
- 표준: 1일 = 8시간 근무
- 3교대: 1일 = 24시간 운영 → Shift Factor = 3.0
- 실제: 1일 = 20시간 운영 (야간 운영 시간 제약) → Shift Factor = 2.5

### 6. 한국 현장: 예비부품 미 연계
❌ **하지 말 것**: Job List에 필요 부품만 기재, 구매오더 미생성
✅ **권장**: Job List 부품 → 자동 구매요청 생성 (T-code: ME51N)

**설정**:
```
Job List 작업 단계별 Material:
├── Material: Oil ISO 46, Qty: 1L
├── Material Master (T-code: MM01)
│   └── Purchasing View → Replenishment Strategy = "Order Point"
└── Automatic PR (구매요청) 생성 활성화
   → SPRO > Materials Management > Purchasing
   → Auto. Calculation of Purchase Requirements
```

## S/4 HANA 신기능

### 1. 예측 보전 (Predictive Maintenance)
- IoT 센서 → SAP Analytics Cloud
- ML 모델: 과거 데이터 기반 고장 예측
- T-app: "SAP Analytics Cloud — Predictive Maintenance" (추가 구독)

### 2. 모바일 작업 실행
- SAP Fiori App: "Create Maintenance Order" (iOS/Android)
- 바코드 스캔: Equipment Number, Job List 빠른 입력
- 현장 사진/영상 첨부 가능

### 3. 실시간 Equipment 상태 모니터링
- Equipment Status Page (Fiori): Real-time Condition
- 센서 데이터 시각화 (Chart, Gauge)
- Threshold 알림 (자동 PM02 고장보전 오더 생성)

## 다음 단계
- 통보 카탈로그 정의 (IW21 ~ IW22) — `notification-catalog.md` 참조
- 외주 보전 관리 (Contractor Orders) — Advanced Topic
- 보전 이력 분석 및 RCA (Root Cause Analysis) — 고급 실무
