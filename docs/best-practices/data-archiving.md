# 데이터 아카이빙 전략 (Data Archiving)

> Tier 3 — Governance BP | 적용: 전 모듈 | ECC: ✓ | S/4: ✓

## 1. 아카이빙이 필요한 이유

- **성능**: 대용량 테이블(BSEG, MSEG, VBAK, AUFK)은 시간이 지날수록 성능 저하
- **비용**: 데이터 볼륨 → DB 스토리지 비용 → HANA 라이선스 비용 (메모리 기반)
- **규정**: 데이터 보관 기한 경과 후 삭제 의무 (개인정보보호법)
- **운영**: System Refresh, 백업/복원 시간 단축

## 2. SAP 아카이빙 프로세스

### 3단계 프로세스
```
1. Write (SARA) — 아카이빙 파일 생성 (.ADK)
2. Delete (SARA) — DB에서 원본 데이터 삭제
3. Store — 아카이빙 파일을 외부 저장소로 이동
```

### 핵심 T-code
| T-code | 용도 |
|--------|------|
| SARA | 아카이빙 관리 (객체별 실행) |
| AOBJ | 아카이빙 객체 정의 |
| AL11 | 아카이빙 파일 경로 확인 |

## 3. 모듈별 아카이빙 객체

| 모듈 | 아카이빙 객체 | 대상 테이블 | 보관 기한 (한국) |
|------|-------------|-----------|----------------|
| **FI** | FI_DOCUMNT | BKPF, BSEG | 10년 (상법) |
| **FI-AA** | MM_MATBEL | ANLA, ANLB | 10년 |
| **MM** | MM_MATBEL | MKPF, MSEG | 5년 |
| **MM-PO** | MM_EKKO | EKKO, EKPO | 5년 |
| **SD** | SD_VBAK | VBAK, VBAP | 5년 |
| **SD-Billing** | SD_VBRK | VBRK, VBRP | 10년 (세금계산서) |
| **PP** | PP_ORDER | AUFK, AFKO | 3년 |
| **PM** | PM_ORDER | AUFK, AFIH | 5년 (산안법: 설비 이력) |
| **CO** | CO_ORDER | AUFK, COBK | 5년 |
| **HCM** | PA_CALC | PCL2 (급여 클러스터) | 5년 (근로기준법) |

## 4. 아카이빙 전략

### 보관 기한 설계
```
한국 법적 기한:
- 상법: 10년 (회계장부, 재무제표)
- 세법: 5년 (세금계산서, 증빙)
- 근로기준법: 3년 (근로자명부, 급여대장) → 실무 5년 권장
- 산업안전보건법: 3년 (점검 기록) → 설비 이력은 장비 수명까지
- 개인정보보호법: 목적 달성 시 즉시 파기 (보관 기한 없으면 3년)
```

### 단계적 접근
1. **분석**: 테이블별 데이터 볼륨 확인 (DB02, SE14)
2. **시범**: DEV/QAS에서 소량 테스트 아카이빙
3. **검증**: 아카이빙 후 리포트/거래 정상 동작 확인
4. **실행**: PRD 정기 아카이빙 스케줄 수립

### S/4HANA HANA 환경
- HANA는 인메모리 → 데이터 볼륨이 직접 라이선스 비용에 영향
- **Data Tiering**: Hot (HANA) → Warm (Extension Node) → Cold (DLA/Hadoop)
- **ILM (Information Lifecycle Management)**: SAP ILM으로 자동 분류 + 보관

## 5. 주의사항

- 아카이빙 전 **Residence Time** 확인 — 최소 보관 기간 미경과 데이터 삭제 방지
- **마스터데이터**는 아카이빙 대상이 아님 (트랜잭션 데이터만)
- 아카이빙 파일은 **SAP에서만 읽을 수 있음** → 장기 보관 시 접근성 고려
- **Custom 테이블**은 별도 아카이빙 객체 개발 필요 (AOBJ)

## 참조
- `plugins/sap-basis/skills/sap-basis/SKILL.md` — DB 관리
- `docs/enterprise/system-landscape.md` — 스토리지 전략
