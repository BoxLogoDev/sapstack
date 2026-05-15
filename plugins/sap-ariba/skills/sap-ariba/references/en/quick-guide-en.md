<!-- Claude-authored draft (community review welcome) -->

# sap-ariba Quick Guide (English)

> SAP Ariba — global procurement cloud. Sourcing · Contracts · Procurement · Network (supplier collaboration).

## 🔑 Environment Intake

1. **Ariba edition** — Sourcing / Procurement / SLP / Network?
2. **S/4 integration** — CIG (Cloud Integration Gateway)
3. **Supplier ecosystem** — number of Ariba Network-connected suppliers
4. **Scenario** — sourcing event / contract / PR-to-PO / Network messaging

## 📚 Modules

| Module | Use |
|---|---|
| **Sourcing** | Strategic sourcing — RFI/RFP/RFQ + e-Auction |
| **Contracts** | Contract mgmt — template·redline·renewal |
| **Procurement** | Buying — catalog·PR·PO·invoice |
| **SLP** | Supplier lifecycle — qualification·risk |
| **Spend Analysis** | Spend classification·savings tracking |
| **Network** | Supplier collaboration — document exchange·status |

## 🌍 Locale Considerations

### Procurement flow
```
S/4 PR (ME51N) → Ariba sourcing (strategic category)
   → RFx sent → bidding → award
   → Ariba Contract created
   → catalog registered → user buys
   → S/4 PO (ME21N) → GR/IV → payment
```

### Common patterns
- **Local suppliers**: low Network adoption → phased onboarding
- **Global group**: HQ Ariba + subsidiaries → shared catalog/contract
- **Public tenders**: government portals first (Ariba is private-sector)

### Localized integration concerns
- **VAT**: local tax codes → Ariba tax mapping
- **Business registration number**: custom field in Ariba supplier master
- **Bank/payment**: local bank codes → DMEE country format

## 🚨 Common Issues

### "Supplier didn't receive RFx"
- Check ANID (Ariba Network ID) — onboarded supplier?
- Check email delivery (spam folder)
- Network connection OK (supplier-side login)

### "PR not approved"
- Check approver delegation
- Org change → approver not auto-refreshed

### "PO not transmitted to supplier"
- Supplier Network status (Trading Relationship)
- Transmission method (Network / Email / cXML)
- Message queue (CIG monitor)

### "Invoice mismatch"
- 3-way match (PO-GR-Invoice)
- Tax code mapping
- Exchange rate (foreign-currency invoice)

## 🔧 Integration Diagnosis

CIG (Cloud Integration Gateway) flow:
1. S/4: ERP Integration Add-on for Ariba active
2. CIG Worker (Cloud Connector) GREEN
3. Ariba Realm config
4. Message mapping (Material, Vendor, PR, PO)

When broken:
- CIG monitor → Messages → classify by status
- S/4 SLG1 → Application Log → CIG namespace
- Ariba Network → Buyer login → System Updates

## 📚 References

- `references/sourcing-event-types.md` — RFx types (TBD)
- `references/network-onboarding.md` — supplier onboarding (TBD)
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM integration
- `../../../sap-fi/skills/sap-fi/SKILL.md` — VAT·payment
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CIG/CPI

## ⚠️ Out of Scope

- Non-Ariba procurement systems (SRM, Coupa, Jaggaer)
- Detailed inventory management (MM)
- Public-sector procurement portals
