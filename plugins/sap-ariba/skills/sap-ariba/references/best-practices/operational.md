# Ariba 일상 운영 (Tier 1) Best Practice

## 적용 범위
- **S/4 HANA**: ✓ (CIG / ERP Add-on)
- **ECC**: ✓ (일부 제한)
- **한국 특화**: ✓ (부가세, 사업자번호, 국내 공급사 onboarding)

---

## 체크리스트

### 📊 일간 (Daily) 운영

#### CIG 메시지 큐
- [ ] **CIG Monitor → Message status**
  - 왜: PR/PO/Invoice 미전송 → 조달 지연
  - 빈도: 일간 (오전)
  - 담당: 통합/조달 운영
  - 확인항목: error 0, retry 적체 없음, S/4 SLG1 CIG 로그 클린

#### CIG Worker / Cloud Connector
- [ ] **Cloud Connector status GREEN**
  - 왜: Worker DOWN 시 전체 연동 중단
  - 빈도: 일간
  - 담당: 통합 담당

#### 미수신 PO / RFx
- [ ] 공급사 미수신 알림 확인 (Trading Relationship 상태)
  - 빈도: 일간
  - 담당: 조달 운영
  - 확인: ANID 등록/onboarding 완료 여부

### 📅 주간 (Weekly) 운영

- [ ] Invoice exception(3-way match 실패) 처리 현황
- [ ] PR 승인 적체 — delegation/조직변경 approver 점검
- [ ] 진행 중 Sourcing 이벤트 마감 임박 모니터
- [ ] 신규 공급사 onboarding 진척 (국내 공급사 우선)

## 한국 현장 체크
- 한국 부가세 코드 V0~V9 ↔ Ariba tax mapping 일치
- 사업자등록번호 사용자정의 필드 동기
- 국내 공급사 Network 미가입 → 이메일 폴백 전송 운용

## 관련 참조
- `../img/cig-integration.md`
- `period-end.md` — 조달 주기 운영
- `governance.md` — 조달 통제
