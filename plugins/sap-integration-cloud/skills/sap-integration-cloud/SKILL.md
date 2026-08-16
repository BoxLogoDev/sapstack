---
name: sap-integration-cloud
description: >
  This skill handles SAP BTP integration platform tasks across SAP Integration
  Suite (CPI - Cloud Platform Integration), SAP Datasphere (formerly DWC),
  Cloud Connector, OData services, API Management, Event Mesh, Open Connectors,
  iFlow design (REST, SOAP, IDoc, SuccessFactors, S/4 OData), error handling,
  certificate management, monitoring, message reprocessing, Datasphere Spaces,
  views, federation, replication, S/4 ABAP CDS exposure, BTP destinations, and
  Pre-packaged Integration Content. Use whenever the user mentions CPI,
  Integration Suite, iFlow, Datasphere, DWC, Cloud Connector, API Management,
  Event Mesh, OData, IDoc cloud, ABAP CDS exposure, or any cloud integration.
allowed-tools: Read, Grep, Glob
---

# sap-integration-cloud — Integration Suite + Datasphere

## 1. Environment Intake Checklist

1. **Integration scope** — CPI (Cloud Platform Integration) / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 (Cloud/OnPrem) / SuccessFactors / Ariba / 3rd party?
3. **Protocol** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **Authentication** — OAuth / Basic / Certificate / SAML?
5. **Specific issue** — iFlow design, error handling, perf, certificate, monitoring?

Also collect these before proposing a fix:

- **SAP source release** — ECC 6.0 EhP or S/4HANA release year.
- **Deployment** — On-Premise, RISE/Private Cloud, or S/4HANA Cloud Public Edition.
- **Industry and data class** — finance, HR, health, trade, or other regulated data.
- **BTP landscape** — region, subaccount, Cloud Foundry environment, dev/test/prod tenant.
- **Artifact identity** — package, iFlow name, deployed version, last transport/change time.
- **Failure window** — first failure time with timezone, frequency, last successful message.
- **Correlation evidence** — sanitized MPL Message ID and business correlation key.
- **Contract** — sender/receiver schema version, Content-Type, encoding, cardinality rules.
- **Endpoint** — destination alias, Cloud Connector location ID, receiver service and timeout.
- **Security** — authentication type and certificate/secret expiry date, never the secret itself.
- **Business impact** — delayed, missing, duplicated, or incorrectly transformed documents.
- **Replay risk** — whether the receiver is idempotent and who approves business reprocessing.

Do not wait for perfect intake before helping. If context is missing, label the diagnosis
provisional and provide only read-only evidence checks.

### 1.1 Evidence privacy contract

- Never request or reproduce a production payload containing 주민등록번호, 계좌, 급여,
  건강정보, 이메일, 전화번호, access token, client secret, or private key.
- Request only field names, schema fragments without values, redacted error text, counts,
  timestamps, hashes, message status, and correlation IDs.
- Replace business identifiers consistently so one sanitized message can still be correlated
  across CPI, PI/PO, and ECC/S/4.
- Treat CPI Trace and attachment logging as temporary data collection. Use a bounded window,
  minimum users, and the approved retention/deletion process.
- If a payload sample is essential, reproduce the structure with synthetic data in a lower tenant.

## 2. Module Coverage

### 2.1 Integration Suite Components
| Component | Purpose |
|---|---|
| **CPI (Cloud Platform Integration)** | iFlow-based message routing/transformation |
| **API Management** | API design, gateway, throttling, security |
| **Event Mesh** | Event-driven messaging (pub/sub) |
| **Open Connectors** | Pre-built non-SAP connectors |
| **Integration Advisor** | Schema design assistance |

### 2.2 Datasphere
- Successor to SAP DWC (Data Warehouse Cloud)
- Spaces (data isolation) + Local Tables + Views + Federation
- Connect S/4HANA Cloud / on-prem / BW / non-SAP via Data Provisioning Agent

## 3. CPI / iFlow Patterns

### 3.1 Common iFlow Shapes
- **Request-Reply** — sync API call
- **Splitter** — message → multiple
- **Aggregator** — multiple messages → 1
- **Content Filter** — header/payload filtering
- **Mapping** — Message Mapping (graphical) or Script (Groovy)

### 3.2 Typical Flows
- **S/4 to SuccessFactors** — employee replication
- **SuccessFactors to S/4 HCM** — org data sync
- **S/4 to Ariba** — material/vendor master via CIG
- **Bank file (MT940)** — FTP → CPI → S/4 FF.5

