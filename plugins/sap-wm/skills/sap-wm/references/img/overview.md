# WM (Warehouse Management) IMG 트리 가이드

## 개요
WM 모듈은 **ECC 표준 창고 관리**입니다. S/4에서는 대부분 EWM으로 전환되었으나, 소규모 창고나 레거시 시스템에서는 여전히 사용됩니다.

## SPRO 경로 트리

```
SPRO → Logistics Execution → Warehouse Management
├── Warehouse Organization (창고 조직)
│   ├── Warehouse Number (창고 정의)
│   ├── Storage Type (저장소 유형)
│   ├── Storage Section (보관 섹션)
│   └── Storage Bin (보관 위치)
├── Movement Type (이동유형)
│   ├── Transfer Requirement (이동 요청)
│   └── Movement Type Assignment
├── Putaway & Picking (입출고)
│   ├── Putaway Strategy (적치 전략)
│   └── Picking Strategy (피킹 전략)
└── System Administration
    ├── Settings (일반 설정)
    └── Integration with MM/PP/SD
```

## 핵심 기능

| 업무 | T-code | 설명 |
|------|--------|------|
| 창고 정의 | OX09 | Warehouse Number 생성 |
| 보관위치 생성 | LS01N | Storage Bin 자동/수동 생성 |
| 이동요청 생성 | LT01 | 재고 이동 요청 |
| 입고 처리 | MIGO | Goods Receipt + WM 통합 |
| 출고 처리 | MIGO | Goods Issue + WM 통합 |
| 재고 조회 | MB52 | Warehouse별 재고 현황 |

## 창고 구조

```
Plant (1000)
└─→ Warehouse Number (100)
    ├── Storage Type 001 (고정 빈)
    ├── Storage Type 002 (개방 영역)
    ├── Storage Type 010 (입고 존)
    ├── Storage Type 020 (출고 존)
    └── Storage Type 999 (중간 영역)

각 Storage Type → Storage Section → Storage Bin
예: 001-A-001 (타입 001, 섹션 A, 빈 001)
```

## ECC vs S/4 HANA

| 기능 | ECC WM | S/4 EWM |
|------|--------|---------|
| 이동요청 | 수동 (LT01) | 자동 (Task 생성) |
| 입출고 | 2단계 이동 | Wave/Task 기반 |
| 바코드 | 제한적 | 완전 지원 (RF) |
| 최적화 | 수동 | AI 기반 (MFCS) |

## 필수 설정

- [ ] Warehouse Number 정의 (OX09)
- [ ] Storage Type 정의 (OX01)
- [ ] Storage Bin 생성 (LS01N)
- [ ] Putaway/Picking Strategy 설정
- [ ] Material-Warehouse 할당

## S/4 권장

WM은 ECC 환경에서만 권장. S/4라면 **EWM (Embedded WM)** 사용.

## 다음 단계
- 창고 구조 상세 — `warehouse-structure.md` 참조
- 이동유형 및 전략 — `movement-type-wm.md`, `putaway-picking-strategy.md` 참조
