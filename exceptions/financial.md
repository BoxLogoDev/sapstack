# Financial Exception Classes (FI / 재무)

SAP Financial Accounting(FI)에서 발생하는 예외들. 전표 입력, 기간마감, 수정/삭제 차단, 계정 검증 등이 주요 영역입니다.

---

## CX_FAGL_NUMBERRANGE_DEFINITION
**카테고리**: FI / 전표 관리  
**발생 버전**: ECC 5.0+ (S/4HANA 포함)

**발생 조건**:
- FB01/FB50 전표 입력 시 해당 전표유형의 번호범위 미정의
- 회계연도 변경 후 신규 번호범위 미생성
- 다중 회사코드 환경에서 특정 회사만 번호범위 누락

**증상**:
```
Message Type: E (Error)
Message ID: FAGL
Message Code: 001
Text: Number range not maintained for document type XX, fiscal year YYYY
```

**진단**:
1. **T-code: FBN1** (전표 번호범위 정의)
   - Path: SPRO → Financial Accounting → General Ledger → Document → Document Types → Number Range
   - 조회: 회계연도 (GJAHR) → 전표유형 (BLART) → 번호범위 확인
   
2. **SE16N: NRIV 테이블** (전문가용)
   - OBJECT = "BKPF" + 회사코드 체크디지트
   - FISCYEAR, SUBOBJECT 필터로 확인

**흔한 원인**:
- [45%] 년도 말 마감 후 차년도 번호범위 사전 미생성
- [30%] 신규 법인 개설 시 번호범위 설정 누락
- [15%] 다중통화 시스템에서 특정 통화용 번호범위 미할당
- [10%] 외부 번호 지정(수동) 시스템 도입 후 범위 정의 스킵

**해결**:
```
1. FBN1 진입
2. "New Entries" 버튼 → 다음 입력:
   - Number Range Group: 01 (또는 기존 그룹)
   - Document Type: 해당 전표유형 (AA, AB, ...)
   - Fiscal Year: 현재연도 + 차년도
   - From Number: 100000000
   - To Number: 199999999
3. Save → Transport 기록 (SE10)
4. TMS를 통해 테스트/운영 계정 이관
```

**예방**:
- 년도 말(11월)에 차년도 모든 전표유형별 번호범위 일괄 생성
- BC-CCM에 정기 모니터링: 번호범위 고갈률 추적
- 분기 감사: NRIV에서 누락된 조합 확인

**관련 Note**: 130253, 155499

---

## CX_FAGL_PERIOD_CLOSED
**카테고리**: FI / 기간마감  
**발생 버전**: ECC 5.0+

**발생 조건**:
- OB52 또는 OB28에서 해당 기간을 마감한 후 전표 입력/수정/삭제 시도
- 법정 폐쇄(Legal Close)와 관리 폐쇄(Management Close) 미구분
- 권한(F_BKPF_BUK) 없이 폐쇄 기간 진입

**증상**:
```
Message: Posting period [MM/YYYY] is closed for company [BUKRS]
Message Type: E
```

**진단**:
1. **T-code: OB52** (기간 폐쇄 상태 확인)
   - Posting Period for Normal Postings: 마감 여부 확인
   - Special Periods: 추가 게시 기간(예: 결산용) 활성화 여부

2. **OB28**: CMS(중앙 기간 폐쇄) 조회
   - Central Month Closing: 그룹 차원 폐쇄 설정

**흔한 원인**:
- [50%] 월 말 폐쇄 후 일상 거래(구매/판매) 전표 발생 → 월도 재개 필요
- [30%] 특수 기간(추가 기간 5~8) 미활성화 → 결산 후 수정 불가
- [20%] 권한 객체 부족: F_BKPF_BUK에서 해당 회사코드 미할당

**해결**:
```
옵션 1) 월도 재개 (일상 거래)
  - OB52: Posting Period For Normal Postings 재설정
  - 예: 04 → 05 (4월 폐쇄 해제)

옵션 2) 특수 기간 활용 (결산 후 수정)
  - OB52에서 특수 기간(5~8) 활성화
  - 예: Special Period 5 = 4월 추가 기간
  - 사용자에게: "Special Period 5" 기간 지정 후 전표 입력

옵션 3) 권한 추가 (K-SOX 감시 대상)
  - SU01: 해당 사용자 선택
  - Role: SAP_FI_GLaccount_posting
  - Authorization Object: F_BKPF_BUK → BUKRS 추가
```

