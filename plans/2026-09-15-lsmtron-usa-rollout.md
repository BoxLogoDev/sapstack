# LS엠트론 미국 법인 배포 — MS 로그인 · 문의 AI · 변경 요청(PR) 계획

> 작성 2026-09-15. 상태의 정본은 `STATE.md`, 이 문서는 구현 계획. 승인 후 `plans/`로 옮기고 결정은 `decisions/`에 남긴다.

## Context

- **대상**: LS엠트론 미국 법인(사용자 메일 예 `mikyung.song@lsinjectionusa.com`, 별도 Entra 테넌트). 같은 글로벌 S/4 인스턴스(DS4/QS4/PS4)를 쓰므로 지금 수집 중인 CBO 스냅샷을 그대로 쓴다.
- **요청 수신 측**: LS ITC(`lsitc.com`) 개발팀. 현재 요청은 이메일/Teams로 받고 ABAP 변경은 SAP 운송(CTS)으로만 관리. 깃/GitHub/DevOps 경험 없음.
- **원하는 것**(사용자 확인): ① MS 계정 로그인 — 접근 통제 + 작성자 식별 + MS 자원 사용 + 추적 시스템 SSO ② 현업이 프로그램 문의를 AI로(기존 CBO 설명 기능) ③ 수정이 필요하면 앱 안에서 LS ITC로 **변경 요청서(문서)** 를 올리고 ④ 요청자는 앱에서 내 요청 상태를, @lsitc.com 쪽은 현황과 **관리자 대시보드**를 본다.
- **지금 없는 것**(탐색 결과): 앱 사용자 로그인 개념 없음(OAuth는 LLM/커넥터용), 변경 요청·PR·이슈 통합 없음, 영어 배포 시 한국어 고정 지점(현업 모드 프롬프트, CBO `guide.md`, 배포 킷 README), 미국형 PII 패턴 없음.
- **재사용 가능한 것**: Microsoft PKCE 흐름 `apps/desktop/packages/shared/src/auth/microsoft-oauth.ts`(`/common/` 고정, Graph `/me`), 로컬 콜백 서버 `auth/callback-server.ts`(localhost:6477+), 자격증명 금고 `credentials/backends/secure-storage.ts`, 프로비저닝 `apps/electron/src/main/provisioning-core.ts`, CBO 로더 `apps/electron/src/main/cbo-snapshot.ts`, 안내 프롬프트 `renderer/components/app-shell/sap-golden-path.ts`, 세션 저장 `packages/shared/src/sessions/*`, verdict 스키마 `schemas/verdict.schema.yaml`(fix_plan/rollback 어휘).

## 결정 사항 (사용자 답변)

| 항목 | 결정 |
| --- | --- |
| MS 로그인 목적 | 접근 통제 · 작성자 식별 · MS 자원 사용 · 추적 시스템 SSO 전부 |
| 요청 내용 | 변경 요청서(문서). AI diff 없음, SAP 쓰기 없음 |
| 추적 시스템 | 미정 → 이 계획서가 권고 |
| US SAP | 같은 인스턴스 |
| Entra 테넌트 | 미국 법인 별도 테넌트 |
| LLM 백엔드 | 미정 → 이 계획서가 권고 |
| 현황 조회 | 앱 내 "내 요청" + 관리자 대시보드 필요 |

## Workstream C — 영어 배포 준비 (설계 완료, 코드 7곳 + 킷 + 영어 문서 1장)

