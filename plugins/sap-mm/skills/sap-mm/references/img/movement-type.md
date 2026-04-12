# 이동유형(Movement Type) IMG 구성 가이드

## SPRO 경로
`SPRO → Materials Management → Inventory Management → Movement Types → Define Movement Types`

T-code: **OMJJ**

## 필수 선행 구성
- [ ] 회사코드 및 플랜트 정의 (OM00)
- [ ] 평가클래스 정의 (OMSL)
- [ ] 계정결정 매트릭스 (OBYC) — 중요!

## 이동유형 분류체계

### 입고 계열 (10x~12x)
| 이동유형 | 명칭 | 용도 | GR/IR 영향 |
|---------|------|------|-----------|
| 101 | PO Goods Receipt | 구매주문 입고 | 예 |
| 102 | PO Goods Receipt w/o PO | 송장없이 입고 | 예 |
| 121 | Returns from Customer | 고객반품 입수 | 예 |

### 출고 계열 (20x~26x)
| 이동유형 | 명칭 | 용도 | 자동전기 |
|---------|------|------|---------|
| 201 | Goods Issue (판매오더용) | 판매오더 출고 | ERL(매출) |
| 202 | Goods Issue (일반) | 자유출고 | GBB(자재소비) |
| 261 | Return to Vendor | 공급자반품 | WRX |

### 이전 계열 (30x~39x)
| 이동유형 | 명칭 | 용도 | 계정영향 |
|---------|------|------|---------|
| 301 | In-plant Transfer | 같은 플랜트 내 출고소→창고 | 아님 |
| 303 | In-plant Transfer Reversal | 이전 취소 | 아님 |
| 305 | In-plant Transfer (Plant-to-Plant) | 다른 플랜트로 이전 | 이동 양쪽 |

### 특수 계열 (54x, 56x)
| 이동유형 | 명칭 | 용도 | 용도코드(Mvt Type Catg) |
|---------|------|------|----------------------|
| 541 | Goods Issue for Subcontractor | 외주 수불 | F(Misc. Issue) |
| 543 | Goods Receipt from Subcontractor | 외주 입고 | E(Misc. Receipt) |
| 561 | Scrap/Waste | 스크랩 처리 | F(제거) |

## 구성 단계: OMJJ 상세설정

### 1단계: 기본 필드 (Header Level)
```
이동유형 코드: 101
↓
명칭 (Description): PO Goods Receipt
설명문: 구매주문을 기반으로 한 물품수입
↓
Movement Type Category: 1(표준 GR)
  → 0: 자유입고, 1: GR from PO, E: 특수입고, F: 특수출고 등
↓
화면형식선택 (Dialog Structure):
  → Standard(MB01 사용) / Extended(MIGO 사용)
```

### 2단계: 계정결정 키(Key for Account Determination) — 매우 중요!
```
Movement Type: 101
├─ Debit/Credit Key: BSX (Inventory - Raw Materials)
│  ├─ 대변 계정: 101100 (Inventory - Purchased Materials)
│  └─ (자동 대변 자재원장)
├─ Offsetting Account Key: (보통 미설정)
│  └─ 또는 WRX (GR/IR Account) 사용
└─ Transaction Key 결정:
    ├─ 101 → BSX(재고) 
    ├─ 201 → GBB(자재소비)
    └─ 121 → WRX(GR/IR)
```

**ECC vs S/4:**
- **ECC**: T001W(플랜트) + Valuation Class(자재) → OBYC 조회 → GL Account
- **S/4**: Material Ledger(ML) 필수 — 자동으로 모든 변동 기록

### 3단계: 특수제어필드

#### 3-1. 자료량제어(Quantity Control)
```
Qty in Inv. Unit (UoM in Inventory): ✓
Qty in Order Unit: ✓ (PO와 동일 단위 강제)
Qty Conversion: ✓ (자동 단위변환)
```

#### 3-2. 가격제어(Valuation)
```
Moving Average Price: ✓ (자재마다 갱신)
Standard Price: ✗ (차이는 분산으로 처리)
Actual Cost: ✓ (Process Order용)
```

#### 3-3. Goods Receipt/Issue 슬리페이지 (Slippage)
```
Goods Receipt Slippage (판매오더):
  ├─ 허용치: ±5% (설정값)
  └─ 초과 시: 경고 또는 블로킹
  
Overdelivery Control (OMR6):
  ├─ 3-way Match: PO/GR/IV 모두 일치
  └─ 불일치 시 MIRO 지연
```

### 4단계: 재고유형별 자동분배(Stock Category Determination)

```
Movement Type 101 (GR):
├─ Unrestricted Use (자유사용재고)
│  └─ 대변: GL 101100 / 차변: GR/IR 131000
├─ Quality Inspection (검사주류)
│  └─ 별도 GL 101200 (QI Stock)
├─ Blocked Stock (차단주류)
│  └─ 별도 GL 101300
└─ Returns (반품재고)
    └─ 별도 GL 101400
```

