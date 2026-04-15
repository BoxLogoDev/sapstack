# RFC 패턴: 온프레미스 SAP 실시간 통신

## RFC란?

**Remote Function Call** — SAP 시스템 간의 **동기식 함수 호출** 프로토콜

### RFC vs HTTP REST

| 항목 | RFC | HTTP REST |
|------|-----|-----------|
| **통신 방식** | SAP 전용 바이너리 프로토콜 | 표준 HTTP |
| **속도** | 빠름 (직렬화 효율) | 상대적으로 느림 |
| **실시간성** | 동기식 (즉시 응답) | 동기식 |
| **네트워크** | VPN/직접 연결 필수 | HTTPS (방화벽 우호적) |
| **대상 시스템** | ERP/S4H (온프레미스) | S/4 Cloud PE, BTP |
| **보안** | SNC 암호화 | OAuth 2.0, TLS |

---

## RFC 아키텍처

### 호출 방식

```
┌──────────────────────────────────────────────┐
│ RFC Client (외부 프로그램)                   │
│ Python, Node.js, Java, C# 등                │
└──────────────────────────────────────────────┘
        ↓ (SAP NetWeaver Gateway)
┌──────────────────────────────────────────────┐
│ SAP Gateway / RFC Dispatcher                │
│ (T코드: SM04, RZ04)                         │
└──────────────────────────────────────────────┘
        ↓ (SAP 내부 프로토콜)
┌──────────────────────────────────────────────┐
│ ABAP Runtime                                │
│ BAPI / FM (Function Module) 실행            │
└──────────────────────────────────────────────┘
        ↓ (DB 쿼리)
┌──────────────────────────────────────────────┐
│ SAP Database (Oracle, HANA, DB2 등)         │
│ 데이터 조회/수정                            │
└──────────────────────────────────────────────┘
```

---

## 주요 개념

### 1. BAPI (Business Application Programming Interface)

**BAPI** = 표준화된 함수 인터페이스 (예: 영업 거래, 급여 계산 등)

```
호출 예:
  BAPI: BAPI_COMPANYCODE_GETDETAIL
  입력 파라미터:
    - COMPANY_CODE: "0001" (회사 코드)
  
  출력 파라미터:
    - COMPANYCODE_GENERAL (회사 일반 정보)
    - COMPANYCODE_DETAILS (회계 정보)
    - RETURN (에러 메시지)
```

### 2. qRFC vs tRFC vs aRFC

| 유형 | 호출 방식 | 사용 사례 |
|------|---------|---------|
| **Synchronous RFC (sRFC)** | 동기 | 실시간 조회 (예: 거래 현황) |
| **Transactional RFC (tRFC)** | 비동기, 순서 보장 | IDoc 메시징, 배치 처리 |
| **Queued RFC (qRFC)** | 비동기, 순서 보장, 재시도 | 중요 데이터 처리 |
| **ABAP-to-ABAP RFC** | 동기 | 시스템 간 FM 호출 |

**sapstack 권장**: **sRFC** (실시간 Evidence 수집용)

---

## 설정 & 구성

### Step 1: RFC Destination 생성

```
T코드: SM59 (RFC 연결 정의)
  → 새로운 RFC Destination 생성 (예: EXTERNAL_SYSTEM)

필수 필드:
  - RFC Destination: EXTERNAL_SYSTEM
  - Connection Type: 
    - 3 = ABAP-to-ABAP (SAP 간)
    - T = TCP/IP 연결
  - Target Host: SAP 서버 호스트명 (예: sap.company.com)
  - System Number: 00 (일반적)
  - Client: 100 (회사 환경)
  - User: RFC 전용 사용자 (예: RFC_USER)
  - Password: 비밀번호 (암호화 저장)
  - Language: EN

보안 설정:
  - SNC: 암호화 활성화 (Secure Network Communication)
    - SNC Name: p:CN=sap.company.com
    - SNC Library: sapcrypto.dll (Windows) 또는 libsapcrypto.so (Linux)
  - Logon Type: Dialog (대화형) 또는 System (시스템)

테스트:
  - "Connection Test" 버튼 클릭
  - 정상 연결 확인
```

