---
name: sap-ariba
description: >
  This skill handles all SAP Ariba tasks including Sourcing (RFx, e-Auction),
  Contracts, Procurement (catalog, requisition, PR-to-PO), Supplier Lifecycle &
  Performance (SLP), Spend Analysis, Network (supplier collaboration), Buying &
  Invoicing, Guided Buying, integration with S/4HANA (CIG / Ariba Network
  Adapter), supplier onboarding, sourcing event creation, contract authoring,
  catalog management, Ariba Network IDs (ANID). Use whenever the user mentions
  Ariba, sourcing, RFx, e-auction, supplier lifecycle, Ariba Network, spend
  analysis, contract authoring, guided buying, ANID, or any Ariba module.
allowed-tools: Read, Grep, Glob
---

# sap-ariba — Ariba Sourcing, Procurement, and Network

## 1. Environment Intake Checklist

1. **Ariba edition** — Strategic Sourcing / Procurement / SLP / Ariba Network?
2. **S/4 integration** — Direct (CIG via Cloud Integration) or via ERP-Ariba mapping?
3. **Supplier ecosystem** — Ariba Network connected suppliers count?
4. **Industry/region** — Manufacturing, public sector, retail; KR/JP/US?
5. **Specific scenario** — Sourcing event, contract renewal, PR-to-PO, supplier issue?

## 2. Module Coverage

| Module | Purpose | Key Actions |
|---|---|---|
| **Sourcing** | RFI/RFP/RFQ + e-Auction | event creation, supplier invite, scoring |
| **Contracts** | Authoring & lifecycle | template, redlining, renewal |
| **Procurement / Buying** | Catalog, PR, PO, invoice | guided buying, PR approval |
| **SLP** | Supplier qualification | onboarding, risk assessment |
| **Spend Analysis** | Spend visibility | classification, savings tracking |
| **Network** | Supplier collaboration | document exchange, status |

## 3. Standard Procurement Flow

```
1. Demand Identification (in S/4 or directly in Ariba)
   ↓
2. Sourcing (if strategic) — RFx/e-Auction
   ↓
3. Contract creation (Ariba Contracts)
   ↓
4. Catalog enablement (Ariba Network)
   ↓
5. Purchase Requisition (Ariba Buying or S/4 ME51N)
   ↓
6. Approval workflow (configured)
   ↓
7. Purchase Order creation (S/4 ME21N or Ariba)
   ↓
8. PO transmission to supplier (Ariba Network)
   ↓
9. Goods Receipt (S/4 MIGO)
   ↓
10. Invoice processing (Ariba Invoicing or S/4 MIRO)
   ↓
11. Payment (S/4 F110)
```

## 4. Integration with S/4HANA

| Direction | Object | Mechanism |
|---|---|---|
| S/4 → Ariba | Materials, vendors (master) | CIG (Cloud Integration Gateway) |
| S/4 → Ariba | Cost centers, GL accounts | CIG |
| Ariba → S/4 | Approved PRs | CIG |
| Ariba → S/4 | POs (if created in Ariba) | CIG |
| Supplier → Ariba | Invoice (Network) | Ariba Network |
| Ariba → S/4 | Invoices (via Invoicing) | CIG |

Common integration issues:
- **Master data mapping** — material/vendor ID mismatch
- **CIG channel down** — check CIG Worker (Cloud Connector)
- **Invoice posting fail** — tax code mapping, vendor account group

## 5. Critical Operational Issues

### Sourcing
- "Event invitation not received" — supplier ANID validation, Network registration
- "Bid won't submit" — internet, supplier role, event status
- "e-Auction conflict" — event configuration, time zones

### Contracts
- "Workflow not advancing" — check approver assignment, role
- "Redline merge fail" — template incompatible

### Procurement
- "PR approval stuck" — check delegation, approver role
- "PO transmission fail" — supplier Network status, transmission method
- "Invoice mismatch" — 3-way match (PO-GR-Invoice) discrepancy

### Supplier Lifecycle
- "Supplier qualification not complete" — assessment questionnaire pending
- "Risk score not updating" — external risk feed connection

## 6. Korean Context

- **Ariba Network 한국 supplier base** — 글로벌 대비 적음. 한국 자회사 → 글로벌 시너지 위해 Ariba 도입
- **한국 조달법 (국가계약법)**: 공공기관은 KISTI g2b 우선; 민간 → Ariba
- **부가세 처리**: 한국 부가세 코드 Ariba mapping 필요
- **언어**: Ariba UI 한국어 일부 지원 (Sourcing/Buying)
- **결제**: 한국 은행 코드 → DMEE Korea 매핑

