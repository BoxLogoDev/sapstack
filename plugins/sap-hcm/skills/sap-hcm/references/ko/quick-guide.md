# sap-hcm 한국어 퀵가이드

## 🔑 환경 인테이크
1. HCM 배포 (ECC HCM / H4S4 / SuccessFactors 하이브리드)
2. 한국 Payroll 버전 (SAP HR Korea)
3. FI Posting 연동 여부

## 📚 핵심

### Personnel Administration
- **PA30**: 인포타입 유지
- **PA40**: 인사 조치 (입사/퇴사/승진)
- 주요 인포타입:
  - 0001 (조직배정), 0002 (개인정보), 0006 (주소)
  - 0008 (기본급여), 0014 (정기공제), 0015 (단기공제)

### Time Management
- **PT60**: Time Evaluation
- **PT01**: Work Schedule Rule
- **CAT2**: 근태 입력

### Payroll (한국)
- **PC00_M46_CALC**: 한국 급여계산
- **PC00_M46_CDTA**: 지급 데이터 생성
- **PC00_M46_CEDT**: 급여명세서
- 세금 신고: **PC00_M46_TXR** (원천세)

### FI Posting
- **PC00_M99_CIPE**: 급여 → FI 포스팅

## 🇰🇷 특화
- **주민등록번호** 마스킹 필수 (개인정보보호법)
- **4대보험** (국민연금/건강/고용/산재) 자동 계산
- **연말정산** — SAP HR Korea 표준 프로세스
- **근로소득 간이세액표** 업데이트 (국세청 연 1회)
- **퇴직연금** (DB/DC) 처리

## ⚠️ 주의
- 개인정보 조회는 **PFCG P_ORGIN** 권한 객체로 엄격 제한
- **급여 운영 환경 변경 금지** — 반드시 개발 → QA → 운영 transport
- 연말정산 시즌(1~2월)은 **동시 사용자 폭증** 대비
