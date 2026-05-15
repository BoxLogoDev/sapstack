<!-- Claude-authored draft (community review welcome) -->

# sap-sac Quick Guide (English)

> SAP Analytics Cloud — integrated cloud BI / planning / predictive platform.

## 🔑 Environment Intake

1. **Tenant region** — kr/eu/us/ap?
2. **Edition** — BI / Planning / Smart Predict?
3. **Connection type** — Live (HANA · S4 CDS) vs Import (Datasphere · files)
4. **Data source** — S/4HANA / BW / Datasphere / external DB
5. **Use case** — Story / Analytic App / Planning / Predict

## 📚 Core Concepts

| Item | Meaning |
|---|---|
| Live Connection | Real-time query (no data copy) |
| Import Connection | Periodic load (copy retained) |
| Story | Dashboard (drag & drop) |
| Analytic Application | Scriptable app (JS) |
| Planning Model | Input-enabled · versioned · allocation |
| Predictive Model | Regression · classification · time-series |

## 🌍 Locale Considerations

### Common scenarios
- **Executive dashboard**: KPI cards + drill-down (month/quarter/year)
- **Financial reporting**: Planning Model + S/4 actuals + budget compare
- **Sales analytics**: Geo Map + customer·product matrix
- **Demand forecast**: Smart Predict + IBP integration
- **Public-sector reporting**: data residency / network-segregation, masking

### Localized UI
- Story titles/labels/text may be localized
- Dimension names should stay English (cross-tenant compatibility)
- Date format: regional standard (e.g. YYYY-MM-DD)

## 🚨 Common Issues

### "Story screen is blank"
- Check permission: Story → Sharing → Role
- Check model permission: Modeler permission
- Check filter: members changed?

### "Numbers don't match S/4"
- Live vs Import difference (cache timing)
- Currency/unit conversion
- Fiscal year variant (K4 vs K1)

### "Live connection fails"
- Cloud Connector GREEN
- TLS certificate (STRUST) expiry
- BTP destination config

### "Planning won't save"
- Version state (Public Locked?)
- Dimension Lock setting
- Insufficient write permission

## 🔧 Recommended Patterns

### S/4 → SAC integration
1. S/4: expose Released CDS Views (`I_*`)
2. BTP Cloud Connector setup
3. SAC: Live Connection → Cloud Connector
4. Create Model from CDS View in Story

### Data modeling
- Time Dimension: quarter/month/week/day hierarchy
- Currency/Unit conversion
- Account dimension: sign rule (Income vs Expense)

## 📚 References

- `references/connectivity-guide.md` — connection patterns (TBD)
- `references/planning-best-practices.md` — planning best practices (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP environment
- `../../../sap-cloud/skills/sap-cloud/SKILL.md` — Cloud PE integration

## ⚠️ Out of Scope

- BW dataflow design (BW/4HANA)
- Datasphere modeling (sap-integration-cloud)
- Non-SAC BI tools (Tableau, Power BI)
