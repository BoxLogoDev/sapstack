# SAP ABAP 한국어 전문 가이드

> 이 문서는 `plugins/sap-abap/skills/sap-abap/SKILL.md`의 한국어 병렬 버전입니다. 코드 예제는 원본 유지, 설명·가이드라인은 한국어로 번역되었습니다.

## 1. 환경 확인 — 코드 작성 전

어떤 ABAP 코드든 작성 전 다음을 질문하세요:

```
□ ABAP 릴리스? (7.02 ECC / 7.40 / 7.50 / 7.57 S/4HANA 2023)
□ Clean Core 요구사항? (On-Premise에서 CBO 허용? vs BTP side-by-side만?)
□ 패키지 / 명명 규칙? (Z* / Y* 접두어, 패키지 구조)
□ Transport Landscape? (DEV → QAS → PRD, 시스템 몇 개?)
□ S/4HANA 배포 모델? (On-Premise / RISE / Cloud PE — 허용 범위에 영향)
```

---

## 2. Enhancement Framework — 결정 테이블

| 시나리오 | 권장 접근 | 비고 |
|---------|-----------|------|
| Classic User Exit 존재 | SMOD / CMOD | ECC 전용 — 새 S/4HANA 개발에서는 피할 것 |
| BAdI 정의 존재 | New BAdI (SE19 / GET BADI) | 모든 릴리스 — 권장 접근 |
| Exit/BAdI 없음, On-Premise | Enhancement Spot (SE18/SE19) | CBO 허용 환경 |
| S/4HANA Clean Core / Cloud PE | **BTP side-by-side extension** (RAP + Events) | On-stack 수정 불가 |

---

## 3. 코드 패턴 + 전체 예제

### New BAdI (모든 릴리스 — 권장)

```abap
" Step 1: SE19 또는 BADI Explorer(SPRO)로 BAdI 탐색
" Step 2: Enhancement Implementation 생성
" Step 3: Interface method 구현

DATA lo_badi TYPE REF TO badi_name.
GET BADI lo_badi.
CALL BADI lo_badi->method_name
  EXPORTING iv_input  = lv_value
  IMPORTING ev_output = lv_result.
```

### ALV — OO 방식 (REUSE_ALV_GRID_DISPLAY보다 권장)

```abap
DATA: lo_alv    TYPE REF TO cl_salv_table,
      lt_result TYPE TABLE OF your_structure.

" ... lt_result 채우기 ...

TRY.
    cl_salv_table=>factory(
      IMPORTING r_salv_table = lo_alv
      CHANGING  t_table      = lt_result ).

    " 옵션: 컬럼 설정
    lo_alv->get_columns( )->set_optimize( abap_true ).

    " 옵션: 정렬 추가
    DATA(lo_sorts) = lo_alv->get_sorts( ).
    lo_sorts->add_sort( columnname = 'FIELD1' ).

    lo_alv->display( ).
  CATCH cx_salv_msg INTO DATA(lx_err).
    MESSAGE lx_err->get_text( ) TYPE 'E'.
ENDTRY.
```

### BAPI — 완전한 에러 처리

```abap
DATA lt_return TYPE TABLE OF bapiret2.

CALL FUNCTION 'BAPI_NAME'
  EXPORTING
    iv_param1 = lv_value1
    iv_param2 = lv_value2
  IMPORTING
    ev_result = lv_result
  TABLES
    return    = lt_return.

" 반드시 return 테이블 확인 — 성공 가정 금지
IF line_exists( lt_return[ type = 'E' ] )
OR line_exists( lt_return[ type = 'A' ] ).
  " 에러 — COMMIT 금지; 처리 또는 예외
  LOOP AT lt_return INTO DATA(ls_err) WHERE type CA 'EA'.
    MESSAGE ls_err-message TYPE 'E'.
  ENDLOOP.
ELSE.
  " 성공 — 커밋
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING wait = abap_true.
ENDIF.
```

### CDS View (S/4HANA)

```abap
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'My Entity Description'
@Metadata.ignorePropagatedAnnotations: true

define view entity ZI_MyEntityName
  as select from table_name as t
  association [0..1] to other_table as _Assoc
    on $projection.KeyField = _Assoc.KeyField
{
  key t.key_field       as KeyField,
      t.comp_code       as CompanyCode,
      t.amount          as Amount,
      t.currency        as Currency,
      _Assoc            -- expose association
}
```

### RAP Behavior Definition (S/4HANA)

