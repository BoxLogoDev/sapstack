# 다중 회사코드 운영 가이드

## 개요

대기업 SAP 환경에서는 단일 회사가 아닌 다중 회사코드(Company Code)를 운영한다. 이는 법인 분리, 지역별 회계 기준, 세무 보고 요구사항에 따라 필요한 구조다.

**sapstack의 역할**: 다중 회사코드 환경에서 오류를 조기 감지하고, 결산 프로세스의 병목을 식별하며, 회사코드 간 거래 일관성을 검증한다.

---

## 1. 다중 회사코드 도입 이유

### 법인 구조와 회계 분리

| 이유 | 예시 | SAP 구현 |
|------|------|---------|
| **법인 분리** | A 회사(주), B 회사(자회사) | Company Code 별 독립 결산 |
| **지역 간 세무** | 한국/일본/미국 | 각 국가별 법정 회계 규칙 적용 |
| **사업부 분리** | 제조/유통/금융 | 사업부별 회사코드 → 연결 분석 |
| **관리회계** | 이익센터 분석 | Controlling Area가 N개 회사코드 포함 |

### 한국 특수성

- **법인세법**: 독립 법인 → 개별 신고, 자회사는 별도 회계연도 가능
- **연결재무제표**: K-IFRS 기준, 관계회사 자동 소거 필수
- **전자세금계산서**: 회사코드별 고유 사업자등록번호 필수
- **원천징수**: 관계회사 간 용역료 지급 시 원천징수 세율 다름

---

## 2. 회사코드 구조 설계

### 기본 마스터 데이터 구조

```
Company (OI01)
  ├─ Company Code 1000 (한국)
  │   ├─ Chart of Accounts (H1)
  │   ├─ Fiscal Year Variant (V3)
  │   ├─ Controlling Area (한국_CO)
  │   ├─ Sales Organization (한국_SO)
  │   └─ Plant (Plant 1100, 1200)
  │
  ├─ Company Code 1100 (일본)
  │   ├─ Chart of Accounts (H1)  ← 동일 CoA 권장
  │   ├─ Fiscal Year Variant (V3)
  │   ├─ Controlling Area (일본_CO)
  │   └─ Sales Organization (일본_SO)
  │
  └─ Company Code 1200 (미국)
      └─ ...
```

### 핵심 설정

1. **Chart of Accounts (CoA) 공유 vs 분리**
   - 권장: 모든 회사코드가 **동일 CoA 사용** (H1)
   - 예외: 국가별 법정 계정이 다를 경우 별도 CoA (H2, H3)
   - 비용: CoA당 I18N(번역), Master Data 유지보수 증가

2. **Fiscal Year Variant**
   - 대부분 V3 (Jan-Dec, 4개 월별 마감)
   - 일본: 4월 회계연도 → V2 (Apr-Mar)

3. **결산 통화**
   - Group Currency: KRW (한국 본사)
   - Local Currency: JPY (일본), USD (미국)
   - 분석 통화: EUR (Internal consolidation)

---

## 3. FI: 다중 회사코드 결산 프로세스

### 3-Step 결산 구조

```
Step 1: 개별 결산 (Individual Company Close)
├─ CC 1000 (한국): 11월 20일 ~ 12월 5일
├─ CC 1100 (일본): 11월 25일 ~ 12월 10일
└─ CC 1200 (미국): 11월 30일 ~ 12월 15일

Step 2: 내부거래 소거 (Intercompany Elimination)
├─ IC 거래 대사
├─ 소거 전표 자동/수동 입력
└─ 미결제 IC 확인

Step 3: 연결 결산 (Consolidated Closing)
├─ 연결 조정 (통합 계정)
├─ 지배권 분석 (지분율)
└─ 최종 Group 재무제표
```

### 개별 결산 체크리스트

**FI-CL (Financial Close)**

| 항목 | T-code | 체크 |
|------|--------|------|
| 이월 정산 | F.82 | 미결제 AP/AR 확인 |
| 환차손익 | OB94 | 월말 환율 조정 |
| 선급금 소거 | F.73 | 선급/미청구 매출 |
| 유형자산 감가상각 | AFAB | 월별 정각 실행 |
| 재고 평가 | MBSL | 표준원가 vs 실제원가 |
| 충당금 | FB60 | 미수금충당금, 재고 평가충당금 |
| 매출 인식 (ASC606) | VOFM | 수익 조정 |

### sapstack의 활용: FI 다중 회사코드 검증

