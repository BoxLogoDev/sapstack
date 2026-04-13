# 입출고 전략 (Putaway/Picking Strategy) IMG 구성 가이드

## SPRO 경로
`SPRO → Logistics Execution → Warehouse Management → Strategies`

## 필수 선행 구성
- [ ] 창고 구조 정의 (warehouse-structure.md)
- [ ] 저장유형 정의 (LS01N)
- [ ] 자재 마스터 WM 뷰 (MM01)

## 구성 단계

### 1. 입고 전략 (Putaway Strategy) — SPRO
- `SPRO → WM → Strategies → Putaway Strategies`
- 전략 유형:
  - **B (Bulk Storage)**: 대량 보관 영역
  - **C (Open Storage)**: 개방형 저장
  - **F (Fixed Bin)**: 고정 빈 (Master에 설정)
  - **I (Addition to Existing Stock)**: 기존 재고에 추가
  - **K (Next Empty Bin)**: 빈 빈 자동 검색
  - **L (Large/Small Quantity)**: 수량별 분기

### 2. 저장유형별 전략 할당 — T-code: OMLR
- Storage Type → Putaway Strategy 매핑
- Control data: Block indicator, Mixed storage 허용 여부
- Capacity check: Y/N
- ECC: 정적 룰 기반 | S/4: deprecated

### 3. 출고 전략 (Picking Strategy) — SPRO
- `SPRO → WM → Strategies → Picking Strategies`
- 전략 유형:
  - **F (FIFO)**: First In First Out — 유통기한 자재
  - **L (LIFO)**: Last In First Out
  - **H (Shelf Life Expiration)**: 유통기한 임박 우선
  - **M (Large/Small Quantity)**: 소량/대량 분기
  - **P (According to Fixed Bin)**: 고정 빈
  - **A (Partial Pallet)**: 부분 파렛트 우선

### 4. Stock Removal Rule — T-code: OMLR
- Storage Type → Picking Strategy 매핑
- Quant Mixing 허용 여부
- Return stock 처리 규칙

### 5. Material Master WM View 연결 — T-code: MM02
- View: Warehouse Management 1/2
- Fields:
  - Storage bin (고정 빈 전략 시 필수)
  - WM unit
  - Picking area
  - Storage Type Indicator

## 구성 검증
- LT01 수동 TO 생성 시 자동 Putaway/Picking 전략 적용 확인
- LS24 Quants per Storage Bin으로 재고 배치 검증
- LS32 Storage Bin with Contents로 빈별 재고 확인

## 주의사항
- Fixed Bin 전략 사용 시 자재 마스터에 Storage Bin 필수 지정
- FIFO 전략은 Batch 관리 또는 GR Date 정확해야 함
- 저장유형 변경은 재고가 없을 때만 안전
- **S/4HANA**: WM deprecated — Stock Room Management 또는 EWM 전환 권장
