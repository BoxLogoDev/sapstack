# sap-s4-migration 한국어 퀵가이드

## 🔑 환경 인테이크
1. 현재 ECC 버전 (EhP) + DB + Unicode 여부
2. 목표 S/4HANA 릴리스 (2022/2023/2024)
3. 배포 모델 (On-Prem / RISE / Cloud PE)
4. 한국 Localization 의존도

## 🛣 3대 경로

| 경로 | 설명 | 한국 적합성 |
|------|------|-------------|
| **Brownfield (System Conversion)** | 기존 시스템을 in-place 변환 | 프로세스 유지 원하는 대기업 |
| **Greenfield (New Implementation)** | 신규 구축 + 데이터 이관 | 프로세스 대개조 원하는 중견 |
| **Selective Data Transition** | 조직/기간/기능 선택적 이관 | 해외법인 단계 전환 |

## ⚠️ Top 리스크

### Brownfield
- Custom code 대량 수정 (ACDOCA 적응)
- BSEG 직접 참조 Z-프로그램 → ACDOCA 전환
- 한국 CVI KR 커스텀 재검증

### Greenfield
- 데이터 이관 범위·전략
- Master data 정제 (품질 낮을수록 이관 복잡)
- 프로세스 재설계 의사결정 속도

### Selective
- 범위 정의 어려움 (복잡도 높음)
- 중간 데이터 일치 검증 필요

## 📚 주요 도구

- **Readiness Check**: `/SDF/RC_START_CHECK` — Simplification Item 영향 자동 분석
- **SUM (Software Update Manager)**: Brownfield 주요 도구
- **DMO (Database Migration Option)**: DB + SW 동시 변환
- **SUMCT**: Unicode Conversion (ECC non-Unicode → Unicode)
- **SAP Note Analyzer**: 목표 릴리스의 Note 영향 분석

## 🇰🇷 한국 특화 리스크

- **전자세금계산서 연동** — Provider 재통합 필요 (SAP DRC 전환 검토)
- **CVI KR Simplification Item** — 한국 부가세 계정 구조 변경
- **한국 Localization Note** — Country Version Korea 전용 Note 대량
- **SI 벤더 의존성** — 주요 한국 SI (삼성SDS/LG CNS/SK C&C) 전용 가속기

## ⚠️ 필수 단계
1. **Readiness Check** 실행 (AS-IS 영향 분석)
2. **Custom Code ATC** 실행 (`S4HANA_READINESS` variant)
3. **Dual Cutover 시뮬레이션** — 최소 2회
4. **비즈니스 유저 UAT** — 한국은 STG 환경 있는 경우 필수

## 🤖 관련 에이전트/커맨드
- `agents/sap-s4-migration-advisor.md`
- `/sap-s4-readiness --auto`

## 📖 참조
- `../simplification-items.md`
