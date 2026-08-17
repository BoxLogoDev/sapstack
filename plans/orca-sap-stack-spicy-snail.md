# sapstack 데스크톱 검수 → 결손 해소 스프린트 (4차 함대)

> 이전 스프린트(데스크톱 파일럿 + 로컬 LLM 번들)는 완료 — 설치파일 실빌드, air-gapped
> 검증, llama-server 번들, 컴팩트 카드 20종 수용, 다국어 데이터 100%, 로컬 eval 배관까지.
> 이 문서는 **2026-08-17 전면 검수 결과**와 그 결손을 4-AI 함대에 배분하는 계획이다.

## Context — 검수 결과

검수 방법: Explore 에이전트 2기(데스크톱 기능 공백 / 릴리스·CI·문서) + 함대 터미널
직접 확인 + 게이트 스팟체크. 모든 판정은 file:line 근거 확보됨.

### 🔴 릴리스 차단

| 발견                                                                                                                                                              | 근거               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **CI 6/8 job 실패 — 5개의 단일 원인이 `data/tcodes.yaml:1933` 중복 `IW65:` 키** (내 수용 커밋 7f4640e에서 유입). 나머지 1개는 bun install GitHub 504(재시도 대상) | gh run 31986238295 |
| PR #44는 MERGEABLE — 막는 건 빨간 체크뿐                                                                                                                          | gh pr view 44      |

### 데스크톱 기능 공백 (정적 추적 확정)

| 항목                                    | 판정                                                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 온보딩 저장 → 채팅 endpoint (pi_compat) | ✅ 연결됨 (`useOnboarding.ts:709` → `llm-connections.ts:106` → `factory.ts:251` → `pi-agent.ts:560`)                                                                                        |
| 컴팩트 카드 → 데스크톱 시스템 프롬프트  | ❌ **끊김** — 유일 소비자가 `scripts/eval/run.mjs:361`. 카드 패키징은 이미 됨(`copy-assets.ts:27`이 data/ 전체 복사), **로더만 없다**                                                       |
| 로컬 경로 연결 테스트                   | ❌ 없음 — `handleSubmitLocalModel`(`useOnboarding.ts:704`)만 `testLlmConnectionSetup` 생략. 미기동 서버도 온보딩 "완료"                                                                     |
| `running` ≠ 모델 로드 완료              | ❌ spawn 성공만 봄(`local-llm.ts:83`). 5GB GGUF CPU 로드 수십 초간 503                                                                                                                      |
| `air_gapped` 보존                       | ❌ **버그** — `sapstack-runtime.ts:118-138` saveEnvironmentProfile이 profile 재작성, `SapEnvironmentStep.tsx:35-40`은 4필드만 전달 → 수동 설정한 `air_gapped`/`country_iso`/`client` 소실   |
| air-gap 시 수동 업데이트 확인           | ❌ 무가드 (`handlers/system.ts:273` → `auto-update.ts:330`)                                                                                                                                 |
| air-gapped UI 표시/토글                 | ❌ 없음 — `isAirGapped()` 소비처는 main/index.ts 2곳뿐                                                                                                                                      |
| 폐쇄망 Windows 온보딩                   | ❌ **막다른 길** — Git Bash 게이트(`useOnboarding.ts:221-239`) skip 없음, Back 버튼은 `App.tsx:697-701`이 `onDismiss` 미전달로 죽어 있음                                                    |
| About/라이선스 화면                     | ❌ 없음 — 인스톨러에 licenses/ 동봉되나 UI에서 읽는 코드 0 (`AppSettingsPage.tsx:311-357`)                                                                                                  |
| 앱 UI 언어                              | ❌ **ko/vi 로케일 없음**(`i18n/registry.ts:41-57` — en/es/zh-Hans/ja/hu/de/pl). SAP 신규 UI 3파일은 한국어 하드코딩(t() 0건) → en 선택해도 홈이 한국어. README "6개 언어"는 앱 UI 기준 거짓 |
| 골든패스 ↔ 로컬 LLM 분기                | ❌ 없음 — Opus용 수백 토큰 지시가 Qwen3 8B에도 그대로 감                                                                                                                                    |

