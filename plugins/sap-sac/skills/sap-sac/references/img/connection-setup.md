# SAC Connection 구성 가이드 (Live / Import)

## SPRO 경로

SAC 측은 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
SAC → ⚙ System → Administration → Data Source Configuration
SAC → Connections → Add Connection
소스 S/4: SPRO → SAP Gateway → OData Channel (서비스 활성)  /  SICF
```

## 필수 선행 구성

- [ ] 소스 시스템 결정 (S/4HANA Live / BW Import / 비-SAP)
- [ ] Live: S/4 InA(`/sap/bw/ina`) 또는 OData 서비스 SICF 활성
- [ ] Import: Data Provisioning Agent(DPA) 설치 + SAC 등록
- [ ] SAML2 IdP trust (SSO)

## 구성 단계 (Configuration Steps)

### 1. Live Connection (S/4HANA)
1. SAC → Connections → New → SAP S/4HANA (Live)
2. 인증: SAML SSO / OAuth2 SAML Bearer
3. 소스 S/4: SICF에서 `/sap/bw/ina/*` 노드 활성
4. CORS: S/4 측 화이트리스트에 SAC 테넌트 URL 등록 (`/sap/bc/ina` ICF, HTTP allowlist)
5. Test Connection

### 2. Import Connection (BW / 비-SAP)
1. DPA 설치 (소스 네트워크 내) → SAC에 agent 등록
2. SAC → Connections → New → Import (BW / SQL / file)
3. 자격증명 + agent 선택
4. 스케줄 정의 (refresh window)

### 3. SAML2 SSO
1. SAC → System → Administration → Security → SAML
2. IdP metadata 교환 (SAC SP metadata ↔ 기업 IdP)
3. 소스 S/4: SAML2 트랜잭션에서 SAC를 trusted provider 등록

## 구성 검증 (Verification)

- [ ] Test Connection 성공 (Live/Import 각각)
- [ ] Story에서 소스 모델 데이터 표시
- [ ] SAML SSO 라운드트립 성공 (재로그인 없이)
- [ ] CORS 차단 없음 (브라우저 콘솔 에러 0)
- [ ] Import 스케줄 1회 성공 + 데이터 행 수 일치

## 한국 현장 체크

- 한국 리전 SAC 테넌트 ↔ 글로벌 S/4 데이터센터 latency 영향
- 망분리 환경: DPA가 DMZ/내부망 경유 가능한지
- 카카오/네이버 커스텀 IdP를 SAML2 trust에 포함

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| Live 새로고침 실패 | SICF InA 노드 / CORS / SAML 인증서 만료 |
| Import 스케줄 실패 | DPA 다운 / 소스 query 변경 / 볼륨 한도 |
