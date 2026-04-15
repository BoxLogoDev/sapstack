# SAP Exception Class Catalog (sapstack Operations)

## 목적

SAP는 강력한 예외 클래스 체계(Exception Class Hierarchy)를 통해 비정상 상황을 구조화합니다. **sapstack**은 운영/진단 관점에서 자주 발생하는 예외들을 카탈로그화하여, Evidence Loop에서 빠르게 근본 원인(RCA, Root Cause Analysis)을 식별할 수 있도록 지원합니다.

본 카탈로그는:
- **ABAP 개발**이 아니라 **ERP 운영/시스템 진단**을 대상으로 합니다
- 실제 SAP 제조기업 환경(MES/QMS/PMS/ERP 연동)에서 빈번하게 발생하는 예외만 수집합니다
- 각 예외별 **발생 조건 → 진단 방법 → 해결 절차**를 명확히 합니다

---

## SAP 예외 분류 체계 (CX_* Hierarchy)

SAP은 모든 예외를 `CX_ROOT`를 최상위 부모로 하는 계층 구조로 관리합니다:

```
CX_ROOT
├─ CX_DYNAMIC_CHECK (검사 예외, catch 필수)
│  ├─ CX_SY_DYN_CALL_ILLEGAL_TYPE
│  ├─ CX_SY_NO_HANDLER
│  ├─ CX_SY_OPEN_SQL_DB
│  ├─ CX_SY_CONVERSION_NO_NUMBER
│  └─ [업무 영역별] CX_FI_*, CX_MM_*, CX_SD_*, CX_PP_*
│
├─ CX_STATIC_CHECK (정적 예외, 컴파일 타임 명시)
│  └─ CX_SY_INTERFACE_MISMATCH
│
└─ CX_NO_CHECK (선택적 catch, 예:할당 실패)
   ├─ CX_SY_NO_MEMORY
   └─ CX_SY_ASSIGN_TYPE_CONFLICT
```

### sapstack에서의 분류

본 카탈로그는 운영 관점으로 재분류:

| 카테고리 | 예시 | 특징 |
|---------|------|------|
| **Financial (재무)** | CX_FAGL_*, CX_FI_* | 전표 입력, 기간마감, 수정/삭제 차단 |
| **Logistics (물류)** | CX_MD_*, CX_BUPA_* | GR/GI 처리, 수불 불일치 |
| **Manufacturing (생산)** | CX_PP_*, CX_SCWM_* | 생산 오더, WM 처리 |
| **ABAP Runtime (시스템)** | CX_SY_* | 메모리, 타입 변환, SQL, RFC 에러 |
| **Integration (통합)** | CX_AI_*, CX_RFCSDK_* | RFC/IDoc/OData 호출 실패 |
| **Security (보안)** | CX_SY_ASSIGN_*, 권한 객체 | K-SOX, 직무 분리 위반 |

---

## sapstack Evidence Loop에서의 활용

### 1. Exception 수집 (Evidence Phase)
```
User Error Report
    ↓
sapstack가 에러 스크린샷/로그에서 CX_* 클래스명 추출
    ↓
본 카탈로그에서 매칭
    ↓
진단 T-code, 테이블, 흔한 원인 제시
```

### 2. Intelligent Diagnosis
예를 들어 사용자가 "FB01에서 전표 입력 안 됨" 보고 시:

1. **자동 인식**: 화면 캡처에서 "CX_FAGL_NUMBERRANGE_DEFINITION" 감지
2. **카탈로그 조회**: exceptions/financial.md에서 해당 예외 정보 로드
3. **진단 제시**: 
   - T-code: FBN1 (전표 번호범위 정의)
   - 테이블: NRIV, T000
   - 근본 원인: "회계연도별 번호범위 미정의"
4. **자가 진단 가이드**: SAP 운영자가 FBN1에서 직접 확인 → 자가 해결

### 3. Knowledge Base 연계
- 각 예외마다 관련 SAP Note 번호 첨부
- 내부 경험담(사내 사례) 추가 가능
- 분기별 업데이트 (SAP Note 반영)

---

## 카탈로그 구조

본 디렉토리의 파일 구성:

| 파일 | 라인 수 | 내용 |
|------|--------|------|
| `financial.md` | ~150 | FI 재무 예외 (FBxx T-codes) |
| `logistics.md` | ~150 | MM/SD 물류 예외 (MRxx, VLxx T-codes) |
| `manufacturing.md` | ~130 | PP 생산 예외 (CO/PP T-codes) |
| `abap-runtime.md` | ~120 | ABAP 런타임 일반 예외 (ST22 단기 덤프) |
| `integration.md` | ~100 | RFC/IDoc/OData 통합 예외 |
| `security.md` | ~80 | 권한, 보안, K-SOX 관련 |

---

## 예외 항목 포맷 (Template)

각 예외는 다음 구조를 따릅니다:

