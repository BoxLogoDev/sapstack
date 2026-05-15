<!-- Claude-authored draft (community review welcome) -->

# sap-ewm Quick Guide (English)

## 🔑 Environment Intake

Before SAP EWM (Enhanced Warehouse Management) work, confirm:

### 1. SAP platform & deployment
- **S/4HANA On-Premise**: EWM 2020+ recommended
- **RISE (Private Cloud)**: full EWM + auto-update
- **Cloud Public Edition**: limited EWM (basic only)

### 2. EWM deployment architecture
- **Embedded**: same instance as S/4HANA (small/mid)
- **Decentralized**: independent instance + RFC (large, recommended for > 5,000 lines/day)

### 3. DC scale & complexity
- Daily volume (inbound/outbound lines)
- Multi storage strategy (FIFO/LIFO), cross-dock, returns center
- MM/SD/TM integration depth

### 4. Locale requirements
- **E-commerce**: same/next-day delivery → automated picking/sorting
- **Regulation**: shipping-address encryption, e-proof-of-delivery (carrier integration)
- **Operations**: night/24h operation → system stability critical

## 📚 Key T-codes & Roles

### Monitoring
| T-code | Function |
|--------|------|
| **/SCWM/MON** | Integrated monitoring dashboard |
| **/SCWM/ACT** | Activity display |
| **/SCWM/AREA** | Zone & bin status |

### Inbound
| T-code | Function |
|--------|------|
| **/SCWM/GOODS_IN** | Goods receipt |
| **/SCWM/PUT_AWAY** | Put-away work instruction |
| **/SCWM/PUTAWAY_MON** | Put-away monitoring |

Flow: MM PO → EWM → /SCWM/GOODS_IN inbound delivery → scan + QC → /SCWM/PUT_AWAY auto-bin → RF confirm.

### Outbound
| T-code | Function |
|--------|------|
| **/SCWM/WAVE** | Wave planning & execution |
| **/SCWM/PICK** | Picking |
| **/SCWM/PACK** | Packing & label |
| **/SCWM/SHIP** | Shipment confirmation |

Flow: SD SO → EWM → /SCWM/WAVE grouping → /SCWM/PICK (barcode) → /SCWM/PACK box suggestion → /SCWM/SHIP carrier proof-of-delivery.

### RF / Mobile
| T-code | Function |
|--------|------|
| **/SCWM/RFUI** | RF terminal basic |
| **/SCWM/RFUI_WAVE** | RF picking (wave) |
| **/SCWM/MOBILE** | Mobile app (Fiori) |

### Settlement / Interface
| T-code | Function |
|--------|------|
| **/SCWM/PI** | Physical interface (proof of delivery) |
| **/SCWM/TM_INTERFACE** | Transport Management link |
| **/SCWM/CONF** | Delivery confirmation + FI posting |

## 🌍 Locale Considerations

### Online fulfillment-center daily ops
- Morning (06-12): inbound focus — /SCWM/GOODS_IN + /SCWM/PUT_AWAY (target: receipt→bin < 2h)
- Midday (12-17): picking focus — /SCWM/WAVE split into 3-4 waves, parallel /SCWM/PICK + /SCWM/PACK (300-500 lines/h)
- Evening (17-22): carrier pickup — /SCWM/SHIP + /SCWM/PI (proof-of-delivery API → customer tracking)

### Automation integration
- Sorter: /SCWM/PACK sorter-exit instruction
- AS/RS: /SCWM/PUT_AWAY auto-bin allocation

### Returns center
- /SCWM/GOODS_IN (separate return-zone bin) → QC → re-issue or scrap
- High e-commerce return rate → dedicated tracking essential

### Address privacy
- Encrypt shipping address; picking team sees only proof-of-delivery number
- Purge addresses after retention period

## ⚠️ Embedded vs Decentralized

| | Embedded | Decentralized |
|---|---|---|
| Pros | simple, low cost | high throughput, independent, scalable |
| Cons | high system load, limited scale | complex config, RFC management |
| Recommend | DC < 2,000 lines/day | DC > 5,000 lines/day |

Reference arch: S/4HANA (Core) → RFC/OData → EWM (Decentralized) → API/EDI → TM → Sorter/RF/carrier.

## Common Issues

| Symptom | Cause | Diagnose | Fix |
|---------|------|----------|-----|
| Picking delay (wave backlog) | bin shortage / item placement | /SCWM/MON | optimize put-away (FIFO) |
| Proof-of-delivery not linked | /SCWM/PI fail / carrier API | /SCWM/PI log | check carrier API |
| RF error (goods not found) | scan data mismatch | RF log | recheck barcode |
| Stock mismatch | unconfirmed GR/GI | /SCWM/MON | cycle count |
| Performance degradation | volume > capacity | /SCWM/MON perf tab | adjust wave size / scale |

## 📊 KPI

- Inbound throughput (100-200/h)
- Picking accuracy (/SCWM/PICK error < 0.5%)
- Delivery time (order → proof-of-delivery < 30 min)
- Stock accuracy (> 99.5%)
- System availability (99.9% SLA)

## Process Flows (detail)

Inbound:
```
MM PO → EWM auto-transfer
/SCWM/GOODS_IN: register inbound delivery
scan + QC → return instruction if abnormal
/SCWM/PUT_AWAY: auto bin allocation → RF confirm
```

Outbound:
```
SD SO → EWM auto-transfer
/SCWM/WAVE: group orders into 3-4 waves
/SCWM/PICK: pick (barcode) → RF scan confirm
/SCWM/PACK box suggest → /SCWM/SHIP carrier PoD
```

RF work:
```
1. Login → select work type (GOODS_IN/PICK/PACK)
2. Scan product barcode or enter location
3. System compares expected qty → confirm or warn
4. Confirm: RF button → instant server update
```

Daily ops:
```
06-12 Inbound: /SCWM/GOODS_IN + /SCWM/PUT_AWAY
12-17 Picking: /SCWM/WAVE + /SCWM/PICK + /SCWM/PACK
17-22 Shipping: /SCWM/SHIP + /SCWM/PI carrier pickup
```

Reference architecture:
```
S/4HANA (Core) → RFC/OData
  → EWM (Decentralized) → API/EDI
  → TM → Sorter / RF / carrier system
```

Returns:
```
Customer return → /SCWM/GOODS_IN (return-zone bin)
QC → good: re-issue / defect: scrap or return
Track in /SCWM/MON; purge address after retention
```

## Related
- `../../SKILL.md` — full EWM guide
- `references/img/ewm-configuration.md` — IMG setup
- `docs/enterprise/ewm-operations-korea.md` — operations guide
