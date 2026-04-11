---
description: |
  기존 Evidence Loop 세션에 새 증거 Bundle을 추가합니다. Turn 1의 초기 증거
  보충 또는 Turn 3의 Follow-up Request 응답으로 사용합니다. 파일 해시 자동 계산,
  민감 필드 redaction 검사, Follow-up Request의 체크와 매핑.
argument-hint: "<session_id> <파일1> [파일2 ...] [--bundle <bundle.yaml>] [--role operator|end_user|consultant]"
plugin: sap-session
---

# /sap-session-add-evidence — 세션에 Bundle 추가

입력: `$ARGUMENTS`

현재 세션 상태에 따라 이 커맨드의 행동이 달라집니다:

| 현재 상태 | 이 커맨드의 역할 |
|---|---|
| `intake` | 초기 증거 Bundle 추가 (Turn 1 연장) |
| `awaiting_evidence` | Follow-up Request 응답 Bundle 추가 (Turn 3) |
| `reopened` | 재조사 증거 추가 |
| 그 외 | **거부** — 다른 커맨드 안내 |

## 🧭 동작 단계

### 1. 세션 유효성 검증
- `session_id`로 `.sapstack/sessions/{id}/state.yaml` 로드
- 상태가 Bundle 수용 가능한지 확인 (위 표)
- 위반 시 명확한 에러 메시지 + 다음 정당한 커맨드 안내

### 2. 파일 전처리

각 입력 파일에 대해:

1. **파일 존재 확인** + 상대 경로 정규화
2. **크기 체크**
   - 4KB 이하 텍스트 → `inline_content` 후보
   - 그 외 → `files/` 하위 복사
3. **SHA-256 해시 계산**
4. **kind 자동 감지** (sap-session-start의 감지 로직과 동일)
5. **민감 필드 자동 스캔**:
   - CSV에서 컬럼명 기준: `STCD1`, `STCD3`, `BANKN`, `KONTO`, `SY-UNAME`, `BNAME`
   - 텍스트에서 패턴 기준: 주민번호 형식(`\d{6}-\d{7}`), 카드번호(`\d{4}-\d{4}-\d{4}-\d{4}`)
   - 발견 시 운영자에게 **경고**하고 계속할지 확인 (또는 `--force`로 우회)
6. **기본 source 추론**
   - 파일명에 `lfb1`, `bkpf` 등 테이블명이 있으면 `source.type: table`
   - `f110`, `migo` 등 T-code 패턴이면 `source.type: tcode`
   - 감지 실패 시 운영자에게 질문 (T-code/테이블/기타)

### 3. Bundle YAML 생성

`--bundle` 플래그로 사전 작성된 YAML을 주면 그걸 검증 후 사용. 없으면
감지된 정보로 Bundle YAML 자동 생성:

```yaml
bundle_id: evb-{YYYYMMDD}-{6-char}
session_id: sess-...
turn_number: {from state.current_turn_number}
collected_at: {ISO 8601, 운영자 제공 or now}
collected_by:
  role: {flag or state.created_by.role}
  sap_user_redacted: true
sap_context:
  {from state.sap_context}
items:
  - item_id: evi-001
    kind: {auto-detected}
    source: {auto-detected or asked}
    path: files/{filename}
    content_hash: sha256:...
    redacted_fields: [...]  # 감지된 것
    captured_at: {...}
    tags: [...]
```

### 4. 스키마 검증

생성된 Bundle YAML을 `schemas/evidence-bundle.schema.yaml`에 대해 검증.
실패 시 운영자에게 구체적 위반 필드와 수정 방법 제시.

### 5. Follow-up Request 체크 매핑 (`awaiting_evidence`만)

현재 상태가 `awaiting_evidence`면 `pending_followup_request_id`로 요청을 로드하고
각 체크(`checks[]`)를 새 Bundle의 아이템과 매칭:

