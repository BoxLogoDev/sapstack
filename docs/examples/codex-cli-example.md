# OpenAI Codex CLI 사용 예시

> sapstack을 Codex CLI에서 쓰는 실전 세션.

## 설치

### Option A: Git submodule (권장)
```bash
cd your-project
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.4.0 && cd ..
git commit -m "chore: add sapstack submodule"
```

### Option B: 독립 사용
sapstack 저장소를 clone하고 해당 디렉토리에서 Codex 실행.

## 기본 워크플로

### 시나리오 1 — sapstack 지침 자동 로드

Codex CLI는 프로젝트 루트의 `AGENTS.md`를 자동 로드합니다.

```bash
cd your-project  # sapstack을 submodule로 가진 프로젝트

codex "sapstack 프로젝트입니다. sap-fi-consultant 에이전트 프롬프트 규칙을 따라
다음 이슈를 진단해주세요:

환경: S/4HANA 2023, on-premise, 회사코드 KR01 (가정)
증상: MIRO에서 세금코드가 자동으로 잡히지 않아 송장 포스팅 실패

Response format은 sapstack Universal Rules의 Standard Response Format
(Issue → Root Cause → Check → Fix → Prevention → SAP Note)을 따라주세요."
```

Codex가 `sapstack/AGENTS.md`를 읽어 Universal Rules을 시스템 프롬프트에 반영합니다.

### 시나리오 2 — 특정 에이전트 프롬프트 명시

```bash
codex "plugins/sap-abap/skills/sap-abap/SKILL.md의 Clean Core 원칙과
agents/sap-abap-reviewer.md 프롬프트 규칙을 따라 다음 ABAP 코드를 리뷰해주세요:

$(cat Z_CUSTOM_REPORT.abap)"
```

### 시나리오 3 — 데이터 자산 참조

```bash
codex "sapstack data/tcodes.yaml에 등록된 T-code만 사용해서
F110 지급실행 실패 진단 가이드를 작성해주세요. 
허위 T-code 인용 금지, 확인되지 않은 SAP Note 번호 금지."
```

## 실제 출력 예시 (GPT-5 기준)

```markdown
## 🔍 Issue
F110 지급실행 실패 — 구체적 오류 메시지 확인 필요

## 🧠 Root Cause (확률 순)
1. 하우스뱅크 결정 실패 (FBZP Bank Determination)
2. 벤더 마스터 지급방법 미설정 (LFB1.ZWELS)
3. DME 포맷 미할당 (Payment Method → DMEE tree)

## ✅ Check
1. F110 → Status 탭 — 진행 단계 확인
2. FBZP → Bank Determination → Ranking Order
3. XK03 → 벤더 → Payment Transactions → 지급방법
4. DMEE → 해당 Tree 활성화 상태

## 🛠 Fix
(생략)

## 📖 SAP Note
- 데이터셋에 해당 Note가 있으면 언급, 없으면 "SAP Support Portal 검색 필요"로 답변
```

## 팁

### `.codexrc` 설정
프로젝트 루트에 `.codexrc` (존재 시):
```yaml
default_context:
  - AGENTS.md
  - sapstack/AGENTS.md  # submodule
  - .sapstack/config.yaml  # 환경 프로필
```

### 비대화형 실행
```bash
echo "F110 DME 생성 실패 원인 Top 3" | codex --stdin
```

### 특정 SKILL.md 직접 전달
```bash
codex --read sapstack/plugins/sap-fi/skills/sap-fi/SKILL.md \
      --read sapstack/plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md \
      "한국어로 AFAB Test Run 체크리스트를 만들어주세요"
```

## 알려진 제약

- Codex CLI는 슬래시 커맨드 네이티브 지원 없음 → 프롬프트에 명시적으로 지시
- Task 도구 없음 → 여러 에이전트 병렬 위임 불가
- 키워드 자동 활성화 없음 → 관련 SKILL.md를 직접 지시해야 함

## 관련
- [AGENTS.md](../../AGENTS.md) — Codex용 지침 본체
- [multi-ai-compatibility.md](../multi-ai-compatibility.md) — 전체 비교
