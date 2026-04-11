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
- [x] 서브에이전트 3종 (sap-fi-consultant, sap-abap-reviewer, sap-s4-migration-advisor)
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

## 🎯 v1.2.0 — Precision & Scale

**테마: 정확도 및 자동 검증 강화**

### 계획
- [ ] **T-code validator** — 각 SKILL.md의 모든 T-code가 실제 SAP 영역에서 유효한지 검증 (정적 리스트 대조)
- [ ] **SAP Note resolver** — 키워드 → 확정된 Note 번호 매핑 데이터셋 (`data/sap-notes.yaml`)
- [ ] **ECC vs S/4HANA 표기 검증** — SKILL.md에서 두 릴리스 차이점이 명시적으로 표기됐는지 자동 검사
- [ ] **추가 서브에이전트 2종**:
  - `sap-basis-troubleshooter` — STMS/SM50/ST22 덤프 라우팅
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
