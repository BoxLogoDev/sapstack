# sapstack Golden Path — 진단 워크플로

> sapstack 의 "하나의 길". 흩어진 24 플러그인 · 20 에이전트 · 22 커맨드를 **언제 무엇을 쓰는지**
> 하나의 서사로 묶는다. gstack 의 Golden Path(plan→ship→canary) 에 대응하는, sapstack 의
> *end user 진단 여정* 이다.
>
> 철학적 배경은 [`gstack-gap-analysis.md`](gstack-gap-analysis.md) 와 [`../ETHOS.md`](../ETHOS.md),
> 모드 선택 규칙은 루트 [`CLAUDE.md`](../CLAUDE.md) 참조.

---

## 0. 두 갈래로 시작한다 — 모드 선택

sapstack 의 모든 응답은 두 모드 중 하나로 흐른다. **질문의 성격**이 모드를 정한다 (사용자 플래그 아님).

| 신호 | 모드 | 형식 |
|---|---|---|
| 단발성 사실 질문 ("FB01 이 뭐죠?", "GL 라인아이템 테이블은?") | **Quick Advisory** | Issue → Root Cause → Check(T-code+테이블) → Fix → Prevention → SAP Note |
| "이거 깨졌어요, 진단 도와줘요" / 교차모듈 변경영향 / 기간마감 조사 | **Evidence Loop** | Turn1 INTAKE → Turn2 HYPOTHESIS+증거요청 → Turn3 COLLECT → Turn4 VERIFY+Fix+Rollback |

> 애매하면 **Evidence Loop**. 몇 턴 더 들지만 "자신만만하게 틀린 조언"을 막는다. (gstack ETHOS §User Sovereignty / Evidence over confidence)

---

## 1. The Golden Path (end user 진단 여정)

```
   ┌─ 단발 질문 ──────────────► Quick Advisory ─► 답변 + SAP Note 포인터
   │
시작┤
   │                            ┌─ Turn 1: INTAKE ─ 증상·환경 수집
   └─ 장애/조사 ─► Evidence Loop┤  Turn 2: HYPOTHESIS ─ 가설 + falsification 기준 + 증거 요청
                                │  Turn 3: COLLECT ─ (현업이 T-code 실행해 증거 수집)
                                └─ Turn 4: VERIFY ─ 가설 검증 → Fix + Rollback 계획 + close
```

