<!-- Claude-authored draft (community review welcome) -->

# sap-integration-cloud Schnellanleitung (Deutsch)

> SAP BTP Integrationsplattform — Integration Suite (CPI) + Datasphere + API Management + Event Mesh + Open Connectors.

## 🔑 Umgebungsabfrage

1. **Integrationsumfang** — CPI / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 / SuccessFactors / Ariba / extern?
3. **Protokoll** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **Auth** — OAuth / Basic / Cert / SAML?

## 📚 Kernkomponenten

### Integration Suite
| Komponente | Verwendung |
|---|---|
| **CPI** | Cloud Integration (ex-HCI) — iFlow Message-Routing/-Transformation |
| **API Mgmt** | Gateway · Throttling · Security |
| **Event Mesh** | Pub/Sub-Messaging |
| **Open Connectors** | Nicht-SAP-Pre-Built-Connectors |

### Datasphere
- Früher DWC (Data Warehouse Cloud)
- Space (Isolation) + Local Table + View + Federation
- Data Provisioning Agent für On-Prem-Konnektivität

## 🇩🇪 Deutsche Lokalisierung

### Häufige Muster

#### Behördensystem-Integration
- **E-Rechnung (XRechnung/ZUGFeRD)**: CPI iFlow + CA-Zertifikat
- **Sozialversicherungs-EDI**: SFTP + behördlicher Standard
- **ELSTER-Schnittstelle**: dedizierte API + Auth

#### Bank-Integration
- **MT940-Parsing**: Clearing-Standard + bankspezifische Dialekte
- **Überweisungsdatei**: DMEE SEPA-Format + Bankleitzahlen

#### Interne Integration
- **Zentrale ↔ Tochtergesellschaften**: Multi-Country-Konsolidierung (Datasphere)
- **Legacy-ERP ↔ S/4**: Hybrid während Migration

### Netzwerksegmentierte Umgebungen
- Cloud Connector + DMZ Proxy
- Externe Kommunikation über Security Gateway
- Zertifikate: STRUST (S/4) + BTP Keystore

## 🚨 Häufige Probleme

### „iFlow verarbeitet keine Messages"
- Sender-Adapter-Status (REST·SFTP·OData)
- Polling-Schedule
- Zertifikatablauf
- Message-Format (Schema-Mismatch)
→ Monitor → Messages → nach Status prüfen

### „Mapping-Fehler"
- Source/Target-Schema-Mismatch
- Pflichtfelder fehlen
- Typkonvertierung (String → Integer)
- Groovy-Script-Syntax

### „Out of Memory"
- Großes Payload (10MB+ Einzel-Message)
- Splitter hinzufügen
- Streaming-Modus nutzen

### „Zertifikat abgelaufen"
- Bevorstehende Zertifikate im BTP Keystore identifizieren
- Erneuerung 30 Tage vorher starten
- CA-spezifische Verfahren

### „Cloud Connector verbindet nicht"
- Outbound-443-Firewall
- Region-Endpoint (kr/eu/us)
- Virtual-Host-Mapping (intern vs extern)

## 🔧 Empfohlene Muster

### S/4 → SuccessFactors Sync
1. S/4 ABAP CDS View freigegeben
2. CPI iFlow: S/4 OData → Mapping → SFSF OData
3. SFSF Write API
4. Error → E-Mail/Slack-Alert + Reprocess

### MT940 Bankdatei-Parsing
1. SFTP-Polling (Sender-Adapter)
2. MT940 → XML (Standard-Adapter)
3. Mapping → S/4 FF.5 Input
4. RFC-Call zu S/4

### Datasphere → SAC
1. Analytic Model in Datasphere Space gestalten
2. SAC Live Connection
3. Model in Story konsumieren

## 📚 Referenzen

- `references/iflow-patterns.md` — iFlow-Designmuster (TBD)
- `references/datasphere-modeling.md` — Datasphere-Modellierung (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP-Umgebung
- `../../../sap-sac/skills/sap-sac/SKILL.md` — SAC-Integration
- `../../../sap-sfsf/skills/sap-sfsf/SKILL.md` — SFSF-Integration

## ⚠️ Nicht im Umfang

- BW/4HANA On-Prem Data Warehouse (BW)
- Nicht-SAP-iPaaS (Boomi, MuleSoft, Workato)
- PO/PI (Legacy-SAP-Integration — veraltet; Migration zu CPI)
