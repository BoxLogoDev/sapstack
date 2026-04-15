# CVI DE: 독일 (Germany) 로컬라이제이션

## 개요

| 항목 | 값 |
|------|-----|
| **CVI 코드** | DE |
| **SAP 활성화** | T코드: SFW5 → SWITCH → DE 활성화 |
| **회계기준** | HGB (Handelsgesetzbuch, 독일 상법) 또는 IFRS (상장사) |
| **회계연도** | 1월 1일 ~ 12월 31일 (표준, 자유 변경 가능) |
| **기본 통화** | EUR (유로) |
| **세무 신고** | 연간 (5월 31일까지) |
| **VAT 신고** | 월간 또는 분기별 (선택) |
| **감시 규정** | GoBD (Digital Tax Records), DSGVO (GDPR), 전자 서명 의무 |
| **직원 급여** | 월 1회 (법정 최소) |

---

## 1. 회계 기준 & 폐쇄

### 1.1 회계연도 설정
```
SAP 메뉴 → 재무 관리 (FI) → 기본 데이터 → 회기 설정
T코드: OKP1 (회기 생성) → 회계연도 정의
```

**독일 표준**:
- 회계연도: 자유 선택 (대부분 1월 1일 ~ 12월 31일)
- 폐쇄 시점: 12월 31일 (또는 분기별)
- 세무 신고: 매년 5월 31일까지 (ELSTER 제출)

**제출 기한**:
```
회계 보고서 (Jahresabschluss): 5월 31일
VAT 신고 (Umsatzsteuererklärung): 월간 또는 분기별
사회보험료 신고: 월 28일까지
```

### 1.2 HGB vs IFRS

| 항목 | HGB (독일 상법) | IFRS (국제 회계) |
|------|-----------------|-----------------|
| **대상** | 비상장 중소기업 | 상장사·대형 그룹 |
| **재고평가** | 선입선출법/평균법/후입선출법 | 평균법/선입선출법만 |
| **감가상각** | 정액법·정률법 자유 | 정액법 기본 |
| **예비금** | 강제 (재산 보유) | 유연 |
| **SAP 설정** | IMG → FI → Valuation → HGB Rules | IMG → FI → Valuation → IFRS |

**SAP 구성**:
```
T코드: OBD1 (평가 방법)
T코드: OBALLOC (충당금 설정)
```

---

## 2. VAT (부가가치세, Umsatzsteuer)

### 2.1 세율 분류

| 세율 | 독일명 | 해당 거래 |
|------|--------|---------|
| **19%** | 정상세율 | 대부분 재화/용역 |
| **7%** | 경감세율 | 식품, 도서, 신문, 의약품 |
| **0%** | 영세율 | EU 내 거래, 수출 |
| **면세** | 면세 거래 | 금융, 보험, 의료, 교육, 부동산 임대 |

### 2.2 SAP VAT 구성

```
T코드: FTXP (세금 코드 정의)
  - 세금 코드 1: VAT 19% (수입세액)
  - 세금 코드 2: VAT 19% (산출세액)
  - 세금 코드 3: VAT 7% (경감, 식품)
  - 세금 코드 4: VAT 0% (영세율, 수출)
  - 세금 코드 5: 면세 (금융거래)

T코드: OBCL (세금 계산 절차)
```

### 2.3 VAT 신고 (Umsatzsteuererklärung)

**신고 기간 선택**:
- **월간**: 매월 10일까지 신고 (매출 높은 기업)
- **분기별**: 4월 10일, 7월 10일, 10월 10일, 1월 10일 (소규모 기업)

**신고 방법**:
```
1. SAP에서 VAT 보고서 생성 (T코드: VOFI)
2. 독일 세무청(Finanzbehörde) 제출
   - 온라인: ELSTER 시스템 (Elektronische Steuererklärung)
   - 서명: 세무 컨설턴트 또는 법인 서명

3. 환급 처리 (음수 VAT)
   - 수출 많은 기업: 월간 환급 신청
   - 승인 후 5~10일 내 입금
```

