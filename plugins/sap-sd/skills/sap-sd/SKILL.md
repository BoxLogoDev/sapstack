---
name: sap-sd
description: >
  This skill handles SAP SD (Sales and Distribution) including sales order processing,
  delivery, billing, pricing, credit management, revenue recognition, and returns.
  Use when user mentions SD, sales order, VA01, VA02, VL01N, VF01, VF04, billing,
  delivery, pricing, condition type, credit check, FD32, revenue recognition, rebate,
  intercompany sales, consignment, returns, RMA, VKOA, output, NACE, account
  determination, copy control, partner function, schedule line, incompletion.
allowed-tools: Read, Grep
---

## 1. Order-to-Cash Flow

```
Inquiry (VA11) → Quotation (VA21) → Sales Order (VA01)
→ Outbound Delivery (VL01N) → Picking (warehouse solution에 따라 VL02N/WM/EWM)
→ Post Goods Issue / PGI (VL02N) → Billing (VF01)
→ FI Document created → Customer Payment
```

---

## 2. Sales Order Issues

**Pricing errors**
- Condition records: VK11 (create) / VK12 (change) → access sequence → condition table
- Pricing procedure determination: OVKK → sales area + doc pricing procedure + customer pricing procedure
- Manual price change: VA02 → Conditions tab → manual entry (if field status allows)
- Pricing analysis: VA02 → Conditions → Analysis (shows why each condition applied / not applied)

**Availability check**
- CO09: availability overview per material / plant / checking rule
- Checking rule: OVZ9 → scope of check (purchase orders / production orders / safety stock)
- Partial delivery: schedule line category → delivery block vs partial confirmation

**Credit check**
- ECC: FD32 → credit limit per credit control area → exposure = open orders + deliveries + billing + FI
- S/4HANA FSCM: UKM_BP → credit segment → scoring + limit → automatic rule-based check
- Release worklist은 ECC credit-management 구성에 따라 `VKM1`/`VKM3` 범위를 확인하고,
  S/4HANA FSCM에서는 사용 중인 released app/workflow를 확인한다.

**Output (forms / messages)**
- NACE → output type → condition records → access sequence
- Output not triggering: check condition record exists for correct sales org / doc type / partner

**Incompletion log**
- V.02 → list incomplete sales orders
- Incompletion procedure: OVAU → mandatory fields per item category / schedule line category

---

## 3. Delivery and Goods Issue

**Delivery creation**
- `VL01N`: 단일 reference로 manual delivery 생성. Collective delivery는 `VL10A`/`VL10B` 등
  실제 due-list 시나리오를 사용한다. `VF04`는 delivery 생성이 아니라 billing due list다.
- Delivery split: copy control VTLA → split criteria (shipping point / route / delivery date)
- Collective delivery: VL10A (from sales orders) / VL10B (from purchase orders)

**Picking and Transfer Orders**
- Classic WM을 실제 사용하는 경우에만 transfer order를 확인한다.
- `VL02N`에서는 picked quantity와 delivery status를 확인하고, WM/EWM task confirmation은
  해당 warehouse monitor와 document flow에서 별도 검증한다.

**Post Goods Issue (PGI)**
- VL02N → Post Goods Issue button
- PGI errors: stock insufficient (MMBE check) / batch locked / serial number missing
- PGI reversal: VL09 → reverse goods issue (if billing not yet done)

**Batch determination**
- VCH1 → batch search strategy → sort / selection criteria
- CH1 → batch search strategy in delivery

---

## 4. Billing

**Billing due list (VF04)**
- Billing block on order: VA02 → Billing tab → remove block
- Billing block on delivery: VL02N → remove billing block

**Billing types**

| Type | Description | Reference |
|------|-------------|-----------|
| F2 | Standard invoice | Delivery |
| G2 | Credit memo | Credit memo request |
| L2 | Debit memo | Debit memo request |
| F5 | Pro forma (order-based) | Sales order |
| F8 | Pro forma (delivery-based) | Delivery |
| IV | Intercompany invoice | Delivery |
| RE | Returns credit | Return delivery |

**Invoice cancellation**
- VF11 → cancel billing document → creates cancellation document (S1)
- Reversal posts offsetting FI document

**Collective billing**: VF06 → mass billing run → select + process

