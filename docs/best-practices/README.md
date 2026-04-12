# sapstack Best Practice Framework

> "설정은 IMG에서, 운영은 Best Practice에서"

## 3-Tier 구조

sapstack의 Best Practice는 3개 계층으로 구성됩니다.

| Tier | 이름 | 적용 시점 | 예시 |
|------|------|----------|------|
| **Tier 1** | Operational BP | 일상 운영 | "MIGO 전기 전 반드시 이동유형 확인" |
| **Tier 2** | Period-End BP | 기간마감 | "FI 마감 전 GR/IR 정리 (MR11 시뮬레이션)" |
| **Tier 3** | Governance BP | 조직 거버넌스 | "K-SOX 환경 이중 승인 트랜잭션 목록" |

## 문서 구조

### 공통 Best Practice (모듈 횡단)

이 디렉토리에 위치하는 문서는 **특정 모듈에 국한되지 않는** 횡단적 BP입니다:

| 문서 | 내용 |
|------|------|
| [authorization-governance.md](authorization-governance.md) | 권한 관리 — PFCG, SU53, SoD, K-SOX |
| [transport-management.md](transport-management.md) | 이관 관리 — CTS, ChaRM, 이관 경로 |
| [master-data-governance.md](master-data-governance.md) | 마스터데이터 거버넌스 |
| [period-end-orchestration.md](period-end-orchestration.md) | 모듈 횡단 기간마감 순서 |
| [change-management.md](change-management.md) | 변경관리 프로세스 |
| [data-archiving.md](data-archiving.md) | 데이터 아카이빙 전략 |

### 모듈별 Best Practice

각 모듈 플러그인의 `references/best-practices/` 디렉토리에 위치:

```
plugins/sap-{module}/skills/sap-{module}/references/best-practices/
  operational.md    # Tier 1 — 일상 운영 체크리스트
  period-end.md     # Tier 2 — 기간마감 체크리스트
  governance.md     # Tier 3 — 감사/규정 준수
```

## Best Practice 문서 표준 포맷

```markdown
# {모듈} {Tier 이름} Best Practice

## 적용 범위
- ECC: ✓ / S/4: ✓
- 한국 특화: ✓ / ✗

## 체크리스트

### {영역 1}
- [ ] **{항목}** — T-code: {XXX}
  - 왜: {이유}
  - 빈도: 일간 / 주간 / 월간 / 분기 / 연간
  - 담당: {역할}
  - 주의: {일반적 실수}

### {영역 2}
- [ ] ...
```

## 참조
- IMG 구성 가이드: `plugins/sap-{module}/skills/sap-{module}/references/img/`
- 모듈 SKILL.md: `plugins/sap-{module}/skills/sap-{module}/SKILL.md`
- 데이터: `data/master-data-rules.yaml`, `data/period-end-sequence.yaml`
