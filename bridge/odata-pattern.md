# OData 패턴: S/4HANA REST 기반 조회

## OData란?

**Open Data Protocol** — HTTP 기반 표준 데이터 접근 프로토콜

### OData vs RFC

| 항목 | OData | RFC |
|------|------|-----|
| **프로토콜** | HTTP/REST | 바이너리 (SAP 전용) |
| **표준** | OASIS 국제 표준 | SAP 독점 |
| **대상 시스템** | S/4HANA (모든 버전), BTP | ERP/S4H (온프레미스) |
| **보안** | OAuth 2.0, API 게이트웨이 | SNC 암호화 |
| **방화벽 친화성** | ⭐⭐⭐ (HTTPS 표준) | ⭐ (전용 포트) |
| **성능** | 중간 (JSON 파싱) | 빠름 (바이너리) |
| **학습곡선** | 낮음 (REST 표준) | 높음 (SAP 특화) |

**sapstack 권장**: **OData v4** (S/4HANA 2020+)

---

## OData 아키텍처

```
┌──────────────────────────────────────────────────────┐
│ 클라이언트 (AI Tool, 브라우저, 모바일)              │
└──────────────────────────────────────────────────────┘
        ↓ HTTPS (JSON)
┌──────────────────────────────────────────────────────┐
│ API Gateway (선택)                                   │
│ - 인증 (OAuth 2.0)                                  │
│ - Rate Limiting                                      │
│ - API 모니터링                                       │
└──────────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────────┐
│ SAP Gateway / OData Service                         │
│ T코드: /IWFND/MAINT_SERVICE                         │
│ /sap/opu/odata/sap/...                             │
└──────────────────────────────────────────────────────┘
        ↓ (SAP 내부 호출)
┌──────────────────────────────────────────────────────┐
│ ABAP Runtime                                        │
│ OData Service Implementation                        │
└──────────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────────┐
│ SAP Database (HANA, Oracle 등)                      │
└──────────────────────────────────────────────────────┘
```

---

## OData 버전

### OData v2 vs OData v4

| 기능 | v2 (구식) | v4 (권장) |
|------|----------|----------|
| **발표** | 2007 | 2014 |
| **SAP 지원** | ERP/S4H (모두) | S/4HANA 1610+ |
| **형식** | XML/JSON | JSON (권장) |
| **함수 지원** | 제한적 | 풍부 |
| **성능** | 낮음 | 높음 |
| **보안** | Basic Auth | OAuth, API Key |

**마이그레이션**: OData v2 → v4 적극 권장 (SAP Note 2768837)

---

## 주요 OData 서비스 (S/4HANA)

### 재무 (FI)

| 서비스 | T코드 | 용도 |
|--------|------|------|
| **GLM_POSTING_SRV** | ZFGL | 총계정원장 거래 |
| **C_BUSINESSPARTNER** | BP | 업체 마스터 |
| **C_JOURNAL_ENTRY** | JE | 분개 |
| **C_VENDORINVOICE_SRV** | VI | 구매 송장 |
| **C_SALESORDER** | SO | 판매 주문 |

### 원가 (CO)

| 서비스 | 용도 |
|--------|------|
| **C_COSTCENTER** | 원가센터 |
| **COEP_SRV** | 원가 요소 거래 |
| **COSP_SRV** | 원가 대상별 거래 |

### 인사 (HCM)

| 서비스 | 용도 |
|--------|------|
| **C_EMPLOYEE** | 직원 마스터 |
| **C_PAYROLL** | 급여 정보 |
| **C_LEAVE_REQUEST** | 휴가 신청 |

---

## 설정 & 활성화

### Step 1: OData 서비스 활성화

```
T코드: /IWFND/MAINT_SERVICE (OData Service Maintenance)
  → 필요한 서비스 검색 및 활성화
  
예시: GLM_POSTING_SRV 활성화
  1. 서비스 검색: "GLM_POSTING"
  2. 결과: /sap/opu/odata/sap/GLM_POSTING_SRV
  3. "Activate" 클릭
  4. 화이트리스트에 추가 (선택)
```

### Step 2: API 사용자 생성

