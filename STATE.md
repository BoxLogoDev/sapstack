# STATE — sapstack

> 갱신: 2026-09-15 · `main` @ `d255f5f` · **CI 녹색 복구(08-20 이후 처음) · v2.5.0 태그 로컬 생성, 푸시 대기 · 현업 파일럿 진행 중(08-30~)**
> 규약: 규칙은 `AGENTS.md`, 판단은 `decisions/`, 상태는 이 파일. 개선 후보 순위표는
> `plans/2026-09-15-improvement-backlog.md`.

## 지금 어디까지 왔나

**현업 파일럿 국면**이다. v2.4.1이 GitHub Release에 올라갔고(08-20), 그 위에 파일럿용 기능
27커밋(CBO 스냅샷·관리자 프로비저닝·현업 모드·공급 채널·로컬 LLM 제로 셋팅)을 쌓았다.
09-15에 이것을 **v2.5.0으로 묶는 준비를 끝냈다**: 버전 일괄 갱신, CHANGELOG `[2.5.0]`,
한국어 릴리스 노트, 로컬 annotated 태그 `v2.5.0` → `d255f5f`. 태그 푸시만 남았다.

09-15에 함께 고친 것 (모두 `main`에 푸시, CI run 34921336264 전 잡 녹색):

- **CI 적색 원인 5종** — ① runtime 테스트 카탈로그 고정값(에이전트 21·커맨드 23) ② electron
  `resources/AGENTS.md`의 `release-notes/next.md` 끊어진 링크 ③ `build-multi-ai.sh --check`가
  옛 marketplace 스키마(`"id"`)로 플러그인 0개 ④ `@types/bun: "latest"` 두 곳 → frozen lockfile
  드리프트 ⑤ OAuth 테스트 2파일이 `globalThis.fetch`를 404 mock으로 바꾸고 복원 안 함 →
  러너의 파일 순서에 따라 webui http-server 테스트 6건 404. ①②는 08-29부터, ③은 08-20 이후
  Content Gates가 링크 검사에서 멈춰 숨어 있었고, ④⑤는 ①②를 고친 뒤에야 드러났다
- **CBO 야간 스케줄러** — 배터리 시작 허용·놓친 시각 실행·robocopy 재시도 상한. 기동과 로그
  기록은 실측 확인했으나 **이 PC는 09-15 현재 DS4/QS4/PS4 모두 TCP 불통**이라 0건 → 치명 가드가
  직전 스냅샷을 보존했다(정상 동작). 실제 수집은 사내망에서의 다음 06:30 실행이 첫 검증
- **QS4 전체 덤프 영구화** — `~/.sapstack/cbo/QS4-dump/`(59,264파일) + `~/.sapstack/cbo/abapdump-tool/`

모델 판단: 4~12B 로컬 모델은 SAP 지식이 없다(F110 질의 3회 전부 오답). 답 품질은 앱의 지식 주입이
결정하고, 품질이 필요하면 프로비저닝 `kind: api_key`(클라우드)가 정답. 근거는 메모리 `sapstack-pilot`.

## 열린 것 (2026-09-15)

| 항목                                          | 상태·증거                                                                                                                                                | 다음 행동                                                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🔴 v2.5.0 태그 푸시**                        | 로컬 태그 `v2.5.0` = `d255f5f`(= origin/main, CI 녹색). 자동 모드 정책이 공개 릴리스 생성(태그 푸시)을 차단                                                 | **사용자**: `git push origin v2.5.0` → `release.yml`(desktop-windows 빌드 → Release 생성 → npm publish). npm publish는 토큰 만료로 실패 예상, Release 자산은 올라감 |
| **🔴 CBO 스냅샷 신선도**                       | 스냅샷 `exported_at` 08-30 23:30Z 고정. 스케줄러는 복구됐으나 이 PC에서 SAP 3계 TCP 불통                                                                   | 사내망 연결 상태에서 06:30 이후 `DS4/meta/export-log.txt`와 manifest `exported_at` 확인                                                                          |
| 🟡 npm MCP 미발행                              | `npm view` = 2.4.0. 토큰 만료(E404)                                                                                                                       | **사용자**: Automation 토큰 재발급 → `NPM_TOKEN` secret 갱신 → release 워크플로 rerun                                                                            |
| 🟡 공유폴더 게시 막힘                           | `lsitc-fs01` DNS 미해석(09-15 재확인)                                                                                                                     | **사용자**: 서버 개통/호스트명 확인. 열리면 스케줄러가 자동 게시                                                                                                 |
| 🟡 배포 전 시크릿 25건 검토                     | `DS4/meta/pii-report.json` reported 420 중 시크릿 25                                                                                                     | 25건 열람 → 진짜 시크릿이면 마스킹 규칙 추가                                                                                                                     |
| 🟡 PS4 ADT HTTP 403                            | `/sap/bc/adt` ICF 비활성                                                                                                                                  | **사용자**: Basis에 SICF 활성화 요청(읽기 전용 수집 목적 명시)                                                                                                    |
| 데스크톱 테스트 격리                            | 전역 `fetch`를 바꾸는 테스트 파일 9개 중 복원 없던 2개 수정. bun test는 373파일을 한 프로세스에서 돌리고 파일 순서가 러너마다 달라 누출이 잠복한다             | 새 테스트에서 전역 스텁은 반드시 `afterEach/afterAll` 복원. `--frozen-lockfile` 드리프트 방지로 `"latest"` 지정 금지                                               |
| 로컬 LLM 답 품질 기준선 없음                    | `docs/eval/pilot-local.json` 0.316은 08-17 4건, 제로 셋팅·지식 주입 이전                                                                                   | Qwen3-4B/8B로 gold-set 58건 재실행 → 클라우드 0.638과 격차 수치화                                                                                                |
| 스크래치패드 잔재                               | lock 드리프트 재현용 worktree(`…/scratchpad/wt-main`, node_modules 포함)가 경로 길이 오류로 자동 삭제 실패                                                   | 사용자 승인 시 재귀 삭제 후 `git worktree prune`                                                                                                                 |

## 다음 한 걸음

**`git push origin v2.5.0`** 한 줄이다. 그러면 release 워크플로가 Windows 설치파일·vsix·MCP tgz를
빌드해 GitHub Release를 만든다. 확인할 것: Release 자산 5종(Setup/Portable exe, latest.yml, vsix,
tgz). 그 뒤 현업 PC 업데이트 안내와, 사내망에서 스케줄러 첫 실제 수집 확인.

## 건드리면 안 되는 것

- `data/eval/gold-set.yaml` — 시험지. 에이전트가 열람하면 채점이 무의미해진다
- `mcp/assets/` — gitignore 된 빌드 생성물. 고치려면 `mcp/build.mjs` 를 고친다
- `~/.sapstack/.env` — SAP 비밀번호 평문. 공유·커밋 금지
- CI-parity 규율: push 전 `ci.yml`의 게이트를 **전부** 로컬 실행(첫 실패에서 멈추므로 뒤 게이트 고장이 숨는다) + bump 후 `build-multi-ai --write`
- 빌드 중 `git checkout` 금지. 빌드는 `build-win.ps1 -KeepRunningProcesses` 절대경로로(메모리 `sapstack-build-windows`)
- electron `resources/release-notes/`에 `next.md` 같은 비버전 파일 금지 — 로더가 모든 .md를 버전으로 읽는다
