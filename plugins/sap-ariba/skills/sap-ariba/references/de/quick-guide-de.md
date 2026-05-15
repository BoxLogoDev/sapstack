<!-- Claude-authored draft (community review welcome) -->

# sap-ariba Schnellanleitung (Deutsch)

> SAP Ariba — globale Beschaffungs-Cloud. Sourcing · Contracts · Procurement · Network (Lieferantenkollaboration).

## 🔑 Umgebungsabfrage

1. **Ariba-Edition** — Sourcing / Procurement / SLP / Network?
2. **S/4-Integration** — CIG (Cloud Integration Gateway)
3. **Lieferanten-Ökosystem** — Anzahl Ariba-Network-verbundener Lieferanten
4. **Szenario** — Sourcing-Event / Vertrag / PR-to-PO / Network-Messaging

## 📚 Module

| Modul | Verwendung |
|---|---|
| **Sourcing** | Strategischer Einkauf — RFI/RFP/RFQ + e-Auction |
| **Contracts** | Vertragsmgmt — Template·Redline·Verlängerung |
| **Procurement** | Beschaffung — Katalog·PR·PO·Rechnung |
| **SLP** | Lieferanten-Lifecycle — Qualifizierung·Risiko |
| **Spend Analysis** | Ausgabenklassifizierung·Einsparungs-Tracking |
| **Network** | Lieferantenkollaboration — Dokumentenaustausch·Status |

## 🇩🇪 Deutsche Lokalisierung

### Beschaffungsfluss
```
S/4 PR (ME51N) → Ariba Sourcing (strategische Kategorie)
   → RFx versendet → Bieten → Zuschlag
   → Ariba Contract erstellt
   → Katalog registriert → Nutzer kauft
   → S/4 PO (ME21N) → WE/RP → Zahlung
```

### Häufige Muster
- **Lokale Lieferanten**: niedrige Network-Adoption → stufenweises Onboarding
- **Globale Gruppe**: HQ Ariba + Tochtergesellschaften → gemeinsamer Katalog/Vertrag
- **Öffentliche Ausschreibungen**: Behördenportale zuerst (Ariba ist Privatsektor)

### Lokalisierte Integrationsthemen
- **USt**: deutsche Steuerkennzeichen → Ariba Tax Mapping
- **USt-IdNr / Handelsregister**: Custom-Feld im Ariba-Lieferantenstamm
- **Bank/Zahlung**: deutsche Bankleitzahlen → DMEE-Format (SEPA)

## 🚨 Häufige Probleme

### „Lieferant hat RFx nicht erhalten"
- ANID (Ariba Network ID) prüfen — onboardeter Lieferant?
- E-Mail-Zustellung prüfen (Spam-Ordner)
- Network-Verbindung OK (Lieferanten-Login)

### „PR nicht genehmigt"
- Approver Delegation prüfen
- Org-Änderung → Approver nicht auto-aktualisiert

### „PO nicht an Lieferant übertragen"
- Lieferanten-Network-Status (Trading Relationship)
- Übertragungsmethode (Network / Email / cXML)
- Message-Queue (CIG Monitor)

### „Invoice Mismatch"
- 3-Way-Match (PO-WE-Rechnung)
- Steuerkennzeichen-Mapping
- Wechselkurs (Fremdwährungsrechnung)

## 🔧 Integrationsdiagnose

CIG (Cloud Integration Gateway) Fluss:
1. S/4: ERP Integration Add-on for Ariba aktiv
2. CIG Worker (Cloud Connector) GREEN
3. Ariba-Realm-Konfiguration
4. Message-Mapping (Material, Lieferant, PR, PO)

Bei Störung:
- CIG Monitor → Messages → nach Status klassifizieren
- S/4 SLG1 → Application Log → CIG-Namespace
- Ariba Network → Buyer Login → System Updates

## 📚 Referenzen

- `references/sourcing-event-types.md` — RFx-Typen (TBD)
- `references/network-onboarding.md` — Lieferanten-Onboarding (TBD)
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM-Integration
- `../../../sap-fi/skills/sap-fi/SKILL.md` — USt·Zahlung
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CIG/CPI

## ⚠️ Nicht im Umfang

- Nicht-Ariba-Beschaffungssysteme (SRM, Coupa, Jaggaer)
- Detaillierte Bestandsverwaltung (MM)
- Öffentliche Beschaffungsportale
