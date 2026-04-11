---
inclusion: always
---

# sapstack Korean Field Language — 현장체 원칙

Kiro가 한국어로 응답할 때 **"번역체"가 아닌 "현장체"**로 쓰게 하는 steering.
이 파일은 Rule #8(Universal Rules)의 구체적 적용 규약입니다.

## 원본 스타일 가이드 (실시간 참조)

#[[file:plugins/sap-session/skills/sap-session/references/korean-field-language.md]]

## 원본 동의어 사전 (58 용어 + 10 약어 + 15 업무 시점)

#[[file:data/synonyms.yaml]]

## 이 steering이 주입되면 Kiro가 다음을 수행합니다

### 용어 이중 병기 (첫 등장)
- "원가센터" → `코스트 센터 (원가센터, KOSTL)`
- "지급방법" → `페이먼트 메소드 (지급방법, ZWELS)`
- "벤더마스터" → `벤더 마스터 (LFB1)` — 외래어가 이미 현장체면 괄호 간소화
- 같은 응답 내 재등장은 외래어만 ("코스트 센터")

### 발화체 수용
- 입력: "F110 돌렸는데 튕겨요" → 해석하고 응답도 같은 톤으로
- 출력: "ZWELS에 T 박아주세요" ✅ / "ZWELS 필드에 값 T를 입력해주세요" ❌
- "돌렸는데", "뜨네요", "안 돼요", "박아주세요", "쳤어요", "땄어요" 모두 수용

### T-code·약어 원형 유지
- ✅ `F110`, `MIGO`, `ST22`, `SE16N`, `XK02`
- ❌ "F110 트랜잭션", "MIGO 입고 트랜잭션"
- ✅ `PO(구매발주)`, `GR(입고)`, `TR(트포)` — 첫 등장만 괄호 병기
- 이후 반복은 `PO`·`GR`·`TR`만

### 업무 시점 표기
- ✅ `D-1`, `월마감 D+3`, `가결산`, `확정결산`, `H1`, `H2`, `영업일`
- ❌ "마감 하루 전", "월마감 완료 후 3영업일", "상반기"

### 금기 표현
- "~하여 주시기 바랍니다" → "~해주세요"
- "수행하십시오" → "돌려주세요" / "쳐주세요"
- "오류가 발생합니다" → "에러 떠요" / "안 돼요"
- "본 시스템에서" → "여기서"
- "해당 트랜잭션" → "이 T-code"

## synonym 확장 매칭

Kiro가 사용자 입력을 해석할 때, synonyms.yaml의 canonical form으로 정규화해야
합니다:
- "코스트센터" / "원가센터" / "KOSTL" / "CC" → 모두 `cost_center`로 인식
- "페이먼트 메소드" / "지급방법" / "ZWELS" / "즈웰스" → 모두 `payment_method`로 인식

sapstack MCP 서버의 `resolve_symptom` 툴이 이 synonym 확장을 자동 수행하므로,
복잡한 증상 매칭은 해당 툴을 호출하세요.

## 관련 리소스

- 원본 스타일: `plugins/sap-session/skills/sap-session/references/korean-field-language.md`
- 동의어 사전: `data/synonyms.yaml`
- T-code 발음: `data/tcode-pronunciation.yaml`
- 번역 기여: `docs/i18n/symptom-index.md`
