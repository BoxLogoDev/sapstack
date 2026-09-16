<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="Frau Standard — das sapstack-Maskottchen" width="280" />

_„In SAP ist das Standard, das geht nicht." — Frau Standard ([Markenrichtlinie](MASCOT.md))_

### Der KI-Desktop für den SAP-Betrieb

**Installieren und einfach fragen — vom Standardprozess bis zu den kundeneigenen (Z/Y) Programmen Ihrer Firma.**

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**Windows-Desktop-App v2.6.0 · 24 Plugins · 21 Agenten · 23 Befehle · CBO-Snapshots · Air-Gap-fähig · 6 Sprachen · Compliance-ready**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## Was ist sapstack?

**sapstack** ist eine **dedizierte SAP-KI-Desktop-App** für Anwender und Berater.
Kein ADT, keine Entwicklerberechtigungen, kein eigener API-Schlüssel — App öffnen, Frage eintippen.

```
„Der F110-Zahllauf bricht mit Fehler ab"      → 4-Turn Evidence Loop (Hypothese→Beweis→Verifikation→Rollback)
„Wie ist die Reihenfolge beim Monatsabschluss?" → Abschluss-Sequenz mit T-Codes und Menüpfaden
„Was macht das Programm ZFI0042?"              → Liest den kundeneigenen Code (CBO-Snapshot) und erklärt ihn
```

