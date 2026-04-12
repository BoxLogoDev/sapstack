# 급여 영역 (Payroll Area) IMG 구성 가이드

## SPRO 경로

```
SPRO → Personnel Management → Payroll → Basic Settings → Payroll Area
```

## 필수 선행 구성

- [ ] 인사 영역 (Personnel Area) 정의 — T-code: SPRO
- [ ] 회사 코드 (Company Code) 설정 — T-code: OX02
- [ ] 급여 정산 규칙 (Payroll Area) 기본 구성 — T-code: PA03

## 구성 단계

### 1단계: 급여 영역 정의 (Payroll Area Definition)

```
T-code: SPRO → Payroll Area
- 급여 영역 코드: KR01 (한국 본사)
- 급여 영역명: Payroll Korea HQ
- 회사 코드: 0001
- 통화: KRW (Korean Won)
- 급여 국가: 10 (Republic of Korea)
- 급여 국가/지역: 10_1000
```

#### Payroll Area 속성

```
- Payroll Period: MO (월간) — 한국 표준
  * MO: Monthly (매월 1~마지막날)
  * W1-W4: Weekly (주간 급여는 한국에서 드뭈)
  * H1-H2: Bi-weekly (반월급제, 일부 기업)

- Lock Period: 급여 정산 후 수정 방지 기간
  * Lock From: 1st of month
  * Lock Until: 5th of month (급여 실행 후)

- Payroll Variant: Linked to Country Grouping 10
  * Version: 99 (한국)
  * Payroll Schema: PC00_M99_CALC
  * Payroll Class: RP
```

### 2단계: 급여 제어 레코드 (Payroll Control Record)

```
T-code: PA03 - Payroll Control Record
```

#### 급여 실행 파라미터

```
일반
- Payroll Area: KR01
- Payroll Period: 202401 (YYYYMM)
- Number of Payroll Runs: 1 (정산 1회)
- Test Run: 'X' (사전 테스트)

이전 기간 데이터
- Carry Forward: 'X' (전월 데이터 승계)
- Lock Status: Locked (수정 방지)

ECC 방식:
- Payroll Drive: No (수동 실행)
- Release Status: Initial → Test → Production

S/4HANA 방식:
- Auto-Release: Yes (자동 릴리즈)
- Background Job: RPAYIDR00 (백그라운드)
```

#### 급여 실행 프로세스

```
단계 1: Test Run
- T-code: PC00_M99_CALC (또는 PAYROLL_CTRL)
- Selection: Payroll Area KR01, Period 202401
- Run Type: Test
- 결과: 급여 조회 (PA100), 공제액 검증

단계 2: Production Run
- 테스트 결과 검증 후 Actual Run 실행
- Lock: PA03에서 해당 기간 Lock
- Payroll Result 저장

단계 3: Post-Processing
- Payroll Journal (PA91): 급여 명세서 생성
- Payroll Register (PA93): 급여대장
- Data Transfer to Finance (PA97): GL에 전기
```

### 3단계: 임금 유형 (Wage Type) 구성

```
T-code: SPRO → Wage Type Configuration
```

#### 기본 임금 유형 설정 (한국)

| Wage Type | 명칭 | 계산 기준 | 과세 | 비고 |
|-----------|------|----------|------|------|
| **1000** | Basic Salary | Infotype 0008 | O | 기본급 |
| **1100** | Bonus | Infotype 0015 | O | 상여금 (연 2~4회) |
| **1200** | Overtime | Infotype 0015 | O | 야근수당, 휴일근로 |
| **1300** | Allowance | Infotype 0015 | O | 주택, 식사, 교통비 |
| **2000** | Gross Salary | Sum (1000~1300) | — | 합계 (자동) |
| **5000** | Income Tax | -% of 2000 | X | 소득세 (공제) |
| **5100** | Local Tax | -% of 2000 | X | 지방소득세 (공제) |
| **5200** | National Pension | -%4.5 of 2000 | X | 국민연금 |
| **5210** | Health Insurance | -%3.545 of 2000 | X | 건강보험+장기요양 |
| **5220** | Employment Insurance | -%0.8 of 2000 | X | 고용보험 |
| **5230** | Industrial Accident | -%0.5 of 2000 | X | 산재보험 (평균) |
| **6000** | Net Salary | 2000 - (5000~5230) | — | 실수령액 (자동) |