| # | 항목 | 파일 | 요지 |
| --- | --- | --- | --- |
| C1 | 안내 프롬프트 ko/en | `apps/desktop/apps/electron/src/renderer/components/app-shell/sap-golden-path.ts` | `environment.language`(이미 인자)로 `promptLang = ko ? ko : en`. 한국어 리터럴을 `PROMPT_TEXT[ko|en]` 표로 옮긴다(i18n 키 아님 — 모델용 문장). 영어에 `Turn 1 INTAKE`, `Rollback Plan`, `snapshot as-of date` 유지. CBO 감지에 영어 키워드 추가(`\bcustom\b|\bin-house\b|\bour\s+…program\b|\bz[- ]program\b`, `customer/customizing` 오탐 방지 단어경계) |
| C2 | `guide.en.md` 생성·선택 | 새 `scripts/cbo/lib/guide.mjs`(renderGuide(p, lang) 이동), `scripts/cbo/export-cbo.mjs:306`, `apps/electron/src/main/cbo-snapshot.ts:177-192` | export가 `guide.md`(ko)+`guide.en.md` 둘 다 기록(`--catalog-only`로 기존 스냅샷도 갱신). 앱은 `getPersistedUiLanguage()==='ko' ? guide.md : guide.en.md`(없으면 guide.md). tagline도 언어별 → 기존 재동기화 분기가 언어 전환 시 자동 갱신. `agents/sap-cbo-explainer.md`에 "사용자 언어로 답하고 영어 라벨 Summary/Where used/Flow/Watch out/As-of" 1줄 |
| C3 | 킷 `-Language en` + US 프로비저닝 예시 | `scripts/cbo/make-distribution.ps1`, 새 `scripts/cbo/examples/provision-lsmtron-usa.yaml` | 영어 `README.txt`(ko는 기존 `읽어보세요.txt`), ZIP 접미 `-en`, provision에 `language: en` 없으면 경고. 예시: `llm.kind api_key`, `sapEnvironment{S4_2023, private_cloud, industry "Injection molding machinery", language en}`, `features.uiMode simple`, shareRoots 생략(미국 PC는 `\\lsitc-fs01` 불가), `auth:`/`changeRequests:`는 주석 자리. 선택: `sapEnvironment.country`→`country_iso` 4줄 |
| C4 | 미국형 PII | `packages/runtime/src/security.ts` (+ `scripts/cbo/lib/scrub.mjs` SSN 1줄) | 하이픈 필수 패턴만: SSN `\d{3}-\d{2}-\d{4}`(000/666/9xx 제외), EIN `\d{2}-\d{7}`, NANP 전화(구분자 필수). SAP 전표/PO 10자리·한국 사업자번호(3-2-5)·주민번호(6-7)와 충돌 없음 |
| C5 | LLM 백엔드 | 코드 없음(선택 시 `scripts/eval/run.mjs`에 `EVAL_API_URL` 1줄) | **권고: 1차 Anthropic API 키 직결**(측정된 0.638 경로, 코드 0). 대안: Microsoft Foundry의 Claude — Anthropic Messages 호환 엔드포인트 `https://<res>.services.ai.azure.com/anthropic`(x-api-key 허용, 벤더 문서 확인) → `kind api_key + baseUrl + api anthropic-messages`(pi_compat). 전제: 미국 법인 자체 종량제 Azure 구독(**한국 EA는 Foundry Claude 미지원**), Marketplace 구독 권한, US Data Zone. Azure OpenAI GPT는 품질 미측정이라 비권고 |
| C6 | 스냅샷 전달 | 코드 없음 | 1차: 킷 동봉 `cbo\` + 주간 `-SnapshotOnly` ZIP을 SharePoint/Teams에 올려 설정 > ZIP 가져오기(기존 기능). 1.5: shareRoots에 `%USERPROFILE%` 확장 1줄 → OneDrive 동기화 폴더 자동 임포트. 2차(로그인 후): Graph로 SharePoint 라이브러리에서 manifest 비교·ZIP 내려받기 |
| C7 | 영어 운영 문서 | 새 `docs/en/us-pilot-runbook.md`, `README.en.md` 링크 | 역할 분담(LS ITC: 킷·스냅샷·요청 접수 / LS엠트론 US IT: 배포·아웃바운드 허용), 첫 실행, LLM 전제, 스냅샷 갱신, 마스킹 범위, 지원 번들, 업데이트 정책(포터블 재배포, air-gap 끄기) |

검증: `bun test …/sap-golden-path.cbo.test.ts`(en 양성/음성, 한글 미포함), `npm run test --workspace @boxlogodev/sapstack-runtime`(US 패턴 3건 히트·전표번호 보존), `npm run cbo:test`(renderGuide en/ko), `export-cbo.mjs --catalog-only` → `guide.en.md` 존재, 킷 생성 후 프로비저닝 샌드박스(`SAPSTACK_PROVISION_FILE`)에서 영어 UI·simple·온보딩 없음·"What does program ZFI0171 do?" 영어 답변 + "Snapshot as of".

보류: catalog.md 영어화, SharePoint 자동 동기화(로그인 후), Azure OpenAI, 비하이픈 SSN, 한국어 관리자 문서 영역본, 업데이트 미러.

## Workstream A — Microsoft(Entra) 로그인 (설계 완료)

**권고 토폴로지: LS ITC 테넌트에 단일 테넌트 앱 등록 + 미국 사용자(lsinjectionusa.com)는 Entra B2B 게스트 + 보안 그룹 + Enterprise App "Assignment required".** 이유: 추적 시스템(Azure DevOps 등)은 한 테넌트에 묶이므로 사용자 토큰으로 요청을 만들려면 어차피 LS ITC 테넌트에 게스트 객체가 있어야 하고, 접근 통제를 LS ITC가 소유한다. 멀티테넌트 앱은 관리가 두 IT 조직으로 갈라지고 나중에 게스트 초대가 또 필요해 비권고. 코드는 두 방식 모두 동일(authority `login.microsoftonline.com/{tenantId}`, `tid` 검사) — 전환은 provision 값 변경.

검증된 사실(MS 문서): 게스트 시나리오는 `/common` 불가, 테넌트 ID 필수 · 데스크톱 `http://localhost` 리디렉션은 포트 무시(콜백 서버 6477~6576과 부합) · `openid`면 id_token, `offline_access`면 refresh_token · 리프레시 토큰은 이미 동의된 모든 권한에 유효(나중에 DevOps/Graph 토큰도 재로그인 없이) · 미할당 사용자는 AADSTS50105(그룹 할당은 Entra P1 필요, 전역관리자는 우회되니 실제 사용자로 시험).