### 문서·유지보수 공백

- README 6종(ko/en/zh/ja/de/vi)에 데스크톱(4번째 표면) 언급 **0건** — CHANGELOG는 데스크톱으로 꽉 차 있어 심하게 어긋남
- **모델팩 가이드 0줄** — llama 엔진은 exe에 실렸는데 모델 넣는 법이 코드 주석에만 존재
- `docs/compliance/air-gapped-deployment.md`가 MCP+npm 전제 — 데스크톱·`SAPSTACK_AIRGAPPED` 미반영
- `apps/desktop/package.json` 죽은 스크립트 14개, `bun run lint` 첫 줄 사망
- T-code checker 사각지대: `V/06`(슬래시 형식) 패턴 미매치 + `CM01` 미검출 — 둘 다 registry 미등록 실확인

### 함대 상태

- **Codex 2차 완료** (Goal achieved, 1h17m, 463K tokens) — plugin.json 24종 표준화 + `.claude-plugin/` 신설 + SKILL 심화, 게이트 5종 통과 EVIDENCE. 미커밋 44건 수용 대기. 터미널 컨텍스트 잔여 29% → 새 대화로 재시작 필요
- **Grok 유휴** — 카드 20종 납품 후 대기
- **로컬 eval 90건 실행 중** (백그라운드, 4B + 컴팩트 카드) — 완료까지 무거운 병행 금지
- **Antigravity** — report-only, `agy -p` 헤드리스 가능

### 사용자 결정 (2026-08-17 확정)

| 결정            | 내용                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Git Bash 폐쇄망 | **지금 문서화 + Back 버튼 픽스, PortableGit 번들은 다음 릴리스**                                                                                      |
| BSL 파라미터    | **통상값 확정** — Change Date 4년, Change License Apache-2.0, Additional Use Grant "프로덕션 아닌 내부 평가·개발 무상". 라이선스 화면까지 이번에 완성 |

---

## Phase 0 — 즉시 (CI 복구 + Codex 수용) [Claude]

1. **`data/tcodes.yaml:1933` 중복 `IW65:` 블록 삭제** (1325줄 원본 유지, mcp/assets 미러는 정상) → push → CI 재확인. bun 504는 재시도로 관찰
2. **`V/06`·`CM01` 직권 등록** — Codex 산출이 실존 T-code를 쓰는데 registry에 없음. CI 차단 해제 우선이므로 직권 등록 후 Grok에 통보(Track C에서 검증)
3. **Codex 2차 수용**: 게이트 5종 직접 재실행(lint-frontmatter / check-tcodes --strict / check-hardcoding --strict / check-ecc-s4-split --strict / check-marketplace) → 통과 시 agents/plugins 미커밋 44건 수용 커밋. 실패 항목은 버림(과소 채택 > 과잉 채택)
4. **checker 사각지대 픽스**: `scripts/check-tcodes.sh`에 슬래시 형식(`V/06`) 추출 패턴 추가 + CM01 미검출 원인 조사·수정

## Track A — Claude (데스크톱 코드, `apps/desktop` 소유)

> ⚠️ Codex 소유로 넘기는 4파일 불가침: `SapGoldenPath.tsx`, `SapEnvironmentStep.tsx`,
> `ProviderSelectStep.tsx`, `LocalModelStep.tsx` (Track B 참조)

