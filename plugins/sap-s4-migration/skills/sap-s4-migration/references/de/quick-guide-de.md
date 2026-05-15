<!-- Claude-authored draft (community review welcome) -->

# sap-s4-migration Schnellanleitung (Deutsch)

> Kompakte Referenz für ECC → S/4HANA Migration. Details in `SKILL.md` und `references/simplification-items.md`.

## 🔑 Umgebungsabfrage

1. Aktuelle ECC-Version (EhP) + DB + Unicode-Status
2. Ziel-S/4HANA-Release (2022/2023/2024)
3. Deployment-Modell (On-Prem / RISE / Cloud PE)
4. Länderspezifische Lokalisierungsabhängigkeit

## 🛣 Drei Migrationspfade

| Pfad | Beschreibung | Beste Eignung |
|------|--------------|---------------|
| **Brownfield (System Conversion)** | In-place-Konvertierung des Bestandssystems | Großunternehmen mit Prozesserhalt |
| **Greenfield (Neuimplementierung)** | Neubau + Datenmigration | Mittelstand mit Prozessneugestaltung |
| **Selective (Selective Data Transition)** | Selektive Migration nach Org/Periode/Funktion | Multi-Tochter mit Stufenrollout |

## ⚠️ Hauptrisiken

### Brownfield
- Massive Custom-Code-Anpassung (ACDOCA-Konvertierung)
- Z-Programme mit direkter BSEG-Referenz → Migration auf ACDOCA Pflicht
- Länderspezifische CVI-Validierung

### Greenfield
- Datenmigrationsumfang und -strategie
- Stammdatenbereinigung (schlechtere Qualität = schwierigere Migration)
- Entscheidungsgeschwindigkeit für Prozessneugestaltung

### Selective
- Komplexität der Scope-Definition
- Konsistenzprüfung im Zwischenzustand

## 📚 Wichtige Werkzeuge

- **Readiness Check**: `/SDF/RC_START_CHECK` — automatische Simplification-Item-Analyse
- **SUM (Software Update Manager)**: primäres Brownfield-Tool
- **DMO (Database Migration Option)**: DB + SW kombinierte Konvertierung
- **SUMCT**: Unicode-Konvertierung (ECC non-Unicode → Unicode)
- **SAP Note Analyzer**: Note-Impact-Analyse für Zielrelease

## 🇩🇪 Deutsche Lokalisierungsrisiken

- **GoBD-Konformität** — Belegunveränderbarkeit, 10-Jahre-Aufbewahrung erneut prüfen
- **DE CVI Simplification Item** — Umsatzsteuer-Kontenstruktur-Änderungen
- **Country Version Germany Note** — DE-spezifische Lokalisierungs-Notes
- **DATEV-Schnittstelle** — Buchungsstapel-Format nach Migration revalidieren
- **DSGVO** — Datenklassifizierung bei Selective Transition kritisch

## ⚠️ Pflichtschritte
1. **Readiness Check** ausführen (AS-IS-Impact)
2. **Custom Code ATC** ausführen (`S4HANA_READINESS` Variante)
3. **Dual-Cutover-Simulation** — mindestens 2 Zyklen
4. **Business UAT** — STG-Umgebung empfohlen

## 🤖 Zugehörige Agents / Commands
- `agents/sap-s4-migration-advisor.md`
- `/sap-s4-readiness --auto`

## 📖 Referenzen
- `../simplification-items.md`
- `../atc-readiness-check.md`