**SAP 보고서**:
```
T코드: VOFI (부가세 신고 보조)
또는
T코드: FB51 (VAT 조회)
```

**역 청구 (Reverse Charge)**:
- EU 내 사업자 간 거래: 매수자(구매처)가 VAT 납부
- SAP 설정: T코드: FTXP → 역 청구 코드 (예: RV)

**SAP Note**: **2245808** (German VAT Reporting)

---

## 3. GoBD (Digital Tax Records)

### 3.1 개요
**Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff** 

→ **핵심**: 모든 세무 기록은 **디지털로 보관**되어야 하며, 세무청의 접근 권한 보장 필수

### 3.2 GoBD 요구사항

| 항목 | 요구사항 |
|------|---------|
| **원본성** (Authentizität) | 기록 변경 불가, 타임스탬프 필수 |
| **무결성** (Integrität) | 암호 서명 (RSA) 또는 해시 필수 |
| **가독성** (Lesbarkeit) | 독일어로 저장된 형식 (SAP 표준) |
| **접근성** (Zugriffsicherheit) | 세무청 5년 내 열람 가능 |
| **보관기간** | 10년 (거래 기록), 6년 (청구서/송장) |

### 3.3 SAP GoBD 대응

**1. 거래 기록 보호**:
```
T코드: ZLOG (변경 로그)
  - 모든 거래: 생성일시 + 작업자 ID + 변경내용 기록
  - 수정/삭제: 원본 유지 + 변경 이력 표시

SAP 기본 설정:
  → FI 모듈: 자동 변경 내역 저장
  → 삭제 금지: "마킹 삭제" (논리적 삭제) 사용
```

**2. 송장/청구서 원본성**:
```
T코드: CV01N (전자 문서 보관)
  - 모든 송장/청구서: PDF + 메타데이터
  - 보관: WORM (Write Once Read Many) 저장소
  - 검증: 디지털 서명 (인증서) 포함

Module: SAP DMS (Document Management System)
```

**3. 감사 추적 (Audit Trail)**:
```
T코드: SE01 (Change Request 추적)
  - 모든 코드 변경: CAB 승인 + 일자 기록
  - 프로그램 수정: 버전 관리 + 변경자 ID

SAP 표준:
  → 모든 거래는 고유 ID (예: Document Number)로 추적 가능
```

**4. 세무청 데이터 접근 (TAO - Tax Audit Office)**:
```
T코드: AUCRT (감사 추적 설정)
  - 세무청의 Data Access Tool (DAT) 요청 대응
  - 거래 데이터 제출 형식: XML 또는 CSV
  - 응답 기한: 30일 이내

SAP BW 또는 AO (Analytics Cloud)
  → 거래 데이터 추출 + 익명화 처리
```

**SAP Note**: **2903362** (SAP & GoBD Compliance)

---

## 4. 전자 서명 & 보안

### 4.1 독일 전자 서명 법 (eIDAS Verordnung)

**요구사항**:
- **청구서**: 특별한 예외 제외하고 **eIDAS 기반 전자 서명** 또는 Advanced Electronic Signature (AdES) 필수
- **세무 기록**: 적격 전자 서명 (Qualified Electronic Signature, QES)

### 4.2 SAP 전자 서명 설정

```
T코드: PU02 (전자 서명 인증서)
  - 인증서: German Federal Authority (BSI) 인증 필수
  - 알고리즘: RSA 2048-bit 이상

SAP 기본:
  → 청구서 생성 시 자동 서명
  → 타임스탐프: 신뢰할 수 있는 TSA (Time Stamping Authority) 사용
```

**SAP Note**: **3001462** (eIDAS Signatures in SAP)

---

## 5. SEPA (통합 유로 결제) 표준

### 5.1 SEPA 표준 형식