- **A1. air_gapped 소실 버그** — `saveEnvironmentProfile`(`sapstack-runtime.ts:118-138`)이 기존 profile을 읽어 merge 하도록 수정 (`air_gapped`/`country_iso`/`client` 보존)
- **A2. air-gap 수동 업데이트 가드** — `handlers/system.ts:273`에 `isAirGapped()` 분기, UI에 사유 반환
- **A3. 로컬 연결 검증** — `handleSubmitLocalModel`(`useOnboarding.ts:704`)에 기존 `testLlmConnectionSetup`(`:455-471` 패턴) 추가. `local-llm.ts`에 `/health` 폴링 → status에 `ready` 필드 (모델 로드 완료 판별)
- **A4. 컴팩트 카드 로더** — pi_compat 커넥션 세션의 시스템 프롬프트에 `data/local-llm/compact/{module}.md` 주입. 위치: `packages/shared/src/prompts/system.ts:348` `getSystemPrompt()` + `pi-agent.ts:2031` 호출부. 카드는 `dist/resources/sapstack/data/local-llm/`에 재빌드 시 동봉됨. 모듈 힌트 없으면 eval의 `LOCAL_HEADER` 상당 공통 헤더만 (run.mjs:361 패턴 재사용). 렌더러 수정 불필요하게 커넥션 레벨에서 처리
- **A5. GitBashWarning Back 버튼** — `App.tsx:697-701`에 `onDismiss` 전달 (Setup later 경로로 탈출 가능하게)
- **A6. About/라이선스 화면** — `AppSettingsPage.tsx` About 섹션 확장: BSL 1.1(위 통상값) + Apache-2.0 고지(`licenses/craft-agents-oss/` 리소스 읽기). 루트 LICENSE 파일 전환은 별도 커밋
- **A7. 로컬 엔진 상태 패널** — Settings AI 페이지에 serverBundled/modelFile/ready/modelsDir 표시 + 새로고침 (기존 `window.sapstack.localLlm.status` 재사용, `LocalModelStep.tsx:55` 패턴)
- **A8. lint 인질 해소** — `apps/desktop/package.json` `lint` 정의에서 죽은 2개(`lint:ipc-sends`, `lint:tool-name-checks`) 제거. upstream 잔해 12개 삭제는 스킵(동기화 보호)
- **A9. 로컬 eval 완료 처리** — `latest-local.json` 검토 → llama-server 종료 → pilot-local.json과 함께 커밋. 클라우드 REPORT에 미기록 원칙 유지

제약: **eval 측정 중 전체 bun test·재빌드 금지** (CLI 0xC0000142 재발 방지). 타입체크만 수시, 전체 테스트는 eval 완료 후 일괄.

## Track B — Codex goal mode (i18n 완성 루프)

- 지시서 `plans/handoff/round4-codex-i18n.md` 작성 → 터미널 send (**새 대화로 시작** — 잔여 컨텍스트 29%)
- **새 소유권**: `apps/desktop/packages/shared/src/i18n/**` + 렌더러 4파일(`SapGoldenPath.tsx`, `SapEnvironmentStep.tsx`, `ProviderSelectStep.tsx`, `LocalModelStep.tsx`)
- 작업:
  1. **ko/vi 로케일 신설** (전체 키 번역) + `registry.ts:41-57` 등록 — "6개 언어" 주장을 앱 UI에서 사실로 만든다
  2. SAP 신규 UI 하드코딩 한국어 → `t()` 전환 + 9개 로케일 전부 키 추가 (`LocalModelStep.tsx`의 기존 t() 패턴이 모범)
  3. 하드코딩 영어 잔존 정리 (`ProviderSelectStep.tsx:70,76` — Ollama 문구를 번들 엔진 반영으로 갱신, `LocalModelStep.tsx:114`)
- 루프: 변환 → `lint:i18n` 3종(sorted/parity/coverage) + typecheck → 실패 수정 → 반복. 완료 시 EVIDENCE 블록(게이트 로그 원문) 필수
- 제외: `sap-golden-path.ts`의 모델 프롬프트 본문(UI 문자열 아님), 커밋(오케스트레이터가 수용)

## Track C — Grok goal mode (문서·데이터 루프)

- 지시서 `plans/handoff/round4-grok-docs.md` 작성 → 터미널 send (자기 워크트리에서 작업)
- 소유: `data/`, `docs/`, `README*`
- 작업:
  1. **README 6종에 데스크톱 표면 추가** — `### 🖥 Desktop` 소제목(핵심 기능) + 빠른 시작 설치 항목 + stats 주석 갱신. 6개 언어 전부
  2. **`docs/desktop-install.md` 신설** — 설치(NSIS per-user, %LOCALAPPDATA%), 모델팩 준비(GGUF → `~/.sapstack/models/`, USB 반입), 로컬 엔진 자동 감지. 코드 근거는 지시서에 내가 발췌 제공(창작 방지)
  3. **`docs/compliance/air-gapped-deployment.md` 데스크톱 반영** — `SAPSTACK_AIRGAPPED`, 설치파일 USB 반입, **Git for Windows 오프라인 설치본 반입 필수** 명시, 모델팩 절차
  4. V/06·CM01 직권 등록 검증 + PM/PP 관점 tcodes 정합성 재확인
