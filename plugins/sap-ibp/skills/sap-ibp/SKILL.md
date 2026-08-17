---
name: sap-ibp
description: >
  This skill handles all SAP IBP (Integrated Business Planning) tasks including
  Demand Sensing, S&OP, Supply Planning, Inventory Planning, Response & Supply,
  Control Tower, Excel UI integration, planning algorithms, time series forecasting,
  master data integration with S/4HANA, BTP environment provisioning, ATP
  (Available-to-Promise) checks, multi-level planning, snapshots, version
  management, key figures, planning levels, planning operators, and SAP IBP
  Excel UI. Use this skill whenever the user mentions IBP, demand planning,
  supply planning, S&OP, sales and operations planning, demand sensing, inventory
  optimization, statistical forecasting, planning area, planning level, key figure,
  time-series, IBP Excel, BTP planning, response planning, ATP, or any IBP
  module question.
allowed-tools: Read, Grep, Glob
---

# sap-ibp — Integrated Business Planning

## 1. Environment Intake Checklist

Before answering an IBP question, capture the environment context:

1. **IBP Release** — tenant의 About 화면에 표시되는 release와 upgrade date는 무엇인가?
2. **Deployment** — BTP (SaaS) only. On-premise version does not exist.
3. **Modules in scope** — Demand, Sales & Operations, Supply, Inventory, Response, Control Tower?
4. **Integration** — Cloud Integration for data services(CI-DS), SAP Cloud Integration,
   Real-Time Integration(RTI) 중 실제 경로는 무엇인가? 다른 source(APO, BW, non-SAP)가 있는가?
5. **Excel UI version** — IBP Excel Add-In version on user's workstation?
6. **Planning Area** — SAP 제공 sample 기반인가, customer-defined planning area인가?
7. **Industry sector** — Retail, manufacturing, life sciences, etc.?

## 2. Module Coverage Matrix

| IBP Module | Purpose | Key Use Cases |
|---|---|---|
| **Demand** | Statistical forecasting + sensing | Mid/long-term demand, demand sensing (DS) |
| **Sales & Operations (S&OP)** | Integrated business planning | Reconcile demand-supply, capacity, financials |
| **Supply** | Multi-stage supply planning | Production, sourcing, distribution |
| **Inventory** | Multi-echelon inventory optimization | Safety stock, replenishment policies |
| **Response & Supply** | Order-based real-time planning | ATP, allocation, gating |
| **Control Tower** | Visibility & exception management | KPIs, alerts, scenario analysis |

## 3. Core Concepts

### 3.1 Planning Area & Planning Level
- **Planning Area** (e.g., SAP7, SAPIBP1) — defines the data model: master data, key figures, time profile, planning operators.
- **Planning Level** — granularity (PROD, LOC, CUST, etc.) and combinations (PROD+LOC).
- **Key Figure** — measurable values (sales, forecast, capacity, etc.) with calculation logic.

### 3.2 Time Profile
- Hierarchical (Year → Quarter → Month → Week → Day) or non-hierarchical.
- Aggregation/disaggregation governed by key figure properties.

### 3.3 Master Data
- Product, Location, Customer, Resource, etc.
- Integration: S/4HANA master replication via CPI Integration Content.

### 3.4 Planning Operators
- **Copy Operator** — duplicate key figure values
- **Forecast Operator** — statistical algorithms (Croston, AR, Triple Exponential Smoothing, ML-based)
- **Snapshot Operator** — freeze planning version
- **Disaggregation/Aggregation** — across planning levels

## 4. Standard Workflow

```
1. Master Data Load (Product, Location, Customer)
   ↓
2. Historical Data Load (Sales, Shipments, etc.)
   ↓
3. Statistical Forecasting (Demand)
   ↓
4. Demand Review (collaborative editing in Excel)
   ↓
5. Supply Planning (heuristic or optimization)
   ↓
6. S&OP Review (financial alignment)
   ↓
7. Plan Approval → Release to Execution (S/4HANA)
   ↓
8. Response & Order Confirmation
```

## 5. Critical Issues by Module

### Demand
- **Forecast not generating** — check planning operator definition, forecast model assignment, history coverage
- **Outliers skewing forecast** — apply outlier detection (Croston/seasonal)
- **Excel performance** — reduce planning view size, batch refresh

