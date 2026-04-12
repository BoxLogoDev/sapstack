# 은행명세서 처리 IMG 구성 가이드

## SPRO 경로
```
SPRO → Financial Accounting → Treasury
    → Electronic Bank Statement → Statement Processing
```

## 필수 선행 구성

- [ ] FI12: 하우스뱅크 정의
- [ ] FI13: 은행 연결 정보
- [ ] FBZP: 지급 프로그램 정의

## 은행명세서의 개념

**Electronic Bank Statement (EBS)**: 은행에서 제공하는 전자 거래 명세서

**포맷**:
- MT940 (SWIFT 표준): 국제 거래
- 국내 포맷: 각 은행별 (한국)
- CAMT.053 (신 표준): 점진적 도입

**흐름**:
```
은행 (SFTP 서버)
    ↓
SAP 자동 다운로드 (또는 수동 업로드)
    ↓
FF_5 (명세서 처리)
    ↓
자동 거래 대사 (Matching)
    ↓
GL 계정 조정
```

---

## 은행명세서 포맷 정의 (T-code: FF_5)

**SPRO 경로**: `SPRO → Financial Accounting → Treasury → Electronic Bank Statement → Define Statement Format`

### 구성 단계 1: 명세서 유형 정의

```
T-code: FF_5 실행

Statement Format: MT940
Description: SWIFT 표준 명세서
Country: KR (한국) 또는 국제
Format Type: SWIFT
```

**주요 명세서 포맷**:

| 포맷 | 설명 | 사용 국가 | 특징 |
|------|------|---------|------|
| MT940 | SWIFT 표준 | 국제 | 거래 상세 + 잔액 |
| CAMT.053 | ISO 신표준 | EU/아시아 | XML 기반 |
| 은행 독점 | 국내 형식 | 한국 | 은행별 상이 |
| BAI (국제) | 국제 표준 | 미국/EU | 상세 정보 |

**한국 주요 포맷**:

```
우리은행: proprietary format (SFTP)
신한은행: proprietary format (SFTP)
NH농협: 통용 format (FTP)
국토교통부: 정부간 format
```

### 구성 단계 2: 명세서 라인 정의

**MT940 표준 구조**:

```
Header (:20:)
  Reference: STATEMENT-001

Account (:25:)
  Account Number: 123456789012

Opening Balance (:60:)
  Date: 2024-01-01
  Amount: 50,000,000 KRW

Transactions (:61:)
  Date: 2024-01-15
  Amount: -5,000,000 KRW
  Type: DEBIT
  Reference: CHK-001234
  Description: Check Payment

Closing Balance (:62:)
  Date: 2024-01-31
  Amount: 45,000,000 KRW
```

**필드 분석**:

| 필드 | 설명 | 예시 | 용도 |
|------|------|------|------|
| Reference | 거래 참조 | CHK-001234 | 대사 기준 |
| Amount | 거래액 | 5,000,000 | GL 계정 매핑 |
| Type | 거래 유형 | DEBIT/CREDIT | 자동 대사 |
| Description | 설명 | Check Payment | 상대방 식별 |
| Bank Balance | 은행 잔액 | 45,000,000 | 조정용 |

---

## 자동 거래 대사 규칙 설정

### 외부 거래 유형 정의 (T-code: FFVT)

**SPRO 경로**: `SPRO → Financial Accounting → Treasury → Electronic Bank Statement → Maintain External Transaction Types`

```
T-code: FFVT 실행

External Trx Type: CHK (수표)
Description: Check Debit
Bank Debit/Credit: D (Debit)
Posting Rule: 
  └─ GL Account: 110000 (현금)
  └─ Partner Bank: (수표 발행 은행)

External Trx Type: DEP (입금)
Description: Deposit
Bank Debit/Credit: C (Credit)
Posting Rule:
  └─ GL Account: 110000
  └─ Partner: (입금 출처)
```

**표준 외부 거래 유형**:

