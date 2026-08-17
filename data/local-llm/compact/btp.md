# BTP 진단 카드 (local)

## 우선 진단 경로

- 앱 권한 없음 → BTP cockpit role-collection (XSUAA)
- Destination 실패 → 이름 대소문자 · URL/인증 타입 → SICF 백엔드
- 401 Token expired → OAuth 갱신 · SAML2 신뢰
- CAP 배포 실패 → service binding (HANA/XSUAA/destination)
- Launchpad 빈 화면 → Catalog/Group·role 매핑
- Cloud Connector 끊김 → 온프렘 연결 서비스
- iFlow 실패 → mapping/adapter · Exception subprocess
- 백엔드 URL 하드코딩 금지 — Destination Service만

## 핵심 T-code

SICF: 백엔드 서비스 활성
SM59: RFC/HTTP destination
SAML2: SAML 신뢰

## 규칙

- Cloud PE는 on-stack 클래식 ABAP 불가. Side-by-side는 CAP
- 금지: Destination URL 하드코딩, 회사코드 고정, 미확인 Note
- 확신 없으면 "확인 필요"
