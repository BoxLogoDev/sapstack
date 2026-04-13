<div align="center">

# 🏛 sapstack

### AI-Codierungsassistent für SAP-Unternehmensoperationen

**20 Plugins · 16 Agenten · MCP-Laufzeit · VS Code-Erweiterung · 6 Sprachen · Konformitätsbereit**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## Was ist sapstack?

**sapstack** ist eine Open-Source-Plattform, die **SAP-Fachkompetenz** in AI-Tools wie Claude, Copilot und Cursor einbringt. Sie umfasst den gesamten SAP-Operationszyklus — **Konfigurieren → Implementieren → Betreiben → Diagnostizieren → Optimieren** — mit evidenzgestützter Diagnostik.

```
┌──────────────────────────────────────────────────────────────┐
│ SAP-Betreiber ─────┐                                         │
│                  ├─→ [AI-Tool] ←── sapstack ──→ SAP-Know-how│
│ Trainer ─────────┤      ↓                      + IMG-Guides  │
│                  ├── Evidence Loop             + Best Pract. │
│ Berater ────────┘    (4-Turn-Diagnose)        + Compliance  │
└──────────────────────────────────────────────────────────────┘
```

---

## Kernfunktionen

### 🎯 Vollständige SAP-Modulabdeckung
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4-Migration · GTS · BC · **Cloud PE** · Session

### 🤖 15 Spezialisten-Agenten + 1 SAP-Tutor
11 Modulberater + ABAP-Entwickler + BASIS-Berater + Integrations-Advisor + S/4-Migrations-Advisor + **SAP-Tutor** (Onboarding neuer Mitarbeiter)

### 🔁 Evidence Loop (v1.5+)
Diagnose ohne Live-SAP-Zugriff — **Aufnahme → Hypothese → Erfassung → Verifikation** 4-Turn-Struktur, Falsifizierungskriterien erforderlich, Rollback-Paar obligatorisch

### 🏗 IMG-Konfigurationsrahmen (v1.6+)
55+ SPRO-basierte Konfigurationshandbücher — Schritte, ECC vs S/4 Unterschiede, Validierungsmethoden enthalten

### 📋 3-Schicht-Best-Practices
**Betrieb** (täglich) · **Periodenabschluss** (Abschluss) · **Governance** (Audit) — systematisch über 11 Module angewendet

### 🌐 6-Sprachunterstützung (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt

### ☁️ S/4HANA Cloud PE-ready
Clean Core · Key User Extensibility · 3-Schicht-Erweiterung · Fit-to-Standard · Cloud ALM

### 🚀 MCP-Laufzeit (v2.0+)
`@boxlogodev/sapstack-mcp` — vollständige Evidence Loop in Claude Desktop ausführen. 5 Lesewerkzeuge + 3 Schreibwerkzeuge.

### 💻 VS Code-Erweiterung (v2.0+)
Sitzungs-Seitenleiste · YAML-Validierung · Webview-Rendering · Datei-Watcher

### 🛡 Konformitätsbereit (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · Air-gapped-Bereitstellung · Automatisches PII-Masking

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

### VS Code-Erweiterung
Im VS Code Marketplace nach "sapstack" suchen → Installieren

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Andere Plattformen (Codex / Copilot / Cursor / Continue.dev / Aider)
Repository klonen → automatisch erkannt. Details: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universelle Regeln

1. **Gesellschaftscodes niemals hardcodieren** — Keine festen Gesellschaftscodes, GL-Konten, Kostenstellen oder Organisationseinheiten
2. **Umgebungsaufnahme zuerst** — SAP-Release, Bereitstellungsmodell und Unternehmensstruktur zuerst bestätigen
3. **ECC vs S/4HANA explizit unterscheiden** — Versionsspezifische Verhaltensweisen müssen klar unterschieden werden
4. **Transportanforderung erforderlich** — Alle Produktionsänderungen benötigen eine Transportanforderung
5. **Vor tatsächlicher Ausführung simulieren** — AFAB, F.13, FAGL_FC_VAL, MR11, F110 zuerst im Test ausführen
6. **Keine SE16N-Bearbeitungen** — Direktes Ändern von Produktionsdaten nicht empfohlen
7. **T-Code + SPRO-Pfad** — Beide für jede Aktion bereitstellen
8. **Evidenzgestützte Diagnostik** — Jede Hypothese benötigt Falsifizierungskriterien

---

## Lernpfad

| Stufe | Pfad |
|-------|------|
| 🆕 **Anfänger** | [Anleitung (15 Min.)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **Praktisch** | [5 Szenarien](docs/scenarios/) → [Glossar](docs/glossary.md) |
| 🏗 **Fortgeschrittene** | [Architektur](docs/architecture.md) → [Multi-AI-Handbuch](docs/multi-ai-compatibility.md) |
| 🔒 **Sicherheit** | [SECURITY.md](SECURITY.md) → [Konformität](docs/compliance/) |
| 🤝 **Beitragen** | [CONTRIBUTING](CONTRIBUTING.md) → [Roadmap](docs/roadmap.md) |

---

## Datenbestände

| Bestand | Menge | Datei |
|-------|------|------|
| Validierte T-codes | 340+ | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Natural Language Symptom Index | 62 (6 Sprachen) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP-Hinweise | 57+ | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Mehrsprachige Synonyme | 80+ Begriffe × 6 Sprachen | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Periodenabschlussfolge | 24 Schritte | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Branchenmatrix | 3 Branchen | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Plugin-Katalog

| Bereich | Plugins |
|--------|---------|
| 💰 **Finanzen** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistik** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Personalwirtschaft** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Technologie** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| 🌍 **Global** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Lizenz & Beiträge

**MIT-Lizenz** — frei für kommerzielle und nichtkommerzielle Nutzung. Namensnennung erforderlich.

- 🐛 [Bug melden](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Feature anfordern](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Diskussion starten](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Beitragsleitfaden](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Entwickelt für SAP-Profis weltweit · Open Source für die globale Community

</div>
