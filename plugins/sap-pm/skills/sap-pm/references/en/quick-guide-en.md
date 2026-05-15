<!-- Claude-authored draft (community review welcome) -->

# SAP PM Quick Guide (English)

## Environment Intake
1. SAP release (ECC EhP / S/4HANA year)
2. Deployment model (On-Premise / RISE / Cloud PE)
3. Planning Plant
4. Industry (manufacturing, chemical, energy, utilities)

## Key T-codes

### Equipment Master
| T-code | Use |
|--------|------|
| IE01 | Create equipment |
| IE02 | Change equipment |
| IE03 | Display equipment |
| IL01 | Create functional location |
| IL02 | Change functional location |

### Maintenance Notification
| T-code | Use |
|--------|------|
| IW21 | Create notification (breakdown report) |
| IW22 | Change notification |
| IW28 | Notification list |
| IW29 | Notification analysis |

### Maintenance Order
| T-code | Use |
|--------|------|
| IW31 | Create order (work order issuance) |
| IW32 | Change order |
| IW38 | Order list |
| IW39 | Order analysis |

### Preventive Maintenance
| T-code | Use |
|--------|------|
| IP01 | Create maintenance plan |
| IP10 | Schedule maintenance plan |
| IP30 | Deadline monitoring |
| IA01 | Create task list |

### Settlement / KPI
| T-code | Use |
|--------|------|
| KO88 | Order settlement |
| IW65 | Counter reading |

## Locale Considerations

### Occupational safety regulation
- Equipment inspection history **retention obligation** (notification = inspection record)
- Severe-accident liability: strengthened equipment safety duty
- Reflect statutory inspection cycles in preventive maintenance plans

### Manufacturing equipment management
- MES integration: real-time equipment status → auto IW21
- 3-shift operation: per-shift equipment handover record
- Outsourced maintenance: external service entry (e.g. PM10 service)

### KPI
- MTBF (mean time between failures): higher is better
- MTTR (mean time to repair): lower is better
- OEE (overall equipment effectiveness): availability × performance × quality

## Related
- `../../SKILL.md` — full content
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — materials/spare parts
- `/plugins/sap-co/skills/sap-co/SKILL.md` — maintenance cost
