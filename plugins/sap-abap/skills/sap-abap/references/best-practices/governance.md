# ABAP 거버넌스·코드 표준 (Tier 3) Best Practice

## 적용 범위
- **ECC**: ✓ / **S/4 HANA**: ✓ / **한국 특화**: ✓

## 1. 코드 표준 거버넌스

### 1.1 명명 규칙 (Naming Convention)
- 클래스: `ZCL_<DOMAIN>_<PURPOSE>` (예: `ZCL_FI_DOCUMENT_VALIDATOR`)
- 인터페이스: `ZIF_*`
- 함수 그룹: `Z<DOMAIN>` (≤ 26자)
- 트랜잭션: `Z*` / `Y*` (Z 우선)
- DB 테이블: `Z*`, 인덱스는 별도 객체

### 1.2 코딩 표준
- ABAP Objects 우선 (Procedural 회피)
- `TYPE TABLE OF` + LOOP 사용, `SELECT *` 금지
- FOR ALL ENTRIES → JOIN 또는 CDS view 선호
- 메시지: T100 + 한국어 + 영문 보조
- 주석: 한국어 OK (회사 정책 따라)

### 1.3 ATC 커스텀 카테고리
- Priority 1 (필수): SQL 효율, 보안, 메모리 누수
- Priority 2 (권장): 명명 규칙, 가독성
- Priority 3 (정보): 사용 빈도 낮은 패턴

## 2. 변경 관리

### 2.1 트포 거버넌스 (BASIS와 공통)
- DEV → QAS → PRD 강제
- 단방향 흐름 (역방향 금지)
- 트포-티켓 1:1 (CTS+ 자동화)

### 2.2 핫픽스 절차
- P1 인시던트 한정
- 사후 4시간 내 보고
- 별도 ZHOTFIX_* 트포 명명

## 3. 보안 거버넌스

### 3.1 ABAP Security
- SQL Injection: 동적 SQL 모든 입력 sanitize
- Open SQL: `WHERE ... = lv_input` 형태로 binding
- Open File: AUTHORITY-CHECK 우선
- RFC: 인증·암호화 (SNC 또는 TLS)

### 3.2 데이터 보호
- PII 필드 (주민번호·계좌) 노출 자제
- 마스킹 함수 라이브러리 사용
- AUTHORITY-CHECK OBJECT `S_TCODE`, `S_DEVELOP` 강제

## 4. 한국 특화

### 4.1 K-SOX ITGC
- 모든 ABAP 변경 트포 추적 가능
- 변경자·승인자 분리 (SoD)
- PRD 직접 SE38 실행 권한 0명 권장

### 4.2 한국어 처리
- 유니코드 시스템 (Unicode-enabled) 필수
- 자모 분리·결합 함수 활용 (BAPI_KO_*)
- 한국어 OCR/PDF 인코딩 명시 (UTF-8 또는 CP949)

## 5. 거버넌스 지표

| 지표 | 임계 |
|---|---|
| ATC 위반 (Priority 1) | 0 |
| 단위 테스트 커버리지 | > 70% |
| PRD 직접 수정 | 0 |
| 핫픽스 비율 | < 5% / 분기 |
| SoD 위반 | 0 |

## 연관 문서
- `operational.md`, `period-end.md`
- `../../../sap-basis/skills/sap-basis/references/best-practices/governance.md`
