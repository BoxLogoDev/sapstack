<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="Ms. Standard — das sapstack-Maskottchen" width="280" />

_„In SAP ist das Standard, also kann es nicht geändert werden." — Ms. Standard ([Markenrichtlinie](MASCOT.md))_

### AI-Codierungsassistent für SAP-Unternehmensoperationen

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**24 Plugins · 20 Agenten · 22 Befehle · MCP 23 Tools (npm) · VS Code-Erweiterung v2.3.3 · 8 KI-Tool-Kompatibilität · 6 Länder · 6 Sprachen · Konformitätsbereit**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## Was ist sapstack?

**sapstack** spritzt **SAP-Fachwissen** in KI-Tools wie Claude, Copilot und Cursor ein. Es deckt den gesamten SAP-Betriebslebenszyklus ab — **Configure → Implement → Operate → Diagnose → Optimize**.

```
┌──────────────────────────────────────────────────────────────┐
│ SAP-Betreiber ┐                                               │
│              ├─→ [AI Tool] ←── sapstack ──→ SAP-Wissen       │
│ Trainer für ──┤      ↓                       + IMG-Leitfäden  │
│ Neulinge     ├── Evidence Loop               + Best Practice  │
│ Berater ──────┘   (4-Turn-Diagnose)          + Compliance     │
└──────────────────────────────────────────────────────────────┘
```

> Die Entscheidungsprinzipien stehen in [**ETHOS.md**](ETHOS.md) — Ground-truth · Evidenz zuerst · Kein Hardcoding · ECC≠S/4 · Feldsprache · Betreiber entscheidet.

---

## 👥 Für wen das ist

| Sie sind… | sapstack macht das |
|---|---|
| **SAP-Betreiber** (im Tagesgeschäft, im Abschlussstress) | Störungen über den **Evidence Loop (4 Runden)** diagnostizieren — Hypothese→Evidenz→Verifizierung→Rollback, ohne Live-Zugriff. Direkt einsteigen mit Symptom-Befehlen (`/sap-migo-debug`, `/sap-payment-run-debug` …). |
| **Trainer für Neulinge / neue Mitarbeitende** | `sap-tutor` klassifiziert die Frage, delegiert an einen Modulspezialisten und übersetzt die Antwort in Anfängersprache. T-Code + Menüpfad immer gepaart. |
| **SAP-Berater / Partner** | 24 Module Wissen + IMG-Konfiguration + 3-Tier Best Practice + Compliance in KI-Tools einspeisen, pro Kundenlandschaft angepasst. |

---

## 🧭 Golden Path — was wann verwenden

Keine verstreuten Werkzeuge, sondern **ein Weg**. Vollständige Anleitung: **[docs/workflow.md](docs/workflow.md)** · Vollständigkeits-Gap-Analyse: [docs/gstack-gap-analysis.md](docs/gstack-gap-analysis.md)

| Was Sie wollen | Der Weg |
|---|---|
| Schnelle Faktantwort | **Quick Advisory** — einfach fragen |
| Störungsdiagnose | **Evidence Loop** (4 Runden) → Modul-Consultant / Symptom-Befehl |
| Modul unbekannt | `sap-tutor` (klassifiziert, delegiert an Spezialist) |
| Konfiguration (IMG) | `/sap-img-guide` |
| Periodenabschluss | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |
| Zum Projekt beitragen | Maintainer Golden Path |

> Stecken geblieben? Eine Ebene höher (Evidence Loop). Unsicher? Mit `sap-tutor` starten.

---

## ✅ So funktioniert es (See it work)

**Szenario**: _„Ich versuche, einen Wareneingang in MIGO zu buchen, aber es schlägt immer fehl."_ — der Evidence Loop grenzt mit Evidenz ein, nicht mit Behauptungen.

```
Turn 1 · INTAKE      Zuerst die Umgebung: ECC(EhP?) / S/4(Release?), Bewegungsart (BWA),
                     vollständige Fehlermeldung (M7 xxx).
Turn 2 · HYPOTHESIS  A: Buchungsperiode nicht offen — Prüfung: Zeigt MMRV die aktuelle
                     Periode passend zum Buchungsdatum? (Falsifikation: passt sie, A verwerfen)
                     B: Bewegungsart / Kontenfindung (OBYC) — Prüfung: …
Turn 3 · COLLECT     (Betreiber führt MMRV aus → meldet das Ergebnis)
Turn 4 · VERIFY      Periodenkonflikt bestätigt → Fix: Periode mit MMPV verschieben
                     (zuerst simulieren, via Transport). Rollback-Plan + relevanter SAP-Note-Verweis.
```

> Jede Hypothese trägt ein **Falsifikationskriterium**, jeder Fix einen **Rollback-Plan**. Keine direkten Produktivschreibvorgänge — der Betreiber entscheidet. (→ [ETHOS](ETHOS.md))

---

## Kernfunktionen