### Supply
- **Heuristic vs Optimizer** — heuristic for speed, optimizer for cost/lead-time tradeoffs
- **Infeasibility** — check capacity constraints, BOM consistency, lead times
- **Supply not propagating** — check source-of-supply configuration

### Inventory
- **Safety stock target unrealistic** — review demand variability inputs, service level targets
- **Multi-echelon misalignment** — check echelon hierarchy in master data

### Response & Supply
- **ATP confirmation slow** — check planning area indexing, network complexity
- **Allocation conflicts** — review priority rules, ATP check group

### Control Tower
- **Alert volume too high** — refine alert thresholds, group by severity
- **KPI staleness** — check data integration frequency

## 6. Integration with S/4HANA

| Direction | Content | Mechanism |
|---|---|---|
| S/4 → IBP | 시계열 master/transaction data | CI-DS 또는 지원되는 표준 integration content |
| S/4 → IBP | order-based stock, demand, supply objects | 지원 릴리스의 RTI |
| IBP → S/4 | Planned independent requirements (PIRs) | IBP release job + 실제 integration path |
| IBP → S/4 | 지원되는 실행 제안 | scope와 release가 지원하는 integration content |

Common integration issues:
- Master data ID mismatch → align via IBP Configuration → External Codes
- Sales history not flowing → check CI-DS task 또는 실제 Cloud Integration message와 mapping
- PIR release fails → check S/4 planning version, MRP type, period coverage

## 7. Korean Context

- **Demand planning in Korean SMB context** — IBP is enterprise-oriented; mid-size Korean firms may use simpler tools first
- **Sales history with promotion impact** — separate baseline vs. event lifts
- **Chuseok/Lunar New Year** — embed in time-event master for accurate seasonality
- **Multi-plant Korea + overseas subsidiaries** — multi-currency planning, transfer pricing in S&OP

## 8. Best Practices Reference

3-Tier BP framework:
- **Tier 1 Operational**: `references/best-practices/operational.md` (TBD — Phase 1 v2.3)
- **Tier 2 Period-End**: `references/best-practices/period-end.md` (TBD)
- **Tier 3 Governance**: `references/best-practices/governance.md` (TBD)

## 9. SAP References

- SAP Help: SAP Integrated Business Planning for Supply Chain
- SAP Help: Integration Scenarios for SAP IBP
- SAP Best Practices content — tenant release와 scope를 확인한 뒤 사용
- SAP Note 번호는 `data/sap-notes.yaml`에 검증·등록된 경우에만 인용

## 10. Cross-module Routing

When the question touches:
- **Demand vs supply mismatch** → IBP Demand + Supply consultant
- **Sales order behavior** → also `sap-sd-consultant`
- **Production constraints** → also `sap-pp-consultant`
- **Integration issues** → also `sap-integration-cloud-consultant`
- **Cloud BTP env** → also `sap-btp` skill

## 11. Out of Scope

This skill does NOT cover:
- APO (deprecated; use IBP for new projects)
- Detailed production scheduling (PP/DS, EWM, MES)
- Real-time logistics tracking (Yard Logistics, ATTP)
- Non-SAP planning tools (Anaplan, o9, Kinaxis) — IBP-only scope

---

## 12. Diagnostic Response Contract

IBP 장애·숫자 불일치·planning run 실패는 다음 순서로 답한다.

```text
Issue
→ Primary Root Cause
→ Falsification
→ Check (IBP menu 또는 T-code + menu + Table.Field)
→ Fix
→ Rollback
→ Prevention
```

- **Issue**: planning area, version, time bucket, product-location 범위, 최초 실패 시각을 재정의한다.
- **Primary Root Cause**: 현재 evidence가 가장 강하게 지지하는 원인 하나를 먼저 둔다.
- **Falsification**: 그 원인이 틀렸다면 관찰될 결과를 최소 두 개 쓴다.
- **Check**: read-only job log, count, timestamp, mapping, key figure를 먼저 본다.
- **Fix**: sample 범위와 non-production version에서 검증된 최소 변경만 제시한다.
- **Rollback**: 원래 planning object, integration artifact, parameter와 복귀 조건을 명시한다.
- **Prevention**: count reconciliation, freshness SLA, change calendar, regression view를 둔다.

