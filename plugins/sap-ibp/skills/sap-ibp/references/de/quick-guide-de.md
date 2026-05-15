<!-- Claude-authored draft (community review welcome) -->

# sap-ibp Schnellanleitung (Deutsch)

> SAP IBP (Integrated Business Planning) — cloud-native Bedarfs-/Versorgungsplanung für die S/4-Ära. APO-Nachfolger.

## 🔑 Umgebungsabfrage

1. **IBP-Release** — quartalsweise (2402 / 2308 / 2305 usw.)
2. **Deployment** — nur BTP SaaS (kein On-Premise)
3. **Module** — Demand / S&OP / Supply / Inventory / Response / Control Tower
4. **Integration** — S/4HANA → CPI Integration Content, oder BW
5. **Excel-UI-Version** — IBP Excel Add-In auf der Planer-Workstation
6. **Planning Area** — Standard (SAP7, SAPIBP1) oder kundeneigen

## 📚 Modulübersicht

| Modul | Zweck |
|---|---|
| **Demand** | Statistische Prognose · Demand Sensing (DS) |
| **S&OP** | Sales & Operations — Bedarf/Versorgung/Finanzen integriert |
| **Supply** | Mehrstufige Lieferkette (Heuristik/Optimizer) |
| **Inventory** | Sicherheitsbestand · Nachbestelloptimierung |
| **Response & Supply** | ATP · Zuteilung · Gating |
| **Control Tower** | KPI · Anomalieerkennung |

## 🇩🇪 Deutsche Lokalisierung

### Bedarfsprognose-Muster
- **Feiertage/saisonale Peaks**: im Time Event Master registrieren
- **Kurze Haltbarkeit**: Lebensmittel/Kosmetik/Halbleiter → kurzer Horizont
- **EOL/NPI**: explizite Product-Lifecycle-Modellierung
- **Promotion-Trennung**: Baseline vs Event-Lift

### Mehrwerk-Betrieb
- Zentrale + Tochtergesellschaften → Multi-Country-Modell
- **Währung**: EUR + USD globale Umrechnung
- **Verrechnungspreise**: in S&OP integriert (Transfer Pricing)

### Häufige Szenarien
- „Neue Modelleinführung → Komponentenlieferanten früh informieren (PIR-Freigabe)"
- „Rohstoffimport-Abhängigkeit → FX-Szenarioanalyse"
- „Kürzere Lieferzeit → Bestand vs Response-Balance"

## 🔧 Wichtige UI / T-Codes

IBP ist BTP SaaS — keine SAP-GUI-T-Codes. Stattdessen:

| UI | Verwendung |
|---|---|
| **IBP Web UI** | Stammdaten · Konfiguration · Ausführung |
| **IBP Excel Add-In** | Tagesplanung (Planer) |
| **IBP App (Fiori)** | Mobile KPI |
| **SAP Cloud ALM** | Monitoring |

Integrationsseitige S/4-T-Codes:
- **MD01N/MD02** — MRP (nach PIR-Empfang)
- **CO40/CO41** — Fertigungsauftragsumsetzung (PIR → Production Order)
- **VOFM/VFX3** — Kundenaufträge (Response & Supply Ergebnisse)

## 🚨 Häufige Probleme

### „Prognose wird nicht erzeugt"
- Ursache: fehlende Operator-Definition, unzureichende Historie, Stammdaten-Mapping-Fehler
- Diagnose:
  1. Planning Area Configuration → Forecast Model
  2. Planning-Run-Log (Application Job Monitor)
  3. Stammdaten-Mapping (Product, Location)

### „Excel-UI ist langsam"
- Ursache: Planning View zu groß, zu viele gleichzeitige Nutzer
- Lösung:
  1. Planning View verkleinern (≤ 10K Zellen)
  2. Batch-Refresh nutzen
  3. Views je Modul aufteilen

### „CPI-Integration schlägt fehl"
- Ursache: Message-Mapping-Fehler, ID-Mismatch nach S/4-Stammdatenänderung
- Diagnose: CPI Tenant → Monitor → Messages → Fehler klassifizieren
- Lösung: IBP Configuration → External Codes neu zuordnen

## 🔄 Zusammenspiel mit PP

S/4 PP führt den von IBP erstellten Plan aus:
- **PIR (Planned Independent Requirement)** — Bedarf → an S/4 PP freigegeben
- **MRP-Lauf (MD01N)** — Materialplanung aus PIR
- **Fertigungsauftragsumsetzung** — CO40/CO41

Bei Störung nachverfolgen, welche Stufe fehlschlug:
1. IBP → PIR-Freigabe OK? (IBP Application Job)
2. S/4 → PIR sichtbar in MD63?
3. S/4 MRP-Lauf-Ergebnis?

## 📚 Referenzen

- `references/forecast-models.md` — Statistikmodell-Vergleich (TBD)
- `references/cpi-integration.md` — CPI-Message-Mapping (TBD)
- `../../../sap-pp/skills/sap-pp/SKILL.md` — PP-Integration
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CPI-Leitfaden

## ⚠️ Nicht im Umfang

- Kurzfrist-Produktionsfeinplanung (PP/DS, MES)
- Nicht-SAP-Tools (Anaplan, o9, Kinaxis)
- APO-Betrieb (veraltet; APO-Nutzer siehe IBP-Migrationsleitfaden)