## 7. Cross-module Routing

- Procurement workflow → also `sap-mm-consultant`
- Invoice/tax → also `sap-fi-consultant`
- Network connectivity → `sap-integration-cloud`
- Cloud env → `sap-btp`

## 8. SAP Notes & References

- SAP Support에서 사용 중인 integration add-on·릴리스·오류 문구로 검색 필요
- Ariba Network: https://network.ariba.com
- Ariba Help: https://help.sap.com/docs/ARIBA

## 9. Out of Scope

- Detailed inventory management (use MM)
- Production sourcing tied to PP (use PP + Ariba sourcing combination)
- Non-Ariba procurement systems (SRM, Coupa, Jaggaer)

## 10. Diagnostic Operating Model

Ariba 장애는 한 화면의 status로 확정하지 않는다. 동일 업무 문서가 여러 surface를 지나므로
**업무 문서 → 전송 envelope → 수신 문서 → ERP posting** 순서로 증거를 연결한다.

### 10.1 Mandatory environment intake

답변 전에 다음을 수집한다. 정보가 없더라도 답변을 멈추지만 말고 read-only 확인 절차를 함께 준다.

- **Ariba scope**: Buying, Invoicing, Guided Buying, Sourcing, Contracts, SLP, Business Network
- **Realm**: test/prod 구분, Realm 이름은 마스킹 가능, 최근 configuration migration 여부
- **ERP**: ECC 6.0 EhP 또는 S/4HANA 릴리스 연도, client, On-Premise/RISE/Public Cloud
- **Integration**: Managed Gateway for Spend Management and SAP Business Network(구 CIG),
  직접 cXML, SAP Integration Suite, IDoc/SOAP/API 중 실제 사용 경로
- **Document**: 문서 유형, 비식별 문서 키, item, 발생 시각과 timezone, 방향
- **Scope**: 한 공급사/한 문서인지, 같은 유형 전체인지, 특정 구매조직·Realm인지
- **Change**: 마지막 성공 시각, 인증서·mapping·endpoint·approval·catalog 최근 변경
- **Security**: payload 원문이 아니라 correlation key와 마스킹한 error excerpt 제공 가능 여부

회사코드, 구매조직, 플랜트, supplier ID, G/L 계정, tax code는 사용자가 제공한 값을 쓴다.
제공되지 않은 조직 값은 `<회사코드>`, `<구매조직>`, `<플랜트>`처럼 표시한다.

### 10.2 Evidence Loop selection

- 단일 용어·기능 질문은 Quick Advisory를 쓴다.
- 전송 실패, 매칭 실패, 승인 적체, 공급사 onboarding 장애는 Evidence Loop를 쓴다.
- 가설이 둘 이상이면 HYPOTHESIS 턴에서 각 가설의 반증 증거를 두 개 이상 명시한다.
- COLLECT 턴에는 운영자가 실행할 read-only 체크만 요청한다.
- VERIFY 턴에서만 confirmed/rejected/inconclusive를 판정하고 Fix와 Rollback을 페어로 낸다.

### 10.3 Correlation key set

최소 evidence bundle은 다음 키를 포함한다.

```text
Ariba Realm category: test | production
Document type and direction: 예) InvoiceRequest inbound to ERP
Business document key: 마스킹 가능
Item key: line number 또는 supplier invoice item
Network/Managed Gateway message ID or payloadID: 비밀값 제외
Timestamp: ISO 형식 + timezone
ERP system/client category: 실제 값은 내부 보관 가능
Last successful comparable message: timestamp + same/different supplier
Error layer: sender | Network | Managed Gateway | ERP transport | ERP business
```

원문 cXML은 보안 저장소 내부에 보존하고, 외부 evidence에는 해시, element path, 길이,
마스킹한 값 유형, error code만 남긴다.

## 11. ECC, S/4HANA, and Cloud Integration Split

| 관점 | ECC 6.0 | S/4HANA On-Premise/Private | S/4HANA Cloud Public Edition |
|---|---|---|---|
| Supplier maintenance | classic vendor master 중심 | BP/CVI가 선행, supplier role 확인 | released app/API와 SSCUI 범위 확인 |
| FI posting evidence | `BKPF/BSEG` 중심 | `ACDOCA`를 추가 확인, 원문 IV는 `RBKP/RSEG` | released app/API·business log 우선 |
| Ariba integration | 설치된 ERP add-on 지원 범위 확인 | 릴리스 호환 add-on/API 범위 확인 | classic add-on·GUI를 가정하지 않음 |
| Configuration | ERP IMG + Ariba Realm | ERP IMG + Ariba Realm + clean-core 영향 | CBC/SSCUI 및 communication arrangement |
| Diagnostics | GUI T-code와 add-on log | GUI/Fiori·add-on log | 앱 모니터와 Cloud ALM/공개 API 범위 |

