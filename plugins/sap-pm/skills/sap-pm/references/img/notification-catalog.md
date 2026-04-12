# 통보(Notification) 카탈로그 IMG 구성 가이드

## SPRO 경로
```
SPRO → Plant Maintenance → Maintenance Orders → Notifications
├── Define Notification Types (통보유형 정의)
│   ├── M1 — Breakdown (고장 통보)
│   ├── M2 — Maintenance Request (보전요청)
│   ├── M3 — Activity Report (활동보고)
│   └── M4 — Service Request (서비스요청)
├── Catalog Definition (통보 카탈로그)
│   ├── Damage Code (손상코드)
│   ├── Cause Code (원인코드)
│   └── Activity Code (활동코드)
├── Partner Determination (파트너결정)
└── Workflow Integration (워크플로 통합)
```

## 필수 선행 구성
- [ ] Plant 및 Maintenance Plant 정의 완료
- [ ] Maintenance Order Types (PM01~PM09) 정의 완료
- [ ] Notification Types 기본 구조 정의 필요 (T-code: QM01)
- [ ] Work Centers (보전팀) 정의 (SPRO > PP)
- [ ] Cost Centers 정의 (FI)

## 구성 단계

### 1단계: 통보유형 정의 (QM01)

**T-code: QM01** (Create Notification Type)

SAP의 통보(Notification) 기능은 품질관리(QM)와 보전(PM)을 통합합니다.

#### 통보유형 M1: 고장 통보 (Breakdown)

**목적**: 설비 고장/불량 발생 시 신속한 대응

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `M1` | 고장 통보 |
| Description | `고장 통보` | 한국어 가능 |
| Notification Category | Maintenance | PM과 연계 |
| Is a Malfunction | ✅ (체크) | 고장으로 분류 |
| Create Order Automatically | ✅ | 자동으로 PM02 오더 생성 |
| Order Type for Auto Creation | `PM02` | 고장보전 오더 |
| Catalog Profile | `DAMCAT` | 손상코드 카탈로그 사용 |

**M1 프로세스 플로우**:
```
현장에서 고장 발견
└─→ T-code: IW21 (Create Notification M1)
    ├── Equipment = MOT-PRESS-01
    ├── Damage Code = "VIBRATION_HIGH" (과진동)
    ├── Cause Code = "BEARING_WEAR" (베어링 마모)
    ├── Required End Date = "즉시"
    └─→ Save
└─→ 자동으로 PM02 오더 생성 (Status: CRTD)
└─→ 보전팀에 배정 (자동 또는 수동)
└─→ 고장 수리 실행
└─→ PM02 오더 TECO (기술 완료)
└─→ 원가 자동 반영 (고장 유지비)
```

#### 통보유형 M2: 보전요청 (Maintenance Request)

**목적**: 설비 소유자(생산팀)의 예방보전 요청

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `M2` | 보전요청 |
| Description | `보전 요청` | 예방보전 신청 |
| Notification Category | Maintenance | PM과 연계 |
| Create Order Automatically | ❌ (미체크) | 검토 후 수동 생성 |
| Catalog Profile | `ACTIVITY` | 활동코드 카탈로그 |

**M2 프로세스 플로우**:
```
생산팀 요청: "모터 오일이 냄새 나요"
└─→ T-code: IW21 (Create Notification M2)
    ├── Equipment = MOT-PRESS-01
    ├── Activity Code = "MINOR_REPAIR" (작은 수리)
    ├── Required End Date = "3일 이내"
    └─→ Save
└─→ 보전팀 검토 (IW22)
    ├── Status = "Review" (검토 중)
    └─→ 조치 필요 여부 판단
└─→ 승인 시 PM01 오더 수동 생성 (T-code: IW31)
└─→ 오더 TECO → 통보 확인됨 (Completed)
```

#### 통보유형 M3: 활동보고 (Activity Report)

