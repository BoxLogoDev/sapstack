# README 6종 전면 재보강 계획

## Context

sapstack README(6개 언어, 각 192줄, 완벽 parity)는 구조는 견고하나 **통계가 버전을 못 따라간 "drift" 상태**다. SAP Note 57+→실제 112, T-code 340+→361, symptom-index 62→90, MCP 도구 "5+3"→23, 에이전트 "15명+1"이 헤더 "20"과 모순, VS Code "v0.1"→v2.3.3 등 다수. 또 이번 사이클에 추가된 핵심 자산 `ETHOS.md`가 README에 미노출이고, npm 정식 발행(`@boxlogodev/sapstack-mcp@2.3.3`)에도 배지가 없다.

목적: ① 모든 통계를 실측값으로 정확화(자기 README가 옛 숫자를 들고 있으면 ETHOS ①(Ground-truth)과 모순), ② gstack 수준 설득 구조 차용(Who-this-is-for 페르소나, See-it-work 시나리오), ③ 신규 자산(ETHOS/배지) 노출. 6개 언어 parity 유지.

## 확정 결정 (사용자 승인)

- **깊이**: 전면 재구성 (구조 강화 + 신규 섹션)
- **추가 요소**: 상단 배지 · "이런 분께" 페르소나 · "실제 사용 예" 시나리오 · 누락 통계 전수 수정
- **제약**:
  - **ETHOS Ground-truth**: 측정 안 된 숫자/ROI 금지 (예: "8시간→30분" 류 절대 금지). 검증 가능한 사실만.
  - **6-lang parity**: 모든 변경 6개 README 동일 적용. 번역은 **Claude 직접 작성**(이 repo 확립 패턴, 외부 번역가 없음).
  - **positioning 유지**: "AI 코딩 어시스턴트에 SAP 지식 주입" + 운영자/교육자/컨설턴트. 비개발자 ROI 마케팅으로 과도하게 틀지 않음.
  - 마스코트 표준씨 히어로·톤 유지.
- **버전**: README 콘텐츠 변경이므로 버전 bump 없음. main 대상 PR. (다음 실질 사이클 v2.4.0과 무관하게 머지 가능)

## 개정 후 README 구조

현 11섹션 유지 + 신규 2섹션 + 배지. 순서:

1. **히어로** (제목 + 마스코트 + catchphrase) — 유지
2. **🆕 배지 줄** (히어로 직후, 중앙정렬) — npm version / license MIT / 6 languages / release v2.3.3 (+선택 marketplace). shields.io, 검증 가능한 사실만.
3. **통계 한 줄** (line 11) — 수치 정확화 (아래 표)
4. **언어 스위처** — 유지
5. **sapstack이란?** — 유지 + **ETHOS 링크 1줄 추가** (`의사결정 원칙: ETHOS.md`)
6. **🆕 이런 분께 (Who this is for)** — 페르소나 3: SAP 운영자 / 신입 교육자 / 컨설턴트. 각 1~2줄 + 대표 진입점(예: 운영자→Evidence Loop, 교육자→sap-tutor).
7. **🧭 Golden Path** 표 — 유지 (이미 양호)
8. **🆕 실제 사용 예 (See it work)** — Evidence Loop 4턴을 **정성적 대화 예시**로 (가짜 시간·ROI 없음). 1개 시나리오(예: MIGO 입고 오류 → INTAKE→HYPOTHESIS→COLLECT→VERIFY).
9. **핵심 기능** — 서브섹션 통계 전수 수정 (에이전트/MCP/IMG/symptom/industry)
10. **빠른 시작** — 유지 (Claude Code/NPM/VS Code/Kiro/기타)
11. **Universal Rules** — 유지 + CLAUDE.md/ETHOS 링크
12. **학습 경로** — 유지
13. **데이터 자산** 표 — 수치 전수 수정
14. **플러그인 카탈로그** — 유지
15. **다국어 검수 기여** — 유지
16. **라이선스 & 기여** — 유지

## 통계 정확화 (before → after)

### 확정 (실측 완료)
| 위치 | before | after | 출처 |
|---|---|---|---|
| 헤더 line 11 | "22+ 커맨드" | **22 커맨드** | `ls commands/*.md`=22 |
| 헤더 line 11 | "VS Code 확장 v0.1" | **v2.3.3** | package.json |
| 기능 §에이전트 (L57) | "15명 + 1명 튜터", "11개 모듈 컨설턴트" | **19 컨설턴트 + 1 튜터 = 20** | `ls agents/*.md`=20 |
| 기능 §IMG (L64) | "55+ SPRO" | **76** | `find plugins -path '*/references/img/*.md'`=76 |
| 데이터자산 T-code (L144) | "340+" | **361** | `grep -cE '^[A-Z0-9/]+:' data/tcodes.yaml`=361 |
| 데이터자산 SAP Note (L146) | "57+" | **112** | `grep -cE '^\s+- id:' data/sap-notes.yaml`=112 |
| 데이터자산 업종 (L149) | "3 industries" | **7** (제조/유통/금융 + 화학/자동차/헬스케어/공공) | docs/industry/ 가이드 수 — 구현 시 `ls docs/industry/*.md` 확인 |

