# Integration Exceptions (RFC / IDoc / OData / CPI)

> SAP 통합 시나리오에서 자주 발생하는 예외 카탈로그

## 카테고리

| 영역 | 주요 예외 |
|------|----------|
| RFC | CX_AI_SYSTEM_FAULT, CX_RFCSDK_* |
| IDoc | 상태 51 (Application error), 52 (Recovery), 53 (Posted) |
| OData | HTTP 4xx/5xx, $batch failures |
| CPI | iFlow processing errors |

---

## CX_AI_SYSTEM_FAULT

**카테고리**: RFC 통합 / 시스템 장애
**SAP 클래스 계층**: CX_ROOT → CX_DYNAMIC_CHECK → CX_AI_SYSTEM_FAULT

**발생 조건**:
- 원격 SAP 시스템 다운 또는 네트워크 단절
- RFC destination 미정의 (SM59)
- SNC 인증 실패

**진단**:
- T-code: SM59 (RFC 연결 테스트)
- T-code: SM58 (tRFC 모니터)
- 테이블: RFCDES (RFC destinations)

**해결**:
1. SM59에서 destination Connection Test → Authorization Test 순서
2. 망분리 환경: 방화벽 ACL 확인 (포트 33xx, 48xx)
3. SNC 사용 시: 인증서 만료 확인 (STRUST)

**예방**:
- SolMan 또는 RZ20에 RFC 모니터링 등록
- 주기적 health check 자동화

**관련 SAP Note**: 1486707, 2240375

---

## IDoc 상태 51 (Application error)

**카테고리**: IDoc / 적용 오류

**발생 조건**:
- IDoc 수신 후 적용 단계에서 오류
- 마스터 데이터 부족, 권한 부족, 비즈니스 룰 위반

**진단**:
- T-code: WE05 (IDoc 목록), WE02 (IDoc 표시)
- T-code: BD87 (IDoc 처리 관리)
- 테이블: EDIDC (IDoc Header), EDIDS (Status), EDID4 (Segments)

**해결**:
1. WE05에서 해당 IDoc 선택 → 상태 51 메시지 확인
2. WE19로 테스트 처리 (수정 가능)
3. WE02로 segment 데이터 수정 후 BD87로 재처리

**예방**:
- IDoc 처리 실패 알림 자동화 (BD87 결과 → 운영자 통보)
- ALEAUD 수신 시스템 모니터링

**관련 SAP Note**: 88153, 1597937

---

## CX_RFCSDK_BUSY

**카테고리**: RFC SDK / 자원 부족

**발생 조건**:
- 동시 RFC 호출 한도 초과
- Work Process pool 고갈

**진단**:
- T-code: SM50 (Work Process 상태)
- T-code: ST06 (시스템 부하)

**해결**:
1. 즉시: 비긴급 RFC 호출 중단
2. SM50에서 hung process 식별 → kill (Basis 권한)
3. RZ10에서 rdisp/wp_no_dia 증가 (재시작 필요)

**예방**:
- 비동기 RFC (qRFC, tRFC) 우선 사용
- 부하 분산 (SMLG 로그온 그룹)

---

## OData $batch Processing Failure (HTTP 400)

**카테고리**: OData / Batch 요청 실패

**발생 조건**:
- $batch 요청 내 일부 operation 실패 시 전체 롤백
- Atomic transaction 미설정

**진단**:
- T-code: /IWFND/ERROR_LOG (Gateway 에러 로그)
- T-code: /IWFND/TRACES
- 응답 본문에 상세 오류

**해결**:
1. /IWFND/ERROR_LOG에서 batch 요청 ID 추적
2. atomicity_group 설정 검토
3. 클라이언트 재시도 로직 구현

**예방**:
- batch 크기 제한 (200 operations 이하 권장)
- Continue-on-error 모드 검토

**관련 SAP Note**: 2168224

---

## CPI iFlow Processing Error

**카테고리**: SAP Cloud Integration / 메시지 처리 실패

**발생 조건**:
- 메시지 매핑 실패 (XSLT/Groovy 오류)
- Receiver 시스템 응답 없음
- 인증 만료

**진단**:
- CPI Web UI: Monitor → Message Processing
- 로그 레벨: TRACE (개발), INFO (운영)

**해결**:
1. Monitor에서 실패 메시지 → "Logs" 확인
2. 매핑 오류: groovy console 또는 XSLT debugger 사용
3. 자격증명 만료: Security Material 갱신

**예방**:
- iFlow별 alert subscription
- 모니터링 대시보드 (BTP Cockpit)

**관련 SAP Note**: 2745851
