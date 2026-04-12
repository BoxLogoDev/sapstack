# F110 Dog-Food Case — Evidence Loop 첫 검증 시나리오

**문서 상태**: dog-food scenario (not a real production incident)
**작성일**: 2026-04-12
**검증 대상**: `plugins/sap-session` v0.1.0 + `commands/sap-session-*` 3개
**비교 대상**: 기존 `commands/sap-payment-run-debug.md` (단발형 9단계 체크리스트)

---

## 🎯 이 문서의 목적

Evidence Loop가 **기존 단발형 커맨드와 비교해 진짜로 나은 결과**를 내는지
확인하는 자가 검증 시나리오. "조언봇 vs 루프"의 차이를 같은 입력에서
어떻게 드러나는지 기록합니다.

같은 시나리오를 두 가지 방식으로 풀어봅니다:

1. **Mode 1 — Quick Advisory**: 기존 `/sap-payment-run-debug`
2. **Mode 2 — Evidence Loop**: 새 `/sap-session-*` 3개 커맨드

---

## 🧪 시나리오 개요

**보고된 증상**: 월마감 D-1에 F110 돌렸는데 **벤더 100234 하나만 Proposal에서
튕김**. 에러 메시지: `No valid payment method found for vendor`.
나머지 147건은 정상으로 탔음.

**환경**:
- S/4HANA 2022, on-premise
- Client: 100
- Country: 🇰🇷 KR
- Company Code: 1000 (Korean legal entity)
- 최근 변경: 없다고 알고 있음

**배경**: 운영자 왈 "어제까지는 멀쩡했는데요". 한국 ACH 이체(페이먼트 메소드 'T', 즉 ZWELS='T') 사용.

---

## 📜 Mode 1 — Quick Advisory (기존 방식)

운영자가 단발 커맨드를 호출:

```bash
/sap-payment-run-debug 100234
```

### AI 응답 (한 번에 전체 답변)

```
## 🔍 진단 결과
- 증상: 벤더 100234 F110 Proposal 실패 "No valid payment method"
- Run 단계: Proposal
- 확률 높은 원인:
  1. 벤더 마스터의 ZWELS(페이먼트 메소드, LFB1) 공란 — 제일 흔함
  2. FBZP 뱅크 디터미네이션(Bank Determination)에 페이먼트 메소드 누락
  3. 하우스뱅크(HBKID) Account ID 매핑 누락

## 🛠 수정 단계
1. XK02 → 벤더 100234 → Payment transactions → ZWELS 확인
2. 필요 시 'T' 박기
3. FBZP → 뱅크 디터미네이션 점검

## 🛡 재발 방지
- 벤더 마스터 생성 시 ZWELS 필수 validation

## 📖 SAP Note / T-code
- F110, XK03, FBZP, FI12
```

### 이 응답의 문제점

- **확인 없이 바로 Fix 제안**: LFB1.ZWELS가 진짜 공란인지 AI는 모름. 그냥
  확률이 높다는 이유로 조언.
- **Rollback 없음**: 만약 ZWELS에 'T'를 넣었는데 그게 원인이 아니었다면?
  어떻게 되돌릴지 명시 없음.
- **운영자 컨텍스트 미반영**: "어제까지 정상이었다"는 증언이 답변에 반영되지
  않음. 어제-오늘 사이 무엇이 바뀌었는지 추적하지 않음.
- **Localization 무반응**: country=KR이 명시되었지만 한국 특화 관점(은행 코드
  체계, 전자세금계산서 연동) 언급 없음.
- **"조언봇" 느낌**: 운영자가 Fix를 시도해 실패해도 AI는 "한 번 더 시도해
  보세요" 정도만 할 수 있음. 가설 공간이 좁음.

**평가**: 운영자가 SAP를 잘 알면 출발점으로 유용. 하지만 "이 답이 맞는지
확인하고 아니면 다음 가설로 넘어가는" 루프가 없음.

---

## 🔁 Mode 2 — Evidence Loop (새 방식)

### Turn 1 — INTAKE

```bash
/sap-session-start "F110 돌렸는데 벤더 100234 하나만 'No valid payment method' 뜸. 어제까진 멀쩡했음" \
  --country kr --release S4_2022 --deployment on_premise \
  --intake-files ~/Downloads/f110-log.txt
```

#### AI 응답 (Turn 1 포맷)