**예방**:
- 월 폐쇄 프로세스: 일상 거래 cutoff → OB52 폐쇄 → 결산 작업 순서 정의
- 특수 기간 사전 계획: 회계팀에서 필요한 특수 기간 미리 예약
- 권한 정책: 월 폐쇄 권한과 특수 기간 권한 역할별 분리

**관련 Note**: 183519 (Posting Periods), 124379 (Central Month Closing)

---

## CX_FAGL_ACCOUNT_NOT_FOUND
**카테고리**: FI / 계정(Account) 관리  
**발생 버전**: ECC 5.0+

**발생 조건**:
- FB01에서 존재하지 않는 GL 계정(예: 999999) 입력
- 계정이 회사코드에 할당되지 않음 (COA 할당 없음)
- 차관(Sub-account) 미활성화 상태에서 차관 입력

**증상**:
```
GL Account 999999 does not exist in chart of accounts XX
Message Type: E
```

**진단**:
1. **T-code: FS00** (GL 계정 정의)
   - Chart of Accounts (COA) 선택 → 계정번호 입력 → 존재 확인

2. **FSP0**: 회사코드별 GL 계정 할당 확인
   - Company Code (BUKRS) → Chart of Accounts → 해당 계정 조회

**흔은 원인**:
- [40%] 사용자가 계정번호 오입력 (3자리 ↔ 6자리 혼동)
- [30%] 신규 계정 생성 후 회사코드별 할당 미흡
- [20%] 레거시 시스템에서 이관 후 계정 매핑 누락
- [10%] 차관(Sub-account) 미활성화 상태

**해결**:
```
1. FS00: 올바른 계정번호 확인
   - Chart of Accounts 선택 (예: INT)
   - 계정 목록 조회: 예상 계정 검색

2. FSP0: 회사별 할당 확인
   - Company Code 선택 (예: 1000)
   - 계정이 할당되어 있는지 확인
   - 미할당 시 "Assign GL Accounts" 기능으로 일괄 할당

3. FB01 재입력
```

**예방**:
- 계정번호 레퍼런스 카드: 주요 계정(매출, 매입, 자산) 한글명+번호 정리
- FB01 입력 전 계정번호 validation: autocomplete 또는 드롭다운 활용
- 분기 감사: FS00에서 "미사용 계정" 삭제 검토

**관련 Note**: 120521 (General Ledger Account)

---

## CX_FAGL_DUPLICATE_HEADER
**카테고리**: FI / 전표 중복  
**발생 버전**: ECC 6.0+

**발생 조건**:
- FB01 저장 시 동일한 전표번호 + 회사코드 + 사용자 + 날짜 조합이 이미 존재
- 동시 저장: 두 명이 같은 번호로 동일 시점에 입력
- RFC/IDoc 자동 전표 입력 시 재전송 → 중복 생성

**증상**:
```
Header already exists for document [BUKRS]-[BELNR]
Cannot create duplicate header
Message Type: E
```

**진단**:
1. **SE16N: BKPF 테이블** (전표 헤더)
   - BUKRS (회사), BELNR (전표번호) 필터
   - 중복 레코드 확인

2. **FB03**: 전표 조회 (FI Reporting)
   - 범위: Company Code + Document Number
   - 중복 여부 시각적 확인

**흔은 원인**:
- [45%] RFC/IDoc 재전송: 전송 중 실패 후 재시도 시 미체크
- [30%] 동시 입력: 두 사용자가 FB01 동시 저장
- [15%] 수동 번호 지정 모드(FBN2)에서 수동 입력 시 번호 중복
- [10%] 야간 배치 스크립트 재실행

**해결**:
```
옵션 1) 중복 전표 삭제 (권한: F_BKPF_DEL)
  - FB04: 전표 삭제 (DB-COMMIT 주의, Audit Trail 남김)
  - 절차: 원본 전표번호 입력 → "Delete" → 확인

옵션 2) 다른 번호로 재입력
  - FB01: 새 번호로 입력 (외부 번호 지정 모드가 아닐 경우)
  - 자동 번호 범위에서 다음 번호 할당됨

옵션 3) RFC/IDoc 재전송 방지
  - 전송 시스템에서 "idempotent key" 구현
  - 예: Reference Key = 원거래번호 + 날짜 + 금액 조합
  - 중복 감지 후 실패 반환 (재전송 X)
```

**예방**:
- RFC/IDoc 인터페이스: 멱등성(idempotency) 구현 필수
- 배치 스크립트: 전표 생성 전 중복 check 로직 추가
- 동시성 제어: DB 트랜잭션 레벨에서 unique constraint 확인

