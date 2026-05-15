# IBP ↔ S/4HANA CPI Integration 구성 가이드

## SPRO 경로

IBP 측은 클라우드 SaaS — 전통 SPRO IMG 미해당. 구성 위치:

```
CPI (Cloud Integration) → Integration Content → SAP IBP for S/4HANA
IBP Web UI → Configuration → External Codes / Communication
S/4 측: SPRO → Integration with Other SAP Components → IBP (해당 시)
```

> S/4 측은 표준 IBP integration add-on의 SPRO 노드를 사용하며, IBP 측은
> CPI Integration Content + External Codes 매핑으로 구성합니다.

## 필수 선행 구성

- [ ] CPI tenant 프로비저닝 + IBP/S4 Integration Package 배포
- [ ] Cloud Connector GREEN (S/4 온프레미스인 경우)
- [ ] S/4 Communication User / OAuth client 생성
- [ ] IBP Planning Area 활성화

## 구성 단계 (Configuration Steps)

### 1. CPI Integration Content 배포
1. CPI → Discover → "SAP Integrated Business Planning for ..." 패키지 copy
2. iFlow 활성화 (Master Data, Key Figure, Order-based)
3. 자격증명(Security Material): S/4 OAuth, IBP API key

### 2. S/4 측 연동 설정
1. SPRO → Integration with IBP (또는 표준 SOAP/OData 서비스 활성)
2. Communication Arrangement / RFC destination 구성
3. PIR transfer 대상 plant/version 매핑

### 3. IBP External Codes 매핑
1. IBP Web UI → Configuration → External Codes
2. Product/Location/UoM/Currency 코드를 S/4 코드와 매핑
3. Mismatch 시 transformation rule

### 4. PIR 릴리스 흐름 설정
1. IBP Application Job → PIR release 정의 (대상 Planning Area/version)
2. CPI iFlow 경유 → S/4 수신 (requirements type/version)
3. 스케줄 또는 on-demand

## 구성 검증 (Verification)

- [ ] CPI Monitor → Message Processing 성공 (Master Data, Key Figure)
- [ ] IBP PIR release Application Job 성공
- [ ] S/4 MD63에서 릴리스된 PIR 표시 확인
- [ ] S/4 MD05/MDBT MRP 실행 후 계획오더 생성
- [ ] External Codes mismatch 0 (CPI error log 클린)

## 한국 현장 체크

- 한국 자회사 통화(KRW)+이전가가 key figure 매핑에 포함됐는지
- 신차/신모델 부품 PIR을 협력사 알림 타이밍에 맞춰 릴리스하는지
- 환율 시나리오(원자재 수입 의존) 분석 결과가 S&OP에 통합되는지

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| CPI 연동 fail | iFlow 메시지 매핑 / S/4 마스터 변경 ID mismatch |
| PIR이 S/4에 안 보임 | IBP Application Job 상태 / requirements type·version |
| 코드 mismatch | IBP External Codes 재매핑 |
