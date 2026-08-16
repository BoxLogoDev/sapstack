---
name: sap-sac
description: >
  This skill handles all SAP Analytics Cloud (SAC) tasks including Story design,
  Analytic Applications, Smart Insights, Predictive scenarios, Planning models,
  data connectivity (live vs. import), HANA Cloud connection, BW Bridge, BTP
  destination configuration, Datasphere integration, R visualizations, Smart
  Discovery, allocation, value driver tree, Time-series forecasting, Calculated
  Measures, Hierarchies, SAC Mobile, embedding (SAP Build Apps, Fiori), and
  performance optimization. Use whenever the user mentions SAC, Analytics Cloud,
  SAC Story, Analytic Application, BW Bridge, SAC Planning, Smart Insights,
  Predictive, or BTP analytics.
allowed-tools: Read, Grep, Glob
---

# sap-sac — SAP Analytics Cloud

## 1. Environment Intake Checklist

1. **SAC tenant region** — eu10 / us10 / kr-canary 등?
2. **Edition** — SAC for BI / Planning / Smart Predict / Augmented Analytics?
3. **Connection type** — Live (HANA, BW, S/4) vs. Import (Datasphere, Files)?
4. **Underlying data source** — S/4HANA Cloud / On-Premise / BW / Datasphere / non-SAP?
5. **Use case** — BI Story, Analytic App, Planning, Predictive scenario?
6. **User role** — Story creator, Modeler, Planning user, Admin?
7. **SAP release** — ECC 6.0 EhP 또는 S/4HANA release year?
8. **Deployment** — On-Premise / RISE Private Cloud / Public Cloud?
9. **Industry** — 제조·유통·금융·공공 등 데이터 통제와 마감 패턴은 무엇인가?
10. **Failure scope** — 전체/특정 사용자, 최초 시각, 재현 빈도, 정확한 에러 문구?
11. **Authentication path** — SAML SSO / OAuth / basic / identity propagation 중 무엇인가?
12. **Change history** — 인증서·metadata·proxy·role·model 변경 직후인가?

환경이 부족해도 답을 멈추지 않는다. 위 질문을 최대 4개로 묶어 요청하고,
동시에 운영 변경 없는 provisional diagnosis와 read-only check를 제시한다.

## 2. Core Concepts

### 2.1 Connection Models
- **Live Connection** — real-time query, no data copy. HANA, BW, S/4 CDS views.
- **Import Connection** — periodic data load. Files, Datasphere, non-SAP DBs.

### 2.2 Models
- **Analytic Model** — flexible, dimension/measure-based, for BI Story
- **Planning Model** — supports input, version, allocation, value driver
- **Predictive Model** — Smart Predict / Augmented (regression, classification, time series)

### 2.3 Stories vs. Analytic Applications
- **Story** — drag-drop dashboards, smart insight, easy for business users
- **Analytic Application** — scriptable (JS), customizable UI, for app developers

## 3. Typical Issues

### Data Issues
- "Story is empty" — check connection, model permissions, member filter
- "Numbers don't match S/4" — live vs. import mismatch, currency/unit conversion
- "Hierarchy missing" — refresh hierarchy in connection, check role mapping
- "Live connection failed" — SAC connection → network/auth → S/4 `SICF` → `SAML2` 순서

### Performance
- Story slow → live query optimization (CDS views, indexes), reduce visible measures, use story-level filters
- Live BW: check BW query performance, OLAP cache

### Planning
- "Cannot save value" — check write access, locked dimensions, version status (Public/Private)
- Allocation fail → check source/target model, rule structure
- Forecast not generating → check data history, model dimensions

### Predictive
- Smart Predict accuracy low → review data quality, target balance, feature relevance
- Time-series forecasting → ensure consistent intervals

## 4. Connections to S/4 / Datasphere

| Source | Connection | Notes |
|---|---|---|
| **ECC 6.0** | BW Query 또는 지원되는 Import/OData | S/4 Released CDS 경로를 가정하지 않음 |
| **S/4HANA Public Cloud** | 지원되는 cloud connection/API | Released CDS/API만 사용, 고객 `SICF` 조정 불가 |
| **S/4HANA On-Prem / RISE** | Live via 지원되는 network path | Cloud Connector/reverse proxy 선택은 실제 아키텍처 기준 |
| **BW/4HANA** | Live via InA | BW Query 권한과 성능을 분리 확인 |
| **Datasphere** | Live (Spaces) or Import | preferred for cloud BI |
| **HANA Cloud** | Live | direct |
| **Non-SAP DB** | Import via OData/JDBC | Datasphere as bridge recommended |

