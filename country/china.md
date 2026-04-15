# China SAP Localization (CVI CN)

## 개요
- **Country Version**: CN
- **회계연도**: 1월~12월 (표준)
- **통화**: CNY (Chinese Yuan)

## 세무

### 증치세 (VAT, 增值税)
- 일반 세율: 13% (제조), 9% (운송/건설), 6% (서비스)
- 소규모 납세자: 3%
- SAP 세금코드: V1 (13%), V2 (9%), V3 (6%), V0 (면세)

### Golden Tax System (金税三期/四期)
- 모든 VAT 인보이스를 정부 시스템에서 발행
- 전자영수증 (Fapiao 发票) 의무화
- 종류:
  - 普通发票 (Common Fapiao)
  - 增值税专用发票 (Special VAT Fapiao)
  - 电子发票 (e-Fapiao, 2023년 확대)
- SAP 연동: SAP GTS Module 또는 third-party (Yonyou, Aisino)

## 외환 관리 (SAFE)

- 국가외환관리국 (SAFE) 신고 의무
- 외환 결제 한도
- 대외 송금 사유 코드 필수

## 사회보험 (5종)

1. 양로보험 (양로 / Pension)
2. 의료보험 (Medical)
3. 실업보험 (Unemployment)
4. 산재보험 (Work Injury)
5. 출산보험 (Maternity, 일부 통합)

+ 주택공적금 (Housing Provident Fund)

## 은행

- 중앙은행: 중국인민은행 (PBOC)
- 주요 은행: 工商, 建设, 农业, 中国银行
- CNAPS (China National Advanced Payment System) 결제망

## SAP 특수 사항

- Country Version CN 활성화
- 세금 절차: TAXCN
- 회계연도 변형: K4
- Localization 추가 모듈: SAP CN Localization (separate license)
- 자산 회계: 중국 회계기준 (CAS) 별도 처리

## 데이터 거주성 (Data Residency)

- 사이버보안법 (CSL, 2017)
- 개인정보보호법 (PIPL, 2021)
- 중국 내 데이터 저장 의무
- SAP Cloud: SAP China cloud (Alibaba Cloud)

## 주요 SAP Notes
- 1597906: China localization general
- 2837617: Golden Tax integration
- 3110425: e-Fapiao