| 형식 | 용도 | 상태 |
|------|------|------|
| **SEPA Credit Transfer** (SCT) | 송금 지시 | 필수 (2014년부터) |
| **SEPA Direct Debit** (SDD) | 직불 (자동 회수) | 권장 |
| **SEPA Card Clearing** | 카드 거래 | 권장 |

### 5.2 ISO 20022 XML 형식

**SAP에서 SEPA 파일 생성**:
```
T코드: F110 (자동 지급 운영)
  → 파일 생성 형식:
    1. pain.001.003.08 (ISO 20022, 구식)
    2. pain.001.008.10 (ISO 20022, 신규 권장)
    3. MT101 (구식, 폐지 예정)
```

**SEPA 파일 구성**:
```
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.008.10">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>20260415-001</MsgId>
      <CreDtTm>2026-04-15T14:00:00</CreDtTm>
      <InitgPty>
        <Nm>SAP Company KG</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>20260415-P001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <CdtTrfTxInf>
        <!-- 개별 거래 -->
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>
```

**SAP 설정**:
```
T코드: FBZP (파일 변형)
  - 통화: EUR (반드시 확인)
  - IBAN: 국제 표준 (예: DE89370400440532013000)
  - BIC: Swift Code (예: COBADEDDXXX)
  - 수취인: IBAN + 이름 (영문 또는 독일어)
```

**SAP Note**: **2291816** (SEPA & ISO 20022 in SAP)

---

## 6. DATEV 연계

### 6.1 DATEV 개요
**DATEV eG**: 독일 세무사/회계사 협회가 운영하는 회계 데이터 표준

- **사용자**: 독일의 중소기업 대부분
- **용도**: SAP → 세무사의 회계 소프트웨어로 자동 전송
- **형식**: ASCII 형식 (고정 길이) 또는 XML

### 6.2 SAP → DATEV 연계

```
1. SAP에서 월별 거래 데이터 추출
   T코드: FB51 (일반장부)
   T코드: FB52 (채권/채무 장부)

2. DATEV 형식으로 변환
   T코드: AULDB (DATEV 내보내기)
   - 파일명: EXTF_MMYYYY.txt (예: EXTF_042026.txt)
   - 형식: DATEV Format Standard (고정 길이)

3. 세무사 회계 소프트웨어(예: DATEV Rechnungswesen)로 Import
   - 자동 거래 인식 및 검증
```

**DATEV 파일 구조**:
```
0,Beleg,Datum,Konto,Gegenkonto,Betrag,...
1,2,20260415,1000,7000,1000.00,...  # 매출
1,3,20260415,1200,4000,500.00,...   # 비용
...
```

**SAP Note**: **2341844** (DATEV Integration)

---

## 7. DSGVO (GDPR) & 개인정보 보호

### 7.1 DSGVO 개요
**Datenschutz-Grundverordnung**: EU 개인정보보호규정

**SAP 맥락**:
- 직원 급여 정보 (민감 정보)
- 고객 거래 정보 (개인사업자의 경우)
- 납품업체 연락처

### 7.2 SAP DSGVO 대응

**1. 접근 권한 제한**:
```
T코드: SUIM (사용자 권한)
  - HR 정보 접근: HR 담당자만
  - 급여 정보: 급여 관리자만
  - 고객 정보: 영업팀만

SAP GRC (Governance, Risk, Compliance)
  → 주기적 권한 감사 (분기별)
```

**2. 데이터 암호화**:
```
T코드: SM06 (암호화 설정)
  - 전송: TLS/SSL (최소 TLS 1.2)
  - 저장: AES-256 암호화 (민감한 필드)
  - 백업: 암호화된 미디어 저장

SAP Transparent Data Encryption (TDE) 권장
```

**3. 데이터 삭제 요청 (Right to Erasure)**:
```
T코드: BAPI_EMPLOYEE_GETDATETIME (퇴직자 정보)
  - 퇴직자 급여 정보: 2년 보관 후 삭제
  - 고객 정보: 계약 종료 후 1년 보관 후 삭제
  - 삭제 로그: 감시 추적으로 기록

Module: SAP HR → Archiving
```

