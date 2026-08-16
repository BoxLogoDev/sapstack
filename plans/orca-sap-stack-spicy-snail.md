# sapstack 고도화 — 제품 패키지화 + 온디바이스 AI 내장

## Context

### 왜 지금인가 — 시장의 문이 열려 있고, 닫히는 중이다

sapstack을 **독립 제품 패키지**로 만들고 **자체 AI를 내장**하려는 이유는 취향이 아니라 시장 구조 때문이다.

**1. SAP가 스스로 시장을 비워뒀다.** SAP Joule은 RISE / GROW 계약 고객 전용이다. 클래식 온프레미스 S/4HANA와 ECC 고객은 네이티브 Joule 접근이 **전혀 없다**. 온프레에서 켜려면 유지보수 지출의 50% 이상을 클라우드로 옮겨야 한다는 조건이 붙는다.

**2. 그 자리에 남은 고객이 매우 많다.**

- ECC 6.0 EhP 0~5 메인스트림 유지보수: **2026년 12월 31일 종료** (약 4개월 남음)
- EhP 6~8: 2027년 12월 31일, 연장 유지보수 2030
- ECC 고객 35,000곳 중 S/4 전환 라이선스 구매는 39%(약 14,000곳)뿐
- Gartner: 2027년에도 **17,000곳 ECC 잔류**, 2030년에도 13,000곳 이상

**3. 이들이 정확히 폐쇄망 고객이다.** ECC에 남은 제조·금융·공공은 대개 망분리다. 외부 API가 보안 심사에서 막힌다.

> **결론: 온디바이스 AI는 부가기능이 아니라 시장 진입 자격 요건이다.** 클라우드 LLM만 쓰는 경쟁 제품은 문 앞에서 탈락한다.

### 그런데 지금 sapstack은 그 문 앞에서 스스로 막혀 있다

`docs/compliance/air-gapped-deployment.md:597`이 현재 상태를 자백한다.

```
Q: 인터넷이 없으면 Claude AI 기능은?
A: MCP 서버 = 로컬 진단 엔진만 작동. Claude 호출 없음. 대신 규칙 기반 분석.
```

**망분리 = AI 없음.** 가장 중요한 고객에게 가장 약한 제품이 간다. 이 구멍을 메우는 것이 이 계획의 핵심이다.

---

## 현재 상태 — 조사로 확인된 사실

### 규모

v2.4.0 · 2,533 파일 · 24 플러그인 · 20 에이전트 · 23 MCP 툴 · 데이터 자산 9개 YAML 7,733줄 · 문서 70개 17,645줄.

### 발견 1 — 릴리스 파이프라인이 잠겨 있다 ⛔

`release.yml`의 **2번째 스텝**이 eval 품질 게이트다. 현재 커밋된 baseline이 4개 항목 미달이다.

| 지표                 | 현재 (`docs/eval/latest.json`) | 게이트 | 상태 |
| -------------------- | ------------------------------ | ------ | ---- |
| avg_score            | 0.51                           | 0.65   | ❌   |
| root_cause_full_rate | 0.156                          | 0.30   | ❌   |
| avg_tcode_recall     | 0.625                          | 0.75   | ❌   |
| avg_check_coverage   | 0.541                          | 0.65   | ❌   |
| ethos_violations     | 0                              | 0      | ✅   |
| cases_errored        | 0                              | 0      | ✅   |

**지금 `v2.5.0` 태그를 밀면 빌드 시작 전에 릴리스가 실패한다.**

### 발견 2 — 그런데 그 baseline은 이미 낡았다 (재측정이 최우선)

**ground truth 검증 결과:**

- baseline 측정일: **2026-08-10**
- `agents/sap-sac-consultant.md` 마지막 커밋: **2026-05-14**
- 그런데 현재 작업트리에 미커밋 변경 31개가 있고, 그 내용이 **정확히 바닥 케이스를 겨냥**한다

