# sap-bc 한국어 퀵가이드

> 한국 현장 BC 컨설턴트 특화. 글로벌 영문 Basis 주제는 `sap-basis` 참조.

## 🔑 환경 인테이크 (한국 현장 우선)
1. 배포 형태: On-Prem / RISE / 망분리(폐쇄망)
2. 한국 Localization: CVI KR / 전자세금계산서 / e-Document
3. DB: HANA (한국 로케일 설정 확인) / Oracle (NLS_LANG)
4. SAPGUI 언어: KO / EN / 혼용

## 🇰🇷 한국 특화 이슈 Top 10

### 1. 한글 덤프 (CONVT_CODEPAGE)
- 증상: `CONVT_CODEPAGE` ABAP dump
- 원인: Unicode 변환 실패 (레거시 non-Unicode 시스템)
- 해결: SNOTE 2452523 계열 적용, `NLS_LANG=KOREAN_KOREA.AL32UTF8`

### 2. STMS Import 에러 8 (한글 Short Text)
- 원인: 한글 오브젝트 이름이 tp 파서 오작동
- 로그: `/usr/sap/trans/log/ULOG`, `ALOG`
- 해결: tp 버전 업그레이드, Unicode tp 변환

### 3. 전자세금계산서 연동 (STRUST)
- **한국 공인인증서** 저장소 등록
- 루트 CA: 한국정보인증 / 코스콤 / NICE평가정보
- **TLS 1.2+ 필수** (KISA 가이드)
- Web Dispatcher `ssl/ciphersuites` 강화

### 4. 망분리 환경 Kernel 업그레이드
1. 외부망에서 SAP Launchpad 다운로드
2. SHA256 해시 검증
3. 정보보호팀 승인
4. USB 암호화 반입
5. 내부망 `/usr/sap/<SID>/SYS/exe/` 교체

### 5. SAPGUI 한글 깨짐
- SAPGUI 770+ 패치
- Windows "Language for non-Unicode programs" = Korean
- `NLSPATH` 확인

### 6. K-SOX 권한 재인증
- 분기별 PFCG 롤 리뷰 감사 제출
- SUIM / S_BCE_68001398 활용
- SoD 매트릭스 관리 (FI/MM)

### 7. 한국 SAPNet OSS
- **SAP OSS Korea** 접수 (한국어 가능)
- 한국 로컬라이제이션 이슈는 한국 지원팀 경유 권장
- Priority Very High (운영 중단)는 24/7 Korea 지원

### 8. HANA 한국 로케일
- `COLLATION KOREAN_CI_AS` 사용
- CDS `@Semantics.text.languageCode: ko`
- SAPGUI vs Fiori 한글 표기 차이 주의

### 9. ChaRM 한국어 Workflow
- Urgent Change → Normal Change 전환 시 내부통제 문서 필요
- 승인 경로 한국 조직도 매핑 (팀장→파트장→본부장)
- 주말/공휴일 자동 승인 우회 정책

### 10. 한국 SaaS 연동
- 이카운트/비즈플레이/더존 — 레거시 커넥터 다수
- 고객 보안 정책에 맞춘 방화벽/IP 화이트리스트
- Proxy 경유 시 SMICM로그 확인

## 📚 자주 쓰는 T-code
| T-code | 용도 |
|--------|------|
| STRUST | SSL 인증서 관리 |
| SMICM | ICM (HTTP) 모니터 |
| STMS | Transport 관리 |
| PFCG | Role 관리 |
| SUIM | 권한 정보 시스템 |
| SU53 | 권한 실패 추적 |
| SM59 | RFC Destination |
| SM21 | System Log |
| ST22 | 덤프 분석 |
| RZ20 | CCMS (모니터링) |

## ⚠️ 금지 사항
- ❌ 운영 환경 SE16N 직접 편집 (K-SOX 위반)
- ❌ STMS 강제 import (tp -i ignore)
- ❌ 공인인증서를 OS 파일로 저장 (STRUST 사용)
- ❌ Kernel 업그레이드 without 백업 + 재시작 테스트

## 📖 관련
- `../../SKILL.md` — 상세 본문
- `sap-basis` — 글로벌 Basis 주제
- `sap-s4-migration` — Kernel/Unicode 변환