```
Evidence Loop:
1. SM21 System Log 읽기 → 오류 회사코드 필터링
2. FBL3N (Vendor Ledger) → 회사코드별 미결제 건수
3. FBL1N (Customer Ledger) → 회사코드별 주의 대상
4. FB09 (G/L Balance) → 회사코드별 변동성 높은 계정 추출
5. FS10N (Balance Sheet) → 회사코드 간 이상 구조 탐지

진단:
- "CC 1100에서 미결제 AP가 전월 대비 200% 급증"
- "이월 정산 누락된 회사코드 3곳 발견"
- "환차손익이 정상 범위를 벗어남 (CC 1200, USD)"
```

---

## 4. CO: 관리회계 다중 회사코드 운영

### Controlling Area와 회사코드 관계

```
Controlling Area (KOREA_CO)
  │
  ├─ Company Code 1000
  ├─ Company Code 1100 (일본)
  └─ Company Code 1200 (미국)
```

**1:N 구조**: 하나의 Controlling Area가 여러 회사코드를 포함.

### Cost Allocation & Routing

**배부 규칙 (Distribution Rules)**

| 배부 주체 | 배부 대상 | 방법 | 기준 |
|----------|----------|------|------|
| Cost Center 총무팀 (1000) | 제조(1000, 1100, 1200) | 자동 | 인원수, 매출액 |
| 공장(Plant 1100) 유틸리티 | 부서별 비용 배부 | Cycle (CO41) | 에너지 사용량 |
| 본사 관리비 | 사업부별 배부 | Periodic | 손익 기준 |

**배부 키 설정 (OKD1)**

```
Key = PERC (비율)
  - 1000: 50%
  - 1100: 30%
  - 1200: 20%

실행: KOAK (Cost Allocation Run)
→ 월별 자동 배부 → 검증 → 게시
```

### 검증 및 대체 (Reconciliation & Adjustment)

**FI-CO Reconciliation**

| CO 계정 | FI 계정 | 대사 T-code | 주기 |
|---------|---------|-----------|------|
| Cost Center GL 잔액 | FI G/L Balance | F.03 | Daily |
| Profit Center PL | FI Segment Report | EC7 | Monthly |

**수동 대체 (Manual Posting)**

```
KO04: Manual Posting to Cost Center
- Cost Center: 1000-0100-0001 (총무팀)
- Amount: 500,000 KRW
- Cost Element: 400100 (인건비)

KO28: Period-End Close Steps
→ Validation Rules
  - 예산 vs 실적: "초과 + 통보"
  - 회사코드 간 배부: "밸런스 체크"
```

### sapstack의 역할: CO 검증

```
Evidence Loop:
1. COBE (Line Item Report) → 회사코드별 배부 추적
2. FK03 (Cost Center Master) → 회사코드 할당 확인
3. KPF3 (Profit Center Master) → Profit Center 정의 체크
4. KB31 (Cost Allocation Run Log) → 배부 성공/실패 원인

진단:
- "일본(1100) 매출 배부 시 회사코드 누락됨"
- "배부 권한이 미국(1200)에만 없음"
- "Periodic Repostings 5곳 미실행"
```

---

## 5. MM: 플랜트 & 회사코드 매핑

### 플랜트 구조

```
Company Code 1000 (한국)
  ├─ Plant 1100 (서울 공장)
  ├─ Plant 1200 (부산 공장)
  └─ Plant 1300 (대구 공장)

Company Code 1100 (일본)
  ├─ Plant 2100 (도쿄)
  └─ Plant 2200 (오사카)
```

**핵심**: 플랜트는 **1개 회사코드에만 속함**. 회사코드 간 재고 이동은 **STO (Stock Transfer Order)**로 처리.

### Stock Transfer Order (회사간 STO)

**프로세스**:

```
Supplying Company Code 1000
  ├─ Storage Location: 01
  └─ Material: MAT-001
     │
     (STO 생성: ME21N, 타입 UB)
     │
     ↓
Receiving Company Code 1100
  ├─ Plant 2100
  └─ Storage Location: 01
```

**설정 (OMS2)**:

```
Supplying Plant:    1100
Receiving Plant:    2100
Delivery Time:      10 days
Supply Relationship: 설정 필수
```

**회계 처리**:

| 단계 | 회사코드 | T-code | GL 계정 |
|------|----------|--------|---------|
| STO 생성 | 1000 (공급) | ME21N | 재고 → 이체중 |
| 배송 | 1000 | MB1B | 이체중 → 0 |
| 입고 | 1100 (수령) | MB1C | 미수금 → 재고 |
| 청구서 | 1100 → 1000 | MIRO | 매입채무 ↔ 매출채권 |

**sapstack 검증**:

```
Evidence Loop:
1. MB51 (Movement History) → STO 거래 추적
2. MMBE (Stock Overview) → 회사코드별 보유 재고
3. VL10G (Outbound Delivery) → Company Code 간 배송 상태
4. MIRO (Invoice) → IC 청구서 일치율

진단:
- "미체결 STO 45건: 배송 지연 평균 12일"
- "회사코드 1100의 이체중 재고 계정 불일치"
- "MIRO 미일치: 발주수량 ≠ 입고수량 (8건)"
```

