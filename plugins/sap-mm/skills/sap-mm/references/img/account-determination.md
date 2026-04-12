# 계정결정(Account Determination) IMG 구성 가이드

## SPRO 경로
`SPRO → Materials Management → Valuation & Account Assignment → Account Determination → Define Valuation Classes`

Primary T-codes: **OMSL** (자재→평가클래스 할당), **OBYC** (평가클래스→GL계정 매핑)

## 필수 선행 구성
- [ ] Chart of Accounts (회계) → FI-GL 계정 생성
- [ ] 회사코드 통화 설정 (OB22)
- [ ] Cost Centers (CO) 정의 — 배분용
- [ ] 이동유형 정의 (OMJJ) — 각 이동유형별 Account Key 지정

## 핵심 개념: 계정결정 3계층 매핑

```
자재 마스터 (MARA)
    ↓
평가클래스 (Valuation Class) — OMSL
    ↓
트랜잭션 키 (Transaction Key) — 이동유형별
    ↓
GL 계정 (General Ledger Account) — OBYC 매트릭스
```

## 구성 단계

### 1단계: 평가클래스 정의 (OMSL)

#### SPRO 경로
`SPRO → Materials Management → Valuation & Account Assignment → Define Valuation Classes`

T-code: **OMSL**

```
Screen:
├─ Chart of Accounts: (회사코드별 CoA, 예: INT, 4, 인도특화)
├─ Valuation Class: 3000 (Purchased Materials)
│  ├─ Description: "구입 원자재"
│  └─ Stock GL Accounts:
│     ├─ Inventory Account (차변): 101100
│     └─ Consumed Material (대변): 504010
└─ Valuation Class: 3100 (Semi-Finished Goods)
   ├─ Description: "반제품"
   └─ Accounts:
      ├─ Inventory: 102100
      └─ Consumed: 504020
```

### 2단계: 자재에 평가클래스 할당 (MARA)

T-code: **MM01** (자재 생성) 또는 **MM02** (자재 변경)

```
자재 마스터 화면:
└─ Accounting View (회사코드 선택)
   └─ Valuation Class: 3000 (드롭다운)
      ├─ Material: TEST-RM-001
      ├─ Type: ROH (Raw Material)
      └─ Valuation Class: 3000 ✓
```

### 3단계: Transaction Key 설정 (OMJJ와 연계)

각 이동유형(Movement Type)은 고유한 Transaction Key를 가짐:

```
Movement Type 101 (GR from PO)
├─ Account Key: BSX (재고)
└─ OBYC에서 조회:
   ├─ Valuation Class 3000 + Transaction Key BSX
   └─ → GL 계정 101100

Movement Type 201 (판매오더 출고)
├─ Account Key: GBB (자재소비)
└─ OBYC에서 조회:
   ├─ Valuation Class 3000 + Transaction Key GBB
   └─ → GL 계정 504010
```

### 4단계: OBYC 매트릭스 설정 — 가장 중요!

T-code: **OBYC**

```
화면 구조:
┌─────────────────────────────────┐
│ Valuation Classes (행)           │
│ Transaction Keys (열)            │
├─────────────────────────────────┤
│                                 │
│ ┌─ 3000 ─ BSX → 101100         │
│ │         GBB → 504010         │
│ │         WRX → 131000         │
│ │         PRD → 501210         │
│ │                               │
│ ├─ 3100 ─ BSX → 102100         │
│ │         GBB → 504020         │
│ │         WRX → 131100         │
│ │         PRD → 501220         │
│ │                               │
│ └─ 3200 ─ BSX → 103100         │
│           (Finished Goods)      │
│                                 │
└─────────────────────────────────┘
```

#### 구체적 설정 예시

**Valuation Class 3000 (구입 원자재)**

| Transaction Key | 설명 | GL Account | 계정명 |
|-----------------|------|-----------|--------|
| **BSX** | Inventory(재고) | 101100 | Raw Materials |
| **GBB** | Material Consumption(소비) | 504010 | Cost of Materials |
| **WRX** | GR/IR(미정산) | 131000 | GR/IR Clearing Account |
| **PRD** | Price Diff(가격차이) | 501210 | Purchase Price Variance |
| **MWS** | Tax(세금) | 172100 | Input VAT |

**Valuation Class 3100 (반제품)**

| Transaction Key | GL Account | 계정명 |
|-----------------|-----------|--------|
| BSX | 102100 | Semi-Finished Goods |
| GBB | 504020 | WIP Consumption |
| WRX | 131100 | GR/IR Semi-Finished |
| PRD | 501220 | WIP Price Variance |

### 5단계: 가격차이(Variance) 계정 설정

Price Variance는 표준원가와 실제 구입가 간의 차이를 기록:

```
표준가(Standard Price): 100 USD/EA
실제가(Invoice Price): 105 USD/EA
차이(Variance): 5 USD/EA × Qty

자동전기:
├─ 차변: GL 504010 (COGS/Inventory) — 105
├─ 대변: GL 131000 (GR/IR) — 100
└─ 대변: GL 501210 (Price Variance) — 5
```

**OBYC 설정**:
```
Valuation Class 3000 + Transaction Key PRD → GL 501210
```

### 6단계: 자동전기 시뮬레이션 (OMWB)

T-code: **OMWB** (Simulate Automatic Posting)

```
화면:
├─ Company Code: 1000
├─ Valuation Class: 3000
├─ Transaction Key: BSX
└─ [Execute] → 결과:
   ├─ GL Account: 101100 ✓
   ├─ Debit/Credit: D (Debit) ✓
   └─ Field name: 'Account for Materials in Inactivity'
```

