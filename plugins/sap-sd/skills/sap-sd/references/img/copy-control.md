# 복사제어(Copy Control) IMG 구성 가이드

## SPRO 경로
`SPRO → Sales and Distribution → Document Flow → Define Copy Control for Documents`

Primary T-codes: **VTLA** (SO→Delivery), **VTFL** (Delivery→Billing), **VTFA** (Order→Billing)

## 필수 선행 구성
- [ ] 문서유형 정의 (OV01) — TA(판매오더), LF(배송오더), RV(송장)
- [ ] 항목카테고리 정의 (OVP1, VOV4) — 100(표준), 110(용역) 등
- [ ] 계정결정 (VKOA)

## 핵심 개념: Copy Control이란

```
판매 프로세스:
1. 판매오더 (Sales Order, VA01)
   ↓ [VTLA 적용]
2. 배송오더 (Delivery, VL01)
   ↓ [VTFL 적용]
3. 송장 (Billing, VF01)

각 단계 전환 시:
- 어떤 필드를 복사할지?
- 수량은 자동으로 복사할지?
- 부분 배송/부분 송장 허용할지?
```

## 구성 단계

### 1단계: VTLA 설정 — 판매오더 → 배송오더

T-code: **VTLA** (Copy Control: OTF Source → LF Target)

```
화면:
┌────────────────────────────────┐
│ Copy Control: Sales Order → DLV│
├────────────────────────────────┤
│ Source Doc Type: TA (SO)       │
│ Target Doc Type: LF (Delivery) │
│                                │
│ Copy Control Table:            │
│ ├─ Document Category           │
│ ├─ Item Category (100, 110...) │
│ └─ Target Item Category        │
│                                │
│ Field Copy Rules:              │
│ ├─ Quantity: Copy / Manual     │
│ ├─ Price: Copy / Blank         │
│ └─ Text: Copy / Blank          │
│                                │
│ Special Options:               │
│ ├─ Immediate Delivery: ☐       │
│ ├─ Split Delivery: ☑           │
│ └─ Partial Delivery: ☑         │
└────────────────────────────────┘
```

#### VTLA 상세 설정 — Item Category 100 (표준)

**FROM: Sales Order (TA) — Item Category 100**
**TO: Delivery (LF) — Item Category 100**

```
Row: TA | | | 100 (SO Item Cat) | LF | | | 100 (DLV Item Cat)

Copy Control Parameters:
├─ Qty Determination:
│  ├─ Delivery Qty = Ordered Qty (전량)
│  └─ OR Manual Input
│
├─ Copy Required:
│  └─ ☑ (배송오더 생성 시 SO 자동 참조)
│
├─ Field Copy:
│  ├─ Quantity: ✓ (수량 자동 복사)
│  ├─ Unit: ✓ (단위 복사)
│  ├─ Plant: ✓ (출고소 복사)
│  ├─ Ship-to: ✓ (배송처 복사)
│  ├─ Price: ✗ (배송에서 가격 불필요)
│  └─ Text: ✓ (자유텍스트 복사)
│
├─ Delivery Type:
│  └─ TA (판매오더용 배송유형)
│
├─ Partial Delivery:
│  └─ ☑ Allowed (부분배송 허용)
│
├─ Delivery Blocking:
│  └─ ☐ (배송 블로킹 없음)
│
└─ Manual Confirmation:
   └─ ☐ (자동 확인)
```

#### VTLA 상세 설정 — Item Category 110 (용역)

**FROM: Sales Order (TA) — Item Category 110**
**TO: Delivery (LF) — Item Category 110**

```
Row: TA | | | 110 (Services) | LF | | | 110

특수 설정:
├─ Quantity Determination:
│  └─ Service Qty = SO Qty (그대로)
│
├─ Field Copy:
│  ├─ Quantity: ✓
│  ├─ Price: ✗ (용역 가격은 송장에서만)
│  ├─ Service Date: ✓ (제공일자)
│  └─ Billing Block: ☑ (송장 블로킹 선택)
│
└─ Special Options:
   └─ No Delivery Document Creation
      (용역은 배송오더 미생성 가능)
```

