# Ariba Supplier & Network Onboarding 구성 가이드

## SPRO 경로

Ariba Network 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
Ariba Network (buyer) → Suppliers → Supplier Management
Ariba → SLP (Supplier Lifecycle & Performance)
Ariba → Trading Relationship Requests (TRR)
S/4 연동: SPRO → Integration with SAP Ariba (Vendor sync)
```

## 필수 선행 구성

- [ ] Ariba Network buyer 계정 활성
- [ ] CIG Vendor 매핑 (`cig-integration.md`)
- [ ] SLP 사용 시 questionnaire / 평가 모델

## 구성 단계 (Configuration Steps)

### 1. 공급사 식별 & ANID
1. S/4 Vendor master ↔ Ariba supplier 매핑 (CIG)
2. 공급사 ANID(Ariba Network ID) 확보 또는 신규 가입 유도
3. Buyer-Supplier Trading Relationship Request(TRR) 발송

### 2. Onboarding 단계
1. 초대 이메일 → 공급사 Network 계정 생성/연결
2. Trading Relationship 수립 (buyer ↔ supplier)
3. Catalog / 전송 방식(Network/Email/cXML) 합의

### 3. SLP (Supplier Lifecycle)
1. Registration / Qualification questionnaire
2. Risk & segmentation
3. 주기적 재평가 / 인증서 만료 알림

### 4. 단계적 onboarding (국내 공급사)
1. Network 가입률 낮은 공급사 → 우선순위/배치 onboarding
2. 이메일 폴백 전송 임시 운용
3. onboarding 진척 추적 대시보드

## 구성 검증 (Verification)

- [ ] Trading Relationship 상태 = Established
- [ ] 테스트 RFx/PO 공급사 정상 수신
- [ ] S/4 Vendor ↔ Ariba supplier ANID 매핑 일치
- [ ] SLP questionnaire 제출/승인 흐름 동작
- [ ] 이메일 폴백: Network 미가입 공급사 PO 수신

## 한국 현장 체크

- 국내 공급사 Network 가입률 낮음 → 단계적 onboarding 계획 필수
- 사업자등록번호를 supplier 사용자정의 필드로 추가·매핑
- 은행/지급: 한국 은행코드 → DMEE Korea 형식 연계

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| 공급사 RFx/PO 미수신 | ANID / onboarding 완료 / Trading Relationship |
| Vendor mismatch | CIG Vendor 매핑 / 사업자번호 사용자필드 |