**ECC에서의 프로세스:**
```
OMWB → 검증 성공
  ↓
MM01: 자재 생성 + Valuation Class 3000
  ↓
MB01 또는 MIGO: 101 이동유형으로 입고
  ↓
FB03: Document Display → 자동전기 확인
  ├─ 차변: 101100 ✓
  ├─ 대변: 131000 (GR/IR) ✓
  └─ Amount: 100 USD × 10 EA = 1000 USD ✓
```

## 평가영역(Valuation Area)과 평가그룹(Valuation Group)

### ECC: 평가영역 = 회사코드

```
회사코드: 1000 (Germany)
└─ Valuation Area: 1000
   ├─ Chart of Accounts: INT
   ├─ Valuation Method: Moving Average
   └─ IMRG (Inventory Management FI Bridge):
      ├─ GR/IR 계정: 131000
      └─ 재평가 계정: 115000
```

### S/4HANA: 평가그룹 확장 (2020+)

```
회사코드: 1000
├─ Valuation Area: 1000
│  └─ OMWB로 자동 검증
│
└─ Valuation Group: VG1 (Optional — 추가 세분화)
   ├─ VG1 Procurement: RM + PM → GL 101100
   ├─ VG2 Production: WIP → GL 102100
   └─ VG3 Sales: FG → GL 103100
```

**S/4에서의 ML(Material Ledger) 통합:**
```
OMWB 실행 → Material Ledger 자동 기록
 └─ 자재별 실제비용 추적 (거래별 분석 가능)
```

## 구성 검증

### 검증 1: OMSL에서 평가클래스 확인
```
T-code: OMSL → Display Mode
└─ Valuation Class 3000 조회
   ├─ Inventory Account: 101100 ✓
   └─ Consumed Account: 504010 ✓
```

### 검증 2: OBYC에서 매트릭스 전체 확인
```
T-code: OBYC → Display Mode
└─ Company Code 1000
   ├─ Valuation Class 3000 행
   ├─ BSX 열 → 101100 ✓
   ├─ GBB 열 → 504010 ✓
   └─ WRX 열 → 131000 ✓
```

### 검증 3: OMWB로 시뮬레이션 실행
```
T-code: OMWB
├─ Company Code: 1000
├─ Valuation Class: 3000
├─ Transaction Key: BSX
└─ [Execute] → 결과: GL 101100 (Inventory) ✓
```

### 검증 4: 실제 거래로 엔드-투-엔드 테스트
```
1. MM01: 자재 생성
   └─ Material: TEST-RM-001
   └─ Valuation Class: 3000

2. MIGO: 입고 (Movement Type 101)
   └─ Material: TEST-RM-001
   └─ Qty: 100 EA
   └─ [Post]

3. FB03: 자동전기 확인
   └─ Document: (자동생성번호)
   ├─ Line 1: GL 101100 (차변) 1000 USD ✓
   └─ Line 2: GL 131000 (대변) 1000 USD ✓

4. MMBE: 자재 가격 확인
   └─ TEST-RM-001 → Stock Value ✓
```

## 자재별 계정결정 조회 (OMWB 없이)

T-code: **MMBE** (Material Stock Overview)

```
T-code: MMBE
├─ Material: TEST-RM-001
├─ Plant: 1000
└─ Display
   ├─ Quantity: 100 EA
   ├─ Valuation Price: 10 USD/EA
   ├─ Total Stock Value: 1000 USD
   └─ GL Account (backgroun): 101100 ✓
```

## 주의사항

### 1. Valuation Class 미할당 → 자동전기 실패
**문제**: 자재 MM01에서 Valuation Class 선택 안 함
```
결과: MIGO 실행 → 에러 "No valuation class assigned"
```
**해결**: MM02로 자재 수정 → Valuation Class 할당 → 재입고

### 2. OBYC 매트릭스 불완전 → 특정 이동유형 처리 불가
**문제**: OBYC에서 Valuation Class 3000은 정의했으나, GBB(소비) 행이 비워짐
```
결과: 판매오더 출고(Movement Type 201) 시 에러
```
**해결**: OBYC → 3000 행 + GBB 열 → 504010 입력

### 3. GR/IR 계정 누락 → 미정산 자금
**문제**: OBYC에서 WRX(GR/IR) 행을 잘못 설정
```
결과: MIGO 입고 후 131000(GR/IR)에 미정산 잔액
      MIRO 송장 연결 시에도 차이남
```
**해결**: OBYC 재확인 + OMWB 시뮬레이션

### 4. 평가방법 혼재 → 통계 오류
**문제**: 같은 평가클래스 내에서 일부는 이동평균가(Moving Avg), 일부는 표준가(Std) 사용
```
결과: 자재별로 예측불가능한 가격 갱신
```
**해결**: 평가클래스별로 평가방법 일원화 (MARA-VERPR 필드)

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| OMSL 설정 | T-code 동일 | T-code 동일 |
| OBYC 조회 | 회사코드 기반 | 회사코드 + Valuation Group |
| Material Ledger | 추가 선택 모듈(MM-FIN) | 필수 통합 |
| 가격 갱신 | 자재별 (MARC) | 문서별 (MATDOC) |
| 자동전기 | MIRO 후 | GR 직후 (예정) |

## 참고 자료

- **SAP 공식**: IMG → MM → Valuation & Account Assignment
- **T-codes**: OMSL(클래스), OBYC(매핑), OMWB(시뮬레이션), MMBE(조회)
- **심화**: IMRG(Inventory Bridge), COEP(Cost Elements), ACDOC(회계문서)
