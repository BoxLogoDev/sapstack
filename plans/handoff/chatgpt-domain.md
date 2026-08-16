# ChatGPT 작업 지시서 — SAP 도메인 지식 보강

> 이 문서를 그대로 ChatGPT 창에 붙여넣으세요.
> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`

---

## 실행 모드 — 자율 반복 (Agent / 장시간 실행 모드를 켜세요)

토큰 여유가 있습니다. **한 번에 답하고 끝내지 말고, 목표에 도달할 때까지 스스로 반복하세요.**

```
GOAL
  얇은 지식 자산 8개를 다른 파일과 동등한 수준으로 끌어올린다.

성공 기준 (측정 가능 — 전부 충족해야 완료)
  1. 에이전트 4개가 각각 140줄 이상이고 캐논 8개 섹션을 모두 갖춤
  2. SKILL.md 4개가 각각 300줄 이상
  3. ./scripts/lint-frontmatter.sh        통과
  4. ./scripts/check-tcodes.sh --strict   통과
  5. ./scripts/check-hardcoding.sh --strict 통과
  6. ./scripts/check-ecc-s4-split.sh --strict 통과
  7. 새로 쓴 모든 T-code가 실재하며, 확신 못 하는 것은 하나도 남지 않음

자율 루프 (파일 하나마다 반복)
  ① 기준 샘플을 읽는다 (sap-fi-consultant.md / sap-qm SKILL.md)
  ② 대상 파일의 빈 곳을 찾는다
  ③ 보강한다
  ④ 검증 스크립트 4개를 실제로 돌린다
  ⑤ 실패하면 ③으로 돌아간다. 통과할 때까지 나가지 않는다
  ⑥ 다음 파일로

중단 조건 (여기서 멈추고 보고)
  - 같은 검증이 3회 연속 실패
  - SAP 사실관계를 확신할 수 없어 추측하게 될 때
  - 소유가 아닌 파일을 고쳐야만 해결되는 문제를 만났을 때