**목적**: 보전팀의 작업 완료 보고 및 품질 확인

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `M3` | 활동보고 |
| Description | `활동 보고서` | 작업 결과 기록 |
| Notification Category | Maintenance | |
| Create Order Automatically | ❌ | |
| Catalog Profile | `ACTIVITY` | |
| Approval Required | ✅ | 보전관리자 승인 필수 |

**M3 프로세스 플로우**:
```
보전팀: 완료된 작업 보고
└─→ T-code: IW21 (Create Notification M3)
    ├── Linked Order = PM01-000150 (완료된 오더)
    ├── Activity Description = "오일 교체 완료, 베어링 정상"
    ├── Work Completion Date = 2024-01-20
    ├── Photos/Documents 첨부 가능
    └─→ Save
└─→ 보전관리자 검토 (IW22)
    ├── Status = "Review" (검토 중)
    ├── Approval Status = "Pending" (승인 대기)
    └─→ 승인 또는 반려
└─→ 승인 시 PM01 오더와 자동 연계
└─→ KPI 수집: 평균 수리 시간, 비용 등
```

#### 통보유형 M4: 서비스요청 (Service Request)

**목적**: 외부 서비스업체(벤더, A/S 센터)의 기술 지원 요청

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Notification Type | `M4` | 서비스요청 |
| Description | `벤더 서비스 요청` | 외주 기술지원 |
| Notification Category | Maintenance | |
| Create Order Automatically | ✅ | 자동 PM03 (점검) 생성 |
| Order Type | `PM03` | 외주 점검 오더 |
| Partner Determination | ✅ | 제조업체 자동 선택 |

**M4 프로세스 플로우**:
```
고장 원인이 제조 결함 의심
└─→ T-code: IW21 (Create Notification M4)
    ├── Equipment = MOT-PRESS-01
    ├── Supplier = SIEMENS (제조사)
    ├── Service Request = "WARRANTY_CLAIM"
    ├── Description = "모터 과열, 제조 결함 의심"
    └─→ Save
└─→ 자동으로 PM03 오더 생성
└─→ Partner Determination: SIEMENS 엔지니어 자동 배정
└─→ 외주 PM03 실행
└─→ 불량 확인 → RMA (Return Merchandise Authorization) 처리
```

### 2단계: 카탈로그 프로파일 정의 (Catalog Profile)

**T-code: SPRO > PM > Notifications → Catalog Profile**

카탈로그는 표준화된 손상/원인/활동 코드를 제공하여 데이터 일관성을 보장합니다.

#### 2-1. 손상코드 카탈로그 (Damage Code)

**목적**: 고장의 증상(Symptom) 분류

**예시: 회전기계 손상코드**

| 코드 | 손상명 | 설명 | 심각도 |
|------|--------|------|--------|
| VIBRATION_HIGH | 과진동 | 베어링 마모, 불균형 | 높음 |
| NOISE_ABNORMAL | 비정상 소음 | 기어 마모, 베어링 손상 | 높음 |
| TEMPERATURE_HIGH | 과열 | 냉각 불량, 윤활 부족 | 중간 |
| LEAKAGE_OIL | 오일 누유 | 씰 손상, 패킹 마모 | 중간 |
| VIBRATION_LOW | 진동 없음 | 축 분리, 전기 단락 | 높음 |
| POWER_LOW | 저출력 | 압축 저하, 부분 막힘 | 중간 |
| OVERHEATING | 과열 | 냉각 불량 | 높음 |
| STRANGE_SMELL | 이상 냄새 | 오일 열화, 전기 타 | 중간 |

**설정 (SPRO)**:
```
SPRO > Plant Maintenance > Maintenance Orders > Notifications
→ Catalog Definition → Damage Code (손상코드)

Damage Code       = VIBRATION_HIGH
Damage Group      = 01 (기계적 고장)
Description       = 과진동
Priority Impact   = 1 (높음 - 즉시 정지)
Assign to Cause   = (자동 추천 원인코드)
├── BEARING_WEAR
├── IMBALANCE
└── MISALIGNMENT
```

#### 2-2. 원인코드 카탈로그 (Cause Code)

**목적**: 고장의 근본 원인(Root Cause) 분류

**예시: 회전기계 원인코드**

