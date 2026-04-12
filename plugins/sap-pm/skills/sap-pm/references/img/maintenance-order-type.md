# 보전오더유형(Maintenance Order Type) IMG 구성 가이드

## SPRO 경로
```
SPRO → Plant Maintenance → Maintenance Orders
├── Order Management
│   ├── Define Order Types (오더유형 정의)
│   ├── Order Completion Profile (결산프로파일)
│   ├── Set Number Ranges (번호범위)
│   └── Define Status Profile (상태 프로파일)
└── Cost Assignment
    ├── Cost Centers (원가센터)
    ├── Internal Orders (내부오더)
    └── Settlement Rules (KO88)
```

## 필수 선행 구성
- [ ] Plant 정의 및 Maintenance Plant 할당 (기본)
- [ ] Cost Centers 정의 (FI)
- [ ] Internal Order Types 정의 (CO)
- [ ] Number Ranges 준비 (예: PM-000001, PM-999999)
- [ ] Status Profiles 생성 (BS01, BS02 등)

## 구성 단계

### 1단계: 표준 오더유형 정의 (Order Types)

**T-code: OMJ5** (Create Order Type) 또는 SPRO에서 직접

#### 1-1. PM01 — 예방보전 (Preventive Maintenance)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Order Type | `PM01` | 고정 코드 |
| Description | `예방보전 오더` | 한국어 가능 |
| Order Category | `30` | PM 오더 기본값 |
| Number Range | `PM01` | 예: PM01-000001 |
| Status Profile | `BS01` | 표준 보전오더 상태 |
| Completion Profile | `COMP01` | 반자동 결산 |
| Settlement Profile | `SETTLE01` | Cost Center 할당 |
| Costing Sheet | `1` | 표준 원가 계산 |

**T-code: OMJ5 상세 설정**:
```
Costing Data:
├── Costing Variant = 1 (Standard)
├── Valuation Variant = 1
├── User Status (Enabled)
│   └── Status: CREAT, PLAN, REL, IN-PROG, COMPLETE, CLOSED
└── System Status = CRTD, REL, CNF, TECO, CLSD
```

#### 1-2. PM02 — 고장보전 (Breakdown Maintenance)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Order Type | `PM02` | 긴급 대응용 |
| Description | `고장보전 오더` | 예방보전과 구분 |
| Order Category | `30` | PM |
| Number Range | `PM02` | PM02-000001 |
| Status Profile | `BS02` | 신속 결산 (TECO 자동) |
| Completion Profile | `COMP02` | **자동 결산** |
| Priority | `1` (Urgent) | 작업 우선순위 |
| Settlement Profile | `SETTLE02` | 빠른 비용 반영 |

**차별점**:
- Automatic Settlement: 체크 (고장 수리 → 즉시 결산)
- Priority 기본값: 1 (높음) → 작업 큐에서 우선 처리

#### 1-3. PM03 — 점검 (Inspection)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Order Type | `PM03` | 정기 점검용 |
| Description | `장비 점검 오더` | 시각/음향 검사 |
| Order Category | `30` | PM |
| Number Range | `PM03` | PM03-000001 |
| Status Profile | `BS01` | 표준 |
| Completion Profile | `COMP03` | 수동 결산 (검사 결과 기록 필요) |
| Settlement Profile | `SETTLE01` | |

**특징**:
- 보전 작업보다 기록 중심
- Checklist 기능 통합 가능 (Custom 스킬)

#### 1-4. PM04 — 개보수 (Modification/Capital Project)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Order Type | `PM04` | 설비 개선/업그레이드 |
| Description | `개보수 오더` | 자본 지출(CapEx) |
| Order Category | `30` | PM |
| Number Range | `PM04` | PM04-000001 |
| Status Profile | `BS03` | 장기 프로젝트용 |
| Completion Profile | `COMP04` | Fixed Asset 자동 생성 |
| WBS Link | **필수** | 작업분해도 연계 |
| Settlement Profile | `SETTLE04` | Asset → Finance 연계 |

