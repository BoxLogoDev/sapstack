# sap-co 한국어 퀵가이드

## 🔑 환경 인테이크
1. SAP 릴리스 (ECC / S/4HANA) — S/4는 CO-PA가 Account-based 기본
2. 회사코드 + Controlling Area
3. 제품 원가 방식 (Standard / Actual / Mixed)
4. CO-PA 유형 (Costing-based / Account-based)

## 📚 모듈별 핵심

### CCA (Cost Center Accounting)
- **KS01/KS02**: Cost Center 생성/변경
- **KSU5**: Assessment (배부)
- **KSV5**: Distribution (분배)
- Planning: **KP06** (비용 요소별), **KP26** (활동유형)

### PCA (Profit Center Accounting)
- **KE51**: Profit Center 생성
- S/4HANA: PCA는 신원장(New GL)과 통합 — 별도 ledger 아님
- **KE5Z**: PCA 실적 조회

### IO (Internal Order)
- **KO01**: IO 생성
- **KO88**: 결산 (Settlement)
- Real vs Statistical 구분 주의

### CO-PC (Product Costing)
- **CK11N**: Cost Estimate 생성
- **CK24**: Price Update (Standard Cost 반영)
- **KKS1/KKS2**: Variance 분석
- **CKMLCP** (S/4): Actual Costing Run

### CO-PA (Profitability Analysis)
- **KE30**: 보고서 실행
- S/4HANA: **Account-based CO-PA**가 기본 — ACDOCA 활용
- ECC: Costing-based CO-PA는 별도 테이블(CE1~CE4)

## 🇰🇷 한국 특화
- **관리회계 + 세무조정** 동시 요구 (대기업 특히)
- **표준원가 계산**이 월결산 crit path — CK24 타이밍 중요
- **재료비 변동 반영**: 한국 제조업은 원자재 환율 변동 심함 → Actual Costing 고려

## 🤖 관련 커맨드
- `/sap-fi-closing` (CO가 FI 마감에 종속)

## 📖 참조
- `../period-end.md`
