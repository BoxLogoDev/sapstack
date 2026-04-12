# 내부오더(Internal Order, IO) IMG 구성 가이드

## SPRO 경로
```
SPRO → Controlling → Internal Orders
    → Master Data → Order Types
```

## 필수 선행 구성

- [ ] OKKP: 관리회계영역 정의
- [ ] OX06: 회사코드 할당
- [ ] KA06/FS00: 원가요소 정의

## 내부오더의 개념

**내부오더(Internal Order)**: 임시 원가 집계 객체
- 프로젝트, 임시 업무, 수리, 유지보수 등 추적용
- 생명주기: 생성 → 오픈 → 종료(TECO) → 마감 → 폐기

**용도 예시**:
- 설비 수리 프로젝트
- 소프트웨어 개발 프로젝트
- 정기 유지보수
- 자산 건설 (Construction in Progress)

---

## 오더 유형 정의 (T-code: OKT2)

**SPRO 경로**: `SPRO → Controlling → Internal Orders → Master Data → Maintain Order Types`

### 구성 단계 1: 오더 유형 생성

```
T-code: OKT2 실행

Order Type: 1000
Description: 수리 및 유지보수 (Maintenance & Repair)
Category: 10 (정기 비용)
Responsible Person: 설비팀장
```

**표준 오더 유형**:

| 오더유형 | 설명 | 카테고리 | GL 계정 | 종료 후 처리 |
|---------|------|---------|--------|---------|
| 1000 | 수리/유지보수 | 10 (정기) | 522000 | 비용 |
| 1100 | 자산 건설(CIP) | 11 (자산) | 180000 | 자산 |
| 1200 | 프로젝트 | 12 (프로젝트) | 631000 | 내부오더로 마감 |
| 1300 | 환경 비용 | 13 (특별) | 590000 | 비용 |

**필드 설명**:

| 필드 | 설명 | 값 | 용도 |
|------|------|-----|------|
| Order Type | 오더유형 코드 | 1000 | 고유 |
| Description | 설명 | 수리/유지보수 | 관리 |
| Category | 카테고리 | 10 | 종료 후 처리 방식 결정 |
| Budget Profile | 예산 프로필 | BP-001 (선택) | 예산 관리 |
| Controlling Area | 관리회계영역 | KOR | 필수 |

---

## 결산 프로필 (T-code: OKO7)

**SPRO 경로**: `SPRO → Controlling → Internal Orders → Periodic Processing → Closing → Maintain Closing Profile`

**목적**: 오더 종료(TECO) 후 비용 처리 규칙

### 구성 단계

```
T-code: OKO7 실행

Closing Profile: CP-001
Description: 정기 비용 결산
Controlling Area: KOR
```

**결산 규칙 정의**:

```
오더유형 1000 (수리/유지보수) → 결산 프로필 CP-001:

Closing Rule:
  - Order Status: TECO (종료)
  - Processing: Settlement (정산)
  - Target: Cost Center 2001 (관리부)
  - Distribution Method: Proportional (비례)
```

**정산 규칙** (T-code: KO88):

```
T-code: KO88 실행

Order Type: 1000
Variance Key: VARKEY-001
Settlement Rule:
  - From: Internal Order (IO)
  - To: Cost Center (원가센터)
  - Allocation Base: Direct Cost (직비용 기준)
```

**표 형식**:

| 오더유형 | 종료상태 | 정산 대상 | 배분 기준 | GL 계정 |
|---------|---------|---------|---------|--------|
| 1000 | TECO | Cost Center | Direct | 520000 |
| 1100 | TECO | WIP/Asset | Basis | 180000 |
| 1200 | TECO | Internal Order | Direct | 631000 |

---

## 내부오더 생성 및 운영

### 오더 마스터 생성 (T-code: KO01)

```
T-code: KO01 실행

Order Number: 0000001000
Description: 설비 A 수리
Order Type: 1000 (수리/유지보수)
Controlling Area: KOR
Responsible Person: 설비팀장
Budget: 50,000,000 원
Start Date: 01.01.2024
Finish Date: 31.01.2024
```

**필드 설명**:

| 필드 | 설명 | 값 | 비고 |
|------|------|-----|------|
| Order Number | 오더 번호 | 0000001000 | 자동/수동 |
| Description | 설명 | 설비 A 수리 | 명확하게 |
| Order Type | 오더유형 | 1000 | OKT2에서 정의 |
| Controlling Area | 관리회계영역 | KOR | 필수 |
| Budget | 예산액 | 50,000,000 | 선택 |
| Start Date | 시작일 | 01.01.2024 | 필수 |
| Finish Date | 종료일 | 31.01.2024 | 선택 |

### 오더 생명주기

```
1단계: 생성 (Created)
  - KO01로 오더 생성
  - 상태: CREATED
  - 거래 불가

2단계: 오픈 (Released)
  - KO02에서 상태 변경
  - Status: RELEASED
  - 거래 가능

3단계: 종료 (Completed, TECO)
  - KO12로 TECO 처리
  - 추가 거래 불가
  - 정산 준비

4단계: 마감 (Closed)
  - 정산 배치 완료 후
  - Status: CLOSED
  - 조회만 가능

5단계: 폐기 (Archived)
  - KO14로 오더 폐기
  - 메모리 정리
  - 감사 기록 유지
```

---

## 정산(Settlement) 프로세스

### 월말 정산 절차

**1. 오더 TECO 처리 (T-code: KO12)**

