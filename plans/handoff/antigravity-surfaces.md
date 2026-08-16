# Antigravity 작업 지시서 — 사용자 접점 표면 (VS Code 확장 + 웹 포털)

> 이 문서를 Antigravity 창에 붙여넣으세요.
> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`

---

## 실행 모드 — Agent Manager 병렬 + 브라우저 검증

당신의 강점(에디터 네이티브 작업, 브라우저 제어, 스크린샷/워크스루 아티팩트)에 맞춰 배정된 영역입니다. **한 번에 답하고 끝내지 말고, 목표에 도달할 때까지 스스로 반복하세요.**

```
GOAL
  sapstack 의 두 사용자 접점 표면을 "실제로 쓸 수 있는 상태"로 만든다.
  둘 다 지금 반쯤 죽어 있다.

성공 기준 (측정 가능 — 전부 충족해야 완료)
  1. extension/ 에 실제 테스트가 존재하고 통과한다
     (현재 package.json 의 test 가 문자 그대로 "echo 'tests pending'" 이다)
  2. npm run compile 이 통과한다 (tsc --noEmit + esbuild)
  3. web/ 3개 화면(index / triage / session)이 브라우저에서 정상 동작한다
     — 콘솔 에러 0, 주요 인터랙션 동작, 스크린샷 첨부
  4. web/ 이 오프라인에서 동작한다 (폐쇄망 고객이 실제 사용자다)
  5. 접근성 기본 통과 — 키보드 조작, 레이블, 대비 4.5:1
  6. 발견한 모든 버그가 재현 절차와 함께 기록된다

자율 루프
  ① 대상 화면/모듈 하나를 고른다
  ② 실제로 실행해 본다 (브라우저로 열고 조작)
  ③ 고친다
  ④ 다시 실행해 검증한다 (스크린샷으로 증거 남김)
  ⑤ 통과할 때까지 ③으로. 다음 대상으로

중단 조건 (멈추고 보고)
  - 같은 문제가 3회 연속 재현
  - 소유가 아닌 파일을 고쳐야만 해결되는 문제
  - SAP 도메인 판단이 필요한 문제 (당신 담당이 아님)
