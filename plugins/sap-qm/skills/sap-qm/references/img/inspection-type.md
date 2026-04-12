# 검사유형(Inspection Type) IMG 구성 가이드

## SPRO 경로
```
SPRO → Quality Management → Master Data
├── Inspection Lot Source (검사로트 발생 조건)
├── Inspection Type (검사유형)
│   ├── Define Inspection Types (OIS1, OIS2)
│   ├── Activate QM for Material (QA37)
│   └── Assign Inspection Type to Material/Plant
└── Inspection Status Management
```

## 필수 선행 구성
- [ ] Plant 및 Quality Control Plant 정의
- [ ] Material Master 생성 완료 (MM01)
- [ ] Inspection Plans 준비 (QP01, QP02)
- [ ] Sampling Procedures 정의 (QDV1, QDV2)

## 구성 단계

### 1단계: 검사유형 정의 (OIS1)

**T-code: OIS1** 또는 **SPRO > Quality Management > Inspection Type**

#### 01 — 수입검사 (Incoming Inspection)

| 필드 | 값 | 설명 |
|------|----|----|
| Inspection Type | `01` | 입고 물품 검사 |
| Description | `수입검사` | 한국어 가능 |
| Insp. Lot Source | GR (Goods Receipt) | MM 입고에서 자동 생성 |
| Insp. Plan Type | Material-based (QP02) | 자재별 검사계획 |
| Insp. Stock Posting | ✅ 활성화 | Q-Stock 생성 |
| Auto. Insp. Lot Creation | ✅ | 입고 시 자동 검사로트 |
| Default Sampling | QDV1 — Attributes | 합격/불합격 판정 |
| Lot Completion | User Decision (QA34) | 사용결정 필수 |

**프로세스**:
```
MM01 입고 (Goods Receipt)
└─→ 자동으로 01 검사로트 생성 (QA33)
    ├── 검사 스톡 (Q-Stock) 자동 생성
    ├── 합격품: 자유재고 (Unrestricted)
    ├── 불합격: 반품/폐기
    └─→ 공급업체 평가 자동 반영 (Qty, Quality)
```

#### 03 — 공정검사 (In-Process Inspection)

| 필드 | 값 | 설명 |
|------|----|----|
| Inspection Type | `03` | 생산 중 검사 |
| Description | `공정검사` | 한국어 가능 |
| Insp. Lot Source | PP (Production Confirmation) | 생산 확인에서 자동 생성 |
| Insp. Plan Type | Routing-based (QP01) | 공정 경로별 검사 |
| Insp. Stock Posting | ❌ 비활성화 | Q-Stock 안 생성 (생산 진행) |
| Auto. Insp. Lot Creation | ✅ | 생산확인 시 자동 |
| Default Sampling | QDV2 — Variables | 수치 측정 (치수, 무게) |
| Block Confirmation Until | ✅ | 검사 완료 시까지 생산 블록 |

**프로세스**:
```
PP 생산확인 (Confirmation)
└─→ 공정 03 검사로트 자동 생성
    ├── 생산오더 상태: INSPC (Inspection)로 블록
    ├── QA 검사 수행
    └─→ 사용결정 (QA34)
        ├── 합격 (ACCEPTED): 생산 계속
        ├── 불합격 (REJECTED): 재작업 지시 (재작업오더 생성)
        └─→ 공정 불량률 자동 계산
```

#### 04 — 출하검사 (Final Inspection)

| 필드 | 값 | 설명 |
|------|----|----|
| Inspection Type | `04` | 완제품 출하 전 검사 |
| Description | `출하검사` | 한국어 가능 |
| Insp. Lot Source | PI (Packing Instruction) / Delivery | 배송 준비 시점 |
| Insp. Plan Type | Material-based (QP02) | 완제품 검사 기준 |
| Insp. Stock Posting | ✅ | 합격품만 배송 |
| Auto. Insp. Lot Creation | ✅ | 배송 지시 시 자동 |
| Default Sampling | QDV1 + QDV2 | 정성 + 정량 |
| Block Delivery Until | ✅ | 합격까지 배송 지연 |

**프로세스**:
```
SD 배송 준비 (Delivery Creation)
└─→ 자동 04 출하검사 로트 생성
    ├── 완제품 Q-Stock 자동 생성
    ├── 현장 최종 검사
    └─→ 사용결정
        ├── ACCEPTED: 배송 전기, Billing
        └─→ REJECTED: 반품 접수
```

#### 08/09 — 반복/원천검사 (Repetitive/Source)

