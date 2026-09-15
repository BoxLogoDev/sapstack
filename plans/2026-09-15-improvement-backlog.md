# sapstack 개선 백로그 — 2026-09-15

> 근거: `main` @ `cd876ec`, GitHub CI 이력, 스케줄러·스냅샷·eval 산출물 실측(2026-09-15).
> 상태의 정본은 `STATE.md`. 이 파일은 "다음에 무엇을 고칠까"의 순위표다 — 끝난 항목은 지우고,
> 저울질이 필요한 판단은 `decisions/`에 쓴다. 담당: 🧑 사용자만 할 수 있는 것 / 🤖 Claude가 할 수 있는 것.

## P0 — 지금 고장 (릴리스와 파일럿 데이터를 막는다)

| #   | 항목                                  | 증거                                                                                                                                                                                   | 다음 행동                                                                                                                                                          | 담당           | 검증                                                                    |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------- |
| 1   | **CI main 적색 — 08-29부터 12회 연속** | ① `packages/runtime/tests/runtime.test.ts:58-59` 카탈로그 수 고정값 stale — 에이전트 `21 !== 20`(`sap-cbo-explainer` 추가), 커맨드 `23 !== 22`(`sap-cbo-explain` 추가) ② `check-links --strict`: electron `resources/AGENTS.md` → `release-notes/next.md`(527240f에서 삭제) | 두 건 2026-09-15 로컬 수정 완료 — 테스트 고정값 21/23, AGENTS.md 문단을 CHANGELOG 기반 실제 흐름으로 갱신(`next.md`는 복원하면 릴리스 노트 로더가 유령 버전으로 표시하므로 미복원). 커밋·푸시 → CI 확인. 재발 방지는 고정값 대신 `asset-manifest.json` counts 대조로 바꾸는 것 — 별건                                                                             | 🤖 (푸시 승인 🧑) | `gh run list -R BoxLogoDev/sapstack -b main -L 1` → success              |
| 2   | **CBO 야간 스케줄러가 한 번도 돌지 않았다** | `sapstack-cbo-export-DS4` Last Result `0x800710E0`, `DS4/meta/export-log.txt` 부재, manifest `exported_at` 08-30 23:30Z 고정. 태스크 XML `DisallowStartIfOnBatteries=true` + `InteractiveToken` | `register-task.ps1`에 `New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries` 반영 → 재등록 → `schtasks /Run`으로 1회 실측. 로그온 없이도 돌려면 `/RU`+비밀번호 또는 S4U 결정 필요 | 🤖             | `export-log.txt` 생성 + manifest `exported_at` 갱신                    |
| 3   | **QS4 전체 덤프 774MB가 임시 폴더에**   | 세션 `13bf26e0…` 스크래치패드 `ps4/qs4-full/`(패키지 228, `.md` 59k) + `ps4/abapdump/`(main.go 612줄, exe). 세션 정리 시 소멸                                                          | 영구 위치로 복사. 제안: 덤프 → `~/.sapstack/cbo/QS4-dump/`, 도구 → `scripts/cbo/abapdump/`(Go 소스만, exe 제외)                                                    | 🧑 위치 결정 → 🤖 | `_INDEX.md` 존재 + 파일 수 59,263 대조                                  |
| 4   | **v2.5.0 미컷 — 미출시 커밋 27개**      | CHANGELOG `[Unreleased]` 64줄, 기능 5묶음(CBO·프로비저닝·현업 모드·공급 채널·제로 셋팅). 현업 PC 앱은 "2.4.1" 표기의 미출시 코드                                                        | #1 녹색 확인 후 `scripts/bump-version.sh` → CHANGELOG 헤딩 `[2.5.0] - 날짜` → 태그 푸시. 로컬 게이트 `--strict` 선검증 + `build-multi-ai --write`                    | 🤖 (태그 푸시 🧑) | release 워크플로 success, Release 자산 5종                              |

## P1 — 파일럿 운영

