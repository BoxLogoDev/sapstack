# MRP 구성(MRP Configuration) IMG 구성 가이드

## SPRO 경로
`SPRO → Production Planning and Control (PP) → Master Planning → MRP`

Primary T-codes: **MARC** (자재 마스터 MRP View), **OPU3** (MRP Profile), **OPU5** (Scheduling Margin Key)

## 필수 선행 구성
- [ ] 자재 마스터 기본정보 (MM01)
- [ ] 회사코드/플랜트 (OC04)
- [ ] 평가클래스 (OMSL)

## 핵심 개념: MRP 유형 4가지

```
MRP Type Selection (MARC-DISPR):
├─ PD: Materials Planning (MRP)
│  ├─ 재주문점(ROP) 또는 시간계획 선택
│  └─ 자동으로 구매요청(PR) 또는 생산오더(PD) 생성
├─ VB: Reorder Point Planning
│  ├─ 재고 < Safety Stock → 주문 트리거
│  └─ 표준편차 기반
├─ VV: Forecast-based Planning
│  ├─ 판매예측 기반
│  └─ 계절변동 고려
└─ ND: No Planning
   ├─ 수동 주문만
   └─ 용역, 특수주문 자재
```

## 구성 단계

### 1단계: 자재 마스터에서 MRP 유형 선택 (MARC)

T-code: **MM01** 또는 **MM02** (Material Master)

```
자재: TEST-RM-001 (원자재)

화면:
└─ MRP 1 View
   ├─ MRP Type (DISPR): PD ← 선택
   │  (다른 옵션: VB, VV, ND)
   │
   ├─ MRP Controller (DISMM): 001
   │  └─ 1000번대 = 원자재
   │  └─ 2000번대 = 중간제품
   │
   ├─ Lot Sizing (LOSFX): EX (Lot-for-Lot)
   │  ├─ EX: 주문량 = 소비량
   │  ├─ FX: 고정량 (예: 100 EA)
   │  ├─ WB: 기간별 (예: 1주일치)
   │  └─ ZP: 경제적 주문량(EOQ)
   │
   ├─ Safety Stock (EISBE): 50 EA
   │  └─ Buffer Stock 레벨
   │
   ├─ Safety Time (SFETP): 5 days
   │  └─ Lead Time 버퍼
   │
   ├─ Planned Delivery Time (DZEIT): 10 days
   │  └─ 공급자 납기
   │
   └─ Planning Time Fence (PLFTZ): 3 days
      └─ 이 기간 내 계획 고정
```

### 2단계: MRP 유형별 상세설정

#### MRP Type PD (Materials Planning) — 권장

```
자재: TEST-RM-001

설정:
├─ MRP Type: PD
├─ MRP Controller: 001
├─ Lot Sizing Policy:
│  ├─ EX (Lot-for-Lot): 주문량 = 소비량
│  │  └─ 예: 일일소비 100 EA → 주문 100 EA
│  ├─ FX (Fixed): 고정 주문량
│  │  └─ 예: 항상 500 EA 주문
│  └─ WB (Weekly): 1주일치 누적 주문
│     └─ 예: Mon~Fri 합산 500 EA → Fri에 주문
│
├─ Safety Stock (EISBE): 50 EA
│  ├─ 목적: 수요변동 시 부족 방지
│  ├─ 계산: 일일소비 × 안전계수 (예: 5일×10EA = 50)
│  └─ 비용: 과다보유 → 자금 부담
│
├─ Planned Delivery Time: 10 days
│  ├─ 공급자 Lead Time
│  └─ MRP 계산에 포함되어 미리 주문
│
├─ Safety Time: 5 days
│  ├─ 추가 버퍼
│  └─ 예: PD 10 + ST 5 = 15일 전 예약주문
│
└─ Planning Time Fence: 3 days
   ├─ 3일 이내: 계획 고정 (변경 불가)
   └─ 3일 이상: 계획 재계산 가능
```

#### MRP Type VB (Reorder Point Planning) — Steady Stock 자재용

```
자재: TEST-FM-001 (자유로운 구매 자재)

설정:
├─ MRP Type: VB (Reorder Point)
├─ Reorder Point (ROP): 100 EA
│  ├─ Safety Stock: 50 EA (기본 보유)
│  ├─ Normal Consumption: 30 EA/day
│  ├─ Lead Time: 10 days → Normal use: 300 EA
│  └─ ROP = Safety(50) + Normal(300) = 350 EA
│     (실제 재고 < 350 → 자동 주문)
│
├─ Reorder Qty (ROQ): 500 EA
│  ├─ 매번 주문액은 500 EA로 고정
│  └─ 부족 시만 주문, 과다 보유 방지
│
├─ Safety Stock: 50 EA
│  └─ 변동사항 대비
│
├─ Planned Delivery Time: 10 days
│
└─ MRP이 아닌 정적 모니터링
   └─ MM/3(Inventory) 또는 MM/13 자동 조회
```

