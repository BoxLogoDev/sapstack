# 원가센터회계(Cost Center Accounting, CCA) IMG 구성 가이드

## SPRO 경로
```
SPRO → Controlling → Cost Center Accounting
    → Master Data → Cost Centers
```

## 필수 선행 구성

- [ ] OKKP: 관리회계영역 정의 완료
- [ ] OX06: 회사코드 할당 완료
- [ ] OB29: 회계연도 변형 정의

## 원가센터 정의 (T-code: KS01)

**SPRO 경로**: `SPRO → Controlling → Cost Center Accounting → Master Data → Cost Centers → Create`

### 구성 단계 1: 기본 정보 입력

**T-code: KS01 실행**

```
기본 데이터 섹션:
  원가센터 (Cost Center): 1001
  이름 (Name): 생산부 (제1공장)
  설명 (Description): Production Department - Plant 1
  관리회계영역: KOR
  회사코드: 1100
  유형 (Type): S (Standard)
```

**필드 설명**:

| 필드 | 설명 | 값 | 비고 |
|------|------|-----|------|
| Cost Center | 원가센터 코드 | 1001 | 4자리, 고유 |
| Name | 센터명 | 생산부 | 간단명확 |
| Cost Center Type | 유형 | S (Standard) | H(계층구조) 옵션 |
| Controlling Area | 관리회계영역 | KOR | 필수 |
| Company Code | 회사코드 | 1100 | OX06에서 할당된 것 |
| Responsible Person | 담당자 | 부장 김과장 | HR 링크 (선택) |
| Plant | 공장 | 1001 | MM 연계 (선택) |
| Cost Center Category | 분류 | 1 (생산) | 보고용 |

### 구성 단계 2: 계층 정보

**계층 설정** (Type = H인 경우):

```
상위 센터 (Parent):
  - PROD (생산)
    
하위 센터 (Children):
  - 1001 (1차 공정)
  - 1002 (2차 공정)
  - 1003 (3차 공정)
```

**설정**:
```
T-code: KS01
원가센터: 1001
Type: H (Hierarchy)
Children tab:
  - 1010 (A라인)
  - 1011 (B라인)
  - 1012 (C라인)
```

---

## 원가요소 정의 (T-code: KA06 — ECC / FS00 — S/4)

### ECC: KA06 (원가요소 마스터)

**SPRO 경로**: `SPRO → Controlling → Cost Planning → Cost Elements → Create Cost Elements`

```
T-code: KA06 실행

Primary Costs (1차 원가):
  원가요소: 501000
  설명: 직재료비
  유형 (Element Category): 11 (1차 원가)
  GL 계정: 501000
  평가클래스: 3100
```

**원가요소 유형 (Element Category)**:

| 유형 | 코드 | 설명 | 예시 | GL 계정 |
|------|------|------|------|--------|
| Primary Cost | 11 | 1차 원가 | 자재비, 임금 | 501000~509999 |
| Secondary Cost | 21 | 2차 원가 | 배분비, 할당비 | 621000~649999 |
| Fixed Cost | 31 | 고정비 | 감가상각 | 521000~529999 |
| Variable Cost | 41 | 변동비 | 용역비 | 511000~519999 |

### S/4HANA: FS00 (GL 계정 — 원가요소 통합)

```
T-code: FS00 실행

GL Account: 501000
Account description: 직재료비
Type: Expense (비용)
Cost Element: 510000 (자동 생성)
Cost Element Category: Variable
```

---

## 원가센터 × 원가요소 배정

### Assessment 주기 (T-code: KSU1)

**SPRO 경로**: `SPRO → Controlling → Cost Center Accounting → Allocations → Periodic Repostings → Define Assessment Cycles`

**목적**: 1차 원가 → 원가센터 배분

**구성 단계**:

```
Assessment 주기 정의:
  주기명 (Cycle Name): ASSESS-001
  설명: 간접비 배분
```

**배분 규칙**:

```
From Cost Element: 502000 (구매 간접비)
To Cost Center:
  - 1001 (생산부): 50%
  - 2001 (관리부): 30%
  - 3001 (판매부): 20%

배분 기준:
  - 기준 1차 원가요소: 501000 (직재료비)
  - 상대 계산: 502000 / 501000 = 배분율
```

