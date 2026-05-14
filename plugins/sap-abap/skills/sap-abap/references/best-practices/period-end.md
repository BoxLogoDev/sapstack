# ABAP 트포·릴리스 (Tier 2) Best Practice

## 적용 범위
- **ECC**: ✓ / **S/4 HANA**: ✓

## 월간 릴리스 사이클

### 사전 (D-3)
- [ ] ATC 위반 0 확인
- [ ] 단위 테스트 100% pass
- [ ] 코드 커버리지 보고서 (SCMP)
- [ ] 트포 의존성 그래프 점검 (CTS+ 또는 ChaRM)

### 릴리스 (D-Day)
- [ ] DEV → QAS import (운영자 협업)
- [ ] QAS regression 테스트
- [ ] PRD import 사전 검토 (2명 승인)
- [ ] 트포 import 후 SE38 buffer 재로드 (운영자)

### 사후 (D+1 ~ D+3)
- [ ] ST22 — 릴리스 후 신규 덤프 0 보장
- [ ] SLG1 — 신규 ERROR 패턴 분석
- [ ] 사용자 부서 피드백 수집 (UX·성능)

## 분기 마감

- [ ] 기술 부채 backlog 리뷰
- [ ] Custom Code Usage (SCM) 분석 — Dead Code 식별
- [ ] S/4 마이그레이션 readiness 점진 점검 (ATC 신규 카테고리)

## 연말

- [ ] 코드베이스 라이선스 라벨 갱신
- [ ] 폐기 객체 정리 (deprecated 1년 이상)
- [ ] 사내 ABAP 표준 문서 연 1회 업데이트

## 한국 특화

- 분기 결산 시즌 (3/6/9/12월 말) **운영자 PRD 직접 배포 금지** — 안정성 우선
- K-SOX 결산 기간 동안 ABAP 직접 수정 금지 (ITGC 통제)

## 연관 문서
- `operational.md`, `governance.md`
