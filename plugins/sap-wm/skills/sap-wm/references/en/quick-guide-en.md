<!-- Claude-authored draft (community review welcome) -->

# sap-wm Quick Guide (English)

## 🔑 Environment Intake

Before SAP WM (Warehouse Management) work, confirm:

### 1. SAP release & support
- **ECC 6.0**: WM fully supported
- **S/4HANA**: WM is **deprecated** — forced transition to EWM

### 2. WM configuration mode
- **Standard WM**: simple storage, small DC
- **Lean WM**: advanced features, large DC

### 3. Barcode/RF setup
- RF terminal usage
- Barcode printer & label policy
- Mobile network dependency

### 4. Logistics environment
- **E-commerce delivery**: B2C high daily volume
- **B2B distribution**: bulk GR/GI
- **Returns center**: returns + quality inspection

## 📚 Key T-codes & Roles

### Inbound
| T-code | Function |
|--------|------|
| **LT01** | Goods Receipt |
| **LT04** | GR status |
| **LT03** | GR cancel/correct |

Flow: PO reference → qty input/scan → bin suggestion → confirm (instant stock update).

### Storage
| T-code | Function |
|--------|------|
| **LS01N** | Stock overview |
| **LS01** | Stock by bin |

LS01N: real-time stock per bin, damaged-stock tracking, slow-moving alert.

### Outbound
| T-code | Function |
|--------|------|
| **LB01** | Picking list creation |
| **LI01N** | Goods Issue |
| **LI04** | GI status |

Flow: SO reference → LB01 picking instruction (barcode) → pick + scan confirm → LI01N final GI → FI stock decrement.

## 🌍 Locale Considerations

### Online DC daily operations
- Daily volume: large fulfillment centers
- Morning GR (LT01) + picking prep (LB01) → afternoon picking + GI (LI01N) → evening carrier pickup + close

### Barcode/RF operations
- Barcode label auto-print at GR → attach to bin
- RF terminal: warehouse team real-time pick/GI scan
- Network reliability: weak-WiFi zones may need offline mode

### Returns handling
- Process: customer return → GR → quality inspection → re-issue or scrap
- Separate return-zone bins, tracked in LS01N
- High e-commerce return rate → efficient WM handling essential

## ⚠️ WM vs EWM & Transition

| Item | WM (ECC) | EWM (S/4HANA) |
|------|---------|--------------|
| Support | ✓ (ECC end-of-life ~2027) | ✓ (recommended) |
| Scalability | medium | high (multi-warehouse) |
| Barcode/RF | basic | advanced (DAS, mobile) |
| Mobile app | limited | full |
| Integration | MM/SD | MM/SD/TM full |

Transition: ECC+WM → S/4HANA+EWM recommended (6-12 month project, team retraining).

## Common Issues

| Symptom | Cause | Diagnose | Fix |
|---------|------|----------|-----|
| GR delay | bin error/allocation | LT01 log | reconfigure storage strategy |
| Missing GI | LI01N not confirmed | LI04 | bulk confirm |
| Barcode error | RF battery/network | terminal log | check WiFi, charge |
| Stock mismatch | unconfirmed GR/GI | LS01N vs physical | cycle count |

## 📊 KPI

- GR throughput (LT01 daily count)
- GI accuracy (LI01N error rate, target < 1%)
- Stock accuracy (LS01N vs physical, target < 0.5%)

## Process Flows (detail)

Inbound (LT01):
```
1. Enter document (PO reference)
2. Input/scan GR qty
3. Bin auto-suggest or manual
4. Confirm → instant stock master update
```

Outbound (LB01 → LI01N):
```
1. SO reference or manual creation
2. LB01: picking instruction (barcode)
3. Warehouse: pick + barcode scan confirm
4. LI01N: final GI → FI stock decrement
```

Daily ops:
```
Morning: GR (LT01) + picking prep (LB01)
Afternoon: pick execution + GI (LI01N)
Evening: carrier pickup + close
```

S/4HANA transition:
```
Now: ECC 6.0 + WM
Option 1: keep ECC (until ~2027 EOL) — risk: no new tech
Option 2: S/4HANA + EWM (recommended) — 6-12 month project
```

## Related
- `../../SKILL.md` — full WM guide
- `docs/enterprise/wm-ewm-migration.md` — S/4HANA transition
- `references/img/wm-configuration.md` — IMG setup
