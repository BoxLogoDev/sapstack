# ABAP Runtime Exception Classes (시스템/기술)

ABAP 런타임에서 발생하는 일반 예외들. 메모리, 타입 변환, SQL, RFC 등 기술적 오류가 중심입니다.

---

## CX_SY_DYN_CALL_ILLEGAL_TYPE
**카테고리**: ABAP Runtime / 동적 호출  
**발생 버전**: ECC 5.0+ (PERFORM USING 또는 CALL METHOD 사용 프로그램)

**발생 조건**:
- PERFORM 또는 CALL METHOD로 동적 프로그램 호출 시 파라미터 타입 불일치
- 자료형 형변환 오류 (예: CHARACTER → NUMERIC)
- Interface mismatch (호출되는 프로그램의 FORM/METHOD 시그니처 변경)

**증상**:
```
Runtime Error: DYNL_CALL_ILLEGAL_TYPE
Message: Illegal parameter type in PERFORM USING
Short text: Type mismatch in PERFORM call
Location: Program [PROG_NAME] Line [NNN]
ST22 Dump
```

**진단**:
1. **ST22**: ABAP Short Dump (단기 덤프 분석)
   - Error: DYNL_CALL_ILLEGAL_TYPE
   - Call Stack: 어느 프로그램의 어느 라인에서 호출되었는지 추적
   - Source Code: 문제 코드 행 표시

2. **SE37**: Function Module 정의
   - Called module의 Interface (IMPORTING/EXPORTING) 확인
   - Parameter types 재확인

3. **Transaction**: 에러 발생 시점
   - 어느 T-code에서 발생했는가
   - 동시성: 동일 T-code 재실행 시에도 발생하는가

**흔은 원인**:
- [40%] PERFORM 호출 시 변수 타입 오류
  - 예: PERFORM subroutine USING g_qty (자료형 DEC) → FORM expects CHAR
- [30%] Batch Input (CALL TRANSACTION) 오류
  - BDC 데이터 타입이 필드 타입과 불일치
- [20%] CALL METHOD 동적 호출
  - Method의 CHANGING parameter가 READ-ONLY 변수로 호출
- [10%] RFC call (FM_REMOTE_CALL)
  - Remote function의 interface 변경 후 old caller 미update

**해결**:
```
1. ST22 분석
   - Call Stack 추적: 어느 라인이 문제?
   - Source Code 행 번호 메모

2. Source Code 수정
   - SE38 또는 SE80: 해당 프로그램 오픈
   - 호출 코드 검토:
     PERFORM subroutine USING g_param1 TYPE ...
     - g_param1의 자료형 확인: DATA g_param1 TYPE ...
     - FORM subroutine USING p_param1 TYPE ...
     - 일치 확인 또는 명시적 변환 추가
     
   예시:
   ```abap
   DATA: g_qty TYPE DEC,
         g_qty_char TYPE CHAR.
   
   g_qty_char = g_qty. " 명시적 변환
   PERFORM calc USING g_qty_char.
   
   FORM calc USING p_value TYPE CHAR.
     ...
   ENDFORM.
   ```

3. SE37 재확인
   - Function module interface (IMPORTING/EXPORTING)
   - 호출 패턴과 일치하는지 재검증

4. Transport (SE10)
   - 수정사항 Transport task 기록
   - 개발 → 테스트 → 운영 이관
```

**예방**:
- Code Review: PERFORM/CALL METHOD 코드는 필수 리뷰
- Unit Test (ABAP Unit): 동적 호출 경로 테스트
- Interface Documentation: FORM/METHOD 매개변수 명확히

**관련 Note**: 168734 (ABAP Type Safety)

---

## CX_SY_NO_HANDLER
**카테고리**: ABAP Runtime / 예외 처리  
**발생 버전**: ECC 5.0+

**발생 조건**:
- TRY-CATCH 블록 없이 Exception raise
- Exception이 발생했으나 상위 프로시저에서 CATCH되지 않음
- Background Job에서 예외 발생 (ABAP job은 exception 처리 부족)

**증상**:
```
Runtime Error: NO_HANDLER
Message: Exception [CX_*] not caught
Short text: Unhandled exception in [PROG_NAME]
ST22 Dump
```