## 5. Korean Context

- **한국 데이터 위치**: SAC tenant region이 ap-southeast-1 (싱가포르) 또는 kr-canary
- **공공기관 컴플라이언스**: K-ISMS, 망분리 환경에서 SAC 사용은 Private Cloud 검토
- **한국어 UI**: SAC Story Title/Label 한국어 OK; 데이터 dimension name은 영문 권장
- **다국가 자회사 통합 보고**: 한국 본사 SAC tenant에 자회사 데이터 통합 (consolidation)

## 6. Cross-module Routing

- BTP 환경/Cloud Connector 이슈 → `sap-btp`
- S/4 CDS view → `sap-abap-developer`
- Datasphere 연동 → `sap-integration-cloud` (Datasphere 포함 시)
- Planning workflow → 비즈니스 컨설턴트 (CO/FI)

## 7. SAP Notes & References

- SAP Note 2511489 — SAC performance troubleshooting (registered in `data/sap-notes.yaml`)
- SAP Note 3056467 — Slow performance when opening/running stories (registered)
- SAP Note 2651014 — Common errors with charts and tables (registered)
- SAC Help: https://help.sap.com/docs/SAP_ANALYTICS_CLOUD
- SAC Best Practices Guide (Story design, Planning, Predictive)

## 8. Out of Scope

- BW dataflow design (use sap-abap)
- Datasphere modeling (use sap-integration-cloud)
- Non-SAC BI tools (Tableau, Power BI 등)

## 9. Diagnostic Response Contract

SAC 장애·숫자 불일치·성능 이슈는 다음 순서로 답한다.

1. **Issue** — 증상, 영향 사용자, 시작 시각, source, connection mode를 재정의한다.
2. **Primary Root Cause** — 현재 evidence가 가장 강하게 지지하는 원인 하나를 먼저 쓴다.
3. **Falsification** — 원인이 틀렸다면 보여야 할 관찰값을 두 개 이상 쓴다.
4. **Check** — SAC UI 경로와 backend T-code + 메뉴 경로 + monitor/table field를 쓴다.
5. **Fix** — 최소 변경, QA Test Connection, 샘플 Story 검증 순으로 쓴다.
6. **Rollback** — 원복 artifact, trigger, owner, 정상 판정 기준을 쓴다.
7. **Prevention** — 인증서 만료, content transport, 성능 budget, refresh SLA를 쓴다.

단순 용어 질문은 Quick Advisory로 끝낼 수 있다.
실패 원인이 둘 이상이거나 cross-system 변경이 필요하면 Evidence Loop를 사용한다.
Evidence Loop에서는 운영자가 COLLECT를 수행하며 에이전트가 프로덕션 변경을 대행하지 않는다.

### 9.1 Minimum Evidence Bundle

- SAC tenant 리전과 tenant ID의 마스킹된 식별자
- SAC update wave 또는 문제 발생 전후 release 정보
- Story / model / connection 종류와 마스킹된 object 이름
- ECC EhP 또는 S/4HANA release year, deployment model, industry
- 전체 사용자/특정 사용자 여부와 성공하는 비교 사용자 존재 여부
- 최초·최근 실패 시각(타임존 포함), HTTP status, correlation ID
- SAML assertion 본문이 아닌 issuer·audience·NameID type의 마스킹된 요약
- 변경 이력: 인증서, metadata, proxy, role, content transport, source query

Token, cookie, password, assertion 원문, 개인정보, 실제 재무 상세값은 수집하지 않는다.
화면 캡처에는 tenant host·사용자 ID·고객명·사업장명을 마스킹한다.

## 10. Environment and Release Decision Matrix

| Environment | First supported path to identify | Do not assume |
|---|---|---|
| ECC 6.0 | BW Query, supported OData/Import, existing HANA/BW architecture | S/4 Released CDS or direct S/4 InA semantics |
| S/4HANA On-Premise | actual live endpoint, reverse proxy/Cloud Connector, backend ICF | every landscape uses the same proxy pattern |
| RISE Private Cloud | customer-managed vs SAP-managed boundary, approved connectivity | customer can change every backend component |
| S/4HANA Public Cloud | released analytical content/API and cloud administration | customer access to `SICF`, `SAML2`, `STRUST` |
| BW/4HANA | InA endpoint, BW Query, authorizations, query runtime | Story rendering is always the bottleneck |
| Datasphere | Space exposure, live/import mode, replication freshness | federation and replication have the same latency |