---

## 6. SD: 회사간 판매 (Intercompany Sales)

### IC 판매 구조 (3-way)

```
Sales Organization (1000_SO): 주문 회사
  │
  → Sales Organization (1100_SO): 판매 회사
      │
      → Plant (2100): 배송 회사

결과:
1. 주문 회사 (1000_SO) 수익 인식
2. 판매 회사 (1100_SO) 판매 수익 (IC 가격)
3. IC 소거: 연결 결산 시 상계
```

### 회사코드별 Sales Organization 매핑

| Company Code | Sales Organization | Sales Area | Distribution Channel |
|--------------|-------------------|-----------|---------------------|
| 1000 | 1000_SO | 01 (Domestic) | 10 (Wholesale) |
| 1100 | 1100_SO | 01 (Japan) | 20 (Retail) |
| 1200 | 1200_SO | 01 (USA) | 10 (Wholesale) |

### 이전가격(Transfer Pricing) 설정

**OKU1**: IC 가격 결정 규칙

```
Material: MAT-001
From Plant: 1100 → To Plant: 2100

Pricing Rule:
  - Standard Cost + 10% margin
  - 또는 Market Price (Benchmark)
  - 또는 Cost+

K-IFRS 요구사항:
  - "독립된 제3자 간 거래가격(Arm's Length Principle)"
  - 근거 문서 3년 보관 필수
```

**sapstack 추적**:

```
Evidence Loop:
1. VA01 (Sales Order) → 주문 회사코드 추적
2. VFFZD (Invoice Log) → IC 청구 가격 검증
3. VF04 (Billing) → 미청구 건 식별
4. VBRK (Billing Header) → 회사코드 간 가격 이상치

진단:
- "CC 1000 → 1100 IC 판매 가격이 표준원가보다 낮음"
- "미청구 IC 주문 3개월 누적: 총액 5,000만 원"
- "회사코드 1200에서 이전가격 문서 부재"
```

---

## 7. HR: 인사 조직 vs 회사코드

### 조직 구조

```
Company Code 1000
  ├─ Personnel Area 01 (본사)
  ├─ Personnel Area 02 (공장)
  └─ Personnel Area 03 (영업)

Company Code 1100 (일본)
  └─ Personnel Area 11 (도쿄 지사)
```

**핵심 관계**:

| HR 개체 | FI 개체 | 연결 |
|---------|---------|------|
| Company Code (H0001) | Company Code (1000) | Cost Center 비용 배부 |
| Personnel Area | Plant | 근무지 |
| Cost Center | GL Account | 급여 비용 |

### 급여(Payroll) 회사코드별 처리

**실행 (PHCE)**:

```
Payroll Run:
  - Country: KR (한국)
  - Company Code: 1000
  - Personnel Area: 01
  - Period: 202403
  - Run Date: 2024-03-25
  
→ 자동 GL 전기: Cost Center 4110 (급여비) → GL 400100
```

**다국가 급여**:

```
JP Payroll (Company Code 1100)
  - Tax Rules: JP 소득세, 사회보험
  - Currency: JPY
  - GL Account: 별도 설정 (일본 회계 규칙)

US Payroll (Company Code 1200)
  - Tax Rules: Federal + State (NY, CA 등)
  - Currency: USD
  - GL Account: GAAP 기준
```

---

## 8. 기간마감(Period End Close) 체크리스트

### 다중 회사코드 결산 순서

```
Day 1-3: 회사코드별 거래 입력
├─ SD: 배송 및 청구서 마감
├─ MM: 재고 조사 및 평가
└─ HR: 급여 확정

Day 4-7: 개별 결산
├─ FI-CL: 회사코드 1000 마감
├─ FI-CL: 회사코드 1100 마감
└─ FI-CL: 회사코드 1200 마감

Day 8-10: 내부거래 정산
├─ IC 대사 (OBYA)
├─ 소거 전표 입력
└─ 미결제 확인

Day 11-12: 연결 결산
├─ 연결 조정 (통합 재무제표)
├─ 지배권 분석
└─ 최종 승인
```

### 자동화 도구

**Closing Monitor (FCMONITOR)**

```
Status Dashboard:
┌─────────────────────────────────────┐
│ Company Code | Step | Status | User │
├─────────────────────────────────────┤
│ 1000        | FI   | 완료  | 김○○ │
│ 1100        | FI   | 진행중 | 이○○ │
│ 1200        | FI   | 미시작 |  -  │
└─────────────────────────────────────┘

sapstack 활용:
- 진행 상황 실시간 추적
- 지연 회사코드 조기 경고
- 이전 개월 대비 소요시간 분석
```