| 단계 | 파일 | 요지 |
| --- | --- | --- |
| A1 순수 모듈(신규) | `apps/desktop/packages/shared/src/auth/entra-signin.ts` | `EntraAuthConfig{required, tenantId, clientId, offlineGraceDays=14, domainHint?}` + `parseEntraAuthConfig`, `decodeJwtClaims`, `identityFromClaims`(tid/aud 불일치→wrong_tenant), `classifyTokenError`(AADSTS50105→not_assigned, invalid_grant 700082/50173→refresh_expired, 네트워크→offline), `decideAfterRefreshFailure`(오프라인 유예 판단). `SignInStatus = disabled | signed_in{identity, offline} | signed_out{reason}` |
| A2 기존 PKCE 확장 | `packages/shared/src/auth/microsoft-oauth.ts` | 옵션 `clientId/tenant/prompt/domainHint` 추가, `/common/` 상수 → `authUrlFor(tenant)`/`tokenUrlFor(tenant)`(기본값 common 유지로 커넥터 무변경), 교환·리프레시가 `idToken` 반환, 리프레시 실패 시 `MicrosoftTokenError(status, error, aadCodes)` 던짐 |
| A3 금고 | `packages/shared/src/credentials/types.ts` | `CredentialType`에 `'entra_signin'`, `StoredCredential.verifiedAt` 추가. 레코드 = AT/RT/idToken/clientId/verifiedAt (신원은 idToken에서 복원) |
| A4 메인 프로세스(신규) | `apps/electron/src/main/identity.ts`, `main/index.ts` | `resolveSignInStatus/signIn/signOut/getSignedInIdentity/getAccessToken(scopes?)`, IPC `sapstack:auth:{status,signIn,signOut}`. 부팅: config `auth` 없음→disabled / 무효→**fail closed**(misconfigured) / 레코드 없음→signed_out / tid·aud 검사 / AT 유효→signed_in / 만료→리프레시(10s) 성공→갱신, 실패는 분류: 권한류→레코드 삭제, offline→`verifiedAt+grace` 이내면 오프라인 signed_in. 백그라운드 타이머 없음(AT ~1h라 매 기동 리프레시가 재검증·유예 갱신 역할). 이메일 로그 금지, `Sentry.setUser` 불변 |
| A5 프로비저닝 | `main/provisioning-core.ts`, `main/provisioning.ts`, `main/environment-profile.ts`, `scripts/cbo/provision.template.yaml`, `docs/provisioning.md` | `provision.yaml auth:{required, tenantId, clientId, offlineGraceDays, domainHint}` → `~/.sapstack/config.yaml auth` 로 시딩(`mergeEnvironmentConfigKeys`). **함정**: `saveEnvironmentProfile()`이 키 목록으로 재작성하므로 `auth` 보존 추가 필수 |
| A6 preload/타입 | `apps/electron/src/preload/bootstrap.ts`, `apps/electron/src/shared/types.ts` | `window.sapstack.auth.{status,signIn,signOut}` |
| A7 렌더러 | 신규 `renderer/contexts/IdentityContext.tsx`, 신규 `renderer/components/onboarding/SignInGate.tsx`, `renderer/App.tsx`, `pages/settings/AppSettingsPage.tsx` | 스플래시 직후·온보딩 이전에 게이트(접근 통제 우선). 사유별 문구(not_assigned→"LS ITC IT에 그룹 추가 요청", grace_expired→"네트워크 연결 후 재로그인"). 설정 App 섹션에 "Account: 이름 <메일> (offline)" + Sign out. i18n 키 9개 로케일 모두 추가(패리티 린트) |
| A8 세션 작성자 스탬프 | `packages/shared/src/sessions/types.ts`, `packages/server-core/src/sessions/SessionManager.ts` | 세션 헤더 `createdBy{email,name,oid}` — `SessionRuntimeHooks.getSessionAuthor` 훅 1개. Evidence Loop 감사 actor는 보류 |
| A9 빌드 | — | 런타임 설정이라 define 불필요. `build:main:win`의 커넥터 define 누락은 별건 |