```
T-code: KO12 실행

Order Number: 0000001000
Current Status: RELEASED
New Status: TECO (완료 처리)

결과:
  - 오더 더 이상 거래 불가
  - 정산 대기 상태
```

**2. 정산 배치 실행 (T-code: KO8F 또는 배치)**

```
T-code: KO88C (정산 배치)

기간: 202401
오더 유형: 1000 (수리)
정산 프로필: CP-001

실행 결과:
  오더 0000001000의 모든 비용
  → Cost Center 2001로 정산
```

**정산 전기 예시**:

```
오더 0000001000: 직재료비 30,000,000 + 인건비 20,000,000 = 50,000,000

정산 전기:
Debit  520000 (유지보수비) 50,000,000
  또는
Debit  2001 (관리부 원가센터) 50,000,000
Credit 0000001000 (Internal Order) 50,000,000

결과:
  - IO 0000001000: CLOSED (마감)
  - 비용: Cost Center 또는 GL 계정으로 전가
```

### 정산 규칙 예시 (오더유형별)

```
Type 1000 (수리/유지보수):
  Settlement Method: To Cost Center
  Distribution Rule: Proportional (비용 비례)
  Target: 2001 (관리부)
  
  결과: 오더 비용 → 관리부 원가센터 → 판매부로 재배분

Type 1100 (자산 건설, CIP):
  Settlement Method: To Asset
  Distribution Rule: Direct
  Target: 180000 (CIP 계정)
  
  결과: 오더 비용 → 자산 계정 (자산 취득가 포함)
```

---

## 내부오더 보고 (T-code: KOI1)

### 월별 보고 항목

```
T-code: KOI1 또는 KOI3 (리포트)

Order Report:
  기간: 202401
  오더 범위: 1000~1999
  
결과표:
  Order | Description | Actual | Budget | Variance | Status
  ====================================================
  1000 | 설비A 수리 | 50M | 50M | 0 | CLOSED
  1001 | 설비B 점검 | 35M | 40M | -5M | RELEASED
  1002 | 환경 비용 | 25M | 20M | +5M | RELEASED
```

### 오더별 상세 보고 (T-code: KO03)

```
T-code: KO03 실행

Order Number: 0000001000
Period: 202401

상세 내역:
  - 직재료비: 30,000,000
  - 인건비: 15,000,000
  - 간접비: 5,000,000
  - 총액: 50,000,000

정산 상태:
  - Status: CLOSED
  - 정산일: 2024-02-05
  - 정산대상: Cost Center 2001
```

---

## 자산 건설 오더 (CIP — Construction In Progress)

### 용도: 고정자산 내부 구축

```
예: 공장 건설, 설비 개조 등

오더 생성 (KO01):
  Order Number: 0000002000
  Description: 신 공장 건설
  Order Type: 1100 (자산 건설)
  Budget: 100,000,000
  Target: Asset Class 1100

월말 거래 기록:
  Debit 180000 (CIP) 10,000,000 (1월 인건비)
  Credit 200000 (채무)

자산 완공 시:
  AS01 (자산 생성): CIP 180000 → 자산 계정 100000
  
정산:
  IO 2000 모든 비용 → 자산 100000으로 정산
```

---

## ECC vs S/4HANA

| 항목 | ECC | S/4 |
|------|-----|-----|
| **내부오더** | KO01~KO14 (동일) | KO01~KO14 (동일) |
| **결산 프로필** | OKO7 (동일) | OKO7 (동일) |
| **정산 배치** | KO88C (배치) | KO88C/FMCR (통합) |
| **자산 건설** | IO → AS01 (수동) | IO → AS01 (자동 가능) |

---

## 주의사항

1. **TECO 전 검증**
   - KO03로 최종 비용 확인
   - 미정산 거래 완료 확인
   - 예산 초과 여부 점검

2. **정산 방법 명확화**
   - 비용 IO: Cost Center로 정산
   - 자산 IO: Asset으로 정산
   - 혼동 시 원가 발생

3. **오더 번호 관리**
   - 외부 오더(PO): 400000~499999
   - 내부 오더(IO): 100000~399999
   - 분명한 범위 분할

4. **월말 정산 순서**
   ```
   1. 모든 거래 입력 완료 (KO02, BAPI)
   2. KO12: TECO 처리
   3. KO88C: 정산 배치
   4. KOI3: 정산 검증
   5. 차이 분석 (초과 비용 원인)
   6. 기간 잠금 (OB52)
   ```

---

## 관련 T-codes

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **OKT2** | 오더유형 정의 | 초기 설정 |
| **OKO7** | 결산 프로필 | 초기 설정 |
| **KO01** | 오더 생성 | 프로젝트 시작 |
| **KO02** | 오더 변경 | 필요시 |
| **KO03** | 오더 상세 | 검증 |
| **KO12** | TECO 처리 | 프로젝트 종료 |
| **KO88** | 정산 규칙 | 초기 설정 |
| **KO88C** | 정산 배치 | 월말 |
| **KOI1** | 오더 요약 보고 | 월말 |
| **KOI3** | 오더 상세 보고 | 월말 |

## 체크리스트

- [ ] OKT2: 오더유형 정의 (최소 3개)
- [ ] OKO7: 결산 프로필 정의
- [ ] KO88: 정산 규칙 설정
- [ ] KO01: 테스트 오더 생성
- [ ] 월말 프로세스: KO12 → KO88C → KOI3 검증 순서 수립
