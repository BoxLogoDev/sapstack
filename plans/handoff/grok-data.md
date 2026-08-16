# Grok 작업 지시서 — 데이터 자산 확장 + 적대적 검증

> 이 문서를 그대로 Grok 창에 붙여넣으세요.
> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`

---

## 실행 모드 — 자율 반복 (DeepSearch / Think 모드를 켜세요)

토큰 여유가 있습니다. **한 번에 답하고 끝내지 말고, 목표에 도달할 때까지 스스로 반복하세요.**

```
GOAL
  측정 커버리지를 넓히고, 저장소에 남아 있는 사실 오류를 색출한다.

성공 기준 (측정 가능 — 전부 충족해야 완료)
  1. industry-matrix.yaml 이 7개 업종을 담고 check-industry-refs.sh 통과
  2. gold-set 이 45건 이상이고 check-eval-goldset.sh --strict 통과
  3. 신규 케이스 전부가 symptom-index 의 typical_causes[0] 출처를 댈 수 있음
  4. ./scripts/check-tcodes.sh --strict  통과
  5. node scripts/check-doc-stats.mjs    통과
  6. stale 문서 4건 정정 완료
  7. 적대적 검증 리포트 제출 (문제 0건이면 "무엇을 어떻게 확인했는지"를 적을 것)

자율 루프
  ① 대상 하나를 고른다
  ② 근거 파일을 먼저 읽는다 (추측 금지 — 출처 없으면 그 항목은 버린다)
  ③ 작성한다
  ④ 검증 스크립트를 실제로 돌린다
  ⑤ 실패하면 ③으로. 통과할 때까지 나가지 않는다
  ⑥ 다음 대상으로

중단 조건 (여기서 멈추고 보고)
  - 같은 검증이 3회 연속 실패
  - 정답의 출처를 symptom-index 에서 찾을 수 없을 때 (창작하지 말고 그 케이스를 버릴 것)
  - 소유가 아닌 파일을 고쳐야만 해결되는 문제를 만났을 때
```

**1차 목표를 끝내고도 여력이 남으면** 2차로 진행하세요:

- gold-set 을 45 → 58건까지 확대 (symptom-index 90건 대비 커버리지 향상). 단 **출처를 댈 수 있는 것만**
- `data/symptom-index.yaml` 다국어 필드(zh/ja/de/vi) 누락분 점검 → 채우지 말고 **누락 목록만 보고**
- `docs/` 전체에서 버전 수치가 stale 한 곳을 전수 색출 → 목록 보고

---

## 당신의 역할

두 가지입니다.

1. **데이터 자산 확장** — 구조화된 YAML 데이터와 문서를 채운다
2. **적대적 검증** — 다른 AI가 만든 산출물의 사실 오류를 찾아낸다

두 번째가 특히 중요합니다. 이 프로젝트의 철학(`ETHOS.md`)은 **"그럴듯함보다 사실, 확신보다 증거"** 입니다. 당신은 그 원칙을 강제하는 역할입니다. **틀린 것을 찾아내는 것이 당신의 성과입니다. 동의하는 것이 아니라.**

3개 AI가 병렬로 작업 중입니다. **파일 소유권이 엄격히 나뉘어 있습니다.**

| AI                      | 소유 디렉토리                                            |
| ----------------------- | -------------------------------------------------------- |
| Claude (오케스트레이터) | `.github/`, `apps/`, `packages/`, `mcp/`, 루트 설정 파일 |
| ChatGPT                 | `agents/`, `plugins/`                                    |
| **Grok (당신)**         | **`data/`, `docs/`**                                     |

> ⛔ **당신 소유가 아닌 디렉토리는 읽기만 하고 절대 편집하지 마세요.** 검증에서 오류를 발견하면 직접 고치지 말고 **보고만** 하세요.

---

## 작업 시작 전 필독

1. `ETHOS.md` — 6개 원칙
2. `CLAUDE.md` — Universal Rules
3. `data/symptom-index.yaml` 상단 주석 — 데이터 등록 원칙
4. `docs/eval/methodology.md` — gold-set이 어떻게 채점에 쓰이는지

---

## 작업 목록

### 작업 1 — `data/industry-matrix.yaml` 확장 (3 → 7개 업종)

현재 3개 업종만 있는데, `docs/industry/`에는 7개 문서가 있습니다. 그래서 MCP 툴 `list_agents_for_industry`가 4개 업종을 라우팅하지 못합니다.

| 현재 있음                                 | 없음 (추가 대상)                                     |
| ----------------------------------------- | ---------------------------------------------------- |
| manufacturing, retail, financial_services | **automotive, chemicals, healthcare, public_sector** |

**근거 자료가 이미 있습니다** — `docs/industry/automotive.md`, `chemicals.md`, `healthcare.md`, `public-sector.md`. 이 문서들을 읽고 그 내용에서만 파생하세요. **새로 지어내지 마세요.**

기존 스키마를 그대로 따르세요:

```yaml
manufacturing:
  modules:
    PP: { importance: critical, agent: sap-pp-consultant, note: "..." }
