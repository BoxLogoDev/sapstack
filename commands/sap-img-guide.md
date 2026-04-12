---
description: SAP 모듈별 IMG(Implementation Guide) 구성 가이드 조회. SPRO 경로, 구성 단계, 필수 선행 설정, ECC/S/4 차이점을 안내. 구성 문제 진단 시에도 활용.
argument-hint: <모듈> <영역> [ECC|S/4]
---

# SAP IMG 구성 가이드 조회

입력: `$ARGUMENTS`

## 목표
사용자가 요청한 SAP 모듈의 IMG 구성 가이드를 조회하여 SPRO 경로, 단계별 설정 방법, 필수 선행 구성, 검증 방법을 안내합니다.

## 안전 규칙
- 모든 구성 변경은 **DEV 환경에서 먼저** 테스트 안내
- Transport 요청 번호 할당 확인
- 회사코드·조직 단위 값은 사용자가 제공 — 추정 금지
- PRD 직접 변경 절대 권장 금지

## 실행 절차

### Step 1 — 환경 확인
사용자에게 다음을 질문:
- SAP 릴리스 (ECC EhP / S/4HANA 연도)
- 대상 모듈 (FI, CO, MM, SD, PP, PM, QM, WM, EWM 등)
- 구성 영역 (예: "계정결정", "이동유형", "가격결정 절차")
- 시스템 환경 (DEV / QAS / PRD)

### Step 2 — IMG 가이드 참조
1. `plugins/sap-{모듈}/skills/sap-{모듈}/references/img/` 디렉토리 검색
2. 해당 영역의 IMG 구성 문서 로드
3. SPRO 경로 + 구성 단계 + 검증 방법 제시

### Step 3 — 단계별 안내
각 구성 단계에 대해:
1. **SPRO 경로**: 정확한 메뉴 경로
2. **T-code**: 직접 접근 T-code
3. **필드 설정**: 필드명 = 권장값 + 설명
4. **ECC vs S/4 차이**: 버전별 동작 차이
5. **주의사항**: 일반적 실수와 해결법

### Step 4 — 구성 검증
구성 완료 후 검증 방법 안내:
- 검증 T-code 실행
- 예상 결과 확인
- 테스트 전표/오더 생성으로 실제 검증

## 위임
- 모듈별 컨설턴트 에이전트에게 상세 질문 위임
- IMG 가이드 문서가 없는 영역은 SKILL.md 참조로 대체

## 참조
- `plugins/sap-{모듈}/skills/sap-{모듈}/references/img/`
- `data/img-checklist.yaml`