```abap
managed implementation in class zbp_my_entity unique;
strict ( 2 );

define behavior for ZI_MyEntity alias MyEntity
  persistent table zmy_table
  lock master
  authorization master ( instance )
  etag master LastChangedAt
{
  create;
  update;
  delete;

  field ( readonly )  UUID, CreatedAt, CreatedBy, LastChangedAt, LastChangedBy;
  field ( mandatory ) CompanyCode, DocumentType;

  action post result [1] $self;

  mapping for zmy_table corresponding
  {
    UUID          = entity_uuid;
    CompanyCode   = bukrs;
    DocumentType  = blart;
    CreatedAt     = created_at;
    LastChangedAt = last_changed_at;
  }
}
```

### ABAP Unit Test (Clean Core 필수)

```abap
CLASS ltc_my_class DEFINITION FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    DATA mo_cut TYPE REF TO zcl_my_class.  " Class Under Test
    METHODS:
      setup,
      test_calculate_positive FOR TESTING,
      test_calculate_zero FOR TESTING.
ENDCLASS.

CLASS ltc_my_class IMPLEMENTATION.
  METHOD setup.
    mo_cut = NEW zcl_my_class( ).
  ENDMETHOD.

  METHOD test_calculate_positive.
    DATA(lv_result) = mo_cut->calculate( iv_base = 100
                                         iv_rate = '0.1' ).
    cl_abap_unit_assert=>assert_equals(
      exp = '10.00'
      act = lv_result
      msg = 'Positive calculation failed' ).
  ENDMETHOD.

  METHOD test_calculate_zero.
    DATA(lv_result) = mo_cut->calculate( iv_base = 0
                                         iv_rate = '0.1' ).
    cl_abap_unit_assert=>assert_equals(
      exp = '0.00'
      act = lv_result
      msg = 'Zero base should return zero' ).
  ENDMETHOD.
ENDCLASS.
```

---

## 4. 성능 트러블슈팅

### Short Dump 유형 (ST22)

| Dump 유형 | Root Cause | 수정 방법 |
|-----------|-----------|-----------|
| **TIME_LIMIT_EXCEEDED** | 무한 루프 / 최적화 안 된 대량 처리 | 루프에 `CHECK sy-tabix MOD 100 = 0.` 추가; SQL 최적화 |
| **MEMORY_NO_MORE_PAGING** | 대용량 테이블에 SELECT * / 대용량 내부 테이블 | 필요 컬럼만 SELECT; `PACKAGE SIZE`로 배치 처리 |
| **RAISE_EXCEPTION unhandled** | TRY-CATCH 누락 | 특정 예외 클래스의 TRY-CATCH 블록 감싸기 |
| **COMPUTE_INT_ZERODIVIDE** | 0으로 나누기 | 나누기 전 zero-check 추가 |
| **OBJECTS_OBJREF_NOT_ASSIGNED** | 오브젝트 참조가 초기 상태 (NULL pointer) | 메서드 호출 전 `IS BOUND` 체크 |

### SQL 성능 (SE30 / SAT Runtime Analysis)

**나쁜 패턴**:
```abap
" 전체 테이블 스캔 — 절대 금지
SELECT * FROM mara INTO TABLE @DATA(lt_mara).

" LOOP 내부의 SELECT — N+1 쿼리 문제
LOOP AT lt_orders INTO DATA(ls_order).
  SELECT SINGLE * FROM mara INTO @DATA(ls_mat)
    WHERE matnr = @ls_order-matnr.   " N번 호출!
ENDLOOP.
```

**좋은 패턴**:
```abap
" 필요 필드만 + WHERE 조건
SELECT matnr, maktx, mtart, meins
  FROM mara
  INTO TABLE @DATA(lt_mara)
  WHERE mtart = 'FERT'
    AND mstae = ' '.

" FOR ALL ENTRIES — 모든 주문에 대해 단일 쿼리
SELECT matnr, maktx
  FROM mara
  INTO TABLE @DATA(lt_mara)
  FOR ALL ENTRIES IN @lt_orders
  WHERE matnr = @lt_orders-matnr.
```

---

## 5. S/4HANA에서 Deprecated된 객체 → 대체 방법

