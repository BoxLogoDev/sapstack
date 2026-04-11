# Claude Code 사용 예시

> sapstack을 Claude Code에서 쓰는 실전 세션.

## 설치

```
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack
/plugin install sap-abap@sapstack
/plugin install sap-bc@sapstack
```

## 기본 워크플로

### 시나리오 1 — 자연어 질문 → 자동 활성화

**입력**:
```
MIRO에서 세금코드가 자동으로 안 잡혀서 포스팅이 막혀요. S/4HANA 2023입니다.
```

**일어나는 일**:
1. 키워드 `MIRO`, `세금코드` → `sap-fi` + `sap-mm` SKILL.md 자동 주입
2. Claude가 Universal Rules 적용 (하드코딩 금지, Test Run 권장 등)
3. Response Format (Issue → Root Cause → Check → Fix → Prevention → SAP Note)
4. `.sapstack/config.yaml`이 있으면 환경 질문 생략, 한국어 답변

**예상 출력**:
```markdown
## 🔍 Issue
MIRO 포스팅 시 MWSKZ(세금코드) 필드가 자동 결정되지 않음

## 🧠 Root Cause
1. PO item의 세금코드 미설정
2. 회사코드에 Tax Procedure (TAXKR) 미할당
3. Info Record 세금 조건 누락

## ✅ Check
1. ME23N → PO 조회 → Invoice tab → MWSKZ 필드
2. OBBG → 회사코드 → TAXKR 할당
3. FTXP → 세금코드 존재 + 회사코드 할당
4. ME13 → Info Record → Conditions → Tax

## 🛠 Fix
1. Case A: PO 변경 (ME22N) → 세금코드 수동 입력
2. Case B: Info Record 재설정 (ME12)
3. Case C: 회사코드 Tax Procedure 할당 (Transport 경유)

## 🛡 Prevention
- Vendor 마스터 (LFB1.MINDK) 기본 세금코드
- Info Record 생성 시 세금 조건 필수

## 📖 SAP Note
- 3092819 — Korea Localization Roadmap
- 2645815 — Korea Withholding Tax
```

### 시나리오 2 — 슬래시 커맨드

**입력**:
```
/sap-fi-closing 월결산 <회사코드>
```

**일어나는 일**:
1. `commands/sap-fi-closing.md`의 7 Phase 로드
2. Phase 1 — 환경 확인 질문
3. 답변 후 Phase 2 진행
4. 각 단계에서 사용자 승인 필요

### 시나리오 3 — 에이전트 위임

**입력**:
```
이 ABAP 코드 리뷰해줘:
[code block]
```

**일어나는 일**:
1. Claude가 `sap-abap-reviewer` 서브에이전트에 Task 도구로 위임
2. 독립 컨텍스트에서 Clean Core / HANA / ATC 기준 분석
3. Critical / Warning / Good 분류 결과 반환

## 팁

### 환경 프로필 설정 (1회)
```yaml
# .sapstack/config.yaml
system:
  release: S4HANA_2023
  deployment: on_premise
organization:
  primary_company_code: "<YOUR_CODE>"
korea:
  e_tax_invoice: true
  k_sox: true
preferences:
  language: ko
```

### 여러 모듈 동시 활성화
```
MIRO GR/IR 이슈인데 BC 관점에서 덤프도 같이 봐줘
```
→ `sap-mm`, `sap-fi`, `sap-bc`, `sap-basis` 4개 동시 활성화

## 관련
- [튜토리얼](../tutorial.md)
- [시나리오](../scenarios/)
- [환경 프로필 가이드](../environment-profile.md)