| 필드 | 값 | 설명 |
|------|----|----|
| Inspection Type | `08` / `09` | 공급업체 정기 검사 |
| Insp. Lot Source | Manual / Periodic | 계획적 검사 |
| Default Plan | Supplier Quality Plan | 공급업체별 맞춤 |
| Result Evaluation | Lot-based | 로트 전체 평가 |

### 2단계: Material별 QM 활성화 (QA37)

**T-code: QA37** 또는 **Material Master (MM02)**

각 자재에 대해 어떤 검사유형을 활성화할지 정의합니다.

#### 예시: 완성차 핵심 부품 (자동차 부품사)

```
Material: BEARING-NSK (베어링)

QM Activation (QA37):
├── Plant: 1000
├── Material: BEARING-NSK
└── Inspection Types:
    ├── Insp. Type 01 (수입검사) ✅
    │   └── Inspection Plan: QP02-BEARING (Material 기반)
    │   └── AQL: 1.0 (표준)
    │
    ├── Insp. Type 03 (공정검사) ❌ (구매부품, 공정검사 불필요)
    │
    ├── Insp. Type 04 (출하검사) ✅
    │   └── Inspection Plan: QP02-BEARING-OQC
    │   └── AQL: 0.65 (엄격)
    │
    └── Insp. Type 08 (원천검사) ✅
        └── Frequency: Quarterly (분기별 공급업체 감사)
```

**설정 필드** (MM02 → Quality View):
```
Tab: Quality Management
├── Insp. Type 01: 
│   ├── Inspection Lot Mandatory = ✅
│   ├── Insp. Plan Code = QP02-BEARING
│   └── Insp. Lot Blocking = ✅ (검사 완료까지 블록)
├── Insp. Type 04:
│   ├── Insp. Plan Code = QP02-BEARING-OQC
│   └── Insp. Lot Blocking = ✅
└── Insp. Type 08:
    ├── Periodic Check Frequency = QTR (분기)
    └── Auto. Lot Creation = Monthly
```

### 3단계: Inspection Type별 Stock Posting Rules

**T-code: SPRO > QM > System Administration > Stock Posting Rules**

검사 후 결과에 따라 자재가 어디로 전기될지 정의합니다.

#### 01 수입검사 Stock Posting

```
Rule Set: INSP-TYPE-01-STOCK

Accepted (합격):
├── Source: Q-Stock (검사 스톡)
├── Target: Unrestricted Stock (자유 재고)
└── Qty: 100%

Rejected (불합격):
├── Source: Q-Stock
├── Option A: Return to Vendor
│   └── Target: Return Stock (반품 상태)
│   └── Qty: 100%
├── Option B: Scrap
│   └── Target: Scrap (폐기)
│   └── Document: 폐기 증명서
└── Option C: Rework
    └── Target: In-Quality Inspection (재검사)
    └── Qty: 재검 샘플 수

Conditional (조건부):
├── Source: Q-Stock
├── Target: Restricted Stock (제한 재고)
├── Qty: 50% (선별 후 재평가)
└── Document: 선별 기록
```

**T-code: SPRO 설정**:
```
SPRO > Quality Management → System Administration
→ Stock Posting Rules for Inspection Lots

Create Entry:
├── Inspection Type: 01
├── Insp. Plan: QP02
├── Material: BEARING-NSK
├── Plant: 1000
└── Stock Posting Logic:
    ├── IF Decision = ACCEPTED
    │  └─→ Post to: Unrestricted
    ├── IF Decision = REJECTED
    │  └─→ Post to: Return-to-Vendor (반품 재고)
    └── IF Decision = CONDITIONAL
       └─→ Post to: Restricted (검사 대기 재고)
```

### 4단계: 검사로트 자동 생성 조건 설정

**T-code: SPRO > QM > Inspection Lot Source**

각 Inspection Type별로 언제 자동으로 검사로트를 생성할지 정의합니다.

#### Type 01 (수입검사) 자동 생성 조건

```
Inspection Lot Source for Type 01:

GR (Goods Receipt) 입고 시:
├── Material Inspection Type 01 = ✅
├── Plant QM Activated = ✅
├── Quality Control Plant Assigned = ✅
└─→ 자동으로 검사로트 생성

Optional Conditions:
├── Vendor Quality Rating < 85% → 자동 검사 필수
├── Material Change (BOM 변경) → 재검사 강제
└── Batch Number Link → 로트별 추적 (식품, 의약품)
```

