# sapstack 아키텍처

> 버전: v1.1.0
> 최종 업데이트: 2026-04-11

sapstack은 단순한 "지식 문서 번들"이 아니라 **SAP 운영 자문 파이프라인**입니다. 이 문서는 sapstack이 어떤 구성 요소로 이뤄져 있고 각 요소가 어떻게 상호작용하는지 설명합니다.

---

## 🏛 3축 구조

sapstack은 세 가지 축으로 구성됩니다:

```
┌────────────────────────────────────────────────┐
│               sapstack                         │
├────────────────────────────────────────────────┤
│                                                │
│  ① Active Advisors        ② Context            │
│     (위임 가능한 컨설턴트)     Persistence       │
│  ─────────────────        ──────────────       │
│  • SKILL.md (12+1)        • .sapstack/         │
│  • agents/*.md              config.yaml        │
│  • commands/*.md          • 환경 프로필 자동     │
│                             로드                │
│           ▲                      ▲             │
│           └───────┬──────────────┘             │
│                   ▼                            │
│  ③ Quality Gates                               │
│     (품질 보증 시스템)                           │
│  ─────────────────                             │
│  • scripts/lint-frontmatter.sh                 │
│  • scripts/check-marketplace.sh                │
│  • scripts/check-hardcoding.sh                 │
│  • .github/workflows/ci.yml                    │
│                                                │
└────────────────────────────────────────────────┘
```

### ① Active Advisors (능동적 자문)

**목적**: 사용자가 "물어봐야 답을 얻는" 수동형 문서를 **능동적으로 위임 가능한** 자문가로 바꿉니다.

| 유형 | 위치 | 역할 |
|------|------|------|
| **SKILL.md** | `plugins/*/skills/*/SKILL.md` | 대화 맥락에 자동 주입되는 참조 지식 (수동) |
| **Subagent** | `agents/*.md` | Task 도구로 독립 컨텍스트에 위임되는 전문 에이전트 (능동) |
| **Slash Command** | `commands/*.md` | 반복 작업을 원샷 워크플로로 실행 (자동화) |

**동작 흐름:**
1. 사용자가 자연어로 질문 → SKILL이 키워드 매칭으로 자동 활성화
2. 복잡한 다단계 분석이 필요하면 Command 호출 → 내부적으로 Subagent 위임
3. Subagent는 독립 컨텍스트에서 조사·검토·답변

### ② Context Persistence (지속성 있는 컨텍스트)

**문제**: "ECC인가요 S/4인가요?", "회사코드는요?" — 같은 질문을 매 세션 반복.

**해결**: `.sapstack/config.yaml` 1회 설정 → 모든 산출물이 자동 참조.

```
.sapstack/
└── config.yaml   (사용자 작성, gitignore 대상)
```

프로필 필드(주요):
- `system.release` — SAP 릴리스
- `organization.primary_company_code` — 주 회사코드
- `korea.*` — 한국 Localization 플래그
- `project.phase` — 현재 국면 (운영/구축/마이그레이션)
- `preferences.language` — 답변 언어

자세한 내용은 [`environment-profile.md`](./environment-profile.md).

### ③ Quality Gates (품질 보증)

**목적**: 12+1개 모듈을 유지보수 가능한 품질로 관리.

| 스크립트 | 검증 항목 |
|---------|----------|
| `lint-frontmatter.sh` | name/description/tools 필드 존재, 길이 제한, 디렉토리명 일치 |
| `check-marketplace.sh` | marketplace.json JSON 유효성, path 존재, 중복 id, 미등록 탐지 |
| `check-hardcoding.sh` | 회사코드/계정 하드코딩 패턴 (경고) |

CI(`.github/workflows/ci.yml`)가 main 푸시·PR에서 자동 실행.

---

## 📦 디렉토리 구조

