---
name: sap-basis
description: >
  This skill handles SAP BASIS administration including transport management,
  system performance analysis, user authorization, client administration, background
  job management, and system monitoring. Use when user mentions BASIS, STMS, transport,
  transport request, SM50, SM66, ST05, ST12, SM21, authorization, PFCG, SU53, SU01,
  client, SCC4, background job, SM36, SM37, kernel, system log, CCMS, alert,
  work process, short dump, system copy, landscape refresh, SCC1, SPAM, SAINT.
---

## 1. Transport Management (STMS)

### Landscape Configuration

Standard 3-system landscape: DEV → QAS → PRD
- Each system has a system ID (SID) and client(s)
- Transport routes: consolidation route (DEV→QAS) + delivery route (QAS→PRD)

### Transport Request Types

| Type | Description | Client-specific? |
|------|-------------|-----------------|
| Workbench | Repository objects (programs, tables, classes) | No — system-wide |
| Customizing | Client-specific IMG settings | Yes — per client |
| Transport of Copies | Copy objects without releasing original | No |

### Transport Workflow

```
SE09 / SE10 (create / display request in DEV)
  → Release task → Release request
    → STMS (QAS): import queue → import
      → STMS (PRD): import queue → import (after QAS sign-off)
```

### Common Transport Errors

| Return Code | Meaning | Fix |
|------------|---------|-----|
| RC=0 | Success | — |
| RC=4 | Warnings | Review log — usually OK |
| RC=8 | Errors | Check transport log → fix object issue |
| RC=12 | Syntax error | SE38 in target system → check syntax |
| RC=16 | Fatal error | Check STMS log → object conflicts |

**Object locked by another request**
→ SM12 → check table TRDIR or object name → identify locking request → coordinate with owner

**Import conflict** (object already modified differently in target)
→ SPDD (dictionary objects) / SPAU (other objects) → manual adjustment required

---

## 2. Performance Analysis Toolkit

| T-code | Purpose | Key Action |
|--------|---------|-----------|
| SM50 | Work process overview (current instance) | Identify long-running / waiting processes |
| SM66 | Global work process overview (all instances) | System-wide bottleneck detection |
| ST05 | SQL trace activation + display | Find slow queries / missing indexes |
| SM12 | Lock entries | Find blocking locks by user / object |
| ST22 | Short dump analysis | Root cause of ABAP runtime errors |
| STAD | Workload monitor statistics | Response time analysis by user / report |
| SM21 | System log | Error / warning messages with timestamp |
| AL08 | Users logged on | Current sessions with work process assignment |
| RZ20 | CCMS alert monitor | Threshold-based system alerts |

### ST05 SQL Trace Workflow

1. SM50 → identify slow work process / user
2. ST05 → Activate trace (for specific user if possible)
3. Reproduce the slow operation
4. ST05 → Deactivate trace → Display trace
5. Sort by duration → identify table + statement
6. SE11 → check table → Indexes tab → verify appropriate index exists
7. If index missing → create index (test in DEV first) → transport to PRD

---

## 3. Authorization Administration

### Troubleshooting Access Issues

**Step 1 — Capture the error**
- User runs T-code → gets authorization error
- User runs **SU53** immediately → displays last failed authorization check
- Note: auth object name + field values that were checked

**Step 2 — Find the role**
- PFCG → search for role that should grant this access
- Or: SU01 → user → Roles tab → check assigned roles

**Step 3 — Fix the role**
- PFCG → role → Authorization tab → Change authorization data
- Add missing auth object or expand field values
- Generate authorization profile (Generate button)

**Step 4 — Assign and test**
- SU01 → user → Roles tab → assign role (or it inherits from composite role)
- User logs off and on again → test

### Authorization T-codes

| T-code | Purpose |
|--------|---------|
| SU53 | Display last failed auth check for own user |
| PFCG | Role maintenance (single / composite) |
| SU01 | User maintenance |
| SU10 | Mass user maintenance (lock / unlock / roles) |
| SU24 | Auth object proposals per T-code |
| ST01 | Authorization trace (use sparingly — performance impact) |
| SUIM | User information system (reports) |

### Role Types