- **매칭 기준**:
  - `action.type == query_table` + `action.table == item.source.table` → 매칭
  - `action.type == capture_screenshot` + 같은 `tcode` → 매칭
  - `action.type == read_dump` + `item.kind == dump_st22` → 매칭
  - 모호하면 운영자에게 묻기
- **커버리지 리포트**:
  - critical 체크 미매칭이 있으면 **경고**
  - 모든 critical + high가 매칭되면 자동으로 `status: verifying` 전환 준비

### 6. 상태 업데이트

- `bundles/evb-*.yaml` 저장
- `files/` 아래 원본 복사
- `state.yaml`에 Bundle 추가:
  - `bundles[]`에 직렬화된 내용 추가 (또는 `$ref`)
  - `turns[]`의 현재 턴(Turn 1 또는 Turn 3)의 `artifact_refs.bundle_ids`에 append
  - `audit_trail`에 `bundle_added` 이벤트 기록
- 커버리지 조건 충족 시 `status: awaiting_evidence → verifying`
- `last_updated_at` 갱신

### 7. 출력

```markdown
## 📥 Evidence Added — Bundle evb-20260412-d9p2xr

**세션**: sess-20260412-m2p9xt (turn 3, awaiting_evidence → verifying)

### 📋 수집된 아이템
- evi-001: `table_export` from `LFB1` (lfb1-vendor-100234.csv, 2.3 KB)
  - redacted_fields: [STCD1, STCD3]
  - ✓ 스키마 준수
- evi-002: `screenshot` from FBZP (fbzp-bank-det.png, 487 KB)
  - ✓ 스키마 준수

### 📊 Follow-up Request 매핑 (flr-20260412-b8m2nc)
| Check | Priority | Status |
|---|---|---|
| chk-001 LFB1.ZWELS 확인 | critical | ✅ matched evi-001 |
| chk-002 FBZP 뱅크 매핑 | high | ✅ matched evi-002 |
| chk-003 ST22 덤프 검색 | medium | ⚠️ missing |

**chk-003(medium)이 미수집**이지만, critical·high는 모두 확보되어
Verify 턴으로 진행 가능합니다.

### ⏭ 다음 단계
`/sap-session-next-turn sess-20260412-m2p9xt` → Turn 4 (Verify)
```

## ⚠️ 안전 규칙

- **민감 필드 자동 차단**: 주민번호·카드번호 패턴이 감지되면 업로드 거부
  (overrideable with `--force` + 운영자 명시 확인)
- **파일 절대 경로 금지**: 항상 세션 상대 경로로 저장
- **덮어쓰기 금지**: 같은 `bundle_id`가 이미 있으면 새 ID 생성
- **세션 잠금**: 다른 프로세스가 같은 세션을 쓰고 있으면 대기
  (`.sapstack/sessions/{id}/.lock` 파일)

## 🧪 예시

### 예 1 — Turn 3 응답 (가장 흔한 경우)
```bash
/sap-session-add-evidence sess-20260412-m2p9xt \
  ~/Downloads/lfb1-vendor-100234.csv \
  ~/Downloads/fbzp-bank-det.png
```

### 예 2 — 수동 Bundle YAML
```bash
/sap-session-add-evidence sess-20260412-m2p9xt \
  --bundle ./crafted-bundle.yaml \
  ~/Downloads/st22-dump.txt
```

### 예 3 — 엔드유저 역할
```bash
/sap-session-add-evidence sess-20260412-m2p9xt \
  ~/screenshots/migo-error.png \
  --role end_user
```
→ `collected_by.role: end_user`로 기록되어 Mode 2(Evidence Loop)의 추가 redaction 정책 적용.

## 📚 참조

- `plugins/sap-session/skills/sap-session/references/evidence-bundle-guide.md` — 운영자 가이드
- `plugins/sap-session/skills/sap-session/references/turn-formats.md` — Turn 3 포맷
- `schemas/evidence-bundle.schema.yaml` — Bundle 스키마
- `schemas/followup-request.schema.yaml` — 요청과의 매핑
