# Claude 작업 범위 — 배포·아키텍처 + 오케스트레이션

> 사용자 검토용. Claude(이 세션)가 직접 수행하는 범위입니다.

---

## 소유 디렉토리

`.github/` · `apps/desktop/apps/electron/` · `packages/runtime/` · `mcp/` · 루트 설정 파일

ChatGPT(`agents/`, `plugins/`)와 Grok(`data/`, `docs/`)의 영역은 편집하지 않습니다. 머지와 수용 판정만 담당합니다.

---

## 진행 상황

### Phase 0 — 진짜 현재 위치 확인

| 항목                        | 상태                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| 코어 빌드 (`npm run build`) | ✅ 통과                                                                  |
| 코어 테스트 (`npm test`)    | ✅ 3/3 통과                                                              |
| eval 실행 환경 점검         | ✅ `claude` CLI 탐지, 32건 매핑 전부 ✓, provider=claude-cli(추가 비용 0) |
| **eval 전체 재측정**        | ⏳ 백그라운드 실행 중 (32 답변 + 96 채점 = 128 호출)                     |
| 미커밋 31개 커밋 분리       | 대기 (재측정 결과 확인 후)                                               |

**재측정이 왜 최우선인가**: 커밋된 baseline(avg 0.51)은 2026-08-10 측정값인데, 그 이후 미커밋으로 바닥 케이스 6건을 겨냥한 보강이 들어갔고 `run.mjs`의 채점 조건 자체도 개선됐습니다(Universal Rules를 system에 포함, env를 user 프롬프트에 주입). **0.51은 낡은 숫자입니다.**

재측정 결과에 따라 Phase 1 범위가 갈립니다.

| 결과      | 다음 행동                                             |
| --------- | ----------------------------------------------------- |
| 0.65 이상 | 게이트 통과. 지식 보강 축소, 배포에 집중              |
| 0.55~0.65 | 바닥 케이스만 집중 보강 → 게이트 재도전               |
| 0.55 미만 | 게이트를 회귀 방지선으로 재설정, 0.65는 v2.6으로 이월 |

---

## Phase 1 — 출시 가능 상태 (3~4주)

### 1-A. 데스크톱 릴리스 파이프라인

현재 데스크톱은 **배포 불가**입니다. electron-builder 설정과 자동 업데이트 채널은 있는데 릴리스 워크플로에 연결이 전무합니다.

| 작업                                                                        | 파일                            |
| --------------------------------------------------------------------------- | ------------------------------- |
| 데스크톱 빌드를 릴리스에 연결 (Windows nsis 우선)                           | `.github/workflows/release.yml` |
| 버전 단일출처에 데스크톱 편입 (`3.0.0-beta.0` 홀로 떠 있음)                 | `scripts/bump-version.sh`       |
| 죽은 참조 제거 — `scripts/release.ts`가 package.json에 선언됐는데 파일 없음 | `apps/desktop/package.json`     |
| 실행되지 않는 워크플로 제거 (`apps/desktop/.github/`는 GitHub이 안 읽음)    | 해당 디렉토리                   |
| 데스크톱 테스트 370개를 CI에 편입 (현재 typecheck만 돎)                     | `.github/workflows/ci.yml`      |
| 실행 안 되는 테스트 3개 연결                                                | `mcp/package.json`, `ci.yml`    |

> ⚠️ **코드 서명이 크리티컬 패스입니다.** Windows EV 인증서 발급에 1~2주. 승인 즉시 신청해야 합니다. 서명 없으면 SmartScreen 경고 + 폐쇄망 보안 심사 탈락.

### 1-D. BSL 전환 준비

- 데스크톱만 BSL, 나머지 표면(플러그인·MCP·확장·SDK)은 MIT 유지
- `apps/desktop`은 craft-agents-oss(Apache-2.0) 파생이므로 **고지 의무가 계속 따라옴** — `NOTICE`·원본 LICENSE를 산출물에 포함
- 결정 필요: Change Date(통상 4년), Change License(통상 Apache-2.0), Additional Use Grant 범위

---

## Phase 2 — 온디바이스 (2~3주)

**이미 80% 구현돼 있습니다.** `pi_compat` + `customEndpoint: {api:'openai-completions'}`가 1급 시민이고, `LocalModelStep.tsx` 온보딩 화면 기본값이 `http://localhost:11434` / `qwen3-coder`이며, loopback이면 API 키를 `'not-needed'`로 처리합니다.

### 2-A. 추론 서버 번들 (파일 3개만 수정)

```
1. electron-builder.yml → extraResources에 플랫폼별 추론 서버 바이너리
   (bun·uv·claude-binary를 이미 같은 방식으로 번들 중)
2. main 프로세스 신규 파일 1개 — spawn / health-check / 종료
   (sapstack-runtime.ts의 lazy 싱글턴 패턴 복제)
3. LocalModelStep 기본값을 번들 서버 포트로
```

`shared/`, `pi-agent-server/`, `factory.ts`는 **무수정**.

**모델 가중치는 앱에 넣지 않습니다.** 설치 파일에 이미 claude 바이너리 ~210MB + bun이 있어 5GB를 더하면 배포가 무너집니다. `sapstack-model-pack-{version}.zip` + SHA256으로 분리 — 폐쇄망의 기존 USB 반입 절차와 오히려 정합합니다.

### 2-B. 사전 발견된 함정 3개

| 함정                                                                                   | 위치                           |
| -------------------------------------------------------------------------------------- | ------------------------------ |
| `findSmallModel`이 `'haiku'/'mini'/'flash'` 하드코딩 → qwen 미매칭, 마지막 모델로 폴백 | `llm-connections.ts:291`       |
| `call_llm` 첨부파일 하드 차단 (로컬 모델엔 논리적으로 불필요)                          | `llm-tool.ts:96`               |
| `buildCustomEndpointModelDef`가 `reasoning:false`, `maxTokens:8192` 고정               | `custom-endpoint-models.ts:52` |

### 2-C. Local 등급 품질 증명

같은 gold-set을 로컬 모델로 채점 → `docs/eval/latest-local.json`. **"폐쇄망에서도 X점"이 영업 자산입니다.** 낮으면 낮은 대로 정직하게 공개합니다(ETHOS ②).

---

## Phase 3 — 마감 (1주)

- CHANGELOG에 v2.4.0 이후 12커밋 + 신규 작업 반영
- 루트 잔재 정리 (`.pr-body-*.md` 9개, `.release-notes-*.md` 6개)
- README 단일 진입 서사 (현재 설치법 7개가 평행 나열)
- `learning.ts`를 MCP 툴로 노출 (파이프라인 종단 연결)
- `packages/runtime`의 `private: true` 해제 → SDK 공개

---

## 수용 게이트 (서브 AI 산출물)

**EVIDENCE 블록 없는 "완료" 주장은 무효.** 직접 재확인한 것만 머지합니다.

- 지식 보강 → `./scripts/eval-diagnosis.sh --module {MOD}` 재측정 출력
- 데이터 추가 → `check-eval-goldset --strict` + `check-tcodes --strict` 통과 출력
- 확인 불가 → 버림 (과소 채택 > 과잉 채택)

머지 순서: Grok의 적대적 검증 통과 → Claude 재확인 → 커밋