---

## 5. Pricing

**Condition technique structure**
```
Pricing Procedure
  └── Condition Types (PR00, K007, KF00, etc.)
       └── Access Sequences
            └── Condition Tables (key combinations)
                 └── Condition Records (VK11)
```

**Common condition types**

| Type | Description |
|------|-------------|
| PR00 | Base price |
| K004 | Material discount |
| K005 | Customer/material discount |
| K007 | Customer discount (%) |
| KF00 | Freight surcharge |
| MWST | Output tax |

**Rebate processing**
- VB01: create rebate agreement → conditions → accrual rate
- VB02: manual accrual update
- VB07: rebate settlement (partial / final)
- Rebate must be activated in customer master (billing tab) and sales org config

---

## 6. Credit Management

**ECC Credit Management**
- FD32: credit limit → credit control area → risk category → credit limit amount
- Credit exposure: open order value + open delivery value + open billing + open FI items
- Credit check triggered at: order save / delivery creation / goods issue (configurable per risk cat)

**S/4HANA FSCM Credit Management**
- UKM_BP: credit master per customer → credit segment → scoring rules
- UKM_MY_LIMIT: credit limit workflow and approval
- Rule-based: automatic scoring → automatic limit assignment
- Event-driven: real-time exposure calculation from Universal Journal

**Release workflow**
- VKM1: list of blocked orders → select → release
- VKM3: list of blocked deliveries → release
- Automatic re-check: after release, re-check at next critical step

---

## 7. SD Account Determination (VKOA)

FI document created at billing uses account keys from pricing procedure:

| Account Key | Usage |
|------------|-------|
| ERL | Revenue account (main sales revenue) |
| ERS | Sales deduction / discount |
| ERF | Freight revenue |
| ERB | Rebate-related revenue deduction when configured |

VKOA: assign revenue-related G/L accounts per configured combination of:
Application + Condition type + Account key + Chart of accounts + Sales org + Account assignment group (customer/material)

Tax G/L determination은 tax procedure와 FI tax account configuration도 함께 확인한다. `VKOA`만으로
모든 tax posting을 설명하지 않는다.

---

## 8. S/4HANA SD Changes

| Topic | ECC | S/4HANA |
|-------|-----|---------|
| Revenue recognition | VBREVN / VF44 | IFRS 15 POB approach |
| Credit management | FD32 | FSCM / UKM_BP |
| Availability check | CO09 | Same (enhanced with MRP Live) |
| Pricing | Same condition technique | Same + enhanced Fiori apps |
| Billing output | NACE | Output Management (BRF+) |
| SD→FI posting | Same | Direct to ACDOCA |

---

## 9. Environment Intake and Safety Contract

SD 진단 전에 다음을 받는다.

1. ECC 6.0 EhP 또는 S/4HANA release year
2. On-Premise, RISE Private Cloud, Public Cloud 배포 모델
3. 업종과 order-to-cash variant(재고판매, 서비스, intercompany, returns 등)
4. sales document, delivery, billing document 중 최초 실패 단계
5. 정확한 message class/number와 발생 시각
6. sales area, document type, item/schedule-line category는 사용자 제공 값만 사용
7. classic output(`NACE`)인지 S/4HANA Output Management인지
8. ECC classic Credit Management인지 S/4HANA FSCM Credit Management인지

회사코드, sales org, distribution channel, division, plant, shipping point, G/L 계정을
임의 값으로 박지 않는다. 운영 문서를 변경하기 전 display transaction과 document flow로
증거를 먼저 수집한다.

설정 변경은 DEV→QA→PRD Transport가 필수다. Condition record 같은 master data 변경도
승인·유효기간·변경 이력을 갖추고 QA 문서로 재현한다.

---

## 10. Standard Diagnostic Response

```text
Issue
→ Primary Root Cause
→ Falsification
→ Check (T-code + menu + Table.Field)
→ Fix
→ Rollback
→ Prevention
```

