# Ariba 거버넌스 (Tier 3) Best Practice

## 적용 범위
- **S/4 HANA**: ✓
- **ECC**: ✓
- **한국 특화**: ✓ (K-SOX 조달 통제, 공정거래)

---

## 체크리스트

### 🔐 분리 & 승인 통제 (SoD)

- [ ] 요청자 / 승인자 / 구매자 역할 분리
  - 왜: 부정 조달 방지 (K-SOX 내부통제)
  - 담당: 조달 보안 관리자
  - 확인: PR 작성자 ≠ 최종 승인자, approval rule 금액 임계 적정

- [ ] Approver delegation 통제
  - 확인: 위임 이력 audit, 무단 위임 차단

### 📋 감사 추적

- [ ] Sourcing 이벤트 audit (참가자/입찰/낙찰 근거)
  - 빈도: 이벤트별 + 분기 감사
  - 확인: 낙찰 사유 기록, 단독입찰 정당성

- [ ] 계약 변경 이력 (redline/version/서명)
  - 확인: 계약 조항 변경 추적 가능

- [ ] PR-to-PO-to-Invoice 전 과정 추적
  - 확인: S/4 ↔ Ariba 문서 체인 일관

### 🌐 컴플라이언스

- [ ] 공급사 적격성/제재 리스트 점검 (SLP)
  - 왜: 거래제한 대상 회피 (수출통제·제재)
  - 확인: SLP qualification + 제재 스크리닝

- [ ] 공정거래 — 하도급 대금 지급 기한 준수 추적 (한국)
  - 확인: 지급 기한, 대금 지연 모니터

- [ ] 개인정보(공급사 담당자) 최소수집 (PIPA)

## 한국 현장 체크
- K-SOX: 조달이 비용/재고에 영향 → 조달 통제 문서화
- 하도급법: 대금 지급 기한(60일) 준수 모니터링
- 제재/수출통제: GTS 연계 스크리닝 (해외 공급사)
- SI/외부 Ariba 접근 권한 주기 회수

## 관련 참조
- `operational.md` / `period-end.md`
- `../../../sap-gts/skills/sap-gts/SKILL.md` — 제재 스크리닝 연계
- `../../../sap-fi/skills/sap-fi/references/best-practices/governance.md`
