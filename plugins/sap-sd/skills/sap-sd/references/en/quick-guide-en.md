<!-- Claude-authored draft (community review welcome) -->

# sap-sd Quick Guide (English)

## 🔑 Environment Intake
1. Sales org / distribution channel / division (user-provided)
2. Credit management mode (ECC FD32 / S/4 FSCM UKM)
3. Revenue Recognition method

## 📚 Essentials

### Order-to-Cash
- **VA01/VA02**: Sales order
- **VL01N**: Delivery
- **VF01**: Billing
- **VF04**: Billing due list
- **VA05**: Sales order list

### Pricing
- **V/08**: Pricing procedure
- **VK11/VK12**: Condition records
- **VOFM**: Routines (pricing logic)

### Credit Management
- **ECC**: FD32 (credit limit) + VKM1 (order block) + VKM3 (delivery block)
- **S/4 FSCM**: UKM_BP (credit segment) + rule-based check
- **FD33**: Display limit

### Billing
- **VF03**: Display billing doc
- **VF11**: Cancel billing
- Copy Control: **VTFA** (Order→Billing), **VTFL** (Delivery→Billing)

## 🌍 Locale Considerations
- **E-tax invoice issuance** — auto-linked at VF01 posting (DRC or 3rd-party)
- **VAT inclusive/exclusive** mix — B2C inclusive pricing may be legally required
- **Reverse invoicing** (buyer-issued) process — custom if required

## ⚠️ Cautions
- VF01 cancel (VF11) has **strict conditions** — beware conflict with reverse invoicing
- Credit often involves **HQ guarantee** for large enterprises → complex credit segments
