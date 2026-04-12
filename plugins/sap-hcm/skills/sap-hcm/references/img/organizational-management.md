# 조직 관리 (Organizational Management) IMG 구성 가이드

## SPRO 경로

```
SPRO → Personnel Management → Organizational Management
```

## 필수 선행 구성

- [ ] Enterprise Structure (회사, 부서 정의) — T-code: OX02
- [ ] Cost Centers (비용센터) — T-code: KA04
- [ ] Organizational Units 기본 구조 준비

## 구성 단계

### 1단계: 조직 및 인원 관리 (PPOME - Organization and Staffing)

```
T-code: PPOME 또는 SPRO → Organizational Management → Organization and Staffing
```

#### Object Types 정의

OM은 4가지 객체 유형으로 구성됩니다:

```
O (Organization Unit) — 조직 단위
├─ O_0001 (Company)
│  ├─ O_0002 (Division: Sales)
│  ├─ O_0003 (Division: HR)
│  └─ O_0004 (Division: Finance)

S (Position) — 직위
├─ S_1001 (CEO)
├─ S_1002 (Sales Director)
├─ S_1003 (HR Manager)
└─ S_1004 (Finance Manager)

C (Job) — 직무
├─ C_1001 (Manager)
├─ C_1002 (Senior Specialist)
├─ C_1003 (Specialist)
└─ C_1004 (Junior)

P (Person) — 인원
├─ P_00010001 (Kim, John)
├─ P_00010002 (Lee, Mary)
├─ P_00010003 (Park, David)
└─ P_00010004 (Choi, Sarah)
```

#### 조직 계층 예시

```
Korean Manufacturing Company (한국 제조회사)

O_0001 (Company)
│
├─ O_0010 (Operations Division)
│  ├─ O_0011 (Production Plant)
│  │  ├─ O_00111 (Assembly Line 1)
│  │  │  ├─ S_00111A (Team Lead)
│  │  │  ├─ S_00111B (Operator)
│  │  │  ├─ S_00111C (Operator)
│  │  │  └─ S_00111D (Maintenance)
│  │  └─ O_00112 (Assembly Line 2)
│  │
│  └─ O_0012 (Logistics)
│     ├─ S_00121 (Warehouse Manager)
│     ├─ S_00122 (Foreman)
│     └─ S_00123 (Loader)
│
├─ O_0020 (Sales Division)
│  ├─ O_0021 (Domestic Sales)
│  │  ├─ S_00211 (Sales Director)
│  │  ├─ S_00212 (Sales Manager)
│  │  ├─ S_00213 (Sales Representative)
│  │  └─ S_00214 (Sales Representative)
│  │
│  └─ O_0022 (Export Sales)
│     ├─ S_00221 (Export Manager)
│     └─ S_00222 (Export Representative)
│
└─ O_0030 (HR & Finance)
   ├─ O_0031 (Human Resources)
   │  ├─ S_00311 (HR Manager)
   │  ├─ S_00312 (Recruiter)
   │  └─ S_00313 (Payroll Officer)
   │
   └─ O_0032 (Finance)
      ├─ S_00321 (CFO)
      ├─ S_00322 (Accountant)
      └─ S_00323 (Controller)
```

### 2단계: 인원 할당 (Person Assignment)

```
T-code: PPOME → Person (P 객체) → Maintain Relationships
```

#### 할당 관계 설정

```
Person → Position → Organization Unit
   ↓         ↓            ↓
P_00010001  S_00211      O_0021 (Domestic Sales)
(Kim, John)  (Sales       (Department)
             Director)

Attributes:
- Start Date: 2024-01-01 (배정 시작일)
- End Date: 2025-12-31 (임기 종료일)
- Employment Status: Active
- Job Title: Sales Director
- Cost Center: 2100 (Sales CC)
- Supervisor: S_00211A (상급자, 보고 라인)
```

#### 여러 직위 동시 관리 (Secondary Position)

