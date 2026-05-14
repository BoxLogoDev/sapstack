# sapstack Expansion — Directory Structure Update (v2.1.0)

## New Top-Level Directories (2026-04-15)

### 1. **country/** — SAP 국가별 로컬라이제이션
**목적**: 각 국가의 SAP CVI (Country Version) 요구사항 한 곳에 정리

**현황**:
- `country/README.md` — CVI 개념, sapstack 지원 국가, 신규 추가 가이드
- `country/korea.md` — CVI KR (한국) — K-SOX, 부가세, 원천세, 4대보험, 망분리, 전자세금계산서
- `country/germany.md` — CVI DE (독일) — GoBD, SEPA, DATEV, DSGVO, VAT

**다음 추가 예정**:
- `country/japan.md` — CVI JP (일본)
- `country/china.md` — CVI CN (중국)
- `country/vietnam.md` — CVI VN (베트남)
- `country/usa.md` — CVI US (미국)

**용도**:
- 운영자: "우리 나라의 세무 규정은?" → country/korea.md 참조
- 컨설턴트: SAP 구성 시 국가별 법제 확인
- 컴플라이언스: 준법 감시 체크리스트 (월/분기/연)

---

### 2. **bridge/** — SAP 시스템 브리지 패턴
**목적**: SAP ↔ AI 도구 간 데이터 교환 패턴 (RFC, OData, IDoc, CPI, REST)

**현황**:
- `bridge/README.md` — 패턴 개요, 선택 가이드, 보안 체크리스트
- `bridge/rfc-pattern.md` — RFC/BAPI (온프레미스 ERP/S4H) — PyRFC 코드 포함
- `bridge/odata-pattern.md` — OData v2/v4 (S/4HANA) — JavaScript/Python 코드 포함

**다음 추가 예정**:
- `bridge/rest-pattern.md` — REST API (S/4HANA Cloud PE)
- `bridge/idoc-pattern.md` — IDoc 메시징 (레거시)
- `bridge/cpi-pattern.md` — SAP Cloud Integration (BTP)
- `bridge/templates/` — 샘플 코드 (Python, JavaScript, Bash)

**용도**:
- 개발자: "S/4HANA에서 거래 데이터를 가져오려면?" → bridge/odata-pattern.md
- 운영자: "망분리 환경에서 SAP와 외부 시스템 연동이 가능한가?" → bridge/README.md
- Evidence 루프: 자동 데이터 수집 스크립트 (RFC/OData 호출)

---

## 파일 규모

| 디렉토리 | 파일 수 | 총 라인 | 예상 읽기 시간 |
|----------|--------|--------|-------------|
| **country/** | 5 (2 완성) | 1,238 | 45분 |
| **bridge/** | 5 (3 완성) | 1,364 | 50분 |
| **총계** | 10 파일 | 2,602 라인 | 95분 |

---

## 통합 위치 (기존 구조와의 관계)

```
sapstack/
├── docs/
│   ├── architecture.md          (전체 설계 개요)
│   ├── best-practices/          (3-Tier BP)
│   └── compliance/              (K-SOX, GDPR, GoBD 등)
│
├── country/                     ← NEW (2026-04-15)
│   ├── README.md
│   ├── korea.md
│   └── germany.md
│
├── bridge/                      ← NEW (2026-04-15)
│   ├── README.md
│   ├── rfc-pattern.md
│   └── odata-pattern.md
│
└── README.md
```

---

## 네비게이션 가이드

### 시나리오 1: "부가세 신고를 어떻게 하나요?"

1. `country/README.md` 읽기 (CVI 개념)
2. `country/korea.md` 섹션 2 읽기 (부가세 규정)
3. SAP 구성: T코드 FTXP, VOFI 참조

### 시나리오 2: "온프레미스 SAP에서 AI에게 데이터를 어떻게 보내나요?"

1. `bridge/README.md` 읽기 (패턴 선택)
2. `bridge/rfc-pattern.md` 읽기 (PyRFC 코드)
3. RFC 사용자 생성 (T코드: SU01, PFCG)

### 시나리오 3: "클라우드 S/4HANA에서 데이터를 가져오려면?"

1. `bridge/README.md` 읽기 (OData 패턴)
2. `bridge/odata-pattern.md` 읽기 (JavaScript/Python 코드)
3. OAuth 2.0 설정 (T코드: /IWFND/MAINT_OAUTH)

---

## 버전 히스토리

### v2.1.0 (2026-04-15) — 현재
- **NEW**: country/ 디렉토리 (Korea, Germany CVI 포함)
- **NEW**: bridge/ 디렉토리 (RFC, OData 패턴 포함)
- 총 2,602 라인 SAP 전문 기술 문서

### v2.2.0 (TBD)
- 국가별 확장 (JP, CN, VN, US)
- 망분리 상세 가이드

### v2.3.0 (TBD)
- Python/Node.js 클라이언트 라이브러리
- IDoc, CPI 패턴

---

## 기여 가이드

### 새로운 국가 추가

1. `country/templates/cvi-template.md` 복사
2. 정부 공식 가이드 + SAP Note 참조
3. PR 제출 (검수 후 머지)

### 피드백

- 법제 오류/최신화: Issue 등록
- 번역: 언어별 네이티브 검수 환영
- 코드 샘플: Python/JS/Bash 모두 환영

---

**Maintained by**: sapstack team
**License**: MIT + SAP Legal Compliance
**Last Update**: 2026-04-15
