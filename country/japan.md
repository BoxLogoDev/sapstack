# Japan SAP Localization (CVI JP)

## 개요
- **Country Version**: JP
- **회계연도**: 4월~3월 (표준), 1~12월 (대안)
- **통화**: JPY (Japanese Yen, 소수점 없음)

## 세무

### 소비세 (Consumption Tax)
- 표준 세율: 10% (식품 및 신문 구독은 8% 경감세율)
- 인보이스 제도 (Qualified Invoice System, 2023년 10월 시행)
- 적격청구서 발행사업자 등록번호 필수
- SAP: V1 (10%), V2 (8% 경감), V0 (면세)

### 인지세 (印紙税)
- 계약서 종류별 차등 부과
- 일정 금액 이상 거래에 적용

## 전자장부 보존법 (i-Bocho)

- **개정 전자장부보존법** (2022년 1월 시행)
- 전자거래 데이터 의무 보존
- 검색 가능성 + 무결성 확보 필요
- 보관 기한: 7년 (법인세법)

## 보고

### JPK (e-Tax)
- 법인세 전자 신고
- 소비세 신고서

### 사회보험
- 후생연금
- 건강보험
- 고용보험
- 노재보험

## 은행

- **Zengin 형식**: 일본 표준 은행 데이터 형식
- DMEE tree: Zengin 표준
- 전국은행자금결제네트워크 (Zengin-Net)

## SAP 특수 사항

- **Country Version JP** 활성화 (CVI 설치)
- 세금 절차: TAXJP
- 회계연도 변형: K1 (4월~3월) 또는 K2 (1~12월)
- Document type: SA (J-GAAP), DR (Domestic), KR (Vendor invoice)

## 주요 SAP Notes
- 1623862: Japan localization general
- 2902966: Qualified Invoice System (인보이스 제도)
