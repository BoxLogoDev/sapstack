# Aider 사용 예시

> sapstack을 Aider CLI에서 쓰는 실전 세션.

## 설치

### 1. Aider 설치
```bash
pip install aider-chat
# 또는
pipx install aider-chat
```

### 2. sapstack 추가
```bash
cd your-project
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
```

### 3. `.aider.conf.yml` 설정

프로젝트 루트에:
```yaml
# .aider.conf.yml
model: claude-sonnet-4-5

read:
  - sapstack/CONVENTIONS.md
  - sapstack/AGENTS.md

auto-commits: false   # sapstack은 품질 게이트 통과 후 수동 커밋 권장

lint-cmd:
  - bash sapstack/scripts/lint-frontmatter.sh
  - bash sapstack/scripts/check-marketplace.sh
  - bash sapstack/scripts/check-hardcoding.sh --strict
  - bash sapstack/scripts/check-tcodes.sh --strict
```

## 기본 워크플로

### 시나리오 1 — 기본 세션
```bash
cd your-project
aider
```

Aider가 `.aider.conf.yml`의 `read:` 항목을 세션 시작 시 로드.

세션 내에서:
```
> sapstack 규칙에 따라 F110 DME 생성 실패 원인 Top 5 정리해줘
```

Aider가 Universal Rules + Response Format 적용 답변.

### 시나리오 2 — 특정 파일 편집
```bash
aider plugins/sap-fi/skills/sap-fi/SKILL.md
```

세션에서:
```
> AP 섹션에 "전자세금계산서 매입" 하위 섹션 추가. 기존 style 유지, ECC vs S/4 구분.
```

Aider가 diff 제안 → /y (yes) → 파일 수정 → lint-cmd 자동 실행 → 실패 시 수정 반복.

### 시나리오 3 — Multi-file 편집
```bash
aider plugins/sap-fi/skills/sap-fi/SKILL.md plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md
```

```
> 두 파일에 "GR/IR Aging by Vendor" 섹션을 동시에 추가. 영문과 한국어 동기화.
```

### 시나리오 4 — Rule 기반 새 파일 생성
```bash
aider
```

```
> /add plugins/sap-new-module/skills/sap-new-module/SKILL.md
> sapstack CONVENTIONS.md 규칙에 따라 sap-xxx 플러그인 SKILL.md 템플릿을 작성해줘
```

Aider가 규칙 준수하는 골격 생성.

## 실제 출력 예시

```
> sapstack 규칙에 따라 AFAB 덤프 진단해줘

Aider: sapstack Universal Rules 적용합니다.

## 🔍 Issue
AFAB 감가상각 실행 중 덤프 발생 — 세부 Runtime Error 확인 필요

## 🧠 Root Cause (가능성 순)
1. DBIF_RSQL_SQL_ERROR — HANA plan cache
2. CONVT_CODEPAGE — 한글 Unicode 이슈
3. 자산 마스터 데이터 불일치 — ANLA/ANLB 참조 끊김

## ✅ Check
1. ST22 → 덤프 상세
2. ST05 → SQL trace (Test Run)
3. FAA_CMP_LEDGER (S/4 parallel ledger)

## 🛠 Fix
(단계별)

## 📖 SAP Note
- 1835730
- 2452523 (Unicode 이슈인 경우)
- 2165213 (S/4 New Asset Accounting)

파일 수정 필요한 사항이 있나요?
```

## 고급 활용

### Lint 자동 재시도
Aider는 `lint-cmd` 실패 시 자동으로 AI에게 수정 요청합니다:
```
Aider: lint failed:
❌ [plugins/sap-xxx/.../SKILL.md] description 길이 1089자 (최대 1024자)

Aider는 이 오류를 해결하기 위해 description을 축약합니다...
```

### Git 통합
```bash
aider --commit
```
또는 자동 커밋 활성화 (권장하지 않음 — sapstack은 수동 commit 권장).

### 모델 전환
```bash
aider --model gpt-4o
aider --model claude-sonnet-4-5
aider --model ollama/llama3
```

## 팁

### 한국어 답변
```
aider --message "한국어로 답변해. sapstack 규칙 준수."
```
또는 세션에서 `/preferences language ko`.

### 컨텍스트 포함/제외
```
/add SKILL.md            # 컨텍스트 추가
/drop SKILL.md           # 컨텍스트 제거
/ls                      # 현재 컨텍스트 파일 목록
```

### 품질 게이트 강제
`.aider.conf.yml`의 `lint-cmd`가 실패하면 Aider는 자동으로 수정 반복 → **품질 보장**.

## 알려진 제약

- Aider는 **코드 편집 중심** — 순수 Q&A는 다른 도구가 나을 수 있음
- 에이전트 개념 없음
- 슬래시 커맨드는 Aider 자체만 (`/add`, `/drop`, `/commit`)
- 큰 저장소에서 context limit 빠르게 도달

## 관련
- [CONVENTIONS.md](../../CONVENTIONS.md) — Aider용 지침 본체
- [Aider 공식](https://aider.chat/)