Public Cloud action에는 `T-code: 없음(Cloud UI)`을 명시하고 해당 Fiori/SAC 메뉴 경로를 쓴다.
On-Premise/RISE action에는 아래 T-code directory의 메뉴 경로를 함께 쓴다.
어느 release인지 모르면 S/4 전용 CDS 이름이나 customer-maintainable backend setting을 단정하지 않는다.

## 11. Live Connection Failure Playbook

진단 순서는 반드시 **SAC → network/auth → S/4 `SICF` → `SAML2`** 이다.
각 단계가 통과한 evidence를 남긴 뒤 다음 단계로 간다.

### 11.1 Phase A — SAC Object and Scope

1. `T-code: 없음(SAC UI)` + `SAC Home > Connections > 해당 connection > Test Connection`에서
   connection 자체가 실패하는지, Story만 실패하는지 분리한다.
2. `T-code: 없음(SAC UI)` + `SAC Home > Files > 해당 Story > View`에서
   같은 model을 쓰는 최소 Story와 원본 Story를 비교한다.
3. `T-code: 없음(SAC UI)` + `SAC Home > Security > Users/Roles`에서
   실패 사용자와 성공 사용자의 SAC role·team·sharing 차이만 read-only로 비교한다.
4. connection owner만 성공하면 shared credential/SSO/user mapping 가설을 올린다.
5. 모두 실패하면서 endpoint DNS/TLS에 도달하지 못하면 Story 계산 가설을 내린다.

**Falsification A**

- 같은 connection의 최소 Story가 정상 조회되면 connection 전체 장애 가설은 기각한다.
- 같은 사용자·같은 시간에 Test Connection은 성공하고 특정 Story만 실패하면 network 가설을 낮춘다.
- 성공 사용자와 실패 사용자의 role·team이 동일하면 SAC sharing만의 문제라는 가설을 낮춘다.

### 11.2 Phase B — Network and Authentication Edge

1. 브라우저 개발자 도구에서 실패 request의 host·path·HTTP status·timing만 수집한다.
   Header, cookie, token, payload는 내보내지 않는다.
2. reverse proxy 또는 Cloud Connector를 쓰는지 실제 topology로 확인한다.
   두 방식을 동시에 당연한 구성으로 적지 않는다.
3. `SMICM` + `SAP Easy Access > Tools > Administration > Monitor > System Monitoring >
   Internet Communication Manager`에서 실패 시각의 HTTP/TLS 연결 흔적을 read-only로 본다.
4. `STRUST` + `SAP Easy Access > Tools > Administration > Administration > Trust Manager`에서
   endpoint가 사용하는 PSE의 인증서 유효기간·issuer chain·hostname 관계를 확인한다.
5. proxy가 TLS를 terminate하면 browser→proxy와 proxy→backend 인증서 체인을 분리한다.
6. HTTP 401/403이면 endpoint 도달은 성공했으므로 DNS/firewall 가설의 우선순위를 낮춘다.
7. timeout/502/503이면 auth mapping을 바꾸기 전에 proxy route·backend reachability를 증명한다.

**Falsification B**

- backend `SMICM`에 같은 시각 request가 보이면 firewall이 backend 도달을 막았다는 가설은 기각한다.
- TLS handshake와 인증서 체인이 정상이고 401/403이 반환되면 인증서 만료 단독 가설은 기각한다.
- SAC가 아닌 승인된 기술 테스트도 같은 endpoint에서 실패하면 Story/model 가설을 낮춘다.

### 11.3 Phase C — S/4 ICF Service (`SICF`)

이 단계는 S/4HANA On-Premise 또는 customer-managed RISE 범위에서만 수행한다.
Public Cloud에는 `T-code: 없음(고객 접근 불가)`로 표시하고 SAP cloud 운영 경로로 에스컬레이션한다.

1. 실패 request에서 실제 service path를 먼저 확인한다.
2. `SICF` + `SAP Easy Access > Tools > Administration > Administration > Network >
   HTTP Service Hierarchy`에서 그 path에 대응하는 InA 또는 OData node의 활성 상태를 조회한다.
