# QM (Quality Management) IMG 트리 가이드

## 개요
QM 모듈은 제품/서비스 품질 관리의 전 영역을 다룹니다. 입수검사(IQC), 공정검사(PQC), 출하검사(OQC)부터 품질통보(Quality Notification), 공급업체 평가(Supplier Rating)까지 포괄합니다.

## SPRO 경로 트리

```
SPRO (IMG)
├── Quality Management
│   ├── Master Data (마스터 데이터)
│   │   ├── Inspection Lot Source (검사로트 발생 조건)
│   │   ├── Inspection Type (검사유형)
│   │   │   ├── 01 — Incoming Inspection (수입검사)
│   │   │   ├── 03 — In-Process Inspection (공정검사)
│   │   │   ├── 04 — Final Inspection (출하검사)
│   │   │   └── 08/09 — Repetitive/Source Inspection
│   │   └── Inspection Specification (검사명세)
│   ├── Quality Planning (품질 계획)
│   │   ├── Inspection Plan (검사계획)
│   │   │   ├── QP01 — Routing-based Plan
│   │   │   ├── QP02 — Material-based Plan
│   │   │   └── QP03 — Material-Routing Combined
│   │   ├── Sampling Procedure (샘플링 절차)
│   │   │   ├── QDV1 — Attributes (정성적 - 합격/불합격)
│   │   │   └── QDV2 — Variables (정량적 - 수치 측정)
│   │   └── Dynamic Modification (동적 수정 규칙)
│   │       └── QDR1 — Switching between Normal/Tightened/Reduced
│   ├── Quality Control (품질 관리)
│   │   ├── Inspection Lot (검사로트 관리)
│   │   │   ├── QA32 — Create Inspection Lot Manually
│   │   │   └── QA33 — Create from GR/Production (자동)
│   │   ├── Results Recording (검사결과 기록)
│   │   │   ├── QA32 → Inspection Points → Results Input
│   │   │   └── Mobile: Fiori App "Record Inspection Results"
│   │   └── Usage Decision (사용결정)
│   │       ├── UD → Accepted (합격, 재고로 이동)
│   │       ├── UD → Rejected (불합격, 폐기/반품)
│   │       └── UD → Conditional (조건부, 선별/재검사)
│   ├── Quality Notification (품질통보)
│   │   ├── Notification Type (통보유형)
│   │   │   ├── Q1 — Customer Complaint (고객클레임)
│   │   │   ├── Q2 — Internal Defect (내부불량)
│   │   │   └── Q3 — Supplier Issue (공급업체불량)
│   │   ├── Defect Catalog (결함코드)
│   │   └── Follow-up Actions (후속조치)
│   │       ├── Stock Transfer (재고 이동)
│   │       ├── Supplier Rating Update (공급업체 평가 반영)
│   │       └── 8D Report / RCA Link
│   └── System Administration
│       ├── Settings (일반 설정)
│       ├── Stock Posting Rules (검사스톡 규칙)
│       └── Integration with MM/PP/SD
```

## 핵심 기능 및 T-code 매핑

| 업무 | T-code | 설명 |
|------|--------|------|
| 검사계획 생성 | QP01 | Routing 기반 검사 (제조 공정용) |
| 검사계획 생성 | QP02 | Material 기반 검사 (구매용) |
| 검사로트 생성 | QA32 | 수동 생성 (특수 검사) |
| 검사로트 자동 생성 | QA33 | GR(입고) / PP(생산확인) 연계 |
| 샘플링 절차 정의 | QDV1, QDV2 | AQL 기반 샘플 크기 결정 |
| 검사결과 입력 | QA33 | 합격/불합격 기록 |
| 사용결정 | QA34 | 합격/불합격 판정 |
| 품질통보 | QM01, IW21 | 클레임/불량 신고 |
| 공급업체 평가 | QE04 | Vendor Performance Rating |
| 검사 통계 | QM32 | Quality Report |

## 검사 프로세스 플로우

