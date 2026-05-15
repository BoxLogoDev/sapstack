<!-- Claude-authored draft (community review welcome) -->

# SAP QM Quick Guide (English)

## Environment Intake
1. SAP release (ECC EhP / S/4HANA year)
2. Deployment model (On-Premise / RISE / Cloud PE)
3. QM activation status (inspection setup per material type)
4. Industry (manufacturing, pharma, food, automotive parts)

## Key T-codes

### Quality Planning
| T-code | Use |
|--------|------|
| QP01 | Create inspection plan |
| QP02 | Change inspection plan |
| QS21 | Inspection characteristic master (MIC) |
| QDV1 | Sampling procedure |

### Quality Inspection
| T-code | Use |
|--------|------|
| QA01 | Manual inspection lot creation |
| QA03 | Display inspection lot |
| QE01 | Record results (single) |
| QE51N | Record results (worklist) |

### Usage Decision
| T-code | Use |
|--------|------|
| QA11 | Usage decision |
| QA32 | Usage decision (collective) |

### Quality Notification
| T-code | Use |
|--------|------|
| QM01 | Create quality notification (defect/claim) |
| QM02 | Change quality notification |

### Certificate / Vendor Evaluation
| T-code | Use |
|--------|------|
| QC21 | Create certificate (test report) |
| QI01 | Quality info record (incoming inspection) |
| ME61 | Vendor evaluation |

## Locale Considerations

### ISO / IATF certification
- ISO 9001: quality management system (nearly all manufacturing)
- IATF 16949: automotive parts (OEM supplier requirement)
- Inspection plan (QP01) is key audit evidence

### Pharma GMP
- Regulatory authority standards
- Validation 3-stage: IQ → OQ → PQ
- Deviation management: tracked via quality notification (QM01)

### Food HACCP
- CCP (critical control point) monitoring
- Map inspection characteristics (MIC) to CCP items

### Supplier quality management
- Strengthened incoming inspection (Inspection Type 01)
- Vendor evaluation (ME61): auto-reflect quality score
- Nonconformance → quality notification (Q3) → corrective action

## Related
- `../../SKILL.md` — full content
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — purchasing/materials
- `/plugins/sap-pp/skills/sap-pp/SKILL.md` — production/in-process inspection
