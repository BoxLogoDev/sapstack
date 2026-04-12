# SAP BASIS 한국어 전문 가이드

> 글로벌 Basis 주제의 한국어 버전. 한국 현장 특화 이슈(망분리·한글·K-SOX)는 `sap-bc` 플러그인 참조.

## 1. 환경 인테이크
- SAP 릴리스 (ECC EhP / S/4HANA 연도)
- DB (HANA / Oracle / DB2 / MSSQL / MaxDB)
- OS (Linux SLES/RHEL / Windows / AIX)
- Kernel 레벨 + 패치
- Landscape 구성 (DEV/QAS/STG/PRD)

---

## 2. 시스템 관리 (System Administration)

### Work Process 모니터링
- **SM50**: 로컬 서버 WP
- **SM51**: 모든 서버 목록
- **SM66**: Global WP 모니터 (분산 환경)
- **SM12**: Lock Entries
- **SM13**: Update Requests

### Process Types
| 코드 | 타입 | 용도 |
|------|-----|------|
| DIA | Dialog | 대화형 사용자 |
| BTC | Background | Job |
| UPD | Update | DB 업데이트 |
| UP2 | Update2 | 낮은 우선순위 업데이트 |
| SPO | Spool | 출력 |
| ENQ | Enqueue | Lock 관리 |

### Parameter Tuning
- **rdisp/wp_no_dia** — 대화 WP 수
- **rdisp/wp_no_btc** — 배경 WP 수
- **rdisp/max_wprun_time** — 최대 실행 시간

### System Log
- **SM21**: 시스템 로그 (전체)
- **/nSM21** 으로 역순 조회
- Severity 레벨 필터링

---

## 3. ABAP Runtime Error 분석

### ST22
- 덤프 조회
- Runtime Error Name
- Source code position
- Callstack
- Variable values

### 주요 덤프 유형
| 덤프 | 원인 | 해결 |
|------|------|------|
| TIME_LIMIT_EXCEEDED | 실행 시간 초과 | 쿼리 최적화, 파라미터 조정 |
| MEMORY_NO_MORE_PAGING | 메모리 부족 | 처리 분할, em/initial_size_MB 증가 |
| DBIF_RSQL_SQL_ERROR | DB SQL 오류 | Note 2327584, HANA plan cache |
| CONVT_CODEPAGE | Unicode 변환 | Note 2452523, 한글 이슈 |
| OBJECTS_OBJREF_NOT_ASSIGNED | Null pointer | IS BOUND 체크 |

---

## 4. Transport Management (STMS)

### Landscape
```
DEV (Development) → QAS (Quality Assurance) → PRD (Production)
```
대기업은 **STG (Staging/UAT)** 추가 흔함.

### 트랜잭션
- **STMS**: Transport Management System
- **STMS_IMPORT**: Import Queue
- **SE09/SE10**: Transport Organizer
- **SE01**: TR 확장 조회

### Transport Request Types
- **Workbench (K)**: 코드 + 글로벌 customizing
- **Customizing (Y)**: 클라이언트별 설정
- **Transport of Copies**: 일회성

### Release 순서
```
DEV에서 개발 → SE10 Release → STMS에 Queue 등장
    → QAS Import → UAT 테스트
    → PRD Import (Production)
```

### tp 로그
위치: `/usr/sap/trans/log/`
- ALOG — 전체 액션
- ULOG — 사용자
- SLOG — Short log
- Return Code 8 이상 = 오류

---

## 5. Performance Tuning

### SQL Performance (ST05)
- Trace 활성화 → 트랜잭션 실행 → Trace 종료
- Long runners 확인
- Full table scan 탐지
- Explain plan

### Runtime Analysis (SAT / SE30)
- ABAP 프로그램 성능 프로파일링
- Hot spot identification
- Method-level timing

### 주요 도구
| 도구 | 목적 |
|------|-----|
| **ST05** | SQL Trace |
| **SAT** / SE30 | ABAP Runtime |
| **ST06** | OS Monitor (CPU, Memory, Disk) |
| **ST02** | Memory Buffers |
| **ST03** | Workload Analysis |
| **ST10** | Table Call Statistics |
| **DB02** | DB Space + Performance |
| **DB05** | Index Analysis |

### HANA 특화
- **HANA Studio / DBA Cockpit**
- Column Store 통계
- Delta merge 상태
- Expensive Statements
- Plan cache

---

## 6. Security / Authorization

### User Management
- **SU01/SU02/SU03**: 개별 사용자
- **SU10**: 대량 사용자
- **SU01D**: 권한 비교
- User Type: Dialog / System / Service / Reference / Communication

### Role Management (PFCG)
- **PFCG**: Role Maintenance
- **Composite Roles** vs **Single Roles**
- Profile 자동 생성
- Transport 경유 이동 필수

### Authorization Check
- **SU53**: 마지막 권한 실패 추적
- **ST01**: Authorization Trace
- **SUIM**: User Information System
- **S_BCE_68001398**: 권한 추적 리포트