```markdown
## 🎯 Session Started: sess-20260412-m2p9xt

**초기 증상**: F110 Proposal 실패 — 벤더 100234 한 건만 "No valid payment method"
  · 어제까지 정상이라는 운영자 증언
**매칭 symptom**: sym-f110-no-payment-method (신뢰도 0.87)
**언어**: ko · **국가**: 🇰🇷 kr
**환경**: S/4HANA 2022 · on-premise · client 100

### 📋 초기 증거 (Bundle evb-20260412-a7k3qz)
- evi-001: transaction_log (f110-log.txt, 1.2 KB)
  - source: tcode F110
  - 발췌:
    ```
    Run 2026-04-12 / Identification KR01
    Status: Proposal run ended with errors
    Error: No valid payment method found for vendor 100234
    Company code: 1000
    ```

### ❓ 추가 컨텍스트 질문
- Company Code 1000이 한국 법인인지 확인 부탁드립니다.
- 벤더 100234는 국내 벤더인가요, 해외 벤더인가요?
- "어제까지 정상"은 정확히 어제 몇 시까지인가요? (어제 마지막 F110 실행 시각)
- 어제~오늘 사이에 벤더 마스터나 FBZP 변경 이력이 있는지 아시나요? (CDHDR/CDPOS)

### ⏭ 다음 단계
질문에 답하신 뒤 `/sap-session-next-turn sess-20260412-m2p9xt` 실행.
```

**차이점 1**: 바로 답하지 않고 **컨텍스트를 먼저 묻습니다**. 특히 "어제까지
정상"이라는 증언을 활용해 "변경 이력 추적" 방향을 힌트로 제시.

---

### Turn 2 — HYPOTHESIS (운영자 답변 후)

운영자 답변: "KR 법인 맞고요, 국내 벤더고, 어제 17시까지는 정상이었어요.
변경이력은 아직 안 봤어요."

```bash
/sap-session-next-turn sess-20260412-m2p9xt
```

#### AI 응답

```markdown
## 🧩 Turn 2 — Hypothesis

### 📦 증거 요약
- Bundle 1 (evb-20260412-a7k3qz, 2026-04-12 09:10):
  - evi-001 transaction_log: F110 error "No valid payment method for vendor 100234"
- 운영자 증언: 어제 17:00까지 정상, 벤더는 KR 국내, 변경 이력 미확인

### 💡 가설 4개

#### H1 — 벤더 마스터 ZWELS(페이먼트 메소드, LFB1) 공란 [신뢰도: medium 0.55]
**statement**: 벤더 100234의 회사코드 1000에 대해 LFB1의 ZWELS 필드가
비어있어서 F110이 페이먼트 메소드 후보를 못 찾음.

**기술 체인**:
- F110 Proposal은 LFB1의 ZWELS를 읽어 후보 결정
- ZWELS 공란이면 뱅크 디터미네이션 이전 단계에서 드롭
- "No valid payment method" 에러로 튕김

**반증 조건**:
- `LFB1.ZWELS = 'T'` (또는 다른 유효 값) → 기각
- 다른 벤더들도 같은 에러 → 약화 (시스템 전역 문제 의심)

**관련 T-code/에이전트**: F110, XK03, FBZP · sap-fi-consultant
**신뢰도가 medium인 이유**: "어제까지 멀쩡"이 ZWELS 공란 가설과 잘 맞지 않음.
누가 일부러 지웠어야 말이 됨.

#### H2 — CDHDR 기반 최근 마스터 변경 [신뢰도: high 0.70]
**statement**: 어제 17시 이후 누가 XK02로 벤더 100234의 결제 관련 필드를
건드렸고 그 변경이 페이먼트 메소드를 무효화함.

**기술 체인**:
- CDHDR/CDPOS에 LFB1·LFA1·LFBK 변경 이력 남음
- ZWELS, ZAHLS, 또는 LFBK 행 중 하나가 원인일 가능성

**반증 조건**:
- CDHDR에 어제 17시 이후 100234 관련 변경 없음 → 기각
- 변경은 있으나 결제 관련 필드가 아님 → 기각

**관련**: F110, XK03, CDHDR, CDPOS · sap-fi-consultant, sap-basis-consultant
**가장 높은 이유**: "어제까지 멀쩡" 시간적 증언과 "한 건만" 튕기는 선택성이
모두 이 가설에 정합.

#### H3 — FBZP 뱅크 디터미네이션에서 페이먼트 메소드 빠짐 [신뢰도: low 0.25]
**statement**: 어제 FBZP 세팅 건드리면서 페이먼트 메소드 'T'가 회사코드 1000
뱅크 디터미네이션에서 빠졌을 수 있음.

**반증 조건**:
- 다른 벤더들은 'T'로 정상 처리됨 → 기각 (이 케이스에 해당)
- FBZP 변경 트포 이력 없음 → 기각

**관련**: FBZP, STMS · sap-fi-consultant
**신뢰도가 낮은 이유**: 나머지 147건이 정상이니 FBZP 자체는 멀쩡함.

#### H4 — 컨트롤 가설: 일시적 WP 문제 [신뢰도: low 0.10]
**statement**: SM50 워크 프로세스 이슈로 일시적 오류. 재시도만 해도 풀릴 수
있음.

**반증 조건**:
- F110 재시도 시 동일 에러 반복 → 기각 (확정적으로)

**관련**: SM50, SM21 · sap-basis-consultant
**컨트롤 가설 역할**: 진짜로 이게 맞으면 운영자는 15분도 안 걸려서 끝남.
그래서 Follow-up에 **가장 먼저** 재시도를 넣었음.

### ✅ 다음 확인 요청 (Follow-up Request flr-20260412-b8m2nc)
**예상 소요**: 22분 · **체크 5개**

| # | Priority | Purpose | Action | Est. | Format |
|---|---|---|---|---|---|
| chk-001 | critical | H4 기각 (또는 확정) — 재시도만 해보기 | F110 Proposal 재실행 (test only) | 5분 | text_paste |
| chk-002 | critical | H2 검증 — CDHDR에서 벤더 100234 변경 이력 | SE16N CDHDR OBJECTCLAS=KRED OBJECTID=100234 UDATE>=어제 | 4분 | csv_export |
| chk-003 | high | H1 + H2 검증 — 현재 LFB1 상태 | SE16N LFB1 LIFNR=100234 → ZWELS,ZAHLS,ERDAT,ERNAM | 3분 | csv_export |
| chk-004 | medium | H2 보강 — LFBK 은행 정보 존재 여부 | SE16N LFBK LIFNR=100234 | 3분 | csv_export |
| chk-005 | low | H3 검증 — FBZP 지급방법 정의 스크린샷 | FBZP → Payment methods in company code (KR1000) | 7분 | screenshot_png |

**순서 권장**: chk-001을 먼저 하세요. 만약 재시도로 해결되면 나머지 스킵 가능.

**에스컬레이션 힌트**: 없음 (모두 운영자 권한 범위)

### ⏭ 다음 단계
`/sap-session-add-evidence sess-20260412-m2p9xt <파일들>` → 증거 업로드
```

