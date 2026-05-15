<!-- Claude-authored draft (community review welcome) -->

# SAP QM Schnellanleitung (Deutsch)

## Umgebungsabfrage
1. SAP-Release (ECC EhP / S/4HANA-Jahr)
2. Deployment-Modell (On-Premise / RISE / Cloud PE)
3. QM-Aktivierungsstatus (Prüfeinrichtung je Materialart)
4. Branche (Fertigung, Pharma, Lebensmittel, Automotive)

## Wichtige T-Codes

### Qualitätsplanung
| T-Code | Verwendung |
|--------|------|
| QP01 | Prüfplan anlegen |
| QP02 | Prüfplan ändern |
| QS21 | Prüfmerkmal-Stammsatz (MIC) |
| QDV1 | Stichprobenverfahren |

### Qualitätsprüfung
| T-Code | Verwendung |
|--------|------|
| QA01 | Prüflos manuell anlegen |
| QA03 | Prüflos anzeigen |
| QE01 | Ergebnisse erfassen (einzeln) |
| QE51N | Ergebnisse erfassen (Arbeitsvorrat) |

### Verwendungsentscheid
| T-Code | Verwendung |
|--------|------|
| QA11 | Verwendungsentscheid |
| QA32 | Verwendungsentscheid (kollektiv) |

### Qualitätsmeldung
| T-Code | Verwendung |
|--------|------|
| QM01 | Qualitätsmeldung anlegen (Mangel/Reklamation) |
| QM02 | Qualitätsmeldung ändern |

### Zeugnis / Lieferantenbeurteilung
| T-Code | Verwendung |
|--------|------|
| QC21 | Zeugnis anlegen (Prüfbericht) |
| QI01 | Qualitätsinfosatz (Wareneingangsprüfung) |
| ME61 | Lieferantenbeurteilung |

## Deutsche Lokalisierung

### ISO / IATF Zertifizierung
- ISO 9001: Qualitätsmanagementsystem (nahezu gesamte Fertigung)
- IATF 16949: Automotive (OEM-Lieferantenanforderung)
- Prüfplan (QP01) ist zentraler Auditnachweis

### Pharma GMP
- Regulatorische Behördenstandards (BfArM/EMA)
- Validierung 3-stufig: IQ → OQ → PQ
- Abweichungsmanagement: über Qualitätsmeldung (QM01) verfolgt

### Lebensmittel HACCP
- CCP (kritischer Lenkungspunkt) Monitoring
- Prüfmerkmale (MIC) auf CCP-Positionen mappen

### Lieferanten-Qualitätsmanagement
- Verschärfte Wareneingangsprüfung (Inspection Type 01)
- Lieferantenbeurteilung (ME61): Qualitätsscore automatisch
- Nichtkonformität → Qualitätsmeldung (Q3) → Korrekturmaßnahme

## Verwandt
- `../../SKILL.md` — vollständiger Inhalt
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — Beschaffung/Material
- `/plugins/sap-pp/skills/sap-pp/SKILL.md` — Fertigung/Prozessprüfung