**관련 Note**: 178643 (IDoc Posting)

---

## CX_FAGL_POSTING_LOCK
**카테고리**: FI / 계정 잠금  
**발생 버전**: ECC 5.0+

**발생 조건**:
- FS00에서 GL 계정을 "Posting Lock" (Field: XSPKO) 설정한 후 전표 입력
- 회사코드 레벨에서 "No Posting" 활성화 (FSP0)
- 그룹 차원 계정 잠금 (FSPO)

**증상**:
```
GL Account 4xxx Posting blocked
Message Type: E
```

**진단**:
1. **FS00**: Posting Lock 확인
   - GL Account → Control → Posting Lock field (XSPKO)

2. **FSP0**: 회사별 계정 금지 설정
   - Company Code → GL Account → "No Posting" 체크

**흔은 원인**:
- [50%] 결산용 계정의 일상 거래 입력 차단 → 설정 의도 맞음
- [30%] 임시 계정을 실수로 잠금
- [20%] 구형 계정 정리 중 활성 계정도 잠금

**해결**:
```
1. FS00 진입 → Posting Lock 해제
   - Posting Lock 필드 언체크
   - Save → Transport

2. FSP0: 회사별 할당 재확인
   - Company Code 선택 → "No Posting" 언체크
```

**예방**:
- FS00에서 Posting Lock 설정 전 승인 프로세스 필수
- 분기 감사: 잠금된 계정 목록 리뷰 (불필요한 잠금 제거)

**관련 Note**: 120521

---

## CX_FI_CUSTOMIZING_ERROR
**카테고리**: FI / Customizing  
**발생 버전**: ECC 5.0+

**발생 조건**:
- Customizing이 불완전한 상태 (예: 필수 회사코드 정의 없음)
- 필드 길이 설정 오류 (예: 계정 3자리인데 4자리 입력)
- 계정 유형(Account Type) 미지정

**증상**:
```
Customizing for financial accounting incomplete
Text Key: FAGL / 190
Message Type: E
```

**진단**:
1. **OBD1**: 회사코드 정의
2. **SKA1**: Chart of Accounts 정의
3. **SPRO**: Customizing IMG 검증

**흔은 원인**:
- [60%] Go-Live 전 Customizing 미완성
- [40%] 신규 회사코드 추가 후 필수 설정값 누락

**해결**:
- Customizing Checklist 참조
- 모든 필수 T-code 순차 실행

**관련 Note**: 108000

---

## CX_FAGL_COST_CENTER_NOT_FOUND
**카테고리**: FI / Cost Center  
**발생 버전**: ECC 5.0+

**발생 조건**:
- FB01에서 존재하지 않는 원가센터(비용) 입력
- Cost Center가 회계연도에 할당되지 않음
- Cost Center Hierarchy 미정의

**증상**:
```
Cost Center 9999 does not exist for period [MM/YYYY]
Message Type: E
```

**진단**:
1. **KS01**: Cost Center 정의
2. **KSH2**: Cost Center Hierarchy
3. **OKZH**: 회계연도별 활성 Cost Center 확인

**해결**:
```
1. KS01: Cost Center 생성
   - Cost Center (KOSTL): 4자리 (예: 3110)
   - Name: 부서명
   - Valid From/To: 회계연도 범위
   - Controlling Area (KOKRS)

2. FB01 재입력
```

**예방**:
- Cost Center List: 보급 또는 Autocomplete 제공
- 년초 Cost Center 활성화: KS01에서 유효기간 설정

**관련 Note**: 149654

---

## CX_FAGL_INTER_COMPANY_POSTING
**카테고리**: FI / 회사간 거래  
**발생 버전**: ECC 5.0+

**발생 조건**:
- 회사간 거래 시 대상 회사가 정의되지 않음
- CO(Controlling) 영역과 FI(회사) 매핑 오류
- Group Ledger(FAGL) 설정 미흡

**증상**:
```
Intercompany partner company not defined
Message Type: E
```

**진단**:
1. **EC00**: 회사간 거래 설정
2. **EC04**: CO/FI 매핑
3. **FAGL_ASSIGNMENT**: Group Ledger 설정

**해결**:
- EC00에서 회사 쌍(Company Pair) 정의
- 거래 유형별 자동 상계 규칙 설정

**관련 Note**: 135224

---

**Last Updated**: 2026-04-13  
**Total Exceptions**: 9  
**Maintenance Cycle**: Quarterly (SAP Note Updates)
