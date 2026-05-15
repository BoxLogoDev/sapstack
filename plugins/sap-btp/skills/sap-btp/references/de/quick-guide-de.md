<!-- Claude-authored draft (community review welcome) -->

# sap-btp Schnellanleitung (Deutsch)

> Kompakte Referenz für SAP Business Technology Platform. Details in `SKILL.md` und `references/cap-patterns.md`.

## 🔑 Umgebungsabfrage

1. BTP-Laufzeit (Cloud Foundry / Kyma / ABAP Environment)
2. Region (Latenz-Erwägung)
3. Subscription-Stufe (Free / Trial / Standard / Enterprise)

## 📚 Zentrale Bausteine

### CAP (Cloud Application Programming)
- **cds init** — Projektinitialisierung
- **db/schema.cds** — Datenmodell
- **srv/*.cds** — Service-Definition
- **srv/*.js** — Custom-Logik
- Fiori Elements automatisch generiert

### Fiori / UI5
- **Launchpad** Konfiguration
- **OData V2 / V4** Service-Binding
- i18n via Locale-Resource-Bundles

### Integration Suite
- **iFlow-Design** — Open Connectors, Cloud Integration
- Wichtigste Adapter: HTTP/REST, SFTP, SOAP, OData, IDoc
- **API Management** — Rate Limiting, Policy Enforcement

### Security
- **XSUAA** — OAuth2-Authentifizierung/Autorisierung
- **Destination Service** — Backend-System-Konnektivität
- **Cloud Connector** — On-Premise-Konnektivität

## 🇩🇪 Deutsche Lokalisierung

- **EU-Region (Frankfurt)** — DSGVO-konforme Datenresidenz
- **DSGVO** — Auftragsverarbeitungsverträge (AVV) mit SAP, Pseudonymisierung
- **Schufa / Bonitätsprüfung** — Integration Suite iFlow für externe Dienste
- **Lieferkettensorgfaltspflichtengesetz (LkSG)** — Lieferantendaten in BTP

## 🤖 Entwicklungs-Workflow
1. `cds init` + lokale Modellierung
2. Git Push → Cloud Foundry / Kyma Deploy
3. Fiori Launchpad-Registrierung
4. XSUAA Role-Collection-Mapping

## ⚠️ Hinweise
- **Cloud Foundry Space**-Trennung — Dev/Test/Prod
- **Destination**-Credentials Verschlüsselung aktivieren
- **XSUAA xs-security.json**-Änderungen erfordern Redeploy

## 📖 Referenzen
- `../cap-patterns.md`
- `../btp-security.md`
