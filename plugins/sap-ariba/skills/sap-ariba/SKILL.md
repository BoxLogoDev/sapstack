---
name: sap-ariba
description: >
  This skill handles all SAP Ariba tasks including Sourcing (RFx, e-Auction),
  Contracts, Procurement (catalog, requisition, PR-to-PO), Supplier Lifecycle &
  Performance (SLP), Spend Analysis, Network (supplier collaboration), Buying &
  Invoicing, Guided Buying, integration with S/4HANA (CIG / Ariba Network
  Adapter), supplier onboarding, sourcing event creation, contract authoring,
  catalog management, Ariba Network IDs (ANID). Use whenever the user mentions
  Ariba, sourcing, RFx, e-auction, supplier lifecycle, Ariba Network, spend
  analysis, contract authoring, guided buying, ANID, or any Ariba module.
allowed-tools: Read, Grep, Glob
---

# sap-ariba — Ariba Sourcing, Procurement, and Network

## 1. Environment Intake Checklist

1. **Ariba edition** — Strategic Sourcing / Procurement / SLP / Ariba Network?
2. **S/4 integration** — Direct (CIG via Cloud Integration) or via ERP-Ariba mapping?
3. **Supplier ecosystem** — Ariba Network connected suppliers count?
4. **Industry/region** — Manufacturing, public sector, retail; KR/JP/US?
5. **Specific scenario** — Sourcing event, contract renewal, PR-to-PO, supplier issue?

## 2. Module Coverage

| Module | Purpose | Key Actions |
|---|---|---|
| **Sourcing** | RFI/RFP/RFQ + e-Auction | event creation, supplier invite, scoring |
| **Contracts** | Authoring & lifecycle | template, redlining, renewal |
| **Procurement / Buying** | Catalog, PR, PO, invoice | guided buying, PR approval |
| **SLP** | Supplier qualification | onboarding, risk assessment |
| **Spend Analysis** | Spend visibility | classification, savings tracking |
| **Network** | Supplier collaboration | document exchange, status |

## 3. Standard Procurement Flow

```
1. Demand Identification (in S/4 or directly in Ariba)
   ↓
2. Sourcing (if strategic) — RFx/e-Auction
   ↓
3. Contract creation (Ariba Contracts)
   ↓
4. Catalog enablement (Ariba Network)
   ↓
5. Purchase Requisition (Ariba Buying or S/4 ME51N)
   ↓
6. Approval workflow (configured)
   ↓
7. Purchase Order creation (S/4 ME21N or Ariba)
   ↓
8. PO transmission to supplier (Ariba Network)
   ↓
9. Goods Receipt (S/4 MIGO)
   ↓
10. Invoice processing (Ariba Invoicing or S/4 MIRO)
   ↓
11. Payment (S/4 F110)
```

## 4. Integration with S/4HANA

| Direction | Object | Mechanism |
|---|---|---|
| S/4 → Ariba | Materials, vendors (master) | CIG (Cloud Integration Gateway) |
| S/4 → Ariba | Cost centers, GL accounts | CIG |
| Ariba → S/4 | Approved PRs | CIG |
| Ariba → S/4 | POs (if created in Ariba) | CIG |
| Supplier → Ariba | Invoice (Network) | Ariba Network |
| Ariba → S/4 | Invoices (via Invoicing) | CIG |

Common integration issues:
- **Master data mapping** — material/vendor ID mismatch
- **CIG channel down** — check CIG Worker (Cloud Connector)
- **Invoice posting fail** — tax code mapping, vendor account group

## 5. Critical Operational Issues

### Sourcing
- "Event invitation not received" — supplier ANID validation, Network registration
- "Bid won't submit" — internet, supplier role, event status
- "e-Auction conflict" — event configuration, time zones

### Contracts
- "Workflow not advancing" — check approver assignment, role
- "Redline merge fail" — template incompatible

### Procurement
- "PR approval stuck" — check delegation, approver role
- "PO transmission fail" — supplier Network status, transmission method
- "Invoice mismatch" — 3-way match (PO-GR-Invoice) discrepancy

### Supplier Lifecycle
- "Supplier qualification not complete" — assessment questionnaire pending
- "Risk score not updating" — external risk feed connection

## 6. Korean Context

- **Ariba Network 한국 supplier base** — 글로벌 대비 적음. 한국 자회사 → 글로벌 시너지 위해 Ariba 도입
- **한국 조달법 (국가계약법)**: 공공기관은 KISTI g2b 우선; 민간 → Ariba
- **부가세 처리**: 한국 부가세 코드 Ariba mapping 필요
- **언어**: Ariba UI 한국어 일부 지원 (Sourcing/Buying)
- **결제**: 한국 은행 코드 → DMEE Korea 매핑

## 7. Cross-module Routing

- Procurement workflow → also `sap-mm-consultant`
- Invoice/tax → also `sap-fi-consultant`
- Network connectivity → `sap-integration-cloud`
- Cloud env → `sap-btp`

## 8. SAP Notes & References

- SAP Note 2745996 — Ariba CIG Connectivity
- Ariba Network: https://network.ariba.com
- Ariba Help: https://help.sap.com/docs/ARIBA

## 9. Out of Scope

- Detailed inventory management (use MM)
- Production sourcing tied to PP (use PP + Ariba sourcing combination)
- Non-Ariba procurement systems (SRM, Coupa, Jaggaer)
