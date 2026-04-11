# 시나리오 4 — Business Partner 마이그레이션 오류

## 🎬 상황
ECC 6.0 → S/4HANA 2023 Brownfield 변환 중 **Customer/Vendor → Business Partner 통합**에서 실패. 기존 고객 마스터 일부가 BP로 변환되지 않음.

## 💬 사용자 질문
```
CVI(Customer-Vendor Integration) 과정에서 일부 고객이 BP로 안 넘어갑니다.
특히 한국 법인 고객 중 사업자등록번호가 있는 건들이 문제예요.
```

## 🤖 추천 위임
```
/sap-s4-readiness --brownfield
```
또는 `sap-s4-migration-advisor` 에이전트에 직접 위임.

### 체계적 분석

```markdown
## 🎯 Recommendation
Brownfield 중 CVI 오류 — 근본 원인 분석 후 데이터 클렌징 선행 필요

## 📊 Readiness Assessment
- 커스텀 코드: Customer 관련 Z-테이블 확인 필요
- 데이터 품질: **문제 영역** — 사업자등록번호 필드 일관성
- 한국 Localization: **CVI KR 특수** — 한국 세법 필드 매핑

## ⚠️ Top 5 Risks
1. **KNA1-STCD1 (사업자등록번호)** 필드 길이/형식 불일치
2. **여러 역할** (Customer + Vendor + Creditor) 동시 통합 시 중복
3. **Address 필드** 한글 인코딩 (Unicode 전환 미완료)
4. **KNB1-FDGRV (공정거래 그룹)** 매핑 누락
5. **Bank Details (LFBK)** 한국 은행 코드 변환

## 🛠 Fix — 단계별

### Phase 1: 데이터 프로파일링
1. **BP Migration Report 실행**:
   - `CVI_MIG_MASTER` — 마스터 레벨
   - `CVI_MAPPING_ERROR` — 매핑 오류 상세
2. **SE16N → KNA1**: 문제 고객 확인 (**읽기만**)
3. 사업자등록번호 형식 검증:
   - Regex: `^[0-9]{3}-[0-9]{2}-[0-9]{5}$` 또는 `^[0-9]{10}$`

### Phase 2: 매핑 규칙 조정
1. **CVI Customizing**:
   - BP Role mapping (BUP001, BUP002, FLCU00, FLVN00)
   - Number range 통합
   - Field mapping table (CVI_VCMAP 등)
2. 한국 특수 필드 매핑 규칙:
   - KNA1.STCD1 → BUT000.TAXNUM1 (사업자등록번호)
   - KNA1.STCD2 → BUT000.TAXNUM2 (주민번호 — 마스킹 필수)

### Phase 3: 데이터 클렌징
1. 프로파일링에서 발견한 문제 데이터 수정
2. **DEV 시스템에서 먼저** — 운영 수정 금지
3. 고객/벤더 데이터 중복 제거

### Phase 4: 재실행
1. **CVI_MIG_MASTER** 재실행
2. Error log 재검토
3. 단계별 roll-forward

## 🛣 Phase Plan (Brownfield 변환 전체)
- **Phase 1 (준비, 2~3개월)**: Readiness Check, ATC, BP 사전 변환
- **Phase 2 (전환, 1~2개월)**: SUM 실행, DB 업그레이드
- **Phase 3 (안정화, 1~2개월)**: UAT, 성능 튜닝, 사용자 교육

## 📖 관련 Simplification Items
- **BP Migration Strategy** — BP 통합은 S/4HANA 필수 변경
- **Customer-Vendor Integration** — SAP Note 2265093 참조

## 📖 SAP Note (data/sap-notes.yaml)
- **2265093** — Business Partner Conversion and Integration
- **2185390** — CVI S/4HANA Migration
- **3092819** — Country Version Korea Localization Roadmap
```

## 📚 배운 것
- **한국 특수 필드**는 별도 매핑 규칙 필요 (사업자등록번호, 주민번호)
- **개인정보 마스킹** — 주민번호는 추가 보호
- **Data quality가 migration 성공의 80%** — 기술 이슈 이전에 데이터 정제
- **4 Phase 접근** — 준비·전환·안정화·운영

## 🔗 관련
- `/agents/sap-s4-migration-advisor.md` — 마이그레이션 어드바이저
- `/commands/sap-s4-readiness.md` — 평가 파이프라인
- `plugins/sap-s4-migration/skills/sap-s4-migration/SKILL.md`
