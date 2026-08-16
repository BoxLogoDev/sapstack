# 온전한 데스크톱 앱이 되기 위해 필요한 것

> 조사 기준: 2026-08-16, sapstack v2.4.0, `apps/desktop` (craft-agents-oss v0.11.2 파생)
> 이 문서는 **확인한 사실**과 **미확인 항목**을 구분해 적는다. 추측은 추측이라고 표시한다.

---

## 요약 — 생각보다 많이 되어 있다

조사 전 예상과 실제가 달랐던 지점이 셋이다.

| 예상                                      | 실제                                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Craft 브랜딩이 사용자 화면에 남아 있을 것 | **이미 정리됨.** 로고는 sapstack "S" 심볼, 메뉴 문자열도 "Quit sapstack Desktop". 내부 식별자 이름만 잔존(무해) |
| SAP 온보딩이 없을 것                      | **`SapEnvironmentStep.tsx` 이미 존재.** 온보딩에 SAP 환경 설정 단계가 들어가 있음                               |
| 자동 업데이트가 없을 것                   | **`auto-update.ts` 구현 완료.** electron-updater로 `boxlogodev.github.io/sapstack/electron/latest` 를 바라봄    |

남은 것은 **"만들기"보다 "연결하기"와 "덜어내기"** 에 가깝다.

---

## P0 — 이게 없으면 배포 자체가 불가능

### 1. 코드 서명 (Windows EV 인증서)

| 항목   | 상태                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| 현재   | 서명 없음. `electron-builder.yml` 의 mac notarize 블록도 주석 처리                           |
| 준비됨 | 릴리스 워크플로가 `WINDOWS_CSC_LINK` / `WINDOWS_CSC_KEY_PASSWORD` secret 을 읽도록 배선 완료 |
| 필요   | **EV 인증서 발급 (리드타임 1~2주)**                                                          |

서명이 없으면 SmartScreen 경고가 뜨고, 폐쇄망 고객의 보안 심사를 통과할 수 없다. **이것이 일정의 크리티컬 패스다.**

### 2. 자동 업데이트 배포 경로 — 코드는 있는데 파일이 안 올라간다

`apps/electron/src/main/auto-update.ts` 가 electron-updater 로 이 URL 을 폴링한다.

```
https://boxlogodev.github.io/sapstack/electron/latest
```

그런데 릴리스 워크플로(방금 추가한 `desktop-windows` job)는 **GitHub Release 에 첨부만 하고 저 경로에 올리지 않는다.** 즉 설치는 되지만 업데이트는 영원히 오지 않는다.

필요한 것: 릴리스 시 `latest.yml` + 설치 파일을 GitHub Pages(`gh-pages` 브랜치 또는 `docs/electron/latest`)에 게시하는 단계. electron-builder 가 생성하는 `latest.yml` 이 매니페스트다.

> ⚠️ 폐쇄망 고객에게는 이 경로가 무의미하다. 자동 업데이트를 **끌 수 있어야** 한다(아래 4번).

### 3. 설치 후 실제 동작 검증 — 아직 한 번도 안 해봤다

| 항목               | 상태                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| 빌드 스크립트      | `build-win.ps1` 8단계 완비 (bun 다운로드 → SDK alias → electron 빌드 → nsis 패키징 → 검증) |
| CI 연결            | 방금 완료                                                                                  |
| **실제 설치·실행** | **미확인**                                                                                 |

최소 확인 항목: 설치 → 첫 실행 → 온보딩 완주 → SAP 환경 저장 → 진단 1건 완료 → 재시작 후 세션 유지.

NSIS 가 `perMachine: false` (per-user 설치)인 이유가 코드에 적혀 있다 — Bun 서브프로세스가 Program Files 에 쓰지 못하기 때문. 이 제약이 고객사 IT 정책(사용자별 설치 금지)과 충돌할 수 있다. **확인 필요.**

---

## P1 — 상용 제품으로 팔려면 필요

### 4. 폐쇄망 모드 (제품의 존재 이유)

현재 앱은 폐쇄망을 **가정하지 않는다**. 외부로 나가는 경로가 최소 셋이다.

