# Production Planning (PP) IMG 구성 가이드

## SPRO 경로
`SPRO → Production Planning and Control (PP) → [하위 영역]`

## PP IMG 트리 구조

### 1단계: 기본 설정 (Foundation)
```
Production Planning
├── Basic Data
│   ├── Work Centers (CR01)
│   │   ├── Capacity Category (001 Machine, 002 Labor)
│   │   ├── Available Capacity
│   │   └── Shift/Calendar
│   ├── Bills of Materials (CS01)
│   │   ├── BOM Types (M, Z, X, N, D)
│   │   ├── BOM Usage (1~6)
│   │   └── BOM Structure
│   └── Routings (CA01)
│       ├── Operations
│       ├── Standard Times
│       └── Sequence
├── Control Keys
│   ├── PP01 (In-house Production)
│   ├── PP02 (Rework/Retest)
│   └── F (External Processing/Subcontracting)
└── Production Versions (CA47)
    ├── Valid From ~ To
    └── Lot-size-dependent variant
```

### 2단계: 예측 & 계획 (Forecasting & Planning)
```
Master Planning
├── Master Production Scheduling (MPS)
│   ├── Demand Planning (Forecasts)
│   ├── Safety Stock (MARC-EISBE)
│   └── Planned Independent Requirement (PIR)
├── Material Requirements Planning (MRP)
│   ├── MRP Types (PD, VB, VV, ND)
│   ├── MRP Controller (T406, T025)
│   └── Lot Sizing (EX, FX, WB)
├── Lot Sizing
│   ├── Lot-for-Lot (EX)
│   ├── Fixed Order Qty (FX)
│   └── Period-based (WB)
└── Scheduling
    ├── Forward Scheduling
    ├── Backward Scheduling
    └── Scheduling Margin Key (OPU5)
```

### 3단계: 생산오더 (Production Orders)
```
Production Order Management
├── Production Order Types (OPL8)
│   ├── PP01 (Discrete Manufacturing)
│   ├── PP02 (Rework/Retest)
│   └── PP03 (Process Manufacturing)
├── Order Processing
│   ├── Order Creation (CO01)
│   ├── Order Release (CO02)
│   ├── Goods Receipt (CO11N)
│   └── Order Settlement (CO15)
├── Confirmation (CO11N)
│   ├── Actual Times (start, finish)
│   ├── Actual Qty (good, scrap)
│   └─ Backflushing (자재자동공제)
└── Variances
    ├── Usage Variance
    ├── Efficiency Variance
    └── Spending Variance
```

### 4단계: 용량관리 (Capacity Planning)
```
Capacity Planning & Leveling
├── Capacity Definition (CR01)
│   ├── Machine Capacity
│   ├── Labor Capacity
│   └── Bottleneck Analysis
├── Capacity Requirement
│   ├── Auto Calculation from Routing
│   ├── Finite vs Infinite Scheduling
│   └── Overload Detection
├── Capacity Leveling (CM25)
│   ├── Load Balancing
│   └── Order Sequence Optimization
└── Capacity Reports
    ├── CM01 (Workload Analysis)
    └── CM21 (Capacity Util %)
```

### 5단계: 통합 모듈 (Integration)
```
Integration with Other Modules
├── MM Integration
│   ├── Raw Materials
│   ├── Work-in-Process (WIP)
│   ├── Finished Goods (FG)
│   └── Scrap/Waste
├── CO Integration
│   ├── Cost Collection
│   ├── Actual Costs
│   ├── Variance Analysis
│   └── Settlement
├── SD Integration
│   ├── Available-to-Promise (ATP)
│   ├── Make-to-Stock (MTS)
│   └── Make-to-Order (MTO)
└── QM Integration
    ├── Inspection Plans
    ├── Quality Gate
    └── Rework
```

## 필수 구성 우선순위

