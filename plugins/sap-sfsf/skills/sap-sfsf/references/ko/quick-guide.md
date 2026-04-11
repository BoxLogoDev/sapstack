# sap-sfsf 한국어 퀵가이드

## 🔑 환경 인테이크
1. SuccessFactors 모듈 (EC / ECP / Recruiting / LMS / Performance)
2. Data Center (한국은 주로 APJ/Singapore)
3. ECC/H4S4 연동 여부 (하이브리드 / 풀 클라우드)

## 📚 핵심

### Employee Central (EC)
- **Admin Center → Manage Employee Files**
- Foundation Objects: Legal Entity, Business Unit, Division, Department
- MDF (Metadata Framework): 커스텀 객체 생성
- Business Rules: 선언형 로직 (workflow 트리거, 값 계산)

### Role-Based Permissions (RBP)
- **Manage Permission Roles**
- **Permission Groups** — 동적 그룹 (쿼리 기반)
- 한국 대기업 특이점: 계층형 승인(CEO→본부장→팀장→팀원) 복잡

### ECP (Employee Central Payroll)
- SAP HR Korea Payroll 로직을 cloud-hosted로 실행
- H4S4 on-prem payroll과 코드베이스 공유

### Recruiting
- Job Requisition Templates
- Application Form Templates
- Candidate Data Model

### Integration
- **Integration Center** — SFSF 내장 통합 도구
- **SAP Cloud Integration (CPI)** — BTP 기반
- OData API (Query + Upsert)

## 🇰🇷 특화
- **주민등록번호** — APJ DC 저장 허용 여부 법적 검토 필요
- **4대보험 연동** — ECP로 가는 경우만 Korea payroll 계산
- **한국어 UI** — SFSF 표준 지원 (i18n)
- **연말정산** — ECP 또는 on-prem H4S4에서 처리 (SFSF 자체는 계산 안함)

## ⚠️ 주의
- **Admin Center 권한 변경**은 Preview instance에서 먼저 테스트
- **데이터 모델 변경** (XML import/export)은 백업 필수
- 한국 특화 필드는 **Picklist** 활용 권장 (하드코딩 금지)

## 📖 마이그레이션 가이드
`../migration-path.md` 참조.
