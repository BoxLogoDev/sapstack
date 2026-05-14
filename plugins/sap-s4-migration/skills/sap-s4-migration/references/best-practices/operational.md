# S/4 마이그레이션 일상 (Tier 1) Best Practice

## 적용 범위
- **System Conversion** (Brownfield)
- **New Implementation** (Greenfield)
- **Selective Data Transition**
- **한국 특화**: ✓

## 마이그레이션 단계별 일상 운영

### Phase 1: Discover
- [ ] **Maintenance Planner** — Conversion 사전 점검
- [ ] **Readiness Check** — 시스템 호환성
- [ ] **Custom Code Analysis** — ATC + Quick Fix

### Phase 2: Prepare
- [ ] **Simplification Item Check** — 영향 영역 식별
- [ ] **Custom Code Remediation** — Quick Fix 적용
- [ ] **Backup·Recovery Plan** — DR 테스트

### Phase 3: Realize
- [ ] **DMO** (Database Migration Option) 시뮬레이션
- [ ] **SUM** (Software Update Manager) 사용
- [ ] **Test Run** 다수 반복

### Phase 4: Deploy (Cutover)
- [ ] D-Day 잡 모니터링 (실시간)
- [ ] 진행률·예상 완료시간 추적
- [ ] 사용자 차단 → 마이그레이션 → 검증 → 오픈

### Phase 5: Run (Post Go-Live)
- [ ] 안정화 모니터링 (D+30)
- [ ] Regression 이슈 추적
- [ ] 사용자 만족도 수집

## 일상 운영 도구

| 도구 | 단계 |
|---|---|
| Maintenance Planner | Discover |
| Readiness Check | Discover-Prepare |
| Custom Code Migration App | Prepare |
| Simplification Catalog | Prepare-Realize |
| DMO/SUM | Realize-Deploy |
| Solman Focused Run | Deploy-Run |

## 한국 특화

- 한국 회사코드별 단계적 conversion 권장
- K-SOX·전자세금계산서 영향 사전 평가
- 4대보험·연말정산 데이터 보존
- 한국어 메시지·UI 검증

## 연관 문서
- `period-end.md`, `governance.md`