**제어**: 자재마스터(MARC) → Stocktaking plant / QM Reqmts 필드로 자동 분배

### 5단계: 역이동(Reversal)설정

```
Movement Type 101 (GR)
  ↓
Reversal MT: 102 (자동 생성)
  ├─ 수량: -1배
  ├─ 가격: 동일 (가중평균가)
  └─ GL Entry: 역전기
```

**검증**: MB01 입고 후 MB02로 취소 → OMJJ의 역이동 설정 확인

## 구성 검증

### 검증 1: 이동유형 조회 (OMJJ)
```
T-code: OMJJ → Display Mode
└─ 101을 검색 → GR for PO 확인
   ├─ Debit/Credit Key: BSX ✓
   └─ 역이동 102 설정 ✓
```

### 검증 2: 자재 입고 트랜잭션 (MB01 또는 MIGO)
```
T-code: MIGO (Goods Movement)
├─ Movement Type: 101
├─ Material: TEST-MAT-001
├─ PO #: 4500012345
├─ Qty: 100 EA
└─ Post ✓
   ├─ MM: MARC (Valuation) ← 자동 갱신
   ├─ FI: MMBE (Stock Value) ← 자동 계산
   └─ CO: COEP (Cost) ← 자동 할당
```

### 검증 3: 자동전기 검증 (FB03)
```
T-code: FB03 (Document Display)
├─ Document: (MIGO 후 시스템 자동생성번호)
└─ Document Type: SG (Automatic Posting)
   ├─ Line 1: 101100 (Inventory) 차변 ✓
   ├─ Line 2: 131000 (GR/IR) 대변 ✓
   └─ Amount 일치 (자재 × 가중평균가) ✓
```

## 주요 설정 패턴

### 패턴 1: 표준 PO Goods Receipt (101)
```
Movement Type: 101
├─ Category: 1 (GR from PO)
├─ Debit/Credit Key: BSX (Inventory)
├─ GL Account (차변): 101100
├─ GR/IR Account (대변): 131000
└─ Reversal: 102 (자동)
```

### 패턴 2: 자유 입고 (LGMI - Logistics General Movement Intake)
```
Movement Type: 581 (또는 맞춤형)
├─ Category: E (Misc. Receipt)
├─ Debit/Credit Key: BSX (Inventory)
└─ PO 선택사항 (없어도 됨)
```

### 패턴 3: 판매오더 출고 (201)
```
Movement Type: 201
├─ Category: F (Misc. Issue)
├─ Debit/Credit Key: GBB (Material Consumption)
├─ GL Account (차변): 504000 (COGS)
└─ Cost Center: 자동 할당 (MARC)
```

## ECC vs S/4HANA 차이점

### ECC (Classical Movement Type)
```
OMJJ → 이동유형 정의
 ├─ Movement Type Categories: 15개 고정
 ├─ OWPO (회계연동) 별도 테이블
 └─ GR/IR: MIRO에서 수동 마칭
```

### S/4HANA 2020+ (Enhanced Movement Type)
```
OMJJ → 동일 T-code
 ├─ Movement Type Categories: 확장 가능
 ├─ Material Ledger(ML): 자동 기록
 ├─ GR/IR: 자동 3-way match (예정)
 └─ MATDOC: 자재문서 통합저장
```

## 주의사항

### 1. Debit/Credit Key 오류 → 전기 실패
**문제**: OMJJ에서 이동유형은 정의했으나 Debit/Credit Key 미설정
```
MIGO 실행 → 에러: "No account assignment"
```
**해결**: OMJJ → 101 선택 → Debit/Credit Key = BSX 필수 입력

### 2. GR/IR Slippage 설정 과도
**문제**: OMR6에서 허용율을 너무 높게 설정 (예: 50%) → 오류 송장도 통과
```
MIRO → 송장금액이 PO의 50% 차이도 자동승인됨
```
**해결**: OMR6 → 최대 ±3% 권장, 특수건은 허용그룹으로 관리

### 3. 이동유형 번호 중복 정의
**문제**: 101을 두 개 이상의 모듈에서 서로 다르게 정의 (MM vs WM)
```
결과: MIGO에서는 MM 규칙, MB01에서는 WM 규칙 → 혼란
```
**해결**: 이동유형 번호 범위 선정 (mm: 1xx, wm: 2xx, co: 3xx) 후 OMJJ에서 일원화

### 4. Reversal Movement Type 미설정
**문제**: 101 입고 후 취소하려 하니 역이동 설정 누락
```
결과: 수동으로 -101을 정의해야 함 → 불편
```
**해결**: OMJJ에서 101 정의 시 자동으로 102 역이동 생성 설정

## 참고 자료

- **SAP 공식**: IMG → MM → Inventory Management → Movement Types
- **T-code**: OMJJ(정의), MB01(자유입고), MB02(자유출고), MIGO(최신 UI)
- **심화**: OWPO(회계연동), OBYC(계정결정), OMWB(시뮬레이션)