| 코드 | 원인명 | 설명 | 예방 조치 |
|------|--------|------|----------|
| BEARING_WEAR | 베어링 마모 | 수명 종료, 부하 과다 | 베어링 교체 (PM01) |
| IMBALANCE | 불균형 | 로터 편심, 부품 탈락 | 동적 밸런싱 (PM03) |
| MISALIGNMENT | 정렬 오류 | 축 비틀림, 좌표 이동 | 축 정렬 검사 (PM01) |
| LUBRICATION_LOW | 윤활 부족 | 오일 누수, 공급 중단 | 오일 교체 (PM01) |
| COOLING_FAIL | 냉각 불량 | 팬 고장, 핀 폐색 | 냉각기 청소 (PM01) |
| ELECTRICAL_FAULT | 전기 고장 | 권선 손상, 접촉 불량 | 권선 테스트 (PM03) |
| SEAL_DAMAGE | 씰 손상 | 기계씰 마모, 장수명 종료 | 씰 교체 (PM04) |
| ASSEMBLY_ERROR | 조립 오류 | 초기 조립 불량 | 재조립 (PM03) |

**설정 (SPRO)**:
```
SPRO > Plant Maintenance > Maintenance Orders > Notifications
→ Catalog Definition → Cause Code (원인코드)

Cause Code        = BEARING_WEAR
Cause Group       = 01 (부품 마모)
Description       = 베어링 마모로 인한 고장
Preventive Action = IA06 (보전계획: 50H 베어링 점검)
Material Link     = 베어링 부품 (구매 자동화)
```

#### 2-3. 활동코드 카탈로그 (Activity Code)

**목적**: 취한 조치(Action)의 표준화

**예시: 회전기계 활동코드**

| 코드 | 활동명 | 설명 | 예상 소요시간 |
|------|--------|------|--------------|
| REPLACE_BEARING | 베어링 교체 | 분해, 교체, 재조립 | 2~4시간 |
| CLEAN_FILTER | 필터 청소 | 오일/공기 필터 청소 | 0.5시간 |
| OIL_CHANGE | 오일 교체 | 드레인, 새 오일 주입 | 1시간 |
| BALANCE_ROTOR | 로터 밸런싱 | 동적 밸런싱 실행 | 3~5시간 |
| INSPECT_SEAL | 씰 점검 | 누유 여부 시각점검 | 0.5시간 |
| REPAIR_WINDING | 권선 수리 | 전기 권선 복구 | 6~8시간 |
| REPLACE_SEAL | 씰 교체 | 기계씰 완전 교체 | 3~4시간 |
| CALIBRATION | 정렬 조정 | 정렬 장비 사용 점검 | 1~2시간 |

### 3단계: 파트너결정 (Partner Determination)

**T-code: SPRO > Notifications → Partner Determination**

고장 유형에 따라 담당자를 자동으로 지정합니다.

#### 파트너 결정 규칙 정의

**예시: 고장 통보(M1) 파트너 자동 배정**

```
Rule 1: 기계적 고장 (Vibration, Noise)
├── Condition: Damage Code = VIBRATION_* OR NOISE_*
├── Partner Type = Work Center (보전작업중심)
├── Partner Selection = PM01 (기계 보전팀)
└── Assignment: 자동 배정, 긴급 알림

Rule 2: 전기 고장 (Electrical Fault)
├── Condition: Damage Code = ELECTRICAL_*
├── Partner Type = Work Center
├── Partner Selection = PM02 (전기 보전팀)
└── Assignment: 자동 배정

Rule 3: 서비스/외주 (Supplier Issue)
├── Condition: Notification Type = M4 (Service Request)
├── Partner Type = Vendor (공급업체)
├── Partner Selection = Equipment의 제조사
│   └─→ Equipment IM01 → Manufacturer = SIEMENS
│   └─→ Partner Determination 자동 조회
└── Assignment: 자동 이메일 발송
```

**설정 (SPRO)**:

