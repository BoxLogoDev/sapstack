---
name: sap-btp
description: >
  This skill handles SAP BTP (Business Technology Platform) development including
  CAP (Cloud Application Programming Model), Fiori Elements, SAP Build Apps,
  Integration Suite, side-by-side extensions, OData V2/V4 services, event-driven
  architecture, and BTP security. Use when user mentions BTP, CAP, CAPM, Fiori,
  Fiori Elements, OData, Integration Suite, iFlow, side-by-side extension, BTP cockpit,
  subaccount, service binding, XSUAA, destination, Cloud Foundry, Kyma,
  event mesh, SAP Build, HANA Cloud, BTP ABAP environment, MTA.
allowed-tools: Read, Grep
---

## 1. BTP Landscape Structure

```
Global Account
└── Subaccount (region-specific)
    ├── Cloud Foundry (CF) Environment
    │   └── Spaces → CF Applications + Service Instances
    ├── Kyma Environment
    │   └── Namespaces → Pods / Serverless Functions
    └── BTP ABAP Environment
        └── ABAP Instances (Clean Core ABAP development)
```

Key platform services:

| Service | Purpose |
|---------|---------|
| XSUAA | OAuth 2.0 authorization server — user auth + service-to-service |
| Destination Service | Connection config to backend systems (S/4HANA, etc.) |
| Connectivity Service | On-premise access via Cloud Connector (SCC) |
| Event Mesh | Async event-driven messaging between applications |
| HANA Cloud | Managed SAP HANA database service |
| Alert Notification | Event-based alerting and notification |

---

## 2. CAP (Cloud Application Programming Model)

### Project Structure

```
my-cap-project/
├── db/
│   └── schema.cds         ← Data model (entities, associations)
├── srv/
│   ├── service.cds        ← Service definition (projection, actions, functions)
│   └── service-impl.js    ← Custom event handlers (Node.js)
│   └── service-impl.java  ← Custom handlers (Java alternative)
├── app/
│   └── fiori-app/         ← Fiori Elements UI (optional)
├── mta.yaml               ← Multi-target application deployment descriptor
└── package.json           ← Node.js dependencies + CDS config
```

### Essential Commands

```bash
cds init my-project          # Scaffold new CAP project
cds watch                    # Local dev server with mock data + live reload
cds build                    # Compile CDS → HANA artifacts + OData metadata
cds deploy --to hana         # Deploy DB schema to HANA Cloud
cf push                      # Deploy to Cloud Foundry
mbt build && cf deploy *.mtar # MTA build + deploy (recommended for production)
```

### Custom Handler Patterns (Node.js)

```javascript
module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to('db');

  // Before hook — validate input
  this.before('CREATE', 'MyEntity', async (req) => {
    if (!req.data.CompanyCode) req.reject(400, 'CompanyCode is required');
  });

  // On hook — custom read logic
  this.on('READ', 'MyEntity', async (req) => {
    return db.run(req.query);
  });

  // Remote service call to S/4HANA
  this.on('getStock', async (req) => {
    const s4 = await cds.connect.to('S4HANA_MM');
    return s4.run(SELECT.from('A_MaterialStock').where({ Plant: req.data.Plant }));
  });
});
```

---

## 3. Fiori Elements Floor Plans

| Floor Plan | Use Case | Key Annotations |
|-----------|----------|-----------------|
| List Report Page (LRP) | Search + list view | `@UI.LineItem`, `@UI.SelectionFields` |
| Object Page (OP) | Detail + edit view | `@UI.Facets`, `@UI.FieldGroup` |
| Analytical List Page (ALP) | Charts + list | `@UI.Chart`, `@UI.PresentationVariant` |
| Worklist Page (WP) | Task-oriented list | `@UI.LineItem` (no search area) |
| Form Entry Object Page | Data entry form | `@UI.FieldGroup` (editable mode) |

**OData V4** preferred for all new development on S/4HANA 2022+ and BTP.

**Flexible Programming Model**: mix Fiori Elements sections with custom SAPUI5 building blocks.

### Common CDS UI Annotations

```abap
@UI.lineItem: [{ position: 10, label: 'Company Code' }]
@UI.selectionField: [{ position: 10 }]
@UI.fieldGroup: [{ qualifier: 'GeneralInfo', position: 10 }]
@UI.facets: [{ id: 'GeneralInfo', type: #COLLECTION,
               label: 'General Information',
               child: [{ id: 'GeneralData', type: #FIELDGROUP_REFERENCE,
                         targetQualifier: 'GeneralInfo' }] }]
```