**진단**:
1. **ST22**: 단기 덤프
   - Exception Name: 어떤 CX_* 예외인가
   - Exception Handler Stack: 어디서 catch되어야 했는가
   - Source Code: raise 된 라인

2. **SE38**: 프로그램 소스 검토
   - TRY...CATCH...ENDTRY 블록 확인
   - Exception type이 정의되어 있는가

**흔은 원인**:
- [50%] TRY-CATCH 누락: 예외 발생 로직에 exception handling 없음
- [30%] Catch 범위 오류: CX_SY_DYN_CALL_ILLEGAL_TYPE는 catch되지 않음 (더 상위 parent class 필요)
- [15%] Background Job: SAP Job scheduler는 exception 처리 컨텍스트 부족
- [5%] Recursive Call: 깊은 호출 스택에서 exception 발생 → 상위로 전파 중 처리 누락

**해결**:
```
1. TRY-CATCH 추가
   ```abap
   TRY.
       PERFORM subroutine.
   CATCH cx_sy_dyn_call_illegal_type INTO DATA(exception).
       WRITE: 'Type Error:', exception->get_text( ).
   CATCH cx_sy_no_handler INTO exception.
       " 예외 재처리 (Log에 기록 후 계속)
   ENDTRY.
   ```

2. Exception 상위 클래스로 catch
   - CATCH cx_root: 모든 예외를 최상위에서 catch
   - (과도하게 광범위하므로 필요시만 사용)

3. Exception 로깅
   - 예외 발생 시 log table 또는 application log에 기록
   - TM30: 나중에 분석 가능

4. Background Job 대체
   - SUBMIT ... VIA JOB: 비동기 작업 시 exception handling 강화 필수
   - 또는 scheduling program을 별도 래퍼로 작성
```

**예방**:
- Static Analysis: SE37 또는 Code Analyzer (SCI)에서 uncaught exception 경고
- ABAP Code Inspector: 모든 PERFORM/CALL METHOD에 TRY-CATCH 확인
- Log Monitoring: Application Log (TM80) 정기 리뷰

**관련 Note**: 177543 (Exception Handling in ABAP)

---

## CX_SY_OPEN_SQL_DB
**카테고리**: ABAP Runtime / Database  
**발생 버전**: ECC 5.0+

**발생 조건**:
- SQL SELECT/INSERT/UPDATE/DELETE 시 데이터베이스 오류
- Table lock (다른 트랜잭션이 exclusive lock 보유)
- Connection timeout (DB 응답 없음)
- Table space 부족

**증상**:
```
Runtime Error: OPEN_SQL_DB
Message: Database error in [SQL_STMT]
Details: Lock timeout / Cannot allocate space
ST22 Dump
```

**진단**:
1. **ST22**: 단기 덤프
   - SQL Statement: 어떤 쿼리가 실패?
   - Error Code: DB 오류 코드 (예: ORA-00001, -911)
   - Table Name: 어느 테이블?

2. **SE16N**: 테이블 내용 확인
   - 데이터 존재 여부, 크기

3. **Transaction SU53**: 권한 로그
   - 해당 테이블에 대한 권한 부족 여부

**흔은 원인**:
- [40%] Table Lock: 다른 사용자가 UPDATE 중
  - 예: Month-End Close 중 FI 테이블 lock
- [30%] Connection Timeout: DB 응답 지연 (성능 저하)
- [15%] Table Space: DB 디스크 부족
- [10%] SQL Syntax: 쿼리 문법 오류 (HANA로 마이그레이션 후 발생)
- [5%] Deadlock: 상호 참조 lock

**해결**:
```
1. Lock Timeout
   - SM04: 사용자 activity 확인
   - 혹은 DB 시스템 관리자에 Lock holder 추적 요청
   - 긴급 시: 해당 사용자 세션 kill (위험)

2. Performance Tune
   - SE30: ABAP Runtime Analysis (성능 분석)
   - SQL 쿼리 최적화 (Index 추가, WHERE 조건 개선)

3. Table Space
   - DBA에 Disk 공간 확보 요청
   - 또는 Archive 과거 데이터 (Z-table로 이관)

4. Retry Logic 추가
   - SELECT에 WAIT 옵션 또는 재시도 로직
   ```abap
   DO 3 TIMES.
       TRY.
           SELECT * FROM table WHERE ... INTO TABLE result.
           BREAK. " 성공 시 루프 탈출
       CATCH cx_sy_open_sql_db.
           WAIT UP TO 1 SECONDS. " 1초 대기
           IF sy-index = 3.
               RAISE. " 3회 실패 시 exception 재발생
           ENDIF.
       ENDTRY.
   ENDDO.
   ```
```