3. InA 계열은 실제 configured endpoint의 `/sap/bw/ina` 하위 path를 기준으로 확인한다.
4. OData 계열은 실제 configured endpoint의 `/sap/opu/odata` 하위 path를 기준으로 확인한다.
5. 상위 node가 보인다는 이유로 subtree 전체를 활성화하지 않는다.
6. node 활성 상태와 handler/authorization 오류를 분리하고 실패 시각을 기록한다.
7. 활성 변경이 필요하면 개발/QA에서 정확한 node 하나만 변경하고 TR·변경 승인에 연결한다.
8. 변경 후 `SAC Home > Connections > 해당 connection > Test Connection`
   (`T-code: 없음(SAC UI)`)과 최소 read-only Story를 재실행한다.

**Falsification C**

- 정확한 node가 활성이고 같은 path가 유효한 HTTP 응답을 내면 inactive ICF 가설은 기각한다.
- ICF 활성화 전후 HTTP status가 동일하면 서비스 비활성 단독 가설을 기각하고 auth로 이동한다.
- 다른 사용자에게 동일 endpoint가 정상이라면 전역 ICF 비활성 가설은 기각한다.

### 11.4 Phase D — SAML Trust and Metadata (`SAML2`)

ICF endpoint가 응답하는 것을 증명한 뒤에 수행한다.

1. `SAML2` + `SAP Easy Access > Tools > Administration > Administration > Security >
   SAML 2.0 Configuration`에서 Local Provider 활성 상태를 확인한다.
2. SAC/IdP의 Trusted Provider가 enabled인지 확인한다.
3. 양쪽 metadata의 entity ID, ACS URL, issuer, audience가 현재 endpoint와 맞는지 비교한다.
4. signing certificate 유효기간과 교체 이력, metadata 재import 시각을 확인한다.
5. NameID/user mapping이 실패 사용자에게 어떤 backend ID를 만드는지 마스킹해 비교한다.
6. 시스템 clock 차이로 assertion validity window를 벗어나는지 확인한다.
7. `SU53` + `System > Utilities > Display Authorization Check`를 실패 직후 실행해
   마지막 실패 authorization object를 수집한다. 성공 후 나중에 실행한 결과는 evidence로 쓰지 않는다.
8. role 변경이 필요하면 `PFCG` + `SAP Easy Access > Tools > Administration > User Maintenance >
   Role Administration > Roles`에서 승인된 role owner와 함께 최소 권한만 검토한다.

**Falsification D**

- 동일 SAML identity로 backend launch가 성공하고 SAC만 실패하면 backend trust 단독 가설을 낮춘다.
- Local/Trusted Provider, metadata, certificate, clock이 모두 일치하면 trust mismatch 가설을 기각한다.
- `SU53`에 실패 authorization이 재현되고 role 차이가 있으면 network 가설보다 권한 가설을 올린다.

### 11.5 Live Fix and Rollback Pairs

| Confirmed cause | Minimal Fix after QA | Mandatory Rollback |
|---|---|---|
| wrong SAC connection setting | approved connection copy에서 endpoint/auth 수정 후 Test Connection | 기존 connection export/설정으로 복원하고 테스트 |
| expired TLS chain | 승인된 새 chain을 QA PSE에 반영 후 handshake 검증 | 기존 PSE backup·certificate chain으로 원복 |
| exact ICF node inactive | 필요한 node 하나만 QA에서 활성화하고 TR 승격 | 같은 node를 이전 상태로 되돌리고 request 재검증 |
| stale SAML metadata | 현 endpoint metadata를 QA에서 재import하고 mapping 검증 | 이전 metadata/certificate backup 재적용 |
| missing authorization | role owner 승인 후 최소 object만 role transport | 이전 role version/transport로 복원하고 user 비교 |

Fix 전후에 같은 사용자, 같은 최소 Story, 같은 filter, 같은 시간대 기준을 사용한다.
Rollback trigger는 오류율 상승, 다른 SSO consumer 영향, 응답 status 악화처럼 측정 가능해야 한다.

## 12. Import vs Live — Do Not Mix the Diagnosis

| Dimension | Live Connection | Import Connection |
|---|---|---|
| Data location | source에 남아 query됨 | SAC model에 snapshot 적재 |
| Freshness | source query 시점 | 마지막 successful job 시점 |
| Main failure surface | endpoint, SSO, source authorization, query | job, mapping, delta, transformation, model load |
| Security | source row/data authorization + SAC sharing | SAC model security + import credential |
| Performance | source runtime + network + rendering | model size + calculation + rendering |
| Safe first test | Test Connection + minimal Story | preview + small scoped import job |
| Wrong first fix | cache/full reload | `SICF`/SAML activation |