### 구현 시 검증 후 확정 (출처 불일치 — 명령으로 카운트)
| 항목 | 현재 표기 | 검증 명령 | 비고 |
|---|---|---|---|
| MCP 도구 수 (L76 "읽기5+쓰기3") | 8 | `mcp/sapstack-server.json` 의 tools 객체 실카운트 | server.json description 자체는 "22 tools, 10 prompts"; CHANGELOG v2.3.0은 "23". **실카운트로 확정**, 추측 금지 |
| symptom-index (L145) | 62 | `data/symptom-index.yaml` entry 실카운트 | CHANGELOG v2.3.0: 62→90. 실측 후 기입 |

> 원칙: 숫자가 출처마다 다르면 **README 작성 시점에 data 파일에서 직접 카운트한 값**만 기입. 모르면 "+" 없이 정확수 또는 생략.

## 6-lang 적용 전략

- **기계적 동일 (번역 불필요)**: 배지, 통계 숫자, 코드블록/명령/URL, 플러그인명(sap-fi 등), T-code/Note 번호, 이모지, 섹션 헤더 구조.
- **언어별 번역 (Claude 직접)**: 신규 산문 — 페르소나 3개 설명, See-it-work 대화 예시, ETHOS 링크 문구, 수정된 기능 설명문.
- 작업 순서: **README.md(한국어) 먼저 완성 → 나머지 5개를 동일 구조로 작성**(en/zh/ja/de/vi). 각 언어 native 톤 유지(한국어=현장체 해요체, 기존 번역 톤 계승).
- parity 불변식: 6개 모두 동일 섹션 수·표 수·코드블록 수. 작성 후 헤더/줄수 대조.

## 작업 분해

1. README.md(한국어) 전면 개정: 배지 + 페르소나 + See-it-work + 통계 전수 수정 + ETHOS 링크.
2. 구현 직전 미확정 통계 2건(MCP·symptom) data 파일에서 실카운트 → 확정.
3. README.en/zh/ja/de/vi 동일 구조로 작성 (한국어판 기준).
4. 로컬 검증(아래).
5. 단일 PR(`feature/readme-overhaul`) → CI 그린 → 머지.

## 검증

- `bash scripts/check-links.sh --strict` — 신규 ETHOS 링크 등 끊어진 링크 0 (**--strict 필수**: non-strict는 warning-only).
- 6-lang parity 수동 대조: `for f in README*.md; do echo "$f: $(grep -cE '^## ' $f) 섹션 / $(wc -l < $f) 줄"; done` — 섹션 수 6개 동일, 줄 수 근사.
- ETHOS 위반 grep 자체 점검: 시간절감/`%절감`/가짜 ROI 표현 없는지.
- `bash scripts/build-multi-ai.sh --check` — README는 sync 대상 아니나 안전 확인.
- push 전 **ci.yml 게이트 동일 플래그로 로컬 전수**(이번 세션 핑퐁 방지 교훈): check-links --strict / lint-frontmatter / check-marketplace / bump-version --check.
- 머지 가드: `gh pr view <N> --json mergeStateStatus` == CLEAN (watch exit code 불신).

## 위험 & 완화

| 위험 | 완화 |
|---|---|
| 번역 드리프트(6개 불일치) | 한국어 1종 완성 후 나머지 일괄 작성, parity 대조 |
| 또 stale 숫자 박음 | data 파일 실카운트만 사용, 출처불일치는 작성시점 카운트 |
| ETHOS 위반(가짜 ROI) | grep 자체점검 + See-it-work는 정성 대화만 |
| 깨진 링크(ETHOS/신규) | check-links --strict 강제 |
| CI 핑퐁 | push 전 게이트 로컬 전수 |

## Critical Files

- `README.md` (한국어 기준, 모든 수정 시작점)
- `README.en.md` · `README.zh.md` · `README.ja.md` · `README.de.md` · `README.vi.md` (동일 구조 작성)
- 통계 단일출처(읽기 전용 참조): `data/tcodes.yaml`, `data/sap-notes.yaml`, `data/symptom-index.yaml`, `mcp/sapstack-server.json`, `agents/`, `commands/`, `docs/industry/`
- 신규 링크 대상(존재 확인됨): `ETHOS.md`

## 향후(선택, 본 작업 범위 밖)

- `scripts/validate-stats.sh` — README 통계 ↔ data 파일 자동 대조 게이트(통계 drift 재발 방지). gap-analysis G와 별개의 작은 DX 개선.
