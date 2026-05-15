<!-- Claude-authored draft (community review welcome) -->

# sap-gts Schnellanleitung (Deutsch)

> SAP GTS (Global Trade Services) — Import-/Export-Handels-Compliance-Zusammenfassung.

## 🔑 Umgebungsabfrage
1. GTS-Deployment (Standalone / Embedded in S/4)
2. Zoll-E-Clearing-Integration?
3. Transaktionstyp (Export / Import / beides)
4. FTA-Zielländer

## 📚 Kernbereiche

### Compliance
- **SPL Screening** — Sanktionslistenprüfung
- **Embargo Check** — Embargoländer
- **Legal Control** — Genehmigungspflicht

### Customs
- **Exportanmeldung** (Export Declaration)
- **Importanmeldung** (Import Declaration)
- **Transit** — Durchfuhr / Umladung

### Risk
- **L/C Management** — Akkreditiv
- **Preference** — Ursprung / FTA
- **Restitution** — Ausfuhrerstattung

## 🇩🇪 Deutsche Lokalisierung
- **ATLAS** (Automatisiertes Tarif- und Lokales Zoll-Abwicklungssystem — Zoll-E-Clearing)
- **HS-Code / Warennummer** — EZT (Elektronischer Zolltarif)
- **AWV / Exportkontrolle** — Dual-Use, BAFA-Genehmigung
- **EU-FTA-Netzwerk** — Ursprungsnachweis (zahlreiche Abkommen)

## 📋 T-Codes
- `/SAPSLL/*` Namespace
- z. B. `/SAPSLL/MENU_LEGALR3`, `/SAPSLL/COMPLR3`, `/SAPSLL/PRODUCT_R3`

## ⚠️ Hinweise
- CA-Zertifikat (STRUST) Registrierung verpflichtend
- Falscher HS-Code → Zollnachforderung
- Ursprungskriterien je FTA unterschiedlich

## 🤖 Verwandt
- `/plugins/sap-sd` — Export
- `/plugins/sap-mm` — Import
- `/agents/sap-integration-advisor.md` — Zoll-E-Clearing-Integration
