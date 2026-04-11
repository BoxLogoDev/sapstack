---
inclusion: auto
name: sapstack-symptom-context
description: "When the user describes a SAP system issue, error, transaction failure, period close problem, or any operational symptom in SAP ECC or S/4HANA"
---

# sapstack Symptom Context

이 steering은 사용자가 **SAP 증상을 언급할 때만** 자동 로드됩니다. 평소에는
토큰 컨텍스트를 차지하지 않고, description에 매칭되는 발화가 감지되면 20개
증상 인덱스 + synonym 사전이 주입됩니다.

## 원본 Symptom Index (실시간 참조)

#[[file:data/symptom-index.yaml]]

## 원본 동의어 사전

#[[file:data/synonyms.yaml]]

## 원본 T-code 발음 사전

#[[file:data/tcode-pronunciation.yaml]]

## 이 steering이 활성화되면 Kiro가 다음을 수행합니다

### 1. 증상 매칭 우선순위
사용자 증상을 받으면 다음 순서로 처리:

1. **symptom-index.yaml에서 fuzzy 매칭** — `symptom_ko`, `symptom_ko_variants`,
   `typical_causes` 전체 대상
2. **synonyms.yaml로 토큰 정규화** — "코스트센터" → `cost_center`로 canonical 통일
3. **tcode-pronunciation.yaml로 발음 → 코드 변환** — "에프백십" → `F110`
4. **상위 3-5개 매칭 결과 제시** — 신뢰도 내림차순, typical_causes 요약

### 2. 매칭 결과의 형식
매칭된 symptom이 있으면 답변 시작부에 반드시 표시:

```markdown
## 🎯 매칭된 증상

**[sym-f110-no-payment-method]** F110 돌리는데 벤더 하나만 No valid payment method 뜨는 경우 (신뢰도: 87%)

관련 모듈: FI, TR
초기 체크 T-code: F110, XK03, FBZP, SE16N

### 전형적 원인 (likely)
1. 벤더 마스터에 ZWELS(페이먼트 메소드, LFB1) 비어있음 — 제일 흔함
2. 최근 CDHDR 변경 이력 확인 필요
3. FBZP 뱅크 디터미네이션에 페이먼트 메소드 누락
```

### 3. 매칭 실패 시 행동
symptom-index에 매칭 없으면:
- 즉답 금지 — 환경 컨텍스트 질문 (Universal Rule #2)
- Evidence Loop 세션 시작 제안: `/sap-session-start "<증상>"`
- 또는 MCP 툴 `resolve_symptom` 호출

### 4. 로컬라이제이션 우선순위
사용자 국가가 확인되면(`kr`/`de`/`us`/`jp`) 해당 `localized_checks` 반드시
언급:
- 🇰🇷 KR: 한국 특화 — 전자세금계산서, K-SOX, 4대보험, KEB/국민/신한 은행
- 🇩🇪 DE: SEPA, DATEV, ELSTER
- 🇺🇸 US: 1099, ACH/Wire, SOX
- 🇯🇵 JP: 源泉徴収, 電子帳簿保存法

## 연관 MCP 툴 호출

이 steering이 활성화되면 다음 MCP 툴을 자동 호출 권장:

```
resolve_symptom(query="<사용자 원문>", language="ko", country="kr", top_n=5)
```

MCP 서버가 연결되어 있으면 sapstack이 synonym 확장까지 포함한 정확한 매칭을
반환합니다. 연결 안 된 경우에도 이 steering에 주입된 symptom-index 본문으로
Kiro가 직접 매칭 가능.

## 관련 파일

- `data/symptom-index.yaml` — 20개 증상 원본
- `data/synonyms.yaml` — 58 용어 + 10 약어 + 15 업무 시점
- `data/tcode-pronunciation.yaml` — 41 T-code 발음
- `sapstack-evidence-loop.md` — 매칭 이후 세션 시작 가이드