```
T코드: SU01 (사용자 관리)
  → 새로운 사용자 생성: API_USER

설정:
  - User Name: API_USER
  - User Type: Communication User
  - Password: 강력한 비밀번호 (최소 12자)
  - Authentication: OAuth 2.0 (권장) 또는 Basic Auth

권한 할당 (T코드: PFCG):
  - 역할: Z_OData_READ
    - 권한:
      - /IWFND/RT_READ (OData 읽기)
      - /IWFND/RT_EXECUTE (OData 실행, 쓰기)
      - S_SERVICE (서비스 접근)
```

### Step 3: OAuth 2.0 설정 (권장)

```
T코드: /IWFND/MAINT_OAUTH (OAuth 설정)
  → OAuth Client 생성

필드:
  - OAuth Client ID: sapstack-ai-tool
  - Client Secret: (자동 생성 또는 수동 입력)
  - Scope: SCLOUDPLATFORM (또는 커스텀)
  - Redirect URI: https://ai-tool.company.com/callback
  - Token Validity: 3600초 (1시간, 권장)

토큰 발급:
  POST /oauth/token
  Content-Type: application/x-www-form-urlencoded
  
  grant_type=client_credentials
  &client_id=sapstack-ai-tool
  &client_secret=YOUR_SECRET
```

### Step 4: API 게이트웨이 (SAP BTP, 권장)

```
SAP API Management (BTP의 일부):
  1. API 정책 생성
  2. Rate Limiting: 1000 req/분
  3. IP 화이트리스트: AI Tool IP
  4. 인증: OAuth 2.0 위임
  5. 모니터링: 모든 요청 기록
```

---

## 기본 OData 쿼리

### 문법

```
GET /sap/opu/odata/sap/SERVICE_NAME/EntitySet
  ?$select=필드1,필드2
  &$filter=조건
  &$orderby=필드 asc|desc
  &$top=행수
  &$skip=시작행
  &$expand=관계
```

### 예시 1: 모든 거래 조회

```
GET /sap/opu/odata/sap/GLM_POSTING_SRV/PostingSet
  ?$select=DocumentNumber,PostingDate,Amount,Currency
  &$filter=CompanyCode eq '0001' and PostingDate ge '2026-04-01'
  &$orderby=PostingDate desc
  &$top=100
```

**응답**:
```json
{
  "d": {
    "results": [
      {
        "DocumentNumber": "0000000001",
        "PostingDate": "2026-04-15",
        "Amount": "1000.00",
        "Currency": "KRW"
      },
      ...
    ]
  }
}
```

### 예시 2: 고객 정보 조회 (관계 포함)

```
GET /sap/opu/odata/sap/C_BUSINESS_PARTNER/CustomerSet
  ?$select=Customer,Name,City
  &$expand=AddressInformation
  &$filter=Country eq 'KR'
  &$top=50
```

### 예시 3: 원가 센터별 예산 조회

```
GET /sap/opu/odata/sap/C_COSTCENTER/CostCenterSet
  ?$select=CostCenter,CostCenterName,BudgetAmount,UtilizationPercent
  &$filter=ControllingArea eq '0001' and BudgetAmount gt 0
  &$orderby=UtilizationPercent desc
```

---

## JavaScript 클라이언트

### 기본 사용법

```javascript
// 1. 토큰 획득 (OAuth 2.0)
async function getToken() {
  const response = await fetch('https://sap.company.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'sapstack-ai-tool',
      client_secret: 'YOUR_SECRET',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

// 2. OData 조회
async function queryOData(service, entitySet, filters) {
  const token = await getToken();
  
  const url = new URL(`https://sap.company.com/sap/opu/odata/sap/${service}/${entitySet}`);
  
  // 필터링
  if (filters) {
    url.searchParams.append('$filter', filters);
  }
  
  url.searchParams.append('$format', 'json');
  url.searchParams.append('$top', 1000);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OData Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.d.results;
}

// 3. 사용 예시: VAT 거래 조회
async function getVATTransactions(companyCode, periodStart, periodEnd) {
  const filter = `CompanyCode eq '${companyCode}' and PostingDate ge '${periodStart}' and PostingDate le '${periodEnd}' and TaxCode ne ''`;
  
  const transactions = await queryOData(
    'GLM_POSTING_SRV',
    'PostingSet',
    filter
  );
  
  console.log(`Found ${transactions.length} VAT transactions`);
  transactions.forEach(txn => {
    console.log(`- Doc: ${txn.DocumentNumber}, Tax Code: ${txn.TaxCode}, Amount: ${txn.Amount}`);
  });
  
  return transactions;
}