| eval 케이스                        | 점수 | 미커밋 변경                                                                                                                 |
| ---------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| `eval-sac-live-connection-fail`    | 0.00 | `sap-sac-consultant.md` +9줄 — **SICF·SAML2 명시 추가** (= gold 정답)                                                       |
| `eval-ic-cpi-iflow-message-fail`   | 0.00 | `sap-integration-cloud-consultant.md` +9줄 — SXMB_MONI·SRT_MONI 추가                                                        |
| `eval-wm-to-confirmation-error`    | 0.00 | `sap-ewm-consultant.md` +3줄 — LS24·LT06 확인 순서 추가 (WM→EWM 폴백)                                                       |
| `eval-btp-destination-fail`        | 0.06 | `run.mjs` — BTP 라우팅을 `sap-cloud-consultant` → `sap-integration-advisor`로 변경 + `sap-integration-advisor.md` SM59 추가 |
| `eval-pp-order-confirmation-error` | 0.19 | `sap-pp-consultant.md` — MD63·CO09 추가                                                                                     |
| `eval-sd-vf01-billing-incomplete`  | 0.13 | `sap-sd-consultant.md` — NACE→VF03 순서 추가                                                                                |

게다가 `run.mjs`가 채점 조건 자체를 개선했다 — **CLAUDE.md(Universal Rules)를 system 프롬프트에 포함**하고, **env를 user 프롬프트에 주입해 "환경 질문에서 멈추지 말라"고 지시**한다. 이전 baseline은 에이전트 본문만 주고 측정한 값이다.

> **즉 0.51은 stale이다. 첫 번째 할 일은 새 기능 개발이 아니라 재측정이다.**

### 발견 3 — 온디바이스는 이미 80% 구현돼 있다 ✅

이것이 가장 중요한 발견이다. 새로 만들 것이 거의 없다.

```ts
// packages/shared/src/config/llm-connections.ts:52
export type LlmProviderType =
  | "anthropic" // api.anthropic.com 직접
  | "pi" // Pi 통합 API
  | "pi_compat"; // Pi + 커스텀 엔드포인트 (Ollama, self-hosted)
```

- `customEndpoint: { api: 'openai-completions' }` 경로가 **1급 시민**으로 구현됨
- **전용 온보딩 화면 `LocalModelStep.tsx`가 이미 존재**하고 기본값이 `http://localhost:11434` / `qwen3-coder`
- `resolveCustomEndpointApiKey()`가 loopback URL이면 `'not-needed'` 반환 — 키리스 로컬 서버 처리 완료
- macOS `NSLocalNetworkUsageDescription`까지 준비됨
- `SapGoldenPath.tsx`는 지식 IPC로 프롬프트를 **조립만** 하고 추론은 세션에 넘김 → **프로바이더를 바꿔도 그대로 동작**

| 시나리오                                           | 난이도 | 상태                                                                                    |
| -------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| A. 사용자가 Ollama 별도 설치 → 앱이 localhost 접속 | ★☆☆☆☆  | **이미 완료**                                                                           |
| B. 추론 서버 바이너리를 앱에 번들 + 자동 기동      | ★★★☆☆  | **이번 계획의 목표.** bun·uv·claude-binary를 이미 같은 방식으로 번들 중이라 패턴 확립됨 |
| C. `node-llama-cpp` in-process 추론                | ★★★★☆  | 신규 ProviderDriver+Agent 클래스 필요. 하지 않음                                        |
| D. GGUF 가중치를 설치 파일에 포함                  | ★★★★★  | 4~8GB. 별도 "모델 팩"으로 분리                                                          |

**B 시나리오는 3개 파일만 손대면 된다.** `shared/`, `pi-agent-server/`, `factory.ts`는 무수정.

### 발견 4 — 데스크톱은 배포 불가 상태

| 항목                  | 상태                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| electron-builder 설정 | ✅ 있음 (win nsis+portable, mac dmg+zip, linux AppImage)                         |
| 자동 업데이트 채널    | ✅ 설계됨 (`publish: generic` → `boxlogodev.github.io/sapstack/electron/latest`) |
| 릴리스 워크플로 연결  | ❌ **전무** — `electron:dist:*`를 호출하는 워크플로가 없음                       |
| 코드 서명·공증        | ❌ 없음                                                                          |
| 버전 체계             | ❌ `bump-version.sh` 대상 밖. 홀로 `3.0.0-beta.0`                                |
| CI 테스트             | ❌ 테스트 370개가 있는데 typecheck만 돎                                          |
| 문서                  | ❌ README·CHANGELOG 어디에도 없음                                                |
| `scripts/release.ts`  | ❌ package.json이 참조하는데 **파일이 없음**                                     |
| 자체 워크플로         | ❌ `apps/desktop/.github/`에 있어 GitHub이 읽지 않음 (유물)                      |

