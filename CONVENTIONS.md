# CONVENTIONS.md — sapstack (for Aider and similar AI tools)

> 이 파일은 **Aider** (https://aider.chat/) 및 `CONVENTIONS.md` 포맷을 지원하는 AI 코딩 도구에게 sapstack의 규칙을 전달합니다.
>
> Aider는 `aider --read CONVENTIONS.md` 또는 `.aider.conf.yml`의 `read:` 항목으로 이 파일을 읽어 session 내내 지침으로 사용합니다.

## 프로젝트 개요

**sapstack**은 SAP 운영 자문을 위한 플러그인 모음입니다. 13개 SAP 모듈(FI/CO/TR/MM/SD/PP/HCM/SFSF/ABAP/S4Migration/BTP/BASIS/BC)을 다룹니다. 같은 지식을 Claude Code/Codex/Copilot/Cursor/Continue.dev/Aider 6개 AI 도구에서 사용할 수 있도록 호환 레이어를 제공합니다.

Repo: https://github.com/BoxLogoDev/sapstack

---

## Universal Rules (SAP 답변의 절대 규칙)

1. **NEVER hardcode** company codes, G/L accounts, cost centers, or org units.
2. **ALWAYS ask** SAP release, deployment model, industry, company code before answering.
3. **ALWAYS distinguish** ECC vs S/4HANA behavior explicitly.
4. **Transport request** required for any config change.
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, F110.
6. **Never recommend SE16N** data edits in production.
7. **Always provide** T-code + SPRO menu path.
8. **Only cite verified** SAP Notes (from `data/sap-notes.yaml`).

---

## Response Format (SAP Issues)

```
## Issue
(Restate symptom)

## Root Cause
(Probable causes, probability-ordered)

## Check
1. [T-code] — what to check
2. [Table.Field] — data-level

## Fix
(Step-by-step)

## Prevention
(Config / process)

## SAP Note
(Only if in data/sap-notes.yaml)
```

---

## 코드 생성 규칙

### ABAP
- No `SELECT *` — specific fields only
- No SELECT inside LOOP — use FOR ALL ENTRIES or JOIN
- Clean Core: no modifications to standard SAP objects
- S/4HANA: no BSEG / MKPF / MSEG direct reads — use CDS views (I_JournalEntryItem, I_MaterialDocumentItem)
- Every BAPI call checks RETURN table for E/A messages
- AUTHORITY-CHECK on sensitive data
- Korean personal data (주민번호, 연락처) — mask in logs and UI

### YAML / Config
- Schema validation: `.sapstack/config.schema.yaml`
- Never hardcode company codes in examples — use `<YOUR_COMPANY_CODE>` placeholder
- Korean localization flags go under `korea:` block

### Markdown / SKILL.md
- Frontmatter mandatory: name, description (≤1024 chars, third-person, trigger keywords), allowed-tools
- description must list trigger keywords (T-codes, module names, 한국어 키워드)
- ECC vs S/4HANA differences must be explicit
- T-codes must exist in `data/tcodes.yaml` (check with `./scripts/check-tcodes.sh --strict`)

---

## Aider 워크플로 팁

### 권장 설정 (`.aider.conf.yml` 예시)

```yaml
# 프로젝트 루트에 배치
read:
  - CONVENTIONS.md
  - AGENTS.md
  - plugins/sap-fi/skills/sap-fi/SKILL.md   # 작업할 모듈 추가

auto-commits: false    # sapstack은 품질 게이트 통과 후 수동 커밋 권장

lint-cmd:
  - bash ./scripts/lint-frontmatter.sh
  - bash ./scripts/check-marketplace.sh
  - bash ./scripts/check-hardcoding.sh --strict
  - bash ./scripts/check-tcodes.sh --strict
```

### 사용 예시

```bash
# Aider 세션 시작
aider --read CONVENTIONS.md --read AGENTS.md \
      plugins/sap-fi/skills/sap-fi/SKILL.md

# 세션 내에서
> "MIRO 세금코드 미할당 이슈 진단 섹션을 추가해줘. Korean localization 맥락 포함."

# Aider가 Universal Rules와 Response Format을 따라 수정
```

---

## 데이터 자산

SAP 답변 시 다음 파일을 참조하세요:

- `data/tcodes.yaml` — 273개 확정 T-code. 여기 없는 T-code는 인용 금지 (오탈자 가능).
- `data/sap-notes.yaml` — 확정된 SAP Note 번호. 여기 없는 Note는 언급 금지 (추정 금지).

검색 도구:
```bash
./scripts/resolve-note.sh korea
./scripts/resolve-note.sh migration ACDOCA
grep -q "^FAGL_FC_VAL:" data/tcodes.yaml && echo "유효"
```

---

## 기여 프로세스

1. 작업 완료 후 로컬 품질 게이트 실행:
   ```bash
   ./scripts/lint-frontmatter.sh
   ./scripts/check-marketplace.sh
   ./scripts/check-hardcoding.sh --strict
   ./scripts/check-tcodes.sh --strict
   ./scripts/check-ko-references.sh   # v1.3.0 신규
   ./scripts/check-links.sh           # v1.3.0 신규
   ```
2. `CONTRIBUTING.md` 절차 따르기
3. PR 생성 → GitHub Actions CI 통과 → 리뷰 → 머지

---

## 추가 참조

- `README.md` — 사용자 가이드
- `CLAUDE.md` — Claude Code용 Universal Rules
- `AGENTS.md` — Codex CLI 호환 레이어
- `.github/copilot-instructions.md` — GitHub Copilot
- `.cursor/rules/sapstack.mdc` — Cursor
- `.continue/config.yaml` — Continue.dev
- `docs/multi-ai-compatibility.md` — 6개 AI 도구 사용 가이드 (가장 포괄적)
- `docs/architecture.md` — 3축 구조 설명
- `docs/environment-profile.md` — `.sapstack/config.yaml` 가이드
