# Ariba CIG (Cloud Integration Gateway) 구성 가이드

## SPRO 경로

S/4 측 SPRO 노드 + Ariba 측 CIG 포털:

```
S/4: SPRO → Integration with SAP Ariba (ERP Integration Add-on)
CIG Portal: cig.ariba.com → Configuration → ERP / Realm
S/4: SM59 (CIG endpoint RFC) / SOAMANAGER (SOAP) / SLG1 (log)
```

## 필수 선행 구성

- [ ] ERP Integration Add-on for Ariba 설치 (S/4)
- [ ] CIG Worker(Cloud Connector) GREEN
- [ ] Ariba Realm + CIG 계정 (test/prod)
- [ ] Communication user / endpoint 자격증명

## 구성 단계 (Configuration Steps)

### 1. S/4 측 add-on 활성
1. SPRO → Integration with SAP Ariba → 기본 설정
2. CIG endpoint URL / 인증 (SM59 destination 또는 SOAMANAGER binding)
3. 전송 문서 활성 (Material, Vendor, PR, PO, Invoice, Confirmation)

### 2. CIG Portal 구성
1. CIG → ERP Configuration → S/4 시스템 등록 (system ID, client)
2. Realm 연결 (test→test, prod→prod 엄격 분리)
3. Mapping: Material/Vendor/PR/PO 표준 → Ariba 필드 (커스텀 필요 시 transformation)

### 3. 문서 흐름 활성
1. PR → Sourcing / Procurement (방향별 iFlow)
2. PO 송신, Confirmation/Invoice 수신
3. Error handling: retry 정책, 알림

## 구성 검증 (Verification)

- [ ] CIG Worker / Cloud Connector status GREEN
- [ ] Test 문서 1건 end-to-end (S/4 PR → Ariba → PO → S/4)
- [ ] CIG Monitor → Message status에 error 0
- [ ] S/4 SLG1 CIG namespace 로그 클린
- [ ] test/prod Realm 혼선 없음 (endpoint 검증)

## 한국 현장 체크

- 사업자등록번호 사용자정의 필드가 Vendor 매핑에 포함됐는지
- 한국 부가세 코드 V0~V9 ↔ Ariba tax category 매핑
- 국내 공급사 이메일 폴백 전송 설정

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| PO 공급사 미수신 | Trading Relationship / 전송방식 / CIG 큐 |
| CIG 메시지 실패 | add-on 활성 / Worker DOWN / Realm 혼선 / 매핑 누락 |
