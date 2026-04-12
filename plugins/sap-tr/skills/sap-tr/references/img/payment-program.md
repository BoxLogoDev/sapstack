# 지급 프로그램 (F110/FBZP) IMG 구성 가이드

## SPRO 경로
`SPRO → Financial Accounting → AR/AP → Business Transactions → Outgoing Payments → Automatic Outgoing Payments`

## 필수 선행 구성
- [ ] 하우스뱅크 정의 (FI12)
- [ ] 공급업체 마스터 — 지급방법(ZWELS), 은행정보(LFBK) 설정
- [ ] GL 계정 — 은행 계정 생성 (FS00)

## 구성 단계

### 1. Paying Company Codes — T-code: FBZP
- `FBZP > All Company Codes`
- 필드:
  - Paying Company Code: 지급 실행 회사코드
  - Minimum amount for payment: 최소 지급금액
  - No exchange rate differences: ✓ (한국 원화 단일 통화)

### 2. Payment Methods (국가별) — T-code: FBZP
- `FBZP > Payment Methods in Country`
- 국가: KR (한국)
- 지급방법:
  - T (은행이체/Transfer) — 가장 일반적
  - C (수표/Check) — 종이 수표
  - E (전자이체/Electronic) — 대량 이체
- 필드:
  - Payment method classification: Bank transfer
  - Required master record specifications: Bank details of vendor
  - Post payment orders: ✓
  - Payment medium: DMEE format tree

### 3. Payment Methods (회사별) — T-code: FBZP
- `FBZP > Payment Methods in Company Code`
- 회사코드별 사용할 지급방법 활성화
- 필드:
  - Minimum/Maximum amount: 건별 한도
  - Foreign payments allowed: (해외 송금 시)

### 4. Bank Determination — T-code: FBZP
- `FBZP > Bank Determination`
- Ranking Order: 하우스뱅크 우선순위
- Bank Accounts: Account ID별 Amount limits
- Available Amounts: 계좌별 가용 금액 한도
- Value Date: 기산일 설정

### 5. DMEE 형식 트리 — T-code: DMEE
- 은행 지급 파일 형식 정의
- 한국 은행별 표준 형식 (각 은행 전용 DMEE tree)
- 필드 매핑: 수취인명, 계좌번호, 금액, 적요

## 구성 검증
- F110 테스트 실행 (Proposal 생성만 — 실제 지급 전)
- Proposal Log 확인: 벤더 선택 여부, 하우스뱅크 할당
- Payment Medium 생성: DMEE 파일 미리보기

## ECC vs S/4
| 항목 | ECC | S/4HANA |
|------|-----|---------|
| 지급 프로그램 | F110 | F110 (동일) |
| DMEE | DMEE | DMEE (동일) |
| Bank Account | FI12 | FI12 + Bank Account Management |
| 지급 승인 | 수동 | 워크플로 기반 승인 (선택) |

## 주의사항
- F110은 **반드시 Proposal → Payment Run 2단계**로 실행
- Proposal 단계에서 문제 발견 시 삭제 후 재실행
- DMEE tree를 은행에 맞게 커스터마이징해야 함 (한국 은행별 상이)
- 대량 지급 시 은행 이체 한도 확인 (건별/일별)
