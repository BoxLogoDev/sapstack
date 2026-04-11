# SAP BC 한국어 전문 가이드 (한국 BC 컨설턴트 특화)

> `plugins/sap-bc/skills/sap-bc/SKILL.md`의 한국어 병렬 버전.
>
> **BC = Basis 한국 버전**입니다. 글로벌 Basis 주제는 `sap-basis` 플러그인, 이 파일은 **한국 현장 특화**를 다룹니다.

## 1. 환경 인테이크

한국 BC 이슈 보고 시 아래를 반드시 수집:

1. **SAP 릴리스** (ECC EhP / S/4HANA 연도)
2. **배포 형태**:
   - On-Premise (100% 사내)
   - RISE with SAP (Private Cloud)
   - **망분리** (폐쇄망, 금융·공공)
3. **DB**: HANA (한국 로케일 확인) / Oracle (NLS_LANG)
4. **SAPGUI 언어**: KO / EN / 혼용
5. **한국 Localization**:
   - CVI KR 활성화 여부
   - 전자세금계산서 연동 (Provider?)
   - 원천세 사용
6. **K-SOX 대상** (상장사 여부)
7. **Solman 연동**: 7.1/7.2, ChaRM

---

## 2. 한국 특화 이슈 Top 15

### 2-1. 한글 덤프 (CONVT_CODEPAGE)
- **증상**: `CONVT_CODEPAGE` ABAP dump
- **원인**: Unicode 변환 실패, non-Unicode 잔재
- **해결**:
  - SAP Note 2452523 계열 적용
  - `NLS_LANG=KOREAN_KOREA.AL32UTF8` (Oracle)
  - Kernel + SAPGUI 최신화
  - 문제 Z-프로그램의 `SE38 → Program Attributes → Unicode` 체크

### 2-2. STMS Import 에러 8 — 한글 Short Text
- **원인**: 한글 오브젝트 이름이 tp 파서 오작동
- **로그**: `/usr/sap/trans/log/ULOG`, `ALOG`
- **해결**:
  - tp 버전 업그레이드 (kernel과 매칭)
  - Unicode tp 사용
  - `NLS_LANG` 환경변수 설정

### 2-3. 전자세금계산서 연동 (STRUST)
- 한국 공인인증서 저장소 관리
- 루트 CA:
  - **한국정보인증 (KICA)**
  - **코스콤 (KOSCOM)**
  - **NICE평가정보**
- **TLS 1.2+** 필수 (KISA 가이드)
- Web Dispatcher `ssl/ciphersuites` 강화
- 매년 인증서 갱신 필수

### 2-4. 망분리 환경 Kernel 업그레이드
절차:
1. 외부망 PC에서 SAP Launchpad 접속
2. Note + Kernel 다운로드
3. **SHA256 해시 검증**
4. 정보보호팀 승인 (Ticket)
5. **USB 암호화** 반입
6. 내부망 서버 `/usr/sap/<SID>/SYS/exe/` 교체
7. `sapcontrol StopStart`

### 2-5. SAPGUI 한글 깨짐
- **증상**: Transaction 화면 한글 "??" 또는 `·`
- **원인**:
  - SAPGUI 패치 레벨 760 이하
  - Windows "Language for non-Unicode programs" 미설정
  - `NLSPATH` 설정 누락
- **해결**:
  - SAPGUI **770+** 업그레이드
  - Windows OS "Language for non-Unicode programs" = **Korean**
  - SAPGUI i18n font 설정
  - Server-side: `i18n/use_active_cp = 1`

### 2-6. K-SOX 권한 재인증
- **분기별** PFCG 롤 리뷰 (감사 제출)
- **SUIM** 활용 Report
- **S_BCE_68001398** — 권한 추적
- SoD 매트릭스 관리 (FI/MM 주요)
- 분기별 SoD 위반 리포트

### 2-7. 한국 SAPNet OSS
- **SAP OSS Korea 접수** — 한국어 가능
- 한국 Localization 이슈는 **한국 지원팀 경유** 권장
- Priority Very High (운영 중단): **24/7 Korea 지원**
- 한국 파트너 네트워크 (SAP Korea Partner)

### 2-8. ChaRM 한국어 Workflow
- **Urgent → Normal Change 전환** 시 내부통제 문서 필요
- 승인 경로: 팀장 → 파트장 → 본부장 → CEO
- 주말·공휴일 자동 승인 우회 정책
- K-SOX 감사 대상 문서

### 2-9. HANA 한국 로케일
- **Collation**: `KOREAN_CI_AS` 지정
- Default `BINARY`는 한글 정렬 깨짐
- CDS View: `@Semantics.text.languageCode: 'ko'`
- Table text field: `LANGU` 필드 사용

