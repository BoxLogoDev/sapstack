# 화학·제약 산업 SAP 운영 가이드

> 화학(Chemicals), 제약(Pharmaceuticals), 정밀화학·바이오. GxP(Good X Practice) 규제·Batch 추적·원산지·유통기한 핵심.

## 1. 산업 특성

| 속성 | 화학/제약 |
|---|---|
| **생산 방식** | Process (배치/연속) — Discrete 아님 |
| **재고 단위** | Batch (lot) + 유통기한·시리얼 |
| **규제** | FDA / EMA / 식약처 / GxP / GMP / 21 CFR Part 11 |
| **추적성** | Forward + Backward (recall 능력) |
| **원가** | 부산물·재작업 (co-product, by-product) |

## 2. 핵심 SAP 모듈

| 모듈 | 활용 |
|---|---|
| **PP-PI** | Process Industry — Process Order 기반 |
| **QM** | Inspection Lot, Sample Plan, Batch Release |
| **EHS** | Environment Health Safety — MSDS·위험물 |
| **WM/EWM** | Batch 관리·유통기한 FEFO (First Expired First Out) |
| **MM** | Vendor batch tracking |
| **TM** | Hazmat (위험물 운송) |
| **GTS** | 전구체·이중용도 수출 통제 |

## 3. Process Order 흐름

```
1. Production Version (Recipe + Resource) → ME 생성
2. Process Order (COR1) — Recipe 인용
3. Material 발행 (MIGO 261)
4. 공정 실행 (PI Sheet)
5. 결과 입력 (Result Recording)
6. QM Inspection (QA32)
7. Goods Receipt (MIGO 101) + Batch Release
8. Order Settlement (KO88)
```

## 4. Batch 관리 핵심

### 4.1 Batch 마스터
- **MSC1N**: Batch 생성·표시
- **MSC2N**: Batch 변경
- **MSC3N**: Batch 표시 (display)
- **Batch Class**: 특성 (CSV%, pH, 색상 등)

### 4.2 Batch Determination
- 자동 선택 (FEFO·priority·characteristic)
- T-code: VCH1 (변경/표시 strategy)

### 4.3 추적성 (Genealogy)
- Forward: "이 batch는 어떤 제품/창고/고객으로 갔나?"
- Backward: "이 제품 (출하 batch)은 어떤 원료에서 만들어졌나?"
- T-code: VL02N (Outbound Delivery) → Batch Document Flow

## 5. GxP 컴플라이언스

### 5.1 21 CFR Part 11 (FDA 전자 기록)
- **전자 서명**: 모든 critical action에 두 단계 인증
- **Audit Trail**: CDPOS/CDHDR + 별도 GxP 로깅
- **Validation**: 시스템 IQ/OQ/PQ 의무
- **데이터 무결성**: ALCOA+ (Attributable, Legible, Contemporaneous, Original, Accurate)

### 5.2 한국 식약처
- **KGMP**: 한국 GMP
- **의약품 안전 사용**: 처방·조제 추적
- **연구개발 단계**: GLP/GCP

### 5.3 SAP 구현
- **Electronic Batch Record (EBR)**: SAP DMS + PP-PI 통합
- **Batch Recall**: 신속 식별·격리·통지
- **Quality Notification (QM)**: 부적합 처리·CAPA

## 6. EHS (환경·보건·안전)

| T-code | 용도 |
|---|---|
| **CG02** | Substance Master |
| **CG34** | Safety Data Sheet (MSDS) |
| **CR02** | Resource (Hazard 분류 포함) |
| **CGV1/CGV2** | Compliance — REACH·CLP·OSHA |

## 7. 위험물 운송 (TM-Hazmat)

- UN Number / Hazmat Class / Packing Group
- 운송 서류: DGD (Dangerous Goods Declaration)
- 한국: 위험물 안전관리법 — 표준 운송증

## 8. 한국 시나리오

### 정밀화학 (예: 디스플레이 소재)
- 짧은 유통기한 + 정밀 batch 관리
- 고가 원료 (희토류·반도체 화학) — Lot 추적 의무
- 일본·대만 수출: 원산지·기술 노출 통제

### 바이오·제약
- 식약처 신고 (제조·수입·임상)
- KGMP 인증·재인증
- 임상시험 (CRO 협업) — GCP 통제

### 화장품
- 인허가: 식약처 화장품 책임판매업
- 시즌성 강한 수요 (계절·이벤트)
- 한국 K-뷰티 글로벌 수출

## 9. 자주 마주치는 이슈

### Batch가 자동 선택 안 됨 (Determination)
- 진단: VCH1에서 strategy 확인 → 후보 batch 매칭 규칙
- 해결: Customer Hierarchy + Material × strategy 조합 점검

### 유통기한 만료 batch 출고됨 (FEFO fail)
- 원인: FEFO strategy 비활성 또는 우선순위 잘못
- 해결: VCH1 → FEFO sort criteria 활성

### Process Order 실적 누락
- 원인: PI Sheet 비활성 / Result Recording 입력 누락
- 해결: COR3 → Order History → 누락 step 보완

### Quality Notification 처리 stuck
- 원인: CAPA 워크플로우 stuck / Responsible 미할당
- 해결: QM01 → Notification → Assignment → Status 변경

## 10. 관련 SAP Note

- 2419822 — Batch Management Best Practices
- 2701018 — EBR Configuration Guide
- 3010175 — GxP Compliance in S/4

## 11. 연관 sapstack 모듈

- `sap-pp` — Process Order
- `sap-qm` — Inspection·Batch Release
- `sap-mm` — Procurement·Batch
- `sap-ewm` — Warehouse·FEFO
- `sap-gts` — 수출 통제·원산지

## 12. Out of Scope

- 의료기기 (별도 IS-MD 검토)
- 의료 진료 시스템 (IS-H)
- 식품 (별도 IS-Food 검토)
