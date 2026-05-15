<!-- Claude-authored draft (community review welcome) -->

# sap-cloud Schnellanleitung (Deutsch)

> SAP S/4HANA Cloud Public Edition (Cloud PE) — Clean Core erzwungen, Key-User-Erweiterbarkeit, Quartalsrelease.

## 🔑 Umgebungsabfrage
1. **Cloud-PE-Version** — 2401/2402/2403/2405 (Monat/Jahr-Release)
2. **Extension Tier** — Tier 1 (Key User) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
3. **Deployment** — nur Cloud PE (On-Prem SE38/SE80/SMOD/CMOD verboten)
4. **Change Control** — Fit-to-Standard-Phase vs Operations-Phase

## 📚 Essentials

### Clean-Core-Prinzipien (nicht verhandelbar)
- Keine Modifikation von SAP-Standardcode/-Tabellen
- Kein Transport (TMS/tp) → Direkt-Upload zu Cloud ALM (CSP)
- Erweiterungen nur via 3-Tier-Modell

### Key User Extensibility (Tier 1)
- **Custom Fields**: Manage Your Solution → Custom Fields (sofort aktiv)
- **Custom Logic**: ABAP Cloud (RAP) — Key-User-freundliche Einstiegspunkte
- **Custom CDS Views**: Read-Only-Analytik
- **Custom Business Objects**: RAP BO

### Fit-to-Standard
- An Standardprozess anpassen — nur Gaps werden Tier 1/2/3
- Workshop → Scope-Entscheidung → CBC-Konfiguration

### Cloud ALM
- Implementierungs-/Betriebs-Lifecycle (ersetzt Solution Manager)
- CSP (Custom Software Package) Deployment-Pfad

## 🇩🇪 Deutsche Lokalisierung
- **Quartalsrelease ist verpflichtend** — keine Upgrade-Vermeidung; FSD vorab prüfen
- **Lokalisierung** — E-Rechnung / Länder-CVI im Cloud-PE-Standardscope prüfen
- **Clean-Core-Schulung** — von Custom-Z-Entwicklung zu Key-User-Erweiterbarkeit

## 🚨 Häufige Probleme

### „Standard-T-Code fehlt"
- Ursache: Cloud PE verbietet SE38/SE80/SMOD/CMOD
- Fix: durch Key User Extensibility ersetzen (Custom Logic/Fields)

### „Custom bricht nach Quartalsrelease"
- Ursache: Nutzung deprecierter APIs
- Fix: FSD-Vorabprüfung + Q-System-Regressionstest

## ⚠️ Verboten
- ❌ On-Prem-T-Codes annehmen (SE38/SE80/SMOD/CMOD/SE16N)
- ❌ Standardobjekte modifizieren (Clean-Core-Verstoß)
- ❌ Versuch, Quartalsrelease zu umgehen

## 📖 Verwandt
- `../../SKILL.md` — vollständiger Inhalt
- `../img/fit-to-standard.md` / `../img/key-user-extensibility.md`
- `sap-btp` — Tier 2 Side-by-Side
- `sap-s4-migration` — On-Prem → Cloud-PE-Übergang
