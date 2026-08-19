# Grok 2차 지시서 — 다국어 커버리지 완성 + 국가/업종 심화

> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`
> 소유 디렉토리: **`data/`, `docs/`** (1차와 동일)

---

## 1차 결과 — 수용됐습니다

gold-set 32 → 58건, industry-matrix 3 → 7종, stale 문서 정정. 오케스트레이터가
게이트로 재검증하고 커밋했습니다(`e6064f9`).

```
check-eval-goldset --strict  58건, 오류 0 / 경고 0
check-industry-refs          17 통과, 0 실패
check-tcodes --strict        미등록 0건
npm test                     29/29  ← BTP·GTS agent 누락을 채워 마지막 실패가 풀렸습니다
```

특히 `industry-matrix` 의 BTP·GTS agent 누락 지적을 반영한 덕에 MCP 테스트가
28/29 → 29/29 가 됐습니다.

---

## 이번 라운드의 주제 — 제품 주장과 실제의 괴리를 메운다

`CLAUDE.md` 와 README 는 **"6개 언어 지원(ko/en/zh/ja/de/vi)"** 을 표방합니다.
그런데 실제 커버리지를 세어 보면 이렇습니다.

| 필드         | 건수   | 커버리지 |
| ------------ | ------ | -------- |
| `symptom_ko` | 90     | 100%     |
| `symptom_en` | 90     | 100%     |
| `symptom_zh` | **26** | 29%      |
| `symptom_ja` | **27** | 30%      |
| `symptom_de` | **26** | 29%      |
| `symptom_vi` | **23** | 26%      |

**증상 매칭은 다국어 지원의 핵심 경로입니다.** 사용자가 자국어로 증상을 입력하면
`resolve_symptom` 이 매칭해 모듈과 첫 체크를 제시하는 구조인데, 70%가 비어 있으면
zh/ja/de/vi 사용자에게는 사실상 동작하지 않습니다. 이건 기능 갭이 아니라
**제품 주장이 사실과 다른 상태**입니다.

같은 문제가 `country/` 에도 있습니다.

| 파일                 | 줄 수  |
| -------------------- | ------ |
| `country/korea.md`   | 552    |
| `country/germany.md` | 533    |
| `country/china.md`   | **64** |
| `country/usa.md`     | **64** |
| `country/vietnam.md` | **60** |
| `country/japan.md`   | **54** |

---

## 실행 모드 — 자율 반복

```
GOAL
  "6개 언어 · 6개 국가 지원"을 실제로 성립시킨다.

성공 기준 (측정 가능)
  1. symptom-index 의 zh/ja/de/vi 가 각각 90건 (현재 23~27건)
  2. 번역에 네이티브 검수 표식이 붙어 있어 검수 대상이 식별 가능
  3. country/ 4개 스텁(japan/china/usa/vietnam)이 korea·germany 의 구조를 갖춤
  4. gold-set 58 → 90 (symptom 전수 커버)
  5. docs/industry/ 4개 문서 보강
  6. ./scripts/check-eval-goldset.sh --strict   오류 0
  7. ./scripts/check-translation-parity.sh --strict  통과
  8. ./scripts/check-tcodes.sh --strict         미등록 0건
  9. node scripts/check-doc-stats.mjs           OK

자율 루프
  ① 대상 선택 → ② 근거 파일 확인(추측 금지) → ③ 작성 → ④ 게이트 실행
  → ⑤ 실패하면 ③으로 → ⑥ 다음 대상

중단 조건
  - 같은 게이트가 3회 연속 실패
  - 출처를 댈 수 없어 창작하게 될 때 (그 항목은 버릴 것)
