# sapstack × Kiro Integration Guide

> Amazon **Kiro IDE**에서 sapstack 전체 기능(Evidence Loop · 14 SAP 모듈 ·
> 현장체 언어 레이어 · MCP 툴)을 사용하는 방법. 5분 퀵스타트보다 깊은
> 아키텍처 이해가 필요할 때 이 문서를 참조하세요.

## 🎯 왜 Kiro × sapstack인가

두 제품의 철학이 놀랄 만큼 같은 문제를 풀고 있기 때문입니다:

| | Kiro | sapstack |
|---|---|---|
| 문제 | "LLM이 맥락 없이 코딩하면 이상한 걸 만든다" | "LLM이 맥락 없이 진단하면 조언봇이 된다" |
| 해법 | Spec-Driven Development — 코드 전에 spec을 확정 | Evidence Loop — 판정 전에 가설·반증·증거를 확정 |
| 게이트 | requirements.md → design.md → tasks.md | Turn 1 INTAKE → Turn 2 HYPOTHESIS → Turn 3 COLLECT → Turn 4 VERIFY |
| DNA | LLM 과신을 막는 구조화된 중간 산출물 | 같음 |

Kiro는 **개발 영역**, sapstack은 **운영 영역**에 이 DNA를 적용했습니다.
둘을 결합하면 "스펙 기반 개발"과 "증거 기반 운영 진단"이 같은 워크스페이스
안에서 매끄럽게 연결됩니다.

---

## 🏗 아키텍처 — 3 레이어 통합

```
┌───────────────────────────────────────────────────────────┐
│                      Kiro IDE                             │
├───────────────────────────────────────────────────────────┤
│ Layer 1 — AGENTS.md (자동 주입, workspace root)           │
│   ├─ 8 Universal Rules (Rule #8 현장체 포함)              │
│   ├─ Standard Response Format — Dual Mode                 │
│   └─ 15 플러그인 카탈로그                                  │
├───────────────────────────────────────────────────────────┤
│ Layer 2 — .kiro/steering/*.md (inclusion 모드별 주입)     │
│   ├─ sapstack-universal-rules.md     (always)             │
│   ├─ sapstack-korean-field-language.md (always)           │
│   ├─ sapstack-evidence-loop.md       (fileMatch)          │
│   └─ sapstack-symptom-context.md     (auto)               │
├───────────────────────────────────────────────────────────┤
│ Layer 3 — .kiro/settings/mcp.json (MCP 서버)              │
│   └─ sapstack MCP                                          │
│      ├─ autoApprove: 읽기 툴 5개                           │
│      │  (resolve_symptom, check_tcode, list_sessions,     │
│      │   resolve_sap_note, list_plugins)                  │
│      └─ 수동 승인: 쓰기 툴 4개 (v1.6.0+)                  │
└───────────────────────────────────────────────────────────┘
            │
            ▼  모든 Layer가 참조(#[[file:...]])로 연결
┌───────────────────────────────────────────────────────────┐
│                 sapstack 저장소 (복제 없음)                │
│   plugins/ · agents/ · schemas/ · data/ · mcp/ · web/      │
└───────────────────────────────────────────────────────────┘
```

### 핵심 원칙: **복사 없음 (No Duplication)**

모든 steering 파일은 `#[[file:...]]` 참조 문법으로 sapstack 원본을 실시간
주입합니다. 즉:

- sapstack을 `git pull`로 업데이트하면 steering도 자동 최신화
- steering 파일의 "본문"은 metadata shell (50-100줄) — 내용은 전부 참조
- drift 0, 동기화 부담 0

이 설계가 가능한 이유는 Kiro의 공식 `#[[file:...]]` 참조 문법이 있기 때문
입니다. 이 문법을 활용하지 않고 내용을 복사하면 **유지보수 지옥**이
펼쳐져요.

---

## 🔁 워크플로우 — 3가지 사용 패턴

### 패턴 A — Kiro 안에서 완결 (권장)

