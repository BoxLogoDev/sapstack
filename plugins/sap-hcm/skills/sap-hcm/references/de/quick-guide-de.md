<!-- Claude-authored draft (community review welcome) -->

# sap-hcm Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage
1. HCM-Deployment (ECC HCM / H4S4 / SuccessFactors-Hybrid)
2. Länder-Payroll-Version
3. FI-Posting-Integration?

## 📚 Essentials

### Personaladministration
- **PA30**: Infotypen pflegen
- **PA40**: Personalmaßnahmen (Einstellung/Austritt/Beförderung)
- Wichtige Infotypen:
  - 0001 (Org-Zuordnung), 0002 (Personaldaten), 0006 (Anschrift)
  - 0008 (Grundbezüge), 0014 (wiederk. Abzug), 0015 (einmalig)

### Zeitwirtschaft
- **PT60**: Zeitauswertung
- **PT01**: Arbeitszeitplanregel
- **CAT2**: Zeiterfassung

### Payroll (länderspezifisch)
- **PC00_M{cc}_CALC**: Abrechnung
- **PC00_M{cc}_CDTA**: Zahlungsdaten-Erstellung
- **PC00_M{cc}_CEDT**: Entgeltnachweis
- Steuermeldung: länderspezifischer Lohnsteuer-Treiber

### FI Posting
- **PC00_M99_CIPE**: Payroll → FI-Buchung

## 🇩🇪 Deutsche Lokalisierung
- **Personenbezogene Daten** maskieren (DSGVO)
- **Sozialversicherung** (Renten-/Kranken-/Arbeitslosen-/Unfallversicherung) Auto-Berechnung
- **Lohnsteuerjahresausgleich / ELStAM** — deutscher Payroll-Standardprozess
- **Lohnsteuertabellen** nach Finanzverwaltungs-Zeitplan aktualisiert
- **Betriebliche Altersvorsorge** (bAV — DB/DC) Handhabung
- **DEÜV / SV-Meldungen** elektronisch

## ⚠️ Hinweise
- Personaldatenzugriff streng über **PFCG P_ORGIN** Berechtigungsobjekt
- **Keine produktiven Payroll-Änderungen** — strikt Dev → QA → Prod Transport
- Jahresabschluss-Saison → auf gleichzeitige Nutzerlastspitze vorbereiten
