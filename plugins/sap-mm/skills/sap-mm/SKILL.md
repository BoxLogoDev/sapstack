---
name: sap-mm
description: >
  This skill handles SAP MM (Materials Management) including purchase requisitions,
  purchase orders, goods receipts, invoice verification, inventory management,
  GR/IR clearing, material master, vendor evaluation, and period-end closing.
  Use when user mentions MM, purchasing, procurement, MIGO, MIRO, ME21N, ME23N,
  MB52, MR11, GR/IR, material master, inventory, stock, MRP, info record,
  outline agreement, MMPV, account determination, OBYC, movement type,
  physical inventory, batch management, valuation class.
---

## 1. Procurement Cycle

```
PR (ME51N) → RFQ (ME41) → Quotation (ME47) → PO (ME21N)
→ GR (MIGO 101) → IV (MIRO) → Payment (F110)
```

Shortcut flows:
- Without RFQ: PR → PO (ME58 — auto-convert PR to PO)
- Consignment: PO item cat K → GR → settlement (MRKO)
- Subcontracting: PO item cat L → GI components → GR finished

---

## 2. Purchase Order Issues

**Account assignment errors**
- Category K (cost center): cost center must exist and be active
- Category A (asset): asset master must exist, depreciation area active
- Category F (internal order): order must be in Released status
- Category P (project/WBS): WBS element must be open for costs

**Tolerance check (MIRO)**
- OMR6 → tolerance keys: BD (amount) / VP (moving avg price variance) / PP (price)
- Tolerance = percentage + absolute amount — both must be within limits

**GR-based invoice verification**
- PO item → Invoice tab → GR-Based IV flag = X
- With flag: MIRO only possible after GR; invoice quantity = GR quantity

---

## 3. Goods Receipt (MIGO)

### Key Movement Types

| MVT | Description | Notes |
|-----|-------------|-------|
| 101 | GR for purchase order | Standard GR |
| 102 | Return to vendor (reversal of 101) | Requires original GR doc |
| 122 | Return delivery to vendor | With return PO |
| 161 | GR for return PO | For returns with credit |
| 201 | GI to cost center | Free goods issue |
| 261 | GI for production order | Component consumption |
| 301 | Transfer plant to plant (1 step) | Same company code |
| 311 | Transfer storage location to storage location | Same plant |
| 551 | Scrapping | Write-off to loss account |

### Account Determination (OBYC)

- Transaction key BSX: inventory posting (stock G/L account)
- Transaction key WRX: GR/IR clearing account
- Transaction key PRD: price difference account (standard price)
- Transaction key GBB: goods issue / offsetting accounts
- Valuation class (material master → Accounting 1) links material to G/L accounts

---

## 4. Invoice Verification (MIRO)

**Blocking reasons**

| Code | Reason | Release T-code |
|------|--------|----------------|
| R | Manual block | MR02 / MRBR |
| A | Amount exceeds tolerance | MRBR (automatic) |
| D | Date issue | MRBR |
| Q | Quantity variance | MRBR |
| P | Price variance | MRBR |

**Parked invoices**: MIR7 (park) → MIRA (mass release) / MIR4 (display)

**Credit memos**: MIRO → transaction = Credit Memo → reverses original invoice logic

---

## 5. Inventory Management

**Physical inventory process**
1. MI01: create physical inventory document → print count sheet
2. MI04: enter count results (or MI09 if system count differs)
3. MI07: post inventory differences → generates MM document + FI document
4. MI20: list of inventory differences for review

**Key reports**

| T-code | Report |
|--------|--------|
| MMBE | Stock overview (all stock types) |
| MB52 | Warehouse stocks of material |
| MB53 | Plant stock availability |
| MB5B | Stocks for posting date |
| MB51 | Material document list |

---

## 6. Material Master Key Views

| View | Key Fields |
|------|-----------|
| MRP 1 | MRP type, MRP controller, lot size procedure |
| MRP 2 | Planned delivery time, safety stock |
| MRP 3 | Strategy group (make-to-stock vs make-to-order) |
| MRP 4 | BOM explosion, individual/collective requirements |
| Accounting 1 | Valuation class, price control (S/V), standard/moving avg price |
| Purchasing | Purchasing group, info update, GR processing time |
| Plant Data/Stor.1 | Storage conditions, shelf life, batch management |

Extend to new plant: MM01 → select org levels → plant / storage location

---

## 7. MM Period Close

- **MMPV**: close MM posting period — must precede FI period close (OB52)
- **MMRV**: allow posting to previous MM period (emergency use only — document reason)
- Check open GR/IR before closing: MB5S → identify items needing MR11

---

## 8. S/4HANA MM Differences

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| Material document tables | MKPF / MSEG | MATDOC |
| CDS access | SELECT MKPF/MSEG | I_MaterialDocumentItem |
| Stock in transit | Not available | New concept for plant-to-plant |
| Inbound delivery | Optional | Mandatory for some scenarios |
| MRP run | MD01 | MD01N (MRP Live — HANA optimized) |
| Purchase order history | EKBE | I_PurchaseOrderHistory (CDS) |