**자동 검증 규칙**

| 규칙 | 조건 | 액션 |
|------|------|------|
| FI 밸런스 | Debit ≠ Credit | 블로킹 + 알림 |
| IC 대사 | 송신 ≠ 수신 | 대사표 생성 |
| 환율 | 월말 환율 미등록 | 적용 확인 |
| GL 계정 | 분개 불가 계정 사용 | 거부 + 로그 |

---

## 9. sapstack 다중 회사코드 진단 시나리오

### 시나리오 1: 연결 결산 지연

```
증상:
- Group Consolidation 예정일 3일 전
- Company Code 1100 (일본)에서 신호 없음

Evidence Loop:
1. SM21 → "Company Code 1100: OC 마감 미완료"
2. FBL3N → "Vendor 1000-JS-001의 미수금 5,000만 엔 미대사"
3. FB09 → "GL 150100 (미수금): 이상 증가"
4. OB94 → "환율 조정 미실행" (12월 31일)

진단:
"일본 회사코드 환율 조정 미완료로 인한 결산 지연.
이전 개월 평균 소요시간 대비 2일 초과."

추천:
- OB94 실행 (환차손익 계정 자동 생성)
- FI-CL 다시 시작
- 예상 완료: 2024-01-04
```

### 시나리오 2: IC 거래 소거 오류

```
증상:
- 연결 재무제표 총자산이 전월 대비 이상 높음 (± 3%)

Evidence Loop:
1. FB09 → "IC 소거 전 총 자산: 1,000억"
2. FB09 → "IC 소거 후 총 자산: 920억 (기대: 950억)"
3. OBYA → "Due-to/Due-from 계정 대사 불일치"
4. FBL3N (CC 1000) → "Company 1100 미수금: 80억"
5. FBL3N (CC 1100) → "Company 1000 미지급금: 75억 (불일치!)"

진단:
"IC 미수금-미지급금 5억 원 불일치.
예상원인: 1100에서 송금 건이 미기록되었거나,
1000에서 수령 기록 시점 차이."

추천:
- FF5A (Automatic Clearing) 실행
- FI12 (Period-End Close) → IC 소거 다시 실행
- 차이 건 수동 조정
```

### 시나리오 3: 다중 회사코드 권한 이슈

```
증상:
- Company Code 1200 (미국)의 사용자가 결산 스텝 진행 불가

Evidence Loop:
1. SM21 → "Company Code 1200: P2 권한 부재"
2. PFCG → "User는 C_FOP5 (FI 전용) 롤만 보유"
3. SU01 → "미국 사용자: Roles = [C_FOP5, C_FIN] 부족"

진단:
"FCMONITOR 액세스 및 FI 결산 초기화 권한 부재.
필요 권한: F_FCAP (Closing Run 초기화)"

추천:
- Role FIN_MNGR (또는 커스텀) 할당
- FI_CLOSE 프로파일 활성화
- 권한 테스트: FCMONITOR 재접속
```

---

## 10. 모범 사례 및 주의사항

### Best Practices

1. **Master Data 동기화**
   - CoA 변경 시 모든 회사코드에 즉시 반영
   - GL Account 신설은 CMS (Change Management System) 승인 후 Transport

2. **정기 Reconciliation**
   - FI-CO 월 1회 (F.03)
   - IC 거래 월 2회 (OBYA)
   - GL Balance 주 1회 (FB09)

3. **감사 추적**
   - 모든 수동 대체는 Change Document 보관 (FS06)
   - STO 거래는 SM21 로그 기록
   - 권한 변경은 SU24 기록

### 주의사항

| 항목 | 주의 | 대책 |
|------|------|------|
| **CoA 변경** | 회사코드별 Chart 다르면 Consolidation 복잡 | 표준 CoA 유지, 예외 최소화 |
| **환율 조정** | 미실행 시 FI 밸런스 깨짐 | 월말 OB94 자동화 |
| **IC 소거** | 송신-수신 시차 발생 | 월말 3일 이상 여유 |
| **권한 분리** | CFO ≠ Controller 권한 동일 시 부패 위험 | 역할 분리 강화 (SoD) |

---

## 결론

다중 회사코드 운영은 **구조화된 프로세스**, **정기적 검증**, **감시 도구**의 조합이다.

**sapstack은 이 세 가지를 자동화**:

1. **구조 이해** (Evidence Loop로 현재 상태 파악)
2. **이상 탐지** (임계값 벗어난 거래 식별)
3. **근본원인 분석** (T-code 로그 + Master Data 연결)

대기업 CFO가 원하는 것은 **"결산 완료까지 남은 일자"**가 아니라 **"다음에 터질 문제가 무엇인가"**이다. sapstack이 그 질문에 답하는 도구다.
