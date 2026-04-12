# 권한 관리 Best Practice (Authorization Governance)

> Tier 3 — Governance BP | 적용: 전 모듈 | ECC: ✓ | S/4: ✓ | K-SOX: 필수

## 1. 권한 설계 원칙

### 역할 기반 접근 제어 (RBAC)
- **단일 역할 (Single Role)**: 하나의 업무 기능 단위 (예: "FI-AP-전표입력")
- **복합 역할 (Composite Role)**: 단일 역할 조합 (예: "FI-AP-담당자" = 전표입력 + 조회 + 보고서)
- **파생 역할 (Derived Role)**: 조직 레벨만 다른 역할 (회사코드별 파생)

### 명명 규칙
```
Z:{모듈}:{업무}:{권한수준}
예: Z:FI:AP:POSTING, Z:FI:AP:DISPLAY, Z:FI:AP:ADMIN
```

### 최소 권한 원칙 (Least Privilege)
- 업무에 필요한 최소 T-code만 부여
- `S_TCODE` 권한 객체로 T-code 접근 제어
- 와일드카드(`*`) 사용 최소화 — 감사 지적 대상

## 2. 직무 분리 (SoD — Segregation of Duties)

### K-SOX 필수 분리 규칙

| 충돌 쌍 | 기능 A | 기능 B | 리스크 |
|---------|--------|--------|--------|
| FI-01 | 공급업체 마스터 생성 (XK01) | 지급 실행 (F110) | 가공 거래 |
| FI-02 | GL 전표 입력 (FB01) | GL 전표 승인 (FB02) | 무승인 전표 |
| FI-03 | 고객 마스터 생성 (XD01) | 수금 처리 (F-28) | 가공 매출 |
| MM-01 | 구매요청 생성 (ME51N) | 구매오더 승인 (ME29N) | 자기 승인 |
| MM-02 | 입고 처리 (MIGO) | 송장 검증 (MIRO) | 허위 입고 |
| SD-01 | 판매오더 생성 (VA01) | 여신 해제 (VKM1) | 여신 우회 |
| HR-01 | 인사 마스터 변경 (PA30) | 급여 실행 (PC00) | 급여 조작 |
| BASIS-01 | 역할 생성 (PFCG) | 사용자 할당 (SU01) | 권한 남용 |

### SoD 검증 도구
- **SUIM**: 사용자 정보 시스템 — 역할/프로필/권한 교차 분석
- **SU53**: 권한 실패 추적 — 최근 권한 거부 내역
- **GRC Access Control** (별도 라이선스): 자동 SoD 검사 + 완화 관리

## 3. 권한 관리 운영 체크리스트

### 일간 (Tier 1)
- [ ] **SU53 모니터링** — 주요 사용자 권한 실패 추적
- [ ] **SM20 감사 로그** — Critical 이벤트 확인 (Dialog 로그온 실패, 긴급 접근)
- [ ] **긴급 접근(Firefighter) 사용 이력** — GRC EAM 또는 수동 로그 확인

### 월간 (Tier 2)
- [ ] **미사용 사용자 잠금** — SU10 > 90일 미로그인 사용자 식별 → 잠금
- [ ] **퇴직자 계정 확인** — HR 퇴직 처리 ↔ SAP 계정 잠금 대사
- [ ] **역할 변경 이력 검토** — PFCG 변경 로그 확인

### 분기 (Tier 3 — K-SOX)
- [ ] **SoD 위반 보고서** — SUIM 또는 GRC로 전체 위반 추출
- [ ] **완화 통제(Mitigating Control) 유효성** — 보상 통제가 작동하는지 검증
- [ ] **특권 계정 재인증** — SAP_ALL, SAP_NEW 보유자 목록 → 경영진 승인
- [ ] **외부 감사 대비** — 증빙 자료 준비 (역할 매트릭스, 승인 이력)

### 연간
- [ ] **전체 사용자 재인증 (User Access Review)** — 모든 사용자 역할 적정성 검토
- [ ] **역할 합리화** — 미사용 역할 정리, 중복 역할 통합
- [ ] **SoD 룰셋 업데이트** — 새 T-code/업무 프로세스 반영

## 4. 긴급 접근 관리 (Emergency Access / Firefighter)

### 절차
1. **요청**: 긴급 상황 발생 → 요청서 작성 (사유, 예상 작업, 시간)
2. **승인**: 라인 매니저 + 보안 담당 승인
3. **접근**: Firefighter ID 또는 임시 역할 부여
4. **작업**: 모든 활동 SM20 감사 로그 기록
5. **종료**: 작업 완료 → 즉시 역할 회수
6. **사후 검토**: 작업 내역 검토 + 문서화

### 주의사항
- Firefighter 세션은 **72시간 이내** 종료 권장
- 동일 Firefighter ID를 2명 이상 동시 사용 금지
- 사후 검토 없는 긴급 접근은 감사 부적합

## 5. S/4HANA 변경 사항

| 항목 | ECC | S/4HANA |
|------|-----|---------|
| 역할 관리 | PFCG | PFCG + IAM (Identity & Access Management) |
| Fiori 권한 | N/A | OData + Catalog + Tile 권한 추가 |
| BP 통합 | 공급업체/고객 별도 | BP 단일 객체 → 권한 객체 변경 |
| 감사 로그 | SM20 | SM20 + SAL (Security Audit Log 개선) |
| SoD 분석 | SUIM + GRC | SUIM + GRC + IAM Business Role |

## 6. 한국 특화

### K-SOX (내부회계관리제도)
- 상장사 의무: IT 일반통제(ITGC) + 업무처리통제(AC)
- 외부감사인 검증 대상: 권한 매트릭스, SoD 보고서, 변경관리 증적
- **연 1회 IT 통제 평가** → 이사회/감사위원회 보고

### 개인정보보호법
- 고객/직원 개인정보 접근 T-code 제한 (PA30, XD03 등)
- 접근 로그 보관: 최소 3년 (개인정보보호법 시행령)
- 마스킹: 주민번호, 계좌번호 화면 표시 제한

## 참조
- `plugins/sap-basis/skills/sap-basis/SKILL.md` — PFCG, SU53 상세
- `plugins/sap-bc/skills/sap-bc/SKILL.md` — K-SOX, KISA 보안
- `docs/enterprise/system-landscape.md` — 시스템 랜드스케이프와 권한 연계
