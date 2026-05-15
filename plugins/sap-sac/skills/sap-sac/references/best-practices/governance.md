# SAC 거버넌스 (Tier 3) Best Practice

## 적용 범위
- **S/4 HANA**: ✓
- **Cloud PE**: ✓
- **한국 특화**: ✓ (K-SOX 리포팅 통제, PIPA)

---

## 체크리스트

### 🔐 데이터 접근 통제

- [ ] Data Access Control(DAC) 행 수준 격리
  - 왜: 본사/자회사·부서 간 데이터 노출 방지 (K-SOX, PIPA)
  - 담당: SAC 보안 관리자
  - 확인: 권한 다른 사용자 = 다른 행만 표시 (테스트 케이스 보존)

- [ ] Role 분리 (Viewer / Modeler / Planner / Admin)
  - 확인: Viewer가 모델 수정 불가, Modeler가 admin 기능 불가

### 📋 감사 추적

- [ ] Story/Model 변경 이력 + version publish 감사
  - 빈도: 분기 감사
  - 확인: 누가 언제 어떤 plan version을 publish했는지 추적

- [ ] Live 모델: 소스 권한과 SAC 권한 일관성
  - 확인: SAC 우회로 소스 권한 초과 노출 없음

### 🌐 데이터 거버넌스 / 컴플라이언스

- [ ] 개인정보(PII) 포함 모델 식별 + 마스킹/제외
  - 왜: PIPA(개인정보보호법) — 분석 목적 최소수집
  - 확인: 주민번호/연락처 등 미노출

- [ ] 한국 데이터 레지던시 — 리전/소스 데이터 흐름 문서화
  - 확인: 국외 이전 시 동의/근거

- [ ] Predictive 모델 설명가능성 (의사결정 영향 시)
  - 확인: influencer/debrief 보존, 편향 점검

## 한국 현장 체크
- K-SOX: 경영 리포팅 KPI가 재무제표 기반 → 데이터 계보(lineage) 문서화
- 감사 시 SAC KPI → 소스 모델 → S/4 추적 경로 제시
- 외부(컨설팅/SI) SAC 접근 권한 주기적 회수 검토

## 관련 참조
- `operational.md` / `period-end.md`
- `../img/model-story-governance.md` — DAC/Role 구성
- `../../../sap-fi/skills/sap-fi/references/best-practices/governance.md`
