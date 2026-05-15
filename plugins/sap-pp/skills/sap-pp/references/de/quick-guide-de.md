<!-- Claude-authored draft (community review welcome) -->

# sap-pp Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage
1. Fertigungsart (Diskret / Prozess / Serien / KANBAN)
2. MRP-Verfahren (Klassisches MRP / MRP Live — S/4)
3. Werk & Produktionsorganisation (nutzerseitig)

## 📚 Essentials

### Stammdaten
- **CS01/CS02**: Stückliste (BOM)
- **CA01/CA02**: Arbeitsplan (Routing)
- **CR01/CR02**: Arbeitsplatz
- **MD04**: Bedarfs-/Bestandsliste

### MRP
- **MD01**: MRP-Lauf (gesamt — i. d. R. nicht empfohlen)
- **MD02**: MRP-Lauf (Einzelmaterial)
- **MD03**: MRP-Lauf (Einzelmaterial, mehrstufig)
- **MD41/MD43**: Planungsauswertung
- S/4HANA: **MRP Live** (CDS + HANA Push-down)

### Fertigungsaufträge
- **CO01/CO02**: Fertigungsauftrag anlegen/ändern
- **CO11N**: Rückmeldung (Confirmation)
- **CO15**: Rückmeldung stornieren
- **COGI**: Liste fehlgeschlagener Auto-Wareneingänge bearbeiten

### Serienfertigung
- **MFBF**: Backflush
- **MF50**: Plantafel

## 🇩🇪 Deutsche Lokalisierung
- **Fertigungsstarke Regionen** — PP ist Kernmodul
- **Lohnbearbeitung** (Subcontracting) komplex — Beistell-/Auswärtsvergabe unterscheiden
- **Liefersteuerung** oft streng (OEM-Lieferantenstandards, z. B. Automotive)

## ⚠️ Hinweise
- Gesamt-MRP (MD01) nur **außerhalb der Betriebszeit**
- Nach Stücklistenänderung Low-Level-Code-Neuberechnung erforderlich (**OMIW**)
