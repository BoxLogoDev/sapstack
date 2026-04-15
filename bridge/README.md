# SAP 시스템 브리지 패턴 (System Integration Patterns)

## 디렉토리 목적

**bridge/** 는 **SAP 시스템 ↔ AI 도구 간 데이터 교환 패턴**을 정리하는 기술 허브입니다.

sapstack의 핵심 철학: **"AI는 안내자, 사람이 실행자"** — SAP를 직접 조작하지 않으되, 운영자가 활용할 수 있는 자동화 패턴과 API 가이드를 제시합니다.

```
┌─────────────────────────────────────────────────────┐
│      운영자 / 컨설턴트                             │
└─────────────────────────────────────────────────────┘
        ↑ (안내: 문제 진단, 해결책 제시)
        │
┌─────────────────────────────────────────────────────┐
│   sapstack Evidence Loop                           │
│   (INTAKE → HYPOTHESIS → COLLECT → VERIFY)        │
└─────────────────────────────────────────────────────┘
        ↓ (자동화: 스크립트, RFC, OData)
        │
┌─────────────────────────────────────────────────────┐
│        SAP ERP / S/4HANA / BTP                     │
│   (RFC · OData · IDoc · CPI · REST API)            │
└─────────────────────────────────────────────────────┘
```

---

## 패턴의 3계층

### Layer 1: 데이터 수집 (Data Collection)
**목표**: Evidence Bundle 자동 수집 (사람의 손수고 감소)

| 패턴 | 대상 | 용도 |
|------|------|------|
| **RFC** | 온프레미스 ERP/S4H | BAPI 호출로 실시간 데이터 조회 |
| **OData** | S/4HANA (클라우드/온프레미스) | REST 기반 조회 (표준 서비스) |
| **IDoc** | 레거시/외부 시스템 | 배치 데이터 교환 |
| **CPI** | SAP BTP | 통합 플로우 (workflow) |

### Layer 2: 데이터 변환 (Data Transformation)
**목표**: 수집한 데이터를 AI 분석 가능한 형식으로 변환

| 포맷 | 용도 |
|-----|------|
| JSON | AI에게 직관적 (권장) |
| CSV | 스프레드시트 분석 |
| XML | 시스템 간 표준 교환 |
| PDF | 증빙 문서 |

### Layer 3: 피드백 루프 (Feedback Loop)
**목표**: AI의 권장사항을 SAP로 다시 입력 (선택사항)

| 방식 | 리스크 | 비고 |
|-----|------|------|
| **수동 입력** | 낮음 | 사람이 확인 후 입력 (권장) |
| **자동 실행** | 높음 | 감시 권한 필수, 롤백 준비 필수 |

---

## 파일 구조

```
bridge/
├── README.md                 ← 이 파일
├── rfc-pattern.md            ← RFC/BAPI (온프레미스)
├── odata-pattern.md          ← OData v2/v4 (S/4HANA)
├── rest-pattern.md           ← REST API (S/4HANA Cloud PE)
├── idoc-pattern.md           ← IDoc 메시징
├── cpi-pattern.md            ← SAP Cloud Integration (BTP)
└── templates/
    ├── python-rfc-client.py   ← PyRFC 샘플 코드
    ├── javascript-odata.js    ← OData 호출 샘플
    ├── bash-evidence-script.sh ← Evidence 수집 배치 스크립트
    └── sap-note-checklist.md  ← SAP Note 참조 체크리스트
```

---

## 패턴 선택 가이드

### "어떤 패턴을 선택해야 하나?"

```
시작: SAP 버전 & 네트워크 환경은?

├─ 온프레미스 ERP/S4H → RFC 패턴 추천
│  └─ RFC 불가 (망분리) → 파일 기반 (배치 스크립트)
│
├─ S/4HANA (클라우드) → OData 패턴 추천
│  └─ 높은 보안 → SAP Cloud Platform (SCP) OAuth
│
├─ 외부 시스템과 실시간 연동 → CPI 패턴 추천
│  └─ 또는 REST API + API Management
│
└─ 레거시 + 신규 혼재 → IDoc 기반 Async 처리
   └─ 또는 CPI iFlow로 통합
```

---

## 보안 & 망분리 고려사항

### 망분리 환경 (한국/금융/방산)

**SAP와 외부 시스템의 직접 통신 불가**:
- RFC 원격 호출 차단
- HTTP/REST 외부 호출 차단
- 오직 **파일 기반 배치** 또는 **DMZ 게이트웨이** 만 가능

**대안**:

```
┌────────────────────────────────────┐
│   SAP 내부망 (ERP/S4H)             │
│   - 배치 작업으로 파일 생성        │
│   - SFTP 서버에 저장               │
└────────────────────────────────────┘
         ↓ (VPN/SFTP)
┌────────────────────────────────────┐
│   DMZ / 게이트웨이 (MFT)           │
│   - 파일 무결성 검증               │
│   - 암호화 처리                    │
│   - 로깅                          │
└────────────────────────────────────┘
         ↓ (HTTPS)
┌────────────────────────────────────┐
│   AI Tool / 외부 시스템            │
│   - Evidence 분석                  │
│   - 권장사항 제시                  │
└────────────────────────────────────┘
```

### 보안 체크리스트

- [ ] RFC 호출 시 **SNC (Secure Network Communication)** 활성화
- [ ] OData 접근 시 **OAuth 2.0** 또는 **mTLS** (상호 인증서) 사용
- [ ] 모든 통신 **TLS 1.2 이상** 암호화
- [ ] 데이터 전송 시 **PII (Personally Identifiable Information) 마스킹**
  - 예: 직원 ID 대신 부서/직급만 수집
- [ ] 로그 기록 및 **감시 추적 (Audit Trail)** 유지

---

## 자주 사용하는 SAP 트랜잭션

### 데이터 조회

| T코드 | 용도 |
|------|------|
| **FBL3N** | 개별 거래 내역 (G/L) |
| **FBL1N** | 채권 내역 (Vendor) |
| **FBL5N** | 채무 내역 (Customer) |
| **MBIB** | 재고 현황 |
| **COEP** | 원가 요소 거래 |

### RFC 호출

| BAPI | 용도 |
|------|------|
| **BAPI_COMPANYCODE_GETDETAIL** | 회사 정보 |
| **BAPI_COSTCENTER_READ** | 원가센터 정보 |
| **BAPI_EMPLOYEE_GETDATETIME** | 직원 정보 |
| **BAPI_TRANSACTION_ROLLBACK** | 거래 롤백 |
| **BAPI_JOURNAL_ENTRY_POST** | 분개 게시 |

### 리포팅

| T코드 | 용도 |
|------|------|
| **ZLOG** | 변경 로그 (감시 추적) |
| **VOFI** | 부가세 신고 보조 |
| **FB51** | 세금 코드 조회 |
| **F110** | 자동 지급 운영 |

---

## 패턴별 장단점 비교

| 패턴 | 장점 | 단점 | 네트워크 요구 |
|-----|------|------|-------------|
| **RFC** | 실시간, BAPI 풍부 | 직접 연결 필수, 관리 복잡 | Direct / VPN |
| **OData** | REST 표준, 도큐먼트 풍부 | 성능 낮음 (HTTP overhead) | HTTPS |
| **REST** | 클라우드 표준 | S/4 Cloud만 지원 | HTTPS |
| **IDoc** | 비동기, 신뢰성 | 느림, 별도 구성 필수 | 파일 또는 VPN |
| **CPI** | 중앙화, 관리 용이 | 라이선스 추가 비용 | BTP 연결 |
| **파일 배치** | 망분리 안전 | 느림, 실시간 불가 | SFTP / 파일 서버 |

---

## Evidence Loop 예시

**시나리오**: 부가세 신고 오류 진단

```
STEP 1: INTAKE
  사용자: "4월 부가세 신고에서 10,000,000 원 누락 의심"
  
STEP 2: HYPOTHESIS
  sapstack: "VAT 거래 인식 시점 문제? 또는 데이터 입력 오류?"
  
STEP 3: COLLECT (자동화)
  RFC BAPI_TRANSACTION_READ:
    - 3월 수출 거래 (VAT 0%) 확인
    - 4월 판매 거래 (VAT 10%) 확인
    - 크레딧 메모 (환급액) 확인
  
  OData /sap/opu/odata/sap/GLM_POSTING_SRV:
    - G/L 계정별 월별 집계
  
  CSV 생성: evidence-bundle-202604.csv
  
STEP 4: VERIFY
  sapstack:
    "발견: 크레딧 메모 1건(1,500,000)이 3월 대신 5월에 기록됨
     → 4월 신고 시 미포함
     → 원인: 거래일(문서일) vs 발행일 혼동
     권장: FTXP에서 '발행일' 기준 재설정"
  
  사용자: 권장사항 검토 후 수정 (예정세금)
```

---

## 주요 SAP Note

| SAP Note | 제목 | 카테고리 |
|----------|------|---------|
| **2128107** | RFC 연결 문제 해결 | RFC |
| **2124458** | OData 성능 최적화 | OData |
| **2748370** | S/4 REST API 가이드 | REST |
| **1644767** | IDoc 모니터링 (WE05) | IDoc |
| **2902870** | CPI iFlow 템플릿 | CPI |
| **2900571** | 망분리 환경 배포 | Security |

---

## 다음 단계

1. **사용자의 SAP 환경 파악**
   - 버전: ERP/S4H (온프레미스) vs S/4 Cloud PE?
   - 네트워크: 직접 연결 vs 망분리?
   - 필요 권한: RFC 호출 가능? OData 서비스 활성화?

2. **적절한 패턴 선택**
   - 위의 "패턴 선택 가이드" 참조
   - 해당 문서 읽기 (RFC-pattern.md, OData-pattern.md 등)

3. **템플릿 코드 다운로드**
   - templates/ 폴더의 샘플 코드 (Python/JS/Bash)
   - 환경에 맞춰 커스터마이징

4. **감시 추적 설정**
   - 모든 데이터 접근 로깅 (T코드: ZLOG)
   - 규정상 요구사항 확인 (K-SOX, GoBD, DSGVO 등)

---

## 버전 히스토리

| 버전 | 날짜 | 변경 |
|------|------|------|
| v2.1.0 | 2026-04-15 | 초기 릴리스: RFC, OData, REST, IDoc, CPI |
| v2.2.0 | TBD | 망분리 환경 상세 가이드 추가 |
| v2.3.0 | TBD | Python/Node.js 클라이언트 라이브러리 |

---

## 참고 자료

- [SAP RFC SDK](https://help.sap.com/docs/SAP_NW_750/developing-applications-with-sap-nw-as-for-java/819f7f7eb2e04e0e8d8c0d5b2f1a1b1b.html)
- [OData Documentation](https://www.odata.org/)
- [SAP S/4HANA REST API](https://help.sap.com/docs/SAP_S4HANA_OP)
- [SAP BTP Cloud Integration](https://help.sap.com/docs/CLOUD_INTEGRATION)
- [SAP ABAP Standards](https://help.sap.com/docs/ABAP)

---

**Maintained by**: sapstack contributors
**License**: MIT + SAP Legal Compliance
