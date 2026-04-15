# Security Exceptions (권한/감사)

> SAP 권한 및 보안 관련 예외 카탈로그

## 카테고리

| 영역 | 주요 예외/메시지 |
|------|----------------|
| 권한 부여 | Authorization missing, SU53 dump |
| 객체 권한 | S_TCODE, S_TABU_DIS, S_DEVELOP |
| K-SOX | SoD violation, dual approval bypass |
| 감사 | SM20 alerts, audit log gap |

---

## "No authorization for object [object_name]"

**카테고리**: 권한 / Authorization missing

**발생 조건**:
- 사용자 역할(PFCG)에 필요 권한 객체 미할당
- 권한 객체 값(field)이 부족 (특정 회사코드/플랜트만 허용 등)

**진단**:
- T-code: **SU53** (해당 사용자의 마지막 권한 거부 표시)
- T-code: **SUIM** (사용자 정보 시스템 — 역할/권한 분석)
- T-code: **PFCG** (역할 변경)

**해결**:
1. 사용자가 SU53 실행 → 권한 거부 정보 캡처
2. 보안 담당이 PFCG에서 적정 역할에 권한 객체 추가
3. **K-SOX 환경**: 권한 부여 워크플로 (요청-승인-부여-검증) 준수
4. SU01로 사용자에게 역할 재할당

**예방**:
- 신규 사용자 온보딩 체크리스트
- 분기별 사용자 권한 재인증 (User Access Review)
- SoD 매트릭스 활용

**관련 SAP Note**: 320991

---

## CX_SY_AUTH_CHECK_FAILED

**카테고리**: ABAP 런타임 / 권한 체크 실패

**발생 조건**:
- AUTHORITY-CHECK 명령 실패
- 커스텀 프로그램에서 권한 객체 검증 실패

**진단**:
- ST22 단기 덤프 분석
- 호출된 권한 객체 식별

**해결**:
1. 정당한 사용 케이스: PFCG 역할 보강
2. 부정한 접근 시도: SM20 감사 로그 검토 → 보안 인시던트
3. 코드 수정 필요 시: ABAP developer에게 위임

---

## "K-SOX SoD violation: User has conflicting roles"

**카테고리**: 한국 K-SOX / 직무 분리 위반

**발생 조건**:
- 한 사용자가 충돌 직무 동시 보유 (예: 공급업체 마스터 생성 + 지급 실행)
- K-SOX 분기 통제 평가에서 발견

**진단**:
- T-code: **SUIM** > Where used → Roles
- GRC Access Control (있을 시): SoD Risk Analysis
- 자체 SoD 매트릭스 vs 사용자 역할 비교

**해결**:
1. 즉시: 충돌 역할 중 하나 제거 (워크플로 승인)
2. 완화 통제(Mitigating Control) 필요 시: 별도 모니터링 등록
3. 외부 감사인에 보고 + 시정 조치 문서화

**예방**:
- 신규 역할 생성 시 SoD 사전 검증
- 분기별 SoD 위반 보고서
- 완화 통제 유효성 연간 검증

**관련 docs**: `docs/best-practices/authorization-governance.md`

---

## "Critical T-code execution outside business hours"

**카테고리**: 감사 / 비정상 접근 패턴

**발생 조건**:
- SE38, SE16, SU01 등 Critical T-code 야간/주말 실행
- SM20 보안 감사 로그에 기록됨

**진단**:
- T-code: **SM20** (Security Audit Log)
- T-code: **SM19** (감사 로그 설정)
- 필터: 사용자 + T-code + 시간

**해결**:
1. 정당한 긴급 작업: 사후 승인 워크플로
2. 부정 접근 의심: 보안팀 인시던트 대응
3. 비밀번호 변경 + 세션 강제 종료 (SM04)

**예방**:
- Firefighter 계정 사용 의무화 (긴급 시)
- 야간/주말 critical T-code 사용 시 Slack/Teams 자동 알림
- 분기 검토: SM20 패턴 분석

**관련 SAP Note**: 539404 (Security Audit Log)

---

## "Audit Log gap detected (SM20 retention insufficient)"

**카테고리**: K-SOX / 감사 추적 누락

**발생 조건**:
- SM20 보관 기간 부족으로 과거 감사 로그 손실
- 외부 감사인 요청 시점에 데이터 부재

**진단**:
- SM19로 보관 정책 확인
- 파일 시스템 (rsau/local/file) 디스크 사용량

**해결**:
1. 즉시: 보관 기간 연장 (RZ10 → rsau/max_diskspace_per_file)
2. 장기: 외부 SIEM 연동 (Splunk, ELK)
3. K-SOX 의무: 최소 5년 보관

**예방**:
- 디스크 공간 자동 모니터링
- 매일 어제 SM20 로그 외부 백업 (cron job)
- 분기 감사 로그 무결성 점검

**관련 docs**: `docs/compliance/audit-trail.md`

---

## 한국 특수 사항

### 망분리 환경 권한 처리
- 인터넷망/업무망/개발망 별도 SAP 인스턴스
- 사용자 계정도 망별 분리 (SSO 불가)
- 망간 데이터 이동: 별도 승인 절차 필수

### 개인정보보호법 대응
- 주민번호 등 PII 접근 시 별도 권한 객체
- 접근 로그 5년 보관 의무
- DLP (Data Loss Prevention) 솔루션 연동
