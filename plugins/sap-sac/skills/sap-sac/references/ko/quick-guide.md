# sap-sac 한국어 퀵가이드

> SAP Analytics Cloud — 클라우드 BI/계획/예측 통합 플랫폼.

## 🔑 환경 인테이크

1. **테넌트 리전** — kr/eu/us/ap 어디?
2. **에디션** — BI / Planning / Smart Predict?
3. **연결 방식** — Live(HANA·S4 CDS) vs Import(Datasphere·파일)
4. **데이터 소스** — S/4HANA / BW / Datasphere / 외부 DB
5. **사용 사례** — Story / Analytic App / Planning / Predict

## 📚 핵심 컨셉

| 항목 | 한국어 표현 |
|---|---|
| Live Connection | 실시간 쿼리 (데이터 사본 없음) |
| Import Connection | 주기적 적재 (사본 보유) |
| Story | 대시보드 (드래그앤드롭) |
| Analytic Application | 스크립트 가능 앱 (JS) |
| Planning Model | 입력 가능·버전·배분 |
| Predictive Model | 회귀·분류·시계열 예측 |

## 🇰🇷 한국 현장 시나리오

### 자주 마주치는 시나리오
- **임원 대시보드**: KPI 카드 + drill-down (월/분기/연)
- **재무 보고**: Planning Model + S/4 actuals + 예산 비교
- **영업 분석**: Geo Map + 고객·제품 매트릭스
- **수요 예측**: Smart Predict + IBP 연동
- **공공 보고**: K-ISMS·망분리 고려, 데이터 마스킹

### 한국어 UI
- Story 제목·라벨·텍스트는 한국어 OK
- Dimension name은 영문 권장 (cross-tenant 호환성)
- Date format: 한국 표준 (YYYY-MM-DD) 사용

## 🚨 자주 마주치는 이슈

### "Story 화면 비어있음"
- 권한 확인: Story → Sharing → Role 확인
- 모델 권한 확인: Modeler permission
- Filter 확인: 멤버 변경됐는지

### "S/4 숫자와 안 맞음"
- Live vs Import 차이 (cache 시점)
- 통화/단위 변환 (KRW vs USD)
- 회계연도 변형 (K4 vs K1)

### "Live 연결 fail"
- Cloud Connector GREEN 확인
- TLS 인증서 (STRUST) 만료 여부
- BTP destination 설정

### "Planning 저장 안 됨"
- 버전 상태 (Public Locked인지)
- Dimension Lock 설정
- Write 권한 부족

## 🔧 권장 패턴

### S/4 → SAC 연동
1. S/4 측: Released CDS View 노출 (`I_*`)
2. BTP Cloud Connector 설정
3. SAC: Live Connection → Cloud Connector
4. Story에서 CDS View → Model 생성

### 데이터 모델링
- Time Dimension: 분기/월/주/일 hierarchy
- Currency/Unit conversion 설정
- Account dimension: 부호 규칙 (Income vs Expense)

## 📚 참조

- `references/connectivity-guide.md` — 연결 패턴 (TBD)
- `references/planning-best-practices.md` — Planning 모범 사례 (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP 환경
- `../../../sap-cloud/skills/sap-cloud/SKILL.md` — Cloud PE 연동

## ⚠️ 비목표

- BW 데이터플로우 설계 (BW/4HANA 영역)
- Datasphere 모델링 (sap-integration-cloud 영역)
- 비-SAC BI 도구 (Tableau, Power BI 등)