### 3.3 Canonical iFlow failure sequence

Use this order for every active CPI incident. Do not jump from a generic error headline
straight to certificate rotation or mapping changes.

#### Step 1 — Message Processing Log (MPL)

**T-code**: not applicable (BTP SaaS)
**Menu path**: `Integration Suite > Monitor > Integrations and APIs > Monitor Message Processing`

Collect read-only metadata:

1. iFlow and deployed artifact version.
2. MPL Message ID, start/end time, status, and processing duration.
3. Sender, receiver, adapter type, and failed branch.
4. Exception class/category and the first error in the causal chain.
5. Retry count and whether the same business key previously completed.
6. A nearby successful message with the same interface and version.

The last exception line is not always the first failure. Build a timeline and identify the
earliest failed boundary.

#### Step 2 — Failed step or mapping

**T-code**: not applicable
**Menu path**: `Integration Suite > Monitor > Message Processing > <Message> > Log/Trace`

- If the first failing node is Message Mapping, compare the deployed source and target schemas.
- Check XML namespace URI and QName, not only the visible element name.
- Check required/optional occurrence, repeating node context, default value, and empty-string rules.
- For JSON, compare property type, array/object shape, null handling, and numeric/date format.
- For Groovy or script steps, identify the exact step and sanitized exception line; do not ask
  for credentials or full payload dumps.
- Enable Trace only for an approved, short, lower-environment reproduction whenever possible.

**Falsification**: if the same deployed version and sanitized contract-test message pass the
mapping, or if the first error occurs before the mapping step, reject the mapping hypothesis.

#### Step 3 — Payload schema and contract

**T-code**: not applicable
**Menu path**: `Integration Suite > Design > Integrations > <iFlow> > Resources/Mapping`

- Verify sender schema version against the version packaged with the deployed iFlow.
- Validate Content-Type, character encoding, namespace, mandatory nodes, and allowed values.
- Compare one failed and one successful message by structure and hashes, not raw PII values.
- Check whether an upstream optional field became mandatory downstream.
- Confirm value mapping has the expected source agency, source identifier, target agency,
  target identifier, and effective lifecycle.
- Treat a schema drift as a producer/consumer contract issue, not automatically as CPI defect.

**Falsification**: if schema validation succeeds with the exact failed structure and the mapping
output matches the receiver contract, move the primary hypothesis to the endpoint boundary.

#### Step 4 — Endpoint, network, and receiver

**T-code**: not applicable for BTP checks
**Menu path**: `BTP cockpit > Connectivity > Destinations` and
`Cloud Connector Admin UI > Cloud To On-Premise`

- Classify receiver response: authentication, authorization, route, media type, throttling,
  timeout, or application failure.
- Check destination URL/alias, proxy type, location ID, and connection test without exposing secrets.
- Check Cloud Connector subaccount state and the exact allowlisted virtual host/path.
- Compare receiver availability from its own monitor; a CPI timeout does not prove receiver outage.
- For TLS, compare certificate chain, hostname, validity window, trust store, and client certificate.
- For rate limits, compare failure timestamps and response headers with the agreed quota.

**Falsification**: if the receiver accepts an equivalent sanitized request through the same
destination and the MPL shows no network/auth error, reject the endpoint hypothesis.

### 3.4 Multi-hop correlation rule

For `source → PI/PO → CPI → target`, create one timeline:

| Boundary | Evidence | Primary monitor |
|---|---|---|
| Source application | document key hash, send time, application log | `SLG1` |
| PI/PO Integration Engine | PI message ID, pipeline status, error category | `SXMB_MONI` |
| CPI | MPL Message ID, failed step, deployed version | Integration Suite Monitor |
| ABAP SOAP runtime | Web Service message ID and provider/consumer error | `SRT_MONI` |
| Receiver | response status, application correlation ID | Receiver-native monitor |

Never compare payload values across systems in an external chat. Use sanitized correlation IDs,
timestamps, structural hashes, and record counts.

## 4. Datasphere Patterns

### 4.1 Architecture
- **Space** — isolation (sandbox / production / per-business unit)
- **Local Table** — physically stored
- **Remote Table** — federated (live query)
- **View** — virtual model
- **Analytic Model** — for SAC consumption

