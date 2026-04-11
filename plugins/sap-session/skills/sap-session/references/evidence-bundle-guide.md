# Evidence Bundle Guide — 운영자를 위한 증거 준비 실무서

이 문서는 `schemas/evidence-bundle.schema.yaml`의 **운영자 버전 안내서**입니다.
스키마가 "무엇을 넣을 수 있는지"라면, 이 가이드는 "어떻게 잘 넣는지"입니다.

---

## 🎯 Bundle이란 무엇인가

**Evidence Bundle = 한 턴에서 운영자가 수집한 증거 모음**.

하나의 Bundle은 여러 아이템(item)을 담을 수 있어요. 예를 들어 F110 실패를
조사한다면 한 Bundle에 다음을 함께 넣을 수 있습니다:

- F110 실행 로그 텍스트 (evi-001: transaction_log)
- LFB1 벤더 마스터 CSV 익스포트 (evi-002: table_export)
- FBZP 은행 결정 스크린샷 (evi-003: screenshot)
- 사용자의 원래 티켓 텍스트 (evi-004: email_thread)

AI는 이 Bundle 전체를 한 번에 본다고 가정하고 가설을 세웁니다.
**아이템이 많아야 좋은 것이 아니라, 가설을 검증할 수 있는 최소 집합이면 충분**합니다.

---

## 🧭 좋은 Bundle의 원칙

### 1. 출처를 항상 명시하세요

스키마의 `source` 필드는 선택이 아니라 **필수 습관**입니다. 나중에 감사하거나
다른 운영자가 이어받을 때 "이 데이터가 어디서 왔지?"를 바로 알 수 있어야 해요.

```yaml
- item_id: evi-001
  kind: table_export
  source:
    type: table
    table: LFB1
    tcode: SE16N  # 또는 SE16, SE11 browse
  path: files/lfb1-vendor-100234.csv
```

나쁜 예: `source: { type: other }` + 설명 없음 → 감사 시 재구성 불가.

### 2. 민감 필드는 미리 redaction

한국에서 LFB1 dump를 통째로 올리면 `STCD1`(사업자번호), `STCD3`(주민번호)이
함께 나옵니다. 이런 필드는 **업로드 전 마스킹**하고 `redacted_fields`에 기록하세요.

```yaml
redacted_fields: [STCD1, STCD3, LFBK.BANKN]
```

마스킹 방법: SE16N에서 Layout 편집으로 해당 컬럼 숨김 → CSV 익스포트. 또는
엑셀에서 열 삭제 후 재저장. AI는 redaction을 신뢰하므로 **실수로 삭제하지
않았는데 플래그만 세우면 안 됩니다**.

### 3. 작은 텍스트는 inline, 큰 파일은 path

- **4KB 이하의 에러 메시지·로그**: `inline_content`에 직접 붙여넣기
- **CSV, XLSX, PNG**: `.sapstack/sessions/{id}/files/` 아래 상대 경로로 저장

inline을 남용하면 `state.yaml`이 비대해져서 git diff가 지저분해져요.
큰 파일은 반드시 별도 경로에.

### 4. 스크린샷은 OCR 가능한 해상도

Fiori나 SAP GUI 스크린샷을 올릴 때 **최소 1200px 가로 해상도**를 유지하세요.
AI가 읽어낼 수 있어야 하고, 운영자가 나중에 봐도 읽을 수 있어야 합니다.

- GUI: `Ctrl+Y` → 전체 화면 또는 해당 프레임만
- Fiori: 브라우저 DevTools → Cmd/Ctrl+Shift+P → "Capture full size screenshot"
- 화면 일부만 필요하면 Snipping Tool로 관련 영역만

민감 정보(사용자명, 금액)가 포함되면 모자이크 후 업로드.

### 5. 턴마다 Bundle 하나 (권장)

원칙적으로 **한 턴 = 한 Bundle**입니다. 여러 시간대의 증거를 섞어 한 Bundle에
넣으면 시간순 추론이 어려워져요. 중간에 추가 증거가 생기면 다음 턴에 새 Bundle을
만드세요.

예외: Turn 1 intake에서는 "초기 증거 한 묶음"으로 여러 종류를 섞어도 OK.

---

## 🧱 kind 선택 가이드

