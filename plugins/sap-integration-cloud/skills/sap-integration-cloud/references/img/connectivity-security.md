# BTP Connectivity & Security 구성 가이드

## SPRO 경로

BTP/Integration Cloud — SPRO 미해당. 구성 위치:

```
Cloud Connector Admin UI → Cloud To On-Premise (Access Control)
BTP cockpit → Connectivity → Destinations
BTP cockpit → Security → Trust Configuration (SAML/OIDC)
소스 S/4: SICF (ICF 노드) · SOAMANAGER · SAML2 · STRUST (인증서)
```

## 필수 선행 구성

- [ ] Cloud Connector 설치 (소스 네트워크 내)
- [ ] BTP subaccount ↔ Cloud Connector 연결
- [ ] 소스 S/4 ICF 서비스(SICF) 활성
- [ ] 인증 전략 (Basic / OAuth2 / mTLS / Principal Propagation)

## 구성 단계 (Configuration Steps)

### 1. Cloud Connector
1. Admin UI → subaccount 추가 (region host, subaccount ID)
2. Cloud To On-Premise → Access Control: 백엔드 host:port + 허용 경로
3. Location ID (멀티 커넥터 시 구분)
4. Principal Propagation (필요 시 — 시스템 인증서 교환)

### 2. BTP Destination
1. cockpit → Connectivity → Destinations → New
2. URL / Proxy Type(OnPremise) / Authentication
3. Location ID 매핑 (Cloud Connector와 일치)
4. Check Connection

### 3. Trust / SSO
1. cockpit → Security → Trust Configuration (SAML/OIDC IdP)
2. 소스 S/4: SAML2 트랜잭션에서 BTP/iFlow trust 등록
3. STRUST: 인증서 체인 + rotation 계획

### 4. 자격증명 수명주기
1. OAuth client secret / 인증서 만료일 등록·알림
2. Rotation 절차 문서화 (무중단 교체)

## 구성 검증 (Verification)

- [ ] Cloud Connector status GREEN, Access Control 경로 정확
- [ ] Destination Check Connection 200 OK
- [ ] SICF 소스 노드 active
- [ ] SSO 라운드트립 성공 (재인증 없음)
- [ ] 인증서/secret 만료 모니터링 알림 동작

## 한국 현장 체크

- 망분리 환경: DMZ 경유 터널 + location ID 분리
- 한국 공인/사설 인증서 갱신 주기 ↔ 연동 인증서 동기화
- 카카오/네이버 커스텀 IdP를 Trust Configuration에 포함

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| 온프레 연동 불가 | Cloud Connector DOWN / Access Control / SICF |
| 401 인증 실패 | secret·인증서 만료 / SAML trust / communication user |
