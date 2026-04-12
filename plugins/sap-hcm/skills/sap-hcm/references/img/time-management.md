# 근태 관리 (Time Management) IMG 구성 가이드

## SPRO 경로

```
SPRO → Personnel Management → Time Management
```

## 필수 선행 구성

- [ ] 인사 영역 (Personnel Area) 정의 — T-code: SPRO
- [ ] 직원 기본정보 (Infotype 0000~0002) 입력 — T-code: PA30
- [ ] 근무 일정 (Work Schedule Rule) 준비

## 구성 단계

### 1단계: 근무 일정 규칙 (Work Schedule Rules)

```
T-code: SPRO → Time Management → Work Schedules
```

#### 기본 근무 일정 설정 (Daily Work Schedule)

```
표준 5일제 (Monday ~ Friday)
- Rule Code: D001
- Rule Name: Standard 40-Hour Week (Korea)
- 근무 시간: 월~금 08:00 ~ 18:00 (점심 1시간)
  * 실제 근무: 9시간
  * 근로기준법: 주 40시간 (08:00~17:00, 점심 1시간)

설정:
- Work Days: MO, TU, WE, TH, FR
- Holiday: SA, SU (토일 휴무)
- Work Start Time: 08:00
- Work End Time: 17:00
- Break Time: 12:00 ~ 13:00 (1시간)
- Actual Work Time: 8시간

ECC vs S/4:
- ECC: 근무 일정을 T-code PTIM에서 수동 관리
- S/4: Fiori (Employee Time) 앱 통합
```

#### 3교대 근무 일정 (3-Shift)

```
일부 제조업, 콜센터 등 적용

근무 형태:
1. Day Shift (주간조)
   - 07:00 ~ 16:00 (break 1시간)
   - Actual: 8시간

2. Evening Shift (저녁조)
   - 16:00 ~ 01:00 (break 1시간, 자정 경과)
   - Actual: 8시간
   - 야근 수당 적용

3. Night Shift (야간조)
   - 01:00 ~ 10:00 (break 1시간)
   - Actual: 8시간
   - 야근 수당 + 심야 수당 적용

설정:
- Daily Work Schedule ID: S001, S002, S003
- Period Work Schedule: PS_3SHIFT (7일 주기)
  * Day 1~2: S001
  * Day 3~4: S002
  * Day 5~7: S003

시간당 임금 추가:
- Evening: +25% (통상임금의 125%)
- Night: +50% (통상임금의 150%)
- Wage Type 계산: 기본급 ÷ 160시간 × 실제근로시간
```

#### 기간별 근무 일정 (Period Work Schedule)

```
T-code: PTIM00 또는 PTIM40

정의:
- Period Schedule ID: PS_KOREA_2024
- Year: 2024
- Start Date: 2024-01-01
- End Date: 2024-12-31
- Reference Day Rule: D001 (Standard 40-Hour)

일별 할당:
- 01-Jan: Holiday (신정)
- 02-Jan ~ 08-Jan: Standard (근무)
- 09-Feb ~ 12-Feb: Lunar New Year (설날, 연휴)
- 15-Mar: Chuseok (추석, 당일 휴무)
- 01-May: Labor Day (근로자의 날)
- etc.

한국 공휴일 (2024 기준):
- 신정: 01-01
- 설날: 02-09 ~ 02-12 (전후 2일 포함)
- 삼일절: 03-01
- 어린이날: 04-05
- 부처님오신날: 05-15
- 현충일: 06-06
- 광복절: 08-15
- 추석: 09-16 ~ 09-18 (전후 2일 포함)
- 개천절: 10-03
- 한글날: 10-09
```

### 2단계: 휴가 및 결근 유형 (Absence Types)

```
T-code: SPRO → Time Management → Absence Types
```

#### 휴가 유형 정의

