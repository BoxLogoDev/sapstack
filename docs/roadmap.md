# sapstack 로드맵

> "Passive Knowledge → Active Advisor → SAP Operations AI Platform"

이 로드맵은 sapstack의 장기 방향을 제시합니다. 각 마일스톤은 **사용자 가치**를 기준으로 우선순위가 매겨집니다.

---

## ✅ v1.0.0 — MVP (완료)

**테마: 지식 기반 구축**

- [x] 12개 SAP 모듈 플러그인 (FI/CO/TR/MM/SD/PP/HCM/SFSF/ABAP/S4Mig/BTP/Basis)
- [x] Claude Code Plugin Marketplace 포맷
- [x] Universal Rules (CLAUDE.md)
- [x] 기본 references (closing-checklist, tcode-reference 등)

**한계**: 단순 문서 번들 — 수동형, 환경 반복 질문, 품질 게이트 없음.

---

## ✅ v1.1.0 — Active Advisor (완료)

**테마: 3축 구조로 재구축**

### 축 1: Active Advisors
- [x] 서브에이전트 3종 (sap-fi-consultant, sap-abap-developer, sap-s4-migration-advisor)
- [x] 슬래시 커맨드 5종 (sap-fi-closing, sap-abap-review, sap-s4-readiness, sap-migo-debug, sap-payment-run-debug)
- [x] `sap-bc` 플러그인 (한국 BC 컨설턴트 특화)

### 축 2: Context Persistence
- [x] `.sapstack/config.yaml` 환경 프로필 시스템
- [x] `docs/environment-profile.md` 가이드

### 축 3: Quality Gates
- [x] `scripts/lint-frontmatter.sh`
- [x] `scripts/check-marketplace.sh`
- [x] `scripts/check-hardcoding.sh`
- [x] GitHub Actions CI

### 문서 & 한국어
- [x] CONTRIBUTING.md
- [x] docs/architecture.md, roadmap.md
- [x] 13개 모듈 한국어 quick-guide

---

## ✅ v1.3.0 — Depth & Ecosystem (완료)

**테마**: 깊이 있는 생태계 완성

### 데이터 자산 대폭 확장
- [x] tcodes.yaml 168 → 273개
- [x] sap-notes.yaml 11 → 50+
- [x] check-tcodes --strict CI

### 에이전트 생태계 완성 (5 → 9)
- [x] sap-sd-consultant
- [x] sap-co-consultant
- [x] sap-pp-analyzer
- [x] sap-integration-advisor

### 커맨드 생태계 확장 (5 → 10)
- [x] sap-quarter-close, sap-year-end, sap-transport-debug, sap-korean-tax-invoice-debug, sap-performance-check

### Multi-AI 확장 (4 → 6)
- [x] Continue.dev, Aider
- [x] Copilot 파일 타입별 instruction 분할
- [x] build-multi-ai.sh 검증 스크립트

### 한국어 전문 번역 (2 → 8)
- [x] sap-co, sap-tr, sap-mm, sap-sd, sap-pp, sap-hcm

### Quality Gates (4 → 7)
- [x] check-ko-references, check-links, check-ecc-s4-split

### 사용자 경험
- [x] tutorial.md (15분 튜토리얼)
- [x] scenarios/ (5개 실전 Q&A)
- [x] faq.md (30개)
- [x] glossary.md (150+ 용어)
- [x] troubleshooting.md

### 커뮤니티 & 거버넌스
- [x] Issue templates (bug, feature, new-module)
- [x] PR template (품질 게이트 강제)
- [x] CODEOWNERS
- [x] CODE_OF_CONDUCT.md + SECURITY.md

### 설정
- [x] config.schema.yaml
- [x] validate-config.sh

---

## ✅ v1.4.0 — Polish & Close the Loops (완료)

**테마**: 모든 열린 loop 닫기 + Multi-AI 생태계 확장

