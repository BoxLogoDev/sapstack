# SAP HCM 한국어 전문 가이드

> `plugins/sap-hcm/skills/sap-hcm/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- HCM 배포: ECC HCM / H4S4 (HCM for S/4HANA) / SuccessFactors 하이브리드
- 한국 Payroll 버전 (SAP HR Korea)
- FI Posting 연동 방식
- Time Management 활성화 여부

## 2. Personnel Administration (PA)

### 트랜잭션
- **PA30**: 인포타입 개별 유지
- **PA40**: 인사 조치 (Action)
- **PA20**: 조회 전용
- **PA10**: 개인 파일

### 주요 인포타입
| Infotype | 설명 |
|----------|------|
| 0000 | Actions |
| 0001 | 조직 배정 |
| 0002 | 개인 데이터 (주민번호 저장 시 마스킹) |
| 0006 | 주소 |
| 0007 | 근무 스케줄 |
| 0008 | 기본 급여 |
| 0009 | 은행 정보 |
| 0014 | 정기 공제 |
| 0015 | 단기 공제 |
| 0016 | Contract Elements |
| 0021 | 가족 |
| 0105 | Communication |

## 3. Organizational Management (OM)

### 트랜잭션
- **PP01/PO13**: 포지션 생성/변경
- **PPOCE**: Org Structure 생성 (Enjoy)
- **PPOME**: Org Structure 변경
- **PA20 → Infotype 1001**: 관계 조회

### Object Types
- O = Organizational Unit
- S = Position
- C = Job
- P = Person
- K = Cost Center

## 4. Time Management

### 트랜잭션
- **PT60**: Time Evaluation 실행
- **CAT2**: Time Sheet Entry
- **PT50**: Quota Overview
- **PT01**: Work Schedule Rule

### 한국 현장
- **근태 시스템** 외부 연동 많음 (지문·스마트 ID)
- **주 52시간** 법적 준수 — 초과근무 관리 엄격
- **연차 자동 부여** 근로기준법 기반 (1년차 11일, 이후 연증 15일+)

## 5. Payroll (한국)

### 핵심 트랜잭션
- **PC00_M46_CALC**: 한국 Payroll 계산
- **PC00_M46_CEDT**: 급여명세서
- **PC00_M46_CDTA**: Payment Data (지급)
- **PC00_M46_TXR**: 원천세 신고
- **PC00_M99_CIPE**: FI Posting

### Schema / PCR
- **PE01**: Payroll Schema (KR4*)
- **PE02**: PCR (Personnel Calculation Rule)
- **PE03**: Features (공용 규칙)

### 한국 Payroll 특징
- **4대보험** (국민연금/건강/고용/산재)
- **근로소득세** (원천세)
  - 간이세액표 — 국세청 연 1회 업데이트
- **연말정산** (1~2월)
- **퇴직연금** (DB/DC/IRP)
- **각종 수당** (명절·복지·가족)

### Wage Type
- 한국 표준 wage type 번호 체계
- Z-wage type 추가 시 **Processing Class**, **Cumulation Class**, **Evaluation Class** 설정 주의

## 6. FI Posting

### 흐름
```
PC00_M46_CALC (급여 계산)
       ↓
PC00_M99_CIPE (FI Posting Run)
       ↓
FI Document 생성 (FB03 조회 가능)
```

### 설정
- **Symbolic Accounts** → G/L 매핑
- **Employee Grouping**
- **OBYS**: FI Posting Characteristics

## 7. ESS / MSS (Self-Service)

- **ESS** (Employee Self-Service): Time Entry, Leave, Paystub
- **MSS** (Manager Self-Service): Approval, Team Calendar
- 플랫폼: Fiori / Portal / SAPGUI
- 한국 현장: Fiori Launchpad 통합 많음

## 8. 한국 특화

### 법적 요구사항
- **개인정보보호법** — 주민번호 마스킹 필수
- **근로기준법** — 주 52시간, 연차·휴가
- **연말정산** — 국세청 간소화 자료 연계
- **4대보험 EDI** — 국민연금공단·건강보험공단·근로복지공단

### 자주 쓰는 Report
- **RPTIME00**: Time Evaluation Driver
- **RPTQTA00**: Quota Generation
- **RPCEDTK0**: 한국 급여명세서

### 권한 관리 (K-SOX)
- **P_ORGIN**: 인포타입별 접근 제어
- **P_PERNR**: 개인 번호 제어
- 분기별 권한 재인증 (감사)
- 급여 담당자 ≠ 승인자 (SoD)

## 9. ECC HCM → SuccessFactors 하이브리드

### 마이그레이션 패턴
- **EC (Employee Central)** + ECP (Employee Central Payroll)
- ECP = HR Korea 로직을 cloud-hosted로 실행
- On-prem H4S4 유지 + SFSF 통합

### 데이터 복제
- **SAP CPI (Cloud Integration)** 중개
- Master data: SFSF → ECC
- Time/Payroll: ECC 유지 (한국 특수성)

## 10. 표준 응답 형식

```
## Issue
## Root Cause
## Check
## Fix
## Prevention (개인정보보호 + 감사)
## SAP Note
```

## 11. 관련
- `quick-guide.md`
- `../payroll-guide.md` — 한국 급여 상세
- `/plugins/sap-sfsf/skills/sap-sfsf/SKILL.md` — 클라우드 HR 하이브리드
- `/plugins/sap-bc/skills/sap-bc/SKILL.md` — 한국 K-SOX 권한 관리