### 주요 Authorization Objects
- **S_TCODE**: T-code 실행
- **S_TABU_DIS**: 테이블 조회
- **S_DEVELOP**: 개발자 권한
- **F_BKPF_BUK**: 회사코드별 FI 전표
- **P_ORGIN**: HR 인포타입

---

## 7. Client Management

### 트랜잭션
- **SCC4**: Client 설정 (변경 허용/금지)
- **SCC1**: Client Copy from Transport
- **SCC3**: Client Copy Log
- **SCC7**: Post-Client Import
- **SCC8**: Client Export
- **SCCL**: Local Client Copy

### PRD 보호 (표준)
- **Changes and Transports for Client-Dependent Objects**: "No changes allowed"
- **Cross-Client Object Changes**: "No changes to repository and cross-client customizing"
- PRD 직접 변경 차단

---

## 8. Background Jobs

### 트랜잭션
- **SM36**: Job 정의
- **SM37**: Job 조회 (스케줄·상태·로그)
- **SM36WIZ**: Wizard
- **SM37C**: Flexible selection

### Job Status
- Released (대기)
- Ready (실행 준비)
- Active (실행 중)
- Finished (성공)
- Cancelled (실패)
- Scheduled (예약됨)

### 주요 Standard Job
- **SAP_REORG_\*** — 재구성 (ABAP, Spool, Job)
- **SAP_COLLECTOR_FOR_PERFMONITOR** — 성능 수집

---

## 9. RFC / IDoc

### RFC Destinations (SM59)
- **3 (ABAP)**: SAP-to-SAP
- **G (HTTP)**: HTTP 외부
- **H (HTTPS)**: HTTPS 외부
- **I (Internal)**: 내부 Gateway
- **T (TCP/IP)**: 외부 프로그램

### Test & Debug
- **SM59** Connection Test
- **SM59** Authorization Test
- **SMGW**: Gateway Monitor
- **SMICM**: ICM Monitor (HTTP)

### IDoc
- **WE02**: IDoc Display
- **WE05**: IDoc Lists
- **WE19**: Test Tool
- **WE20**: Partner Profile
- **WE21**: Port Definition
- **BD87**: 상태별 재처리

---

## 10. Kernel & SAP_BASIS

### Kernel Upgrade
- **SUM (Software Update Manager)**: 주요 도구
- `disp+work -v` — 버전 확인
- 백업 필수
- DEV → QAS → PRD 단계별

### SPAM / SAINT
- **SPAM**: Support Package Manager (SPs)
- **SAINT**: Add-On Installation Tool
- Queue 구성 → Check → Apply
- 실패 시 STPAM 복구

### SNOTE
- **SNOTE**: Note Assistant
- SAP Support Portal에서 Note 다운로드
- 의존성 자동 해결
- **Unicode 호환** 필수

---

## 11. Monitoring (CCMS)

### RZ20
- CCMS Monitoring Tree
- Alert 기반
- Threshold 설정 (yellow/red)

### Alert Types
- Performance
- Availability
- Security
- Custom (Z-)

### Solution Manager 연계
- **RZ21**: CCMS Agents
- **SOLMAN_DIAG**: Diagnostics
- **Focused Insights**: 대시보드

---

## 12. Backup & Recovery

### Oracle
- **BR*Tools** — SAP 공식 Oracle 백업
- **brbackup**, **brarchive**, **brrestore**
- **DB13**: Scheduler

### HANA
- **Backint** API (3rd-party 연계)
- **HANA Studio** 백업 관리
- Log Backup (continuous)
- Data Backup (full/differential/incremental)

### 전략
- **3-2-1 규칙**: 3 copies, 2 media, 1 offsite
- **RPO** (Recovery Point Objective): 얼마나 자주
- **RTO** (Recovery Time Objective): 얼마나 빠르게

---

## 13. 한국 현장 특이점

> 상세한 한국 특화 주제는 `sap-bc` 플러그인 참조.

- **망분리 환경** — 외부망 차단, Offline Note 필수
- **한글 Unicode** — CONVT_CODEPAGE 빈번
- **K-SOX** — 분기별 권한 재인증
- **한국 OSS** — SAP Korea Support 한국어 지원
- **공인인증서** — STRUST 한국 CA 등록

## 14. 자주 참조하는 SAP Note
- **2065380** — STMS Import Error Analysis
- **2070597** — Kernel Upgrade (SUM/SAPInst)
- **2256002** — PFCG Authorization Design
- **1982490** — HANA Performance Troubleshooting
- **1785535** — ST22 Dump Analysis

## 15. 관련
- `quick-guide.md`
- `/plugins/sap-bc/skills/sap-bc/SKILL.md` — 한국 현장 특화 Basis
- `/agents/sap-basis-consultant.md` — 장애 라우팅 에이전트
- `/commands/sap-transport-debug.md` — STMS 디버그
- `/commands/sap-performance-check.md` — 성능 점검
