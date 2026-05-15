# Integration Cloud 거버넌스 (Tier 3) Best Practice

## 적용 범위
- **S/4 HANA**: ✓
- **ECC**: ✓
- **한국 특화**: ✓ (K-SOX 인터페이스 통제, 데이터 레지던시, 망분리)

---

## 체크리스트

### 🔐 자격증명 & 접근 통제

- [ ] Security Material 최소권한 + 소유자 지정
  - 왜: 연동 계정 과권한 → 데이터 유출 위험 (K-SOX)
  - 담당: BTP 보안 관리자
  - 확인: communication user 최소 scope, 인증서 소유/만료 관리대장

- [ ] iFlow 배포 권한 분리 (개발 ≠ 운영 배포)
  - 확인: Q→P 이관 승인 절차, 배포 audit

### 📋 감사 추적

- [ ] 인터페이스 카탈로그 (소스-타깃-데이터-주기) 최신 유지
  - 빈도: 분기
  - 확인: 모든 iFlow/replication 문서화, owner 명시

- [ ] 메시지 처리 audit 보존 (실패/재처리 이력)
  - 확인: 규정 보존 기간 충족, 추적 가능

### 🌐 데이터 거버넌스 / 컴플라이언스

- [ ] 데이터 레지던시 — 국외 이전 데이터 흐름 식별·근거
  - 왜: 개인정보 국외 이전 규제 (PIPA)
  - 확인: replication/iFlow 중 PII 포함 흐름 마스킹·동의

- [ ] 망분리 준수 — DMZ 경유 정책, 직접 노출 금지
  - 확인: Cloud Connector Access Control 최소 경로

- [ ] 전자문서(EDI/세금계산서) 무결성·부인방지
  - 확인: 서명/감사 로그, 사업자 합의 포맷

### 🔁 변경 관리

- [ ] iFlow/연결 변경은 형상관리 + 영향도 평가
  - 확인: 변경 전후 정합 테스트, 롤백 계획

## 한국 현장 체크
- K-SOX: 인터페이스가 재무/물류 데이터 흐름 → 인터페이스 통제 문서화
- 데이터 국외 이전: PIPA 근거 + 마스킹 적용 흐름 목록
- 망분리 감사 시 Cloud Connector 경로/권한 제시
- SI/외부 통합 개발자 BTP 접근 권한 주기 회수

## 관련 참조
- `operational.md` / `period-end.md`
- `../img/connectivity-security.md` — Cloud Connector/인증 구성
- `../../../sap-fi/skills/sap-fi/references/best-practices/governance.md`