### 4.2 Data Provisioning
- **DP Agent** — on-prem to cloud bridge
- **Replication Flow** — real-time data sync
- **Data Flow** — ETL-like batch

## 5. Critical Issues

### CPI / iFlow
- **iFlow not triggering** — sender adapter config, polling schedule, certificate expired
- **Mapping error** — schema mismatch, missing required fields, type conversion
- **Memory exceeded** — large payload, split before processing
- **Certificate expired** — STRUST equivalent in BTP Keystore, alert before expiry
- **Reprocessing failed message** — Monitor → Messages → Retry

### Datasphere
- **Federation slow** — push-down vs materialize trade-off
- **Replication lag** — Replication Flow monitoring
- **Space sharing fail** — Privilege Sharing config

### Cloud Connector
- **Tunnel not connecting** — outbound 443 firewall, regional endpoint
- **System mapping fail** — virtual host vs internal host

## 6. Protocol-specific diagnostic playbooks

### 6.1 SOAP from CPI to ECC/S/4

1. Start with CPI MPL and locate the receiver SOAP step.
2. `SRT_MONI` — menu: `SAP Easy Access > Tools > Administration > Monitor > Web Services >
   Message Monitor`; match sanitized timestamp/message ID and inspect provider/consumer error.
3. `SOAMANAGER` — menu: `SAP Easy Access > Tools > Administration > SOA Management`;
   display binding, logical port, endpoint, authentication, and service state.
4. `STRUST` — menu: `SAP Easy Access > Tools > Administration > Trust Manager`;
   display the relevant trust/client PSE chain and validity. Never export a private key.
5. `SMICM` — menu: `SAP Easy Access > Tools > Administration > Monitor > ICM Monitor`;
   check recent HTTP/ICM errors only when the failure reaches the ABAP HTTP layer.

**Primary hypotheses**:

- Binding/endpoint mismatch: supported when `SRT_MONI` cannot route to the configured service;
  falsified when the same binding handles a comparable request successfully.
- Trust failure: supported by handshake/certificate-chain evidence; falsified when the same PSE and
  hostname complete a TLS handshake during the incident window.
- Application fault: supported when transport succeeds and the provider returns a business fault;
  falsified when no request reached the provider runtime.

**Fix and rollback**: change a binding, certificate alias, or iFlow only in dev/test first. Use a
backend TR where customizing requires it and approved content transport for CPI. Preserve the prior
binding/exported configuration and prior iFlow version for rollback.

### 6.2 PI/PO coexistence or migration

1. `SXMB_MONI` — menu: `SAP Easy Access > Process Integration > Monitoring > Integration Engine`;
   display the PI/XI message status, pipeline step, interface, and timestamp.
2. Match it to the CPI MPL using a sanitized correlation key and time window.
3. Determine which runtime owns routing. Do not assume that a CPI deployment removed the old PI route.
4. Compare counts at source, PI/PO, CPI, and receiver to detect loss or dual delivery.
5. Run a one-message canary with a non-posting or idempotent receiver before cutover.

**Falsification**: if only one runtime receives the canary and end-to-end counts reconcile, reject
the dual-route hypothesis. If the PI message never left the source-facing channel, investigate PI
before CPI.

**Rollback**: retain the last approved PI/PO routing/configuration until CPI canary, reconciliation,
and business sign-off pass. Revert the traffic switch, not business data, when the cutover fails.

### 6.3 IDoc adapter

1. `WE02` — menu: `SAP Easy Access > Tools > ALE > Administration > Services > IDoc Display`;
   display control record, status history, partner/message type, and timestamps.
2. `WE20` — menu: `SAP Easy Access > Tools > ALE > ALE Administration > Runtime Settings >
   Partner Profiles`; display sender/receiver partner profile and message type.
3. `WE21` — menu: `SAP Easy Access > Tools > ALE > ALE Administration > Runtime Settings >
   Ports`; display the assigned port and destination relationship.
4. `IDX1` — menu: `SAP Easy Access > Process Integration > Configuration > IDoc Adapter > Ports`;
   display IDoc adapter port assignment where PI/PO is in scope.
5. `IDX2` — menu: `SAP Easy Access > Process Integration > Configuration > IDoc Adapter > Metadata`;
   compare metadata release/schema only where PI/PO IDoc adapter metadata is used.
6. Use `BD87` only after the cause is fixed, a lower-environment test passes, duplicate impact is
   assessed, and the operator approves a bounded reprocessing set.

**Relevant records** (technical table names, not T-codes):