- 루프: 초안 → 사실 대조(지시서의 코드 발췌와 문장 단위 대조) → `check-translation-parity --strict` 등 게이트 → 반복
- 금지: UI 문자열·기능·수치 창작, gold-set 열람

## Track D — Antigravity (report-only 동적 QA)

- `agy -p` 헤드리스 배부, 쓰기 허용 파일은 `plans/handoff/antigravity-report.md` 하나
- 설치된 파일럿 앱(%LOCALAPPDATA%)에서 정적 판정 3건을 동적 재현 (A3/A5 픽스 **전** 현상 확보 가치):
  1. 로컬 endpoint 검증 생략 — llama-server 미기동 상태로 온보딩 Local Model 경로 완주가 되는지, 첫 채팅에서 무슨 에러가 나는지
  2. Git Bash 게이트 — Back 버튼 무반응 재현
  3. 골든패스 → 채팅 프리필 흐름 관찰 (전송 안 되고 프리필만 되는 UX 평가)
- 토큰 절약: 명시 절차만, 탐색 금지

---

## 실행 순서

```
즉시:    Phase 0 (IW65 핫픽스 → CI) ── Codex 수용 커밋
병렬 배부: Track B(Codex 새 대화) · Track C(Grok) · Track D(Antigravity)
이후:    Track A 코드 (A1→A5 순, eval과 병행 가능한 경량 작업만)
eval 완료: A9 → 전체 bun test + typecheck 일괄 → 함대 EVIDENCE 수용 순차 커밋
```

## 검증

```bash
# Phase 0
node -e "require('js-yaml').load(require('fs').readFileSync('data/tcodes.yaml','utf8'))"  # 중복 키 소멸
gh run list --branch feat/desktop-release-and-knowledge --limit 1                          # CI green
./scripts/lint-frontmatter.sh && ./scripts/check-tcodes.sh --strict \
  && ./scripts/check-hardcoding.sh --strict && ./scripts/check-ecc-s4-split.sh --strict \
  && ./scripts/check-marketplace.sh                                                        # Codex 수용 게이트

# Track A (eval 완료 후 일괄)
bun run --cwd apps/desktop typecheck:shared && bun run --cwd apps/desktop typecheck:electron
bun test --cwd apps/desktop
# A3 스모크: SAPSTACK_LOCAL_LLM_PORT 비워 llama 미기동 상태에서 온보딩 → 검증 실패가 떠야 함

# Track B 수용
bun run --cwd apps/desktop lint:i18n:coverage  # + sorted/parity

# Track C 수용
./scripts/check-translation-parity.sh --strict && 문서 인용 스팟체크(파일:줄 3건 이상)
```

## 리스크

| 리스크                              | 대응                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------- |
| eval 측정 중 병행 부하로 CLI 재사망 | 전체 테스트·재빌드·llama 재기동 전면 보류, 경량 편집만                     |
| Codex 컨텍스트 고갈(29%)            | 새 대화 강제 + 지시서를 파일로 전달(터미널 텍스트 최소화)                  |
| ko/vi 대량 키 번역 품질             | parity·coverage 게이트 + 수용 시 ko 스팟체크(한국어는 내가 직접 검수 가능) |
| V/06 직권 등록의 소유권 침범        | Grok에 통보 + Track C에서 재검증                                           |
| A4 카드 주입이 클라우드 세션 오염   | providerType === 'pi_compat' 가드로 로컬 커넥션에만 주입                   |
| 컴팩트 카드 합본이 8K ctx 초과      | 모듈 힌트 시 해당 카드 1장만, 없으면 공통 헤더만 (합본 금지)               |
