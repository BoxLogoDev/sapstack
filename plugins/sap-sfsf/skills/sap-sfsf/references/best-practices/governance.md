# SuccessFactors 거버넌스·GDPR (Tier 3) Best Practice

## 1. 개인정보 거버넌스

### 1.1 데이터 분류
- **공개**: 이름·이메일·부서
- **내부**: 직책·연락처
- **기밀**: 급여·평가·건강 상태
- **1급 비밀**: 정신 건강·법적 사유

### 1.2 한국 PIPA
- 수집 최소화·동의 의무
- 처리 목적·기간 명시
- 위·수탁 계약
- 위반 시 24시간 신고

### 1.3 GDPR (EU 직원)
- 동의·합법적 근거
- 데이터 이전 메커니즘 (SCCs)
- DPO (Data Protection Officer) 지정
- 위반 시 72시간 신고 + 통지

## 2. 권한 관리

### 2.1 Role-Based Permission (RBP)
- 역할 기반 권한 (PFCG 유사)
- Permission Group + Permission Role
- 분기 재인증

### 2.2 SoD
- 페이롤 입력 ≠ 페이롤 승인
- 채용 결정 ≠ 페이롤 변경
- HR Admin 분리

### 2.3 분기 권한 검토
- Manager가 부하 권한 재검토
- Audit log 보존

## 3. 통합 거버넌스

### 3.1 EC ↔ ERP
- 동기화 SLA: < 5분 (실시간)
- 실패 시 재시도 (지수 백오프)
- 매월 reconciliation

### 3.2 EC ↔ 외부 시스템
- Active Directory: 인증 통합
- LinkedIn / Indeed: 채용 연동
- 4대보험 EDI: 정부 연동

### 3.3 API 거버넌스
- ODATA / SCIM 표준
- API Key 관리·rotation
- Rate limiting

## 4. 컴플라이언스

### 4.1 한국 노동법
- 근로기준법 준수 (근태·연차·휴가)
- 최저임금법 (페이롤 자동 검증)
- 산업안전보건법 (산재 추적)

### 4.2 글로벌
- ISO 27001 (정보보호)
- SOC 2 Type II
- SAP SuccessFactors 자체 인증

## 5. 감사 trail

- 모든 마스터 데이터 변경 로깅
- Audit Log: 1년 이상 보존
- K-SOX 감사용: 7년 보존

## 6. 거버넌스 지표

| 지표 | 임계 |
|---|---|
| 페이롤 정확도 | > 99.9% |
| 4대보험 신고 성공률 | 100% |
| 연말정산 정확도 | > 99.5% |
| EC ↔ ERP 동기화 성공률 | > 99.9% |
| GDPR/PIPA 위반 | 0 |
| 권한 재인증 완료율 | > 95% |

## 7. 인재 관리 거버넌스

- 평가 등급 분포: 강제 분포 사용 시 명문화
- Promotion 의사결정: 객관적 기준 + 4-eyes
- Calibration: 부서·연차·성별 다양성 검증

## 연관 문서
- `operational.md`, `period-end.md`
