---
description: STMS Transport 실패 체계적 진단. tp 로그 분석, Return Code 해석, 한국 현장 한글 Short Text 이슈, Cross-client 의존성 추적.
argument-hint: [Transport Request ID (예 DEVK900123)]
---

# STMS Transport 디버그 파이프라인

입력: `$ARGUMENTS`

## 🎯 목표
Transport Request(TR) import 실패 시 체계적으로 원인을 추적하고 수정합니다. 한국 현장에서 흔한 한글 Short Text 이슈부터 cross-client 의존성까지 커버합니다.

## 🔒 안전 규칙
- 운영 환경(PRD)으로 강제 push 금지
- tp force 옵션은 최후의 수단
- 의존 객체 미포함 시 추가 TR 생성 권장

---

## Step 1. TR 상태 확인

1. **STMS → Import Queue → 대상 시스템 선택**
2. 대상 TR 찾기 → 상태 확인:
   - 대기 (queued)
   - 진행 중 (in progress)
   - 실패 (error)
3. **SE09/SE10**: Transport Organizer에서 TR 상세
4. Return Code (RC):
   - 0~4: OK/Warning (무시 가능)
   - 6: Warning (검토 권장)
   - 8: Error (원인 분석 필수)
   - 12: Critical (시스템 점검)
   - 16+: Severe (수동 개입)

---

## Step 2. tp 로그 분석

위치: `/usr/sap/trans/log/`

| 파일 | 내용 |
|------|------|
| `ALOG<YY>.<SID>` | 전체 액션 로그 |
| `ULOG<YY>.<SID>` | 사용자 작업 |
| `SLOG<YY>.<SID>` | Short log (헤더) |
| `<STEP>_<TR>.log` | Step별 상세 |

### 주요 Step 로그
- `DICT_<TR>.log`: DDIC Dictionary 활성화
- `DIEX_<TR>.log`: Data Dictionary Export
- `GEN_<TR>.log`: 프로그램 생성
- `DARG_<TR>.log`: Distribute ABAP Runtime Globals

### 명령어 (OS 레벨, BC 권한 필요)
```bash
cd /usr/sap/trans/log
ls -lt | head   # 최신 로그
grep -i error <logfile>
```

---

## Step 3. Import 에러 유형별 진단

### Error Type A: DDIC 활성화 실패
- Dictionary 객체 (Table/Structure/Data Element) 의존성 문제
- **SE11**: 해당 객체 활성화 시도
- 의존 객체가 다른 TR에 있으면 순서 조정

### Error Type B: Program Generation 실패
- ABAP 소스 오류
- **SE80**: 객체 열어서 구문 확인
- **SLIN**: Extended program check

### Error Type C: 한글 Short Text 변환 실패 (**한국 현장 빈번**)
- **증상**: `CONVERSION_ERROR` 또는 `CODEPAGE_CONVERT`
- 원인:
  - Non-Unicode → Unicode 전환 미완료
  - tp 버전 mismatch
  - `NLS_LANG` 미설정 (Oracle)
- **해결**:
  - SAP Note **2452523** 확인
  - tp kernel upgrade
  - `NLS_LANG=KOREAN_KOREA.AL32UTF8` 설정

### Error Type D: Cross-client 의존성
- 100번 client에서 개발 → 200번 client에 import 시 실패
- Customizing TR이 Workbench TR과 분리
- **SCC1**: Client-specific copy

### Error Type E: Object Lock (다른 TR 소유)
- 같은 객체가 다른 TR에 잠김
- **SE03** → Object Directory Entry
- Owner TR release 후 재import

---

## Step 4. 복구 옵션

### 4-1. Re-import (동일 TR)
- **STMS → Queue → Request 선택 → Import Again**
- 오류가 해소되었을 경우

### 4-2. Next Level Import (수정 TR 추가)
- 수정한 새 TR 생성
- Queue 뒤에 추가 → 순차 import

### 4-3. Import with Unconditional Modes
- **경고**: 프로덕션 권장하지 않음
- **U1**: Skip version check
- **U2**: Skip object check  
- **U6**: Skip preceding import
- 일반 import로 해결이 안 될 때 **BC 본부장 승인 후**

### 4-4. Rollback
- 일부만 import 된 상태 → 이전 TR 재import로 overwrite
- 또는 수동 개별 객체 재생성

---

## Step 5. 한국 현장 체크리스트

- [ ] Unicode 변환 완료됐나? (ECC → S/4 마이그레이션 중이면 특히)
- [ ] NLS_LANG 설정? (Oracle 기반)
- [ ] Transport sequence 지켜졌나? (Dev → QAS → PRD)
- [ ] ChaRM (Solman) 프로세스 우회 금지 (대기업 표준)
- [ ] K-SOX: 운영 transport 승인 문서화
- [ ] 한글 Short Text tp version ≥ 적정 patch level

---

## Step 6. 재발 방지

1. **CTS (Change and Transport System) 표준화**
2. Pre-transport lint: SLIN, ATC
3. DEV → QAS test 환경 강제
4. **SAP Solution Manager ChaRM** 워크플로 활용
5. Weekly tp version audit

---

## 📤 출력 형식

```
## 🔍 TR 진단
- TR ID: 
- Target: (DEV/QAS/PRD)
- Return Code: 
- 발생 시간:

## 🧠 Root Cause
1. (가장 가능성 높은 원인)
2. ...

## 🛠 Fix
1. (단계별 수정)

## 🛡 재발 방지
- (프로세스 개선)

## 📖 관련 SAP Note
- (data/sap-notes.yaml 매칭 시)
```

## 🤖 위임
- Kernel/OS 레벨 → `sap-basis-troubleshooter`
- 한국 Unicode 이슈 → `sap-bc` 플러그인
- ABAP 구문 오류 → `sap-abap-reviewer`

## 참조
- `plugins/sap-basis/skills/sap-basis/SKILL.md`
- `plugins/sap-bc/skills/sap-bc/SKILL.md` — 한국 특화
- `data/sap-notes.yaml` — 2452523, 2065380 등