**대상**: 운영자 또는 개발자가 Kiro를 메인 IDE로 사용 중.

```
[Kiro Chat]
사용자: "F110 돌렸는데 벤더 하나만 No valid payment method 뜨네요. 어제까진 멀쩡했어요"
   │
   ▼
[자동 주입된 steering 덕분에]
   - sapstack-korean-field-language.md → 현장체 인식 ("돌렸는데", "뜨네요")
   - sapstack-symptom-context.md → symptom-index.yaml 자동 로드
   - sapstack-universal-rules.md → 환경 질문 먼저
   │
   ▼
[Kiro가 sapstack MCP 호출]
   resolve_symptom(query="...", language="ko", country="kr")
   → sym-f110-no-payment-method (신뢰도 87%)
   │
   ▼
[Kiro 응답]
   환경 질문 → 사용자 답변 → 증상 매칭 결과 제시 →
   Design-First spec 생성 제안 → 사용자가 "네"라고 하면 spec 작성
   │
   ▼
[.kiro/specs/f110-payment-method-diag/]
   requirements.md → design.md → tasks.md (EARS 포맷으로 falsification 포함)
```

### 패턴 B — Kiro + Claude Code 하이브리드

**대상**: v1.5.0 현재 상태에서 Evidence Loop 세션의 **실제 YAML 작성**이
필요한 경우. v1.6.0에서 MCP write-path가 추가되면 불필요해집니다.

```
[Kiro 탭]  ─── 증상 분석, spec 작성, 코드 리뷰
    │
    │  같은 .sapstack/sessions/ 디렉토리 공유
    ▼
[Claude Code CLI] ─── /sap-session-start, add-evidence, next-turn
```

두 도구가 같은 파일 시스템을 보므로 동시 사용 가능. Kiro에서 편집한
state.yaml을 Claude Code가 즉시 인식.

### 패턴 C — Kiro Spec → sapstack Session 변환

**대상**: Kiro에서 시작한 spec이 중간에 SAP 진단으로 빠져야 할 때.

현재 v1.5.0은 수동 변환만 지원 — Kiro spec의 requirements.md를 읽고 운영자가
Claude Code에서 `/sap-session-start`를 실행. v1.6.0+에서 자동 변환 스크립트
(`scripts/spec-to-session.ts`)를 추가할 계획입니다.

---

## 🧩 Steering 파일 inclusion 모드 선택 이유

Kiro의 4가지 inclusion 모드를 치밀하게 분배한 이유:

### `always` — 항상 주입 (2개)

1. **sapstack-universal-rules.md**
   8개 규칙은 **모든 SAP 작업에 필수**. 하드코딩 금지·환경 먼저 질문·
   Transport 필수는 언제나 참.

2. **sapstack-korean-field-language.md**
   한국어 응답 톤은 **대화 전반에 적용**돼야 함. 한 응답만 현장체이고 다음
   응답은 번역체면 사용자가 혼란스러움.

### `fileMatch` — 특정 파일 편집 시만 (1개)

3. **sapstack-evidence-loop.md** (`.sapstack/sessions/**/*.yaml`)
   Turn-aware 포맷은 **실제로 세션 작업 중일 때만 필요**. 일반 React 컴포넌트
   개발 중에 Evidence Loop가 주입되면 컨텍스트 낭비. fileMatch로 정밀 제어.

### `auto` — description 매칭 시만 (1개)

4. **sapstack-symptom-context.md**
   20개 symptom-index가 꽤 큽니다. **SAP 증상 언급이 없으면 주입하지 않음**.
   Kiro가 `description`("When the user describes a SAP system issue...")을
   보고 관련 발화가 감지될 때만 로드. 토큰 절약.

### `manual` — 선택적 호출

현재 v1.5.0에서는 manual 모드 steering 없음. 필요시 `#sapstack-...` 문법으로
호출 가능한 참조 사전을 추가할 수 있음 (v1.6.0 고려).

---

## 🔒 MCP 툴 거버넌스