| Deprecated | 대신 사용 | 비고 |
|-----------|----------|------|
| BSEG SELECT | `I_JournalEntryItem` (CDS) | S/4HANA는 ACDOCA가 소스 |
| BSID/BSAD SELECT | `I_CustomerLineItem` (CDS) | |
| BSIK/BSAK SELECT | `I_SupplierLineItem` (CDS) | |
| MKPF/MSEG SELECT | `I_MaterialDocumentItem` (CDS) | MATDOC이 소스 |
| WHERE 없는 MARA SELECT * | 필터가 있는 CDS view | 성능 + 호환성 |
| CALL TRANSACTION | BAPI / RAP action / Function Module | 호환성 이슈 |
| Logical DB PNPCE | Direct SELECT + AUTHORITY-CHECK | S/4HANA에서 deprecated |
| Old BAdI (CL_EXITHANDLER) | New BAdI (GET BADI) | 지원은 되나 구식 |
| COMMUNICATION 구문 | RFC / Web service | Obsolete |
| Non-Unicode 문자열 연산 | String template `\|...\|` | Unicode 필수 |

---

## 6. 코드 리뷰 체크리스트 (공통)

```
성능:
□ SELECT * 없음 — 필요 필드만
□ 모든 DB read가 PK/인덱스 필드에 WHERE
□ LOOP 내부의 SELECT 없음 — FOR ALL ENTRIES 또는 JOIN
□ 대량 데이터 read에 PACKAGE SIZE 사용

에러 처리:
□ 모든 BAPI 호출이 RETURN 테이블에서 E/A 메시지 체크
□ 모든 오브젝트 참조 메서드 호출: IS BOUND 체크
□ TRY-CATCH 블록 (파일 I/O, 변환 등 위험 작업)
□ 루프 안의 COMMIT WORK 없음

보안:
□ 민감 데이터 접근에 AUTHORITY-CHECK 구현
□ 하드코딩된 비밀번호·API 키·크리덴셜 없음
□ DB 쓰기 전 입력 검증
□ K-SOX 대상 — 민감 트랜잭션 로그 남기기 (CHANGEDOCUMENT)
□ 개인정보보호법 — 주민번호·연락처 로그 출력 금지

Clean Core / S/4HANA 호환성:
□ Deprecated 테이블 (BSEG, MKPF/MSEG) 직접 SELECT 없음
□ 백그라운드 가능 프로그램에서 CALL TRANSACTION 없음
□ SAP 표준 오브젝트 수정 없음 (Enhancement 사용)

기술:
□ 조직 고정값 (회사코드, 플랜트, G/L) 하드코딩 없음
□ Unicode 호환: SE38 → Program Attributes → Unicode 체크
□ 프로그램 유형 정확 (Type 1 report, M module pool)
□ Transport request 할당 + 문서화

품질:
□ ABAP Unit test class 포함
□ ATC 클린 — Priority 1/2 findings 없음
□ Pretty Printer로 포맷 (Shift+F1)
□ 국제 팀 공유 시 주석은 영문
```

전체 체크리스트: `../code-review-checklist.md`

---

## 7. 한국 현장 특이사항 (원본 영문판 추가 컨텍스트)

### 한국 대기업 Naming Convention
- 삼성: `Z*` / `Y*` + 본부별 접두어
- LG: `ZLG*`
- SK: `ZSK*`
- 현대: `ZHK*` 또는 `ZHMC*`
- 각 조직이 자체 표준 문서 보유 — 프로젝트 투입 전 숙지

### 한국어 덤프 빈도 높은 유형
- **CONVT_CODEPAGE** — Unicode 변환 실패 (SAP Note 2452523 계열)
- **MESSAGE_TYPE_X** — 한국어 메시지 클래스 번역 누락
- **CONNE_IMPORT_WRONG_BUFFER_LENGTH** — Korean NLS_LANG 설정 오류

### 개인정보보호법 준수
- 주민등록번호·연락처는 **로그 출력·화면 표시에서 마스킹 필수**
- AUTHORITY-CHECK로 접근 제어
- CHANGEDOCUMENT로 접근 이력 보존

### 자주 참조하는 SAP Note
- **2452523** — Unicode Conversion Code Page Issues
- **2313884** — S/4HANA Custom Code Migration Tool
- **2161145** — S/4HANA SQL Optimization Guidelines
- **1794432** — Clean Core Authorization Best Practices

---

## 8. 관련 자료

- `../clean-core-patterns.md` — 확장 계층 가이드, RAP vs CBO 결정, 주요 CDS 주석
- `../code-review-checklist.md` — 전체 ABAP 코드 리뷰 체크리스트
- `quick-guide.md` — 한국어 퀵가이드
- `../../../../sap-bc/skills/sap-bc/SKILL.md` — 한국 BC 관점 (ABAP 덤프 한국 맥락)
- `/agents/sap-abap-reviewer.md` — ABAP 리뷰 서브에이전트
- `/commands/sap-abap-review.md` — 코드 리뷰 슬래시 커맨드
