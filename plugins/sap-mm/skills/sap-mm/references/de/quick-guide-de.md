<!-- Claude-authored draft (community review welcome) -->

# sap-mm Schnellanleitung (Deutsch)

> SAP MM (Materialwirtschaft) — Beschaffung, Bestand, Rechnungsprüfung, WE/RE.

## 🔑 Umgebungsabfrage

1. SAP-Release (ECC EhPx / S/4HANA 19xx-23xx)
2. Bereitstellung (on-premise / RISE / Cloud PE)
3. Beschaffungsart (Dienstleistung / indirekt / direkt / Lohnbearbeitung / Konsignation)
4. Werk / Buchungskreis (Nutzer gibt an)
5. Fehlermeldung + T-code

## 📚 Kernbereiche

### Bestellanforderung (BANF)
- **ME51N / ME52N / ME53N** — Anlegen / Ändern / Anzeigen
- Kontierung: Kostenstelle (K), Auftrag (F), Anlage (A), Projekt (P)
- Freigabestrategie: OMGS (Customizing), CL30 (Freigabegruppe/Strategie)

### Bestellung (PO)
- **ME21N / ME22N / ME23N** — Anlegen / Ändern / Anzeigen
- PO-Typen: NB (Standard), FO (Rahmenvertrag), UB (Umlagerung), RA (Retoure)
- Output (Druck/Mail): ME9F → manuell, NACE (Customizing)

### Wareneingang (WE)
- **MIGO** — Bewegungsart 101 (WE), 102 (Storno), 161 (Retoure)
- Anlieferung (mit EWM): VL31N → VL32N → MIGO
- Bestandsarten: frei verwendbar, Qualität (Q), gesperrt (S)

### Rechnungsprüfung (RE)
- **MIRO** — Rechnungseingang (3-Wege-Abgleich: PO/WE/RE)
- Toleranzen: OMR6 (pro Buchungskreis)
- Sperre: Zahlungssperre auf Position → freigeben MRBR

### Stammdaten
- **MM01/MM02/MM03** — Materialstamm
- **XK01/XK02/XK03** — Lieferantenstamm (ECC)
- **BP** — Business Partner (S/4 vereinheitlicht)
- **ME11/ME12/ME13** — Infosatz

## 🚨 Häufige Probleme

### "MIGO Buchung schlägt fehl — M7-Fehler"
- Periode geschlossen (MMRV / MMPV)
- Buchungssperre auf Material (MM02 → Werksdaten)
- Kontenfindung fehlt (OBYC)
- Sonderbestand (E/Q/K) Anforderungen

### "MIRO 3-Wege-Abgleich fehlgeschlagen"
- Mengentoleranz überschritten — OMR6
- Preistoleranz überschritten — OMR6
- Steuerkennzeichen PO ≠ Rechnung — manuell korrigieren
- GR-basiertes IV Flag nicht übereinstimmend

### "MMBE Bestand falsch"
- Querprüfung: MB52 (pro Material/Werk), MB5B (Periodenbestand), MB51 (Bewegungsliste)
- Reservierung (MD04) blockiert Bestand?
- Qualitätsbestand (MB52 → Bestandsart Q) übersehen?

## 🔧 Wichtige T-codes

| Bereich | T-code |
|---|---|
| BANF | ME51N/52N/53N, ME54N (Freigabe) |
| PO | ME21N/22N/23N, ME9F (Output) |
| WE | MIGO (101/102/161), MB51 (Liste) |
| RE | MIRO, MRBR (Sperre lösen) |
| Bestand | MMBE, MB52, MB5B, MB5T (in Transit) |
| Stamm | MM01/02/03, XK01/02/03 (ECC), BP (S/4) |
| Infosatz | ME11/12/13 |
| Bezugsquellenliste | ME01 |
| Rahmenvertrag | ME31K (Kontrakt), ME31L (Lieferplan) |

## ECC vs S/4HANA

- **Lieferant**: XK → BP (Business Partner vereinheitlicht)
- **Material**: MM01-03 gleich, MARA-Struktur vereinfacht
- **EWM-Integration**: tiefer in S/4 (embedded EWM)
- **Zentrales Sourcing**: nur in S/4

## 🇩🇪 Deutsche Lokalisierung

- **USt (Umsatzsteuer)**: 19% Normal, 7% reduziert — FTXP-Konfiguration
- **GoBD**: ordnungsgemäße Buchführung — Stammdaten- und Bewegungs-Aufbewahrung 10 Jahre
- **DSGVO**: Personenbezogene Lieferantendaten (Einzelunternehmer) maskieren
- **Intrastat**: EU-Binnenhandelsmeldung — Zollkonfiguration
- **VOB (Vergabe- und Vertragsordnung für Bauleistungen)**: für Bau-Beschaffung
- **SEPA**: Lastschrift-/Überweisungsformat über DMEE

## ⚠️ Außerhalb des Bereichs

- Verkauf (SD verwenden)
- Lagerinterne Bewegungen (WM/EWM)
- Strategischer Einkauf / RFx (Ariba verwenden)
- Produktionsmaterialien (PP verwenden)

## 📚 Verweise

- `references/img/account-determination.md` — OBYC-Konfiguration
- `../../../sap-fi/skills/sap-fi/SKILL.md` — Rechnungsbuchungsintegration
- `../../../sap-ariba/skills/sap-ariba/SKILL.md` — strategischer Einkauf