```
SPRO > Notifications → Partner Determination

Header:
├── Assignment Rule Code = MAINT-PARTNER
├── Description = Maintenance Partner Assignment Rules
└── Validity: 2024-01-01 ~ 2099-12-31

Line 1:
├── Sequence = 01
├── Condition Type = Damage Code (손상코드)
├── Condition Value = VIBRATION_HIGH
├── Partner Type = Work Center (보전작업중심)
├── Partner Code = PM01 (기계팀)
├── Priority = 1 (첫번째 선택)
└── Notification = ✅ Send Email to PM01 Lead

Line 2:
├── Sequence = 02
├── Condition Type = Damage Code
├── Condition Value = ELECTRICAL_FAULT
├── Partner Type = Work Center
├── Partner Code = PM02 (전기팀)
└── Notification = ✅
```

### 4단계: 통보 프로파일 (Notification Profile)

**T-code: QM01의 "Catalog Profile" 탭**

각 통보유형이 어떤 카탈로그를 사용할지 정의합니다.

| 통보유형 | 필수 카탈로그 | 선택 카탈로그 | 승인 필요 |
|---------|--------------|--------------|---------|
| M1 (고장) | Damage, Cause, Activity | Quality Issue | Yes |
| M2 (요청) | Activity | Cause | No |
| M3 (보고) | Activity | Cause, Quality | Yes |
| M4 (외주) | Service Type | Cause | No |

**설정 예시 (M1)**:
```
Notification Type = M1
├── Catalog Profile = DAMCAT (손상 중심)
├── Required Fields:
│   ├── Damage Code (필수)
│   ├── Cause Code (필수)
│   ├── Required End Date (필수)
│   └── Description (필수)
├── Optional Fields:
│   ├── Photos/Attachments
│   ├── Environmental Conditions
│   └── Safety Hazards
└── Approval Workflow = Manager Review (보전관리자 검토)
```

## 구성 검증

**T-code: IW21** (Create Notification — 실제 테스트)

1. **M1 고장 통보 생성 테스트**:
   ```
   Create Notification M1:
   ├── Plant = 1000
   ├── Equipment = MOT-PRESS-01
   ├── Damage Code = VIBRATION_HIGH (손상 카탈로그에서 선택)
   ├── Cause Code = BEARING_WEAR (원인 카탈로그에서 선택)
   ├── Activity Code = REPLACE_BEARING (활동 카탈로그에서 선택)
   ├── Required End Date = 당일 (긴급)
   └─→ Save
   
   예상 결과:
   ├── Notification 자동 생성 (M1-000001)
   ├── PM02 고장보전 오더 자동 생성 (PM02-000001)
   ├── 파트너 결정: PM01 작업중심 자동 배정
   └─→ 보전팀장에게 이메일 알림
   ```

2. **M2 보전요청 생성 테스트**:
   ```
   Create Notification M2:
   ├── Activity Code = MINOR_REPAIR
   ├── Required End Date = 3일 이내
   └─→ Save
   
   예상 결과:
   ├── Notification 생성 (M2-000001)
   ├── PM02 오더 생성 안 함 (수동 검토 후 생성)
   └─→ 보전관리자 검토 대기
   ```

3. **카탈로그 검증** (T-code: **IW21 → Catalog 버튼**):
   ```
   Catalog Selection Dialog:
   ├── Damage Code 드롭다운 → VIBRATION_HIGH, NOISE_*, TEMPERATURE_* 확인
   ├── Cause Code 드롭다운 → BEARING_WEAR, IMBALANCE, ... 확인
   └── Activity Code 드롭다운 → REPLACE_BEARING, OIL_CHANGE, ... 확인
   ```

**T-code: IW22** (Notification List — 모니터링)

```
실행:
├── Plant = 1000
├── Notification Type = M1
├── Status = All (전체)
└─→ Display:
   ├── M1-000001 (고장) → PM02-000001 (오더 연계)
   ├── M1-000002 (고장) → PM02-000002
   └─→ 모든 통보가 오더와 연계 확인
```

## 주의사항