### 2단계: VTFL 설정 — 배송오더 → 송장

T-code: **VTFL** (Copy Control: LF Source → RV Target)

```
화면:
┌──────────────────────────────┐
│ Copy Control: Delivery → Bill│
├──────────────────────────────┤
│ Source Doc Type: LF (DLV)    │
│ Target Doc Type: RV (Invoice)│
│                              │
│ Item Category Mapping:       │
│ └─ LF 100 → RV 100 (표준)   │
│    LF 110 → RV 110 (용역)   │
│                              │
│ Field Copy:                  │
│ ├─ Quantity: ✓              │
│ ├─ Price from SO: ✓          │
│ ├─ Conditions: ✓             │
│ └─ Tax Calculation: ✓        │
│                              │
│ Billing Rules:               │
│ ├─ Create Item: ✓            │
│ ├─ Quantity to Bill: (자동)  │
│ └─ Partial Billing: ☑        │
└──────────────────────────────┘
```

#### VTFL 상세 설정 — Item Category 100

**FROM: Delivery (LF) — Item Category 100**
**TO: Billing (RV) — Item Category 100**

```
Row: LF | | | 100 | RV | | | 100

설정:
├─ Billing Quantity = GI Quantity (배송 확정 수량)
│  ├─ If Full Delivery: 전량 송장화
│  └─ If Partial: 배송량만 송장화
│
├─ Copy Fields:
│  ├─ Quantity: ✓ (배송 수량)
│  ├─ Unit Price: ✓ (SO에서 기억된 가격)
│  ├─ Conditions: ✓ (할인/세금)
│  ├─ Delivery Date: ✓
│  └─ Cost Center: ✗ (수정필요 시)
│
├─ Billing Plan:
│  └─ Manual or Automatic
│
├─ Billing Block:
│  └─ ☐ (블로킹 없음, 즉시 송장화)
│
└─ Invoice Document Type:
   └─ RV (표준 송장)
```

#### VTFL 특수: 부분배송 → 부분송장 (Milestone Billing)

```
시나리오:
1. SO 수량: 1000 EA
2. 배송 1차: 300 EA GI
3. 배송 2차: 700 EA GI

VTFL 적용:
├─ 배송 1차 → 송장 1 (300 EA)
├─ 배송 2차 → 송장 2 (700 EA)
└─ 정산 완료

설정:
├─ Partial Billing: ☑ (필수)
├─ Qty to Bill = GI Qty (배송 수량만)
└─ Allow Multiple Invoices: ☑
```

### 3단계: VTFA 설정 — 판매오더 → 송장 (직접)

T-code: **VTFA** (Copy Control: TA Source → RV Target)

배송오더를 거치지 않고 직접 SO에서 RV로 가는 경로 (용역/디지털 재화):

```
화면:
┌──────────────────────────────┐
│ Copy Control: SO → Bill (Dir)│
├──────────────────────────────┤
│ Source Doc Type: TA (SO)     │
│ Target Doc Type: RV (Invoice)│
│                              │
│ Direct Billing (No Delivery) │
│ └─ 용역, 용품, 컨설팅       │
│                              │
│ Item Category:               │
│ └─ TA 110 → RV 110 (용역)  │
└──────────────────────────────┘
```

#### VTFA 예시 — Item Category 110 (용역)

```
Row: TA | | | 110 | RV | | | 110

특수:
├─ Billing Qty = SO Qty (전량)
│  (배송 프로세스 없음)
│
├─ Field Copy:
│  ├─ Service Qty: ✓
│  ├─ Price: ✓ (SO 가격 그대로)
│  ├─ Conditions: ✓
│  └─ Billing Date: Manual Input
│
├─ Skip Delivery:
│  └─ ☑ (배송오더 미생성)
│
└─ Direct Invoice Creation:
   └─ VF01 or VF04 (배치)
```

