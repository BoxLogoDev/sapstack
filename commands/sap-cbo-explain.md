---
description: CBO 스냅샷(커스텀 ABAP 오프라인 사본)에서 Z/Y 오브젝트를 찾아 sap-cbo-explainer 서브에이전트로 현업 언어 설명을 만듭니다. 오브젝트명·파일경로·증상 문장을 인수로 받습니다.
argument-hint: [오브젝트명 또는 "증상 문장"]
---

# CBO 설명 (현업용)

대상: `$ARGUMENTS`

## 실행 순서

1. **스냅샷 확인**
   - 기본 위치 `~/.sapstack/cbo/*/manifest.yaml` 을 Glob으로 탐색
   - 없으면: "CBO 스냅샷이 없습니다 — 관리자에게 `npm run cbo:export` 실행을 요청하세요 (docs/cbo-snapshot.md)" 안내 후 종료
   - manifest에서 SID·기준일 확보 (답변에 반드시 포함)

2. **대상 결정**
   - 인수가 파일 경로면 그대로 사용
   - 인수가 오브젝트명(Z*/Y*/SAPMZ* 등)이면 `catalog.json`에서 `name` 검색 → `file` 경로 확보
   - 인수가 증상 문장("저장할 때 오류")이면 catalog.md의 설명 열과 `src/**` MESSAGE 리터럴 Grep으로 후보 압축
   - catalog에 없으면 **"스냅샷에 없습니다"** 로 종료 (추측 금지)

3. **sap-cbo-explainer 서브에이전트에 위임**
   - Task 도구로 `sap-cbo-explainer` 호출
   - 전달: 스냅샷 루트 경로, 대상 파일 목록, manifest 기준일, 원 질문
   - 출력 계약(한 줄 요약/어디서 쓰나/처리 흐름/주의할 점/기준 시점) 준수 확인

## 주의

- 이 커맨드는 설명 전용 — 코드 리뷰는 `/sap-abap-review`, 수정 제안은 담당 개발자 확인 필요
- 장애 진단으로 확장되면 `/sap-session-start` (Evidence Loop)로 전환하고, 코드 근거는 `kind: custom_note` + `tags: [cbo-snapshot, <오브젝트>]` 로 첨부