```text
EDIDC — IDoc control record and technical routing metadata.
EDIDS — chronological status records; use it to find the first failing status.
IDoc data-record table — data segments; treat as sensitive and do not request raw segment values externally.
```

**Falsification**: if the IDoc has a successful outbound status and CPI never receives it, test the
adapter/network boundary. If CPI received and parsed it, reject partner-profile absence as primary.

**Rollback**: restore the prior partner-profile/port configuration through the approved backend TR.
For replay, stop at the pre-approved message set and reconcile document keys after each batch.

### 6.4 OData or HTTP API

1. In MPL, classify the receiver response and capture only sanitized headers.
2. `SICF` — menu: `SAP Easy Access > Tools > Administration > Administration > Network >
   HTTP Service Hierarchy`; display whether the required ICF service path is active.
3. `SM59` — menu: `SAP Easy Access > Tools > Administration > Administration > Network >
   RFC Destinations`; for a relevant HTTP/RFC destination, use display and approved connection test.
4. `SLG1` — menu: `SAP Easy Access > Tools > Administration > Monitor > Application Log`;
   filter by the known application object/subobject and incident time.
5. Separate transport success from application validation: a successful HTTP exchange can still
   contain a rejected business document.

Response categories:

- `401`: authentication material, token audience/issuer, or expiry.
- `403`: authenticated but missing authorization/scope or backend role.
- `404`: wrong base path/service activation/version, not automatically a network failure.
- `405`: wrong method or endpoint contract.
- `415`: Content-Type or payload-format mismatch.
- `429`: quota/throttling; respect receiver retry guidance and idempotency.
- `5xx`: receiver or intermediary error; prove which hop generated it.

**Falsification**: if the same identity and route succeeds for the same operation during the failure
window, reject a blanket authorization or service-down hypothesis and compare request contract.

**Rollback**: restore prior destination/iFlow version. Do not weaken authorization globally as a fix.

### 6.5 SFTP file integration

- Confirm polling schedule, directory, filename pattern, archive/error behavior, and file lock convention.
- Compare file arrival time with polling windows and maintenance windows.
- Validate character encoding, line endings, delimiter, header/trailer counts, and schema version.
- Use a synthetic file in a lower environment; never copy a production bank/HR file to chat.
- Establish archive naming and business idempotency before retrying a file.

**Falsification**: if the file matches pattern/permissions and the sender adapter picks it up, reject
polling configuration and move to conversion/mapping. If no file exists at poll time, CPI is not the
primary cause.

**Rollback**: restore the previous adapter configuration and quarantine the test file. Reconcile
receiver document counts before releasing any production retry.

## 7. Authentication, certificate, and Cloud Connector checks

### 7.1 Certificate or mTLS failure

1. CPI security material: T-code not applicable; menu
   `Integration Suite > Monitor > Integrations and APIs > Manage Security Material/Keystore`.
2. ABAP trust: `STRUST`; menu `SAP Easy Access > Tools > Administration > Trust Manager`.
3. Check leaf/intermediate/root chain, hostname/SAN, validity, client certificate alias, and clock.
4. Rotate by adding and testing the new alias before retiring the old one.
5. Never request private key, keystore password, access token, or unredacted certificate bundle.

**Falsification**: a successful handshake using the same alias, hostname, and trust chain during the
incident window falsifies certificate expiry/chain as primary.

**Rollback**: keep the old alias active until canary and business verification pass; point the iFlow
back to it if the new certificate fails. Removal is a later approved cleanup.

### 7.2 OAuth or SAML failure

- Verify issuer, audience, scopes/roles, redirect or assertion consumer endpoint, clock skew, and expiry.
- `SAML2` — menu: `SAP Easy Access > Tools > Administration > Administration > Security >
  SAML 2.0 Configuration`; display local provider/trusted provider metadata where ABAP SAML is used.
- Do not solve `403` by granting broad admin roles. Identify the missing business/API scope.
- Test with a non-production client and minimum scope.

**Rollback**: restore the prior client/trust metadata and iFlow security alias. Revoke the failed new
credential after rollback evidence is complete.

### 7.3 Cloud Connector path failure

**T-code**: not applicable
**Menu path**: `Cloud Connector Admin UI > Connector > Subaccount` and
`Cloud To On-Premise > Access Control`