### 발견 5 — 라이선스가 둘로 갈려 있다

- 루트: **MIT** (`Copyright (c) 2026 BoxLogoDev`)
- `apps/desktop`: **Apache-2.0** — craft-agents-oss v0.11.2 파생 (`NOTICE`·`UPSTREAM.md`에 provenance 기록)

BSL 전환 시 **Apache-2.0 파생부는 고지 의무가 계속 따라온다.** 데스크톱 산출물에 원본 LICENSE/NOTICE를 유지해야 한다.

### 그 외 확인된 갭

- `learning.ts`(신규, untracked)가 런타임에 붙었으나 **MCP 툴로 노출 안 됨** — 파이프라인 종단 없음
- 테스트 3개가 **실행되지 않음**: `mcp/tests/expanded-tools`, `mcp/tests/write-path`, `scripts/eval/check-gate.test.mjs`
- `plugin.json`이 24개 중 **1개**(`sap-session`)만 존재
- `industry-matrix.yaml` 3개 업종 vs `docs/industry/` 7개 문서 → 4개 업종 라우팅 불가
- 루트 package.json description 카운트가 실제와 불일치 (20/16/18 vs 24/20/22)
- 루트 lockfile 부재 → 모든 워크플로가 `npm ci --workspaces=false`로 우회 중
- v2.4.0 이후 커밋 12개가 CHANGELOG에 한 줄도 없음
- 루트에 `.pr-body-*.md` 9개 + `.release-notes-*.md` 6개 잔재

---

## 목표 아키텍처

### 하나의 코어, 네 개의 표면

```
                    ┌─────────────────────────────────┐
                    │   지식 자산 (단일 출처)          │
                    │   data/ schemas/ plugins/ agents/│
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────▼────────────────────┐
                    │  @boxlogodev/sapstack-runtime   │
                    │  knowledge · sessions · security │
                    │  learning · catalog · assets     │
                    │  (의존성 2개: ajv, js-yaml)      │
                    └────────────┬────────────────────┘
                                 │
        ┌──────────┬─────────────┼─────────────┬──────────────┐
        ▼          ▼             ▼             ▼              ▼
   Claude Code   MCP 서버    VS Code 확장   Desktop 앱      npm SDK
   플러그인 24   (npm 공개)   (.vsix)      (신규 상용)    (runtime 공개)
   [MIT 유지]   [MIT 유지]   [MIT 유지]    [BSL]          [MIT 유지]
                                             │
                                    ┌────────▼─────────┐
                                    │  추론 백엔드 선택 │
                                    ├──────────────────┤
                                    │ 클라우드: Claude  │
                                    │ 로컬: 번들 서버   │──► Qwen3 8B Q4 (GGUF)
                                    │       (pi_compat) │    BGE-M3 (임베딩)
                                    └──────────────────┘
```

**핵심 판단**: `packages/runtime`은 이미 의존성 2개짜리 순수 엔진이다. SDK화는 `private: true`만 떼면 된다. 네 표면이 하나의 코어를 공유하는 구조는 **이미 완성돼 있다.**

### 온디바이스 설계 — 로컬 LLM에게 무엇을 시킬 것인가

16GB RAM · GPU 없음에서 가능한 것과 불가능한 것.

| 항목      | 현실                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ |
| 모델 상한 | 8B Q4_K_M (약 5~~6GB). 4비트 기준 10억 파라미터당 0.6~~0.75GB                                    |
| 속도      | 최신 CPU+DDR5에서 7B~~14B Q4 기준 10~~25 tok/s. AVX-512 Zen 4/5에서 8B Q4가 10~15 tok/s          |
| 모델      | **Qwen3 8B** (29개 언어 네이티브, **Apache-2.0** → 상용 번들·재배포 가능) / 경량 Qwen3.5 4B      |
| 임베딩    | **BGE-M3** (568M, 100+ 언어, GGUF ~300MB, **MIT**) — dense+sparse+ColBERT 하이브리드를 한 모델로 |

**8B CPU 모델은 SAP 진단 추론을 스스로 해낼 만큼 똑똑하지 않다.** 그러나 sapstack의 가치는 모델 지능이 아니라 축적된 지식 자산과 진단 절차에 있다.

