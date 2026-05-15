# Ariba 주기 운영 (Tier 2) Best Practice — 조달 사이클

## 적용 범위
- **S/4 HANA**: ✓
- **ECC**: ✓
- **한국 특화**: ✓ (월마감 매입 정합, 계약 갱신)

> Ariba 주기 운영 = 월간 매입/송장 마감 정합 + Sourcing 이벤트 주기 + 계약 갱신.

---

## 체크리스트

### 📅 월간 매입 마감 정합

- [ ] Ariba Invoice ↔ S/4 MIRO 3-way match 미해결 건 마감 전 정리
  - 빈도: 월 1회 (월마감 전)
  - 담당: 구매/AP 담당
  - 확인: PO-GR-Invoice tolerance 초과 건 해소, 환율 차이 정리

- [ ] 미전송/실패 PO 메시지 잔량 0 (CIG 큐 clear)
  - 확인: 미반영 매입이 재무 마감에 누락되지 않도록

### 📅 분기 운영

- [ ] 계약(Contract) 갱신 임박 목록 — 만료 90일 전 알림 처리
  - 담당: 계약 관리자
  - 확인: renewal/재협상 트리거, 자동 갱신 조건 검토

- [ ] Sourcing savings 추적 (분기 절감 실적)
- [ ] Supplier 성과(SLP) 분기 평가

### 📅 연간 운영
- [ ] 전략 카테고리 소싱 계획 (연간 sourcing wave)
- [ ] Catalog 대규모 갱신 / 가격 재협상

## 한국 현장 체크
- 월마감(D+3) 전 Ariba 매입/송장이 S/4에 모두 반영됐는지
- 전자세금계산서 승인번호 ↔ Ariba invoice 매칭 마감 점검
- 분기 계약 갱신 시 한국 법무 검토 리드타임 반영

## 관련 참조
- `operational.md` — 일상 모니터링
- `governance.md` — 조달 컴플라이언스
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM 매입 정합