### 12.1 Import Load Failure Check

1. `T-code: 없음(SAC UI)` + `SAC Home > Data Management > 해당 model > Import Jobs`에서
   마지막 성공·실패 시각, row count, rejected records, mapping error를 확인한다.
2. source schema가 바뀌었는지 dimension key·measure type·date format 수준으로 비교한다.
3. full reload 전에 제한된 기간/샘플 row로 Test Run을 수행한다.
4. ODP delta를 쓰는 architecture이면 `ODQMON` +
   `SAP Easy Access > Tools > Administration > Monitor > Operational Delta Queue`에서
   subscription·request 상태를 read-only로 확인한다.
5. delta gap이 확정되지 않았는데 queue를 reset하거나 full initialization하지 않는다.
6. mapping 변경은 model copy에서 테스트하고 content transport에 포함한다.

**Import falsification**

- job이 성공했고 row count·watermark가 source와 맞으면 scheduler 실패 가설은 기각한다.
- 같은 source preview에서 schema가 정상인데 load만 실패하면 source extraction 단독 가설을 낮춘다.
- 작은 기간 Test Run은 성공하고 전체만 실패하면 권한보다 volume/timeout 가설을 올린다.

**Import rollback**

- 변경 전 model/content package와 mapping export를 보관한다.
- 새 job을 중단하고 기존 schedule·mapping·credential reference로 복원한다.
- 원복 뒤 이전 성공 범위의 작은 기간을 재적재해 정상 여부를 확인한다.

## 13. Planning Model Save Failure

"저장 안 됨"을 version, lock, authorization, validation, action, browser/network로 나눈다.

### 13.1 Read-only Isolation Sequence

1. `T-code: 없음(SAC UI)` + `Story > Planning Table > Version Management`에서
   Public/Private version, publish 상태, owner를 확인한다.
2. 같은 model에 새 Private Version을 만들고 허용된 테스트 member 한 셀만 변경한다.
3. `T-code: 없음(SAC UI)` + `Modeler > 해당 Planning Model > Data Locking`에서
   잠긴 교차영역과 lock owner를 확인한다.
4. `T-code: 없음(SAC UI)` + `Security > Roles/Teams`에서 model read와 planning write 권한을 구분한다.
5. dimension member가 존재하고 leaf/input-ready 상태인지 확인한다.
6. validation rule 또는 data action이 저장 시 실행되는지 분리하기 위해
   rule/action 없는 model copy에서 같은 셀을 테스트한다.
7. browser network에서 status와 correlation ID만 수집하고 입력값·token은 마스킹한다.
8. 동시 편집자가 있으면 동일 data slice가 아니라 격리된 test slice에서 재현한다.

### 13.2 Planning Hypotheses and Falsification

| Hypothesis | Supporting evidence | Falsification evidence |
|---|---|---|
| Public Version locked | Private save 성공, Public만 실패 | 같은 권한으로 unlocked Public test가 실패 |
| Data Lock blocks cell | 실패 좌표가 locked slice와 정확히 일치 | unlocked test slice에서도 동일 실패 |
| Write permission missing | read 성공, save 시 authorization error | 같은 user가 같은 model의 허용 slice에 저장 성공 |
| Invalid member/rule | 특정 member·rule path에서만 실패 | model copy에서 rule 제거 후에도 모든 member 실패 |
| Network/session issue | 여러 model에서 같은 시각 4xx/5xx | 다른 model save와 connection이 계속 정상 |

가설마다 위 표의 반증 항목 두 개 이상을 실제 환경에 맞게 구체화한다.
"권한 문제 같습니다"처럼 관찰값 없는 진단은 하지 않는다.

### 13.3 Planning Fix and Rollback

- **Version/lock Fix**: owner 승인 후 필요한 기간·scope만 unlock하고 테스트 셀 저장 후 다시 lock한다.
- **Version/lock Rollback**: 기존 lock snapshot과 owner를 기준으로 즉시 재잠금한다.
- **Role Fix**: role owner 승인과 segregation-of-duties 확인 후 최소 planning privilege만 부여한다.
- **Role Rollback**: 변경 전 role export/transport로 복원하고 사용자 session을 재검증한다.
- **Rule Fix**: model copy에서 validation/data action을 수정해 Test Run 후 content transport한다.
- **Rule Rollback**: 이전 model/content version으로 복원하고 미게시 Private Version은 보존한다.
- **Model Fix**: dimension/member mapping 수정 전 model export와 영향 Story 목록을 보관한다.
- **Model Rollback**: 이전 mapping/content package를 재import하고 대표 Story 숫자를 대사한다.

