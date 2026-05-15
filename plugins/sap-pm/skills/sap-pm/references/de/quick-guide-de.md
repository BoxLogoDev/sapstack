<!-- Claude-authored draft (community review welcome) -->

# SAP PM Schnellanleitung (Deutsch)

## Umgebungsabfrage
1. SAP-Release (ECC EhP / S/4HANA-Jahr)
2. Deployment-Modell (On-Premise / RISE / Cloud PE)
3. Planungswerk (Planning Plant)
4. Branche (Fertigung, Chemie, Energie, Versorgung)

## Wichtige T-Codes

### Equipment-Stammdaten
| T-Code | Verwendung |
|--------|------|
| IE01 | Equipment anlegen |
| IE02 | Equipment ändern |
| IE03 | Equipment anzeigen |
| IL01 | Technischen Platz anlegen |
| IL02 | Technischen Platz ändern |

### Instandhaltungsmeldung (Notification)
| T-Code | Verwendung |
|--------|------|
| IW21 | Meldung anlegen (Störungsmeldung) |
| IW22 | Meldung ändern |
| IW28 | Meldungsliste |
| IW29 | Meldungsanalyse |

### Instandhaltungsauftrag (Maintenance Order)
| T-Code | Verwendung |
|--------|------|
| IW31 | Auftrag anlegen (Arbeitsauftrag) |
| IW32 | Auftrag ändern |
| IW38 | Auftragsliste |
| IW39 | Auftragsanalyse |

### Vorbeugende Instandhaltung
| T-Code | Verwendung |
|--------|------|
| IP01 | Wartungsplan anlegen |
| IP10 | Wartungsplan terminieren |
| IP30 | Fälligkeitsüberwachung |
| IA01 | Arbeitsplan anlegen |

### Abrechnung / KPI
| T-Code | Verwendung |
|--------|------|
| KO88 | Auftragsabrechnung |
| IW65 | Zählerstand erfassen |

## Deutsche Lokalisierung

### Arbeitsschutzrecht
- Aufbewahrungspflicht für Anlagenprüfhistorie (Meldung = Prüfnachweis)
- Betreiberverantwortung: verschärfte Anlagensicherheitspflicht
- Gesetzliche Prüfzyklen in vorbeugende Wartungspläne aufnehmen

### Fertigungsanlagen-Management
- MES-Integration: Echtzeit-Anlagenstatus → Auto-IW21
- 3-Schicht-Betrieb: Schichtübergabe-Protokoll je Anlage
- Fremdwartung: externe Serviceerfassung (z. B. PM10-Service)

### KPI
- MTBF (mittlere Betriebsdauer zwischen Ausfällen): höher = besser
- MTTR (mittlere Reparaturdauer): niedriger = besser
- OEE (Gesamtanlageneffektivität): Verfügbarkeit × Leistung × Qualität

## Verwandt
- `../../SKILL.md` — vollständiger Inhalt
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — Material/Ersatzteile
- `/plugins/sap-co/skills/sap-co/SKILL.md` — Instandhaltungskosten