환경이 없으면 다음을 먼저 받되, 답변을 멈추지 않고 provisional read-only check도 제공한다.

1. IBP release와 tenant type
2. source의 ECC EhP 또는 S/4HANA release year
3. On-Premise, RISE Private Cloud, Public Cloud 구분
4. 업종과 planning cadence(Daily, Weekly, 월 S&OP)
5. planning area, version, time profile, time bucket
6. CI-DS, Cloud Integration, RTI 중 실제 integration route
7. 마지막 정상 run과 최초 실패 run ID, timezone 포함 시각

---

## 13. Demand Sensing Diagnostic

Demand Sensing은 단기 demand signal과 history를 사용한다. Forecast가 이상하다고 바로
algorithm을 바꾸지 말고 input → preprocessing → model → output 순서로 격리한다.

### 13.1 Evidence order

1. `IBP Web UI > Application Jobs`에서 실행 template, version, time horizon, status를 확인한다.
2. 같은 product-location의 history key figure에 누락·중복·급격한 단위 변화가 있는지 확인한다.
3. promotion, price, calendar, shipment 같은 signal의 coverage와 freshness를 비교한다.
4. preprocessing의 outlier correction, missing-value handling, lag가 실제로 적용됐는지 확인한다.
5. forecast output을 baseline과 sensing-adjusted 결과로 나눠 비교한다.
6. 대표 product-location을 같은 horizon으로 재현하고 전체 batch 결과와 대조한다.

### 13.2 Hypotheses and falsification

**H1 — history freshness 문제**

- Supporting: 마지막 정상 적재 이후 history가 비어 있거나 count가 감소했다.
- Falsification 1: source와 IBP의 기간별 count·합계가 정확히 일치한다.
- Falsification 2: 동일 history로 이전 model version은 정상 결과를 낸다.
- Fix: 누락 integration 범위를 sample로 복구하고 count reconciliation 후 전체 적재를 승인한다.
- Rollback: integration filter와 task version을 이전 값으로 돌리고 sample 적재분을 격리한다.

**H2 — event signal 또는 calendar alignment 문제**

- Supporting: 행사 주차가 다른 time bucket에 매핑되거나 event coverage가 일부 location만 빠졌다.
- Falsification 1: event date와 IBP time bucket이 모두 기대 기간에 정렬된다.
- Falsification 2: event signal을 제외한 controlled run에서도 같은 왜곡이 난다.
- Fix: test version에서 calendar/mapping을 바로잡고 event 포함·제외 A/B 결과를 비교한다.
- Rollback: 이전 calendar/mapping과 forecast version으로 복귀한다.

**H3 — algorithm보다 planning level이 원인**

- Supporting: input이 더 높은 level에만 있고 disaggregation 결과가 특정 조합에 쏠린다.
- Falsification 1: base planning level에 입력이 있고 aggregation/disaggregation 결과가 보존된다.
- Falsification 2: 같은 level의 단일 product-location 실행도 동일하게 실패한다.
- Fix: planning level과 disaggregation expression을 test copy에서 검증한다.
- Rollback: 기존 key figure calculation과 planning level definition으로 복귀한다.

---

## 14. S&OP Diagnostic

S&OP 숫자 불일치는 demand, supply, inventory, finance view가 서로 다른 version·currency·
time horizon을 보고 있는지부터 확인한다.

### 14.1 Review sequence

1. 사용자가 연 planning view의 planning area, version, scenario를 기록한다.
2. demand review와 supply review의 cutoff timestamp를 맞춘다.
3. consensus demand가 어느 key figure와 approval step에서 확정됐는지 확인한다.
4. constrained supply와 unconstrained supply를 구분한다.
5. revenue/cost/margin 계산의 currency conversion date와 unit을 확인한다.
6. executive dashboard의 aggregation level과 Excel add-in view filter를 맞춘다.

### 14.2 Common failures

| Symptom | Primary check | Falsification |
|---|---|---|
| Consensus가 안 보임 | version publish와 copy operator | target version에 같은 값이 있으면 copy 실패 기각 |
| Finance 숫자가 다름 | currency/unit/cutoff | 동일 rate date와 level에서도 다르면 conversion 단독 원인 기각 |
| Supply review가 과거 값 | supply run 시각과 input snapshot | run이 최신 input 이후면 stale-run 가설 기각 |
| 한 조직만 누락 | filter와 master-data combination | combination이 존재하고 권한도 같으면 master 누락 기각 |

