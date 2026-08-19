# Round 4 EVIDENCE — T-code 백로그 101 + Desktop 문서

커밋하지 않음. `apps/desktop` 미커밋 변경은 미접촉.

## 작업 1 — 판별 결과

| 분류 | N | 처리 |
|------|---|------|
| 등록 (실존 T-code) | 56 | `data/tcodes.yaml` 추가, allowlist 제거 |
| 오탐 | 31 | allowlist 유지 + 한 줄 사유 |
| 확인 필요 | 14 | allowlist 유지 + `확인 필요` 주석. 창작 등록 안 함 |

### 등록 56 (근거 한 줄)

| T-code | 근거 |
|--------|------|
| AL08 | sap-basis SKILL: Users logged on |
| AL11 | sap-basis SKILL: SAP directories / disk |
| AO90 | sap-fi SKILL + tcode-reference: Asset G/L account determination |
| AS01 | sap-fi SKILL: Create asset master |
| AS91 | sap-fi SKILL: Create legacy asset |
| CM21 | sap-pp SKILL: Capacity leveling (interactive) |
| CM50 | sap-pp SKILL: Variable capacity planning |
| CO03 | sap-pp SKILL: Display production order |
| CO13 | sap-pp SKILL: Cancel confirmation |
| CS11 | sap-pp SKILL: BOM explosion multi-level |
| CS14 | sap-pp SKILL: BOM comparison |
| CS15 | sap-pp SKILL: Where-used list |
| F.19 | sap-fi SKILL: Intercompany recon / GR/IR analysis |
| F-90 | sap-fi SKILL: Asset acquisition with vendor |
| FK05 | sap-fi/sap-tr SKILL: Block vendor |
| FLBPD1 | sap-s4-migration SKILL: Vendor → BP (CVI) |
| FLBPD3 | sap-s4-migration SKILL: Customer → BP (CVI) |
| IA06 | 공식 Change General Task List (SKILL "task list status"는 부정확, T-code 자체는 실존) |
| IE10 | 공식 Equipment Usage Period (SKILL "Create Fleet"는 IE31 혼동, T-code 자체는 실존) |
| IW24 | 공식 Create PM Notification (SKILL "list"는 IW28/IW29) |
| KB11N | sap-co SKILL: Manual reposting |
| KB15N | sap-co SKILL: Manual activity allocation |
| KB31N | sap-co SKILL: Statistical key figures |
| KB65 | sap-co SKILL: Indirect activity allocation |
| KE24 | sap-co SKILL: CO-PA line items |
| KE5T | SAP Community + PCA ledger compare (실존). SKILL "profitability segment"는 다소 부정확 |
| KO22 | sap-co SKILL: Internal order budget |
| KO26 | 공식 Change Return (SKILL "supplement"는 KO24) |
| KO8G | sap-co/sap-pm SKILL: Collective settlement |
| KSU1 | sap-co SKILL: Create assessment cycle |
| KSV1 | sap-co SKILL: Create distribution cycle |
| LB03 | sap-wm SKILL + 공식 Display Transfer Requirement |
| LI01 | sap-wm: classic inventory document (LI01N successor already registered) |
| LS01 | 공식 Create Warehouse Master Record (classic; LS01N 이미 등록) |
| MIR7 | Park incoming invoice |
| MR02 | Process blocked invoices |
| OB59 | Define foreign currency valuation methods |
| OBY6 | Company code global parameters |
| OKO7 | sap-co SKILL: Settlement profile |
| OVZ9 | sap-sd SKILL: Availability check control |
| PA03 | sap-hcm SKILL: Payroll control record |
| PC00 | Payroll area menu (명령창 진입 가능) |
| PC00_M01_CALC | sap-hcm SKILL: DE payroll driver |
| PC00_M08_CALC | sap-hcm SKILL: GB payroll driver |
| PC00_M10_CALC | sap-hcm SKILL: US payroll driver |
| PC00_M12_CALC | sap-hcm SKILL: AU payroll driver |
| PC00_M23_CALC | sap-hcm SKILL: JP payroll driver |
| PC00_M26_CALC | sap-hcm SKILL: KR payroll driver |
| QM10 | sap-qm BP: Quality notification list |
| SE18 | sap-abap SKILL: BAdI definition |
| SE19 | sap-abap SKILL: BAdI implementation |
| SE30 | sap-abap SKILL: Runtime analysis (legacy; SAT successor) |
| TM01 | sap-tr SKILL: Money market transaction |
| VF06 | sap-sd SKILL: Collective billing |
| VF44 | sap-sd SKILL: Classic revenue recognition (ecc_only) |
| VL03N | sap-sd SKILL: Display outbound delivery |

### 오탐 31

AL32UTF8(charset), BADI_DEF(유형명), BAPI_EQUI_SET_COUNTER, BAPI_PAYROLL_PROCESS, DB2, F1(도움말), F2/F5/F8(빌링 문서유형), GATE_ASSIGN(/SCWM/ 접두 탈락), IT0000/IT0009/IT0027/IT2001(인포타입), LFB1-AKONT/LFB1-ZWELS(테이블-필드), NLS_LANG, PC00_M(접두만), PI_CREATE(/SCWM/), POOR_MAINTENANCE(카탈로그), PUMP-001(예시 ID), QA11-13/QP01-03(범위), RAALTD01(프로그램), RP_HRSFEC_PAY_OAUTH_CONFIG(리포트), SAP_S4HANA_CLOUD(URL 토큰), TP4(tp 버전), TRAD1(/SCWM/), UTF-8/UTF-16, ZONE_RES(/SCWM/).

### 확인 필요 14 (창작 등록 금지)

CM99, FX10, KO8K, LB05, LI07, LS12, LS13, LS17, LS19, OB8B, OKT2(KOT2 오타 가능), SSF00, TM_HEDGE, TPM_FC_EXPOSURE.

### 추가 재검증

| 항목 | 판정 |
|------|------|
| IW65 name `Display Activities (PM Notification List)` | **맞음.** 공식은 Display Activities / Notification List of Activities. SKILL이 IW65를 Measurement Documents로 쓴 것은 IK17 혼동. 이름은 유지. |
| V/06 `Maintain Pricing Condition Types` | **맞음.** SD condition types. |
| CM01 `Capacity Planning — Work Center Load` | **맞음.** PP capacity planning. |

### Strict 게이트 로그

```
./scripts/check-tcodes.sh --strict
확정 T-code: 472개
미등록 (unique): 0건
exit 0

./scripts/check-eval-goldset.sh --strict
gold-set case: 90건
알려진 symptom: 90개 / T-code: 499개
오류: 0건 / 경고: 0건
✅ gold-set 참조 무결성 OK
exit 0
```

gold-set.yaml은 열람하지 않음 (금지).

## 작업 2~4 — 문서

변경 파일:

- `README.md`, `README.en.md`, `README.zh.md`, `README.ja.md`, `README.de.md`, `README.vi.md` — `### 🖥 Desktop` + 빠른 시작 Desktop 항목. stats 주석 미변경.
- `docs/desktop-install.md` 신설
- `docs/compliance/air-gapped-deployment.md` — Desktop 폐쇄망 섹션, "로컬 모델 예정" FAQ를 사실 목록으로 교체

`./scripts/check-translation-parity.sh --strict`: 대상은 plugins 모듈 quick-guide 24×5=120. **README는 parity 대상 아님.** 오류 0 / 경고 0.

사실 대조에서 제거한 문장: **1** (desktop-install 초안의 8B "권장하지 않는다" 단정 → 사실 목록대로 "장비 성능에 따라 선택"만 남김). 목록 밖 동작·수치 창작 0.
