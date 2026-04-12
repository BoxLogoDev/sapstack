# DMEE (Data Medium Exchange Engine) IMG 구성 가이드

## SPRO 경로
```
SPRO → Financial Accounting → Treasury
    → Payments → Payment File Formats → DMEE Settings
```

## 필수 선행 구성

- [ ] FI12: 하우스뱅크 정의
- [ ] FBZP: 지급 프로그램 정의
- [ ] 은행 연결 정보 (은행에서 제공한 포맷 명세)

## DMEE의 개념

**DMEE (Data Medium Exchange Engine)**: 
- SAP의 표준 지급 파일 생성 엔진
- 전자지급 표준화 (SWIFT, ISO 20022, 국내 은행 포맷)
- 수동 포맷 정의 불필요 (SAP 제공)

**용도**:
```
SAP 지급 배치 (F110S)
    ↓
DMEE 엔진
    ↓
은행 파일 생성 (MT103, 국내 포맷)
    ↓
은행에 제출
```

---

## DMEE 설정 (T-code: DMEE)

**SPRO 경로**: `SPRO → Financial Accounting → Treasury → Payments → Payment File Formats → DMEE Settings`

### 구성 단계 1: DMEE 변형 선택

**T-code: DMEE 실행**

```
초기 화면: DMEE Variant 선택

표준 변형:
  ├─ INT-SEPA: EU (SEPA Credit Transfer)
  ├─ INT-CT: 국제 이체 (SWIFT MT103)
  ├─ KR-DOMESTIC: 한국 국내송금
  ├─ KR-ONUS: 한국 해외송금
  └─ (기타 국가별 변형)
```

**한국 주요 변형**:

| 변형 | 설명 | 사용 대상 | GL 계정 |
|------|------|---------|--------|
| KR-DOMESTIC | 국내 송금 | 국내 거래처 | 200000 (채무) |
| KR-ONUS | 해외 송금 | 해외 거래처 | 200100 (외화채무) |
| KR-BULK | 대량 송금 | 급여, 배당금 | 220000 (급여) |
| INT-CT | 국제 이체 | 해외 자회사 | 200200 (내부채무) |

### 구성 단계 2: 변형별 파라미터 설정

**T-code: DMEE (Configuration Tab)**

```
Variant: KR-DOMESTIC
Description: 한국 국내 은행 송금

파라미터 설정:
  Record Format: 한국 표준 고정폭
  Header:
    - 거래처 수: 자동 계산
    - 총액: 자동 계산
    - 통화: KRW (고정)
  
  Detail (개별 거래):
    - 거래처번호
    - 거래처명
    - 거래처 계좌
    - 송금액
    - 송금사유
  
  Trailer:
    - 검산 코드 (은행 검증)
    - 보안 정보
```

**상세 필드**:

| 필드 | 설명 | 값 | 용도 |
|------|------|-----|------|
| Variant | 변형 코드 | KR-DOMESTIC | 고유 |
| Description | 설명 | 한국 국내 송금 | 관리 |
| Country | 국가 | KR | 지역 규칙 |
| Currency | 통화 | KRW | 기본 통화 |
| Format | 파일 형식 | TXT (고정폭) | 은행별 상이 |
| Character Set | 문자 인코딩 | EUC-KR 또는 UTF-8 | 한글 처리 |
| Segment | 레코드 구조 | 가변길이 또는 고정폭 | 은행 요구사항 |

---

## 한국 은행별 DMEE 변형

### 우리은행 (Bank Code 103)

```
Variant: KR-103-DOMESTIC

Header:
  레코드 유형: H
  작성일: YYYYMMDD
  작성기관: "우리은행"
  일련번호: 자동 증가
  
Detail:
  레코드 유형: D
  순번: 0001~9999
  거래처 계좌: 123-456-789012
  거래처명: (한글, 최대 20자)
  송금액: 자리올림 (최우측부터)
  통화: KRW (고정)
  
Trailer:
  레코드 유형: T
  총 거래건수: 자동
  총액: 자동
  검산 코드: Checksum
  
파일명: WOORI_YYYYMMDDhhmmss.txt
인코딩: EUC-KR
```

**우리은행 파일 예시**:

```
H우리은행         202401151430000000000001
D0001123456789012홍길동                    0000000100000000000KRW수수료송금
D0002234567890123김영수                    0000000250000000000KRW용역비송금
D0003345678901234이순신                    0000000150000000000KRW배당금송금
T000300000005000000000KRW999999
```