Public Version publish·data action actual run은 운영자 승인 없이 실행하지 않는다.
Test Run 결과에는 test version, test slice, before/after 값을 마스킹해 기록한다.

## 14. Story Performance Playbook

### 14.1 Build a Comparable Baseline

1. `T-code: 없음(SAC UI)` + `Story > Tools > Performance` 또는 tenant가 제공하는
   Performance Analysis 화면에서 initial load, query, script, rendering 시간을 분리한다.
2. 대표 사용자·대표 filter·동일 브라우저로 cold/warm 조건을 구분해 3회 측정한다.
3. 최초 로딩, input control 변경, drill, page navigation, export 중 느린 동작을 하나로 고정한다.
4. Story 복사본에서 widget 절반을 제거해 binary isolation을 반복한다.
5. linked analysis, blended data, calculated measure, large table, custom widget을 하나씩 분리한다.

### 14.2 Live Story Backend Split

1. BW source면 `RSRT` + `SAP Easy Access > Business Warehouse > Business Explorer >
   Query > Query Monitor`에서 같은 변수로 query runtime과 result volume을 확인한다.
2. S/4/HANA source의 backend 병목이 의심되면 승인된 QA 짧은 구간에만
   `ST12` + `SAP Easy Access > Tools > ABAP Workbench > Test > Performance Analysis >
   Single Transaction Analysis`를 사용한다.
3. SQL 병목을 더 좁혀야 할 때만 승인된 QA에서
   `ST05` + `SAP Easy Access > Tools > ABAP Workbench > Test > Performance Analysis > SQL Trace`를 사용한다.
4. trace는 한 사용자·한 동작·짧은 window로 제한하고 즉시 종료한다.
5. source query가 빠르고 SAC rendering만 느리면 CDS/index 변경 가설을 기각한다.

### 14.3 Import Story Split

1. backend trace보다 model size, exception aggregation, calculated measure, hierarchy를 먼저 본다.
2. 화면 밖 widget도 query를 발생시키는지 Story copy에서 확인한다.
3. table row/column과 visible measure를 줄여 response curve를 측정한다.
4. page별 lazy-load 또는 Story 분할은 사용자 navigation 영향과 함께 테스트한다.
5. 성능을 위해 business 의미가 다른 aggregation으로 바꾸지 않는다.

### 14.4 Performance Falsification and Rollback

- widget 절반 제거 후 시간이 그대로면 제거한 widget 집합 가설을 기각한다.
- `RSRT` query가 느리고 SAC overhead가 작으면 Story-only 가설을 기각한다.
- source query는 빠르지만 rendering이 widget 수에 비례하면 backend index 가설을 기각한다.
- calculation 제거가 숫자 의미를 바꾸면 최적화 후보가 아니라 기능 변경으로 취급한다.
- 변경 전 Story 복사본·model version·baseline 3회 측정값을 보관한다.
- 개선이 성능 budget을 못 맞추거나 숫자 대사가 깨지면 기존 Story/content package로 롤백한다.

## 15. Number Reconciliation — SAC vs Source

다음 축을 한 번에 하나씩 고정해 비교한다.

1. Live인지 Import인지, Import라면 마지막 성공 job 시각을 고정한다.
2. source document/posting cutoff와 SAC 기준시각·타임존을 맞춘다.
3. 통화 유형, 환율일, scale, 단위를 맞춘다.
4. fiscal year variant, period, calendar hierarchy를 맞춘다.
5. debit/credit 또는 income/expense sign convention을 맞춘다.
6. hierarchy node, story/page/widget filter, input control을 모두 기록한다.
7. source authorization과 SAC data access control이 같은 population을 허용하는지 비교한다.
8. 한 document를 임의로 찍지 말고 승인된 최소 집계 slice로 drill-down한다.

ECC는 classic FI/BW 추출 구조를 전제로 검토하고 S/4의 universal journal을 암묵적으로 적용하지 않는다.
S/4는 released analytical view·query의 semantic aggregation을 확인하되 backend release year를 먼저 받는다.
회사코드·G/L·코스트 센터 값은 사용자가 제공한 값만 사용한다.

## 16. Deployment-specific Boundaries

### 16.1 ECC 6.0