| 증거 | kind | 언제 사용 |
|---|---|---|
| SE16N 결과 | `table_export` | 테이블을 직접 조회했을 때 |
| SAP GUI 화면 | `screenshot` | GUI 트랜잭션의 화면을 캡처 |
| Fiori 화면 | `screenshot` 또는 `fiori_page_html` | 화면은 screenshot, 원본 HTML이면 후자 |
| F110 로그 | `transaction_log` | 트랜잭션 실행 결과 로그 |
| ST22 덤프 | `dump_st22` | 런타임 덤프 텍스트 |
| SM21 로그 | `system_log_sm21` | 시스템 로그 추출 |
| SM50 WP 상태 | `work_process_sm50` | 워크 프로세스 스냅샷 |
| ST05/SAT | `short_dump_trace` | 퍼포먼스 트레이스 |
| 에러 메시지 | `message_text` | 사용자가 본 빨간 메시지 |
| 티켓/이메일 | `email_thread` | ServiceNow/Jira/Outlook 원문 |
| 관찰 메모 | `custom_note` | "재시도했더니 됐어요" 같은 관찰 |

---

## 📂 파일 배치 규칙

```
.sapstack/sessions/sess-20260411-m2p9xt/
├── state.yaml                           # 세션 상태 (스키마: session-state)
├── bundles/
│   ├── evb-20260411-a7k3qz.yaml         # Bundle 메타 (스키마: evidence-bundle)
│   └── evb-20260411-d9p2xr.yaml
├── hypotheses/
│   ├── h-001.yaml
│   ├── h-002.yaml
│   └── h-003.yaml
├── requests/
│   └── flr-20260411-b8m2nc.yaml
├── verdicts/
│   └── vdc-20260411-c4n8qw.yaml
└── files/                               # 실제 바이너리/대용량 파일
    ├── f110-log.txt
    ├── lfb1-vendor-100234.csv
    ├── fbzp-bank-det.png
    └── ...
```

**files/** 아래는 절대 경로 대신 **bundle.items[].path가 가리키는 상대 경로**로만
접근하세요. 세션을 다른 머신으로 옮겨도 그대로 작동합니다.

---

## 🔐 민감정보 기본 규칙 (한국·EU)

### 절대 업로드 금지
- 비밀번호·API 키·OAuth 토큰
- 공인인증서 파일 (`.p12`, `.pfx`)
- 고객 개인정보 raw dump (주민번호·여권번호)
- `.env`·`credentials.json`

### 기본 마스킹
- `SY-UNAME` (실제 사용자 ID) — handle로 대체
- `STCD1`, `STCD3` (사업자/주민번호)
- `LFBK.BANKN`, `KNBK.BANKN` (은행 계좌번호)
- 금액 필드는 판단해서 마스킹 (내부 감사와 상충 가능)

### 로컬라이제이션 특화
- 🇰🇷 한국: 전자세금계산서 승인번호 — 필요 시 마지막 4자리만
- 🇪🇺 EU: GDPR 대상 PII — Pseudonymization 권장
- 🇩🇪 독일: ELSTER ID — 마스킹 필수
- 🇯🇵 일본: My Number — 업로드 자체 금지

---

## ⏱ 시간 기록

`collected_at`은 증거를 **수집한 시점** (SAP에서 뽑아낸 시각)이지,
업로드한 시각이 아닙니다. 어제 뽑아놨다가 오늘 올리는 경우 어제 시각을 유지하세요.
이게 AI의 타임라인 추론에 결정적입니다.

SAP는 서버 타임존을 따를 때가 많습니다. `+09:00` 같은 ISO 8601 오프셋을 붙이거나,
`Z` (UTC)로 통일하세요.

---

## 🧪 Bundle 검증 체크리스트 (업로드 전 자가점검)

- [ ] 모든 item에 `source` 있음
- [ ] 모든 민감 필드가 마스킹되거나 `redacted_fields`에 기록됨
- [ ] 파일 경로는 상대 경로 (`files/...`)
- [ ] 스크린샷은 1200px 이상
- [ ] `collected_at`이 실제 수집 시점
- [ ] `sap_context`의 release·client·country_iso가 기입됨
- [ ] 큰 binary는 `inline_content`에 넣지 않았음
- [ ] (해당 시) `LFBK`·은행코드·계좌번호 마스킹 완료

점검이 끝나면 커맨드로 업로드:

```bash
/sap-session-add-evidence sess-{id} \
  --bundle bundles/evb-20260411-new.yaml \
  --files files/new-f110-log.txt files/new-lfb1.csv
```
