---
name: sap-integration-cloud
description: >
  This skill handles SAP BTP integration platform tasks across SAP Integration
  Suite (CPI - Cloud Platform Integration), SAP Datasphere (formerly DWC),
  Cloud Connector, OData services, API Management, Event Mesh, Open Connectors,
  iFlow design (REST, SOAP, IDoc, SuccessFactors, S/4 OData), error handling,
  certificate management, monitoring, message reprocessing, Datasphere Spaces,
  views, federation, replication, S/4 ABAP CDS exposure, BTP destinations, and
  Pre-packaged Integration Content. Use whenever the user mentions CPI,
  Integration Suite, iFlow, Datasphere, DWC, Cloud Connector, API Management,
  Event Mesh, OData, IDoc cloud, ABAP CDS exposure, or any cloud integration.
allowed-tools: Read, Grep, Glob
---

# sap-integration-cloud — Integration Suite + Datasphere

## 1. Environment Intake Checklist

1. **Integration scope** — CPI (Cloud Platform Integration) / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 (Cloud/OnPrem) / SuccessFactors / Ariba / 3rd party?
3. **Protocol** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **Authentication** — OAuth / Basic / Certificate / SAML?
5. **Specific issue** — iFlow design, error handling, perf, certificate, monitoring?

## 2. Module Coverage

### 2.1 Integration Suite Components
| Component | Purpose |
|---|---|
| **CPI (Cloud Platform Integration)** | iFlow-based message routing/transformation |
| **API Management** | API design, gateway, throttling, security |
| **Event Mesh** | Event-driven messaging (pub/sub) |
| **Open Connectors** | Pre-built non-SAP connectors |
| **Integration Advisor** | Schema design assistance |

### 2.2 Datasphere
- Successor to SAP DWC (Data Warehouse Cloud)
- Spaces (data isolation) + Local Tables + Views + Federation
- Connect S/4HANA Cloud / on-prem / BW / non-SAP via Data Provisioning Agent

## 3. CPI / iFlow Patterns

### 3.1 Common iFlow Shapes
- **Request-Reply** — sync API call
- **Splitter** — message → multiple
- **Aggregator** — multiple messages → 1
- **Content Filter** — header/payload filtering
- **Mapping** — Message Mapping (graphical) or Script (Groovy)

### 3.2 Typical Flows
- **S/4 to SuccessFactors** — employee replication
- **SuccessFactors to S/4 HCM** — org data sync
- **S/4 to Ariba** — material/vendor master via CIG
- **Bank file (MT940)** — FTP → CPI → S/4 FF.5

## 4. Datasphere Patterns

### 4.1 Architecture
- **Space** — isolation (sandbox / production / per-business unit)
- **Local Table** — physically stored
- **Remote Table** — federated (live query)
- **View** — virtual model
- **Analytic Model** — for SAC consumption

### 4.2 Data Provisioning
- **DP Agent** — on-prem to cloud bridge
- **Replication Flow** — real-time data sync
- **Data Flow** — ETL-like batch

## 5. Critical Issues

### CPI / iFlow
- **iFlow not triggering** — sender adapter config, polling schedule, certificate expired
- **Mapping error** — schema mismatch, missing required fields, type conversion
- **Memory exceeded** — large payload, split before processing
- **Certificate expired** — STRUST equivalent in BTP Keystore, alert before expiry
- **Reprocessing failed message** — Monitor → Messages → Retry

### Datasphere
- **Federation slow** — push-down vs materialize trade-off
- **Replication lag** — Replication Flow monitoring
- **Space sharing fail** — Privilege Sharing config

### Cloud Connector
- **Tunnel not connecting** — outbound 443 firewall, regional endpoint
- **System mapping fail** — virtual host vs internal host

## 6. Korean Context

### 한국 시나리오
- **국세청 e-Tax invoice 연동**: CPI iFlow + 한국 인증서
- **사회보험 EDI**: SFTP + 한국 정부 형식
- **K-Bank file 파싱**: KFTC 표준 MT940 한국 dialect
- **망분리 환경**: Cloud Connector + DMZ + 보안 게이트웨이

### Datasphere 활용
- 한국 본사 + 자회사(중국·베트남·미국) 데이터 통합
- SAC 시각화 입력 데이터로 활용

## 7. Cross-module Routing

- BTP env / Cloud Connector → also `sap-btp`
- S/4 측 인터페이스 → `sap-abap-developer` (CDS, BAdI, RFC)
- SuccessFactors 동기화 → `sap-sfsf-consultant`
- Ariba 통합 → `sap-ariba-consultant`
- SAC 데이터 소스 → `sap-sac-consultant`

## 8. SAP Notes & References

- SAP Note 2733913 — CPI Capacity Sizing
- SAP Note 3040983 — Datasphere General
- Integration Suite Discovery Center: https://api.sap.com
- Datasphere Help: https://help.sap.com/docs/SAP_DATASPHERE

## 9. Out of Scope

- BW/4HANA on-prem data warehouse (use BW skill)
- Non-SAP iPaaS (Boomi, MuleSoft, Workato)
- PO/PI (older SAP integration platform — deprecated; migrate to CPI)
- HCI (older name for CPI)
