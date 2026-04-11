# sap-abap 한국어 퀵가이드

## 🔑 환경 인테이크
1. ABAP Platform (ECC / S/4HANA 릴리스)
2. HANA Native 개발 여부 (CDS, AMDP, RAP)
3. ATC 설정 (ATC Check Variant)

## 📚 핵심 개발 주제

### Clean Core 원칙
- 표준 오브젝트 직접 수정 금지
- BAdI / Enhancement Point / CDS View 확장 사용
- Access Key 사용은 **경고 신호**

### HANA 최적화 SQL
- ❌ `SELECT * FROM ...`
- ✅ 필요 컬럼만 SELECT + `INTO TABLE`
- `FOR ALL ENTRIES` 주의:
  - 빈 테이블 체크
  - 중복 제거 (`SORT ... BY ... DELETE ADJACENT DUPLICATES`)
  - 작은 lookup은 **JOIN**이 낫다
- **Push-down** — CDS View, AMDP로 HANA에 로직 위임

### CDS Views
- **@ObjectModel.text.element** — 언어 독립 텍스트
- **@Semantics.amount.currencyCode** — 통화 필드
- **@EndUserText.label** — i18n 지원 (한국어 라벨)

### RAP (RESTful ABAP Programming)
- Business Object → Service Definition → Service Binding
- Behavior Implementation
- Fiori Elements 자동 생성

### 성능 분석
- **ST05**: SQL Trace
- **SAT**: Runtime Analysis (구 SE30)
- **ST22**: Dump 분석
- **SM50/SM66**: Work Process 상태

## 🇰🇷 특화
- **대기업 Naming Guideline** — 삼성(Z*/Y*), LG(ZLG*), SK(ZSK*) 등 조직별
- **개인정보 보호** — 주민번호/연락처는 **로그 출력 금지**, 화면 마스킹
- **한글 덤프**: CONVT_CODEPAGE — Unicode 변환 이슈 (SNOTE 2452523)
- **한국어 메시지 클래스** 번역 누락 시 MESSAGE_TYPE_X 빈번

## ⚠️ 금지 사항
- ❌ 표준 SAP 객체 수정 (Clean Core 위반)
- ❌ 운영환경 SE38 직접 실행 (일부 보고서 제외)
- ❌ `AUTHORITY-CHECK` 누락 (K-SOX 감사 대상)
- ❌ Dynamic SQL에 사용자 입력 직접 concatenate (SQL Injection)

## 🤖 코드 리뷰 위임
```
/sap-abap-review <파일경로 또는 객체명>
```
→ `sap-abap-reviewer` 서브에이전트가 Clean Core + HANA + ATC 기준으로 리뷰

## 📖 참조
- `../clean-core-patterns.md`
- `../code-review-checklist.md`
