# SAP CPI (Cloud Integration) 패턴

> SAP Integration Suite의 핵심 — Cloud Integration (구 HCI)

## 개요

CPI는 SAP의 **하이브리드 통합 플랫폼**으로, 클라우드/온프레미스 시스템 간 메시지 변환 및 라우팅을 담당합니다.

## 핵심 개념

### iFlow (Integration Flow)
- BPMN 2.0 기반 시각적 플로우 디자인
- Sender → Processing → Receiver 흐름
- Adapter, Splitter, Mapper, Router 등 구성

### Adapter
- HTTPS, SFTP, OData, IDoc, SOAP, AMQP, JMS, AS2
- ERP 연결: SAP S/4HANA OData, IDoc, RFC

### Mapping
- Message Mapping (XSLT 기반)
- Operation Mapping (Function Composition)
- Groovy / JavaScript 사용자 정의

### Security Material
- 자격증명 저장소
- OAuth tokens, certificates, SSH keys
- Vault 형태 (암호화)

## 표준 시나리오

### 1. S/4HANA → SuccessFactors 직원 동기화
- Cron trigger (매시간)
- S/4HANA OData 호출 (직원 변경 추출)
- Mapping (S/4 schema → SF schema)
- SF OData PUT

### 2. 외부 EDI → S/4HANA 판매 오더
- AS2 receiver
- EDI X12/EDIFACT 변환
- IDoc ORDERS05 생성
- S/4HANA로 송신

### 3. SAP Concur → S/4HANA 비용 전기
- Concur webhook receiver
- Mapping (Concur → FI document)
- BAPI 호출 (BAPI_ACC_DOCUMENT_POST)

## 진단 T-codes / Tools

| Tool | 용도 |
|------|------|
| CPI Web UI > Monitor | 메시지 처리 모니터링 |
| CPI Web UI > Design | iFlow 설계 |
| CPI Web UI > Operations | 배포, 추적 |
| BTP Cockpit > CPI Subscription | 인스턴스 관리 |
| Cloud ALM | E2E 모니터링 |

## sapstack 활용

### iFlow 오류 자동 진단

1. **증상**: "어제부터 EDI 주문이 SAP에 도달하지 않아요"
2. **Evidence 수집**:
   - CPI Monitor에서 24시간 메시지 export
   - 실패 메시지 logs (TRACE 레벨)
   - Receiver SAP 측 IDoc 상태
3. **가설**:
   - A: CPI iFlow 매핑 오류
   - B: Receiver SAP 시스템 다운
   - C: 인증 만료 (OAuth token)
4. **Verify**:
   - A 검증: 매핑 결과 비교 (input vs output)
   - C 검증: Security Material 만료일 확인

## 공통 오류 패턴

### "Connection refused" (Receiver Adapter)
- 원인: 대상 시스템 다운 또는 방화벽
- 해결: Receiver 시스템 health check, Connectivity Service 확인

### "Mapping error" (Message Mapping)
- 원인: Source XML 구조 변경, XSLT 누락
- 해결: Trace 활성화 → 입출력 비교

### "Authentication failed" (OAuth)
- 원인: Token 만료 또는 자격증명 변경
- 해결: Security Material 갱신

### "Throttling exceeded"
- 원인: BTP API Management rate limit 초과
- 해결: 배치 크기 축소, 호출 간격 증가

## 보안 고려사항

- TLS 1.2+ 의무
- 인증서 만료 모니터링 (자동 알림)
- Sensitive data masking in logs
- BTP 역할: Integration_Provisioner, Integration_Developer

## 한국 환경

### 망분리 시
- CPI는 클라우드 → 온프레미스 SAP과 직접 연결 불가
- 해결: BTP Connectivity Service Reverse Proxy
- 또는: 별도 DMZ 구간 SAP 인스턴스

### 한국 SaaS 연동
- 이카운트 (ECOUNT)
- 비즈플레이 (BizPlay) 카드비 정산
- 한국 은행 API (오픈뱅킹)
- 관세청 UNI-PASS

## 관련 SAP Note
- 2745851: CPI Cloud Integration 트러블슈팅
- 2937551: BTP Connectivity Reverse Proxy
- 3074575: CPI 보안 베스트프랙티스
