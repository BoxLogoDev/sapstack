# 하우스뱅크(House Bank) IMG 구성 가이드

## SPRO 경로
```
SPRO → Financial Accounting → Treasury and Transportation Management
    → Cash Management → House Bank Maintenance
```

## 필수 선행 구성

- [ ] OX02: 회사코드 정의 (통화 설정)
- [ ] OB07: 통화 정의

## 하우스뱅크의 개념

**House Bank (거래 은행)**: SAP에서 관리하는 기본 은행

```
구조:
  Company Code (회사코드)
    └─ House Bank (하우스뱅크)
        ├─ Account ID 1 (계좌1, 당좌)
        ├─ Account ID 2 (계좌2, 저축)
        └─ Account ID 3 (계좌3, 외화)
```

---

## 하우스뱅크 정의 (T-code: FI12)

**SPRO 경로**: `SPRO → Financial Accounting → Treasury → Cash Management → Define House Banks`

### 구성 단계 1: 하우스뱅크 마스터

**T-code: FI12 실행**

```
기본정보:
  House Bank: HB-001
  Bank Name: 우리은행 종로지점
  Bank Key: 103 (은행코드)
  Country: KR (한국)
  City: Seoul
```

**필드 설명**:

| 필드 | 설명 | 값 | 비고 |
|------|------|-----|-----|
| House Bank | 하우스뱅크 코드 | HB-001 | 고유, 3자리 |
| Bank Name | 은행명 | 우리은행 | 공식명 |
| Bank Key | 은행 코드 | 103 | 한국: 103(우리), 088(신한) 등 |
| Country | 국가 | KR | ISO 코드 |
| City | 도시 | Seoul | 지점 위치 |
| Telephone | 전화 | 02-XXXX-XXXX | 선택 |
| SWIFT Code | SWIFT | URIIK`RA (우리은행 SWIFT) | 국제거래용 |

**한국 주요 은행코드**:

| 은행 | 코드 | SWIFT |
|------|------|--------|
| 우리은행 | 103 | URIKRRA |
| 신한은행 | 088 | SHBKKRSE |
| KB국민은행 | 004 | KBKCKRSE |
| 하나은행 | 081 | HNBAKRSE |
| NH농협 | 011 | NONHKRSE |
| 우체국 | 034 | POSTKRSE |

### 구성 단계 2: 은행 계좌 정의

**T-code: FI12 실행 (계좌 탭)**

```
하우스뱅크: HB-001
계좌 정보:

Account ID: 1001
  Account Short Name: 당좌계좌
  Account Number: 123-456-789012
  GL Account: 110000 (현금 - 당좌)
  Currency: KRW
  Bank Account Type: 1 (당좌)
  
Account ID: 1002
  Account Short Name: 저축계좌
  Account Number: 123-456-789013
  GL Account: 110100 (현금 - 저축)
  Currency: KRW
  Bank Account Type: 2 (저축)
  
Account ID: 1003
  Account Short Name: 외화계좌 (USD)
  Account Number: 123-456-789014
  GL Account: 115000 (외화 - USD)
  Currency: USD
  Bank Account Type: 3 (외화)
```

**필드 설명**:

| 필드 | 설명 | 값 | 비고 |
|------|------|-----|------|
| Account ID | 계좌 ID | 1001, 1002 등 | 고유 |
| Account Short Name | 계좌명 | 당좌계좌 | 간단명확 |
| Account Number | 계좌번호 | 123-456-789012 | 은행 발급 |
| G/L Account | GL 계정 | 110000 | 현금 계정 필수 |
| Currency | 통화 | KRW, USD 등 | 계좌 통화 |
| Bank Account Type | 계좌유형 | 1(당좌), 2(저축) | 지급 방식에 영향 |

### 구성 단계 3: 은행 연결 정보

**T-code: FI13 (은행 연결 세부사항)**

```
T-code: FI13 실행

House Bank: HB-001
Account ID: 1001

연결정보:
  IBAN: KR54-0103-1234-5678-9012 (국제 계좌번호)
  BIC/SWIFT: URIKRRA
  Bank Country: KR
  Bank Clearing Code: 103
  Collection Agency: Yes/No
  Direct Debit: Yes/No
```

**연결 목적**:
- 국제 거래 (IBAN/BIC)
- 대금 징수 (Collection)
- 직불 (Direct Debit)
- SEPA 거래 (유럽)

---

## 지급 프로그램 정의 (T-code: FBZP)

**SPRO 경로**: `SPRO → Financial Accounting → Treasury → Cash Management → Payment Program Settings`

### 구성 단계

```
T-code: FBZP 실행

Payment Method: T (이체)
Country: KR (한국)
House Bank: HB-001
Account ID: 1001

설정항목:
  Payment Method Name: 은행이체
  Print Specification: 없음 (자동)
  Format: DMEE (한국 은행 포맷)
  Sending Method: SWIFT (국제) / SFTP (국내)
```

**주요 지급방식**:

| 방식 | 코드 | 설명 | 사용 | 시스템 |
|------|------|------|------|--------|
| 이체 | T | 은행 이체 | O | DMEE/SWIFT |
| 수표 | C | 수표 발급 | △ | 수동 |
| 현금 | X | 현금 지급 | X | 미지원 |
| 직불 | D | 직불 | △ | 선택 |

**필드 설명**:

| 필드 | 설명 | 값 | 용도 |
|------|------|-----|------|
| Payment Method | 지급 방식 | T (이체) | 고유 |
| Country | 국가 | KR | 로컬 정책 |
| House Bank | 하우스뱅크 | HB-001 | 필수 |
| Account ID | 계좌 ID | 1001 | 필수 |
| Format | 파일 포맷 | DMEE | 은행 파일 생성 |
| DMEE Variant | DMEE 변형 | KR-DOMESTIC | 한국 국내송금 |

---

## DMEE 파일 포맷 (T-code: DMEE)

**목적**: 은행이 요구하는 파일 형식으로 자동 생성

### 구성 단계

```
T-code: DMEE 실행

