# 시나리오 5 — 한글 Unicode 변환 덤프 (CONVT_CODEPAGE)

## 🎬 상황
레거시 ECC 6.0 (non-Unicode) → S/4HANA 2023 변환 프로젝트. 한글 Short Text가 포함된 Custom Z-프로그램에서 `CONVT_CODEPAGE` 덤프 빈번. 망분리 환경, 한국 금융권.

## 💬 사용자 질문
```
SUM 마이그레이션 후 일부 Z-프로그램에서 한글 덤프가 납니다.
CONVT_CODEPAGE 에러인데, 망분리 환경이라 SAP Support Portal 접근이 어렵습니다.
```

## 🤖 추천 위임
**sap-bc 플러그인**이 자동 활성화 (키워드: 한글, 망분리, 덤프)
또는 `sap-basis-troubleshooter` 에이전트 덤프 플로우.

### 한국 특화 진단

```markdown
## 🔍 Issue
Non-Unicode → Unicode 변환 후 한글 Short Text 처리 코드에서 CONVT_CODEPAGE

## 🧠 Root Cause
1. **Z-프로그램의 string/C 타입 혼용** — Unicode 환경에서 불일치
2. **OPEN DATASET IN LEGACY TEXT MODE 누락** — 파일 I/O 시
3. **Character vs Byte length 가정** — 한글 2바이트 가정 코드
4. **SAPGUI 클라이언트 코드페이지** vs 서버 불일치

## ✅ Check
1. **ST22** → 덤프 선택 → Source line + Active callstack
2. **SE80** → 문제 Z-프로그램 → Unicode checkbox 확인 (Program Attributes)
3. **SCP** → Code page 설정 (4110 for EN Unicode)
4. `disp+work -v` → Kernel Unicode 상태
5. OS: `echo $NLS_LANG` (Oracle 기반인 경우)

## 🛠 Fix — 한국 망분리 환경

### Offline Note 확보 (망분리 핵심)
1. **외부망 PC**에서 SAP Launchpad 접속
2. Note **2452523** (CONVT_CODEPAGE 관련) 다운로드
3. Note **1728283** (NLS_LANG for Oracle)
4. SHA256 해시 검증
5. USB 암호화 반입 → 내부 **SNOTE**에 수동 업로드

### Code Fix 패턴
```abap
" 나쁜 예 (non-Unicode 가정)
DATA: lv_text(80) TYPE C.    " 80 bytes
READ DATASET file INTO lv_text.

" 좋은 예 (Unicode 호환)
DATA: lv_text TYPE STRING.
OPEN DATASET file FOR INPUT IN TEXT MODE ENCODING UTF-8.
READ DATASET file INTO lv_text.
```

### 시스템 레벨 설정
1. **RZ10** → DEFAULT profile → 다음 파라미터:
   ```
   zcsa/installed_languages = KE    (Korean + English)
   zcsa/system_language = E
   i18n/use_active_cp = 1
   ```
2. 재시작 (망분리 승인 필수)

### SAPGUI 클라이언트
- SAPGUI 770+ 필수
- Windows OS "Language for non-Unicode programs" = Korean
- Fonts: i18n font 설정

## 🛡 Prevention

### 개발 단계
1. 모든 Z-프로그램은 **Unicode checkbox 활성화** 강제
2. ATC (ABAP Test Cockpit)에 Unicode check 포함
3. Code review 시 `C` type + 고정 길이 패턴 금지

### 마이그레이션 프로세스
1. **사전 SUMCT (Unicode Conversion Tool)** 선행 실행
2. **SPDD/SPAU** Unicode correction
3. DEV → QAS 단계별 검증 (운영 직전 발견 금지)

### 망분리 운영 체크리스트
- [ ] Offline Note 라이브러리 내부 유지 (월간 업데이트)
- [ ] Kernel 업그레이드 SOP 문서화
- [ ] 한글 로케일 파라미터 기준 문서
- [ ] KISA 가이드 준수 확인

## 📖 SAP Note (data/sap-notes.yaml)
- **2452523** — Unicode Conversion Code Page Issues
- **1728283** — NLS_LANG Oracle
- **1814087** — Korean Unicode SAPGUI 한글 깨짐
- **1785535** — ST22 Dump Analysis
```

## 📚 배운 것
- **sap-bc 플러그인의 가치**: 글로벌 영문 sap-basis에 없는 **한국 특화 망분리·한글·Offline Note 프로세스**
- **ABAP 코드와 Basis 설정 동시 고려** — 한 레이어 수정만으론 부족
- **망분리는 기술이 아닌 프로세스** — SAP Note offline 워크플로 중요
- **Kernel 파라미터 변경은 승인 경로 필수** (대기업 표준)

## 🔗 관련
- `plugins/sap-bc/skills/sap-bc/SKILL.md` — 한국 현장 전체
- `/agents/sap-basis-troubleshooter.md` — 덤프 분석
- `/agents/sap-abap-reviewer.md` — Unicode 코드 패턴 검토
- `/commands/sap-transport-debug.md` — 한글 Short Text 이슈