#### MRP Type VV (Forecast-based Planning) — 계절 상품용

```
자재: TEST-SEASON-001 (계절상품, 예: 에어컨)

설정:
├─ MRP Type: VV
├─ Planned Independent Requirement (PIR)
│  ├─ Demand Plan: January~June (0), Jul~Sep(1000/month), Oct~Dec(100/month)
│  │  └─ 여름 성수기 vs 겨울 비수기
│  └─ Forecast 입력: MC54 (또는 모듈 SOP)
│
├─ Safety Stock: 200 EA
│  ├─ 계절 변동성이 크므로 높음
│  └─ July 대비 June 미리 준비
│
├─ Lot Sizing: WB (Weekly)
│  └─ 주간별 누적 수요 기반
│
└─ Time Fence:
   └─ 예측: 12개월 | 계획: 6개월 | 확정: 1개월
```

#### MRP Type ND (No Planning) — 용역/특수

```
자재: TEST-SERVICE-001 (용역 자재)

설정:
├─ MRP Type: ND
├─ Procurement:
│  ├─ 자동주문 없음
│  ├─ 판매오더별 수동 PR 생성
│  └─ Backward Scheduling: 배송예정일 역계산
│
├─ 예시:
│  ├─ Sales Order: Delivery due 2026-05-31
│  ├─ Service Lead Time: 3 days
│  └─ → PR due date: 2026-05-28 (수동 생성)
│
└─ 사용처:
   ├─ 용역(Consulting)
   ├─ 운송료(Freight)
   └─ 외주 특수 작업
```

### 3단계: MRP Area 설정 (선택사항 — 대형사만)

T-code: **OPU3** (Define MRP Profile)

MRP Area는 같은 플랜트를 여러 MRP 영역으로 분할:

```
예시: Plant 1000을 3개 영역으로 분리

Plant 1000
├─ MRP Area M1 (Prod Plant): PD자재 계획
├─ MRP Area M2 (WH Area A): 창고 자재
└─ MRP Area M3 (WH Area B): 분리 창고

설정:
└─ OPU3: Plant 1000 → M1, M2, M3 정의
   └─ MARC에서 각 자재의 MRP Area 지정
```

### 4단계: Scheduling Margin Key (OPU5)

T-code: **OPU5** (Define Scheduling Margin)

생산 일정 계산 시 안전여유(Scheduling Margin) 설정:

```
화면:
┌──────────────────────────────────┐
│ Scheduling Margin Key            │
├──────────────────────────────────┤
│ Key 01:                          │
│ ├─ In-house Production:          │
│ │  ├─ Forward Margin: 5 days     │
│ │  └─ Backward Margin: 3 days    │
│ │                                │
│ ├─ External (Subcontracting):    │
│ │  ├─ Forward Margin: 10 days    │
│ │  └─ Backward Margin: 5 days    │
│ │                                │
│ └─ 적용: 라우팅(CA01)의 제어키  │
│    ├─ PP01(자제) → 5/3일        │
│    └─ F(외주) → 10/5일          │
└──────────────────────────────────┘
```

### 5단계: MRP Run 실행 (MD01 또는 MD01N)

T-code: **MD01** (MRP Planning) 또는 **MD01N** (Live Planning)

```
화면:
┌──────────────────────────────────┐
│ Material Requirements Planning    │
├──────────────────────────────────┤
│ Planning Date: 2026-04-12        │
│ Planning Run: 1 (번호)           │
│ Plant: 1000                      │
│ MRP Controller: 001              │
│                                  │
│ Planning Mode:                   │
│ ├─ Net Change: ▲ (권장)          │
│ │  (변경분만 재계산)             │
│ ├─ Regenerative: ☐              │
│ │  (전체 재계산 — 시간 걸림)     │
│ └─ Repair: ☐                    │
│    (손상된 계획 복구)            │
│                                  │
│ Execution:                       │
│ ├─ [ Test Run ] → 예상 결과      │
│ └─ [ Execute ] → 실행            │
│    └─ 생성: PR(구매요청), PD(생산)|
│       └─ 다음: MD04(결과 검토)  │
└──────────────────────────────────┘
```

**MD01N 결과 조회 (MD04):**