- Primary Root Cause는 evidence가 가장 강한 하나를 먼저 쓴다.
- Falsification은 최소 두 개이며, 관찰 결과로 가설을 기각할 수 있어야 한다.
- Check는 `VA05`에서 대상 오더를 찾아 display로 drill-down하고, 이어서 `VL03N`, `VF03`과 document flow를 확인한다.
- Fix는 copied QA document 또는 representative test order에서 검증한다.
- Rollback은 이전 condition/config/output rule과 영향 문서 처리 중단 기준을 포함한다.
- Public Cloud에는 classic IMG/T-code 변경을 가정하지 않고 released app/configuration activity를 쓴다.

---

## 11. Pricing Condition Technique Diagnostic

가격이 없거나 예상과 다르면 **procedure determination → condition type → access sequence →
condition table/key → condition record → exclusion/manual change** 순서로 본다.

### 11.1 Read-only evidence sequence

1. `[T-code: VA05 | menu: SAP Easy Access > Logistics > Sales and Distribution > Sales > Order > List]`
   - 대상 오더를 선택해 display로 drill-down한 뒤 Header/Item sales area, pricing date, customer/material, document pricing procedure를 확인한다.
   - `Item > Conditions > Analysis`에서 condition별 access와 실패 reason을 읽는다.
2. Pricing procedure determination의 sales area, customer pricing procedure,
   document pricing procedure 조합을 실제 문서와 대조한다.
3. `[T-code: V/06 | menu: SPRO > Sales and Distribution > Basic Functions > Pricing >
   Pricing Control > Define Condition Types]`
   - condition class/category, calculation type, plus/minus, manual-entry rule을 display한다.
4. Access sequence와 condition table의 key field가 문서 값과 같은지 확인한다.
5. `[T-code: VK11 | menu: SAP Easy Access > Logistics > Sales and Distribution >
   Master Data > Conditions > Create]`
   - 신규 생성부터 하지 말고 사용 중인 condition record의 key, validity, currency/UoM을
     approved display 경로에서 먼저 확인한다.
6. exclusion, requirement routine, inactive indicator와 manual condition을 마지막에 본다.

### 11.2 Table and field anchors

| Evidence | ECC | S/4HANA |
|---|---|---|
| Sales order header/item | `VBAK-VBELN/KNUMV`, `VBAP-POSNR/MATNR` | 동일 application evidence |
| Pricing elements | `KONV-KNUMV/KSCHL/KBETR/KINAK` | S/4 pricing-element persistence의 document number, condition type, rate, inactive indicator |
| Schedule line | `VBEP-ETENR/EDATU/BMENG` | 동일 또는 released CDS/API |

S/4HANA에서 위 필드를 technical evidence로 전달할 때는 다음 원형을 사용한다. 이 이름은 T-code가 아니라 persistence table이다.

```text
PRCD_ELEMENTS-KNUMV / KSCHL / KBETR / KINAK
```

S/4HANA extension에서 `KONV`를 primary persistence로 전제하지 않는다.

### 11.3 Hypotheses

**H1 — pricing procedure determination mismatch**

- Supporting: 실제 문서의 determination key가 기대 procedure와 다르다.
- Falsification 1: 기대 procedure가 문서에 이미 결정돼 있다.
- Falsification 2: 동일 procedure의 다른 item도 같은 condition만 누락된다.
- Fix: DEV에서 determination config를 수정하고 경계 sales-area 조합을 QA에서 회귀 테스트한다.
- Rollback: 이전 determination transport를 복원하고 신규 order 생성을 중단한다.

**H2 — condition record key/validity mismatch**

- Supporting: Analysis에 valid record 없음 또는 access key mismatch가 보인다.
- Falsification 1: 같은 key·pricing date·currency/UoM의 유효 record가 선택된다.
- Falsification 2: record를 강제로 바꾸지 않은 동일 조건 test order에 가격이 정상이다.
- Fix: 승인된 condition master 변경으로 key/validity를 바로잡고 overlapping record를 검사한다.
- Rollback: 이전 record validity/value를 변경 이력에 따라 복원하고 영향 order를 식별한다.

**H3 — requirement/exclusion로 inactive**

- Supporting: Analysis에 requirement not fulfilled 또는 exclusion/inactive reason이 보인다.
- Falsification: requirement가 true이고 exclusion group도 condition을 제외하지 않는다.
- Fix: routine/config 변경은 ABAP/SD owner review, DEV unit test, QA pricing regression 후 TR로 이동한다.
- Rollback: 이전 routine/config transport로 복귀한다.

