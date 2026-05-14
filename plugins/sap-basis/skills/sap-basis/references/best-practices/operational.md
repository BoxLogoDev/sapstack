# BASIS 일상 운영 (Tier 1) Best Practice

## 적용 범위
- **ECC**: ✓
- **S/4 HANA**: ✓
- **RISE / Cloud PE**: △ (Cloud PE는 일부 Tier 1 적용 안 됨)
- **한국 특화**: ✓ (망분리·STMS 라우팅·언어팩)

---

## 일간 (Daily) 운영

### 시스템 헬스 체크
- [ ] **SM50 / SM66 — 워크프로세스 모니터링**
  - 왜: 정체된 WP·잠금 사용자·메모리 폭주 조기 발견
  - 빈도: 일 2회 (오전 9시, 오후 2시)
  - 확인항목:
    - DIA WP 가용율 70% 이상 유지
    - BTC WP 큐 길이 < 10
    - PRIV 모드 WP 0개
    - 오래된 (>15분) running WP 식별

- [ ] **ST22 — ABAP 덤프 분석**
  - 왜: 운영 안정성·잠재 버그 추적
  - 빈도: 일간
  - 확인항목:
    - 신규 덤프 모두 분류 (인프라/응용/사용자/외부)
    - 동일 덤프 3회 이상 반복 → 즉시 조사
    - TSV_TNEW_PAGE_ALLOC_FAILED → 메모리 파라미터 검토
    - DBIF_RSQL_INVALID_CURSOR → DB 락 또는 timeout

- [ ] **SM21 — 시스템 로그**
  - 왜: 인스턴스 레벨 이벤트·dump 누락분 보완
  - 빈도: 일간 (오전)
  - 확인항목: ERROR/WARNING 메시지 분류, 반복 패턴 찾기

### 백업·복구 검증
- [ ] DB 백업 성공 여부 확인 (자동화 로그)
- [ ] 트랜잭션 로그(redo) 백업 정상 (Oracle/HANA)
- [ ] BR*Tools 로그 (Oracle) 또는 HANA Cockpit 백업 상태

### 잡 모니터링
- [ ] **SM37 — 배치 잡 오버뷰**
  - 왜: 일간 잡 실행 결과 추적
  - 확인항목:
    - 모든 일간 standard job (RSPO0041, SAP_REORG_BATCHINPUT 등) 정상 종료
    - 잡 평균 실행시간 ±20% 이상 변동 → 조사
    - CANCELED 상태 잡 즉시 분석

### RFC·통신
- [ ] **SM59 — RFC destinations 헬스**
  - 왜: 외부 시스템 연동 끊김 조기 발견
  - 빈도: 일 1회
  - 명령: SM59에서 trusted destination test → 모두 GREEN

### 사용자 세션
- [ ] **SM04 / AL08 — 활성 사용자 세션**
  - 왜: 좀비 세션·license 위반 모니터링
  - 비활성 4시간 이상 세션 정리

---

## 주간 (Weekly) 운영

### 성능·메모리
- [ ] **ST02 — 메모리 버퍼**
  - 모든 buffer hit ratio > 99%
  - swap 발생률 < 1%/일

- [ ] **DB02 — DB 사용량 트렌드**
  - Tablespace 사용율 모니터링 (>85% 경고)
  - 최대 테이블 Top 10 (BSEG, ACDOCA, CDPOS, EDIDS 등)

### 보안
- [ ] **SU01 — 비활성 사용자 정리**
  - 90일 미접속 사용자 잠금
  - 퇴사자 즉시 deactivate
- [ ] **SUIM — 권한 위반 보고서**
  - 위험 권한 조합(SAP_ALL/J 등) 보유자 점검
- [ ] **STRUST — SSL 인증서 만료 임박**
  - 30일 이내 만료 인증서 식별 → 갱신 절차 시작

### 트포(Transport)
- [ ] **STMS — 트포 큐 정리**
  - 적용 안 된 트포 > 100개면 관리자 알림
  - 실패한 import (RC ≥ 8) 분석

---

## 모니터링 자동화 권장

| 도구 | 용도 |
|---|---|
| **Solman MAI** | 통합 시스템 모니터링 (alerts → 운영자) |
| **CCMS (RZ20)** | 인스턴스 레벨 임계치 알림 |
| **Cloud ALM** | RISE/Cloud PE 환경에서 Solman 대체 |
| **Kpis (External)** | Datadog/Splunk + SAP collector |

자동화 우선 대상:
1. WP 가용율 임계치 → Slack/Teams 알림
2. 백업 실패 → 즉시 PagerDuty
3. ST22 신규 덤프 카운트 → 일간 다이제스트
4. RFC GREEN/RED 변화 → 실시간 알림

---

## ECC vs S/4HANA 차이

| 영역 | ECC | S/4HANA |
|---|---|---|
| DB 모니터링 | DB02 (Oracle/MSSQL/DB2) | HANA Studio / HANA Cockpit |
| 메모리 | ST02 buffer | HANA in-memory + Workload Class |
| 백업 | BR*Tools / Native | HANA backup (file/Backint) |
| 사용자 | SU01 only | SU01 + Identity Authentication Service (Cloud) |

---

## 한국 특화 운영 주의사항

- **망분리 환경**: 외부 RFC destination은 보안 게이트웨이 경유 필수
- **한국어 언어팩**: SMLT로 KO 활성 + 한국어 메시지 클래스 일관성 확인
- **시차**: 한국 표준시(KST)로 잡 스케줄 정렬 (특히 글로벌 본사와 협업 시)
- **공휴일 캘린더**: SCAL/SCOT에서 한국 공휴일 등록 (잡 회피)

---

## 연관 문서
- `period-end.md` — 월/분기/연 마감 BP
- `governance.md` — 변경 관리·감사 BP
- `../../../sap-bc/skills/sap-bc/SKILL.md` — 한국 BC 컨설턴트 가이드