Fix는 먼저 test version에서 수행한다. 운영 consensus version을 직접 덮어쓰지 않는다.
Rollback은 이전 snapshot/version을 보존하고 publish 중단 기준을 포함한다.

---

## 15. Supply Planning Diagnostic

Supply 결과가 없거나 infeasible이면 master data와 constraint를 먼저 본다.

### 15.1 Dependency ladder

1. Product와 Location combination
2. Source of Supply와 transport/production source
3. BOM 또는 production source structure
4. Resource와 capacity supply
5. lead time, lot size, minimum/maximum, frozen horizon
6. demand input과 planning horizon
7. heuristic 또는 optimizer run profile

상위 dependency가 없으면 하위 parameter tuning으로 해결하지 않는다.

### 15.2 Heuristic vs optimizer

- Heuristic은 priority와 rule을 따라 빠르게 supply를 전개하지만 cost optimum을 보장하지 않는다.
- Optimizer는 objective와 constraint를 사용하므로 cost coefficient, penalty, capacity가 중요하다.
- 같은 symptom이라도 실행 유형을 확인하지 않고 optimizer parameter를 권하지 않는다.

**Falsification example**:

- 가설: resource capacity가 0이라 supply가 생성되지 않았다.
- 기각 1: 해당 horizon의 capacity supply가 양수이고 utilization도 한도 미만이다.
- 기각 2: unconstrained run에서도 같은 product-location supply가 생성되지 않는다.
- 다음 경로: source validity, BOM, lead time, lot-size, horizon 순으로 이동한다.

**Safe fix**: 대표 network subset의 copied version에서 하나의 parameter만 바꾼다.

**Rollback**: run profile과 master-data version을 복원하고 생성된 proposal을 publish하지 않는다.

---

## 16. Inventory Planning Diagnostic

Inventory Optimization은 단순 safety-stock 수식이 아니다. service level, demand uncertainty,
lead-time variability, review period와 multi-echelon network를 함께 본다.

### 16.1 Evidence order

1. Target service level과 service-measure 정의
2. demand mean/variability와 outlier 처리
3. replenishment lead time과 variability
4. sourcing ratio와 echelon 연결
5. current stock, pipeline stock, order policy
6. optimizer input horizon과 output horizon
7. constraint 또는 fallback 메시지

### 16.2 Diagnostic matrix

| Symptom | Likely boundary | Falsification |
|---|---|---|
| Safety stock가 과대 | lead-time/demand variability | input variability가 정상이고 비교 run도 같으면 단독 원인 기각 |
| 하위 echelon만 0 | network/source relation | relation이 유효하고 상위 supply도 있으면 network 누락 기각 |
| 결과가 생성 안 됨 | master combination 또는 optimizer input | 모든 required input이 있고 job이 성공하면 input 누락 기각 |
| 변경 효과가 없음 | output key figure/version | target version의 output이 갱신되면 stale-output 기각 |

Service level을 임의 퍼센트로 제안하지 않는다. 고객 정책과 segment별 목표를 받는다.
Fix 전에는 이전 inventory target snapshot을 남기고, 결과 publish 전 business owner 승인을 받는다.

---

## 17. Response & Supply Diagnostic

Order-based planning은 RTI freshness, order priority, allocation/gating, planning run 순서로 본다.

1. Initial Load와 delta의 성공 시각·object count를 확인한다.
2. Stock, Sales Order, Purchase/Production Order의 대표 key를 양쪽에서 대조한다.
3. order priority와 requested/confirmed date를 비교한다.
4. allocation 또는 gating rule이 적용된 scope를 확인한다.
5. planning horizon과 freeze/fix 상태를 확인한다.
6. response run이 마지막 delta 이후 실행됐는지 확인한다.

**H1 — RTI delta 지연**

- Supporting: source order timestamp가 IBP replicated timestamp보다 새롭다.
- Falsification: 대표 order key와 count가 동일하고 마지막 delta도 source 변경 이후다.
- Fix: backlog 원인을 제거한 뒤 bounded delta를 test하고 count를 맞춘다.
- Rollback: filter/config를 이전 값으로 복귀하고 승인 없는 full reinitialization은 하지 않는다.