테스트(bun, 순수 함수): `entra-signin.test.ts`(JWT 디코드, tid/aud, 이메일 우선순위 `#EXT#` 제외, 오류 분류, 유예 판단, 설정 파서 GUID·`common` 거부), `microsoft-oauth-refresh.test.ts`(fetch 스텁 400 invalid_grant → `MicrosoftTokenError` aadCodes, afterAll 복원), provisioning-core/environment-profile 테스트 확장.

관리자 런북 `docs/entra-signin.md`(LS ITC 테넌트): ① 앱 등록 단일 테넌트, 플랫폼 "Mobile and desktop", 리디렉션 `http://localhost/callback` ② Graph 위임 `openid profile email offline_access User.Read` + 관리자 동의 ③ Enterprise App Assignment required=Yes ④ 그룹 `SG-sapstack-LSInjectionUSA` 할당(P1 필요) ⑤ B2B 게스트 초대(CSV 일괄), 크로스 테넌트 인바운드 허용, 홈 테넌트 MFA 신뢰 ⑥ 킷 provision에 tenantId/clientId ⑦ 스모크: 할당 게스트 로그인 / 미할당 50105 / 오프라인 유예 / grace 0 ⑧ 회수: 그룹 제거(다음 리프레시) 또는 게스트 비활성+세션 취소(즉시) ⑨ 후속: Azure DevOps `user_impersonation`(리소스 `499b84ac-1321-427f-aa17-267ca6975798`) 동의 → 기존 리프레시 토큰으로 발급.

리스크: 그룹 제거가 리프레시 시점에 평가되는지 미확인(하드 회수는 계정 비활성) · 게스트 `email` 클레임 부재 가능(폴백 체인) · 리디렉션 경로 매칭 미확인(안 되면 `http://localhost` + 루트 경로) · id_token 서명 미검증(TLS 직접 수신, 공개 클라이언트 허용 관행) · 금고가 PC 단위(공용 PC 시 주의).