> 로컬 LLM에게 "SAP 전문가 역할"을 시키지 않는다.
> **검색 · 의도분류 · 문장생성**만 시킨다.
> 진단 정확성은 결정론적 룰 엔진(`knowledge.ts`)과 RAG가 책임진다.

업계 합의도 같다 — **파인튜닝은 행동(형식·톤·추론 패턴), RAG는 사실.** 사실을 파인튜닝으로 굽는 것은 취약하다(데이터가 낡고, 환각 탐지가 어렵고, 갱신에 재학습 필요). LoRA는 프롬프트·검색이 먼저 실패한 뒤의 카드다. **이번 범위에 파인튜닝은 없다.**

### 3-티어 성능 등급 (제품 사양으로 명시)

| 등급              | 조건                | 진단 품질                                              | 대상                 |
| ----------------- | ------------------- | ------------------------------------------------------ | -------------------- |
| **Full**          | 클라우드 Claude     | eval 게이트 기준                                       | 인터넷 되는 컨설턴트 |
| **Local**         | 번들 Qwen3 8B + RAG | 지식 조회·증상 매칭·문장 생성은 동등, 복합 추론은 열위 | 폐쇄망 고객          |
| **Offline-Rules** | LLM 없음            | 결정론적 조회만 (현재 망분리 모드)                     | 최저 사양 폴백       |

**Local 등급의 품질을 숫자로 증명해야 한다.** 같은 gold-set 32건을 로컬 모델로 돌려 별도 baseline을 만든다. "폐쇄망에서도 X점"이 영업 자산이 된다.

---

## 3-AI 역할 분담

원칙: **파일 소유권을 겹치지 않게 자른다.** 한 파일은 한 AI만 편집한다. Claude가 오케스트레이터로서 지시서 발급·수용 검증·머지를 담당한다.

| AI                | 역할                           | 소유 디렉토리                                                                          | 왜 이 배치인가                                                                                     |
| ----------------- | ------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Claude** (여기) | 오케스트레이터 + 배포·아키텍처 | `.github/`, `apps/desktop/apps/electron/`, `packages/runtime/`, `mcp/`, 루트 설정 파일 | 코드 구조 변경·CI·패키징은 저장소 전체 맥락이 필요. 세션 컨텍스트를 가진 쪽이 해야 함              |
| **ChatGPT**       | SAP 도메인 지식 보강           | `agents/`, `plugins/`                                                                  | eval 바닥 케이스는 전부 도메인 지식 부족. 병렬 문서 작성에 적합하고, 파일이 독립적이라 충돌이 없음 |
| **Grok**          | 데이터 자산 확장 + 적대적 검증 | `data/`, `docs/`                                                                       | gold-set 확장은 "정답을 지어내면 안 되는" 작업 → 적대적 성향이 유리. 타 AI 산출물 팩트체크도 겸함  |

### 수용 게이트 (필수)

서브 AI의 "완료" 주장은 **EVIDENCE 블록 없이는 무효**다. Claude가 직접 재확인한 것만 머지한다.

- 지식 보강 주장 → `./scripts/eval-diagnosis.sh --module {MOD}` 재측정 결과 첨부
- 데이터 추가 주장 → `./scripts/check-eval-goldset.sh --strict` + `check-tcodes --strict` 통과 출력 첨부
- 확인 불가한 것은 버린다 (과소 채택 > 과잉 채택)

### 각 AI에게 줄 지시서

실행 승인 시 `plans/handoff/` 아래에 3개 파일로 발급한다. 사용자는 해당 파일 내용을 각 AI 창에 붙여넣기만 하면 된다.

- `plans/handoff/chatgpt-domain.md`
- `plans/handoff/grok-data.md`
- `plans/handoff/claude-scope.md` (내 작업 범위 — 사용자 검토용)

---

## 실행 계획

### Phase 0 — 진짜 현재 위치 확인 (1~2일, 최우선)

무엇을 만들기 전에 **stale baseline부터 걷어낸다.**

1. 미커밋 변경 31개를 리뷰 → 논리 단위로 커밋 분리
   - 타입체크·테스트 먼저: `npm run build && npm test`, `bun run --cwd apps/desktop typecheck:*`