**실제 프로세스**:
```
MM02_GOODS_RECEIPT (입고 처리)
└─→ Material Master → Insp. Type 01 ✅ 확인
└─→ QA33 자동 호출
    ├── Insp. Lot = 202401-0001 (자동 채번)
    ├── Material = BEARING-NSK
    ├── Qty = 입고 수량
    ├── Insp. Plan = QP02-BEARING (Material에서 상속)
    ├── Sampling Procedure = QDV1 (Attributes)
    └─→ Status = OPEN (검사 대기)
```

#### Type 03 (공정검사) 자동 생성 조건

```
Inspection Lot Source for Type 03:

PP CONFIRMATION (생산확인) 시:
├── Routing에 Inspection Point ✅
├── Material Inspection Type 03 = ✅
├── Operation Contains Insp. Flag = ✅
└─→ 공정검사 자동 생성

Conditions:
├── Lot Size: 50개마다 샘플 10개 검사
├── Frequency: 매 작업
└── Blocking: 검사 완료까지 생산오더 블록 (INSPC)
```

## 구성 검증

**T-code: QA37** (Material Inspection Info)

```
검증 체크리스트:

1. Material QM 활성화 확인:
   ├── Material: BEARING-NSK
   ├── Inspection Types: 01, 04, 08 ✅
   └── Inspection Plans: 연결됨 확인

2. GR 입고 테스트:
   ├── 입고 처리 (MM01)
   ├── 자동 검사로트 생성 확인 (QA32 → 자동 생성)
   ├── Q-Stock 확인 (MB52 → 검사 스톡)
   └─→ Status: OPEN (검사 대기)

3. Stock Posting 검증:
   ├── QA34 (사용결정) 수행
   ├── ACCEPTED: Unrestricted Stock 전기 확인
   └─→ MB51 (Goods Movement) 기록 확인

4. Sampling 검증:
   ├── QA32에서 Sampling Procedure 적용 확인
   ├── Sample Qty: AQL에 따른 계산 확인
   └─→ 예: 1000개 입고 → AQL 1.0 → Sample 125개 (12.5%)
```

## 주의사항

### 1. Inspection Type 활성화 누락
❌ **하지 말 것**: Material Master에 QM 정보 미입력
✅ **권장**: MM02 → Quality View → Inspection Type 필수 활성화

### 2. Inspection Plan 미연결
❌ **하지 말 것**: Inspection Type만 활성화, Plan 미지정
✅ **권장**: Material별 QA37에서 Plan Code 명시

**오류 메시지**:
```
"No Inspection Plan Found for Material BEARING-NSK, Insp. Type 01"
→ QA37 또는 QP02에서 Plan 생성 및 할당
```

### 3. Stock Posting Rules 미설정
❌ **하지 말 것**: 검사 결과 후 재고 자동 전기 미연계
✅ **권장**: SPRO → Stock Posting Rules에서 Accept/Reject 규칙 정의

### 4. 한국 현장: Batch Number 추적 부재
❌ **하지 말 것**: 수입 검사 결과와 Material Batch 무관
✅ **권장**: Material Master에 "Batch Management" 활성화 → 검사로트와 Batch 연계

**설정**:
```
MM02 → Additional Data → Batch Management = ✅
→ 검사 불합격 시 특정 Batch 격리 가능
```

### 5. Vendor Quality Rating 미반영
❌ **하지 말 것**: 모든 공급업체 동일 검사 기준
✅ **권장**: QE04 (Vendor Rating) 결과 → QA37 Inspection Lot Mandatory 자동화

```
Rule:
├── IF Vendor Rating < 80% → Type 01 검사 필수
├── IF Vendor Rating ≥ 95% → Type 01 검사 선택
└─→ 신뢰 공급업체는 검사 비용 절감
```

## S/4 HANA 신기능

### 1. AI 기반 검사 계획 제안
- ML 분석: 과거 데이터 기반 최적 Sampling Size 제안
- 예: "이 부품은 불량률 0.5% → AQL 1.0 권장"

### 2. Blockchain 기반 공급 체인 추적
- Supplier → Transportation → Inspection → Production → Customer까지 전체 추적
- T-app: "Supply Chain Visibility" (추가 구독)

### 3. 모바일 검사 결과 입력
- SAP Fiori: "Record Inspection Results" (태블릿 앱)
- 실시간 데이터 입력, 사진 첨부

## 다음 단계
- 검사계획 상세 구성 (QP01, QP02) — `inspection-plan.md` 참조
- 사용결정 규칙 정의 — `usage-decision.md` 참조
- 공급업체 평가 및 RCA — Advanced Topic