- ECC EhP, BW 유무, extractor/OData architecture를 먼저 확인한다.
- S/4 Released CDS 명명 규칙이나 Public Cloud communication arrangement를 적용하지 않는다.
- BW Query가 source면 `RSRT` + 위 T-code directory 경로로 query 자체를 먼저 검증한다.

### 16.2 S/4HANA On-Premise

- customer-managed ICF, SAML, PSE, role 영역을 변경 전 read-only로 확인할 수 있다.
- `SICF`, `SAML2`, `STRUST` 변경은 QA, TR, 승인, Test Connection을 필수로 한다.
- release year에 따라 available content가 다르므로 view/service 이름을 추정하지 않는다.

### 16.3 RISE Private Cloud

- 고객, MSP, SAP 책임 경계를 먼저 확인한다.
- customer 권한 밖의 ICM/PSE/service 변경은 evidence bundle로 운영 주체에 요청한다.
- 긴급 변경도 TR·change record·rollback owner를 생략하지 않는다.

### 16.4 S/4HANA Public Cloud

- `T-code: 없음(Cloud UI)` + SAC/Fiori 관리 메뉴에서 released content와 connection을 확인한다.
- 고객에게 backend `SICF`, `SAML2`, `STRUST`, `PFCG` 실행을 지시하지 않는다.
- quarterly release 전 preview/test tenant에서 Story·connection·planning regression을 수행한다.
- key-user/cloud transport mechanism으로 content를 승격하고 직접 운영 수정을 하지 않는다.

## 17. T-code, Menu Path, Table and Monitor Directory

아래 T-code는 `data/tcodes.yaml` 등록을 확인한 항목만 사용한다.
메뉴 label은 release별로 조금 다를 수 있으므로 T-code와 함께 식별한다.

| T-code | Menu path | Evidence / safe use |
|---|---|---|
| `SICF` | SAP Easy Access > Tools > Administration > Administration > Network > HTTP Service Hierarchy | exact InA/OData node status; blanket activation 금지 |
| `SAML2` | SAP Easy Access > Tools > Administration > Administration > Security > SAML 2.0 Configuration | provider, metadata, certificate, user mapping |
| `STRUST` | SAP Easy Access > Tools > Administration > Administration > Trust Manager | PSE certificate validity and chain |
| `SMICM` | SAP Easy Access > Tools > Administration > Monitor > System Monitoring > Internet Communication Manager | request reachability, HTTP/TLS timing |
| `SU53` | System > Utilities > Display Authorization Check | 실패 직후 last failed authorization |
| `PFCG` | SAP Easy Access > Tools > Administration > User Maintenance > Role Administration > Roles | approved role review; change requires TR |
| `SLG1` | SAP Easy Access > Tools > Administration > Monitor > System Monitoring > Application Log > Display | object/subobject/time-window application log |
| `RSRT` | SAP Easy Access > Business Warehouse > Business Explorer > Query > Query Monitor | BW Query variables, runtime, result |
| `ODQMON` | SAP Easy Access > Tools > Administration > Monitor > Operational Delta Queue | delta subscription/request read-only check |
| `ST12` | SAP Easy Access > Tools > ABAP Workbench > Test > Performance Analysis > Single Transaction Analysis | approved short QA trace |
| `ST05` | SAP Easy Access > Tools > ABAP Workbench > Test > Performance Analysis > SQL Trace | approved focused QA SQL trace |

SAC-specific evidence는 ABAP table이 아니라 tenant monitor가 ground truth인 경우가 많다.
Application Log를 쓰는 backend component라면 `SLG1` 결과와 함께
`BALHDR.OBJECT`, `BALHDR.ALDATE`, `BALHDR.ALTIME`을 read-only 식별자로 기록할 수 있다.
`BALHDR`/`BALDAT`를 직접 편집하거나 생산 `SE16N`으로 고치지 않는다.
SAML·ICF 내부 저장 테이블을 직접 수정하는 방식은 지원 경로가 아니다.

## 18. Transport, Test Run, and Rollback Governance

### 18.1 Before Change

- 변경 object owner, business approver, Basis/security owner를 기록한다.
- SAC Story/model/connection은 export 또는 versioned copy를 보관한다.
- backend config는 현 상태 캡처, 관련 TR, 대상 system/client를 기록한다.
- SAML metadata/certificate는 비밀키를 노출하지 않는 승인된 backup 절차를 사용한다.
- 대표 사용자·대표 Story·성능/숫자 baseline을 만든다.

### 18.2 Test Run