### 신한은행 (Bank Code 088)

```
Variant: KR-088-DOMESTIC

Header:
  거래은행: 신한은행
  작성기간: YYYYMMDD HHMMSS
  
Detail:
  순번: 자동 증가 (001부터)
  거래처 계좌: 계좌번호 (하이픈 제거)
  거래처명: (한글)
  송금액: 자리올림
  
특수사항:
  - 소액 송금 수수료 정책 포함
  - 배분장(분할) 지원
  - 긴급 송금 플래그 가능
```

### NH 농협 (Bank Code 011)

```
Variant: KR-011-DOMESTIC

Header:
  발송기관: 농협
  파일번호: 자동
  
Detail:
  거래처ID: 거래처마스터 ID
  거래처 계좌: 농협 형식
  금액: 자리올림
  
Trailer:
  통계: 건수, 합계, 검증값
  
특수사항:
  - 정산 계좌 자동 매칭
  - 선물 옵션 거래 지원
```

---

## F110 → F110S → DMEE 플로우

### Step 1: 지급 제안 (F110)

```
T-code: F110 실행

기본정보:
  회사코드: 1000
  지급 방식: T (이체)
  지급 통화: KRW
  지급일: 2024-01-31
  하우스뱅크: HB-001
  계좌 ID: 1001

선택 기준:
  ├─ 당일 만기 채무
  ├─ 할인 조건 만족
  └─ 신용도 양호

결과:
  Payment Proposal 0000000001 생성
  대상 거래처: 5건
  총액: 500,000,000 KRW
```

**선택 거래처** (F110 결과):

```
Vendor | Invoice | Amount | Days Overdue | Discount | Action
======================================================
V-001 | INV-2401 | 100M | 10 | 2% | Selected
V-002 | INV-2402 | 150M | 5 | None | Selected
V-003 | INV-2403 | 100M | 0 | 5% | Skipped (early)
V-004 | INV-2404 | 50M | 15 | None | Selected
V-005 | INV-2405 | 100M | 30 | 3% | Selected
```

### Step 2: 지급 실행 (F110S)

```
T-code: F110S 실행

Payment Proposal: 0000000001
회사코드: 1000
지급 방식: T (이체)

최종 검증:
  ├─ 총액 확인: 500,000,000 KRW ✓
  ├─ 거래처 확인: 5개 ✓
  ├─ 은행 계좌: 1001 ✓
  └─ 지급 조건: 국내 송금 ✓

실행:
  Payment Run 0000000001 생성
  Pay-Document 5개 생성
  Total Amount: 500,000,000 KRW
```

**생성된 Pay-Documents** (F110S 결과):

```
Pay-Doc 1: V-001, 100M KRW → Account 1001
Pay-Doc 2: V-002, 150M KRW → Account 1001
Pay-Doc 3: V-004, 50M KRW → Account 1001
Pay-Doc 4: V-005, 100M KRW → Account 1001
Pay-Doc 5: (수수료 기타) → Account 1001
```

### Step 3: 지급 파일 생성 (DMEE)

```
T-code: F110C 또는 F110 → "Generate File"

Payment Run: 0000000001
DMEE Variant: KR-103-DOMESTIC (우리은행)
Output Format: Text File

생성 프로세스:
  1. Pay-Documents 수집
  2. DMEE 변형 적용
  3. 한글 인코딩 (EUC-KR)
  4. 파일 생성: WOORI_20240131143000.txt
  5. 파일 검증: Checksum 자동 계산
  
결과:
  파일명: WOORI_20240131143000.txt
  파일크기: 2.5 KB
  레코드 수: 7 (Header 1 + Detail 5 + Trailer 1)
```

**생성된 DMEE 파일**:

```
H우리은행         202401311430000000000001
D0001000-0001-001홍길동                    0000000100000000000KRW수수료송금
D0002000-0002-001김영수                    0000000150000000000KRW용역비송금
D0003000-0004-001이순신                    0000000050000000000KRW배당금송금
D0004000-0005-001세종대왕                  0000000100000000000KRW이자송금
D0005999-9999-999은행수수료                0000000005000000000KRW운영비
T000500000005000000000KRW888888
```

---

## 지급 파일 전송 방식