### 11.4 Pricing anti-shortcuts

- 운영 order에 manual price를 넣어 configuration 오류를 숨기지 않는다.
- `V/06` 변경은 condition record 변경과 다르며 반드시 TR이 필요하다.
- condition rate만 보고 currency, pricing unit, condition unit을 생략하지 않는다.
- 가격 재결정은 기존 manual condition과 이미 승인된 문서에 미치는 영향을 먼저 시뮬레이션한다.

---

## 12. Delivery Creation and PGI Diagnostic

### 12.1 `VL01N` delivery creation failure

1. `VA05`에서 대상 오더를 선택해 display로 drill-down하고 Schedule Lines의 confirmed quantity와 material availability date를 확인한다.
2. order/delivery block, incompletion, delivery relevance와 open quantity를 확인한다.
3. shipping point, route, requested delivery date가 실제 determination 결과인지 본다.
4. collective 처리면 due-list selection date와 organizational filter를 기록한다.
5. document flow에 이미 delivery 또는 cancellation이 있는지 확인한다.

Table evidence:

- `VBAK-VBELN`, `VBAP-POSNR`, `VBEP-ETENR/EDATU/BMENG`
- `VBFA-VBELV/VBELN/VBTYP_N` document flow
- `LIKP-VBELN/WADAT_IST`, `LIPS-POSNR/VGBEL/VGPOS/LFIMG`

**H1 — confirmed/open quantity 없음**

- Falsification 1: schedule line confirmed quantity가 양수이고 이미 reference된 quantity도 없다.
- Falsification 2: 같은 selection date의 due list에 item이 나타난다.
- Fix: ATP/schedule-line 원인을 고치며 delivery를 수동 중복 생성하지 않는다.
- Rollback: 변경한 confirmation/config를 이전 상태로 복원한다.

**H2 — block 또는 incompletion**

- Falsification 1: order header/item에 block이 없고 incompletion log도 비어 있다.
- Falsification 2: 동일 document type의 complete test order도 실패한다.
- Fix: business-approved source field를 표준 transaction으로 보완한다.
- Rollback: 원래 block/field 상태를 보존하고 잘못 해제한 문서의 후속 처리를 중단한다.

### 12.2 `VL02N` picking/PGI failure

1. `[T-code: VL02N | menu: SAP Easy Access > Logistics > Sales and Distribution >
   Shipping and Transportation > Outbound Delivery > Change]`의 Check/Log를 먼저 사용한다.
2. picked quantity, batch, serial, stock type, storage location, goods-movement status를 본다.
3. warehouse-managed location이면 WM/EWM task status와 delivery status를 분리한다.
4. posting period와 account-determination message가 있으면 MM/FI boundary로 라우팅한다.
5. billing이 이미 생성됐는지 document flow로 확인한 뒤 reversal 가능성을 판단한다.

**Falsification examples**:

- stock 부족 가설은 같은 batch/location의 unrestricted stock과 allocated quantity가 충분하면 기각한다.
- picking 미완료 가설은 delivery picked quantity와 warehouse task가 모두 complete이면 기각한다.
- period 가설은 posting date가 open period이고 같은 movement가 QA에서 성공하면 낮춘다.

PGI reversal은 `[T-code: VL09 | menu: SAP Easy Access > Logistics > Sales and Distribution >
Shipping and Transportation > Post Goods Issue > Cancel/Reversal]`의 지원 범위와 후속 billing을
검토하고 승인된 문서에만 수행한다. table 직접 수정은 금지한다.

---

## 13. Billing and Output Diagnostic

### 13.1 Billing document creation

1. `VF04`에서 billing due status와 selection cutoff를 확인한다.
2. source order/delivery의 billing relevance, billing block, incompletion을 본다.
3. copy control requirement와 split criteria를 실제 두 문서에서 비교한다.
4. `[T-code: VF03 | menu: SAP Easy Access > Logistics > Sales and Distribution >
   Billing > Billing Document > Display]`에서 document flow와 accounting status를 확인한다.
5. FI posting error면 SD pricing/account key와 FI period/account configuration을 분리한다.

Evidence:

- `VBRK-VBELN/FKART/FKDAT/RFBSK`, `VBRP-POSNR/VGBEL/VGPOS`
- `VBFA` source-to-billing relationship
- S/4HANA FI line item은 `ACDOCA`, ECC FI document evidence는 `BKPF/BSEG`