- connection: QA `Test Connection` + 최소 read-only Story
- import: 작은 기간/row scope preview + test job
- planning: Private Version의 승인된 test slice 저장, publish 금지
- Story: 복사본에서 before/after 3회 측정과 숫자 대사
- backend: 정확한 service/user/request만 대상으로 짧게 trace

### 18.3 Transport

- SAC content는 개발/테스트 tenant에서 content transport로 승격한다.
- backend service·role·configuration 변경은 승인된 TR을 사용한다.
- 환경별 certificate와 endpoint를 다른 system에 그대로 복사하지 않는다.
- transport 불가 환경 종속 항목도 관련 TR/change record에 수동 단계와 dual control을 연결한다.
- 운영 direct change 후 사후 TR로 맞추는 방식을 정상 절차로 권하지 않는다.

### 18.4 Rollback Gate

- rollback artifact가 없으면 Fix를 확정하지 않는다.
- rollback trigger, 의사결정자, 허용 downtime, 정상 판정 기준을 먼저 쓴다.
- 원복 후 Test Connection, 최소 Story, 숫자 대사, 사용자 SSO를 다시 확인한다.
- rollback이 다른 consumer를 깨뜨릴 수 있으면 영향 시스템을 사전에 식별한다.

## 19. Anti-patterns

- Live 장애인데 Import full reload부터 수행
- Import 지연인데 `SICF`나 SAML trust부터 변경
- 401/403을 firewall 문제로 단정하거나 timeout을 role 문제로 단정
- 정확한 service path 없이 `SICF` subtree 전체 활성화
- metadata backup 없이 `SAML2` provider 삭제·재생성
- certificate chain/hostname 확인 없이 `STRUST`에 인증서 추가
- Public Cloud 사용자에게 backend T-code 실행 지시
- Story가 느리다는 이유로 source trace와 widget 제거를 동시에 시행
- Planning Public Version을 테스트 목적으로 바로 publish
- 숫자 불일치에 cache만 지우고 기준시각·통화·sign·filter를 기록하지 않음
- 운영에서 `SE16N` 직접 편집 또는 table update 권고
- 회사코드·G/L·코스트 센터·조직 값을 임의로 예시화
- 승인·TR·Test Run·Rollback 없는 운영 config 변경
- 미등록 T-code나 확인하지 않은 SAP Note 번호를 추정해 제시

## 20. Operator Checklists

### Live Connection handoff

- [ ] SAC Test Connection 결과와 시각
- [ ] 전체/특정 user 및 비교 user 결과
- [ ] request host/path/status/timing, secret 마스킹
- [ ] network topology와 TLS termination 지점
- [ ] exact `SICF` node read-only 상태(On-Prem/RISE only)
- [ ] `SAML2` entity/ACS/issuer/audience/certificate 요약
- [ ] 실패 직후 `SU53` 결과 또는 권한 실패 없음
- [ ] 가설별 falsification evidence 2개 이상
- [ ] Fix용 QA test, TR, Rollback artifact

### Planning save handoff

- [ ] model/version type과 owner
- [ ] 실패 cell의 마스킹된 dimension intersection
- [ ] data lock·write role·member input readiness
- [ ] Private Version test 결과
- [ ] validation/data action 격리 결과
- [ ] 변경 전 model export와 rollback criteria

### Story performance handoff

- [ ] 느린 동작 하나와 baseline 3회
- [ ] Live/Import 및 source release/deployment
- [ ] Story copy binary isolation 결과
- [ ] source query와 SAC rendering 시간 분리
- [ ] 대표 filter·사용자·브라우저 조건
- [ ] 숫자 대사와 rollback Story package

## 21. Delegation and References

- Cloud Connector, ICM, TLS, SAML, role → `sap-basis-consultant`; 한국 망분리 → `sap-bc`
- CDS/query semantics and backend trace → `sap-abap-developer`
- BTP destination/subaccount → `sap-btp`
- Datasphere federation/replication → `sap-integration-cloud`
- FI/CO planning logic → `sap-fi-consultant` / `sap-co-consultant`
- Multi-turn diagnosis state → `plugins/sap-session/skills/sap-session/SKILL.md`
- 현장체 → `plugins/sap-session/skills/sap-session/references/korean-field-language.md`
- verified T-codes → `data/tcodes.yaml`
- verified Notes → `data/sap-notes.yaml`

위임 시 evidence는 최소화하고 secret·개인정보·실제 재무 상세값을 제거한다.
불확실한 service 이름·T-code·Note는 추가하지 말고 "확인 필요"로 남긴다.
