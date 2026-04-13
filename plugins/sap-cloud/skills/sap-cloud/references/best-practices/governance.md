# Cloud PE Governance Best Practice (Tier 3)

## 적용 범위
- ECC: ✗ | S/4 Cloud PE: ✓

## 체크리스트

### Extension Tier 통제
- [ ] **Tier 결정 규칙** — 업무 요건에 맞는 Extension Tier 선택
  - Tier 1 (Key User): 필드 추가, 수식 변경 → Business User
  - Tier 2 (Side-by-side BTP): 복잡한 로직, UI → Developer
  - Tier 3 (ABAP Cloud): Released API만 사용 → Senior Developer
  - 왜: 잘못된 Tier 선택 시 업그레이드 실패 리스크
  - 빈도: Extension 승인 시마다
  - 담당: Architecture Board

- [ ] **Custom Code Registry 유지** — 모든 Custom Logic/Field 중앙 관리
  - 왜: 감사 추적, 영향도 분석
  - 빈도: 변경 시마다

### Release Management
- [ ] **Quarterly Release 사전 테스트** — Test 테넌트에서 검증 후 Production 적용
  - 왜: SAP 자동 업그레이드 실패 시 비즈니스 중단
  - 빈도: 분기별 (Feb/May/Aug/Nov)
  - 담당: IT + Business Key Users

- [ ] **Deprecation 모니터링** — SAP이 공지하는 deprecated API/feature 대응
  - 왜: 미대응 시 향후 업그레이드에서 실패
  - 빈도: 분기별 Release Notes 검토

### 보안 & 권한
- [ ] **Business Role Catalog 연간 검토** — 역할-권한 매핑 적정성
  - 왜: Cloud PE는 SoD가 더 엄격 (SAP 감사 대상)
  - 빈도: 연간

- [ ] **Identity Authentication Service (IAS)** — SSO 연동 적정성
  - 왜: Cloud 환경 표준 인증 방식

### Data Residency & 규제
- [ ] **데이터 레지던시 확인** — Cloud PE 데이터센터 위치
  - 한국: SAP Korea 데이터센터 가능 여부
  - 왜: 한국 개인정보보호법, 금융 규제 대응
  - 빈도: 계약 갱신 시

- [ ] **Compliance 인증** — Cloud PE의 SOC 2, ISO 27001, K-ISMS 확인
  - 빈도: 연간

### Cost Governance
- [ ] **User License Optimization** — Active/Inactive 사용자 정리
  - 왜: Cloud PE는 Full User 단위 과금
  - 빈도: 월간

- [ ] **Data Volume Monitoring** — HANA Memory Usage 추적
  - 왜: 볼륨 초과 시 추가 과금
  - 빈도: 월간

## 한국 Cloud PE 특수 사항
- 망분리 기업: Cloud PE 도입 제한적 (정부/금융권)
- K-ISMS 인증: SAP BTP Korea 리전 활용 권장
- 전자세금계산서: BTP Extension으로 연동 (표준 지원)

## 참조
- `docs/best-practices/authorization-governance.md`
- Cloud ALM Governance Framework
