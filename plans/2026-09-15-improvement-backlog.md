# sapstack 개선 백로그 — 2026-09-15

> 근거: `main` @ `d255f5f`, GitHub CI 이력, 스케줄러·스냅샷·eval 산출물 실측(2026-09-15).
> 상태의 정본은 `STATE.md`. 이 파일은 "다음에 무엇을 고칠까"의 순위표다 — 끝난 항목은 ✅로 남겨 다음
> 갱신 때 지우고, 저울질이 필요한 판단은 `decisions/`에 쓴다. 담당: 🧑 사용자만 할 수 있는 것 / 🤖 Claude가 할 수 있는 것.

## P0 — 지금 고장 (릴리스와 파일럿 데이터를 막는다)

| #   | 항목                                  | 상태 (09-15 저녁)                                                                                                                                                                                                                  | 남은 행동                                                                                                           | 담당 | 검증                                                                      |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------- |
| 1   | ✅ CI main 적색                        | 원인 5종 수정·푸시(45f0eb7 a921e03 7132e7d d255f5f). run 34921336264 전 잡 녹색 — 08-20 이후 처음. 숨어 있던 원인: multi-AI `"id"` 카운트, `@types/bun: latest` 드리프트, OAuth 테스트의 전역 fetch 누출                                       | ✅ runtime 테스트 고정값 → `asset-manifest.json` counts 대조(09-15 오후)                                              | —    | `gh run list -b main -L 1` success                                        |
| 2   | ✅ CBO 야간 스케줄러 미실행             | `register-task.ps1`: 배터리 시작 허용·StartWhenAvailable·robocopy `/R:2 /W:5`. 09-15 12:27 사내망 복귀 후 스케줄러 경로로 첫 실제 수집 완료(13:14, 47분): 검색 히트 124,363 → 오브젝트 34,496 / 파일 33,957 / 실패 539, 카탈로그 32,653, git 178파일 변경(08-30 대비), status partial. 12:03 기동분은 네트워크 불통으로 0건 가드 작동 | partial 원인은 08-30과 동일한 539건(538건 ADT 404 — 열거는 되나 소스가 없는 PROG). 404를 실패 대신 스킵으로 다루면 complete — 별건 후보. 게시 robocopy는 DNS(#5)로 실패 | —    | 완료: manifest `exported_at` 2026-09-15T04:14Z                             |
| 3   | ✅ QS4 전체 덤프 임시 폴더              | `~/.sapstack/cbo/QS4-dump/`(59,264파일, `_INDEX.md`) + `~/.sapstack/cbo/abapdump-tool/`(exe·Go 소스·래퍼·로그). 스크래치패드 원본은 지워도 됨                                                                                          | —                                                                                                                   | —    | 완료                                                                      |
| 4   | ✅ v2.5.0 컷                          | 09-15 13:50 사용자 지시로 태그 푸시 → release run 34930314696: Desktop installer 성공, Release 생성 성공, 자산 5종 확인(Setup 256MB / Portable 256MB / latest.yml / vsix / MCP tgz 1.1MB). `Publish MCP to npm`만 E404(토큰 만료)                          | npm은 #8 — 토큰 갱신 후 같은 run의 실패 잡 재실행                                                                    | —    | 완료                                                                      |

## P1 — 파일럿 운영

| #   | 항목                              | 증거                                                                                                      | 다음 행동                                                                                                             | 담당 | 검증                                              |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------- |
| 5   | 공유폴더 게시 막힘                 | `Resolve-DnsName lsitc-fs01` 실패(09-15 재확인). 스케줄러 robocopy와 provision `shareRoots`가 여기로 향함  | 서버 개통 또는 실제 호스트명 확인. 열리면 #2의 스케줄러가 자동 게시                                                    | 🧑   | `Test-Path \\lsitc-fs01\sapstack\cbo`             |
| 6   | ✅ 배포 전 시크릿 25건 검토        | 열람(09-15): 25건 중 24건은 주석 처리된 `PASSWORD = ' '` 자리표시자(FTP/RFC 호출 블록) — 오탐. `scrub.mjs` 규칙에서 공백 리터럴 제외 + 테스트 추가 → 재스캔 1건(09-15 13:14 스냅샷은 수정 전 코드로 돌아 25건 표기, 새 규칙은 09-16 06:30부터). 남은 1건 `zhr0/zhrrd015.prog.abap:108` `IF password = '<4자>'`(HR 리포트 접근코드, 현재 리포트만 되고 마스킹 안 됨) | ✅ 사용자 결정(09-15): 마스킹 승격. `scrub.mjs`에서 `hardcoded_secret`을 MASK 로 옮기고 리터럴을 `'***'`로 치환하는 전용 마스커(길이 비보존). DS4 재수집으로 스냅샷에 반영 | —    | 재수집 후 `git -C ~/.sapstack/cbo/DS4 show HEAD:src/zhr0/zhrrd015.prog.abap` 108행 `'***'`, pii-report `hardcoded_secret` 1건 masked:true |
| 7   | PS4 ADT HTTP 403                  | `/sap/bc/adt` ICF 비활성(9/3·9/4·메모리). QS4/DS4는 401 정상                                               | Basis에 SICF `/sap/bc/adt` 활성화 요청 — 읽기 전용 수집 목적 명시                                                      | 🧑   | `curl -k https://10.155.26.40:44300/sap/bc/adt/discovery` → 401 |
| 8   | npm MCP 2.4.1 미발행               | `npm view @boxlogodev/sapstack-mcp version` = 2.4.0. `E404 PUT` = 토큰 만료                                | npm Automation 토큰 재발급 → 저장소 secret `NPM_TOKEN` 갱신 → release 워크플로 rerun(같은 태그 재사용 가능)             | 🧑   | `npm view` = 2.5.0                               |
| 9   | QS4 수집 정례화                   | ✅ 09-15: `export-cbo.mjs`가 `~/.sapstack/.env.<SID>` 오버레이(URL/클라이언트만, 계정은 `.env` 상속)를 읽음. `.env.QS4`(10.155.26.31, 클라이언트 100)·config `landscape_role: qas`·태스크 `sapstack-cbo-export-QS4` 평일 07:30 등록. dry-run ZFI1 1,937건(DS4 1,953건과 달라 시스템 전환 확인) | 첫 정례 실행 09-16 07:30 결과 확인                                                                                     | 🤖   | `~/.sapstack/cbo/QS4/manifest.yaml` status complete |
| 10  | ✅ `npm run cbo:test` 로컬 실패     | 파일 명시(`lib.test.mjs`)로 수정, 10/10 통과                                                              | —                                                                                                                     | —    | 완료                                              |
| 11  | ✅ 데스크톱 테스트 격리 규율       | bun test는 373파일을 한 프로세스에서 돌리고 파일 순서가 러너마다 다르다. 전역 `fetch`를 바꾸는 테스트 9파일 중 복원 없던 2개(OAuth) 수정. 나머지 7개는 `afterEach` 복원 있음. CI Desktop 잡 run 34921336264·34926174496 2회 연속 녹색 | 규율로 유지: 새 테스트에서 전역 스텁은 `afterEach/afterAll` 복원 필수. 가능하면 http-server 테스트처럼 피해자 쪽도 `import { fetch } from 'bun'`으로 면역 | —    | 완료                                           |
| 12  | 스크래치패드 worktree 잔재         | lock 드리프트 재현용 `…/scratchpad/wt-main`(node_modules 포함)이 경로 길이 오류로 자동 삭제 실패, `git worktree list`에 남음 | 승인 후 재귀 삭제 + `git worktree prune`                                                                             | 🧑 승인 → 🤖 | `git worktree list` 1개                        |

## P2 — 답 품질 (파일럿의 실제 가치)

| #   | 항목                                | 증거                                                                                                                      | 다음 행동                                                                                                          | 담당 | 검증                                        |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------- |
| 13  | 로컬 LLM 품질 기준선 없음            | `docs/eval/pilot-local.json` 0.316은 08-17 4건·제로 셋팅과 지식 주입 이전 측정. 클라우드 기준선 0.638(58건, 08-16). 09-15 이 PC 여유 RAM 3.7GB/15.7GB — Qwen3-4B Q4(2.5GB)+16K ctx가 한계, 8B(5GB) 불가, 이전 세션에 메모리 부족 kill 전례 → 세션 병행 실행 보류 | PC 여유 시(야간): 데스크톱과 같은 인자로 `llama-server.exe -m ~/.sapstack/models/Qwen3-4B-Q4_K_M.gguf --port 11435 --ctx-size 16384 --jinja --reasoning-budget 0 -a sapstack-local` 기동 → `EVAL_PROVIDER=local node scripts/eval/run.mjs --all --json docs/eval/latest-local.json`. 4B → 8B 순. 결과로 "로컬 vs api_key" 권고 문구 확정 | 🤖   | `latest-local.json` `generated_at` 갱신, 58건 |
| 14  | 약점 클러스터 7건                    | REPORT: SAC import 0.00 · IC IDoc 0.13 · PM preventive 0.17 · Ariba CIG 0.19 · QM UD 0.20 · Datasphere 0.21 · HCM payroll 0.25 | 해당 SKILL/symptom-index 보강. 전부 클라우드 통합 계열 신규 케이스 — 파일럿(전선 제조, S4_2023 private cloud)과 관련 낮은 것은 후순위 | 🤖   | 재실행 score 상승, release gate 유지         |
| 15  | CBO 인용 품질 미측정                 | `sap-cbo-explainer`·CBO 스냅샷은 gold-set에 케이스 없음                                                                    | DS4 실제 Z 오브젝트 기반 케이스 3~5건 gold-set 추가(출제자는 사용자, 에이전트 열람 금지 규율 유지)                    | 🧑 출제 → 🤖 | eval에 cbo 카테고리 점수 표시              |
| 16  | 파일럿 피드백 환류 부재              | 로드맵 Learning Loop `[~]` — opt-in 로컬 codify까지. 현업 질문·오답이 gold-set/symptom-index로 돌아오는 경로 없음          | 최소안: 현업 PC `~/.sapstack` 세션 로그를 주 1회 수집 → codify → symptom 후보 검토. 결정 필요(PII·동의)              | 🧑 정책 → 🤖 | 주간 codify 산출물 1건                      |

## P3 — desktop-readiness 잔여 (2026-08-27 계획, 이번에 재검증 안 함)

| #   | 항목                                  | 비고                                                                              | 담당 |
| --- | ------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| 17  | EV 코드 서명                          | 리드타임이 일정을 결정. 미서명 exe는 현업 PC SmartScreen 경고                       | 🧑   |
| 18  | ✅ Air-gapped 모드 토글               | 종료(09-15 확인): `apps/electron/src/main/airgap.ts` — `SAPSTACK_AIRGAPPED=1` 또는 config `air_gapped: true`면 Sentry(`index.ts`)·업데이트 폴링(`auto-update.ts`)을 시작하지 않음. 문서 `docs/desktop-install.md`. 클라우드 LLM은 별도 차단 없음 — 프로비저닝에서 연결을 안 만들면 된다 | —    |
| 19  | 라이선스 화면 (BSL + Apache-2.0)       | BSL 파라미터는 사용자 결정                                                         | 🧑→🤖 |
| 20  | ✅ 데스크톱 테스트 실패 판정          | 종료: 09-15 CI Desktop 잡 `bun test` 4945건 전부 통과(#11 수정 후). "71건 실패"는 옛 수치 | —    |
| 21  | 비SAP 기능(messaging/marketing) 노출 제거 | 현업 모드(`ui_mode: simple`)가 일부 가림. 완전 제거 여부 판단. 제거하면 baileys 등 github 의존성도 사라짐 | 🧑→🤖 |
| 22  | ✅ 통계 문자열 stale                  | `package.json`·`marketplace.json` description → 24/21/23, 472 T-codes, MCP 23 tools/12 prompts(09-15) | —    |

## 제안 순서

- **즉시 (🧑)**: #8 npm 토큰 갱신 → release run 34930314696 "Re-run failed jobs"
- **사용자 병행**: #5 DNS · #7 SICF · #8 npm 토큰 · #17 EV 인증서 — 전부 외부 리드타임이 있는 것
- **사용자 판단 1건**: #6 남은 시크릿 1건(HR 리포트 접근코드) — 리포트만 둘지, 문자 비밀번호 마스킹을 추가할지
- **다음 세션 (🤖)**: #2 DS4 수집 결과(09-15 17:30 이후)·#9 QS4 첫 정례 실행(09-16 07:30) 확인 → #13 로컬 기준선(PC 여유 시) → #14/#15 보강 → #16 환류 정책
- P3는 v2.5.0 이후, 파일럿 피드백이 우선순위를 정한 뒤
