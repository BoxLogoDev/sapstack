<div align="center">

# 🏛 sapstack

### SAP-Betriebsunternehmen-Plattform für AI-Codierungs-Assistenten

**20 Plugins · 16 Agenten · 18 Befehle · 55+ IMG-Handbücher · 43+ Best Practices · 6 Sprachen · SAP AI-bereit**

🌐 **Languages**: [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](https://github.com/BoxLogoDev/sapstack/releases/tag/v1.7.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/BoxLogoDev/sapstack/actions)
[![Deutsch](https://img.shields.io/badge/Deutsch-Universal-blue.svg)](README.de.md)
[![Multi-AI](https://img.shields.io/badge/AI%20tools-7-purple.svg)](docs/multi-ai-compatibility.md)
[![Kiro](https://img.shields.io/badge/Kiro-ready-00D4AA.svg)](docs/kiro-quickstart.md)

<p>
  <a href="docs/tutorial.md"><b>Anleitung</b></a> ·
  <a href="docs/faq.md"><b>Häufig gestellte Fragen</b></a> ·
  <a href="docs/glossary.md"><b>Glossar</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>Multi-AI-Handbuch</b></a> ·
  <a href="docs/roadmap.md"><b>Roadmap</b></a>
</p>

</div>

---

## ⚡ 30-Sekunden-Einführung

sapstack verwandelt **AI-Codierungs-Assistenten in SAP-Betriebsberater** — eine Unternehmensplattform für den gesamten SAP-Operativen Lebenszyklus. Version 1.6.0 deckt Konfiguration → Implementierung → Betrieb → Diagnose → Optimierung ab.

- 🎯 **18 SAP-Module + Evidence Loop-Orchestrator** — FI/CO/TR/MM/SD/PP/PM/QM/WM/EWM/HCM/SFSF/ABAP/S4-Migration/BTP/BASIS/BC/GTS
- 🤖 **15 Agenten** — 14 Modulberater + **SAP-Tutor** (Schulung für neue Mitarbeiter)
- ⚙️ **18 Schrägstrich-Befehle** — Periodische Abschlüsse, Debugging, Evidence Loop, IMG, Best Practices, Diagnose
- 🏗 **52 IMG-Konfigurationsanleitungen** — SPRO-Pfade, Schritt-für-Schritt-Setup, ECC vs S/4 Unterschiede, Validierung
- 📋 **40+ Best Practices** — 3-Schicht-Rahmen (Operativ·Periodisch·Governance)
- 🏢 **Unternehmens-Dokumentation** — mehrere Gesellschaftscodes, SSC, Intercompany-Transaktionen, globale Rollouts, Systemlandschaft
- 🏭 **Branchenspezifische Handbücher** — Fertigung, Einzelhandel, Finanzdienstleistungen
- 🌐 **7 AI-Tools kompatibel** — Claude Code, Codex CLI, Copilot, Cursor, Continue.dev, Aider, Kiro
- 🇰🇷 **Koreanische Feldsprachen-Ebene** — 80+ Synonyme, 62 Symptom-Index, 41 T-Code-Aussprachen (Schwerpunkt für koreanische Unternehmen)
- 📊 **340+ T-Codes · 57 SAP-Hinweise · 8 Datenbestände**
- 🔁 **Evidence Loop** — AUFNAHME → HYPOTHESE → SAMMLUNG → VERIFIZIERUNG (Falsifizierungsbedingungen + erzwungenes Rollback)
- 🛡 **11 Qualitätstore** — IMG, Best Practices, Branchen-Checks, strikter CI

---

## 🚀 Schneller Einstieg

### 1️⃣ Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack sap-bc@sapstack
```

### 2️⃣ Amazon Kiro IDE ⭐ NEU
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack/mcp && npm install && npm run build && cd ../..
cp sapstack/.kiro/settings/mcp.json .kiro/settings/mcp.json
cp sapstack/.kiro/steering/*.md .kiro/steering/
```
In Kiro-Chat: „Kürzlich geänderte Kostenstellen finden" → automatische Synonym-Erweiterung Matching.
Details: **[docs/kiro-quickstart.md](docs/kiro-quickstart.md)** · **[docs/kiro-integration.md](docs/kiro-integration.md)**

### 3️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..
codex "F110-Zahlungslauf diagnostizieren: Lieferant zeigt Fehler 'Keine Zahlungsart'"
```

### 4️⃣ GitHub Copilot (VS Code)
Repository klonen oder `.github/copilot-instructions.md` kopieren → automatisch erkannt

### 5️⃣ Cursor / Continue.dev / Aider
Automatisch geladen `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md`

Details: **[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 Architektur — 5-Achsen-Struktur (v1.6.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                     sapstack v1.6.0                              │
│          SAP-Betriebsunternehmen-Plattform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Konfiguration] → [Implementierung] → [Betrieb] → [Diagnose] → [Optimierung] │
│   52 IMG-Guides      Unternehmens     15 Agenten   Evidence     40+ Best    │
│   SPRO-Pfade         6 Dokumente      18 Befehle   Loop 62      Practices  │
│   11 Module          3 Branchen       340+ T-Codes Symptome     3-Schicht  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ① Aktive Berater           ② Kontext-Persistenz               │
│  • 19 SKILL.md              • .sapstack/config.yaml             │
│  • 15 Sub-Agenten           • .sapstack/sessions/*/state.yaml   │
│  • 18 Befehle               • 5 JSON-Schemas                    │
│  • 80+ Synonyme             • Audit-Trail (nur Anhang)         │
│                                                                  │
│  ③ Evidence Loop             ④ Qualitätstore (11 CI-Typen)      │
│  • 4-Turn-Diagnose-Loop     • lint / Marktplatz / Hardcodierung│
│  • Falsifizierbarkeit req.  • tcodes / Referenzen / Links      │
│  • Fix + Rollback Paar      • ecc-s4-split / Multi-AI Build    │
│                              • img-refs / best-practices        │
│  ⑤ Unternehmensebene 🆕                                         │
│  • IMG-Konfiguration (52 Handbücher)                           │
│  • Best Practice (3-Schicht: Operativ/Periodisch/Governance)   │
│  • Unternehmens-Szenarien (Multi-CC, SSC, IC, Global Rollout)  │
│  • Branchenhandbücher (Fertigung, Einzelhandel, Finanzen)      │
└─────────────────────────────────────────────────────────────────┘
```

Details: [docs/architecture.md](docs/architecture.md) · Evidence Loop: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md)

---

## 🔁 Evidence Loop — Von Beratungs-Bot zu Diagnose-Partner (v1.5.0)

sapstack v1.5.0 wechselt von **einmaligen Ratschlägen** zu **Turn-bewussten Diagnose-Partner**. Auch ohne Live-SAP-Zugriff funktioniert die „Überprüfen → Beheben → Überprüfen"-Schleife asynchron.

### 4-Turn-Struktur
```
Turn 1 AUFNAHME    → Betreiber gibt initialsymptom + evidenzen ein
Turn 2 HYPOTHESE   → KI generiert 2-4 hypothesen (falsifizierung erforderlich) + folgeanfrage
Turn 3 SAMMLUNG    → Betreiber sammelt evidenzen von SAP (KI wartet)
Turn 4 VERIFIZIERUNG → hypothese bestätigt/abgelehnt + Reparaturplan + erzwungenes Rollback
```

### 3 Zugriffsflächen
| Fläche | Benutzer | Werkzeug |
|---|---|---|
| **A — CLI** | Betreiber | `/sap-session-{start,add-evidence,next-turn}` |
| **B — IDE** | Betreiber | VS Code Erweiterung (v1.6 geplant) |
| **C — Web** | Endbenutzer | `web/triage.html` + `web/session.html` (statisch, serverlos) |

Alle drei Flächen verbinden sich über **gleiche Session-ID** für Handoff. Typischer Ablauf: Endbenutzer startet Diagnose im Web, Betreiber setzt über CLI fort.

### Kernprinzipien
- **Falsifizierbarkeit**: Jede Hypothese erfordert Falsifizierungskriterien
- **Rollback-oder-kein-Fix**: Bestätigte Fixes müssen Rollback-Paar haben
- **Audit-Trail**: Alle Zustandsänderungen aufgezeichnet (nur Anhang)
- **Kein Live-SAP**: Betreiber fungiert als Executor (Mensch-in-der-Schleife asynchrone Schleife)

Details: [plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md) · Praktisches Beispiel: [aidlc-docs/sapstack/f110-dog-food.md](aidlc-docs/sapstack/f110-dog-food.md)

---

## 📦 20-Plugin-Katalog (18 Domänen + 2 Meta)

### 💰 Kern-Finanzen
| Plugin | Thema | Stichworte |
|--------|-------|----------|
| [`sap-fi`](plugins/sap-fi/) | Finanzbuchhaltung | FB01, F110, MIRO, Periodisches Schließen, GR/IR, Steuern |
| [`sap-co`](plugins/sap-co/) | Kostenrechnung | Kostenstelle, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | Finanzierung & Liquidität | FF7A, FF7B, Liquidität, MT940, DMEE |

### 📦 Logistik & Lieferkette
| Plugin | Thema | Stichworte |
|--------|-------|----------|
| [`sap-mm`](plugins/sap-mm/) | Materialverwaltung | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | Vertrieb & Versand | VA01, VF01, FD32, Preisbildung, Kreditlimit |
| [`sap-pp`](plugins/sap-pp/) | Produktionsplanung | MRP, MD01/MD04, CO01, Stückliste, Arbeitsplan |
| [`sap-pm`](plugins/sap-pm/) 🆕 | Instandhaltung | IE01, IW31, IP01, MTBF/MTTR |
| [`sap-qm`](plugins/sap-qm/) 🆕 | Qualitätssicherung | QA01, QP01, QA11, QM01, ISO/GMP/HACCP |
| [`sap-wm`](plugins/sap-wm/) 🆕 | Lagerverwaltung (ECC) | LT01, LS01N, ⚠️ S/4 veraltet |
| [`sap-ewm`](plugins/sap-ewm/) 🆕 | Erweiterte Lagerverwaltung | /SCWM/MON, Wave, RF |

### 👥 Personalwesen
| Plugin | Thema | Stichworte |
|--------|-------|----------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM On-Premise (ECC + H4S4) | PA30, PC00_M46, Gehalt, Steuern |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, Rekrutierung, LMS, RBP |

### 💻 Technologie
| Plugin | Thema | Stichworte |
|--------|-------|----------|
| [`sap-abap`](plugins/sap-abap/) | ABAP-Entwicklung | SE38, BAdI, CDS, RAP, ST22 |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | Brownfield, Greenfield, SUM, ATC |
| [`sap-btp`](plugins/sap-btp/) | Business Technology Platform | CAP, Fiori, OData, XSUAA |
| [`sap-basis`](plugins/sap-basis/) | BASIS-Verwaltung | STMS, SM50, PFCG, Kernel |

### 🇰🇷 Koreanische Spezialisierung + 🌍 Globaler Handel
| Plugin | Thema | Stichworte |
|--------|-------|----------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | BASIS — Korea-Edition | BC, Netzwerkisolation, E-Steuer-Rechnung, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | Globale Handelsservices | HS-Code, UNI-PASS, FTA, Ex-/Import |

### 🔁 Meta — Evidence Loop Orchestrator (v1.5.0 experimentell)
| Plugin | Thema | Rolle |
|--------|-------|------|
| [`sap-session`](plugins/sap-session/) 🔁 | Evidence Loop Orchestrator | Kombiniert 18 Plugins und 15 Agenten in Turn-bewusste Diagnose-Schleife. Nur Orchestrierungsschicht. |

---

## 🤖 15 Agenten

### Modulberater (14)
| Agent | Rolle | Eskalation bei |
|-------|------|---|
| `sap-fi-consultant` | Finanzbuchhaltung | Journalverbuchung, Abschluss, Steuern, GR/IR |
| `sap-co-consultant` | Kostenrechnung | Kostenstelle, Umlegung, CO-PA, Produktkalkulation |
| `sap-tr-consultant` 🆕 | Finanzierung | Liquidität, Bankabstimmung, DMEE |
| `sap-mm-consultant` | Materialverwaltung | Einkauf, Bestand, GR/IR, MIGO |
| `sap-sd-consultant` | Vertrieb & Versand | Bestellung, Lieferung, Fakturierung, Kreditlimit |
| `sap-pp-consultant` | Produktionsplanung | MRP, Stückliste, Fertigungsauftrag |
| `sap-hcm-consultant` 🆕 | Personalwesen | Gehalt, Zeitwirtschaft, Steuern, Jahresabschluss |
| `sap-pm-consultant` 🆕 | Instandhaltung | Ausrüstung, Instandhaltungsauftrag, MTBF/MTTR |
| `sap-qm-consultant` 🆕 | Qualitätssicherung | Inspektion, Freigabeergebnis, ISO/GMP |
| `sap-ewm-consultant` 🆕 | Lagerverwaltung | Wave, Kommissionierung, RF, WM-Migration |
| `sap-abap-developer` | ABAP Code-Überprüfung | Code-Qualität, Clean Core |
| `sap-basis-consultant` | Basis Triage | Dump, WP-Zeile, Transport |
| `sap-s4-migration-advisor` | S/4HANA Bereitschaft | Migrations-Fragen |
| `sap-integration-advisor` | Integrations-Architektur | RFC, IDoc, OData, CPI |

### 🎓 SAP-Tutor (1) 🆕
| Agent | Rolle | Eskalation bei |
|-------|------|---|
| `sap-tutor` 🆕 | Schulung für neue Mitarbeiter | SAP-Grundlagen, Modul-Intro, Terminologie |

---

## ⚙️ 18 Schrägstrich-Befehle

```bash
# Periodische Abschlüsse
/sap-fi-closing monthly <company-code>     # Monatliche Checkliste
/sap-quarter-close <cc> <quarter>          # Quartalsabschluss (IFRS + SOX)
/sap-year-end <cc> <year>                  # Jahresabschluss (Steuern + Audit)

# Debugging
/sap-migo-debug <error-code> <mv-type>     # MIGO-Verbuchungsfehler
/sap-payment-run-debug <vendor-code>       # F110-Zahlungslauf
/sap-transport-debug <TR-id>               # STMS-Fehlerdiagnose
/sap-tax-invoice-debug <type>              # E-Steuer-Rechnungsprobleme
/sap-performance-check <target>            # Leistungsdiagnose

# Analyse & Überprüfung
/sap-abap-review <file-path>               # ABAP Code-Überprüfung
/sap-s4-readiness --auto                   # S/4 Migrationsbereitschaft

# Evidence Loop
/sap-session-start "<symptom>"             # Turn 1 AUFNAHME
/sap-session-add-evidence <id> <files...>  # Turn 1/3
/sap-session-next-turn <session-id>        # Auto-Fortschritt Turn 2/4

# v1.6.0 🆕 — IMG / Best Practices / Diagnose
/sap-img-guide <module> <area>             # IMG-Konfigurationsanleitung
/sap-master-data-check [vendor|material]   # Stammdaten-Vorvalidierung
/sap-bp-review <module> [operational|all]  # Best-Practice-Compliance-Check
/sap-pm-diagnosis [equipment|symptom]      # Ausrüstungsausfalldiagnose
/sap-qm-inspection [inspection-lot|material] # Qualitätsprüfungsanalyse
```

---

## 🌐 Multi-AI-Kompatibilität (7 Tools)

| AI-Tool | Einstiegsdatei | Hinzugefügt |
|---------|-----------|-------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md` (native) | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | v1.2.0 |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | v1.3.0 |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | v1.3.0 |
| **Amazon Kiro IDE** 🆕 | [`AGENTS.md`](AGENTS.md) + [`.kiro/steering/`](.kiro/steering/) | **v1.5.0** |

**Design-Prinzip**: „Eine Wahrheitsquelle (SKILL.md) + N dünne Kompatibilitätsschichten". Unabhängig davon, welches KI-Tool Sie verwenden, bleiben **Universal Rules + Response Format + Knowledge Quality** konsistent.

---

## 🛡 Universelle Regeln

Alle SAP-Antworten **müssen** 8 Kernregeln befolgen:

1. **Niemals hardcodieren** Gesellschaftscodes, G/L-Konten oder Organisationseinheiten
2. **Immer fragen** nach Umgebungsinformationen (Release, Bereitstellung, Gesellschaftscode)
3. **Immer unterscheiden** ECC vs S/4HANA-Verhalten
4. **Transportanforderung erforderlich** für Konfigurationsänderungen
5. **Vor tatsächlichem Lauf simulieren** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **Niemals SE16N Datenbearbeitung empfehlen** in Produktion
7. **Immer T-Code + SPRO-Menüpfad bereitstellen**
8. 🆕 **Feldsprache verwenden** — Antworten in Nutzersprache (ko/en/zh/ja/de/vi); Feldterminologie bleibt Englisch

---

## 🌐 Mehrsprachig + Koreanische Feldsprachen-Ebene

Nicht nur Übersetzung, sondern **echtes koreanisches SAP-Arbeitsumgebungs-Vokabular** — akzeptiert Feldnative-Ausdrücke wie „코스트 센터" (Kostenstelle) mit Doppelnotation „(코스트 센터, KOSTL)".

- ✅ **19/19 Module** Schnellanleitungen + professionelle Übersetzung
- ✅ **80+ Begriff-Synonyme** ([data/synonyms.yaml](data/synonyms.yaml))
- ✅ **Abkürzungen + Geschäftszeithmarker**
- ✅ **41 T-Code koreanische Aussprachen**
- ✅ **62 natürlichsprachige Symptom-Index** (18 Module)
- ✅ 🆕 **Feldsprachen-Stilhandbuch**
- ✅ **sap-bc** — Korea BC-Berater Spezialisierung
- ✅ 🆕 **Synonym-Matching-Engine** — automatisch vereinheitlicht Varianten

### 🌐 Mehrsprachige Unterstützung (v1.7.0 — 6 Sprachen)
| Sprache | symptom-index | synonyms | Status |
|---|---|---|---|
| 🇰🇷 Koreanisch (ko) | 62/62 | 80+ | Primär |
| 🇬🇧 Englisch (en) | 62/62 | 80+ | Vollständig |
| 🇨🇳 Chinesisch (zh) | 62/62 | 40+ | 🆕 v1.7 |
| 🇯🇵 Japanisch (ja) | 62/62 | 40+ | 🆕 v1.7 |
| 🇩🇪 Deutsch (de) | 62/62 | 40+ | 🆕 v1.7 |
| 🇻🇳 Vietnamesisch (vi) | 62/62 | 40+ | 🆕 v1.7 |

---

## 📊 Datenbestände

| Bestand | Anzahl | Datei | Version |
|-------|-------|------|---------|
| Überprüfte T-Codes | **340+** | [`data/tcodes.yaml`](data/tcodes.yaml) | v1.6.0 |
| Überprüfte SAP-Hinweise | **57** | [`data/sap-notes.yaml`](data/sap-notes.yaml) | v1.6.0 |
| Symptom-Index | **62** (ko/en vollständig) | [`data/symptom-index.yaml`](data/symptom-index.yaml) | v1.6.0 |
| Synonyme | **80+ Begriffe** | [`data/synonyms.yaml`](data/synonyms.yaml) | v1.6.0 |
| T-Code-Aussprache | **41** (Koreanisch) | [`data/tcode-pronunciation.yaml`](data/tcode-pronunciation.yaml) | v1.5.0 |
| Evidence Loop Schemas | **5 JSON Schema** | [`schemas/`](schemas/) | v1.5.0 |
| 🆕 Periodische Abschlussfolge | **24 Schritte** | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) | **v1.6.0** |
| 🆕 Stammdaten-Regeln | **5 Stamm-Typen** | [`data/master-data-rules.yaml`](data/master-data-rules.yaml) | **v1.6.0** |
| 🆕 Branchenmatrix | **3 Branchen** | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) | **v1.6.0** |

### 🌐 Web-UI (v1.5.0 erweitert)
| Seite | Zweck |
|---|---|
| [`web/index.html`](web/index.html) | SAP-Hinweis Resolver — 50+ überprüfte Hinweise |
| 🆕 [`web/triage.html`](web/triage.html) | **Endbenutzer-Selbstdiagnose** — Symptomeingabe → Synonym-Erweiterung → Betreiber-Eskalation |
| 🆕 [`web/session.html`](web/session.html) | **Evidence Loop Betrachter** — state.yaml Betrachter |

Alle **statischen Seiten** (kein Server, keine SAP-Verbindung) — bereitbar auf GitHub Pages.

---

## ✅ Installationsverifizierung

```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# Führen Sie alle 11 Qualitätsstore aus
./scripts/lint-frontmatter.sh              # Frontmatter-Validierung
./scripts/check-marketplace.sh             # marketplace.json Struktur
./scripts/check-hardcoding.sh --strict     # Keine hardcodierten Gesellschaftscodes
./scripts/check-tcodes.sh --strict         # T-Code-Registrierung
./scripts/check-links.sh --strict          # Interne Link-Validierung
./scripts/check-ecc-s4-split.sh --strict   # ECC/S4-Trennung
./scripts/build-multi-ai.sh --check        # Kompatibilitätsschicht-Drift
./scripts/check-img-references.sh          # 🆕 IMG-Konfigurationsanleitungen
./scripts/check-best-practices.sh          # 🆕 Best Practice 3-Schicht
./scripts/check-industry-refs.sh           # 🆕 Branchenanleitungen
```

Alle Store Pass = ✅ Gebrauchsbereit. Gleiche Schritte laufen automatisch in CI.

---

## 🎓 Lernpfade

| Stufe | Pfad |
|-------|------|
| 🆕 **Anfänger** | [Anleitung — 15 Min](docs/tutorial.md) → [Häufig gestellte Fragen](docs/faq.md) |
| 📘 **Mittelstufe** | [5 echte Szenarien](docs/scenarios/) → [Glossar](docs/glossary.md) |
| 🏗 **Fortgeschrittene** | [Architektur](docs/architecture.md) → [Multi-AI-Handbuch](docs/multi-ai-compatibility.md) |
| 🤝 **Mitwirkende** | [CONTRIBUTING](CONTRIBUTING.md) → [Plugin-Gerüstbau](scripts/new-plugin.sh) |
| 🔒 **Sicherheit** | [SECURITY](SECURITY.md) → [CoC](CODE_OF_CONDUCT.md) |

---

## 🏛 Zugehörige Projekte

- [Amazon Kiro IDE](https://kiro.dev/) — native sapstack-Integration seit v1.5.0
- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0 Gerüstbau
- [SAP-Hilfeportal](https://help.sap.com/) — offizielle Dokumentation
- [SAP-Supportportal](https://launchpad.support.sap.com/) — SAP-Hinweise Quelle
- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — DESIGN.md Inspiration

---

## 📜 Lizenz

MIT-Lizenz — siehe [LICENSE](LICENSE) für Details.

**Kommerzielle Nutzung, Änderung und Verteilung alle erlaubt** mit Beibehaltung der Copyright-Mitteilung.

---

## 🤝 Mitwirkende

- 🐛 **Fehlermeldungen**: [Issues](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ **Funktionsanfragen**: [Feature Request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 📦 **Neue Modulvorschläge**: [New Module](https://github.com/BoxLogoDev/sapstack/issues/new?template=new_module.md)
- 💬 **Diskussion**: [Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 **Mitwirkender-Leitfaden**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Hergestellt mit 🇰🇷 von [@BoxLogoDev](https://github.com/BoxLogoDev)**

Gebaut für koreanische SAP-Berater, geteilt mit der globalen Community.

[⬆ Zurück nach oben](#-sapstack)

</div>
