# 이관 관리 Best Practice (Transport Management)

> Tier 3 — Governance BP | 적용: 전 모듈 | ECC: ✓ | S/4: ✓

## 1. Transport 기본 원칙

### 절대 규칙
1. **프로덕션 직접 변경 금지** — 모든 변경은 DEV → QAS → PRD 경유
2. **SE16N 프로덕션 편집 금지** — 테이블 직접 수정은 감사 부적합
3. **Transport 없는 커스터마이징 금지** — Client-dependent 설정은 반드시 Transport 포함
4. **Import 전 백업** — PRD import 전 시스템 상태 확인

### Transport 유형
| 유형 | 용도 | 생성 |
|------|------|------|
| **Workbench** (SXXX) | ABAP 개발 객체 (프로그램, 함수, 테이블) | SE80, SE38 등 |
| **Customizing** (CXXX) | IMG 설정 변경 | SPRO, SM30 등 |
| **Transport of Copies** (ToC) | 복사본 이관 (원본 잠금 없음) | SE01 |

## 2. Transport 경로 설계

### 표준 3-tier
```
DEV (100) ──→ QAS (200) ──→ PRD (300)
   │              │
   └── SBX (110)  └── TRN (210)
```

### ChaRM 통합 (Solution Manager)
```
RFC 연결: DEV ↔ SolMan ↔ QAS ↔ PRD
Change Request → Transport 자동 생성 → 승인 워크플로 → Import
```

## 3. Transport 운영 체크리스트

### 일간 (Tier 1)
- [ ] **STMS Import Queue 확인** — QAS/PRD 대기 Transport 확인
- [ ] **Import 로그 확인** — RC=0 (성공), RC=4 (경고), RC=8+ (오류)
- [ ] **SE01 미릴리즈 Transport** — 오래된 미릴리즈 요청 정리

### 주간 (Tier 2)
- [ ] **SE03 Transport 통계** — 주간 Import 건수, 오류율 추적
- [ ] **STMS QA 시스템 Import 일정** — 정기 Import 스케줄 확인
- [ ] **미사용 Transport 정리** — 30일 이상 미릴리즈 → 확인 후 삭제

### 월간 (Tier 3)
- [ ] **Transport 경로 검증** — STMS 설정 정합성 확인
- [ ] **버퍼 동기화** — STMS > Extras > Buffer Synchro
- [ ] **tp 로그 디스크 정리** — /usr/sap/trans/log 용량 확인

## 4. Transport 오류 대응

### RC=8 이상 오류 해결 플로우
1. **STMS → Import 로그 확인** — 오류 메시지 식별
2. **원인 분류**:
   - 선행 객체 누락 → 선행 Transport 먼저 import
   - 네임스페이스 충돌 → SE03에서 네임스페이스 등록
   - 잠금 충돌 → 잠금 해제 후 재시도
   - 데이터 불일치 → 수동 조정 (최후의 수단)
3. **재시도**: STMS > Import > Add to Queue > Import
4. **에스컬레이션**: RC=12+ → Basis 팀 + SAP 지원

### Transport 롤백
- SAP는 **자동 롤백을 지원하지 않음**
- 대안: 이전 상태의 Transport of Copies를 생성하여 덮어쓰기
- 데이터 테이블: SE16N에서 이전 값 확인 → 수동 복원 (승인 필수)

## 5. 한국 현장 특수 사항

### 망분리 환경
- DEV 시스템이 인터넷망, PRD가 업무망에 있을 때 Transport 파일 전달 방식
- USB/CD 반출 절차 (망분리 규정 준수)
- 자동화 제한: SolMan ChaRM 사용 시 망간 RFC 연결 이슈

### 변경관리 승인 체계 (한국 대기업)
- 팀장 → 부서장 → IT 부서장 3단계 승인이 일반적
- 긴급 변경: 사후 승인 허용, 단 24시간 내 문서화 필수

## 6. S/4HANA 변경 사항

| 항목 | ECC | S/4HANA |
|------|-----|---------|
| Transport 도구 | STMS | STMS + CTS+ (향상된 CTS) |
| BTP 확장 | N/A | gCTS (Git-enabled CTS) |
| Fiori Tile | N/A | Fiori Catalog/Group도 Transport 대상 |
| Cloud | N/A | Cloud PE는 STMS 없음 (SAP 관리) |

## 참조
- `plugins/sap-basis/skills/sap-basis/SKILL.md` — STMS 상세
- `docs/enterprise/system-landscape.md` — 시스템 랜드스케이프
- `docs/best-practices/change-management.md` — 변경관리 프로세스
