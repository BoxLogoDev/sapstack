# Grok 3차 지시서 — 로컬 LLM 용 SAP 지식 증류 (컴팩트 팩)

> 저장소: `C:\Users\chois\orca\projects\boxlogo\sapstack`
> 소유: **`data/`, `docs/`** (변동 없음). 2차 작업(다국어·gold-set)과 병행하거나
> 2차를 먼저 끝내고 진행 — 순서는 당신이 판단.

---

## 배경 — 왜 이 작업인가

오늘 데스크톱 앱에 **로컬 추론 엔진이 내장**됐다 (llama.cpp llama-server 번들 +
`~/.sapstack/models/` 모델 팩). 폐쇄망 고객은 이제 인터넷 없이 자체 AI 진단이
가능해진다. 타깃 모델은 **Qwen3 8B Q4, CPU 추론** — 16GB 노트북 기준이다.

문제: 현재 진단 품질의 원천인 에이전트 프롬프트는 클라우드 모델용이다.
`CLAUDE.md` 전문 + 에이전트 본문(106~~326줄)을 합치면 수천 토큰인데,
**8B CPU 모델은 이걸 소화하지 못한다** — 컨텍스트는 되지만 지시 추종력이
무너지고 10~~25 tok/s 속도에서 응답이 실용성을 잃는다.

해법: 지식을 **증류**한다. 각 모듈의 진단 지식을 8B가 따라올 수 있는 크기로
압축한 "컴팩트 팩"을 만든다. 이것이 Local 등급 품질의 원천 데이터가 된다.

---

## 실행 모드 — 자율 배치 루프 (goal 모드)

```
GOAL
  20개 SAP 모듈의 컴팩트 진단 카드를 만든다.

성공 기준
  1. data/local-llm/compact/{module}.md — 20개 파일
     (fi, co, mm, sd, pp, tr, hcm, abap, basis, s4-migration, bc, btp,
      pm, qm, ewm, cloud, sac, ibp, ariba, integration-cloud)
  2. 각 파일이 형식 계약(아래)을 지키고 60줄 / 3,000자 이내
  3. 모든 T-code 가 data/tcodes.yaml 에 실재 — ./scripts/check-tcodes.sh --strict 통과
  4. 하드코딩 0 — ./scripts/check-hardcoding.sh --strict 통과
  5. data/local-llm/README.md 에 용도·생성 규칙·재생성 방법 기록

배치 루프
  ① 모듈 1개 선택 → ② 원본(agents/{module}-consultant.md + SKILL.md)을 읽고 증류
  → ③ 길이·형식 자체 검사 → ④ 5개 모듈마다 게이트 2종 실행 → ⑤ 실패 시 수정
  → ⑥ 다음 모듈

중단 조건
  - 원본에 없는 내용을 지어내야 채워질 때 (그 항목은 비우고 표시)
  - 게이트 3회 연속 실패
```

---

## 형식 계약 (모든 파일 동일)

```markdown
# {MODULE} 진단 카드 (local)

## 우선 진단 경로

- {증상 패턴} → {첫 체크 T-code} → {둘째 체크}
- (최대 8개. 각 줄은 원본 에이전트의 진단 순서 서술에서 파생)

## 핵심 T-code

{T-code}: {한 줄 용도}
(최대 12개, 전부 tcodes.yaml 실재)

## 규칙

- ECC 와 S/4 가 다른 지점: {있으면 1~3줄}
- 금지: 운영 SE16N 편집 제안, 회사코드 등 하드코딩, 추측 단정
- 확신 없으면 "확인 필요"라고 말할 것
```

## 증류 규칙 (엄수)

1. **창작 금지.** 모든 내용은 `agents/{module}-consultant.md` 와
   `plugins/sap-{module}/skills/*/SKILL.md` 에 이미 있는 것의 압축이어야 한다.
   원본에 없는 T-code·진단 순서를 새로 만들지 않는다.
2. **압축이 목적, 요약이 아니다.** 8B 모델이 지시로 따라올 수 있는
   "증상→체크" 매핑을 남기고 배경 설명·예시·긴 산문은 버린다.
3. 언어: 한국어 현장 용어 (원본 규칙 그대로 — T-code 원형, 약어 유지)
4. 에이전트가 없는 모듈(예: bc 는 plugin 만)은 SKILL.md 만으로 증류

## 절대 금지

1. ⛔ `agents/`, `plugins/`, `mcp/`, `packages/`, `apps/`, `.github/`, `scripts/` 편집
2. ⛔ gold-set 열람으로 정답 맞추기
3. ⛔ 게이트 실패 상태로 보고

## 완료 보고 (EVIDENCE)

```
### 파일 20개 + 각 줄수/자수
### 게이트 출력 (check-tcodes --strict / check-hardcoding --strict)
### 원본에 없어 비워 둔 항목 목록 (있는 게 정상)
```
