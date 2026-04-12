# Sales and Distribution (SD) IMG 구성 가이드

## SPRO 경로
`SPRO → Sales and Distribution → [하위 영역]`

## SD IMG 트리 구조

### 1단계: 기본 설정 (Foundational Setup)
```
Sales and Distribution
├── Organization & Assignment
│   ├── Org. Unit (OV01 ~ OV05)
│   │   ├── Sales Org
│   │   ├── Distribution Channel
│   │   └── Division
│   ├── Sales Area Assignment (OVA8)
│   └── Plant Assignment to Sales Org
├── Basic Functions
│   ├── Document Types (OV01)
│   │   ├── Quotation (AG)
│   │   ├── Sales Order (TA)
│   │   └── Contract (MV)
│   ├── Number Range (OV04)
│   └── Item Categories (OVP1, OV04)
└── Partner Functions (OV02, OV03)
    ├── Sold-to Party (BP)
    ├── Ship-to Party (SH)
    └── Bill-to Party (BL)
```

### 2단계: 가격결정 & 조건 (Pricing & Conditions)
```
Pricing and Conditions
├── Pricing Procedure (V/08)
│   ├── Procedure Definition
│   ├── Condition Types (V/06)
│   └── Access Sequences (V/07)
├── Condition Tables (V/03, V/04, V/05)
│   ├── Standard Pricing Table
│   ├── Customer-specific Table
│   └── Material-specific Table
├── Pricing Procedure Assignment (OVKK)
│   ├── Sales Org + Dist Channel + Division
│   └─ Pricing Procedure Selection
└── Price Control Methods
    ├── V Method (Variable)
    └── S Method (Standard)
```

### 3단계: 계정결정 (Account Determination)
```
Account Determination & GL Integration
├── Account Determination (VKOA)
│   ├── Account Key (ERL, ERS, FRL, MWS)
│   └─ GL Account Assignment
├── Revenue Account (ERL)
├── Revenue Deduction (ERS)
│   ├── Discount
│   ├── Rebate
│   └── Returns
├── Freight (FRL)
└── Tax (MWS)
```

### 4단계: 복사제어 (Copy Control)
```
Copy Control & Document Flow
├── Sales Order → Delivery (VTLA)
├── Delivery → Billing (VTFL)
├── Order → Billing (VTFA)
├── Order → Picking (VTLF)
└── Item Category Determination (VOV4)
    ├── Sales Org + Item Category Group
    └─ Item Category Assignment
```

### 5단계: 여신관리 (Credit Management)
```
Credit Management & Risk
├── ECC: FD32 (Classic Credit Management)
├── S/4: UKM (SAP Credit Management)
├── Credit Check (OVA8, OVA1)
│   ├── Static Check
│   └── Dynamic Check
├── Risk Categories (OB01)
└── Auto-Blocking Rules
    ├── Credit Limit Exceeded
    └── Dunning Level
```

### 6단계: 배송 & 물류 (Delivery & Logistics)
```
Delivery & Shipping
├── Shipping Points (OVEK, OVXL)
├── Loading Groups (V/17)
├── Routes (VL10)
├── Picking Strategy (VOL2)
└── GR/GI Posting
    ├── Goods Issue (Movement Type 201)
    └── Stock Reservation
```

### 7단계: 빌링 (Billing)
```
Billing
├── Billing Document Types (OV04)
├── Billing Plan (V/39, V/40)
├── Condition Type for Billing
├── Output Control (NACE)
│   ├── Invoice Output (RD00 Print)
│   └─ EDI Output
└── Dunning Process (F150)
```

## 필수 구성 우선순위

| 순서 | 영역 | T-code | 단계 | 필요성 |
|------|------|--------|------|--------|
| 1 | 조직단위 정의 | OV01~05 | 기본 | 필수 |
| 2 | 판매조직 할당 | OVA8 | 기본 | 필수 |
| 3 | 문서유형 | OV01 | 기본 | 필수 |
| 4 | 번호범위 | OV04 | 기본 | 필수 |
| 5 | 가격절차 | V/08 | 필수 | 필수 |
| 6 | 조건유형 | V/06 | 필수 | 필수 |
| 7 | 계정결정 | VKOA | 필수 | 필수 |
| 8 | 복사제어 | VTLA | 필수 | 필수 |
| 9 | 여신관리 | OVA8, OB01 | 조건부 | 권장 |
| 10 | 배송점 | OVEK | 조건부 | 필요시 |

## ECC vs S/4HANA 주요 차이점

| 영역 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| 가격절차 | V/08 (고정) | V/08 (동일, 확장 기능) |
| 계정결정 | VKOA (회사코드 기반) | VKOA (회사코드 + 판매영역) |
| 여신관리 | FD32 (독립) | UKM (BP 통합) |
| Revenue Recognition | MIRO 후 수동 | RAR(Revenue Accrual) 자동 |
| 복사제어 | VTLA 수동 설정 | 자동 제안 기능 확장 |
| Pricing Concurrency | 수동 | Pricing 최적화 (기계학습) |
| 배송통합 | LE 별도 | TM(Transportation Mgmt) 통합 |

## 검증 체크리스트

```
[ ] 판매조직 정의 (OV01)
[ ] 유통채널 정의 (OV02)
[ ] 부서(Division) 정의 (OV03)
[ ] 판매조직 할당 (OVA8) ← 필수!
[ ] 문서유형 정의 (OV01) — TA(판매오더)
[ ] 번호범위 정의 (OV04)
[ ] 항목카테고리 정의 (OVP1)
[ ] 가격절차 정의 (V/08)
[ ] 조건유형 정의 (V/06) — PR00, K004, MWST 등
[ ] 조건테이블 정의 (V/03, V/04)
[ ] 계정결정 매핑 (VKOA) ← 매우 중요
[ ] 복사제어 (VTLA, VTFL, VTFA)
[ ] 테스트 판매오더 생성 (VA01) 및 전기 검증
```

## 주의사항

### 1. 판매조직 미할당 → 판매오더 생성 불가
**문제**: OV01에서 판매조직 정의 후 OVA8에서 회사코드 할당 누락
```
결과: VA01에서 판매조직 선택 불가 → 오더 생성 실패
```
**해결**: OVA8 → Company Code + Sales Org + Plant 할당 필수

### 2. 계정결정 불완전 → GL 전기 실패
**문제**: VKOA에서 매출계정(ERL)은 설정했으나 할인계정(ERS) 미설정
```
결과: 할인조건 있는 오더 → 전기 에러
```
**해결**: VKOA → 모든 Account Key(ERL, ERS, FRL, MWS) 필수 입력

### 3. 복사제어 누락 → 오더→배송 미연동
**문제**: VTLA(SO→Delivery)에서 항목복사 규칙 미설정
```
결과: 판매오더 확정 → 배송오더 미자동생성 → 수동 작업 필요
```
**해결**: VTLA → 항목카테고리별 복사 규칙 정의

### 4. 여신관리 미작동 → 신용불량 고객도 오더 허용
**문제**: OVA8에서 Credit Check 비활성화
```
결과: 채무초과 고객도 판매오더 생성 가능 → 외상 위험
```
**해결**: OVA8 + OB01 → Credit Limit 설정 및 Auto-Block 활성화

## 참고 자료

- **SAP 공식**: IMG Overview - Sales and Distribution (SAP Help Portal)
- **트레이닝**: SD 통합 워크숍, Pricing Procedure 시뮬레이션 (NWDI)
- **베스트프랙티스**: 판매영역별 독립적 조건관리 + 계정결정 일원화
