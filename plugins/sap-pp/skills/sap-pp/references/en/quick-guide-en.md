<!-- Claude-authored draft (community review welcome) -->

# sap-pp Quick Guide (English)

## 🔑 Environment Intake
1. Production type (Discrete / Process / Repetitive / KANBAN)
2. MRP type (Classic MRP / MRP Live — S/4)
3. Plant & production org (user-provided)

## 📚 Essentials

### Master Data
- **CS01/CS02**: BOM (bill of materials)
- **CA01/CA02**: Routing
- **CR01/CR02**: Work center
- **MD04**: Stock/Requirements list

### MRP
- **MD01**: MRP run (total — generally discouraged)
- **MD02**: MRP run (single material)
- **MD03**: MRP run (single material, multi-level)
- **MD41/MD43**: Planning evaluation
- S/4HANA: **MRP Live** (CDS + HANA push-down)

### Production Orders
- **CO01/CO02**: Create/change production order
- **CO11N**: Confirmation
- **CO15**: Cancel confirmation
- **COGI**: Process automatic-GR failure list

### Repetitive Manufacturing
- **MFBF**: Backflush
- **MF50**: Planning table

## 🌍 Locale Considerations
- **Manufacturing-heavy regions** — PP is a core module
- **Subcontracting** is complex — distinguish inbound/outbound consignment
- **Delivery control** requirements often strict (OEM supplier standards)

## ⚠️ Cautions
- Total MRP (MD01) only **outside operating hours**
- After BOM change, low-level code recalculation required (**OMIW**)
