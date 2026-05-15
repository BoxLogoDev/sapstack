<!-- Claude-authored draft (community review welcome) -->

# sap-ibp Quick Guide (English)

> SAP IBP (Integrated Business Planning) — cloud-native demand/supply planning platform for the S/4 era. APO successor.

## 🔑 Environment Intake

1. **IBP release** — quarterly (2402 / 2308 / 2305, etc.)
2. **Deployment** — BTP SaaS only (no on-premise)
3. **Modules** — Demand / S&OP / Supply / Inventory / Response / Control Tower
4. **Integration** — S/4HANA → CPI Integration Content, or BW
5. **Excel UI version** — IBP Excel Add-In on the planner workstation
6. **Planning Area** — standard (SAP7, SAPIBP1) or custom

## 📚 Module Overview

| Module | Purpose |
|---|---|
| **Demand** | Statistical forecast · demand sensing (DS) |
| **S&OP** | Sales & operations — demand/supply/finance integration |
| **Supply** | Multi-level supply chain (heuristic/optimizer) |
| **Inventory** | Safety stock · reorder optimization |
| **Response & Supply** | ATP · allocation · gating |
| **Control Tower** | KPI · anomaly detection |

## 🌍 Locale Considerations

### Demand forecast patterns
- **Lunar holidays / regional peaks**: register in Time Event Master
- **Short-shelf-life items**: food/cosmetics/semiconductor → short horizon
- **EOL/NPI**: explicit Product Lifecycle modeling
- **Promotion split**: baseline vs event lift

### Multi-plant operations
- HQ + subsidiaries → multi-country model
- **Currency**: local + USD global conversion
- **Transfer pricing**: integrated into S&OP

### Common scenarios
- "New model launch → notify component suppliers early (PIR release)"
- "Raw-material import dependency → FX scenario analysis"
- "Shorter lead-time demand → inventory vs response balance"

## 🔧 Key UI / T-codes

IBP is BTP SaaS — no SAP GUI T-codes. Instead:

| UI | Use |
|---|---|
| **IBP Web UI** | Master data · configuration · execution |
| **IBP Excel Add-In** | Daily planning (planner) |
| **IBP App (Fiori)** | Mobile KPI |
| **SAP Cloud ALM** | Monitoring |

Integration-side S/4 T-codes:
- **MD01N/MD02** — MRP (after PIR receipt)
- **CO40/CO41** — production order conversion (PIR → Production Order)
- **VOFM/VFX3** — sales orders (Response & Supply results)

## 🚨 Common Issues

### "Forecast not generated"
- Cause: missing operator definition, insufficient history, master mapping error
- Diagnose:
  1. Planning Area Configuration → Forecast Model
  2. Planning Run log (Application Job Monitor)
  3. Master mapping (Product, Location)

### "Excel UI is slow"
- Cause: Planning View too large, too many concurrent users
- Fix:
  1. Reduce Planning View (≤ 10K cells)
  2. Use batch refresh
  3. Split views per module

### "CPI integration fails"
- Cause: message mapping error, ID mismatch after S/4 master change
- Diagnose: CPI tenant → Monitor → Messages → classify errors
- Fix: IBP Configuration → External Codes remap

## 🔄 Pairing with PP

S/4 PP executes the plan IBP creates:
- **PIR (Planned Independent Requirement)** — demand → released to S/4 PP
- **MRP Run (MD01N)** — material planning from PIR
- **Production Order conversion** — CO40/CO41

When broken, trace which stage failed:
1. IBP → PIR release OK? (IBP Application Job)
2. S/4 → PIR visible in MD63?
3. S/4 MRP run result?

## 📚 References

- `references/forecast-models.md` — statistical model comparison (TBD)
- `references/cpi-integration.md` — CPI message mapping (TBD)
- `../../../sap-pp/skills/sap-pp/SKILL.md` — PP integration
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CPI guide

## ⚠️ Out of Scope

- Short-term production scheduling (PP/DS, MES)
- Non-SAP tools (Anaplan, o9, Kinaxis)
- APO operations (deprecated; APO users see IBP migration guide)
