---
description: 기간마감 전 마스터데이터 완전성 사전검증. 공급업체/고객/자재/장비 마스터의 필수 필드 누락을 진단하고, 마감 차단 리스크를 사전에 식별.
argument-hint: [vendor|customer|material|equipment|all] [회사코드]
---

# SAP 마스터데이터 사전검증

입력: `$ARGUMENTS`

## 목표
기간마감 전에 마스터데이터의 필수 필드 누락, 비활성 마스터, 중복 등록을 사전에 점검하여 마감 시 발생할 수 있는 오류를 예방합니다.

## 안전 규칙
- 마스터데이터 **조회만** 수행 — 변경 권장 시 사용자 확인 필수
- 회사코드·조직 단위 값은 사용자가 제공

## 실행 절차

### Step 1 — 환경 확인
사용자에게 다음을 질문:
- 검증 대상 (vendor / customer / material / equipment / all)
- 회사코드 (BUKRS)
- SAP 릴리스 (ECC / S/4HANA)

### Step 2 — 검증 규칙 로드
`data/master-data-rules.yaml` 참조하여 대상 마스터 유형의 필수 필드 목록 제시.

### Step 3 — 검증 안내
각 마스터 유형별:

#### 공급업체 (Vendor/BP)
- [ ] 통제계정 (LFB1-AKONT) 설정 여부
- [ ] 지급조건 (LFB1-ZTERM) 설정 여부
- [ ] 지급방법 (LFB1-ZWELS) 설정 여부
- [ ] 은행 정보 (LFBK) 등록 여부
- [ ] 사업자등록번호 (한국 필수)
- 조회 T-code: FK03 / XK03 / BP (S/4)

#### 고객 (Customer/BP)
- [ ] 통제계정 (KNB1-AKONT) 설정 여부
- [ ] 판매영역 뷰 (KNVV) 완성 여부
- [ ] 여신한도 (KNKK-KLIMK / UKM) 설정 여부
- 조회 T-code: FD03 / XD03 / BP (S/4)

#### 자재 (Material)
- [ ] 기본단위 (MARA-MEINS) 설정 여부
- [ ] 가격제어 (MBEW-VPRSV) 설정 여부
- [ ] 평가클래스 (MBEW-BKLAS) 설정 여부
- [ ] MRP 유형 (MARC-DISMM) 설정 여부 (생산 자재)
- 조회 T-code: MM03

#### 장비 (Equipment)
- [ ] 원가센터 (EQUI-KOSTL) 할당 여부
- [ ] 기능위치 (EQUI-TPLNR) 할당 여부
- 조회 T-code: IE03

### Step 4 — 결과 보고
검증 결과를 severity별로 분류:
- **Error** (마감 차단): 즉시 수정 필요
- **Warning** (경고): 검토 후 판단

## 위임
- FI 마스터 → sap-fi-consultant
- MM 마스터 → sap-mm-consultant
- SD 마스터 → sap-sd-consultant
- PM 마스터 → sap-pm-analyst

## 참조
- `data/master-data-rules.yaml`
- `docs/best-practices/master-data-governance.md`
