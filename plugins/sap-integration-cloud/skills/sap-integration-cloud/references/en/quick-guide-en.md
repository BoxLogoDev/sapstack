<!-- Claude-authored draft (community review welcome) -->

# sap-integration-cloud Quick Guide (English)

> SAP BTP integration platform — Integration Suite (CPI) + Datasphere + API Management + Event Mesh + Open Connectors.

## 🔑 Environment Intake

1. **Integration scope** — CPI / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 / SuccessFactors / Ariba / external?
3. **Protocol** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **Auth** — OAuth / Basic / Cert / SAML?

## 📚 Core Components

### Integration Suite
| Component | Use |
|---|---|
| **CPI** | Cloud Integration (ex-HCI) — iFlow message routing/transform |
| **API Mgmt** | Gateway · throttling · security |
| **Event Mesh** | pub/sub messaging |
| **Open Connectors** | Non-SAP pre-built connectors |

### Datasphere
- Formerly DWC (Data Warehouse Cloud)
- Space (isolation) + Local Table + View + Federation
- Data Provisioning Agent for on-prem connectivity

## 🌍 Locale Considerations

### Common patterns

#### Government system integration
- **E-tax invoice**: CPI iFlow + local CA certificate
- **Statutory EDI (social insurance)**: SFTP + government standard
- **Tax authority portal**: dedicated API + auth

#### Bank integration
- **MT940 parsing**: clearing-house standard + bank-specific dialects
- **Transfer file generation**: DMEE country format + bank codes

#### Internal integration
- **HQ ↔ subsidiaries**: multi-country data consolidation (Datasphere)
- **Legacy ERP ↔ S/4**: hybrid during migration

### Network-segregated environments
- Cloud Connector + DMZ Proxy
- External comms via security gateway
- Certificates: STRUST (S/4) + BTP Keystore

## 🚨 Common Issues

### "iFlow not processing messages"
- Sender adapter status (REST·SFTP·OData)
- Polling schedule
- Certificate expiry
- Message format (schema mismatch)
→ Monitor → Messages → check by status

### "Mapping error"
- Source/Target schema mismatch
- Missing mandatory fields
- Type conversion (String → Integer)
- Groovy script syntax

### "Out of memory"
- Large payload (10MB+ single message)
- Add Splitter
- Use streaming mode

### "Certificate expired"
- Identify imminent certs in BTP Keystore
- Start renewal 30 days ahead
- Local CA-specific procedures

### "Cloud Connector won't connect"
- Outbound 443 firewall
- Region endpoint (kr/eu/us)
- Virtual Host mapping (internal vs external)

## 🔧 Recommended Patterns

### S/4 → SuccessFactors sync
1. S/4 ABAP CDS view exposed
2. CPI iFlow: S/4 OData → mapping → SFSF OData
3. SFSF write API
4. Error → email/Slack alert + Reprocess

### MT940 bank file parsing
1. SFTP polling (Sender adapter)
2. MT940 → XML (Standard adapter)
3. Mapping → S/4 FF.5 input
4. RFC call to S/4

### Datasphere → SAC
1. Design analytic model in Datasphere Space
2. SAC Live Connection
3. Consume model in Story

## 📚 References

- `references/iflow-patterns.md` — iFlow design patterns (TBD)
- `references/datasphere-modeling.md` — Datasphere modeling (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP environment
- `../../../sap-sac/skills/sap-sac/SKILL.md` — SAC integration
- `../../../sap-sfsf/skills/sap-sfsf/SKILL.md` — SFSF integration

## ⚠️ Out of Scope

- BW/4HANA on-prem data warehouse (BW)
- Non-SAP iPaaS (Boomi, MuleSoft, Workato)
- PO/PI (legacy SAP integration — deprecated; migrate to CPI)
