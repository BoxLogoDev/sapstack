# VS Code Extension QA 리포트 (v2.3 C3)

> 검증 일자: 2026-05-15 · 대상: `extension/` v2.2.3 → v0.1 beta
> 방법: `package.json` contributes.commands ↔ `src/commands/` 핸들러 매핑 정합성 + stub 패턴 스캔 + `npm run compile` (tsc strict + esbuild)

---

## 1. 명령 매핑 검증 (14/14)

`package.json`의 `contributes.commands` 14개 선언 ↔ `vscode.commands.registerCommand` 등록 실측.

| # | command | 핸들러 위치 | 상태 |
|---|---|---|---|
| 1 | `sapstack.session.start` | sessionCommands.ts | ✅ 구현 |
| 2 | `sapstack.session.resume` | sessionCommands.ts | ✅ 구현 |
| 3 | `sapstack.session.viewEvidence` | sessionCommands.ts | ✅ 구현 |
| 4 | `sapstack.session.addEvidence` | sessionCommands.ts | ✅ 구현 |
| 5 | `sapstack.session.nextTurn` | sessionCommands.ts | ✅ 구현 |
| 6 | `sapstack.session.showFollowup` | sessionCommands.ts | ✅ **v2.3 C3 신규 구현** (stub→실) |
| 7 | `sapstack.session.showVerdict` | sessionCommands.ts | ✅ **v2.3 C3 신규 구현** |
| 8 | `sapstack.session.handoff` | sessionCommands.ts | ✅ **v2.3 C3 신규 구현** |
| 9 | `sapstack.session.exportBundle` | sessionCommands.ts | ✅ **v2.3 C3 신규 구현** |
| 10 | `sapstack.session.openInWeb` | sessionCommands.ts | ✅ **v2.3 C3 신규 구현** |
| 11 | `sapstack.resolveNote` | utilityCommands.ts | ✅ 구현 |
| 12 | `sapstack.checkTcode` | utilityCommands.ts | ✅ 구현 |
| 13 | `sapstack.listPlugins` | utilityCommands.ts | ✅ 구현 |
| 14 | `sapstack.runQualityGates` | utilityCommands.ts | ✅ 구현 |

**결과**: 14/14 실 핸들러 등록 — stub 0개 (이전: 9 구현 + 5 stub placeholder).

---

## 2. v2.3 C3 신규 구현 5개 동작

| command | 동작 | 패턴 |
|---|---|---|
| showFollowup | `currentSessionId`의 `requests/flr-*.yaml` → QuickPick → 문서 열기 | viewEvidence 패턴 재사용 |
| showVerdict | `verdicts/vdc-*.yaml` → 단일이면 자동, 다수면 QuickPick → 열기 | 동일 |
| handoff | 세션 메타(id/statePath/timestamp) JSON을 클립보드 복사 | clipboard API |
| exportBundle | 세션 디렉토리 전체(yaml+md)를 단일 마크다운으로 재귀 수집 → showSaveDialog | fs 재귀 |
| openInWeb | `webViewerUrl` + `?session={id}` → `vscode.env.openExternal` | 외부 브라우저 |

모두 `currentSessionId` 미설정 / 디렉토리 부재 시 명확한 에러·안내 메시지 (try/catch + showErrorMessage).

---

## 3. pre-existing 결함 동반 해소

| 결함 | 위치 | 조치 |
|---|---|---|
| `getParent(): vscode.TreeItem` 가 `TreeDataProvider<PluginTreeItem>` 인터페이스와 타입 불일치 (TS2416) | `PluginsTreeProvider.ts:108` | `getParent(_element: PluginTreeItem): vscode.ProviderResult<PluginTreeItem>` 로 정정 |

> `release.yml`의 Extension build가 `continue-on-error: true`라 이 tsc 에러가 v2.2.x 내내 미검출 상태였음. C3 의 `npm run compile` strict 검증으로 노출·해소.
> SessionsTreeProvider / FollowupsTreeProvider 의 getParent 도 시그니처가 어색하나 generic T가 `vscode.TreeItem`이라 tsc 통과 중 — 회귀 방지 위해 미변경 (v2.4 정합화 후보).

---

## 4. 빌드 검증

```
cd extension && npm run compile
→ tsc --noEmit (strict)  : exit 0
→ node esbuild.config.js : warnings [] , bundle 생성
→ 전체 exit 0
```

---

## 5. 미해결 / v2.4 이월

- TreeView 3개(Sessions/Followups/Plugins) 실제 렌더링은 VS Code 런타임 필요 — 정적 분석으로는 핸들러 등록·타입만 검증 (런타임 UI 테스트는 별도)
- Sessions/FollowupsTreeProvider getParent 시그니처 정합화 (현재 tsc 통과라 보류)
- `vsce package` 산출물 검증은 A3(Marketplace publish) sub-goal 에서 수행

---

## 결론

14 commands 전부 실 핸들러 등록 완료 (stub 0), pre-existing tsc 결함 해소, `npm run compile` strict 통과. Extension v0.1 beta 의 명령 계층은 정합 상태 — A3(Marketplace publish) 진행 가능.