// 실행
getVATTransactions('0001', '2026-04-01', '2026-04-30')
  .catch(err => console.error('Error:', err));
```

### Evidence 수집

```javascript
async function collectVATEvidence(companyCode, period) {
  const [periodStart, periodEnd] = period.split('~');
  
  // 거래 수집
  const transactions = await queryOData(
    'GLM_POSTING_SRV',
    'PostingSet',
    `CompanyCode eq '${companyCode}' and PostingDate ge '${periodStart}' and PostingDate le '${periodEnd}'`
  );
  
  // VAT 코드별 집계
  const vatSummary = transactions.reduce((acc, txn) => {
    const taxCode = txn.TaxCode || 'NOTAX';
    if (!acc[taxCode]) {
      acc[taxCode] = { count: 0, amount: 0 };
    }
    acc[taxCode].count += 1;
    acc[taxCode].amount += parseFloat(txn.Amount);
    return acc;
  }, {});
  
  // Evidence Bundle 생성
  const evidence = {
    collectedAt: new Date().toISOString(),
    companyCode,
    period,
    transactionCount: transactions.length,
    vatSummary,
    samples: transactions.slice(0, 10),
  };
  
  // 로컬 저장 또는 서버 전송
  saveEvidence(evidence);
  
  return evidence;
}

