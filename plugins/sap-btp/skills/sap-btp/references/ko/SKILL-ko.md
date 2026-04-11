# SAP BTP 한국어 전문 가이드

> `plugins/sap-btp/skills/sap-btp/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- BTP 환경: Cloud Foundry / Kyma / ABAP Environment
- Region: 한국은 주로 **APJ / Singapore** (Seoul 있으면 해당)
- Subscription: Free / Trial / Standard / Enterprise
- 연동 대상: S/4HANA Cloud / on-prem / 3rd-party
- 개발 프레임워크: CAP / RAP / Fiori Elements / SAPUI5

---

## 2. BTP 계정 구조

```
Global Account
├── Directories (조직별)
│   └── Subaccounts (환경별 — dev/qa/prod)
│       └── Spaces (Cloud Foundry 전용)
│           └── Apps / Services
```

### 핵심 개념
- **Global Account**: 최상위 — 계약·과금 단위
- **Directory**: 조직 그룹핑 (선택)
- **Subaccount**: 환경 구분, API 엔드포인트
- **Space** (CF만): 애플리케이션 격리
- **Entitlements**: Global → Subaccount 서비스 할당

---

## 3. CAP (Cloud Application Programming Model)

### 프로젝트 구조
```
my-cap-app/
├── db/                    # 데이터 모델 (CDS)
│   └── schema.cds
├── srv/                   # 서비스 정의 + 로직
│   ├── service.cds
│   └── service.js
├── app/                   # Fiori UI
├── package.json
└── cdsrc.json
```

### CDS 기본 예시
```cds
namespace my.bookshop;

entity Books {
  key ID : Integer;
  title  : String(100);
  author : String(100);
  stock  : Integer;
  price  : Decimal(9,2);
}
```

```cds
// srv/service.cds
using my.bookshop as bookshop from '../db/schema';

