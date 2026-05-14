# BASIS 거버넌스·감사 (Tier 3) Best Practice

## 적용 범위
- **ECC**: ✓
- **S/4 HANA**: ✓
- **한국 특화**: ✓ (K-SOX·전자세금계산서 감사 trail·망분리)

---

## 1. 변경 관리 (Change Management)

### 1.1 트랜스포트(Transport) 거버넌스
- [ ] 모든 운영 변경은 **트포로만** 적용 — 직접 수정 금지
- [ ] DEV → QAS → PRD 3-tier 트포 흐름 강제
- [ ] PRD 트포 import는 **두 명 승인** (4-eyes principle)
- [ ] STMS Queue가 항상 0에 가깝게 (적용 안 된 트포 누적 금지)

### 1.2 변경 분류 기준

| 분류 | 정의 | 승인 |
|---|---|---|
| **Standard** | 사전 승인된 반복 변경 (예: 사용자 추가) | 운영자 자율 |
| **Normal** | 신규 기능·구성 변경 | Change Board (주 1회) |
| **Major** | DB 스키마, NW upgrade, EHP 적용 | CIO/CTO 승인 |
| **Emergency** | 운영 장애 즉시 fix | 사후 보고 + 별도 트랜스포트 트레일 |

### 1.3 변경 추적
- 모든 트포: **CTS+ 자동 잠금** (TR 번호 → JIRA/ServiceNow 티켓 연결)
- CDPOS/CDHDR — 마스터 데이터·구성 변경 추적
- 변경 로그 보존: 최소 **5년** (한국 법정 의무 7년 권장)

---

## 2. 사용자 접근·권한 관리

### 2.1 권한 거버넌스
- [ ] **PFCG 역할 분리** (Segregation of Duties)
  - 한 사용자가 동시 보유 금지인 역할 조합 정의
  - 예: "트포 생성" + "트포 import to PRD" 분리
- [ ] **SAP_ALL / SAP_NEW 금지**
  - 운영 시스템에서 전체 권한 보유자 0명
  - 응급 시: 임시 "Firefighter" 역할 (GRC 또는 자체 워크플로우)
- [ ] **분기 권한 재인증** (Quarterly Recertification)
  - 부서장이 자기 부하의 권한을 재검토·승인
  - GRC 자동화 또는 SUIM 리포트 기반

### 2.2 사용자 라이프사이클
- 입사 → 권한 부여: 표준 역할 템플릿
- 이동 → 권한 변경: 이전 권한 즉시 제거
- 퇴사 → SU01 즉시 잠금 (당일) + 24시간 내 사용자 삭제
- 휴직 → 일시 잠금 (계정 보존)

### 2.3 권한 위반 모니터링
- **SUIM 리포트 — 위험 권한 조합 보유자 목록** (월 1회)
- **STAD/SE38 RSUSR200 — 사용자 활동 통계**
- **권한 변경 이력**: USR40, USR41 테이블 분석

---

## 3. 감사 (Audit) 대응

### 3.1 K-SOX (Korean Sarbanes-Oxley)
한국 상장사는 K-SOX 의무. BASIS 관련 통제:

| 통제 | 검증 증거 |
|---|---|
| **ITGC-1**: 변경 관리 | 트포 로그, 승인 워크플로우 |
| **ITGC-2**: 접근 통제 | PFCG·SU01 변경 이력, 재인증 기록 |
| **ITGC-3**: 운영·모니터링 | 백업 로그, 장애 대응 기록 |
| **ITGC-4**: 분리된 임무 | SoD 위반 보고서 |
| **ITGC-5**: 데이터 무결성 | DB 백업 검증, audit log 보존 |

### 3.2 감사 trail 보존
- **CDPOS / CDHDR** (변경 문서): 최소 5년, 권장 7년
- **STAD / Security Audit Log (SM19/SM20)**: 1년 이상 보존, K-SOX 7년
- **SM21 시스템 로그**: 90일 이상 (사이트별 정책)
- **SLG1 응용 로그**: 변경 가능 트랜잭션 1년

