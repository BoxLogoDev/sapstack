---
name: sap-bc
description: >
  This skill handles SAP BC (Basis Component) tasks from the Korean consulting
  field perspective. Use when the user mentions BC, 베이시스, Solution Manager Korea,
  HANA locale, 한국 세금계산서, e-Document, 망분리, KISA, 공인인증서, 전자서명,
  한국 특수 STMS, PFCG 한국 권한, SM50/SM66 한국어 환경, 한국어 SAPGUI, Unicode
  변환, 한국 고객지원 OSS, 한국 SAP BTP 리전, local 코드 페이지, NLS 설정, SAP
  한국법인 SAPNet. Covers classic Basis topics (STMS, PFCG, SM50, ST22, SM21, SM36,
  performance, authorization, transports) with Korean enterprise specifics layered
  on top — Solman 연동, HANA 한국 로케일, KT/LG/SK CDN 연동, 망분리·폐쇄망 배포,
  한국 전자세금계산서 규제, 개인정보보호법 준수, 한국 SAP 계정 SAP OSS 사용법.
allowed-tools: Read, Grep
---

# SAP BC — 한국 BC 컨설턴트 가이드

> **대상 독자**: 한국 SI 현장의 SAP BC(Basis) 컨설턴트, 운영 DBA, 인프라 엔지니어
>
> **글로벌 Basis 주제**는 `sap-basis` 플러그인을 사용하세요. 이 플러그인은 **한국 현장
> 특화 이슈**(망분리, 전자세금계산서, 공인인증, KISA 보안, 한국어 환경)에 집중합니다.

---

## 1. 환경 인테이크 체크리스트

BC 이슈 보고 시 답변 전 아래 항목을 반드시 수집하세요.

| # | 항목 | 질문 예시 |
|---|------|----------|
| 1 | **SAP 릴리스** | ECC 6.0 EhP? / S/4HANA 릴리스 (1909/2020/2021/2022/2023)? |
| 2 | **배포 모델** | On-Premise / RISE / Public Cloud / Private Cloud |
| 3 | **DB 종류** | HANA / Oracle / DB2 / MSSQL (S/4는 HANA 전용) |
| 4 | **OS** | Linux (SLES/RHEL) / Windows / AIX |
| 5 | **SAPGUI 언어 설정** | KO / EN / DE (한글 깨짐 이슈 시 필수) |
| 6 | **네트워크 환경** | 인터넷 연결 가능 / 망분리(폐쇄망) / DMZ 경유 |
| 7 | **Solman 버전** | 7.1 / 7.2 / ChaRM 활성화 여부 |
| 8 | **한국 규제 관련** | 전자세금계산서 / e-Document / 개인정보 마스킹 적용 여부 |

---

## 2. 시스템 관리 (System Administration)

### 프로세스 모니터링 — SM50/SM66

**증상: DIA 프로세스 Long Running**
- SM50 → Process Type = DIA → Status = Running → Time 확인
- 장시간 걸리는 트랜잭션은 ST05 SQL Trace로 원인 파악
- 한국 현장 특이점: **KRW 환율 변환이 잦은 FI 트랜잭션**은 TCURR 테이블 캐시 미스로 느려짐 → HANA에서는 Column Store 캐싱 확인

**Work Process Dump 분석 (ST22)**
- 한국어 환경에서 자주 발생하는 덤프:
  - `CONVT_CODEPAGE` — 한국어 Unicode 변환 오류 (SNOTE 2452523 계열)
  - `MESSAGE_TYPE_X` with 한글 메시지 — 한국어 메시지 클래스 번역 누락
  - `DBIF_RSQL_SQL_ERROR` + HANA Korean collation 이슈