### 1. 카탈로그 코드 너무 상세함
❌ **하지 말 것**: 손상코드 50개 이상 정의 (선택 어려움)
✅ **권장**: 손상코드 10~20개, 자주 사용하는 것 중심

**권장 수량**:
- Damage Code: 15개 (기계, 전기, 유압 3그룹 × 5가지)
- Cause Code: 20개 (부품 마모, 조립, 환경 등)
- Activity Code: 25개 (교체, 청소, 검사, 수리 등)

### 2. 파트너 결정 규칙 미설정
❌ **하지 말 것**: Partner Determination 미설정 → 고장 통보 후 담당자 미배정
✅ **권장**: 최소 3가지 기본 규칙 정의 (기계팀, 전기팀, 외주)

### 3. 통보 승인 워크플로 미연계
❌ **하지 말 것**: 모든 통보 자동 오더 생성 (검토 스킵)
✅ **권장**: M3 (활동보고), M4 (외주)는 승인 필수 설정

**SAP Workflow 연계**:
```
SPRO > Plant Maintenance > Notifications → Workflows
└─→ Workflow = NOTIFICATION_APPROVAL (기본 제공)
    ├── Event = Notification Created (M3, M4)
    ├── Task = Manager Review
    └─→ Approval → Auto-create Order
```

### 4. 한국 현장: 언어 혼용 오류
❌ **하지 말 것**: 손상코드 영문만 사용 (현장 작업자 혼동)
✅ **권장**: 코드는 영문, Description은 한국어

**설정**:
```
Damage Code     = BEARING_WEAR (영문 ID)
Description     = 베어링 마모 (한국어 설명)
Additional Text = "축 주변부에서 소음 발생, 분해 점검 필요"
```

### 5. 통보 미완료 → 오더 미종료 문제
❌ **하지 말 것**: 오더만 결산(TECO), 통보는 Open 상태 유지
✅ **권장**: 통보와 오더를 함께 종료 (일관성)

**프로세스**:
```
PM01 오더 TECO
└─→ 자동으로 연계된 M1 통보 → Status "COMPLETED"
└─→ 통보 닫기 (IW22 → Complete)
```

## S/4 HANA 신기능

### 1. 모바일 통보 생성
- SAP Fiori App: "Create Notification" (모바일 최적화)
- 카메라: 현장 사진 실시간 첨부
- 위치 정보: GPS 기반 Equipment 자동 선택

### 2. 자동 파트너 추천
- ML 기반: 과거 유사 고장 → 담당자 자동 추천
- Recommendation Engine: 정확도 90% 이상

### 3. 통보 AI 분석
- Natural Language Processing (NLP)
- 자유 텍스트 입력 → 자동 Damage Code 매핑
- 예: "모터에서 이상한 냄새가 나요" → Damage: STRANGE_SMELL, Cause: OVERHEATING 자동 추천

## 확장: 워크플로 통합 (Advanced)

**T-code: SWDD** (Workflow Definition)

```
Workflow: NOTIFICATION_MAINT_001

Step 1: Notification Created (통보 생성)
├── Event: QM_NOTI_CREATE (IW21에서)
└─→ Auto-task: Partner Determination (파트너 자동 배정)

Step 2: Order Created? (오더 생성 여부)
├── Condition: M1 (고장) → 자동 오더 생성
├── Path A (자동): PM02 오더 → Work Center 배정
└─→ Path B (수동): M2 (요청) → Manager Review

Step 3: Manager Approval (관리자 검토)
├── User Task: Review Notification
├── Decision: Approve / Reject
└─→ Approve: Order 계속 진행
    └─→ Reject: Order 취소, Notification 반려

Step 4: Order Completion (오더 완료)
├── Event: Order TECO
└─→ Auto-task: Close Notification, Update Equipment Master
    └─→ Equipment의 마지막 PM 날짜 자동 업데이트
```

## 다음 단계
- 보전계획 스케줄링 (IA37, IP30) — `preventive-maintenance.md` 참조
- 고장 원인 분석 및 RCA (Root Cause Analysis)
- 보전비 분석 및 ROI 계산 (KPI)