**H2 — priority 또는 allocation rule**

- Supporting: stock은 있으나 lower-priority order가 rule에 의해 미확정이다.
- Falsification: 같은 rule scope의 높은 priority order도 동일하게 미확정이다.
- Fix: copied scenario에서 priority/rule 결과를 비교하고 정책 승인 후 변경한다.
- Rollback: 이전 rule version과 order snapshot으로 복귀한다.

---

## 18. Control Tower Diagnostic

Control Tower는 alert 자체보다 alert가 참조한 key figure와 threshold evidence가 중요하다.

### 18.1 Alert triage

1. alert definition, severity, owner, planning area/version을 확인한다.
2. alert timestamp와 source key figure freshness를 비교한다.
3. threshold의 unit, sign, aggregation level을 확인한다.
4. 동일 조건의 affected combinations 수와 business impact를 집계한다.
5. alert를 mute하기 전에 false positive인지 stale input인지 분리한다.

### 18.2 Falsification examples

- Threshold 가설은 같은 unit/level에서 값이 threshold 안쪽이면 기각한다.
- Stale-data 가설은 input timestamp가 SLA 안이고 source count와 일치하면 기각한다.
- Authorization 가설은 같은 role의 다른 사용자가 동일 alert를 보면 낮춘다.
- Alert definition을 넓혀 소음을 숨기지 말고 representative subset으로 검증한다.

Rollback은 이전 alert definition과 owner/severity를 복원하는 것이며, alert history를 삭제하지 않는다.

---

## 19. S/4 Integration — PIR to MRP Evidence Chain

IBP job 성공만으로 S/4 반영 성공을 선언하지 않는다.

1. `[T-code: 없음 | menu: IBP Web UI > Application Jobs]`
   - release job, planning area, version, horizon, record count, status를 확인한다.
2. `[T-code: 없음 | menu: SAP Integration Suite > Monitor > Integrations and APIs > Monitor Message Processing]`
   - 실제 경로가 Cloud Integration이면 correlation ID, mapping, receiver status를 확인한다.
3. `[T-code: 없음 | menu: Cloud Integration for data services > Monitor > Task Executions]`
   - 실제 경로가 CI-DS이면 task ID, extracted/loaded/rejected count를 확인한다.
4. `[T-code: MD63 | menu: SAP Easy Access > Logistics > Production > Master Planning >
   Demand Management > Planned Independent Requirements > Display]`
   - 같은 material, plant, version, period의 PIR을 조회한다.
   - read-only table evidence는 `PBIM-MATNR`, `PBIM-WERKS`, `PBIM-VERSB`,
     `PBED-PDATU`, `PBED-PLNMG`를 사용한다.
5. `[T-code: MD04 | menu: SAP Easy Access > Logistics > Production > MRP > Evaluations >
   Stock/Requirements List]`
   - 같은 material/plant에서 PIR requirement element와 date/quantity를 확인한다.
6. `[T-code: SLG1 | menu: SAP Easy Access > Tools > Administration > Monitor > Application Log]`
   - 설치된 integration content가 application log를 남길 때만 실제 object/subobject를 받아 조회한다.

### 19.1 Falsification

- `MD63`에 PIR이 없으면 “MRP 계산 문제”보다 release/integration/mapping을 우선한다.
- `MD63`에 정확한 PIR이 있고 `MD04`에도 같은 requirement가 보이면 “PIR 미반영”은 기각한다.
- `MD63`에는 있으나 `MD04`에 없으면 version, consumption, MRP relevance, planning date를 본다.
- IBP와 S/4 count가 같아도 대표 key의 date/quantity가 다르면 integration 성공으로 확정하지 않는다.

### 19.2 Fix and rollback

- Mapping은 non-production artifact에서 sample material-location 한 건으로 검증한다.
- S/4 Customizing 변경은 DEV/QA와 승인된 TR을 거친다.
- IBP planning object 변경은 copied planning area/version에서 regression view를 실행한다.
- 원복할 mapping version, planning object activation state, release job parameter를 기록한다.
- 대량 re-release나 RTI reinitialization은 중복·삭제 영향을 승인받기 전 실행하지 않는다.

---

## 20. CI-DS vs RTI Decision Matrix