2. **eval 전체 재측정**: `./scripts/eval-diagnosis.sh --all --json docs/eval/latest.json`
   - 구독 `claude` CLI 백엔드 사용 → 추가 비용 0
3. 새 숫자로 Phase 1 범위를 확정한다

**이 단계의 산출물이 이후 모든 판단의 근거다.** 재측정 결과에 따라 갈린다.

| 재측정 결과 | 다음 행동                                                                      |
| ----------- | ------------------------------------------------------------------------------ |
| 0.65 이상   | 게이트 통과. 지식 보강은 축소하고 배포에 집중                                  |
| 0.55~0.65   | 바닥 케이스 6건만 집중 보강 → 게이트 재도전                                    |
| 0.55 미만   | 게이트를 **회귀 방지선**으로 재설정(현재값 −0.02)하고, 0.65는 v2.6 목표로 이월 |

> 게이트 임계값을 내리는 것은 후퇴가 아니다. 지금 값은 측정 전에 정한 희망치다. **릴리스를 영구히 막는 게이트는 게이트가 아니라 벽이다.**

### Phase 1 — 출시 가능 상태 만들기 (3~4주)

#### 1-A. 데스크톱 릴리스 파이프라인 (Claude)

| 작업                                                              | 파일                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------- |
| 데스크톱 빌드를 릴리스 워크플로에 연결                            | `.github/workflows/release.yml`                      |
| 3-OS 빌드 job 추가 (win nsis → 우선, mac/linux는 후속)            | 동일                                                 |
| 버전 단일출처에 데스크톱 편입 (`3.0.0-beta.0` → 제품 버전 정렬)   | `scripts/bump-version.sh`                            |
| 죽은 참조 제거 (`scripts/release.ts`), 실행 안 되는 워크플로 제거 | `apps/desktop/package.json`, `apps/desktop/.github/` |
| 데스크톱 테스트 370개를 CI에 편입                                 | `.github/workflows/ci.yml`                           |
| 실행 안 되는 테스트 3개 연결                                      | `mcp/package.json`, `ci.yml`                         |

**코드 서명은 리드타임이 있다.** Windows EV 인증서는 발급에 1~~2주가 걸린다. **승인 즉시 발급 신청부터 해야 한다** — 이것이 1~~2개월 일정의 크리티컬 패스다. 서명 없이 배포하면 SmartScreen 경고가 뜨고, 보안 심사를 통과할 수 없다.

#### 1-B. 도메인 지식 보강 (ChatGPT)

Phase 0 재측정에서 여전히 낮은 케이스만 대상으로 한다. 우선순위는 **점수 × 모듈 중요도**.

- 대상: `agents/sap-{sac,ibp,ariba,integration-cloud}-consultant.md` (현재 81~~94줄, 다른 에이전트는 106~~287줄)
- 대상: `plugins/sap-{sac,ariba,mm,integration-cloud}/skills/*/SKILL.md` (현재 97~143줄, `sap-qm`은 1,101줄)
- 규칙: 기존 캐논 준수 — `핵심 원칙 → 응답 형식 → IMG 라우팅 → 위임 프로토콜 → 전문 영역 → 한국 현장 → 금지 사항`
- **금지: gold-set을 보고 답을 맞추는 것.** 정답 암기가 아니라 도메인 지식을 채운다

#### 1-C. 데이터 자산 확장 (Grok)

- `data/industry-matrix.yaml` 3 → 7개 업종 (automotive/chemicals/healthcare/public-sector — 문서는 이미 있음)
- `data/eval/gold-set.yaml` 32 → 45건 (`symptom-index.yaml`의 `typical_causes` 첫 항목에서만 파생. **추측 정답 생성 금지**)
- stale 문서 정정: `docs/architecture.md`(v1.4.0 수치), `docs/sap-ai-integration.md`(로드맵 v1.8 기준), `gold-set.yaml` 주석
- 루트 package.json description 카운트 정정 (20/16/18 → 24/20/22)

#### 1-D. BSL 전환 준비 (Claude)

- 데스크톱만 BSL, 나머지 표면은 MIT 유지 (마켓플레이스가 기술 영업 채널이므로 유입을 막으면 안 됨)
- `apps/desktop`의 Apache-2.0 고지 의무 유지 — `NOTICE`·원본 LICENSE를 산출물에 포함
- BSL 파라미터 결정 필요: Change Date(통상 4년), Change License(통상 Apache-2.0), Additional Use Grant 범위

