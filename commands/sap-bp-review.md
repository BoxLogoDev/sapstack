---
description: SAP Best Practice 준수 리뷰. 현재 운영 상태가 3-Tier Best Practice(Operational/Period-End/Governance)를 따르고 있는지 점검하고 개선점 제시.
argument-hint: <모듈> [operational|period-end|governance|all]
---

# SAP Best Practice 준수 리뷰

입력: `$ARGUMENTS`

## 목표
사용자의 SAP 운영이 sapstack Best Practice 3-Tier 체계를 따르고 있는지 점검하고, 미준수 항목에 대해 구체적인 개선 방안을 제시합니다.

## 안전 규칙
- 조회/분석만 수행 — 변경은 사용자 확인 후
- 회사코드·조직 단위 값은 사용자가 제공

## 실행 절차

### Step 1 — 환경 확인
- 대상 모듈 (FI, CO, MM, SD, PP, PM, QM 등)
- 리뷰 범위 (Operational / Period-End / Governance / All)
- SAP 릴리스 + 업종

### Step 2 — Best Practice 로드
1. 공통 BP: `docs/best-practices/` 문서 참조
2. 모듈별 BP: `plugins/sap-{모듈}/references/best-practices/` 문서 참조
3. 업종별 가이드: `docs/industry/` 참조 (해당 시)

### Step 3 — 체크리스트 리뷰
각 Tier별 체크리스트를 사용자에게 제시하고 준수 여부 확인:

#### Tier 1 — Operational (일상 운영)
- 일간/주간 운영 체크리스트 항목별 준수 여부
- 표준 프로세스 준수 여부 (예: MIGO 전 이동유형 확인)

#### Tier 2 — Period-End (기간마감)
- 마감 전 Pre-flight 체크리스트
- 마감 실행 순서 준수 (모듈 횡단 의존성)
- 시뮬레이션 선행 여부

#### Tier 3 — Governance (거버넌스)
- 권한 관리 (SoD, K-SOX)
- 변경관리 프로세스
- 마스터데이터 거버넌스
- 감사 대비 상태

### Step 4 — 개선 리포트
- 준수 항목 / 미준수 항목 분류
- 미준수 항목별 구체적 개선 방안
- 우선순위 (Critical / High / Medium / Low)

## 위임
- 모듈별 상세 → 해당 컨설턴트 에이전트
- 권한 관리 → sap-basis-consultant
- 한국 규제 → sap-bc 참조

## 참조
- `docs/best-practices/`
- `plugins/sap-{모듈}/skills/sap-{모듈}/references/best-practices/`
- `docs/enterprise/`