### 🎯 Vollständige SAP-Modulabdeckung
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 19 Spezialagenten + 1 SAP-Tutor
16 Modulberater (FI·CO·TR·MM·SD·PP·PM·QM·EWM·HCM·IBP·SAC·Ariba·Integration-Cloud·Cloud·BASIS) + ABAP developer + Integration advisor + S4 migration advisor + **SAP tutor** (Einarbeitung)

### 🔁 Evidence Loop (v1.5+)
Diagnose ohne Live-SAP-Zugriff — **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4-Runden-Struktur, Falsifikationskriterien erforderlich, Rollback-Paarung erforderlich

### 🏗 IMG-Konfigurationsframework (v1.6+)
76 SPRO-basierte Konfigurationsleitfäden — Konfigurationsschritte, ECC vs. S/4-Unterschiede, Verifizierungsmethoden

### 📋 3-Tier Best Practice
**Operational** (täglich) · **Period-End** (Abschluss) · **Governance** — auf 23 Module angewandt

### 🌐 6-Sprachen-Unterstützung (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt — 24 Module × 5 Sprachen = 120 Quick-Guides

### ☁️ S/4HANA Cloud PE bereit
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — den vollständigen Evidence Loop aus Claude Desktop ausführen. **23 Tools + 12 Prompts + 9 Ressourcen**.

### 💻 VS Code Extension (v2.3.3)
Sitzungs-Seitenleiste · YAML-Validierung · Webview-Rendering · File Watcher

### 🛡 Konformitätsbereit (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · Air-Gap-Bereitstellung · automatische PII-Maskierung

---

## Schnelleinstieg

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP-Server)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
Im VS Code Marketplace nach "sapstack" suchen → Install ·(oder die `.vsix` direkt aus einem [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases) installieren)

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Andere (Codex / Copilot / Cursor / Continue.dev / Aider)
Repo klonen → automatisch erkannt. Details: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universal Rules

1. **Niemals hardcoden** — keine festen Buchungskreise, Sachkonten oder Org-Einheiten
2. **Umgebungsabfrage zuerst** — SAP-Release, Bereitstellungsmodell, Buchungskreis klären
3. **ECC vs. S/4HANA explizit unterscheiden** — versionsspezifisches Verhalten klar machen
4. **Transport erforderlich** — Produktivänderungen immer über Transport
5. **Zuerst simulieren** — AFAB, F.13, FAGL_FC_VAL, MR11, F110 usw.
6. **Keine SE16N-Bearbeitung** — direkte Produktivdatenänderungen nicht empfehlen
7. **T-Code + SPRO-Pfad** — für jede Aktion beides angeben
8. **Koreanisch: Feldsprache zuerst** — Doppelnotation "코스트 센터 (원가센터, KOSTL)"

> Das *Warum* hinter diesen Regeln steht in [**ETHOS.md**](ETHOS.md), die vollständigen Betriebsregeln in [CLAUDE.md](CLAUDE.md).

---

## Lernpfad

| Stufe | Pfad |
|------|------|
| 🆕 **Einstieg** | [Tutorial (15 Min.)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **Praxis** | [5 Szenarien](docs/scenarios/) → [Glossar](docs/glossary.md) |
| 🧭 **Workflow** | [Golden Path](docs/workflow.md) → [Gap-Analyse](docs/gstack-gap-analysis.md) |
| 🏗 **Vertiefung** | [Architektur](docs/architecture.md) → [Multi-AI-Leitfaden](docs/multi-ai-compatibility.md) |
| 🔒 **Sicherheit** | [SECURITY.md](SECURITY.md) → [Compliance](docs/compliance/) |
| 🤝 **Beitragen** | [CONTRIBUTING](CONTRIBUTING.md) → [Roadmap](docs/roadmap.md) |

---

## Datenbestände

| Asset | Anzahl | Datei |
|------|------|------|
| Verifizierte T-Codes | 361 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Natürlichsprachiger Symptomindex | 90 (6 Sprachen) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| Verifizierte SAP Notes/KBAs | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Mehrsprachige Synonyme | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Periodenabschlusssequenz | 24 Schritte | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Branchenmatrix | 7 industries | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Plugin-Katalog

| Bereich | Plugins |
|------|----------|
| 💰 **Finanzen** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistik** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Personal** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Technologie** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **Cloud/Integration** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **Korea/Global** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Übersetzungsreview — Beiträge willkommen

Die Quick-Guides in 5 Sprachen (en/zh/ja/de/vi) sind **von Claude erstellte Entwürfe**. Review durch Muttersprachler + SAP-Fachexperten ist willkommen.

- Prozess · Kriterien · PR-Format: **[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- Feedback: [Translation Feedback Issue](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-Code/Note-Nummern werden nicht übersetzt (wortgetreu beibehalten)

---

## Lizenz & Beitrag

**MIT License** — frei für kommerzielle und nicht-kommerzielle Nutzung. Copyright-Hinweis beibehalten.

- 🐛 [Fehlerbericht](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Funktionswunsch](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Diskussionen](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Beitragsleitfaden](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
