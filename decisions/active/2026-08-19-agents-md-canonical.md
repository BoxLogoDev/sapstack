# AGENTS.md 를 Universal Rules 정본으로 한다

**날짜** 2026-08-19 · **범위** 저장소 전체 (지시서 3종 + 규칙을 읽는 코드 3곳)

## 배경

같은 Universal Rules 와 응답 포맷이 `CLAUDE.md`(영문)와 `AGENTS.md`(한국어)에 **각각 다른
언어로** 들어 있었고, `.windsurfrules` 는 세 번째 사본이면서 마지막 줄이
"Universal rules source of truth: CLAUDE.md" 라고 **틀린 정본**을 가리켰다.

벤더가 늘면서 문제가 커졌다: Codex 는 `AGENTS.md` 를, Claude Code 는 `CLAUDE.md` 를,
Grok 은 둘 다 읽는다. 세 파일이 어긋나면 **벤더마다 다른 규칙으로 일한다.**

## 결정

`AGENTS.md` = 프로젝트 운영 계약 정본 (전 벤더 공유).
`CLAUDE.md` = Claude/gstack 라우팅만 담는 얇은 포인터.
`.windsurfrules` = 정본 포인터로 축소.

같은 저장소군의 `snapbook-mvp` 가 이미 쓰던 패턴을 채택했다 — 그쪽 CLAUDE.md 첫 줄이
정확히 _"read AGENTS.md … Keep this file limited to Claude/gstack routing so project
instructions do not diverge across agents"_ 였다.

## 근거

- 산업 표준이 `AGENTS.md` 로 수렴 중이고, Codex·Grok 이 이미 그 이름을 읽는다
- CLAUDE.md 는 **Claude 전용 이름**이라 정본이 되면 다른 벤더에게 "남의 파일"이 된다
- 검증된 선례가 같은 저장소군에 있었다(추측이 아니라 실측)

## 버린 대안

| 대안                                             | 왜 안 골랐나                                          |
| ------------------------------------------------ | ----------------------------------------------------- |
| CLAUDE.md 를 정본으로 두고 AGENTS.md 를 포인터로 | Codex·Grok 이 포인터만 읽고 본문을 못 본다. 벤더 편향 |
| 하드링크(`mklink /H`)로 두 이름 묶기             | git 이 링크를 보존하지 않아 clone 마다 재생성 필요    |
| 그대로 두고 동기화 스크립트                      | 동기화할 대상 자체를 없애는 게 싸다                   |

## 여파 (같은 변경에서 함께 고침)

`CLAUDE.md` 를 축소하자 **그 파일을 규칙 소스로 읽던 코드가 빈 규칙을 받게 됐다.**

- `scripts/eval/run.mjs` — `UNIVERSAL_RULES` 를 CLAUDE.md 에서 읽고 있었다.
  방치했으면 gold-set 채점이 규칙 없이 돌아 **조용히 무의미해졌다**
- `mcp/build.mjs`, `apps/desktop/.../copy-assets.ts` — 자산 복사 대상
- `mcp/server.ts` — `sapstack://rules/universal` 리소스

**교훈: 지시서를 코드가 읽는다. 파일 역할을 바꾸면 소비 지점을 grep 해야 한다.**

## 뒤집는 조건

- Claude Code 가 `AGENTS.md` 를 1급으로 읽게 되면 `CLAUDE.md` 자체가 불필요해진다
- 업계 표준이 다른 파일명으로 옮겨가면 (현재 징후 없음)
