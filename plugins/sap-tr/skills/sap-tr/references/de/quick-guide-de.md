<!-- Claude-authored draft (community review welcome) -->

# sap-tr Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage
1. SAP-Release + TRM (Treasury Risk Management) aktiv?
2. Transaktionswährungen (EUR/USD/JPY ...)
3. Bank-Interface-Methode (MT940 / H2H / SaaS)

## 📚 Essentials

### Cash Management
- **FF7A**: Finanzstatus / Liquiditätsposition
- **FF7B**: Liquiditätsvorschau
- **FLQDB / FLQITEM**: Liquidity-Item-Stammdaten
- Kontoauszug-Upload: **FF_5**, **FEBAN**

### Payment
- **F110**: Zahllauf (gemeinsam mit FI)
- **DMEE**: Zahlträgerformat (bankspezifisch, SEPA)
- **FI12 / BAM (S/4)**: Hausbankverwaltung

### Bank-Integration
- Große Banken haben oft **proprietäre Firmenbanking-Formate**
- Häufig **XML/EDI (camt/pain — SEPA)** statt MT940
- Clearing-Standards (z. B. EBICS) beachten
- Lastschrift, virtuelle Konten oft kundenspezifisch

### TRM (optional)
- **FTR_CREATE**: Finanzgeschäft anlegen
- Derivate (Devisentermin, IRS, CRS) buchhalterisch komplex — IFRS-Offenlegung

## 🇩🇪 Deutsche Lokalisierung
- **EUR-Liquiditätsvorschau** ist häufigster Use Case
- Externe Kursfeeds (EZB-Referenzkurs/Marktkurs) in vielen Projekten
- **AWV-Meldung (Außenwirtschaft)**: Meldepflicht grenzüberschreitender Zahlungen ab Schwelle

## ⚠️ Hinweise
- Produktive Hausbankänderung erfordert Transport + Simulation
- MT940-Testumgebung verpflichtend — kein produktiver First-Try
