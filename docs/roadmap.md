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

## ✅ v1.1.0 — Active Advisor (현재)

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

## ✅ v1.3.0 — Depth & Ecosystem (현재)

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

## 🎯 v1.8.0 — Native Runtime + 완전 다국어

**테마**: 매니페스트에서 실제 동작으로 + 다국어 100%

### 인프라
- [ ] **MCP Server write-path 구현** — start_session, add_evidence, next_turn
- [ ] **VS Code Extension 실제 구현** — 5 commands, ABAP snippets, quick picker
- [ ] **NPM 패키지** — `npx @boxlogodev/sapstack-mcp`
- [ ] **Web UI 확장** — T-code 탭, Plugin 카탈로그 탭, 다크/라이트 테마
- [ ] **PWA** — 오프라인 사용 가능 Web UI

### 다국어 100% 완성
- [ ] **symptom-index 62개 × 4개 언어 (zh/ja/de/vi) 전체 번역** — 현재 ~15/62
- [ ] **synonyms 80+ 용어 × 4개 언어 완전 번역**
- [ ] **모듈별 quick-guide 다국어 버전** — en 우선, 나머지 선택

### 커뮤니티 기여 대상 (Good First Issues)
- [ ] 각 언어별 네이티브 스피커 검토
- [ ] symptom-index 나머지 entry 번역
- [ ] sap-cloud 플러그인 IMG 가이드 확장 (2개 추가 필요)
- [ ] **build-multi-ai.sh 완전 자동화**

---

## 🎯 v1.2.0 — Precision & Scale (과거)

**테마: 정확도 및 자동 검증 강화**

### 계획
- [ ] **T-code validator** — 각 SKILL.md의 모든 T-code가 실제 SAP 영역에서 유효한지 검증 (정적 리스트 대조)
- [ ] **SAP Note resolver** — 키워드 → 확정된 Note 번호 매핑 데이터셋 (`data/sap-notes.yaml`)
- [ ] **ECC vs S/4HANA 표기 검증** — SKILL.md에서 두 릴리스 차이점이 명시적으로 표기됐는지 자동 검사
- [ ] **추가 서브에이전트 2종**:
  - `sap-basis-consultant` — STMS/SM50/ST22 덤프 라우팅
  - `sap-mm-consultant` — 구매/재고/GR-IR
- [ ] **`check-hardcoding.sh --strict`** CI 기본 활성화
- [ ] 한국어 quick-guide를 **13개 → 전체 본문 한국어 병렬 버전**으로 확장 (2개 모듈 시범)

---

## 🚀 v1.3.0 — Integration

**테마: 외부 시스템 연동**

### 계획
- [ ] **BTP OData helper** — CAP/Fiori 프로젝트에서 sapstack 스킬이 실제 OData 메타데이터 분석
- [ ] **Integration Suite 시나리오** — iFlow 설계 가이드 자동 생성
- [ ] **Solution Manager 연동 가이드** — ChaRM 워크플로 특화
- [ ] **SAP Cloud ALM** — S/4HANA Cloud PE용 운영 가이드
- [ ] **KISA 보안 체크리스트** — 한국 금융/공공 특화 자동화

---

## 🔬 v2.0.0 — AI-Native SAP Consulting

**테마: SAP 운영 AI 플랫폼**

### 비전
sapstack을 단순 플러그인에서 **SAP 운영 AI 플랫폼**으로 승격:

- [ ] **프로덕트 컨텍스트 엔진** — 사용자의 실제 SAP 시스템(읽기 전용)과 연결, 라이브 진단
- [ ] **멀티에이전트 오케스트레이션** — FI 이슈 시 FI+BC+ABAP 에이전트가 병렬 협업
- [ ] **반응형 런북(Runbook)** — 사용자가 "결산 시작"이라고만 해도 전체 프로세스 자동 실행·검증
- [ ] **Adaptive learning** — 각 프로젝트별 특수 설정을 config.yaml 외에 자동 학습

**외부 의존성**: SAP API 접근 권한, 사용자 조직의 보안 정책 승인 등 — 프로덕션 도입은 파일럿부터.

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
