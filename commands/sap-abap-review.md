---
description: ABAP 코드를 sap-abap-reviewer 서브에이전트에 위임해 Clean Core, HANA 최적화, ATC 기준으로 리뷰합니다. 파일 경로 또는 객체 이름을 인수로 받습니다.
argument-hint: [파일경로 또는 객체명]
---

# ABAP 코드 리뷰

대상: `$ARGUMENTS`

## 실행 순서

1. **파일 탐색**
   - 인수가 경로면 Read로 로드
   - 인수가 객체명이면 Glob으로 검색 (`**/*$ARGUMENTS*.abap`, `**/Z$ARGUMENTS*`)
   - 여러 파일 매칭 시 사용자 확인

2. **컨텍스트 수집**
   - 관련 파일의 import/include 추적
   - DDIC 의존성 확인 (TABLES, TYPE, STRUCTURE)

3. **sap-abap-reviewer 서브에이전트에 위임**
   - Task 도구로 `sap-abap-reviewer` 호출
   - 코드 전문 전달
   - 한국 현장 맥락(K-SOX, 개인정보보호법) 포함 요청

4. **결과 통합**
   - Critical 이슈는 즉시 표시
   - Warning은 우선순위 정렬
   - Good 항목도 인정

## 리뷰 범위

- [ ] Clean Core 준수
- [ ] HANA 성능 (SELECT, JOIN, FOR ALL ENTRIES)
- [ ] S/4HANA 대응 (BP, ACDOCA, MATDOC)
- [ ] ATC Priority 검증
- [ ] 보안 (AUTHORITY-CHECK)
- [ ] 한국 개인정보보호법 (민감정보 로그/출력)

## 출력 예시

```
## 📋 리뷰 대상
- 파일: Z_CUSTOM_REPORT.abap (324 라인)
- 관련: Z_CUSTOM_UTIL (include)

## 🔴 Critical (N건)
1. [Z_CUSTOM_REPORT:45] SELECT * FROM BSEG — S/4에서 ACDOCA로 변경 필요

## 🟡 Warning (N건)
1. [Z_CUSTOM_REPORT:120] FOR ALL ENTRIES에 empty check 누락

## 🟢 Good
- AUTHORITY-CHECK 패턴 올바름

## 📊 ATC 예상
- P1: N / P2: N / P3: N
```

## 참조
- `agents/sap-abap-reviewer.md`
- `plugins/sap-abap/skills/sap-abap/references/clean-core-patterns.md`
- `plugins/sap-abap/skills/sap-abap/references/code-review-checklist.md`