보류(YAGNI): MSAL, 백그라운드 리프레시, 별도 계정 페이지, 딥링크 auth-callback 경로.

## Workstream B — 변경 요청 흐름 · 추적 시스템 · 관리자 대시보드 (설계 완료)

**권고: Azure DevOps Boards(LS ITC 테넌트 연결 조직)에 요청자 본인 Entra 토큰으로 데스크톱 앱이 직접 작업 항목을 만든다. 백엔드 없음.**

| | A. ADO Boards(직접, 사용자 토큰) | B. GitHub Issues(GitHub App) | C. Microsoft List/SharePoint | D. 자체 요청 서비스 |
| --- | --- | --- | --- | --- |
| 백엔드 | **없음**(REST 4종) | 릴레이 필수(미국 사용자에 GitHub 계정 없음, App 키 배포 불가) | 없음이나 워크플로 약함 | 트래커를 우리가 만들어 소유 |
| 요청자 식별 | `System.CreatedBy` 네이티브 → `@Me`로 내 요청 | 본문에 합성 | 게스트면 네이티브 | 자체 |
| 라이선스 | Stakeholder 무료·무제한(개발자 Basic 5석 무료) | 좌석 | M365 보유 | — |
| 대시보드·알림 | 쿼리·대시보드·메일 구독·Teams 앱 내장 | 라벨 규율 의존 | Power Automate | 직접 구축 |
| LS ITC(메일·Teams·CTS, 깃 없음) 적합성 | 좋음 — 작업 항목=문서, Teams 채널 피드 | 나쁨 — 깃 도구 강요 | 중간 | — |
| 주 리스크 | IT가 B2B 게스트 거부 → 릴레이 폴백 | 두 신원 체계 | 상태 관리 약함 | 영구 운영 부담 |

폴백(게스트 거부 시): ~100줄 Azure Function 릴레이가 멀티테넌트 ID 토큰 검증(발급 테넌트·그룹) 후 서비스 주체로 동일 4개 엔드포인트를 대행, `Custom.RequesterEmail`로 `@Me` 대체. 클라이언트는 base URL·토큰 스코프만 바뀜.

### LS ITC IT 전제(코드 아님, 런북 `docs/change-requests.md`)
1. ADO 조직(예 `https://dev.azure.com/lsitc`) LS ITC 테넌트 연결, 조직 정책 **External guest access = On**
2. 프로젝트 `SAP-Change-Requests`, 프로세스 Basic(`Issue`: To Do/Doing/Done). 운송형 상태(Waiting transport/In QAS/Released)를 원하면 상속 프로세스(PCA 권한) — 클라이언트는 WIT 이름만 설정
3. Area path `SAP-Change-Requests\LSMtron-USA`(법인별 추가)
4. 태그 사전 생성: `sapstack, LSMtron-USA, SID-DS4/QS4/PS4, MOD-FI/MM/SD/CO/PP/HR` — **Stakeholder는 새 태그를 만들 수 없음**(검증됨) → 클라이언트는 이 집합만 사용
5. 미국 요청자: B2B 게스트 → ADO 조직 Stakeholder + 프로젝트 Contributors. LS ITC 개발·관리자 Basic
6. 앱 등록 위임 권한 **Azure DevOps user_impersonation**(리소스 `499b84ac-1321-427f-aa17-267ca6975798`, 스코프 `…/.default`), 권한 발급 authority는 LS ITC 테넌트
7. 알림: 프로젝트 구독 "Work item created"(Area under LSMtron-USA → 개발 DL), 팀 구독 "State changed" → **Created by** 역할(요청자 메일). Teams: Azure Boards 앱을 개발 채널에 설치, created/state-changed 구독
8. 대시보드 "SAP Change Requests": area×state 쿼리 타일, State 차트, "14일 초과 미완료" 쿼리