| Absence Code | 명칭 | 근로기준법 | 급여 | 비고 |
|--------------|------|----------|------|------|
| **0100** | Annual Leave (연차) | 유급 | 100% | 최소 15일/년 |
| **0110** | Half-Day Leave (반차) | 유급 | 100% | 오전/오후 선택 |
| **0120** | Sick Leave (병가) | 유급 | 100% | 최대 60일/년 (의료법) |
| **0130** | Emergency Leave (긴급휴가) | 유급 | 100% | 화재, 재해 등 |
| **0200** | Vacation Days (휴가 연장) | 자유 | 0% | 회사 정책 |
| **0300** | Family Event (경조사) | 유급 | 100% | 결혼 3일, 장례 3일 |
| **0400** | Maternity (산휴) | 유급 | 100% | 출산 전 45일, 후 45일 |
| **0410** | Paternity (육아휴직) | 무급 | 0% | 최대 1년 (고용보험 지원) |
| **0500** | Unpaid Leave (무급휴가) | 무급 | 0% | 회사 허가 필요 |
| **0600** | Training (교육) | 유급 | 100% | 회사 공식 교육 |
| **0700** | Absent (결근) | 무급 | 0% | 정당한 사유 없음 |

#### Absence Type 설정 예시

```
T-code: SPRO → Absence Type 0100 (Annual Leave)
- Absence Code: 0100
- Description: Annual Leave
- Paid/Unpaid: Paid
- Wage Calculation: 100% of Regular Salary
- Time Quota Deduction: Yes (연차 차감)
- Absence Reason: OO (Ordered Leave)
- Period Control: Requires Approval

- 근로기준법 연차 규칙:
  * 근무 1년 이상: 연 15일 이상
  * 미사용 연차 이월: 최대 2년차까지 가능
  * 미사용 연차 보상: 이직 시 미사용일당 지급

- SAP 설정:
  * Wage Type: 2000 (100% Gross)
  * Time Quota Type: ANNUAL (연차 풀)
  * Carry Forward: Yes (전년도 미사용 이월)
```

### 3단계: 근무 시간 할당 (Time Quota)

```
T-code: SPRO → Time Management → Time Quota
```

#### 연차 발생 규칙 (Annual Leave Accrual)

```
근로기준법 기준:
- Year 1: 15일 (입사 후 1년 경과)
- Year 2: 15일 (유효)
- Year 3+: 15일 + 2일 (장기근속 1년마다 +1일)

SAP Time Quota Type:
- Code: ANNUAL
- Time Unit: Day (일)
- Valuation: 1 Day = 8 Hours
- Accrual Method: Annual
- Accrual Value: 15 (년 15일)

이월 설정:
- Carry Forward: Yes
- Max Carryover: 30일 (1년 미사용 + 당년 미사용, 총 30일 제한)
- Expiration: 3년차 01-31 (2년 이상 미사용 자동 소멸)

예시:
2024-01-31: 15일 발생
  ├─ 사용: 5일
  ├─ 남은 할당량: 10일
  
2025-01-31: +15일 발생
  ├─ 누적: 10 + 15 = 25일
  ├─ 사용: 8일
  ├─ 남은 할당량: 17일 (이월 10일 + 당년 발생 분 일부 사용)

2026-01-31: +15일 발생
  ├─ 누적: 17 + 15 = 32일 → Cap at 30일
  ├─ 초과분 1일: Expiration 처리 (자동 소멸)
```

#### 휴가 풀 관리

```
T-code: PTIM51 - Time Quota Balance (시간 할당 잔액)
- 직원 선택 → Quota Type (ANNUAL) → 잔액 조회
- 표시:
  * Accrued: 발생량 (연 15일)
  * Used: 사용량 (연차 신청)
  * Available: 사용 가능량 (잔액)
  * Carryover: 이월액
```

### 4단계: 근태 모니터링 (Attendance Monitoring)

```
T-code: PTIM 또는 PA60 (Time Data)
```

#### 근로시간 추적

