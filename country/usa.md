# USA SAP Localization (CVI US)

## 개요
- **Country Version**: US
- **회계연도**: 자유 선택 (대부분 1~12월 또는 7~6월)
- **통화**: USD (US Dollar)

## 세무

### Sales Tax (No Federal VAT)
- 주(State) + 시(City) + 군(County) 세율 합산
- 50개 주별 세율 다름 (Oregon, Montana, Delaware, NH는 주 sales tax 없음)
- Use Tax: 타주 구매 시 자체 신고
- SAP 연동: Vertex, Avalara, Sovos (third-party tax engine)

### Income Tax
- 연방 + 주 + 시 (NYC, Philadelphia 등)
- Federal: 21% (corporate)
- 주별 다양 (Texas, Florida 등 무세)

### 1099 Reporting
- 외주/프리랜서 지급 시 1099-MISC, 1099-NEC 발행
- 연 600 USD 이상
- IRS 전자 신고

## SOX (Sarbanes-Oxley Act)

- 상장사 의무
- ITGC + 업무처리통제 + 재무공시 통제
- 외부감사인 (SAS 정기 감사)
- 한국 K-SOX의 모태

## 은행

- ACH (Automated Clearing House) 결제망
- 미국 표준 NACHA 형식
- Wire Transfer (Fedwire, CHIPS)
- SAP DMEE: NACHA, Wire format

## SAP 특수 사항

- Country Version US 활성화
- 세금 절차: TAXUS, TAXUSJ (with jurisdiction)
- 회계연도 변형: K1 (1~12월), K2 (7~6월) 등 자유
- Tax Jurisdiction Code 필수 (Vertex/Avalara 연동 시)

## Form 처리

- W-2 (Employee earnings)
- W-9 (Vendor TIN)
- 1099-NEC, 1099-MISC, 1099-INT
- IRS 전자 신고 의무

## 데이터 보호

- HIPAA (의료 정보)
- GLBA (금융)
- 주별 개인정보 보호법 (CCPA - California, BIPA - Illinois)
- 연방 통합법 부재

## 주요 SAP Notes
- 14926: USA localization general
- 1175458: Tax engine integration (Vertex)
- 2517488: 1099 reporting
