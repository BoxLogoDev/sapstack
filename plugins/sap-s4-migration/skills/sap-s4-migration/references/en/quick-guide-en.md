<!-- Claude-authored draft (community review welcome) -->

# sap-s4-migration Quick Guide (English)

> Concise reference for ECC → S/4HANA migration. Full details in `SKILL.md` and `references/simplification-items.md`.

## 🔑 Environment Intake

1. Current ECC version (EhP) + DB + Unicode status
2. Target S/4HANA release (2022/2023/2024)
3. Deployment model (On-Prem / RISE / Cloud PE)
4. Country localization dependency

## 🛣 Three Paths

| Path | Description | Best Fit |
|------|-------------|----------|
| **Brownfield (System Conversion)** | In-place conversion of existing system | Large enterprise preserving process |
| **Greenfield (New Implementation)** | New build + data migration | Mid-size doing process redesign |
| **Selective Data Transition** | Per-org/period/function selective migration | Multi-subsidiary phased rollout |

## ⚠️ Top Risks

### Brownfield
- Mass custom-code adaptation (ACDOCA conversion)
- Z-programs referencing BSEG directly → must move to ACDOCA
- Country-specific CVI validation

### Greenfield
- Data migration scope & strategy
- Master data cleansing (poor quality = harder migration)
- Process redesign decision speed

### Selective
- Scope definition complexity
- Mid-state data consistency validation

## 📚 Key Tools

- **Readiness Check**: `/SDF/RC_START_CHECK` — auto-analyzes Simplification Item impact
- **SUM (Software Update Manager)**: primary Brownfield tool
- **DMO (Database Migration Option)**: DB + SW combined conversion
- **SUMCT**: Unicode Conversion (ECC non-Unicode → Unicode)
- **SAP Note Analyzer**: target release Note impact analysis

## 🌍 Localization Risks

- **E-invoicing integration** — provider re-integration often required (consider SAP DRC)
- **Country-specific CVI Simplification** — local tax account restructuring
- **Country Version Notes** — large note volumes for specific countries
- **Local SI dependency** — accelerators from regional SI vendors

## ⚠️ Mandatory Steps
1. Run **Readiness Check** (AS-IS impact)
2. Run **Custom Code ATC** (`S4HANA_READINESS` variant)
3. **Dual Cutover Simulation** — minimum 2 cycles
4. **Business UAT** — STG environment recommended

## 🤖 Related Agent / Command
- `agents/sap-s4-migration-advisor.md`
- `/sap-s4-readiness --auto`

## 📖 References
- `../simplification-items.md`
- `../atc-readiness-check.md`
