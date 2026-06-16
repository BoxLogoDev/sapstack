# sapstack vs gstack — 완성도 갭 분석

> 목적: sapstack 을 **gstack (Garry Tan's Stack) 수준의 "완성도 있는 제품"** 으로 끌어올리기 위한
> 구조적 갭 분석. gstack 의 기능을 1:1 복사하는 문서가 아니라, gstack 이 잘하는 **완성도 규율
> (completeness disciplines)** 을 sapstack 의 도메인으로 번역해 적용하기 위한 진단·로드맵.

---

## 0. 전제 — 두 프로젝트는 "종류"가 다르다

| | gstack | sapstack |
|---|---|---|
| 본질 | 개발 워크플로 **메타 툴링** (소프트웨어를 만드는 스킬 모음) | SAP 운영 **도메인 지식 제품** (현업 end user 가 쓰는 지식) |
| 사용자 | 빌더/개발자 | MES/QMS/PMS/SAP ERP 현업 운영자 (비개발자) |
| 산출물 | plan/ship/qa/canary 등 워크플로 스킬 | 24 플러그인 · 20 에이전트 · 22 커맨드 · 지식 데이터(tcodes/notes/symptom) |
| "완성도"의 의미 | 빌드 라이프사이클을 끝까지 자동화 | 진단 라이프사이클을 끝까지 신뢰성 있게 안내 |

따라서 결론은 **"gstack 기능을 베끼자"가 아니다.** gstack 의 *완성도를 만드는 7가지 규율*을 식별하고,
그중 sapstack 도메인에 가치 있는 것만 골라 번역한다. (gstack ETHOS §"Search Before Building" 적용:
이미 검증된 패턴을 이해하고, 우리 문제에 맞게 1차 원리로 재적용)

---

## 1. gstack 의 완성도를 만드는 7가지 규율

ETHOS.md · CLAUDE.md · ARCHITECTURE.md 정독으로 추출한, gstack 을 "완성된 제품"으로 느끼게 하는 축:

1. **ETHOS (명시적 빌더 철학)** — Boil the Ocean / Search Before Building / User Sovereignty 를
   *모든 스킬 preamble 에 자동 주입*. 일관된 판단 기준이 제품 전체에 흐름.
2. **Golden Path (단일 워크플로 서사)** — office-hours → plan-{ceo,eng,design} → autoplan → build →
   review → qa → ship → land-and-deploy → canary → retro → document-release. 흩어진 스킬이 아니라
   *하나의 길*로 연결.
3. **생성 단일출처 (template → generated)** — `SKILL.md.tmpl` → `gen-skill-docs` 로 문서를 생성.
   드리프트 0. (sapstack 의 `build-multi-ai.sh` 와 같은 발상.)
4. **온보딩/셋업 (`./setup`)** — 한 명령으로 빌드 + 심링크 + 멀티호스트(claude/cursor/kiro/...) 설치.
5. **2-tier 품질 (gate/periodic + LLM-judge + E2E)** — 정적 검증(무료) + 품질 eval(유료, diff 기반).
6. **업그레이드 마이그레이션 (`/gstack-upgrade` + migrations/)** — 설치본 구조 변경을 안전하게 이행.
7. **결정 메모리 (`decisions.jsonl` 이벤트 소싱)** — 세션을 넘어 "왜 그렇게 정했나"를 보존.

---

## 2. 차원별 갭 매트릭스

| # | 완성도 차원 | gstack | sapstack (현재) | 갭 | 채택 우선순위 |
|---|---|---|---|---|---|
| 1 | **ETHOS / 철학 단일출처** | `ETHOS.md` 전 스킬 주입 | `CLAUDE.md` Universal Rules 존재하나 별도 ETHOS 문서·주입 메커니즘 없음 | 철학이 규칙으로만 흩어져 있음 | **High** (저비용·고효과) |
| 2 | **Golden Path 서사** | README+스킬이 하나의 파이프라인으로 안내 | 22 커맨드/20 에이전트 존재하나 "어떤 순서로 쓰나"가 문서화 안 됨 | end user 가 진입점을 모름 | **High** |
| 3 | **모드 선택 가이드** | 스킬 라우팅 규칙 명시 | CLAUDE.md 에 Quick Advisory vs Evidence Loop 규칙 있음 (양호) | 사용자 대면 문서로는 노출 약함 | **High** (이미 있음, 표면화만) |
| 4 | **생성 단일출처** | `gen-skill-docs` (전 SKILL.md) | `build-multi-ai.sh` (AI 호환 레이어만) | quick-guide/SKILL 은 수작성 | Medium |
| 5 | **온보딩/셋업** | `./setup` 멀티호스트 | Claude Code 마켓플레이스 설치 + `.sapstack/config.yaml` | 비개발자 대상 "5분 시작" 동선 약함 | Medium |
| 6 | **품질 eval (LLM-judge)** | 답변 품질을 LLM-judge/E2E 로 측정 | 정적 게이트(lint/check 14종)만. 답변 *품질* 측정 없음 | "진단이 실제로 맞나"의 회귀 방지 부재 | Medium |
| 7 | **업그레이드 마이그레이션** | `/gstack-upgrade` + migrations | 없음 (마켓플레이스 재설치) | config/데이터 스키마 변경 시 이행 경로 없음 | Low |
| 8 | **결정 메모리** | `decisions.jsonl` | `.sapstack/sessions/*` (Evidence Loop 세션) | 진단 세션은 저장되나 "설정 결정"의 이유는 미보존 | Low |
| 9 | **헬스 대시보드** | `skill:check` | `check-*.sh` 14종 + `hook-health` | 사용자용 통합 대시보드 부재 | Low |
| 10 | **버전/CHANGELOG 규율** | branch-scoped + release-summary 포맷 | `bump-version.sh` + CHANGELOG (양호) | release-summary 표준 포맷 미적용 | Low |

---

## 3. 우선순위 채택 로드맵 (roadmap.md 와 정합)

### 즉시 (이번 사이클 — 저비용·고효과, 문서 중심)
- **G1. `ETHOS.md` 신설** — sapstack 빌더 철학을 단일 문서로. 핵심 4원칙:
  ① **Ground-truth 우선** (추측 등록 금지, 검증된 것만 — sap-notes 룰),
  ② **No hardcoding** (회사코드/계정/조직 단위 동적화 — Universal Rule #1),
  ③ **ECC ≠ S/4 명시** (릴리스 차이 항상 구분),
  ④ **Evidence over confidence** (단정보다 falsification — Evidence Loop).
- **G2. `docs/workflow.md` (Golden Path)** — end user 진단 여정 + 진입점 라우팅 표. *(본 PR 동봉)*
- **G3. README 6종 Golden Path 표** — "어떤 상황 → 어떤 진입점" 1-표. *(본 PR 동봉)*

### 다음 (v2.4 — roadmap.md "Knowledge Depth + Learning Loop"와 합류)
- **G4. 답변 품질 eval (LLM-judge)** — 대표 증상 N건에 대해 "에이전트 진단이 ground-truth 와 일치하는가"를
  주기적으로 측정. Learning Loop 의 "가설 정확도 메트릭"과 직접 연결.
- **G5. quick-guide 생성 단일출처화** — `build-multi-ai.sh` 패턴을 quick-guide 로 확장 검토 (드리프트 제거).

### vNext / Vision (roadmap.md)
- **G6. 셋업 동선 강화** — 비개발자용 "5분 시작" + 멀티호스트 (Web UI/PWA 와 합류).
- **G7. 업그레이드 마이그레이션 + 결정 메모리** — 데이터/스키마 진화가 잦아지면 도입.

---

## 4. 명시적 Non-goals — gstack 에서 **베끼지 않을** 것

gstack 은 빌더 메타툴이라 가진 기능 중 sapstack 에 부적합한 것:

- ❌ **헤드리스 브라우저/디자인 바이너리 (browse, design)** — sapstack 은 시각 산출물 제품이 아님.
- ❌ **slop-scan (AI 코드 품질)** — sapstack 은 주로 markdown/data, 대규모 TS 코드베이스 아님.
- ❌ **유료 E2E 평가 풀세트 (~$4/run)** — 도메인 답변 품질은 가벼운 LLM-judge 샘플로 충분, 풀 E2E 과함.
- ❌ **Garry 보이스/프로모션 자산** — sapstack 은 한국어 SaaS 라이팅 톤(해요체) 가 자체 표준.
- ❌ **gstack 기능 흉내내기 자체** — 완성도는 *규율*에서 오지 기능 수에서 오지 않음 (ETHOS §"Build for Yourself").

---

## 5. 한 줄 요약

> sapstack 은 이미 풍부한 *자산*(24 플러그인·20 에이전트·112 노트·6 언어)을 가졌다.
> 빠진 것은 그것들을 **하나의 길로 묶는 서사(Golden Path)와 철학(ETHOS)** 이다.
> gstack 이 가르쳐주는 건 기능이 아니라 *완성의 규율* — 그중 G1~G3 은 문서만으로 즉시 달성 가능하다.

---

관련 문서: [`workflow.md`](workflow.md) (Golden Path) · [`roadmap.md`](roadmap.md) · [`architecture.md`](architecture.md) · 루트 [`CLAUDE.md`](../CLAUDE.md) (Universal Rules / 모드 선택)