**특징**:
- Asset 생성 기능 (T-code: AS01 자동 연계)
- FI 고정자산 계정에 자동 기입

#### 1-5. PM09 — 통보 연계 (Notification-based)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Order Type | `PM09` | 통보(IW21)에서 오더 자동 생성 |
| Description | `통보 기반 오더` | 예: 고장 통보 M1 |
| Order Category | `30` | PM |
| Number Range | `PM09` | PM09-000001 |
| Status Profile | `BS02` | 신속 처리 |
| Completion Profile | `COMP02` | 자동 결산 |

**연계 규칙** (다음 섹션):
- IW21 (고장 통보) → 자동으로 PM09 오더 생성
- 통보 우선순위 → 오더 우선순위 상속

### 2단계: 번호범위 정의 (Number Ranges)

**T-code: IMG_ORDERTYPE_001** 또는 **SNRO**

```
Order Type   | From      | To        | External Numbering
PM01         | PM01-00001| PM01-99999| Disabled (자동)
PM02         | PM02-00001| PM02-99999| Disabled
PM03         | PM03-00001| PM03-99999| Disabled
PM04         | PM04-00001| PM04-99999| Disabled
PM09         | PM09-00001| PM09-99999| Disabled
```

**설정 확인**:
```
T-code: SNRO
→ Number Range Object = ORDERID
→ Range Name = PM01, PM02, PM03, PM04, PM09
→ Current Number = PM01-00001 (처음)
```

**External Numbering 옵션**:
- ✅ 체크 = 사용자가 오더 번호 수동 입력 (권장 안 함)
- ❌ 미체크 = SAP 자동 채번 (권장)

### 3단계: 상태 프로파일 (Status Profile)

**T-code: OMS9** (Create Status Profile) 또는 **OMJ4**

#### BS01 — 표준 보전오더 상태 (예방보전, 점검용)

```
Status Sequence:
1. CRTD (Created) — 오더 신규 생성
   └─→ 다음: PLAN, CLSD
2. PLAN (Planned) — 계획 작성 완료
   └─→ 다음: REL, CLSD
3. REL (Released) — 작업팀에 배정
   └─→ 다음: IN-PROG, CLSD
4. IN-PROG (In Progress) — 작업 진행 중
   └─→ 다음: COMPLETE
5. COMPLETE (Completed) — 작업 완료
   └─→ 다음: CNFMD (Confirmed 확인), TECO (기술 결산)
6. CNFMD (Confirmed) — 작업 확인됨
   └─→ 다음: TECO
7. TECO (Technically Completed) — 기술적 완료
   └─→ 다음: CLSD (결산), REOPEN (재개)
8. CLSD (Closed) — 최종 결산 완료
   └─→ 더 이상 변경 불가
```

**User Status** (사용자 정의):
```
BUS01 = 예방보전 표준
├── UMS1: "계획 필요" (PLAN 전)
├── UMS2: "계획 완료" (PLAN)
├── UMS3: "작업 진행" (IN-PROG)
└── UMS4: "완료 대기" (완료 후 확인 대기)
```

#### BS02 — 신속 보전오더 상태 (고장보전용)

```
Status Sequence (간소화):
1. CRTD (Created)
   └─→ REL (직접 배정, PLAN 스킵)
2. REL (Released)
   └─→ IN-PROG, TECO (바로 완료 가능)
3. IN-PROG (In Progress)
   └─→ TECO (완료 후 즉시 기술 결산)
4. TECO (Technically Completed)
   └─→ CLSD (자동 재무 결산)
5. CLSD (Closed)
```

**특징**: COMPLETE, CNFMD 상태 스킵 → 신속 처리

### 4단계: 결산 프로파일 (Completion Profile)

**T-code: OPS1** 또는 **SPRO > Plant Maintenance**

#### COMP01 — 반자동 결산 (예방보전)

