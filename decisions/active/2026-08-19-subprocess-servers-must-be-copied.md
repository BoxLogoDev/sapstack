# 서브프로세스 서버는 빌드가 dist/resources 로 복사한다 (빌드 시점에 시끄럽게 실패)

**날짜** 2026-08-19 · **범위** `apps/desktop/scripts/electron-build-resources.ts`, `electron-builder.yml`

## 배경

설치된 sapstack Desktop 2.4.0 에서 로컬 모델 채팅이 **매번** 이 오류로 죽었다:

```
Error: piServerPath not configured. Cannot spawn Pi subprocess.
```

앞선 라운드(2026-08-19)에서 이 증상에 **온보딩 사전 검증**을 붙였지만, 그것은 "미리
알려주기"였지 원인 수리가 아니었다. 사용자가 실제 앱 화면을 공유해 다시 드러났다.

## 근본 원인

`resolveServerPath`(`packages/shared/src/agent/backend/internal/runtime-resolver.ts:171-182`)는
패키징된 앱에서 `<appRoot>/dist/resources/<serverName>/index.js` 를 찾는다.

그런데 **그 디렉토리를 만드는 주체가 없었다.**

- `packages/pi-agent-server/dist/index.js` 는 정상 빌드된다 (`server:build:subprocess`)
- `scripts/electron-build-resources.ts` 는 정적 자산(`apps/electron/resources/`)만 복사했다
- `electron-builder.yml` 의 `files` 는 `resources/pi-agent-server/**` 를 나열했는데,
  **그 소스 경로는 존재한 적이 없다** — glob 이 0건을 매치하고 조용히 통과했다

실측: 설치본 `resources/app/dist/resources/` 24개 항목 중 `pi-agent-server` 없음
(`bridge-mcp-server` 만 있음). `llama` 도 같은 이유로 없다.

## 결정

`electron-build-resources.ts` 가 `packages/<name>/dist` → `dist/resources/<name>` 복사를
담당하고, **산출물이 없으면 `process.exit(1)` 로 빌드를 세운다.**

대상: `pi-agent-server`, `session-mcp-server`.
`electron-builder.yml` 의 존재하지 않는 소스 경로 나열은 제거했다(`dist/**/*` 가 이미 포함).

## 근거

- 조용한 실패가 **설치본에서만** 드러나는 종류였다. 개발 모드는 `resolveUpwards` 로
  `packages/<name>/dist` 를 직접 찾아 항상 동작해서 아무도 못 봤다
- glob 이 0건을 매치해도 electron-builder 는 경고하지 않는다 — 검증이 빌드 스크립트에 있어야 한다
- 검증: `bun run electron:build:resources` 실행 후
  `dist/resources/{pi-agent-server,session-mcp-server}/index.js` 생성 확인

## 버린 대안

| 대안                                                              | 왜 안 골랐나                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `electron-builder.yml` 의 소스 경로를 `packages/*/dist` 로 바꾸기 | files 패턴이 워크스페이스 밖을 가리키면 경로 규칙이 복잡해지고, 여전히 0건 매치를 조용히 통과한다 |
| 온보딩에서 더 친절히 안내                                         | 이미 했고, 원인이 아니다. 사용자는 여전히 채팅을 못 쓴다                                          |
| postinstall 로 런타임에 복사                                      | 폐쇄망 설치본에서 쓰기 권한·타이밍 문제가 생긴다                                                  |

## 뒤집는 조건

- 서브프로세스 서버를 단일 바이너리로 번들하게 되면 이 복사 단계가 불필요해진다
- electron-builder 가 0건 매치 glob 을 오류로 처리하게 되면 검증 위치를 옮길 수 있다

## 남은 확인

**이 수정은 소스에만 반영됐다.** 사용자의 설치본은 수정 전 빌드라 여전히 결함이 있다 —
새 릴리스를 만들어 자동 업데이트로 배포해야 실제로 해소된다.