### SFTP (Secure FTP) — 표준

```
T-code: FBZP 또는 F110

전송 설정:
  프로토콜: SFTP
  은행 서버: ftp.woori.co.kr
  포트: 22
  인증: 공인인증서 또는 보안토큰
  
파일 경로:
  Upload: /outgoing/payment_files/
  Download: /incoming/bank_statements/

자동화:
  - 지급 파일 자동 업로드
  - 은행명세서 자동 다운로드
  - 스케줄: 매일 14:00
```

### SWIFT (국제 표준)

```
T-code: DMEE (International Variant: INT-CT)

지급 메시지:
  Type: SWIFT MT103 (Customer Payment)
  또는 MT940 (Statement)
  
구성요소:
  - Header: 송금인 은행 정보
  - Details: 수취인, 금액, 계좌
  - Trailer: 서명 및 검증
  
예시:
  {1:F01URIKRRA0XXXX}
  {2:I103SHBKKRSEXXX}
  {3:{108:TRN123456}}
  {4:
  :20:TRN123456
  :32A:240131KRW500000000,00
  :50A:/P/1000
  :59:/123456789012
  HONG GILDONG
  -}
```

---

## 주의사항

1. **한글 인코딩**
   - EUC-KR: 한국 표준 (대부분 은행)
   - UTF-8: 신형 은행 시스템
   - 혼용 시 파일 손상

2. **거래처 계좌 정확성**
   - 오입력 시 송금 실패 또는 반송
   - 정기적 검증: XK02에서 계좌 확인

3. **파일 포맷 변경**
   - 은행 시스템 업그레이드 시 변형 변경 필요
   - DMEE 변형 버전 관리 필수

4. **대량 송금**
   - 소액 송금: 수수료 추가 비용 (은행 정책)
   - 한계금액: 일일 송금 한도 (은행 정책)
   - 예약: 미래 날짜 지급 가능 (은행 확인)

5. **보안**
   - 공인인증서 또는 OTP 필수
   - 파일 암호화 (선택)
   - 접근 권한: 재무/경리 부서만

---

## ECC vs S/4HANA

| 항목 | ECC | S/4 |
|------|-----|-----|
| **DMEE** | 포맷 정의 | 사전정의 변형 확대 |
| **파일 생성** | F110C (별도) | F110S 통합 |
| **자동 전송** | 수동 | SFTP 자동 |
| **한글 지원** | EUC-KR | EUC-KR + UTF-8 |
| **국제 표준** | SWIFT MT103 | ISO 20022 추가 |

---

## 월별 DMEE 운영

### 월초
```
1. 은행과 협의
   - 변형 업데이트 확인
   - 한도 정보
   
2. DMEE 변형 검증
   - 문자 인코딩 테스트
   - 레코드 구조 확인
```

### 월중
```
1. 지급 예정 모니터링
   - F.13: 만기 채무 확인
   
2. 거래처 계좌 검증
   - XK02: 계좌번호 정확성
```

### 월말
```
1. F110: 지급 제안
2. 검증: 금액/거래처 확인
3. F110S: 지급 실행
4. DMEE: 파일 생성
5. SFTP: 자동 전송 (또는 수동)
6. 은행 확인: 거래 처리 여부 확인
7. FF.2: 은행 조정
```

---

## 관련 T-codes

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **DMEE** | DMEE 변형 정의 | 초기 설정 |
| **FBZP** | 지급 프로그램 설정 | 초기 설정 |
| **F110** | 지급 제안 | 월말 |
| **F110S** | 지급 실행 + 파일 생성 | 월말 |
| **F110C** | 지급 파일 생성 (ECC) | 월말 (ECC) |
| **XK02** | 거래처 계좌 | 검증 |
| **FF.2** | 은행 조정 | 월말 |

## 체크리스트

- [ ] DMEE: 은행별 변형 설정 (국내 + 국제)
- [ ] FBZP: 지급 프로그램과 DMEE 연계
- [ ] 한글 인코딩: EUC-KR 또는 UTF-8 확인
- [ ] 거래처 마스터: XK02 계좌정보 입력
- [ ] 테스트: 샘플 지급 배치 → 파일 생성 검증
- [ ] 은행 제출: 생성 파일 형식 은행 검증
- [ ] 월말 프로세스: F110 → F110S → SFTP → FF.2
