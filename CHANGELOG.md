# Changelog

All notable changes to **sapstack** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **`agents/sap-basis-troubleshooter`** — Basis 장애 라우팅 (덤프/WP행/Transport/RFC/Update/Lock/성능/Kernel 플로우별 체크리스트)
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
  - `sap-abap-reviewer` — ABAP 코드 리뷰 (Clean Core, HANA 최적화, ATC, K-SOX 보안)
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
