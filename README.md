# sapstack — SAP Skills & Agents for Claude Code

Production-ready Claude Code plugin collection covering **all SAP modules**,
applicable to **any company** running SAP ECC 6.0 or S/4HANA.

No company-specific hardcoding — every skill dynamically adapts to the user's environment.

---

## Installation

Add to Claude Code in one command:

```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
```

Install individual plugins:

```bash
/plugin install sap-fi@sapstack
/plugin install sap-abap@sapstack
```

Install all plugins at once:

```bash
/plugin install sap-fi@sapstack sap-co@sapstack sap-tr@sapstack \
  sap-mm@sapstack sap-sd@sapstack sap-pp@sapstack \
  sap-hcm@sapstack sap-sfsf@sapstack sap-abap@sapstack \
  sap-s4-migration@sapstack sap-btp@sapstack sap-basis@sapstack
```

**Team setup** — add to `.claude/settings.json` for automatic availability:

```json
{
  "extraKnownMarketplaces": [
    { "name": "sapstack", "url": "https://github.com/BoxLogoDev/sapstack" }
  ]
}
```

---

## Available Plugins (12)

### Core Financials

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-fi` | FB01, F110, MIRO, period close, AP, AR, GL, AA, tax, GR/IR | Financial Accounting — GL, AP, AR, Asset Accounting |
| `sap-co` | cost center, KSU5, KO88, CK11N, CO-PA, settlement | Controlling — CCA, PCA, IO, Product Costing, CO-PA |
| `sap-tr` | FF7A, FF7B, liquidity, FLQDB, cash position, bank statement | Treasury & Cash Management |

### Logistics

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-mm` | MIGO, MIRO, ME21N, GR/IR, purchasing, inventory | Materials Management |
| `sap-sd` | VA01, VF01, billing, pricing, credit, delivery | Sales & Distribution |
| `sap-pp` | MRP, MD01, CO01, BOM, routing, production order | Production Planning |

### Human Resources

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-hcm` | HCM, PA30, infotype, payroll, PC00, time, H4S4 | HCM On-Premise (ECC + H4S4) |
| `sap-sfsf` | SuccessFactors, EC, ECP, Recruiting, RBP, OData | SAP SuccessFactors — all modules |

### Technology

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-abap` | ABAP, SE38, BAdI, CDS, RAP, ST22, clean core, ATC | ABAP Development — classic + RAP |
| `sap-s4-migration` | migration, brownfield, readiness check, BP migration, SUM | ECC → S/4HANA Migration |
| `sap-btp` | BTP, CAP, Fiori, OData, Integration Suite, XSUAA | SAP BTP Development |
| `sap-basis` | BASIS, STMS, transport, PFCG, SM50, performance | BASIS Administration |

---

## How Skills Activate

Once installed, skills activate automatically based on conversation context.
No manual invocation needed:

- *"Why is MIRO blocking on invoice amount?"* → `sap-fi` activates
- *"Write an ABAP BAdI for MM goods receipt"* → `sap-abap` activates
- *"Our FF7A is missing vendor payments"* → `sap-tr` activates
- *"How do I migrate vendors to Business Partner?"* → `sap-s4-migration` activates
- *"Employee Central field not visible in RBP"* → `sap-sfsf` activates

You can also invoke directly with a slash command:

```
/sap-fi How do I clear open items at year-end?
/sap-abap Create a CDS view for FI line items
```

---

## Universal Rules (All Skills Follow These)

1. **Never hardcode** company codes, G/L accounts, or org units
2. **Always ask** for environment (ECC / S/4HANA / release / industry) before answering
3. **Always distinguish** ECC vs S/4HANA behavior where they differ
4. **Transport request required** for any configuration change
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, etc.
6. **Never recommend** SE16N data changes in production
7. **Provide T-code + menu path** for every action

---

## Repository Structure

```
sapstack/
├── CLAUDE.md                              ← Universal rules for all skills
├── README.md                              ← This file
├── .claude-plugin/
│   └── marketplace.json                   ← Plugin catalog
└── plugins/
    ├── sap-fi/skills/sap-fi/
    │   ├── SKILL.md
    │   └── references/
    │       ├── tcode-reference.md
    │       └── closing-checklist.md
    ├── sap-co/skills/sap-co/
    │   ├── SKILL.md
    │   └── references/period-end.md
    ├── sap-tr/skills/sap-tr/
    │   ├── SKILL.md
    │   └── references/liquidity-guide.md
    ├── sap-mm/skills/sap-mm/SKILL.md
    ├── sap-sd/skills/sap-sd/SKILL.md
    ├── sap-pp/skills/sap-pp/SKILL.md
    ├── sap-hcm/skills/sap-hcm/
    │   ├── SKILL.md
    │   └── references/payroll-guide.md
    ├── sap-sfsf/skills/sap-sfsf/
    │   ├── SKILL.md
    │   └── references/migration-path.md
    ├── sap-abap/skills/sap-abap/
    │   ├── SKILL.md
    │   └── references/
    │       ├── clean-core-patterns.md
    │       └── code-review-checklist.md
    ├── sap-s4-migration/skills/sap-s4-migration/
    │   ├── SKILL.md
    │   └── references/simplification-items.md
    ├── sap-btp/skills/sap-btp/SKILL.md
    └── sap-basis/skills/sap-basis/SKILL.md
```

---

## Compatibility

| Plugin | ECC 6.0 | S/4HANA OP | RISE | Cloud PE |
|--------|---------|------------|------|----------|
| sap-fi | ✓ | ✓ | ✓ | ✓ |
| sap-co | ✓ | ✓ | ✓ | ✓ |
| sap-tr | ✓ | ✓ | ✓ | △ |
| sap-mm | ✓ | ✓ | ✓ | ✓ |
| sap-sd | ✓ | ✓ | ✓ | ✓ |
| sap-pp | ✓ | ✓ | ✓ | ✓ |
| sap-hcm | ✓ | ✓ (H4S4) | ✓ | ✗ |
| sap-sfsf | ✗ | ✓ | ✓ | ✓ |
| sap-abap | ✓ | ✓ | ✓ | ✗ (RAP only) |
| sap-s4-migration | ✓ | ✓ | ✓ | ✗ |
| sap-btp | ✗ | ✓ | ✓ | ✓ |
| sap-basis | ✓ | ✓ | △ | ✗ |

△ = Limited — some features managed by SAP in cloud environments

---

## Contributing

Contributions welcome! To add a new plugin:

1. Create directory: `plugins/sap-{module}/skills/sap-{module}/SKILL.md`
2. Follow the SKILL.md format (YAML frontmatter + markdown body)
3. Description must be in third person, include trigger keywords, max 1024 chars
4. No hardcoded company-specific values
5. ECC vs S/4HANA differences must be explicitly documented
6. Add entry to `.claude-plugin/marketplace.json`
7. Submit pull request with test scenario examples

---

## License

MIT License — see LICENSE file for details.

**Maintained by [@BoxLogoDev](https://github.com/BoxLogoDev).**
Last updated: 2026-04-11