### 13.2 Classic output — `NACE` to `VF03`

Classic output landscape에서만 다음 순서를 사용한다.

1. `VF03`에서 billing document와 output status/processing log를 확인한다.
2. `NACE`의 billing application에서 output type, medium, dispatch time, access sequence를 display한다.
3. output condition record key, partner function, language, communication data를 대조한다.
4. processing program/form과 spool/email error는 Basis/output owner에게 라우팅한다.
5. `NAST-OBJKY/KAPPL/KSCHL/NACHA/VSTAT`를 read-only evidence로 사용할 수 있다.

**H1 — output determination 실패**

- Supporting: `VF03`에 output item이 없고 access key에 맞는 record도 없다.
- Falsification: output item이 생성돼 processing error 상태라면 determination 가설을 기각한다.
- Fix: condition/config를 QA billing document로 테스트한다.
- Rollback: 이전 condition validity 또는 output configuration transport로 복귀한다.

**H2 — processing/form 실패**

- Supporting: output item은 있으나 processing log가 program/form/communication 오류다.
- Falsification: 같은 output item을 같은 program으로 처리해 정상 spool/message가 생성된다.
- Fix: form/program 변경은 DEV test, code review, QA output comparison 후 TR로 이동한다.
- Rollback: 이전 form/program version을 복원하고 failed output 재처리를 중단한다.

### 13.3 S/4HANA Output Management

- 사용 중인 billing type이 classic output인지 Output Management인지 먼저 확인한다.
- Output Parameter Determination의 BRF+ decision과 channel/receiver/form template evidence를 수집한다.
- `NACE`나 `NAST`가 없다는 이유만으로 장애라고 단정하지 않는다.
- Public Cloud는 released configuration activity와 output app을 사용하고 backend table 접근을 제안하지 않는다.

---

## 14. Credit Management Block Diagnostic

### 14.1 ECC classic Credit Management

1. `[T-code: FD32 | menu: SAP Easy Access > Logistics > Sales and Distribution >
   Credit Management > Master Data > Change]`에서 credit control area별 limit/risk 정보를 확인한다.
2. `VA05`에서 대상 오더를 선택해 display로 drill-down하고 credit status와 check log를 확인한다.
3. configured worklist(`VKM1`/`VKM3`)의 document scope와 release authorization을 확인한다.
4. open order, delivery, billing, FI exposure의 기준시각을 맞춘다.
5. `KNKK-KUNNR/KKBER/KLIMK/CTLPC`는 read-only evidence로만 사용한다.

### 14.2 S/4HANA FSCM Credit Management

1. `[T-code: UKM_BP | menu: SAP Easy Access > Financial Supply Chain Management >
   Credit Management > Master Data > Business Partner]`에서 credit segment, limit, risk/scoring을 본다.
2. credit case/workflow와 documented release authority를 확인한다.
3. exposure update timestamp와 sales document check timestamp를 비교한다.
4. classic `FD32/KNKK` 절차를 S/4 FSCM의 primary 절차로 안내하지 않는다.
5. Public Cloud에서는 released credit-management app과 business role을 확인한다.

### 14.3 Falsification and rollback

**Limit 초과 가설**은 동일 기준시각의 exposure가 available limit 안이고 다른 rule 실패가 보이면 기각한다.

**Exposure update 지연 가설**은 FI/SD source와 credit exposure timestamp가 일치하면 기각한다.

**Authorization 가설**은 같은 role의 authorized approver가 같은 work item을 정상 처리하면 낮춘다.

Fix는 limit을 임의 증액하는 것이 아니다. 잘못된 exposure, master assignment, rule 또는 workflow를
증거에 맞게 수정한다. Limit/rule 변경은 승인·SoD·QA test·TR을 거친다.

Rollback은 이전 limit/rule/master assignment를 복원하고, 잘못 release된 order/delivery의 후속
PGI·billing을 즉시 중단하는 기준을 포함한다.

---

## 15. Copy Control and Document Flow

Order→delivery→billing 문제는 target document만 보지 않고 `VBFA` 흐름을 기준으로 본다.