```

---

## 작업 1 — symptom-index 다국어 완성 (최우선)

`data/symptom-index.yaml` 의 90개 항목에 대해 `symptom_zh` / `symptom_ja` /
`symptom_de` / `symptom_vi` 를 채웁니다.

### 번역 규칙 (중요)

1. **T-code 는 절대 번역하지 않습니다.** `F110`, `MIGO`, `ST22` 는 모든 언어에서 원형.
2. **SAP 표준 용어는 각 언어의 SAP 공식 UI 용어를 씁니다.** 일반 번역이 아닙니다.
   예: 독일어 `Buchungskreis`(회사코드), `Kostenstelle`(코스트 센터).
   확신이 없으면 영어 용어를 괄호로 병기하세요 — 틀린 현지어보다 낫습니다.
3. 기존 26~27건이 이미 번역돼 있습니다. **먼저 그 스타일을 읽고 일관되게** 이어가세요.
4. `symptom_ko_variants` 같은 변형 필드는 해당 언어에 자연스러운 경우에만 추가합니다.

### 네이티브 검수 표식

이 저장소에는 이미 커뮤니티 검수 인프라가 있습니다(`TRANSLATION-REVIEW.md`,
Issue 템플릿, CODEOWNERS). 새로 추가한 번역이 **검수 대기 상태임을 식별할 수 있게**
표시하세요. 방식은 기존 관행을 따르되, 없으면 파일 상단 주석으로 범위를 명시하고
`TRANSLATION-REVIEW.md` 에 추가 건수를 기록하세요.

> ETHOS ②: 확신보다 증거. **"번역했으니 됐다"가 아니라 "검수 전이다"를 남기세요.**

검증: `./scripts/check-translation-parity.sh --strict`

---

## 작업 2 — country/ 스텁 4개 확장

`country/korea.md`(552줄)와 `country/germany.md`(533줄)의 **구조를 먼저 파악**하고,
같은 뼈대로 japan / china / usa / vietnam 을 채웁니다.

각 국가에서 실제로 다른 것만 씁니다 — 세금·전자문서·법정 보고·회계 기준·
현지 규제. 한국 내용을 번역해 붙이는 것은 금물입니다.

| 국가    | 최소한 다뤄야 할 것                                                          |
| ------- | ---------------------------------------------------------------------------- |
| japan   | 소비세(경감세율), 전자장부보존법, 청구서등보존방식(인보이스 제도), 결산 관행 |
| china   | 增值税(VAT)와 Golden Tax(金税) 연동, Fapiao, 현지 회계기준(CAS)              |
| usa     | Sales & Use Tax(주별), 1099, GAAP, SOX                                       |
| vietnam | VAT, 전자 인보이스(hóa đơn điện tử), 현지 회계기준(VAS)                      |

> ⚠️ **확실하지 않은 규정·기한·세율을 지어내지 마세요.** 이 저장소의 원칙은
> "과소 등록이 과잉 등록보다 낫다"입니다. 확신이 없으면 항목을 비우고
> "확인 필요"로 남기세요. 틀린 세율 하나가 제품 신뢰를 깨뜨립니다.

---

## 작업 3 — gold-set 58 → 90 (symptom 전수)

1차와 같은 규칙입니다. `expected.primary_root_cause` 는 반드시 해당 symptom 의
`typical_causes` **첫 항목**에서 파생하고, 새로 지어내지 않습니다.
`must_tcodes` 가 `data/tcodes.yaml` 에 없으면 T-code 를 먼저 등록하거나 그 케이스를
넣지 않습니다.

모듈 분포가 편중되지 않도록 커버리지가 낮은 모듈을 우선하세요.

검증: `./scripts/check-eval-goldset.sh --strict`

---

## 작업 4 — docs/industry/ 4개 보강

`manufacturing.md`(497) · `retail.md`(702) · `financial-services.md`(859)에 비해
아래가 얇습니다. 1차에서 `industry-matrix.yaml` 에 이 4개 업종을 추가했으니,
근거 문서도 그 수준을 갖춰야 합니다.

| 파일                             | 현재 |
| -------------------------------- | ---- |
| `docs/industry/healthcare.md`    | 137  |
| `docs/industry/automotive.md`    | 139  |
| `docs/industry/chemicals.md`     | 143  |
| `docs/industry/public-sector.md` | 159  |

`industry-matrix.yaml` 에 적은 모듈 중요도와 **서로 모순되지 않게** 쓰세요.

---

## 작업 5 — 적대적 검증 2차 (Codex 산출물)

Codex 가 2차로 SKILL.md 5종(ibp/sd/co/pp/tr)을 보강하고 `plugin.json` 23개를
만듭니다. 1차와 같은 기준으로 검증하되, 이번엔 **plugin.json 을 특히 보세요.**

- `depends_on` / `reuses_agents` 에 적힌 값이 실제 SKILL.md 본문의 라우팅 서술에서
  확인되는가? 지어낸 의존성은 없는가?
- `marketplace.json` 과 중복된 필드를 만들지 않았는가? (단일 출처 원칙)
- 24개 plugin.json 의 스키마가 실제로 일관된가?

발견한 것은 **고치지 말고 보고만** 하세요 (`plugins/` 는 Codex 소유).

---

## 절대 금지

1. ⛔ 불확실한 T-code·SAP Note·세율·법정 기한을 등록하지 마세요
2. ⛔ gold-set 정답을 창작하지 마세요 (symptom-index 에서만 파생)
3. ⛔ 한국 내용을 번역해 다른 국가 문서로 쓰지 마세요
4. ⛔ `agents/`, `plugins/`, `mcp/`, `packages/`, `.github/`, `apps/`, `extension/`, `web/` 편집 금지
5. ⛔ 게이트가 실패하는 상태로 보고하지 마세요

---

## 완료 보고 형식 (필수)

```
## EVIDENCE

### 변경 파일
- data/symptom-index.yaml : zh 26→90, ja 27→90, de 26→90, vi 23→90
- (전부 나열)

### 게이트 실행 결과
$ ./scripts/check-eval-goldset.sh --strict
$ ./scripts/check-translation-parity.sh --strict
$ ./scripts/check-tcodes.sh --strict
$ node scripts/check-doc-stats.mjs
(각각 실제 출력)

### 번역 신뢰도 자기평가
| 언어 | 추가 건수 | SAP 공식 용어 확신도 | 검수 필요 항목 |
|---|---|---|---|
(확신 없는 항목을 정직하게 표시하세요. "전부 확신"은 믿지 않습니다)

### 신규 gold-set 32건 — 정답 출처
| eval id | symptom_ref | typical_causes[0] 출처 위치 |
(출처를 못 대는 항목은 제거하세요)

### country 문서에서 "확인 필요"로 남긴 것
- (지어내지 않고 비워 둔 항목. 이게 있는 편이 정상입니다)

### 적대적 검증 결과 (Codex 2차 산출물)
| 파일 | 줄 | 문제 | 심각도 | 근거 |
```
