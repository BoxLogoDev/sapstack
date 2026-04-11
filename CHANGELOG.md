# Changelog

All notable changes to **sapstack** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-11

### Added
- Initial release of **sapstack** — Universal SAP skills and agents for Claude Code.
- 12 plugin modules covering the full SAP functional + technical stack:
  - **Core Financials**: `sap-fi`, `sap-co`, `sap-tr`
  - **Logistics**: `sap-mm`, `sap-sd`, `sap-pp`
  - **Human Resources**: `sap-hcm`, `sap-sfsf`
  - **Technology**: `sap-abap`, `sap-s4-migration`, `sap-btp`, `sap-basis`
- Universal rules (`CLAUDE.md`) enforcing no-hardcoding and ECC vs S/4HANA distinction.
- Claude Code plugin marketplace catalog (`.claude-plugin/marketplace.json`).
- Reference guides bundled with selected plugins:
  - `sap-fi` — T-code reference, closing checklist
  - `sap-co` — Period-end procedures
  - `sap-tr` — Liquidity planning guide
  - `sap-hcm` — Payroll guide
  - `sap-sfsf` — ECC → SFSF migration path
  - `sap-abap` — Clean core patterns, code review checklist
  - `sap-s4-migration` — Simplification items catalog

### Compatibility
- SAP ECC 6.0 (all EhPs), S/4HANA On-Premise, RISE with SAP, Cloud Public Edition (where applicable).

[1.0.0]: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.0.0
