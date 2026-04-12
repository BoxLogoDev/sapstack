# 인사 관리 (Personnel Administration) IMG 구성 가이드

## SPRO 경로

```
SPRO → Personnel Management → Personnel Administration
```

## 필수 선행 구성

- [ ] 조직 관리 (Organizational Management) 완료 — T-code: PPOCE
- [ ] 급여 영역 (Payroll Area) 정의 — T-code: PA03
- [ ] Country Grouping = 10 (한국) 설정

## 구성 단계

### 1단계: 조직 데이터 (Enterprise Structure)

**T-code: SPRO → Organizational Data**

#### 1-1. 회사코드 (Company Code) 매핑
```
SPRO → Organizational Data → Company Code
- 회사코드: 0001 (본사)
- 지역: Korea, Seoul
- Currency: KRW
```

#### 1-2. 인사 영역 (Personnel Area) 정의
```
T-code: SPRO → Personnel Area
- 인사영역: 01
- 인사영역명: Head Office (서울 본사)
- 급여영역: KR01
- 고용계약서 적용

ECC: 인사영역 = 급여영역 1:1 대응
S/4: Personnel Area와 Payroll Area 유연하게 분리 가능
```

#### 1-3. 인사 부영역 (Personnel Subarea) 정의
```
T-code: SPRO → Personnel Subarea
- 부영역: 01 (정사원)
- 부영역명: Regular Employee
- 공제 카테고리: 1 (일반)

추가 부영역:
- 02: Contract Employee (계약직)
- 03: Temporary (임시직)
- 04: Intern (인턴)
```

#### 1-4. 직원 그룹/하위 그룹 (Employee Group/Subgroup)
```
T-code: SPRO → Employee Group/Subgroup
- 직원 그룹 (PERSG): 1 (활동 직원), 2 (퇴직자)
- 직원 하위 그룹 (PERSK):
  - 10: 정사원 (Regular)
  - 11: 기술직 (Specialist)
  - 20: 계약직 (Contract)
  - 30: 퇴직자 (Pensioner)

세금/보험 공제 규칙 연동
```

### 2단계: Infotype 구성

Infotype = 직원 정보의 논리적 그룹 (0001~0999)

#### 필수 Infotype 설정

| Infotype | 명칭 | 용도 | 필수 | 주기 |
|----------|------|------|------|------|
| **0000** | Actions | 입사/이직 | 필수 | 비주기 |
| **0001** | Organizational Assignment | 조직 배정 | 필수 | 유효 |
| **0002** | Personal Data | 개인 정보 | 필수 | 유효 |
| **0006** | Address | 주소 | 필수 | 유효 |
| **0008** | Basic Pay | 기본급 | 필수 | 월간 |
| **0014** | Recurring Deductions | 공제 | 조건부 | 월간 |
| **0015** | Additional Payments | 추가 지급 | 조건부 | 월간 |
| **0021** | Bank Details | 은행계좌 | 필수 | 유효 |
| **0041** | Date Specifications | 날짜 | 필수 | 유효 |

```
T-code: PA60 (Infotype Display)
- 0000: 입사일, 이직일, 직급 변경 등 주요 사건 기록
- 0001: 직급, 조직단위, 직위 할당
- 0002: 성명, 생년월일, 국적 (수정 불가)
- 0006: 주소 (집, 사무실)
- 0008: 기본급 (월급 = Salary, 시급 = Hourly)
- 0014: 공제액 고정 (보험료 전환 등)
- 0015: 상여금, 야근수당, 식사비 등 변동 수당
```

### 3단계: 사번 범위 (Personnel Number Ranges)

```
T-code: PA04 - Personnel Number Ranges
- 범위: 00000001 ~ 99999999
- 할당: 자동/수동
- ECC: 자동 할당 권장 (중복 방지)
- S/4: UUID 옵션도 지원

한국 설정:
- 현재 사번: 00010001 (2024년)
- 사번 체계: YYYYNNNNN (연도 4자리 + 순번 5자리)
- 공격: 휴직/전직 사번 범위 별도 관리
```

### 4단계: 급여 인포타입 연동

