---
name: sap-gts
description: >
  This skill handles SAP GTS (Global Trade Services) tasks including export/import
  compliance, Sanctioned Party List screening, license management, customs declaration,
  HS code classification, Letter of Credit, preference determination, and Korea Customs
  Service (UNI-PASS) integration. Use when user mentions GTS, global trade, export,
  import, customs, HS code, commodity code, sanctioned party, SPL, denied party list,
  license, embargo, preference, customs declaration, UNI-PASS, 관세청, 수출입, 수출신고,
  수입신고, HS코드, 통관, 원산지, FTA, Letter of Credit, L/C, sanctioned, trade
  compliance, ICM, embargo check.
allowed-tools: Read, Grep
---

## 1. Environment Intake Checklist

Before answering any GTS question, collect:

- SAP Release (SAP GTS 10.x / 11.0 / S/4HANA for International Trade)
- GTS 배포: Standalone (별도 시스템) / Embedded in S/4 (International Trade)
- Korea Customs Service 연동 여부 (UNI-PASS)
- 거래 유형 (수출 / 수입 / 양방향)
- 규제 범위 (Export Control / Compliance / Customs Management / Risk Management)
- Feeder System (ECC / S/4HANA 연동)

---

## 2. GTS 주요 영역 (Areas)

### 2-1. Compliance Management
- **Sanctioned Party List (SPL) Screening** — 제재 대상자 검색
- **Embargo Check** — 금수조치 국가 검사
- **Legal Control** — 허가·라이선스 필요성 판단

### 2-2. Customs Management
- **Export Declaration** — 수출신고
- **Import Declaration** — 수입신고
- **Transit Procedures** — 통과·환적
- **Special Customs Procedures** — 관세지 유형, 특수 절차

### 2-3. Risk Management
- **Letter of Credit Management** — 신용장 관리
- **Preference Management** — 원산지 결정, FTA
- **Restitution Management** — 수출 환급

### 2-4. Electronic Compliance Reporting
- **Intrastat** (EU 내수)
- **Customs Filing** — 국가별 전자 신고
- **Korea UNI-PASS** — 한국 관세청 연동

---

## 3. Core Transaction Codes (GTS 네임스페이스)

GTS는 `/SAPSLL/` 네임스페이스를 사용합니다.

| T-code | 용도 |
|--------|------|
| `/SAPSLL/MENU_LEGALR3` | GTS Main Menu |
| `/SAPSLL/COMPLR3` | Compliance workbench |
| `/SAPSLL/CUS_CUHD_R3` | Customs document |
| `/SAPSLL/LCLOG` | License log |
| `/SAPSLL/PREF_CUST` | Preference determination |
| `/SAPSLL/PRODUCT_R3` | Product master |
| `/SAPSLL/SPL_AUDIT` | SPL audit log |
| `/SAPSLL/CTSSPLAUD` | SPL screening monitor |
| `/SAPSLL/MENU_LEGALSPL` | SPL configuration |

---

## 4. Sanctioned Party List (SPL) Screening

### 프로세스
1. Business Partner 생성·변경 → SPL screening 자동 트리거
2. Customs document 생성 시 재검사
3. Match 발견 → **Block** 또는 **Hold for review**

### 설정
- Lists 구독: OFAC (US), EU, UN, 국가별
- **Match criteria**: 이름, 주소, 도시, 국가, 생년월일
- **Fuzzy logic**: phonetic matching (예: Kim vs Gim)

### 한국 현장
- OFAC (미국 재무부) 필수 — 대미 수출 시
- **전략물자 수출입 고시** (산업통상자원부) — 한국 자체 리스트
- 한국 기업은 SPL false positive가 많음 (동명이인)

### 주요 T-code
- `/SAPSLL/SPL_AUDIT` — 감사 로그
- `/SAPSLL/CTSSPLAUD` — 실시간 모니터

---

## 5. Customs Management — 수출입 신고

### Export Declaration Flow (수출)
```
Sales Order (VA01) → Delivery (VL01N) → Customs Document (GTS)
                                              │
                                              ▼
                                     Export Declaration
                                              │
                                              ▼
                                     Authority System (UNI-PASS)
                                              │
                                              ▼
                                     Approval → Shipment
```

### Import Declaration Flow (수입)
```
Purchase Order (ME21N) → Inbound Delivery → Customs Document
                                                  │
                                                  ▼
                                         Import Declaration
                                                  │
                                                  ▼
                                         UNI-PASS Submission
                                                  │
                                                  ▼
                                         Approval → Goods Receipt
```

### Customs Document Structure
- Header (신고서 헤더)
- Items (품목 — HS Code, 수량, 가치)
- Partners (수출자, 수입자, 운송인, 관세사)
- Duties (관세, 부가세, 기타 세금)

---

## 6. HS Code (Commodity Code) Classification

