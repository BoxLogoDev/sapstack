# sap-gts 한국어 퀵가이드

> SAP GTS (Global Trade Services) — 한국 수출입 현장 요약.

## 🔑 환경 인테이크
1. GTS 배포 (Standalone / Embedded in S/4)
2. Korea UNI-PASS 연동 여부
3. 거래 유형 (수출 / 수입 / 양방향)
4. FTA 대상 국가

## 📚 핵심 영역

### Compliance
- **SPL Screening** — 제재 대상자 검색
- **Embargo Check** — 금수 국가
- **Legal Control** — 허가 필요성

### Customs
- **수출신고** (Export Declaration)
- **수입신고** (Import Declaration)
- **Transit** — 통과·환적

### Risk
- **L/C Management** — 신용장
- **Preference** — 원산지·FTA
- **Restitution** — 수출 환급

## 🇰🇷 한국 특화
- **UNI-PASS** (관세청 전자통관)
- **HSK** — 한국 HS 코드 10자리
- **KOSTI** — 전략물자 관리
- **50+ FTA** — 원산지 증명

## T-code
- `/SAPSLL/*` 네임스페이스
- 예: `/SAPSLL/MENU_LEGALR3`, `/SAPSLL/COMPLR3`, `/SAPSLL/PRODUCT_R3`

## ⚠️ 주의
- 공인인증서 (STRUST) 등록 필수
- HS Code 잘못되면 관세 추징
- FTA별 원산지 기준 다름

## 🤖 관련
- `/plugins/sap-sd` — 수출
- `/plugins/sap-mm` — 수입
- `/agents/sap-integration-advisor.md` — UNI-PASS 연동
