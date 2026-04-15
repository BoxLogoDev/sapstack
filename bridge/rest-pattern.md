# SAP REST API 통합 패턴

> SAP S/4HANA Cloud + BTP 환경의 REST API 활용 가이드

## 개요

REST는 SAP의 **현대적 통합 표준**입니다. OData v4도 REST 기반이지만, 이 문서는 일반 REST/JSON API를 다룹니다.

## 주요 시나리오

### 1. S/4HANA Cloud Public Edition
- 모든 통합이 REST/OData v4 기반
- On-premise 같은 RFC 미지원
- API Hub: api.sap.com에서 명세 확인

### 2. SAP BTP 서비스
- Identity Authentication (IAS)
- Destination Service
- Connectivity Service (on-premise 연결)
- AI Core / Generative AI Hub

### 3. Custom 확장 (Side-by-Side)
- BTP CAP (Cloud Application Programming) 모델
- Node.js / Java REST 서비스
- SAP HANA Cloud 백엔드

## 인증 방법

### OAuth 2.0
- 가장 일반적
- Authorization Code Flow (UI 통합)
- Client Credentials (서버 간)
- Refresh Token

### Basic Auth
- 간단하지만 보안 약함
- 내부망/테스트만 권장

### X.509 Certificate
- 상호 인증 (mTLS)
- BTP-온프레미스 안전 연결

### API Key
- BTP API Management 통한 발급
- 트래픽 제한 / 사용량 추적

## sapstack 활용 시나리오

### 1. Evidence 자동 수집
- 운영자 권한으로 Read API 호출
- 결과를 Evidence Bundle로 정형화

### 2. Cloud PE 컨설팅
- API Hub에서 사용 가능한 endpoint 분석
- Custom Logic 가이드 (Tier 2)

## 보안 고려사항

### 한국 망분리 환경
- 외부 REST API 호출 제한
- BTP Connectivity Service Reverse Proxy 활용
- 정부/금융권: 별도 망분리 SAP 인스턴스 + 제한적 API 노출

### Rate Limiting
- BTP API Management로 throttling
- 클라이언트 측 retry with exponential backoff

### CORS
- BTP Destination에서 Origin 제어
- Preflight 요청 처리

## 모니터링

- BTP Cockpit → Subaccount → API Management → Analytics
- 응답 시간, 에러율, 트래픽 패턴
- 알람: PagerDuty/Slack 연동

## 예시 endpoint (S/4HANA Cloud)

```
GET /API_BUSINESS_PARTNER/A_BusinessPartner
POST /API_SALES_ORDER_SRV/A_SalesOrder
GET /API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder
```

## 관련 SAP Note
- 2330667: BTP REST API 인증 가이드
- 2933095: S/4HANA Cloud API 활용