| 코드 | 설명 | 차/대 | 대사 방식 |
|------|------|------|---------|
| CHK | 수표 | D | 수표 번호 |
| DEP | 입금 | C | 거래처명 |
| INT | 이자 | C | 자동 (금리) |
| FEE | 수수료 | D | 자동 (은행 정책) |
| EXC | 환율 | D/C | 자동 (환율 변동) |
| TRF | 이체 | D/C | 거래처명 |
| OTH | 기타 | D/C | 수동 |

### 자동 대사 프로필 (T-code: FFD1 또는 FF_8)

**목적**: 은행명세서 거래 → SAP GL 거래 자동 매핑

```
T-code: FF_8 또는 FFD1 실행

Matching Profile: MATCH-001
Description: 자동 대사 기본 규칙
House Bank: HB-001
Account ID: 1001
```

**대사 규칙 예시**:

```
Rule 1: 수표 대사
  External Trx: CHK (은행명세서)
  SAP Document Type: C (배분장)
  Matching Key: Check Number
  GL Account: 110000 (현금)
  
  효과: 
    은행명세서의 CHK-001234
    ↔ SAP의 Check Number 001234
    → 자동 대사

Rule 2: 입금 대사
  External Trx: DEP (입금)
  SAP Document Type: DZ (송장)
  Matching Key: Payer Name + Amount
  GL Account: 110000
  
  효과:
    은행명세서: CUSTOMER ABC INC, 10,000,000
    ↔ SAP: Customer CUST001, Invoice INV-123
    → 자동 대사

Rule 3: 이자 입금
  External Trx: INT (이자)
  SAP Document Type: (자동 생성)
  Matching Key: Amount (금액만)
  GL Account: 450100 (이자 수익)
  
  효과:
    은행 이자: 50,000 KRW
    → SAP: 전기 자동 생성
```

---

## 월별 은행명세서 처리

### 월중: 명세서 수령 및 로드

**자동 다운로드** (T-code: TFFM — S/4HANA 권장)

```
T-code: TFFM (또는 FF_BFIMP)

House Bank: HB-001
Account ID: 1001
Period: 202401
Download Method: SFTP 자동
Result: 명세서 수령 완료
```

**수동 임포트** (T-code: FF_5)

```
T-code: FF_5

1. 은행으로부터 MT940 파일 수령
2. FF_5 → Import 클릭
3. 파일 선택: statement_2024_01.txt
4. Format 선택: MT940
5. 실행 → 명세서 로드
```

### 월말: 자동 대사 및 조정

**Step 1: 자동 대사 실행**

```
T-code: FF_5 또는 FF_8

Period: 202401
Matching Profile: MATCH-001
Run Automatic Matching

결과:
  ├─ Matched Items: 85% (대사됨)
  └─ Unmatched Items: 15% (미대사)
```

**Step 2: 미대사 항목 조사**

```
T-code: FF_9 (미대사 항목 조회)

미대사 사유:
  ├─ Amount Difference (금액 차이): 수수료 미반영
  ├─ Date Difference (날짜 차이): 은행 처리 지연
  ├─ Missing SAP Document (미매칭): 자동 생성 필요
  └─ Manual Review Required (수동): 특수 거래

조치:
  - 자동 대사 불가: 수동 매칭
  - 은행 오류: 은행 확인
  - SAP 오류: 거래 정정 (FB03)
```

### Step 3: 은행 조정 (T-code: FF.2)

**목적**: SAP GL 계정 vs 은행명세서 최종 대사

```
T-code: FF.2 실행

House Bank: HB-001
Account ID: 1001
Statement Period: 202401

조정 내역:
  은행 최종 잔액 (명세서): 45,000,000 KRW
  
  SAP 기록:
    Initial Balance: 50,000,000
    Debits: -5,000,000 (지급)
    Credits: 0
    SAP Ending Balance: 45,000,000
  
  차이: 0 (일치) ✓
```

**조정 필드**:

| 항목 | 값 | 설명 |
|------|-----|------|
| Bank Statement Balance | 45,000,000 | 은행 최종 잔액 |
| Outstanding Payments | 0 | 미도착 지급 |
| Outstanding Receipts | 0 | 미도착 입금 |
| Bank Fees | 0 | 은행 수수료 |
| Interest | 0 | 이자 |
| Calculated SAP Balance | 45,000,000 | SAP 계산 잔액 |
| Difference | 0 | 차이 |