**차이점 2**: 4개 가설 + 각 가설의 반증 조건 + 컨트롤 가설 ("그냥 재시도만
해도 될 수 있음")이 동시에 제시됩니다. 운영자의 시간이 절약되고, AI의
자기기만이 줄어들어요.

---

### Turn 3 — COLLECT (운영자 수행)

운영자는 체크 5개 중 chk-001을 먼저 수행:

> F110 Proposal 재실행 결과: 동일 에러 "No valid payment method found for vendor 100234"
> → H4 확정적으로 기각. chk-001 결과를 텍스트로 저장.

이어 chk-002 (CDHDR 조회) 수행:

> CDHDR 결과: 어제 2026-04-11 17:42에 사용자 XYZ가 LFB1 변경. UNAME 마스킹.
> → CDPOS 드릴다운: 필드 ZWELS가 'T' → '' (공란)으로 변경됨. 변경 사유 필드 공란.
> **"어제까지 정상 → 어젯밤 사용자가 ZWELS를 지웠다"** 가 입증됨.

운영자는 나머지 체크를 **스킵**하고 (chk-002가 H2를 확정했으므로) 증거 업로드:

```bash
/sap-session-add-evidence sess-20260412-m2p9xt \
  ~/evidence/chk-001-retry-result.txt \
  ~/evidence/chk-002-cdhdr-cdpos.csv
```

### AI 응답

```markdown
## 📥 Evidence Added — Bundle evb-20260412-d9p2xr

**세션**: sess-20260412-m2p9xt (turn 3, awaiting_evidence → verifying)

### 📋 수집된 아이템
- evi-001: `transaction_log` (chk-001-retry-result.txt, 423 B)
  - inline_content에 포함 (크기 작음)
- evi-002: `table_export` (chk-002-cdhdr-cdpos.csv, 1.1 KB)
  - source: table CDHDR
  - redacted_fields: [UNAME]
  - ✓ 스키마 준수

### 📊 Follow-up Request 매핑 (flr-20260412-b8m2nc)
| Check | Priority | Status |
|---|---|---|
| chk-001 재시도 테스트 | critical | ✅ matched evi-001 |
| chk-002 CDHDR 변경 이력 | critical | ✅ matched evi-002 |
| chk-003 현재 LFB1 상태 | high | ⏸ skipped (H2 이미 확정) |
| chk-004 LFBK 은행 정보 | medium | ⏸ skipped |
| chk-005 FBZP 스크린샷 | low | ⏸ skipped |

**모든 critical 체크가 수집되어** Verify 턴 진행 가능합니다.
운영자가 의도적으로 low/medium 체크를 스킵한 것으로 기록됩니다.

### ⏭ 다음 단계
`/sap-session-next-turn sess-20260412-m2p9xt` → Turn 4 (Verify)
```

---

### Turn 4 — VERIFY

```bash
/sap-session-next-turn sess-20260412-m2p9xt
```

#### AI 응답

```markdown
## ⚖️ Turn 4 — Verdict vdc-20260412-c4n8qw

**전체 판정**: ✅ **resolved**

### 📊 가설별 판정

#### H4 — 일시적 프로세스 오류 (컨트롤)
**상태**: ❌ **refuted** (재시도 후 동일 에러 반복)

#### H1 — LFB1.ZWELS 공란
**상태**: ⏸ **inconclusive** (독립적으로 검증 안 함 — H2가 직접 원인을 설명)

#### H2 — 어제 17:42 사용자가 ZWELS 지운 것
**상태**: ✅ **confirmed**

**판정 근거**:
- evi-002 CDHDR row: OBJECTCLAS=KRED, OBJECTID=100234, UDATE=2026-04-11, UTIME=17:42
- CDPOS row: TABNAME=LFB1, FNAME=ZWELS, VALUE_OLD='T', VALUE_NEW=''
- 변경 사유 필드 공란

**기술적 체인** (재구성):
1. 어제 17:42, 사용자 XYZ가 XK02로 벤더 100234를 열었음
2. Payment transactions 탭에서 ZWELS 'T' → 공란으로 저장
3. 저장 직후부터 F110이 이 벤더한테서 페이먼트 메소드를 못 찾음

##### 🛠 Fix Plan
**대상**: operator · **Transport**: 불필요 · **리뷰어**: 필수 · **예상**: 5분

1. XK02 치기
   - 메뉴: `Accounting → Financial accounting → Accounts payable → Master records → Change`
2. 벤더 100234 → 회사코드 1000 → Payment transactions 탭
3. ZWELS 필드에 `'T'` 박기 (한국 ACH 이체)
4. Save
5. F110 다시 돌려서 벤더 100234 Proposal이 정상으로 타는지 확인

**시뮬레이션**: 불필요 (마스터 데이터 원상복구, 컨피그 변경 아님)
**Universal Rule 준수**: Rule #7 (T-code + 메뉴 경로 둘 다 ✓)

##### ↩️ Rollback Plan

**트리거 조건**:
- F110 다시 돌렸을 때 다른 에러 뜸 (예: 페이먼트 메소드 T가 FBZP에서 비활성화)
- 벤더 100234의 원천세 계산이 이상함
- 다른 후속 부작용 관찰됨

**롤백 범위**: 60분 내

1. XK02 → 벤더 100234 → 회사코드 1000 → ZWELS 공란으로 되돌리기 → Save
2. 변경 이력을 audit_trail과 Jira 티켓에 기록

##### 🛡 Prevention

1. **변경 모니터링**: 매일 `SE16N CDHDR OBJECTCLAS=KRED FNAME=ZWELS UDATE=TODAY`
   돌려서 일 1회 모니터링
2. **권한 검토**: 어제 17:42에 변경 친 사용자 XYZ의 XK02 권한이 적절한지
   SUIM으로 확인 (sap-basis-consultant로 에스컬레이션 권장)
3. **Change Approval**: 벤더 마스터 변경 시 Workflow 승인 도입 고려 (MDG-S)

##### 🌐 Localization Sign-off
- 🇰🇷 KR: sap-fi-consultant — **signed off**
  - 한국 국내 벤더의 이체 Payment Method 'T' 사용 적절
  - KEB 국민은행 등 한국 은행 코드 체계와 정합
  - 전자세금계산서 원천세 처리에 영향 없음

### 📜 세션 요약
- 총 4턴 (INTAKE → HYPOTHESIS → COLLECT → VERIFY)
- 총 시간: ~25분 (9:10 ~ 9:35)
- 수집 Bundle 2개, 가설 4개, 확정 1개, 기각 1개
- Fix 적용 후 `/sap-session-apply-fix`로 기록, 문제 미재발 시 close

### ⏭ 다음 단계
1. Fix Plan 실행 (운영자)
2. 성공 확인 후 `/sap-session-apply-fix sess-20260412-m2p9xt h-002 --status success`
3. 세션 close — `audit_trail`에 최종 기록
```

---

## 🔬 두 모드 비교

| 차원 | Mode 1 (Quick Advisory) | Mode 2 (Evidence Loop) |
|---|---|---|
| 첫 응답까지 시간 | 즉시 (10초) | Turn 1 포함 ~1분 |
| 전체 해결 시간 | 운영자 숙련도 의존 | **~25분 (재시도 스킵 시 15분)** |
| 가설 수 | 암묵적 1-3개 | **명시적 4개** (컨트롤 가설 포함) |
| 반증 가능성 | ❌ 없음 | ✅ 모든 가설에 필수 |
| Rollback | ❌ 없음 | ✅ 필수 |
| 운영자 컨텍스트 반영 | 🟡 부분적 | ✅ 전량 (증언·시각) |
| Localization | 🟡 KR 특화 별도 작성 필요 | ✅ 자동 sign-off |
| 감사 추적 | ❌ 없음 | ✅ audit_trail 전체 |
| 세션 재개 | ❌ 불가 | ✅ state.yaml 기반 |
| **"조언봇" 느낌** | 강함 | 약함 (가설·반증·Rollback) |

### 결정적 차이 — "어제까지 정상"의 처리

Mode 1에서는 이 증언이 답변에 반영되지 않아요. Mode 2에서는 이 한 문장이
H2(**최근 마스터 변경** 가설)를 가장 높은 신뢰도로 끌어올렸고, 결과적으로
**체크 1회 만에 근본 원인**이 나왔습니다. 이게 "조언봇"과 "진단 파트너"의 차이.

### 결정적 차이 — 컨트롤 가설 H4

Mode 1은 "재시도부터 해보세요"라는 흔한 현실적 조언을 하지 않아요. Mode 2의
컨트롤 가설 H4는 운영자에게 "혹시 그냥 프로세스 꼬임일 수도 있으니 5분만
재시도해보세요"를 명시적으로 첫 체크로 제안합니다. 이건 AI가 **자기 가설을
신뢰하지 않는 겸손**의 표현이에요.

---

## 🎯 검증 결론

**Slice 2의 실제 작동 검증 (시나리오 기반)**:

1. ✅ `/sap-session-start`가 증상을 받아 symptom 매칭과 컨텍스트 질문을 수행
2. ✅ `/sap-session-next-turn`이 상태를 읽고 Turn 2를 실행
3. ✅ Follow-up Request 품질 기준 5가지 모두 충족 (최소성·반증·비용·안전·명확)
4. ✅ `/sap-session-add-evidence`가 Bundle을 스키마에 맞게 생성하고 체크와 매핑
5. ✅ Turn 4 Verdict가 Fix + Rollback을 필수로 포함
6. ✅ 로컬라이제이션 sign-off가 KR 컨텍스트에서 자동 수행
7. ✅ 전 과정의 audit_trail 기록

**미검증 (Slice 3+에서 예정)**:
- 실제 `data/symptom-index.yaml` 매칭 (현재는 시나리오 가정)
- web/triage.html에서 엔드유저가 시작한 세션의 운영자 에스컬레이션
- VS Code extension UI
- MCP 서버를 통한 외부 호출

**다음 dog-food 후보**:
- 월마감 F.5D 외화평가 이상치 (FI + CO 교차 컨설턴트 검증)
- ST22 덤프 근본 원인 (ABAP + BASIS 교차 검증)
- CPI iFlow 실패 (Integration + SD + Basis)

---

## 📚 참조

- `plugins/sap-session/skills/sap-session/SKILL.md`
- `plugins/sap-session/skills/sap-session/references/turn-formats.md`
- `plugins/sap-session/skills/sap-session/references/followup-authoring.md`
- `commands/sap-session-start.md`
- `commands/sap-session-add-evidence.md`
- `commands/sap-session-next-turn.md`
- 기존 `commands/sap-payment-run-debug.md` — Mode 1 비교 대상
- `schemas/*.yaml` — 5개 스키마 계약
