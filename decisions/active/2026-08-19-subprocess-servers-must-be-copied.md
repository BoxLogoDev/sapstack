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

## ⚠️ 정정 (2026-08-20) — 이 결정은 아직 **효력이 없다**

v2.4.1 을 릴리스하고 설치본을 실측한 결과, `dist/resources/` 에 `pi-agent-server` 와
`session-mcp-server` 가 **여전히 없다**. `llama` 는 들어왔다(정적 `resources/` 를 통해).

위 결정이 잘못된 게 아니라 **적용 지점이 틀렸다.** 자산 복사 스크립트가 두 개다:

| 스크립트                                          | 무엇을 복사하나                   | 누가 부르나                                             |
| ------------------------------------------------- | --------------------------------- | ------------------------------------------------------- |
| `scripts/electron-build-resources.ts` (수정된 것) | 정적 자산 **+ 서브프로세스 서버** | `electron:build` 체인 (package.json:70)                 |
| `apps/electron/scripts/copy-assets.ts`            | 정적 자산 + sapstack 에셋만       | **`build-win.ps1:396`** — 설치파일을 만드는 유일한 경로 |

`build-win.ps1` 은 `bun run electron:build` 를 통째로 부르지 않고 조각(esbuild main,
`electron:build:preload`, `vite build`, `copy-assets.ts`)을 직접 부른다. 그래서 수정된
스크립트가 **Windows 설치파일 경로에서 한 번도 실행되지 않았다.** `copy-assets.ts` 396행
주석의 "Single source of truth" 는 사실이 아니다.

### 왜 아직 안 고쳤나

`build-win.ps1` 에 `server:build:subprocess` + `electron:build:resources` 를 추가하려
했으나, **`pi-agent-server` 가 로컬에서 빌드되지 않는다**:

```
error: Could not resolve: "@aws-crypto/crc32"
  at node_modules/.bun/@earendil-works+pi-ai@0.80.6+.../
     @smithy/node-http-handler/node_modules/@smithy/core/dist-cjs/submodules/event-streams/index.js:1
```

- `@smithy/core@3.25.1` 이 `@aws-crypto/crc32: 5.2.0` 을 정식 dependency 로 선언한다
- `apps/desktop/bun.lock` 에도 등재돼 있고 `apps/desktop/node_modules/@aws-crypto/crc32` 는 존재한다
- 그런데 `apps/desktop/node_modules/@earendil-works/pi-ai` 는 **저장소 루트** 스토어
  (`sapstack/node_modules/.bun/`) 로 심링크돼 있고, 그 스토어에는 crc32 가 없다
- `bun install --frozen-lockfile` 재실행으로도 복구되지 않았다

**추적 결과 — 루트 `node_modules` 를 두 패키지 매니저가 나눠 쓰고 있다.**

- 루트 `package.json` 의 workspaces 는 `["packages/*", "mcp", "extension"]` 로,
  **`apps/desktop` 을 포함하지 않는다**. `apps/desktop` 은 자기 `bun.lock` 과 자기
  workspaces 를 가진 독립 루트다
- 그런데 `apps/desktop` 에서 `bun install` 을 돌리면 bun 이 위로 올라가
  루트 `package.json` 의 workspaces 필드를 보고 **`sapstack/` 을 모노레포 루트로 오인**해
  스토어를 거기에 만든다
- 같은 `sapstack/node_modules` 를 ci.yml 이 `npm ci` (packages/runtime · mcp · extension)
  로 따로 관리한다. npm 의 prune 이 bun 이 놓은 것을 걷어내면서 서브트리가 잘린다
- 실증: 해석 경로에 `@aws-crypto/crc32` 를 수동 배치하니 다음 결핍(`@aws-crypto/util`),
  그 다음(`tslib`)이 연쇄로 드러났다 — 버전 충돌이 아니라 **서브트리 전체 부재**다
  (확인 후 `node_modules` 는 원상 복구했다)

검증되지 않은 빌드 단계를 릴리스 워크플로에 넣으면 방금 복구한 파이프라인이 다시 깨진다.
**클린 체크아웃에서 `bun install` 후 `bun run server:build:subprocess` 가 통과하는지
먼저 확인**한 다음 `build-win.ps1` 을 고칠 것.

CI 러너는 매번 클린 체크아웃이라 통과할 가능성이 높지만(같은 `sapstack/node_modules` 를
npm 과 bun 이 순서대로 쓰기 때문에 CI 에서도 재현될 여지가 있다), 추측으로 워크플로를
바꾸지 않는다. 개발 머신에서 확인하지 못한 이유는 디스크 여유가 8.2G 뿐이라
클린 클론을 만들 수 없었기 때문이다.

> 근본 수리라면 `apps/desktop` 이 루트를 모노레포 루트로 오인하지 않게 만드는 것이다
> (루트 workspaces 에 명시적으로 넣거나, `apps/desktop` 에 경계를 세우거나).
> 이 결정 레코드의 범위를 넘으므로 별도 판단이 필요하다.

### 사용자 영향 (현재)

설치본 2.4.1 에서도 **로컬 모델 채팅은 여전히 `piServerPath not configured` 로 죽는다.**
v2.4.1 이 실제로 고친 것은 릴리스 파이프라인과 자동 업데이트 경로이지 이 결함이 아니다.
