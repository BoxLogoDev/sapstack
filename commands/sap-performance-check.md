---
description: SAP 성능 점검 파이프라인. HANA·Work Process·SQL Trace·메모리 버퍼·네트워크까지 레이어별 진단. 월결산 전 사전 점검, 슬로우다운 신고 대응, 업그레이드 후 검증에 활용.
argument-hint: [대상: system|transaction|sql|hana]
---

# SAP 성능 점검 파이프라인

입력: `$ARGUMENTS` (기본값: `system` — 전체 점검)

## 🎯 목표
SAP 시스템 성능을 **레이어별로** 체계적으로 진단합니다:
1. OS/Hardware
2. Database (HANA/Oracle/DB2)
3. SAP Kernel / Work Process
4. ABAP / Application Logic
5. Network / Client

## 🔒 안전 규칙
- **ST05 SQL Trace는 짧은 세션만** (I/O 부하)
- **SE30/SAT Runtime Analysis**도 제한 시간 권장
- 운영 환경에서 장시간 trace 실행 금지 (모니터링 영향)

---

## 레이어 1 — OS / Hardware

### OS 리소스 (ST06)
- **ST06**: OS 모니터 (CPU, Memory, Disk I/O, Network)
- **RZ20 CCMS**: 알림 기준 설정
- **DB의 데이터 볼륨** 성장 추이

### Kernel 레벨
- `disp+work -v`: Kernel 패치 레벨
- `dev_w*.log`: Work Process 로그 (/usr/sap/<SID>/<INST>/work/)
- `disp+work.log`: Dispatcher 로그

### 체크 항목
- [ ] CPU 사용률 80% 이하 유지
- [ ] Memory swap 거의 없음
- [ ] Disk I/O wait < 10%
- [ ] Network latency 안정

---

## 레이어 2 — Database

### HANA (S/4HANA 필수)
- **DBACOCKPIT → HANA Administration**
- **HANA Studio** 또는 **DBA Cockpit** 사용
- 체크:
  - Column Store vs Row Store 비율
  - Delta merge 상태
  - **Expensive Statements** (HANA Studio → Performance → Expensive Statements)
  - Statistics Service 상태

### Oracle (ECC)
- **DB02** (ECC) / **DB02 / DB02_OLD**: Tablespace, Table stats
- **ST04** (ECC): Oracle performance
- **DB13**: Backup / Reorg 스케줄
- 체크:
  - Cache hit ratio > 95%
  - Wait events (top 5)
  - Table 통계 최신 여부

### Index 건강성
- **DB05** (ECC): Index analysis
- **ST10**: Table call statistics
- Full table scan 빈도

---

## 레이어 3 — SAP Kernel / Work Process

### Work Process
- **SM50**: 로컬 WP 상태
- **SM66**: 전체 서버 WP (분산 환경)
- **Running WP** 오래 멈춘 것 확인
- **Table** 컬럼 — 같은 테이블 반복 접근 시 병목 의심

### Update / Enqueue
- **SM12**: Lock entries — 좀비 락
- **SM13**: Update requests — 실패/대기
- **SM21**: System log — 경고/오류

### 메모리 버퍼
- **ST02**: 주요 버퍼 상태
  - Program buffer: hit ratio ≥ 98%
  - Table buffer: hit ratio ≥ 95%
  - Roll / Paging: extended memory 사용률
- **ST03**: Workload Analysis — response time 분포

### Job 스케줄
- **SM37**: Background job
- **SM36**: Job 정의
- 겹치는 job 부하 분산

---

## 레이어 4 — ABAP / Application

### SQL Trace (ST05)
1. **ST05 → Activate Trace**
2. 문제 트랜잭션 실행
3. **ST05 → Deactivate**
4. **Display Trace** → Long runners, Full table scan
5. **Explain Plan** — Index 사용 여부

### Runtime Analysis (SAT / SE30)
- **SAT**: SE30의 신버전
- Call hierarchy 분석
- Hot spot 식별 (top 20 methods)
- **Tools** — ABAP Test Cockpit과 연계

### 비효율 패턴 찾기
- **ATC (ABAP Test Cockpit)**: S4HANA_READINESS variant
- **Code Inspector (SCI)**: 성능 체크 variant
- **SCOV**: Code coverage

### 자주 나오는 원인
- `SELECT *` 대량 테이블 (BSEG, MSEG)
- LOOP 안의 SELECT (N+1 문제)
- **FOR ALL ENTRIES** empty check 누락
- Inefficient JOIN
- Internal table 대량 `APPEND` 후 `READ TABLE WITH KEY` 비정렬

---

## 레이어 5 — Network / Client

### SAPGUI 성능
- **ST03** → Response Time Distribution
- **SMICM**: HTTP 서비스
- **SMLG**: Logon Groups 로드 분산

### WAN 최적화
- Front-end server 지연 (한국-유럽, 한국-미국)
- Compression (SAPGUI 760+)

---

## 🎯 대상별 집중 점검

### `system` (전체)
Layer 1~5 모두

### `transaction` (특정 T-code)
1. 사용자 재현
2. ST05 Trace 짧게
3. SAT Runtime Analysis
4. ST22 덤프 체크

### `sql` (SQL 위주)
1. ST05 + Explain Plan
2. DB02 / HANA Studio expensive statements
3. DB05 index analysis
4. ATC performance variant

### `hana` (HANA 전용)
1. HANA Studio Performance tab
2. Delta merge status
3. Column vs Row store
4. Statistics service
5. Plan cache

---

## 📤 출력 형식

```
## 🔍 성능 요약
- OS:   (정상/경고/오류)
- DB:   (정상/경고/오류)
- SAP:  (정상/경고/오류)
- ABAP: (정상/경고/오류)
- Network: (정상/경고/오류)

## 🚨 핵심 이슈 (Top 3)
1. (가장 큰 병목)
2. 
3.

## 🛠 개선 제안
1. 단기 (즉시 적용)
2. 중기 (다음 배포)
3. 장기 (아키텍처)

## 📊 측정 근거
- ST03 Response Time: 
- ST02 Buffer Hit Ratio:
- ST05 Long Runners:
- ST06 CPU/Memory:

## 📖 관련 SAP Note
- (data/sap-notes.yaml 매칭)
```

## 🤖 위임
- Basis/Kernel 심층 → `sap-basis-consultant`
- ABAP 코드 리뷰 → `sap-abap-developer`
- 한국 현장 (망분리·한글) → `sap-bc`
- DB/HANA 심층 → 별도 DBA

## 참조
- `plugins/sap-basis/skills/sap-basis/SKILL.md`
- `plugins/sap-abap/skills/sap-abap/SKILL.md` — 성능 패턴
- `data/sap-notes.yaml` — Note 2161145, 2498770, 1982490