Managed Gateway는 중계·매핑·프로젝트 상태를 보는 cloud surface다. SAP Integration Suite는
iFlow가 배치된 경우에만 별도 hop이다. 둘을 같은 제품 또는 같은 로그로 취급하지 않는다.
기존 문서에 CIG라고 적혀 있으면 현재 tenant UI의 제품명을 확인한 뒤 병기한다.

### 11.1 Release-specific intake rules

1. ECC이면 EhP와 Ariba integration add-on 버전을 확인한다.
2. S/4HANA이면 release year, BP/CVI 상태, 적용된 integration content를 확인한다.
3. RISE이면 고객·SAP·운영 파트너의 책임 경계와 접근 가능한 monitor를 확인한다.
4. Public Cloud이면 classic T-code나 custom add-on 경로를 답으로 강제하지 않는다.
5. 모든 경우에 계약된 Ariba 기능과 Realm feature enablement를 확인한다.

## 12. Ariba ↔ ERP 3-Way Match Diagnostic

3-way match는 **PO item ↔ GR history ↔ Invoice item** 비교다. header 합계만 맞는 것으로
정상 판정하지 않는다. service PO는 GR 대신 service acceptance가 관련될 수 있으므로
PO item category와 invoice rule을 먼저 확인한다.

### 12.1 Evidence order

1. **Ariba Invoicing** — `Invoicing → Invoice Search → Invoice → Exceptions`에서
   exception category, item, expected/actual 값을 확인한다.
2. **PO** — `ME23N → Logistics → Materials Management → Purchasing → Purchase Order →
   Display`에서 item의 quantity, order UoM, price basis, GR-based IV, invoice receipt flag,
   delivery cost와 PO history를 확인한다.
3. **GR** — `MIGO → Logistics → Materials Management → Inventory Management → Goods
   Movement`의 Display에서 material document, movement가 취소/반품됐는지, quantity,
   entry UoM, posting date를 확인한다.
4. **Invoice** — `MIR4 → Logistics → Materials Management → Logistics Invoice Verification →
   Further Processing → Display Invoice Document`에서 invoice item, quantity, amount,
   tax amount, currency, block reason을 확인한다.
5. **Integration response** — Business Network와 Managed Gateway의 동일 문서 응답을 확인한다.
6. **Accounting document** — 실제 FI 문서가 생성된 경우 `FB03 → Accounting → Financial
   Accounting → General Ledger → Document → Display`로 display한다.

### 12.2 Table and field anchors

| Evidence | ECC and S/4 application tables | Useful fields |
|---|---|---|
| PO header/item | `EKKO`, `EKPO` | `EBELN`, `EBELP`, `MENGE`, `MEINS`, `NETPR` |
| PO history | `EKBE` | `EBELN`, `EBELP`, history category, quantity, amount |
| Invoice header/item | `RBKP`, `RSEG` | invoice key/year, PO/item reference, quantity, amount |
| FI document ECC | `BKPF`, `BSEG` | document key, posting status, line reference |
| Universal Journal S/4 | `ACDOCA` | accounting document/item and reference fields |

테이블은 read-only display evidence다. 운영에서 `SE16N`으로 값을 수정하지 않는다.
S/4에서도 logistics invoice의 원문은 `RBKP/RSEG`와 PO history를 먼저 보고, 회계 반영을
확인할 때 `ACDOCA`를 추가한다.

### 12.3 Hypotheses and falsification

#### H1 — GR receipt가 Ariba 또는 ERP 한쪽에 누락

- Supporting evidence: PO item 대비 유효 GR 누계가 부족하고 invoice exception도 quantity 계열이다.
- Falsification A: `EKBE`에 취소되지 않은 충분한 GR가 있다.
- Falsification B: Ariba receipt 문서에도 동일 item·quantity·UoM이 성공 상태다.

#### H2 — UoM 또는 quantity conversion 불일치

- Supporting evidence: base/order/invoice UoM가 다르고 conversion 후 차이가 tolerance를 넘는다.
- Falsification A: 양쪽 canonical quantity와 conversion factor가 동일하다.
- Falsification B: 같은 UoM의 대조 invoice도 동일 error로 실패한다.

