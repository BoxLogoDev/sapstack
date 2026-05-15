<!-- Claude-authored draft (community review welcome) -->

# sap-session Schnellanleitung (Deutsch)

> Evidence-Loop-Orchestrator. Übergeordnete Skill, die einen 4-Turn-Async-Loop ("Aufnahme → Hypothese → Beweissammlung → Verifikation") für die Betriebsdiagnose in Umgebungen ohne Live-SAP-Zugriff ausführt. Details in `SKILL.md` und `references/turn-formats.md`.

## 🔑 Wann sap-session nutzen

| Situation | Modus |
|---|---|
| Einfache Frage „Was ist FB01?" | **Quick Advisory** — kein sap-session, Modulberater antwortet direkt |
| „F110 lief, aber ein Lieferant zeigt 'No payment method'" | **Evidence Loop** — sap-session starten |
| Periodenabschluss-Vorprüfung / Retrospektive | Evidence Loop |
| Modulübergreifende Änderungswirkung (FI-Config → MM/SD) | Evidence Loop |
| 2+ Hypothesen mit Beweisen eingrenzen | Evidence Loop |
| Operator ohne SAP-Direktzugriff, AI berät nur | Evidence Loop (Kern-Use-Case) |

## 🔁 Die 4 Turns

```
Turn 1 INTAKE      (Operator)  Initialsymptom + 1 Evidence Bundle
Turn 2 HYPOTHESIS  (AI)        2-4 Hypothesen + Falsifikation + Follow-up Request
Turn 3 COLLECT     (Operator)  Follow-up-Checkliste in SAP, Bundle ergänzen
Turn 4 VERIFY      (AI)        bestätigen/verwerfen; bei Bestätigung Fix + Rollback
```

- Jede Hypothese MUSS Falsifikationskriterien enthalten. „Unfalsifizierbare Hypothese" unzulässig.
- Bei Fix-Plan MUSS Rollback-Plan existieren (Rollback-or-no-Fix).
- Alle Statusänderungen append-only in `session.audit_trail` (kein Edit/Delete).

## 📦 Session-Dateistruktur

1 Session = 1 `.sapstack/sessions/{id}/` Verzeichnis:

| Datei | Wann |
|---|---|
| `state.yaml` | jeder Turn (aktueller Status, nächste Aktion) |
| `bundles/evb-*.yaml` | Turn 1, 3 — Operator-Beweise |
| `hypotheses/h-*.yaml` | Turn 2 — AI-Hypothesen |
| `requests/flr-*.yaml` | Turn 2 — AI-Follow-up-Checkliste |
| `verdicts/vdc-*.yaml` | Turn 4 — Bestätigung/Ablehnung |

Session-ID-Format: `sess-YYYYMMDD-XXXXXX`

## 🚀 Operator-Ablaufbeispiel

```bash
# Turn 1 INTAKE
/sap-session-start "F110 Proposal scheitert — Lieferant 100234, 'No valid payment method'"
/sap-session-add-evidence sess-20260514-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# Turn 2 HYPOTHESIS (AI erzeugt Hypothesen + Follow-up)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1: LFB1.ZWELS leer (am häufigsten)
#   H2: FBZP Bankenfindung ohne T/C-Methode
#   H3: Zahlweg je Buchungskreis nicht aktiv

# Turn 3 COLLECT (Operator führt Checkliste aus, lädt hoch)
/sap-session-add-evidence sess-20260514-m2p9xt ./xk03-zwels-check.txt

# Turn 4 VERIFY (AI bestätigt/verwirft, Fix + Rollback)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1 bestätigt, Fix: XK02 ZWELS setzen, Rollback: XK02 ZWELS leeren

/sap-session-handoff sess-20260514-m2p9xt --to web_triage
```

## 🧰 Auto-Routing

Per Hypothese `impacted_modules` parallele Auto-Aufrufe der Modulberater: FI→`sap-fi-consultant`, MM→`sap-mm-consultant`, SD→`sap-sd-consultant`, PP→`sap-pp-consultant`, HCM→`sap-hcm-consultant`, TR→`sap-tr-consultant`, CO→`sap-co-consultant`, PM→`sap-pm-consultant`, QM→`sap-qm-consultant`, WM/EWM→`sap-ewm-consultant`, ABAP→`sap-abap-developer`, BASIS→`sap-basis-consultant`, Cloud PE→`sap-cloud-consultant`, S/4-Migration→`sap-s4-migration-advisor`, BTP/CPI→`sap-integration-advisor`, Anfänger→`sap-tutor`. Multi-Modul → Parallelaufruf, konsolidiertes Verdict.

## 🌍 Feldsprache-Prinzip

sapstack nutzt reale SAP-Feldsprache statt Wörterbuchübersetzung:
- Feldsprache zuerst (T-Codes/Abkürzungen Originalform: F110, MIGO, ST22, PO, GR, TR)
- Umgangssprachliche Muster erlaubt
- Lokale Geschäftskalender-Marker
- Vollguide: `references/korean-field-language.md`; Synonyme: `data/synonyms.yaml`

## ⚠️ Explizite Nicht-Ziele
- Keine Live-SAP-Verbindung (kein RFC/OData/Fiori-Direktaufruf)
- Kein Auto-Edit von Produktivdaten — Operator führt alle Fixes
- Kein Auto-Transport — menschliche Freigabe nötig
- Kein CLI-Zwang für Endnutzer — sie nutzen das Web-Portal

## 🚦 Beziehung zu anderen Modulen

| | Quick Advisory | sap-session (Evidence Loop) |
|---|---|---|
| Turns | 1 | Multi-Turn (async) |
| Passt | „Was ist X?" | „X funktioniert nicht" |
| Hypothesen | Einzelantwort | 2-4 + Falsifikation |
| Beweise | keine | explizite Follow-up-Checkliste |
| Status | keiner | `.sapstack/sessions/...` |
| Rollback | optional | **verpflichtend** |

Regel: 2+ Turns erwartet ODER 2+ Hypothesenkandidaten → sap-session.

## 📚 Weiterführend
- `references/turn-formats.md`, `references/evidence-bundle-guide.md`
- `references/session-state-lifecycle.md`, `references/korean-field-language.md`
- `../../../schemas/` — 5 JSON-Schemas; `../../../CLAUDE.md` — Universal Rules
