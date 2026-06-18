# sapstack Learning Loop — 세션이 지식으로 자란다

> gstack 의 `/skillify`·`/learn`·`decisions.jsonl` 규율을 SAP 진단 도메인으로 번역.
> 갭 분석 [`gstack-gap-analysis.md`](gstack-gap-analysis.md) "결정 메모리/학습" + roadmap v2.4 Learning Loop.
>
> **핵심**: 해결된 Evidence Loop 세션이 재사용 가능한 지식(symptom 후보)과 품질 측정
> 환류(eval gold-set 후보)로 되돌아온다. Pillar A(eval) ↔ Pillar C(learning) 플라이휠.

## 프라이버시 원칙 (먼저)

- **opt-in·로컬·읽기전용**: 외부 전송 없음. 모든 처리는 로컬에서.
- **런타임 데이터 커밋 금지**: `.sapstack/sessions/`·`.sapstack/decisions.jsonl` 은
  `.gitignore` 로 차단. PII 가 섞일 수 있는 진단 데이터는 저장소에 올라가지 않는다.
- **PII 스크럽**: codify 산출물은 구조적 PII(주민/사업자/카드/계좌/전화/이메일)를
  자동 마스킹(`mcp/pii-scrubber.ts` 재사용). 단, 도메인 한글을 파괴하는 휴리스틱
  "성명" 패턴은 제외 — 그래도 **사람 검수 후 PR** 이 최종 게이트.

## 3개 도구

### 1. codify — 세션 → 지식 후보 (skillify 의 SAP판)

해결된(`status: resolved`) 세션의 확정 진단에서 재사용 가능한 symptom 후보를 만든다.

```bash
./scripts/codify-session.sh .sapstack/sessions/sess-...
# 또는 fixture 로 시연:
./scripts/codify-session.sh scripts/learning/fixtures/sess-20260601-a1b2c3
```

- `typical_causes` 는 **확정 가설/verdict 에서 파생** (추측 금지, ETHOS ①).
- `first_check_tcodes` 는 fix/rollback 단계의 T-code 에서 수집.
- 출력은 `data/symptom-index.yaml` 에 붙일 수 있는 YAML 초안 (stdout).
- `matched_symptom_index_entry` 가 있으면 "기존 항목 보강 후보"로 표시(덮어쓰기 금지).
- **반드시 사람 검수 후 PR** — 일반화·중복·PII 잔존 점검.

### 2. aggregate — 세션 집계 + 플라이휠 환류

세션들을 집계해 메트릭을 내고, **gold-set 에 없는 해결 세션을 eval 확장 후보로** 식별한다.

```bash
./scripts/aggregate-sessions.sh                          # .sapstack/sessions
./scripts/aggregate-sessions.sh --dir scripts/learning/fixtures   # 시연
```

산출(JSON, 자유 텍스트 미노출 → PII 안전):

| 필드 | 의미 |
|---|---|
| `resolution_rate` | 해결률 |
| `hypothesis_accuracy` | confirmed / (confirmed+refuted) — 가설 정확도 |
| `module_distribution` | 확정 가설 기준 모듈 분포 |
| `gold_set_candidates` | matched 인데 gold-set 에 없는 resolved → **Pillar A eval 확장 후보** |
| `codify_candidates` | 인덱스 미매칭 resolved → codify 대상(신규 symptom) |

### 3. record-decision — 결정 메모리 (이벤트 소싱)

"왜 이렇게 설정했나"를 세션을 넘어 보존. 계약: [`../schemas/decision-event.schema.yaml`](../schemas/decision-event.schema.yaml).

```bash
./scripts/record-decision.sh \
  --decision "F110 기본 페이먼트 메소드를 T(이체)로" \
  --rationale "국내 이체가 표준, 운영자 합의" \
  --actor operator --refs "sess-...,FBZP"
# → .sapstack/decisions.jsonl 에 append (커밋 안 됨)
```

## 플라이휠 (A ↔ C)

```
Evidence Loop 세션(.sapstack/sessions)
   │  resolved
   ├─ codify ─────────► symptom-index 후보 (사람 검수 PR) ─► 지식 깊이 ↑
   └─ aggregate ──────► gold_set_candidates ─► eval gold-set 확장 ─► 진단 정확도 측정 ↑
                         (Pillar A)                              (REPORT.md)
```

해결된 진단이 많아질수록 → eval gold-set 이 풍부해지고 → 진단 정확도 측정이 촘촘해지고
→ 약점이 드러나 지식이 보강된다. 이것이 "스스로 자라는" 제품의 엔진이다.

## 의존성

로컬 도구라 `mcp/node_modules`(js-yaml)와 `mcp/dist`(pii-scrubber, `cd mcp && npm run build`)가
필요하다. 래퍼가 누락 시 안내한다. per-PR/CI 자동 실행 대상 아님(로컬·opt-in).
