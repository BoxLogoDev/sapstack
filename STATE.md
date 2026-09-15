# STATE — sapstack

> 갱신: 2026-09-15 오후 · `main` = origin(백로그 진행 커밋 포함) · **CI 녹색 복구(08-20 이후 처음) · v2.5.0 Release 게시(자산 5종, npm publish만 실패) · DS4 첫 실제 수집 완료(13:14) · 현업 파일럿 진행 중(08-30~)**
> 규약: 규칙은 `AGENTS.md`, 판단은 `decisions/`, 상태는 이 파일. 개선 후보 순위표는
> `plans/2026-09-15-improvement-backlog.md`.

## 지금 어디까지 왔나

**현업 파일럿 국면**이다. v2.4.1이 GitHub Release에 올라갔고(08-20), 그 위에 파일럿용 기능
27커밋(CBO 스냅샷·관리자 프로비저닝·현업 모드·공급 채널·로컬 LLM 제로 셋팅)을 쌓았다.
09-15에 이것을 **v2.5.0으로 릴리스했다**: 버전 일괄 갱신, CHANGELOG `[2.5.0]`, 한국어 릴리스 노트,
태그 `v2.5.0` → `d255f5f` 푸시(13:50) → release run 34930314696이 GitHub Release와 자산 5종
(Setup/Portable exe, latest.yml, vsix, MCP tgz)을 게시. `Publish MCP to npm` 단계만 토큰 만료(E404)로 실패.

09-15에 함께 고친 것 (모두 `main`에 푸시, CI run 34921336264 전 잡 녹색):

- **CI 적색 원인 5종** — ① runtime 테스트 카탈로그 고정값(에이전트 21·커맨드 23) ② electron
  `resources/AGENTS.md`의 `release-notes/next.md` 끊어진 링크 ③ `build-multi-ai.sh --check`가
  옛 marketplace 스키마(`"id"`)로 플러그인 0개 ④ `@types/bun: "latest"` 두 곳 → frozen lockfile
  드리프트 ⑤ OAuth 테스트 2파일이 `globalThis.fetch`를 404 mock으로 바꾸고 복원 안 함 →
  러너의 파일 순서에 따라 webui http-server 테스트 6건 404. ①②는 08-29부터, ③은 08-20 이후
  Content Gates가 링크 검사에서 멈춰 숨어 있었고, ④⑤는 ①②를 고친 뒤에야 드러났다
- **CBO 야간 스케줄러** — 배터리 시작 허용·놓친 시각 실행·robocopy 재시도 상한. 오전 불통 시엔
  치명 가드가 직전 스냅샷을 보존했고(정상), **12:27 사내망 복귀 후 첫 실제 수집을 47분 만에 완료**했다 —
  오브젝트 34,496/파일 33,957/실패 539(08-30과 같은 ADT 404 PROG), git 178파일 변경, status partial
- **QS4 정례화** — `export-cbo.mjs`가 `~/.sapstack/.env.<SID>` 오버레이(URL/클라이언트만)를 읽고,
  `sapstack-cbo-export-QS4` 평일 07:30 태스크 등록. dry-run ZFI1 1,937건으로 시스템 전환 확인
- **시크릿 25건 열람** — 24건은 주석 처리된 `PASSWORD = ' '` 자리표시자(오탐) → 규칙에서 공백
  리터럴 제외(테스트 추가). 진짜 1건 `zhr0/zhrrd015.prog.abap:108`(HR 리포트 접근코드)은 사용자
  결정으로 마스킹 승격 — 리터럴을 `'***'`로 치환. DS4 재수집(오후)으로 스냅샷에 반영
- **백로그 정리** — runtime 테스트 고정값을 asset-manifest 대조로, 통계 문자열 갱신, #18/#20 종료
- **QS4 전체 덤프 영구화** — `~/.sapstack/cbo/QS4-dump/`(59,264파일) + `~/.sapstack/cbo/abapdump-tool/`

모델 판단: 4~12B 로컬 모델은 SAP 지식이 없다(F110 질의 3회 전부 오답). 답 품질은 앱의 지식 주입이
결정하고, 품질이 필요하면 프로비저닝 `kind: api_key`(클라우드)가 정답. 근거는 메모리 `sapstack-pilot`.

## 열린 것 (2026-09-15)