#### H3 — 가격·세금·통화 mapping 불일치

- Supporting evidence: 세전액은 맞지만 tax 또는 currency/rounding 차이로 exception이 난다.
- Falsification A: PO condition, invoice net/tax/gross가 item 단위로 모두 일치한다.
- Falsification B: ERP가 mapping 전에 이미 tolerance block reason을 반환한다.

#### H4 — 정상 business rejection인데 integration failure로 오인

- Supporting evidence: transport는 성공했고 ERP가 명시적 application response를 반환했다.
- Falsification A: ERP에 message 도착 evidence가 전혀 없고 transport error가 존재한다.
- Falsification B: 동일 payload replay가 business validation까지 도달하지 못한다.

### 12.4 Fix and rollback

- Fix 전에 QA에 동일 PO item 조건의 복제 테스트 문서를 만든다.
- 매핑 문제면 변경 전 mapping을 export하고 한 필드만 수정해 종단 간 테스트한다.
- master/PO 변경이 필요하면 MM/FI 소유자 승인을 받고 표준 변경 transaction을 사용한다.
- ERP Customizing은 TR로 DEV→QA→PRD를 거친다.
- Rollback은 이전 mapping import, feature/config version 복원, retry 중단, 영향 invoice 격리다.
- 이미 posting된 FI 문서는 삭제하지 않고 MM/FI 표준 reversal 절차를 별도 승인받는다.

## 13. cXML Transmission Failure Diagnostic

cXML 장애는 transport, authentication, schema, routing, business validation을 분리한다.

### 13.1 Evidence sequence

1. **Sender** — 생성 성공 여부, payloadID, document type, destination alias, send timestamp
2. **Business Network** — `Buyer Account → Administration → Network Transactions → Search`
   에서 수신·routing·supplier delivery status를 확인한다.
3. **Managed Gateway** — `Managed Gateway → Monitoring → Messages`에서 같은 message의
   project, source/target, processing step, error category를 확인한다.
4. **Optional Integration Suite hop** — 실제 iFlow가 있을 때만 message processing log를 본다.
5. **ERP transport** — SOAP이면 `SRT_MONI → Tools → Administration → Web Services →
   Message Monitor`, IDoc이면 `WE02 → Tools → IDoc Interface/ALE → Administration →
   Monitoring → IDoc Display`를 사용한다.
6. **ERP application** — `SLG1 → Tools → ABAP Workbench → Development → Application Log`에서
   설치된 add-on이 기록한 실제 object/subobject와 timestamp를 확인한다.

### 13.2 Error classification

| Layer | Typical evidence | First question |
|---|---|---|
| Connectivity | timeout, DNS/TLS handshake, no receiver trace | endpoint와 인증서 체인이 유효한가? |
| Authentication | credential/certificate rejection | test와 prod credential이 섞였는가? |
| Routing | wrong Realm, ANID, project, document route | source/target pair가 계약된 경로인가? |
| Schema | element/type/cardinality validation | 실패 element path와 schema version은 무엇인가? |
| Mapping | required ERP field absent or transformed | source에는 값이 있고 target에 사라졌는가? |
| Business | supplier/PO/tax/UoM validation message | transport 성공 뒤 어떤 rule이 reject했는가? |

HTTP success는 business posting 성공의 충분조건이 아니다. 반대로 HTTP error 하나만으로
payload mapping 문제라고 단정하지 않는다.

### 13.3 Falsification examples

- **인증서 만료 가설**은 같은 credential/endpoint의 다른 문서가 같은 시각 성공하면 약해진다.
- **Network 전체 장애 가설**은 다른 supplier·동일 route 문서가 성공하면 기각된다.
- **schema version 가설**은 동일 schema/mapping의 최소 재현 payload가 성공하면 기각된다.
- **ERP business rule 가설**은 ERP 도착 trace가 없으면 아직 확정할 수 없다.
- **supplier routing 가설**은 동일 ANID의 다른 document type이 성공해도 문서별 route가
  다를 수 있으므로 완전 기각 전에 route configuration을 비교한다.

### 13.4 Safe retry and rollback