1. source/target document category와 reference quantity/value를 확인한다.
2. header/item copy requirement와 data-transfer routine을 분리한다.
3. delivery/billing split이 business key 차이 때문인지 오류인지 비교한다.
4. 이미 취소된 target 또는 duplicate reference가 있는지 확인한다.
5. routine 변경은 ABAP owner와 함께 side effect를 회귀 테스트한다.

Falsification:

- Copy-control 가설은 동일 source/target type의 QA 문서가 같은 routine으로 정상 복사되면 낮춘다.
- Split 가설은 split analysis의 relevant fields가 동일한데도 두 문서로 나뉘면 추가 routine을 본다.
- Missing-flow 가설은 `VBFA`에 target relationship이 존재하면 기각하고 status/display 문제를 본다.

---

## 16. Configuration, Test, and Rollback Matrix

| Change | Configuration surface | Test | Rollback |
|---|---|---|---|
| Condition type | `V/06` / IMG | QA order pricing analysis | 이전 TR과 condition behavior 복원 |
| Pricing determination | IMG pricing procedure determination | sales-area combination matrix | 이전 determination TR |
| Output type/classic | `NACE` | QA billing output + form comparison | 이전 output config/form |
| Credit rule | ECC/FSCM release별 config | below/at/above limit boundary | 이전 rule/limit assignment |
| Copy control | IMG + routine | order→delivery→billing regression | 이전 routine/config TR |
| Delivery config | IMG shipping | complete/partial/batch/warehouse cases | 이전 config TR |

운영 문서 자체의 reversal은 configuration rollback과 다르다. 문서 상태, accounting document,
warehouse task, tax/output 후속 영향을 검토하고 business owner가 결정한다.

---

## 17. ECC vs S/4HANA Decision Matrix

| Area | ECC 6.0 | S/4HANA On-Premise/Private | Public Cloud |
|---|---|---|---|
| Pricing persistence | `KONV` | S/4 pricing-element persistence가 primary | released CDS/API/app |
| Credit | Classic `FD32/KNKK` common | FSCM `UKM_BP`, credit segment | released FSCM apps |
| Billing output | `NACE/NAST` classic | classic 또는 Output Management | Output Management/config activity |
| FI posting evidence | `BKPF/BSEG` | `ACDOCA` + document views | released journal apps/API |
| Extension | exits/routines | clean-core released BAdI/API preferred | in-app/side-by-side only |

릴리스만으로 output framework를 단정하지 말고 실제 billing type/configuration을 확인한다.

---

## 18. Anti-Patterns

- ❌ `VF04`를 delivery due list로 안내
- ❌ pricing analysis 없이 `VK11` record부터 새로 생성
- ❌ `V/06`, copy control, output config를 운영에서 직접 변경
- ❌ manual condition으로 pricing determination 오류를 은폐
- ❌ open quantity와 document flow를 보지 않고 duplicate delivery 생성
- ❌ warehouse task가 남았는데 `VL02N` 상태만 보고 picking 완료 단정
- ❌ billing 후속 문서를 확인하지 않고 PGI reversal 권고
- ❌ S/4 Output Management 장애에 `NACE/NAST`만 안내
- ❌ ECC condition persistence와 S/4 pricing-element persistence를 같은 구조로 설명
- ❌ ECC `FD32`와 S/4 FSCM `UKM_BP`를 혼용
- ❌ credit block 해제를 위해 근거 없이 limit 증액
- ❌ customer, sales org, plant, shipping point, G/L을 임의 값으로 하드코딩
- ❌ 운영 `VBAK/VBAP/LIKP/LIPS/VBRK/VBRP/NAST`를 `SE16N`으로 수정
- ❌ QA, TR, rollback 없이 configuration 또는 ABAP routine 변경
- ❌ 검증되지 않은 SAP Note/T-code 추정

---

## 19. Operator Checklist

```text
□ ECC/S4 release, deployment, industry
□ 최초 실패 단계(order/delivery/PGI/billing/output/credit)
□ source/target document flow와 정확한 message
□ display transaction + menu path
□ ECC/S4 table 또는 released monitor 구분
□ Primary Root Cause 1개
□ falsification evidence 2개 이상
□ QA representative document
□ TR/master-data change approval
□ rollback artifact와 stop trigger
```
