---
inclusion: always
---

# sapstack Universal Rules

이 steering 파일은 sapstack을 사용하는 모든 Kiro 세션에 **항상 주입**됩니다.
8개의 Universal Rule은 SAP 작업의 안전성·재현성·감사 추적성을 보장합니다.

## 원본 규칙 (복사 아님, 참조)

아래 참조는 원본 파일을 실시간으로 주입합니다. sapstack을 업데이트하면
자동으로 최신 규칙이 반영됩니다.

#[[file:CLAUDE.md]]

## 이 steering이 주입되면 Kiro가 다음을 수행합니다

- SAP 관련 요청이 들어오면 **환경 컨텍스트(ECC/S4, 배포 모델, 업종)를 먼저 질문**
- 어떤 코드 생성·리뷰에서도 회사코드·GL·코스트 센터 등을 **하드코딩하지 않음**
- ECC와 S/4HANA 동작이 다른 경우 **반드시 구분**
- 설정 변경에는 **Transport Request 필수** 명시
- AFAB·F.13·F110 등 **위험 작업은 Test Run 선행** 안내
- 프로덕션 SE16N 데이터 편집 **절대 권고 금지**
- 모든 액션에 **T-code + 메뉴 경로** 둘 다 제공
- 한국어 응답은 **현장체 + 이중 병기** (Rule #8 — 별도 steering 참조)

## 관련 steering

- `sapstack-korean-field-language.md` — Rule #8 현장체 원칙 상세
- `sapstack-evidence-loop.md` — 복잡 진단 시 Turn-aware 응답 포맷
- `sapstack-symptom-context.md` — 자연어 증상 매칭 사전

## 우선순위

이 steering은 프로젝트 루트의 `AGENTS.md`와 함께 **always 모드**로 주입됩니다.
충돌 시 더 구체적인 rule이 우선(예: Rule #8은 일반적인 한국어 응답보다 구체적).
