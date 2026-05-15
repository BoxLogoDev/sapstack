# SAP Ariba 구성 가이드 개요

> Ariba는 클라우드 procurement — 전통 SPRO IMG 없음. 구성은 **Ariba
> Administration**(Realm), **Cloud Integration Gateway(CIG)**, 그리고
> S/4 측 **ERP Integration Add-on for Ariba** SPRO 노드로 수행합니다.

## 가이드 목록

| 가이드 | 주제 | 대상 |
|---|---|---|
| `cig-integration.md` | Cloud Integration Gateway / ERP add-on / Realm / 메시지 매핑 | 통합 담당 |
| `sourcing-procurement-config.md` | Sourcing/Contract template / Approval / Catalog | 조달 관리자 |
| `supplier-network-onboarding.md` | ANID / Trading Relationship / 공급사 onboarding | 공급사 관리자 |

## 공통 선행 조건

- Ariba Realm 프로비저닝 (test/prod 분리)
- S/4: ERP Integration Add-on for Ariba 설치·활성
- CIG Worker(Cloud Connector) GREEN
- Ariba Network buyer 계정 + 공급사 ecosystem 파악

## ECC vs S/4HANA vs Cloud

- S/4HANA: 표준 ERP Integration Add-on + CIG
- ECC: 동일 add-on 가능하나 일부 시나리오 제한
- Ariba 자체는 SaaS — Realm 단위 구성

## 참조

- `../ko/quick-guide.md` — Ariba 한국어 퀵가이드
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM 연동 (PR/PO)
- `../../../sap-integration-cloud/skills/sap-integration-cloud/references/img/` — CIG/CPI 인프라