```

`importance`는 기존 파일에서 쓰는 값만 사용합니다 (critical / high / medium / low / none).

검증: `./scripts/check-industry-refs.sh`

---

### 작업 2 — `data/eval/gold-set.yaml` 확장 (32 → 45건)

이것이 가장 신중해야 하는 작업입니다.

**현황**: `data/symptom-index.yaml`에 증상이 90건 있는데, gold-set에는 32건만 있습니다. 즉 58건이 미측정입니다.

**철칙 — 정답을 창작하지 마세요.**

`expected.primary_root_cause`는 **반드시** 해당 symptom의 `typical_causes` **첫 번째 항목**("제일 흔한 원인")에서 파생해야 합니다. 당신이 SAP 지식으로 "이게 더 맞는 것 같은데"라고 판단해도 **바꾸지 마세요.** 정답의 출처는 단일해야 합니다(ETHOS ①: Ground-truth over plausibility).

증상 본문도 복제하지 말고 `symptom_ref`로 참조만 합니다.

스키마 (`schemas/eval-gold-set.schema.yaml` 참조):

```yaml
- id: eval-{module}-{slug}
  symptom_ref: sym-{...} # ← symptom-index.yaml에 실재해야 함
  module: FI
  difficulty: easy | medium | hard
  env: { release: ecc | s4 | any, deployment: on-prem | any, country: any }
  prompt: "운영자가 실제로 할 법한 한 문장"
  expected:
    primary_root_cause: "typical_causes[0]에서 파생"
    must_tcodes: [XXX, YYY] # ← data/tcodes.yaml에 실재해야 함
    must_checks:
      - "구체적 확인 행위"
    sap_note: null # 확실하지 않으면 반드시 null
  ethos_flags: [no_hardcode, ecc_s4_distinction]