```

**1차 목표(위 8개)를 끝내고도 여력이 남으면** 2차로 진행하세요:

- `agents/` 20개 전수 점검 → frontmatter가 두 계열로 갈라져 있습니다(16개는 `tools` 필드 있고 `model: sonnet`, 4개는 `tools` 없고 `model: opus`). 어느 쪽이 옳은지 **판단하지 말고 차이만 표로 보고**하세요
- `plugins/` 24개 SKILL.md 줄 수를 전수 조사해 얇은 순으로 목록화 → 다음 배치 후보 제안

---

## 당신의 역할

당신은 **SAP 도메인 전문가**입니다. sapstack이라는 SAP 운영 진단 AI 제품의 **지식 자산을 채우는 일**을 맡습니다. 코드는 건드리지 않습니다.

3개 AI가 병렬로 작업 중입니다. **파일 소유권이 엄격히 나뉘어 있습니다.**

| AI                      | 소유 디렉토리                                            |
| ----------------------- | -------------------------------------------------------- |
| Claude (오케스트레이터) | `.github/`, `apps/`, `packages/`, `mcp/`, 루트 설정 파일 |
| **ChatGPT (당신)**      | **`agents/`, `plugins/`**                                |
| Grok                    | `data/`, `docs/`                                         |

> ⛔ **당신 소유가 아닌 디렉토리는 읽기만 하고 절대 편집하지 마세요.** 동시 편집 충돌이 나면 전체 작업이 롤백됩니다.

---

## 배경 — 왜 이 일이 필요한가

sapstack에는 진단 품질을 측정하는 eval 하니스가 있습니다. gold-set 32건을 실제 에이전트로 풀게 하고 LLM judge 3표로 채점합니다. 현재 릴리스 게이트(평균 0.65)를 통과하지 못해 **배포가 막혀 있습니다.**

바닥 점수 케이스를 분석한 결과, **원인이 명확합니다 — 특정 에이전트·스킬 파일이 다른 것에 비해 현저히 얇습니다.**

| 파일                                          | 현재 줄 수 | 비교 대상                                              |
| --------------------------------------------- | ---------- | ------------------------------------------------------ |
| `agents/sap-ariba-consultant.md`              | **81**     | `sap-cloud-consultant` 287, `sap-basis-consultant` 183 |
| `agents/sap-sac-consultant.md`                | **89**     | 〃                                                     |
| `agents/sap-ibp-consultant.md`                | **94**     | 〃                                                     |
| `agents/sap-integration-cloud-consultant.md`  | **103**    | 〃                                                     |
| `plugins/sap-sac/skills/sap-sac/SKILL.md`     | **97**     | `sap-qm` 1,101, `sap-pm` 696, `sap-ewm` 569            |
| `plugins/sap-integration-cloud/.../SKILL.md`  | **121**    | 〃                                                     |
| `plugins/sap-ariba/skills/sap-ariba/SKILL.md` | **123**    | 〃                                                     |
| `plugins/sap-mm/skills/sap-mm/SKILL.md`       | **143**    | 〃                                                     |

이 8개 파일이 당신의 작업 대상입니다.

---

## 작업 시작 전 필독

다음 파일을 **먼저 읽고** 규칙과 문체를 파악하세요.

1. `CLAUDE.md` — 강제 규칙 (Universal Rules 8개, 응답 모드)
2. `ETHOS.md` — 6개 원칙과 안티패턴
3. `agents/sap-fi-consultant.md` — **에이전트 캐논의 기준 샘플**
4. `plugins/sap-qm/skills/sap-qm/SKILL.md` — **SKILL 캐논의 기준 샘플** (1,101줄, 가장 충실함)

---

## 지켜야 할 규칙 (위반 시 반려)

### Universal Rules

1. **회사코드·G/L 계정·코스트센터·조직단위를 절대 하드코딩하지 않는다** — "1000 회사코드에서..." 같은 표현 금지
2. **ECC 6.0과 S/4HANA 동작 차이를 반드시 구분**해 서술한다
3. 모든 조치에 **T-code와 메뉴 경로를 함께** 제공한다
4. 설정 변경에는 **트랜스포트(TR)가 필요함**을 명시한다
5. **운영 환경에서 SE16N 데이터 편집을 절대 권하지 않는다**
6. 시뮬레이션·테스트런 없이 운영 변경을 권고하지 않는다

### 한국 현장 언어

- 현장 외래어를 1순위로: "코스트 센터", "페이먼트 메소드", "트포", "미고"
- 첫 등장 시 괄호 병기: "코스트 센터 (원가센터, KOSTL)"
- T-code는 원형 유지: `F110`, `MIGO`, `ST22` — "F110 트랜잭션"이라고 쓰지 않음
- 약어 유지: PO, GR, TR — "구매발주"로 풀지 않음

### 에이전트 파일 구조 (캐논)

```
---
name: sap-{module}-consultant
description: ...
model: opus
---