### 4단계: Item Category Determination (VOV4)

T-code: **VOV4** (Determine Item Category)

Item Category는 복사제어의 핵심 — 각 항목이 어느 규칙을 따를지 결정:

```
화면:
┌───────────────────────────────────┐
│ Item Category Determination        │
├───────────────────────────────────┤
│ Sales Org: 1000                   │
│ Dist Channel: 01                  │
│ Division: 00                      │
│                                   │
│ Item Category Group: PROD(Product)│
│ Item Usage: (Blank = Standard)    │
│ Higher-Level Item: (Blank)        │
│ └─ → Item Category: 100 (Standard)│
│                                   │
│ Item Category Group: SERV(Service)│
│ Item Usage: (Blank)               │
│ └─ → Item Category: 110 (Service) │
│                                   │
│ Item Category Group: MISC(기타)   │
│ Item Usage: (Blank)               │
│ └─ → Item Category: 120 (Misc)    │
└───────────────────────────────────┘
```

**VOV4 결정 로직:**

```
VA01 (판매오더) 항목 입력:
├─ Material: MAT-001
├─ Material Master (MARA) 조회:
│  └─ Item Category Group: PROD
│
├─ VOV4 조회:
│  └─ Sales Org 1000 + DC 01 + Item Cat Group PROD
│     → Item Category: 100 ✓
│
└─ 복사제어 VTLA 조회:
   └─ TA Item Cat 100 → LF Item Cat 100
      (해당 규칙 적용)
```

## 복사제어 흐름 예시

### 완전 프로세스: SO → Delivery → Billing

```
Step 1: 판매오더 생성 (VA01)
├─ Material: MAT-001 (Item Cat Group: PROD)
├─ Item Category: 100 (자동 결정, VOV4)
├─ Qty: 100 EA
├─ Price: 100 EUR
└─ [Save] → SO #4500001

Step 2: 배송오더 생성 (VL01 또는 VL10)
├─ SO: #4500001 참조
├─ VTLA 적용:
│  ├─ TA Item Cat 100 → LF Item Cat 100
│  ├─ Qty: 100 EA (복사)
│  ├─ Price: (배송에는 불필요, 미복사)
│  └─ Delivery Type: TA
├─ [Create] → Delivery #80001
└─ (배송 프로세스 완료)

Step 3: 상품인수(Goods Issue) 확인 (MIGO or MB01)
├─ Delivery: #80001
├─ Movement Type: 201 (판매오더 출고)
├─ Quantity: 100 EA GI
└─ [Post] → Stock 감소, GR/IR 정산

Step 4: 송장 생성 (VF01)
├─ Delivery: #80001 참조
├─ VTFL 적용:
│  ├─ LF Item Cat 100 → RV Item Cat 100
│  ├─ Qty to Bill: 100 EA (배송 GI 수량)
│  ├─ Price: 100 EUR (SO에서 기억)
│  ├─ Conditions: 할인/세금 자동 조회
│  └─ Total: 119 EUR (부가세 포함)
├─ [Create] → Billing #9000001
└─ (자동 FI 전기: AR + Revenue + Tax)

Step 5: 결제 처리 (F110, F150)
├─ Customer: C00001
├─ AR Balance: 119 EUR (미수금)
├─ Payment Received: 119 EUR
└─ AR Clearing → AR Balance: 0 (정산)
```

## 구성 검증

### 검증 1: VTLA 확인
```
T-code: VTLA → Display Mode
├─ Source: TA (Sales Order)
├─ Target: LF (Delivery)
├─ Item Category 100:
│  ├─ Quantity: Copied ✓
│  ├─ Price: Not Copied ✓
│  └─ Delivery Type: TA ✓
└─ Item Category 110:
   ├─ Quantity: Copied ✓
   └─ No Delivery Doc (Service): ✓
```

