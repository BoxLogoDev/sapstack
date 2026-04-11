# Multi-AI 호환 가이드

> sapstack을 Claude Code 외에 **OpenAI Codex CLI**, **GitHub Copilot**, **Cursor**, 기타 AI 코딩 도구에서도 사용하는 방법.

sapstack은 원래 Claude Code의 plugin marketplace 포맷(`plugins/*/skills/*/SKILL.md`)으로 만들어졌지만, 같은 지식을 여러 AI 도구에서 활용할 수 있도록 **호환 레이어 파일들**을 함께 제공합니다.

---

## 🎯 설계 원칙

**"원본 1개 + 호환 레이어 N개"**

- **원본 (Source of Truth)**: `plugins/*/skills/*/SKILL.md` — Claude Code가 키워드 기반으로 자동 활성화
- **호환 레이어**: 각 AI 도구가 자동으로 읽는 표준 파일에 동일한 규칙을 영문/한국어로 요약
- **데이터 자산**: `data/tcodes.yaml`, `data/sap-notes.yaml` — 모든 AI 도구가 공유

---

## 📂 도구별 진입점

| AI 도구 | 자동 로드되는 파일 | sapstack에서 제공 |
|---------|-----------------|------------------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md` | ✅ 원본 |
| **Codex CLI (OpenAI)** | `AGENTS.md` (루트) | ✅ `AGENTS.md` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ |
| **Cursor** | `.cursor/rules/*.mdc` | ✅ `.cursor/rules/sapstack.mdc` |
| **Continue.dev** | `.continuerc.json` (아직 없음) | ⏳ v1.3 예정 |
| **Aider** | `CONVENTIONS.md` (선택) | ⏳ v1.3 예정 |

각 파일은 같은 **Universal Rules**, **Response Format**, **13개 모듈 목록**, **데이터 자산 위치**를 담고 있습니다. 어떤 AI를 쓰든 답변 품질이 일관되도록 하는 것이 목적입니다.

---

## 🚀 도구별 사용법

### 1. Claude Code (네이티브)

```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack
/plugin install sap-abap@sapstack
/plugin install sap-bc@sapstack    # 한국 BC 컨설턴트 특화
```

그 다음 자연어로 질문하면 키워드(MIRO, FB01, ABAP 등)에 따라 관련 SKILL.md가 자동 활성화됩니다.

서브에이전트 위임:
```
/sap-fi-closing 월결산 KR01
/sap-abap-review Z_CUSTOM_REPORT.abap
/sap-s4-readiness --auto
```

### 2. OpenAI Codex CLI

**설치 방법 — Option A: Git submodule (권장)**
```bash
cd your-project
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.2.0   # 원하는 버전으로 고정
```

Codex CLI는 프로젝트 루트와 하위 디렉토리의 `AGENTS.md`를 자동으로 읽습니다. sapstack을 서브디렉토리로 넣으면 해당 `AGENTS.md`가 로드되어 규칙이 적용됩니다.

**사용 예시**:
```bash
codex "sapstack의 sap-fi-consultant 에이전트 프롬프트를 따라 다음 이슈를 진단해줘:
MIRO에서 세금코드가 안 잡힙니다.
환경: S/4HANA 2023, 회사코드 KR01, on-premise."
```

Codex는 `sapstack/AGENTS.md`를 로드해 Universal Rules, Response Format, 관련 SKILL.md 위치를 파악한 뒤 답변합니다.

**Option B: 독립 프로젝트**
sapstack 저장소 자체를 workspace로 열고 Codex CLI를 실행하면 `AGENTS.md`가 바로 로드됩니다.

### 3. GitHub Copilot

**설치 방법**:
```bash
cd your-project
mkdir -p .github

# sapstack의 Copilot 지침을 프로젝트에 복사
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.github/copilot-instructions.md
```

또는 sapstack 저장소를 git submodule로 넣었다면 자동으로 `.github/copilot-instructions.md`가 존재합니다.

**동작 방식**:
- Copilot Chat와 Copilot Edits가 세션 시작 시 이 파일을 자동 로드
- SAP 관련 질문에 대해 Universal Rules를 적용
- ABAP 코드 제안 시 deprecated 패턴(BSEG SELECT, CALL TRANSACTION 등)을 피함

**팁**: `.github/instructions/*.instructions.md` 파일로 파일 타입별 지침도 가능 (예: `abap.instructions.md`, `yaml.instructions.md`). 향후 v1.3에서 분할 예정.

### 4. Cursor

**설치 방법**:
```bash
cd your-project
mkdir -p .cursor/rules

curl -o .cursor/rules/sapstack.mdc \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.cursor/rules/sapstack.mdc
```

Cursor는 `.cursor/rules/*.mdc` 파일을 자동 인식합니다. sapstack 룰은 `alwaysApply: true`로 설정되어 있어 SAP 관련 파일(`.md`, `.abap`, `.yaml`)을 편집할 때 항상 적용됩니다.

**확인 방법**: Cursor Chat을 열고 "현재 어떤 룰이 활성화되어 있나?" 질문하면 `sapstack.mdc`가 목록에 나와야 합니다.

### 5. 기타 AI 도구 (호환 파일 수동 사용)

호환 레이어 파일이 아직 공식 지원되지 않는 도구에서는 `AGENTS.md` 내용을 **system prompt**에 직접 주입하세요. 대부분의 LLM API·채팅 인터페이스에서 system prompt를 커스터마이즈할 수 있습니다.

```python
# 예시: Anthropic API / OpenAI API
import httpx
system_prompt = httpx.get(
    "https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/AGENTS.md"
).text

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "MIRO에서 세금코드가 안 잡혀요..."}
]
```

---

## 🔄 데이터 자산 공유

모든 AI 도구가 **동일한 데이터셋**을 참조합니다:

### `data/tcodes.yaml` — 확정 T-code 레지스트리
AI가 T-code를 언급하기 전에 이 파일에 등록되어 있는지 확인해야 합니다. 없는 T-code는 오탈자·추측·존재하지 않는 트랜잭션일 수 있습니다.

```bash
# T-code 존재 확인
grep -q "^FAGL_FC_VAL:" data/tcodes.yaml && echo "확정" || echo "미등록"
```

### `data/sap-notes.yaml` — 확정 SAP Note 카탈로그
AI는 이 파일에 등록된 Note 번호만 인용해야 합니다. 추측 금지.

```bash
# 키워드로 SAP Note 검색
./scripts/resolve-note.sh korea
./scripts/resolve-note.sh migration ACDOCA
```

---

## 🇰🇷 언어 선택

### 한국어로 답변받기
1. **Claude Code**: `.sapstack/config.yaml`에 `preferences.language: ko` 설정
2. **Codex / Copilot / Cursor**: 질문을 한국어로 하면 자동으로 한국어 답변
3. **명시적 지시**: "한국어로 답변해줘"를 질문에 포함

### 한국어 참고 자료
13개 모든 모듈에 한국어 퀵가이드가 있습니다:
```
plugins/<module>/skills/<module>/references/ko/quick-guide.md
```

`sap-fi`와 `sap-abap`은 전문 번역본도 제공:
```
plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md
plugins/sap-abap/skills/sap-abap/references/ko/SKILL-ko.md
```

한국 BC 컨설턴트 특화 전용 플러그인은 `sap-bc`입니다.

---

## ⚠️ 알려진 차이점 / 한계

| 기능 | Claude Code | Codex CLI | Copilot | Cursor |
|------|------------|-----------|---------|--------|
| 키워드 자동 활성화 | ✅ | ⚠️ 수동 로드 | ⚠️ 전체 로드 | ✅ glob 기반 |
| 슬래시 커맨드 | ✅ 네이티브 | ❌ 수동 실행 | ❌ | ❌ |
| 서브에이전트 위임 | ✅ Task 도구 | ⚠️ 프롬프트 재사용 | ❌ | ❌ |
| 환경 프로필 자동 참조 | ✅ | ⚠️ 수동 | ⚠️ 수동 | ⚠️ 수동 |
| 한국어 references | ✅ | ✅ | ✅ | ✅ |

**⚠️** = 작동하지만 수동 지시 필요
**❌** = 미지원

Claude Code가 가장 풍부한 경험을 제공하지만, 다른 도구에서도 **지식 품질은 동일**합니다.

---

## 🧩 호환성 확장 로드맵

v1.3.0+ 에서 계획 중:
- [ ] Continue.dev 지원 (`.continuerc.json` 또는 `config.yaml`)
- [ ] Aider 지원 (`CONVENTIONS.md`)
- [ ] 자동 빌드 스크립트 (`scripts/build-multi-ai.sh`) — SKILL.md에서 각 호환 레이어 파일을 생성
- [ ] Copilot `.github/instructions/*.instructions.md` 파일 분할

기여 환영 — `CONTRIBUTING.md` 참조.

---

## 💬 질문 / 피드백

- Issues: https://github.com/BoxLogoDev/sapstack/issues
- 각 호환 레이어 파일에 버그/개선점 발견 시 PR 환영
