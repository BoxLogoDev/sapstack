# 변경관리 프로세스 (Change Management)

> Tier 3 — Governance BP | 적용: 전 모듈 | ECC: ✓ | S/4: ✓

## 1. 변경 유형 분류

| 유형 | 리스크 | 승인 | 예시 |
|------|--------|------|------|
| **Standard** | 낮음 | 사전 승인 (Pre-approved) | 사용자 역할 할당, Report variant |
| **Normal** | 중간 | CAB 승인 필요 | IMG 설정 변경, 신규 T-code 추가 |
| **Urgent/Emergency** | 높음 | 사후 승인 허용 | 프로덕션 장애 긴급 수정 |
| **Major** | 매우 높음 | 경영진 승인 | 아키텍처 변경, 신규 모듈 도입 |

## 2. 변경 요청 프로세스 (RFC — Request for Change)

### 표준 흐름
```
1. 변경 요청서 작성 (요청자)
   ├── 변경 사유
   ├── 영향 범위 (모듈, 시스템, 사용자 수)
   ├── 롤백 계획
   └── 테스트 계획

2. 영향 분석 (기술 담당)
   ├── 의존성 분석 (Transport 선후행)
   ├── 테스트 범위 결정
   └── 리스크 평가

3. 승인 (CAB — Change Advisory Board)
   ├── 팀장 승인
   ├── IT 부서장 승인
   └── (Major) 경영진 승인

4. 구현 (개발/설정 담당)
   ├── DEV 개발/설정
   ├── 단위 테스트
   └── Transport 릴리즈

5. 테스트 (QAS)
   ├── 기능 테스트
   ├── 통합 테스트
   ├── UAT (사용자 인수 테스트)
   └── 테스트 서명

6. 배포 (PRD)
   ├── Import 스케줄 확인
   ├── Import 실행
   ├── 사후 검증
   └── 사용자 공지

7. 사후 검토 (PIR — Post-Implementation Review)
   ├── 성공/실패 판정
   ├── 교훈 기록
   └── 변경 이력 종결
```

## 3. 변경 동결 (Change Freeze)

### 적용 시점
- **기간마감 기간**: D-3 ~ D+5 (월말 마감)
- **연말 결산**: 12월 말 ~ 1월 중순
- **법적 신고 기간**: 부가세, 법인세 신고 전후
- **시스템 업그레이드/패치**: 업그레이드 전후 1주

### 예외 처리
- 긴급 변경만 허용 (Emergency RFC)
- CAB 긴급 승인 + 사후 문서화 필수

## 4. Solution Manager ChaRM 활용

### ChaRM (Change Request Management)
- 변경 요청 → 변경 문서 → Transport 자동 연결
- 승인 워크플로 → Import 자동 스케줄링
- 감사 추적: 누가, 언제, 무엇을 변경했는지 자동 기록

### 주요 트랜잭션
| T-code | 용도 |
|--------|------|
| SM_CRM | ChaRM 관리 콘솔 |
| SMCR | 변경 요청 생성 |
| /TMWFLOW/CMSCONF | ChaRM 워크플로 설정 |

## 5. 한국 현장 특수 사항

### 승인 체계
- 한국 대기업: 3~4단계 승인 (팀장 → 부서장 → 본부장 → CIO)
- 긴급 변경: 구두 승인 → 24시간 내 서면 소급 승인
- 그룹웨어 연동: 전자결재 → SolMan 자동 연계 (커스텀 개발 필요)

### K-SOX 요구사항
- 변경관리 절차 문서화 필수 (ITGC 통제 항목)
- 변경 이력 최소 5년 보관
- 외부 감사인 접근 가능한 형태로 관리

## 참조
- `docs/best-practices/transport-management.md` — Transport 관리
- `docs/best-practices/authorization-governance.md` — 권한 관리
- `docs/enterprise/system-landscape.md` — 시스템 랜드스케이프
