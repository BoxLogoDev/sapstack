# Changelog

All notable changes to **sapstack** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — gstack 수준 완성도 갭 분석 + Golden Path 워크플로 (문서)

- **`docs/gstack-gap-analysis.md`** 신규 — sapstack 을 gstack(Garry Tan's Stack) 수준의 "완성도 있는 제품"으로 끌어올리기 위한 구조적 갭 분석. gstack 완성도 7규율(ETHOS/Golden Path/생성 단일출처/셋업/eval/업그레이드/결정메모리) 식별 → 차원별 갭 매트릭스 10항 → 우선순위 채택 로드맵(roadmap.md 정합) → 명시적 non-goals(베끼지 않을 것).
- **`docs/workflow.md`** 신규 — sapstack Golden Path. 흩어진 24 플러그인/20 에이전트/22 커맨드를 *하나의 진단 여정*(모드 선택 → Evidence Loop 4턴 → 진입점 라우팅 → 폴백 사다리)으로 묶음. 메인테이너 워크플로(기여→게이트→릴리스) 포함.
- **6개 언어 README 에 "🧭 Golden Path" 표 추가** — "어떤 상황 → 어떤 진입점" 1-표 + 두 문서 링크.
- 배경: 원래 클라우드 ultraplan 세션 산출물이 서명 인프라 장애로 커밋되지 못해 소실 → 로컬에서 ground-truth(gstack 실제 구조 정독) 기반 재생성.

### Added — SAP Note/KBA 데이터셋 100+ 달성 (B4 deferred 완료, sap-notes.yaml 77 → 112)

- **35 신규 공개 KBA/Note 등록** (`data/sap-notes.yaml`) — v2.3.0 의 B4 deferred 목표("100+")를 ground-truth 룰 준수하에 완료. 총 112건.
- **검증 방식**: 병렬 리서치 에이전트가 후보 수집 → **오케스트레이터가 `userapps.support.sap.com/sap/support/knowledge/en/<번호>` 를 직접 WebFetch 해 번호+제목 일치 확인한 것만 등록**. 한 리서치 에이전트가 "32건 검증" 을 주장했으나 tool_uses=2 로 검증 날조가 드러나 전수 재검증 (PR #32→#33 revert 학습 적용).
- **드롭**: 후보 ~46건 중 11건 폐기 (userapps 404 또는 help.sap.com SPA / community Cloudflare 로 독립 확인 불가). 추측 등록 금지 원칙.
- **카테고리 분포 (신규 35건)**: config 다수 + dump 6 (ABAP MEMORY_NO_MORE_PAGING / SYSTEM_CORE_DUMPED, CO/F110 오류), security 2 (CVE-2025-42989 / CVE-2026-0506 RFC 권한), performance 3 (CO 마감 / EWM wave), korea 3 (전자세금계산서 / Korea supplement).
- **모듈 보강**: 빈약하던 PP/WM/QM/EWM + dump/security 카테고리 + FI 결산(자산회계 연말마감·감가상각) + TR 은행조정 + F110 지급실행(House Bank/Partner Bank 결정 오류군).
- `data/sap-notes.yaml` `meta.last_updated`: 2026-05-24 → 2026-06-15
- `resolve-note.sh` 로 신규 키워드(F110, ETax 등) 조회 정상 동작 확인.

## [2.3.3] - 2026-06-15

### Added — 마스코트 표준씨 / Ms. Standard (첫 시각 브랜드 자산)

- **마스코트 "표준씨" (영문 Ms. Standard) 도입** — sapstack 최초의 시각 브랜드 자산. SAP 현업의 "표준이라 안 됩니다" 트로프를 의인화한 시니어 컨설턴트 캐릭터. ponytail (DietrichGebert/ponytail) 의 "캐릭터=프로젝트 철학" 패턴 차용.
- **자산**: `docs/assets/mascot/standard-ko.png` (한국어 말풍선), `standard-en.png` (영어 말풍선). 흑백 라인아트.
- **`MASCOT.md`** 신규 — 브랜드 가이드 (성격·철학·6개 언어 시그니처 대사·사용 가이드라인·크레딧). 캐릭터 태도를 CLAUDE.md Universal Rules 와 1:1 매핑.
- **6개 언어 README 히어로** 에 마스코트 + 현지화 캡션 배선. ja/zh/de/vi 는 영어 이미지 폴백 (현지화 말풍선은 community 기여 대상).

### Fixed — check-hardcoding.sh 성능 (Windows 90s+ → ~25s)

- `scan_file` 의 라인당 `echo \"$line\" | grep -Eq` subprocess 2회 spawn 을 bash 네이티브 `[[ =~ ]]` 정규식으로 교체. 449 .md 파일 × 라인 수 × 2 의 fork 폭발이 Windows Git Bash 에서 사실상 hang (>90s) 을 유발하던 문제 해소. body 1회 순회로 병합. 탐지 의미 동일 (위반 케이스 회귀 검증 완료).

### Changed — 릴리스 정합화 + roadmap 재정리

- **버전 sync**: package.json / marketplace.json / mcp/package.json / mcp/sapstack-server.json / extension/package.json 5개 파일 2.3.2 → **2.3.3** (`scripts/bump-version.sh`).
- **`docs/roadmap.md` 재정리**: 중복 버전 헤더 (v1.3.0 ×2, v2.0.0 ×2) 제거, 출하된 v2.1.0/v2.2.0/v2.3.0 을 실제 출하 내용으로 ✅ 갱신 (이전엔 🎯 계획 + 미체크 상태로 드리프트), 미출하 항목 (Learning Loop, Web UI/PWA) 을 v2.4.0 / vNext / Vision 으로 재배치, stale "(현재)" 라벨 정정.

### Added — B4-B 공개 SAP KBA 부분 진행 (sap-notes.yaml 57 → 77)

- **20 신규 KBA** 등록 (`data/sap-notes.yaml`) — WebSearch 로 SAP Help Portal / userapps.support.sap.com 의 공개 KBA 페이지만 source-of-truth 로 사용. ground-truth 룰 (CLAUDE.md `Plan ground truth 검증`) 준수 — solution 단계가 SAP for Me paywall 뒤에 있는 경우 등록하지 않음.
- **신규 module 약어 도입**: `IBP` (SAP Integrated Business Planning), `SAC` (SAP Analytics Cloud) — 기존 BTP 단일 약어로 묶이던 신규 4 클라우드 모듈을 세분화.
- **카테고리 분포** (v2.3.0 확장 4 섹션):
  - **Universal Journal & Group Reporting** (8건): ACDOCA 미활성 (2184861), 확장 (2403232), 기술 문서 prefix (3378282), GL Fiori line items 누락 (2756457), SPL 비활성 brownfield (3523712), BCF ACDOCA→ACDOCU (3494994), 데이터 볼륨 ACDOCU On-Premise (3000108), Group Reporting 성능 collective (2875820)
  - **Cloud Modules — IBP/SAC** (4건): IBP 데이터 통합 collective (2436131), SAC 성능 collective (2511489), SAC story 느린 성능 (3056467), SAC charts/tables 오류 (2651014)
  - **PM/QM/EWM 보강** (7건): IW31 planning plant 비활성 (3502643), IW31 IM440 (3622495), IW31 정산 룰 (2841195), QA11/QA32 강제 완료 (1958483), QA11/QA32 CL738 (3524952), /SCWM/L3104 (3612979), /SCWM/WMEBASICS 018 (3105375)
  - **Korea Localization** (1건): South Korea S/4HANA Cloud 활성화 요청 (2738889)
- `data/sap-notes.yaml` `meta.last_updated`: 2026-04-11 → 2026-05-24

### Notes — Plan B4 의 부분 완료 사유

- plan B4 의 acceptance criteria 는 "100건 이상" 이었으나 ground-truth 룰 (CLAUDE.md, sap-notes.yaml 헤더 룰 모두) 에 따라 **검증 가능한 공개 KBA 만** 등록. SAP Service Marketplace 의 paywall 뒤 solution 단계는 추측 등록 금지 (PR #32→#33 revert 학습 회피).
- 잔여 23+ 건은 v2.4 또는 SAP S-user 계정 보유자가 등록 가능. `data/sap-notes.yaml` 의 `meta.contribution_guideline` 절차에 따라 community PR 환영.
- `bash scripts/check-ko-references.sh --strict` (누락 0), `bash scripts/lint-frontmatter.sh` (오류 0), `bash scripts/check-marketplace.sh` (오류 0), `bash scripts/build-multi-ai.sh --check` (drift 없음) 통과.
- v2.3.3 tag push 는 사용자가 `NPM_TOKEN` GitHub repo secret 등록 후 진행 (A2 검증 통합).

---

## [2.3.2] - 2026-05-23

### Fixed
- **`extension/package-lock.json` 5개 transitive dependencies 누락 — npm ci fail** — v2.3.1 의 release.yml CI 가 `cd extension && npm ci` 단계에서 `npm error Missing: sax@1.6.0 from lock file` (외 xmlbuilder@11.0.1, buffer-crc32@0.2.13, fd-slicer@1.1.0, pend@1.2.0) 발생. `@vscode/vsce` 의 transitive deps 가 package.json 명시 없이 lock 에만 존재해야 하는데 lock 이 outdated. 결과: node_modules 비어서 `@types/vscode`, `@types/node` 모두 누락 → tsc TS2307/TS2591 errors → vsix 미생성 → GitHub Release assets 에 mcp tgz 만 첨부, vsix 또 누락.
- **Root cause**: v2.2.1 의 `mcp/package-lock.json` 누락 안티패턴 (memory/feedback_release_pipeline.md) 이 extension 에서 재현. lock 산포 (drift) — 로컬 install 후 commit 안 됨.
- **Fix**: `cd extension && npm install --package-lock-only --ignore-scripts` 로 lock 재생성. 573 → 2977 라인. 5개 누락 entries (sax, xmlbuilder, buffer-crc32, fd-slicer, pend) 추가.
- 로컬에서 `npm ci && npm run compile` 통과 검증.

### Notes
- v2.3.1 의 tsconfig/esbuild fix 는 정상 유지 (lock 누락 fix 후 tsc 가 통과해야만 의미가 살아남)
- v2.3.2 = release.yml 의 vsix asset 정상 첨부가 검증되는 첫 버전 (예상)
- v2.3.0 → v2.3.1 → v2.3.2 의 3 단계 사이클 = v2.2.x 4 hotfix 사이클 대비 1 회 감소 — 부분 retro 학습 적용

---

## [2.3.1] - 2026-05-23

### Fixed
- **Extension vsix 빌드 실패로 v2.3.0 GitHub Release 의 vsix asset 누락** — v2.3.0 release.yml CI 환경 (TypeScript 6.x 예고 + deprecation→error 처리) 에서 `extension/tsconfig.json` 의 `moduleResolution: "node"` ("node10" alias) 가 TS5107 error 로 처리되어 `tsc --noEmit && esbuild` 가 `&&` 단락으로 esbuild 실행 못 함 → vsix 미생성 → `softprops/action-gh-release` 의 `extension/*.vsix` pattern mismatch (`🤔 Pattern 'extension/*.vsix' does not match any files.`)
- **Fix**: `extension/tsconfig.json` 의 `module: "commonjs"` → `"ES2020"`, `moduleResolution: "node"` → `"bundler"` (esbuild 환경에 맞는 모던 옵션, TS 5.x/6.x 모두에서 deprecation 없음)
- **Fix**: `extension/esbuild.config.js` 에 `platform: 'node'` 추가 — `moduleResolution: bundler` 환경에서 node built-ins (`path`, `fs` 등) 자동 external 처리

### Notes
- v2.3.0 의 모든 컨텐츠 변경은 main 에 머지됨 — 이 patch 는 빌드 인프라 fix 만 포함
- CI 의 step conclusion 이 `continue-on-error: true` 로 success mask 되는 안티패턴 재현 — v2.2.x 4 hotfix retro 의 학습이 부분 적용됐으나 `npm run compile && npm run package` 의 `&&` 단락 silent fail 까지는 잡지 못함. memory/feedback_release_pipeline.md 에 보강 예정
- v2.3.1 = release.yml 의 vsix asset 정상 첨부 + mcp tgz asset 정상 첨부 모두 검증되는 첫 버전

---

## [2.3.0] - 2026-05-23

### Theme
**"Polyglot Completion + Cloud Depth + Pipeline Robustness"** — 다국어 quick-guide 를 5 → 24 모듈로 확장, 신규 4 클라우드 모듈의 IMG / Best Practice / T-code 자산을 보강, MCP 도구 +3 (find_img_node_by_keyword / symptom_to_agent_auto / sap_note_steps), VS Code Extension stub command 5개 실 구현, native 검수 community 인프라 추가, 그리고 release pipeline 의 mcp tgz asset 정합화. 모든 sub-goal 은 별도 PR (#13~#25, 13 PRs) 로 분리 머지되었고 quality gate 10개를 strict mode 로 통과.

### Added — 다국어 quick-guide 완성 (C1, PR #21~#25)
- **24 모듈 × 5 lang = 120 파일** 신규 작성 (`plugins/sap-*/skills/sap-*/references/{en,zh,ja,de,vi}/quick-guide-{lang}.md`)
- 모든 파일 상단에 `<!-- Claude-authored draft (community review welcome) -->` 배지 (native 검수 inflow 유도)
- `scripts/check-translation-parity.sh --strict` 결과 ERRORS=0, WARNINGS=0 (H2 ±3 / H3 ±8 / code-block ±2 / T-code ≥60% / lines 30-250% 게이트 통과)
- ko 소스 → 5 lang 확장은 직접 작성 (LLM API 미사용 — 비용 $0)
- ko-specific 컨텐츠는 country localization 적용: 中国本地化 (zh) / 日本ローカル (ja) / Deutsche Lokalisierung (de) / Bản địa hóa Việt Nam (vi) / Country-agnostic (en)
- T-code / SAP Note 번호 / Fiori app ID 는 원형 유지 (F110, MIGO, MD63, /SCWM/MON 등)

### Added — 신규 4 클라우드 모듈 자산 보강 (B1, B2, B3)
- **IMG 가이드 16 파일** (B1, PR #16): sap-ibp / sap-sac / sap-ariba / sap-integration-cloud 각각 BTP cockpit / Key User 구성 가이드 (`references/img/*.md`)
- **Best Practice 3-Tier 12 파일** (B2, PR #17): operational / period-end / governance × 4 모듈
- **T-code / Fiori app 25 entries** (B3, PR #14, `data/tcodes.yaml`): IBP Planning Area / SAC story ID / Ariba module ID / Integration Suite iFlow / Datasphere / Cloud Connector 경로
- 결과: `check-img-references.sh` 76 파일 ✓ / `check-best-practices.sh` 23 모듈 완성 ✓ / `check-tcodes.sh --strict` 395 확정 / 0 미등록

### Added — MCP 신규 도구 3개 (C2, PR #18)
- `find_img_node_by_keyword(keyword)` — IMG 가이드 SPRO 경로에서 키워드 매칭
- `symptom_to_agent_auto(symptom)` — symptom-index + agents/ 매핑으로 자동 라우팅 추천
- `sap_note_steps(note_id)` — sap-notes.yaml solution 단계를 ordered list 로 반환
- **MCP server total: 20 → 23 tools** (`mcp/sapstack-server.json`)
- `mcp/types.ts` strict 타입 정의 + handler 구현 + npm test 스크립트 정합화

### Added — VS Code Extension 5 stub command 실 구현 (C3, PR #19)
- 5 stub command 가 실 동작 핸들러로 교체 (`extension/src/commands/`)
- `getParent` 타입 fix (tree provider hover info 정상화)
- QA 리포트 신규: `docs/vscode-extension-qa.md` — 14/14 commands 동작 검증

### Added — symptom-index 보강 (B4-A, PR #15)
- 신규 4 모듈 +20 entries + 부족 모듈 +8 entries = **62 → 90 entries** (`data/symptom-index.yaml`)
- 모든 모듈이 5+ entries 확보

### Added — native 검수 community 인프라 (C4, PR #20)
- `docs/TRANSLATION-REVIEW.md` 신규 — 검수 절차 / 평가 기준 / PR 템플릿 가이드
- `.github/ISSUE_TEMPLATE/translation-feedback.md` 신규 — 언어 / 모듈 / 페이지 / 제안 필드 Issue form
- `CODEOWNERS` 에 `plugins/*/skills/*/references/{en,zh,ja,de,vi}/` 별 placeholder reviewer
- README × 6 (root + ko/en/zh/ja/de/vi) 에 "How to Contribute Translations" 섹션

### Changed — release pipeline (A1, PR #13)
- `.github/workflows/release.yml` 에 별도 "Pack MCP tarball" step 분리 (`cd mcp && npm pack`)
- `.gitignore` 에 `mcp/*.tgz` (release.yml 의 tgz asset 산출물만 ignore, source 보존)
- 효과: NPM_TOKEN 미설정으로 publish step 이 continue-on-error skip 되어도 GitHub Release artifacts 에 `boxlogodev-sapstack-mcp-2.3.0.tgz` 첨부됨

### Changed — quality gate 개선
- `scripts/check-links.sh` — `.claude/worktrees/*` 무시 패턴 추가. agent worktree 임시 디렉토리의 link error 로 인한 false positive 차단 (1209 → 521 검사 파일, 끊어진 링크 0)

### Deferred — v2.3.1 또는 v2.4 이월
- **SAP Note 57 → 100+ 추가 등록 (43 entries 미작업)** — Note 번호 / URL / solution 단계의 ground-truth 검증 부담이 크고 SAP Service Marketplace 직접 확인 필요한 작업이라 별도 사이클로 분리
- A2 (NPM publish 활성화 검증) — 사용자가 GitHub repo Settings → Secrets → Actions 에 `NPM_TOKEN` 등록 후 v2.3.1 또는 새 태그 push 시 자동 동작
- A3 (VS Code Marketplace publish) — 사용자가 Azure DevOps PAT 발급 + `vsce login BoxLogoDev` 완료 후 `npx vsce publish` 트리거 가능

### Notes
- 정량 목표 vs 실측: 다국어 120 (목표 115+) ✓ / IMG 16 (목표 12+) ✓ / BP 12 (목표 12) ✓ / T-code 25 (목표 ~30) △ / MCP +3 (목표 +3) ✓ / SAP Note 57 (목표 100+) ✗ — 5/6 정량 목표 달성, SAP Note 만 이월
- 13 PRs (PR #13 ~ #25) 분리 머지로 검증 가능성 확보 — v2.2.x 의 4 hotfix 사이클 안티패턴 (단일 거대 PR 의 묶음 fail) 회피
- 자율 작업 ground-truth retro: plan 의 "fact-claim 즉시 verify" 원칙으로 일부 sub-goal 의 misreport 감지 → CHANGELOG 정확성 확보

---

## [2.2.3] - 2026-05-15

### Changed
- **`.github/workflows/release.yml`** — "Publish MCP to npm" 단계에 `continue-on-error: true` 추가
  - NPM_TOKEN secret 미설정 시 발생하는 401 ENEEDAUTH 가 뒤따르는 단계 (Extension build, GitHub Release 생성) 를 skip 시키던 설계 결함 해소
  - npm publish 자체는 사용자가 NPM_TOKEN 등록 후 별도 트리거 가능
  - v2.0.0/v2.1.0/v2.2.x 모두 동일 원인으로 GitHub Releases 페이지에 v2.1.0 이 마지막이었음 — 이번 fix 로 해소

### Notes
- v2.2.3 = release.yml 의 모든 단계 (npm publish 제외) 가 정상 통과되어 GitHub Release 가 만들어지는 첫 버전
- NPM publish 는 사용자 GitHub repo → Settings → Secrets → Actions 에 `NPM_TOKEN` 등록 후 v2.2.4 또는 새 태그 push 시 정상 동작

---

## [2.2.2] - 2026-05-15

### Fixed
- **mcp/server.ts TypeScript strict-mode 에러 7건** — `tsc --strict` 가 `Record<string, unknown> | undefined` 타입을 strict args 타입에 직접 패스하지 못한 문제. 기존 코드의 일관된 패턴(`as any` 캐스팅)에 맞춰 라인 1443-1446, 1459-1461 보정
- **로컬 tsc 검증 누락** — mcp/ 디렉토리에 `node_modules` 가 없어 로컬에서 `npm run build` 가 실행된 적 없음. CI release.yml 단계에서 처음 빌드되며 발견됨

### Notes
- v2.2.0 release fail = mcp/package-lock.json 누락 (v2.2.1 에서 fix)
- v2.2.1 release fail = mcp/server.ts tsc 에러 7 (이 v2.2.2 에서 fix)
- v2.2.2 = release.yml 의 build → publish 까지 정상 통과 예상되는 첫 버전

---

## [2.2.1] - 2026-05-15

### Fixed
- **mcp/package-lock.json** 생성 (이전 누락) — release.yml 의 `npm ci` 단계 실패 원인 해소
  - v2.0.0 / v2.1.0 / v2.2.0 릴리스 모두 동일 원인으로 npm publish 실패해온 것이 v2.2.0 release run 분석 중 발견됨
  - 이번 hotfix 로 첫 정상 npm publish 가능 (`@boxlogodev/sapstack-mcp@2.2.1`)

### Notes
- v2.2.0 의 모든 기능 변경은 main 에 이미 머지됨 — 이 패치는 빌드 인프라 fix 만 포함
- npm 에 publish 되는 첫 정상 버전: `@boxlogodev/sapstack-mcp@2.2.1`

---

## [2.2.0] - 2026-05-15

### Theme
**"Global SAP Cloud + Polyglot"** — 신규 4개 SAP Cloud 모듈, 5개 언어 quick-guide, 8개 AI 도구 호환 레이어, MCP npm publish + VS Code Extension v0.1 beta. 단일 릴리스, 5개 phase × 별도 PR로 검증.

### Added — 신규 4개 SAP Cloud 모듈 (Phase 2)
- **sap-ibp** — Integrated Business Planning (수요 예측, S&OP, supply planning)
- **sap-sac** — SAP Analytics Cloud (스토리, BW Bridge, predictive)
- **sap-ariba** — Ariba Sourcing/Contracts/Procurement/Supplier
- **sap-integration-cloud** — Datasphere + Cloud Integration (CPI/iFlow)
- 각 모듈마다 SKILL.md + agent (`sap-{module}-consultant`) + command 1개씩
- marketplace.json: 20 → **24 플러그인**

### Added — 산업·국가 가이드 (Phase 2)
- 산업 가이드 +4: chemicals.md, automotive.md, healthcare.md, public-sector.md
- 산업 매트릭스 (`data/industry-matrix.yaml`) 신규 모듈 행 추가
- country/ 디렉토리: korea, germany 외 japan/china/vietnam/usa 신규 (총 6개)

### Added — 다국어 quick-guide (Phase 3)
- 핵심 5개 모듈 × 5개 언어 = **25 신규 quick-guide-{lang}.md** 파일
  - 대상: sap-fi, sap-mm, sap-abap, sap-s4-migration, sap-btp
  - 언어: en/zh/ja/de/vi (모두 `<!-- Claude-authored draft -->` 배지 부착)
  - ko-specific 섹션 → 각 언어 country localization 변환
- 다국어 빌드 인프라: `scripts/build-translations.sh` (LLM API 기반 자동 번역)
- 다국어 정합성 검증: `scripts/check-translation-parity.sh` (Quality Gate)
- 검수 상태: Claude 작성 초안, 커뮤니티 리뷰 환영

### Added — AI 도구 호환 레이어 (Phase 4)
- **신규 3개**: `.cody/rules.md`, `.windsurfrules`, `.idea/sapstack-prompt.md`
- 기존 5개 + 신규 3개 = **8개 AI 도구 호환 레이어** 총합
- `build-multi-ai.sh` COMPAT_FILES 배열 확장, sync block 자동 주입

### Added — MCP npm publish (Phase 4)
- `mcp/package.json`: `publishConfig.access = "public"` 추가
- `mcp/README.md`: 3가지 설치 옵션 안내 (one-line installer / npm global / source build)
- **Claude Desktop 자동 설치 스크립트**
  - `scripts/install-claude-desktop.sh` (macOS / Linux, jq 필수)
  - `scripts/install-claude-desktop.ps1` (Windows PowerShell)
  - `--dry-run` / `--uninstall` 옵션

### Added — VS Code Extension v0.1 beta (Phase 4)
- `package` / `publish` 스크립트 (vsce 호출) 추가
- `@vscode/vsce` 2.24 devDependency
- 메타데이터: `stage: "stub"` → `"beta-v0.1"`, `implementedIn: "v2.2.0"`
- 실제 빌드/publish는 v2.2.0 tag push 시 release.yml 자동 실행

### Added — Quality Gates 신규
- `bump-version.sh --check` — 5개 package 파일 버전 동기화 검증
- `check-translation-parity.sh --strict` — 5언어 quick-guide 구조 정합성
- `release.yml` 보강 — tag-version 일치 검증, MCP build + npm publish, Extension build, GitHub Release 자동

### Changed — 기존 모듈 깊이 강화 (Phase 1)
- T-code 레지스트리: 311 → **370** (+20 module boost + Phase 0 backfill 13 + Phase 1 module boost)
- `check-tcodes.sh --strict` allowlist 47개 추가 (false positives + suspicious + cloud identifiers)
- Best Practice 3-Tier: 7개 모듈 추가 (sap-basis, sap-abap, sap-bc, sap-btp, sap-gts, sap-s4-migration, sap-sfsf — 각 operational/period-end/governance 21파일)
- IMG 가이드 분량 확장
- CONTRIBUTORS.md 신규 (broken link 해소)
- country/templates/cvi-template.md 신규
- plugins/sap-hcm/skills/sap-hcm/references/finance-integration.md 신규

### Changed — Phase 0 정리 + 버전 sync 인프라
- `INDEX.md`, `DIRECTORIES.md`, `SETUP-GUIDE.md` 디렉토리 가이드 commit
- `scripts/add_translations.py` 삭제 (다국어 빌드 파이프라인으로 통합)
- `.gitignore` 보강 (agent-memory, worktrees, .pr-body-*.md, .idea/sapstack-prompt.md negate)
- `scripts/bump-version.sh` 확장 — 5개 package 파일 일괄 갱신 + `--check` 모드

### Fixed
- `check-links.sh` 정규식 버그 수정 (nested parens 인식)
- `check-links.sh` 절대 경로 처리 + node_modules/dist 제외
- `check-translation-parity.sh` 3가지 버그 수정 (CI exit 1, dirname 깊이, 임계값)
- `check-translation-parity.sh` source 우선순위: `ko/quick-guide.md` → `SKILL.md` fallback

### Stats
| 지표 | v2.1.0 | v2.2.0 |
|---|---|---|
| 플러그인 | 20 | **24** |
| 에이전트 | 16 | **20** |
| 슬래시 커맨드 | 18 | **22+** |
| T-code | 311 | **370+** |
| 산업 가이드 | 3 | **7** |
| country/ | 2 | **6** |
| AI 도구 호환 레이어 | 5 | **8** |
| quick-guide 언어 | 1 (ko) | **6** (핵심 5 모듈) |
| MCP | source-only | **npm publish 가능** |
| VS Code Extension | stub | **v0.1 beta** |

### PRs (v2.2.0 phase-별)
- #1 (Phase 0) — 정리 + 버전 sync 인프라
- #3 (Phase 1) — 기존 모듈 깊이 강화
- #4 (Phase 2 part 1) — 신규 4개 클라우드 SAP 모듈
- #5 (Phase 2 part 2) — agent 4 + command 4 + 산업 가이드 4
- #6 (Phase 3 infra) — 다국어 번역 인프라
- #7 (Phase 3 core) — 핵심 5 모듈 × 5 언어 quick-guide (25 파일)
- #8 (Phase 4) — AI 도구 통합 강화
- #9 (Phase 5) — v2.2.0 릴리스 (이 PR)

---

## [2.1.0] - 2026-04-15

### Theme
**"Cross-pollination + Coverage Expansion"** — superclaude-for-sap 프로젝트의 우수
패턴을 차용하여 sapstack 구조 보강. exceptions/, hooks/, country/, bridge/
4개 신규 디렉토리 추가. MCP 도구 9 → 20+, 다국어 번역 30+/62 확장.

### Added — 신규 디렉토리 (superclaude-for-sap 차용)
- **`exceptions/`** — SAP 예외 클래스 카탈로그 (CX_*) 6개 카테고리
  - financial, logistics, abap-runtime, integration, security, README
- **`hooks/`** — sapstack 자동화 훅 시스템
  - pre-evidence-collect, post-session-end, period-end-guard, transport-validator
  - sample-hooks.json 예시
- **`country/`** — 국가별 SAP 로컬라이제이션 정리 (7개 국가)
  - korea, germany, japan, china, vietnam, usa
- **`bridge/`** — SAP 시스템 연동 패턴 문서
  - rfc-pattern, odata-pattern, rest-pattern, idoc-pattern, cpi-pattern

### Added — MCP Server 확장
- **MCP 도구 9 → 20+개** (read 8 신규, write 3 신규, utility 1 신규)
  - list_tcodes_by_module, list_agents_for_industry, get_period_end_sequence
  - lookup_synonym, list_img_guides, list_best_practices
  - get_master_data_rules, find_sap_note_by_module
  - add_followup_request, submit_hypothesis, submit_verdict
  - validate_session_file
- **MCP Prompts 5개 구현** (NotImplementedError 해결)
  - evidence-loop-turn2, evidence-loop-turn4
  - korean-field-language, img-config-walk, best-practice-review

### Changed — 다국어 번역 확장
- **symptom-index 번역 30+/62 entries** (각 zh/ja/de/vi)
- 커뮤니티 기여 가속화

### References
- 차용 inspiration: [babamba2/superclaude-for-sap](https://github.com/babamba2/superclaude-for-sap)
- 두 프로젝트는 **상호 보완**: superclaude = ABAP 개발 중심, sapstack = 운영/진단 중심

---

## [2.0.0] - 2026-04-13

### Theme
**"Runtime Completion"** — sapstack이 feature-complete knowledge repo에서
**실제 작동하는 글로벌 OSS 플랫폼**으로 진화하는 메이저 릴리스.
스캐폴딩 상태였던 MCP write-path, VS Code Extension, NPM 패키지를 전부
실구현하고, 엔터프라이즈 채택 장벽 제거를 위한 컴플라이언스 권고안을 추가.

### Added — MCP Server Write-Path (실구현)
- **start_session / add_evidence / next_turn** 툴 완전 구현
  - Evidence Loop 전체 턴을 MCP를 통해 실행 가능
  - Ajv 기반 스키마 검증 활성화
  - 원자적 파일 쓰기 (tmp → rename)
- **mcp/cli.ts** — stdio 서버 CLI 래퍼
- **mcp/types.ts** — TypeScript 타입 정의
- **--offline 플래그** — 망분리 환경 지원
- **npm 패키지 발행 준비** — `@boxlogodev/sapstack-mcp`

### Added — VS Code Extension (실구현)
- **전체 TypeScript 구현** — 10 commands + 3 tree views
  - SessionsTreeProvider, FollowupsTreeProvider, PluginsTreeProvider
  - VerdictWebview, FollowupWebview
- **File watcher** — `.sapstack/sessions/**/*.yaml` 자동 감지
- **YAML 검증** — Red Hat YAML 연계
- **esbuild 번들링** — dist/extension.js

### Added — NPM + CI 자동화
- **`.github/workflows/release.yml`** — 태그 push 시 자동 빌드/발행
- **`scripts/bump-version.sh`** — 3개 package.json 일괄 버전 업데이트
- **`scripts/generate-release-notes.sh`** — CHANGELOG에서 릴리즈 노트 추출

### Added — 컴플라이언스 권고안
- **`SECURITY.md` 대폭 교체** — Threat Model, Data Handling, PII, Air-Gap, 감사 매핑
- **`docs/compliance/`** — 8개 문서 (K-SOX, SOC2, ISO27001, GDPR, 망분리, PII, Audit Trail)
- **`mcp/pii-scrubber.ts`** — 한국 PII 자동 마스킹 (주민번호, 사업자번호, 전화, 카드, 계좌)

### Changed
- **marketplace.json** — version 1.7.0 → 2.0.0
- **MCP manifest** — write tools를 stable로 표시
- **README** — v2.0 Runtime Completion 반영 (6개 언어)

### Breaking Changes
- 없음. 하위 호환 유지.

### Migration
- 기존 v1.x 사용자: 업그레이드만 하면 됨
- Evidence Loop 세션: 그대로 동작
- MCP 클라이언트: 읽기 툴 호출 방식 동일

---

## [1.7.0] - 2026-04-13

### Theme
**"Global Expansion + Cloud Native"** — sapstack이 한국 중심에서 **글로벌 6개 언어**로
확장되고, **SAP S/4HANA Cloud PE** 전용 컨설턴트와 **SAP AI/Joule 연동 전략**을
추가하는 릴리스. 에이전트 네이밍도 역할 기반으로 정비.

### Added — SAP Cloud PE Module
- **`sap-cloud`** 플러그인 — S/4HANA Cloud Public Edition 전용
  - Clean Core, Key User Extensibility, 3-Tier Extension Model
  - Fit-to-Standard, Cloud ALM, Quarterly Release, CSP
- **`sap-cloud-consultant`** 에이전트 — Cloud PE 전문 컨설턴트
- IMG 가이드 3개 (overview, key-user-extensibility, fit-to-standard)
- Best Practice 3개 (operational, period-end, governance)

### Added — Multilingual (6 Languages)
- **6개 언어 지원**: ko, en, zh (中文), ja (日本語), de (Deutsch), vi (Tiếng Việt)
- `data/symptom-index.yaml` — 62개 증상 × 6개 언어 번역
- `data/synonyms.yaml` — 80+ 용어 다국어 variants
- `web/i18n/zh.json` (NEW), `web/i18n/vi.json` (NEW)
- `web/i18n/de.json` (15% → 100%), `web/i18n/ja.json` (15% → 100%)

### Added — SAP AI/Joule Research
- **`docs/sap-ai-integration.md`** — Joule vs sapstack 포지셔닝, 상호보완 시나리오,
  기술 연동 옵션 (Prompt Injection / BTP RAG / API), 한국 시장 분석, v2.0 비전

### Changed — Agent Restructuring
- **`sap-basis-troubleshooter` → `sap-basis-consultant`** — 네이밍 통일 + BC 통합
- **`sap-abap-reviewer` → `sap-abap-developer`** — 리뷰 → 개발 가이드 전체
- **sap-session SKILL.md** — 16개 에이전트 라우팅 테이블 (Cloud PE, PM, QM, WM/EWM, HCM, TR, 튜터 추가)
- **CLAUDE.md** — 다국어 규칙, Cloud PE 라우팅, SAP AI 참조 추가

---

## [1.6.0] - 2026-04-12

### Theme
**"Enterprise SAP Operations Platform"** — sapstack이 트러블슈팅 도구에서
**SAP 운영 전체 라이프사이클 플랫폼**으로 진화하는 릴리스.
IMG 구성 가이드, 3-Tier Best Practice, 엔터프라이즈 시나리오, 업종별 가이드를
추가하여 Configure → Implement → Operate → Diagnose → Optimize 5축 구조를 완성한다.

### Added — New Modules (+4)
- **`sap-pm`** — SAP Plant Maintenance (설비보전): 장비마스터, 보전오더, 예방보전, MTBF/MTTR, 산업안전보건법
- **`sap-qm`** — SAP Quality Management (품질관리): 검사계획, 검사로트, 사용결정, 품질통보, ISO/GMP/HACCP
- **`sap-wm`** — SAP Warehouse Management (창고관리): ECC 레거시, S/4 deprecated 안내, EWM 전환 가이드
- **`sap-ewm`** — SAP Extended Warehouse Management (확장창고관리): Wave/Pack/RF, Embedded vs Decentralized

### Added — IMG Configuration Framework (Phase 1)
- **45+ IMG 구성 가이드** — 11개 모듈에 SPRO 경로, 구성 단계, 필드 설정, ECC/S/4 차이, 검증 방법
  - FI: 7 files (GL 계정결정, 전표유형, 기간제어, 세금, 자산회계, GR/IR, overview)
  - CO: 5 files (관리회계영역, 원가센터, 내부오더, 제품원가, overview)
  - TR: 5 files (하우스뱅크, 지급프로그램, 은행명세서, DMEE, overview)
  - MM: 5 files (이동유형, 계정결정, 허용한도, 구매조직, overview)
  - SD: 5 files (가격결정, 계정결정, 복사제어, 여신관리, overview)
  - PP: 5 files (MRP구성, 생산오더유형, BOM/라우팅, 용량계획, overview)
  - PM: 5 files (장비/기능위치, 보전오더유형, 예방보전, 통보카탈로그, overview)
  - QM: 5 files (검사유형, 검사계획, 사용결정, 품질통보유형, overview)
  - WM: 3 files (창고구조, 이동유형/전략, overview)
  - HCM: 5 files (인사관리, 급여영역, 근태관리, 조직관리, overview)
  - EWM: 5 files (창고프로세스유형, 적치전략, RF프레임워크, Wave/Packing, overview)
- **`scripts/check-img-references.sh`** — IMG 문서 형식 검증 QG

### Added — Best Practice Framework (Phase 2)
- **3-Tier Best Practice 체계**: Operational (일상) / Period-End (기간마감) / Governance (거버넌스)
- **7 공통 BP 문서** (`docs/best-practices/`):
  - authorization-governance, transport-management, master-data-governance,
    period-end-orchestration, change-management, data-archiving, README
- **33 모듈별 BP** (11 modules × 3 tiers) — FI/CO/TR/MM/SD/PP/PM/QM/WM/EWM/HCM
- **`scripts/check-best-practices.sh`** — BP 3-Tier 구조 검증 QG

### Added — Enterprise Scenario Layer (Phase 3)
- **6 엔터프라이즈 문서** (`docs/enterprise/`):
  - multi-company-code, shared-services, system-landscape,
    intercompany, global-rollout, integration-constraints
- **3 업종별 가이드** (`docs/industry/`):
  - manufacturing (제조업), retail (유통업), financial-services (금융업)
- **`data/industry-matrix.yaml`** — 업종별 모듈 활성화/중요도 매트릭스
- **`scripts/check-industry-refs.sh`** — 업종별 가이드 참조 무결성 QG

### Added — Agents (+6) & Commands (+5)
- **`sap-tutor`** — SAP 신입사원 교육 튜터 (각 컨설턴트에게 질문 위임 + 초보자 수준 번역)
- **`sap-hcm-consultant`** — HCM 한국어 컨설턴트 (4대보험, 원천징수, 퇴직연금)
- **`sap-tr-consultant`** — TR 한국어 컨설턴트 (유동성, 은행 연동, DMEE)
- **`sap-pm-consultant`** — PM 한국어 전문가 (장비, 보전오더, MTBF/MTTR)
- **`sap-qm-consultant`** — QM 한국어 전문가 (검사, 사용결정, ISO/GMP)
- **`sap-ewm-consultant`** — EWM/WM 한국어 컨설턴트 (Wave, RF, 마이그레이션)
- **`/sap-img-guide`** — IMG 구성 가이드 조회 커맨드
- **`/sap-master-data-check`** — 마스터데이터 사전검증
- **`/sap-bp-review`** — Best Practice 준수 리뷰
- **`/sap-pm-diagnosis`** — 설비 고장 진단
- **`/sap-qm-inspection`** — 품질검사 분석

### Added — Data Assets
- **`data/period-end-sequence.yaml`** — 모듈 횡단 기간마감 실행 순서 (의존성 포함)
- **`data/master-data-rules.yaml`** — 마스터데이터 필수 필드 검증 규칙
- **`data/industry-matrix.yaml`** — 업종별 모듈 매트릭스

### Changed
- **`sap-pp-analyzer` → `sap-pp-consultant`** — PP 에이전트 이름 변경 (다른 모듈과 일관성)
- **기존 9개 에이전트** — IMG 구성 라우팅 + sap-tutor 위임 프로토콜 추가
- **`data/tcodes.yaml`** — 279 → ~340 T-codes (+PM/QM/WM/EWM)
- **`data/symptom-index.yaml`** — 18 → 62 증상 (+CO/PP/SD/HCM/PM/QM/WM/EWM/TR/Integration/Korea)
- **`data/sap-notes.yaml`** — 46 → 57 SAP Notes (+PM/QM/WM/EWM/HCM)
- **`data/synonyms.yaml`** — 58 → 80+ 동의어 (+PM/QM/WM/EWM 현장용어)
- **`CLAUDE.md`** — PM/QM/WM/EWM 호환성 매트릭스, IMG/BP/Enterprise/Industry 참조 규칙, 튜터 에이전트 라우팅
- **`.claude-plugin/marketplace.json`** — 4개 플러그인 추가, 버전 1.6.0
- **`.github/workflows/ci.yml`** — 3개 신규 QG + validate-config 추가

### Migration
- 하위 호환: 기존 v1.5.0 설정과 완전 호환
- `sap-pp-analyzer` → `sap-pp-consultant` 이름 변경 — 기존 참조 업데이트 필요

---

## [1.5.0] - 2026-04-12

### Theme
**"Evidence Loop — from advisor to diagnostic partner"** — sapstack이 단발
조언봇에서 **턴 인식 진단 파트너**로 전환되는 릴리스. 라이브 SAP 접근 없이도
Human-in-the-loop 비동기 루프가 동작하며, 엔드유저 셀프 트리아지 웹 포털
(Surface C)이 추가되어 처음으로 **운영자 외 사용자에게 도달**한다.
동시에 **한국 SAP 현장체 언어 레이어**를 도입해 "번역체" 대신 실제 발화
스타일로 작성·매칭한다.

### Added — Korean Field Language Layer (Slice 8)
- **`data/synonyms.yaml`** — 58 용어 + 10 약어 + 15 업무 시점 표기 동의어 사전
  - FI 20 / CO 8 / MM 12 / SD 10 / BASIS 8
  - 각 엔트리에 ko.primary + ko.variants + en + de + ja + field_forms
  - 예: "코스트 센터" = ["코스트센터", "원가센터", "CC", "KOSTL", "Cost Center"]
- **`data/tcode-pronunciation.yaml`** — 41개 핵심 T-code의 한국어 현장 발음
  ("에프백십" = F110, "엠아이고" = MIGO, "에스이십육엔" = SE16N)
- **`plugins/sap-session/.../references/korean-field-language.md`** — 4개 원칙
  (이중 병기, 발화체 수용, 약어 정착성, 업무 시점 표기) + 금기 표현 리스트
- **`CLAUDE.md` Universal Rule #8** — "Use field language, not dictionary Korean"
  - 첫 등장 이중 병기, 발화체 수용, T-code·약어 원형 유지, D-1·월마감 D+3
- **매칭 엔진 synonym 확장** (triage.js + mcp/server.ts)
  - 쿼리 토큰을 canonical로 정규화 후 모든 form으로 확장
  - 2-3 그램 매칭으로 "코스트 센터" 같은 복합어 인식
  - synonym 히트에 점수 가중 (사용자가 정확한 SAP 용어를 안다는 신호)

### Changed — symptom-index.yaml 20건 전부 현장체 재작성
- 모든 `symptom_ko`를 발화체로 리라이트 ("F110 돌렸는데 벤더 하나만 뜨네요")
- 신규 필드 `symptom_ko_variants` — 각 증상에 4-5개 발화 변형
- `typical_causes`에 이중 병기 적용 ("ZWELS(페이먼트 메소드, LFB1)")
- triage.js 파서에 `symptom_ko_variants` 인식 추가
- `typical_causes`도 매칭 대상에 포함

### Changed — 현장체 전면 적용
- `aidlc-docs/sapstack/f110-dog-food.md` 대화 예시 전부 현장체
- `commands/sap-session-start.md`, `next-turn.md` 출력 예시 현장체
- `web/triage.html` placeholder + 예시 칩 6개 현장체
- `web/i18n/ko.json` placeholder 현장체

### Added — Amazon Kiro IDE 통합 (Slice 9)
- **`.kiro/settings/mcp.json`** — Kiro MCP 서버 등록 템플릿
  - 읽기 툴 5개(`resolve_symptom`, `check_tcode`, `list_sessions`,
    `resolve_sap_note`, `list_plugins`) autoApprove
  - 쓰기 툴 4개는 명시적으로 수동 승인 유지 (Universal Rule #5)
- **`.kiro/steering/sapstack-universal-rules.md`** (inclusion: always)
  — `#[[file:CLAUDE.md]]` 참조로 Rule #1-#8 주입
- **`.kiro/steering/sapstack-korean-field-language.md`** (inclusion: always)
  — Rule #8 현장체 원칙 + `#[[file:data/synonyms.yaml]]` 주입
- **`.kiro/steering/sapstack-evidence-loop.md`** (inclusion: fileMatch)
  — `.sapstack/sessions/**/*.yaml` 편집 시 Turn-aware 포맷 주입
- **`.kiro/steering/sapstack-symptom-context.md`** (inclusion: auto)
  — SAP 증상 언급 시 20건 symptom-index 자동 로드
- **`docs/kiro-quickstart.md`** — 5분 Quick Start
- **`docs/kiro-integration.md`** — 전체 통합 아키텍처 + 5개 검증 시나리오

### Changed — AGENTS.md 전면 갱신
- v1.4.0 → v1.5.0 (Kiro·sap-session·Rule #8 반영)
- "13 모듈" → "15 플러그인" (sap-gts + sap-session 추가)
- 7개 Rule → **8개 Rule** (#8 현장체 원칙 추가)
- Standard Response Format을 **Dual Mode** (Quick Advisory + Evidence Loop)로 확장
- Evidence Loop 4턴 구조 요약 섹션 신설
- Multi-AI 호환 표에 Kiro IDE 추가 (6 → 7 AI tools)

### Changed — README.md
- 배지: v1.4.0 → v1.5.0, "6 AI tools" → "7 AI tools", "Kiro ready" 신규
- 30초 소개 섹션 Evidence Loop 강조
- Quick Start에 Kiro 섹션 추가 (2번째 위치, Codex CLI 앞)
- 14 modules → "14 modules + 1 meta (sap-session)"

### Changed — marketplace.json
- 기술 설명에 Kiro IDE 추가
- 7 AI tools 명시

### Design Principle — No Duplication via #[[file:...]] References
Kiro steering 파일은 **원본 파일의 복사가 아닙니다**. 모두
`#[[file:sapstack/...]]` 참조 문법으로 sapstack 원본을 실시간 주입합니다.
이 덕분에:
- sapstack을 `git pull`로 업데이트하면 steering도 자동 최신화
- steering 파일의 "본문"은 50-100줄의 metadata shell
- Drift 0, 동기화 부담 0
- sapstack이 여러 Kiro 워크스페이스에 서브모듈로 공유 가능



### Added — Evidence Loop 프레임워크
- **5개 JSON Schema** (`schemas/`)
  - `evidence-bundle.schema.yaml` — 운영자가 가져온 증거 모음
  - `followup-request.schema.yaml` — AI→운영자 구조화된 체크리스트
  - `hypothesis.schema.yaml` — 반증 조건 필수 가설
  - `verdict.schema.yaml` — Fix + Rollback 필수 판정
  - `session-state.schema.yaml` — 전체 세션 재개 가능 상태
- **`plugins/sap-session/`** — Evidence Loop 오케스트레이터
  - 기존 14개 플러그인과 9개 컨설턴트 에이전트 재사용 (새 에이전트 없음)
  - 4턴 구조: INTAKE → HYPOTHESIS → COLLECT → VERIFY
  - Falsifiability·Rollback·Localization 강제
- **3개 새 커맨드** (`commands/`)
  - `sap-session-start.md` — 새 세션 + Turn 1 INTAKE
  - `sap-session-add-evidence.md` — Bundle 추가 + 체크 매핑
  - `sap-session-next-turn.md` — 상태 기반 Turn 2/4 자동 실행

### Added — Surface C (엔드유저 웹 포털)
- **`web/triage.html`** + `triage.css` + `triage.js` — 정적 셀프 트리아지 포털
  - 클라이언트 사이드 fuzzy 매칭 (브라우저 안에서만 작동)
  - PII 자동 스캔 (주민번호·카드번호·패스워드)
  - 운영자 에스컬레이션 Markdown 페이로드 생성 (클립보드 복사/다운로드)
- **`web/session.html`** + `session.css` + `session.js` — 읽기 전용 세션 뷰어
  - state.yaml 드래그앤드롭 로드
  - 타임라인·가설·Verdict·Audit Trail 전체 표시
  - F110 dog-food 데모 세션 내장
  - 수정 UI 의도적 부재 (감사 요건)

### Added — 데이터 자산
- **`data/symptom-index.yaml`** — 20개 SAP 증상 ↔ 모듈/T-code 매핑
  - F110 (3), MM (3), FI (2), SD (2), ABAP (2), BASIS (2), 성능 (2)
  - 한국 특화 1건 (전자세금계산서)
  - ko/en 20건, de/ja 시드 3건
- **`data/symptom-index.yaml` 다국어 시드** (de/ja)

### Added — MCP Server scaffolding
- **`mcp/server.ts`** — TypeScript 엔트리, 읽기 전용 툴 작동
- **`mcp/package.json`** — `@modelcontextprotocol/sdk` 의존
- **`mcp/tsconfig.json`** + `README.md`
- **`mcp/sapstack-server.json` 확장** — v1.4.0 → v1.5.0
  - 새 resources: symptom-index, schema, session (동적)
  - 새 tools: `resolve_symptom`, `list_sessions`, `start_session`(v1.6), `add_evidence`(v1.6), `next_turn`(v1.6), `validate_session_file`(v1.6)
  - 새 prompts: Evidence Loop Turn 2/4 (v1.6)

### Added — VS Code Extension 명령 계약 (stub 유지)
- **`extension/package.json` 재정의**
  - 10개 Evidence Loop 명령 contribute
  - 3개 Tree View 선언 (sessions, followups, plugins)
  - 5개 세션 YAML에 대한 `yamlValidation` 설정 (Red Hat YAML 확장만으로 즉시 동작)
  - 9개 설정 키 (language, country, sessionsRoot, piiScanEnabled, ...)
- **`extension/README.md`** 전면 개편 — v1.6.0 실장자용 계약 명세

### Added — i18n 프레임워크
- **`web/i18n/{ko,en,de,ja}.json`** — UI 문자열 분리
  - ko/en 완전, de/ja 15% 시드
  - 누락 키는 자동 en 폴백
- **`docs/i18n/symptom-index.md`** — 번역 기여 가이드
  - 독일어/일본어 SAP 공식 용어 체크리스트
  - 새 국가 추가 절차 (5단계)

### Added — 문서
- **`aidlc-docs/sapstack/f110-dog-food.md`** — Mode 1(Quick Advisory) vs
  Mode 2(Evidence Loop) 정면 비교 시나리오. 같은 F110 케이스에 대해 두 방식의
  차이를 끝까지 추적.
- **`aidlc-docs/sapstack/escalation-flow.md`** — 3 Surface 간 세션 이동 규약
  (6개 전형 시나리오 + 보안 원칙)

### Changed — CLAUDE.md Standard Response Format (옵션 B 병행 모드)
- 기존 "Issue → Root Cause → Check → Fix → Prevention" 유지
- **Mode 1 (Quick Advisory)**: 단순 질의용 (기존 포맷)
- **Mode 2 (Evidence Loop)**: 복잡 진단용 (턴 인식 포맷)
- Mode 선택 규칙 표 추가 — AI가 질문 성격으로 자동 판단

### Changed — web/index.html nav
- Note Resolver 랜딩에 Triage·Session Viewer 링크 추가

### Changed — marketplace.json
- sap-session 플러그인 등록 (총 15개)
- 버전 v1.4.0 → v1.5.0

### Design Principles (신규 확립)
1. **No live SAP access** — 모든 데이터는 운영자가 수동으로 가져온 것
2. **Falsifiability required** — 가설은 반증 조건 없이 존재 불가
3. **Rollback-or-no-Fix** — Fix가 있으면 Rollback 필수
4. **Audit trail append-only** — 모든 상태 변화 기록, 수정/삭제 금지
5. **Three Surfaces** — CLI(A), IDE(B), Web(C)이 세션 ID로 연결
6. **Localization as plugin** — 국가별 체크는 파일 하나로 추가
7. **Static-first** — 엔드유저 웹은 서버 없이 정적 배포

### Not Implemented in v1.5.0 (v1.6.0+ 계획)
- MCP 서버 write-path 툴 (start_session/add_evidence/next_turn)
- VS Code Extension TypeScript 실장
- symptom-index의 de/ja 전체 번역 (17건 커뮤니티 기여 대상)
- `/sap-session-resume`, `/sap-session-handoff`, `/sap-session-apply-fix` 커맨드
- 세션 아카이브 자동화
- URL 파라미터 기반 triage 공유 (시나리오 5)
- `/sap-session-search` 관련 세션 링크

### Migration from v1.4.0
**Breaking**: 없음. 기존 14 플러그인·9 agents·10 commands 모두 **무변경**.
CLAUDE.md 응답 포맷은 옵션 B(병행)이므로 기존 Quick Advisory 동작이 유지됩니다.

---

## [1.4.0] - 2026-04-11

### Theme
**"Polish & Close the Loops"** — v1.3.0의 모든 열린 loop 닫기 + 생태계 확장을 새 차원으로. 한국어 100% 완성, strict 모드 전환, Multi-AI 자동 빌드, MCP/VS Code 확장 기반 마련, GitHub README 랜딩 페이지화.

### Added — 한국어 100% 완성 (8 → 14)
- `sap-sfsf/references/ko/SKILL-ko.md`
- `sap-s4-migration/references/ko/SKILL-ko.md`
- `sap-btp/references/ko/SKILL-ko.md`
- `sap-basis/references/ko/SKILL-ko.md`
- `sap-bc/references/ko/SKILL-ko.md`

→ **14/14 모든 모듈 한국어 퀵가이드 + 전문 번역 완성**

### Added — sap-gts 플러그인 (14번째) 🌍
- `plugins/sap-gts/skills/sap-gts/SKILL.md` — Global Trade Services
- Compliance (SPL, Embargo, Legal Control)
- Customs Management (수출입 신고)
- Risk Management (L/C, FTA Preference)
- **한국 UNI-PASS** 관세청 연동 특화
- `references/korea-customs-uni-pass.md` — 상세 가이드
- 한국어 퀵가이드 + 전문 번역

### Changed — Quality Gates Strict 전환
- **`check-links.sh --strict`** CI 기본 활성화 (모든 내부 링크 유효성)
- **`check-ecc-s4-split.sh --strict`** CI 기본 활성화
- **`check-tcodes.sh --strict`** 이미 v1.3.0에서 활성화
- `.release-notes-*.md` 임시 파일을 링크 검사에서 제외
- **8개 품질 게이트 전부 strict 모드** (lint-frontmatter, marketplace, hardcoding, tcodes, ko-refs, links, ecc-s4-split, build-multi-ai)

### Added — 데이터 자산 확장
- T-codes 273 → **279개** (GTS /SAPSLL/ 네임스페이스 6개 추가)
- sap-notes.yaml 그대로 50+ (SAP Note는 v1.3.0에서 확장 완료)
- `scripts/check-tcodes.sh` false-positive allowlist 확장 (CL_EXITHANDLER, IT0001~, CONVT_CODEPAGE, KR01, MT940 등)

### Added — build-multi-ai.sh 실제 자동 생성
- **Sync block 주입** — `<!-- BEGIN sapstack-auto: stats -->` 마커 기반
- `--check` 모드: drift 검출 (diff 계산)
- `--write` 모드: 실제 파일 갱신
- `scripts/templates/` 디렉토리 + 템플릿 파일
- `docs/build-multi-ai.md` 사용 가이드

### Added — Reusable GitHub Actions Workflow
- `.github/workflows/sapstack-ci-reusable.yml` — 다른 저장소에서 호출 가능
- Inputs: `run-strict`, `check-hardcoding`, `check-ko-references`, `sapstack-ref`
- `docs/reusable-ci.md` — 사용 가이드

### Added — 6개 AI 도구 실전 예시
- `docs/examples/claude-code-example.md` — Claude Code 세션
- `docs/examples/codex-cli-example.md` — Codex CLI 사용법
- `docs/examples/copilot-example.md` — VS Code Copilot Chat
- `docs/examples/cursor-example.md` — Cursor IDE
- `docs/examples/continue-example.md` — Continue.dev
- `docs/examples/aider-example.md` — Aider CLI

### Added — MCP Server (Manifest)
- `mcp/sapstack-server.json` — MCP manifest (Resources, Prompts, Tools)
- `docs/mcp-server.md` — Claude Desktop 통합 가이드
- **v1.5.0에서 TypeScript 네이티브 구현 예정**

### Added — VS Code Extension Stub
- `extension/package.json` — 매니페스트 (5개 commands, settings, snippets)
- `extension/README.md` — v1.5.0 로드맵
- `extension/snippets/abap.code-snippets` — ABAP 스니펫 5개

### Added — Scaffolding Scripts
- `scripts/new-agent.sh` — 새 서브에이전트 템플릿 생성
- `scripts/new-command.sh` — 새 슬래시 커맨드 생성
- `scripts/new-plugin.sh` — 새 SAP 모듈 플러그인 전체 구조 생성

### Added — SAP Note Resolver Web UI
- `web/index.html` — 브라우저용 Note 검색 UI
- `web/style.css` — GitHub Dark 스타일
- `web/script.js` — 정적 YAML parser + 검색 로직
- `web/README.md` — 로컬 실행 + GitHub Pages 배포 가이드
- **정적 사이트** — 서버 없음, 완전 오프라인 동작 가능

### Changed — README 대개편 (랜딩 페이지화)
- **배지 추가**: Version, License, CI, Korean, Multi-AI
- **30초 소개** 섹션 (요약 통계)
- **Quick Start** 6개 도구별 (30초 설치)
- **3축 아키텍처** ASCII 다이어그램
- **14개 플러그인 카탈로그** 카테고리별 테이블 + 트리거 키워드
- **9개 에이전트 테이블** (v1.4.0 반영)
- **10개 커맨드** 카테고리별 (결산·디버그·분석)
- **BC = Basis** 관계 명확화 표
- **한국어 100%** 섹션 강조
- **8개 품질 게이트** 검증 블록
- **학습 경로** 테이블 (초급 → 고급 → 기여자)
- **v1.4.0 신규 확장 도구** 섹션

### Changed — 문서 폴리싱
- `docs/architecture.md` — 14 플러그인, 9 agents, 10 commands 반영
- `docs/roadmap.md` — v1.5.0 후보 업데이트

### Statistics
- 신규 파일: **80+**
- 수정 파일: 12
- **14 플러그인** (13 → 14, sap-gts 추가)
- **9 서브에이전트** (v1.3.0 유지)
- **10 슬래시 커맨드** (v1.3.0 유지)
- **6 AI 도구 호환** (v1.3.0 유지)
- **279 확정 T-codes** (273 → 279)
- **14/14 한국어 완성** (62% → **100%**)
- **8 Quality Gate** (7 → 8, build-multi-ai 실제 구현)
- v1.4.0 신규 섹션: MCP / VS Code Extension / Web UI / Scaffolding / Reusable CI

### Philosophy
- **"Polish over Expand"** — 새 에이전트·커맨드 추가 없이 기존 구조 완성도 집중
- **"Close the Loops"** — CHANGELOG [Known Limitations] 전부 해결
- **"Landing page as product marketing"** — README를 저장소 첫 페이지로서 재설계

### Known Limitations → v1.5.0
- MCP server 네이티브 TypeScript 구현
- VS Code Extension 실제 동작
- `build-multi-ai.sh` 템플릿 기반 전체 자동 생성 (현재는 sync block만)
- Continue.dev / Aider end-to-end 통합 테스트 자동화
- 추가 Industry Solution (IS-Retail, IS-U, IBP)

[1.4.0]: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.4.0

---

## [1.3.0] - 2026-04-11

### Theme
**"Depth & Ecosystem"** — 기존 구조의 빈 곳을 채우고(한국어 전문 번역, 에이전트·커맨드 생태계 완성), 커뮤니티 기반(Issue 템플릿·CODEOWNERS·FAQ·튜토리얼·용어집)을 마련. Multi-AI 호환 범위를 4→6 도구로 확장.

### Added — 데이터 자산 대폭 확장
- **`data/tcodes.yaml` 확장**: 168 → **273개** 확정 T-code (130+ 신규 — FI/MM/SD/PP/CO/TR/BASIS/ABAP 전반)
- **`data/sap-notes.yaml` 확장**: 11 → **50+ 확정 Note** (migration, korea, dump, performance, security 전 카테고리)
- **`check-tcodes.sh` false-positive allowlist** (CL_EXITHANDLER, IT0001~, CONVT_CODEPAGE 등 40+ 항목)
- **`check-tcodes --strict`** CI 기본 활성화

### Added — 에이전트 생태계 완성 (5 → 9)
- `agents/sap-sd-consultant.md` — SD Order-to-Cash 전체 진단
- `agents/sap-co-consultant.md` — CO 전반 (CCA/PCA/IO/CO-PC/CO-PA)
- `agents/sap-pp-analyzer.md` — PP 생산계획 + 한국 제조업 특화
- `agents/sap-integration-advisor.md` — 통합 아키텍처 (RFC/IDoc/OData/CPI/한국 SaaS)

### Added — 커맨드 생태계 확장 (5 → 10)
- `commands/sap-quarter-close.md` — 분기 결산 (K-IFRS + K-SOX)
- `commands/sap-year-end.md` — 연결산 (법인세·감사)
- `commands/sap-transport-debug.md` — STMS 실패 진단 (한국 한글 이슈)
- `commands/sap-korean-tax-invoice-debug.md` — 전자세금계산서 디버그
- `commands/sap-performance-check.md` — 성능 점검 파이프라인

### Added — Multi-AI 호환 확장 (4 → 6 도구)
- `.continue/config.yaml` — Continue.dev VS Code 확장 지원
- `CONVENTIONS.md` — Aider 호환 레이어
- `.github/instructions/abap.instructions.md` — Copilot ABAP 파일 전용
- `.github/instructions/yaml.instructions.md` — Copilot YAML 전용
- `.github/instructions/markdown.instructions.md` — Copilot Markdown 전용
- `scripts/build-multi-ai.sh` — 호환 레이어 자동 검증 (v1.4에서 빌드 확장 예정)

### Added — 한국어 전문 번역 6개 추가 (2 → 8)
기존 sap-fi, sap-abap에 추가로:
- `plugins/sap-co/skills/sap-co/references/ko/SKILL-ko.md`
- `plugins/sap-tr/skills/sap-tr/references/ko/SKILL-ko.md`
- `plugins/sap-mm/skills/sap-mm/references/ko/SKILL-ko.md`
- `plugins/sap-sd/skills/sap-sd/references/ko/SKILL-ko.md`
- `plugins/sap-pp/skills/sap-pp/references/ko/SKILL-ko.md`
- `plugins/sap-hcm/skills/sap-hcm/references/ko/SKILL-ko.md`

나머지 5개 모듈(sap-sfsf, sap-s4-migration, sap-btp, sap-basis, sap-bc)은 v1.4.0에서 완성 예정.

### Added — Quality Gate 확장 (4 → 7 lints)
- `scripts/check-ko-references.sh` — 모든 13개 모듈 한국어 quick-guide 존재 검증
- `scripts/check-links.sh` — 내부 markdown 상대 링크 유효성
- `scripts/check-ecc-s4-split.sh` — SKILL.md ECC vs S/4HANA 구분 명시 (warning-only)
- `scripts/build-multi-ai.sh --check` — 호환 레이어 일관성
- CI에 5개 새 lint 단계 추가

### Added — 사용자 경험 문서
- `docs/tutorial.md` — 15분 단계별 튜토리얼 (설치 → 환경 프로필 → 첫 질문 → 위임 → Multi-AI)
- `docs/scenarios/` — 5개 실전 Q&A:
  - `01-miro-tax-code.md` — MIRO 세금코드 오류
  - `02-f110-payment-failure.md` — F110 DME 생성 실패
  - `03-afab-dump.md` — AFAB DBIF_RSQL_SQL_ERROR
  - `04-bp-migration.md` — Business Partner 마이그레이션
  - `05-korean-unicode-dump.md` — 한글 Unicode 덤프
- `docs/faq.md` — 30개 흔한 질문
- `docs/glossary.md` — **SAP 용어집 한국어/영문 150+ 용어** (조직/FI/CO/MM/SD/PP/HCM/ABAP/BC/Integration/S4HANA)
- `docs/troubleshooting.md` — sapstack 자체 문제 해결

### Added — 커뮤니티 인프라
- `.github/ISSUE_TEMPLATE/bug_report.md` — 버그 리포트 템플릿
- `.github/ISSUE_TEMPLATE/feature_request.md` — 기능 요청
- `.github/ISSUE_TEMPLATE/new_module.md` — 새 SAP 모듈 제안
- `.github/ISSUE_TEMPLATE/config.yml` — Issue 템플릿 설정
- `.github/pull_request_template.md` — PR 체크리스트 (품질 게이트 강제)
- `.github/CODEOWNERS` — 모듈별 리뷰어 지정
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1 + SAP 현장 특수 규칙
- `SECURITY.md` — 취약점 신고 프로세스 + 한국 개인정보보호법 고려사항

### Added — 설정 시스템
- `.sapstack/config.schema.yaml` — JSON Schema Draft 2020-12 기반 환경 프로필 스키마
- `scripts/validate-config.sh` — config.yaml 유효성 검증 (필수 필드, 형식, gitignore)

### Changed
- README에 "BC = Basis (한국 버전)" 관계 설명 표 대폭 보강
- `docs/architecture.md`에 sap-basis vs sap-bc 상세 비교 섹션
- `docs/roadmap.md` — v1.4.0 이후 계획 업데이트

### Philosophy / 중요 명확화
- **"Depth over Breadth"** — 새 모듈 추가보다 기존 13개의 에이전트·커맨드·한국어·품질 게이트 완성에 집중
- **"Ecosystem over Silo"** — Multi-AI 호환 레이어를 6개로 확장해 Claude Code 종속성 제거
- **"데이터와 지식 분리"** — SKILL.md(지식)과 YAML(데이터)을 분리해 업데이트 주기 독립

### Statistics
- 신규 파일: **65개+**
- 수정 파일: 8개
- 확정 T-code: 168 → **273**
- SAP Notes: 11 → **50+**
- 서브에이전트: 5 → **9**
- 슬래시 커맨드: 5 → **10**
- Multi-AI 호환 도구: 4 → **6** (Claude/Codex/Copilot/Cursor/Continue/Aider)
- 한국어 전문 번역: 2 → **8** (13 중 62%)
- 품질 게이트 스크립트: 4 → **7**

### Known Limitations → v1.4.0
- 나머지 5개 모듈 한국어 전문 번역 (sfsf, s4mig, btp, basis, bc)
- `build-multi-ai.sh` 자동 생성 (현재는 검증만)
- `check-links.sh` / `check-ecc-s4-split.sh` strict 모드 전환
- Industry Solution 플러그인 (IS-Retail, IS-U, GTS)
- Continue.dev / Aider 실제 end-to-end 테스트

[1.3.0]: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.3.0

---

## [1.2.0] - 2026-04-11

### Theme
**"Scale-ready: 데이터 기반 검증 + 다중 AI 호환 + 한국어화"** — sapstack을 Claude Code 전용에서 **범용 SAP 운영 자문 플랫폼**으로 확장. 지식 자산을 데이터셋으로 추출하고, 호환 레이어로 Codex/Copilot/Cursor도 지원하며, 한국어 전문 번역본을 도입.

### Added — Data Assets
- **`data/tcodes.yaml`** — 168개 확정 T-code 레지스트리 (모듈별, ECC/S4 release 구분, 주의 메모 포함)
- **`data/sap-notes.yaml`** — 확정된 SAP Note 카탈로그 (migration, Korea localization, dumps, performance, security 카테고리)
- **`scripts/check-tcodes.sh`** — SKILL.md의 T-code를 데이터셋과 대조 (warning-only, v1.3.0에서 strict 전환 예정)
- **`scripts/resolve-note.sh`** — 키워드로 SAP Note 검색 (awk 기반, bash-only, jq 불필요)

### Added — New Subagents
- **`agents/sap-basis-consultant`** — Basis 장애 라우팅 (덤프/WP행/Transport/RFC/Update/Lock/성능/Kernel 플로우별 체크리스트)
- **`agents/sap-mm-consultant`** — MM 전반 (구매·재고·GR/IR·송장검증·계정결정·외주·한국 특화)

### Added — Multi-AI Compatibility Layer ⭐
- **`AGENTS.md`** — OpenAI Codex CLI 호환 지침 (Universal Rules + 지식 소스 위치)
- **`.github/copilot-instructions.md`** — GitHub Copilot 프로젝트 지침
- **`.cursor/rules/sapstack.mdc`** — Cursor `alwaysApply: true` 룰
- **`docs/multi-ai-compatibility.md`** — 5개 AI 도구에서 sapstack 쓰는 법 (설치, 사용 예시, 한계 비교표)

### Added — Korean Full Translations
- **`plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md`** — sap-fi 본문 한국어 전문 번역
- **`plugins/sap-abap/skills/sap-abap/references/ko/SKILL-ko.md`** — sap-abap 본문 한국어 전문 번역 (코드 예제는 원본 유지)

### Changed — Quality Gates
- **`check-hardcoding.sh --strict`** 모드 구현 완료 + CI에서 기본 사용 (경고 → 오류 변환)
- CI에 `check-tcodes.sh` 추가 (warning-only)
- CI에 `resolve-note.sh` 스모크 테스트 추가

### Changed — Documentation
- **README** 대폭 확장:
  - "Multi-AI 도구 지원" 섹션 추가 (Claude Code/Codex/Copilot/Cursor 비교표)
  - "sap-basis vs sap-bc 관계" 명확화 — **BC = Basis 한국 버전**임을 표로 명시
  - "데이터 자산" 섹션 (v1.2.0 신규)
  - "설치 후 빠른 검증" 가이드
  - 한국어 전문 번역본 소개
- **`docs/architecture.md`** — "sap-basis vs sap-bc 관계" 상세 섹션 추가 (분리 이유, 설치 권장, 보완재 관계)
- README title: "SAP Skills & Agents for Claude Code" → "SAP Skills & Agents for AI Coding Assistants"
- `package.json`, `marketplace.json` description 업데이트 (multi-AI 명시)

### Philosophy
- **데이터 자산 분리**: 지식(SKILL.md)과 데이터(tcodes/notes YAML)를 분리하여 업데이트 주기·책임자 분리
- **원본 1개 + 호환 레이어 N개**: SKILL.md가 source of truth, AGENTS.md/copilot/cursor는 얇은 변환 레이어
- **BC = Basis 명시**: 한국 업계 용어와 SAP 공식 모듈 코드를 일치시켜 혼동 제거

### Statistics
- 신규 파일: 14개
- 수정 파일: 5개 (package.json, marketplace.json, README.md, CHANGELOG.md, docs/architecture.md, check-hardcoding.sh, .github/workflows/ci.yml)
- 총 플러그인: 13 (변동 없음)
- 확정 T-code: 168개 (데이터셋 초기)
- 확정 SAP Note: 11개 (데이터셋 초기)
- 서브에이전트: 3 → 5
- 호환 레이어: 1(Claude) → 4(Claude/Codex/Copilot/Cursor)

### Known Limitations / Deferred to v1.3.0
- `check-tcodes.sh`는 warning-only 모드 (strict 전환은 75건 미등록 T-code 데이터셋 확장 후)
- 13개 모듈 중 11개는 여전히 영문 본문 — 한국어 전문 번역은 2개 시범
- Continue.dev, Aider 호환 레이어 미지원
- `scripts/build-multi-ai.sh` 자동 빌드 스크립트 미구현

[1.2.0]: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.2.0

---

## [1.1.0] - 2026-04-11

### Theme
**"Passive Knowledge → Active Advisor"** — sapstack을 단순 문서 번들에서 **SAP 운영 자문 파이프라인**으로 재구축. 3축 구조 도입: Active Advisors + Context Persistence + Quality Gates.

### Added — Active Advisors (축 1)
- **3 subagents** in `agents/` (Korean):
  - `sap-fi-consultant` — FI 이슈 체계적 진단 (환경 인테이크 → Issue → Root Cause → Fix → Prevention → SAP Note)
  - `sap-abap-developer` — ABAP 코드 리뷰 (Clean Core, HANA 최적화, ATC, K-SOX 보안)
  - `sap-s4-migration-advisor` — 마이그레이션 경로 추천 + Top Risk 분석
- **5 slash commands** in `commands/` (Korean):
  - `/sap-fi-closing` — FI 월결산/연결산 단계별 체크리스트
  - `/sap-abap-review` — ABAP 코드를 reviewer 에이전트에 위임
  - `/sap-s4-readiness` — S/4HANA 마이그레이션 Readiness 평가
  - `/sap-migo-debug` — MIGO 포스팅 에러 진단 파이프라인
  - `/sap-payment-run-debug` — F110 지급실행 디버그
- **New plugin `sap-bc`** — 한국 BC 컨설턴트 특화 (Solman Korea, HANA 한국 로케일, 전자세금계산서, 망분리, K-SOX, 한글 Unicode). 글로벌 `sap-basis`와 상호 보완.

### Added — Context Persistence (축 2)
- `.sapstack/config.example.yaml` — 환경 프로필 템플릿 (시스템/조직/landscape/한국 localization/프로젝트/preferences)
- `docs/environment-profile.md` — 한국어 사용 가이드

### Added — Quality Gates (축 3)
- `scripts/lint-frontmatter.sh` — SKILL.md/agent 프론트매터 검증 (name/description/tools)
- `scripts/check-marketplace.sh` — marketplace.json JSON 무결성 + path 존재 검증
- `scripts/check-hardcoding.sh` — 회사코드/계정 하드코딩 패턴 경고
- `.github/workflows/ci.yml` — main push, PR 시 3개 린터 자동 실행

### Added — Korean Documentation
- **13개 모든 모듈에 한국어 퀵가이드** (`plugins/<mod>/skills/<mod>/references/ko/quick-guide.md`)
- `CONTRIBUTING.md` — 한국어 기여 가이드
- `docs/architecture.md` — 3축 구조 설명 + 데이터 흐름
- `docs/roadmap.md` — v1.2.0 ~ v2.0.0 장기 계획

### Changed
- README에 "고급 사용법 (v1.1.0 신규)" 섹션 추가 — 한국어
- README 플러그인 카탈로그: 12 → 13 (sap-bc 포함)
- `package.json`, `marketplace.json` version → 1.1.0
- `marketplace.json` description 업데이트 ("active advisors, context persistence, quality gates")

### Philosophy
- **관점 분리**: SKILL.md (What) + Subagent (Who) + Command (How)
- **Single Source of Truth**: Agent는 SKILL.md를 참조하고 위임 프로토콜만 추가
- **회사 중립**: 저장소는 vendor-neutral, 회사 특화는 `.sapstack/config.yaml`로만
- **한국 관점 분리**: 영문 SKILL.md 본문 유지 + `sap-bc` 별도 플러그인 + `references/ko/`

[1.1.0]: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.1.0

---

## [1.0.0] - 2026-04-11

### Added
- Initial release of **sapstack** — Universal SAP skills and agents for Claude Code.
- 12 plugin modules covering the full SAP functional + technical stack:
  - **Core Financials**: `sap-fi`, `sap-co`, `sap-tr`
  - **Logistics**: `sap-mm`, `sap-sd`, `sap-pp`
  - **Human Resources**: `sap-hcm`, `sap-sfsf`
  - **Technology**: `sap-abap`, `sap-s4-migration`, `sap-btp`, `sap-basis`
- Universal rules (`CLAUDE.md`) enforcing no-hardcoding and ECC vs S/4HANA distinction.
- Claude Code plugin marketplace catalog (`.claude-plugin/marketplace.json`).
- Reference guides bundled with selected plugins:
  - `sap-fi` — T-code reference, closing checklist
  - `sap-co` — Period-end procedures
  - `sap-tr` — Liquidity planning guide
  - `sap-hcm` — Payroll guide
  - `sap-sfsf` — ECC → SFSF migration path
  - `sap-abap` — Clean core patterns, code review checklist
  - `sap-s4-migration` — Simplification items catalog

### Compatibility
- SAP ECC 6.0 (all EhPs), S/4HANA On-Premise, RISE with SAP, Cloud Public Edition (where applicable).

[1.0.0]: https://github.com/BoxLogoDev/sapstack/releases/tag/v1.0.0
