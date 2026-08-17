# Round 4 — Codex: 데스크톱 앱 UI i18n 완성 루프 (goal mode)

> 2차 산출(plugin.json 24종 + SKILL 심화)은 게이트 5종 재검증 후 **수용·커밋 완료**
> (`d1459fb`). 2,632줄에 지어낸 T-code 0건 원칙이 이번에도 유지되길 기대한다.
> 이번 라운드는 영역이 바뀐다 — **agents/plugins 가 아니라 데스크톱 앱 UI 다.**
> ⚠️ 이전 대화 컨텍스트가 29%뿐이므로 **반드시 새 대화(/new)로 시작**할 것.

## 문제 진술

sapstack 은 "6개 언어 지원(ko/en/zh/ja/de/vi)"을 내세우지만 **앱 UI 기준으로 거짓**이다:

1. 로케일 레지스트리에 **ko 와 vi 가 없다** — 현재 en/es/zh-Hans/ja/hu/de/pl (upstream 잔재 포함)
2. sapstack 이 추가한 SAP UI 3파일은 **한국어 하드코딩**(t() 호출 0건) — en 을 골라도 홈 화면이 한국어
3. 하드코딩 영어 잔존 — Ollama 전제의 낡은 문구 포함

## 소유권 (이 범위 밖 편집 금지)

```
apps/desktop/packages/shared/src/i18n/**            (locales/*.json, registry.ts, languages.ts 등)
apps/desktop/apps/electron/src/renderer/components/app-shell/SapGoldenPath.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/SapEnvironmentStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/ProviderSelectStep.tsx
apps/desktop/apps/electron/src/renderer/components/onboarding/LocalModelStep.tsx
```

- `data/` `docs/` `agents/` `plugins/` 는 이번 라운드 **불가침** (다른 함대 소유)
- `apps/desktop/apps/electron/src/renderer/components/app-shell/sap-golden-path.ts` 의
  **모델 프롬프트 본문(한국어)은 UI 문자열이 아니다 — 건드리지 말 것**
- 커밋 금지 — 오케스트레이터가 게이트 재실행 후 수용·커밋한다

## 작업 (순서대로, 각 단계가 루프)

### 1. `ko.json` 신설 — en.json 기준 전체 키(실측 1,642개) 번역

- 위치: `apps/desktop/packages/shared/src/i18n/locales/ko.json`
- 한국어 라이팅 톤: **해요체·능동형·긍정형** ("저장했어요", "연결할 수 없어요" 대신 "지금은 연결을 준비 중이에요" 류).
  단 보안 경고·데이터 손실 경고는 명확성 우선
- SAP 도메인 용어는 현장 외래어 (코스트 센터, 트포 등) — 단 이 앱 UI 는 범용 문자열이
  대부분이므로 무리하게 적용하지 말 것
- placeholder(`{{name}}` 등)·HTML 태그·개행은 en 과 구조 동일하게 보존

### 2. `vi.json` 신설 — 동일 규칙 (베트남어, diacritics 정확히)

### 3. 레지스트리 등록

- `packages/shared/src/i18n/registry.ts` (현재 로케일 목록 41-57행 부근) + `languages.ts` +
  date-locale 매핑이 있으면 함께. 기존 로케일 추가 커밋 패턴을 grep 으로 찾아 따를 것

### 4. SAP UI 하드코딩 → t() 전환

- `SapGoldenPath.tsx` (카드 5종 31-56행, 97·102·136·148·163·174-205·238-279행 등 전부)
- `SapEnvironmentStep.tsx` (43·52-53·64-106행)
- **모범 패턴이 이미 있다**: `LocalModelStep.tsx` 는 전부 t() 를 쓰고 신규 키
  (`onboarding.localModel.bundledDetected`, `.modelPackHint`)가 전 로케일에 들어가 있다.
  키 네임스페이스·호출 방식을 그대로 따를 것
- 새 키는 **9개 로케일 전부**(en/es/zh-Hans/ja/hu/de/pl/ko/vi)에 추가 — parity 게이트가 강제한다

### 5. 하드코딩 영어 잔존 정리

- `ProviderSelectStep.tsx:70,76` — local 카드 문구가 `'Run models locally with Ollama.'` 인데
  이제 앱에 **llama-server 가 번들**된다(모델팩은 `~/.sapstack/models/`). "번들 로컬 엔진
  또는 Ollama/호환 서버" 취지로 갱신 + t() 화
- `LocalModelStep.tsx:114` `loadingText="Connecting..."` → t() 화

## 루프 게이트 (매 단계 후 실행, 실패 시 수정 후 재실행)

```bash
cd apps/desktop
bun run lint:i18n:parity     # 전 로케일 키 수 일치 (신설 후엔 "8 locales, 1642 keys each")
bun run lint:i18n:sorted     # 키 정렬
bun run typecheck:shared && bun run typecheck:electron
```

주의: `lint:i18n:coverage`/`strings`/`staged` 는 스크립트 파일이 없어 **실행 불가** — 쓰지 말 것.
`.prettierrc.json` 에 requirePragma 킬스위치가 있어 대량 재포맷은 일어나지 않는다 —
**직접 재포맷도 하지 말 것** (upstream diff 보호).

## 완료 기준 + EVIDENCE

- parity 가 ko/vi 포함 전 로케일 동일 키 수로 통과
- SAP UI 4파일에서 하드코딩 한국어/영어 사용자 문자열 0건 (모델 프롬프트 제외)
- typecheck 2종 통과
- **EVIDENCE 블록**: 위 게이트 명령의 실행 로그 원문 + 변경 파일 목록.
  EVIDENCE 없는 "완료" 주장은 수용하지 않는다
