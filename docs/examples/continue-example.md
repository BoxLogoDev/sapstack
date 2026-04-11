# Continue.dev 사용 예시

> sapstack을 VS Code / JetBrains의 Continue.dev 확장에서 쓰는 실전 세션.

## 설치

### 1. Continue 확장 설치
VS Code Marketplace에서 **Continue** 검색 → 설치.

### 2. sapstack 지침 연결

```bash
cd your-project
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
```

VS Code에서 Continue 설정 파일(`~/.continue/config.json`) 편집:

```json
{
  "models": [...],
  "rules": [
    {
      "name": "sapstack-universal",
      "file": "./sapstack/.continue/config.yaml"
    }
  ],
  "contextProviders": [
    {
      "name": "file",
      "params": { "path": "sapstack/AGENTS.md" }
    },
    {
      "name": "folder",
      "params": {
        "folder": "sapstack/plugins",
        "pattern": "**/SKILL.md"
      }
    }
  ]
}
```

또는 프로젝트 로컬 `.continue/config.yaml`을 submodule과 심볼릭 링크:
```bash
ln -s sapstack/.continue/config.yaml .continue/config.yaml
```

## 기본 워크플로

### 시나리오 1 — Continue Chat

Continue panel(Ctrl+L)에서:
```
sapstack 규칙 따라 AFAB 테스트런 중 DBIF_RSQL_SQL_ERROR 덤프 진단해줘
```

Continue가 `sapstack/.continue/config.yaml`의 rules를 시스템 프롬프트에 주입.

### 시나리오 2 — @ 컨텍스트 참조

```
@sap-fi MIRO 세금코드 이슈 분석해줘
```

Continue가 sapstack SKILL.md를 컨텍스트로 포함.

### 시나리오 3 — 파일 편집

특정 파일 선택 후 Continue Edit:
```
이 ABAP 프로그램을 sapstack Clean Core 원칙에 따라 리팩토링해줘
```

## 실제 출력 예시

```markdown
## 🔍 Issue
AFAB Test Run 중 DBIF_RSQL_SQL_ERROR 덤프

## 🧠 Root Cause
1. HANA plan cache 오염
2. 특정 자산 데이터 불일치 (ANLA/ANLB)
3. Parallel ledger 불일치 (S/4)

## ✅ Check
1. ST22 → 덤프 세부 → Source position
2. SE16 → ANLA 해당 자산
3. FAA_CMP_LEDGER (S/4)

## 🛠 Fix
Case A: HANA plan cache clear (Basis 권한)
Case B: 문제 자산 격리 → AW01N 개별 조사

## 📖 SAP Note
- 1835730 (DBIF_RSQL_SQL_ERROR HANA)
- 2327584 (Root Cause Analysis)
```

## 팁

### 모델 선택
Continue는 여러 LLM 지원 (Claude, GPT, local). SAP 지식은 **Claude 3.5+ / GPT-4+** 권장:

```json
{
  "models": [
    {
      "title": "Claude Sonnet 4.5 (SAP)",
      "provider": "anthropic",
      "model": "claude-sonnet-4-5"
    }
  ]
}
```

### 로컬 모델과의 호환
- Llama 3, CodeLlama 등 로컬 모델도 사용 가능
- sapstack Universal Rules은 프롬프트 엔지니어링이라 **모델 중립적**
- 단, 작은 모델은 `Response Format` 준수율이 떨어짐

### 프로젝트별 컨텍스트
`.continue/config.yaml`을 프로젝트 루트에 두면 해당 프로젝트에만 적용.

## 알려진 제약

- Continue는 v1.4.0 기준 **에이전트 개념** 없음 → 복잡 다단계는 프롬프트에 명시
- 슬래시 커맨드는 Continue 자체 (`/edit`, `/comment` 등) 외 커스텀 어려움
- Indexing 느림 (큰 저장소)

## 관련
- [.continue/config.yaml](../../.continue/config.yaml) — sapstack config
- [Continue.dev 공식](https://continue.dev/)