```
Incoming Inspection (수입검사):
입고(GR, MM01)
└─→ 자동 검사로트 생성 (QA33)
    ├── Inspection Type: 01 (수입)
    ├── Inspection Plan: QP02 (Material-based)
    └─→ 검사 스톡(Q Stock) 생성
└─→ 검사 실행: QA33
    ├── Sample 선택
    └─→ 검사 결과 기록 (합격/불합격)
└─→ 사용결정: QA34
    ├── Accepted: 재고(Unrestricted Stock) 전기
    ├── Rejected: 폐기(Scrap) / 반품(Return)
    └─→ 공급업체 평가 자동 반영

In-Process Inspection (공정검사):
생산 확인(PP, Confirmation)
└─→ 자동 검사로트 생성 (QA33)
    ├── Inspection Type: 03 (공정)
    ├── Inspection Plan: QP01 (Routing-based)
    └─→ 생산오더 상태: 검사 대기 (INSPC)
└─→ 검사 실행: 현장 QC 팀
└─→ 사용결정: QA34
    ├── Accepted: 생산 계속
    ├── Rejected: 스크랩 처리, 재작업 지시
    └─→ 생산오더 상태: 재작업 (REWK)

Final Inspection (출하검사):
완제품 검사
└─→ 자동 검사로트 생성 (QA33)
└─→ 검사 실행: 완성 검사팀
└─→ 사용결정: QA34
    ├── Accepted: 출하 (SD Packing)
    └─→ 판매오더에 연계
    └─→ 배송 전기 (Delivery)
```

## 샘플링 전략 (AQL — Acceptable Quality Level)

| AQL | 정의 | 샘플 크기 | 사용 시나리오 |
|-----|------|---------|-------------|
| 0.65 | 매우 엄격 | 대 | 안전 부품, 항공우주 |
| 1.0 | 엄격 | 중 | 자동차 부품, 의료기기 |
| 2.5 | 표준 | 소 | 일반 부품, 전자 부품 |
| 4.0 | 완화 | 매우 소 | 저가 재료, 보조 부품 |

**SAP 설정** (QDV1):
- AQL 값에 따라 ANSI Z1.4 / ISO 2859-1 샘플 크기 자동 결정

## ECC vs S/4 HANA

| 구성 요소 | ECC 6.0 | S/4 HANA |
|---------|---------|---------|
| 검사로트 | QA32, QA33 | QA32, QA33 (동일) |
| 샘플링 | QDV1/QDV2 | 동일 + AI 샘플링 제안 |
| 동적 수정 | QDR1 (수동) | QDR1 (자동) + ML 기반 |
| 보고서 | QM32, QM33 | Fiori Analytics App |
| 모바일 | 제한적 | 완전 지원 (Fiori) |
| Blockchain | N/A | 공급 체인 추적 가능 |

## 통합 포인트

### MM (자재관리) 통합
- 입고(GR) → 자동 검사로트 생성
- 공급업체 평가 → 자재마스터 업데이트

### PP (생산) 통합
- 생산 확인 → 공정검사 자동화
- 불합격 → 재작업 오더 자동 생성

### SD (판매) 통합
- 출하검사 완료 → 배송 전기 자동화
- 고객 반품 → 품질통보 자동 생성

### FI (재무) 통합
- 불합격 부품 처분 → 스크랩 손실 계정화
- 공급업체 클레임 → 미수금 회수 기록

## 필수 설정 체크리스트

- [ ] Inspection Type 정의 (01, 03, 04)
- [ ] Inspection Plan 생성 (QP01, QP02)
- [ ] Sampling Procedure 설정 (QDV1, QDV2)
- [ ] Dynamic Modification Rule (QDR1)
- [ ] Defect Catalog (결함코드)
- [ ] Stock Posting Rules (검사스톡 전기)
- [ ] Supplier Rating Update 자동화
- [ ] Workflow Integration (통보 → 후속조치)

## 다음 단계
- 검사유형 상세 구성 (QP01, QP02) — `inspection-type.md` 참조
- 검사계획 및 샘플링 — `inspection-plan.md` 참조
- 사용결정 규칙 — `usage-decision.md` 참조