```
T-code: SPRO → Payroll Integration
- Infotype 0008 (급여) → Wage Type로 자동 변환
- Infotype 0014 (공제) → Deduction Rule 매핑
- 월간 급여 실행 전 PA60에서 급여 정보 검증

한국 특화:
- 국민연금: Infotype 0014로 1호 공제 (월 4.5%)
- 건강보험: 장기요양 포함 (월 3.545%)
- 고용보험: (월 0.8%)
- 산재보험: 자동 계산 (업종별 요율)
```

### 5단계: 고용 계약서 (Employment Terms)

```
T-code: SPRO → Employment Terms and Conditions
- 계약 유형: 정사원 (indefinite), 계약직 (fixed-term)
- 시작일, 종료일 (계약직만)
- 근무 시간: 주 40시간 (한국 기준)
- 주휴일: 일요일 (또는 회사 정책)

정사원:
- 퇴직금: Y (근로기준법)
- 4대보험: Y (필수)

계약직:
- 퇴직금: N (계약 조항에 따라)
- 4대보험: 근로형태에 따라 차등
```

### 6단계: 직급 및 급여 등급 (Salary Grades)

```
T-code: PA_SALARY_GRADE 또는 S_PH9_46000206

급여 등급 정의:
- Grade L1: Intern (인턴) — 기본급 2,500,000 KRW
- Grade L2: Junior (신입) — 3,000,000 KRW
- Grade L3: Senior (선임) — 4,500,000 KRW
- Grade L4: Lead (팀장) — 6,000,000 KRW
- Grade L5: Manager (부장) — 8,000,000 KRW

매핑:
- Personnel Subarea (0401) → Grade → Basic Pay
- 승진 시 Grade 변경 (Infotype 0008 수정)

S/4 차이:
- Grade Structure 더 유연 (계층 제거)
- 급여 대역 (Salary Band) 도입
```

## 구성 검증

```
T-code: PA60 (Infotype Display)
- 특정 사원 선택 → Infotype 0001, 0002, 0008 데이터 확인
- 조직 배정, 급여 데이터가 정확하게 입력되었는지 확인

T-code: PA30 (Employee Master Data)
- 신규 직원 등록
- 입사일: 2024-01-01
- 조직: Head Office / Department / Team
- 급여: Grade L2 선택 시 자동 적용

T-code: PA03 (Payroll Control Record)
- 월간 급여 실행 전 PC00_M99_CALC 테스트
- Infotype 0008 변경 사항이 급여에 반영되는지 확인
```

## 주의사항

### 공통 실수

1. **조직 배정 없이 급여 실행**
   - 문제: 급여 계산 후 조직 배정 변경 시 급여 재계산 필요
   - 해결: PA 구성 완료 → OM과 동기화 (RHINTE00) → 급여 실행

2. **Infotype 0001 (조직 배정) 중복 유효 기간**
   - 문제: 2024-01-01 ~ 12-31, 2024-01-01 ~ 03-31 두 기간 설정
   - 해결: 이전 기간을 명시적으로 종료 후 신규 기간 입력

3. **개인 정보 (Infotype 0002) 수정 시도**
   - 문제: 보안상 이름, 생년월일은 수정 불가
   - 해결: 신규 기록 생성 또는 HR 관리자 권한 필요

4. **급여 등급과 Infotype 0008 불일치**
   - 예: Grade L2는 3,000,000이지만 Infotype 0008에 2,500,000 입력
   - 확인: 매달 급여 실행 전 PA60에서 검증

5. **국가별 세금 설정 누락**
   - 문제: Country = 10 (한국)이지만 세금 계산 규칙 미설정
   - 해결: SPRO → Payroll → Tax configuration에서 RT10, RT20 설정

### ECC 특정 주의사항

- 퇴직자 관리: Infotype 0000으로 "Termination" 기록해야 급여 중단
- Payroll Period 잠금: PA03에서 당월 잠금 후 급여 계산 (실수 방지)

### S/4HANA 특정 주의사항

- OM과 PA 통합 강화: RHINTE00 동기화 자동화 권장
- Enterprise Roles: 직원 조직 배정이 Fiori 권한과 연동 (주의 필요)

---

**연관 문서**: [조직 관리](organizational-management.md) | [급여 영역](payroll-area.md) | [근태 관리](time-management.md)
