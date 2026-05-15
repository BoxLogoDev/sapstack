<!-- Claude-authored draft (community review welcome) -->

# sap-basis Schnellanleitung (Deutsch)

> Globale Basis-Themen. Regionsspezifische BC-Themen → siehe `sap-bc` Plugin.

## 🔑 Umgebungsabfrage
1. SAP-Release (ECC EhP / S/4HANA)
2. DB (HANA / Oracle / DB2 / MSSQL)
3. OS (Linux SLES/RHEL / Windows / AIX)

## 📚 Essentials

### Systemadministration
- **SM50/SM66**: Workprozess
- **ST22**: ABAP-Laufzeitfehler (Dump)
- **SM21**: Systemprotokoll
- **SM12**: Sperrtabelle
- **SM13**: Verbuchungsaufträge

### Transport Management
- **STMS**: Transport Management System
- **SE09/SE10**: Transport Organizer
- **tp**-Befehl (OS-Ebene)

### Performance
- **ST05**: SQL-Trace
- **SAT**: Laufzeitanalyse
- **ST06**: OS-Ressourcen
- **ST02**: Memory (Buffer)

### Security / Berechtigung
- **SU01/SU10**: Benutzerverwaltung
- **PFCG**: Rollenverwaltung
- **SUIM**: Berechtigungsinformationssystem
- **SU53**: Letzter Berechtigungsfehler

### Job Management
- **SM36**: Jobdefinition
- **SM37**: Jobmonitor

### RFC / Integration
- **SM59**: RFC-Destination
- **SMQR/SMQS**: qRFC-Monitor
- **BD54**: Logisches System

## 🇩🇪 Deutsche Lokalisierung
Regionsspezifische Themen — Netzwerktrennung, Unicode-Handling, E-Rechnung STRUST, SOX/IDW-PS-330-Berechtigung — siehe `sap-bc` Plugin `SKILL.md`. `sap-basis` liefert die globale Baseline; `sap-bc` ergänzt lokalen Kontext.

## ⚠️ Verboten
- ❌ Direkte SE16N-Datenänderung im Produktivsystem
- ❌ STMS Forced Push (tp Forced Import)
- ❌ SAP-Kernel-Upgrade ohne Backup
- ❌ PRD-Mandant 405 (SCC4-Schutz aufgehoben)

## 📖 Zugehörige Plugins
- `sap-bc` — lokale BC-Berater-Tiefe
- `sap-s4-migration` — Kernel/DB-Upgrade-Planung
- `sap-abap` — ABAP-Dump-Tiefenanalyse
