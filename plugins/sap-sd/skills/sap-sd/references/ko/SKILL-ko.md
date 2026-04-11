# SAP SD 한국어 전문 가이드

> `plugins/sap-sd/skills/sap-sd/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- SAP 릴리스 (ECC / S/4HANA — 여신관리 차이)
- 판매조직 / 유통채널 / 사업부 (Sales Area)
- 여신 관리 방식 (ECC FD32 / S/4 FSCM UKM_BP)
- 수익 인식 (Revenue Recognition) 방식

## 2. Order-to-Cash 프로세스

```
VA11 Inquiry → VA21 Quotation → VA01 Sales Order
                                      │
                                      ▼
              VL01N Outbound Delivery → VL02N Picking/PGI
                                                │
                                                ▼
                                    VF01 Billing → FB70 Account Posting
```

### 트랜잭션
- **VA01/VA02/VA03**: 판매오더 생성/변경/조회
- **VA05**: 판매오더 리스트
- **VL01N**: 출하 생성
- **VL02N**: 출하 변경 (Picking, PGI)
- **VF01**: 빌링 생성
- **VF03**: 빌링 조회
- **VF04**: 빌링 Due List
- **VF11**: 빌링 취소

## 3. Pricing (가격 결정)

### 설정
- **V/08**: 가격 조건 절차 (Procedure)
- **V/06**: 조건 유형 (Type)
- **VK11/VK12**: 조건 레코드 생성/변경
- **VOFM**: 요구사항·공식 루틴 (ABAP)

### 조건 유형 예시
- **PR00**: Price
- **K004**: Material Discount
- **K007**: Customer Discount
- **KF00**: Freight
- **MWST**: Output Tax

### Access Sequence
- Customer/Material → Material → Customer → General
- 가장 구체적인 것부터 검색

## 4. Credit Management (여신)

### ECC — FD32
- **FD32**: 신용 마스터 변경
- **FD33**: 조회
- **Credit Control Area** 기반
- **VKM1**: Released Orders (Order Block 해제)
- **VKM3**: Released Deliveries (Delivery Block 해제)

### S/4HANA — FSCM
- **UKM_BP**: Credit Segment per Business Partner
- **UKM_MY_LIMIT**: 한도 관리
- Rule-based check (유연)
- Risk category + Rating score

### 한국 현장
- **대기업 본사 보증** 케이스 많아 여신 세그먼트 복잡
- 상장사 K-SOX — 여신 한도 변경 감사 대상

## 5. Billing (빌링)

### 타입
- **Order-related**: 주문 참조 (서비스)
- **Delivery-related**: 출하 참조 (상품)
- **Pro-forma**: 실제 회계 없음

### Copy Control
- **VTFA**: Order → Billing
- **VTFL**: Delivery → Billing
- **VTAA**: Order → Order

### FI 연계
- VF01 포스팅 시 FI 전표 자동 생성
- Account Determination: **VKOA**

## 6. 반품 프로세스 (Return)

### 플로우
1. **VA01** with Return Order Type (RE)
2. **VL01N** Return Delivery
3. **MIGO 651** (Return GR)
4. **VF01** Credit Memo

### 한국 현장
- 전자세금계산서 역발행 (매입자 발행) 지원 필요 시 커스텀
- 반품 승인 워크플로 ChaRM 연동

## 7. 한국 특화

### 전자세금계산서 발행
- VF01 포스팅 시 자동 생성 (SAP DRC 또는 3rd-party)
- **승인번호** 국세청 API 연동
- **J_1BNFE** 구조 (Country Version Brazil 재활용)

### 부가세
- 부가세 **별도/포함** 혼재 (B2B 별도, B2C 포함)
- **MWST** 조건 유형 설정
- 매출세액 신고 준비

### 할인·리베이트
- 한국 유통은 리베이트 복잡 — **VB01~VB07** 리베이트 협정
- 분기/연간 정산 워크플로

### 유통 특화
- **거래처 할인율 변경**이 잦음 (VK12)
- **납품 통제**: 삼성·현대 협력사 표준 (Sort, Shipment consolidation)

## 8. ECC vs S/4HANA 차이

| 주제 | ECC | S/4HANA |
|------|-----|---------|
| 여신 관리 | FD32 (SD-CR) | UKM_BP (FSCM) |
| 고객 마스터 | KNA1/KNVV + XD01 | **Business Partner (BP)** 필수 |
| Output 결정 | NACE (조건 기법) | **BRF+ 기반** (권장) |
| Billing Post to FI | 별도 단계 가능 | **자동** |

## 9. 자주 참조하는 SAP Note
- **2265093** — Business Partner Migration
- **2269324** — Simplification List (SD 관련 포함)

## 관련
- `quick-guide.md`
- `/plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md` — 여신·회계 연계
- `/agents/sap-sd-consultant.md` — SD 컨설턴트 에이전트 (v1.3.0 신규)
