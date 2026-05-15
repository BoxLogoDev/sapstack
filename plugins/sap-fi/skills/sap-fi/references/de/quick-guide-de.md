<!-- Claude-authored draft (community review welcome) -->

# sap-fi Schnellanleitung (Deutsch)

> SAP FI (Finanzbuchhaltung) Kurzreferenz. Vollständige Details in `SKILL.md` und `references/closing-checklist.md`.

## 🔑 Umgebungsabfrage

1. SAP-Release (ECC 6.0 EhPx / S/4HANA 19xx-23xx)
2. Bereitstellung (on-premise / RISE / Cloud PE)
3. Geschäftsjahres-Variante (K4 Kalenderjahr oder benutzerdefiniert)
4. Buchungskreis (Nutzer gibt an — niemals annehmen)
5. Fehlermeldungsnummer + T-code wo aufgetreten

## 📚 Kernmodule

### AP — Kreditorenbuchhaltung
- **FB60 / MIRO** Belegbuchungsfehler:
  - Steuerkennzeichen nicht zugewiesen → **FTXP** prüfen
  - Toleranz überschritten → **OMR6** Limit pro Buchungskreis
  - GR-basierte Rechnungsprüfung Abweichung → PO-Position Invoice-Tab vs Wareneingang
- **F110** Zahlungslauf:
  - Zahlweg fehlt (LFB1-ZWELS)
  - Hausbank nicht ermittelt → **FBZP**
  - DME-Datei nicht generiert → **DMEE** Baum pro Zahlweg
- Quellensteuer (erweitert) — **WTAD** + SPRO-Zuweisung

### AR — Debitorenbuchhaltung
- **FD32** (ECC) / **UKM_BP** (S/4 FSCM): Kreditmanagement
- **F150** Mahnung → **FBMP** Mahnverfahren
- **VKM1 / VKM3**: Kreditgesperrte Aufträge / Lieferungen freigeben
- Anzahlung: **F-37** (Anforderung), **F-29** (Buchung), **F-39** (Ausgleich)

### GL — Hauptbuchhaltung
- Feldstatuskonflikt — drei Quellen: **OBC4** (Belegart) + **OB14** (Buchungsschlüssel) + **FS00** (Sachkonto)
- Fremdwährungsbewertung — **FAGL_FC_VAL** (immer erst Testlauf)
- Automatischer Ausgleich — **F.13** (Testlauf zuerst)
- Saldovortrag — **F.16** (ECC) / **FAGLGVTR** (Neues HB)

### AA — Anlagenbuchhaltung
- Abschreibungslauf — **AFAB**
- Anlagentransfer — **ABUMN**
- Jahresabschluss — **AJAB**

## 🚨 Häufige Probleme

### "FB01 kann nicht auf Kreditor-Abstimmkonto buchen"
- Ursache: LFB1-AKONT ist ein Abstimmkonto
- Lösung: **FB60** (Kreditorenrechnung) oder Sonder-HB (F-47/F-48) verwenden. FB01 kann nicht direkt auf Abstimmkonten buchen.

### "F110 wählt nichts aus"
- Kreditor ohne Zahlweg (XK03 → LFB1.ZWELS leer)
- Posten noch nicht fällig — Fälligkeitsdatum prüfen
- Buchungskreis nicht aktiv im Zahlungslauf

### "Steuerkennzeichen-Konflikt bei MIRO"
- Steuerkennzeichen für Buchung deaktiviert (FTXP)
- Buchungskreisspezifisches Steuerverfahren geändert
- Storno + Neueingabe mit korrektem Kennzeichen

### "Periode geschlossen — Buchung nicht möglich"
- OB52 → Berechtigungsgruppe anpassen (Vorperiode nicht leichtfertig öffnen)
- Saldovortrag-Status prüfen (F.16 / FAGLGVTR)

## 🔧 Wichtige T-codes Übersicht

| Bereich | T-code |
|---|---|
| Belege buchen | FB01, FB50, FB60, FB70 |
| Belege anzeigen | FB03 |
| HB Einzelposten | FBL3N, FAGLB03 (Saldo) |
| Kreditoren-Einzelposten | FBL1N |
| Debitoren-Einzelposten | FBL5N |
| Zahlung | F110, F-58 |
| Abschluss | F.05, F.13, F.16, FAGL_FC_VAL, FAGLGVTR |
| Periode | OB52 |
| Customizing | FBZP, FBMP, FTXP, OMR6, OBYC |
| Abstimmung | F.50 |

## ECC vs S/4HANA Highlights

- **HB**: BSEG/BKPF → ACDOCA (Universal Journal in S/4)
- **AR-Kredit**: FD32 → UKM_BP (FSCM)
- **AA**: klassische AA → Neue Anlagenbuchhaltung (in S/4 Pflicht)
- **Bank**: FI12 → BAM (Bank Account Management)

## 🇩🇪 Deutsche Lokalisierung

- **GoBD**: Grundsätze ordnungsmäßiger Buchführung — CDPOS/CDHDR-Aufbewahrung 10 Jahre
- **SEPA**: SEPA-Lastschrift / -Überweisung — DMEE-Format
- **DATEV**: Schnittstelle für Steuerberater (DATEV-Exportformat)
- **VAT**: Umsatzsteuer-Meldepflicht monatlich/quartalsweise
- **eIDAS**: Elektronische Signatur für Rechnungen (Verordnung 910/2014)
- **E-Bilanz**: Elektronische Bilanz-Übermittlung an Finanzbehörde
- **DSGVO**: Personenbezogene Daten — Stammdatenmaskierung wo nötig

## ⚠️ Außerhalb des Bereichs

- Verkaufsrechnung (SD verwenden)
- Kostenstellenrechnung (CO verwenden)
- Produktionskostenverfolgung (CO + PP)
- Treasury (TR-Plugin)

## 📚 Verweise

- `closing-checklist.md` — Monats-/Quartals-/Jahresabschluss-Checkliste
- `tcode-reference.md` — Vollständige T-code-Liste
- `../../../sap-co/skills/sap-co/SKILL.md` — Kostenrechnungsintegration
- `../../../sap-tr/skills/sap-tr/SKILL.md` — Treasury-Integration