`.kiro/settings/mcp.json`의 `autoApprove` 분리는 Universal Rule #5
("Simulate before actual run")의 Kiro 구현입니다.

### 자동 승인 (read-only)
| 툴 | 이유 |
|---|---|
| `resolve_symptom` | symptom-index 조회만 |
| `check_tcode` | tcodes.yaml 조회만 |
| `list_plugins` | 플러그인 목록 조회 |
| `resolve_sap_note` | sap-notes.yaml 조회만 |
| `list_sessions` | 세션 메타데이터 조회 |

이 툴들은 디스크 읽기·검색만 수행하고 상태를 바꾸지 않아서 매 호출마다
확인받을 필요가 없습니다.

### 수동 승인 (v1.5.0에서는 `NotImplementedError`, v1.6.0에서 활성)
| 툴 | 이유 |
|---|---|
| `start_session` | 새 디렉토리·파일 생성 |
| `add_evidence` | Bundle 파일 생성·해시 계산 |
| `next_turn` | 가설·Verdict 생성, 상태 전이 |
| `validate_session_file` | 경로 traversal 리스크 방지 |

이 툴들은 파일 시스템을 변경하므로 **매번 확인**을 요구합니다. wildcard
`"*"` auto-approve를 쓰지 않은 것은 defense in depth.

---

## 🧪 검증 시나리오 — "이게 잘 작동하는지 어떻게 알까"

Kiro 통합이 제대로 된 상태인지 확인하는 5개 체크:

### Check 1 — Steering 자동 주입
Kiro chat에 입력: `"코스트 센터가 뭐야?"`
- 기대: Kiro 응답에 "코스트 센터 (원가센터, KOSTL)" 이중 병기 + 환경 질문
- 실패: 그냥 "원가센터는 ..." → steering이 주입 안 됨 → `.kiro/steering/*.md`
  위치와 frontmatter 확인

### Check 2 — AGENTS.md 주입
Kiro chat에 입력: `"sapstack의 Universal Rules 중 #5가 뭐야?"`
- 기대: Kiro가 Rule #5 ("Simulate before actual run") 정확히 인용
- 실패: "sapstack이 뭔가요?" → AGENTS.md가 workspace root에 없음

### Check 3 — MCP 읽기 툴 자동 승인
Kiro chat에 입력: `"resolve_symptom으로 'F110 페이먼트 메소드 에러' 매칭 찾아줘"`
- 기대: 툴이 승인 프롬프트 없이 즉시 실행, `sym-f110-no-payment-method` 포함 결과
- 실패: "MCP 서버를 찾을 수 없음" → `.kiro/settings/mcp.json` 경로 또는 빌드 확인

### Check 4 — MCP 쓰기 툴 수동 승인
Kiro chat에 입력: `"start_session으로 새 세션 만들어줘"`
- 기대: Kiro가 승인 프롬프트 표시 → 승인 시 `NotImplementedError` 반환 (v1.5.0)
- 실패: 승인 없이 실행됨 → `autoApprove` 목록에 실수로 쓰기 툴이 포함됨

### Check 5 — Auto 모드 steering 활성화
Kiro chat에 입력: `"MIGO에서 입고 치는데 M7 에러 떠요"`
- 기대: 자동으로 `sym-migo-posting-error` 매칭 + 전형적 원인 제시
- 실패: 일반 답변만 → `sapstack-symptom-context.md`의 `description` 필드가
  매칭 안 됨, 또는 Kiro의 auto 감지 민감도 조정 필요

---

## 🧭 트러블슈팅

### Q. `#[[file:...]]` 참조가 빈 내용을 반환해요
**A.** 상대 경로가 workspace root 기준인지 확인하세요. sapstack이 서브모듈
(`./sapstack/`)이면 `#[[file:sapstack/CLAUDE.md]]` 식으로 서브모듈 경로를
포함해야 합니다. steering 파일 내 모든 참조를 일괄 수정:

