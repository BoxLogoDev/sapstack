# 관리회계(Controlling, CO) IMG 구성 가이드 — 개요

## SPRO 경로
```
SPRO → Controlling (CO)
```

## CO IMG 주요 영역

### 1. 기본 설정 (Basic Settings)
- **관리회계영역 정의** (T-code: OKKP)
- **관리회계영역 → 회사코드 할당** (T-code: OX06)
- **원가요소 유형** (T-code: KA06 / FS00)
- **통계 지표** (T-code: KK01)

### 2. 원가센터 회계(CCA — Cost Center Accounting)
- **원가센터 생성** (T-code: KS01)
- **원가요소 정의** (T-code: KA06 또는 FS00)
- **Assessment 주기** (T-code: KSU1)
- **Distribution 주기** (T-code: KSV1)
- **통계 지표 관리** (T-code: KK01)

### 3. 내부오더(Internal Orders)
- **오더 유형 정의** (T-code: OKT2)
- **결산 프로필** (T-code: OKO7)
- **오더 생성** (T-code: KO01)
- **정산 규칙** (T-code: KO88)

### 4. 제품원가(Product Costing)
- **원가구성요소 구조** (T-code: OKTZ)
- **원가추정 변형** (T-code: OKKN)
- **자재원가 계산** (T-code: CK11N)
- **제품원가 계산** (T-code: CK40N)
- **원가 전개** (T-code: CK24)

### 5. 이익센터(Profit Center Accounting)
- **이익센터 정의** (T-code: KE51)
- **이익센터 조직 구조** (T-code: KEPM)
- **차원 정의** (T-code: KYDS)

### 6. 원가 보고 및 분석
- **원가요소 보고** (T-code: KA03)
- **원가센터 보고** (T-code: KS03)
- **이익센터 보고** (T-code: KE30)
- **ABC(Activity-Based Costing)** (T-code: KKA1)

## 구성 순서 (권장)

```
1단계 기본설정
  ├─ OKKP: 관리회계영역 생성
  ├─ OX06: 관리회계영역 → 회사코드 할당
  └─ KA06 또는 FS00: 원가요소 정의

2단계 원가센터회계(CCA)
  ├─ KS01: 원가센터 생성
  ├─ KSU1: Assessment 주기 설정
  ├─ KSV1: Distribution 주기 설정
  └─ KK01: 통계 지표

3단계 내부오더
  ├─ OKT2: 오더 유형 정의
  ├─ OKO7: 결산 프로필
  ├─ KO01: 오더 생성
  └─ KO88: 정산 규칙

4단계 제품원가
  ├─ OKTZ: 원가구성요소 구조
  ├─ OKKN: 원가추정 변형
  ├─ CK11N: 자재원가 계산
  ├─ CK40N: 제품원가 계산
  └─ CK24: 원가 전개

5단계 이익센터
  ├─ KE51: 이익센터 정의
  └─ KEPM: 조직 구조

6단계 보고
  ├─ KA03: 원가요소 보고
  ├─ KS03: 원가센터 보고
  └─ KE30: 이익센터 보고
```

## CO 모듈 특성

### FI vs CO 관계
| 항목 | FI (재무회계) | CO (관리회계) |
|------|------------|------------|
| **목적** | 재무보고, 세무신고 | 의사결정, 성과 관리 |
| **대상** | 외부 이해관계자 | 내부 경영진 |
| **계정** | GL 계정 | 원가요소, 원가센터 |
| **기준** | GAAP, K-IFRS, 세법 | 경영 정책 |
| **의무성** | 필수 | 선택 (활성화 시) |

### CO의 세 가지 주요 기능

1. **Cost Accounting (원가계산)**
   - 제품별, 프로세스별 원가 집계
   - 원가요소 → 원가센터 → 제품 이동

2. **Management Accounting (관리회계)**
   - 원가센터별 예산 vs 실적 분석
   - 부문별 이익 분석

