# SAC 주기 운영 (Tier 2) Best Practice — 리포팅/플래닝 주기

## 적용 범위
- **S/4 HANA**: ✓
- **Cloud PE**: ✓
- **한국 특화**: ✓ (월마감 연계 리포팅)

> SAC 주기 운영 = 월/분기 리포팅 마감 + Planning 사이클 + Predictive 재학습.

---

## 체크리스트

### 📅 월간 리포팅 마감

- [ ] 재무 actuals 확정 후 Live/Import 모델 동기
  - 빈도: 월 1회 (월마감 D+3 이후)
  - 담당: 리포팅 담당
  - 확인: actuals version 데이터 = S/4 확정 수치

- [ ] 월간 경영 대시보드/Digital Boardroom 검증
  - 확인: KPI 정합, 전월 대비 이상치 설명 가능

- [ ] Planning model: 월간 plan version publish
  - 확인: Data Locking으로 마감된 기간 보호

### 📅 분기 운영

- [ ] Predictive scenario 재학습 (분기 데이터 누적 후)
  - 담당: 데이터 분석
  - 확인: model performance(debrief) 재평가, influencer 재검토

- [ ] Story/Model 정리 — stale 콘텐츠 아카이브
- [ ] 권한(role/DAC) 분기 재인증

### 📅 연간 운영
- [ ] 연간 계획(AOP) version 구조 설정
- [ ] 통화 환산 환율 테이블 연간 갱신

## 한국 현장 체크
- 월마감(가결산 D+3, 확정결산) 일정과 리포팅 동기 시점 정렬
- 분기 결산 시 본사/자회사 분리 version 정합
- 추석/설 포함 월 KPI 해석 가이드 부착

## 관련 참조
- `operational.md` — 일상 모니터링
- `governance.md` — version/locking 거버넌스
