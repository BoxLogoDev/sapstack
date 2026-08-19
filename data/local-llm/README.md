# data/local-llm — 로컬 8B용 SAP 지식 팩

## 용도

데스크톱 앱의 온디바이스 추론(llama.cpp, 타깃 **Qwen3 8B Q4 CPU**)에 넣는
진단 지식이다. 클라우드용 `agents/*.md` + `CLAUDE.md` 수천 토큰을 8B가
따라오지 못하므로, 모듈당 **증상→체크** 만 남긴 카드로 증류한다.

로더는 `data/local-llm/compact/{module}.md` 만 읽으면 된다. 런타임 코드는
이 디렉터리 소유가 아니다.

## 생성 규칙

1. 원본은 `agents/*-consultant.md`(또는 `sap-abap-developer.md`,
   `sap-s4-migration-advisor.md`)와
   `plugins/sap-{module}/skills/*/SKILL.md` 뿐이다.
2. **창작 금지.** 원본에 없는 T-code·진단 순서를 넣지 않는다.
3. 형식은 세 섹션 고정: `우선 진단 경로` / `핵심 T-code` / `규칙`.
4. 상한: **60줄, 3,000자**. 경로 ≤8, T-code ≤12.
5. T-code는 `data/tcodes.yaml` 실재만. 테이블·인포타입은 핵심 목록에 넣지 않음.
6. 하드코딩(회사코드·G/L·요율) 금지. 원본에 숫자가 있어도 옮기지 않음.
7. 에이전트가 없으면(예: `bc`) SKILL.md 만으로 증류.
8. gold-set을 보고 정답을 맞추지 않음.

## 재생성

모듈 하나를 고친 뒤:

```text
1. 원본 agent + SKILL.md 를 다시 읽고 카드만 갱신
2. node 로 줄수/자수/핵심 T-code 실재 검사
3. 5개 모듈마다:
   ./scripts/check-tcodes.sh --strict
   ./scripts/check-hardcoding.sh --strict
```

파일 목록(20):

`fi` `co` `mm` `sd` `pp` `tr` `hcm` `abap` `basis` `s4-migration`
`bc` `btp` `pm` `qm` `ewm` `cloud` `sac` `ibp` `ariba` `integration-cloud`

## 검수

초안(2026-08-16). 원본 에이전트와 어긋나면 원본을 이긴다.