```

---

## 파일 소유권 — 반드시 지킬 것

4개 AI 가 같은 저장소에서 병렬 작업 중입니다.

| AI                      | 소유 디렉토리                                                       |
| ----------------------- | ------------------------------------------------------------------- |
| Claude (오케스트레이터) | `.github/`, `apps/desktop/`, `packages/runtime/`, `mcp/`, 루트 설정 |
| Codex                   | `agents/`, `plugins/`                                               |
| Grok                    | `data/`, `docs/`                                                    |
| **Antigravity (당신)**  | **`extension/`, `web/`**                                            |

> ⛔ 소유가 아닌 디렉토리는 **읽기만** 하세요. 특히 `.github/workflows/` 는 건드리지 마세요 — 게시 자동화는 Claude 가 담당합니다. 필요하면 요청 사항을 보고서에 적으세요.

---

## 배경 — 이 제품이 무엇인가

sapstack 은 SAP 운영자·컨설턴트를 위한 진단 도구입니다. 핵심 특징:

- **라이브 SAP 시스템에 접속하지 않습니다.** 운영자가 ST22 덤프·로그·테이블 조회 결과를 **붙여넣으면** AI 가 가설을 세우고 검증 절차를 제시합니다
- 주 고객은 **폐쇄망(망분리) 환경**입니다. 금융·공공·제조. 인터넷이 없습니다
- 4개 표면이 있습니다: Claude Code 플러그인 / MCP 서버 / **VS Code 확장** / **웹 포털** / 데스크톱 앱

당신이 맡은 두 개가 뒤의 두 표면입니다.

작업 전 읽으세요: `CLAUDE.md`(강제 규칙), `ETHOS.md`(6원칙), `web/README.md`.

---

## 작업 1 — `extension/` (VS Code 확장 v2.4.0)

현재 상태:

```json
"scripts": {
  "compile": "tsc --noEmit && node esbuild.config.js",
  "package": "vsce package --no-dependencies",
  "publish": "vsce publish --no-dependencies",
  "test": "echo 'tests pending'"     ← 테스트가 없다
}
```

확장은 10개 command + 3개 tree view + file watcher + webview + YAML validation 으로 구현돼 있습니다(문서상). **그런데 테스트가 한 줄도 없습니다.**

### 해야 할 것

1. **실제 테스트 작성** — 프레임워크는 저장소 관행을 따르세요. 루트는 `node:test` + `tsx` 를 씁니다(jest 아님, 이 점을 꼭 확인하세요. 과거에 jest 로 쓴 테스트가 실행되지 않고 방치된 전례가 있습니다)
   - 우선순위: command 등록 확인 → YAML 검증 로직 → tree view 데이터 소스 → file watcher
   - `@vscode/test-electron` 이 필요한 통합 테스트는 무리하지 말고, **순수 로직부터** 테스트하세요
2. `npm run compile` 통과 확인
3. `.vsix` 패키징이 실제로 되는지 확인 (`npm run package`)
4. 확장이 참조하는 세션 파일 형식이 현재 스키마와 맞는지 확인 — `schemas/session-state.schema.yaml` (읽기 전용)

---

## 작업 2 — `web/` (정적 포털, Surface C)

파일: `index.html`, `triage.html`/`triage.js`/`triage.css`, `session.html`/`session.js`/`session.css`, `script.js`, `style.css`, `i18n/`

이 포털은 **설치 없이 브라우저만으로 쓰는 진입점**입니다. 폐쇄망에서 특히 가치가 큽니다 — 설치 파일 반입 승인 없이 내부 파일서버에 올려두면 바로 쓸 수 있습니다.

### 해야 할 것

1. **실제로 열어서 전부 조작해 보세요.** 콘솔 에러, 깨진 링크, 동작하지 않는 버튼을 찾으세요
2. **오프라인 동작 보장** — 외부 CDN·폰트·스크립트 의존이 있으면 전부 로컬로 인라인/번들하세요. 폐쇄망에서 외부 요청은 실패합니다
3. **PWA / 오프라인 캐시** — 로드맵 vNext 항목입니다. service worker 로 오프라인 사용을 가능하게 하세요
4. **접근성** — 키보드만으로 전체 플로우 완주 가능해야 합니다. 레이블·대비(4.5:1)·포커스 표시
5. **i18n 정합성** — `web/i18n/` 이 6개 언어(ko/en/zh/ja/de/vi)를 다룹니다. 누락 키를 찾으세요

### 지켜야 할 UX 규칙 (프로젝트 표준)

- 한국어는 **해요체**, 능동형, 긍정형. "저장되었습니다" ✗ → "저장했어요" ✓
- "됩니다" 금지, **"돼요"** 로 통일
- T-code 는 원형 유지: `F110`, `MIGO`, `ST22` — "F110 트랜잭션"이라고 쓰지 마세요
- 예외: 데이터 손실·보안 경고처럼 반드시 멈춰야 하는 순간은 명확성 우선
- 시각 디자인은 기존 `style.css` 의 색·간격·타이포를 따르세요. 임의로 새 스타일을 도입하지 마세요 (프로젝트에 `DESIGN.md` 가 없습니다)

---

## 작업 3 — 데스크톱 앱 UI 검증 (리포트 전용)

데스크톱 앱(`apps/desktop/`)은 **Claude 소유라 수정하면 안 됩니다.** 다만 당신의 UI 검증 능력이 필요합니다.

여력이 되면: 온보딩 플로우(`apps/desktop/apps/electron/src/renderer/components/onboarding/` — WelcomeStep → ProviderSelect → APISetup/LocalModel/Credentials → **SapEnvironmentStep** → Completion)를 **코드 리딩으로** 검토하고, UX 문제를 리포트하세요. 고치지는 마세요.

특히 볼 것: 폐쇄망 사용자가 인터넷 없이 온보딩을 완주할 수 있는가? `LocalModelStep` 으로 우회 가능한가?

---

## 절대 금지

1. ⛔ `agents/`, `plugins/`, `data/`, `docs/`, `mcp/`, `packages/`, `apps/`, `.github/` 편집 (전부 다른 AI 소유)
2. ⛔ 외부 CDN 의존 추가 — 폐쇄망에서 깨집니다
3. ⛔ SAP 도메인 내용(T-code, 진단 절차)을 임의로 작성 — 당신 담당이 아닙니다. 필요하면 보고서에 요청으로 남기세요
4. ⛔ 새 프레임워크·빌드 도구 도입 (React 등). `web/` 은 의도적으로 순수 정적입니다
5. ⛔ 테스트를 jest 로 작성 — 이 저장소는 `node:test` 를 씁니다

---

## 완료 보고 형식 (필수)

```
## EVIDENCE

### 변경 파일
- extension/... : (무엇을 했는지)
- web/... :

### 검증 실행 결과
$ cd extension && npm run compile
(실제 출력)

$ cd extension && npm test
(실제 출력 — "echo tests pending" 이 아니어야 함)

### 브라우저 QA 결과
| 화면 | 콘솔 에러 | 오프라인 | 키보드 조작 | 스크린샷 |
|---|---|---|---|---|
| index.html | | | | |
| triage.html | | | | |
| session.html | | | | |

### 발견한 버그 (고친 것 / 못 고친 것 구분)
| 위치 | 증상 | 재현 절차 | 상태 |
|---|---|---|---|

### Claude 에게 요청할 사항
- (.github/workflows 관련: extension 마켓플레이스 게시 자동화 등)

### 확신하지 못한 부분
- (정직하게. 비어 있으면 오히려 의심합니다)
```