### 2-10. Code Page
- 한국은 Unicode (UTF-8/UTF-16) 표준
- 비-Unicode ECC는 2020년 이후 거의 소멸
- **SUMCT (Unicode Conversion Tool)** — 레거시 변환
- ECC → S/4 마이그레이션 시 Unicode 선행 필수

### 2-11. 한국 SaaS 연동
- **이카운트 ERP** (중소기업)
- **비즈플레이** (전자세금계산서)
- **더존 Smart A/iCUBE** (ERP/그룹웨어)
- **SmartBill** (전자세금계산서)
- 대부분 **커스텀 RFC 또는 REST** 연동

### 2-12. 한국 은행 연동
- **펌뱅킹 API**: 국민/신한/우리/하나/농협
- **MT940 표준 안 씀** → 은행별 **자체 XML/EDI**
- **KFTC (금융결제원)** 표준 EDI 일부 사용
- DMEE Tree가 은행별로 다름
- 자동이체 (CMS), 가상계좌 발급 커스텀 다수

### 2-13. 4대보험 EDI
- **국민연금공단**
- **국민건강보험공단**
- **근로복지공단** (고용·산재)
- **연말정산 간소화** (국세청)
- 표준 EDI 형식, 한국 지정 프로토콜

### 2-14. KISA 보안 가이드
- **TLS 1.2 이상** 필수
- **암호화**: AES-256
- **로그 보관**: 정보통신망법 3년 이상
- **개인정보 마스킹**: 주민번호 등
- 정기 모의해킹

### 2-15. 금융권 추가 규제
- **전자금융거래법** 준수
- **금융보안원** 가이드
- **이중화·장애대응** 요구
- **외부위탁** 보고 의무

---

## 3. 자주 쓰는 T-code

| T-code | 용도 |
|--------|------|
| **STRUST** | SSL 인증서 관리 (한국 공인인증서) |
| **SMICM** | ICM (HTTP) 모니터 |
| **STMS** | Transport 관리 |
| **PFCG** | Role 관리 (K-SOX) |
| **SUIM** | User Information System |
| **SU53** | 권한 실패 추적 |
| **SM59** | RFC Destination |
| **SM21** | System Log (한국 시간대 확인) |
| **ST22** | 덤프 분석 (한글 덤프 빈번) |
| **RZ20** | CCMS (모니터링) |
| **SE16** | 테이블 조회 (K-SOX: 편집 금지) |
| **SCC4** | Client 설정 |
| **SNOTE** | Note 적용 (망분리: offline) |

---

## 4. 한국 현장 운영 체크리스트

### 월간
- [ ] STMS Queue 정리
- [ ] Transport 승인 문서화
- [ ] Backup 검증
- [ ] Patch Note 리뷰
- [ ] Performance 리포트

### 분기별
- [ ] **PFCG 롤 재인증** (K-SOX)
- [ ] SoD 위반 점검
- [ ] 공인인증서 만료 체크
- [ ] 재해복구 훈련
- [ ] Audit Trail 리포트

### 연간
- [ ] **K-SOX 평가**
- [ ] **외부 감사 대응**
- [ ] Kernel Upgrade 계획
- [ ] 용량 계획 (Capacity)
- [ ] 재해복구 훈련 (전면)

---

## 5. 표준 응답 형식

```
## Issue
## Root Cause
## Check (T-code + Table.Field)
## Fix (한국 현장 제약 고려)
## Prevention
## SAP Note (data/sap-notes.yaml 확인)
```

---

## 6. 글로벌 sap-basis와의 관계

**BC = Basis 한국 버전**임을 다시 강조:

| 차원 | `sap-basis` | `sap-bc` |
|------|------------|----------|
| 기능 영역 | Basis 공통 | **동일** |
| 언어 | 영문 | 한국어 + 영문 키워드 |
| 추가 주제 | - | **한국 특화 15개 + Korean OSS** |

**두 플러그인은 보완재** — 한국 프로젝트는 **둘 다 설치** 권장.

---

## 7. 자주 참조하는 SAP Note

- **1814087** — Korean Unicode SAPGUI 한글 깨짐
- **2452523** — Unicode Conversion Code Page Issues
- **1728283** — NLS_LANG Oracle
- **2065380** — STMS Import Error Analysis
- **2844534** — Korea eTax Invoice (DRC)
- **2645815** — Korea Withholding Tax
- **2567451** — Korea Business Place Configuration
- **2783093** — Korea Year-End Payroll Adjustment
- **1794432** — Clean Core Authorization
- **2256002** — PFCG Role Design

## 8. 관련

- `quick-guide.md` — 퀵가이드
- `/plugins/sap-basis/skills/sap-basis/SKILL.md` — 글로벌 Basis 베이스라인
- `/agents/sap-basis-troubleshooter.md` — 장애 라우팅
- `/commands/sap-transport-debug.md` — STMS 디버그
- `/commands/sap-korean-tax-invoice-debug.md` — 전자세금계산서
- `/commands/sap-performance-check.md` — 성능 점검
