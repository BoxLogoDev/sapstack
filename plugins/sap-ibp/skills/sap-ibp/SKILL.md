---
name: sap-ibp
description: >
  This skill handles all SAP IBP (Integrated Business Planning) tasks including
  Demand Sensing, S&OP, Supply Planning, Inventory Planning, Response & Supply,
  Control Tower, Excel UI integration, planning algorithms, time series forecasting,
  master data integration with S/4HANA, BTP environment provisioning, ATP
  (Available-to-Promise) checks, multi-level planning, snapshots, version
  management, key figures, planning levels, planning operators, and SAP IBP
  Excel UI. Use this skill whenever the user mentions IBP, demand planning,
  supply planning, S&OP, sales and operations planning, demand sensing, inventory
  optimization, statistical forecasting, planning area, planning level, key figure,
  time-series, IBP Excel, BTP planning, response planning, ATP, or any IBP
  module question.
allowed-tools: Read, Grep, Glob
---

# sap-ibp — Integrated Business Planning

## 1. Environment Intake Checklist

Before answering an IBP question, capture the environment context:

1. **IBP Release** — IBP for Supply Chain version (e.g., 2402, 2308, 2305)?
2. **Deployment** — BTP (SaaS) only. On-premise version does not exist.
3. **Modules in scope** — Demand, Sales & Operations, Supply, Inventory, Response, Control Tower?
4. **Integration** — S/4HANA via Cloud Integration (CPI/CIG) or direct DataServices? Other systems (APO, BW, non-SAP)?
5. **Excel UI version** — IBP Excel Add-In version on user's workstation?
6. **Planning Area** — Standard (SAP7, SAPIBP1) or custom?
7. **Industry sector** — Retail, manufacturing, life sciences, etc.?

## 2. Module Coverage Matrix

| IBP Module | Purpose | Key Use Cases |
|---|---|---|
| **Demand** | Statistical forecasting + sensing | Mid/long-term demand, demand sensing (DS) |
| **Sales & Operations (S&OP)** | Integrated business planning | Reconcile demand-supply, capacity, financials |
| **Supply** | Multi-stage supply planning | Production, sourcing, distribution |
| **Inventory** | Multi-echelon inventory optimization | Safety stock, replenishment policies |
| **Response & Supply** | Order-based real-time planning | ATP, allocation, gating |
| **Control Tower** | Visibility & exception management | KPIs, alerts, scenario analysis |

## 3. Core Concepts

### 3.1 Planning Area & Planning Level
- **Planning Area** (e.g., SAP7, SAPIBP1) — defines the data model: master data, key figures, time profile, planning operators.
- **Planning Level** — granularity (PROD, LOC, CUST, etc.) and combinations (PROD+LOC).
- **Key Figure** — measurable values (sales, forecast, capacity, etc.) with calculation logic.

### 3.2 Time Profile
- Hierarchical (Year → Quarter → Month → Week → Day) or non-hierarchical.
- Aggregation/disaggregation governed by key figure properties.

### 3.3 Master Data
- Product, Location, Customer, Resource, etc.
- Integration: S/4HANA master replication via CPI Integration Content.

### 3.4 Planning Operators
- **Copy Operator** — duplicate key figure values
- **Forecast Operator** — statistical algorithms (Croston, AR, Triple Exponential Smoothing, ML-based)
- **Snapshot Operator** — freeze planning version
- **Disaggregation/Aggregation** — across planning levels

## 4. Standard Workflow

```
1. Master Data Load (Product, Location, Customer)
   ↓
2. Historical Data Load (Sales, Shipments, etc.)
   ↓
3. Statistical Forecasting (Demand)
   ↓
4. Demand Review (collaborative editing in Excel)
   ↓
5. Supply Planning (heuristic or optimization)
   ↓
6. S&OP Review (financial alignment)
   ↓
7. Plan Approval → Release to Execution (S/4HANA)
   ↓
8. Response & Order Confirmation
```

## 5. Critical Issues by Module

### Demand
- **Forecast not generating** — check planning operator definition, forecast model assignment, history coverage
- **Outliers skewing forecast** — apply outlier detection (Croston/seasonal)
- **Excel performance** — reduce planning view size, batch refresh

### Supply
- **Heuristic vs Optimizer** — heuristic for speed, optimizer for cost/lead-time tradeoffs
- **Infeasibility** — check capacity constraints, BOM consistency, lead times
- **Supply not propagating** — check source-of-supply configuration

### Inventory
- **Safety stock target unrealistic** — review demand variability inputs, service level targets
- **Multi-echelon misalignment** — check echelon hierarchy in master data

### Response & Supply
- **ATP confirmation slow** — check planning area indexing, network complexity
- **Allocation conflicts** — review priority rules, ATP check group

### Control Tower
- **Alert volume too high** — refine alert thresholds, group by severity
- **KPI staleness** — check data integration frequency

## 6. Integration with S/4HANA

| Direction | Content | Mechanism |
|---|---|---|
| S/4 → IBP | Master data (product, BOM, routings) | CPI Integration Content / CIG |
| S/4 → IBP | Sales orders, deliveries, stock | CPI / OData services |
| IBP → S/4 | Planned independent requirements (PIRs) | CPI / IBP Release to PP |
| IBP → S/4 | Procurement proposals | CPI / IBP Release to MM |

Common integration issues:
- Master data ID mismatch → align via IBP Configuration → External Codes
- Sales history not flowing → check CIG mapping + CPI tenant logs
- PIR release fails → check S/4 planning version, MRP type, period coverage

## 7. Korean Context

- **Demand planning in Korean SMB context** — IBP is enterprise-oriented; mid-size Korean firms may use simpler tools first
- **Sales history with promotion impact** — separate baseline vs. event lifts
- **Chuseok/Lunar New Year** — embed in time-event master for accurate seasonality
- **Multi-plant Korea + overseas subsidiaries** — multi-currency planning, transfer pricing in S&OP

## 8. Best Practices Reference

3-Tier BP framework:
- **Tier 1 Operational**: `references/best-practices/operational.md` (TBD — Phase 1 v2.3)
- **Tier 2 Period-End**: `references/best-practices/period-end.md` (TBD)
- **Tier 3 Governance**: `references/best-practices/governance.md` (TBD)

## 9. SAP Notes & References

- SAP Note 2724649 — IBP Master Data Integration Concept
- SAP Note 3010175 — IBP Cloud Integration Content
- SAP Help: IBP Configuration Guide (Cloud)
- IBP Best Practices on SAP Best Practices Explorer

## 10. Cross-module Routing

When the question touches:
- **Demand vs supply mismatch** → IBP Demand + Supply consultant
- **Sales order behavior** → also `sap-sd-consultant`
- **Production constraints** → also `sap-pp-consultant`
- **Integration issues** → also `sap-integration-cloud-consultant`
- **Cloud BTP env** → also `sap-btp` skill

## 11. Out of Scope

This skill does NOT cover:
- APO (deprecated; use IBP for new projects)
- Detailed production scheduling (PP/DS, EWM, MES)
- Real-time logistics tracking (Yard Logistics, ATTP)
- Non-SAP planning tools (Anaplan, o9, Kinaxis) — IBP-only scope
