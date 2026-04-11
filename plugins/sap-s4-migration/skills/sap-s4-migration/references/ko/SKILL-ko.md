# SAP S/4HANA Migration 한국어 전문 가이드

> `plugins/sap-s4-migration/skills/sap-s4-migration/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- 현재 ECC 버전 (EhP 레벨) + DB (HANA/Oracle/DB2)
- Kernel 레벨 + Unicode 여부
- 목표 S/4HANA 릴리스 (2022 / 2023 / 2024)
- 배포 모델 (On-Prem / RISE / Public Cloud)
- 커스텀 코드 규모 (객체 수)
- Add-on 및 Industry Solution
- 한국 Localization 의존도
- 예산·일정·허용 다운타임

---

## 2. 3가지 경로 결정 트리

### Q1. 현재 데이터 품질이 양호한가?
- **YES** → Q2로
- **NO** → **Greenfield** 강력 권장 (데이터 클렌징 기회)

### Q2. 비즈니스 프로세스 대대적 재설계 의지?
- **YES** → Greenfield 또는 Selective
- **NO** → Brownfield (System Conversion)

### Q3. 허용 다운타임?
- **48h 이상** → 표준 SUM
- **24h 이내** → DMO + zero-downtime 옵션
- **4h 이내** → Near-Zero Downtime (대형 고객 전용)

### Q4. 커스텀 코드 양?
- ~5,000 objects → Brownfield 현실적
- 5,000~20,000 → ATC + 대대적 정리 필요
- 20,000+ → Greenfield 또는 Selective 검토

---

## 3. 경로별 상세

### Brownfield (System Conversion)
- **도구**: SUM (Software Update Manager) + DMO
- **장점**: 데이터·커스텀·설정 유지, 짧은 기간
- **단점**: 프로세스 재설계 불가, 기술 부채 승계
- **한국 현장**: 삼성·LG·SK 대기업 주력 선택
- **기간**: 6~12개월
- **주요 리스크**:
  - 커스텀 코드 S/4 호환성 (ATC)
  - Simplification Items 영향
  - BP 마이그레이션

### Greenfield (New Implementation)
- **도구**: SAP Activate (Agile), SAP Best Practices
- **장점**: 깨끗한 재시작, 표준 프로세스 활용
- **단점**: 긴 기간, 데이터 이관 복잡
- **한국 현장**: 중견·스타트업·신규 법인
- **기간**: 12~24개월
- **주요 리스크**:
  - 데이터 이관 범위·전략
  - Master data 정제
  - 프로세스 변경 저항

### Selective Data Transition (Bluefield)
- **도구**: SNP CrystalBridge, Datavard, SAP 공식 도구
- **장점**: Brownfield + Greenfield 장점 결합
- **단점**: 복잡도 최대, SI 의존도 높음
- **한국 현장**: 해외법인 단계 전환, 복잡 ERP
- **기간**: 9~18개월
- **주요 리스크**:
  - 범위 정의 어려움
  - 중간 데이터 일치 검증
  - 툴 라이선스 비용

---

## 4. Readiness Check 분석

### 실행
- **`/SDF/RC_START_CHECK`** (on-prem ECC)
- ECC에 설치 → 결과를 S/4로 업로드
- **SAP Cloud ALM / Focused Build** 연동 가능

### 주요 출력
1. **Simplification Items** — 영향받는 항목 리스트
2. **Custom Code Findings** (ATC 연계)
3. **Add-on Compatibility**
4. **SAP Notes to Apply**
5. **Sizing Recommendations**

### 한국 특화 체크
- **CVI KR** — 한국 부가세 계정 구조
- **K-IFRS** — 회계 표준 호환성
- **한국 Localization Add-ons** — 추가 라이선스 검토

---

## 5. Custom Code Migration (ATC)

### 검사 단계
1. **Remote ATC**: S/4HANA dev 시스템에서 ECC 객체 검사
2. **S4HANA_READINESS** variant 사용
3. Priority 1 (Error) — 반드시 수정
4. Priority 2 (Warning) — 권장 수정

### 주요 위반 패턴
- **BSEG direct SELECT** → ACDOCA / I_JournalEntryItem
- **MSEG/MKPF direct SELECT** → MATDOC / I_MaterialDocumentItem
- **KNA1/LFA1 direct access** → Business Partner
- **Deprecated BAPI**
- **Pooled/Cluster 테이블 참조**

### 대응 패턴
```abap
" 나쁜 예 (ECC)
SELECT * FROM bseg WHERE bukrs = 'KR01' ...

