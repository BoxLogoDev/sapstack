---
name: sap-sac
description: >
  This skill handles all SAP Analytics Cloud (SAC) tasks including Story design,
  Analytic Applications, Smart Insights, Predictive scenarios, Planning models,
  data connectivity (live vs. import), HANA Cloud connection, BW Bridge, BTP
  destination configuration, Datasphere integration, R visualizations, Smart
  Discovery, allocation, value driver tree, Time-series forecasting, Calculated
  Measures, Hierarchies, SAC Mobile, embedding (SAP Build Apps, Fiori), and
  performance optimization. Use whenever the user mentions SAC, Analytics Cloud,
  SAC Story, Analytic Application, BW Bridge, SAC Planning, Smart Insights,
  Predictive, or BTP analytics.
allowed-tools: Read, Grep, Glob
---

# sap-sac — SAP Analytics Cloud

## 1. Environment Intake Checklist

1. **SAC tenant region** — eu10 / us10 / kr-canary 등?
2. **Edition** — SAC for BI / Planning / Smart Predict / Augmented Analytics?
3. **Connection type** — Live (HANA, BW, S/4) vs. Import (Datasphere, Files)?
4. **Underlying data source** — S/4HANA Cloud / On-Premise / BW / Datasphere / non-SAP?
5. **Use case** — BI Story, Analytic App, Planning, Predictive scenario?
6. **User role** — Story creator, Modeler, Planning user, Admin?

## 2. Core Concepts

### 2.1 Connection Models
- **Live Connection** — real-time query, no data copy. HANA, BW, S/4 CDS views.
- **Import Connection** — periodic data load. Files, Datasphere, non-SAP DBs.

### 2.2 Models
- **Analytic Model** — flexible, dimension/measure-based, for BI Story
- **Planning Model** — supports input, version, allocation, value driver
- **Predictive Model** — Smart Predict / Augmented (regression, classification, time series)

### 2.3 Stories vs. Analytic Applications
- **Story** — drag-drop dashboards, smart insight, easy for business users
- **Analytic Application** — scriptable (JS), customizable UI, for app developers

## 3. Typical Issues

### Data Issues
- "Story is empty" — check connection, model permissions, member filter
- "Numbers don't match S/4" — live vs. import mismatch, currency/unit conversion
- "Hierarchy missing" — refresh hierarchy in connection, check role mapping

### Performance
- Story slow → live query optimization (CDS views, indexes), reduce visible measures, use story-level filters
- Live BW: check BW query performance, OLAP cache

### Planning
- "Cannot save value" — check write access, locked dimensions, version status (Public/Private)
- Allocation fail → check source/target model, rule structure
- Forecast not generating → check data history, model dimensions

### Predictive
- Smart Predict accuracy low → review data quality, target balance, feature relevance
- Time-series forecasting → ensure consistent intervals

## 4. Connections to S/4 / Datasphere

| Source | Connection | Notes |
|---|---|---|
| **S/4HANA Cloud PE** | Live via Cloud Connector | use Released CDS views (`I_*` / `C_*`) |
| **S/4HANA On-Prem** | Live via Cloud Connector + Reverse Proxy | mandatory HANA 2.0+ |
| **BW/4HANA** | Live, via BW Bridge or InA | use BW Queries |
| **Datasphere** | Live (Spaces) or Import | preferred for cloud BI |
| **HANA Cloud** | Live | direct |
| **Non-SAP DB** | Import via OData/JDBC | Datasphere as bridge recommended |

## 5. Korean Context

- **한국 데이터 위치**: SAC tenant region이 ap-southeast-1 (싱가포르) 또는 kr-canary
- **공공기관 컴플라이언스**: K-ISMS, 망분리 환경에서 SAC 사용은 Private Cloud 검토
- **한국어 UI**: SAC Story Title/Label 한국어 OK; 데이터 dimension name은 영문 권장
- **다국가 자회사 통합 보고**: 한국 본사 SAC tenant에 자회사 데이터 통합 (consolidation)

## 6. Cross-module Routing

- BTP 환경/Cloud Connector 이슈 → `sap-btp`
- S/4 CDS view → `sap-abap-developer`
- Datasphere 연동 → `sap-integration-cloud` (Datasphere 포함 시)
- Planning workflow → 비즈니스 컨설턴트 (CO/FI)

## 7. SAP Notes & References

- SAP Note 2906876 — SAC Live Connection Prerequisites
- SAC Help: https://help.sap.com/docs/SAP_ANALYTICS_CLOUD
- SAC Best Practices Guide (Story design, Planning, Predictive)

## 8. Out of Scope

- BW dataflow design (use sap-abap)
- Datasphere modeling (use sap-integration-cloud)
- Non-SAC BI tools (Tableau, Power BI 등)