**구성 필드**:

| 필드 | 설명 | 값 |
|------|------|-----|
| Cycle Name | 주기명 | ASSESS-001 |
| Controlling Area | 관리회계영역 | KOR |
| From | 출발 원가요소 | 502000 |
| To | 도착 원가센터 | 1001, 2001 등 |
| Allocation Base | 배분 기준 | 501000 |
| Percentage | 배분 비율 | 50%, 30% 등 |

**실행** (월말):

```
T-code: KSU2 또는 배치 실행
Period: 202401 (2024년 1월)
Controlling Area: KOR
```

### Distribution 주기 (T-code: KSV1)

**SPRO 경로**: `SPRO → Controlling → Cost Center Accounting → Allocations → Periodic Repostings → Define Distribution Cycles`

**목적**: 원가센터 → 원가센터 또는 제품 배분

**구성 단계**:

```
Distribution 주기 정의:
  주기명 (Cycle Name): DIST-001
  설명: 간접비 할당
```

**배분 규칙** (원가센터 간):

```
From Cost Center: 2001 (관리부)
To Cost Center:
  - 1001 (생산부): 60%
  - 1002 (물류부): 40%

배분 기준:
  - Allocation Base: HEADCOUNT (인원수)
  또는 통계 지표 (Statistical Key Figure)
```

**구성 필드**:

| 필드 | 설명 | 값 |
|------|------|-----|
| Cycle Name | 주기명 | DIST-001 |
| From Cost Center | 출발 센터 | 2001 (관리부) |
| To Cost Center | 도착 센터 | 1001, 1002 |
| Allocation Base | 배분 기준 | HEADCOUNT, AREA 등 |
| Percentage | 배분 비율 | 60%, 40% |

---

## 통계 지표 (Statistical Key Figures, T-code: KK01)

**SPRO 경로**: `SPRO → Controlling → Cost Center Accounting → Master Data → Define Statistical Key Figures`

**목적**: 배분 기준으로 사용할 수량/면적 등 정의

**자주 사용되는 지표**:

| 지표명 | 코드 | 단위 | 용도 |
|--------|------|------|------|
| HEADCOUNT | 100 | 명 | 인원수 기반 배분 |
| AREA | 200 | m² | 면적 기반 배분 |
| EQUIPMENT | 300 | 대 | 장비수 기반 배분 |
| HOURS | 400 | 시간 | 운영시간 기반 배분 |
| TRANSACTIONS | 500 | 건 | 거래건수 기반 배분 |

**구성** (T-code: KK01):

```
지표 코드: 100
설명: 인원수 (HEADCOUNT)
단위: 명
유형: 정량적

등록:
  2024년 1월:
    - 1001 (생산부): 50명
    - 2001 (관리부): 30명
    - 3001 (판매부): 20명
```

**월별 입력** (T-code: KK02):

```
T-code: KK02 (통계 지표 입력)
기간: 202401
Cost Center: 1001
Key Figure: 100 (HEADCOUNT)
Value: 50
```

---

## 원가센터 보고 (T-code: KS03)

**SPRO 경로**: `SPRO → Controlling → Cost Center Accounting → Information System → Reports`

### 월별 보고 항목

**1. 실제 vs 예산 (Variance Analysis)**

```
T-code: KS03
Cost Center: 1001 (생산부)
Period: 202401
View: Actual vs Budget

결과:
  예산: 100,000,000 원
  실제: 105,000,000 원
  차이: 5,000,000 원 (5% 초과)
  

분석:
  ├─ 직재료비: +3,000,000 (가격 상승)
  ├─ 인건비: +1,500,000 (초과근무)
  └─ 기타비용: +500,000 (예측 불가)
```

**2. 실제 vs 예정 (Actual vs Standard)**

```
T-code: KS03
View: Actual vs Standard Cost

목적:
  - 원가 효율성 측정
  - 낭비/비효율 식별
  - 개선 지점 도출
```

**3. 비교 보고**

```
기간별 비교:
  - 전월 대비: 목표 -5% → 결과 +2%
  - 전년도 동월 대비: 목표 평탄 → 결과 -3% (개선)
  
예산 수정:
  - 초기 예산: 100,000,000
  - 수정 예산: 105,000,000 (5% 인상)
  - 현재 실제: 105,500,000 (초과)
```

