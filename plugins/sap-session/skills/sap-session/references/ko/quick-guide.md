# sap-session 한국어 퀵가이드

> Evidence Loop 오케스트레이터. 라이브 SAP 접근이 막힌 환경에서 "확인 → 가설 → 증거 수집 → 검증" 4-턴 비동기 루프로 운영 진단을 수행하는 상위 스킬. 세부는 영문 `SKILL.md`와 `references/turn-formats.md` 참조.

## 🔑 언제 sap-session을 쓰는가

| 상황 | 모드 |
|---|---|
| "FB01이 뭐예요?" 같은 단순 질의 | **Quick Advisory** — sap-session 불필요, 모듈 컨설턴트가 직접 답변 |
| "F110 돌렸는데 벤더 하나만 'No payment method' 떠요" | **Evidence Loop** — sap-session으로 진단 시작 |
| 기간마감 사전 점검 / 사후 회고 | Evidence Loop |
| 크로스모듈 변경 영향 분석 (예: FI 설정 → MM/SD 파급) | Evidence Loop |
| 가설이 2개 이상이라 증거로 좁혀야 할 때 | Evidence Loop |
| 운영자가 SAP에 직접 접근 불가, AI는 조언만 가능 | Evidence Loop (이게 핵심 사용 사례) |

## 🔁 4개의 턴

```
Turn 1 INTAKE       (운영자)  초기 증상 + Evidence Bundle 1개 업로드
Turn 2 HYPOTHESIS   (AI)       2~4개 가설 + 반증조건 + Follow-up Request
Turn 3 COLLECT      (운영자)   SAP에서 follow-up 체크리스트 실행, Bundle 추가
Turn 4 VERIFY       (AI)       가설 확정/기각, 확정 시 Fix + Rollback
```

- 각 가설은 **반드시 반증 조건**(falsification_evidence)을 포함. "기각될 수 없는 가설"은 제안 불가.
- Fix 플랜이 있으면 **반드시 Rollback 플랜**도 있어야 함 (Rollback-or-no-Fix 원칙).
- 모든 상태 변화는 `session.audit_trail`에 append-only로 기록 (수정·삭제 금지).

## 📦 세션 파일 구조

세션 1개 = `.sapstack/sessions/{id}/` 디렉토리 1개:

| 파일 | 언제 |
|---|---|
| `state.yaml` | 매 턴 업데이트 (현재 상태·다음 액션) |
| `bundles/evb-*.yaml` | Turn 1, 3 — 운영자가 업로드한 증거 모음 |
| `hypotheses/h-*.yaml` | Turn 2 — AI가 만든 가설 |
| `requests/flr-*.yaml` | Turn 2 — AI가 만든 follow-up 체크리스트 |
| `verdicts/vdc-*.yaml` | Turn 4 — 확정/기각 판정 |

세션 ID 형식: `sess-YYYYMMDD-XXXXXX` (예: `sess-20260514-m2p9xt`)

## 🚀 한국 운영자 흐름 예시

### 시나리오 — F110 페이먼트런 벤더 하나만 실패

```bash
# Turn 1 INTAKE — 운영자가 증상 입력
/sap-session-start "F110 Proposal 실패 — 벤더 100234, 'No valid payment method' 에러"

# 초기 Bundle 업로드 (F110 로그, 벤더 마스터 덤프)
/sap-session-add-evidence sess-20260514-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# Turn 2 HYPOTHESIS — AI가 가설 만들고 follow-up 요청
/sap-session-next-turn sess-20260514-m2p9xt
# → 출력 예:
#   가설 H1: LFB1.ZWELS (페이먼트 메소드) 비어있음 — 가장 흔함
#   가설 H2: FBZP 뱅크 디터미네이션에 T/C 페이먼트 메소드 누락
#   가설 H3: 회사코드별 페이먼트 메소드 미활성
#   Follow-up Request:
#     1. XK03 → 벤더 100234 → 회사코드 → ZWELS 필드값 확인 (priority: critical, 2분)
#     2. CDHDR/CDPOS 변경이력 (priority: high, 5분)
#     3. FBZP → 페이먼트 메소드 설정 export (priority: medium, 8분)

# Turn 3 COLLECT — 운영자가 SAP에서 체크리스트 실행 후 결과 업로드
/sap-session-add-evidence sess-20260514-m2p9xt ./xk03-zwels-check.txt

# Turn 4 VERIFY — AI가 가설 확정/기각, Fix + Rollback 제안
/sap-session-next-turn sess-20260514-m2p9xt
# → H1 확정 (ZWELS 비어있음), Fix: XK02로 ZWELS="T" 등록, Rollback: XK02로 ZWELS 비우기

# 다른 운영자/Surface로 인수인계
/sap-session-handoff sess-20260514-m2p9xt --to web_triage --reason "엔드유저 재연 확인 필요"
```

