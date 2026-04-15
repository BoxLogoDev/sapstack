# Changelog

All notable changes to **sapstack** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