**4. 감시 추적 (Audit Log)**:
```
T코드: ZLOG (변경 로그)
  - 누가, 언제, 어떤 개인정보를 열람했는가 기록
  - 세무청 요청 시 제출 가능해야 함
  - 보관: 최소 3년
```

**SAP Note**: **2988889** (SAP & GDPR Compliance)

---

## 8. 급여 및 사회보험

### 8.1 사회보험 종류

| 보험 | 기여율 (직원) | 기여율 (사업자) | 월 납기 |
|------|---------------|-----------------|--------|
| **Rentenversicherung** (노령) | 9.6% | 9.6% | 28일까지 |
| **Krankenversicherung** (건강) | ~7.3% | ~7.3% | 28일까지 |
| **Pflegeversicherung** (간호) | 1.7% | 1.7% | 28일까지 |
| **Arbeitslosenversicherung** (실업) | 1.3% | 1.3% | 28일까지 |

### 8.2 SAP HCM 급여 모듈 설정

```
T코드: SPRO → IMG → Human Resources → Payroll → [국가 DE]
```

**필수 설정 항목**:

1. **회사별 보험 설정** (T코드: PE03)
   - 사회보험 기여율
   - 세금 공제 설정

2. **급여 규칙** (T코드: PE04)
   - 기본급 (Grundgehalt)
   - 상여금 (Bonus)
   - 휴가 수당

3. **세금 공제** (T코드: PE05)
   - 기본 공제 (Grundfreibetrag) ~ €11,600/년
   - 자녀 공제 (Kinderfreibetrag)
   - 교육비 공제

4. **연금 보험료** (T코드: PE06)
   - 법정 노령 보험 (Rentenversicherung)
   - 임의 추가 보험

**급여 처리 프로세스**:
```
1. 근태 입력 (T코드: PSAB)
   - 결근, 연차, 병가, 육아 휴직

2. 급여 계산 (T코드: HRPC)
   - 기본급 + 수당 - 공제

3. 사회보험료 계산 (자동)
   - 4가지 보험료 계산

4. 세금 계산 (자동)
   - 소득세 (Lohnsteuer)
   - 연대세 (Solidaritätszuschlag, 일부만)
   - 교회세 (Kirchensteuer, 선택)

5. 급여 지급 (T코드: HR_PAY_REGISTER)
   - SEPA 이체

6. 사회보험료 납부 (T코드: F110)
   - 매월 28일까지 Krankenkasse로 납부
```

### 8.3 연차/휴가 관리

**법정 휴가**:
- **연차**: 최소 20일 (5주, 주 5일 기준) / 최소 24일 (연 6주)
- **병가**: 무제한 (의사 진단서 필요)
- **육아 휴직**: 최대 3년 (급여 보조 Elterngeld)
- **산재휴가**: 산재 인정 시 전액 급여 유지

**SAP 설정**:
```
T코드: VTYPE (휴가 유형)
T코드: PT63 (연차 발생 규칙)
```

---

## 9. 세무 신고 및 보고

### 9.1 연간 세무 신고 (Steuererklärung)

**신고 항목**:
1. **Bilanzgewinn** (순이익) - 손익계산서에서
2. **Kapitalertragsteuer** (자본이득세) - 배당/이자 소득
3. **Vorauszahlungen** (선납세금) - 예정 납부액

**신고 기한**: 매년 5월 31일까지 (e-일반 신고)

**SAP 보고서**:
```
T코드: FB01 (회계 보고)
T코드: F.05 (손익계산서)
T코드: F.02 (재정상태)
```

### 9.2 VAT 신고 (Umsatzsteuererklärung)

위의 **섹션 2.3** 참조.

### 9.3 연대세 신고 (Solidaritätszuschlag)

- **세율**: 5.5% (소득세의 5.5%)
- **대상**: 높은 소득자 (€200k 이상)
- **신고**: 소득세와 통합 신고

---

## 10. SAP 체크리스트 (월/분기/연)

