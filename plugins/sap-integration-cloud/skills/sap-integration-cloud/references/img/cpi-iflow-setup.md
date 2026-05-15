# CPI iFlow & Integration Package 구성 가이드

## SPRO 경로

CPI 측은 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
Integration Suite → Design → Integration Packages → iFlow
Integration Suite → Monitor → Manage Security Material / Keystore
소스 S/4: SPRO/SOAMANAGER (SOAP) · WE20/WE21 (IDoc) · SM59 (RFC dest)
```

## 필수 선행 구성

- [ ] Integration Suite 테넌트 + Cloud Integration 활성
- [ ] Cloud Connector GREEN (온프레미스 소스)
- [ ] Security Material: 소스/타깃 자격증명·인증서 등록
- [ ] 소스 S/4 연동 T-code 활성 (SOAMANAGER/WE20 — B3 등록분)

## 구성 단계 (Configuration Steps)

### 1. Integration Package
1. Design → Integration Packages → 표준 패키지 Discover/copy 또는 New
2. 패키지 메타데이터 / 버전 관리

### 2. iFlow 설계
1. Sender/Receiver 채널 + Adapter 선택 (HTTPS/SOAP/SFTP/OData/IDoc)
2. Message Mapping / Value Mapping
3. Content Modifier / Router / Splitter 등 flow step
4. Exception Subprocess (에러 처리 — 필수)

### 3. Security Material
1. Monitor → Manage Security Material → credential(User/OAuth) 등록
2. Keystore: 클라이언트 인증서 / 신뢰 인증서
3. iFlow 채널에서 자격증명 참조

### 4. 배포 & 모니터
1. iFlow Deploy
2. Monitor → Message Processing 추적
3. 알림/재처리(retry) 정책

## 구성 검증 (Verification)

- [ ] iFlow Deploy 성공 (Started 상태)
- [ ] Test 메시지 end-to-end 성공 (Monitor: Completed)
- [ ] Exception subprocess가 에러 메시지 적절히 처리
- [ ] Security Material 만료일 모니터링 설정
- [ ] 소스 S/4 측 로그(SXMB_MONI/SRT_MONI) 일치

## 한국 현장 체크

- 한국 PG사(토스페이/KG이니시스) 연동 iFlow 인증서 만료 주기
- 망분리: Cloud Connector 경유 location ID
- 한국 EDI 사업자 IDoc 포맷 합의 버전

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| 메시지 실패 반복 | 매핑 오류 / credential 만료 / schema 검증 |
| IDoc 적체 | WE20 partner profile / IDX1·IDX2 / qRFC 큐 |
