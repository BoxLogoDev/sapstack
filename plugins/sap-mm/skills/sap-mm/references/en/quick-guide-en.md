<!-- Claude-authored draft (community review welcome) -->

# sap-mm Quick Guide (English)

> SAP MM (Materials Management) — Procurement, Inventory, Invoice Verification, GR/IR.

## 🔑 Environment Intake

1. SAP release (ECC EhPx / S/4HANA 19xx-23xx)
2. Deployment (on-premise / RISE / Cloud PE)
3. Procurement type (services, indirect, direct, subcontracting, consignment)
4. Plant / company code (user provides)
5. Error message + T-code

## 📚 Core Areas

### Purchase Requisition
- **ME51N / ME52N / ME53N** — Create / Change / Display PR
- Account Assignment: cost center (K), order (F), asset (A), project (P)
- Release strategy: T-code OMGS (config), CL30 (release group/strategy)

### Purchase Order
- **ME21N / ME22N / ME23N** — Create / Change / Display PO
- PO types: NB (standard), FO (framework), UB (stock transfer), RA (return)
- Output (print/email): ME9F → manual output, NACE (config)

### Goods Receipt
- **MIGO** — Movement type 101 (GR), 102 (reverse), 161 (return)
- Inbound delivery (with EWM): VL31N → VL32N → MIGO
- Stock types: Unrestricted (free), Quality (Q), Blocked (S)

### Invoice Verification
- **MIRO** — Invoice receipt (3-way match: PO/GR/Invoice)
- Tolerance: OMR6 (per company code)
- Block: payment block on header → release MRBR

### Master Data
- **MM01/MM02/MM03** — Material Master
- **XK01/XK02/XK03** — Vendor Master (ECC)
- **BP** — Business Partner (S/4 unified)
- **ME11/ME12/ME13** — Info Record

## 🚨 Common Issues

### "MIGO posting fails — M7 error"
- Period closed (MMRV / MMPV)
- Posting block on material (MM02 → Plant data)
- Account determination missing (OBYC)
- Special stock (E/Q/K) requirements

### "MIRO 3-way match fail"
- Quantity tolerance exceeded — OMR6
- Price tolerance exceeded — OMR6
- Tax code on PO ≠ Invoice — manually correct
- GR-based IV flag mismatch

### "MMBE stock incorrect"
- Cross-check: MB52 (per material/plant), MB5B (period stock), MB51 (movement list)
- Reservation (MD04) blocking stock?
- Quality stock (MB52 → stock type Q) overlooked?

## 🔧 Key T-codes

| Area | T-code |
|---|---|
| PR | ME51N/52N/53N, ME54N (release) |
| PO | ME21N/22N/23N, ME9F (output) |
| GR | MIGO (101/102/161), MB51 (list) |
| IV | MIRO, MRBR (block release) |
| Stock | MMBE, MB52, MB5B, MB5T (in-transit) |
| Master | MM01/02/03, XK01/02/03 (ECC), BP (S/4) |
| Info | ME11/12/13 |
| Source list | ME01 |
| Outline agreement | ME31K (contract), ME31L (scheduling) |

## ECC vs S/4HANA

- **Vendor**: XK → BP (Business Partner unified)
- **Material**: same MM01-03 but MARA structure simplified
- **EWM integration**: deeper in S/4 (embedded EWM)
- **Centralized Sourcing**: S/4 only

## 🌐 Common Localization Notes

- Tax codes per country (see country/{iso}.md for specifics)
- E-invoice mandatory in many regions (KR/VN/MX/IT/BR) — config via DMEE
- Customs integration for cross-border (use sap-gts where needed)

## ⚠️ Out of Scope

- Sales (use SD)
- Warehouse internal movements (WM/EWM)
- Strategic sourcing / RFx (use Ariba)
- Production materials issue (use PP)

## 📚 References

- `references/img/account-determination.md` — OBYC config
- `../../../sap-fi/skills/sap-fi/SKILL.md` — invoice posting integration
- `../../../sap-ariba/skills/sap-ariba/SKILL.md` — strategic sourcing