### 월별 (매월 15일)
- [ ] 급여 처리 완료 (T코드: HRPC)
- [ ] 사회보험료 지급 (매월 28일까지)
- [ ] VAT 월간 신고 준비 (월간 신고 선택 시)
- [ ] 미수금/미지급금 대사

### 분기별 (분기 마지막 달 10일)
- [ ] VAT 분기 신고 (분기별 신고 선택 시)
- [ ] 분기 재무제표 확정
- [ ] DATEV 데이터 내보내기 (세무사 전달)

### 연간 (12월 20일 ~ 2월 28일)
- [ ] 회계 폐쇄 (결산)
  - T코드: FS00
  - 고정자산 감가상각 완료
  - 미결 거래 정리
- [ ] 세무 신고 준비 (Steuererklärung)
  - 재무제표 확인
  - VAT 조정
  - 자본이득세 정산
- [ ] GoBD 준수 확인
  - 거래 기록 완전성 검증
  - 전자 서명 검증
  - 감사 추적 검토
- [ ] SEPA 결제 기록 정리
- [ ] 현금/재고 실사

---

## 11. 주요 SAP Note

| SAP Note | 제목 | 해당 분야 |
|----------|------|---------|
| **4201** | CVI Activation Guide | CVI 활성화 |
| **2245808** | German VAT Reporting | VAT 신고 |
| **2903362** | SAP & GoBD | 디지털 세무 기록 |
| **3001462** | eIDAS Signatures | 전자 서명 |
| **2291816** | SEPA & ISO 20022 | SEPA 표준 |
| **2341844** | DATEV Integration | 세무사 연계 |
| **2988889** | SAP & GDPR | DSGVO 준수 |
| **1640638** | HCM Payroll DE | 급여·사회보험 |

---

## 12. 자주 묻는 질문 (FAQ)

**Q1. GoBD를 준수하려면 SAP Enterprise Edition이 필수인가?**
A: 아니오. SAP는 Standard Edition도 GoBD 기능을 제공하며, 일반 ERP도 기본 요구사항을 충족할 수 있음. 다만, WORM 저장소 및 디지털 서명을 위해 추가 모듈(DMS, CA) 필요.

**Q2. DATEV 세무사가 아니면 SAP 사용 불가능한가?**
A: 아니오. DATEV는 세무사를 통해 이용하는 옵션일 뿐. SAP 자체로 전체 회계·세무를 관리 가능. 다만, 독일 중소기업 문화상 세무사 활용이 일반적.

**Q3. SEPA 형식 변경(pain.001.003 → pain.001.008)이 필수인가?**
A: 네. 2024년부터 많은 독일 은행이 pain.001.008만 수용. 현재 pain.001.003을 사용 중이면 업그레이드 필수.

**Q4. GoBD 감시 추적을 위해 추가 비용이 드나?**
A: SAP 표준 기능(ZLOG, 변경 로그)은 포함. 고급 감시(ArchiveLink, DMS)는 추가 라이선스 필요. WORM 저장소(외장 디스크/클라우드)는 별도 구축 필요.

**Q5. 원격 근무자 급여(세금 소재)는 어떻게 처리하나?**
A: 근무지(근로자의 거주지)에 따라 세금 공제 달라짐. 예: 독일-오스트리아 원격 근무 → 독일 세금 적용. SAP에서 위치별 세금 규칙 설정 필수.

---

## 참고 자료

- [독일 세무청 (Bundeszentralamt für Steuern)](https://www.bzst.bund.de)
- [GoBD 공식 가이드](https://www.bzst.bund.de/DE/Steuern_National/E_Government/GoBS_GoBD/gobd_node.html)
- [DATEV 연계 가이드](https://www.datev.de)
- [BSI 전자 서명 (eIDAS)](https://www.bsi.bund.de)
- SAP Support Portal → Notes (검색: "DE", "Germany", "GoBD")

---

**마지막 업데이트**: 2026-04-15 | **버전**: v2.1.0