- 원인과 멱등성(idempotency)을 확인하기 전 대량 retry를 금지한다.
- 동일 invoice/PO의 중복 생성 여부를 먼저 검색한다.
- QA에서 한 건을 replay하고 sender/Network/Gateway/ERP 네 surface를 대사한다.
- 운영 재처리는 승인된 문서 목록, 소유자, 시간창, 중단 임계치를 갖춘다.
- `BD87 → Tools → IDoc Interface/ALE → Administration → Monitoring → Status Monitor`
  는 실제 IDoc 경로이고 status 원인이 제거된 경우에만 사용한다.
- retry가 실패하면 즉시 중단하고 이전 route/mapping/credential version으로 rollback한다.

## 14. Guided Buying Diagnostic

Guided Buying 증상은 content visibility, policy, user entitlement, approval, downstream
integration 단계로 나눈다.

### 14.1 Tile, form, or catalog not visible

Evidence order:

1. `Guided Buying → User menu → Profile`에서 user group, locale, ship-to/accounting context
2. `Administration → Guided Buying → Landing Pages`에서 tile·form audience와 publish 상태
3. `Administration → Catalog Manager → Catalogs`에서 catalog approval·effective date·scope
4. Punchout이면 supplier endpoint와 대조 사용자 결과
5. 동일 group/조직 범위의 성공 사용자와 차이 비교

Hypothesis: user entitlement 문제.

- Falsification A: 같은 group과 동일 context의 사용자도 모두 실패한다.
- Falsification B: 대상 사용자에게 direct URL로 동일 content가 정상 노출된다.

Fix는 test Realm에서 최소 group assignment 또는 audience rule을 검증한다. Rollback은
기존 group/audience export 복원과 cache 영향 시간을 고려한 publish 취소다.

### 14.2 Request cannot be submitted

1. form required field와 validation message를 마스킹해 확보한다.
2. accounting split, commodity, supplier, delivery context의 누락 여부를 확인한다.
3. `Administration → Approval Processes`에서 요청 유형과 일치하는 rule/version을 확인한다.
4. ERP로 넘어가기 전 Ariba validation인지, 전송 후 ERP rejection인지 timestamp로 나눈다.
5. 성공한 최소 request와 필드 단위로 비교한다.

Policy hypothesis는 validation 전후의 모든 필수 필드가 채워졌다면 기각한다. ERP master
mapping hypothesis는 Ariba 내부 validation 단계에서 이미 막혔다면 기각한다.

### 14.3 Approval stuck

- current approver, pending node, delegation 유효기간, group membership을 확인한다.
- 조직 변경 직후면 user master sync와 rule evaluation timestamp를 비교한다.
- approval history를 보존하고 approver를 임의 교체하지 않는다.
- test Realm에서 동일 조건 request로 rule 변경을 회귀 테스트한다.
- Rollback은 이전 approval rule version과 delegation 상태 복원이다.

## 15. SLP Supplier Lifecycle Diagnostic

SLP 상태를 하나의 onboarding 완료/미완료 값으로 축약하지 않는다.

```text
Supplier Request
  → Registration
  → Qualification
  → Segmentation / Preferred status
  → Ongoing review / certificate renewal
  → ERP and Business Network synchronization
```

### 15.1 Evidence by lifecycle stage

| Stage | Ariba menu path | Evidence |
|---|---|---|
| Request | `Supplier Management → Supplier Requests` | requester, duplicate result, owner, status |
| Registration | `Supplier Management → Registrations` | questionnaire version, invitation, response |
| Qualification | `Supplier Management → Qualifications` | category/region scope, approver, expiry |
| Preferred | `Supplier Management → Preferred Suppliers` | status scope, effective dates, approval |
| Ongoing review | `Supplier Management → Supplier Workspaces` | certificate/risk task, renewal owner |
| Replication | `Managed Gateway → Monitoring → Messages` | supplier document status and ERP response |

메뉴 명칭은 tenant 기능과 권한에 따라 다를 수 있으므로 실제 breadcrumb를 evidence에 남긴다.

### 15.2 Common hypotheses

#### Questionnaire pending

- Supporting: 필수 section 미완료 또는 supplier contact가 invitation을 열지 않았다.
- Falsification: 모든 필수 응답이 complete이고 approval task가 이미 생성됐다.
- Fix: contact/owner를 확인하고 승인된 reminder 또는 task reassignment를 test에서 검증한다.
- Rollback: 원래 owner와 due date를 복원하고 audit history를 보존한다.

#### Qualification scope mismatch

- Supporting: supplier는 등록됐지만 해당 category/region qualification이 없다.
- Falsification: 요청된 scope와 유효기간 내 approved qualification이 정확히 존재한다.
- Fix: scope rule을 QA에서 재현하고 승인 후 구성 migration한다.
- Rollback: 이전 scope/rule version으로 복원한다.