```markdown
### CX_FAGL_NUMBERRANGE_DEFINITION

**카테고리**: FI / 전표 관리
**SAP 클래스 계층**: CX_ROOT → CX_DYNAMIC_CHECK → CX_FAGL → CX_FAGL_NUMBERRANGE_DEFINITION
**발생 버전**: SAP 4.7 이상 (모든 ECC, S/4HANA)

**발생 조건**:
- FB01/FB50 전표 입력 시 번호범위 미정의
- 회계연도 변경 후 신규 번호범위 미생성
- 다중통화 시스템에서 통화별 번호범위 누락

**증상 (사용자 화면)**:
```
Category: FAGL
Message: Number range not maintained for document type XX
```

**진단 단계**:
1. **T-code: FBN1** — 전표 번호범위 정의 확인
   - Path: Financial Accounting → General Ledger → Document → Document Types → Maintain
   - 조회: (회계연도) → (전표유형) → (번호범위 그룹)
   - 확인사항: NRIV 테이블에 INTERVAL 범위 존재 여부

2. **SE16N: NRIV 테이블 직접 조회** (운영 권한 필요)
   - Field: OBJECT, NR01, NR01F (범위 시작), NR01L (범위 끝)
   - Filter: OBJECT = "BKPF_XX" (전표 체크 디지트)

3. **SU53: 권한 로그** 확인 (K-SOX 감시 대상)
   - 권한 객체: F_BKPF_BUK, F_BKPF_BUKRS

**흔한 원인**:
- [40%] 년도 변경 시 신규 회계연도 번호범위 사전 미생성
- [30%] 다중 회사코드인데 일부 회사만 번호범위 정의
- [20%] 외부 번호 지정(수동) 시스템에서 범위 객체 미등록
- [10%] Transport 절차 중 NRIV 스냅샷 불일치

**해결 절차**:
1. FBN1 진입 → "Create Range Intervals" 버튼
   - Number Range Group: 적절한 그룹 선택 (일반적으로 "01")
   - Document Type: 해당 전표 유형
   - Fiscal Year: 현재 + 차년도 미리 생성
   - From/To: 예) 100000000~199999999

2. Transport 설정 (개발/테스트/운영 동기화)
   - SE10: Transport Organizer에서 Customizing 변경사항 기록
   - TMS: Transport Management System을 통해 운영 계정 이관

3. 운영 계정 재확인
   - 동일 FBN1 절차를 운영 계정에서 반복
   - (자동 Transport 없을 경우 수동 입력)

**예방 체크리스트**:
- [ ] 년도 말(12월)에 차년도 모든 회계실체별 번호범위 사전 생성
- [ ] BC-CCM 정기 모니터링: 번호범위 고갈률 추적
- [ ] 회계 담당자에게 알림: "번호범위 소진 시점" 미리 공지
- [ ] 분기별 감사(Audit): NRIV 테이블에 누락된 회사코드/연도 확인

**관련 SAP Note**:
- 130253: Number range maintenance for documents
- 155499: Negative numbers in number ranges

**한국 제조기업 사례**:
- 현대제철 사례: 평로 강관 사업부 회계 분리 시 번호범위 동기화 미흡 → 전표 입력 불가
- 포스코 사례: 년초 신사업부 개설 시 사전 준비 미흡 → 1월 결산 지연

**관련 T-codes**:
- FBN1: 전표 번호범위 정의
- FBN2: 외부 번호 지정 활성화
- FBN3: 번호범위 연도 이월
- OBD4: 전표 유형 정의 (참조용)
```

---

## sapstack Integration

### Evidence Loop (자동 감지)
```yaml
# .sapstack/evidence.yaml
evidence_collectors:
  - type: screenshot_ocr
    pattern: "CX_[A-Z_0-9]+"
    action: "lookup_exception_catalog"

  - type: sap_error_log
    source: "/logs/ST22"
    pattern: "Exception"
    action: "cross_reference_with_catalog"
```

### Intelligent Diagnosis Prompt
```
User: "FB01에서 전표를 입력하려는데 계속 에러가 발생합니다."

sapstack:
1. 화면 분석 → CX_FAGL_NUMBERRANGE_DEFINITION 감지
2. exceptions/financial.md 로드
3. 사용자에게 제시:
   "가능한 원인: 회계연도별 번호범위 미정의"
   "확인 방법: T-code FBN1에서 [연도]→[회계실체]→[번호범위] 확인"
   "긴급 해결: FBN1에서 신규 범위 생성 (Transport 필수)"
```

---

## 유지보수

### 분기별 업데이트
- SAP Note 새로운 항목 반영
- 고객사 보고된 새로운 예외 추가
- 해결 절차 개선 (사용자 피드백)

### 기여 방법
사내 팀에서 새 예외나 사례 발견 시:
```
1. 해당 카테고리 파일에 항목 추가 (또는 suggest branch)
2. RCA 정보 포함 (발생 조건, 진단 T-code, 해결 절차)
3. Pull Request 생성 → Review → Main 병합
```

---

## 참고 자료

### SAP 공식
- [SAP Help Portal - Exception Classes](https://help.sap.com/doc/abapdocu_latest/en/index.htm?file=abenexception.htm)
- [SAP Note 130253](https://launchpad.support.sap.com/) — Number Range Maintenance
- [SAP 발표 자료](https://sap-btp.com/) — ABAP Exception Handling

### sapstack 관련
- `AGENTS.md` — 진단 에이전트 능력
- `hooks/` — 자동 감지 훅 설정
- `.sapstack/evidence.yaml` — Evidence 수집 설정

---

**Last Updated**: 2026-04-13  
**Maintained By**: sapstack Diagnosis Team  
**License**: MIT (sapstack v2.0.0+)