---

## 4. Integration Suite (Cloud Platform Integration — CPI)

### iFlow Design Patterns

| Pattern | Use Case |
|---------|---------|
| Request-Reply | Synchronous call to backend; wait for response |
| Pub/Sub (Event Mesh) | Async — publisher doesn't wait; decoupled |
| Batch | Scheduled processing; large volume data transfer |
| Aggregator | Collect multiple messages; combine into one |

### Adapter Types

| Adapter | Protocol / Use |
|---------|---------------|
| HTTP | REST APIs |
| SOAP | Web services (legacy) |
| OData | SAP OData V2/V4 services |
| SFTP | File-based integration |
| AMQP | Message queue integration |
| JDBC | Database direct access |
| Mail | Email-based integration |

### Exception Handling

- Exception subprocess: catches errors within iFlow → send alert / dead letter
- Dead letter queue: failed messages stored for retry / manual processing
- Alerting: Alert Notification Service → notify on iFlow failure

---

## 5. Side-by-Side Extension Pattern

### Architecture

```
S/4HANA Business Event (e.g., Sales Order Created)
  → SAP Event Mesh (event broker)
    → BTP CAP Application (subscriber / consumer)
      → HANA Cloud (persistence)
        → Fiori Elements UI (user interface)
```

### When to Use Which Extension Approach

| Approach | When | Notes |
|----------|------|-------|
| Key User (Tier 1) | Simple field additions, custom logic via BRF+ | No code, in-app |
| BTP Side-by-side (Tier 2) | Decoupled apps, cloud-native, lifecycle independent | CAP + Fiori |
| On-stack RAP (Tier 3) | Tight integration, low latency, on-premise only | ABAP CBO allowed on-premise |
| Modifications | Never in S/4HANA Cloud; avoid on-premise | Use enhancements instead |

---

## 6. BTP Security

### XSUAA Configuration (xs-security.json)

```json
{
  "xsappname": "my-app",
  "tenant-mode": "dedicated",
  "scopes": [
    { "name": "$XSAPPNAME.read",  "description": "Read access" },
    { "name": "$XSAPPNAME.write", "description": "Write access" }
  ],
  "role-templates": [
    {
      "name": "Viewer",
      "scope-references": ["$XSAPPNAME.read"]
    },
    {
      "name": "Editor",
      "scope-references": ["$XSAPPNAME.read", "$XSAPPNAME.write"]
    }
  ]
}
```

### Destination Service (Never Hardcode Backend URLs)

```javascript
// Use destination service — never hardcode S/4HANA URL
const s4 = await cds.connect.to('S4HANA_SALES');  // Name matches destination in BTP cockpit
const result = await s4.run(SELECT.from('A_SalesOrder').limit(10));
```

### Principal Propagation

OAuth 2.0 SAML Bearer Assertion flow: SF/S/4HANA user identity passed through to backend
→ Configure in BTP Destination: Authentication = OAuth2SAMLBearerAssertion

---

## 7. Common BTP Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| CORS error | Missing origin in XSUAA / approuter | Add allowed origin in xs-app.json |
| "Destination not found" | Name mismatch in code vs BTP cockpit | Check exact destination name (case-sensitive) |
| "Token expired — 401" | OAuth token not refreshed | Implement token refresh; check token lifetime config |
| CDS compilation error | Syntax / reference error in .cds file | Check entity names, association targets; run `cds build` locally |
| CF push fails | Memory limit / buildpack / missing service binding | Check manifest.yml; verify service binding in cf services |
| Kyma function cold start | Low memory allocation | Increase memory; configure min replicas > 0 |
| "Service binding not found" | Env variable not injected | Check CF service binding: `cf env my-app` |

---

## 8. S/4HANA Extensibility Tiers

```
Tier 1 — Key User Extensions (no code, in-app):
  Custom fields → Adapt UI → Custom Logic (BRF+) → Custom Business Objects
  Available in: all S/4HANA deployments including Cloud PE

Tier 2 — Developer Extensions (BTP side-by-side):
  CAP applications → Fiori extensions → Event-driven apps → Integration
  Available in: S/4HANA on-premise, RISE, Cloud PE

Tier 3 — Classic On-premise ABAP (CBO):
  ABAP classes, enhancements, BAdIs, custom programs
  Available in: on-premise and RISE ONLY
  NOT available in: S/4HANA Cloud Public Edition
```
