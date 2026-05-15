<!-- Claude-authored draft (community review welcome) -->

# sap-bc Schnellanleitung (Deutsch)

> Lokaler BC-Berater-Kontext. Globale Basis-Themen → siehe `sap-basis`.

## 🔑 Umgebungsabfrage (lokaler Kontext zuerst)
1. Deployment: On-Prem / RISE / netzwerksegmentiert (geschlossenes Netz)
2. Lokalisierung: länderspezifisches CVI / E-Rechnung / e-Document
3. DB: HANA (Locale-Einstellungen) / Oracle (NLS_LANG)
4. SAPGUI-Sprache: lokal / EN / gemischt

## 🇩🇪 Deutsche BC-Themen — Top 10

### 1. Codepage-Dump (CONVT_CODEPAGE)
- Symptom: `CONVT_CODEPAGE` ABAP-Dump
- Ursache: Unicode-Konvertierungsfehler (Legacy Non-Unicode)
- Fix: SNOTE-2452523-Serie, korrektes `NLS_LANG` (`*.AL32UTF8`)

### 2. STMS-Import-Fehler 8 (Multibyte-Kurztext)
- Ursache: Multibyte-Objektnamen brechen tp-Parser
- Log: `/usr/sap/trans/log/ULOG`, `ALOG`
- Fix: tp-Versions-Upgrade, Unicode-tp-Konvertierung

### 3. E-Rechnung-Integration (STRUST)
- **Nationale CA-Zertifikate** registrieren
- Root-CA: länderspezifische Zertifizierungsstellen
- **TLS 1.2+ erforderlich** (lokale Sicherheitsrichtlinie/BSI)
- Web Dispatcher `ssl/ciphersuites` härten

### 4. Kernel-Upgrade in segmentiertem Netz
1. Download vom SAP Launchpad im externen Netz
2. SHA256-Hash-Prüfung
3. Freigabe Informationssicherheitsteam
4. Verschlüsselter USB-Transfer
5. Internes `/usr/sap/<SID>/SYS/exe/` ersetzen

### 5. SAPGUI-Zeichensalat
- SAPGUI 770+ Patch
- Windows „Sprache für Nicht-Unicode-Programme"
- `NLSPATH` prüfen

### 6. SOX/IDW-PS-330-Berechtigungs-Rezertifizierung
- Quartalsweises PFCG-Rollen-Review-Audit
- SUIM / S_BCE_68001398
- SoD-Matrix-Management (FI/MM)

### 7. Lokaler SAP-Support (OSS)
- Bei lokalem SAP-Support (Landessprache) eröffnen
- Lokalisierungsthemen über lokales Support-Team
- Priority Very High (Produktion down) → 24/7

### 8. HANA-Locale
- Passende `COLLATION`
- CDS `@Semantics.text.languageCode`
- SAPGUI- vs Fiori-Rendering-Unterschiede

### 9. ChaRM-Workflow
- Urgent → Normal Change braucht IKS-Dokument
- Genehmigungspfad auf lokales Org-Chart gemappt
- Wochenend-/Feiertags-Auto-Approve-Bypass-Policy

### 10. Lokale SaaS-Integration
- Länderspezifische Buchhaltungs-SaaS (z. B. DATEV) — viele Legacy-Connectors
- Firewall/IP-Whitelist je Kunden-Sicherheitsrichtlinie
- SMICM-Log bei Proxy prüfen

## 📚 Häufige T-Codes
| T-Code | Verwendung |
|--------|------|
| STRUST | SSL-Zertifikatsverwaltung |
| SMICM | ICM (HTTP) Monitor |
| STMS | Transportverwaltung |
| PFCG | Rollenverwaltung |
| SUIM | Berechtigungsinformationssystem |
| SU53 | Berechtigungsfehler-Trace |
| SM59 | RFC-Destination |
| SM21 | Systemprotokoll |
| ST22 | Dump-Analyse |
| RZ20 | CCMS (Monitoring) |

## ⚠️ Verboten
- ❌ Produktive SE16N-Direktbearbeitung (SOX-Verstoß)
- ❌ STMS Forced Import (tp -i ignore)
- ❌ CA-Zertifikat als OS-Datei speichern (STRUST nutzen)
- ❌ Kernel-Upgrade ohne Backup + Neustart-Test

## 📖 Verwandt
- `../../SKILL.md` — vollständiger Inhalt
- `sap-basis` — globale Basis-Themen
- `sap-s4-migration` — Kernel/Unicode-Konvertierung