```
예: HR Manager가 Corporate Council 위원 겸임

Person: P_00010003 (Lee, Mary)

Primary Position:
  ├─ Position: S_00311 (HR Manager)
  ├─ Organization: O_0031 (Human Resources)
  ├─ Start Date: 2024-01-01

Secondary Position:
  ├─ Position: S_COUNCIL_001 (Council Member)
  ├─ Organization: O_0001 (Company Level)
  ├─ Start Date: 2024-06-01
  ├─ Percentage: 5% (주요 업무와 분리)
```

### 3단계: 직급 및 직무 정의 (Job/Grade Hierarchy)

```
T-code: PPOME → Job (C 객체) → Maintain
```

#### 직무 구조

```
C_1001: Executive
  ├─ Compensation: Grade L5 (8,000,000 KRW+)
  ├─ Supervisor: C/O
  └─ Span of Control: 5+ people

C_1002: Manager
  ├─ Compensation: Grade L4 (6,000,000 KRW)
  ├─ Supervisor: Executive
  └─ Span of Control: 3~10 people

C_1003: Senior Specialist
  ├─ Compensation: Grade L3 (4,500,000 KRW)
  ├─ Supervisor: Manager
  └─ Span of Control: Self

C_1004: Specialist
  ├─ Compensation: Grade L2 (3,000,000 KRW)
  ├─ Supervisor: Senior Specialist
  └─ Span of Control: Self

C_1005: Junior
  ├─ Compensation: Grade L1 (2,500,000 KRW)
  ├─ Supervisor: Specialist
  └─ Span of Control: Self
```

#### Job Description 매핑

```
T-code: PPOME → Job Attributes
- Job Code: C_1003
- Job Title: Senior Specialist
- Department: O_0020 (Sales)
- Required Skills: CRM, Project Management
- Salary Grade: L3
- Reporting To: Manager (C_1002)

보상 연동:
  Job C_1003 → Salary Grade L3 (4,500,000)
  → Infotype 0008 (Basic Pay) 자동 연결
```

### 4단계: 보고 라인 (Reporting Structure)

```
T-code: PPOME → Position → Relationships → Supervisor
또는 T-code: PPOCE (Report Structure Display)
```

#### 보고 계층 설정

```
직접 보고 관계 (Direct Report):

CEO (S_1001)
│
├─ Sales Director (S_00211)
│  ├─ Domestic Sales Manager (S_00212)
│  │  ├─ Sales Representative (S_00213)
│  │  └─ Sales Representative (S_00214)
│  │
│  └─ Export Manager (S_00221)
│     └─ Export Representative (S_00222)
│
├─ Operations Director (S_00111)
│  ├─ Production Manager (S_00112)
│  ├─ Logistics Manager (S_00121)
│  └─ Maintenance Manager (S_00131)
│
└─ HR & Finance Director (S_00311)
   ├─ HR Manager (S_00312)
   │  ├─ Recruiter (S_00313)
   │  └─ Payroll Officer (S_00314)
   │
   └─ CFO (S_00321)
      ├─ Accountant (S_00322)
      └─ Controller (S_00323)

T-code: PPOCE → CEO (S_1001) 선택
→ Full Organization Chart 표시 (마우스 드래그 조작)

설정 확인:
  - Span of Control: CEO → 3명 직속 (Sales, Ops, HR&Finance)
  - Reporting Distance: Sales Rep → CEO (2 levels)
  - Chain of Command: Sales Rep → Sales Manager → Sales Director → CEO (4 명)
```

### 5단계: OM과 PA 통합 (Integration: PA → OM Synchronization)

```
T-code: RHINTE00 (Organizational Assignment Synchronization)
```

#### Infotype 0001 (Organizational Assignment) ↔ OM 동기화

```
PA 정보 (직원 기본 정보):
┌──────────────────────┐
│ Infotype 0001        │
│ Person: P_00010001   │
│ Organization: O_0021 │
│ Position: S_00211    │
│ Job: C_1002          │
│ Date: 2024-01-01     │
└──────────────────────┘
         ↕ (RHINTE00)
┌──────────────────────┐
│ OM Relationships     │
│ Position S_00211     │
│ reports to S_00111   │
│ within O_0021        │
│ held by P_00010001   │
└──────────────────────┘

동기화 방향:
- Forward (OM → PA): OM에서 조직 변경 → PA 자동 업데이트
- Backward (PA → OM): PA Infotype 0001 변경 → OM 업데이트 (선택적)

실행:
T-code: RHINTE00
- Import Direction: OM → PA (권장)
- Validity Period: 2024-01-01 ~ 2025-12-31
- Include Planned Positions: Yes (미배정 직위도 포함)
- Execute → Synchronization Log 검토
```

