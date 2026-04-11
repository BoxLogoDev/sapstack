# GitHub Copilot 사용 예시

> sapstack을 VS Code GitHub Copilot Chat에서 쓰는 실전 세션.

## 설치

sapstack 저장소를 프로젝트에 clone 또는 submodule로 추가하면 `.github/copilot-instructions.md`가 자동 로드됩니다.

```bash
# Option A: 저장소 자체를 clone
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack
code .  # VS Code 열기

# Option B: 기존 프로젝트에 지침만 복사
mkdir -p .github .github/instructions
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.github/copilot-instructions.md
curl -o .github/instructions/abap.instructions.md \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.github/instructions/abap.instructions.md
# (yaml, markdown instructions도 동일)
```

## 기본 워크플로

### 시나리오 1 — Copilot Chat에서 자연어 질문

VS Code에서 Copilot Chat 패널 열고:

```
@workspace sapstack 규칙에 따라 MIRO에서 세금코드가 안 잡히는 이슈를 진단해줘.
환경: S/4HANA 2023, on-premise.
```

**일어나는 일**:
1. Copilot이 `.github/copilot-instructions.md` 자동 로드
2. `@workspace`가 SAP 관련 파일 컨텍스트 수집
3. Universal Rules + Response Format 적용
4. 구조화된 답변

### 시나리오 2 — ABAP 파일 편집 중 인라인 제안

`Z_CUSTOM_REPORT.abap` 파일 편집 중 Copilot이 `.github/instructions/abap.instructions.md` 자동 적용:

```abap
" Copilot 제안:
" - SELECT *를 피하고 필요 필드만
" - LOOP 안의 SELECT 금지
" - Clean Core: 표준 SAP 객체 수정 금지
" - 한국 개인정보 로그 출력 금지

SELECT matnr, maktx, mtart  " ✓ 필요 필드만 (Copilot이 * 대신 제안)
  FROM mara
  INTO TABLE @DATA(lt_mara)
  WHERE mtart = @lv_type.

LOOP AT lt_mara INTO DATA(ls_mara).
  " ... processing ...
ENDLOOP.
```

### 시나리오 3 — Copilot Edits (multi-file)

```
/edits plugins/sap-fi/skills/sap-fi/ 에 "GR/IR aging by vendor" 섹션 추가.
기존 style 유지하고 ECC vs S/4HANA 차이 명시.
```

Copilot이 여러 파일에 걸친 edit 제안 → 검토 후 승인.

## 실제 출력 예시

````
## 🔍 Issue
MIRO 포스팅 시 세금코드(MWSKZ) 자동 결정 실패

## 🧠 Root Cause
위에서 언급한 Top 3 원인...

## ✅ Check
1. **ME23N** → Invoice tab
2. **OBBG** → 회사코드 Tax Procedure 할당 (Korean TAXKR)
3. **FTXP** → 세금코드 설정 확인

## 🛠 Fix
(단계별)

## 🛡 Prevention
- Vendor Master LFB1.MINDK 기본 세금
- Info Record 필수 조건

## 📖 SAP Note
- 3092819 (Korea Localization)
````

## 팁

### File-type 전용 지침 활용
sapstack은 `.github/instructions/` 디렉토리에 파일 타입별 세부 지침을 제공합니다:
- `abap.instructions.md` — ABAP 파일 편집 시
- `yaml.instructions.md` — YAML 파일 편집 시
- `markdown.instructions.md` — SKILL.md 편집 시

### `@workspace` vs 일반 Chat
- **일반 Chat**: Universal Rules만 적용
- **@workspace**: + 저장소 파일 컨텍스트 포함 (더 정확)

### Copilot Chat 세션 재시작
지침이 로드 안 되는 것 같으면:
```
Ctrl+Shift+P → Developer: Reload Window
```

## 알려진 제약

- Copilot Chat의 context window 제한 — sapstack 전체는 한 번에 못 실음
- 슬래시 커맨드 미지원 (자체 `/fix`, `/explain`은 있지만 sapstack용 커스텀 불가)
- 에이전트 위임 개념 없음
- 키워드 자동 활성화 없음

## 관련
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) — 본체 지침
- [.github/instructions/](../../.github/instructions/) — 파일 타입별
