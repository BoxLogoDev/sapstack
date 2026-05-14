# CVI {COUNTRY_NAME} — Country Version {ISO_CODE}

> 신규 국가 추가 템플릿. country/{country}.md 형식으로 복사 후 placeholder 채워서 사용.
>
> 사용법:
> ```bash
> cp country/templates/cvi-template.md country/newcountry.md
> # 그 후 {PLACEHOLDER} 값을 실제 값으로 치환
> ```

## 1. 국가 정보

| 항목 | 값 |
|---|---|
| **ISO 2자리 코드** | {ISO_CODE} (예: KR, US, DE) |
| **SAP CVI 활성화 여부** | {YES/NO} |
| **로컬라이제이션 카테고리** | {Full Localization / Partial / Custom Required} |
| **공식 통화** | {CURRENCY_CODE} (예: USD, EUR, KRW) |
| **회계연도 변형** | {FYV} (예: K4 = 1~12월) |
| **공식 언어** | {LANGUAGE_CODE} (예: EN, KO, DE) |

## 2. 법제 및 컴플라이언스 요약

각 국가의 SAP 운영에 영향을 주는 핵심 법제·규제:

### 2.1 세무

- **부가가치세 / Sales Tax**: {VAT_OR_SALES_TAX_NAME}, 표준 세율 {STANDARD_RATE}
- **원천세**: {WITHHOLDING_TAX_DETAILS}
- **법인세**: {CORPORATE_TAX_DETAILS}
- **신고 주기**: 월/분기/연

### 2.2 노무·인사

- **사회보험**: {SOCIAL_INSURANCE_NAMES}
- **소득세 원천징수**: {INCOME_TAX_WITHHOLDING}
- **연차/휴가 법정 기준**: {LEAVE_RULES}

### 2.3 회계·감사

- **회계기준**: {LOCAL_GAAP_OR_IFRS}
- **법정 감사 의무**: {AUDIT_REQUIREMENTS}
- **데이터 보존 의무**: {DATA_RETENTION_YEARS}년

### 2.4 데이터 보호·개인정보

- **법제**: {DATA_PROTECTION_LAW} (예: GDPR, K-PIPA)
- **국경 간 데이터 이전 제약**: {YES/NO}, 조건
- **암호화 의무**: {ENCRYPTION_REQUIREMENTS}

### 2.5 전자 청구·송장

- **E-Invoice 의무화**: {YES/NO}
- **포맷 표준**: {FORMAT} (예: XML/PEPPOL, PDF/A-3)
- **정부 시스템 연동**: {GOVERNMENT_SYSTEM}

## 3. SAP CVI 핵심 컴포넌트

해당 국가에 활성화해야 할 SAP CVI 요소:

### 3.1 Tax & Pricing

- [ ] Tax Procedure: {TAX_PROCEDURE} (예: TAXKR, TAXUSJ)
- [ ] Condition Type 활성화
- [ ] Tax Code 마스터 (예: V0/V1/V2 또는 K1/K2)

### 3.2 Payroll (HCM)

- [ ] Country Grouping: {COUNTRY_GROUPING}
- [ ] Payroll Driver: {PAYROLL_DRIVER} (예: PC00_M41_CALC for Korea)
- [ ] 세금 신고 양식

### 3.3 Bank & Payment

- [ ] DMEE 트리: {DMEE_TREE_NAME}
- [ ] 지급 방법: {PAYMENT_METHODS}
- [ ] 은행 코드 형식: {BANK_CODE_FORMAT}

### 3.4 Logistics

- [ ] 운송 문서 표준
- [ ] 통관 연동 (해당 시): {CUSTOMS_INTEGRATION}

## 4. 운영 체크리스트

### 4.1 월간

- [ ] 부가세 신고 (D-{N}일)
- [ ] 원천세 신고 (D-{N}일)
- [ ] 사회보험 신고 (D-{N}일)

### 4.2 분기간

- [ ] 분기 결산
- [ ] {QUARTERLY_SPECIFIC_ITEMS}

### 4.3 연간

- [ ] 연말정산 (해당 시)
- [ ] 법정 감사 준비
- [ ] {ANNUAL_SPECIFIC_ITEMS}

## 5. 한국 운영자/컨설턴트용 한국어 노트

이 국가의 SAP 운영을 한국 본사에서 모니터링·지원할 때 주의할 점:

- **시차**: 한국 KST 대비 {TIME_DIFFERENCE}
- **언어**: 공식 문서는 {OFFICIAL_LANG}, 비공식 커뮤니케이션은 영어 OK 여부
- **현지 컨설턴트 접점**: {LOCAL_CONSULTANT_CONTACT}
- **공식 휴일** (시스템 cutover 회피): {KEY_HOLIDAYS}

## 6. 관련 SAP Note 및 외부 참조

- **SAP Note (마스터)**: {SAP_NOTE_NUMBERS}
- **공식 법제 사이트**: {OFFICIAL_GOVT_URL}
- **현지 회계기준 가이드**: {LOCAL_GAAP_URL}

## 7. 변경 이력

| 날짜 | 작성자 | 변경 |
|---|---|---|
| YYYY-MM-DD | {AUTHOR} | 초기 작성 |

---

**Note**: 이 템플릿은 sapstack `country/` 디렉토리에 신규 국가 CVI 가이드를 추가할 때 일관된 구조를 보장하기 위해 마련되었습니다. 필요한 섹션이 더 있으면 PR로 템플릿 자체를 확장해주세요.