```
sapstack/
├── .claude-plugin/
│   └── marketplace.json         # 플러그인 카탈로그
├── .github/
│   └── workflows/
│       └── ci.yml                # CI 파이프라인
├── .sapstack/
│   └── config.example.yaml       # 환경 프로필 템플릿
├── agents/                       # 서브에이전트 (신규 v1.1)
│   ├── sap-fi-consultant.md
│   ├── sap-abap-reviewer.md
│   └── sap-s4-migration-advisor.md
├── commands/                     # 슬래시 커맨드 (신규 v1.1)
│   ├── sap-fi-closing.md
│   ├── sap-abap-review.md
│   ├── sap-s4-readiness.md
│   ├── sap-migo-debug.md
│   └── sap-payment-run-debug.md
├── docs/                         # 문서 (신규 v1.1)
│   ├── architecture.md
│   ├── environment-profile.md
│   └── roadmap.md
├── plugins/                      # 13개 SAP 모듈 (sap-bc 신규 v1.1)
│   ├── sap-fi/
│   ├── sap-co/
│   ├── sap-tr/
│   ├── sap-mm/
│   ├── sap-sd/
│   ├── sap-pp/
│   ├── sap-hcm/
│   ├── sap-sfsf/
│   ├── sap-abap/
│   ├── sap-s4-migration/
│   ├── sap-btp/
│   ├── sap-basis/               # 글로벌 영문 Basis
│   └── sap-bc/                  # 한국 BC 컨설턴트 특화 (신규 v1.1)
├── scripts/                      # 품질 게이트 (신규 v1.1)
│   ├── lint-frontmatter.sh
│   ├── check-marketplace.sh
│   └── check-hardcoding.sh
├── CLAUDE.md                     # Universal Rules
├── CHANGELOG.md
├── CONTRIBUTING.md               # 신규 v1.1
├── LICENSE
├── README.md
└── package.json
```

---

## 🔄 데이터 흐름 — 사용자 질문부터 답변까지

### 시나리오: "MIRO에서 세금코드가 안 잡혀요"

```
사용자 입력
    │
    ▼
[1] Claude Code가 키워드 매칭
    ├─ "MIRO" → sap-fi SKILL 활성화
    ├─ "세금코드" → sap-fi SKILL (이미 매칭)
    └─ 한국어 → config.yaml의 preferences.language: ko
    │
    ▼
[2] SKILL.md가 system prompt에 주입
    ├─ Environment Intake Checklist
    ├─ AP 섹션 (MIRO)
    └─ Standard Response Format
    │
    ▼
[3] config.yaml 참조 (있다면)
    ├─ system.release → S/4HANA 답변만 (ECC 생략)
    ├─ korea.e_tax_invoice → 한국 부가세 맥락 추가
    └─ preferences.language: ko → 한국어 답변
    │
    ▼
[4] Claude가 구조화된 답변 생성
    Issue → Root Cause → Check → Fix → Prevention → SAP Note
```

### 시나리오: "/sap-s4-readiness --auto"

```
사용자 실행
    │
    ▼
[1] commands/sap-s4-readiness.md 실행 계획 로드
    │
    ▼
[2] 환경 인테이크 (config.yaml 미사용 시)
    │
    ▼
[3] Task 도구로 sap-s4-migration-advisor 서브에이전트 위임
    ├─ 독립 컨텍스트 (메인 대화와 분리)
    └─ agent의 프론트매터 tools = Read, Grep, Glob
    │
    ▼
[4] 서브에이전트가 의사결정 트리 분석
    ├─ Brownfield / Greenfield / Selective 판정
    ├─ Top 5 Risk 식별
    └─ Phase Plan 작성
    │
    ▼
[5] 결과를 메인 컨텍스트로 반환
```

---

## 🎯 설계 원칙

### 1. 관점 분리
- **SKILL.md**: "지식 참조" (What) — Claude가 무엇을 알아야 하는지
- **Subagent**: "의사결정 주체" (Who) — 누가 판단하는지
- **Command**: "실행 프로토콜" (How) — 어떻게 수행하는지

세 가지를 섞지 않습니다. SKILL.md에 절차를 넣지 말고 Command에 넘깁니다.

### 2. 단일 진실의 원천 (Single Source of Truth)
- 같은 지식을 SKILL과 Agent 양쪽에 복제하지 마세요
- Agent는 `@plugins/sap-fi/skills/sap-fi/SKILL.md`를 **참조**하고 위임 프로토콜만 추가합니다

### 3. 회사-특화 분리
- sapstack 저장소는 **회사 중립(vendor-neutral)**
- 회사별 설정(`BUKRS=KR01` 등)은 `.sapstack/config.yaml`로만 전달
- 이 분리가 오픈소스 가치를 유지합니다

### 4. 한국 관점 분리
- **글로벌 영문**: `sap-basis` 등
- **한국 현장**: `sap-bc` (BC 컨설턴트 관점)
- **한국어 요약**: 각 모듈의 `references/ko/`
- 영문 본문을 번역하지 않아 키워드 매칭이 일관됩니다

---

## 🔮 확장 포인트

v1.2.0 이후 로드맵은 [`roadmap.md`](./roadmap.md) 참조.

주요 확장 후보:
- SAP Note 정적 resolver (키워드 → Note 번호)
- T-code validator (모든 SKILL의 T-code가 실제 SAP 영역에서 유효한지)
- OData/REST client helper (BTP 연동)
- 추가 서브에이전트 (sap-basis-troubleshooter, sap-mm-consultant 등)
- CI에 `check-hardcoding --strict` 활성화
