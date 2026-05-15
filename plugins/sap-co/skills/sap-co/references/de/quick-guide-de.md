<!-- Claude-authored draft (community review welcome) -->

# sap-co Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage
1. SAP-Release (ECC / S/4HANA) — S/4 nutzt standardmäßig Account-based CO-PA
2. Buchungskreis + Kostenrechnungskreis (Controlling Area)
3. Produktkalkulationsmethode (Standard / Actual / Mixed)
4. CO-PA-Typ (Costing-based / Account-based)

## 📚 Modul-Essentials

### CCA (Kostenstellenrechnung)
- **KS01/KS02**: Kostenstelle anlegen/ändern
- **KSU5**: Umlage (Assessment)
- **KSV5**: Verteilung (Distribution)
- Planung: **KP06** (je Kostenart), **KP26** (Leistungsart)

### PCA (Profit-Center-Rechnung)
- **KE51**: Profit Center anlegen
- S/4HANA: PCA in Neues Hauptbuch integriert — kein separates Ledger
- **KE5Z**: PCA-Ist-Einzelposten

### IO (Innenauftrag)
- **KO01**: Innenauftrag anlegen
- **KO88**: Abrechnung (Settlement)
- Real vs Statistical beachten

### CO-PC (Produktkalkulation)
- **CK11N**: Kalkulation anlegen
- **CK24**: Preisfortschreibung (Standardkosten übernehmen)
- **KKS1/KKS2**: Abweichungsanalyse
- **CKMLCP** (S/4): Ist-Kalkulationslauf

### CO-PA (Ergebnisrechnung)
- **KE30**: Bericht ausführen
- S/4HANA: **Account-based CO-PA** ist Standard — nutzt ACDOCA
- ECC: Costing-based CO-PA nutzt separate Tabellen (CE1~CE4)

## 🇩🇪 Deutsche Lokalisierung
- **Controlling + Steuerüberleitung** oft gemeinsam gefordert (Großunternehmen)
- **Standardkostenkalkulation** ist Monatsabschluss-Critical-Path — CK24-Timing wichtig
- **Materialkostenvolatilität**: hohe Rohstoff-FX-Schwankungen → Actual Costing erwägen

## 🤖 Zugehörige Commands
- `/sap-fi-closing` (CO hängt vom FI-Abschluss ab)

## 📖 Referenzen
- `../period-end.md`
