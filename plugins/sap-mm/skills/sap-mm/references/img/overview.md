# Materials Management (MM) IMG 구성 가이드

## SPRO 경로
`SPRO → Materials Management → [하위 영역]`

## MM IMG 트리 구조

### 1단계: 기본 설정 (Foundation)
```
Materials Management
├── Basic Data
│   ├── Material Types & Categories
│   ├── Units of Measure
│   └── Material Groups
├── Valuation & Account Assignment
│   ├── Valuation Class Assignment (OMSL)
│   ├── Account Determination (OBYC)
│   └── Price Control (V Method/S Method)
└── Purchasing Organization
    ├── Org. Assignment (OM00)
    ├── Purchasing Groups (OME4)
    └── Vendor Master
```

### 2단계: 재고관리 (Inventory Management)
```
Inventory Management
├── Movement Types (OMJJ)
│   ├── Purchase Movement (101, 102, 121)
│   ├── Sales Movement (201, 202, 261)
│   ├── In-Plant Transfer (301, 303, 305)
│   └── Special Movements (541, 543, 561)
├── Tolerance Limits (OMR6, OMRM)
├── Goods Receipt/Issue (GR/GI) Slippage
└── Reservation Handling
```

### 3단계: 구매프로세스 (Procurement)
```
Procurement
├── Condition Technique (ME01~ME08)
│   ├── Condition Types
│   ├── Access Sequences
│   └── Condition Tables
├── Purchase Order (PO) Processing
│   ├── Document Types (NB, NB, ZB)
│   ├── Release Strategy (CL20N)
│   └── Approval Workflows
└── Invoice Verification (MIRO)
    ├── GR/IR Clearing
    └── Price Variance Handling
```

### 4단계: 평가 & 회계연동 (Valuation & GL Integration)
```
Valuation & GL Integration
├── Valuation Method (Moving Average, Standard Price)
├── Variances
│   ├── Purchase Price Variance (PRD)
│   ├── Material Ledger (ML)
│   └── Overhead Variances
├── Period-End Closing (MMRV, MMBE)
└── Costing Integration with CO
```

### 5단계: 특수기능 (Advanced Features)
```
Advanced Features
├── Batch Management (OMS1)
├── Lot Management
├── Quality Management Integration
├── Returns Processing (Movement Type 651)
└── Rework & Scrap
```

## 필수 구성 우선순위

| 순서 | 영역 | T-code | 단계 |
|------|------|--------|------|
| 1 | 회사/플랜트 정의 | OM00 | 기본 |
| 2 | 구매조직 할당 | OM00 | 기본 |
| 3 | 이동유형 | OMJJ | 필수 |
| 4 | 평가클래스 → 계정결정 | OMSL, OBYC | 필수 |
| 5 | 허용한도 | OMR6, OMRM | 필수 |
| 6 | 구매그룹 | OME4 | 필수 |
| 7 | 조건유형/테이블 | ME01~ME05 | 조건부 |
| 8 | 배치관리 | OMS1 | 선택 |

## ECC vs S/4HANA 주요 차이점

| 영역 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| 자재문서 | MARA, MARC, MARM | MATDOC 통합 |
| 이동유형 | OMJJ (202 필드) | OMJJ (확장 용량) |
| 평가 | 회계연동 분리 | Material Ledger 필수 |
| 배치관리 | 선택적 | 표준화 (ML) |
| MRP | MD01, MD02 | MD01N (Live Planning) |
| GR/IR | MIRO 포함 | 통합 (자동 GR/IR) |

## 검증 체크리스트

```
[ ] 회사코드/플랜트 할당 (OM00)
[ ] 구매조직 생성 (OM00) 
[ ] 이동유형 정의 (OMJJ)
[ ] 계정결정 매핑 (OBYC) ← 가장 중요
[ ] 테스트 자재로 GR/IV 트랜잭션 실행 (MB01, MIGO)
[ ] 전기 검증 (FB03)
[ ] MMBE로 잔량/가격 확인
```

## 주의사항

### 1. 이동유형 설정 오류
- **문제**: 이동유형에 계정결정 설정 누락 → GR/IV 전기 실패
- **해결**: OMJJ에서 각 이동유형별로 "Debit/Credit Key" 필드 필수 입력

### 2. 계정결정 매핑 불일치
- **문제**: Valuation Class가 OBYC 테이블에 없음 → 자동전기 불가
- **해결**: OMSL에서 자재 → 평가클래스 할당 후, OBYC에서 매핑 확인

### 3. 허용한도 설정 누락
- **문제**: MIRO에서 송장금액과 PO 금액 차이 → 허용한도 검증 실패 → 블로킹
- **해결**: OMR6 (가격%) + OMRM (수량) 설정, 필요시 허용그룹 적용

### 4. GR/IR Clearing 지연
- **문제**: Goods Receipt 후 Invoice Verification 없으면 GR/IR 계정에 미정산 잔액 발생
- **해결**: MIRO 자동화 (자재번호 체계) + 허용한도 기준선 설정

## 참고 자료

- **SAP 공식**: IMG Overview - Materials Management (SAP Help Portal)
- **트레이닝**: MM-FIN 통합 워크숍, 계정결정 시뮬레이션 (OMWB)
- **베스트프랙티스**: 구매조직별 독립적 조건관리 + 평가영역별 계정분리