### 3.3 감사 인터뷰 준비
정기 외부 감사 시 BASIS 담당자가 답해야 할 표준 질문:

1. 변경 관리 절차는?
2. PRD 액세스 권한 보유자는?
3. SoD 위반 정기 검토 주기는?
4. 백업·복구 테스트 최근 실행은?
5. 사용자 인증 표준 (MFA 적용 여부)?
6. 시스템 모니터링 도구·alert 정책?
7. 인시던트 대응 시간 SLA?

---

## 4. 한국 특화 거버넌스

### 4.1 망분리 (Network Separation)
- 망분리 환경의 SAP는 **외부 인터넷 RFC 차단**
- 외부 연동은 **보안 게이트웨이** 경유 (예: APIPark, SECUI)
- DMZ 영역 SAP Gateway 별도 구성 (SMGW)

### 4.2 전자세금계산서 (e-Tax Invoice)
- 국세청 연동: BASIS는 인증서·통신 무중단 보장
- 인증서 만료 (STRUST) 시 즉시 갱신 (월 1회 점검)

### 4.3 개인정보보호법 (PIPA)
- 사용자 PII (주민번호·계좌) 접근 로깅
- 마스킹: SU01 등에서 노출되는 PII는 ABAP 디스플레이 시 부분 마스킹
- 동의 철회 → 데이터 삭제 절차 (HCM·CRM 모듈 협업)

---

## 5. 보안 거버넌스 (Cyber Security)

### 5.1 패치 관리
- **SAP Security Note**: 월간 검토 (Patch Day 둘째 화요일)
- 우선순위: HotNews > High > Medium > Low
- SP/EHP 업그레이드: 분기 정기 + 긴급 시 비정기

### 5.2 인증서·암호화
- HTTPS Everywhere (HTTP 사용 금지)
- SNC (Secure Network Communication) 활성 — RFC 통신 암호화
- TLS 1.2+ 강제 (1.0/1.1 비활성)

### 5.3 침해 대응
- IDS/IPS 연동 (외부 솔루션)
- 침입 시도 → SM21/SM19 패턴 모니터링
- 사고 발생 → 30분 내 격리, 24시간 내 보고

---

## 6. 비즈니스 연속성·재해복구

### 6.1 백업 정책
- DB Full backup: 일 1회
- Transaction log: 시간 단위
- 백업 보관: 7일 일간, 4주 주간, 12개월 월간
- 오프사이트 백업: 분기 1회 (별도 지역)

### 6.2 DR 테스트
- 연 1회 실제 fail-over 테스트 (의무)
- RTO (복구 목표 시간): 4시간 이내
- RPO (복구 시점 목표): 1시간 이내 (Tier 1 시스템)

### 6.3 인시던트 대응
- 등급: P1 (전체 다운), P2 (부분 영향), P3 (성능), P4 (단일 사용자)
- P1/P2: PagerDuty 자동 호출, 30분 내 응답 SLA

---

## 7. 거버넌스 결과 보고

월간 BASIS 거버넌스 대시보드:

| 지표 | 임계치 | 측정 |
|---|---|---|
| PRD 변경 수 | 통계 | 트포 카운트 |
| SoD 위반 보유자 | 0 | SUIM 리포트 |
| 권한 재인증 완료율 | > 95% | 분기별 |
| 백업 성공률 | > 99% | DB 로그 |
| SAP Security Note 패치 시한 준수율 | > 90% | SNOTE 트래킹 |
| 평균 인시던트 복구 시간 | < 4시간 | PagerDuty 통계 |

---

## 연관 문서
- `operational.md` — 일상 운영
- `period-end.md` — 마감 기간
- `../../../sap-bc/skills/sap-bc/SKILL.md` — 한국 BC 거버넌스 특화
- `../../../sap-abap/skills/sap-abap/references/best-practices/governance.md` — ABAP 코드 거버넌스