Darunter liegt SAP-Wissen über den gesamten Betriebslebenszyklus
(**Configure → Implement → Operate → Diagnose → Optimize**) — 24 Modul-Plugins, IMG-Leitfäden,
Best Practices und Compliance — dasselbe Wissen ist auch aus Claude Code, MCP und VS Code
nutzbar (→ [Integrationen für Entwickler & Power-User](#-integrationen-für-entwickler--power-user)).

> Entscheidungsprinzipien: [**ETHOS.md**](ETHOS.md) — Ground-Truth · Beweise zuerst · kein Hardcoding · ECC≠S/4 · Praxisterminologie · der Operator entscheidet.

---

## 👥 Für wen

| Sie sind… | Der sapstack-Desktop bietet |
|---|---|
| **SAP-Anwender** (im Abschlussstress, ohne Entwicklerrechte) | Frage auf dem Startbildschirm eintippen — Störungen laufen in den **4-Turn Evidence Loop**, Faktenfragen werden direkt beantwortet. Auch die **Z/Y-Programme Ihrer Firma** werden auf Snapshot-Basis erklärt (kein Raten, Stichtag wird immer genannt). |
| **Administrator / IT** | **Zero-Config-Rollout** mit einer einzigen `provision.yaml` — Anwender entpacken das ZIP und starten die exe, fertig. CBO-Snapshots werden nächtlich gesammelt, auf eine Netzwerkfreigabe publiziert und von der App selbst aktualisiert. Air-Gapped-Standorte nutzen das mitgelieferte lokale LLM. |
| **SAP-Berater / Partner** | 24 Module Wissen + IMG-Konfiguration + 3-Tier Best Practices + Compliance — im Desktop und in Ihren KI-Tools, schnell pro Kundenumgebung angewendet. |

---

## 🖥 Was der Desktop kann

### 💬 Mit einer Frage starten
Einfach eintippen — Störungen verzweigen in den **Evidence Loop**
(INTAKE→HYPOTHESIS→COLLECT→VERIFY, Falsifikationskriterien und Rollback-Paare Pflicht),
Faktenfragen in die **Quick Advisory**. Beispielfragen-Chips helfen bei der ersten Frage.

### 🗂 CBO-Snapshots — Fragen zum kundeneigenen Code
Ein Administrator exportiert kundeneigene ABAP-Quellen (Z/Y) in einen Snapshot; die App liest
diese Kopie **ohne SAP-Verbindung** und beantwortet „was macht dieses Programm?" in
Anwendersprache. Drei Lieferwege — im Distributions-ZIP gebündelt · Auto-Refresh von einer
Netzwerkfreigabe · „Aus ZIP importieren" in den Einstellungen. Jede Antwort nennt den
**Snapshot-Stichtag**. → [docs/cbo-snapshot.md](docs/cbo-snapshot.md)

### 📦 Zero-Config-Massenrollout (Admin-Provisionierung)
Eine `provision.yaml` neben der exe genügt: Der erste Start konfiguriert LLM-Verbindung
(Firmenschlüssel, Gateway oder lokales Modell), SAP-Umgebung und Anwendermodus automatisch —
**Anwender sehen keinerlei Einrichtungsbildschirm.** Schlüsselrotation = Version hochzählen und
neu verteilen. → [docs/provisioning.md](docs/provisioning.md)

### 🙋 Anwendermodus
Ein einfacher, fragenzentrierter Start (3 Karten + Beispiel-Chips), Entwicklermenüs ausgeblendet,
keine Tool-Freigabedialoge (standardmäßig schreibgeschützt). Umschaltbar unter Einstellungen → Aussehen.

### 🔒 Air-Gap-Unterstützung (getrennte Netze)
Bündelt die lokale Inferenz-Engine `llama-server` (llama.cpp) — GGUF-Modellpakete per USB
einbringen, läuft ohne Internet. Mit `air_gapped: true` sind auch Crash-Reporting und
Update-Polling deaktiviert. → [docs/compliance/air-gapped-deployment.md](docs/compliance/air-gapped-deployment.md)

### 📚 Das SAP-Wissen darunter (Basis jeder Antwort)
- **24 Module**: FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · Cloud PE · Session u. a.
- **21 Agenten**: 16 Modulberater + ABAP developer + Integration-/S4-Migration-Advisor + SAP tutor (Onboarding) + **CBO explainer** (Custom-Code-Erklärungen für Anwender)
- **IMG-Konfigurationsframework**: 76 SPRO-basierte Leitfäden (ECC-vs-S/4-Unterschiede, Verifikationsschritte)
- **3-Tier Best Practices**: Operational · Period-End · Governance
- **6 Sprachen**: 한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt (24 Module × 5 Sprachen Quick-Guides)
- **Compliance**: K-SOX · SOC 2 · ISO 27001 · GDPR · automatische PII-Maskierung

---

## ✅ So arbeitet es

**Szenario 1**: _„Die MIGO-Wareneingangsbuchung schlägt immer wieder fehl."_ — Der Evidence Loop grenzt mit Beweisen ein, statt zu behaupten.

```
Turn 1 · INTAKE      Zuerst die Umgebung: ECC (EhP?) / S/4 (Release?), Bewegungsart (MvT),
                     vollständige Fehlermeldung (M7 xxx).
Turn 2 · HYPOTHESIS  Hypothese A: Buchungsperiode nicht offen — Prüfung: stimmt die aktuelle
                     Periode in MMRV mit dem Buchungsdatum überein? (falsifiziert → A verwerfen)
                     Hypothese B: Bewegungsart/Kontenfindung (OBYC) — Prüfung: …
Turn 3 · COLLECT     (Der Operator prüft MMRV und meldet das Ergebnis)
Turn 4 · VERIFY      Periodenabweichung bestätigt → Fix: Periode mit MMPV fortschreiben
                     (erst simulieren, via Transport). Rollback-Plan + SAP-Note-Verweise inklusive.
```

**Szenario 2**: _„Was macht ZFI0042?"_ — beantwortet aus dem CBO-Snapshot (fiktives Beispiel), in diesem Format:

```
Kurzfassung     (Programmzweck, abgeleitet aus Quellkopf/Katalog des Snapshots)
Wo genutzt      Dynpros und Schaltflächen (liegt das T-Code-Mapping außerhalb des Snapshots,
                wird das gesagt)
Ablauf          Berechtigungsprüfung → Abfrage → Liste/Druck — der real aus dem Quelltext
                gelesene Ablauf
Achtung         Meldungen, die Anwender sehen, und was zu tun ist (kein Raten — was nicht im
                Snapshot steht, wird als „nicht vorhanden" beantwortet)
Stichtag        Diese Antwort basiert auf dem Snapshot vom JJJJ-MM-TT.
```

> Jede Hypothese trägt ein **Falsifikationskriterium**, jeder Fix einen **Rollback-Plan**. Nur Anleitung, keine direkten Produktivänderungen — der Operator entscheidet. (→ [ETHOS](ETHOS.md))

---

## Schnellstart

### 🖥 Desktop (empfohlen — Anwender & Berater)

**Distributions-ZIP erhalten?** Entpacken und `sapstack-Desktop-*-Portable-x64.exe` starten — fertig.
(Hat der Admin eine provision.yaml beigelegt, können Sie ohne jeden Einrichtungsschritt fragen.)

**Selbst installieren**: `sapstack-Desktop-<Version>-Setup-x64.exe` (NSIS, per-user, keine
Adminrechte) oder die Portable-Variante von den [GitHub Releases](https://github.com/BoxLogoDev/sapstack/releases)
laden. Git for Windows (Git Bash) erforderlich; ca. 249 MB (gemessen mit v2.4.1).
→ Installation: [docs/desktop-install.md](docs/desktop-install.md) · Paketierung: [docs/provisioning.md](docs/provisioning.md)

**Drei SAP-Datenwege** — keiner verändert SAP:
① Copy-Paste als Standard ② schreibgeschützte ADT-Bridge (Einstellungen > SAP-Verbindung, [docs/adt-bridge.md](docs/adt-bridge.md))
③ CBO-Snapshots (Offline-Kopie, [docs/cbo-snapshot.md](docs/cbo-snapshot.md))

### ⚡ 5-Minuten-Onboarding (Repository-basiert)
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   nur prüfen: ./setup.sh --check
```
Details: [docs/quickstart-5min.md](docs/quickstart-5min.md)

---

## 🔧 Integrationen für Entwickler & Power-User

Weitere Zugänge zum selben SAP-Wissen.

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP-Server) — 23 Tools + 12 Prompts + 9 Ressourcen
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS-Code-Erweiterung
Im VS Code Marketplace nach „sapstack" suchen → Install · (oder die `.vsix` direkt aus einem [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases) installieren)

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Weitere (Codex / Copilot / Cursor / Continue.dev / Aider)
Repository klonen → automatische Erkennung. Details: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

### 🧭 Golden Path — was wann nutzen
Vollständiger Leitfaden: [docs/workflow.md](docs/workflow.md)

| Sie möchten | Der Weg |
|---|---|
| Eine schnelle Faktenantwort | **Quick Advisory** — einfach fragen |
| Störungsdiagnose | **Evidence Loop** (4 Turns) → Modulberater / Symptom-Befehle |
| Ein kundeneigenes (Z/Y) Programm verstehen | Auf dem Desktop-Start direkt fragen / `/sap-cbo-explain` |
| Modul unbekannt | `sap-tutor` (klassifiziert und delegiert an Spezialisten) |
| Ein Konfigurationsproblem (IMG) | `/sap-img-guide` |
| Periodenabschluss | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |

---

## Universal Rules

1. **Niemals hardcoden** — keine festen Buchungskreise, Sachkonten oder Organisationseinheiten
2. **Umgebungsaufnahme zuerst** — SAP-Release, Deployment-Modell, Buchungskreis
3. **ECC vs. S/4HANA explizit unterscheiden** — versionsspezifisches Verhalten klar benennen
4. **Transport Pflicht** — Produktivänderungen immer via Transport
5. **Erst simulieren** — AFAB, F.13, FAGL_FC_VAL, MR11, F110 usw.
6. **Kein SE16N-Editieren** — keine direkten Datenänderungen in Produktion empfehlen
7. **T-Code + SPRO-Pfad** — beides zu jeder Maßnahme
8. **Koreanisch mit Praxisterminologie zuerst** — Doppelnotation wie „코스트 센터 (원가센터, KOSTL)"

> Das *Warum* hinter den Regeln: [**ETHOS.md**](ETHOS.md) · vollständige Betriebsregeln: [CLAUDE.md](CLAUDE.md).

---

## Lernpfad

| Stufe | Pfad |
|------|------|
| 🆕 **Einstieg** | [Tutorial (15 Min.)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 🖥 **Desktop-Betrieb** | [Installation](docs/desktop-install.md) → [Provisionierung](docs/provisioning.md) → [CBO-Snapshots](docs/cbo-snapshot.md) |
| 📘 **Praxis** | [5 Szenarien](docs/scenarios/) → [Glossar](docs/glossary.md) |
| 🧭 **Workflow** | [Golden Path](docs/workflow.md) → [Vollständigkeits-Gap-Analyse](docs/gstack-gap-analysis.md) |
| 🏗 **Vertiefung** | [Architektur](docs/architecture.md) → [Multi-AI-Leitfaden](docs/multi-ai-compatibility.md) |
| 🔒 **Sicherheit** | [SECURITY.md](SECURITY.md) → [Compliance](docs/compliance/) |
| 🤝 **Mitwirken** | [CONTRIBUTING](CONTRIBUTING.md) → [Roadmap](docs/roadmap.md) |

---

## Datenbestände

| Bestand | Anzahl | Datei |
|------|------|------|
| Verifizierte T-Codes | 472 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Natürlichsprachlicher Symptomindex | 90 (6 Sprachen) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| Verifizierte SAP Notes/KBAs | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Mehrsprachige Synonyme | 80+ Begriffe × 6 Sprachen | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Periodenabschluss-Sequenz | 24 Schritte | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Branchenmatrix | 7 Branchen | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Plugin-Katalog

| Bereich | Plugins |
|------|----------|
| 💰 **Finanzen** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistik** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Personal** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Technik** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **Cloud/Integration** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **Korea/Global** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Mitwirkung an Übersetzungsreviews

Die Quick-Guides in 5 Sprachen (en/zh/ja/de/vi) sind **von Claude verfasste Entwürfe**. Reviews durch Muttersprachler mit SAP-Domänenwissen sind sehr willkommen.

- Prozess, Kriterien, PR-Format: **[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- Feedback: [Translation-Feedback-Issue](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-Codes/Note-Nummern werden nicht übersetzt (Original beibehalten)

---

## Lizenz & Mitwirken

**MIT License** — freie kommerzielle und nichtkommerzielle Nutzung. Copyright-Hinweis beibehalten.

- 🐛 [Bug melden](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Feature anfragen](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Diskussionen](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Beitragsleitfaden](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
