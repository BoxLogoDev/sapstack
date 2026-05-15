<!-- Claude-authored draft (community review welcome) -->

# sap-sd Schnellanleitung (Deutsch)

## 🔑 Umgebungsabfrage
1. Verkaufsorganisation / Vertriebsweg / Sparte (nutzerseitig)
2. Kreditmanagement-Modus (ECC FD32 / S/4 FSCM UKM)
3. Umsatzrealisierung (Revenue Recognition)

## 📚 Essentials

### Order-to-Cash
- **VA01/VA02**: Kundenauftrag
- **VL01N**: Lieferung
- **VF01**: Fakturierung (Billing)
- **VF04**: Fakturen-Arbeitsvorrat
- **VA05**: Auftragsliste

### Pricing
- **V/08**: Kalkulationsschema
- **VK11/VK12**: Konditionssätze
- **VOFM**: Routinen (Preisfindungslogik)

### Credit Management
- **ECC**: FD32 (Kreditlimit) + VKM1 (Auftragssperre) + VKM3 (Liefersperre)
- **S/4 FSCM**: UKM_BP (Kreditsegment) + regelbasierte Prüfung
- **FD33**: Limit anzeigen

### Billing
- **VF03**: Fakturbeleg anzeigen
- **VF11**: Faktura stornieren
- Copy Control: **VTFA** (Auftrag→Faktura), **VTFL** (Lieferung→Faktura)

## 🇩🇪 Deutsche Lokalisierung
- **E-Rechnung (XRechnung/ZUGFeRD)** — automatische Kopplung bei VF01-Buchung (DRC oder Drittanbieter)
- **USt inklusive/exklusive** gemischt — B2C-Bruttopreisanzeige ggf. gesetzlich gefordert
- **Gutschriftverfahren** (käuferseitige Abrechnung) — kundenspezifisch bei Bedarf

## ⚠️ Hinweise
- VF01-Storno (VF11) hat **strenge Bedingungen** — Konflikt mit Gutschriftverfahren beachten
- Kredit oft mit **Konzern-/HQ-Bürgschaft** (Großunternehmen) → komplexe Kreditsegmente
