# Codex 2차 지시서 — 지식 자산 심화 + 플러그인 메타 표준화

> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`
> 소유 디렉토리: **`agents/`, `plugins/`** (1차와 동일)

---

## 1차 결과 — 수용됐습니다

SKILL.md 4종을 97~~143줄에서 541~~650줄로 올린 작업, 오케스트레이터가 게이트로
재검증하고 커밋했습니다(`51012e4`).

```
lint-frontmatter            0 오류 (66 파일)
check-hardcoding --strict   0 오류 (457 파일)
check-ecc-s4-split --strict 0 누락 (24 SKILL)
check-tcodes --strict       404개 확정, 미등록 0건   ← 2,632줄을 쓰면서 지어낸 T-code 0건
```

특히 마지막 항목이 좋았습니다. 그리고 당신이 제안한 다음 배치 순서
(`sap-ibp → sap-sd → sap-co → sap-pp → sap-tr`)를 그대로 채택합니다.

---

## 실행 모드 — 자율 반복

```
GOAL
  (a) 다음 5종을 1차와 같은 수준으로 올린다
  (b) 플러그인 메타 구조를 표준화한다 — 지금 24개 중 1개만 plugin.json 이 있다

성공 기준 (측정 가능 — 전부 충족해야 완료)
  1. SKILL.md 5종이 각각 400줄 이상 + 캐논 구조 충족
       sap-ibp 158 / sap-sd 176 / sap-co 179 / sap-pp 188 / sap-tr 194  ← 현재
  2. plugin.json 이 24개 플러그인 전부에 존재하고 스키마가 일관됨
  3. 에이전트 frontmatter 2계열 문제에 결론을 내고 통일 (근거 명시)
  4. ./scripts/lint-frontmatter.sh            0 오류
  5. ./scripts/check-tcodes.sh --strict       미등록 0건
  6. ./scripts/check-hardcoding.sh --strict   0 오류
  7. ./scripts/check-ecc-s4-split.sh --strict 0 누락
  8. ./scripts/check-marketplace.sh           0 오류

자율 루프
  ① 대상 하나 선택 → ② 기준 샘플 확인 → ③ 작성 → ④ 게이트 실행
  → ⑤ 실패하면 ③으로, 통과할 때까지 → ⑥ 다음 대상

중단 조건
  - 같은 게이트가 3회 연속 실패
  - SAP 사실관계를 확신할 수 없어 추측하게 될 때
  - 설계 결정이 필요한데 근거가 저장소에 없을 때 (작업 2가 여기 해당될 수 있음)