#### Duplicate supplier

- Supporting: ERP supplier ID, ANID, 법인 식별자가 서로 다른 workspace에 나뉜다.
- Falsification: 각 record가 별도 법인·별도 거래관계로 의도된 구조다.
- Fix: data steward가 golden record를 결정한 뒤 표준 merge/relationship 절차를 사용한다.
- Rollback: merge 전 export, relationship, questionnaire, approval audit를 보존한다.

#### ERP replication failure

- Supporting: SLP lifecycle은 approved인데 Managed Gateway/ERP response가 실패다.
- Falsification: ERP에 동일 supplier가 성공 반영되고 ACK도 Ariba에 도착했다.
- Fix: 실패 field mapping을 한 개씩 QA에서 검증한다.
- Rollback: 이전 supplier mapping 복원과 영향 record retry 중단이다.

## 16. PO Delivery and Supplier Network Diagnostic

### 16.1 Supplier did not receive PO

1. ERP/Ariba source에서 PO가 release·send 대상인지 확인한다.
2. Managed Gateway에서 outbound processing이 성공했는지 확인한다.
3. Business Network에서 document route와 delivery status를 확인한다.
4. supplier ANID와 Trading Relationship이 대상 account와 일치하는지 확인한다.
5. supplier account의 electronic order routing method와 contact를 확인한다.
6. email fallback이면 mail delivery evidence를 Network delivery와 구분한다.

Network가 Delivered여도 supplier 내부 처리 완료를 뜻하지 않는다. 동일 supplier의 다른 PO가
같은 route로 성공하면 계정 전체 장애 가설은 약해지고, 문서별 rule/mapping을 본다.

Rollback은 route 변경 전 설정 복원, 중복 PO 방지를 위한 resend 중단, 공급사와 문서 상태
합의다. 새 PO를 만들어 원래 evidence chain을 우회하지 않는다.

### 16.2 Order confirmation or ship notice not reflected

- supplier가 보낸 문서번호와 참조 PO/item을 확인한다.
- Business Network 수신과 Managed Gateway 전달을 분리한다.
- ERP application rejection이면 해당 business field만 대사한다.
- PO가 변경된 시각과 supplier response 생성 시각을 timezone 포함해 비교한다.
- obsolete PO version 가설은 supplier response가 최신 version을 참조하면 기각한다.

## 17. Sourcing and Contracts Diagnostic

### 17.1 RFx invitation not received

Evidence order:

1. `Sourcing → Events → Event → Suppliers`에서 invitation status와 contact를 확인한다.
2. event open/close time과 supplier timezone을 확인한다.
3. supplier account/ANID와 contact login의 연결을 확인한다.
4. Business Network 또는 이메일 delivery evidence를 확인한다.
5. 다른 invited supplier의 결과를 대조한다.

Supplier 전체 장애 가설은 동일 contact가 다른 active event invitation을 받으면 약해진다.
event 구성 변경은 clone한 test event에서 검증하고, rollback은 이전 template/version 복원이다.

### 17.2 Bid cannot be submitted

- event가 preview/open/closed 중 어느 상태인지 확인한다.
- lot/line access, required question, attachment type/size, currency rule을 확인한다.
- supplier team role과 bidding terms acceptance를 확인한다.
- 마감 직전 이슈는 시스템 시각, supplier locale 시각, event timezone을 같이 기록한다.
- 운영 event의 close time 연장은 조달 owner의 공정성·감사 승인 후 수행한다.

### 17.3 Contract workflow or redline issue

- workspace template/version, task dependency, current owner, approval history를 확인한다.
- document version과 clause library version을 분리한다.
- redline merge 전에 원본·수정본·현재 workspace version을 보존한다.
- test workspace에서 동일 template로 재현한다.
- rollback은 직전 approved document와 workflow template version 복원이다.

## 18. ERP T-code and Menu Path Matrix

Ariba cloud action에는 cloud breadcrumb를, ERP action에는 T-code와 SAP Easy Access 메뉴를
함께 제공한다. 아래 T-code는 `data/tcodes.yaml`에 등록된 것만 사용한다.

