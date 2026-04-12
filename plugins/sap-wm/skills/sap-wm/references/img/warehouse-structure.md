# 창고 구조(Warehouse Structure) IMG 구성 가이드

## SPRO 경로
```
SPRO → Logistics Execution → Warehouse Management
├── Warehouse Organization
│   ├── OX09 — Define Warehouse
│   ├── OX01 — Define Storage Type
│   ├── OX02 — Define Storage Section
│   └── LS01N — Define Storage Bin
└── Integration with MM
    ├── Plant → Warehouse Assignment
    └── Material-Warehouse Parameter
```

## 구성 단계

### 1단계: 창고 정의 (OX09)

**T-code: OX09**

```
Warehouse: 100
├── Description: Main Warehouse (메인 창고)
├── Plant: 1000
├── Storage Type 001: Fixed Bin Shelf (고정 빈 선반)
├── Storage Type 002: Open Area (개방 영역)
├── Storage Type 010: Inbound (입고 존)
├── Storage Type 020: Outbound (출고 존)
└── Storage Type 999: Staging Area (중간 영역)
```

**필드**:
- Warehouse Number = `100`
- Description = `메인 창고`
- Plant = `1000`
- Block Movements (If Set) = 미체크 (운영 중)

### 2단계: 저장소 유형 (OX01)

**T-code: OX01** (Define Storage Type)

| Storage Type | 설명 | 용도 |
|-------------|------|------|
| 001 | Fixed Bin Shelf | 자동/반자동 창고 (좌표계 관리) |
| 002 | Open Bulk Storage | 대형 자재 적재 (좌표 자유) |
| 010 | Inbound Staging | GR 후 임시 보관 |
| 020 | Outbound Staging | 출고 대기 |
| 999 | Staging/Intermediate | 분류/조정 영역 |

**설정** (각 ST별):
```
Storage Type 001:
├── Name: Shelving System
├── Strategy: Fixed Bin (선반 위치 고정)
├── Bin Level Management: ✅
└── Coordinates: Row, Rack, Shelf, Bin

Storage Type 002:
├── Name: Bulk Storage
├── Strategy: Open (위치 자유)
├── Batch Management: ✅ (식품 추적용)
└── No Coordinates: (자유 배치)
```

### 3단계: 보관 섹션 (OX02)

**T-code: OX02**

```
Storage Type 001 내 섹션 분류:

Section A: Raw Materials (원재료)
├── Shelves: 01~05 (5단)
├── Bins per Shelf: 10 개
└── Total Bins: 50개

Section B: Work-in-Progress (반제품)
├── Shelves: 06~10
└── Total Bins: 50개

Section C: Finished Goods (완제품)
├── Shelves: 11~15
└── Total Bins: 50개
```

### 4단계: 보관 위치(Bin) 생성 (LS01N)

**T-code: LS01N** (Create Bin)

```
Warehouse 100 의 모든 Bin 생성:

Naming Convention (이름 규칙):
Format: WH-ST-SEC-ROW-RACK-SHELF-BIN
예: 100-001-A-01-02-03-05

Bin 예시:
├── 100-001-A-01-01-01-01 (Warehouse 100, ST 001, Section A, Row 1, Rack 1, Shelf 1, Bin 1)
├── 100-001-A-01-01-02-01
└── ... (총 1000개 이상 가능)

Bin 속성:
├── Storage Type: 001
├── Storage Section: A
├── Usage Indicator: ✅ Available (사용 가능)
├── Block Indicator: ❌ (정상)
└── Capacity (Optional): Max Weight 500kg, Volume 2m³
```

**자동 생성 (권장)**:
```
SPRO > WM → Bin Number Range
→ Format: 100-001-A-{Sequential}

결과: 100-001-A-0001, 100-001-A-0002, ...
     100-001-B-0001, ...
     (Warehouse + ST + Section별 자동 채번)
```

## 구성 검증

**T-code: LS10** (Bin Display)

```
Warehouse: 100
Storage Type: 001
Storage Section: A
└─→ Display: 모든 Bin 목록 확인 ✅
```

## 주의사항

### 1. Bin 용량 미설정
❌ **하지 말 것**: Bin Capacity 미정의
✅ **권장**: 무게, 부피 제한 설정 → Putaway 전략의 기초

### 2. Plant-Warehouse 미할당
❌ **하지 말 것**: Warehouse 생성만 하고 Plant와 미연계
✅ **권장**: SPRO → Materials Management → Plant-Warehouse Assignment 필수

**설정**:
```
SPRO > MM > Warehouse Assignment
→ Plant 1000 → Default Warehouse 100 지정
```

### 3. 저장 구조 혼란
❌ **하지 말 것**: 모든 ST에 동일 bin naming 사용
✅ **권장**: ST별 구간 분리 (001: 01~99, 002: 100~199)

## S/4 EWM 전환 가이드

WM → EWM 마이그레이션 시:
1. Warehouse → Warehouse Complex (개념 확대)
2. Storage Type → Storage Unit (더 복잡)
3. Bin → Bin + Batch 통합 (추적 강화)
4. Manual Task → Warehouse Task (자동화)

**권장**: ECC WM 사용 중이면 조속히 EWM으로 전환 계획
