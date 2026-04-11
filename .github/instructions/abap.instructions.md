---
applyTo: "**/*.abap"
---

# ABAP Instructions (GitHub Copilot)

이 파일은 ABAP 파일을 편집할 때만 적용되는 Copilot 지침입니다.

## 기본 규칙 (Clean Core + HANA + K-SOX)

### SELECT 최적화
- ❌ `SELECT * FROM ...` — 금지
- ✅ 필요 필드만 SELECT + WHERE 조건 (PK/인덱스)
- ❌ `LOOP AT ... SELECT ...` (N+1 문제) — 금지
- ✅ FOR ALL ENTRIES (empty check 포함) 또는 JOIN

### S/4HANA 대응
- BSEG → `I_JournalEntryItem` CDS 사용
- MKPF/MSEG → `I_MaterialDocumentItem` CDS
- KNA1/LFA1 직접 접근 금지 → Business Partner 사용
- CALL TRANSACTION 백그라운드에서 금지 → BAPI / RAP action

### 에러 처리
- 모든 BAPI 호출은 `RETURN` 테이블에서 `type = 'E'` 또는 `'A'` 체크
- 오류 시 `BAPI_TRANSACTION_COMMIT` 호출 금지
- 오브젝트 참조 메서드 호출 전 `IS BOUND` 체크
- TRY-CATCH는 위험한 작업(파일 I/O, 동적 변환, 외부 호출)에만

### Clean Core
- 표준 SAP 오브젝트 직접 수정 금지 (BAdI / Enhancement Spot / CDS 확장 사용)
- Access Key 사용 = 위험 신호
- Z-프로그램은 반드시 Z*/Y* 접두어

### 보안
- 민감 데이터 접근 전 `AUTHORITY-CHECK`
- 하드코딩된 비밀번호·API 키 금지
- 한국 개인정보(주민번호, 연락처)는 로그 출력·UI 표시에서 **마스킹 필수**

### 하드코딩 금지
- 회사코드, G/L 계정, 원가센터, 플랜트 등 **고정값 금지**
- TVARV / Z-테이블 / DDIC Domain / `.sapstack/config.yaml` 활용

## 권장 패턴 예시

자세한 코드 예시는 `plugins/sap-abap/skills/sap-abap/SKILL.md`의 "Section 3 — Code Patterns with Full Examples"를 참조하세요:
- New BAdI
- ALV OO 방식
- BAPI 에러 처리
- CDS View
- RAP Behavior Definition
- ABAP Unit Test

## 성능 Quick Check

SAP Note 참조:
- **2161145** — S/4HANA SQL Optimization Guidelines
- **2313884** — Custom Code Migration Tool (ATC)
