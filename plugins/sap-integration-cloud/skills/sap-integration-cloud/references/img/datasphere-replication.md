# SAP Datasphere Replication 구성 가이드

## SPRO 경로

Datasphere 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
Datasphere → Space Management → Connections
Datasphere → Data Builder → Replication Flow / Transformation Flow
소스 S/4: LTRC (SLT 구성) · LTRS (고급 설정) · ODQMON (delta queue)
         · RSO2/RSA5/RSA6 (DataSource) · RSA1 (BW)
```

## 필수 선행 구성

- [ ] Datasphere 테넌트 + Space 생성
- [ ] 소스 연결 방식 결정 (SLT / ODP CDS / Replication Flow / SDI)
- [ ] Cloud Connector / DP Agent (온프레미스 소스)
- [ ] 소스 S/4 연동 T-code 활성 (LTRC/ODQMON — B3 등록분)

## 구성 단계 (Configuration Steps)

### 1. Space & Connection
1. Space Management → New Space (할당량/멤버)
2. Connections → 소스 시스템 추가 (S/4 / BW / ABAP / SLT)
3. 인증·검증 (Validate)

### 2. 소스 추출 준비 (S/4 측)
1. ODP/CDS: RSO2/RSA5/RSA6로 DataSource 노출, ODQMON로 delta queue 확인
2. SLT 경유: LTRC에서 replication configuration, LTRS 고급 튜닝
3. 권한·delta 메커니즘 점검

### 3. Replication / Transformation Flow
1. Data Builder → Replication Flow → 소스 객체 선택
2. Load type: Initial + Delta
3. Transformation Flow (필요 시 정제·조인)
4. 타깃 (local table / Analytic Model)

### 4. 스케줄 & 모니터
1. Flow 스케줄 (소스 배치와 비충돌 윈도)
2. Datasphere Monitor + 소스 ODQMON 병행 추적

## 구성 검증 (Verification)

- [ ] Connection Validate 성공
- [ ] Initial load 행 수 = 소스 행 수 (sample 검증)
- [ ] Delta가 소스 변경을 지정 SLA 내 반영
- [ ] ODQMON delta queue 적체 없음
- [ ] Transformation 결과 정합 (조인/필터 정확)

## 한국 현장 체크

- 한국 데이터 레지던시 요건 → 소스 컬럼 마스킹/제외 정책
- 월마감 배치 시간대와 replication 스케줄 비충돌
- 개인정보(주민번호 등) 컬럼 복제 제외

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| 복제 실패/지연 | LTRC job / ODQMON 적체 / 소스 구조 변경 |
| 행 수 불일치 | filter / delta 메커니즘 / initial load 재실행 |