```
Settlement Parameters:
├── Automatic Settlement: 미체크 (수동 결산 필수)
├── Settlement When Status: TECO (기술 결산 시점)
├── Retain Object Costs: 체크 (비용 기록 유지)
└── Variance Analysis: 체크 (예산 대비 실적 비교)
```

**프로세스**:
1. PM01 오더 TECO (기술 결산)
2. 수동으로 "Settlement" 버튼 클릭
3. FI에서 자동 비용 전기

#### COMP02 — 자동 결산 (고장보전)

```
Settlement Parameters:
├── Automatic Settlement: ✅ 체크
├── Settlement Automatically When: TECO
├── Create FI Documents: ✅ (회계 전기 자동)
├── Post to: Cost Center (기본) / Internal Order
└── Clearing Account: 예정 비용 계정 (FI 계정과목)
```

**프로세스**:
1. PM02 오더 TECO 상태 도달 시
2. 자동으로 FI 회계 전기
3. Cost Center 비용 누적

### 5단계: 원가 할당 규칙 (Cost Assignment Rules)

**T-code: KO88** (Settlement Rule) 또는 **SPRO**

#### PM01 예방보전 오더 원가 할당

```
Allocation Rule (규칙):
1. Receiver: Cost Center
   ├── Cost Center = Equipment의 Cost Center (자동 상속)
   ├── Cost Element = 4200 (예방보전 비용)
   └── 배분율 = 100%

2. Receiver: Internal Order (선택)
   ├── Internal Order = KO10 (설비유지비)
   └── Cost Element = 4210 (설비유지 비용)
   
Example Table:
┌─────────────────────────────────────────┐
│ 비용 구분        │ 배분처  │ 배분율 │ 비고 │
├─────────────────────────────────────────┤
│ 노무비(Labor)    │ CC 6500 │ 70%  │ 작업시간 │
│ 부품비(Parts)    │ CC 6500 │ 30%  │ 재료비  │
│ 외주비(Outsourcing) │ IO KO10 │ 100% │ 외부업체 │
└─────────────────────────────────────────┘
```

**설정 경로**:
```
SPRO > Plant Maintenance > Maintenance Orders 
→ Cost Assignment 
→ Edit Settlement Rules for PM01 (T-code: KO88)
```

#### PM02 고장보전 오더 원가 할당

```
Special Rules:
├── Emergency Surcharge: Cost Element 4201 (긴급비용 추가)
│   └── 배분율: 10% (고장 대응 시간 프리미엄)
├── Equipment Downtime: Cost Element 4202 (설비 정지비)
│   └── 배분율: 가변 (운영 비용 추적)
└── After-sales Support: Cost Element 4203 (A/S 비용)
    └── 배분율: Warranty 기간 구분
```

### 6단계: 우선순위 설정 (Priority Configuration)

**T-code: SPRO > PM > Order Types**

| Priority | 코드 | 설명 | 응답시간 |
|----------|------|------|---------|
| 1 | EMERG | 긴급 (고장보전) | 1시간 |
| 2 | HIGH | 높음 (예방보전 지연) | 4시간 |
| 3 | MED | 중간 (정상 예방) | 1일 |
| 4 | LOW | 낮음 (개선 작업) | 1주일 |

**오더유형별 기본 Priority**:
```
PM01 (예방보전) → Priority 3 (Medium)
PM02 (고장보전) → Priority 1 (Emergency)
PM03 (점검) → Priority 2 (High)
PM04 (개보수) → Priority 4 (Low)
PM09 (통보 연계) → 통보의 우선순위 상속
```

## 구성 검증

**T-code: IW31** (Create Maintenance Order 테스트)

1. Order Type = PM01 선택
2. Equipment = MOT-PRESS-01 입력
3. 자동 채움:
   - Order Number: PM01-000001 (자동)
   - Cost Center: 6500 (Equipment에서 상속)
   - Priority: 3 (기본값)
   - Status: CRTD (Created)

