<!-- Claude-authored draft (community review welcome) -->

# sap-cloud Quick Guide (English)

> SAP S/4HANA Cloud Public Edition (Cloud PE) — Clean Core enforced, Key User extensibility, quarterly release.

## 🔑 Environment Intake
1. **Cloud PE version** — 2401/2402/2403/2405 (month/year release)
2. **Extension Tier** — Tier 1 (Key User) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
3. **Deployment** — Cloud PE only (on-prem SE38/SE80/SMOD/CMOD forbidden)
4. **Change Control** — Fit-to-Standard phase vs Operations phase

## 📚 Essentials

### Clean Core Principles (non-negotiable)
- No modification of SAP standard code/tables
- No Transport (TMS/tp) → direct upload to Cloud ALM (CSP)
- Extensions only via 3-Tier model

### Key User Extensibility (Tier 1)
- **Custom Fields**: Manage Your Solution → Custom Fields (instant activation)
- **Custom Logic**: ABAP Cloud (RAP) — Key User-friendly entry points
- **Custom CDS Views**: read-only analytics
- **Custom Business Objects**: RAP BO

### Fit-to-Standard
- Adapt to standard process — only gaps become Tier 1/2/3 extensions
- Workshop → scope decision → CBC configuration

### Cloud ALM
- Implementation/operations lifecycle (replaces Solution Manager)
- CSP (Custom Software Package) deployment path

## 🌍 Locale Considerations
- **Quarterly release is mandatory** — no upgrade avoidance; review FSD ahead
- **Localization** — verify e-tax-invoice / country CVI is in Cloud PE standard scope
- **Clean Core education** — shift from custom Z-development to Key User extensibility

## 🚨 Common Issues

### "Standard T-code missing"
- Cause: Cloud PE forbids SE38/SE80/SMOD/CMOD
- Fix: replace with Key User Extensibility (Custom Logic/Fields)

### "Custom breaks after quarterly release"
- Cause: deprecated API usage
- Fix: FSD pre-review + Q-system regression test

## ⚠️ Forbidden
- ❌ Assuming on-prem T-codes (SE38/SE80/SMOD/CMOD/SE16N)
- ❌ Modifying standard objects (Clean Core violation)
- ❌ Attempting to avoid quarterly release

## 📖 Related
- `../../SKILL.md` — full content
- `../img/fit-to-standard.md` / `../img/key-user-extensibility.md`
- `sap-btp` — Tier 2 Side-by-Side
- `sap-s4-migration` — On-Prem → Cloud PE transition