| 목적 | T-code + menu path | Read/write boundary |
|---|---|---|
| PO display | `ME23N → Logistics → Materials Management → Purchasing → Purchase Order → Display` | read-only |
| Goods movement display | `MIGO → Logistics → Materials Management → Inventory Management → Goods Movement` | Display 선택 시 read-only |
| Invoice display | `MIR4 → Logistics → Materials Management → Logistics Invoice Verification → Further Processing → Display Invoice Document` | read-only |
| FI document display | `FB03 → Accounting → Financial Accounting → General Ledger → Document → Display` | read-only |
| Application log | `SLG1 → Tools → ABAP Workbench → Development → Application Log` | read-only |
| IDoc display | `WE02 → Tools → IDoc Interface/ALE → Administration → Monitoring → IDoc Display` | read-only |
| IDoc status processing | `BD87 → Tools → IDoc Interface/ALE → Administration → Monitoring → Status Monitor` | 재처리는 승인 필요 |
| SOAP message monitor | `SRT_MONI → Tools → Administration → Web Services → Message Monitor` | read-only |
| PI/PO XML monitor | `SXMB_MONI → Tools → Process Integration → Integration Engine → Monitoring → Monitor for Processed XML Messages` | PI/PO hop일 때만 |

`MIRO`나 `MIGO`의 posting 모드는 진단 display와 다르다. 운영자가 수정 실행을 승인하지
않았다면 display만 안내한다. Public Cloud에서는 이 GUI 경로가 제공되지 않을 수 있으므로
해당 Fiori app과 released monitor를 고객 환경에서 확인한다.

## 19. Monitoring and Reconciliation

### 19.1 Daily controls

- Managed Gateway failed/processing messages를 document type과 direction별로 집계한다.
- Business Network에서 PO delivery와 invoice exception backlog를 확인한다.
- ERP `SLG1`의 add-on application error를 동일 timestamp로 대사한다.
- stuck message를 단순 건수로 보지 않고 oldest age와 business deadline을 같이 본다.
- 같은 문서의 중복 전송·중복 invoice 여부를 별도 집계한다.

### 19.2 Weekly controls

- Guided Buying request approval age와 delegation 만료를 확인한다.
- SLP registration/qualification aging과 인증서 만료를 확인한다.
- cXML route별 success rate와 retry 횟수를 확인한다.
- PO/GR/Invoice unmatched item을 supplier·currency·UoM별로 분류한다.
- 한국 supplier의 Network onboarding과 임시 email routing 종료일을 확인한다.

### 19.3 Reconciliation keys

- PO number + item
- supplier invoice number + fiscal year/context
- receipt/material document + item
- Ariba unique document ID/payloadID
- supplier ANID + ERP supplier key
- source/target system + Realm + timestamp/timezone

숫자 합계만 대사하지 말고 reversal, cancellation, credit memo, partial receipt와 UoM conversion을
고려한다. 임계값은 고객의 승인된 정책을 사용하고 임의로 박지 않는다.

## 20. Configuration Change, TR, and Test Run

### 20.1 ERP-side configuration

- `SAP Reference IMG → Integration with SAP Ariba` 또는 설치 add-on의 실제 IMG 노드를 확인한다.
- 변경 전 current setting, software component, client, owner를 캡처한다.
- 모든 Customizing 변경은 TR에 기록한다.
- DEV 단위 테스트 → QA 종단 간 테스트 → UAT → 승인된 PRD import 순서를 지킨다.
- import 후 테스트 문서 한 건과 기존 정상 문서 유형 회귀 테스트를 수행한다.

### 20.2 Ariba and Managed Gateway configuration

- Realm 설정, template, approval, mapping, route를 변경 티켓에 연결한다.
- export 가능한 구성은 변경 전 export하고 version/owner/time을 기록한다.
- test Realm과 production Realm의 endpoint·credential·project를 섞지 않는다.
- QA에서 positive, negative, duplicate/retry 시나리오를 수행한다.
- mapping 변경은 필드 하나의 영향 범위와 downstream 소비자를 문서화한다.

### 20.3 Minimum test pack

```text
Positive: 정상 PO 또는 Invoice 한 건이 end-to-end 성공
Negative: 필수 field 누락이 예상 layer에서 reject
Boundary: partial GR, UoM conversion, tax/rounding, credit/reversal 중 해당 시나리오
Retry: 동일 document의 중복 방지 확인
Regression: 기존 정상 supplier/document type 한 건
Audit: correlation key와 승인·배포 evidence 보존
```

실제 운영 재처리는 test run 자체가 지원되지 않으면 QA 복제 문서로 먼저 시뮬레이션한다.

## 21. Security and Privacy Rules