| 경로                     | 현재                                                                                                                 | 필요                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Sentry 크래시 리포팅** | `@sentry/electron` 이 앱 시작 시 init. `dsn: process.env.SENTRY_ELECTRON_INGEST_URL` 이 없으면 비활성 (빌드 시 주입) | 폐쇄망 빌드에서는 **주입하지 않음**을 보장 + 설정에서 명시적으로 끌 수 있어야 함. 스택트레이스에 SAP 데이터가 실릴 위험 |
| **자동 업데이트 폴링**   | 시작 시 GitHub Pages 폴링                                                                                            | 오프라인 모드 스위치 필요                                                                                               |
| **LLM API 호출**         | 기본이 클라우드                                                                                                      | 로컬 모델 강제 모드                                                                                                     |

> ✅ 다행인 점: Sentry DSN 이 **하드코딩돼 있지 않다.** craft 쪽으로 크래시가 새지 않는다.

**필요한 것: "Air-gapped 모드" 토글 하나.** 켜면 Sentry·업데이트 폴링·클라우드 LLM 이 전부 차단되고, 그 사실이 UI 에 표시된다. 보안 심사 제출용 근거가 된다.

### 5. 제품 범위 정리 — SAP 와 무관한 기능 덜어내기

craft-agents-oss 파생이라 SAP 운영과 관계없는 기능이 딸려 왔다.

| 기능                                  | 패키지/위치                                         | 판단                                                                                |
| ------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| WhatsApp 게이트웨이                   | `packages/messaging-whatsapp-worker` (Baileys 번들) | **제거 검토.** SAP 운영 도구에 메신저 봇은 불필요하고, 보안 심사에서 설명 부담이 큼 |
| Telegram 게이트웨이                   | `packages/messaging-gateway`                        | 〃                                                                                  |
| 브라우저 툴                           | `browser_tool` (session-tools)                      | 판단 필요 — SAP Note 조회에 쓸 수 있으나 폐쇄망에선 무용                            |
| 문서 툴 (pdf/xlsx/docx/pptx/img/ical) | `resources/scripts/*` + uv 바이너리 번들            | **유지 권장.** 운영자가 붙여넣는 증거가 엑셀·PDF 인 경우가 많음                     |
| 마케팅/온라인 문서 앱                 | `apps/marketing`, `apps/online-docs`                | **제거.** 제품과 무관                                                               |
| Playground (UI 데모)                  | `renderer/playground/*`                             | 개발용. 프로덕션 번들에서 제외되는지 **확인 필요**                                  |

제거는 설치 파일 크기와 보안 심사 표면을 동시에 줄인다. 현재 설치 파일에 이미 claude 네이티브 바이너리(~210MB) + Bun 런타임 + uv 가 들어간다.

> ⚠️ **미확인**: 이 기능들이 실제 UI 에 노출되는지(설정 화면·메뉴), 아니면 코드만 있고 비활성인지 확인하지 않았다. 노출 여부에 따라 우선순위가 달라진다.

### 6. 라이선스 표시 (BSL 전환 + Apache-2.0 고지)

