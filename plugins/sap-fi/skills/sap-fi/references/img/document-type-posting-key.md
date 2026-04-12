# 전표유형 및 전기키(Document Type & Posting Key) IMG 구성 가이드

## SPRO 경로
```
SPRO → Financial Accounting → General Ledger Accounting → 
       Document Type / Posting Keys
```

## 필수 선행 구성
- [x] Fiscal Year Variant (T-code: OB29) — 회계연도변형 정의 완료
- [x] Number Range (T-code: FBN1) — 번호범위 정의 완료
- [x] GL Account Groups (T-code: OBD4) — 계정그룹 정의 완료

## 구성 단계

### 1단계: 전표유형(Document Types) 정의
**T-code: OBA7**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Document Type → Document Types
```

전표유형 설정:

| 전표유형 | 명칭 | 용도 | 번호범위 | 회사코드/부서 |
|---------|------|------|---------|-------------|
| SA | 일반전표 (General) | 수동 GL 전기 | 1000000-1999999 | 회사코드별 |
| RE | 거래처청구서 (Vendor Invoice) | AP 거래 | 2000000-2999999 | 회사코드별 |
| RV | 고객청구서 (Customer Invoice) | AR 거래 | 3000000-3999999 | 회사코드별 |
| DR | 차변전표 (Debit Memo) | 거래처 크레딧메모 | 4000000-4999999 | 회사코드별 |
| CR | 대변전표 (Credit Memo) | 고객 크레딧메모 | 5000000-5999999 | 회사코드별 |
| Z1 | 정산/역분개 (Reversal) | 월말 조정, 기간종료 | 6000000-6999999 | 회사코드별 |
| Z2 | 수정전표 (Correction) | 오류 수정 | 7000000-7999999 | 회사코드별 |

전표유형별 설정:

| 필드 | 값 | 설명 |
|-----|-----|------|
| **Document Type** | `SA` | 전표유형 코드 (2자리) |
| **Document Type Name** | `일반전표` | 전표유형 한글명 |
| **Number Range** | `1` | FBN1에서 정의한 범위 번호 |
| **Posting Date Required** | `X` | 필수입력 |
| **Document Date** | `X` | 필수입력 |
| **Reason for Posting** | (선택) | 역분개 사유 필수 (OB28) |
| **Reversal Reason Required** | `X` (정산만) | Z1 유형만 체크 |

**ECC 6.0**: 거래처별 별도 전표유형 가능 (RE, RV 동일)  
**S/4HANA**: Unified GL에서 자동 매핑 (RE/RV는 구분 미필요)

### 2단계: 번호범위(Number Ranges) 설정
**T-code: FBN1**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Document Type → Number Ranges → Define Document Number Ranges
```

번호범위 설정:

| 범위번호 | 문서유형 | 시작번호 | 종료번호 | 현재번호 | 외부할당 |
|---------|---------|---------|---------|---------|--------|
| 01 | SA | 1000000 | 1999999 | 1000000 | X |
| 02 | RE | 2000000 | 2999999 | 2000000 | X |
| 03 | RV | 3000000 | 3999999 | 3000000 | X |
| 04 | Z1 | 6000000 | 6999999 | 6000000 |  |

설정 필드:

| 필드 | 값 | 설명 |
|-----|-----|------|
| **Number Range** | `01` | 범위 식별자 |
| **From Number** | `1000000` | 번호 시작 |
| **To Number** | `1999999` | 번호 종료 |
| **Current Number** | `1000000` | 현재 할당 번호 |
| **External Assignment** | `X` | 수동 번호 할당 허용 (외부 참조번호) |
| **Gaps Allowed** | ` ` | 미체크 (연속 번호 강제) |

**주의**: 
- 외부할당(External Assignment) 활성화 → FB50에서 수동 번호 입력 가능
- 미활성화 → 자동 번호만 생성 (외부참조는 참조번호 필드에 기록)

### 3단계: 전기키(Posting Keys) 정의
**T-code: OB41**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Accounts → Posting Keys
```

기본 전기키 구성:

| 전기키 | GL/AP/AR | 차변/대변 | 자동검증 | 용도 |
|-------|---------|----------|--------|------|
| 01 | GL | Debit | Yes | GL 계정 차변 기본 |
| 11 | GL | Credit | Yes | GL 계정 대변 기본 |
| 21 | AP | Debit | Yes | 거래처 선급금(차변) |
| 31 | AR | Debit | Yes | 고객 외상(차변) |
| 40 | AP | Credit | Yes | 거래처 채무(대변) |
| 50 | AR | Credit | Yes | 고객 신용(대변) |
| 60 | Bank | Debit | Yes | 은행입금 |
| 70 | Bank | Credit | Yes | 은행출금 |

전기키 필드 설정:

| 필드 | 예시값 (01-GL Debit) | 설명 |
|-----|--------|------|
| **Posting Key** | `01` | 2자리 코드 |
| **Account Type** | `*` | 계정유형 (*, S=특수계정, A=자산) |
| **Debit/Credit** | `H` | H=차변, S=대변 |
| **Account Number Required** | `X` | 계정 필수입력 |
| **Cost Center/Order** | `1` | 1=선택, 2=필수, 3=숨김 |
| **Profit Center Pos.** | `2` | Profit Center 위치 제어 |
| **Currency Field** | ` ` | 통화 입력 가능 여부 |
| **Tax Field** | ` ` | 세금코드 입력 가능 여부 |
| **Field Reference** | `C000` | 필드상태그룹 할당 |

**ECC 6.0**: 최대 99개 전기키 정의 가능  
**S/4HANA**: 전기키 자동 생성 (수정 권장하지 않음)

### 4단계: 역분개사유(Reversal Reasons) 정의
**T-code: OB28**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Document Type → Reversal Reasons
```