### Step 2: RFC 사용자 생성 (권한 분리)

```
T코드: SU01 (사용자 관리)
  → 새로운 사용자 생성: RFC_USER

필수 설정:
  - User Name: RFC_USER
  - User Type: Communication User (또는 System)
  - Password: 강력한 비밀번호
  
권한 할당 (T코드: PFCG):
  - 역할: Z_RFC_READ_ONLY
    - 권한:
      - /n/usr/01 (거래 실행 허용 안함)
      - /n/usr/45 (BAPI 호출만 허용)
      - S_RFC (RFC 실행)
      - S_BTCH_JOB (배치 작업 실행, 선택)

보안 정책:
  - 비밀번호 유효기간: 90일
  - 로그온 시간 제약: 업무 시간만 (선택)
  - IP 제약: RFC 클라이언트 IP 화이트리스트 (선택)
```

### Step 3: BAPI 활성화

```
T코드: SE37 (Function Module 확인)
  → BAPI 목록 확인
  
자주 사용되는 BAPI:

1. BAPI_COMPANYCODE_GETDETAIL
   - 회사 정보 조회
   - 입력: COMPANY_CODE
   - 출력: 회계 정보, 통화, 폐쇄 시점

2. BAPI_TRANSACTION_READ
   - 분개 내역 조회
   - 입력: TRANSACTION_ID, DATE_FROM, DATE_TO
   - 출력: 거래 내역 배열

3. BAPI_EMPLOYEE_GETDATETIME
   - 직원 정보 조회
   - 입력: EMPLOYEE_NUMBER
   - 출력: 급여, 부서, 직급 정보

4. BAPI_COST_CENTER_READ
   - 원가센터 정보
   - 입력: COST_CENTER, CONTROLLING_AREA
   - 출력: 예산 정보, 책임자

5. BAPI_MATERIAL_EXISTSLIST
   - 자재 정보 조회
   - 입력: MATERIAL_ID
   - 출력: 재고, 가격, 공급처
```

### Step 4: 감시 권한 설정

```
T코드: PFCG (역할 관리)
  → Z_RFC_READ_ONLY 역할에 아래 권한 추가:

  - S_RFC
    - RFC_NAME: Z_* (기타 BAPI)
    - RFC_TYPE: FUNCTION, BAPI

  - S_TABU_DIS (테이블 접근)
    - DICBERCLS: ZTRANS (투명 테이블, 읽기만)

  - S_DATASET (파일 시스템)
    - ACTVT: 3 (읽기, 로그 조회)
    - FILENAME: /tmp/rfc_logs/* (로그 경로 제한)
```

---

## Python 클라이언트 (PyRFC)

### 설치

```bash
pip install pyrfc
```

### 기본 사용법