- [x] **한국어 전문 번역 100% 완성** — sfsf, s4mig, btp, basis, bc (14/14)
- [x] **sap-gts 플러그인 신설** — 한국 UNI-PASS 관세청 연동 특화
- [x] **check-links + check-ecc-s4-split strict 전환** (8개 게이트 전부 strict)
- [x] **build-multi-ai.sh 자동 생성** (sync block 기반)
- [x] **Continue.dev / Aider 예시** (6개 AI 도구 실전 세션)
- [x] **Reusable GitHub Actions workflow** — 다른 저장소에서 재사용
- [x] **MCP server 매니페스트** (v1.5 네이티브 구현 예정)
- [x] **VS Code Extension 스텁** (v1.5 실구현)
- [x] **Scaffolding scripts** — new-{agent,command,plugin}.sh
- [x] **SAP Note Resolver Web UI** — 정적 사이트
- [x] **README 대개편** — 랜딩 페이지화

---

## ✅ v1.6.0 — Enterprise SAP Operations Platform (완료)

**테마**: SAP 운영 전체 라이프사이클 플랫폼

### 신규 모듈
- [x] `sap-pm` — Plant Maintenance (설비보전)
- [x] `sap-qm` — Quality Management (품질관리)
- [x] `sap-wm` — Warehouse Management (창고관리, ECC 레거시)
- [x] `sap-ewm` — Extended Warehouse Management (확장창고관리)

### IMG Configuration Framework
- [x] 11개 모듈 45+ IMG 구성 가이드 (SPRO 경로, 구성 단계, 검증)
- [x] `scripts/check-img-references.sh` 검증 스크립트

### Best Practice Framework (3-Tier)
- [x] 7 공통 BP (권한관리, 이관관리, 마스터데이터, 기간마감, 변경관리, 아카이빙)
- [x] 11개 모듈 × 3 Tier = 33 모듈별 BP
- [x] `scripts/check-best-practices.sh` 검증 스크립트

### Enterprise & Industry
- [x] 6 엔터프라이즈 문서 (다중회사코드, SSC, IC, 글로벌롤아웃, 시스템랜드스케이프, 연동제약)
- [x] 3 업종별 가이드 (제조업, 유통업, 금융업)
- [x] `data/industry-matrix.yaml` + `scripts/check-industry-refs.sh`

### 에이전트 & 커맨드
- [x] 6 신규 에이전트 (sap-tutor, hcm, tr, pm, qm, ewm)
- [x] 5 신규 커맨드 (img-guide, master-data-check, bp-review, pm-diagnosis, qm-inspection)
- [x] sap-pp-analyzer → sap-pp-consultant 이름 변경
- [x] 기존 9개 에이전트 IMG 역량 보강

### 데이터 자산
- [x] tcodes 279 → 340+, symptom-index 18 → 62, sap-notes 46 → 57
- [x] `period-end-sequence.yaml`, `master-data-rules.yaml`, `industry-matrix.yaml`

---

## ✅ v1.7.0 — Global Expansion + Cloud Native (완료)

**테마**: 글로벌 확장 + 클라우드 네이티브 + 에이전트 구조 정비

### 신규 모듈 & 에이전트
- [x] `sap-cloud` 플러그인 — S/4HANA Cloud Public Edition 전용
- [x] `sap-cloud-consultant` 에이전트 신규
- [x] `sap-basis-troubleshooter` → `sap-basis-consultant` 이름 변경
- [x] `sap-abap-reviewer` → `sap-abap-developer` 이름 변경

### 다국어 프레임워크 (6개 언어)
- [x] i18n JSON 완전 (ko, en, zh, ja, de, vi) 6개 언어
- [x] symptom-index 다국어 번역 (부분, 커뮤니티 확장 대상)
- [x] synonyms 다국어 variants 추가
- [x] CLAUDE.md 다국어 감지/응답 규칙

### SAP AI/Joule 연구
- [x] `docs/sap-ai-integration.md` — Joule vs sapstack 포지셔닝, 상호보완 전략

---

## ✅ v2.0.0 — Runtime Completion (완료)

**테마**: 스캐폴딩 → 실제 작동하는 글로벌 OSS 플랫폼