| 항목                    | 상태                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/desktop` 라이선스 | **Apache-2.0** (craft-agents-oss 파생). `NOTICE`·`UPSTREAM.md` 에 provenance 기록됨                   |
| 제품 방향               | 데스크톱만 BSL 전환 예정                                                                              |
| 필요                    | 앱 내 "About / 라이선스" 화면에 **양쪽 고지 병기**. Apache-2.0 은 파생물 배포 시 고지 의무가 따라온다 |

BSL 파라미터도 정해야 한다 — Change Date(통상 4년), Change License(통상 Apache-2.0), Additional Use Grant.

### 7. 테스트 신뢰성 — 71개가 실패 중

```
4827 pass · 1 skip · 71 fail · 2 errors  /  4899 tests, 370 files (625초)
```

관찰된 실패는 `deriveSelectionFlags('/')` 가 `folderName` 을 `undefined` 대신 `"/"` 로 반환하는 유형 — **Windows 경로 처리 차이로 보인다** (POSIX `basename('/')` 는 빈 문자열).

> ⚠️ **미확인**: 71개가 전부 플랫폼 차이인지, 실제 결함이 섞여 있는지. 저는 Windows 에서만 돌렸다. CI(ubuntu)에서 한 번 받아봐야 판정 가능.

권장: CI 에 `continue-on-error: true` 로 먼저 넣어 ubuntu 결과를 확보한 뒤, 플랫폼 차이면 Windows 스킵 처리, 실제 결함이면 수정.

---

## P2 — 있으면 좋지만 1차 출시를 막지는 않음

### 8. 제품 문서에서의 존재감

데스크톱은 `README.md`, `CHANGELOG.md`, `docs/quickstart-5min.md` **어디에도 없다**. README 는 설치법 7개를 평행 나열하고 있어 "이 제품이 무엇인가"가 보이지 않는다.

필요: 데스크톱을 1순위 진입점으로 올린 단일 서사. 폐쇄망 고객은 npm/플러그인이 아니라 **설치 파일**을 원한다.

### 9. mac / linux 빌드

`electron-builder.yml` 에 타겟이 정의돼 있다(mac dmg+zip arm64/x64, linux AppImage x64). CI 는 Windows 만 연결했다. mac 은 별도로 **공증(notarization)** 과 Apple Developer 계정이 필요하다.

권장: 1차는 Windows 만. SAP 운영자 데스크톱은 대부분 Windows 다.

### 10. 내부 식별자 정리

`CraftAgentsSymbol`, `CraftAgentsLogo`, `CraftAppIcon`, `menu.quitCraftAgents` 같은 **이름**이 남아 있다. 사용자에게 보이는 문자열과 아트워크는 이미 sapstack 이므로 기능상 무해하다. 대규모 rename 은 upstream 동기화를 깨뜨리므로 **의도적으로 유지**하는 것이 맞다(코드 주석에 그 의도가 적혀 있다).

### 11. 죽은 스크립트 참조 14개

`apps/desktop/package.json` 이 존재하지 않는 스크립트 14개를 참조한다(`release.ts`, `oss-sync.ts`, `check-raw-sends.sh` 등). **릴리스 빌드 체인은 온전하다** — 전부 개발 편의 스크립트다. 다만 `bun run lint` 는 지금 즉시 실패한다.

---

## 이미 해결된 것 (2026-08-16 작업분)

- ✅ 릴리스 워크플로에 `desktop-windows` job 추가 (build-win.ps1 경유, 서명 secret 배선, artifact → Release 첨부)
- ✅ 버전 단일출처 통합 — 데스크톱 `3.0.0-beta.0` → `2.4.0`, `bump-version.sh` 대상 5→8개, `bun.lock` 갱신, `--frozen-lockfile` 통과 확인
- ✅ `UPSTREAM.md` stale 문구 정리

---

## 1차 출시(1~2개월) 관점 최소 집합

| #   | 항목                                  | 담당            | 비고                                   |
| --- | ------------------------------------- | --------------- | -------------------------------------- |
| 1   | EV 인증서 발급                        | **사용자**      | 지금 신청. 리드타임이 일정을 결정      |
| 2   | 자동 업데이트 게시 경로 연결          | Claude          | 릴리스 워크플로에 Pages 배포 추가      |
| 3   | Air-gapped 모드 토글                  | Claude          | Sentry·업데이트·클라우드 LLM 일괄 차단 |
| 4   | 설치 후 실제 동작 검증                | Claude + 사용자 | 온보딩~진단 1건 완주                   |
| 5   | 테스트 71건 ubuntu 판정               | Claude          | continue-on-error 로 관찰              |
| 6   | 비SAP 기능 노출 여부 확인 → 제거 판단 | Claude          | messaging/marketing 우선               |
| 7   | 라이선스 화면 (BSL + Apache-2.0)      | Claude          | BSL 파라미터는 사용자 결정             |
| 8   | README 에 데스크톱 1순위 배치         | Grok(docs 소유) |                                        |

**mac/linux, 내부 rename, 죽은 스크립트 정리는 1차에서 뺀다.**
