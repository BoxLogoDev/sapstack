# INTEGRATION-CLOUD 진단 카드 (local)

## 우선 진단 경로

- iFlow 미기동 → Sender adapter · 폴링 · 인증서
- 매핑 오류 → 스키마/필수필드 · CPI Monitor payload
- 인증서 만료 → STRUST + BTP Keystore
- Cloud Connector down → 서브어카운트 · SICF/SM59 도달
- OData 401 → 시크릿/인증서 만료 · SAML2
- IDoc 적체 → WE20 파트너 프로파일
- Datasphere 복제 지연 → LTRC job · ODQ 적체
- PI/PO 교차 → SXMB_MONI / SRT_MONI, PII 원문 외부전송 금지

## 핵심 T-code

SXMB_MONI: PI/XI 메시지
SRT_MONI: ABAP Web Service
SLG1: 인터페이스 로그
STRUST: 인증서
SICF: 서비스 활성
SM59: Destination
SAML2: SAML
LTRC: SLT 복제

## 규칙

- 페이로드에 개인정보 있으면 비식별 증거만
- 금지: 인증서/은행코드 추정, 운영 SE16N
- 확신 없으면 "확인 필요"
