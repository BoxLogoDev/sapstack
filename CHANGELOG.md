# Changelog

All notable changes to **sapstack** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