```
- Arrival Time: 실제 출근 시간 (RFID, 지문 인식 등)
- Departure Time: 실제 퇴근 시간
- Actual Hours: 실제 근무 시간
- Expected Hours: 예정 근무 시간 (근무 일정)
- Variance: 차이 (양수 = 초과근무, 음수 = 부족)

초과근무 추적:
- 월간 초과근무 > 10시간 → 경고
- 주간 초과근무 > 12시간 → 승인 필요

52시간 제한 모니터링 (근로기준법 개정):
- 주 근무시간: 40시간 (통상) + 12시간 (초과근무) = 52시간 상한
- 월별 집계: 52시간 × 4.33주 (월평균) ≈ 225시간
- 초과 시 경고 및 관리자 승인

T-code: PA93 (Payroll Register) → Attendance Analysis
  또는 Custom Report: ZHRM_OVERTIME_SUMMARY
```

### 5단계: CATS (Cross-Application Time Sheet)

```
T-code: CAT2 - Integrated Time Recording
```

#### CATS 용도

```
- 프로젝트/비용 센터별 시간 기록
- 간접비 배분 (예: HR 부서 직원의 프로젝트별 근무시간)
- 다중 비용센터 근무 직원의 시간 할당

예시:
2024-01-15:
  ├─ Project A: 4시간 (CC: 2000, Project: 1001)
  ├─ Project B: 2시간 (CC: 2000, Project: 1002)
  ├─ HR Administration: 2시간 (CC: 3000)
  └─ Total: 8시간

FI 전기:
  ├─ CC 2000 (Sales): 6시간 비용
  └─ CC 3000 (HR): 2시간 비용
```

#### CATS 구성

```
T-code: SPRO → Time Management → CATS Configuration
- CATS Enabled: Yes
- Time Unit: Hour (시간)
- Period: Daily (일일)
- Approval Required: Yes
- Integration with Cost Accounting (CO-OM): Yes
```

## 구성 검증

```
T-code: PA60 (Infotype Display)
- 직원 선택 → Infotype 2001 (Time Data)
- 출퇴근 시간, 근무시간 정확성 확인

T-code: PTIM51 (Time Quota Balance)
- 전체 직원의 연차 잔액 조회
- 분기별 검증 (미사용 연차 > 20일이면 경고)

T-code: PA93 (Payroll Register)
- 월간 초과근무 시간 집계
- 직원별 평균 초과근무 비율 분석

T-code: CAT2 (Time Sheet)
- 프로젝트별 시간 입력 현황
- 비용센터별 총 시간 합계 (240시간 = 30일 × 8시간 기준)
```

## 주의사항

### 공통 실수

1. **Period Work Schedule과 Daily Work Schedule 불일치**
   - 예: Period에서 금요일 공휴일로 설정했으나 Daily에서 근무일로 설정
   - 결과: 급여 계산 시 혼동
   - 해결: PTIM40 (Period Editor)에서 Daily 참조일 사용

2. **연차 발생 규칙 미적용**
   - 예: 신입 직원에게 첫해 15일 자동 발생 안 함
   - 해결: Time Quota Accrual Rule에서 입사일 연동 설정

3. **초과근무와 야근수당 이중 계산**
   - 예: 초과근무 시간 × 야근률 적용했다가 Wage Type에서 또 적용
   - 결과: 수당 과다 지급
   - 확인: Wage Type 1200 (Overtime)에서 중복 제거

4. **52시간 제한 모니터링 누락**
   - 문제: 주간 52시간 초과 직원 파악 못 함
   - 해결: Custom Report 개발 (ZHRM_WEEKLY_LIMIT_CHECK)

### ECC 특정 주의사항

- PTIM → PA 동기화: 시간 데이터는 PA Infotype 2001로 저장 (수동 확인)
- 근태 기록 수정 후 급여 재계산 필요

### S/4HANA 특정 주의사항

- Employee Time (Fiori) 앱: 직원 자가 입력 가능 (모바일)
- Real-Time Approval: 워크플로우 자동화 (근태 승인 즉시화)
- Analytics Integration: SAP Analytics Cloud와 연동 (초과근무 트렌드 분석)

---

**연관 문서**: [인사 관리](personnel-administration.md) | [급여 영역](payroll-area.md) | [조직 관리](organizational-management.md)