### 검증 2: VTFL 확인
```
T-code: VTFL → Display Mode
├─ Source: LF (Delivery)
├─ Target: RV (Billing)
├─ Item Category 100:
│  ├─ Qty to Bill: GI Qty ✓
│  ├─ Conditions: Copied ✓
│  └─ Partial Billing: Allowed ✓
└─ Item Category 110:
   ├─ Direct Invoice: Yes ✓
   └─ Skip Delivery: Yes ✓
```

### 검증 3: VOV4 확인
```
T-code: VOV4 → Display Mode
├─ Sales Org: 1000
├─ DC: 01
├─ Item Cat Group PROD → Item Cat 100 ✓
├─ Item Cat Group SERV → Item Cat 110 ✓
└─ Item Cat Group MISC → Item Cat 120 ✓
```

### 검증 4: 엔드-투-엔드 테스트

```
1. VA01: 판매오더 생성
   ├─ SO #4500001 생성 ✓
   └─ Status: "Not Yet Delivered"

2. VL01: 배송오더 생성
   ├─ Delivery #80001 생성 ✓
   ├─ Quantity: 100 EA (VTLA 복사) ✓
   └─ Status: "Not Yet Goods Issued"

3. MIGO: 상품인수
   ├─ Movement Type: 201 ✓
   ├─ Quantity: 100 EA GI ✓
   └─ Status: "Goods Issued"

4. VF01: 송장 생성
   ├─ Billing #9000001 생성 ✓
   ├─ Quantity to Bill: 100 EA (VTFL) ✓
   └─ Amount: 119 EUR

5. FB03: FI 문서 확인
   ├─ DR 112100 (AR) 119 EUR ✓
   ├─ CR 400000 (Revenue) 100 EUR ✓
   └─ CR 172000 (Tax) 19 EUR ✓
```

## 주의사항

### 1. Item Category 미결정 → 복사제어 미적용
**문제**: VOV4에서 Item Cat Group PROD의 매핑 누락
```
결과: VA01 항목 → Item Category 0 (미분류)
      → VTLA 규칙 찾을 수 없음 → 배송오더 자동생성 불가
```
**해결**: VOV4 → 모든 Item Cat Group에 대해 Item Category 할당

### 2. 부분배송 허용 안 함 → 배송 유연성 부족
**문제**: VTLA에서 "Partial Delivery: Not Allowed" 설정
```
결과: SO 100 EA → 50 EA 배송 시도 → 블로킹
      수정불가능 → 새 배송오더 생성 해야 함
```
**해결**: VTLA → Partial Delivery 허용으로 변경

### 3. VTFL 부분송장 미지원 → 과다청구 위험
**문제**: VTFL에서 "Partial Billing: Not Allowed"
```
결과: 배송 2차 도착 전에 전량 송장화 → 수금 후 불만족
```
**해결**: VTFL → Partial Billing 허용

### 4. 가격 복사 오류 → 부정확한 송장
**문제**: VTFL에서 Price: Copied, 하지만 SO 가격이 이미 변경됨
```
결과: 과거 가격으로 송장화 → 회계 차이
```
**해결**: VTFL에서 Price는 SO(VTFA) 또는 VF01 수동 입력으로 통제

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| VTLA | 수동 설정 | 자동 제안 기능 |
| VTFL | 고정 규칙 | 유연한 매핑 |
| VOV4 | 간단 | 확장 (Item Usage, Higher Level) |
| Delivery Blocking | 수동 | 자동 규칙 |
| Partial Delivery | 선택적 | 기본값 (권장) |

## 참고 자료

- **SAP 공식**: IMG → SD → Document Flow
- **T-codes**: VTLA(SO→DLV), VTFL(DLV→Bill), VTFA(SO→Bill), VOV4(Item Cat)
- **심화**: OVA9(판매 규칙), NWDI(배송 프로세스)
