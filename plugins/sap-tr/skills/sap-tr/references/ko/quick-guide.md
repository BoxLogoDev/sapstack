# sap-tr 한국어 퀵가이드

## 🔑 환경 인테이크
1. SAP 릴리스 + TRM(Treasury Risk Management) 활성화 여부
2. 거래 통화 (KRW/USD/JPY ...)
3. 은행 인터페이스 방식 (MT940 / H2H / SaaS)

## 📚 핵심

### Cash Management
- **FF7A**: 현금 포지션
- **FF7B**: 유동성 예측
- **FLQDB / FLQITEM**: Liquidity Item 마스터
- Bank Statement Upload: **FF_5**, **FEBAN**

### Payment
- **F110**: 지급실행 (FI와 공유)
- **DMEE**: 지급 매체 포맷 (한국 은행별)
- **FI12 / BAM (S/4)**: House Bank 관리

### 한국 은행 연동
- 국민/신한/우리/하나 등 주요 은행 **자체 펌뱅킹 포맷** 존재
- MT940 표준이 아닌 **XML/EDI** 사용 사례 많음
- **한국금융결제원(KFTC)** 전자금융 표준 참고
- 자동이체(CMS), 가상계좌 발급은 별도 커스텀 다수

### TRM (선택적)
- **FTR_CREATE**: 금융상품 거래 생성
- 파생상품(선물환, IRS, CRS) 회계 처리 복잡 — K-IFRS 공시 주의

## 🇰🇷 특화
- **원화 유동성 예측**이 가장 흔한 use case
- **KEB 환율 고시**를 외부 환율 소스로 가져오는 프로젝트 다수
- **한국은행(BOK) 보고**: 외환거래 보고 의무 (1만불 이상)

## ⚠️ 주의
- 운영 환경 House Bank 변경은 반드시 Transport + 시뮬레이션
- MT940 테스트 환경 필수 — 실 운영 first try 금지
