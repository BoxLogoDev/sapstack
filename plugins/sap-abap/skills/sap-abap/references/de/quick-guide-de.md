<!-- Claude-authored draft (community review welcome) -->

# sap-abap Schnellanleitung (Deutsch)

> Kompakte Referenz für SAP ABAP Entwicklung. Details in `SKILL.md` und `references/clean-core-patterns.md`.

## 🔑 Umgebungsabfrage

1. ABAP-Plattform (ECC-Release / S/4HANA-Releasejahr)
2. HANA-native Entwicklungsumfang (CDS, AMDP, RAP)
3. ATC-Prüfvariante konfiguriert

## 📚 Kernthemen der Entwicklung

### Clean-Core-Prinzip
- Standard-SAP-Objekte niemals direkt modifizieren
- Stattdessen **BAdI** / **Enhancement Point** / **CDS-View-Erweiterung** nutzen
- Access-Key-Nutzung ist ein **Warnsignal** (Audit-Trail)

### HANA-optimiertes SQL
- ❌ `SELECT * FROM ...`
- ✅ Nur benötigte Spalten + `INTO TABLE`
- `FOR ALL ENTRIES` Hinweise:
  - Leere Tabelle vor Nutzung prüfen
  - `SORT ... DELETE ADJACENT DUPLICATES` für Deduplizierung
  - Kleine Lookups → **JOIN** bevorzugen
- **Push-down** — Logik via CDS-View, AMDP an HANA delegieren

### CDS Views
- **@ObjectModel.text.element** — sprachunabhängiger Text
- **@Semantics.amount.currencyCode** — Währungsfeld-Annotation
- **@EndUserText.label** — i18n-Unterstützung

### RAP (RESTful ABAP Programming)
- Business Object → Service Definition → Service Binding
- Behavior Implementation
- Fiori Elements Auto-Generierung

### Performance-Analyse
- **ST05** — SQL-Trace
- **SAT** — Laufzeitanalyse (Nachfolger von SE30)
- **ST22** — Dump-Analyse
- **SM50 / SM66** — Workprozess-Überwachung

## 🇩🇪 Deutsche Lokalisierung

- **GoBD-Konformität** — unveränderbare Belege, 10 Jahre Aufbewahrung
- **DATEV-Schnittstelle** — Buchungsstapel-Export
- **DSGVO** — Personenbezogene Daten nicht in ST22-Dumps oder SLG1-Logs
- **Deutsche Nachrichtenklasse** Übersetzungslücken führen zu MESSAGE_TYPE_X

## ⚠️ Verbotene Praktiken

- ❌ Modifikation von Standard-SAP-Objekten (Clean-Core-Verletzung)
- ❌ SE38-Direktstart im Produktivsystem (außer Whitelisted-Reports)
- ❌ Fehlende `AUTHORITY-CHECK` (SOX/IDW-PS-330-Befund)
- ❌ Benutzereingaben in Dynamic SQL konkatenieren (SQL-Injection)

## 🤖 Code-Review-Delegation
```
/sap-abap-review <Dateipfad oder Objektname>
```
→ `sap-abap-developer` Sub-Agent prüft gegen Clean Core + HANA + ATC

## 📖 Referenzen
- `../clean-core-patterns.md`
- `../code-review-checklist.md`