### Phase 2 — 온디바이스 (2~3주, Phase 1과 일부 병렬)

이미 80%가 되어 있으므로 남은 일은 **번들링과 품질 증명**이다.

#### 2-A. 추론 서버 번들 (Claude)

```
1. electron-builder.yml → extraResources에 플랫폼별 추론 서버 바이너리 추가
   (기존 bun·uv·claude-binary와 동일 패턴)
2. main 프로세스에 신규 파일 1개 — spawn / health-check / 종료
   (sapstack-runtime.ts의 lazy 싱글턴 패턴 그대로 복제)
3. LocalModelStep 기본값을 번들 서버 포트로 변경
   (기존 handleSubmitLocalModel이 나머지 처리)
```

**모델 가중치는 앱에 넣지 않는다.** 별도 "모델 팩"으로 분리한다 — 이미 설치 파일에 claude 바이너리 ~210MB + bun이 들어 있어 여기에 5GB를 더하면 배포가 무너진다. 폐쇄망은 어차피 USB/보안 파일서버로 반입하므로, **`sapstack-model-pack-{version}.zip` + SHA256 체크섬**이 오히려 기존 반입 절차(`air-gapped-deployment.md`)와 정합한다.

#### 2-B. 알려진 함정 3개 (조사에서 사전 발견)

| 함정                                                                                            | 위치                           | 조치                                  |
| ----------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------- |
| `findSmallModel`이 `'haiku'/'mini'/'flash'` 키워드 하드코딩 → qwen이 안 걸려 마지막 모델로 폴백 | `llm-connections.ts:291`       | 로컬 커넥션일 때 별도 경로            |
| `call_llm` 첨부파일 **하드 차단** (outbound 정책). 로컬 모델에는 논리적으로 불필요              | `llm-tool.ts:96`               | `isLocalConnection()`을 게이트에 물림 |
| `buildCustomEndpointModelDef`가 `reasoning:false`, `maxTokens:8192` 고정                        | `custom-endpoint-models.ts:52` | per-model override로 조정             |

#### 2-C. Local 등급 품질 증명 (Claude + Grok 검증)

- 같은 gold-set을 로컬 모델로 채점 → `docs/eval/latest-local.json`
- `run.mjs`의 provider에 로컬 옵션 추가 (`EVAL_PROVIDER=local`)
- **이 숫자가 폐쇄망 영업의 핵심 자산이다.** 정직하게 낮으면 낮은 대로 공개한다 (ETHOS ②)

#### 2-D. 망분리 문서 갱신 (Grok)

`air-gapped-deployment.md`의 "AI 불가" 서술을 실제 동작으로 교체. 부수적으로 이 문서의 오류도 정정:

- `chmod 777 audit-trail.jsonl` 권장 → 보안상 잘못된 조언
- "SAP 시스템의 로컬 ABAP 런타임 호출" GL 조회 예제 → **실제 아키텍처는 SAP에 붙지 않는다** (명시적 비목표이자 `sap-connector-policy.ts`가 fail-closed로 차단)

### Phase 3 — 마감 (1주)

- CHANGELOG에 v2.4.0 이후 12커밋 + 신규 작업 반영
- 루트 잔재 정리 (`.pr-body-*.md` 9개, `.release-notes-*.md` 6개)
- README에 **단일 진입 서사** 작성 — 현재 설치법 7개가 평행 나열돼 있어 "이 제품이 무엇인지" 가 안 보인다. 데스크톱을 1순위로 올린다
- `learning.ts`를 MCP 툴로 노출 (파이프라인 종단 연결)
- `packages/runtime`의 `private: true` 해제 → SDK 공개

---

## 검증 방법

각 Phase는 **실행 가능한 명령**으로 검증한다. 통과 출력 없이는 완료로 치지 않는다.

