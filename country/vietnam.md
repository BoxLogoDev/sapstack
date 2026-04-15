# Vietnam SAP Localization (CVI VN)

## 개요
- **Country Version**: VN
- **회계연도**: 1월~12월 (표준), 4월~3월 (재무부 승인 시)
- **통화**: VND (Vietnamese Dong, 소수점 없음, 천 단위 표기 일반적)

## 세무

### VAT
- 일반 세율: 10%
- 경감 세율: 8% (한시적 경기부양), 5% (생필품)
- 영세율: 0% (수출)
- SAP: V1 (10%), V2 (8%), V3 (5%), V0 (면세)

### PIT (Personal Income Tax)
- 5~35% 누진세
- 거주자/비거주자 구분
- 가족공제 11M VND/월

### CIT (Corporate Income Tax)
- 표준 20%
- 우대 세율: 10%, 17% (특정 산업/지역)

## 전자세금계산서 (e-Invoice)

- **GDT (General Department of Taxation)** 시스템 연동 의무
- Decree 123/2020 시행
- 모든 거래 e-Invoice 발행 의무화 (2022년 7월 완료)
- SAP 연동: 인증된 ISP (FPT, VNPT, Misa) 통한 발행

## 사회보험 (3종)

1. **SI (Social Insurance, BHXH)** — 8% (직원), 17.5% (회사)
2. **HI (Health Insurance, BHYT)** — 1.5% / 3%
3. **UI (Unemployment Insurance, BHTN)** — 1% / 1%

## 은행

- 중앙은행: SBV (State Bank of Vietnam)
- 주요 은행: Vietcombank, BIDV, VietinBank, Agribank
- NAPAS 국가 결제 시스템

## SAP 특수 사항

- Country Version VN 활성화
- 세금 절차: TAXVN
- 회계연도 변형: K4 (1~12월)
- e-Invoice 통합: ABAP custom 또는 third-party adapter

## 한국 기업 진출 시 주의사항

- 베트남 진출 한국 제조업 다수 (삼성, LG, 현대, 효성)
- 합자 vs 100% 외국인 투자 구분
- 이전가격 (Transfer Pricing) 의무 보고
- 한-베트남 FTA 활용 (KVFTA)

## 주요 SAP Notes
- 1655497: Vietnam localization general
- 2899137: Vietnam e-Invoice integration
