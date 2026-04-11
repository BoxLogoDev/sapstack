# SAP SuccessFactors (SFSF) 한국어 전문 가이드

> `plugins/sap-sfsf/skills/sap-sfsf/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크

SFSF 이슈 보고 시 확인:
- 활성 모듈 (EC / ECP / Recruiting / LMS / Performance / Onboarding / People Analytics)
- Data Center (한국은 주로 **APJ / Singapore**)
- Subscription 레벨 (Core / Standard / Enterprise)
- ECC/H4S4 연동 여부 (하이브리드 / 풀 클라우드)
- SAP CPI (Cloud Integration) 사용 여부

---

## 2. Employee Central (EC)

### Core Data Model
- **Foundation Objects**: Legal Entity, Business Unit, Division, Department, Location, Job Classification, Pay Grade
- **MDF (Metadata Framework)**: 커스텀 객체 생성 — no-code 확장
- **Position Management**: 포지션 기반 조직 관리
- **Effective Dating**: 모든 변경은 시점 기반 (YYYY-MM-DD)

### Admin Center
- **Manage Employee Files** — 직원 정보 유지
- **Employee Files → Employment Information** — 채용·퇴사·전보
- **Import Employee Data** — CSV 대량 업로드

### Business Rules
- **Admin Center → Configure Business Rules**
- 선언형 로직 (workflow 트리거, 값 계산, validation)
- **onChange / onInit / onSave** 이벤트
- 에러 메시지 커스텀

### Workflow
- **Manage Workflow Groups** — 승인자 그룹
- **Workflow Configurations** — 단계별 승인 체인
- **한국 대기업 특이점**: 계층형 승인(팀원→팀장→본부장→CEO) 복잡

---

## 3. Role-Based Permissions (RBP)

### 핵심 개념
- **Permission Role**: 무엇을 할 수 있는지 (예: "Compensation Admin")
- **Permission Group**: 누구에게 적용 (동적 쿼리 기반)
- **Target Population**: 어느 직원에 대해 적용

### 주요 트랜잭션 (Admin Center)
- **Manage Permission Roles**
- **Manage Permission Groups**
- **View User Permission** — 특정 사용자 디버그

### 디버그
- **Check Tool** → Permission 검사
- **View Permission** → 특정 권한의 주체/대상

### 한국 특화
- 대기업 조직 계층 복잡 — Permission Group 쿼리가 길어지기 쉬움
- 인사팀 vs 현업 관리자 분리 엄격

---

## 4. ECP (Employee Central Payroll)

### 특징
- SAP HR Korea Payroll 로직을 **cloud-hosted**로 실행
- on-prem H4S4 Payroll과 **코드베이스 공유**
- ERP HCM이 마이그레이션 없이 cloud 전환 가능

### 한국 Payroll 유지
- **PC00_M46_CALC** — 한국 급여계산 (ECP에서도 동일)
- 4대보험, 원천세, 연말정산 로직 그대로
- **국세청 연동** (ECP에서도 필수)

### Integration
- EC → ECP: 마스터 데이터 복제 (SF EC → SAP ERP)
- ECP → EC: 급여 결과 상태 (선택)

---

## 5. Recruiting (RCM)

- **Job Requisition** 템플릿
- **Application Form** 템플릿
- **Candidate Data Model**
- **Interview Central** — 면접 scorecard
- **Offer Letter** 자동 생성

### 한국 특화
- **공개 채용** 프로세스 — 대기업 공채
- **이력서 표준 양식** (학력, 경력, 자격증)
- **채용 포털 연동** (잡코리아, 사람인, 원티드)

---

## 6. Learning (LMS)

- **Learning Plan** — 개인 학습 계획
- **Curriculum** — 필수/선택 교육
- **Assignment Profile** — 자동 할당
- **Quickguides** — 간단 교육

### 한국 특화
- **법정 의무교육** 준수 (성희롱 예방, 개인정보보호 등)
- **이수 증명서** 발급
- **KOCW**·**K-MOOC** 외부 컨텐츠 연동 사례

---

## 7. Performance Management

- **Goal Management** — MBO
- **Performance Review** — 분기/연 평가
- **Calibration** — 등급 분포 조정
- **Continuous Performance Management** (CPM) — 지속 피드백

### 한국 특화
- 상대평가 vs 절대평가 — 한국은 상대평가 비중 큰 기업 많음
- **인사고과** 연봉 연동

---

## 8. Integration — CPI / Integration Center

### SAP Cloud Integration (CPI)
- iFlow 기반 통합
- **Standard iFlow Packages**:
  - Employee Central to Employee Central Payroll
  - Employee Central to SAP ERP
  - Employee Central to SAP S/4HANA
- **CPI Dashboard** 모니터링

### Integration Center
- SFSF 내장 통합 도구 (간단한 연동용)
- OData + REST API
- Scheduled Jobs

### OData API
- **V2**: /odata/v2/
- **Upsert** (merge), **Query** (with $filter, $expand)
- **Rate Limits** 주의

---

## 9. 한국 Localization

### 주민등록번호 취급
- **APJ DC 저장 허용 여부** 법적 검토 필요 (개인정보보호법)
- **마스킹 필수**: 화면·로그·export
- **암호화** 추가 권장 (AES-256)

### 4대보험 연동
- ECP로 가는 경우에만 Korean Payroll 계산
- on-prem ECC 유지하면서 SFSF EC만 쓰는 하이브리드 흔함

### 한국어 UI
- SFSF 표준 **i18n 지원**
- Language Pack 설치
- Picklist 한국어 번역

### 연말정산
- SFSF EC 자체는 **계산 안함**
- ECP 또는 on-prem H4S4에서 처리
- Reporting만 SFSF에서

---

## 10. 마이그레이션 경로 (ECC HCM → SFSF)

### 하이브리드 (가장 흔함)
```
ECC HCM (on-prem)  ←→  SFSF EC  (hire-to-retire)
   │                        │
Payroll                  Talent Mgmt
(ECC 유지)               (cloud)
```
- ECC Payroll 유지, SFSF EC가 마스터
- CPI로 양방향 복제

### 풀 클라우드 (ECP 전환)
```
SFSF EC  →  SFSF ECP  (Korean Payroll 포함)
```
- on-prem ECC HCM 종료
- Korean payroll 로직을 ECP로 이관

### Talent-only
```
ECC HCM 유지  +  SFSF Recruiting/LMS/Performance
```
- EC는 안 쓰고 talent 모듈만

## 11. 자주 참조하는 SAP Note
- **2296801** — Employee Central Integration with SAP ERP
- **2145114** — HCM for S/4HANA (H4S4) Deployment

## 12. 관련
- `quick-guide.md` — 한국어 퀵가이드
- `../migration-path.md` — ECC → SFSF 마이그레이션 경로
- `/plugins/sap-hcm/skills/sap-hcm/SKILL.md` — on-prem HCM
- `/plugins/sap-btp/skills/sap-btp/SKILL.md` — BTP 통합 기반
