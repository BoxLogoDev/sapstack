---
description: SAP FI 월결산/연결산 체크리스트를 단계별로 실행. 환경 확인 → OB52 기간 전환 → GR/IR 청소 → 외화평가 → 자산 감가상각 → 결산 전표 생성 → 재무제표 검증 순서로 진행.
argument-hint: [월결산|연결산] [회사코드]
---

# SAP FI 결산 체크리스트 실행

입력: `$ARGUMENTS`

## 🎯 목표
SAP FI 모듈의 월결산 또는 연결산 체크리스트를 단계별로 안내하며, 각 단계에서 사용자에게 확인 질문을 던지고, 검증이 완료된 단계만 다음으로 진행합니다.

## 🔒 안전 규칙
- 모든 단계는 **시뮬레이션(Test Run) 먼저** 안내
- 실제 포스팅 T-code 전에는 사용자의 명시적 확인 요청
- 회사코드·기간 값은 사용자가 제공 — 추정 금지

## 📋 체크리스트

### Phase 1 — 환경 확인
1. 사용자에게 다음을 질문:
   - SAP 릴리스 (ECC / S/4HANA 연도)
   - 결산 유형 (월결산 / 연결산 / 중간결산)
   - 회사코드 (BUKRS)
   - 대상 기간 (회계연도/기간)
   - 통화 (현지통화/Group Currency 여부)
2. K-IFRS 기준 여부 확인 (한국 상장사 필수)

### Phase 2 — 기간 제어
- **OB52**: 기간 오픈 상태 확인 (`+` 권한 범위, 변경 이력)
- **FB02**: 전표 입력 마감 예정일 공지
- **S_ALR_87012301**: 미처리 전표 조회
- 체크: 전월 기간이 닫혀 있는지? (한국 월결산은 엄격)

### Phase 3 — Sub-Ledger 마감 (우선순위 순)
#### 3-1. AP (채무)
- **F110**: 지급실행 완료 확인
- **F.13 (운영은 FAGLF103)**: GR/IR 청소 — 반드시 Test Run 먼저
- **MR11**: GR/IR 잔액 정리 (MM과 협의)
- 체크: F-44 수동 청소 필요 건

#### 3-2. AR (채권)
- **F150**: 독촉 발송 상태
- **FBL5N**: 고객 Open Item 조회
- **F-32**: 수동 청소 필요 건

#### 3-3. AA (자산)
- **AFAB**: 감가상각 계산 — **Test Run 필수**
- **AJAB**: 연말 마감 (연결산 전용)
- **S_ALR_87011963**: 자산 Balance 검증
- 체크: 자본화 대기 AuC(건설 중 자산)

### Phase 4 — 외화평가 및 재분류
- **FAGL_FC_VAL**: 외화평가 — 환율일자 확인
- **F-05** (ECC): Reclass 전표 (S/4는 자동)
- **FBB1**: 수동 조정 전표
- 체크: KRW 기준 잔액 차이

### Phase 5 — GL Close
- **FAGLGVTR**: 잔액 이월 (연결산)
- **F.16**: 이익 잉여금 이관
- **FAGLB03**: GL Balance 조회
- **S_PL0_86000030**: 재무제표 Preview

### Phase 6 — 검증
1. **F.01**: 재무상태표 vs **F.08**: 손익계산서 일치 확인
2. 전기 대비 증감 분석 (비정상 증감 flag)
3. Inter-company 일치 (여러 회사코드)
4. K-IFRS 공시용 주석 사전 검증

### Phase 7 — 감사 흔적
- **SM21**: System Log 이상 여부
- **S_ALR_87012276**: Audit Trail Report
- K-SOX 요구사항 — 결산 담당자 ≠ 승인자 로그

## 📤 출력 형식

각 단계 완료 시 다음을 출력합니다:
```
✅ Phase N 완료
- 수행: (T-code와 결과)
- 이슈: (있다면)
- 다음 단계 진행할까요? (yes/no)
```

## 📖 참조
- `plugins/sap-fi/skills/sap-fi/SKILL.md`
- `plugins/sap-fi/skills/sap-fi/references/closing-checklist.md`
- `agents/sap-fi-consultant.md` — 복잡한 이슈 발생 시 위임