### 구현
| 단계 | 파일 | 요지 |
| --- | --- | --- |
| B1 공용 정규식 | 신규 `apps/electron/src/shared/cbo-objects.ts` | `sap-golden-path.ts`의 Z/Y 정규식을 옮겨 main·renderer 공유. `extractCboObjects(text)`(대문자·중복 제거·SAPM/SAPL 접두 제거) |
| B2 순수 코어(신규) | `apps/electron/src/main/change-requests-core.ts` | `buildDraft(session, manifests, user, config)`(마지막 사용자 질문 원문 — 안내 프롬프트 `사용자 요청:`/`Request:` 라벨 뒤 텍스트 추출, 마지막 비중간 assistant 답, 오브젝트, 활성 소스 슬러그로 SID/클라이언트 해석, 제목 기본 `ZFI0171: 첫 줄…`, 우선순위 3), `renderDescription`(영어 템플릿, verdict 어휘 transport_required/reviewer_required/executor/rollback_plan 자리), `toJsonPatch`(Title≤255 `[SAP CR][DS4] …`, Description Markdown + `/multilineFieldsFormat` op, AreaPath, Tags 고정 집합, Priority, 첨부 시 `AttachedFile` relation), `buildMyRequestsWiql`(`@Me AND @project AND Tags CONTAINS 'sapstack'`, 사용자 입력 비삽입), `parseWorkItemsList`, `workItemWebUrl`, `AdoClient(fetch, tokenGetter)`. 초안 시점에 `SecurityService.scrub` 통과(미리보기=전송본) |
| B3 메인(신규) | `apps/electron/src/main/change-requests.ts`, `main/index.ts`, `main/cbo-snapshot.ts`(`listSnapshotManifests` export) | IPC `sapstack:changeRequests:{status,draft,submit,listMine,queue,retry,discard}`. `submit`은 네트워크 전에 `~/.sapstack/change-requests/{id}.json`(status queued) 기록 → 성공 시 submitted+result(재시도 멱등). `isAirGapped()`면 비활성. 토큰 = `getAccessToken(['499b84ac…/.default'])`(Workstream A) |
| B4 REST | (B2/B3) | ① 첨부(옵션) `POST {org}/{project}/_apis/wit/attachments?fileName=…&api-version=7.1` ② 생성 `POST …/_apis/wit/workitems/$Issue?api-version=7.1`(json-patch) ③ 내 요청 `POST …/_apis/wit/wiql?api-version=7.1&$top=50` → `GET …/_apis/wit/workitems?ids=…&fields=Id,Title,State,ChangedDate,AssignedTo`. `AbortSignal.timeout(15000)`, 전역 fetch(프록시 설정 적용). Markdown 400이면 `<pre>` HTML로 1회 재시도 |
| B5 프로비저닝 | `provisioning-core.ts`, `provisioning.ts`, `environment-profile.ts`, `scripts/cbo/provision.template.yaml`, `docs/provisioning.md` | `changeRequests:{provider azure_devops, orgUrl, project, workItemType=Issue, areaPath, tenantId, entityTag, relayUrl?}` → config.yaml `change_requests`(snake_case). `saveEnvironmentProfile` 보존 추가 |
| B6 UI | `renderer/components/app-shell/ChatDisplay.tsx`(~1710, 마지막 완료 TurnCard 아래), 신규 `renderer/components/change-requests/ChangeRequestDialog.tsx`, 신규 `pages/settings/ChangeRequestsSettingsPage.tsx`(+ `shared/settings-registry.ts`, `settings-pages.ts`, 아이콘) | 버튼 "Request a change to this program"(configured && CBO 질문 && 처리 완료). 대화상자: 제목·영향 오브젝트·기대 동작·우선순위(1–4)·"대화 markdown 첨부"(기본 off)·설명 미리보기·로그인 사용자·Submit/Save locally. 성공 토스트 "Open in Azure Boards". 설정 페이지: 연결 카드(조직/프로젝트/보드 링크), **내 요청**(마운트 시 + Refresh만, 백그라운드 폴링 없음), 로컬 초안 Retry/Discard |
| B7 i18n | `packages/shared/src/i18n/locales/*.json` | en·ko 작성, 나머지 7개 로케일도 패리티 린트 때문에 필요(영문 복사 또는 번역) |
| B8 문서·ADR | 신규 `docs/change-requests.md`, 신규 `decisions/active/2026-09-15-change-requests-document-only.md` | 런북(전제 1–8, 쿼리, 대시보드, 알림, Teams 명령, 게스트 온보딩, 릴레이 폴백). ADR: 배경/결정(문서만·ADO·사용자 토큰·백엔드 없음·대시보드는 설정·전문 첨부 옵트인·로컬 큐·폐쇄망 비활성)/근거/버린 대안/뒤집는 조건(IT가 게스트·멀티테넌트 모두 거부→D 재검토, Jira/ServiceNow 도입→매핑만 교체) |

