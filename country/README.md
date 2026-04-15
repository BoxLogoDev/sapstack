# SAP 국가별 로컬라이제이션 (CVI - Country Version)

## 디렉토리 목적

**country/** 는 각 국가의 SAP 로컬라이제이션 요구사항을 **한 곳에 집중 정리**하는 허브입니다. 

SAP는 각 국가의 회계법, 세무법, 노동법, 데이터 보호 규정을 반영하여 **Country Version (CVI)** 를 제공합니다. 이 디렉토리는:

- **SAP CVI 개념** 설명 및 활성화 방법
- **국가별 핵심 규정** 정리 (세무·회계·노동·규제)
- **SAP 구성 차이점** (FI/CO/HCM/PM 등 모듈별)
- **운영자 가이드** (월/분기/연간 마감 체크리스트)
- **준법 감시 체크리스트** (감사 대비)

---

## SAP CVI (Country Version) 개념

### 정의
SAP는 **100+ 국가** 의 법제를 반영한 "국가 버전"을 제공합니다. 각 CVI는:

| 요소 | 설명 |
|------|------|
| **회계 기준** | 회계연도, 회기 폐쇄일정, 보고 통화 |
| **세무 규정** | VAT/GST 세율, 세금계산서 서식, 신고 기한, 원천세 |
| **노동법** | 4대보험, 휴가제도, 급여 규칙, 퇴직금 |
| **규제 기준** | 감사 추적, 자료 보관, 전자 서명, 망분리 |
| **통화/환율** | 기본 통화, 환율 소수점, 금액 반올림 규칙 |
| **보고 양식** | 재무제표, 세무신고, 사회보험신고 |

### 활성화 방법
```
SAP 메뉴 → 시스템 설정 → 일반 설정 → 국가 설정
또는
T코드: SFW5 (Switch Framework 활성화)
T코드: SPRO → IMG → Localization → [Country Code]
```

SAP Note: **4201** (CVI Activation Guide)

---

## sapstack 지원 국가 & 우선순위

### Tier 1: 풀 지원 (완전 문서화)
| 국가 | CVI | 주요 특징 | 지원도 |
|------|-----|---------|-------|
| **🇰🇷 한국** | KR | 부가세·원천세·4대보험·K-SOX·망분리 | ⭐⭐⭐⭐⭐ |
| **🇩🇪 독일** | DE | GoBD·DATEV·SEPA·DSGVO | ⭐⭐⭐⭐⭐ |
| **🇯🇵 일본** | JP | 소비세·i-Bocho·인지세·회계연도 | ⭐⭐⭐⭐ |

### Tier 2: 부분 지원 (핵심만)
| 국가 | CVI | 주요 특징 | 지원도 |
|------|-----|---------|-------|
| **🇨🇳 중국** | CN | 증치세·Golden Tax·SAFE·社保 | ⭐⭐⭐ |
| **🇻🇳 베트남** | VN | VAT·PIT·GDT·사회보험 | ⭐⭐⭐ |
| **🇺🇸 미국** | US | Sales Tax·1099·SOX·ACH | ⭐⭐⭐ |

### Tier 3: 계획 중 (이 분기)
- 🇸🇬 Singapore (SG)
- 🇹🇭 Thailand (TH)
- 🇵🇭 Philippines (PH)
- 🇲🇾 Malaysia (MY)

---

## 파일 구조

```
country/
├── README.md                 ← 이 파일
├── korea.md                  ← CVI KR (한국 회계·세무·노동)
├── germany.md                ← CVI DE (독일 GoBD·SEPA)
├── japan.md                  ← CVI JP (일본 소비세·i-Bocho)
├── china.md                  ← CVI CN (중국 증치세·Golden Tax)
├── vietnam.md                ← CVI VN (베트남 VAT·GDT)
├── usa.md                    ← CVI US (미국 Sales Tax·1099)
└── templates/
    ├── cvi-template.md       ← 신규 국가 추가 템플릿
    └── compliance-checklist.md ← 월/분기/연간 감사 체크리스트
```

---

## 신규 국가 추가 가이드

### Step 1: 템플릿 복사
```bash
cp country/templates/cvi-template.md country/newcountry.md
```

### Step 2: 핵심 요소 작성 (필수)
1. **회계 기준** — 회계연도, 폐쇄일정, 통화
2. **세무 규정** — VAT/GST, 세금계산서, 신고 기한
3. **노동법** — 4대보험/사회보험, 급여 규칙
4. **감시 기준** — 감사 추적, 자료 보관 기간, 전자 서명
5. **SAP 구성** — SPRO 경로, 필수 설정, 주의사항
6. **SAP Note** — 국가별 주요 SAP Note 5개

### Step 3: 검증
- [ ] 정부 공식 가이드 확인 (국세청·노무청·통계청 등)
- [ ] SAP Support Portal에서 SAP Note 검색
- [ ] 현지 컨설턴트·감사인 검토 권유
- [ ] 기업 규모별 요구사항 차이 주석 추가

### Step 4: README에 추가
```markdown
| 🇳🇰 New Country | NK | 주요 특징 | ⭐⭐⭐ |
```

---

## 자주 묻는 질문 (FAQ)

### Q1. CVI 활성화 후 변경 불가능한가?
**A**: 아니오. 하지만 회계연도 변경 시 새로운 회기 시작 시점에만 변경 권장 (연중 변경 시 감사 복잡성 증대).

### Q2. 다국적 기업(Multi-country)은 어떻게?
**A**: SAP는 각 법인별로 **별도 Company Code 할당** 후 각각 다른 CVI 적용. 통합 보고는 **BPC (Business Planning & Consolidation)** 또는 **S/4 Consolidation Module** 사용.

### Q3. 클라우드 버전(S/4HANA Cloud PE)도 CVI 적용?
**A**: 네, S/4HANA Cloud PE도 CVI를 지원하며 SaaS 특성상 **자동 업데이트**로 법제 변경 신속 반영.

### Q4. SAP Note는 어디서 찾나?
**A**: [SAP Support Portal](https://support.sap.com) → Notes → 국가 코드(KR, DE, JP 등) + 키워드(예: "VAT", "소비세")

---

## 참고 자료

- [SAP Localization Hub](https://launchpad.support.sap.com/#/notes/0002181062) (SAP Note 2181062)
- [SAP FI Localization Guide](https://help.sap.com/docs/SAP_S4HANA_OP/25c4a0e5f8a24e5db90fffee9f2e7f09/440cf3c0f9db4f52a3a60b8db2f4f7a4.html)
- [SAP HCM Payroll Localization](https://help.sap.com/docs/SAP_HCM)
- 정부 공식 사이트 (각 country/*.md에서 참조)

---

## 버전 히스토리

| 버전 | 날짜 | 변경 |
|------|------|------|
| v2.1.0 | 2026-04-15 | 초기 릴리스: KR, DE, JP, CN, VN, US |
| v2.2.0 | TBD | SG, TH, PH, MY 추가 |

---

## 기여 & 피드백

- 최신 법제 정보: 이슈 등록 또는 PR 제출
- 언어 오류/부정확: 한국/영문/일문 네이티브 검수 환영
- 새로운 국가: [신규 국가 추가 템플릿](templates/cvi-template.md) 참조

**All contributors listed in [CONTRIBUTORS.md](/CONTRIBUTORS.md)**
