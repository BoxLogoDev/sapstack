# HCM IMG 개요

## HCM 모듈 구조

SAP HCM (Human Capital Management)은 인사, 급여, 조직, 근태 관리를 통합하는 모듈입니다.

### IMG 트리 구조

```
SPRO (IMG)
└── Personnel Management
    ├── Personnel Administration (인사 관리)
    │   ├── Organizational Data (조직 데이터)
    │   ├── Employee Master Data (직원 기본 데이터)
    │   ├── Infotypes (인포타입)
    │   └── Personnel Number Ranges (사번 범위)
    │
    ├── Organizational Management (조직 관리)
    │   ├── Organization and Staffing (PPOME)
    │   ├── Reporting Structure (보고 라인)
    │   ├── Integration with Personnel Administration
    │   └── Staff Plan
    │
    ├── Payroll (급여)
    │   ├── Payroll Area (급여 영역)
    │   ├── Payroll Control Record (급여 제어)
    │   ├── Wage Type Configuration (임금 유형)
    │   ├── Tax and Social Security (세금/4대보험)
    │   ├── Processing (급여 계산)
    │   └── Posting to Finance (재무 전기)
    │
    └── Time Management (근태 관리)
        ├── Work Schedules (근무 일정)
        ├── Absence Management (휴가/결근)
        ├── Time Quota (시간 할당)
        ├── Monitoring (모니터링)
        └── CATS (Cross-Application Time Sheet)
```

## 4개 서브모듈 간 관계도

```
┌─────────────────────────────────────────────────────┐
│          ORGANIZATIONAL MANAGEMENT (OM)             │
│  조직/직위/직무 정의 → 보고 라인 설정              │
│  (PPOME, T-code: PPOCE)                           │
└──────────────────┬──────────────────────────────────┘
                   │ Integration: RHINTE00
                   ▼
┌─────────────────────────────────────────────────────┐
│       PERSONNEL ADMINISTRATION (PA)                 │
│  조직배정(0001) → 개인정보(0002) → 급여등급(0008) │
│  (T-code: PA20, PA30, PA40)                        │
└──────────────────┬──────────────────────────────────┘
                   │ Employee Infotypes (0001~0999)
                   ▼
┌─────────────────────────────────────────────────────┐
│            PAYROLL (PY) ← Wage Types               │
│  급여 계산 → 세금/보험 공제 → 재무 전기            │
│  (T-code: PYXX, PC00_M99_CALC)                     │
└──────────────────┬──────────────────────────────────┘
                   │ HR Integration
                   ▼
┌─────────────────────────────────────────────────────┐
│         TIME MANAGEMENT (TM)                        │
│  근무 일정 → 휴가 신청 → 근태 집계                 │
│  (T-code: PTIM, CAT2, PA60)                        │
└─────────────────────────────────────────────────────┘
```

## 핵심 IMG 경로

| 영역 | SPRO 경로 | 주요 T-code |
|------|----------|-----------|
| **PA** | Personnel Management → Personnel Administration | PA20, PA30, PA40, PA04 |
| **OM** | Personnel Management → Organizational Management | PPOCE, PPOME, PPOF |
| **PY** | Personnel Management → Payroll | PYXX, PA03, PC00_M99 |
| **TM** | Personnel Management → Time Management | PTIM, PA60, CAT2 |

## 구성 우선순위

1. **OM (조직 관리)** ← 가장 먼저 정의 (조직/직위/직무 골격)
2. **PA (인사 관리)** ← 조직 기반으로 직원 배정
3. **TM (근태 관리)** ← 근무 일정 및 휴가 규칙 설정
4. **PY (급여)** ← 마지막에 통합 (PA + TM 데이터 기반)

## 한국 특화 설정

- **Country Grouping**: 10 (Republic of Korea)
- **급여 계산 버전**: PC00_M99_CALC (M=Merged, 99=한국)
- **4대보험**: 국민연금(GV01), 건강보험(GV02), 고용보험(GV03), 산재보험(GV04)
- **세금**: 소득세(RT10), 지방소득세(RT20)
- **근로기준법**: 52시간 근무 제한, 최소 휴식일 (주 1회 보장)

## ECC vs S/4HANA 차이

| 항목 | ECC 9.0 | S/4HANA 2023 |
|------|---------|------------|
| **OM** | PPOME (독립) | PPOME + 엔터프라이즈 구조 강화 |
| **급여** | PC00_M99 | PAY (신엔진) + 기존 호환성 |
| **근태** | CAT2 | CAT2 (유지) |
| **Analytics** | HR Analytics (별도) | SAP Analytics Cloud 통합 |
| **장기 로드맵** | SFSF로 마이그레이션 필요 | SFSF와 투트랙 지원 |

---

**다음 단계**: [Personnel Administration](personnel-administration.md) 가이드를 참조하세요.