3. **Product Costing (제품원가)**
   - 자재 원가
   - 제조 원가 (노무비, 경비)
   - 제조 간접비 배부

## ECC vs S/4HANA 주요 변경

| 항목 | ECC | S/4 |
|------|-----|-----|
| **원가요소** | KA06 (독립) | FS00 (GL 통합) |
| **원가센터** | KS01 (독립) | ACDOCA (GL 연계) |
| **가변성** | Variable / Fixed | GL 속성으로 자동 분류 |
| **ABC** | KKA1 선택 | ACDOCA 기반 |
| **실시간 보고** | 배치 기반 | ACDOCA 실시간 |

## 공통 용어

| 용어 | 설명 |
|------|------|
| **Cost Element** | 원가요소 (자재비, 인건비 등) |
| **Cost Center** | 원가센터 (부서, 팀) |
| **Cost Object** | 원가객체 (제품, 프로젝트) |
| **Internal Order** | 내부오더 (프로젝트, 임시 업무) |
| **Primary Costs** | 1차 원가 (외부 구매) |
| **Secondary Costs** | 2차 원가 (내부 배분) |
| **Actual Costs** | 실제원가 (실적) |
| **Standard Costs** | 표준원가 (기준) |
| **Variance** | 차이 (실적 vs 기준) |
| **Material Ledger** | 자재원장 (자재 추적) |

## 관리회계영역(Controlling Area)

**정의**: CO의 최상위 조직 단위

```
Controlling Area (관리회계영역)
  ├─ Company Code 1 (회사코드 1)
  ├─ Company Code 2 (회사코드 2)
  └─ Company Code 3 (회사코드 3)
```

**특징**:
- 여러 회사코드를 포함 가능 (통합 원가 관리)
- 독립적 원가 계산 정책
- Fiscal Year Variant 공유 (OB29와 동일)

**구성 예시** (한국식):

```
관리회계영역: "K100"

K100 내 회사코드:
  - 1000: 모사업부
  - 1100: 자재부
  - 1200: 제조부
  
공통 정책:
  - 회계연도: K1 (1월~12월)
  - 환율: KRW
  - 원가추정 변형: V1 (표준)
```

## 월별 CO 프로세스

### 월초
- 예산 공지
- 배분 규칙 확인

### 월중
- 거래 자동 기록 (FI → CO 연계)
- 원가 누적

### 월말
- Assessment/Distribution 배치 실행
- 원가센터별 성과 분석
- 예산 vs 실적 보고

### 분기말
- 원가 할당 (Cost Allocation)
- 제품원가 재계산
- 경영진 보고

## 관련 주요 T-codes

| T-code | 기능 | 용도 |
|--------|------|------|
| **OKKP** | 관리회계영역 정의 | 초기 설정 |
| **OX06** | 영역 ↔ 회사코드 | 초기 설정 |
| **KS01** | 원가센터 생성 | 일상 |
| **KA06** | 원가요소 정의 (ECC) | 초기 설정 |
| **FS00** | GL 계정 (S/4) | 초기 설정 |
| **KE51** | 이익센터 정의 | 초기 설정 |
| **CK11N** | 자재원가 계산 | 월말 |
| **CK40N** | 제품원가 계산 | 월말 |
| **KSU1** | Assessment 주기 | 초기 설정 |
| **KSV1** | Distribution 주기 | 초기 설정 |
| **KS03** | 원가센터 보고 | 일상 |
| **KE30** | 이익센터 보고 | 일상 |

## 체크리스트

- [ ] OKKP: 관리회계영역 정의
- [ ] OX06: 회사코드 할당
- [ ] KA06/FS00: 원가요소 정의
- [ ] KS01: 원가센터 생성
- [ ] KE51: 이익센터 정의 (필요시)
- [ ] KSU1/KSV1: 배분 주기 설정
- [ ] 원가 마스터: 검증 완료
- [ ] 거래 연계: FI → CO 자동 매핑 확인
