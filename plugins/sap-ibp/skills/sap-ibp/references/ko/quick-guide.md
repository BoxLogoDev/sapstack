# sap-ibp 한국어 퀵가이드

> SAP IBP (Integrated Business Planning) — S/4 시대의 클라우드 네이티브 수요/공급 계획 플랫폼. APO 후속.

## 🔑 환경 인테이크

1. **IBP 릴리스** — 2402/2308/2305 등 분기 릴리스
2. **배포** — BTP SaaS only (온프레미스 없음)
3. **모듈** — Demand / S&OP / Supply / Inventory / Response / Control Tower
4. **연동** — S/4HANA → CPI Integration Content, 또는 BW
5. **Excel UI 버전** — 사용자 워크스테이션의 IBP Excel Add-In
6. **Planning Area** — 표준(SAP7, SAPIBP1) 또는 커스텀

## 📚 모듈 개요

| 모듈 | 한국어 표현 | 주 용도 |
|---|---|---|
| **Demand** | 수요계획 | 통계 예측·수요 센싱 (DS) |
| **S&OP** | 영업·운영계획 | 수요/공급/재무 통합 |
| **Supply** | 공급계획 | 다단계 공급망 (heuristic/optimizer) |
| **Inventory** | 재고최적화 | 안전재고·재발주 |
| **Response & Supply** | 응답계획 | ATP·할당·gating |
| **Control Tower** | 통제탑 | KPI·이상감지 |

## 🇰🇷 한국 현장 특화

### 수요 예측 패턴
- **추석/설**: 음력 기반 → 시간 이벤트 마스터에 등록 (Time Event Master)
- **유통기한 단축 품목**: 식품·화장품·반도체 → 짧은 horizon
- **단종/신제품 도입**: Product Lifecycle 명시 (NPI/EOL)
- **프로모션 영향 분리**: 베이스라인 vs 이벤트 lift

### 다중 공장 운영
- 한국 본사 + 베트남/중국 자회사 → 다국가 모델
- **통화**: 한국 KRW + USD 글로벌 환산
- **이전가**: S&OP에 transfer pricing 통합

### 자주 보는 시나리오 예
- "신차/신모델 출시 → 부품 협력사 미리 알림 (PIR 릴리스)"
- "원자재 수입 의존 → 환율 시나리오 분석"
- "납기 단축 요구 → 재고 vs 응답계획 균형"

## 🔧 핵심 T-code/UI

IBP는 BTP SaaS이라 SAP GUI T-code 없음. 대신:

| UI | 용도 |
|---|---|
| **IBP Web UI** | 마스터 데이터·구성·실행 |
| **IBP Excel Add-In** | 일상 계획 작업 (Planner 사용) |
| **IBP App (Fiori)** | 모바일 KPI |
| **SAP Cloud ALM** | 모니터링 |

연동 S/4 측 T-code:
- **MD01N/MD02** — MRP (PIR 수신 후 실행)
- **CO40/CO41** — 생산 오더 변환 (PIR → Production Order)
- **VOFM/VFX3** — 영업 주문 (Response & Supply 결과 반영)

## 🚨 자주 마주치는 이슈

### "예측이 안 나와요"
- 원인: 운영자 정의 누락, 히스토리 부족, master 매핑 오류
- 진단:
  1. Planning Area Configuration → Forecast Model 확인
  2. Planning Run 로그 확인 (Application Job Monitor)
  3. 마스터 매핑 (Product, Location) 확인

### "Excel UI가 느려요"
- 원인: Planning View 너무 큼, 동시 사용자 많음
- 해결:
  1. Planning View 크기 축소 (≤ 10K cells 권장)
  2. Batch refresh 활용
  3. View 분리 (모듈별)

### "CPI 연동 fail"
- 원인: 메시지 mapping 오류, S/4 마스터 변경 시 ID mismatch
- 진단: CPI tenant → Monitor → Messages → Error 분류
- 해결: IBP Configuration → External Codes 재매핑

## 🔄 PP와 페어로 일하기

IBP가 만든 계획을 S/4 PP가 실행:
- **PIR (Planned Independent Requirement)** — 수요 → S/4 PP로 release
- **MRP Run (MD01N)** — PIR 기반 자재 계획
- **Production Order 변환** — CO40/CO41

장애 시 IBP-PP 어느 단에서 막혔는지 추적이 중요:
1. IBP → PIR 릴리스 정상? (IBP Application Job)
2. S/4 → MD64 (PIR 표시)에 데이터 도착?
3. S/4 MRP 실행 결과?

## 📚 참조

- `references/forecast-models.md` — 통계 예측 모델 비교 (TBD)
- `references/cpi-integration.md` — CPI 메시지 매핑 (TBD)
- `../../../sap-pp/skills/sap-pp/SKILL.md` — PP 연동
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CPI 가이드 (예정)

## ⚠️ 비목표

- 단기 production scheduling (PP/DS, MES 영역)
- 비-SAP 도구 (Anaplan, o9, Kinaxis 등)
- APO 운영 (deprecated; APO 사용자는 IBP 마이그레이션 가이드 참조)