### MCP Server Write-Path
- [x] start_session / add_evidence / next_turn 완전 구현
- [x] Ajv 스키마 검증 활성화
- [x] --offline 플래그 (망분리 지원)
- [x] mcp/cli.ts, mcp/types.ts 추가

### VS Code Extension
- [x] TypeScript 전체 구현 (10 commands + 3 tree views)
- [x] File watcher, Webview, YAML validation
- [x] esbuild 번들링 + Marketplace 발행 준비

### NPM + CI 자동화
- [x] `@boxlogodev/sapstack-mcp` 발행 준비
- [x] GitHub Actions release.yml (태그 push → 자동 발행)
- [x] bump-version.sh, generate-release-notes.sh

### 컴플라이언스 권고안
- [x] SECURITY.md 대폭 교체 (Threat Model, PII, Air-Gap, 감사 매핑)
- [x] docs/compliance/ — K-SOX, SOC2, ISO27001, GDPR, 망분리, PII, Audit Trail
- [x] mcp/pii-scrubber.ts — 한국 PII 자동 마스킹

---

## ✅ v2.1.0 — Cross-pollination + Coverage Expansion (완료, 2026-04-15)

**테마**: superclaude-for-sap 패턴 차용 + 커버리지 확장

- [x] 신규 디렉토리 4종 — `exceptions/`(CX_* 예외 카탈로그), `hooks/`(자동화 훅), `country/`(7개국 로컬라이제이션), `bridge/`(RFC/OData/REST/IDoc/CPI 연동 패턴)
- [x] MCP 도구 9 → 20개 (read 8 + write 3 + utility 1 신규)
- [x] MCP Prompts 5개 구현 (NotImplementedError 해소)
- [x] symptom-index 다국어 번역 30+/62 (zh/ja/de/vi)

> 참고: 당초 계획한 "Learning Loop + 다국어 100%"는 범위 조정으로 v2.4+ 이월.

---

## ✅ v2.2.0 — Global SAP Cloud + Polyglot (완료, 2026-05-15)

**테마**: 신규 클라우드 모듈 + 다국어 quick-guide + AI 도구 호환 + 발행 파이프라인

- [x] 신규 4개 SAP Cloud 모듈 — marketplace 20 → **24 플러그인**
- [x] 다국어 quick-guide — 핵심 5개 모듈 × 5개 언어 = 25 파일
- [x] AI 도구 호환 레이어 8개 (.cody, .windsurfrules, .idea 등 신규 3개 추가)
- [x] MCP npm publish 준비 (`publishConfig.access=public`)
- [x] VS Code Extension v0.1 beta
- [x] T-code 311 → 370, Best Practice 3-Tier 7개 모듈 추가
- [x] 후속 hotfix v2.2.1~v2.2.3 (lockfile / release pipeline)

> 참고: 당초 계획한 "Web UI 확장 + PWA"는 미출하 — vNext 이월.

---

## ✅ v2.3.0 — Polyglot Completion + Cloud Depth (완료, 2026-05-23)

**테마**: 다국어 완성 + 클라우드 모듈 심화 + 파이프라인 견고화

- [x] 다국어 quick-guide — **24 모듈 × 5개 언어 = 120 파일** (LLM API 미사용, 비용 $0)
- [x] 신규 4 클라우드 모듈 자산 — IMG 76파일, Best Practice 23모듈 완성, T-code --strict 395 확정
- [x] MCP 도구 20 → **23개**
- [x] VS Code Extension 5개 stub command 실 구현 (14/14 동작 검증)
- [x] symptom-index 62 → **90 entries**
- [x] native 검수 community 인프라 (TRANSLATION-REVIEW.md + Issue 템플릿 + CODEOWNERS)
- [x] 후속 hotfix v2.3.1~v2.3.2 (Extension vsix 빌드)

