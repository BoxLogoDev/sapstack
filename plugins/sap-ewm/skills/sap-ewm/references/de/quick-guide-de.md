<!-- Claude-authored draft (community review welcome) -->

# sap-ewm Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage

Vor SAP-EWM-Arbeit (Enhanced Warehouse Management) klären:

### 1. SAP-Plattform & Deployment
- **S/4HANA On-Premise**: EWM 2020+ empfohlen
- **RISE (Private Cloud)**: volles EWM + Auto-Update
- **Cloud Public Edition**: eingeschränktes EWM (nur Basis)

### 2. EWM-Deployment-Architektur
- **Embedded**: gleiche Instanz wie S/4HANA (klein/mittel)
- **Decentralized**: unabhängige Instanz + RFC (groß, empfohlen > 5.000 Positionen/Tag)

### 3. DC-Größe & Komplexität
- Tagesvolumen (Ein-/Ausgangspositionen)
- Multi-Lagerstrategie (FIFO/LIFO), Cross-Dock, Retourenzentrum
- MM/SD/TM-Integrationstiefe

### 4. Lokale Anforderungen
- **E-Commerce**: Same-/Next-Day → automatisiertes Picking/Sortieren
- **Regulierung**: Lieferadressen-Verschlüsselung, e-Liefernachweis (Carrier-Integration)
- **Betrieb**: Nacht-/24h-Betrieb → Systemstabilität kritisch

## 📚 Wichtige T-Codes & Rollen

### Monitoring
| T-Code | Funktion |
|--------|------|
| **/SCWM/MON** | Integriertes Monitoring-Dashboard |
| **/SCWM/ACT** | Aktivitätsanzeige |
| **/SCWM/AREA** | Zone- & Bin-Status |

### Eingang
| T-Code | Funktion |
|--------|------|
| **/SCWM/GOODS_IN** | Wareneingang |
| **/SCWM/PUT_AWAY** | Einlagerungsanweisung |
| **/SCWM/PUTAWAY_MON** | Einlagerungs-Monitoring |

Ablauf: MM PO → EWM → /SCWM/GOODS_IN Inbound Delivery → Scan + QC → /SCWM/PUT_AWAY Auto-Bin → RF-Bestätigung.

### Ausgang
| T-Code | Funktion |
|--------|------|
| **/SCWM/WAVE** | Wellenplanung & -ausführung |
| **/SCWM/PICK** | Kommissionierung |
| **/SCWM/PACK** | Packen & Label |
| **/SCWM/SHIP** | Versandbestätigung |

Ablauf: SD SO → EWM → /SCWM/WAVE Gruppierung → /SCWM/PICK (Barcode) → /SCWM/PACK Kartonvorschlag → /SCWM/SHIP Carrier-Liefernachweis.

### RF / Mobil
| T-Code | Funktion |
|--------|------|
| **/SCWM/RFUI** | RF-Terminal Basis |
| **/SCWM/RFUI_WAVE** | RF-Kommissionierung (Welle) |
| **/SCWM/MOBILE** | Mobile App (Fiori) |

### Abrechnung / Schnittstelle
| T-Code | Funktion |
|--------|------|
| **/SCWM/PI** | Physical Interface (Liefernachweis) |
| **/SCWM/TM_INTERFACE** | Transport-Management-Anbindung |
| **/SCWM/CONF** | Lieferbestätigung + FI-Buchung |

## 🇩🇪 Deutsche Lokalisierung

### Online-Fulfillment-Center Tagesbetrieb
- Vormittag (06-12): Eingangsfokus — /SCWM/GOODS_IN + /SCWM/PUT_AWAY (Ziel: Eingang→Bin < 2h)
- Mittag (12-17): Picking-Fokus — /SCWM/WAVE in 3-4 Wellen, parallel /SCWM/PICK + /SCWM/PACK (300-500 Pos/h)
- Abend (17-22): Carrier-Abholung — /SCWM/SHIP + /SCWM/PI (Liefernachweis-API → Kundentracking)

### Automatisierungs-Integration
- Sorter: /SCWM/PACK Sorter-Ausgangsanweisung
- AS/RS: /SCWM/PUT_AWAY Auto-Bin-Zuweisung

