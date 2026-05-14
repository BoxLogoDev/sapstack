# 자동차 산업 SAP 운영 가이드

> 자동차·부품. Series 생산, Variant Configuration, BOM 복잡성, Dealer Network, JIT/JIS, OEM-Tier 협업.

## 1. 산업 특성

| 속성 | 자동차 |
|---|---|
| **생산 방식** | Series (대량) + Variant (옵션 조합) + JIT/JIS |
| **BOM 깊이** | 5-7단계 (차량 → 모듈 → 어셈블리 → 부품) |
| **변형** | Variant Configuration — million+ 조합 가능 |
| **공급망** | OEM ↔ Tier1/2/3 — 실시간 협업 |
| **규제** | 안전 기준 (FMVSS·UN R), 배기·연비, 리콜 |

## 2. 핵심 SAP 모듈

| 모듈 | 활용 |
|---|---|
| **PP** | Repetitive Manufacturing, Run Schedule |
| **PP-DS** | Detailed Scheduling (sequence) |
| **VC** | Variant Configuration |
| **SD** | Vehicle Sales (VMS - Vehicle Management System) |
| **CS** | Customer Service — Warranty Claims |
| **EHS** | Compliance·Recall |
| **GTS** | 수출 통관·FTA |

## 3. Variant Configuration (VC)

### 3.1 핵심 개념
- **Configurable Material**: 옵션을 갖는 모재 (예: "차량 A")
- **Characteristic**: 옵션 종류 (색상, 변속기, 트림)
- **Class**: Characteristic 그룹
- **Dependency**: 옵션 간 제약 (e.g., "4WD가 있으면 가솔린 엔진 안 됨")
- **Configuration Profile**: Material에 VC 연결

### 3.2 핵심 T-code
- **CT04**: Characteristic 마스터
- **CL01**: Class 마스터
- **CU01**: Dependency
- **PMEVC**: VC Modeling Environment (S/4)
- **VA01**: Sales Order with VC

### 3.3 흔한 이슈
- Dependency 충돌 → "옵션 X와 Y 동시 선택 불가" 메시지
- BOM 폭증 → Configurable BOM 활용 (Super BOM)
- 단가 계산 복잡 → Variant Pricing Routine

## 4. Repetitive Manufacturing (REM)

- Discrete (1개씩 order) 대신 **Run Schedule** 기반 (line·shift 단위)
- T-code: **MFBF** (Backflush) — 한 번에 다수 자동 confirm
- **MF50**: Production Order Replan
- **MF26**: Reversal

## 5. JIT/JIS (Just-in-Time / Just-in-Sequence)

### 5.1 OEM ↔ Tier1
- OEM은 차량 sequence에 따라 Tier1에 부품 호출
- Tier1은 1-2시간 안에 sequence에 맞춰 납품

### 5.2 SAP 지원
- **JITF**: JIT Forecast (예측)
- **JITM**: JIT Monitor
- **JIT01**: JIT Call (호출)
- **JIT03**: JIT Sequence (순서)

### 5.3 한국 자동차 업계
- 현대차·기아 + Tier1 (만도·현대모비스 등)
- 충남·울산 단지 — 1-2시간 JIT 가능
- 안전재고 0 — 운송 중단 시 line stop

## 6. Vehicle Management System (VMS)

- 차량 마스터 (VIN 단위)
- T-code: **VELO** (Vehicle), VELO01-VELO04
- Dealer Network: SD 영업 조직 매핑

## 7. 한국 시나리오

### OEM (현대·기아·KGM)
- 차종별 생산 라인
- 다공장 (한국 + 미국·중국·인도·체코) — 동일 모델 다른 라인
- 글로벌 부품 표준화

### Tier1 (현대모비스·만도·LS Mtron 등)
- OEM JIT 응답 능력 필수
- 자율 라인 운영 + EDI 통합
- 다 OEM 거래 (현대 + 일본 OEM 등)

### Tier2/3
- 협력사 등록·평가 (SLP)
- 견적·납기 시스템
- 분기 평가·재계약

## 8. 자주 마주치는 이슈

### Variant Configuration 옵션 충돌
- 원인: Dependency 정의 누락
- 해결: PMEVC → Dependency Editor → 신규 규칙 추가

### REM Backflush 잔여 처리
- 원인: 자동 confirm된 수량과 실 생산 차이
- 해결: MFBF에서 manual 조정 또는 재 backflush

### JIT 호출 미수신
- 원인: EDI 인터페이스 / OEM 시스템 변경
- 해결: JITM → 호출 로그 확인 + EDI 채널 점검

### Warranty Claim 처리 stuck
- 원인: Customer 정보 매칭 fail
- 해결: CS Notification → Verification → Action

## 9. 리콜 (Recall) 대응

- 영향 차량 식별: VIN 단위 추적
- 통지: Customer Hierarchy + Letter Generation
- 부품 교체: Service Order + Goods Movement
- 정부 신고: 국토교통부 + 자동차안전연구원

## 10. 관련 SAP Note

- 2389716 — Variant Configuration Best Practices
- 2701145 — VMS Configuration in S/4
- 2401012 — JIT/JIS Integration with OEMs

## 11. 연관 sapstack 모듈

- `sap-pp` — Production
- `sap-sd` — Vehicle Sales
- `sap-mm` — Procurement·JIT
- `sap-ewm` — Warehouse·Yard
- `sap-gts` — 수출
- `sap-ariba` — Tier 공급사 협업

## 12. Out of Scope

- 자율주행 데이터 분석 (별도 BTP·SAC 활용)
- Telematics (별도 IoT 솔루션)
- 차량 정비소 운영 (CS 영역 또는 별도 DMS)