각 단계의 원칙:
- **INTAKE**: 답하기 전에 환경부터. ECC(EhP?)/S4(릴리스?)·온프렘/RISE/Cloud PE·업종. (Universal Rule #2)
- **HYPOTHESIS**: 가설마다 *반증 기준* 명시 — "X 가 원인이면 SE16N 으로 Y 테이블에 Z 가 보여야 한다".
- **COLLECT**: 현업이 T-code/테이블 조회로 증거 수집. 세션 상태는 `.sapstack/sessions/{id}/state.yaml` 에 직렬화(재개·감사 가능).
- **VERIFY**: 확인된 fix 는 반드시 **rollback 계획**과 함께. 프로덕션 직접 변경 금지, 시뮬레이션·트랜스포트 우선. (Universal Rules #4·#5)

---

## 2. 진입점 라우팅 — 상황 → 무엇을 쓰나

### 모듈별 상담 (에이전트 20종)
증상이 한 모듈에 속하면 해당 consultant 에이전트로:

| 영역 | 에이전트 |
|---|---|
| 재무/관리 | `sap-fi-consultant` · `sap-co-consultant` · `sap-tr-consultant` |
| 물류 | `sap-mm-consultant` · `sap-sd-consultant` · `sap-pp-consultant` · `sap-pm-consultant` · `sap-qm-consultant` · `sap-ewm-consultant` |
| 인사 | `sap-hcm-consultant` |
| 기술/이행 | `sap-abap-developer` · `sap-basis-consultant` · `sap-s4-migration-advisor` |
| 클라우드/통합 | `sap-cloud-consultant` · `sap-integration-advisor` · `sap-integration-cloud-consultant` · `sap-ariba-consultant` · `sap-ibp-consultant` · `sap-sac-consultant` |
| 입문/교육 | `sap-tutor` (초보자 질문 → 모듈 전문가에 위임 후 쉬운 말로 번역) |

### 증상별 진단 커맨드 (22종)
재현되는 증상이 있으면 전용 커맨드로 바로:

| 상황 | 커맨드 |
|---|---|
| 기간 마감 | `/sap-fi-closing` · `/sap-quarter-close` · `/sap-year-end` |
| 전표/지급 | `/sap-migo-debug` · `/sap-payment-run-debug` · `/sap-korean-tax-invoice-debug` |
| 이행/이관 | `/sap-s4-readiness` · `/sap-transport-debug` |
| 코드/설정 | `/sap-abap-review` · `/sap-img-guide` · `/sap-master-data-check` · `/sap-performance-check` |
| 모듈별 | `/sap-pm-diagnosis` · `/sap-qm-inspection` · `/sap-bp-review` · `/sap-ariba-pr2po-check` · `/sap-cpi-iflow-debug` · `/sap-ibp-forecast-debug` · `/sap-sac-story-review` |
| Evidence Loop 수동 제어 | `/sap-session-start` · `/sap-session-add-evidence` · `/sap-session-next-turn` |

### 지식 데이터 (직접 조회)
- **T-code 검증**: `data/tcodes.yaml` (361개) · **SAP Note 포인터**: `data/sap-notes.yaml` (112건, `resolve-note.sh`)
- **증상 인덱스**: `data/symptom-index.yaml` (다국어) · **현장 용어**: `data/synonyms.yaml`

---

## 3. 어디서 막히면 어디로 — 폴백 사다리

1. 단발 질문인데 답이 불확실 → **Evidence Loop 로 승격** (가설 1개 이상이면 항상)
2. 모듈을 모르겠다 → `sap-tutor` 로 시작 (분류 후 전문가 위임)
3. IMG 설정 문제로 의심 → `/sap-img-guide` (SPRO 경로 + ECC/S4 차이)
4. 한국 특화(전자세금계산서 등) → `/sap-korean-tax-invoice-debug` + `data/sap-notes.yaml` korea 카테고리

---

## 4. 메인테이너 Golden Path (기여 → 릴리스)

end user 여정과 별개로, 프로젝트를 키우는 길:

```
기여 작성 ─► 품질 게이트(로컬, CI 동일 플래그) ─► PR ─► CI 그린 ─► 머지 ─► 버전 bump ─► 릴리스
```

- **품질 게이트(필수, push 전 로컬 전수)**: `ci.yml` 의 `run:` 스텝을 그대로 추출해 *동일 플래그*로 실행.
  핵심: `--strict` 누락 금지(non-strict 는 warning-only 라 거짓 통과), 버전 bump 후 `build-multi-ai.sh --write` 필수.
- **데이터 기여(SAP Note/KBA)**: `userapps.support.sap.com` 등 **공개 페이지에서 번호+제목 직접 확인한 것만** 등록.
  추측 등록 금지 (`data/sap-notes.yaml` 헤더 룰 / ground-truth).
- 상세: [`maintainer-setup.md`](maintainer-setup.md) · [`reusable-ci.md`](reusable-ci.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md)

---

## 5. 한 장 요약

| 당신이 원하는 것 | 가는 길 |
|---|---|
| 빠른 사실 답 | Quick Advisory (그냥 물어보기) |
| 장애 진단 | Evidence Loop → 모듈 consultant / 증상 커맨드 |
| 모듈을 모름 | `sap-tutor` |
| 설정(IMG) 문제 | `/sap-img-guide` |
| 기간 마감 | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |
| 프로젝트에 기여 | 메인테이너 Golden Path (§4) |

> 흩어진 도구가 아니라 *하나의 길*이다. 막히면 한 단계 위(Evidence Loop)로, 모르면 `sap-tutor` 로.
