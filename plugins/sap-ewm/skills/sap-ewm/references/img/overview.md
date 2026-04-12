# EWM IMG 개요

## EWM 모듈 구조

SAP EWM (Extended Warehouse Management)은 고급 창고 관리 및 자동화 기능을 제공하는 SCM 모듈입니다.

### 배포 유형

```
1. Embedded EWM (S/4HANA 내장)
   ├─ S/4HANA 2023+에 포함
   ├─ MM/SD와 직접 통합
   ├─ Real-time Inventory Visibility
   └─ 권장 (신규 고객)

2. Decentralized EWM (WM) — Deprecated
   ├─ ECC 9.0에 표준 WM (V2)
   ├─ EWM과 독립적
   ├─ 점진적 마이그레이션 계획 필요
   └─ 레거시 시스템 유지보수만
```

## IMG 트리 구조

```
SPRO (IMG)
└── SCM (Supply Chain Management)
    └── Extended Warehouse Management (EWM)
        ├── Cross-Process Settings
        │   ├── Warehouse Process Type (창고프로세스)
        │   ├── Warehouse Monitoring
        │   └── Data Archiving
        │
        ├── Goods Receipt (입하)
        │   ├── Process Type & Strategy
        │   ├── Putaway Rules (적치)
        │   ├── Quality Management (품질)
        │   └── Inbound Integration (MM)
        │
        ├── Goods Issue (출고)
        │   ├── Process Type & Wave
        │   ├── Picking Strategy
        │   ├── Packing & Shipping
        │   └── Outbound Integration (SD)
        │
        ├── Internal Movements (내부 이동)
        │   ├── Replenishment (보충)
        │   ├── Rearrangement (정렬)
        │   └── Inventory Count (재고실사)
        │
        ├── Resources (자원)
        │   ├── Storage Type (저장타입)
        │   ├── Storage Location (저장위치)
        │   ├── Bin (빈)
        │   └── Handling Unit (HU, 취급단위)
        │
        ├── RF (Radio Frequency)
        │   ├── RF Menu Configuration
        │   ├── RF Transaction Customization
        │   └── Verification Profiles
        │
        └── Analytics & Reporting
            ├── Warehouse Utilization
            ├── Process Performance
            └── System Monitoring
```

## 핵심 IMG 경로

| 영역 | SPRO 경로 | 주요 T-code |
|------|----------|-----------|
| **Cross-Process** | SCM → EWM → Cross-Process Settings | /SCWM/MONI, /SCWM/MDEF |
| **Goods Receipt** | SCM → EWM → Inbound Processing | /SCWM/INIT, /SCWM/STRAT |
| **Goods Issue** | SCM → EWM → Outbound Processing | /SCWM/WAVE, /SCWM/PICK |
| **Resources** | SCM → EWM → Master Data | /SCWM/DEFAB, /SCWM/BIN |
| **RF Framework** | SCM → EWM → RF Framework | /SCWM/RFUI, /SCWM/TRANS |

## 프로세스 흐름도

```
┌──────────────────────────────────────────────────────────┐
│              Purchase Order (MM) or Sales Order (SD)     │
└────────────────────────┬─────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│  INBOUND (입하)  │              │  OUTBOUND (출고) │
│                 │              │                 │
│ 1. GR Posting   │              │ 1. Release      │
│    (Goods       │              │    Wave         │
│    Receipt)     │              │                 │
│                 │              │ 2. Generate     │
│ 2. Putaway      │              │    Warehouse    │
│    (적치)        │              │    Task         │
│                 │              │                 │
│ 3. Stock        │              │ 3. Pick         │
│    Update       │              │                 │
└────────┬────────┘              │ 4. Pack         │
         │                       │                 │
         │                       │ 5. Load Truck   │
         │                       │                 │
         │                       │ 6. Ship         │
         │                       └────────┬────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                  ▼
┌──────────────────┐           ┌──────────────────┐
│ INTERNAL (내부)   │           │ ANALYTICS        │
│                  │           │                  │
│ 1. Replenish     │           │ 1. Utilization   │
│ 2. Rearrange     │           │ 2. Performance   │
│ 3. Inventory     │           │ 3. KPI           │
│    Count         │           │ 4. Dashboard     │
└──────────────────┘           └──────────────────┘
```

## 한국 특화 설정

### 창고 운영 특성
- **탁송 관리**: 위탁품(Consignment) 별도 관리
- **수입/수출**: HS Code, 통관 문서 통합
- **택배 연동**: CJ, 한진, 우체국 등 택배사 API 연동
- **로컬 창고**: 수도권(서울, 경기), 부산, 대구 등 다중 거점

### 한국 전자상거래 특성
- **빠른 배송**: 당일배송 필수 (특히 서울)
- **고객 서비스**: 전화 연락처 필수 (SMS 고지)
- **반품/교환**: 고객 귀책 vs 회사 귀책 구분
- **미결제**: 택배 수금 후 입금 (선불 미지원)

## ECC WM vs S/4 EWM 차이

| 항목 | ECC WM (V2) | S/4 EWM |
|------|-----------|---------|
| **통합도** | MM/SD와 느슨한 연동 | 완전 통합 (Real-time) |
| **처리량** | 일배치 (야간 정산) | Real-time (즉시 처리) |
| **Putaway** | 규칙 기반 (고정) | AI/ML 최적화 가능 |
| **RF 터미널** | 기본 바코드 스캔 | 모바일 앱, 음성 지원 |
| **분석** | 제한적 | SAP Analytics Cloud 통합 |
| **비용** | 낮음 | 높음 (기능 대비) |
| **마이그레이션** | EWM으로 전환 권장 | Embedded 권장 |

## 구성 순서 (중요)

1. **기본 설정** (Cross-Process)
   - Storage Type (저장타입) 정의
   - Storage Location (저장위치) 정의
   - Warehouse Process Type (입하/출고/내부)

2. **입하 프로세스** (Goods Receipt)
   - GR Process Type 매핑
   - Putaway Strategy 설정
   - Inbound Integration 확인

3. **출고 프로세스** (Goods Issue)
   - Wave Management 설정
   - Picking Strategy 정의
   - Packing Material 설정

4. **자원 관리** (Resources)
   - Storage Location 상세 설정
   - Bin Management (위치 레이아웃)
   - Handling Unit (HU) 타입

5. **RF 프레임워크** (Radio Frequency)
   - RF Menu 구성
   - RF Transaction 커스터마이징
   - Verification Profile 적용

6. **테스트 및 운영**
   - 파일럿 테스트 (특정 부서)
   - 성과 모니터링
   - 라이브 전환

---

**다음 단계**: [창고프로세스유형](warehouse-process-type.md) 가이드를 참조하세요.