```python
from pyrfc import Connection

# 1. 연결 설정
conn = Connection(
    ashost='sap.company.com',      # SAP 호스트
    sysnr='00',                    # 시스템 번호
    client='100',                  # 클라이언트
    user='RFC_USER',               # 사용자
    passwd='password123',          # 비밀번호
    lang='EN',
    trace=0,                       # 트레이스 활성화 (디버깅용)
)

# 2. 거래 조회 (BAPI)
try:
    result = conn.call(
        'BAPI_TRANSACTION_READ',
        IV_TRANSACTION_ID='20260415001',
        IV_DATE_FROM='20260401',
        IV_DATE_TO='20260430',
    )
    
    print("거래 내역:")
    for transaction in result['ET_TRANSACTIONS']:
        print(f"  문서: {transaction['DOCUMENT_NUMBER']}")
        print(f"  금액: {transaction['AMOUNT']}")
        print(f"  거래일: {transaction['POSTING_DATE']}")
    
except Exception as e:
    print(f"오류: {e}")

# 3. 회사 정보 조회
company = conn.call(
    'BAPI_COMPANYCODE_GETDETAIL',
    IV_COMPANY_CODE='0001'
)

print(f"회사명: {company['EV_COMPANY_NAME']}")
print(f"통화: {company['ES_COMPANY_DETAILS']['CURRENCY']}")

# 4. 분개 작성 (트랜잭션 생성, 주의!)
# 권한 필수: BAPI_POSTING
posting_result = conn.call(
    'BAPI_POSTING',
    IV_DOCUMENT_DATE='20260415',
    IV_POSTING_DATE='20260415',
    IV_COMPANY_CODE='0001',
    ET_ITEMS=[
        {
            'ITEM_NO': '001',
            'ACCOUNT_GL': '1000',  # 비용 계정
            'AMOUNT_LC': '1000.00',
            'DEBIT_CREDIT': 'D',
        },
        {
            'ITEM_NO': '002',
            'ACCOUNT_GL': '4000',  # 수익 계정
            'AMOUNT_LC': '1000.00',
            'DEBIT_CREDIT': 'C',
        }
    ]
)

# 5. 연결 종료
conn.close()
```

### Evidence 수집 예시

```python
import json
from datetime import datetime, timedelta
from pyrfc import Connection

def collect_vat_evidence(company_code, period_start, period_end):
    """부가세 신고용 Evidence 수집"""
    
    conn = Connection(
        ashost='sap.company.com',
        sysnr='00',
        client='100',
        user='RFC_USER',
        passwd='password123',
    )
    
    evidence = {
        'collected_at': datetime.now().isoformat(),
        'company_code': company_code,
        'period': f"{period_start}~{period_end}",
        'transactions': [],
        'vat_summary': {}
    }
    
    try:
        # VAT 거래 조회
        result = conn.call(
            'BAPI_TRANSACTION_READ',
            IV_COMPANY_CODE=company_code,
            IV_DATE_FROM=period_start,
            IV_DATE_TO=period_end,
            IV_TRANSACTION_TYPE='VAT'  # VAT 거래만
        )
        
        # 개별 거래 수집
        for txn in result.get('ET_TRANSACTIONS', []):
            evidence['transactions'].append({
                'doc_number': txn['DOCUMENT_NUMBER'],
                'posting_date': txn['POSTING_DATE'],
                'tax_code': txn['TAX_CODE'],
                'amount': float(txn['AMOUNT']),
            })
        
        # VAT 요약
        summary = conn.call(
            'BAPI_VAT_SUMMARY',
            IV_COMPANY_CODE=company_code,
            IV_PERIOD=period_start[:6]  # YYYYMM
        )
        
        evidence['vat_summary'] = {
            'input_tax': float(summary['EV_INPUT_TAX']),
            'output_tax': float(summary['EV_OUTPUT_TAX']),
            'net_tax': float(summary['EV_NET_TAX']),
        }
        
        # JSON 저장
        with open(f'evidence_{company_code}_{period_start}.json', 'w') as f:
            json.dump(evidence, f, indent=2)
        
        return evidence
    
    finally:
        conn.close()


# 실행
if __name__ == '__main__':
    evidence = collect_vat_evidence('0001', '20260401', '20260430')
    print(json.dumps(evidence, indent=2))
```

---

## 에러 처리

### 공통 에러 코드

| 에러 코드 | 원인 | 해결방법 |
|----------|------|---------|
| **401** | 연결 실패 | 호스트명, 포트 확인 |
| **403** | 권한 부족 | RFC 사용자 권한 재할당 (PFCG) |
| **404** | BAPI 없음 | BAPI 이름 확인 (SE37) |
| **500** | 파라미터 오류 | 입력값 타입 확인 (문자/숫자) |
| **700** | 데이터베이스 에러 | SAP DBA 문의 |

### Python 에러 처리

