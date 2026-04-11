# SAP TR 한국어 전문 가이드

> `plugins/sap-tr/skills/sap-tr/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- SAP 릴리스 + Treasury Risk Management (TRM) 활성화
- 주 거래 통화 (KRW/USD/JPY 등)
- 은행 인터페이스 (MT940 표준 / 한국 펌뱅킹 / SaaS)
- CMS / 자동이체 사용 여부

## 2. Cash Management

### 현금 포지션
- **FF7A**: 현금 포지션 리포트 (일일)
- **FF7B**: 유동성 예측 (중장기)
- 기반 테이블: **FLQDB** (Liquidity Database), **FLQITEM** (Liquidity Items)

### Liquidity Item 마스터
- 계정·문서 분류를 통한 자동 매핑
- **FLQC_DBI**: Liquidity Item 정의

## 3. Bank Statement Processing

### Import & Posting
- **FF_5**: 전자은행명세서 (EBS) 임포트
- **FF67**: 수동 은행명세서 입력
- **FEBAN**: Post-processing (재처리)
- **FF.5**: 은행 statement 조회

### 한국 현장 특이점
- **MT940 표준이 아닌 XML/EDI** 사용 많음
- **한국금융결제원(KFTC)** 포맷 커스텀 빈번
- 국민·신한·우리·하나 등 주요 은행이 **자체 펌뱅킹 포맷** 보유
- BAI 포맷은 한국에서는 거의 안 씀

## 4. Payment Program (F110) — TR 관점

### 설정 (FBZP)
- **Paying Company Codes**
- **Payment Methods in Country (KR)**:
  - T = 이체 (Bank Transfer)
  - C = 수표 (Check) — 한국에서 드묾
  - D = DME (자동이체)
- **Payment Methods in Company Code** — 활성화
- **Bank Determination**:
  - Ranking Order
  - Amounts (한도)
  - Accounts (하우스뱅크 + Account ID)
  - Available amounts
  - Value date

### DME (Data Medium Exchange)
- **DMEE**: DME Engine Tree — 포맷 디자이너
- **OBPM1/OBPM4**: Payment Medium Format 할당

## 5. House Bank

### 트랜잭션
- **FI12** (ECC) / Bank Account Management Fiori (S/4): 하우스뱅크 관리
- **FI13**: House Bank 리스트
- **FBZP**: Bank Determination 설정

### 한국 은행 코드
- 한국은 은행식별코드 + 계좌번호 조합 (IBAN 미사용)
- Bank Key에 한국은행코드 등록
- 하우스뱅크 = 계좌 1:N 가능 (일반/외화/법인/지점)

## 6. TRM — Treasury Risk Management (선택)

### 금융상품 거래
- **FTR_CREATE**: 거래 생성
- **FTR_EDIT**: 거래 수정
- **FTR_00**: 거래 리스트

### 평가
- Spot valuation
- NPV (Net Present Value)
- Mark-to-market

### 한국 특화
- **파생상품** (선물환·IRS·CRS) 회계 처리 복잡
- **K-IFRS** 공시 주의 (위험 관리 목적 vs 투기 구분)
- **외환거래 보고 의무** (한국은행 — 1만 달러 이상)

## 7. 표준 응답 형식

```
## Issue
## Root Cause
## Check (T-code + Table.Field)
## Fix
## Prevention
## SAP Note
```

## 8. 한국 현장 특이사항

### 유동성 예측
- **원화 기준** 유동성 예측이 가장 흔한 use case
- 대기업 본사 재무팀 daily 운영

### 환율 소스
- **KEB 환율**을 외부 환율 소스로 가져오는 프로젝트 다수
- 환율 고시 API 연동 (SAP PI/PO → SAP ECC/S4)

### 자금 관리 (CMS)
- 국내 계좌 이체, 가상계좌 발급, 자동이체 — 별도 커스텀 많음
- 국세·지방세 납부 e-Government 연동

## 9. 자주 참조하는 T-code
FF7A, FF7B, FF_5, FF67, FEBAN, F110, FBZP, FI12, DMEE, FTR_CREATE

## 관련
- `quick-guide.md`
- `/plugins/sap-fi/skills/sap-fi/SKILL.md` — F110 공유
- `/plugins/sap-bc/skills/sap-bc/SKILL.md` — STRUST 인증서 연동
