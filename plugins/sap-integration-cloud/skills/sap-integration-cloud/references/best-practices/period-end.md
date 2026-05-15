# Integration Cloud 주기 운영 (Tier 2) Best Practice

## 적용 범위
- **S/4 HANA**: ✓
- **ECC**: ✓
- **한국 특화**: ✓ (월마감 연동 정합)

> Integration Cloud 주기 운영 = 월마감 시 연동 데이터 정합 + 인증서 갱신 주기 + 분기 용량/성능 점검.

---

## 체크리스트

### 📅 월마감 연동 정합

- [ ] 월마감 전 미처리 메시지 0 (CPI Failed/Retrying clear)
  - 빈도: 월 1회 (월마감 D-1)
  - 담당: 통합 운영
  - 확인: 미반영 트랜잭션이 재무/물류 마감에 누락 없도록

- [ ] Datasphere replication 월말 시점 정합
  - 확인: 소스 ↔ 타깃 행 수 대조 (핵심 테이블 sample)

- [ ] IDoc 미처리(64/51 상태) 잔량 마감 전 처리

### 📅 분기 운영

- [ ] 인증서/secret rotation 계획 실행 (만료 전 무중단 교체)
  - 담당: BTP 관리자
  - 확인: SAML/OAuth/keystore 교체 후 연동 정상

- [ ] iFlow 용량/성능 리뷰 — 처리량 추세, 병목 iFlow 튜닝
- [ ] SLT replication 설정(LTRS) 재튜닝 (볼륨 증가 대응)
- [ ] Integration Suite 분기 릴리스 영향도 검토

### 📅 연간 운영
- [ ] 미사용 iFlow/연결 정리 (보안 표면 축소)
- [ ] 연동 아키텍처 리뷰 (point-to-point → 표준화)

## 한국 현장 체크
- 월마감(D+3) 연계 — Ariba/IBP/SAC 연동 데이터가 마감 전 모두 반영
- 한국 공인인증서 갱신 주기와 연동 인증서 rotation 동기
- 전자세금계산서/EDI 연동 분기 정합 점검

## 관련 참조
- `operational.md` — 일상 모니터링
- `governance.md` — 연동 거버넌스
