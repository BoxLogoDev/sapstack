# sapstack for VS Code (Stub — Contract v1.0.0)

> **⚠️ v1.5.0 상태**: Evidence Loop 명령 계약이 정의된 stub.
> 실제 TypeScript 구현은 **v1.6.0**에서 수행합니다.

이 디렉토리는 VS Code Extension의 **명령 계약(Command Contract)**을 먼저
고정하기 위한 stub입니다. `package.json`의 `contributes`가 이 계약을
JSON Schema처럼 작동해요 — v1.6.0 실장자는 이 계약을 반드시 만족시켜야
합니다.

설계 이유: Evidence Loop는 파일 시스템(YAML)에 모든 세션 상태를 저장하므로,
VS Code Extension은 **백엔드 서비스 없이** 순수하게 파일을 읽고 쓰는 얇은
레이어만 있으면 됩니다. 먼저 계약을 고정하고 나중에 실장하는 순서가 안전합니다.

---

## 🎯 명령 계약 (v1.6.0 실장자 필수 준수)

### 🔁 Evidence Loop 명령 (10개)

| 명령 ID | 역할 | 내부 동작 |
|---|---|---|
| `sapstack.session.start` | 새 세션 시작 | Quick Pick으로 증상 입력 → `/sap-session-start` CLI 호출 or 직접 state.yaml 생성 |
| `sapstack.session.resume` | 기존 세션 재개 | sessions/ 아래 선택 → state.yaml 로드 → 사이드바에 표시 |
| `sapstack.session.viewEvidence` | Bundle 열람 | 현재 세션의 `bundles/evb-*.yaml` 목록 → 선택 → YAML 에디터로 열기 |
| `sapstack.session.addEvidence` | 증거 추가 | 파일 선택 → 해시 계산 → PII 스캔 → Bundle YAML 생성 |
| `sapstack.session.nextTurn` | Hypothesis/Verify 턴 실행 | 현재 상태에 따라 Claude API 또는 CLI bridge |
| `sapstack.session.showFollowup` | Follow-up을 체크리스트로 | `pending_followup_request_id` → 체크리스트 뷰 렌더링 |
| `sapstack.session.showVerdict` | Verdict 표시 | 최신 verdict.yaml 읽어 WebView로 렌더 |
| `sapstack.session.handoff` | 다른 surface로 이동 | from/to 선택 → handoff_history append → zip export 옵션 |
| `sapstack.session.exportBundle` | 세션 공유 패키지 | `.sapstack/sessions/{id}/` 통째 zip |
| `sapstack.session.openInWeb` | 웹 뷰어로 열기 | `sapstack.webViewerUrl` + 쿼리스트링으로 외부 브라우저 실행 |

### 📚 기존 유틸리티 명령 (유지)

| 명령 ID | 역할 |
|---|---|
| `sapstack.resolveNote` | 키워드로 SAP Note 검색 (data/sap-notes.yaml) |
| `sapstack.checkTcode` | T-code 유효성 검증 (data/tcodes.yaml) |
| `sapstack.listPlugins` | 14개 플러그인 목록 Quick Pick |
| `sapstack.runQualityGates` | 8개 품질 게이트 실행 |

---

## 🌲 Tree View 계약

### View: `sapstack.sessions` (Active Sessions)

각 세션은 **TreeItem**으로 표시. `viewItem: sessionItem`.

```
📁 Active Sessions
├── 🟢 sess-20260412-m2p9xt · resolved · F110 Proposal 실패
│   ├── 📦 Turn 1 — INTAKE (Bundle evb-...-a7k3qz)
│   ├── 💡 Turn 2 — HYPOTHESIS (4 hypotheses)
│   ├── 📥 Turn 3 — COLLECT (Bundle evb-...-d9p2xr)
│   └── ⚖️ Turn 4 — VERIFY (Verdict vdc-...-c4n8qw)
├── 🟡 sess-20260411-xyz00z · awaiting_evidence · MIGO 포스팅
└── 🔴 sess-20260410-abc99z · escalated · ST22 덤프
```

각 턴 노드를 클릭하면 해당 YAML 파일이 에디터에 열려야 합니다.

### View: `sapstack.followups` (Pending Follow-ups)

`status == awaiting_evidence`인 세션의 `pending_followup_request_id`만 집계.
각 요청을 개별 체크리스트로 표시:

```
📋 Pending Follow-ups
├── sess-20260412-m2p9xt · flr-...-b8m2nc (22분 예상)
│   ├── ☐ chk-001 · critical · LFB1 ZWELS 확인 (3분)
│   ├── ☐ chk-002 · high · FBZP 뱅크 매핑 (7분)
│   └── ☐ chk-003 · medium · ST22 덤프 검색 (4분)
```

체크박스를 클릭하면 "이 체크 완료"로 마크하고, 모든 critical/high가 완료되면
자동으로 "다음 턴 실행" 버튼 활성화.

### View: `sapstack.plugins` (Installed Plugins)

14개 플러그인 목록 + sap-session 플러그인. 각 플러그인 클릭 시 SKILL.md 열기.

---

