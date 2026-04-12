# sapstack × SAP AI Joule — 연동 전략 연구 문서

> **버전**: v1.7.0-research  
> **작성일**: 2026-04-12  
> **상태**: 연구 문서 (프로토타입 없음)

---

## 개요

SAP Joule(2024 출시)은 SAP 내장 AI 코파일럿으로 자연어 기반 업무 자동화를 제공합니다.
sapstack(Knowledge Hub + Evidence Loop)은 **외부 AI 컨설턴트**로 깊이 있는 진단과 구성 가이드를 제공합니다.

이 문서는 두 플랫폼이 상호 보완 관계로 어떻게 연동될 수 있는지 분석합니다.

---

## 1. SAP AI/Joule 아키텍처

### 1-1. SAP Joule의 기본 스택

| 계층 | 기술 | 역할 |
|-----|------|------|
| **Presentation** | SAP UI (Fiori, Launchpad) | 자연어 채팅 인터페이스 |
| **Orchestration** | SAP Joule Engine | 쿼리 분석, 의도(Intent) 매핑, 실행 분기 |
| **AI/ML** | SAP AI Foundation + LLM | 사전 훈련된 SAP 비즈니스 모델 + GPT/Claude/Gemini 연동 |
| **Integration** | Generative AI Hub, BTP | 외부 LLM 오케스트레이션, API 게이트웨이 |
| **Data Access** | SAP Data API, OData v4 | 실시간 ERP 데이터 조회/수정 |

### 1-2. Joule이 지원하는 제품군

- **S/4HANA Cloud** (Public Edition, Private Edition)
- **SuccessFactors** (HRIS, Talent Management)
- **Ariba** (조달, 공급망)
- **Concur** (경비 관리)
- **BTP** (Business Technology Platform)

**핵심 제약**: Joule은 **SAP 프로덕션 데이터**에만 접근 가능 (Test 시스템 미지원 대부분).

### 1-3. Joule의 대표 기능

1. **자연어 질의** — "이번 달 매출은?" → 실시간 쿼리 + 응답
2. **트랜잭션 자동화** — "이 인보이스를 FB03으로 수정해줘" → 자동 실행 (권한 검증 후)
3. **데이터 분석** — "예산 대비 실제 지출의 차이 분석" → 대시보드 생성
4. **프로세스 추천** — "월마감 준비할 사항?" → 체크리스트 제시
5. **코드 생성** (S/4HANA Cloud 한정) — "BADI를 구현해줘" → ABAP 코드 생성

---

## 2. sapstack 아키텍처 개요

### 2-1. sapstack의 3축 구조

```
sapstack = Active Advisor + Context Persistence + Quality Gates
```

| 축 | 역할 | 핵심 산출물 |
|----|------|-----------|
| **Active Advisors** | 14 SKILL + 9 Subagent + 10 Command | 위임 가능한 SAP 컨설턴트 |
| **Context Persistence** | `.sapstack/config.yaml` | 환경 프로필 (ECC/S4, 회사코드, 산업 등) |
| **Quality Gates** | CI/lint/hardcoding check | 품질 보증 시스템 |

### 2-2. sapstack의 핵심 기능

1. **Evidence Loop** (4-turn 진단)
   - Turn 1: 증상 수집
   - Turn 2: 가설 제시 + 검증 요청
   - Turn 3: 운영자 데이터 수집
   - Turn 4: 원인 확인 + 해결책 제시

2. **Multi-module Impact Analysis**
   - 한 건의 CONFIG 변경이 FI/CO/MM/SD 모두에 미치는 영향 분석
   - "F110 실패 원인은 MM에서 평가등급 설정 안 했기 때문"

3. **Knowledge Base**
   - 52+ IMG Configuration 가이드
   - 273 T-codes 데이터베이스
   - 50+ SAP Notes (한국 현장 중심)
   - 한국어 현장 외래어 (필드 언어)

4. **Multi-AI Compatibility**
   - Claude Code, Cursor, Continue.dev, Copilot 지원
   - 각 IDE의 능력(Context, Inference)에 맞춰 최적화

---

## 3. 포지셔닝: Joule vs sapstack

### 3-1. 비교표