### 백업/복구 (한국 현장 특화)
- BR*Tools (Oracle)는 한국 대형 금융·제조 현장에 여전히 광범위
- HANA는 Backint 연동 (Commvault·Veeam·IBM Spectrum Protect 국내 리셀러 경유)
- **망분리 환경**: 백업 테이프 반출입 신청 프로세스, 백업 파일 암호화 (KISA 암호모듈 인증)

---

## 3. Transport 관리 (STMS)

### 한국 SI 프로젝트 표준 Landscape
```
DEV (100) → QAS (200) → STG (300) → PRD (400)
```
- DEV: 개발
- QAS: 단위/통합 테스트
- STG: 실사용자 UAT (한국 대기업 표준)
- PRD: 운영

### Transport Release 이슈
**증상: STMS에서 Import가 에러 8로 멈춤**
- tp 로그(`ALOG`, `ULOG`, `IMPORT_LOG`) 확인 — `/usr/sap/trans/log/`
- 한국 현장 원인:
  - **한글 오브젝트 이름**이 tp 파서에서 ambiguous (2000년대 초반 프로젝트 유산)
  - SPDD/SPAU 한글 짧은 텍스트(Short Text) 변환 실패
  - NLS_LANG 환경변수 미설정 (Oracle 기반)

### ChaRM (Solman)
- 한국 대기업(삼성·LG·SK·현대)은 대부분 ChaRM 표준
- 한국어 Workflow 승인 루틴 커스터마이징 사례 많음
- 운영 Normal Change → Urgent Change 전환 시 **Regulatory Change Document** 요구 (한국 상장사 내부통제 K-SOX)

---

## 4. PFCG 권한 관리 — 한국 특화

### 한국 상장사 내부통제 (K-SOX) 요구사항
- **SoD (Segregation of Duties)**: FI 분개 입력자 ≠ 승인자, 마스터 생성 ≠ 승인
- **권한 Recertification**: 분기별 PFCG 롤 재인증 (감사팀 제출)
- 관련 T-code: SUIM (사용자 정보), S_BCE_68001398 (권한 추적)

### 자주 쓰는 권한 객체
| 객체 | 설명 | 한국 특이점 |
|------|------|------------|
| S_TCODE | T-code 실행 권한 | MIRO·F110은 승인자만 |
| F_BKPF_BUK | 회사코드별 FI 문서 | 한국 법인은 BUKRS=KR01 등 분리 |
| P_ORGIN | HR 인포타입 | 주민번호 마스킹 필수 |
| S_TABU_DIS | 테이블 조회 | SE16N 운영 금지(표준) |

### SU53 분석 요청 시
- 사용자에게 "권한 실패 직후 즉시 /nSU53" 안내
- 캡처 이미지 요청 — 한글 권한 객체 이름은 스크린샷이 가장 정확

---

## 5. 한국 전자세금계산서 / e-Document 연동

### 배경
- 한국은 2011년부터 법인 전자세금계산서 의무화 (부가가치세법)
- SAP 운영 현장에서는 **SAP DRC (Document and Reporting Compliance)** 또는 **국내 이카운트·비즈플레이·SmartBill** 연동

### BC 관점 이슈
- 인증서 저장소: STRUST에 한국 공인인증서 등록 (한국정보인증/코스콤/NICE평가정보 루트 CA)
- **TLS 1.2 이상** 필수 (KISA 가이드) — SAP Web Dispatcher `ssl/ciphersuites` 조정
- XML 전자서명 오류 → SMICM 로그 + SSF00 파라미터 확인

**SAP Note 참조 키워드**
- Korea e-Tax Invoice, KR Tax Invoice, Country Version Korea (CVI KR)
- 대표 Note: **3092819** (S/4HANA Korea localization roadmap)

---

## 6. 망분리 / 폐쇄망 환경

### 한국 금융·공공 현장의 제약
- **SAP Marketplace/Support Portal 접근 불가** → Offline Note 다운로드 필요
- SNOTE(Tcode)에서 Online Download 실패 시 수동 .TXT 업로드
- SUM/SWPM 미디어를 USB·내부 파일서버 경유 반입

