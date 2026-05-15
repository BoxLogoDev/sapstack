# IBP 거버넌스 (Tier 3) Best Practice

## 적용 범위
- **S/4 HANA**: ✓
- **Cloud PE**: ✓
- **한국 특화**: ✓ (K-SOX 계획 통제, 데이터 레지던시)

---

## 체크리스트

### 🔐 권한 & 분리 (Segregation of Duties)

- [ ] Planner / Approver / Admin 역할 분리
  - 왜: 계획 조작 방지 (K-SOX 내부통제)
  - 담당: IBP 보안 관리자
  - 확인: forecast override 권한 ≠ plan publish 권한

- [ ] Version publish 권한은 S&OP Manager 이상
  - 확인: Private→Public publish audit 로그 보존

### 📋 감사 추적 (Audit Trail)

- [ ] 계획 변경 이력 보존 (override 사유, 변경자, 시점)
  - 빈도: 상시 + 분기 감사
  - 확인: scenario/version 변경 추적 가능

- [ ] PIR 릴리스 → S/4 반영 정합 감사
  - 확인: 릴리스된 수치 = S/4 MD63 수치 (sample 대조)

### 🌐 데이터 거버넌스

- [ ] 마스터 데이터 ownership (Product/Location/Customer)
  - 확인: External Codes 매핑 단일 진실 소스

- [ ] 한국 데이터 레지던시 — 개인정보 미포함 검증
  - 왜: IBP는 계획 데이터 위주이나 customer attribute 주의
  - 확인: 민감 attribute 제외

### 📊 정확도 거버넌스

- [ ] Forecast accuracy KPI 목표 + 미달 시 에스컬레이션
  - 빈도: 월간 (S&OP Demand Review 연계)
  - 확인: MAPE 목표 대비, 책임 부서

## 한국 현장 체크
- K-SOX: 수요/공급 계획이 매출/재고 추정에 영향 → 내부통제 문서화
- 감사 시 IBP 계획 → S/4 실행 → 재무제표 추적 경로 제시
- SI 벤더(삼성SDS/LG CNS 등) 접근 권한 주기적 재검토

## 관련 참조
- `operational.md` / `period-end.md`
- `../../../sap-fi/skills/sap-fi/references/best-practices/governance.md` — 재무 통제 연계