**T-code: IW32** (List Maintenance Orders)

```
Search Criteria:
├── Order Type = PM01
├── Status = TECO (기술 결산 완료)
└── Display: 모든 완료된 예방보전 오더 확인
   └─→ Cost Center별 비용 소계 확인
```

**T-code: KOA1** (Orders → Costs Report)

```
Report: PM Order Costs
├── Order Type = PM01
├── Date Range = 지난 3개월
└── Display: 
   └─→ Cost Element별 비용 분석
   └─→ Equipment별 총 유지비 추출
```

## 주의사항

### 1. 오더 번호 채번 오류
❌ **하지 말 것**: Number Range를 나중에 수정 (기존 오더 충돌)
✅ **권장**: 초기 구성 시 신중히 설계, 이후 변경 최소화

**오류 시 해결**:
```
T-code: SNRO
→ Number Range Object = ORDERID
→ Blocked Number Range 재설정 불가
→ 새로운 Range 추가 (예: PM01_V2)
```

### 2. Status Profile 순환 오류
❌ **하지 말 것**: Status에서 이전 상태로 돌아가기 가능하게 설정 (감사 추적 어려움)
✅ **권장**: 단방향 흐름 (CRTD → PLAN → REL → IN-PROG → TECO → CLSD)

**순환 방지**:
```
OMJ4에서 Status Transition 설정 시
"Back Status" 옵션 비활성화
```

### 3. 자동 결산 시기 실수
❌ **하지 말 것**: COMPLETE 상태에서 결산 (기술 완료 전 재무 처리)
✅ **권장**: TECO (기술 결산) 시점에 재무 결산

**설정**:
```
Completion Profile (OPS1)
→ Settlement When Status = TECO (필수)
→ NOT "COMPLETE" (오류)
```

### 4. 한국 현장 비용 추적 어려움
❌ **하지 말 것**: Cost Center 없이 일괄 "Maintenance" 계정화
✅ **권장**: Equipment/설비별 Cost Center 분리 → 부서장 관리 용이

**구조**:
```
Cost Center 계층:
├── 6000: 보전부 (총괄)
│   ├── 6100: 프레스팀
│   ├── 6200: 용접팀
│   └── 6300: 전기팀
├── 6500: 설비관리 (Equipment cost center)
└── 6600: 외주관리
```

### 5. PM02 고장보전 시 결산 지연 문제
❌ **하지 말 것**: 고장보전도 COMP01 (반자동 결산) 사용
✅ **권장**: PM02는 COMP02 (자동 결산) 설정 → 즉시 비용 반영

**이유**: 고장 원인 분석 + 예방조치는 별도 통보 IW21로 처리

### 6. 통보-오더 연계 설정 누락
❌ **하지 말 것**: PM09를 정의했으나 통보유형과 미연계
✅ **권장**: 
```
SPRO > PM > Notifications → Define Notification Type (QM01)
→ "Create Order" = ✅ (체크)
→ Order Type = PM09 (선택)
```

## S/4 HANA 신기능

### 1. 실시간 원가 (Real-time Costing)
- ECC: 월 말 결산 배치 작업
- S/4: TECO 시점에 즉시 반영 (T-code: CKML_COST_VIEW)

### 2. Fiori 앱 지원
- SAP Fiori "Maintenance Order" (모바일 오더 생성)
- SAP Fiori "Maintenance Order Execution" (작업 진행 추적)

### 3. 자동 문제 코드 제안
- ML 기반: Equipment 이력 분석 → 자동 Problem Code 제안
- T-code: /N/SCWM/ANALYTICS (분석 대시보드)

## 다음 단계
- 예방보전 계획 및 스케줄링 (IP11, IA01) — `preventive-maintenance.md` 참조
- 통보 카탈로그 구성 (IW21 ~ IW22) — `notification-catalog.md` 참조
- 고장 패턴 분석 및 근본 원인 제거 (RCA — Root Cause Analysis)