- Verify subaccount region and connection state.
- Match BTP destination location ID with the intended connector.
- Verify virtual host/port and allowlisted resource path without exposing internal topology externally.
- Confirm internal host reachability from the connector host and backend service activation.
- A green tunnel does not prove a particular resource path is exposed.

**Falsification**: if the exact virtual host/path is reachable through the same destination during
the incident, reject tunnel-down and continue at authentication/application contract.

**Rollback**: restore the prior access-control mapping/destination. Avoid broad wildcard exposure.

## 8. Reliability, retries, and duplicate prevention

- Classify delivery semantics: at-most-once, at-least-once, or business-level exactly-once expectation.
- Use a stable business idempotency key, not only MPL Message ID, for receiver deduplication.
- Retry only transient failures such as throttling or temporary unavailability; schema and business
  validation errors require correction first.
- Use exponential backoff and receiver guidance where supported; avoid synchronized retry storms.
- Route exhausted failures to an approved exception process with owner, SLA, and reconciliation.
- For ordered events, prove sequence handling before parallelization.
- Reconcile source count, accepted count, rejected count, duplicate count, and target count.

### Replay gate

Before any production replay:

1. Root cause fixed and falsification evidence reviewed.
2. Synthetic or masked lower-environment message completes end to end.
3. Receiver idempotency or duplicate-detection behavior is proven.
4. Business owner approves the exact bounded message set.
5. Rollback/stop condition and reconciliation query are ready.
6. First message is a canary; expand only after target confirmation.

For IDoc reprocessing, `BD87` is an execution tool, not a diagnostic shortcut. Menu path:
`SAP Easy Access > Tools > ALE > Administration > Services > IDoc Reprocessing`.

## 9. Performance and memory diagnosis

Start from evidence, not a fixed payload-size rule:

- Compare MPL duration by step for failed, slow, and normal messages.
- Separate queue wait, mapping/script CPU, external call latency, and receiver processing time.
- Inspect payload growth at Splitter/Aggregator/Content Enricher boundaries using synthetic data.
- Prefer streaming-capable adapters/patterns for large content where supported.
- Split by a business-safe unit and preserve ordering/idempotency requirements.
- Avoid retaining full payloads in headers/properties/attachments.
- Bound parallelism to receiver capacity and tenant quota.
- Use pagination/delta extraction instead of repeated full loads.

Backend supporting checks:

- `SM50` — menu: `SAP Easy Access > Tools > Administration > Monitor > System Monitoring >
  Process Overview`; display local work-process pressure during the incident.
- `SM66` — menu: `SAP Easy Access > Tools > Administration > Monitor > System Monitoring >
  Global Work Process Overview`; display cross-instance pressure.
- `ST22` — menu: `SAP Easy Access > Tools > Administration > Monitor > Dump Analysis`;
  correlate ABAP dumps by time/user/service.
- `ST12` — menu: `SAP Easy Access > Tools > ABAP Workbench > Test > Performance Analysis`;
  run only an approved, tightly scoped trace in non-production or a controlled window.

**Falsification**: if CPI step duration is normal and backend evidence shows the receiver consumes
most elapsed time, reject CPI mapping performance as primary.

**Rollback**: restore prior concurrency, splitter, mapping, or timeout settings via approved
transport. Stop the canary if error rate, duplicates, or receiver load exceed agreed thresholds.

## 10. Datasphere replication diagnosis

### 10.1 Standard check sequence

1. Connection: T-code not applicable; menu `Datasphere > Space Management > Connections`.
2. Replication flow: T-code not applicable; menu `Datasphere > Data Integration Monitor >
   Replication Flows`.
3. Source delta: `ODQMON`; menu `SAP Easy Access > Tools > Administration > Monitor >
   Operational Delta Queue` when ODP is the source mechanism.
4. SLT replication: `LTRC`; menu `SAP Easy Access > Tools > Administration > HANA >
   SAP HANA Replication` when SLT is in scope.
5. Advanced SLT setting: `LTRS`; use display first and change only through approved configuration
   governance and transport procedure applicable to the landscape.
6. Reconcile initial/delta row counts and business totals with a read-only sample.

### 10.2 Common hypotheses

- **Delta queue backlog** — supported by growing subscriber backlog in `ODQMON`; falsified when
  queue is current and Datasphere did not request/consume the delta.
- **Source schema drift** — supported by a source field/type change aligned with failure start;
  falsified when source metadata and target mapping versions match.
- **Flow schedule collision** — supported by repeated delay at the same source batch window;
  falsified when lag persists outside that window.