| #   | 항목                              | 증거                                                                                                      | 다음 행동                                                                                                             | 담당 | 검증                                              |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------- |
| 5   | 공유폴더 게시 막힘                 | `Resolve-DnsName lsitc-fs01` 실패(09-15 재확인). 스케줄러 robocopy와 provision `shareRoots`가 여기로 향함  | 서버 개통 또는 실제 호스트명 확인. 열리면 #2의 스케줄러가 자동 게시                                                    | 🧑   | `Test-Path \\lsitc-fs01\sapstack\cbo`             |
| 6   | 배포 전 시크릿 25건 검토           | `DS4/meta/pii-report.json` reported 420 = 이메일 299·계좌 50·휴대폰 46·시크릿 25                          | 25건 열람 → 진짜 시크릿이면 해당 오브젝트/패턴을 마스킹 규칙(`scripts/cbo/lib`)에 추가                                 | 🤖 열람 → 🧑 판단 | pii-report `reported.secret` 0 또는 사유 기록  |
| 7   | PS4 ADT HTTP 403                  | `/sap/bc/adt` ICF 비활성(9/3·9/4·메모리). QS4/DS4는 401 정상                                               | Basis에 SICF `/sap/bc/adt` 활성화 요청 — 읽기 전용 수집 목적 명시                                                      | 🧑   | `curl -k https://10.155.26.40:44300/sap/bc/adt/discovery` → 401 |
| 8   | npm MCP 2.4.1 미발행               | `npm view @boxlogodev/sapstack-mcp version` = 2.4.0. `E404 PUT` = 토큰 만료                                | npm Automation 토큰 재발급 → 저장소 secret `NPM_TOKEN` 갱신 → release 워크플로 rerun(같은 태그 재사용 가능)             | 🧑   | `npm view` = 2.4.1(#4 뒤엔 2.5.0)                |
| 9   | QS4 수집 정례화                   | 스케줄은 DS4만. QS4는 abapdump 1회성(#3). 현업 질문 대상은 QA 코드일 수 있음                                | `export-cbo.mjs --system QS4` 태스크 추가(QS4 접속 프로필 필요). DS4와 동일 러너 패턴                                   | 🤖   | `~/.sapstack/cbo/QS4/manifest.yaml` status complete |
| 10  | `npm run cbo:test` 로컬 실패       | Node 24가 `scripts/cbo/tests/` 디렉터리 인자를 `MODULE_NOT_FOUND`. CI엔 없는 테스트                        | `package.json` → `node --test scripts/cbo/tests/*.test.mjs` (파일명 패턴 확인 후)                                     | 🤖   | `npm run cbo:test` pass                          |

## P2 — 답 품질 (파일럿의 실제 가치)

| #   | 항목                                | 증거                                                                                                                      | 다음 행동                                                                                                          | 담당 | 검증                                        |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------- |
| 11  | 로컬 LLM 품질 기준선 없음            | `docs/eval/pilot-local.json` 0.316은 08-17 4건·제로 셋팅과 지식 주입 이전 측정. 클라우드 기준선 0.638(58건, 08-16)         | Qwen3-4B·8B 각각 gold-set 58건 재실행 → 격차·답 시간 수치화. 결과로 "로컬 vs api_key" 권고 문구 확정                 | 🤖   | `pilot-local.json` `generated_at` 갱신, 58건 |
| 12  | 약점 클러스터 7건                    | REPORT: SAC import 0.00 · IC IDoc 0.13 · PM preventive 0.17 · Ariba CIG 0.19 · QM UD 0.20 · Datasphere 0.21 · HCM payroll 0.25 | 해당 SKILL/symptom-index 보강. 전부 클라우드 통합 계열 신규 케이스 — 파일럿(전선 제조, S4_2023 private cloud)과 관련 낮은 것은 후순위 | 🤖   | 재실행 score 상승, release gate 유지         |
| 13  | CBO 인용 품질 미측정                 | `sap-cbo-explainer`·CBO 스냅샷은 gold-set에 케이스 없음                                                                    | DS4 실제 Z 오브젝트 기반 케이스 3~5건 gold-set 추가(출제자는 사용자, 에이전트 열람 금지 규율 유지)                    | 🧑 출제 → 🤖 | eval에 cbo 카테고리 점수 표시              |
| 14  | 파일럿 피드백 환류 부재              | 로드맵 Learning Loop `[~]` — opt-in 로컬 codify까지. 현업 질문·오답이 gold-set/symptom-index로 돌아오는 경로 없음          | 최소안: 현업 PC `~/.sapstack` 세션 로그를 주 1회 수집 → codify → symptom 후보 검토. 결정 필요(PII·동의)              | 🧑 정책 → 🤖 | 주간 codify 산출물 1건                      |

## P3 — desktop-readiness 잔여 (2026-08-27 계획, 이번에 재검증 안 함)

| #   | 항목                                  | 비고                                                                              | 담당 |
| --- | ------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| 15  | EV 코드 서명                          | 리드타임이 일정을 결정. 미서명 exe는 현업 PC SmartScreen 경고                       | 🧑   |
| 16  | Air-gapped 모드 토글                  | Sentry·업데이트·클라우드 LLM 일괄 차단. 폐쇄망 현장 전제                            | 🤖   |
| 17  | 라이선스 화면 (BSL + Apache-2.0)       | BSL 파라미터는 사용자 결정                                                         | 🧑→🤖 |
| 18  | 데스크톱 테스트 실패 판정              | "71건 실패"는 08-16 수치. 현재 CI `sapstack Desktop typecheck`만 통과 확인, 테스트는 미실행 | 🤖   |
| 19  | 비SAP 기능(messaging/marketing) 노출 제거 | 현업 모드(`ui_mode: simple`)가 일부 가림. 완전 제거 여부 판단                       | 🧑→🤖 |
| 20  | 통계 문자열 stale                      | `package.json` description "20 plugins, 16 agents, 18 commands" vs 실제 24/21/23   | 🤖   |

## 제안 순서

- **1주차 (🤖 반나절)**: #1 → #4 (CI 녹색 → v2.5.0), #2 (스케줄러), #3 (QS4 덤프 구조), #10
- **사용자 병행**: #5 DNS · #7 SICF · #8 npm 토큰 · #15 EV 인증서 — 전부 외부 리드타임이 있는 것
- **2주차**: #11 (로컬 기준선) → #12/#13 (보강) → #14 (환류 정책)
- P3는 v2.5.0 이후, 파일럿 피드백이 우선순위를 정한 뒤