| Question | CI-DS / time-series path | RTI / order-based path |
|---|---|---|
| Primary data shape | master와 time-series key figure | order, stock, source 등 order-based object |
| First monitor | Task Executions와 row count | RTI integration status와 object count |
| Common failure | filter, mapping, reject, schedule | initial/delta sequence, object dependency, backlog |
| Dangerous shortcut | unrestricted full load | unapproved full reinitialization |
| Reconciliation | source/target row and key-figure totals | object count + representative business keys |
| Rollback | prior task/data-flow version | prior filter/config + controlled recovery plan |

실제 landscape가 어느 경로인지 확인하지 않고 두 절차를 섞지 않는다.

---

## 21. ECC vs S/4HANA Source Boundary

| Topic | ECC 6.0 source | S/4HANA source | Public Cloud boundary |
|---|---|---|---|
| Master/transaction extraction | installed integration add-on/content 기준 | supported standard content와 release 기준 | released API/communication scenario 기준 |
| PIR display | `MD63`이 제공되는 역할/GUI 기준 | `MD63` 또는 released app 범위 확인 | customer backend T-code 접근을 가정하지 않음 |
| MRP evidence | `MD04` classic list | `MD04`와 release-supported apps | released Fiori app/API |
| Customizing | DEV→QA→PRD TR | DEV→QA→PRD TR, clean-core 고려 | CBC/SSCUI/communication lifecycle |
| Table evidence | PBIM/PBED read-only | compatibility와 released CDS를 함께 고려 | direct table 접근 제안 금지 |

IBP는 SaaS이지만 source system behavior는 ECC와 S/4에서 다르다. 답변에 source release를 명시한다.

---

## 22. Change, Test, and Rollback Governance

### Before change

- planning object와 integration artifact의 현재 version/export를 보존한다.
- affected planning area, version, horizon, combinations, job dependency를 기록한다.
- business owner와 integration owner를 지정한다.
- 운영 change window와 concurrent planning run을 확인한다.

### Test

- copied version 또는 non-production planning area를 사용한다.
- representative product-location과 edge case를 포함한다.
- before/after count, total, freshness, runtime을 같은 기준으로 비교한다.
- integration은 single canary 후 bounded batch로 확대한다.

### Rollback gate

- record count divergence
- unexpected overwrite 또는 duplicate
- runtime/queue 악화
- downstream `MD63`/`MD04` 불일치
- business KPI가 승인 범위를 벗어남

Rollback 뒤에는 이전 version을 재활성화했다는 사실만 보지 말고 같은 reconciliation을 다시 수행한다.

---

## 23. Anti-Patterns

- ❌ IBP job이 Completed라는 이유만으로 S/4 반영까지 성공했다고 단정
- ❌ `MD04`만 보고 PIR 생성 여부를 추정하고 `MD63`을 건너뜀
- ❌ CI-DS와 RTI를 같은 integration mechanism으로 설명
- ❌ 원인 확인 전 full load, full reinitialization, 대량 re-release 실행
- ❌ 운영 planning area/version의 key figure를 수동으로 덮어써 integration 오류 은폐
- ❌ company code, plant, location, product, planning area를 임의 값으로 하드코딩
- ❌ algorithm을 바꾸기 전에 input freshness와 planning level을 확인하지 않음
- ❌ service level, safety stock, optimizer cost를 근거 없는 고정값으로 권고
- ❌ alert를 삭제하거나 threshold를 무작정 넓혀 Control Tower 소음 숨김
- ❌ `SE16N`으로 운영 S/4 table을 수정
- ❌ credential, token, 개인·고객 정보가 든 payload 원문을 외부로 전송
- ❌ Public Cloud 사용자에게 classic backend T-code 변경을 안내
- ❌ QA/test, 승인, content transport 또는 TR, rollback 없이 설정 변경
- ❌ 검증되지 않은 SAP Note 번호나 T-code를 추정

---

## 24. Operator Handoff Checklist

```text
□ IBP/source release와 deployment 기록
□ planning area/version/time bucket 기록
□ 실제 integration route(CI-DS/Cloud Integration/RTI) 확정
□ 마지막 정상 run과 최초 실패 run 비교
□ source/target count와 대표 key 대조
□ 가설별 falsification evidence 2개 이상
□ non-production sample test
□ change ticket/content transport 또는 backend TR
□ rollback artifact와 trigger
□ business owner의 결과 승인
```