### Kernel 업그레이드 절차 (망분리)
1. 외부망 PC에서 SAP Launchpad → Kernel Download
2. 해시 검증 (SHA256)
3. 보안 승인 (정보보호팀)
4. 내부망 반입 (USB 암호화)
5. `/usr/sap/<SID>/SYS/exe/` 교체 → `sapcontrol StopStart`

---

## 7. HANA DB 한국 로케일 이슈

### 한글 정렬(Collation)
- HANA 기본 collation은 `BINARY` → 한글 정렬 시 유니코드 바이트 순서로 깨짐
- 해결: `COLLATION KOREAN_CI_AS` 지정 또는 CDS View에 `@ObjectModel.text.element` 조합

### Code Page
- 한국 고객사는 Unicode(UTF-8/UTF-16) 표준 (비-Unicode ECC는 2020년 이후 거의 소멸)
- 레거시 ECC → S/4 마이그레이션 시 **Unicode Conversion (SUMCT)** 사전 필수

### SAPGUI 한글 깨짐
- **증상**: Transaction 화면 한글이 "??" 또는 `·`
- 원인:
  - SAPGUI 패치 레벨(760 이하) + 최신 Kernel 불일치
  - `i18n` 폰트 설정 누락
  - Windows OS 지역 설정 (`Korean (Korea)`) 미적용
- 해결: SAPGUI 770 이상, `NLSPATH` 확인, Windows OS "Language for non-Unicode programs" = Korean

---

## 8. 자주 쓰는 T-code Quick Reference

| T-code | 용도 |
|--------|------|
| SM50 | Work Process 모니터 |
| SM66 | Global Work Process 모니터 |
| ST22 | ABAP Runtime Error (덤프) |
| SM21 | System Log |
| SM36/SM37 | Job 스케줄/모니터 |
| STMS | Transport Management System |
| SCC4 | Client 설정 |
| STRUST | SSL 인증서 |
| STMS_IMPORT | Transport Import Queue |
| SU01/SU10 | User 생성/대량 관리 |
| PFCG | Role 관리 |
| SUIM | 권한 정보 시스템 |
| ST05 | SQL Trace |
| ST06 | OS 리소스 모니터 |
| SMICM | ICM (HTTP) 모니터 |
| SMGW | Gateway 모니터 |
| SM59 | RFC Destination |
| BD54 | Logical System |
| SWPM | Software Provisioning Manager |
| SUM | Software Update Manager (업그레이드) |

---

## 9. 표준 응답 형식

BC 이슈 답변은 반드시 다음 구조를 따릅니다 (루트 원칙 — 글로벌 sap-basis와 동일):

**Issue → Root Cause → Check (T-code + Table/Field) → Fix (Steps) → Prevention → SAP Note**

예시:
- **Issue**: STMS Import가 에러 8로 중단
- **Root Cause**: 한글 Short Text 변환 실패 (코드페이지 불일치)
- **Check**: `/usr/sap/trans/log/ULOG`, tp 버전, DEFAULT_PROFILE의 `rdisp/langs`
- **Fix**: Unicode tp 버전 업그레이드, `sapcpe` 재실행, `NLS_LANG=KOREAN_KOREA.AL32UTF8` 설정
- **Prevention**: 개발 단계부터 Unicode 표준 준수, SPDD/SPAU 자동화
- **SAP Note**: 2452523, 1728283

---

## 10. 관련 참고 자료

- `references/ko/quick-guide.md` — 이 모듈 한국어 퀵가이드
- `sap-basis` 플러그인 — 글로벌 영문 Basis 주제 (본 플러그인과 상호 보완)
- `sap-abap` 플러그인 — ABAP 성능·덤프 분석 (BC가 같이 다루는 영역)
- `sap-s4-migration` 플러그인 — Unicode 변환, Kernel 업그레이드, Simplification