### v2.3.3 (릴리스 대기)
- [x] SAP KBA 57 → **77** (공개 검증 가능 건만, paywall 추측 금지)
- [x] check-hardcoding.sh 성능 수정 (Windows 90s+ → ~25s)
- [ ] git tag v2.3.3 + npm publish — `NPM_TOKEN` GitHub secret 등록 후 진행

---

## 🎯 v2.4.0 — Knowledge Depth + Learning Loop (다음)

**테마**: 지식 자산 심화 + 사용 학습 루프

- [ ] **SAP Note/KBA 100+** — 잔여 공개 KBA 등록 (S-user 보유자 community PR 환영)
- [ ] **Learning Loop** (opt-in telemetry, pure OSS) — Evidence Loop 결과 익명 패턴 축적, 가설 정확도 메트릭
- [ ] **다국어 네이티브 검수** — symptom-index 90/90 × 6개 언어, synonyms 80+ terms

---

## 🚀 vNext — Integration & Web

**테마**: 외부 시스템 연동 + Web/PWA

- [ ] **Web UI 확장** — T-code/Plugin 카탈로그 탭, 다크 테마, PWA(오프라인)
- [ ] **BTP OData helper** — CAP/Fiori OData 메타데이터 분석
- [ ] **Integration Suite 시나리오** — iFlow 설계 가이드 자동 생성
- [ ] **Solution Manager 연동** — ChaRM 워크플로 특화
- [ ] **SAP Cloud ALM** — S/4HANA Cloud PE 운영 가이드
- [ ] **KISA 보안 체크리스트** — 한국 금융/공공 특화 자동화

---

## 🔬 Vision — AI-Native SAP Operations Platform

**테마**: 단순 플러그인 → SAP 운영 AI 플랫폼

- [ ] **프로덕트 컨텍스트 엔진** — 실제 SAP 시스템(읽기 전용) 연결, 라이브 진단
- [ ] **멀티에이전트 오케스트레이션** — FI 이슈 시 FI+BC+ABAP 병렬 협업
- [ ] **반응형 런북(Runbook)** — "결산 시작" 한마디로 전체 프로세스 자동 실행·검증
- [ ] **Adaptive learning** — 프로젝트별 특수 설정 자동 학습

**외부 의존성**: SAP API 접근 권한, 조직 보안 정책 승인 — 프로덕션은 파일럿부터.

---

## 🌍 커뮤니티 기여 기회

sapstack을 더 발전시키려면 다음 영역이 기여자 환영 대상입니다:

### 빠른 기여 (Good First Issue)
- 새 모듈의 한국어 quick-guide 작성
- 기존 SKILL.md의 오탈자·T-code 수정
- 새 industry 특화 references (IS-OIL, IS-U, IS-Retail 등)

### 중간 난이도
- 새 서브에이전트 (sap-sd-consultant, sap-pp-analyzer 등)
- 새 슬래시 커맨드 (sap-mrp-debug, sap-invoice-flow 등)
- CI 스크립트 개선

### 고난도
- T-code validator 데이터셋 구축
- SAP Note resolver 인덱싱
- BTP 연동 프로토타입

기여 절차는 [`CONTRIBUTING.md`](../CONTRIBUTING.md) 참조.

---

## 📊 버전 전략

- **MAJOR** (v1 → v2): 아키텍처 변경 — SAP API 연동, 플랫폼 승격
- **MINOR** (v1.0 → v1.1): 새 기능 — 에이전트/커맨드/모듈 추가, 품질 게이트
- **PATCH** (v1.1.0 → v1.1.1): 버그 수정, 오탈자, 참조 보강

---

## 🎁 제외된 방향 (명시적 Non-goals)

아래 항목은 **sapstack이 직접 다루지 않습니다**:

- ❌ SAP 라이선스 판매 대체
- ❌ ABAP 코드 자동 수정 (리뷰만 제공)
- ❌ 운영 SAP 시스템 쓰기 작업 (읽기 전용 진단만)
- ❌ SAP 공식 Training 대체 (참조 자료 제공)

이 경계는 법적·윤리적 리스크를 피하면서 sapstack의 실용 가치를 유지하기 위함입니다.