```bash
# 코어 (항상)
npm run build && npm test
node --test packages/runtime/tests/runtime.test.ts   # 24/20/22 하드 카운트 + Evidence Loop 4턴

# 콘텐츠 게이트 15종
./scripts/lint-frontmatter.sh
./scripts/check-tcodes.sh --strict
./scripts/check-eval-goldset.sh --strict
node scripts/check-doc-stats.mjs

# 진단 품질 (Phase 0 필수 / 이후 매 보강마다)
./scripts/eval-diagnosis.sh --all --json docs/eval/latest.json
node scripts/eval/check-gate.mjs docs/eval/latest.json

# 배포 아티팩트 (유일하게 실물을 검증하는 경로)
cd mcp && npm run test:pack     # pack → clean install → stdio로 툴 23개 확인

# 데스크톱
bun run --cwd apps/desktop typecheck:shared
bun run --cwd apps/desktop typecheck:electron
bun test --cwd apps/desktop                      # 370개 (현재 CI 미편입)
npm run build:desktop

# 온디바이스 (Phase 2)
# 1) 번들 서버 기동 확인 → 2) 앱에서 Local Model 연결 → 3) 로컬 eval
EVAL_PROVIDER=local ./scripts/eval-diagnosis.sh --all --json docs/eval/latest-local.json
```

**최종 수용 기준 (출시 판정):**

1. `check-gate.mjs`가 통과하거나, 임계값이 근거와 함께 재설정됨
2. Windows 서명된 설치 파일이 생성되고 SmartScreen 경고 없이 설치됨
3. 인터넷을 끊은 상태에서 앱이 켜지고, 로컬 모델로 증상 진단 1건이 끝까지 완료됨
4. `latest-local.json`에 폐쇄망 등급 점수가 기록됨

---

## 리스크

| 리스크                              | 영향                      | 대응                                                          |
| ----------------------------------- | ------------------------- | ------------------------------------------------------------- |
| **코드 서명 리드타임**              | 출시 지연 (크리티컬 패스) | 승인 즉시 EV 인증서 발급 신청. 병렬로 나머지 진행             |
| eval 0.65를 1~2개월에 못 넘김       | 릴리스 영구 차단          | Phase 0 재측정 후 임계값을 회귀 방지선으로 재설정 (근거 기록) |
| 16GB에서 8B가 너무 느려 실사용 불가 | Local 등급 가치 하락      | Qwen3.5 4B 폴백 준비. 기기 사양 감지 후 자동 선택             |
| 데스크톱 1차 포함이 일정을 잡아먹음 | 전체 지연                 | Windows만 1차 출시, mac/linux는 후속. 범위를 OS로 자름        |
| BSL 전환에 대한 커뮤니티 반발       | 평판                      | 데스크톱만 BSL, 나머지 MIT 유지 → 기존 사용자는 영향 없음     |
| 3-AI 병렬 작업 충돌                 | 재작업                    | 파일 소유권 격리 + Claude가 단독 머지. WIP 3~5개 유지         |

---

## 참고 출처

- [SAP Joule 온프레 제약 — innobu](https://www.innobu.com/en/articles/sap-joule-2026-agentic-enterprise-ai.html) · [CIO](https://www.cio.com/article/4170701/saps-ai-offer-to-legacy-customers-comes-with-a-catch.html)
- [ECC 유지보수 종료 — SEIDOR](https://www.seidor.com/en-us/blog/understanding-sap-ecc-deadlines) · [Rimini Street](https://www.riministreet.com/blog/no-extension-to-ecc-support-2027-deadline/)
- [ECC 잔류 고객 수 — SoftwareSeni](https://www.softwareseni.com/what-sap-ecc-end-of-support-actually-means-and-why-17000-companies-are-not-ready/)
- [16GB 로컬 LLM — visionvix](https://visionvix.com/best-llm-for-16gb-ram/) · [CPU-only 현실 — studiomeyer](https://studiomeyer.io/en/blog/local-llms-2026)
- [Qwen 라이선스(Apache-2.0) — orcarouter](https://www.orcarouter.ai/blog/qwen-3-8-27b-license) · [BGE-M3(MIT) — HuggingFace](https://huggingface.co/BAAI/bge-m3)
- [로컬 임베딩 비교 — D-Central](https://d-central.tech/local-embedding-models/)
- [LoRA vs RAG 판단 — BigDataBoutique](https://bigdataboutique.com/blog/fine-tuning-llms-when-rag-isnt-enough)
- [node-llama-cpp Electron](https://node-llama-cpp.withcat.ai/guide/electron) · [Claude Code 마켓플레이스](https://code.claude.com/docs/en/plugin-marketplaces)