" 좋은 예 (S/4)
SELECT * FROM i_journalentryitem WHERE companycode = @lv_bukrs ...
```

### Custom Code 정리 원칙
- **Deletion first** — 쓰지 않는 코드 과감히 삭제
- **Refactoring second** — Clean Core 원칙
- **Replacement last** — 표준 기능 대체

---

## 6. Business Partner Migration (CVI)

### 필수성
- S/4HANA에서 **KNA1/LFA1 → BP 통합 필수**
- 기존 고객·벤더가 BP 레코드로 통합

### 단계
1. **Customizing**: CVI mapping table 설정
2. **Data Cleansing**: 중복 제거, 필드 일관성
3. **Initial Load**: 기존 마스터 → BP
4. **Synchronization**: 실시간 동기화 활성화
5. **Go-live**: BP가 마스터

### 한국 특화 주의
- **KNA1.STCD1** (사업자등록번호) → **BUT000.TAXNUM1**
- **KNA1.STCD2** (주민번호) → 마스킹 + 별도 필드
- **KNB1.FDGRV** (공정거래 그룹) → 매핑 규칙

### Roles
- **BUP001** — 일반
- **BUP002** — Organization
- **FLCU00** — 고객
- **FLVN00** — 벤더
- **FLCU01** — 재무 고객
- **FLVN01** — 재무 벤더

---

## 7. Simplification Items

### 주요 범주
| 범주 | 예 |
|------|-----|
| Removed | Classic Asset Accounting, Classic Credit Management |
| Replaced | BSEG → ACDOCA, FD32 → UKM_BP |
| Changed | Material Number Length 18→40, Material Ledger mandatory |
| Added | Universal Journal, Embedded Analytics |

### 도구
- **Simplification Item Catalog** (SAP Note 2269324)
- **Readiness Check** 결과에서 영향 분석

### 한국 현장 주요 Items
- **Credit Management → FSCM**: FD32/VKM1 사용 커스텀 재작성
- **Business Partner**: 한국 사업자등록번호·주민번호 매핑
- **Asset Accounting**: New AA 전환, 병렬 원장
- **Output Management**: NAST → BRF+

---

## 8. Cutover 계획

### Dry Run
- **최소 2회** 권장 (대기업은 3~4회)
- 실제 운영 데이터 복사본에서 실행
- 시간 측정 (다운타임 확정)
- 오류·이슈 catalog

### Cutover Day
- **Freeze**: 모든 포스팅 중단
- **Backup**: DB + application 백업
- **Execute**: SUM 실행 또는 Greenfield cutover
- **Validate**: 핵심 데이터 샘플 검증
- **Go-live**: 사용자에게 오픈

### 한국 특화
- **연말연시 금지** — 월결산·분기결산 충돌
- **추석·설** 회피
- **8월 중순 or 11월 초** 선호
- **K-SOX** 내부통제 — 감사 통보 필수

---

## 9. Post-Migration 안정화

### 주요 활동
1. **Hypercare 1~3개월**: 24/7 모니터링, 빠른 대응
2. **성능 튜닝**: ATC로 slow queries 식별
3. **사용자 교육**: Fiori UX 전환
4. **Data reconciliation**: ECC → S/4 balance 검증

### 모니터링 도구
- **SM50/SM66**: Work Process
- **ST22**: 덤프 추이
- **ST05**: SQL Trace
- **Fiori App**: S/4HANA Monitoring tiles

---

## 10. 한국 특화 리스크 Top 5

1. **전자세금계산서 연동** — Provider 재통합 필요 (SAP DRC 전환 검토)
2. **CVI KR Simplification** — 한국 부가세 계정 구조
3. **한국 Localization Note** — Country Version Korea 전용 Note 대량
4. **SI 벤더 의존성** — 삼성SDS/LG CNS/SK C&C 가속기
5. **Unicode 변환** — 레거시 non-Unicode ECC 잔존 시 SUMCT 선행

## 11. 자주 참조하는 SAP Note
- **2269324** — Simplification List
- **2313884** — ATC Custom Code Migration Tool
- **2214213** — FI/CO Conversion
- **2265093** — BP Migration
- **2185390** — CVI Migration
- **2270580** — Central Finance
- **2344026** — Universal Journal Field Mapping
- **2500371** — Material Number Length Extension
- **3092819** — Country Version Korea Roadmap

## 12. 관련
- `quick-guide.md` — 퀵가이드
- `../simplification-items.md` — Simplification 상세
- `/agents/sap-s4-migration-advisor.md` — 경로 추천 에이전트
- `/commands/sap-s4-readiness.md` — Readiness 평가 커맨드
- `/plugins/sap-abap/skills/sap-abap/references/ko/SKILL-ko.md` — Custom Code 대응
