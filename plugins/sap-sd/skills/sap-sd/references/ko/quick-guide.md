# sap-sd 한국어 퀵가이드

## 🔑 환경 인테이크
1. 판매조직 / 유통채널 / 사업부 (사용자 제공)
2. 여신 관리 방식 (ECC FD32 / S/4 FSCM UKM)
3. 수익 인식 (Revenue Recognition) 방식

## 📚 핵심

### Order-to-Cash
- **VA01/VA02**: 판매오더
- **VL01N**: 출하 (Delivery)
- **VF01**: 빌링 (Billing)
- **VF04**: 빌링 Due List
- **VA05**: 판매오더 리스트

### Pricing
- **V/08**: 가격 조건 절차
- **VK11/VK12**: 조건 레코드
- **VOFM**: 루틴 (가격 결정 로직)

### Credit Management
- **ECC**: FD32 (신용한도) + VKM1 (Order Block) + VKM3 (Delivery Block)
- **S/4 FSCM**: UKM_BP (신용 세그먼트) + rule-based check
- **FD33**: 한도 조회

### Billing
- **VF03**: 빌링 문서 조회
- **VF11**: 빌링 취소
- Copy Control: **VTFA** (Order→Billing), **VTFL** (Delivery→Billing)

## 🇰🇷 특화
- **전자세금계산서 발행** — VF01 포스팅 시 자동 연계 (DRC 또는 3rd-party)
- **부가세 별도/포함** 혼재 — 한국 B2C는 포함가 표시 법정
- **세금계산서 역발행** 프로세스 (매입자 발행) 지원 필요 시 커스텀

## ⚠️ 주의
- VF01 취소(VF11)는 **조건 엄격** — 세금계산서 역발행과 충돌 주의
- 한국 여신은 **대기업 본사 보증** 케이스 많아 여신세그먼트 복잡