| 순서 | 영역 | T-code | 단계 | 필요성 |
|------|------|--------|------|--------|
| 1 | Work Center 정의 | CR01 | 기본 | 필수 |
| 2 | 작업달력 | SCAL | 기본 | 필수 |
| 3 | 이동유형(GR) | OMJJ | 기본 | 필수 |
| 4 | BOM 정의 | CS01 | 필수 | 필수 |
| 5 | 라우팅 정의 | CA01 | 필수 | 필수 |
| 6 | MRP 유형 설정 | MARC(MRP) | 필수 | 필수 |
| 7 | 로트크기정책 | MARC(Lot) | 필수 | 필수 |
| 8 | 생산오더유형 | OPL8 | 필수 | 필수 |
| 9 | 확인프로파일 | CO11N | 필수 | 필수 |
| 10 | Low-level Code 재계산 | OMIW | 필수 | 필수 |

## ECC vs S/4HANA 주요 차이점

| 영역 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| BOM 구조 | MFHH + STPO 분리 | BILLOFMATERIAL 통합 |
| 라우팅 | PLKO + PLPO | ROUTING 통합 |
| MRP 실행 | MD01, MD02 배치 | MD01N(Live Planning) — HANA Push-down |
| 용량계획 | CM01~CM07 | Finite Scheduling (동적) |
| 생산오더 | 수동 생성 → 배치 | PPIS(Predictive Production) 자동화 |
| Backflushing | 수동(CO11N) | 자동 예정(활성화 시) |
| 확인 | 시간 중심 | Event 기반 (IoT 연동) |
| Low-level Code | 수동 OMIW | 자동 계산 |

## 검증 체크리스트

```
[ ] Work Center 정의 (CR01)
[ ] 작업달력 설정 (SCAL)
[ ] BOM 생성 (CS01)
[ ] 라우팅 생성 (CA01)
[ ] 로우레벨코드 계산 (OMIW)
[ ] MRP 유형 설정 (MARC-MATNR, MRP1)
[ ] 로트크기 설정 (MARC-LOSFX)
[ ] 생산오더유형 정의 (OPL8)
[ ] 확인프로파일 (CO11N 설정)
[ ] Test PO 생성 (CO01)
[ ] Test Confirmation (CO11N)
[ ] Test GR (MIGO, Movement Type 101)
[ ] Test 원가계산 (CK11N)
```

## 주의사항

### 1. BOM과 Routing 미연동 → MRP 혼란
**문제**: CS01에서 BOM 정의했으나 CA01 라우팅 미작성
```
결과: MD01 MRP 실행 시 수량/시간 정보 부족 → 부정확한 계획
```
**해결**: BOM + Routing 쌍으로 작성, CA47로 버전 관리

### 2. Low-level Code 미재계산 → MRP 순서 오류
**문제**: BOM 변경 후 OMIW(Low-level Code) 재계산 안 함
```
결과: MD01 실행 시 부품의 상위 자재가 먼저 계획 → 일정 틀림
```
**해결**: 매 BOM/Routing 변경 후 OMIW 반드시 실행

### 3. Work Center 용량 과다설정 → 계획 비현실적
**문제**: CR01에서 8시간 = 480분 설정, 실제는 3 shifts (24시간)
```
결과: 용량계획 CM25 → 잘못된 부하계산 → 일정 실현 불가능
```
**해결**: CR01 → 작업달력(SCAL) + Shift 올바르게 설정

### 4. MRP Run 후 계획 검증 누락 → 현장 혼란
**문제**: MD01 실행만 하고 MD04(Run List) 검토 안 함
```
결과: 부정확한 PO/PD 자동생성 → 재작업
```
**해결**: MD01 후 MD04(Purchase Req) + MD05(GR) 확인

## 참고 자료

- **SAP 공식**: IMG Overview - Production Planning (SAP Help Portal)
- **트레이닝**: PP 마스터 워크숍, MRP 시뮬레이션 (MD01)
- **베스트프랙티스**: 생산/공정별 독립적 Work Center + BOM/Routing 표준화
