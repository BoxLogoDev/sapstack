<!-- Claude-authored draft (community review welcome) -->

# sap-sfsf Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage
1. SuccessFactors-Modul (EC / ECP / Recruiting / LMS / Performance)
2. Rechenzentrum (Region — z. B. APJ/EU/US)
3. ECC/H4S4-Integration (Hybrid / Full Cloud)

## 📚 Essentials

### Employee Central (EC)
- **Admin Center → Manage Employee Files**
- Foundation Objects: Legal Entity, Business Unit, Division, Department
- MDF (Metadata Framework): Custom-Objekt-Erstellung
- Business Rules: deklarative Logik (Workflow-Trigger, Wertberechnung)

### Role-Based Permissions (RBP)
- **Manage Permission Roles**
- **Permission Groups** — dynamische Gruppen (Query-basiert)
- Großunternehmen: hierarchische Genehmigung (CEO→Bereichsleiter→Teamleiter→Mitarbeiter) komplex

### ECP (Employee Central Payroll)
- Führt länderspezifische HR-Payroll-Logik cloud-gehostet aus
- Teilt Codebasis mit H4S4 On-Prem-Payroll

### Recruiting
- Job Requisition Templates
- Application Form Templates
- Candidate Data Model

### Integration
- **Integration Center** — SFSF integriertes Integrationstool
- **SAP Cloud Integration (CPI)** — BTP-basiert
- OData API (Query + Upsert)

## 🇩🇪 Deutsche Lokalisierung
- **Personenbezogene ID** — DSGVO-Prüfung zur Region-DC-Speicherung
- **Sozialversicherung** — nur bei Routing zu ECP berechnet
- **Lokalisierte UI** — SFSF Standard-i18n
- **Lohnsteuerjahresausgleich** — durch ECP oder On-Prem H4S4 (SFSF selbst rechnet nicht)

## ⚠️ Hinweise
- **Admin-Center-Berechtigungsänderungen** — zuerst in Preview-Instance testen
- **Datenmodelländerungen** (XML Import/Export) — Backup verpflichtend
- Lokalisierte Felder — Picklist nutzen (kein Hardcoding)

## 📖 Migrationsleitfaden
Siehe `../migration-path.md`.