오류 처리: 401/403 → 큐 유지 + "LS ITC DevOps 프로젝트 멤버가 아님 — 관리자 문의" · 400 TF…(태그/area/WIT) → 서버 메시지 그대로(관리자 설정 오류) · 네트워크 → 큐 + 수동 재시도 · 진단 20k자 초과 → 잘라내고 첨부 권고 · 이중 클릭 방지.

테스트(bun): `change-requests-core.test.ts`(초안 추출 — 안내 접두 제거·원문 보존, 오브젝트 순서/중복/SAPMZ 정규화, SID 해석, json-patch 필드·태그 집합·제목 길이·relation 조건, WIQL, 파서), `change-requests-client.test.ts`(`SAPSTACK_WORKSPACE`=mkdtemp, fetch 스텁 성공/401/네트워크 예외/첨부 순서, 제출된 초안 재시도 no-op, afterEach 복원), provisioning-core 테스트 확장.

리스크·미검증: Stakeholder의 첨부 업로드 권한(스모크로 확인, 막히면 첨부 옵션 숨김 또는 Basic 부여) · Markdown 포맷 op는 블로그 공지 기반(HTML 폴백 유지) · LS ITC 조건부 접근/MFA가 게스트의 ADO 토큰 무소음 발급을 허용하는지 · `@Me`가 게스트 디스크립터에 매칭되는지 · LS ITC ADO 조직 존재 여부·정책.

## 종합 권고 (3건)

1. **추적 시스템 = Azure DevOps Boards**(LS ITC 테넌트). 미국 요청자는 무료 Stakeholder, 개발팀은 메일·Teams 알림으로 지금 습관 그대로 받고, 관리자 대시보드는 ADO 내장. "PR"은 코드가 아닌 **변경 요청서 작업 항목**이며, 로드맵 비목표(ABAP 자동 수정 금지·운영 쓰기 금지)를 지킨다.
2. **로그인 = LS ITC 테넌트 단일 테넌트 앱 + B2B 게스트 + 그룹 할당 필수.** 접근 통제는 Entra가 강제(앱은 로그인 성공 + `tid` 검사만), 같은 토큰으로 ADO 호출. 게스트 거부 시 릴레이 폴백.
3. **LLM = 1차 Anthropic API 키 직결**(측정된 품질, 코드 0). Azure 과금·미국 데이터 상주가 요구되면 Microsoft Foundry의 Claude(Anthropic Messages 호환, `api_key + baseUrl + anthropic-messages`) — 미국 법인 자체 종량제 Azure 구독 필요(한국 EA 불가).

## 구현 순서

| 순서 | 내용 | 의존 |
| --- | --- | --- |
| 1 | **C 영어 배포 준비**(C1 프롬프트 ko/en·CBO 영어 감지 → C4 US PII → C2 guide.en.md → C3 킷·프로비저닝 예시 → C7 런북) | 없음. 이것만으로도 영어 파일럿 킷 배포 가능 |
| 2 | **A 로그인**(A1 순수 모듈 → A2 PKCE 확장 → A3 금고 → A5 프로비저닝 → A4 메인 → A6/A7 UI → A8 세션 스탬프) | LS ITC 테넌트 앱 등록(IT). 등록 전에는 `auth.required:false`로 코드 완성·테스트 |
| 3 | **B 변경 요청**(B1/B2 코어+테스트 → B5 프로비저닝 → B3 메인 → B6 UI → B7 i18n → B8 런북·ADR) | A의 `getAccessToken`. IT 전제 1–8 완료 후 게스트 1명으로 스모크 |
| 4 | 킷 조립·릴리스: `make-distribution.ps1 -Sid DS4 -Language en -ProvisionFile provision-lsmtron-usa.yaml` → 클린 PC 스모크 → v2.6.0 컷 | 1–3 |

