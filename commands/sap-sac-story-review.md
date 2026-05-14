---
name: sap-sac-story-review
description: SAC Story 디자인·연결·성능·접근성 통합 리뷰
allowed-tools: Read, Grep, Glob
---

# /sap-sac-story-review — SAC Story 종합 리뷰

## 사용 시점
- 신규 Story 출시 전 마지막 검토
- 임원 대시보드 품질 검증
- 성능 슬로우 신고 진단
- 접근성·보안 감사

## 체크리스트

### 1. 연결 (Connection)
- [ ] Live vs Import 선택 적절?
- [ ] 데이터 소스 매핑 정확?
- [ ] 인증 정상 (Cloud Connector / BTP destination)?

### 2. 모델 (Model)
- [ ] Dimension hierarchy 정합?
- [ ] Measure aggregation 정확?
- [ ] Currency/Unit 변환 설정?
- [ ] Fiscal Year Variant 일치?

### 3. Story 디자인
- [ ] 임원/사용자 페르소나 명확?
- [ ] KPI 정의 명확?
- [ ] Drill-down hierarchy?
- [ ] Filter 일관성 (Story-level vs Page-level)?
- [ ] Color scheme 표준?

### 4. 성능
- [ ] Story-level filter 활용 (visible measures 축소)?
- [ ] CDS view 최적화 (인덱스)?
- [ ] Live BW: 쿼리 성능 측정?
- [ ] Story 첫 로드 < 5초?

### 5. 접근성·보안
- [ ] Sharing 권한 적절?
- [ ] 민감 데이터 마스킹?
- [ ] Mobile responsive (필요시)?
- [ ] Color contrast WCAG?

## Output

```
### Story Review Summary
- 강점: ...
- 개선: ...

### Action Items
1. [Critical/High/Medium]: ...

### Performance Score
- 첫 로드: X초 (목표 <5초)
- Refresh: Y초

### Security
- 권한 매트릭스: ...
```

## 참조
- `plugins/sap-sac/skills/sap-sac/SKILL.md`
- `agents/sap-sac-consultant.md`