```bash
# .kiro/steering/ 아래 모든 참조를 서브모듈 경로로 변경
find .kiro/steering -name "*.md" -exec sed -i \
  's|#\[\[file:|#\[\[file:sapstack/|g' {} \;
```

### Q. 4개 steering이 한꺼번에 주입되면 컨텍스트가 너무 큰가요?
**A.** 아니요. `always` 모드 2개(Universal Rules + Korean Field)만 매번
주입되고, 나머지 2개는 조건부입니다. 실측: 평균 ~15KB 추가, Kiro 기본
컨텍스트의 3-5% 수준.

### Q. Evidence Loop steering이 일반 개발 중에도 활성화돼요
**A.** `fileMatchPattern`이 너무 넓은지 확인하세요. 기본값은
`.sapstack/sessions/**/*.{yaml,yml}`입니다. 만약 프로젝트에 `.sapstack/`
디렉토리가 루트에 없으면 패턴을 조정해야 합니다.

### Q. Kiro Spec의 Design-First 워크플로우를 어떻게 선택하나요?
**A.** Kiro의 Specs 패널에서 `+` → 증상 입력 → 워크플로우 변형 선택 단계에서
"Design-First"를 고르세요. sapstack의 "가설 다수 → 증거 검증" 구조와 가장
잘 맞습니다.

### Q. v1.5.0에서 `start_session` MCP 툴이 작동 안 해요
**A.** 의도된 동작입니다. v1.5.0은 쓰기 툴이 스캐폴딩 상태 (`NotImplementedError`
반환). 실제 세션 쓰기는 Claude Code의 `/sap-session-start` 커맨드를 사용하고,
Kiro는 읽기·편집·리뷰 용도로 병행하세요. v1.6.0에서 해결 예정.

---

## 📊 Kiro × sapstack 성숙도 매트릭스

| 기능 | v1.5.0 | v1.6.0 (계획) | v1.7.0+ |
|---|---|---|---|
| AGENTS.md 자동 주입 | ✅ | ✅ | ✅ |
| Steering 4개 (참조 방식) | ✅ | ✅ | ✅ |
| MCP 읽기 툴 5개 | ✅ | ✅ | ✅ |
| MCP 쓰기 툴 4개 | ❌ scaffold | ✅ | ✅ |
| Kiro Spec ↔ Session 수동 변환 | ✅ (문서) | ✅ | ✅ |
| Kiro Spec ↔ Session 자동 변환 | ❌ | 🟡 script | ✅ MCP tool |
| Agent Hooks 연동 | ❌ | ❌ | ✅ |
| `_templates/sap-incident/` 스캐폴딩 | ❌ | ✅ | ✅ |
| 한국어 현장체 (Rule #8) | ✅ | ✅ | ✅ |
| de/ja 다국어 | 🌱 seed | 🟡 확장 | ✅ 완전 |

---

## 🔗 관련 문서

- [`docs/kiro-quickstart.md`](kiro-quickstart.md) — 5분 Quick Start
- [`AGENTS.md`](../AGENTS.md) — Kiro가 자동으로 읽는 루트 파일
- [`.kiro/settings/mcp.json`](../.kiro/settings/mcp.json) — MCP 설정 템플릿
- [`.kiro/steering/`](../.kiro/steering/) — 4개 steering 파일
- [`plugins/sap-session/skills/sap-session/SKILL.md`](../plugins/sap-session/skills/sap-session/SKILL.md) — Evidence Loop 규약
- [`docs/multi-ai-compatibility.md`](multi-ai-compatibility.md) — 다른 AI 도구 비교

### Kiro 공식 문서
- [kiro.dev/docs/steering](https://kiro.dev/docs/steering/)
- [kiro.dev/docs/mcp/configuration](https://kiro.dev/docs/mcp/configuration/)
- [kiro.dev/docs/specs/feature-specs](https://kiro.dev/docs/specs/feature-specs/)
- [kiro.dev/docs/specs/best-practices](https://kiro.dev/docs/specs/best-practices/)