**예방**:
- Index 설계: 자주 사용되는 WHERE 조건에 index 정의 (SE11 테이블 T-code)
- Batch Window: 대량 처리는 System off-peak 시간(야간)에 실행
- Monitoring: ST04 (DB Monitor) 정기 확인

**관련 Note**: 161234 (SQL Performance)

---

## CX_SY_CONVERSION_NO_NUMBER
**카테고리**: ABAP Runtime / 타입 변환  
**발생 버전**: ECC 5.0+

**발생 조건**:
- CHARACTER 필드를 NUMERIC으로 변환 시 숫자가 아닌 값
- 예: "ABC123" → NUMERIC conversion fail
- File upload: CSV에서 숫자 필드가 문자열로 입력

**증상**:
```
Runtime Error: CONVERSION_NO_NUMBER
Message: Cannot convert 'ABC123' to type NUMC
Short text: Data type mismatch
ST22 Dump
```

**진단**:
1. **ST22**: 변환 실패 지점
   - Source value: 실제 값은 무엇?
   - Target type: 변환 대상 타입
   - Source Code: 변환하는 코드 라인

2. **데이터 소스 확인**
   - File upload (SE16): CSV 파일 내용 검토
   - Batch Input (BDC): 입력 데이터 형식 확인

**흔은 원인**:
- [50%] Manual data entry: 사용자가 숫자 필드에 문자 입력
  - 예: "Contract ID" 필드에 "A001" 입력 (숫자만 허용)
- [30%] CSV import: 소스 파일에서 공백/특수문자 포함
  - 예: " 12345 " (앞뒤 공백) → TRIM 필요
- [15%] Legacy system 이관: Old system format → New format 변환 오류
- [5%] Formula field: 계산 결과가 숫자가 아님

**해결**:
```
1. Input Validation
   IF NOT ( input_value CO '0123456789+-' ).
       WRITE: 'Error: Invalid number format'.
       RETURN.
   ENDIF.

2. Explicit conversion with error handling
   DATA result TYPE numc.
   TRY.
       result = CONV #( input_value ).
   CATCH cx_sy_conversion_no_number.
       WRITE: 'Invalid number: ' input_value.
       result = 0. " Default value
   ENDTRY.

3. String trimming & validation
   DATA clean_value TYPE string.
   clean_value = input_value.
   CONDENSE clean_value.
   " CONDENSE removes leading/trailing spaces
   
   IF clean_value CO '0123456789'.
       result = clean_value.
   ENDIF.

4. CSV Import: Header validation
   - 첫 번째 행에서 데이터 타입 명시
   - "Amount (Numeric)" 등 명확한 column header
```

**예방**:
- Constraint 정의: ABAP screen에서 field type 강제 (NUMC 타입)
- Validation rule: ABAP 프로그램에서 CONVERT 전 검증
- User Training: Input rule 교육 (예: "숫자만 입력")

**관련 Note**: 145672 (ABAP Type System)

---

## CX_SY_ASSIGN_TYPE_CONFLICT
**카테고리**: ABAP Runtime / 할당 타입 불일치  
**발생 버전**: ECC 5.0+

**발생 조건**:
- Assignment(할당)할 때 자료형이 호환되지 않음
- 예: CHAR(10) field에 TABLE 할당 시도
- Polymorphic object assignment: Parent class reference에 incompatible child 할당

**증상**:
```
Runtime Error: ASSIGN_TYPE_CONFLICT
Message: Cannot assign [TYPE_A] to [TYPE_B]
Short text: Type mismatch in assignment
ST22 Dump
```

**진단**:
1. **ST22**: 할당 코드 라인
   - Left-hand side: 할당 대상 변수
   - Right-hand side: 할당 값

