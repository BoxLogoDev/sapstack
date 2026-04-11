---
description: S/4HANA 마이그레이션 Readiness를 sap-s4-migration-advisor에 위임해 평가합니다. 현재 ECC 환경·커스텀 코드 규모·비즈니스 니즈를 수집해 경로 추천과 Top Risk를 제시.
argument-hint: [--brownfield|--greenfield|--selective|--auto]
---

# S/4HANA Readiness 평가

모드: `$ARGUMENTS` (지정 없으면 `--auto`)

## 실행 순서

### 1. 환경 인테이크 (필수)
사용자에게 다음을 질문합니다. 답변이 모두 모이기 전까지 분석 진행 금지:

1. **현재 ECC 환경**
   - 버전 (EhP 레벨)
   - DB (HANA / Oracle / DB2 / MSSQL)
   - Kernel 레벨
   - Unicode 여부
2. **목표 S/4HANA 릴리스** (2022 / 2023 / 2024)
3. **배포 모델**
   - On-Premise
   - RISE with SAP (Private Cloud)
   - Public Cloud (Cloud PE)
4. **커스텀 코드 규모**
   - Z-프로그램/FM/클래스 객체 수
   - 대략적 라인 수
   - 주요 확장 영역 (FI/CO/SD/MM/...)
5. **Add-on 및 Industry Solution**
6. **한국 Localization 의존도**
   - CVI KR 사용?
   - 전자세금계산서 연동?
   - 원천세 / K-IFRS 커스텀?
7. **프로젝트 제약**
   - 예상 기간
   - 허용 다운타임
   - 예산 제약

### 2. 서브에이전트 위임
- `sap-s4-migration-advisor`에 위 정보를 패키지로 전달
- 의사결정 트리 분석 요청

### 3. 결과 종합
- 경로 추천 (Brownfield / Greenfield / Selective)
- Top 5 Risk + 완화 방안
- Phase Plan (준비 → 전환 → 안정화)
- 한국 Localization 특화 주의사항

### 4. 후속 권장
- SAP Readiness Check 실행 (`/n/SDF/RC_START_CHECK`)
- Custom Code ATC 실행 (`/n ATC` with S4HANA_READINESS variant)
- Simplification Item Catalog 다운로드

## 옵션 모드

- `--brownfield`: Brownfield 경로로 가정하고 리스크 집중
- `--greenfield`: Greenfield 가정, 데이터 이관 전략 집중
- `--selective`: Selective Data Transition 분석
- `--auto` (기본): 의사결정 트리로 경로 자동 추천

## 참조
- `agents/sap-s4-migration-advisor.md`
- `plugins/sap-s4-migration/skills/sap-s4-migration/SKILL.md`
- `plugins/sap-s4-migration/skills/sap-s4-migration/references/simplification-items.md`
