# PM (Plant Maintenance) IMG 트리 가이드

## 개요
SAP PM 모듈의 IMG(Implementation Guide) 트리는 설비 및 보전 전략 구성의 기초입니다. 이 가이드는 ECC와 S/4 HANA 환경에서의 표준 구성 경로를 제시합니다.

## SPRO 경로 트리

```
SPRO (IMG)
├── Plant Maintenance
│   ├── Master Data
│   │   ├── Equipment (기본 데이터)
│   │   │   ├── Define Equipment Categories (장비 카테고리)
│   │   │   ├── Equipment Master (장비 마스터 생성)
│   │   │   └── Equipment Hierarchies (장비 계층)
│   │   ├── Functional Location (기능위치)
│   │   │   ├── Define Functional Location Categories (기능위치 카테고리)
│   │   │   ├── Edit Mask — Functional Location (IL01)
│   │   │   └── Functional Location Master (기능위치 마스터)
│   │   ├── Measuring Points (측정점)
│   │   │   ├── Measuring Point Categories
│   │   │   └── Measuring Point Master Creation
│   │   └── Bill of Materials (BOM)
│   │       └── Equipment BOM
│   ├── Maintenance Planning
│   │   ├── Maintenance Strategies (보전전략)
│   │   │   ├── IP11 — Define Package for Maintenance Strategy
│   │   │   ├── IP12 — Assign Package to Strategy
│   │   │   └── IP13 — Define Maintenance Strategy Cycles
│   │   ├── Maintenance Plans (보전계획)
│   │   │   ├── IA01 — Create Maintenance Plan (Time-based)
│   │   │   ├── IA05 — Create Maintenance Plan (Counter-based)
│   │   │   └── IA06 — Assign Maintenance Plan to Equipment/FL
│   │   ├── Job Lists (작업목록)
│   │   │   ├── IA01 — Create Job List (Time-based)
│   │   │   └── IA05 — Create Job List (Counter-based)
│   │   └── Deadline Monitoring (IP30 — 기한 모니터링)
│   ├── Maintenance Orders
│   │   ├── Order Management (오더 관리)
│   │   │   ├── Define Order Types (오더유형 정의)
│   │   │   │   ├── PM01 — Preventive Maintenance (예방보전)
│   │   │   │   ├── PM02 — Breakdown Maintenance (고장보전)
│   │   │   │   ├── PM03 — Inspection (점검)
│   │   │   │   ├── PM04 — Modification (개보수)
│   │   │   │   └── PM09 — Notification-based (통보연계)
│   │   │   ├── Order Completion Profile (결산프로파일)
│   │   │   ├── Set Number Ranges (번호범위)
│   │   │   └── Define Status Profile (BS01, BS02)
│   │   ├── Cost Assignment (원가 할당)
│   │   │   ├── Cost Centers (원가센터)
│   │   │   ├── Internal Orders (내부오더)
│   │   │   ├── WBS Elements (작업분해도)
│   │   │   └── Settlement Rules (KO88 — 정산규칙)
│   │   └── Notifications
│   │       ├── Define Notification Types (통보유형)
│   │       │   ├── M1 — Breakdown (고장 통보)
│   │       │   ├── M2 — Maintenance Request (보전요청)
│   │       │   ├── M3 — Activity Report (활동보고)
│   │       │   └── M4 — Service Request (서비스요청)
│   │       ├── Catalog Definition (통보 카탈로그)
│   │       │   ├── Damage Code (손상코드)
│   │       │   ├── Cause Code (원인코드)
│   │       │   └── Activity Code (활동코드)
│   │       └── Partner Determination (파트너결정)
│   └── System Administration
│       ├── Settings (일반 설정)
│       ├── Integration with Other Modules
│       │   ├── Integration with MM (자재관리)
│       │   ├── Integration with FI (재무)
│       │   └── Integration with CO (원가관리)
│       └── Status Management
```

## 모듈별 구성 순서 (권장)

### 1단계: 마스터 데이터 기초 (1-2주)
- 장비 카테고리 정의 (IM02)
- 기능위치 카테고리 정의 (IL02)
- 부서 조직도 (Maintenance Plant, Maintenance Planning Plant)

### 2단계: 계획 및 전략 (2-3주)
- 보전전략 정의 (IP11, IP12, IP13)
- 보전계획 카테고리 및 스케줄링 파라미터

### 3단계: 오더 및 통보 (1-2주)
- 오더유형 정의 (PM01~PM04)
- 통보유형 정의 및 카탈로그

### 4단계: 원가 및 통합 (1주)
- 원가센터, 내부오더 할당
- 정산규칙 설정

## ECC vs S/4 HANA 차이점

| 구성 요소 | ECC 6.0 | S/4 HANA 2020+ |
|---------|---------|----------------|
| 장비 마스터 | T-code: IM01 | T-code: IM01 (동일) |
| 기능위치 | T-code: IL01 | T-code: IL01 (동일) |
| 보전계획 | IA01, IA05 | IA01, IA05 (동일) |
| 오더 결산 | 자동/반자동 | 실시간 원가 (Real-time Costing) |
| 예측보전 | N/A | IoT Gateway + Analytics Cloud |
| 보고서 | PM30, PM38 | Fiori App: Asset Health, Maintenance Analytics |

## 통합 포인트 (Interface Points)

### MM (자재관리) 통합
- 보전 부품 문제코드 (Problem Code): 자동 구매오더 생성
- 예비부품 필요량 예측

### FI (재무) 통합
- 장비 원가 할당 → 자산 가치 추적
- 감가상각 계산 (Depreciation)

### CO (원가관리) 통합
- 보전오더 원가 계산
- 원가센터별 보전비 분석

### PP (생산) 통합
- 설비 점검 상태 → 생산스케줄 영향
- 생산오더와 보전 활동 연계

## 필수 컨설턴트 스킬

1. **설비 관리 업무 지식** (Industry Knowledge)
2. **SAP 표준 IMG 이해**
3. **원가관리 기본지식** (Costing, Cost Centers)
4. **간단한 ABAP 지식** (Status Management, Custom Reports)

## 추가 리소스

- **SAP Help Portal**: help.sap.com → PM Module Documentation
- **T-code IA38**: Maintenance Planning Workbench (전체 계획 현황 조회)
- **T-code PM38**: List Maintenance Orders (보전오더 조회)