### Retourenzentrum
- /SCWM/GOODS_IN (separater Retouren-Zone-Bin) → QC → Wiederausgabe oder Verschrottung
- Hohe E-Commerce-Retourenquote → dedizierte Verfolgung essenziell

### Adress-Datenschutz (DSGVO)
- Lieferadresse verschlüsseln; Picking-Team sieht nur Liefernachweis-Nummer
- Adressen nach Aufbewahrungsfrist löschen

## ⚠️ Embedded vs Decentralized

| | Embedded | Decentralized |
|---|---|---|
| Vorteil | einfach, kostengünstig | hoher Durchsatz, unabhängig, skalierbar |
| Nachteil | hohe Systemlast, begrenzte Skalierung | komplexe Konfig, RFC-Management |
| Empfehlung | DC < 2.000 Pos/Tag | DC > 5.000 Pos/Tag |

Referenzarchitektur: S/4HANA (Core) → RFC/OData → EWM (Decentralized) → API/EDI → TM → Sorter/RF/Carrier-System.

## Häufige Probleme

| Symptom | Ursache | Diagnose | Fix |
|---------|--------|----------|-----|
| Picking-Verzögerung (Wellenstau) | Bin-Mangel/Item-Platzierung | /SCWM/MON | Put-away optimieren (FIFO) |
| Liefernachweis nicht verknüpft | /SCWM/PI Fehler/Carrier-API | /SCWM/PI-Log | Carrier-API prüfen |
| RF-Fehler (Ware nicht gefunden) | Scan-Daten-Mismatch | RF-Log | Barcode prüfen |
| Bestandsdifferenz | unbestätigter WE/WA | /SCWM/MON | Cycle Count |
| Performance-Degradation | Volumen > Kapazität | /SCWM/MON Perf-Tab | Wellengröße/Scaling |

## 📊 KPI
- Eingangsdurchsatz (100-200/h)
- Picking-Genauigkeit (/SCWM/PICK Fehler < 0,5%)
- Lieferzeit (Auftrag → Liefernachweis < 30 Min)
- Bestandsgenauigkeit (> 99,5%)
- Systemverfügbarkeit (99,9% SLA)

## Prozessflüsse (Process Flows)

Inbound:
```
MM PO → EWM Auto-Transfer
/SCWM/GOODS_IN: Inbound Delivery registrieren
Scan + QC → bei Abweichung Retourenanweisung
/SCWM/PUT_AWAY: Auto-Bin-Zuweisung → RF-Bestätigung
```

Outbound:
```
SD SO → EWM Auto-Transfer
/SCWM/WAVE: in 3-4 Wellen gruppieren
/SCWM/PICK: Kommissionierung (Barcode) → RF-Scan-Bestätigung
/SCWM/PACK Kartonvorschlag → /SCWM/SHIP Carrier-Liefernachweis
```

RF-Arbeit:
```
1. Login → Arbeitstyp wählen (GOODS_IN/PICK/PACK)
2. Produkt-Barcode scannen oder Ort eingeben
3. System vergleicht Sollmenge → bestätigen oder warnen
4. Bestätigen: RF-Taste → sofortige Server-Aktualisierung
```

Tagesbetrieb:
```
06-12 Eingang: /SCWM/GOODS_IN + /SCWM/PUT_AWAY
12-17 Picking: /SCWM/WAVE + /SCWM/PICK + /SCWM/PACK
17-22 Versand: /SCWM/SHIP + /SCWM/PI Carrier-Abholung
```

Referenzarchitektur:
```
S/4HANA (Core) → RFC/OData
  → EWM (Decentralized) → API/EDI
  → TM → Sorter / RF / Carrier-System
```

Retouren:
```
Kundenretoure → /SCWM/GOODS_IN (Retouren-Zone-Bin)
QC → gut: Wiederausgabe / Defekt: Verschrottung/Rücksendung
In /SCWM/MON verfolgen; Adresse nach Frist löschen
```

## Verwandt
- `../../SKILL.md` — vollständiger EWM-Leitfaden
- `references/img/ewm-configuration.md` — IMG-Setup
- `docs/enterprise/ewm-operations-korea.md` — Betriebsleitfaden