### Step 4: GL 확인 (T-code: FBL5N)

```
T-code: FBL5N (GL 항목 조회)

GL Account: 110000 (현금)
Period: 202401
Balance: 45,000,000 KRW ✓

거래 명세:
  Opening Balance: 50,000,000
  Checks: -5,000,000
  Closing Balance: 45,000,000
```

---

## 국내외 은행명세서 처리 차이

### 국제 (MT940 SWIFT)

```
장점:
  - 표준화: 모든 국가 동일
  - 상세: 거래 정보 완전
  - 자동화: 대사 용이
  
사용 은행: HSBC, Citibank 등 (국제 대형 은행)

포맷 예시:
  :20:STATEMENT-001
  :25:KR54-0103-1234-5678-9012
  :60:D240101,KRW50000000,
  :61:2401150101D5000000NDEBT001CHK001234,
  :86:Check Payment to Vendor ABC
  :62:D240131,KRW45000000,
```

### 국내 (은행별 포맷)

```
우리은행 (SFTP):
  - 포맷: txt (고정폭)
  - 인증: 공인인증서 또는 보안토큰
  - 수수료: 월 30,000원 ~ 50,000원

신한은행 (FTP):
  - 포맷: 신한 EFT (고유)
  - 인증: ID/PW
  - 수수료: 월 20,000원 ~ 40,000원

농협 (SFTP):
  - 포맷: 국제 표준 호환
  - 인증: 공인인증서
  - 수수료: 월 15,000원 ~ 35,000원
```

---

## ECC vs S/4HANA

| 항목 | ECC | S/4 |
|------|-----|-----|
| **명세서 로드** | FF_5 (수동) | TFFM (자동) |
| **자동 대사** | FF_8 (배치) | FFD1 (실시간) |
| **은행 연결** | 수동 (FTP) | 자동 (API) |
| **미대사 항목** | FF_9 (조회) | 통합 UI |
| **MT940 지원** | 기본 | 완전 |
| **CAMT.053** | 미지원 | 지원 |

---

## 주의사항

1. **명세서 포맷 일관성**
   - 은행과 SAP 포맷 매칭 필수
   - 포맷 변경 시 규칙 재설정

2. **자동 대사 한계**
   - 정확도 85~95% (산업 기준)
   - 미대사 항목은 수동 처리 필수

3. **시간차 거래 관리**
   - 은행 처리: 1~3일 소요
   - FF.2 조정 필수

4. **월말 마감 순서**
   ```
   1. F110S: 지급 배치 완료
   2. 은행 명세서 수령 (다음 영업일)
   3. FF_5: 자동 대사 실행
   4. FF.2: 은행 조정
   5. 차이 조사
   6. OB52: 기간 잠금
   ```

5. **환율 손실 반영**
   - 외화 계좌: 환율 차이 발생
   - OBA1: 실현손익 자동 계산
   - GL 조정 필수

---

## 관련 T-codes

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **FF_5** | 명세서 포맷 정의 | 초기 설정 |
| **FFVT** | 외부 거래 유형 | 초기 설정 |
| **FF_8** | 자동 대사 프로필 | 초기 설정 |
| **TFFM** | 명세서 자동 다운로드 | 월중 (S/4) |
| **FF_9** | 미대사 항목 조회 | 월말 |
| **FF.2** | 은행 조정 | 월말 |
| **FBL5N** | GL 항목 조회 | 검증 |
| **OB08** | 환율 정의 | 월말 |

## 체크리스트

- [ ] FF_5: 명세서 포맷 정의 (MT940 또는 국내)
- [ ] FFVT: 외부 거래 유형 정의
- [ ] FF_8: 자동 대사 프로필 설정
- [ ] 은행 연결: SFTP/FTP 자동 다운로드 테스트
- [ ] 테스트: 샘플 명세서 자동 대사 검증
- [ ] 월말 프로세스: FF.2 → FBL5N 검증