DMEE Variant: KR-DOMESTIC
Description: 한국 국내송금 (기본 KRW)

Format:
  Type: 표준 송금 파일
  Record Format: 
    Header: 거래처금액 합계
    Detail: 개별 거래
    Trailer: 총합
```

**한국 은행별 DMEE**:

```
우리은행 (103):
  변형: DMEE-KR-WR
  포맷: 우리은행 FTP 형식
  
신한은행 (088):
  변형: DMEE-KR-SH
  포맷: 신한 EFT 형식
  
NH농협 (011):
  변형: DMEE-KR-NH
  포맷: 농협 FTP 형식
```

---

## 월별 하우스뱅크 운영

### 월초
```
1. 현금 포지션 확인
   - T-code: FF.1 또는 FF.3
   - 계좌별 잔액 확인
   
2. 지급 스케줄 확인
   - 월중 만기 채무 조회
```

### 월중
```
1. 일일 현금 흐름 모니터링
   - T-code: FF.3 (현금 분석)
   - 과부족 예측
   
2. 계좌별 잔액 조회
   - T-code: FBL3N (당좌/저축)
   - FF.2 (은행 조정 전)
```

### 월말
```
1. 지급 배치 생성
   - T-code: F110 (지급 제안)
   - 지급 대상 선정
   
2. 지급 실행
   - T-code: F110S (최종 승인)
   - DMEE로 파일 생성
   
3. 은행 송금
   - SFTP 또는 SWIFT 전송
   - 거래 확인
   
4. 은행명세서 수령
   - MT940 자동 다운로드 (또는 수동)
   - FF.2: 은행 조정
   - FBL5N: GL 항목 대사
```

---

## 다중 통화 관리

### 외화 계좌 설정

```
House Bank: HB-001
Account ID: 1003 (USD 계좌)
  Account Number: 123-456-789014
  GL Account: 115000 (외화 자산)
  Currency: USD
  
사용 시나리오:
  - 수출 수금 (USD)
  - 해외 공급업체 지급 (USD)
  - 국제 이체
```

### 환율 관리 (T-code: OB08)

```
T-code: OB08 실행

환율유형: M (시장)
From Currency: USD
To Currency: KRW
Date: 2024-01-31
Rate: 1 USD = 1,300 KRW
```

**사용 시점**:
```
USD 10,000 입금:
  USD 계좌 기록: 10,000 USD
  KRW 환산: 10,000 × 1,300 = 13,000,000 KRW
  
수입 통관료 지급 (USD 500):
  USD 계좌: -500 USD
  비용 기록 (KRW): 500 × 1,300 = 650,000 KRW
```

---

## 은행 조정 (T-code: FF.2)

**목적**: SAP 기록 vs 은행 명세서 대사

### 조정 절차

```
T-code: FF.2 실행

House Bank: HB-001
Account ID: 1001
Period: 202401

조정항목:
  SAP 현금 기록: 50,000,000 KRW
  은행명세서: 49,500,000 KRW
  차이: 500,000 KRW (미반영 거래)
  
원인 조사:
  ├─ 입금 수표 미도착
  ├─ 은행 수수료
  └─ 환율 손실
```

---

## ECC vs S/4HANA

| 항목 | ECC | S/4 |
|------|-----|-----|
| **하우스뱅크** | FI12 (동일) | FI12 (동일) |
| **지급 프로그램** | FBZP (동일) | FBZP (동일) |
| **DMEE** | 포맷 정의 | 자동 생성 강화 |
| **MT940** | 수동 임포트 | TFFM (자동) |
| **다중 통화** | 제한적 | 완전 지원 |

---

## 주의사항

1. **계좌번호 정확성**
   - 입력 오류 시 지급 불가
   - 정기적 은행 확인 (송금 실패)

2. **GL 계정 연계**
   - Account ID → GL 계정 일대일 필수
   - 현금 계정만 연계 (자산)

3. **지급 방식 선택**
   - 국내: T (이체) 또는 C (수표)
   - 국제: T (SWIFT)
   - 일관성 유지

4. **통화 혼동 방지**
   - 계좌별 통화 명확히
   - USD/EUR 혼용 시 환율 주의

5. **월말 마감**
   - F110 완료 후 FF.2로 조정
   - OB52: 기간 잠금 전 현금 확정

---

## 관련 T-codes

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **FI12** | 하우스뱅크 + 계좌 | 초기 설정 |
| **FI13** | 은행 연결 정보 | 초기 설정 |
| **FBZP** | 지급 프로그램 | 초기 설정 |
| **DMEE** | 지급 파일 포맷 | 초기 설정 |
| **F110** | 지급 제안 | 월말 |
| **F110S** | 지급 실행 | 월말 |
| **FF.2** | 은행 조정 | 월말 |
| **FF.3** | 현금 분석 | 월중 |
| **FBL3N** | 당좌/저축 조회 | 일상 |
| **OB08** | 환율 정의 | 월말 |

## 체크리스트

- [ ] FI12: 전체 거래 은행 정의
- [ ] FI13: 국제 거래 정보 입력 (필요시)
- [ ] FBZP: 지급 방식별 프로그램 설정
- [ ] DMEE: 은행 파일 포맷 확인
- [ ] 테스트: 샘플 지급 배치 생성 → 파일 검증
- [ ] 월말 프로세스: F110 → F110S → FF.2 검증
