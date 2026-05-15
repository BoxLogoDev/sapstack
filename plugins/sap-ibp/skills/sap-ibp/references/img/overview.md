# SAP IBP 구성 가이드 개요

> SAP IBP는 BTP SaaS 제품이라 전통 SAP GUI / SPRO IMG가 없습니다.
> 구성은 **IBP Web UI**(Application Jobs, Configuration), **Excel Add-In**,
> **CPI Integration Content**로 수행합니다. 이 디렉토리의 가이드는 SPRO
> 대신 IBP/BTP cockpit 경로를 표준 형식으로 정리합니다.

## 가이드 목록

| 가이드 | 주제 | 대상 |
|---|---|---|
| `planning-area-configuration.md` | Planning Area / Time Profile / Attributes / Key Figures | IBP 관리자 |
| `forecast-model-setup.md` | 통계 예측 모델 / Demand Sensing / 알고리즘 파라미터 | Demand Planner |
| `s4-cpi-integration.md` | S/4HANA ↔ IBP CPI Integration Content / External Codes | 통합 담당 |

## 공통 선행 조건

- IBP 테넌트 프로비저닝 완료 (BTP subaccount entitlement)
- IBP Excel Add-In 설치 (Planner 워크스테이션, IBP 릴리스와 버전 일치)
- S/4HANA 연동 시 CPI tenant + Cloud Connector GREEN
- Planning Area: 표준(SAP7, SAPIBP1) 또는 커스텀 결정

## ECC vs S/4HANA vs Cloud

IBP는 ECC/S4 와 별개의 클라우드 제품입니다. 연동 측 S/4HANA는 PIR/MRP
(MD63, MD05, MDBT, CO41)로 IBP 계획 결과를 수신·실행합니다. ECC 환경은
IBP 직접 연동 대신 BW 경유 또는 CPI-DS 사용.

## 참조

- `../ko/quick-guide.md` — IBP 한국어 퀵가이드
- `../../../sap-integration-cloud/skills/sap-integration-cloud/references/img/` — CPI 구성
