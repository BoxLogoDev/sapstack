# STATE — sapstack

> 갱신: 2026-09-15 · `main` @ `cd876ec` · **v2.4.1 릴리스 게시(08-20) · 현업 파일럿 진행 중(08-30~) · 미출시 커밋 27개**
> 규약: 규칙은 `AGENTS.md`, 판단은 `decisions/`, 상태는 이 파일. 개선 후보 순위표는
> `plans/2026-09-15-improvement-backlog.md`.

## 지금 어디까지 왔나

**현업 파일럿 국면**이다. v2.4.1이 GitHub Release에 올라갔고(Setup/Portable exe, vsix, MCP tgz),
그 위에 파일럿용 기능을 27커밋 쌓았지만 아직 릴리스로 묶지 않았다:

- **CBO 스냅샷** — DS4 Z/Y 커스텀 코드를 ADT로 수집해 현업이 자기 코드를 질문한다
  (`sap-cbo-explainer` 에이전트 + `/sap-cbo-explain`). 08-31 전 모듈 수집 34,460 오브젝트
  (실패 539, status partial). PII 마스킹 430건, 리포트 420건
- **관리자 프로비저닝 + 현업 모드** — `provision.yaml` 하나로 무설정 첫 실행, 홈 화면 단순화
- **로컬 LLM 제로 셋팅** — 연결 전무 + GGUF 발견 시 자동 연결. 깨끗한 PC E2E 스모크 통과.
  08-19 STATE의 "pi-agent-server 미포함으로 로컬 채팅 불가"는 이 시점에 **해소**
- **배포 킷 3종** `dist-cbo/`(git 미추적) — 일반 264MB / Qwen3-4B 2.9GB / Qwen3-8B 5.4GB

모델 판단: 4~12B 로컬 모델은 SAP 지식이 없다(F110 질의 3회 전부 오답). 답 품질은 앱의 지식 주입이
결정하고, 품질이 필요하면 프로비저닝 `kind: api_key`(클라우드)가 정답. 근거는 메모리 `sapstack-pilot`.

## 열린 것 (2026-09-15 전수 재검증)

| 항목                                               | 상태·증거                                                                                                                                                                                          | 다음 행동                                                                                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **🔴 CI main 적색 — 08-29부터 12회 연속**           | ① runtime 테스트의 카탈로그 고정값 stale(에이전트 21·커맨드 23 vs 20·22 — CBO 기능이 각 1개 추가) ② `check-links --strict`: electron `resources/AGENTS.md` → `release-notes/next.md` 끊어짐(527240f에서 next.md 삭제, 문단만 잔존) | 두 건 **09-15 로컬 수정 완료** — 테스트 고정값 21/23, AGENTS.md 문단을 CHANGELOG 기반 실제 흐름으로 갱신(next.md는 복원하면 앱 패널에 유령 버전으로 뜨므로 미복원)| 두 건 **09-15 로컬 수정 완료** — `npm test` 36/36, `check-links` 0건. 커밋·푸시 → CI 녹색 확인 → v2.5.0 컷                                  |
| **🔴 CBO 야간 스케줄러가 한 번도 돌지 않았다**        | `sapstack-cbo-export-DS4` Last Result `0x800710E0`, `DS4/meta/export-log.txt` 부재, 스냅샷 `exported_at` 08-30 23:30Z 고정. 태스크 XML `DisallowStartIfOnBatteries=true` + `InteractiveToken`   | `register-task.ps1`에 배터리 허용 설정 반영 → 재등록 → `schtasks /Run` 1회 실측. 로그온 없이 돌릴지(`/RU`+비밀번호 또는 S4U) 결정 필요       |
| **🟠 QS4 전체 덤프 774MB가 임시 폴더에**             | 세션 `13bf26e0…` 스크래치패드 `ps4/qs4-full/`(패키지 228, `.md` 59k) + `abapdump/` 도구. 세션 정리 시 소멸                                                                                          | 영구 위치로 복사. 제안: 덤프 `~/.sapstack/cbo/QS4-dump/`, 도구 `scripts/cbo/abapdump/`. **위치는 사용자 결정**                               |
| 🟡 npm MCP 2.4.1 미발행                             | `npm view` = 2.4.0. `E404 PUT` = 토큰 만료 그대로                                                                                                                                                  | **사용자**: Automation 토큰 재발급 → `NPM_TOKEN` secret 갱신 → release 워크플로 rerun                                                        |
| 🟡 공유폴더 게시 막힘                                | `lsitc-fs01` DNS 미해석(09-15 재확인). 스케줄러 robocopy와 provision `shareRoots` 모두 여기로 향함                                                                                                   | **사용자**: 서버 개통/호스트명 확인. 열리면 스케줄러가 자동 게시                                                                            |
| 🟡 배포 전 시크릿 25건 검토                          | `DS4/meta/pii-report.json` reported 420 중 시크릿 25                                                                                                                                              | 25건 열람 → 진짜 시크릿이면 마스킹 규칙 추가                                                                                                |
| 🟡 PS4 ADT HTTP 403                                 | `/sap/bc/adt` ICF 비활성. QS4/DS4는 정상                                                                                                                                                           | **사용자**: Basis에 SICF 활성화 요청(읽기 전용 수집 목적 명시)                                                                              |
| `npm run cbo:test` 로컬 실패                        | Node 24가 `scripts/cbo/tests/` 디렉터리 인자를 `MODULE_NOT_FOUND`. CI에는 없는 테스트                                                                                                              | 스크립트를 파일 패턴으로                                                                                                                    |
| 로컬 LLM 답 품질 기준선 없음                         | `docs/eval/pilot-local.json` 0.316은 08-17 4건, 제로 셋팅·지식 주입 이전 측정. 클라우드 0.638(58건)                                                                                                | Qwen3-4B/8B로 gold-set 58건 재실행 → 격차 수치화                                                                                            |

## 다음 한 걸음

**CI를 녹색으로 되돌리고 v2.5.0을 컷한다.** 수정 2건은 로컬에 있다(미커밋). 커밋·푸시 → CI 확인 →
`scripts/bump-version.sh` → CHANGELOG `[Unreleased]`를 `[2.5.0]`으로 → 태그. 27커밋의 파일럿
기능이 릴리스 없이 배포 ZIP으로만 나가 있어, 현업 PC 앱은 "2.4.1"을 표시하는 미출시 코드다.

## 건드리면 안 되는 것

- `data/eval/gold-set.yaml` — 시험지. 에이전트가 열람하면 채점이 무의미해진다
- `mcp/assets/` — gitignore 된 빌드 생성물. 고치려면 `mcp/build.mjs` 를 고친다
- `~/.sapstack/.env` — SAP 비밀번호 평문. 공유·커밋 금지
- CI-parity 규율: push 전 로컬 게이트 `--strict` 선검증 + bump 후 `build-multi-ai --write`
- 빌드 중 `git checkout` 금지. 빌드는 `build-win.ps1 -KeepRunningProcesses` 절대경로로(메모리 `sapstack-build-windows`)
