# sapstack × Kiro — 5분 Quick Start

> Amazon **Kiro** IDE에서 sapstack을 써서 SAP 운영 진단·지식 검색·Evidence
> Loop 세션을 돌리는 법. 라이브 SAP 연결은 일체 없습니다 — 모든 데이터는
> 당신의 워크스페이스 로컬 파일에서만 읽습니다.

## 🎯 이 가이드로 얻는 것

- Kiro chat에서 `"코스트 센터 바뀐거 찾아줘"` → 자동으로 `resolve_symptom` 호출
- Kiro가 모든 응답에서 sapstack Universal Rules #1-#8 준수 (환경 먼저 묻고, 이중 병기, 현장체 사용)
- `.sapstack/sessions/` 편집 시 Evidence Loop 4턴 포맷 자동 적용
- 기존 14개 플러그인·9개 컨설턴트 에이전트 모두 접근 가능

---

## ⚙️ Prerequisites

- Kiro IDE 최신 버전 ([kiro.dev](https://kiro.dev) 에서 다운로드)
- Node.js ≥ 20
- Git

---

## 1️⃣ sapstack 클론 (서브모듈 권장)

```bash
# 당신의 워크스페이스 루트에서
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
```

또는 단순 clone:
```bash
git clone https://github.com/BoxLogoDev/sapstack
```

이 가이드는 **서브모듈 경로** (`./sapstack/`) 기준으로 씁니다. 단순 clone이면
`sapstack/` 부분을 실제 경로로 바꿔주세요.

---

## 2️⃣ MCP 서버 빌드

```bash
cd sapstack/mcp
npm install
npm run build
cd ../..
```

빌드 결과물은 `sapstack/mcp/dist/server.js`에 생깁니다.

> **v1.5.0 상태**: MCP 서버는 스캐폴딩 — 읽기 툴 5개(`resolve_symptom`,
> `resolve_sap_note`, `check_tcode`, `list_sessions`, `list_plugins`)는 즉시
> 작동합니다. 쓰기 툴(`start_session`, `add_evidence`, `next_turn`)은 v1.6.0
> 예정이며 지금 호출하면 `NotImplementedError`를 돌려줍니다.

---

## 3️⃣ Kiro MCP 설정 복사

sapstack 저장소에 포함된 템플릿을 당신의 워크스페이스 `.kiro/settings/`로 복사:

```bash
mkdir -p .kiro/settings
cp sapstack/.kiro/settings/mcp.json .kiro/settings/mcp.json
```

파일을 열어서 **경로만 환경에 맞게 조정**:

```json
{
  "mcpServers": {
    "sapstack": {
      "command": "node",
      "args": ["${workspaceFolder}/sapstack/mcp/dist/server.js"],
      "env": {
        "SAPSTACK_ROOT": "${workspaceFolder}/sapstack",
        "SAPSTACK_WORKSPACE": "${workspaceFolder}"
      }
    }
  }
}
```

**Kiro 자동 재연결**: 파일을 저장(⌘S) 하는 순간 Kiro가 MCP 서버를 로드합니다.
IDE 재시작 불필요.

---

## 4️⃣ (권장) Steering 파일 복사

sapstack의 steering 파일 4개를 워크스페이스에 복사하면 sapstack 원칙이
모든 Kiro 세션에 자동 주입됩니다:

```bash
mkdir -p .kiro/steering
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

복사되는 파일:

| 파일 | 모드 | 역할 |
|---|---|---|
| `sapstack-universal-rules.md` | always | Rule #1-#8 + 이중 병기 원칙 |
| `sapstack-korean-field-language.md` | always | 현장체 톤 + 58 용어 동의어 |
| `sapstack-evidence-loop.md` | fileMatch | 세션 YAML 편집 시 Turn-aware 포맷 |
| `sapstack-symptom-context.md` | auto | SAP 증상 언급 시 20건 symptom index 주입 |

이 파일들은 전부 `#[[file:sapstack/...]]` 참조 문법으로 원본을 주입하므로,
**sapstack을 업데이트하면 steering도 자동으로 최신**이 됩니다. 복제 아닙니다.

---

## 5️⃣ 첫 호출 — 3가지 시나리오

### A. 단순 지식 검색 (auto-approved)

Kiro chat에 입력:
```
resolve_symptom으로 "F110 돌렸는데 벤더 하나만 No payment method 뜨는 경우" 찾아줘
```

→ 자동 승인되어 즉시 `sym-f110-no-payment-method` 포함 상위 5개가 나옵니다.
synonym 확장 덕분에 "돌렸는데", "뜨는" 같은 발화체도 잘 매칭됩니다.

### B. T-code 확인

```
check_tcode SE16N
```

→ `verified: true` + 모듈·설명 반환.

### C. 세션 목록 조회

```
list_sessions status=awaiting_evidence
```

→ 아직 `.sapstack/sessions/`가 비어 있으면 빈 배열. 세션을 수동으로 만들어
시험해볼 수 있습니다:

```bash
mkdir -p .sapstack/sessions/sess-20260412-test01
cp sapstack/plugins/sap-session/skills/sap-session/references/turn-formats.md \
   .sapstack/sessions/sess-20260412-test01/state.yaml  # (실제로는 스키마에 맞는 YAML 작성)
```

---

## 6️⃣ Evidence Loop 실전 — 4턴 돌려보기

v1.5.0은 write-path MCP 툴이 스캐폴딩 상태라, **Kiro chat에서는 세션 **설계**
작업**만 권장합니다. 실제 세션 돌리기는 두 경로 중 하나:

### 경로 1 — Kiro에서 spec으로 접근 (권장)
Kiro의 **Spec** 패널에서 `+` → "F110 payment method missing diagnosis"로
spec 생성 → Kiro가 `sapstack-evidence-loop` steering을 참조해 자동으로
Turn 1/2/4 구조를 따름. **Design-First 워크플로우**를 선택하는 것이 sapstack
방식과 가장 잘 맞습니다 (가설 다수 → 증거 검증).

### 경로 2 — Claude Code CLI로 병행
sapstack의 `/sap-session-*` 커맨드는 Claude Code에서만 작동합니다. 같은
워크스페이스에서 Claude Code CLI를 열어 `/sap-session-start "..."`로 실제
YAML 세션을 만들고, Kiro는 편집·리뷰·검색에 사용. 두 도구가 **같은
`.sapstack/sessions/` 디렉토리**를 공유합니다.

v1.6.0부터는 Kiro MCP에서 `start_session`·`add_evidence`·`next_turn`이 직접
호출 가능해져서 경로 2가 필요 없어집니다.

---

## 🔒 보안 & 거버넌스

- **쓰기 툴 수동 승인**: `start_session`, `add_evidence`, `next_turn`,
  `validate_session_file`은 `autoApprove`에 없어서 **매 호출마다 Kiro가 확인**
  을 요구합니다. 이건 Universal Rule #5("프로덕션 변경 전 시뮬레이션 먼저")의
  Kiro 버전입니다.
- **네트워크 호출 없음**: MCP 서버는 로컬 파일만 읽습니다. SAP 시스템에
  연결하지 않고, symptom-index·tcodes·sap-notes도 로컬에서 로드합니다.
- **민감 정보 주의**: `.sapstack/sessions/` 아래에 실제 운영 증거를 넣을 때는
  `plugins/sap-session/skills/sap-session/references/evidence-bundle-guide.md`
  의 PII 마스킹 가이드를 반드시 준수하세요.

---

## 🧭 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| Kiro가 `sapstack` MCP 서버를 인식 못 함 | `mcp.json` 경로 오류 | `${workspaceFolder}` 절대 경로로 대체해서 테스트 |
| `resolve_symptom` 호출 시 empty result | synonyms.yaml이 로드 안 됨 | MCP 서버 로그 확인 — `synonyms.yaml load failed` 메시지 |
| Steering 파일이 적용 안 됨 | `.kiro/steering/` 경로 오류 | workspace root에 위치했는지 확인 |
| `#[[file:...]]` 참조가 빈 내용 반환 | 상대 경로 오류 | 참조는 workspace root 기준 |
| 쓰기 툴이 `NotImplementedError` | v1.5.0 스캐폴딩 | v1.6.0 대기 또는 Claude Code CLI 사용 |

---

## 📚 다음 단계

- [kiro-integration.md](kiro-integration.md) — 전체 통합 아키텍처
- [../plugins/sap-session/skills/sap-session/SKILL.md](../plugins/sap-session/skills/sap-session/SKILL.md) — Evidence Loop 규약
- [../plugins/sap-session/skills/sap-session/references/korean-field-language.md](../plugins/sap-session/skills/sap-session/references/korean-field-language.md) — 현장체 원칙
- [../data/synonyms.yaml](../data/synonyms.yaml) — 58개 용어 동의어 사전
- [Kiro 공식 MCP 문서](https://kiro.dev/docs/mcp/configuration/)
- [Kiro 공식 Steering 문서](https://kiro.dev/docs/steering/)
