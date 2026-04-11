# Clean Core Patterns — ABAP Extensibility Guide

## Extensibility Tier Decision Flowchart

```
Is the change needed in S/4HANA Cloud Public Edition?
  YES → Tier 1 (Key User) only — no ABAP coding
  NO  ↓

Is on-premise or RISE (Private Cloud)?
  YES → Tier 2 (BTP side-by-side) OR Tier 3 (on-stack ABAP CBO)
        ↓
        Is tight integration / low latency required?
          YES → Tier 3: on-stack RAP or ABAP enhancement
          NO  → Tier 2: BTP CAP side-by-side (preferred for Clean Core)

Is it a UI extension only?
  YES → Tier 1 Adaptation (key user UI adaptation) or Tier 2 (Fiori extension)
```

## Extensibility Tiers Summary

| Tier | Name | Who | Tools | Available Where |
|------|------|-----|-------|----------------|
| 1 | Key User | Functional users | Custom fields, BRF+, Custom Business Objects | All deployments |
| 2 | Side-by-side | Developers | CAP, BTP ABAP, Fiori, Integration Suite | All deployments |
| 3 | On-stack | ABAP developers | ABAP CBO, RAP, BAdI, Enhancement Spots | On-premise + RISE only |

---

## Tier 1 — Key User Extensions (No Code)

### Custom Fields
- Path: Adapt UI → Custom Fields and Logic → Custom Fields
- Adds fields to existing SAP Fiori screens
- Data stored in extension table (e.g., YY1_* fields)
- Available in: all deployments

### Custom Logic (BRF+)
- Path: Custom Fields and Logic → Custom Logic
- Event-based business rules (IF condition THEN action)
- No ABAP knowledge required
- Executes as part of standard SAP processing

### Custom Business Objects (CBO)
- Path: Custom Fields and Logic → Custom Business Objects
- Create new standalone business objects with Fiori UI
- OData service generated automatically
- Available in: all deployments

---

## Tier 2 — BTP Side-by-Side Extensions

### When to Use CAP (Cloud Application Programming Model)

✅ Use CAP when:
- New standalone application (not tight integration with core)
- Decoupled lifecycle from S/4HANA upgrades
- Cloud-native, scalable, multi-tenant requirements
- Team has Node.js or Java skills

❌ Don't use CAP when:
- Low-latency synchronous integration required
- Complex transactional processing across many tables
- Heavy use of SAP-specific processing (e.g., payroll schemas, MRP logic)

### Event-Driven Extension Pattern

```
S/4HANA Business Event (e.g., SalesOrderCreated.v1)
  → SAP Event Mesh (publish)
    → BTP CAP subscriber (consume)
      → Custom logic + HANA Cloud persistence
        → Fiori Elements UI or API
```

Supported S/4HANA events: check SAP API Business Hub → Events tab per API

---

## Tier 3 — On-Stack ABAP (On-Premise + RISE Only)

### RAP (RESTful ABAP Programming Model) — Preferred for New Development

Use RAP when building new S/4HANA business objects that:
- Need transactional processing (create / update / delete)
- Require Fiori Elements OData V4 UI
- Must follow Clean Core patterns (even on-premise)
- Are custom objects (Z-namespace)

### RAP vs Classic ABAP

| Aspect | Classic ABAP | RAP |
|--------|-------------|-----|
| Data access | Direct SELECT + DML | CDS Entity + behavior definition |
| UI | Module pool / Web Dynpro | Fiori Elements (OData V4 auto-generated) |
| Testing | Manual / ABAP Unit | ABAP Unit (mandatory) |
| Transport | Workbench request | Workbench request (same) |
| Performance | Manual optimization | Framework-optimized |
| Cloud PE | Not supported | Supported (if no deprecated APIs used) |

### Enhancement Spots vs BAdI

| Approach | When | How |
|----------|------|-----|
| BAdI (New) | SAP-defined extensibility point exists | SE19 → Create enhancement implementation |
| Enhancement Spot | No BAdI exists, need code injection | SE18 (define) → SE19 (implement) |
| Classic User Exit | ECC only, EXIT_* function modules exist | SMOD → CMOD — avoid in S/4HANA |

---

## Key CDS Annotations by Use Case

### Access Control
```abap
@AccessControl.authorizationCheck: #CHECK          " DCL required
@AccessControl.authorizationCheck: #NOT_REQUIRED   " Open access (use carefully)
@AccessControl.authorizationCheck: #PRIVILEGED_ONLY " Only called by privileged context
```

### OData Exposure
```abap
@OData.entityType.name: 'MyEntityType'
@OData.publish: true   " Publish as OData service (classic)
" For RAP: use behavior definition — OData published automatically
```

### Search and Filter
```abap
@Search.searchable: true
@Search.defaultSearchElement: true   " Field included in fuzzy search
@ObjectModel.filter.transformedRequiredInResultSet: true
```

### Aggregation
```abap
@DefaultAggregation: #SUM            " For amount fields
@DefaultAggregation: #MAX            " For date fields
@Semantics.amount.currencyCode: 'Currency'   " Link amount to currency field
@Semantics.currencyCode: true        " Mark as currency code field
```

### Authorization
```abap
@ObjectModel.representativeKey: 'CompanyCode'
" Used in DCL:
define role ZI_MyEntity_DCL {
  grant select on ZI_MyEntity
    where (CompanyCode) = aspect pfcg_auth(F_BKPF_BUK, BUKRS, ACTVT='03');
}
```

---

## Clean Core Compliance Checklist

```
□ No SELECT on deprecated tables (BSEG, MKPF/MSEG, BSID/BSAD/BSIK/BSAK)
□ No CALL TRANSACTION in background-capable programs
□ No SAP standard object modifications (use enhancement spots / BAdIs)
□ No direct WRITE to SAP standard database tables (use BAPIs / RAP)
□ CDS views used as data access layer (not direct table SELECTs)
□ ABAP Unit tests included for all custom logic
□ ATC check clean — no Priority 1 or 2 findings
□ Uses only released SAP APIs (check API release status in SE80)
□ No hardcoded organizational values
□ Transport request in Z/Y package (not $TMP)
```