service CatalogService {
  entity Books as projection on bookshop.Books;
}
```

### 실행
```bash
cds init my-app
cd my-app
cds watch       # local dev server
cds deploy      # deploy to HANA Cloud
```

---

## 4. Fiori Elements / UI5

### Fiori Elements (template-driven)
- **List Report** — 검색·필터·리스트
- **Object Page** — 상세 조회·편집
- **Analytical List Page** — 차트·KPI
- **Overview Page** — 카드 기반 대시보드
- **Worklist** — 작업 목록

### 특징
- 거의 코드 없이 OData annotation만으로 생성
- CDS `@UI` annotation이 UI 결정
- 수정 필요 시 SAPUI5 custom controls

### SAPUI5 (manual)
- 완전 커스텀 UI 필요 시
- JavaScript/TypeScript
- MVC 패턴
- openui5 (open source) vs SAPUI5 (SAP)

---

## 5. OData Services

### V2 vs V4
| 항목 | V2 | V4 |
|------|----|----|
| 릴리스 | 2010 | 2014 |
| SAP Tools | Gateway (SEGW) | RAP |
| Query | $filter, $expand 기본 | V2 + $compute, $apply |
| 위치 | ECC + S/4 | S/4 권장 |

### CAP에서 노출
- 기본 **OData V4**
- `@path: '/odata/v2/...'` 로 V2 병행 가능

### Metadata
```
GET /service/$metadata        # 전체 스키마
GET /service/Books            # 엔티티 목록
GET /service/Books(1)         # 특정 레코드
GET /service/Books?$filter=stock gt 10
```

---

## 6. SAP Integration Suite

### 구성요소
- **Cloud Integration (CPI)** — iFlow 기반
- **API Management** — Rate limiting, Policy
- **Open Connectors** — 3rd-party 연결
- **Event Mesh** — Pub-Sub
- **Trading Partner Management** — EDI

### iFlow 구성요소
- **Start / End** 이벤트
- **Content Modifier** — 헤더/페이로드 수정
- **Mapping** — 데이터 변환 (XSLT, Groovy, JSON to JSON)
- **Router** — 조건 분기
- **Request-Reply** — 동기 외부 호출
- **Aggregator / Splitter** — 병합/분할

### Monitoring
- **Message Processing**: 실행 이력
- **Security Material**: 인증서·키
- **Number Ranges**: IDoc 번호 범위
- **Log Levels**: DEBUG / INFO / WARNING / ERROR

---

## 7. Security

### XSUAA (Authorization)
- **xs-security.json**: role collection 정의
- OAuth2 기반
- SAML 2.0 호환 (IdP 연동)
- Cloud Foundry 자동 바인딩

### Destination Service
- 백엔드 시스템 연결 정보 저장
- **Basic Auth** / **OAuth** / **ClientCertificate**
- Proxy support (**on-premise** 타입)

### Cloud Connector
- **On-premise → BTP 연결의 필수 관문**
- 역방향 프록시 (outbound만, inbound 차단)
- Virtual host mapping
- Principal Propagation (SSO)

---

## 8. ABAP Environment (Steampunk)

- BTP에서 ABAP 개발 가능
- **RAP**만 지원 (Classic ABAP ❌)
- **Side-by-side extension** 시나리오
- S/4HANA on-prem/Cloud와 별개
- 격리된 ABAP 시스템

---

## 9. HANA Cloud

- 클라우드 HANA DB (BTP 서비스)
- CAP 프로젝트에서 `hdi-shared` 서비스로 바인딩
- **HDI Container**: DB 스키마 격리
- **Data Lake**: 대용량 저장

---

## 10. Event-Driven Architecture

### SAP Event Mesh
- MQTT + AMQP 기반
- Pub-Sub 패턴
- S/4HANA Cloud의 **Enterprise Events** 수신 가능
- CAP에서 `cds.connect.to('messaging')` 으로 사용

### Event Types
- **Business Events** (S/4HANA → BTP)
- **Custom Events** (App → App)

---

## 11. 한국 특화

### 리전 고려사항
- **Seoul 리전 (ap-seo-1)**: 한국 데이터 레지던시 요구 충족 (최근 개설)
- **Singapore (APJ)**: 여전히 흔한 선택 — latency 30~60ms
- **Private Cloud (RISE)**: 한국 특정 요구 시

### 한국 SaaS 연동
- **카카오/네이버 로그인** — XSUAA custom IdP
- **토스페이먼츠·KG이니시스·KCP** — REST + Webhook
- **국세청 홈택스** — 전자세금계산서 (SAP DRC 경유)
- **국민은행·신한은행** — Pen Banking API

### 한국어 i18n
- CAP `_i18n/messages_ko.properties` 지원
- Fiori 자동 인식
- Right-to-Left 불필요

### 망분리 환경
- BTP는 **클라우드 전용** — 망분리 직접 불가
- **DMZ 경유** 필수
- **Cloud Connector**가 망분리 게이트웨이 역할
- 금융·공공 프로젝트는 Private Cloud 고려

---

## 12. 배포 워크플로

```bash
# 1. 로컬 개발
cds watch

# 2. HANA Cloud 연결
cds bind -2 db

# 3. Cloud Foundry 로그인
cf login -a https://api.cf.ap-seo-1.hana.ondemand.com

# 4. Build + Deploy
mbt build -p=cf
cf deploy mta_archives/my-app_1.0.0.mtar

# 5. 접속 확인
cf apps
```

## 13. 자주 참조하는 SAP Note
- **2637517** — Integration Suite Basics
- **2533767** — OData Services S/4HANA Best Practices
- **2925499** — Cloud Connector Setup
- **2138575** — RAP Getting Started

## 14. 관련
- `quick-guide.md`
- `/plugins/sap-abap/skills/sap-abap/references/ko/SKILL-ko.md` — RAP 개발
- `/agents/sap-integration-advisor.md` — 통합 아키텍처