```

---

## 작업 1 — SKILL.md 5종 심화 (우선순위 순)

| 순위 | 파일                           | 현재 | 특히 채울 것                                                                                                                                                                              |
| ---- | ------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `plugins/sap-ibp/.../SKILL.md` | 158  | **가장 비대칭.** 에이전트는 1차에서 326줄이 됐는데 SKILL 이 158줄이다. Demand Sensing·S&OP·Supply·Inventory·Response·Control Tower 6축, S/4 연동(MD63 PIR → MD04), CPI-DS/RTI 데이터 통합 |
| 2    | `plugins/sap-sd/.../SKILL.md`  | 176  | 가격결정 조건기술(V/06, VK11) 진단 순서, 납품/출고(VL01N·VL02N), 출력 제어(NACE → VF03), 신용관리 블록                                                                                    |
| 3    | `plugins/sap-co/.../SKILL.md`  | 179  | 정산(KO88·CJ88) 실패 경로, CO-PA 가치필드 매핑(KEI1·KEPM), 원가요소 마스터, 배부/분배(KSU5·KSV5)                                                                                          |
| 4    | `plugins/sap-pp/.../SKILL.md`  | 188  | MRP 예외 메시지 해석, 확인(CO11N) 실패와 ATP(CO09), COGI 자동 전기, 능력 소요(CM01)                                                                                                       |
| 5    | `plugins/sap-tr/.../SKILL.md`  | 194  | 은행명세서(FF_5·FEBAN) 매칭 실패, 지급 제안(F110) 연계, 하우스뱅크·계정 결정                                                                                                              |

기준 샘플은 1차와 같습니다 — `plugins/sap-qm/.../SKILL.md`(1,101줄).
**분량을 채우기 위한 빈말은 넣지 마세요.** 실제 진단에 쓰이는 내용만 씁니다.

---

## 작업 2 — plugin.json 표준화 (설계 판단 포함)

현재 **24개 중 `sap-session` 하나만** `.claude-plugin/plugin.json` 을 갖고 있습니다.
나머지 23개는 루트 `.claude-plugin/marketplace.json` 의 인라인 엔트리에만 메타가
있어서, 플러그인별 정보(의존성·재사용 에이전트·성숙도)를 표현할 자리가 없습니다.

### 먼저 판단할 것 (작성 전에)

1. `plugins/sap-session/.claude-plugin/plugin.json` 을 읽고 어떤 필드를 쓰는지 파악
   (`depends_on`, `reuses_agents`, `schemas`, `design_principles`, `stage` 등)
2. 루트 `marketplace.json` 엔트리와 **중복되는 필드가 무엇인지** 확인
   (id / name / version / description / path / keywords / compatibility)
3. **중복은 만들지 마세요.** marketplace.json 이 이미 갖고 있는 것은 plugin.json 에
   다시 쓰지 않습니다. 단일 출처 원칙이 이 저장소의 규율입니다.
4. 그 결과로 **최소 스키마를 제안**하세요. 무엇을 넣고 무엇을 뺐는지 근거와 함께.

### 그다음 작성

23개 플러그인에 일관된 `plugin.json` 을 만듭니다. 값을 지어내지 마세요 —
`depends_on` 이나 `reuses_agents` 는 실제 SKILL.md 본문의 라우팅 서술에서
확인되는 것만 씁니다. 확인되지 않으면 필드를 비우거나 생략합니다.

> ⚠️ `sap-session/plugin.json` 에는 `reuses_agents` 9개가 선언돼 있는데 SKILL.md
> 본문은 16개 에이전트를 매핑합니다. **불일치가 이미 존재합니다.** 어느 쪽이
> 맞는지 확인해 정정하고, 그 경위를 보고서에 적으세요.

검증: `./scripts/check-marketplace.sh`

---

## 작업 3 — 에이전트 frontmatter 2계열 통일

20개 에이전트가 두 계열로 갈라져 있습니다.

| 계열     | 개수 | 특징                                                                   |
| -------- | ---- | ---------------------------------------------------------------------- |
| A (구형) | 16   | `tools: Read, Grep, Glob` 있음, `model: sonnet`, description 1줄       |
| B (신형) | 4    | `tools` **없음**, `model: opus`, description 블록 스칼라 + 영문 트리거 |

계열 B는 `sap-ariba` / `sap-sac` / `sap-ibp` / `sap-integration-cloud` 입니다.

### 판단 후 통일

- `docs/architecture.md` 는 린트가 "name/description/tools 존재"를 검사한다고 적고
  있는데, 계열 B는 `tools` 가 없는데도 `lint-frontmatter.sh` 를 통과합니다.
  **문서와 실제 중 어느 쪽이 맞는지** 스크립트를 읽고 확인하세요.
- `model` 이 sonnet 과 opus 로 갈린 것에 의도가 있는지, 아니면 작성 시점 차이인지
  판단하세요. 근거가 없으면 "근거 없음"이라고 보고하고 임의로 바꾸지 마세요.
- 통일 방향을 정했으면 적용하고, 정하지 못했으면 **표로 차이만 정리해 보고**하세요.
  근거 없는 일괄 변경보다 근거 있는 보류가 낫습니다.

---

## 절대 금지

1. ⛔ `data/eval/gold-set.yaml` 을 열어 정답을 보고 맞추지 마세요. 시험지입니다.
2. ⛔ 불확실한 T-code·SAP Note 번호를 지어내지 마세요. 모르면 "확인 필요".
3. ⛔ `data/`, `docs/`, `mcp/`, `packages/`, `.github/`, `apps/`, `extension/`, `web/` 편집 금지
4. ⛔ 파일 통째 재작성 금지 — 기존 내용 보존하고 추가·보강
5. ⛔ marketplace.json 과 중복되는 메타를 plugin.json 에 복제하지 마세요

---

## 완료 보고 형식 (필수)

```
## EVIDENCE

### 변경 파일
- plugins/sap-ibp/.../SKILL.md : 158 → NNN줄
- (전부 나열)

### 게이트 실행 결과
$ ./scripts/lint-frontmatter.sh
$ ./scripts/check-tcodes.sh --strict
$ ./scripts/check-hardcoding.sh --strict
$ ./scripts/check-ecc-s4-split.sh --strict
$ ./scripts/check-marketplace.sh
(각각 실제 출력)

### plugin.json 스키마 제안
- 채택한 필드와 근거
- marketplace.json 과 중복이라 뺀 필드
- sap-session 의 reuses_agents 9 vs SKILL.md 16 불일치 조사 결과

### frontmatter 2계열 판단
- 결론(통일 / 보류)과 근거

### 새로 등장한 T-code
- (data/tcodes.yaml 에 없는 것. 등록은 Grok 담당이니 목록만)

### 확신하지 못한 부분
- (비어 있으면 오히려 의심합니다)
```