#### Wage Type 설정 예시

```
Wage Type 1000 (Basic Salary)
- Calculation Rule: Infotype 0008 (Amount)
- Valuation: Monthly
- Tax Status: Gross Wage (과세)
- Frequency: Monthly
- Infotype 0001: 조직 배정 시간비 적용

Wage Type 5200 (National Pension)
- Calculation Rule: % of 2000 (Gross)
- Rate: 4.5%
- Tax Status: Deduction (공제)
- Ceiling: 550만원 (월간 최대 기여액)
- Account Assignment: Cost Center (조직별 집계)
```

### 4단계: 세금 및 사회보험 (Tax & Social Security)

```
T-code: SPRO → Payroll → Tax & Social Security Configuration
```

#### 한국 세금 계산 규칙

```
소득세 (Income Tax, WT 5000)
- 간이세액공제 적용: 월급 × 2.3% ~ 6.0% (소득 구간별)
- 누진공제: Annual Calculation (연간 세액 조정)
- Status: Single/Married (부양가족 공제)
- Deduction: 근로소득공제 65% (기본)

지방소득세 (Local Tax, WT 5100)
- Rate: 소득세의 10%
- 소득세 = 3,500,000이면 지방소득세 = 350,000
```

#### 4대보험 계산 규칙

```
국민연금 (National Pension, WT 5200)
- Rate: 4.5% (근로자 부담)
- Salary Ceiling: 550만원 (초과분 미포함)
- Calculation: Gross 1st ~ 5,500,000 × 4.5%

건강보험 + 장기요양 (Health Insurance, WT 5210)
- Rate: 3.545% (2.68% + 0.865%)
- Salary Base: Gross - Bonus (상여금 제외)
- Limit: 상한액 적용 (월 7,920,000)

고용보험 (Employment Insurance, WT 5220)
- Rate: 0.8% (직장 0.8%, 근로자 0.5% — 근로자 부담만)
- Salary Base: Gross
- Max: 월 33,300,000 × 0.8%

산재보험 (Industrial Accident, WT 5230)
- Rate: 0.3% ~ 1.7% (업종별, 회사 부담)
- SAP 설정: 평균 0.5%로 계산
- 실제: HR에서 업종 코드별 요율 조정

계산 순서:
  Gross (2000)
  → minus Bonus (별도 계산)
  → Pension Base (국민연금)
  → Pension Contribution (WT 5200)
  → Health Base (건강보험)
  → Health + LTC (WT 5210)
  → Gross - Deductions (근로소득세 기준)
  → Income Tax (WT 5000)
  → Local Tax (WT 5100)
  → Employment Insurance (WT 5220)
  → Net Salary (WT 6000)
```

### 5단계: 급여 계산 스키마 (Payroll Schema)

```
T-code: SPRO → Payroll Schema Maintenance
Schema: PC00_M99_CALC (Korea, Merged)
```

#### 계산 흐름

```
Step 1: 기본급 및 수당 계산
  ├─ Infotype 0008 (Monthly Basic)
  ├─ Infotype 0015 (Additional Payments)
  └─ Result: Gross Salary (WT 2000)

Step 2: 공제 계산
  ├─ Pension (WT 5200)
  ├─ Health Insurance (WT 5210)
  ├─ Employment Insurance (WT 5220)
  ├─ Industrial Accident (WT 5230)
  └─ Result: Social Deduction (WT 5400)

Step 3: 세금 계산
  ├─ Income Tax (WT 5000)
  ├─ Local Tax (WT 5100)
  └─ Result: Tax Total (WT 5500)

Step 4: 실수령액 계산
  ├─ Net = Gross - Social - Tax
  └─ Result: Net Salary (WT 6000)

조건:
  - Bonus (상여금) 제외: Wage Type 1100 별도 계산
  - Overtime (야근) 가산: 추가 세금/보험 미포함 (일부 회사)
```

