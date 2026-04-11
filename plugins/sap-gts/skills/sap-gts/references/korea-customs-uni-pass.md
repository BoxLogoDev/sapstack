# UNI-PASS — 한국 관세청 전자통관 연동 상세 가이드

> SAP GTS와 한국 관세청 UNI-PASS 시스템 연동의 실전 가이드.

## UNI-PASS 개요

**UNI-PASS** (Unified Pass)는 대한민국 관세청(Korea Customs Service)이 운영하는 **국가 전자통관시스템**입니다.

- 공식 홈페이지: https://unipass.customs.go.kr/
- 24시간 자동 접수 (실제 심사는 근무시간)
- **전자신고 의무화** — 대부분의 상거래 수출입은 UNI-PASS 경유 필수

## 연동 아키텍처

### Option A: 직접 연동 (대기업)
```
SAP GTS ──EDI─→ UNI-PASS
   │
   └─ 공인인증서 서명
   └─ HTTPS (TLS 1.2+)
```

**장점**: 실시간, 단일 시스템
**단점**: 관세 법규 변경 시 직접 대응 부담

### Option B: 관세사 경유 (중견·중소)
```
SAP GTS ──RFC/EDI─→ 관세사 시스템 ──EDI─→ UNI-PASS
```

**장점**: 법규 대응을 관세사가 담당
**단점**: 추가 비용, 중간 단계

### Option C: 하이브리드
- 일부 거래 (대량, 반복): 직접
- 일부 거래 (복잡, 특수): 관세사

---

## EDI 메시지 표준

UNI-PASS는 한국 자체 EDI 포맷을 사용합니다 (UN/EDIFACT 기반 변형):

### 수출
- **EDIKD1** — 수출신고서
- **EDIKD2** — 수출신고 정정
- **EDIKD3** — 수출신고 취소

### 수입
- **EDIIM1** — 수입신고서
- **EDIIM2** — 수입신고 정정
- **EDIIMC** — 수입신고 취소

### 기타
- **EDIKAE** — 적하목록
- **EDIKCO** — 원산지증명서
- **EDIKBL** — 선하증권

---

## 필수 정보

### 수출 신고 시
- 수출자 (사업자등록번호)
- 해외 수입자
- 품목 (HS Code, 품명, 규격, 수량, 금액)
- 통화 (USD, EUR, JPY 등)
- 선적 항구·공항
- 목적지 국가
- 인코텀즈 (FOB, CIF 등)
- 운송 수단

### 수입 신고 시
- 수입자 (사업자등록번호)
- 해외 수출자
- 품목 정보
- 원산지 국가
- 관세 평가 (CIF 기준)
- 관세사 (해당 시)

---

## SAP GTS 설정 포인트

### 1. Feeder System 연결
- ECC/S4 → GTS RFC 연동
- **SM59** destination
- Master data 동기화

### 2. Country-Specific Customizing
- Country = KR
- Customs procedure codes
- Tax codes (한국 부가세)
- License types (한국 전략물자)

### 3. UNI-PASS Interface
- **SOAMANAGER** or **CPI iFlow**
- 전자서명 인증서 (STRUST)
- EDI 메시지 템플릿

### 4. Number Ranges
- GTS Customs Document number range
- UNI-PASS 신고번호 대응

---

## 공인인증서 관리

### 등록
1. **한국 CA 선택**: 한국정보인증 / 코스콤 / NICE평가정보
2. **STRUST** 열기
3. SSL Client (Standard) 또는 전용 PSE
4. Import certificate
5. 유효 기간 주의 (연 1회 갱신)

### 갱신
- 만료 30일 전 알림 설정
- 갱신 절차는 CA별 상이
- 갱신 후 STRUST 재등록
- 테스트 환경에서 검증 후 PRD

### 문제 해결
- 인증서 만료 → 신고 실패
- 루트 CA 누락 → SSL handshake 실패
- 개인키 비밀번호 → 정보보호팀 관리

---

## 관세사 시스템 연동 (Option B)

### 한국 주요 관세사 솔루션
- **CJ ENM 관세사**
- **한진 관세사**
- **DSV 관세사**
- **중소 관세사** — 다양한 전용 소프트웨어

### 연동 방식
- **RFC/IDoc**: SAP 표준
- **REST API**: 최신 방식
- **File transfer (SFTP)**: 레거시
- **Web Service**: 중간

---

## 흔한 이슈

### 1. HS Code 오류
- **증상**: UNI-PASS가 HS Code 거부
- **원인**: HSK 10자리 형식 아님, 무효 코드
- **해결**: 관세청 HSK 검색으로 검증

### 2. 공인인증서 만료
- **증상**: SSL handshake 실패, 신고 전송 불가
- **원인**: 인증서 만료
- **해결**: 새 인증서 STRUST 등록

### 3. 가격 평가 오류
- **증상**: 수입 관세 계산 차이
- **원인**: CIF vs FOB 혼동, 환율 일자
- **해결**: Incoterms 확인, 환율 테이블 (OB08) 점검

### 4. 원산지 증명 미첨부
- **증상**: FTA 적용 거부 (정상 관세율 부과)
- **원인**: C/O 파일 누락 or 형식 오류
- **해결**: Preference Determination 재실행

### 5. UNI-PASS 응답 지연
- **증상**: 신고 후 응답 없음
- **원인**: 시스템 점검, 네트워크, 관세청 부하
- **해결**: UNI-PASS 공지사항 확인, Message Replay

---

## 모니터링

### GTS 측
- **/SAPSLL/SPL_AUDIT** — SPL screening
- **/SAPSLL/CTSCUST_R3** — Customs document 조회
- **/SAPSLL/LCLOG** — License log

### SAP 통합 측
- **SM59** — Destination test
- **SMICM** — ICM log
- **SXMB_MONI** — PI/PO message (해당 시)
- **CPI Dashboard** — Integration Suite

### UNI-PASS 측
- UNI-PASS 포털 로그인
- 신고 이력 조회
- 응답 메시지 확인

---

## K-SOX 관점

- **수출입 신고**는 **K-SOX 대상** (상장사)
- Audit trail 보존
- 신고자 ≠ 승인자
- 분기별 샘플 감사

## 관련 법규

- **관세법** (Customs Act)
- **대외무역법** (Foreign Trade Act)
- **전자금융거래법** (전자 서명)
- **개인정보보호법** (사업자등록번호 취급)

## 관련 문서
- SKILL.md — GTS 전반
- `ko/SKILL-ko.md` — 한국어 전문 가이드
- `/plugins/sap-bc/skills/sap-bc/SKILL.md` — 공인인증서 STRUST
- `/agents/sap-integration-advisor.md` — RFC/EDI 연동 아키텍처