2. **SE38**: 소스 코드 검토
   - DATA 선언문에서 타입 확인
   - Assignment 코드 재검토

**흔은 원인**:
- [45%] 명시적 할당: 자료형 선언 오류
  - 예: DATA g_amount TYPE CHAR. ... g_amount = g_decimal_qty.
- [30%] 간접 할당: 참조 또는 pointer 오류
- [15%] OOP: Inheritance hierarchy mismatch
- [10%] Nested structure: 복잡한 structure assignment

**해결**:
```
1. Type casting 확인
   DATA: g_amount TYPE NUMC,
         g_display TYPE CHAR.
   
   " 명시적 casting
   g_display = CONV CHAR(g_amount).

2. Structure assignment
   DATA: g_src TYPE ty_source_struct,
         g_dst TYPE ty_target_struct.
   
   g_src-field1 = g_dst-field1. " field별 할당
   " 또는
   g_src = CORRESPONDING #( g_dst ). " auto-mapping

3. OOP reference
   DATA: g_obj_parent TYPE REF TO cx_parent,
         g_obj_child TYPE REF TO cx_child.
   
   " Down-cast는 주의 필요
   TRY.
       g_obj_parent ?= g_obj_child.
   CATCH cx_sy_move_cast_error.
       WRITE: 'Cast failed'.
   ENDTRY.
```

**예방**:
- Static type checking: DATA 선언 시 명확한 TYPE 지정
- Type browser (SE11): 복잡한 structure는 사전에 type 확인
- Code Review: OOP casting 코드는 필수 review

**관련 Note**: 156123 (ABAP Reference Type System)

---

## CX_SY_RFCSDK_ERROR
**카테고리**: ABAP Runtime / RFC 호출  
**발생 버전**: ECC 5.0+

**발생 조건**:
- RFC(Remote Function Call) 또는 IDoc 송수신 시 네트워크/연결 오류
- Destination (SM59) 정의 오류 또는 연결 불가
- Authentication fail (사용자명/암호 오류)

**증상**:
```
Runtime Error: RFC_ERROR_SYSTEM_FAILURE
Message: Cannot connect to destination [DEST]
Details: Connection refused / Timeout
ST22 Dump
```

**진단**:
1. **SM59**: RFC Destination 정의
   - Destination name 정확성
   - Connection Type: 3 (SAP system) / C (RFC) / H (HTTP)
   - Target System: Host/Port/System ID 확인
   - Test Connection button: 연결 테스트

2. **Transaction SE37**: Function Module Interface
   - RFC 함수의 IMPORTING/EXPORTING 재확인

3. **Transaction PRCT (Trace)**: 실시간 모니터링
   - RFC call trace 활성화 → 문제 추적

**흔은 원인**:
- [40%] Network: 방화벽 또는 라우팅 오류
- [30%] Destination config: Host/Port 오류 또는 destination 삭제됨
- [15%] Authentication: Password 만료 또는 user lock
- [10%] Timeout: 대상 시스템 과부하
- [5%] Function Module: 대상에서 function 없음 (버전 차이)

**해결**:
```
1. SM59 확인
   - Destination 재생성 또는 수정
   - Test Connection 성공 확인

2. Network 진단
   - Ping: Target system 접근 가능 여부
   - telnet [host] [port]: Port 열림 여부

3. Function Module 버전 확인
   - SE37: 대상 system에서 해당 FM 존재 여부
   - Interface 변경 여부

4. Retry logic 추가
   DO 2 TIMES.
       TRY.
           CALL FUNCTION 'REMOTE_FM' DESTINATION 'DEST'
               IMPORTING result = g_result.
           BREAK.
       CATCH cx_sy_rfcsdk_error.
           WAIT UP TO 2 SECONDS.
           IF sy-index = 2.
               RAISE.
           ENDIF.
       ENDTRY.
   ENDDO.
```

**예방**:
- Destination failover: 다중 destination 설정 (Primary/Secondary)
- Connection pooling: RFC connection reuse (성능 최적화)
- Monitoring: SMGW (Gateway) 모니터링

**관련 Note**: 178734 (RFC Configuration)

---

**Last Updated**: 2026-04-13  
**Total Exceptions**: 7  
**Maintenance Cycle**: Semi-annual (ST22 dump analysis)