### 6단계: 재무 전기 (Posting to Finance)

```
T-code: SPRO → Payroll Results → Posting to Finance
또는 T-code: PA97 (Payroll Journal)
```

#### 급여 → GL 전기

```
급여 계산 후 재무(FI) 모듈로 자동 전기

GL Account Mapping:
- WT 2000 (Gross) → GL 6100 (Personnel Cost/급여비)
- WT 5200 (Pension) → GL 2100 (Employee Benefits Payable)
- WT 5210 (Health) → GL 2110 (Health Insurance Payable)
- WT 5000 (Income Tax) → GL 2200 (Tax Payable)
- WT 6000 (Net) → GL 2300 (Salary Payable)

Cost Center Assignment:
  개별 부서별 급여 집계
  - CC: 1000 (Total Company)
  - CC: 2000 (Sales)
  - CC: 3000 (HR)
  - CC: 4000 (Finance)

Transaction Type: 자동 FI Document 생성
  - Document Type: HR (급여 전기용)
  - Posting Date: 마지막 급여 일자
  - Reference: Payroll Period (202401)
```

## 구성 검증

```
T-code: PA100 - Payroll Results Display
- 선택: Employee (직원), Payroll Period (202401)
- 검증 사항:
  1. Gross Salary = Basic (1000) + Allowance (1300)
  2. Total Deduction = Social (5200~5230) + Tax (5000~5100)
  3. Net = Gross - Deduction
  4. Bank Transfer Amount = Net (집계)

T-code: PA91 - Payroll Journal
- 각 직원별 급여 명세서
- Print: 개인 수령용 + 회사 기록용

T-code: PA93 - Payroll Register
- 월간 급여 통계
  * Total Employees: 명
  * Total Gross: KRW
  * Total Tax: KRW
  * Total Pension: KRW

T-code: FI02 - G/L Account Totals
- GL 6100 (급여비) 검증
- 월간 급여 총액과 FI 기록이 일치하는지 확인
```

## 주의사항

### 공통 실수

1. **Bonus와 Regular Salary 혼동**
   - 문제: WT 1000에 보너스 포함하면 월급 과다 계산
   - 해결: WT 1100으로 별도 처리, 연간 집계

2. **4대보험 Ceiling 미적용**
   - 예: 국민연금 상한(550만) 미적용 시 과다 공제
   - 확인: PA03 → Wage Type 5200에서 Max Limit 설정

3. **세금과 보험 납부 지연**
   - 급여 계산 → FI 전기 시간 간격으로 인한 오류
   - 해결: PA03 Posting Rule에서 동시 처리 설정

4. **Infotype 0008 대 0015 기간 불일치**
   - 예: 0008 (기본급) 2024-01-01~12-31, 0015 (수당) 2024-06-01~12-31
   - 결과: 1~5월 기본급만 계산, 수당 0
   - 확인: PA60에서 모든 급여 Infotype 유효 기간 겹침 확인

### ECC 특정 주의사항

- 급여 롤백: PC00_M99_CB00 (Clear Payroll Run)로만 취소
- 월간 반복: PA03 Lock/Unlock → Test → Actual (수동 프로세스)
- 공제 오류 시: Infotype 0014 수정 → 재계산 필요

### S/4HANA 특정 주의사항

- Auto-Release: 자동화로 인한 롤백 제약 (테스트 철저히)
- New Payroll Engine (PAY): 기존 PC00_M99와 병행 지원 (호환성 관리)
- Real-Time Integration: HR → Finance 즉시 동기화 (Financial Close 영향)

---

**연관 문서**: [인사 관리](personnel-administration.md) | [근태 관리](time-management.md) | [재무 연동](../finance-integration.md)
