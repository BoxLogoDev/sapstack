# CVI US: 미국 (United States) 로컬라이제이션

> 초안. 연방 VAT 가 없고 주별 Sales & Use Tax · 1099 · GAAP · SOX 가 축이다.
> 주 세율을 표로 만들어 박지 않는다. 한국 부가세 캘린더를 옮기지 않는다.

## 개요

| 항목 | 값 |
|------|-----|
| **CVI 코드** | US |
| **회계기준** | US GAAP (상장사). IFRS 는 외국등록 등 예외 |
| **회계연도** | 자유. 역년 또는 7~6 등이 흔함 |
| **기본 통화** | USD |
| **간접세** | 연방 VAT 없음. 주·카운티·시 Sales Tax + Use Tax |
| **정보보고** | 1099-NEC / 1099-MISC 등 (IRS) |
| **내부통제** | SOX (상장사) |
| **개인정보** | 연방 단일법 없음. 주법(CCPA 등) + 업권법(HIPAA, GLBA) |

---

## 1. 회계 기준 & 폐쇄

### 1.1 회계연도
- IRS 와 SEC 가 허용하는 범위에서 회사가 선택.
- T-code: **OB29**. 변형 코드(K1 등)는 예시일 뿐 하드코딩 금지.

### 1.2 GAAP
- 수익인식(ASC 606), 리스(ASC 842) 등은 정책 문서가 회사마다 다름.
- SAP: 전표 유형·계정과목표는 사용자 제공 값만.
- 감가상각 세무 vs 장부(Book-tax) 차이는 확인 필요. 세율표를 여기에 쓰지 않음.

---

## 2. 세무 규정

### 2.1 Sales & Use Tax
- **연방 부가세 없음.**
- 과세권: 주 + (종종) county/city. 주 전역 세율 없음(OR, MT, DE, NH 등은 주 sales tax 없음 — 시·특수세는 별도).
- Use Tax: 타주 구매 후 자주로 반입 시 구매자가 신고하는 구조.
- SAP 표준 세금코드만으로 미국 전 관할을 커버한다고 말하지 않는다. **Vertex / Avalara / Sovos** 같은 tax engine 연동이 현장의 기본에 가깝다.
- T-code: **FTXP**, jurisdiction 이 있으면 **TAXUSJ** 계열(스텁 기재). 관할 코드 값은 하드코딩 금지.

**확인 필요**: 각 주 economic nexus 금액·거래 건수 임계치 (Wayfair 이후 주마다 다름).

### 2.2 연방·주 법인세
- 스텁에 적힌 연방 법인 21% 는 TCJA 이후 공개 세율이다. 주 법인세는 0~여러 % — **표로 나열하지 않음**.
- 신고 양식(1120 등) 마감·연장 일자는 IRS 안내. **확인 필요**.

### 2.3 1099
공개된 IRS 제도 요지:
- 특정 지급(외주 용역 등)은 연간 합계가 임계를 넘으면 정보보고.
- 1099-NEC 는 비고용 용역. 1099-MISC 는 다른 범주.
- 스텁의 **연 $600** 는 오랫동안 쓰인 NEC/MISC 일부 박스의 임계. 박스·연도별로 바뀔 수 있어 **해당 세무연도 IRS 지시서 확인 필요**.
- SAP: 벤더 원천/보고 표시, 연말 추출. 구체 리포트 이름 **확인 필요**.
- 수취자 W-9 (TIN) 미비가 현장 1순위 원인인 경우가 많다.

---

## 3. SOX (Sarbanes-Oxley)

- 미국 상장사. 302/404 등.
- SAP 관점: 직무분리(SoD), 변경 관리,  privileged 접근, 전표 전기 권한.
- sapstack 은 통제 **설계 조언**만. 운영자가 증빙을 붙인다. 라이브 SAP 접근 없음.
- 한국 K-SOX 체크리스트를 복사하지 말 것. 통제 목표만 같고 조항 번호가 다르다.

---

## 4. 급여 & 고용세

- 연방 원천(FIT), Social Security / Medicare, FUTA, 주 실업·장애 — **요율을 적지 않음** (매년 SSA/IRS).
- W-2 는 고용 소득. 1099 와 섞지 말 것.
- SAP HCM / SuccessFactors / 외부 payroll. T-code **PA30**. 미국 전용 드라이버 이름 **확인 필요**.

---

## 5. 은행 & 결제

- ACH (NACHA), Fedwire, CHIPS.
- SAP **DMEE** / Payment Medium. NACHA 파일 레이아웃은 버전(CCD/PPD 등) 확인 필요.
- ABA routing number. 하우스뱅크 ID 하드코딩 금지.

---

## 6. 개인정보 · 업권법

- HIPAA (의료), GLBA (금융), 주법(CCPA/CPRA — California 등).
- 연방 단일 개인정보법은 없음.
- sapstack 세션에 붙이는 증거의 SSN/TIN 마스킹은 필수에 가깝다.

---

## 7. SAP 특수 사항

- Country Version US.
- Tax Jurisdiction Code.
- ECC vs S/4: BP, Output Management, Advanced Compliance Reporting 존재 여부는 릴리스에 따름.

---

## 8. SAP 체크리스트 (월/분기/연)

### 월별
- [ ] Sales tax engine 과 SAP 세액 대사 (관할별)
- [ ] F110 / ACH 테스트 런
- [ ] OB52 기간

### 분기별
- [ ] Estimated tax — 금액·기한은 CPA. **확인 필요**
- [ ] SoD 예외 리뷰 (상장사)

### 연간
- [ ] 1099 추출 전 W-9 / TIN 매칭
- [ ] W-2 / 주 원천 파일 — 마감 **확인 필요**
- [ ] SOX ITGC 증적 (변경·접근)

---

## 9. 주요 SAP Note

스텁 기재 번호. **이번 라운드 userapps 재검증 안 함. 인용 전 확인 필요.**

- 14926 — USA localization general
- 1175458 — Tax engine integration (Vertex)
- 2517488 — 1099 reporting

새 번호 없음.

---

## 10. 자주 묻는 질문 (FAQ)

**Q. 연방 세금코드 하나에 10% 를 박으면 되나요?**
A. 안 됩니다. 미국은 주·시 jurisdiction 이 핵심입니다.

**Q. 1099 임계 $600 을 모든 박스에 적용하나요?**
A. 해당 세무연도 IRS 지시서를 보세요. 여기서 단정하지 않습니다.

**Q. SOX 때문에 SE16N 수정이 허용되나요?**
A. 프로덕션 데이터 편집은 sapstack 규칙상 금지입니다.

---

## 참고 자료

- IRS.gov — 1099, Publication 15
- PCAOB / SEC — SOX
- sapstack: 회사코드·관할 코드 하드코딩 금지 (ETHOS ③)

**Last Updated**: 2026-08-16  
**Status**: Grok draft — native EN-US 검수 전