## 🛡 YAML 검증 (yamlValidation)

이 기능은 **Red Hat YAML 확장**이 설치된 경우 **즉시 동작**합니다. 즉,
v1.5.0 stub 상태에서도 사용자가 세션 YAML을 편집할 때 스키마 기반
IntelliSense가 제공돼요.

```json
"yamlValidation": [
  {
    "fileMatch": ".sapstack/sessions/*/state.yaml",
    "url": "https://boxlogodev.github.io/sapstack/schemas/session-state.schema.yaml"
  },
  ...
]
```

**중요**: 이 URL은 GitHub Pages에 schemas/ 디렉토리가 배포되어야 합니다.
Slice 7에서 MCP 서버 구현과 함께 GitHub Pages 배포 워크플로우도 구성합니다.

---

## ⚙️ 설정 계약

| 설정 키 | 기본값 | 역할 |
|---|---|---|
| `sapstack.sapstackPath` | `sapstack` | sapstack 리포지토리 경로 |
| `sapstack.language` | `auto` | 응답 언어 (ko/en/de/ja/auto) |
| `sapstack.country` | `kr` | 로컬라이제이션 (kr/de/us/jp/none) |
| `sapstack.sessionsRoot` | `.sapstack/sessions` | 세션 디렉토리 |
| `sapstack.defaultRelease` | `Unknown` | SAP 릴리스 기본값 |
| `sapstack.showInStatusBar` | `true` | 상태 바에 현재 세션 ID 표시 |
| `sapstack.autoOpenFollowup` | `true` | Turn 2 후 자동으로 Follow-up 뷰 열기 |
| `sapstack.piiScanEnabled` | `true` | 업로드 전 PII 스캔 |
| `sapstack.webViewerUrl` | GitHub Pages URL | openInWeb 대상 |

---

## 🚀 v1.6.0 구현 로드맵 (참고)

### Phase 1 — 읽기만 (1-2 weeks)
- `src/extension.ts` activation
- `src/providers/sessionTreeProvider.ts` — sessions/ 디렉토리 스캔 → Tree 표시
- `sapstack.session.viewEvidence` — 파일 열기
- `sapstack.session.resume` — 사이드바 포커스
- YAML validation 동작 확인 (실제 코드 없이도 Red Hat YAML로 동작)

### Phase 2 — 쓰기 + Bundle 생성 (2 weeks)
- `src/commands/addEvidence.ts` — 파일 선택 → 해시 → YAML 생성
- `src/lib/piiScanner.ts` — 주민번호/카드/패스워드 패턴
- `sapstack.session.addEvidence` 완성
- Drag & drop from Explorer into session node

### Phase 3 — 루프 자동화 (2-3 weeks)
- `src/commands/nextTurn.ts` — Claude API 호출 OR CLI bridge
- `src/webviews/followupChecklistView.ts` — WebView UI
- `src/webviews/verdictView.ts` — Verdict 렌더링
- Sync with CLI commands (동일 세션을 CLI와 IDE가 동시에 편집)

### Phase 4 — 에스컬레이션 (1-2 weeks)
- `sapstack.session.handoff` + zip export
- `sapstack.session.openInWeb` — 외부 URL 실행
- Marketplace publishing (`vsce publish`)

**총 예상**: 6-9주 (v1.6.0)

---

## 💡 지금 당장 (v1.5.0 stub) 얻을 수 있는 것

stub 상태에서도 다음이 즉시 동작합니다:

1. ✅ **YAML 검증** — Red Hat YAML 확장만 설치하면 스키마 기반 IntelliSense
2. ✅ **스니펫** — `abap.code-snippets` + `sapstack-schemas.code-snippets`
3. ✅ **VS Code의 YAML 기본 네비게이션** — Outline view, breadcrumbs
4. ✅ **파일 시스템 기반 세션 공유** — CLI로 생성한 `.sapstack/sessions/` 디렉토리를
   다른 팀원이 열면 같은 VS Code 워크스페이스에서 볼 수 있음

---

## 🔒 보안 설계 원칙 (v1.6.0 실장자 준수 필수)

1. **외부 전송 금지** — 증거 파일을 어떤 클라우드에도 업로드하지 않음
2. **PII 차단** — 주민번호·카드번호 감지 시 Bundle 생성 거부
3. **로컬 YAML만** — 세션 상태는 워크스페이스 파일 시스템에만 존재
4. **CLI와 호환** — IDE가 저장한 YAML을 CLI가 읽을 수 있어야 함 (스키마 준수)
5. **최소 권한** — 확장은 workspace 파일 권한만 요청. 네트워크 권한은 webViewerUrl 실행에만

---

## 📖 관련 문서

- `package.json` — 매니페스트 (명령 계약 원본)
- `plugins/sap-session/skills/sap-session/SKILL.md` — Evidence Loop 규약
- `schemas/session-state.schema.yaml` — 세션 상태 스키마
- `aidlc-docs/sapstack/escalation-flow.md` — 표면 간 이동 규약
- `web/session.html` — Surface C read-only viewer (VS Code IDE가 피벗해도 됨)