#### 직원 정보 동기화 검증

```
T-code: PA30 (Employee Master)
- 직원 선택 → Infotype 0001 확인
- Organizational Unit: O_0021 (표시)
- Position: S_00211 (표시)
- Job: C_1002 (표시)

T-code: PA60 (Infotype Display)
- 조직 배정 Infotype 0001 데이터 정확성 검증
```

### 6단계: Staff Planning (선택사항)

```
T-code: PPOME → Staff Plan 또는 S_PH9_46000223
```

#### 인원 계획

```
분석 목적:
- 보유 직원(Actual) vs 계획 직원(Planned) 비교
- 충원율(Staffing Level) 분석
- 유휴 직위(Vacant Position) 파악

예시:
Sales Division (O_0020)

Position      Planned  Actual  Vacant  Utilization
────────────────────────────────────────────────────
Director      1        1       0       100%
Manager       2        2       0       100%
Representative 5        3       2       60%
────────────────────────────────────────────────────
Total         8        6       2       75%

유휴 직위: 2명 (신입 모집 필요)
```

## 구성 검증

```
T-code: PPOCE (Report: Organization and Staffing)
- 전체 조직도 시각화
- 각 직위별 보고 라인 확인
- Vacant Position (미배정 직위) 파악

T-code: PA30 (Employee Master) → Infotype 0001
- 모든 활성 직원의 조직 배정 확인
- Supervisor 정보 정확성 검증

T-code: RHINTE00 (Sync Log)
- OM ↔ PA 동기화 결과 확인
- 실패 레코드 (Failed Records) 재처리

T-code: PPENT (Org Plan Analyzer)
- 조직 구조 분석
- Bottleneck 검사 (특정 직위 과부하 여부)
- Reporting Distance 분석
```

## 주의사항

### 공통 실수

1. **OM과 PA의 데이터 불일치**
   - 예: OM에서 "HR Manager" 직위 삭제했는데 PA에서는 여전히 배정
   - 원인: RHINTE00 동기화 실패 또는 수동 불일치
   - 해결: RHINTE00 재실행 또는 PA 수동 수정

2. **순환 보고 관계 (Circular Reporting)**
   - 예: A → B → C → A (순환)
   - 결과: 보고 라인 분석 오류, 승인 워크플로우 중단
   - 확인: PPOCE에서 순환 구조 검사 (SAP 자동 경고)

3. **Position과 Person 할당 기간 불일치**
   - 예: Position S_00211 유효: 2024-01-01 ~ 12-31
   - Person P_00010001 할당: 2024-06-01 ~ 12-31
   - 결과: 1~5월 직위 미배정 상태
   - 확인: PPOME에서 할당 기간 겹침 확인

4. **다중 보고자 (Multiple Reporters) 설정 오류**
   - 예: Secondary Position에서 또 다른 Supervisor 지정
   - 결과: 승인 라인 복잡화
   - 해결: Primary Position의 Supervisor만 사용

### ECC 특정 주의사항

- OM은 독립적 (PA와 완전 분리 가능)
- RHINTE00으로만 동기화 (단방향 권장)
- Infotype 0001 직접 수정 시 OM 반영 안 됨 (역동기 필요)

### S/4HANA 특정 주의사항

- Enterprise Structure: 더 강화된 계층 (Company → BU → Plant → Cost Center)
- OM 통합: PA와 더 긴밀한 연동
- Fiori (Organizational Plan): 웹 기반 드래그-드롭 조직도 편집
- SFSF 경로: OM 마이그레이션 검토 (SuccessFactors)

---

**연관 문서**: [인사 관리](personnel-administration.md) | [급여 영역](payroll-area.md) | [근태 관리](time-management.md)
