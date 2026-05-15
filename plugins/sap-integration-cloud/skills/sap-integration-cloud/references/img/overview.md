# SAP Integration Cloud (CPI / Datasphere) 구성 가이드 개요

> Integration Cloud = SAP Cloud Integration(CPI) + SAP Datasphere.
> BTP SaaS — 전통 SPRO IMG 없음. 구성은 **Integration Suite**(iFlow),
> **Datasphere**(Space/Replication), **Cloud Connector**, 그리고 소스
> S/4 측 SPRO 연동 노드(SOAMANAGER/WE20/LTRC 등)로 수행합니다.

## 가이드 목록

| 가이드 | 주제 | 대상 |
|---|---|---|
| `cpi-iflow-setup.md` | Integration Package / iFlow / Adapter / Security Material | 통합 개발자 |
| `datasphere-replication.md` | Space / Connection / Replication·Transformation Flow / SLT | 데이터 엔지니어 |
| `connectivity-security.md` | Cloud Connector / Destination / OAuth·SAML / 인증서 | BTP 관리자 |

## 공통 선행 조건

- Integration Suite / Datasphere 테넌트 프로비저닝
- Cloud Connector 설치 + subaccount 연결 (온프레미스 소스)
- 소스 S/4: 연동 T-code 활성 (SOAMANAGER/WE20/LTRC/ODQMON 등 — B3 등록분)
- 자격증명 보관소(Security Material) 정책

## ECC vs S/4HANA vs Cloud

- S/4HANA: 표준 통합(OData/SOAP/IDoc/SLT/ODP) 전부 지원
- ECC: SOAP/IDoc/SLT 지원, 일부 OData 제한 (Gateway 버전 의존)
- 소스 무관 — CPI/Datasphere는 어댑터로 추상화

## 참조

- `../ko/quick-guide.md` — Integration Cloud 한국어 퀵가이드
- 연관 모듈 IMG: `sap-ibp` (CPI Integration Content), `sap-ariba` (CIG), `sap-sac` (Import/DPA)
