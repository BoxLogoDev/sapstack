<!-- Claude-authored draft (community review welcome) -->

# sap-wm Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage

Vor SAP-WM-Arbeit (Warehouse Management) klären:

### 1. SAP-Release & Support
- **ECC 6.0**: WM voll unterstützt
- **S/4HANA**: WM ist **veraltet** — Zwangsumstieg auf EWM

### 2. WM-Konfigurationsmodus
- **Standard WM**: einfache Lagerung, kleines DC
- **Lean WM**: erweiterte Funktionen, großes DC

### 3. Barcode/RF-Setup
- RF-Terminal-Nutzung
- Barcodedrucker & Label-Policy
- Mobilfunk-Abhängigkeit

### 4. Logistikumgebung
- **E-Commerce-Versand**: B2C hohes Tagesvolumen
- **B2B-Distribution**: Massen-WE/WA
- **Retourenzentrum**: Retouren + Qualitätsprüfung

## 📚 Wichtige T-Codes & Rollen

### Wareneingang (Inbound)
| T-Code | Funktion |
|--------|------|
| **LT01** | Wareneingang (Goods Receipt) |
| **LT04** | WE-Status |
| **LT03** | WE storno/korrektur |

Ablauf: PO-Referenz → Menge/Scan → Bin-Vorschlag → Bestätigen (sofortige Bestandsaktualisierung).

### Lagerung (Storage)
| T-Code | Funktion |
|--------|------|
| **LS01N** | Bestandsübersicht |
| **LS01** | Bestand je Bin |

LS01N: Echtzeit-Bestand je Bin, Schadbestandsverfolgung, Slow-Moving-Warnung.

### Warenausgang (Outbound)
| T-Code | Funktion |
|--------|------|
| **LB01** | Kommissionierliste anlegen |
| **LI01N** | Warenausgang (Goods Issue) |
| **LI04** | WA-Status |

Ablauf: SO-Referenz → LB01 Kommissionierauftrag (Barcode) → kommissionieren + Scan-Bestätigung → LI01N finaler WA → FI-Bestandsabbau.

## 🇩🇪 Deutsche Lokalisierung

### Online-DC-Tagesbetrieb
- Tagesvolumen: große Fulfillment-Center
- Vormittag WE (LT01) + Kommissionier-Vorbereitung (LB01) → Nachmittag Kommissionierung + WA (LI01N) → Abend Carrier-Abholung + Abschluss

### Barcode/RF-Betrieb
- Barcode-Label Auto-Druck bei WE → an Bin anbringen
- RF-Terminal: Lager-Team Echtzeit-Kommissionier-/WA-Scan
- Netzwerkzuverlässigkeit: schwache WiFi-Zonen ggf. Offline-Modus

### Retourenabwicklung
- Prozess: Kundenretoure → WE → Qualitätsprüfung → Wiederausgabe oder Verschrottung
- Separate Retouren-Zone-Bins, in LS01N verfolgt
- Hohe E-Commerce-Retourenquote → effiziente WM-Abwicklung essenziell

## ⚠️ WM vs EWM & Umstellung

| Element | WM (ECC) | EWM (S/4HANA) |
|---------|---------|--------------|
| Support | ✓ (ECC EOL ~2027) | ✓ (empfohlen) |
| Skalierbarkeit | mittel | hoch (Multi-Lager) |
| Barcode/RF | Basis | erweitert (DAS, mobil) |
| Mobile App | begrenzt | voll |
| Integration | MM/SD | MM/SD/TM voll |

Umstellung: ECC+WM → S/4HANA+EWM empfohlen (6-12 Monate, Team-Nachschulung).

## Häufige Probleme

| Symptom | Ursache | Diagnose | Fix |
|---------|--------|----------|-----|
| WE-Verzögerung | Bin-Fehler/Zuweisung | LT01-Log | Lagerstrategie neu konfigurieren |
| Fehlender WA | LI01N nicht bestätigt | LI04 | Sammelbestätigung |
| Barcode-Fehler | RF-Akku/Netz | Terminal-Log | WiFi prüfen, laden |
| Bestandsdifferenz | unbestätigter WE/WA | LS01N vs physisch | Cycle Count |

## 📊 KPI
- WE-Durchsatz (LT01 Tagesanzahl)
- WA-Genauigkeit (LI01N Fehlerrate, Ziel < 1%)
- Bestandsgenauigkeit (LS01N vs physisch, Ziel < 0,5%)

## Prozessflüsse (Process Flows)

Eingang (LT01):
```
1. Beleg eingeben (PO-Referenz)
2. WE-Menge eingeben/scannen
3. Bin Auto-Vorschlag oder manuell
4. Bestätigen → sofortige Bestandsstamm-Aktualisierung
```

Ausgang (LB01 → LI01N):
```
1. SO-Referenz oder manuelle Anlage
2. LB01: Kommissionieranweisung (Barcode)
3. Lager: kommissionieren + Barcode-Scan-Bestätigung
4. LI01N: finaler WA → FI-Bestandsabbau
```

Tagesbetrieb:
```
Vormittag: WE (LT01) + Kommissionier-Vorbereitung (LB01)
Nachmittag: Kommissionierung + WA (LI01N)
Abend: Carrier-Abholung + Abschluss
```

S/4HANA-Umstellung:
```
Jetzt: ECC 6.0 + WM
Option 1: ECC behalten (bis ~2027 EOL) — Risiko: keine neue Technik
Option 2: S/4HANA + EWM (empfohlen) — 6-12 Monate Projekt
```

## Verwandt
- `../../SKILL.md` — vollständiger WM-Leitfaden
- `docs/enterprise/wm-ewm-migration.md` — S/4HANA-Umstellung
- `references/img/wm-configuration.md` — IMG-Setup