- **Federation push-down bottleneck** — supported when remote query execution dominates;
  falsified when local/materialized execution is equally slow.
- **Filter/join loss** — supported by stage-by-stage count divergence; falsified when counts and
  keys reconcile before target consumption.

### 10.3 Safe fix and rollback

- Test metadata refresh, filter, delta initialization, or materialization in a lower Space first.
- Preserve the previous model/flow version and source subscription state.
- Do not reset a delta subscription or restart an initial load without impact analysis, recovery
  point, expected volume, and duplicate strategy.
- Exclude or mask PII columns before cross-region replication; do not rely only on downstream hiding.
- Roll back to the prior flow/model and reconcile target partitions if the changed flow diverges.

## 11. ECC vs S/4HANA and deployment split

| Topic | ECC 6.0 | S/4HANA On-Premise/RISE | S/4HANA Cloud Public Edition |
|---|---|---|---|
| Backend access | SAP GUI T-codes available by role | SAP GUI/Fiori by role | Do not assume classic backend T-code access |
| Common integration | IDoc, RFC, SOAP, PI/PO; OData depends on Gateway level | Released APIs/OData, SOAP, IDoc, events; release-specific | Communication arrangement and released APIs |
| PI/PO evidence | `SXMB_MONI` when PI/PO is present | Same only if PI/PO/Integration Engine is in path | Not customer backend access path |
| SOAP evidence | `SRT_MONI`, `SOAMANAGER` where ABAP Web Services are used | Same, release/role dependent | Use cloud monitoring and communication setup |
| HTTP service | `SICF` for ABAP ICF service | `SICF` where classic ICF service applies | Use released service configuration, not `SICF` assumption |
| Customizing transport | Backend TR | Backend TR and cloud change process | CBC/communication configuration lifecycle |
| CPI artifact transport | Approved content transport | Approved content transport | Approved content transport |

Do not infer a protocol solely from the SAP release. Ask for the actual integration pattern,
add-on level, and deployed route. For Cloud PE, route configuration questions to the cloud-specific
consultant when communication arrangements or released API scope drive the issue.

## 12. T-code, monitor, and data reference

Use display/read-only checks first. Menu labels can vary slightly by release and role; state that
when the user cannot see an entry.

| T-code / UI | Menu path | Evidence |
|---|---|---|
| CPI MPL | `Integration Suite > Monitor > Integrations and APIs > Monitor Message Processing` | Message status, step, duration, sanitized error |
| `SXMB_MONI` | `SAP Easy Access > Process Integration > Monitoring > Integration Engine` | PI/XI message and pipeline status |
| `SRT_MONI` | `SAP Easy Access > Tools > Administration > Monitor > Web Services > Message Monitor` | ABAP SOAP message status |
| `SOAMANAGER` | `SAP Easy Access > Tools > Administration > SOA Management` | Binding/logical port/service config |
| `WE02` | `SAP Easy Access > Tools > ALE > Administration > Services > IDoc Display` | IDoc control/status/segments |
| `BD87` | `SAP Easy Access > Tools > ALE > Administration > Services > IDoc Reprocessing` | Approved bounded reprocessing only |
| `SLG1` | `SAP Easy Access > Tools > Administration > Monitor > Application Log` | Application object/subobject messages |
| `STRUST` | `SAP Easy Access > Tools > Administration > Trust Manager` | PSE/certificate chain and validity |
| `SM59` | `SAP Easy Access > Tools > Administration > Administration > Network > RFC Destinations` | Destination definition and test |
| `SICF` | `SAP Easy Access > Tools > Administration > Administration > Network > HTTP Service Hierarchy` | ICF service activation/path |
| `ODQMON` | `SAP Easy Access > Tools > Administration > Monitor > Operational Delta Queue` | ODP subscription/delta backlog |
| `LTRC` | `SAP Easy Access > Tools > Administration > HANA > SAP HANA Replication` | SLT configuration/replication state |

Backend table evidence must be obtained through approved display/reporting. Never edit these tables:

```text
EDIDC — IDoc control and routing metadata.
EDIDS — IDoc status history.
IDoc data-record table — IDoc segment data; likely sensitive.
BALHDR / BALDAT — application log header/data surfaced through SLG1.
RFCDES — RFC destination metadata; use SM59 as the supported maintenance surface.
```