| 항목                                          | 상태·증거                                                                                                                                                | 다음 행동                                                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 v2.5.0 릴리스                               | Release 게시 완료(run 34930314696): Setup 256MB · Portable 256MB · latest.yml · vsix · MCP tgz. `gh release view v2.5.0`                                   | 현업 PC 업데이트 안내(latest.yml이 있어 앱 자동 업데이트 대상). npm은 아래 항목                                                                                  |
| 🟢 CBO 스냅샷 신선도                           | DS4 `exported_at` 2026-09-15T04:14Z — 스케줄러 경로 첫 실제 수집. QS4 첫 정례 실행은 09-16 07:30                                                            | 09-16 06:30 DS4 무인 실행과 07:30 QS4 첫 스냅샷(`~/.sapstack/cbo/QS4/manifest.yaml`) 확인. 게시 robocopy는 DNS로 실패                                            |
| 🟡 npm MCP 미발행                              | `npm view` = 2.4.0. release run 34930314696의 `Publish MCP to npm`이 E404(토큰 만료)로 실패 — 09-15 재확인                                                  | **사용자**: Automation 토큰 재발급 → `NPM_TOKEN` secret 갱신 → run 34930314696 "Re-run failed jobs"(같은 태그)                                                     |
| 🟡 공유폴더 게시 막힘                           | `lsitc-fs01` DNS 미해석(09-15 재확인)                                                                                                                     | **사용자**: 서버 개통/호스트명 확인. 열리면 스케줄러가 자동 게시                                                                                                 |
| 🟢 시크릿 처리                                  | 24건 오탐은 규칙에서 제외, 남은 1건 `zhr0/zhrrd015.prog.abap:108`은 사용자 결정으로 마스킹 승격(`'***'`). DS4 재수집(09-15 오후)으로 스냅샷 반영                | 재수집 후 pii-report `hardcoded_secret` masked:true 확인                                                                                                         |
| 🟡 PS4 ADT HTTP 403                            | `/sap/bc/adt` ICF 비활성                                                                                                                                  | **사용자**: Basis에 SICF 활성화 요청(읽기 전용 수집 목적 명시)                                                                                                    |
| 데스크톱 테스트 격리                            | 전역 `fetch`를 바꾸는 테스트 파일 9개 중 복원 없던 2개 수정. bun test는 373파일을 한 프로세스에서 돌리고 파일 순서가 러너마다 달라 누출이 잠복한다             | 새 테스트에서 전역 스텁은 반드시 `afterEach/afterAll` 복원. `--frozen-lockfile` 드리프트 방지로 `"latest"` 지정 금지                                               |
| 로컬 LLM 답 품질 기준선 없음                    | `docs/eval/pilot-local.json` 0.316은 08-17 4건, 제로 셋팅·지식 주입 이전. 이 PC 여유 RAM 3.7GB라 세션과 병행 불가                                            | PC 여유 시 로컬 eval 실행(명령은 백로그 #13) → 클라우드 0.638과 격차 수치화                                                                                      |
| 스크래치패드 잔재                               | lock 드리프트 재현용 worktree(`…/scratchpad/wt-main`, node_modules 포함)가 경로 길이 오류로 자동 삭제 실패                                                   | 사용자 승인 시 재귀 삭제 후 `git worktree prune`                                                                                                                 |

## 다음 한 걸음

현업 PC에 v2.5.0 업데이트를 안내하고, npm 토큰을 갱신해 release run의 실패 잡을 재실행한다.
내일 06:30 DS4 무인 실행과 07:30 QS4 첫 스냅샷을 확인한다.

## 건드리면 안 되는 것

- `data/eval/gold-set.yaml` — 시험지. 에이전트가 열람하면 채점이 무의미해진다
- `mcp/assets/` — gitignore 된 빌드 생성물. 고치려면 `mcp/build.mjs` 를 고친다
- `~/.sapstack/.env` — SAP 비밀번호 평문. 공유·커밋 금지. `.env.<SID>`에는 URL/클라이언트만 두고 비밀번호를 복제하지 않는다
- CI-parity 규율: push 전 `ci.yml`의 게이트를 **전부** 로컬 실행(첫 실패에서 멈추므로 뒤 게이트 고장이 숨는다) + bump 후 `build-multi-ai --write`
- 빌드 중 `git checkout` 금지. 빌드는 `build-win.ps1 -KeepRunningProcesses` 절대경로로(메모리 `sapstack-build-windows`)
- electron `resources/release-notes/`에 `next.md` 같은 비버전 파일 금지 — 로더가 모든 .md를 버전으로 읽는다