| 차원 | SAP Joule | sapstack |
|-----|-----------|----------|
| **실행 환경** | SAP UI (Fiori/Launchpad) | IDE/CLI (VSCode/Cursor/Terminal) |
| **데이터 접근** | 실시간 라이브 (권한 기반) | 오프라인 (Evidence Loop) |
| **특장점** | 즉각적 조회/실행, 간단한 자동화 | 깊이 있는 진단, 원인 분석, 구성 가이드 |
| **확장성** | SAP 통제 (제한적) | 오픈소스 (무한 확장) |
| **비용** | SAP 라이선스 포함 | 무료 (MIT) |
| **다국어** | SAP 기본 언어 | 6개 언어 (한국어 최적화) |
| **IMG 가이드** | 기본 설명만 | 52+ 구성 단계별 가이드 |
| **Evidence Loop** | 없음 | 4-turn 구조화된 진단 |
| **오프라인 사용** | 불가 (API 호출 필수) | 가능 (Config-driven) |

### 3-2. 강점 분석

**Joule의 강점**:
- 실시간 데이터 조회 속도 (ms 단위)
- SAP 시스템과 일관된 사용자 경험 (UI 일체화)
- 권한 제어 자동화 (SAP 권한 체계와 연동)

**sapstack의 강점**:
- 원인 분석의 깊이 (4-turn Evidence Loop)
- 대규모 CONFIG 변경의 영향도 분석 (Multi-module)
- 한국 현장 언어 및 업무 문화 (K-SOX, 가결산 등)
- 오프라인 환경에서의 사용 (망분리 기업)

---

## 4. 상호 보완 시나리오

### 시나리오 1: Joule 선행, sapstack 심화 (가장 일반적)

```
[사용자]
  ↓
"이번 달 매출이 얼마야?" 
  ↓
[Joule] 즉시 답변 (VBAK, VBRK 실시간 쿼리)
  ↓ 만약 "어라, 지난달 대비 25% 떨어졌네?"
  ↓
"왜 떨어졌지?" (원인 분석 필요)
  ↓
[sapstack Evidence Loop]
Turn 1: 증상 수집 (주문 감소? 환율? 반품?)
Turn 2: 가설 제시 + MM에서 가격 인상 여부 확인 요청
Turn 3: 운영자 피드백 (MM02에서 표준원가 30% 인상함)
Turn 4: 원인 확인 (MM 원가 변경이 CO 마진에 반영되어 마진율 악화)
  ↓
[Action] OKTZ로 원가 재평가 또는 가격 정책 수정
```

**사용자 경험**: 의사결정 품질 향상 (추측 → 분석)

---

### 시나리오 2: sapstack 진단, Joule 실행

```
[운영팀]
"F110(자동 지급) 실패 일이 잦아졌어"
  ↓
[sapstack] Evidence Loop 시작
Turn 1: 에러 코드, 벤더, 금액대 수집
Turn 2: 가설 (지급방법 미설정? 은행 계정 미설정?)
Turn 3: 실패 인보이스의 벤더 마스터 확인 요청
Turn 4: 발견: 벤더 XK001의 지급방법이 공란
  ↓
[Joule] 
"이 벤더의 지급방법을 T(금융기관 이체)로 설정해줘"
  ↓
[Joule 자동 실행]
Joule이 XK01 트랜잭션을 대신 열고 설정 변경
  ↓
다시 F110 실행 → 성공
```

**효과**: 진단(깊이) + 실행(속도) 결합

---

### 시나리오 3: sapstack 교육, Joule 실습

```
[신입 사원]
"MIGO(입고 등록)가 뭐하는 건가요?"
  ↓
[sapstack Tutor Agent]
"MIGO는 Goods Receipt를 등록하는 트랜잭션이고,
이동유형 101(구매발주에서 입고)을 주로 쓰며,
실패하는 이유는 다음 3가지가 대부분입니다:
1. PO 상태가 Cancelled
2. 수량 Over-GR
3. 회사코드 Blocking"

그리고 MIGO의 각 필드 설명
  ↓
[Joule Demo]
"실제 화면으로 보여줄까? 이전달 입고 건을 예시로"
  ↓
[Learning Enhancement]
사진이 아닌 **실제 동작하는 트랜잭션** 시연 → 학습 효과 향상
```

**효과**: 이론(깊이) + 실습(몰입) 통합

---

### 시나리오 4: IMG 가이드 × Joule 자동화