### 개념
- **HS = Harmonized System** — WCO 국제 표준
- 한국 **HSK** (Harmonized System Korea) — 10자리
- 국제 표준 6자리 + 한국 고유 4자리

### 설정
- **Product Master**: 각 자재에 HS Code 연계
- **Classification Tool**: 자동 분류 지원
- **Validity Period**: HS Code 주기적 업데이트 (매 5년 WCO 개정)

### 한국 특화
- **관세청 HSK 조회** API
- 세번 분류 — 복잡한 케이스는 **관세사 자문**
- 잘못된 HS Code = 관세 추징 + 가산세

---

## 7. License / Permit Management

### License Types
- **Export License**: 수출 허가
- **Import License**: 수입 허가
- **General License**: 일반
- **Specific License**: 특정 거래 전용

### 한국 현장
- **전략물자 수출허가** — 산업통상자원부
- **원자력 수출허가** — 원자력안전위원회
- **방위산업 수출허가** — 방위사업청
- **마약·독극물** — 식약처
- License 관리는 **KOSTI** (한국전략물자관리원) 연동

### GTS 설정
- License type definition
- Validity period
- Quantity/value limits
- Usage tracking

---

## 8. Preference / Free Trade Agreement (FTA)

### FTA 원산지 결정
- 한국은 50+ FTA 체결
- **한-미 FTA**, **한-EU FTA**, **한-중 FTA**, **RCEP**
- 원산지 증명서 (C/O) 발급
- **Preference determination** 엔진 활용

### Rules of Origin
- **Wholly obtained**: 완전 생산
- **Substantial transformation**: 실질적 변형
- **Value added**: 부가가치 기준
- **Change of tariff heading**: 세번 변경

### 한국 현장
- 품목별 원산지 기준 복잡
- FTA별 다른 원산지 증명 형식
- EUR.1 (EU), KORUS (미국), RCEP 등

---

## 9. Korea UNI-PASS 연동

### UNI-PASS (한국 관세청 전자통관 시스템)
- 한국 관세청이 운영하는 전자 통관 플랫폼
- **EDI 메시지 표준** 사용
- **24시간 자동 접수**

### 연동 방식
1. **SAP GTS → UNI-PASS 직접 연동**:
   - EDI 메시지 생성
   - 전자 서명 (공인인증서)
   - HTTP/HTTPS 전송
2. **관세사 시스템 경유**:
   - 3rd-party 관세사 시스템 (Customs Broker)
   - SAP GTS → 관세사 → UNI-PASS
3. **하이브리드**

### 핵심 메시지
- **수출신고서** (Export Declaration)
- **수입신고서** (Import Declaration)
- **적하목록** (Manifest)
- **원산지증명서** (Certificate of Origin)

### 보안
- 공인인증서 필수 (STRUST 등록)
- TLS 1.2+
- 관세청 지정 CA

---

## 10. ECC vs S/4HANA for International Trade

### ECC + GTS (Standalone)
- GTS는 **별도 시스템** (보통 독립 서버)
- ECC ↔ GTS RFC 연동
- Plug-in 필요
- GTS 10.x 주력

### S/4HANA for International Trade (Embedded)
- GTS 기능이 **S/4HANA에 임베디드**
- 별도 시스템 불필요
- 일부 기능 축소, 일부 추가
- S/4HANA 2020+ 권장

### 마이그레이션 고려
- Standalone → Embedded 전환
- 마스터 데이터 이관
- Custom enhancement 재작성
- 테스트 필수

---

## 11. 한국 특화 리스크 Top 5

1. **전략물자 수출 허가** — KOSTI 연동 복잡
2. **FTA 원산지** — 한국은 FTA 많고 복잡
3. **전자세금계산서 vs 수출신고** — 별도 프로세스
4. **관세청 UNI-PASS 연동** — 공인인증서, EDI 표준
5. **관세사 의존도** — 한국 현장은 관세사 시스템 경유 많음

---

## 12. Standard Response Format

```
## Issue
(증상 재정의)

## Root Cause
(GTS Compliance / Customs / Risk / Reporting 영역 분류)

## Check (T-code + Table.Field)
1. /SAPSLL/ ... 트랜잭션
2. 관련 configuration

## Fix
(단계별)

## Prevention
(주기적 업데이트, 교육)

## SAP Note
(해당 시)
```

---

## 13. References
- `references/ko/quick-guide.md` — 한국어 퀵가이드
- `references/ko/SKILL-ko.md` — 한국어 전문 가이드
- `references/korea-customs-uni-pass.md` — UNI-PASS 연동 상세
- `/plugins/sap-sd/skills/sap-sd/SKILL.md` — Sales order 연계
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — Purchase order 연계
- `/plugins/sap-fi/skills/sap-fi/SKILL.md` — 관세·부가세 회계
- `/agents/sap-integration-advisor.md` — UNI-PASS 연동 아키텍처
