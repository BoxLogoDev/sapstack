# sap-btp 한국어 퀵가이드

## 🔑 환경 인테이크
1. BTP 환경 (Cloud Foundry / Kyma / ABAP Environment)
2. Region (한국은 주로 Singapore APJ)
3. Subscription 종류 (Free/Trial/Standard/Enterprise)

## 📚 핵심

### CAP (Cloud Application Programming)
- **cds init** — 프로젝트 초기화
- **db/schema.cds** — 데이터 모델
- **srv/*.cds** — 서비스 정의
- **srv/*.js** — 커스텀 로직
- Fiori Elements 자동 생성

### Fiori / UI5
- **Launchpad** 구성
- **OData V2 / V4** 서비스 바인딩
- i18n 지원 (한국어 리소스 번들)

### Integration Suite
- **iFlow 설계** — Open Connectors, Cloud Integration
- 주요 Adapter: HTTP/REST, SFTP, SOAP, OData, IDoc
- **API Management** — Rate limiting, Policy 적용

### Security
- **XSUAA** — OAuth2 인증/인가
- **Destination Service** — 백엔드 시스템 연결
- **Cloud Connector** — 온프레미스 연결

## 🇰🇷 특화
- **SG(Singapore) 리전** 지연 시간 — 한국 사용자 기준 30~60ms
- **한국 데이터 레지던시** 요구 시 Private Cloud 검토 필요
- **한국 카카오톡/네이버 로그인** 통합 — XSUAA 커스텀 IdP
- **한국 PG사 연동** (토스페이, KG이니시스) — Integration Suite iFlow 커스텀

## 🤖 개발 워크플로
1. `cds init` + 로컬 모델링
2. Git push → Cloud Foundry / Kyma 배포
3. Fiori Launchpad 등록
4. XSUAA role-collection 매핑

## ⚠️ 주의
- **Cloud Foundry Space 권한** 분리 — Dev/Test/Prod
- **Destination**에 크리덴셜 저장 시 암호화 활성화
- **XSUAA xs-security.json** 변경은 재배포 필수