- cXML의 `Credential`, shared secret, token, certificate/private key는 evidence에서 제거한다.
- supplier 담당자 이름·이메일·전화, 계좌, tax ID, 사업자등록번호를 마스킹한다.
- payload 전체를 메신저·외부 LLM·티켓 본문에 붙이지 않는다.
- 내부 보안 저장소에는 원문, checksum, 접근자, 보존기간을 남긴다.
- 외부 공유본에는 message ID 일부, element path, value type, error excerpt만 둔다.
- technical user는 최소권한과 비대화형 계정 정책을 적용하고 만료·rotation을 관리한다.
- test Realm에 production credential이나 실제 supplier 개인정보를 복제하지 않는다.
- 운영자 승인 없이 supplier status, approval role, routing을 대신 변경하지 않는다.

## 22. Falsification and Rollback Library

| Hypothesis | Must-be-true evidence | Falsification | Safe rollback |
|---|---|---|---|
| Realm routing mismatch | source/target Realm이 다른 project를 사용 | 동일 project의 comparable message가 정상 route | 이전 connection/project version 복원 |
| Supplier ANID mismatch | 실패 문서의 target ANID가 거래관계와 다름 | target ANID와 established relationship이 일치 | route 원복, resend 중단 |
| Tax mapping defect | source tax category가 target에서 누락/변형 | source/target tax와 ERP validation이 일치 | 이전 mapping 복원, invoice 격리 |
| Approval rule defect | request가 잘못된 rule/node를 평가 | 동일 조건 test가 기대 node로 평가 | 이전 rule version publish |
| SLP questionnaire defect | 필수 response 또는 task가 누락 | 모든 필수 항목과 task가 complete | 이전 questionnaire/version 복원 |
| Certificate/auth failure | handshake/auth rejection이 반복 | 동일 credential의 comparable request 성공 | 이전 credential/endpoint 활성, 신규 비활성 |

반증 결과가 모순되면 hypothesis를 `inconclusive`로 남기고 추가 evidence를 요청한다.
근거 없이 가장 익숙한 원인을 confirmed로 올리지 않는다.

## 23. Anti-Patterns

- ❌ `Failed` status만 보고 mapping 문제라고 단정
- ❌ Managed Gateway와 SAP Integration Suite를 같은 monitor로 취급
- ❌ ECC에 S/4 BP/ACDOCA 절차만 제시하거나 S/4에 ECC 전용 관행만 제시
- ❌ Public Cloud에 classic add-on·GUI T-code가 있다고 가정
- ❌ PO header 합계만 보고 3-way match 정상 판정
- ❌ reversal·partial GR·service acceptance·UoM conversion 무시
- ❌ cXML 원문과 credential을 evidence bundle에 첨부
- ❌ 원인 제거 전 `BD87` 또는 cloud retry를 반복 실행
- ❌ 운영 Realm에서 바로 mapping·approval·questionnaire 수정
- ❌ ERP Customizing을 TR 없이 반영
- ❌ QA test와 rollback 없는 Fix 제시
- ❌ 운영 `SE16N` 데이터 편집 권고
- ❌ 회사코드·구매조직·세금코드·계정 임의 하드코딩
- ❌ 정상 문서를 새로 만들어 원래 문서의 audit trail을 끊음
- ❌ 검증되지 않은 SAP Note 번호나 T-code를 추정

## 24. Standard Diagnostic Response

```markdown
## Issue
- ERP/Ariba 환경, 문서 유형, 방향, 발생 시각, 영향 범위

## Primary Root Cause
- 현재 evidence가 가장 강하게 지지하는 원인 하나
- alternatives는 낮은 우선순위로 분리

## Falsification
- 이 원인이 틀렸음을 보여 줄 관찰 결과 두 개 이상

## Check (T-code + Table/Field)
1. Ariba/Network/Managed Gateway breadcrumb와 확인할 status
2. ERP T-code + SAP Easy Access menu path
3. ECC table/field와 S/4 차이

## Fix
1. QA 복제 문서 또는 test Realm에서 재현
2. 승인된 최소 변경
3. positive/negative/retry/regression 검증
4. ERP 설정이면 TR로 배포

## Rollback
1. 이전 config/mapping/rule version 복원
2. retry 중단과 영향 문서 격리
3. 원복 후 동일 evidence set으로 재확인

## Prevention
- 일간 monitor, 주간 대사, 만료 알림, SoD, 변경 통제
```

SAP Note는 `data/sap-notes.yaml`에 번호와 제목이 검증된 경우에만 인용한다. 등록되지 않은
번호는 추정하지 않고 "SAP Support 검색 필요"라고 표시한다.