```

**선정 기준** — 13건을 고를 때:

- 현재 모듈 분포가 편중돼 있습니다 (FI 4, SD 4, PP 4 / QM·HCM·EWM·PM·WM·BTP·SAC·IBP·Ariba·IC 각 1)
- **커버리지가 낮은 모듈을 우선**하되, symptom-index에 해당 증상이 실재하는 경우에만
- `must_tcodes`가 `data/tcodes.yaml`에 없으면 → 그 케이스는 **넣지 마세요** (또는 T-code를 먼저 등록. T-code 등록도 당신 소유입니다)

**검증 (필수, 통과할 때까지)**:

```bash
./scripts/check-eval-goldset.sh --strict   # 참조 무결성
./scripts/check-tcodes.sh --strict
```

---

### 작업 3 — stale 문서 정정

조사에서 확인된 사실 오류입니다. 실제 값을 다시 확인한 뒤 고치세요.

| 파일                           | 문제                                                             | 실제                                      |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------- |
| `docs/architecture.md`         | 본문 수치가 v1.4.0 기준 ("14 SKILL.md · 9 agents · 10 commands") | **24 플러그인 · 20 에이전트 · 22 커맨드** |
| `docs/sap-ai-integration.md`   | 로드맵이 v1.8/v2.0/v3.0 기준인데 현재 v2.4.0                     | 현재 버전 기준으로 재정렬                 |
| `data/eval/gold-set.yaml` 주석 | "현재 21건... 목표 30~50건"                                      | 실제 32건 (당신 작업 후 45건)             |

정정 전 반드시 실제 카운트를 확인하세요:

```bash
ls plugins/ | wc -l ; ls agents/*.md | wc -l ; ls commands/*.md | wc -l
node scripts/check-doc-stats.mjs
```

---

### 작업 4 — `docs/compliance/air-gapped-deployment.md` 정정

이 문서에 **제품 방향과 모순되는 서술과 보안상 잘못된 조언**이 있습니다.

| 위치       | 문제                                                                              | 조치                                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 597~598행  | _"Q: 인터넷이 없으면 Claude AI 기능은? A: Claude 호출 없음. 대신 규칙 기반 분석"_ | **곧 온디바이스 LLM이 탑재됩니다.** 지금은 "온디바이스 로컬 모델 지원 예정 (v2.5)"으로 표기하고, 실제 동작 서술은 Claude가 Phase 2 완료 후 확정합니다. **당신은 자리만 만들어 두세요** |
| 242~250행  | GL 잔액 조회 예제 — _"SAP 시스템의 로컬 ABAP 런타임 호출"_                        | **사실과 다릅니다.** sapstack은 SAP 시스템에 붙지 않습니다(명시적 비목표이며 코드가 fail-closed로 차단). 이 예제를 "운영자가 조회 결과를 붙여넣는" 실제 흐름으로 교체                  |
| 523행      | `audit-trail.jsonl는 777 (쓰기 가능)이어야 함`                                    | **보안상 위험한 조언.** 감사추적 파일에 777은 부적절. 소유자 쓰기(600 또는 640)로 정정                                                                                                 |
| 44~48행 등 | 버전이 1.7.0으로 고정                                                             | 현재 버전 체계에 맞게 갱신                                                                                                                                                             |

---

### 작업 5 — 적대적 검증 (ChatGPT 산출물 대상)

ChatGPT가 `agents/`와 `plugins/`를 보강하면, 그 산출물을 검증하세요. **당신의 기본 태도는 "틀렸다고 가정하고 반증을 찾는 것"입니다.**

체크리스트:

1. **T-code 실재성** — 언급된 모든 T-code가 `data/tcodes.yaml`에 있는가? 없으면 실재하는 T-code인가, 지어낸 것인가?
2. **ECC/S4 구분** — ECC에 없는 기능을 ECC에서 되는 것처럼 썼는가? (예: EWM은 ECC에 없음, WM은 S/4에서 deprecated)
3. **하드코딩** — 회사코드·G/L 계정·코스트센터 예시값이 들어갔는가?
4. **SAP Note 번호** — 존재하지 않는 Note 번호를 지어냈는가? (확인 불가하면 그 자체가 문제)
5. **반증 조건 누락** — "기각될 수 없는 가설"을 제안하고 있는가?
6. **정답 암기 흔적** — gold-set의 표현을 그대로 베낀 흔적이 있는가? (있으면 심각한 문제로 보고)

발견한 것은 **고치지 말고 보고만** 하세요 (`agents/`·`plugins/`는 ChatGPT 소유).

---

## 절대 금지

1. ⛔ **불확실한 정보를 등록하지 마세요.** `data/tcodes.yaml` 주석: _"확실하지 않은 T-code는 등록 금지 (과소 등록이 과잉 등록보다 낫다)"_. `data/sap-notes.yaml`: _"번호가 불확실하면 등록하지 않습니다"_
2. ⛔ **gold-set의 정답을 창작하지 마세요.** 반드시 symptom-index에서 파생
3. ⛔ `agents/`, `plugins/`, `mcp/`, `packages/`, `.github/` 편집 금지
4. ⛔ 검증 스크립트가 실패하는 상태로 보고하지 마세요

---

## 완료 보고 형식 (필수)

```
## EVIDENCE

### 변경 파일
- data/industry-matrix.yaml : 3 → 7 업종
- data/eval/gold-set.yaml : 32 → 45 케이스
- (이하 전부)

### 검증 실행 결과
$ ./scripts/check-eval-goldset.sh --strict
(실제 출력)

$ ./scripts/check-tcodes.sh --strict
(실제 출력)

$ ./scripts/check-industry-refs.sh
(실제 출력)

$ node scripts/check-doc-stats.mjs
(실제 출력)

### 신규 gold-set 13건 — 각각의 정답 출처
| eval id | symptom_ref | primary_root_cause 출처 |
|---|---|---|
| eval-... | sym-... | symptom-index.yaml L{줄번호} typical_causes[0] |
(13건 전부. 출처를 못 대는 항목은 제거하세요)

### 적대적 검증 결과 (ChatGPT 산출물)
| 파일 | 줄 | 문제 | 심각도 | 근거 |
|---|---|---|---|---|
(발견한 것 전부. "문제 없음"이면 무엇을 어떻게 확인했는지 적으세요)

### 확신하지 못한 부분
- (정직하게)
```