```python
from pyrfc import Connection, ABAPApplicationError, ABAPRuntimeError

try:
    result = conn.call('BAPI_EXAMPLE', INPUT='test')
except ABAPApplicationError as err:
    print(f"ABAP 에러: {err.key}")
    print(f"메시지: {err.message}")
    # 예: RUN_COUNT_EXCEEDED, DOCUMENT_NOT_FOUND
    
except ABAPRuntimeError as err:
    print(f"런타임 에러: {err.code}")
    # 예: 네트워크 연결 오류, 시간 초과
    
except Exception as err:
    print(f"기타 에러: {err}")
    
finally:
    if conn:
        conn.close()
```

---

## 보안 체크리스트

- [ ] **SNC 암호화** 활성화 (SM59)
  - Secure Network Communication 설정
  - SAP 라이센스 필요 (대부분 포함)

- [ ] **RFC 사용자 격리**
  - 전용 Communication User 생성
  - 일반 사용자와 분리
  - 비밀번호 정책: 최소 12자, 90일 유효

- [ ] **권한 최소화**
  - 필요한 BAPI만 허용
  - READ 권한 (쓰기 불가)
  - IP 화이트리스트 설정

- [ ] **감시 추적 (Audit Trail)**
  - T코드: ZLOG에서 RFC 호출 기록 확인
  - 주기적 감사 (월간)
  - 이상 거래 알림 설정

- [ ] **망분리 환경 (한국/금융)**
  - RFC 직접 호출 불가
  - 파일 기반 배치만 허용
  - DMZ 게이트웨이 구축 필요

---

## 성능 최적화

### 대량 데이터 조회 시

```python
# ❌ 나쁜 예: 개별 호출
for doc_id in range(1, 10000):
    result = conn.call('BAPI_READ', IV_DOCID=doc_id)
    # 느림! 10000번 네트워크 왕복

# ✅ 좋은 예: 배치 호출
result = conn.call(
    'BAPI_READ_LIST',
    IT_DOCIDS=[{'ID': str(i)} for i in range(1, 10000)],
    IV_BATCH_SIZE=1000  # 1000개 단위로 분할
)
# 빠름! 네트워크 왕복 최소화
```

### RFC 연결 풀 (Connection Pooling)

```python
from pyrfc import Connection

class RFCPool:
    def __init__(self, size=5):
        self.pool = []
        self.size = size
        for _ in range(size):
            conn = Connection(
                ashost='sap.company.com',
                sysnr='00',
                client='100',
                user='RFC_USER',
                passwd='password123',
            )
            self.pool.append(conn)
    
    def get_connection(self):
        if self.pool:
            return self.pool.pop()
        raise RuntimeError("연결 풀 부족")
    
    def return_connection(self, conn):
        self.pool.append(conn)
    
    def close_all(self):
        for conn in self.pool:
            conn.close()

# 사용
pool = RFCPool(size=10)
conn = pool.get_connection()
try:
    result = conn.call('BAPI_READ', ...)
finally:
    pool.return_connection(conn)
```

---

## 주요 SAP Note

| SAP Note | 제목 |
|----------|------|
| **2128107** | RFC 연결 문제 해결 |
| **2342213** | BAPI 문서 및 가이드 |
| **2903362** | RFC 감시 추적 (Audit Trail) |
| **2341844** | RFC vs OData 비교 |

---

## 참고 자료

- [SAP PyRFC Documentation](https://github.com/SAP/PyRFC)
- [SAP BAPI Reference](https://help.sap.com/docs/SAP_NW/61c8dc8b3b3e4b5b3e3e4b5b3e3e4b5b/819f7f7eb2e04e0e8d8c0d5b2f1a1b1b.html)
- [Secure Network Communication (SNC)](https://help.sap.com/docs/SNC)
- SAP Note 검색: SM04, SM59, SU01 (RFC 연결/사용자/권한)

---

**마지막 업데이트**: 2026-04-15 | **버전**: v2.1.0
