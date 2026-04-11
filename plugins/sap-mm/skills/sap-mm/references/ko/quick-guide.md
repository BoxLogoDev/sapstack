# sap-mm 한국어 퀵가이드

## 🔑 환경 인테이크
1. SAP 릴리스 (S/4는 MATDOC 신테이블)
2. 플랜트 / 저장위치 (사용자 제공)
3. MM 기간 (**OMSY** — 현+전 2개월만 허용)

## 📚 핵심

### Procurement
- **ME21N**: PO 생성
- **ME22N**: PO 변경
- **MEK1/MEK3**: 조건 (Info Record / 계약)
- Release Strategy: **CL02** Class + **CT04** Characteristic

### Inventory
- **MIGO**: GR/GI/Transfer posting
- **MB52**: 재고 현황 (전체)
- **MB5B**: 전기간 재고 (음수 재고 체크)
- **MMBE**: 전체 재고 상황

### Invoice Verification
- **MIRO**: 송장 입력
- **MR11**: GR/IR 잔액 정리
- **MRBR**: Blocked Invoice 해제
- Tolerance: **OMR6**

### Account Determination
- **OMWB**: 계정 결정 (Transaction Key)
- **OBYC**: Transaction Key → G/L 매핑
- 주요 Key: BSX (재고), WRX (GR/IR), GBB (상계), PRD (가격차)

## 🇰🇷 특화
- **전자세금계산서** 송장 수취 시 승인번호 연계 (J_1BNFE)
- **부가세 자동 분리** — 한국 부가세 코드(MWSKZ) 매핑
- **월마감 엄격** — 한국 제조업 표준

## 🤖 관련 커맨드
- `/sap-migo-debug` — MIGO 에러 체계적 진단

## ⚠️ 주의
- MM 기간과 FI 기간 **동기화 필수** (자주 어긋남)
- **MR11 Test Run** 먼저 — 실행 시 자동 전표 생성
