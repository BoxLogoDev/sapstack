# SAC 일상 운영 (Tier 1) Best Practice

## 적용 범위
- **S/4 HANA**: ✓ (Live / Import)
- **Cloud PE**: ✓
- **한국 특화**: ✓ (리전 latency, 다국가 통화)

---

## 체크리스트

### 📊 일간 (Daily) 운영

#### Import 스케줄 결과
- [ ] **SAC → Connections → Schedule Status**
  - 왜: 데이터 미갱신 → 잘못된 의사결정
  - 빈도: 일간 (오전, 야간 import 직후)
  - 담당: SAC 관리자
  - 확인항목: 모든 scheduled import 성공, 행 수 정상, DPA agent UP

#### Live Connection 헬스
- [ ] **대표 Story 로드 테스트** (Live 모델)
  - 왜: SICF/CORS/SAML 만료 시 전체 Live 중단
  - 빈도: 일간
  - 담당: SAC 관리자
  - 확인: 연결 정상, 인증 라운드트립, 렌더 시간 허용 범위

### 📅 주간 (Weekly) 운영

- [ ] Story 성능 리뷰 — 느린 위젯/쿼리 식별, 소스 query 집계 점검
- [ ] 인증서/secret 만료 임박 목록 (SAML, OAuth)
- [ ] 신규 Story/Model 권한(DAC) 검토
- [ ] Predictive scenario 데이터 신선도 — 재학습 필요 여부

## 한국 현장 체크
- 한국 리전 ↔ 글로벌 소스 latency 모니터링
- 월마감 배치 시간대와 SAC import 스케줄 비충돌
- 한국어 라벨/i18n 표시 정상

## 관련 참조
- `../img/connection-setup.md`
- `period-end.md` — 리포팅 주기
- `governance.md` — 데이터 접근 통제