```
[SAP 관리자]
"S/4로 업그레이드했는데 CONFIG 신규 설정이 100개 넘네"
  ↓
[sapstack IMG Reference]
52+ 가이드 중 "SPRO > FI > Receivables > Payment Terms 설정" 선택
  ↓
[Reference Content]
단계별 가이드:
1. SPRO 시작 → IMG 버튼
2. IMG 경로: SAP Customizing: Financial Accounting > Accounts Receivable > Credit Management > Credit Limits and Creditworthiness > Define Credit Master Data
3. 각 필드 설명 + S/4 변경사항 + ECC와의 차이
4. 검증: VD05로 고객 크레딧 확인
  ↓
[Joule Assistant (미래)]
"위 가이드를 자동으로 설정해줄까? 
 (ABAP 매크로 또는 BTP API 호출)"
  ↓
[Automated Config]
100개 기본 설정값이 자동 입력
```

**효과**: 구성 시간 1주일 → 1일

---

## 5. 기술적 연동 아키텍처

### 5-1. Option A: Generative AI Hub를 통한 간접 연동

**Joule의 LLM 벡터에 sapstack 문서 주입**

```
┌─────────────────────────────────┐
│    Joule Prompt Injection       │
├─────────────────────────────────┤
│ System Prompt에 다음 추가:      │
│                                 │
│ "사용자가 복잡한 진단을      │
│ 요청하면, 다음 가이드를      │
│ 참조하세요:                   │
│ - sapstack Evidence Loop       │
│ - IMG References              │
│ - K-SOX Best Practices"       │
│                                 │
└─────────────────────────────────┘
         ↓ (Generative AI Hub API)
┌─────────────────────────────────┐
│  Joule LLM (Claude/GPT-4)       │
├─────────────────────────────────┤
│ Token budget + Context window:  │
│ · Joule System Prompt (500T)    │
│ · sapstack Evidence Loop (1K T) │
│ · User Query (500T)             │
│ · SAP Notes (1.5K T)            │
│                                 │
└─────────────────────────────────┘
```

**장점**:
- Joule 인터페이스 유지 (통합 경험)
- API 호출 불필요 (simple prompt injection)

**단점**:
- sapstack 업데이트가 Joule 반영에 lag 발생
- Context window 제한 (전체 52개 IMG 가이드 주입 불가)

---

### 5-2. Option B: BTP AI Core + Retrieval Augmented Generation (RAG)

**sapstack을 RAG 벡터DB로 등록, Joule이 필요시 검색**

```
┌──────────────────────────────┐
│      Joule Query             │
│  "F110이 자꾸 실패해"        │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│  Joule Intent Recognition    │
│  Intent: TROUBLESHOOT        │
│  Module: FI                  │
│  T-code: F110                │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│  BTP AI Core RAG Query       │
│  Retrieve:                   │
│  · sapstack/references/      │
│    payment-run-debug.md      │
│  · sapstack/scenarios/       │
│    f110-troubleshooting.md   │
│  · sapstack/data/            │
│    sap-notes.yaml            │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│  Semantic Search             │
│  (Embedding-based)           │
│  Top 3 matches 반환          │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│  Joule LLM                   │
│  (System Prompt +            │
│   Retrieved Docs)            │
│  → 최종 답변                 │
└──────────────────────────────┘
         ↓
[User]
"벤더 마스터의 지급방법을
T로 설정해줄래?" (Joule 자동화)
```

**구현 방식**:
1. sapstack 문서 → Markdown to Embedding (BTP SDK)
2. BTP AI Core Vector DB에 등록
3. Joule의 prompt routing에 RAG 검색 로직 추가

**장점**:
- 실시간 sapstack 업데이트 반영
- Semantic search (정확도 높음)
- Joule 인터페이스 투명 (사용자 모르게 동작)

**단점**:
- BTP 구독 필수 (SAP 라이선스 추가)
- Embedding 모델 선택 (영어 vs 다국어)
- 초기 개발/테스트 effort

---

### 5-3. Option C: 직접 API 연동 (독립 식별)

**sapstack이 별도 AI 서비스로 제공, Joule이 외부 API로 호출**

