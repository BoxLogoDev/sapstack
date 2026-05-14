# S/4 마이그레이션 거버넌스 (Tier 3) Best Practice

## 1. 프로젝트 거버넌스

### 1.1 Steering Committee
- 격주 회의 (Cutover 임박 시 주간)
- 의사결정 권한: 일정·예산·범위
- 참여: CFO·CIO·IT 임원·외부 파트너

### 1.2 PMO (Project Management Office)
- 단일 PM
- 일정·예산·리스크 통합 관리
- 주간 status report

## 2. 변경 관리

### 2.1 변경 통제
- 마이그레이션 동안 모든 변경 동결 (Code Freeze)
- 예외: P1 인시던트 한정
- Cutover 전 4주 모든 트포 금지

### 2.2 Change Board
- 마이그레이션 동안 변경 승인 권한
- 4-eyes principle 강화

## 3. 위험 관리

### 3.1 위험 분류
- **High**: 데이터 손실·다운타임 연장·SOX 영향
- **Medium**: 성능 저하·기능 변경·사용자 불만
- **Low**: 표면 변화

### 3.2 위험 완화
- High → 별도 대응 계획
- Medium → 모니터링·점진 fix
- Low → 표준 절차

### 3.3 롤백 계획
- DMO 실패 시 시점별 롤백 매트릭스
- DB 백업 → 시스템 복원 절차
- 사용자 통보 절차

## 4. 데이터 거버넌스

### 4.1 데이터 무결성
- Pre-migration: 데이터 검증 잡 (counts, sums)
- Post-migration: 검증 비교 (delta = 0)
- 외부 감사 대비 trail 보존

### 4.2 SOD 강화
- Migration 동안 임시 권한 부여 추적
- Cutover 후 즉시 권한 회수
- 분기 권한 재인증

## 5. 컴플라이언스

### 5.1 K-SOX 영향
- ITGC 5대 통제 영향 분석
- 외부 감사인 사전 공유
- 마이그레이션 통제 평가

### 5.2 데이터 보호
- PII 데이터 마스킹 검증 (test 환경)
- 데이터 보존 기간 정책 유지
- GDPR/PIPA 등 규제 영향

## 6. 외부 파트너

### 6.1 SI (System Integrator)
- 명시적 책임 범위 (RACI)
- 일정·예산 SLA
- Penalty·인센티브 조항

### 6.2 SAP
- Maintenance Planner 인증
- SAP MaxAttention (해당 시)
- Go-Live Support 계약

## 7. 거버넌스 지표

| 지표 | 임계 |
|---|---|
| 일정 준수율 | > 95% |
| 예산 차이 | < 10% |
| High Risk 0건 | 항시 0 |
| Pre/Post 데이터 무결성 | 100% |
| Cutover 다운타임 | 계획 대비 < 110% |
| Post Go-Live 첫 결산 | 정상 |

## 연관 문서
- `operational.md`, `period-end.md`
