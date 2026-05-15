<!-- Claude-authored draft (community review welcome) -->

# sap-btp Quick Guide (English)

> Concise reference for SAP Business Technology Platform. Full details in `SKILL.md` and `references/cap-patterns.md`.

## 🔑 Environment Intake

1. BTP runtime (Cloud Foundry / Kyma / ABAP Environment)
2. Region (latency consideration)
3. Subscription tier (Free / Trial / Standard / Enterprise)

## 📚 Core Building Blocks

### CAP (Cloud Application Programming)
- **cds init** — initialize project
- **db/schema.cds** — data model
- **srv/*.cds** — service definition
- **srv/*.js** — custom logic
- Fiori Elements auto-generated

### Fiori / UI5
- **Launchpad** configuration
- **OData V2 / V4** service binding
- i18n via locale resource bundles

### Integration Suite
- **iFlow design** — Open Connectors, Cloud Integration
- Major adapters: HTTP/REST, SFTP, SOAP, OData, IDoc
- **API Management** — rate limiting, policy enforcement

### Security
- **XSUAA** — OAuth2 authentication/authorization
- **Destination Service** — backend system connectivity
- **Cloud Connector** — on-premise connectivity

## 🌍 Locale Considerations
- **Regional latency** — choose region closest to user base
- **Data residency** — Private Cloud or local region required in some jurisdictions
- **Local IdP integration** — XSUAA custom IdP for regional SSO providers
- **Local payment gateway** — Integration Suite iFlow for regional PGs

## 🤖 Development Workflow
1. `cds init` + local modeling
2. Git push → Cloud Foundry / Kyma deploy
3. Fiori Launchpad registration
4. XSUAA role-collection mapping

## ⚠️ Cautions
- **Cloud Foundry Space** separation — Dev/Test/Prod
- **Destination** credential storage requires encryption enabled
- **XSUAA xs-security.json** changes require redeploy

## 📖 References
- `../cap-patterns.md`
- `../btp-security.md`
