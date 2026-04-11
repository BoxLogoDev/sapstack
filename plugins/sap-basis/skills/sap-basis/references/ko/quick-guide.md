# sap-basis 한국어 퀵가이드

> 글로벌 영문 Basis 주제. 한국 현장 특화 BC 이슈는 `sap-bc` 플러그인 참조.

## 🔑 환경 인테이크
1. SAP 릴리스 (ECC EhP / S/4HANA)
2. DB (HANA / Oracle / DB2 / MSSQL)
3. OS (Linux SLES/RHEL / Windows / AIX)

## 📚 핵심

### System Administration
- **SM50/SM66**: Work Process
- **ST22**: ABAP Runtime Error (덤프)
- **SM21**: System Log
- **SM12**: Lock Table
- **SM13**: Update Requests

### Transport Management
- **STMS**: Transport Management System
- **SE09/SE10**: Transport Organizer
- **tp** 명령 (OS 레벨)

### Performance
- **ST05**: SQL Trace
- **SAT**: Runtime Analysis
- **ST06**: OS 리소스
- **ST02**: Memory (Buffer)

### Security / Authorization
- **SU01/SU10**: 사용자 관리
- **PFCG**: Role 관리
- **SUIM**: 권한 정보 시스템
- **SU53**: 마지막 권한 실패

### Job Management
- **SM36**: Job 정의
- **SM37**: Job 모니터

### RFC / Integration
- **SM59**: RFC Destination
- **SMQR/SMQS**: qRFC Monitor
- **BD54**: Logical System

## 🇰🇷 특화 (sap-bc로 이동)
한국 현장 특화 주제 — 망분리, 한글 Unicode, 전자세금계산서 STRUST, K-SOX 권한 관리 — 는 `sap-bc` 플러그인 `SKILL.md`를 참조하세요. `sap-basis`는 글로벌 베이스라인을 제공하고, `sap-bc`는 한국 맥락을 더합니다.

## ⚠️ 금지 사항
- ❌ 운영 환경 SE16N 데이터 직접 편집
- ❌ STMS 강제 push (tp 강제 import)
- ❌ SAP Kernel 업그레이드 without 백업
- ❌ PRD client 405 (SCC4 보호 해제)

## 📖 관련 플러그인
- `sap-bc` — 한국 BC 컨설턴트 관점 심화
- `sap-s4-migration` — Kernel/DB 업그레이드 계획
- `sap-abap` — ABAP 덤프 심층 분석
