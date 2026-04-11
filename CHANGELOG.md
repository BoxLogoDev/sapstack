# Changelog

All notable changes to **sapstack** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