| Type | Description |
|------|-------------|
| Single role | T-codes + authorization object values → generates one profile |
| Composite role | Combines multiple single roles → no direct auth objects |
| Derived role | Inherits from master role, only org values differ (used for org-level restrictions) |

---

## 4. System Monitoring

### SM21 — System Log

Filter options: message type (E=error / W=warning / A=abort / I=info), time range, user
Key patterns to watch:
- Database errors: ORA- / HDB- prefixed messages → escalate to DB team
- Update errors: Work process type = Update → check SM13
- Memory warnings: insufficient paging space → check server memory

### RZ20 — CCMS Alert Monitor

Standard monitoring trees:
- SAP CCMS Monitor Templates → SAP Systems → [SID]
- Configure thresholds: AL11 disk space / SM50 work processes / response times

### SM13 — Update Records

Failed updates = data integrity risk
- SM13 → filter by status "Error"
- Review: function module + error message
- Options: Restart update / Delete update record (use carefully — data loss risk)

### Critical Monitoring Checklist (Daily)

```
□ SM21: no red messages since last check
□ SM37: no cancelled background jobs (especially period-end jobs)
□ ST22: no new short dumps (or investigate any new ones)
□ SM13: no failed update records
□ AL11: disk space on transport directory / log directory
□ RZ20: no unacknowledged alerts
```

---

## 5. Client Administration

### Client Settings (SCC4)

| Setting | Values | Impact |
|---------|--------|--------|
| Client role | Production / Test / Customizing / Training | Affects what changes are allowed |
| Change option | No changes allowed / Modifiable | Prevents accidental production changes |
| System modifiability | No modifications / Modifiable (SCC4 + SE06) | Controls ABAP object editing |
| CATT / eCATT | Allowed / Not allowed | Testing tool usage |

**Production client protection** prevents:
- SE16N data edits in production tables
- SE80 direct ABAP development in production
- Table maintenance without transport

### Client Copy T-codes

| T-code | Purpose |
|--------|---------|
| SCCL | Local client copy (within same system) |
| SCC8 | Client export (to transport file) |
| SCC7 | Client import (from transport file) |
| SCC1 | Transport of client-specific objects (single request) |
| SCC3 | Client copy log |

---

## 6. Background Job Management

### Job Definition (SM36)

1. SM36 → Job name + job class (A/B/C)
2. Step: program name + variant (or external command)
3. Start condition: immediate / specific date-time / after event / periodic

### Job Classes

| Class | Priority | Use Case |
|-------|---------|---------|
| A | High | Critical jobs (payroll, period close) |
| B | Normal | Standard scheduled jobs |
| C | Low | Reports, non-critical batch |

### SM37 — Job Monitor

Filter options: job name (wildcard *), user, status, date range

| Status | Meaning | Action |
|--------|---------|--------|
| Finished | Success | Review log if unexpected results |
| Cancelled | Error | SM37 → Job log → identify error |
| Active | Running | Monitor duration vs expected |
| Scheduled | Waiting for trigger | Check start condition |
| Released | Ready to start | Waiting for free work process |

**Common issues**:
- Job cancelled: SM37 → Job log → ABAP dump or authorization error → fix and reschedule
- Job not starting: check server group assignment / no free background work processes (SM50)
- Overlapping jobs: long-running job blocks next scheduled run → increase frequency or optimize

---

## 7. S/4HANA BASIS Specifics

| Topic | ECC / Classic | S/4HANA |
|-------|--------------|---------|
| DB monitoring | DB02 / BR*Tools | SAP HANA Cockpit |
| HANA backup | Not applicable | HANA Cockpit → Backup & Recovery |
| HANA alerts | Not applicable | HANA Cockpit → Monitoring → Alerts |
| ALM / monitoring | Solution Manager | Cloud ALM (for RISE) |
| Transport | STMS (same) | STMS same + CTS+ for BTP |
| Upgrade tool | SPAU/SPDD | SUM (Software Update Manager) |
| System copy / refresh | R3trans / SAP tools | HANA backup restore |
| Kernel update | SPAM | Same (SPAM) |

**For RISE (Private Cloud)**:
- Basis access is restricted — SAP manages OS / DB / kernel
- Transport management: still STMS, but system refresh requires SAP ticket
- Cloud ALM replaces Solution Manager for project management + monitoring