```
T-code: MD04 (Display Material Requirements)
├─ Material: TEST-RM-001
├─ MRP Run: 1
│
└─ Planning Details:
   ├─ Requirement (수요):
   │  ├─ Planned Sales Order: 100 EA (due 2026-05-15)
   │  └─ Planned Indep. Req: 50 EA (forecast)
   │     → Total: 150 EA required
   │
   ├─ Supply (공급):
   │  ├─ Current Stock: 40 EA (available)
   │  ├─ Shortage: 150 - 40 = 110 EA
   │  └─ Safety Stock: 50 EA (maintain)
   │     → Need to Order: 110 + 50 = 160 EA
   │
   ├─ MRP Proposal:
   │  └─ PR (구매요청) #5000001
   │     ├─ Qty: 160 EA (Lot Sizing EX)
   │     ├─ Vendor: (조건 테이블에서 조회)
   │     └─ Delivery Date: 2026-05-05 (PD 10 days back)
   │
   └─ Accept?
      ├─ Yes → PR 자동 생성
      └─ No → 거부, 수정 후 재생성
```

## 구성 검증

### 검증 1: MARC에서 MRP 설정 확인
```
T-code: MM02 (Change Material Master)
├─ Material: TEST-RM-001
├─ MRP 1 View
│  ├─ MRP Type: PD ✓
│  ├─ MRP Controller: 001 ✓
│  ├─ Lot Sizing: EX ✓
│  ├─ Safety Stock: 50 EA ✓
│  └─ Planned Delivery Time: 10 days ✓
```

### 검증 2: OPU5에서 Scheduling Margin 확인
```
T-code: OPU5 → Display Mode
├─ Scheduling Margin Key 01:
│  ├─ In-house Prod: 5/3 days ✓
│  └─ External Proc: 10/5 days ✓
```

### 검증 3: MD01N으로 테스트 MRP 실행
```
T-code: MD01N
├─ Planning Date: 2026-04-12
├─ Plant: 1000
├─ MRP Controller: 001
├─ [ Test Run ]
│
└─ Result:
   ├─ Materials to be Ordered: 3개
   │  ├─ TEST-RM-001: PR 5000001 (160 EA)
   │  ├─ TEST-RM-002: PR 5000002 (200 EA)
   │  └─ TEST-RM-003: PR 5000003 (80 EA)
   │
   ├─ Materials to be Produced: 2개
   │  ├─ TEST-PD-001: PD order draft (50 EA)
   │  └─ TEST-PD-002: PD order draft (100 EA)
   │
   └─ Confirm to Create? [Yes/No]
```

### 검증 4: MD04로 상세 검증
```
T-code: MD04
├─ Material: TEST-RM-001
├─ MRP Run: 1
│
└─ Details:
   ├─ Requirement: 150 EA ✓
   ├─ Available Stock: 40 EA ✓
   ├─ Safety Stock: 50 EA ✓
   ├─ Ordered: 160 EA (PR#5000001) ✓
   └─ Net Available After Order: 50 EA ✓
```

## 주의사항

### 1. MRP Type 오선택 → 계획 미작동
**문제**: 수시 주문 자재를 ND(No Planning)로 설정
```
결과: MD01 실행해도 주문 제안 없음 → 재고 부족
```
**해결**: 자재 특성별 MRP Type 정확히 선택 (PD or VB 권장)

### 2. Safety Stock 너무 낮음 → 외상(Shortage) 발생
**문제**: Safety Stock = 10 EA (일일소비 100 EA)
```
결과: 예상 외 수요 증가 → 즉시 부족
```
**해결**: Safety Stock = 일일소비 × 안전기간 (최소 5일)

### 3. Planned Delivery Time 오입력 → 일정 오류
**문제**: 공급자 납기 10일인데 DZEIT = 3일로 설정
```
결과: MD01 계획 → 3일 전 주문 → 배송 7일 지연
```
**해결**: 공급자 P/L 정확히 MARC-DZEIT에 입력

### 4. Low-level Code 미재계산 → MRP 순서 오류
**문제**: BOM 변경 후 OMIW(Low-level Code) 실행 안 함
```
결과: MD01 → 부품이 상위 제품보다 먼저 주문 → 계획 틀림
```
**해결**: 매 BOM 변경 후 반드시 OMIW 실행

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4HANA 2020+ |
|------|-----|-------------|
| MRP Run | MD01/MD02 배치 | MD01N(Live) — 실시간 |
| 실행 속도 | 시간대 | 분 단위 (HANA) |
| Lot Sizing | 수동 선택 | 자동 최적화 |
| Forecast | SOP/MC54 수동 | 머신러닝 기반 |
| Supply Chain | MM-focused | End-to-End(SD+PP+MM) |
| Predictive MRP | 없음 | PPIS (선도형) |

## 참고 자료

- **SAP 공식**: IMG → PP → Master Planning → MRP
- **T-codes**: MM01/MM02(자재), MD01N(계획), MD04(검증), OPU5(마진)
- **심화**: OMIW(Low-level), MC54(Forecast), CM01(Capacity)
