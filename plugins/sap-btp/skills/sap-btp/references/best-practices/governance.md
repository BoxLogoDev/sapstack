# BTP 거버넌스·보안 (Tier 3) Best Practice

## 1. 서브어카운트 거버넌스

### 1.1 계층 구조
- Global Account → Directory → Subaccount → Space (CF)
- Directory: 사업부 단위
- Subaccount: 환경 (DEV/TST/PRD) 또는 프로젝트
- Space: 팀 단위

### 1.2 명명 규칙
- Subaccount: `<region>-<env>-<purpose>` (예: `kr-prd-ecommerce`)
- Space: `<team>` (예: `payment`)
- Role Collection: `<purpose>_<level>` (예: `Admin_Full`)

## 2. 권한 거버넌스

### 2.1 Role Collection
- Principle of Least Privilege
- Admin은 4-eyes (2명 승인)
- Developer는 환경별 제한

### 2.2 분리된 임무 (SoD)
- DEV 배포 권한 ≠ PRD 배포 권한
- 보안 설정 ≠ 모니터링 권한
- 분기 재인증

## 3. 데이터 거버넌스

### 3.1 데이터 분류
- 일반 / 내부 / 기밀 / 1급 비밀
- PII / PCI / HIPAA 분류

### 3.2 데이터 위치
- 한국 데이터: 서울 리전 (ap-northeast-2)
- GDPR 데이터: EU 리전
- 데이터 이전 사전 승인 (Cross-region)

## 4. 보안 거버넌스

### 4.1 IAM
- IAS + SAML/OIDC 통합
- MFA 필수 (Admin·Developer)
- 패스워드 정책: 12자 이상, 분기 변경

### 4.2 네트워크 보안
- Private Link / Cloud Connector
- API Management Gateway
- WAF 적용

### 4.3 암호화
- 전송: TLS 1.2+
- 저장: AES-256
- Key Vault: BTP Credential Store

## 5. 컴플라이언스

### 5.1 한국 컴플라이언스
- K-ISMS-P (정보보호 및 개인정보보호 관리체계 인증)
- 클라우드 보안 인증 (KISA)
- 망분리 환경 (정부·금융 고객)

### 5.2 글로벌 컴플라이언스
- SOC 2 Type II
- ISO 27001
- GDPR (EU 고객)

## 6. 거버넌스 지표

| 지표 | 임계 |
|---|---|
| Admin 보유자 | < 5명 / Subaccount |
| SoD 위반 | 0 |
| 패스워드 정책 준수율 | 100% |
| MFA 활성률 | 100% (Admin) |
| 클라우드 비용 차이 | < 10% (Budget vs Actual) |

## 연관 문서
- `operational.md`, `period-end.md`