CPI MPL and Datasphere monitors are service-managed stores, not customer-editable ABAP tables.
Do not invent a table when the supported evidence surface is the cloud UI/API.

## 13. Hypothesis, fix, and rollback matrix

| Symptom | Primary hypothesis | Falsification evidence | Safe fix | Rollback |
|---|---|---|---|---|
| Mapping fails after release | Producer schema drift | Same failed structure passes deployed mapping | Version schema/mapping; contract test | Redeploy previous iFlow version |
| SOAP handshake fails | Trust chain/client alias mismatch | Same chain/alias succeeds in incident window | Add/test new trust or client alias | Repoint to preserved old alias |
| PI shows success, CPI has no MPL | Route/adapter boundary gap | CPI receives same canary and PI has one delivery | Correct approved route/channel | Restore previous route switch |
| CPI completed, target document missing | Receiver application rejection or async lag | Target correlation ID is accepted/posted | Fix receiver contract/process | Restore prior endpoint/iFlow; reconcile |
| Retry creates duplicates | Missing business idempotency | Receiver proves duplicate key rejection | Add stable key/dedup rule | Stop replay; revert rule; reconcile |
| Datasphere delta lags | Source queue/subscriber backlog | `ODQMON` is current and flow never requests delta | Fix schedule/subscription after test | Restore prior flow/subscription state |

Every confirmed fix must state owner, artifact/TR, test evidence, promotion path, rollback trigger,
and post-change reconciliation. If rollback is not credible, do not recommend the production fix.

## 14. Anti-patterns

- ❌ “MPL says mapping error, so mapping is definitely wrong” without locating the first failed step.
- ❌ Asking the operator to paste a full production payload, Authorization header, token, or private key.
- ❌ Enabling Trace broadly in production and leaving payload attachments retained.
- ❌ Rotating a certificate by deleting the currently working alias first.
- ❌ Replaying all failed messages before proving receiver idempotency and exact affected scope.
- ❌ Treating `BD87` as a harmless test-run transaction.
- ❌ Changing Cloud Connector access control to a broad wildcard to bypass a path problem.
- ❌ Increasing timeout/retry count without distinguishing network, receiver, and business errors.
- ❌ Assuming PI/PO is the cause merely because `SXMB_MONI` contains an old failed message.
- ❌ Treating an HTTP success as proof that the business document posted successfully.
- ❌ Resetting an ODP/SLT delta without a recovery point and count reconciliation.
- ❌ Editing IDoc control/status/data-record tables, `BALHDR`, `BALDAT`, or `RFCDES` directly with `SE16N`.
- ❌ Mixing ECC, S/4HANA private/on-prem, and Cloud PE administration paths.
- ❌ Moving iFlow/backend changes to production without lower-environment test, approved transport,
  UAT/business sign-off, and rollback plan.
- ❌ Guessing a SAP Note or T-code when it has not been verified.

## 15. Korean Context

### 한국 시나리오
- **국세청 e-Tax invoice 연동**: CPI iFlow + 한국 인증서
- **사회보험 EDI**: SFTP + 한국 정부 형식
- **K-Bank file 파싱**: KFTC 표준 MT940 한국 dialect
- **망분리 환경**: Cloud Connector + DMZ + 보안 게이트웨이

### Datasphere 활용
- 한국 본사 + 자회사(중국·베트남·미국) 데이터 통합
- SAC 시각화 입력 데이터로 활용

## 16. Cross-module Routing

- BTP env / Cloud Connector → also `sap-btp`
- S/4 측 인터페이스 → `sap-abap-developer` (CDS, BAdI, RFC)
- SuccessFactors 동기화 → `sap-sfsf-consultant`
- Ariba 통합 → `sap-ariba-consultant`
- SAC 데이터 소스 → `sap-sac-consultant`

## 17. SAP Notes & References

- SAP Note 번호는 `data/sap-notes.yaml`에 검증·등록된 항목만 인용한다.
- 현재 증상과 릴리스에 맞는 SAP Help 또는 SAP for Me 검색이 필요하며 번호를 추측하지 않는다.
- Integration Suite Discovery Center: https://api.sap.com
- Datasphere Help: https://help.sap.com/docs/SAP_DATASPHERE

## 18. Out of Scope

- BW/4HANA on-prem data warehouse (use BW skill)
- Non-SAP iPaaS (Boomi, MuleSoft, Workato)
- PO/PI (older SAP integration platform — deprecated; migrate to CPI)
- HCI (older name for CPI)