## 역할
## 핵심 원칙
## 응답 형식
## IMG 구성 라우팅
## 위임 프로토콜
## 전문 영역
## 한국 현장 특이사항
## 금지 사항
## 참조
```

응답 형식은 이 순서를 강제합니다:
`Issue → Primary Root Cause → Falsification → Check (T-code + Table/Field) → Fix → Rollback → Prevention`

**Falsification(반증 조건)이 핵심입니다.** "이 가설이 틀렸다면 무엇이 관찰되어야 하는가"를 반드시 넣으세요. 기각될 수 없는 가설은 금지입니다.

---

## 작업 목록

### 작업 1 — 에이전트 4개 보강 (우선순위 순)

각 파일을 **최소 140줄 이상**, 캐논 구조를 모두 갖추도록 보강하세요.

| 순위 | 파일                                         | 특히 채워야 할 것                                                                                                                                                                                                                           |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `agents/sap-integration-cloud-consultant.md` | CPI/iFlow 메시지 실패 진단 경로. Message Processing Log → mapping step → payload schema 순서. S/4·PI-PO 교차 확인 시 `SXMB_MONI`·`SRT_MONI`. **payload에 개인정보가 있을 수 있으므로 원문 외부 전송 금지, 비식별 evidence만 요청**하는 규칙 |
| 2    | `agents/sap-sac-consultant.md`               | Live Connection 실패 진단. S/4 측 `SICF`(InA/OData 노드 활성)·`SAML2`(trust/metadata) 확인 순서. Import vs Live 차이. Planning Model 저장 실패. Story 성능                                                                                  |
| 3    | `agents/sap-ibp-consultant.md`               | S/4 연동(`MD63` PIR → `MD04` MRP 반영) 순서. CPI-DS / RTI 데이터 통합. Demand Sensing·S&OP·Supply·Inventory·Response 각 모듈 진단 경로                                                                                                      |
| 4    | `agents/sap-ariba-consultant.md`             | Ariba ↔ S/4 인보이스 매칭 실패(3-way match). cXML 전송 실패. Guided Buying. SLP(공급업체 수명주기)                                                                                                                                          |

### 작업 2 — SKILL.md 4개 보강

| 순위 | 파일                                                                  | 목표                                            |
| ---- | --------------------------------------------------------------------- | ----------------------------------------------- |
| 1    | `plugins/sap-sac/skills/sap-sac/SKILL.md`                             | 97 → 300줄 이상                                 |
| 2    | `plugins/sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` | 121 → 300줄 이상                                |
| 3    | `plugins/sap-ariba/skills/sap-ariba/SKILL.md`                         | 123 → 300줄 이상                                |
| 4    | `plugins/sap-mm/skills/sap-mm/SKILL.md`                               | 143 → 300줄 이상 (MM은 핵심 모듈인데 유독 얇음) |

`sap-qm` SKILL.md의 섹션 구성을 참고하되, **분량을 채우기 위한 빈말은 넣지 마세요.** 실제 진단에 쓰이는 내용만 씁니다.

---

## 절대 금지

1. ⛔ **`data/eval/gold-set.yaml`을 열어 정답을 보고 맞추지 마세요.** 이 파일은 시험지입니다. 정답 암기는 측정을 무의미하게 만들고, 실제 고객 문제에는 도움이 되지 않습니다. 도메인 지식을 채우면 점수는 따라옵니다.
2. ⛔ **불확실한 T-code·SAP Note 번호를 지어내지 마세요.** ETHOS 원칙 ①: _"확실하지 않으면 등록하지 않는다. 과소 등록이 과잉 등록보다 낫다."_ 모르면 "확인 필요"라고 쓰세요.
3. ⛔ `data/`, `docs/`, `mcp/`, `packages/`, `.github/` 편집 금지 (다른 AI 소유)
4. ⛔ 파일을 통째로 재작성하지 마세요. 기존 내용은 보존하고 **추가·보강**하세요.

---

## 완료 보고 형식 (필수)

작업이 끝나면 아래 형식으로 보고하세요. **이 EVIDENCE 블록이 없으면 머지되지 않습니다.**

```
## EVIDENCE

### 변경 파일
- agents/sap-sac-consultant.md : 89 → 152줄
- (이하 전부 나열)

### 검증 실행 결과
$ ./scripts/lint-frontmatter.sh
(실제 출력 붙여넣기)

$ ./scripts/check-tcodes.sh --strict
(실제 출력 붙여넣기)

$ ./scripts/check-hardcoding.sh --strict
(실제 출력 붙여넣기)

### 새로 추가한 T-code
- (T-code 목록. data/tcodes.yaml에 없는 것이 있으면 여기에 표시 —
   등록은 Grok 담당이므로 당신이 직접 추가하지 마세요)

### 확신하지 못한 부분
- (정직하게 적으세요. 이 항목이 비어 있으면 오히려 의심합니다)
```

---

## 참고

- 검증 스크립트는 저장소 루트에서 Git Bash로 실행합니다
- 작업 단위를 작게 나누고, 파일 하나를 끝낼 때마다 검증을 돌리세요
- 막히면 추측하지 말고 "확인 필요"로 남긴 뒤 보고하세요
