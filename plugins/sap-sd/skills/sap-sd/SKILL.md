---
name: sap-sd
description: >
  This skill handles SAP SD (Sales and Distribution) including sales order processing,
  delivery, billing, pricing, credit management, revenue recognition, and returns.
  Use when user mentions SD, sales order, VA01, VA02, VL01N, VF01, VF04, billing,
  delivery, pricing, condition type, credit check, FD32, revenue recognition, rebate,
  intercompany sales, consignment, returns, RMA, VKOA, output, NACE, account
  determination, copy control, partner function, schedule line, incompletion.
---

## 1. Order-to-Cash Flow

```
Inquiry (VA11) → Quotation (VA21) → Sales Order (VA01)
→ Outbound Delivery (VL01N) → Picking (LT0A / VL02N)
→ Post Goods Issue / PGI (VL02N) → Billing (VF01)
→ FI Document created → Customer Payment
```

---

## 2. Sales Order Issues

**Pricing errors**
- Condition records: VK11 (create) / VK12 (change) → access sequence → condition table
- Pricing procedure determination: OVKK → sales area + doc pricing procedure + customer pricing procedure
- Manual price change: VA02 → Conditions tab → manual entry (if field status allows)
- Pricing analysis: VA02 → Conditions → Analysis (shows why each condition applied / not applied)

**Availability check**
- CO09: availability overview per material / plant / checking rule
- Checking rule: OVZ9 → scope of check (purchase orders / production orders / safety stock)
- Partial delivery: schedule line category → delivery block vs partial confirmation

**Credit check**
- ECC: FD32 → credit limit per credit control area → exposure = open orders + deliveries + billing + FI
- S/4HANA FSCM: UKM_BP → credit segment → scoring + limit → automatic rule-based check
- Release blocked: VKM1 (orders) / VKM3 (deliveries) / VKM4 (deliveries without order)

**Output (forms / messages)**
- NACE → output type → condition records → access sequence
- Output not triggering: check condition record exists for correct sales org / doc type / partner

**Incompletion log**
- V.02 → list incomplete sales orders
- Incompletion procedure: OVAU → mandatory fields per item category / schedule line category

---

## 3. Delivery and Goods Issue

**Delivery creation**
- VL01N: manual delivery → or automatic from VF04 billing due list
- Delivery split: copy control VTLA → split criteria (shipping point / route / delivery date)
- Collective delivery: VL10A (from sales orders) / VL10B (from purchase orders)

**Picking and Transfer Orders**
- LT0A: create transfer order for warehouse picking
- VL02N: confirm transfer order → update picked quantity

**Post Goods Issue (PGI)**
- VL02N → Post Goods Issue button
- PGI errors: stock insufficient (MMBE check) / batch locked / serial number missing
- PGI reversal: VL09 → reverse goods issue (if billing not yet done)

**Batch determination**
- VCH1 → batch search strategy → sort / selection criteria
- CH1 → batch search strategy in delivery

---

## 4. Billing

**Billing due list (VF04)**
- Billing block on order: VA02 → Billing tab → remove block
- Billing block on delivery: VL02N → remove billing block

**Billing types**

| Type | Description | Reference |
|------|-------------|-----------|
| F2 | Standard invoice | Delivery |
| G2 | Credit memo | Credit memo request |
| L2 | Debit memo | Debit memo request |
| F5 | Pro forma (order-based) | Sales order |
| F8 | Pro forma (delivery-based) | Delivery |
| IV | Intercompany invoice | Delivery |
| RE | Returns credit | Return delivery |

**Invoice cancellation**
- VF11 → cancel billing document → creates cancellation document (S1)
- Reversal posts offsetting FI document

**Collective billing**: VF06 → mass billing run → select + process

---

## 5. Pricing

**Condition technique structure**
```
Pricing Procedure
  └── Condition Types (PR00, K007, KF00, etc.)
       └── Access Sequences
            └── Condition Tables (key combinations)
                 └── Condition Records (VK11)
```

**Common condition types**

| Type | Description |
|------|-------------|
| PR00 | Base price |
| K004 | Material discount |
| K005 | Customer/material discount |
| K007 | Customer discount (%) |
| KF00 | Freight surcharge |
| MWST | Output tax |

**Rebate processing**
- VB01: create rebate agreement → conditions → accrual rate
- VB02: manual accrual update
- VB07: rebate settlement (partial / final)
- Rebate must be activated in customer master (billing tab) and sales org config

---

## 6. Credit Management

**ECC Credit Management**
- FD32: credit limit → credit control area → risk category → credit limit amount
- Credit exposure: open order value + open delivery value + open billing + open FI items
- Credit check triggered at: order save / delivery creation / goods issue (configurable per risk cat)

**S/4HANA FSCM Credit Management**
- UKM_BP: credit master per customer → credit segment → scoring rules
- UKM_MY_LIMIT: credit limit workflow and approval
- Rule-based: automatic scoring → automatic limit assignment
- Event-driven: real-time exposure calculation from Universal Journal

**Release workflow**
- VKM1: list of blocked orders → select → release
- VKM3: list of blocked deliveries → release
- Automatic re-check: after release, re-check at next critical step

---

## 7. SD Account Determination (VKOA)

FI document created at billing uses account keys from pricing procedure:

| Account Key | Usage |
|------------|-------|
| ERL | Revenue account (main sales revenue) |
| ERS | Sales deduction / discount |
| ERF | Freight revenue |
| VSE | Sales tax |
| EVV | Cash discount provision |

VKOA: assign G/L accounts per combination of:
Application + Condition type + Account key + Chart of accounts + Sales org + Account assignment group (customer/material)

---

## 8. S/4HANA SD Changes

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| Revenue recognition | VBREVN / VF44 | IFRS 15 POB approach |
| Credit management | FD32 | FSCM / UKM_BP |
| Availability check | CO09 | Same (enhanced with MRP Live) |
| Pricing | Same condition technique | Same + enhanced Fiori apps |
| Billing output | NACE | Output Management (BRF+) |
| SD→FI posting | Same | Direct to ACDOCA |