## 🧰 자동 라우팅 (어떤 컨설턴트가 호출되는가)

가설의 `impacted_modules`에 따라 자동으로 모듈 컨설턴트 병렬 호출:

| 가설 모듈 | 자동 호출 에이전트 |
|---|---|
| FI | `sap-fi-consultant` |
| MM / 구매 / 재고 | `sap-mm-consultant` |
| SD / 판매 / 여신 | `sap-sd-consultant` |
| PP / 생산 / BOM | `sap-pp-consultant` |
| HCM / 인사 / 페이롤 | `sap-hcm-consultant` |
| TR / 자금 / 결제 | `sap-tr-consultant` |
| CO / 원가 / CO-PA | `sap-co-consultant` |
| PM / 설비보전 | `sap-pm-consultant` |
| QM / 품질검사 | `sap-qm-consultant` |
| WM/EWM / 창고 | `sap-ewm-consultant` |
| ABAP / DUMP / 코드 리뷰 | `sap-abap-developer` |
| BASIS / 권한 / 트포 | `sap-basis-consultant` |
| Cloud PE / Clean Core | `sap-cloud-consultant` |
| S/4 마이그레이션 | `sap-s4-migration-advisor` |
| BTP / CPI / IDoc 통합 | `sap-integration-advisor` |
| 신입사원 / 초보 질문 | `sap-tutor` |

여러 모듈이 관련되면 **병렬 호출**되고, 각 컨설턴트의 의견을 종합해 최종 verdict 구성.

## 🇰🇷 한국 현장체 표기 원칙 (강제)

sapstack은 영어 사전체가 아닌 **한국 SAP 현장체**를 사용. quick-guide 작성·답변 시 반드시 지킬 것:

- **외래어 우선**: "코스트 센터" (원가센터 아님), "페이먼트 메소드" (지급방법 아님), "미고" (입출고처리 아님)
  - 첫 등장 시 공식 번역 + 필드 코드 병기: "코스트 센터 (원가센터, KOSTL)"
- **회화체 허용**: "돌렸는데", "뜨네요", "안 돼요", "박아주세요"
- **T-code/약어 그대로**: F110, MIGO, ST22, PO, GR, TR (절대 "F110 트랜잭션", "구매발주" 등으로 풀지 않음)
- **한국 비즈니스 시점**: D-1, 월마감 D+3, 가결산, 확정결산
- 전체 가이드: `references/korean-field-language.md`
- 동의어 사전: `data/synonyms.yaml` (95 canonical term × 6 languages)

## ⚠️ 명시적 비목표

sap-session이 **하지 않는** 것:

- 라이브 SAP 연결 — RFC/OData/Fiori 직접 호출 없음
- 프로덕션 데이터 자동 편집 — 모든 Fix는 운영자가 수동 실행
- Transport 자동 이동 — 모든 트포 이동은 사람의 승인
- 엔드유저에게 CLI 강제 — 엔드유저는 Surface C(웹 포털) 사용

## 🚦 다른 모듈과의 관계

| 비교 | Quick Advisory (모듈 SKILL 직접) | sap-session (Evidence Loop) |
|---|---|---|
| 응답 턴 수 | 1턴 | 다중턴 (비동기) |
| 적합한 질문 | "X가 뭐예요?" | "X가 안 돼요" |
| 가설 처리 | 단일 답변 | 2~4개 가설 + 반증조건 |
| 증거 수집 | 없음 | 명시적 follow-up checklist |
| 세션 상태 저장 | 없음 | `.sapstack/sessions/...` |
| Rollback 플랜 | 선택 | **필수** |

판단 기준: **2턴 이상**이 예상되거나, **가설 후보가 2개 이상**이면 sap-session.

## 📚 더 읽기

- `references/turn-formats.md` — 각 턴의 상세 입출력 포맷·예시
- `references/evidence-bundle-guide.md` — 운영자가 Bundle을 준비할 때 주의점
- `references/followup-authoring.md` — AI가 Follow-up을 작성할 때 품질 기준
- `references/session-state-lifecycle.md` — 세션 상태 전이·재개 규약
- `references/korean-field-language.md` — 한국 SAP 현장체 작성 규약
- `../../../schemas/` — 5개 JSON Schema (계약 정의)
- `../../../CLAUDE.md` — Universal Rules