---

## 월별 CCA 운영 절차

### 월초 (1주)
```
1. 예산 공고
   - KS03 리포트 배포
   - 센터장 검토 및 피드백

2. 배분 주기 확인
   - KSU1, KSV1 실행 일정 공지
   - 통계 지표 업데이트 확인
```

### 월중 (2~3주)
```
1. 거래 자동 기록
   - FI → CO 자동 연계
   - 원가센터별 누적 추적

2. 중간 검증
   - KS03 조회 (조기 경보)
   - 이상 거래 확인
```

### 월말 (4주)
```
1. 배분 실행
   - T-code: KSU2 (Assessment 배치 실행)
   - T-code: KSV2 (Distribution 배치 실행)
   
2. 원가 집계
   - 모든 센터 원가 최종 확정
   
3. 성과 분석
   - KS03 최종 리포트
   - 차이 분석 (Variance Analysis)
   - 센터별 KPI 평가
   
4. 보고
   - 경영진 리포트 생성
   - 개선 사항 도출
```

---

## ECC vs S/4HANA 차이점

| 항목 | ECC | S/4 |
|------|-----|-----|
| **원가센터** | KS01 (독립) | KS01 (동일) |
| **원가요소** | KA06 (별도) | FS00 (GL 통합) |
| **Assessment** | KSU1/KSU2 | KSU1/KSU2 (동일) |
| **Distribution** | KSV1/KSV2 | KSV1/KSV2 (동일) |
| **실시간 보고** | 배치 후 조회 | ACDOCA 실시간 |
| **통계 지표** | KK01/KK02 | KK01/KK02 (동일) |

---

## 주의사항

1. **Assessment 전 Distribution 실행 금지**
   - 순서: Assessment → Distribution (반드시 이 순서)
   - 역순 실행 시 이중 계산 위험

2. **배분 기준 일관성**
   - KSU1의 배분 기준 = 실제 GL 거래 일치 필수
   - 불일치 시 원가 누락 또는 과다 계산

3. **통계 지표 업데이트**
   - 월별 KK02로 최신 지표 입력
   - 연초 입력 후 실패 사례 다수 (월별 변동 반영 필수)

4. **원가센터 코드 관리**
   - 자릿수 통일: 4자리 표준 (0001~9999)
   - 의미 있는 범위 할당:
     - 1000~1999: 생산 (1100~1199: 1차공정, 1200~1299: 2차공정)
     - 2000~2999: 관리
     - 3000~3999: 판매

5. **월말 마감 순서**
   ```
   1. 모든 거래 FI 전기 완료
   2. KSU2 (Assessment) 실행
   3. KSV2 (Distribution) 실행
   4. KS03 리포트 생성
   5. 차이 분석 및 조사
   6. 부서장 승인
   7. 기간 잠금 (OB52)
   ```

---

## 관련 T-codes 정리

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **KS01** | 원가센터 생성/변경 | 초기 설정, 조직개편 시 |
| **KS02** | 원가센터 변경 | 필요시 |
| **KS03** | 원가센터 보고 | 월말 분석 |
| **KA06** | 원가요소 정의 (ECC) | 초기 설정 |
| **FS00** | GL 계정 (S/4) | 초기 설정 |
| **KK01** | 통계 지표 정의 | 초기 설정 |
| **KK02** | 통계 지표 입력 | 월초 또는 월말 |
| **KSU1** | Assessment 주기 정의 | 초기 설정 |
| **KSU2** | Assessment 주기 실행 | 월말 배치 |
| **KSV1** | Distribution 주기 정의 | 초기 설정 |
| **KSV2** | Distribution 주기 실행 | 월말 배치 |

## 체크리스트

- [ ] KS01: 주요 원가센터 생성 (생산, 관리, 판매)
- [ ] KA06/FS00: 원가요소 정의
- [ ] KK01: 통계 지표 정의 (HEADCOUNT, AREA 등)
- [ ] KSU1: Assessment 주기 설정
- [ ] KSV1: Distribution 주기 설정
- [ ] KK02: 월별 통계 지표 입력 자동화
- [ ] KS03: 월말 보고 프로세스 수립
- [ ] 테스트: 샘플 거래 생성 후 Assessment/Distribution 검증