function saveEvidence(evidence) {
  const filename = `evidence_${evidence.companyCode}_${evidence.period.replace(/~/g, '_')}.json`;
  const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
```

---

## Python 클라이언트

### requests 라이브러리 사용

```python
import requests
import json
from datetime import datetime

class ODataClient:
    def __init__(self, host, client_id, client_secret):
        self.host = host
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.token_expiry = None
    
    def get_token(self):
        """OAuth 2.0 토큰 획득"""
        url = f"https://{self.host}/oauth/token"
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
        }
        
        response = requests.post(url, data=data, verify=False)  # SSL 검증 비활성화 (테스트용)
        
        if response.status_code == 200:
            result = response.json()
            self.token = result['access_token']
            self.token_expiry = datetime.now().timestamp() + result.get('expires_in', 3600)
            return self.token
        else:
            raise Exception(f"Failed to get token: {response.text}")
    
    def query(self, service, entity_set, filters=None, select=None, top=1000):
        """OData 쿼리"""
        if not self.token or datetime.now().timestamp() > self.token_expiry:
            self.get_token()
        
        url = f"https://{self.host}/sap/opu/odata/sap/{service}/{entity_set}"
        
        params = {
            '$format': 'json',
            '$top': top,
        }
        
        if filters:
            params['$filter'] = filters
        if select:
            params['$select'] = ','.join(select)
        
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Accept': 'application/json',
        }
        
        response = requests.get(url, params=params, headers=headers, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            return data['d']['results']
        else:
            raise Exception(f"OData Error ({response.status_code}): {response.text}")

# 사용 예시
client = ODataClient(
    host='sap.company.com',
    client_id='sapstack-ai-tool',
    client_secret='YOUR_SECRET'
)

# VAT 거래 조회
vat_transactions = client.query(
    service='GLM_POSTING_SRV',
    entity_set='PostingSet',
    filters="CompanyCode eq '0001' and PostingDate ge '2026-04-01' and TaxCode ne ''",
    select=['DocumentNumber', 'PostingDate', 'TaxCode', 'Amount']
)

for txn in vat_transactions:
    print(f"Doc: {txn['DocumentNumber']}, Tax: {txn['TaxCode']}, Amount: {txn['Amount']}")
```

---

## 에러 처리

### 공통 OData 에러

| 상태 코드 | 원인 | 해결방법 |
|---------|------|--------|
| **400** | 잘못된 쿼리 | 필터 문법 확인, OData spec 참조 |
| **401** | 인증 실패 | OAuth 토큰 갱신, 비밀번호 확인 |
| **403** | 권한 부족 | 서비스 권한 할당 (PFCG) |
| **404** | 서비스 없음 | 서비스명 확인 (/IWFND/MAINT_SERVICE) |
| **500** | 서버 에러 | SAP 시스템 로그 확인, SAP 지원팀 문의 |
| **503** | 서비스 불가 | SAP 시스템 재시작 대기 |

### 에러 응답 분석

```json
{
  "error": {
    "code": "400",
    "message": {
      "lang": "ko",
      "value": "$filter에서 'PostingDate' 필드를 찾을 수 없습니다"
    },
    "innererror": {
      "transactionid": "xxx",
      "timestamp": "2026-04-15T14:00:00Z",
      "type": "http://www.sap.com/Protocols/SAPData/ODataDataServiceVersionV2/ODataMetadataError",
    }
  }
}
```

---

## 성능 최적화

### 1. $select로 필드 제한

```
# ❌ 느림: 모든 필드 조회
GET /sap/opu/odata/sap/GLM_POSTING_SRV/PostingSet?$top=10000

# ✅ 빠름: 필요한 필드만
GET /sap/opu/odata/sap/GLM_POSTING_SRV/PostingSet
  ?$select=DocumentNumber,PostingDate,Amount
  &$top=10000
```

### 2. $filter로 사전 필터링

```
# ❌ 느림: 모든 거래 조회 후 클라이언트에서 필터
GET /sap/opu/odata/sap/GLM_POSTING_SRV/PostingSet?$top=100000

# ✅ 빠름: 서버에서 필터
GET /sap/opu/odata/sap/GLM_POSTING_SRV/PostingSet
  ?$filter=CompanyCode eq '0001' and PostingDate ge '2026-04-01'
  &$top=1000
```

### 3. 페이징 ($top + $skip)

```
# 1000개씩 여러 번 조회
for page in range(0, 100000, 1000):
    url = f"...?$top=1000&$skip={page}"
    results.extend(requests.get(url).json()['d']['results'])
```

### 4. 배치 요청 (Batch Request)

```
POST /sap/opu/odata/sap/$batch
Content-Type: multipart/mixed; boundary=BATCH_BOUNDARY

--BATCH_BOUNDARY
Content-Type: application/http
Content-Transfer-Encoding: binary

GET /sap/opu/odata/sap/GLM_POSTING_SRV/PostingSet?$filter=CompanyCode eq '0001'
Accept: application/json

--BATCH_BOUNDARY
Content-Type: application/http
Content-Transfer-Encoding: binary

GET /sap/opu/odata/sap/C_COSTCENTER/CostCenterSet?$filter=ControllingArea eq '0001'
Accept: application/json

--BATCH_BOUNDARY--
```

---

## 망분리 환경에서의 OData

### 문제
- S/4HANA (내부망) → 외부 AI Tool (공개망) 직접 연결 불가

### 해결책: API Gateway (DMZ)

```
┌─────────────────────────────────────┐
│ SAP S/4HANA (내부망)               │
│ /sap/opu/odata/...                 │
└─────────────────────────────────────┘
        ↓ (내부 VPN)
┌─────────────────────────────────────┐
│ API Gateway (DMZ)                   │
│ - OAuth 2.0 검증                    │
│ - Rate Limiting                     │
│ - PII 마스킹                        │
│ - CORS 설정                         │
└─────────────────────────────────────┘
        ↓ (HTTPS, 공개망)
┌─────────────────────────────────────┐
│ AI Tool (외부)                      │
└─────────────────────────────────────┘
```

**구현**: SAP BTP API Management 또는 Apigee

---

## 주요 SAP Note

| SAP Note | 제목 |
|----------|------|
| **2768837** | OData v2 → v4 마이그레이션 |
| **2124458** | OData 성능 최적화 |
| **2341844** | RFC vs OData 선택 가이드 |
| **2288952** | OAuth 2.0 in SAP |

---

## 참고 자료

- [OData 공식 스펙](https://www.odata.org/)
- [SAP OData Service Playground](https://sap-odata-demo.herokuapp.com/)
- [SAP API Hub](https://api.sap.com/)
- [SAP S/4HANA OData Services](https://help.sap.com/docs/SAP_S4HANA_OP/40a32b7e6f5d404ab7ff01cdef0c4f66/500ae64e3c094cffaec69df1ff29ad6c.html)

---

**마지막 업데이트**: 2026-04-15 | **버전**: v2.1.0