```
┌──────────────────────────┐
│     Joule Engine         │
├──────────────────────────┤
│                          │
│ IF user_query == complex │
│    THEN {               │
│   REST POST to:          │
│  sapstack.io/diagnose    │
│   WITH {                 │
│     symptom: "F110 fail" │
│     module: "FI"         │
│     evidence: {...}      │
│    }                     │
│  }                       │
│                          │
└──────────────────────────┘
         ↓ (HTTPS API)
┌──────────────────────────┐
│  sapstack Cloud Service  │
│  (sapstack.io v1.0)      │
├──────────────────────────┤
│                          │
│ · Evidence Loop Engine   │
│ · LLM Router (Claude)    │
│ · IMG Reference DB      │
│ · K-SOX Validator       │
│                          │
└──────────────────────────┘
         ↓
[Response]
{
  "root_cause": "벤더 XK001의 지급방법 미설정",
  "fix_steps": ["XK01 오픈", "지급방법 T로 설정"],
  "preventive": "자동 F110 사전 검증 활성화",
  "sap_note_ref": "SAP Note 123456"
}
```

**구현 복잡도**: 높음 (CloudFormation, API Gateway, Lambda, RDS 등)

**장점**:
- 완전히 독립적 (SAP 의존 없음)
- 다른 시스템(Workday, Oracle)도 활용 가능
- 수익화 경로 (B2B SaaS)

**단점**:
- 개발·운영 비용 높음
- Joule 측에서 사전 integration approval 필요

---

## 6. 한국 시장 전망 및 sapstack 기회

### 6-1. SAP AI 도입 현황 (2026 추정)

| 시점 | 대기업 | 중견기업 | 현황 |
|-----|-------|---------|------|
| 2024 | 파일럿 | 관심 단계 | Joule 첫 출시 |
| 2025 | 본운영 2-3개사 | 파일럿 | S/4 Cloud 이관 추진 |
| 2026 | 본운영 10+개사 | 운영 도입 | BTP AI Core 연동 본격화 |

### 6-2. 한국 기업의 제약 조건

1. **망분리 (DMZ 정책)**
   - 많은 제조·금융사가 인트라넷 내부망 운영
   - Cloud API 접근 제한 (Firewall)
   → **sapstack의 기회**: 온프레미스 환경에서 동작

2. **로컬라이제이션**
   - K-SOX, 가결산, 4대보험 처리
   - Joule은 기본 영어/SAP 표준
   - sapstack은 한국 현장 중심
   → **차별점**: 로컬 컴플라이언스 가이드

3. **레거시 시스템**
   - ECC 6.0 + Extension (최신)
   - S/4 이관 단계별 (2-3년 소요)
   - Joule은 S/4 Cloud 중심
   → **sapstack의 기회**: ECC 전담 (273 T-codes 데이터베이스)

### 6-3. sapstack의 포지셔닝

```
┌────────────────────────────────────────┐
│      Korean SAP Market (2026)          │
├────────────────────────────────────────┤
│                                        │
│  [A] Cloud Native (S/4 Cloud)          │
│      → Joule 충분 (Joule + sapstack 옵션) │
│                                        │
│  [B] Hybrid (S/4 On-Prem + Cloud)      │
│      → Joule (Cloud) + sapstack        │
│      (On-Prem) 보완                    │
│                                        │
│  [C] Legacy + Migration (ECC)          │
│      → sapstack 독점 (Joule 미지원)    │
│                                        │
│  [D] Offline / DMZ (망분리)            │
│      → sapstack 필수 (Joule 불가)     │
│                                        │
└────────────────────────────────────────┘
```

**결론**: 한국 시장에서 Joule과 sapstack의 **비경합(Non-competing) 포지션**

---

## 7. 구현 로드맵

### Phase 1 (v1.8 — 2026년 Q3)
**연구 검증 및 프로토타입**

- [ ] BTP AI Core API 프로토타입 (50 IMG references 등재)
- [ ] Embedding 모델 선택 (multilingual-e5-large)
- [ ] Semantic search 성능 벤치마크 (Recall@5)
- [ ] 한국 고객사 1곳 파일럿 (망분리 환경)

### Phase 2 (v2.0 — 2026년 Q4)
**Production RAG Integration**

- [ ] BTP AI Core RAG pipeline 정식 운영
- [ ] Joule System Prompt Injection 가이드 게시
- [ ] sapstack.io API 알파 출시
- [ ] 대고객 1대1 세션 기반 데이터 수집

