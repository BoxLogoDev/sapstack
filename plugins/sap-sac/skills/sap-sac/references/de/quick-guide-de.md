<!-- Claude-authored draft (community review welcome) -->

# sap-sac Schnellanleitung (Deutsch)

> SAP Analytics Cloud — integrierte Cloud-BI-/Planungs-/Prognoseplattform.

## 🔑 Umgebungsabfrage

1. **Tenant-Region** — kr/eu/us/ap?
2. **Edition** — BI / Planning / Smart Predict?
3. **Verbindungstyp** — Live (HANA · S4 CDS) vs Import (Datasphere · Dateien)
4. **Datenquelle** — S/4HANA / BW / Datasphere / externe DB
5. **Anwendungsfall** — Story / Analytic App / Planning / Predict

## 📚 Kernkonzepte

| Element | Bedeutung |
|---|---|
| Live Connection | Echtzeit-Query (keine Datenkopie) |
| Import Connection | Periodisches Laden (Kopie gehalten) |
| Story | Dashboard (Drag & Drop) |
| Analytic Application | Skriptfähige App (JS) |
| Planning Model | Eingabefähig · versioniert · Verteilung |
| Predictive Model | Regression · Klassifikation · Zeitreihe |

## 🇩🇪 Deutsche Lokalisierung

### Häufige Szenarien
- **Executive-Dashboard**: KPI-Karten + Drill-down (Monat/Quartal/Jahr)
- **Finanzberichterstattung**: Planning Model + S/4-Ist + Budgetvergleich
- **Vertriebsanalyse**: Geo Map + Kunden-/Produktmatrix
- **Bedarfsprognose**: Smart Predict + IBP-Integration
- **Behördenberichte**: Datenresidenz/Netzwerktrennung (DSGVO), Maskierung

### Lokalisierte UI
- Story-Titel/Labels/Text lokalisierbar
- Dimensionsnamen besser Englisch (Cross-Tenant-Kompatibilität)
- Datumsformat: regionaler Standard (z. B. TT.MM.JJJJ / YYYY-MM-DD)

## 🚨 Häufige Probleme

### „Story-Bildschirm leer"
- Berechtigung prüfen: Story → Sharing → Role
- Modellberechtigung: Modeler permission
- Filter prüfen: Member geändert?

### „Zahlen stimmen nicht mit S/4"
- Live vs Import Unterschied (Cache-Zeitpunkt)
- Währungs-/Einheitenumrechnung
- Geschäftsjahresvariante (K4 vs K1)

### „Live-Verbindung schlägt fehl"
- Cloud Connector GREEN
- TLS-Zertifikat (STRUST) Ablauf
- BTP-Destination-Konfiguration

### „Planning speichert nicht"
- Versionsstatus (Public Locked?)
- Dimension-Lock-Einstellung
- Unzureichende Schreibberechtigung

## 🔧 Empfohlene Muster

### S/4 → SAC Integration
1. S/4: Released CDS Views freigeben (`I_*`)
2. BTP Cloud Connector einrichten
3. SAC: Live Connection → Cloud Connector
4. Model aus CDS View in Story erstellen

### Datenmodellierung
- Time Dimension: Quartal/Monat/Woche/Tag-Hierarchie
- Währungs-/Einheitenumrechnung
- Account-Dimension: Vorzeichenregel (Income vs Expense)

## 📚 Referenzen

- `references/connectivity-guide.md` — Verbindungsmuster (TBD)
- `references/planning-best-practices.md` — Planning Best Practices (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP-Umgebung
- `../../../sap-cloud/skills/sap-cloud/SKILL.md` — Cloud-PE-Integration

## ⚠️ Nicht im Umfang

- BW-Datenfluss-Design (BW/4HANA)
- Datasphere-Modellierung (sap-integration-cloud)
- Nicht-SAC-BI-Tools (Tableau, Power BI)