역분개사유 설정 (S/4HANA 필수):

| 코드 | 사유명 | 설명 | 사용처 |
|------|--------|------|--------|
| 01 | 오류입력 | 데이터 오입력 수정 | 일반전표 |
| 02 | 중복전기 | 중복 입력된 거래 취소 | 일반전표 |
| 03 | 월말조정 | 기간종료 조정 | 정산(Z1) |
| 04 | 기간오류 | 잘못된 기간 전기 수정 | 정산(Z1) |
| 05 | 거래처오류 | 거래처 또는 세금 오류 | AP 거래 |
| 06 | 고객오류 | 고객 또는 가격 오류 | AR 거래 |

역분개사유 필드:

| 필드 | 값 | 설명 |
|-----|-----|------|
| **Reversal Reason** | `01` | 2자리 코드 |
| **Reversal Reason Description** | `오류입력` | 한글 설명 |
| **Valid from** | `2025-01-01` | 사용 시작일 |

**S/4HANA에서 필수**: 역분개 거래(Reversal) 시 반드시 사유 입력 필요

## 구성 검증

### 검증 1: 전표유형 및 번호범위 연결 확인
**T-code: FB50 (General Journal Entry)**

```
1. FB50 실행
2. Document Type 드롭다운 확인:
   - SA(일반전표): 선택 가능
   - RE(거래처청구서): 선택 불가 (권한/사용처 제한)
3. Document Number 입력:
   - 외부할당 활성화 → 수동 번호 입력 가능
   - 예: 1234567 (범위 내)
4. Save → 번호 자동 생성 또는 수동번호 인정 확인
```

### 검증 2: 전기키 제어 확인
**T-code: FB01 (Enter Incoming Invoice)**

```
1. FB01 → Document Type: `RE` (거래처청구서)
2. 명세라인에서 포스팅키 확인:
   - 40(거래처 대변): 자동 선택됨
   - GL Account: 자동 결정됨 (OB40 규칙)
   - Cost Center: 필드상태에 따라 필수/선택/숨김
3. Save → 전표 생성 및 문서번호 자동 할당
```

### 검증 3: 역분개사유 입력 요구
**T-code: F-28 (Create Reversed Invoice)**

```
1. FB01에서 생성한 청구서 선택
2. FB03(Display) → Reversal 버튼
3. 자동으로 Reversal Reason 입력 프롬프트 나타남
   (ECC에서는 선택, S/4에서는 필수)
4. 사유 선택 → OK
5. 예상결과: 역분개 전표(Z1)가 반대 방향으로 생성
```

## 주의사항

### 1. 번호범위 고갈 관리
```
❌ 실수: 1000~9999 범위만 설정 (제한적)
✅ 해결: 1000000~9999999 범위 설정 (확장성)

💡 모니터링:
   - FBN1에서 Current Number 정기 확인
   - 80% 도달 시 범위 확장 계획
   - 실무: 월별 전기 건수 × 12개월 × 안전계수(1.5)로 계산
```

### 2. 외부할당(External Assignment) 정책 결정
```
✅ 활성화 권장:
   - 외부 참조번호가 있는 거래(인보이스, PO 매핑)
   - 사용자가 수동 번호 입력 선호

❌ 미활성화 권장:
   - 내부 자동생성 번호만 사용
   - 번호 중복/누락 방지 중요
```

### 3. 전기키와 필드상태그룹 일관성
```
⚠️ 충돌 시나리오:
   - 전기키 01에서 Cost Center를 "선택"(2)으로 설정
   - 필드상태그룹(OBC4)에서 Cost Center를 "필수"(1)로 설정
   결과: OBC4가 우선 적용됨 → 입력 강제

💡 해결: OBC4와 OB41 동시 검토
   - 거의 항상 필수: Profit Center, Cost Center, Tax Code
   - OB41에서도 동일하게 설정
```

### 4. 역분개사유 S/4 필수화
```
ECC 6.0: 역분개사유 선택사항
S/4HANA: 역분개사유 필수

⚠️ 마이그레이션 시:
   - OB28에서 역분개사유 사전 정의 필수
   - 기본 사유(01~05) 최소 구성
   - 사용자 교육 (F-28 시 반드시 사유 선택)
```

### 5. 한국(KOR) 특화 설정
```
🇰🇷 필수 전표유형:
   - SA: 일반전표 (수정/조정)
   - RE: 거래처청구서
   - RV: 고객청구서
   - DR/CR: 크레딧메모
   - Z1: 정산 (월말)
   - Z3: 원천세 관련

⚠️ 번호범위 관습:
   - 1~100만: 일반전표
   - 101~200만: 거래처
   - 201~300만: 고객
   - 301~400만: 정산/기타
```

### 6. 운영 중 번호범위 변경 금지
```
❌ 위험:
   - 기존 범위(1000~9999) → 새 범위(10000~99999)로 변경
   - 그 사이에 기간종료/마감이 있었던 경우
   결과: 번호 중복, 감사 추적 오류

✅ 안전한 방법:
   - 새 범위 추가 (항상 범위 추가만 가능)
   - 범위별 용도 명확히 (예: 1~100만 = 2024년도)
```

## 관련 T-codes 요약

| T-code | 설명 |
|--------|------|
| **OBA7** | Document Types 정의 |
| **FBN1** | Number Ranges 정의 |
| **OB41** | Posting Keys 정의 |
| **OB28** | Reversal Reasons 정의 |
| **FB50** | General Journal Entry (수동 전표) |
| **FB01** | Enter Incoming Invoice (AP) |
| **FB03** | Display Incoming Invoice |
| **F-28** | Create Reversed Invoice |
| **FBL5N** | Open Items (AR) |
| **FBL1N** | Open Items (GL) |