### Phase 3 (v3.0 — 2027년 Q2)
**SAP Operations AI Layer**

- [ ] Joule에 native "sapstack" 스킬 등재
- [ ] Event Mesh 자동 trigger (F110 실패 → Evidence Loop 자동 시작)
- [ ] 자동 CONFIG 적용 (IMG guide → ABAP macro)

---

## 8. 기술 스택 제안

### RAG Backend (Option B 기준)

| 레이어 | 기술 | 선택 이유 |
|-------|------|---------|
| **Vector DB** | SAP HANA Vector Engine 또는 Weaviate | SAP 통합 또는 오픈소스 |
| **Embedding Model** | multilingual-e5-large (384 dims) | 한영일 모두 지원 |
| **LLM** | Claude 3.5 또는 Generative AI Hub | 한국어 최적화 |
| **Orchestration** | LangChain 또는 LlamaIndex | 프롬프트 체이닝 간편 |
| **API Framework** | FastAPI (Python) 또는 Node.js | Serverless 배포 용이 |
| **DevOps** | Docker + Kubernetes 또는 BTP Cloud Foundry | 멀티클라우드 지원 |

---

## 9. 결론 및 권장 사항

### 핵심 통찰

1. **상호 배타적이지 않음**: Joule과 sapstack은 경합하지 않음
   - Joule = "실행 AI" (빠른 조회, 자동화)
   - sapstack = "진단 AI" (깊이 있는 분석, 학습)

2. **한국 시장의 필요성**
   - 망분리 기업: sapstack 필수
   - 로컬라이제이션: sapstack 가치
   - 이관 단계: sapstack 지원 (ECC → S/4)

3. **기술적 실현 가능성**
   - Option B (BTP RAG)가 가장 현실적
   - Option C (독립 API)는 장기 수익화 경로

### 권장 다음 단계

**v1.8 (2026년 Q3)**:
- BTP AI Core와의 API 계약 검토 (SAP 파트너십)
- 한국 고객사 1곳과 파일럿 NDA 체결
- Evidence Loop 기반 SAP Notes 자동 추출 스크립트 개발

**v2.0 (2026년 Q4)**:
- Joule 개발팀과 Integration 공식 협의
- System Prompt Injection 가이드 공개
- "sapstack-powered Joule" 마케팅 캠페인

**Long-term (v3.0)**:
- SAP Marketplace에 공식 "sapstack" 스킬 등재
- German/English translations 추가 (European expansion)
- Industry-specific AI consulting (Manufacturing, Finance)

---

## 참조 자료

- **SAP Joule**: https://www.sap.com/products/artificial-intelligence/joule.html
- **SAP AI Core**: https://help.sap.com/docs/AI_CORE
- **Generative AI Hub**: https://help.sap.com/docs/GENERATIVE_AI_HUB
- **SAP Build Code**: https://www.sap.com/products/technology-platform/build-code.html
- **BTP Documentation**: https://help.sap.com/docs/BTP
- **sapstack Evidence Loop**: `/plugins/sap-session/skills/sap-session/SKILL.md`
- **sapstack Korean Field Language**: `/data/synonyms.yaml`

---

## 부록: FAQ

**Q1. Joule이 있는데 왜 sapstack이 필요한가?**

A: Joule은 "빠른 조회"에 최적화. sapstack은 "원인 분석"에 최적화. 복잡한 진단은 4-turn Evidence Loop이 더 정확.

**Q2. sapstack이 Joule을 대체할 수 있나?**

A: 아니오. 반대로 상호 보완. sapstack은 실시간 데이터 조회 불가 (Evidence Loop은 오프라인 기반).

**Q3. 한국 기업에서 먼저 도입할 수 있나?**

A: 가능. 망분리 환경에서는 sapstack만 가능. Joule은 Cloud API 필요.

**Q4. Integration cost는?**

A: Option B (BTP RAG)는 SAP 라이선스 + 개발비 2-3개월. Option A (Prompt Injection)는 거의 무료 (가이드만).

**Q5. 우선순위는?**

A: 한국 시장 기준 (2026):
1. Option A 먼저 (빨리, 비용 낮음)
2. → 고객 피드백 수집
3. → Option B 검토 (효과 확인 후 투자)

