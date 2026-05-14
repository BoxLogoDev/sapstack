# sap-integration-cloud 한국어 퀵가이드

> SAP BTP 통합 플랫폼 통합 — Integration Suite (CPI) + Datasphere + API Management + Event Mesh + Open Connectors.

## 🔑 환경 인테이크

1. **통합 범위** — CPI / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 / SuccessFactors / Ariba / 외부 시스템?
3. **프로토콜** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **인증** — OAuth / Basic / Cert / SAML?

## 📚 핵심 컴포넌트

### Integration Suite
| 컴포넌트 | 한국어 | 용도 |
|---|---|---|
| **CPI** | 클라우드 통합 (구 HCI) | iFlow 기반 메시지 라우팅·변환 |
| **API Mgmt** | API 관리 | 게이트웨이·throttling·보안 |
| **Event Mesh** | 이벤트 메시 | pub/sub 메시징 |
| **Open Connectors** | 외부 커넥터 | 비-SAP pre-built |

### Datasphere
- 구 DWC (Data Warehouse Cloud)
- Space (격리) + Local Table + View + Federation
- Data Provisioning Agent로 on-prem 연결

## 🇰🇷 한국 현장 시나리오

### 자주 보는 패턴

#### 정부 시스템 연동
- **국세청 e-Tax invoice**: CPI iFlow + 한국전자인증·코스콤 인증서
- **4대보험 EDI**: SFTP + 한국 정부 표준
- **국세청 홈택스**: 별도 API + 인증

#### 은행 연동
- **K-Bank MT940 파싱**: KFTC 표준 + 한국 은행별 dialect (국민/우리/하나/신한 등)
- **이체 파일 생성**: DMEE Korea + 은행 코드

#### 사내 통합
- **한국 본사 ↔ 자회사**: 중국·베트남·미국 자회사 데이터 통합 (Datasphere)
- **레거시 ERP ↔ S/4**: 마이그레이션 기간 hybrid

### 망분리 환경 통합
- Cloud Connector + DMZ Proxy
- 외부 통신: 보안 게이트웨이 경유 (예: APIPark, SECUI)
- 인증서: STRUST (S/4) + BTP Keystore

## 🚨 자주 마주치는 이슈

### "iFlow가 메시지를 처리 안 함"
- Sender adapter 상태 (REST·SFTP·OData 등)
- Polling 스케줄
- 인증서 만료
- 메시지 형식 (스키마 불일치)
→ Monitor → Messages → Status별 확인

### "매핑 오류"
- Source/Target schema 불일치
- 필수 필드 누락
- Type conversion (String → Integer 등)
- Groovy script syntax

### "메모리 초과"
- Large payload (예: 10MB+ 단일 메시지)
- Splitter 추가 권장
- Streaming 모드 활용

### "인증서 만료"
- BTP Keystore에서 임박 인증서 식별
- 30일 전 갱신 절차 시작
- 한국 인증기관 (코스콤·한국전자인증) 별도 절차

### "Cloud Connector 연결 안 됨"
- 아웃바운드 443 포트 방화벽
- 리전 endpoint (kr/eu/us)
- Virtual Host 매핑 (internal vs external)

## 🔧 권장 패턴

### S/4 → SuccessFactors 동기화
1. S/4 ABAP CDS view 노출
2. CPI iFlow: S/4 OData → mapping → SFSF OData
3. SFSF write API 호출
4. Error → email/Slack 알림 + Reprocess

### MT940 은행 파일 파싱
1. SFTP polling (Sender adapter)
2. MT940 → XML 변환 (Standard adapter)
3. Mapping → S/4 FF.5 input
4. RFC call to S/4

### Datasphere → SAC
1. Datasphere Space에 분석 모델 설계
2. SAC Live Connection
3. Story에서 모델 consume

## 📚 참조

- `references/iflow-patterns.md` — iFlow 디자인 패턴 (TBD)
- `references/datasphere-modeling.md` — Datasphere 모델링 (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP 환경
- `../../../sap-sac/skills/sap-sac/SKILL.md` — SAC 연동
- `../../../sap-sfsf/skills/sap-sfsf/SKILL.md` — SFSF 통합

## ⚠️ 비목표

- BW/4HANA on-prem 데이터 웨어하우스 (BW 영역)
- 비-SAP iPaaS (Boomi, MuleSoft, Workato 등)
- PO/PI (구 SAP 통합 — deprecated; CPI로 마이그레이션)
