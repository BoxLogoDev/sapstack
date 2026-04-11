---
description: |
  Evidence Loop 세션을 시작합니다. 초기 증상을 받아 session_id를 발급하고
  .sapstack/sessions/{id}/state.yaml을 생성합니다. Turn 1 INTAKE 수행.
argument-hint: "<증상 설명> [--country kr|de|us|jp] [--release ECC6_EhP7|S4_2022|...]"
plugin: sap-session
---

# /sap-session-start — 새 Evidence Loop 세션 시작

입력: `$ARGUMENTS`

이 커맨드는 [Evidence Loop](../plugins/sap-session/skills/sap-session/SKILL.md)의
**Turn 1 INTAKE**를 수행합니다. 라이브 SAP 접근 없이 운영자가 가져온 증거를
기반으로 진단을 시작하는 엔트리 포인트입니다.

## 🧭 동작 단계

### 1. 인자 파싱
- **포지셔널 인자**: 증상 설명 (최대 2000자). 자유 텍스트.
- **옵션 플래그**:
  - `--country {iso}` — ISO 3166-1 alpha-2 (kr, de, us, jp, ...). `config.yaml`에
    기본값 있으면 생략 가능.
  - `--release {code}` — ECC6_EhP7, S4_2022 등. 스키마의 enum 참조.
  - `--deployment {on_premise|private_cloud|public_cloud}`
  - `--language {ko|en|...}` — 세션 전체 언어
  - `--intake-files <path>...` — 초기 Evidence Bundle 파일들 (선택적)
  - `--reporter-role {end_user|operator|consultant}`

### 2. 세션 ID 생성
```
sess-{YYYYMMDD}-{6자리 영숫자}
```
예: `sess-20260412-m2p9xt`

### 3. 파일 시스템 준비
```
.sapstack/sessions/{session_id}/
├── state.yaml           ← 새로 생성
├── bundles/             ← 빈 디렉토리
├── hypotheses/          ← 빈 디렉토리
├── requests/            ← 빈 디렉토리
├── verdicts/            ← 빈 디렉토리
└── files/               ← 빈 디렉토리
```

### 4. `state.yaml` 초기화

`schemas/session-state.schema.yaml`에 따라 다음 필드를 채워 새 파일 작성:

- `session_id`, `schema_version: "1.0.0"`, `created_at`, `last_updated_at`
- `created_by.role` (기본값: operator)
- `originating_surface: cli`
- `status: intake`
- `initial_symptom`:
  - `description`: 파싱된 포지셔널 인자
  - `reporter_role`: 플래그 or 기본값
  - `language`: 플래그 or 기본값 (config.yaml → ko)
  - `country_iso`: 플래그 or config.yaml 기본값
  - `matched_symptom_index_entry`: `data/symptom-index.yaml`과 fuzzy 매칭된 ID (매칭 없으면 null)
- `sap_context`: 플래그와 config.yaml 병합
- `turns`:
  - 첫 엔트리: `turn_number: 1`, `turn_type: intake`, `status: active`, `surface: cli`
- `current_turn_number: 1`
- `audit_trail`:
  - 첫 엔트리: `session_created`

### 5. 초기 Bundle 처리 (선택적)

`--intake-files`가 제공되면 즉시 Bundle 1개를 생성해 `bundles/evb-*.yaml`로
저장하고, 각 파일을 `files/` 아래로 복사하며 SHA-256 해시를 계산해
`evidence-bundle.schema.yaml`에 맞는 메타데이터를 작성합니다.

자동 감지:
- `.txt`, `.log` → `kind: transaction_log` 또는 `message_text`
- `.csv`, `.xlsx` → `kind: table_export`
- `.png`, `.jpg` → `kind: screenshot`
- `.html` → `kind: fiori_page_html`

감지가 애매하면 `kind: custom_note`로 두고 운영자에게 교정 요청.

### 6. symptom-index 매칭 시도

`data/symptom-index.yaml`(Slice 3에서 작성)에서 증상 텍스트와 fuzzy 매칭.
매칭된 엔트리가 있으면:
- `matched_symptom_index_entry` 필드 채움
- 엔트리의 `first_check_tcodes`와 `evidence_needed`를 **Turn 2 Hypothesis
  턴의 힌트**로 세션에 첨부 (hidden field `_symptom_hints`)

### 7. Universal Rules 준수 확인

CLAUDE.md의 Universal Rule #2에 따라, `sap_context`의 필수 필드
(`release`, `deployment`, `client`)가 비어 있으면 운영자에게 질문:

```
다음 환경 정보가 필요합니다:
- SAP Release: ECC 6.0 (어느 EhP?) 또는 S/4HANA (어느 릴리스 연도?)
- 배포: on-premise / RISE / Public Cloud?
- 클라이언트 번호 (예: 100, 200, ...)
- 업종 (Manufacturing / Retail / Financial Services / ...)
```

이 정보가 모두 수집될 때까지 Turn 1을 `active` 상태로 유지. Bundle만 받고
Hypothesis 턴(Turn 2)으로 넘어가지 않음.

## 📤 출력

```markdown
## 🎯 Session Started: sess-20260412-m2p9xt

**초기 증상**: F110 돌렸는데 벤더 100234 하나만 "No valid payment method" 뜸
**매칭 symptom**: sym-f110-no-payment-method (신뢰도 0.82)
**언어**: ko · **국가**: 🇰🇷 kr
**환경**: S/4HANA 2022 · on-premise · client 100

### 📋 초기 증거 (Bundle evb-20260412-a7k3qz)
- evi-001: transaction_log (F110 로그) — source: tcode F110
- evi-002: table_export (LFB1 dump) — source: table LFB1

### ⏭ 다음 단계
`/sap-session-next-turn sess-20260412-m2p9xt` 돌리면 AI가 가설 2~4개 + Follow-up Request를 만듭니다.
```

## ⚠️ 금지 사항

- **Turn 1에서 가설 제안 금지** — 그건 Turn 2의 몫입니다.
- **Fix 제안 금지** — 너무 이릅니다.
- 증상 설명이 한 줄짜리라면 반드시 운영자에게 더 상세한 설명을 요청.
- `state.yaml`이 이미 존재하면 **덮어쓰지 말고** 운영자에게 `resume` 명령 안내.

## 🧪 예시

### 예 1 — 최소 호출
```bash
/sap-session-start "F110 돌렸는데 벤더 100234 하나만 No valid payment method 뜸"
```
→ 환경 질문 후 session_id만 발급. Bundle은 이후 add-evidence로 추가.

### 예 2 — Bundle과 함께
```bash
/sap-session-start "미고에서 입고 친 뒤 MMBE 스탁이 안 맞아요" \
  --country kr --release S4_2022 \
  --intake-files ~/Downloads/migo.png ~/Downloads/mseg.csv
```

### 예 3 — 엔드유저 웹에서 에스컬레이션
```bash
/sap-session-start "$(cat handoff-payload.md)" \
  --reporter-role end_user \
  --intake-files handoff-screenshot.png
```
웹 포털(Surface C)에서 복사된 Markdown 페이로드를 그대로 넣는 용도.

## 📚 참조

- `plugins/sap-session/skills/sap-session/SKILL.md` — Evidence Loop 전체
- `plugins/sap-session/skills/sap-session/references/turn-formats.md` — Turn 1 포맷
- `schemas/session-state.schema.yaml` — state.yaml 스펙
- `schemas/evidence-bundle.schema.yaml` — Bundle 스펙
- `data/symptom-index.yaml` (Slice 3) — symptom 매칭 소스