각 순서 끝에 커밋·푸시·CI 녹색 확인(로컬 게이트 전부: lint-frontmatter, check-hardcoding --strict, check-tcodes, check:doc-stats, build-multi-ai --check, `bun test`, runtime/cbo 테스트).

## 사용자·IT가 준비할 것 (체크리스트)

- [ ] LS ITC 테넌트: 앱 등록(단일 테넌트, Mobile/desktop `http://localhost/callback`, Graph 위임 5종 + Azure DevOps user_impersonation, 관리자 동의), Enterprise App Assignment required, 그룹 `SG-sapstack-LSInjectionUSA`(Entra P1)
- [ ] LS엠트론 US 사용자 B2B 게스트 초대(CSV) + 그룹 추가, 크로스 테넌트 인바운드 허용·홈 MFA 신뢰
- [ ] ADO 조직·프로젝트·area path·태그·Stakeholder 부여·알림 구독·Teams 앱·대시보드(런북 1–8)
- [ ] Anthropic Console 워크스페이스 "LS Mtron USA pilot" + 지출 한도, 미국 PC의 `api.anthropic.com` 아웃바운드 허용(또는 Foundry 결정 시 Azure 구독)
- [ ] 킷 배포 채널(SharePoint/Teams 라이브러리) 및 스냅샷 갱신 주기 합의
- [ ] `provision-lsmtron-usa.yaml`에 tenantId/clientId/ADO 값 기입

## 검증 (E2E)

1. 단위: `cd apps/desktop && bun test`(전체 4945+), `npm test`(runtime·mcp), `npm run cbo:test`
2. 프로비저닝 샌드박스(`SAPSTACK_PROVISION_FILE`, `SAPSTACK_WORKSPACE`, `SAPSTACK_DESKTOP_CONFIG_DIR`): 영어 UI·simple·온보딩 없음 → 로그인 게이트 → 할당 게스트 로그인 성공 / 미할당 AADSTS50105 문구 / 오프라인 유예 → 홈에서 "What does program ZFI0171 do?" → 영어 답 + "Snapshot as of" → "Request a change" → 대화상자 미리보기 → 제출 → ADO 작업 항목 생성(`System.CreatedBy`=게스트) → 개발 DL 메일·Teams 게시 확인 → 설정 "내 요청"에 표시 → 상태 변경 시 요청자 메일
3. PII: 입력창에 `123-45-6789` → 마스킹 알림, 전표번호 `5100000123` 보존
4. 킷: 클린 PC에서 포터블 실행 → 위 2번 재현. 스냅샷 ZIP 가져오기 동작

## 전체 리스크 요약

- B2B 게스트를 LS ITC IT가 거부하면 A/B 모두 릴레이 폴백으로 전환(코드 변경 최소, 소형 Azure Function 운영 필요)
- 그룹 제거의 회수 시점(리프레시 평가 여부) 미확인 → 하드 회수는 게스트 비활성+세션 취소
- Stakeholder 첨부 권한·Markdown 설명 포맷·게스트 `@Me` 매칭은 스모크에서 확인
- 금고가 PC 단위라 공용 PC에서는 로그아웃 규율 필요
- 영어 답 품질은 gold-set 미개봉 원칙상 10문항 수동 스모크로 대체

## 보류 (이번 범위 밖)

AI diff 첨부(사용자 결정: 문서만) · SharePoint Graph 스냅샷 자동 동기화(로그인 후 2차) · Evidence Loop 감사 actor 스탬프 · MSAL 도입 · 별도 계정 설정 페이지 · Azure OpenAI 백엔드 · catalog.md 영어화 · 한국어 관리자 문서 영역본 · 업데이트 미러(`generic` provider)
