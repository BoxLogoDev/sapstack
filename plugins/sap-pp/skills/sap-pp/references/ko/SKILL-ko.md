# SAP PP 한국어 전문 가이드

> `plugins/sap-pp/skills/sap-pp/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- SAP 릴리스 (ECC / S/4HANA — MRP Live 차이)
- 생산 방식: Discrete / Process / Repetitive / KANBAN
- MRP 방식: Classic / MRP Live (S/4 HANA push-down)
- 플랜트 및 MRP 영역

## 2. Master Data

### BOM (Bill of Materials)
- **CS01/CS02/CS03**: 생성/변경/조회
- **CS11**: BOM Level-by-level 탐색
- **CS13**: Multi-level BOM Explosion
- 유효기간 관리 (Valid From)

### Routing (작업순서)
- **CA01/CA02/CA03**: Routing 생성/변경/조회
- **CA11**: Reference Operation Set
- Work Center 연계

### Work Center
- **CR01/CR02/CR03**: Work Center 생성/변경/조회
- **CR05**: Work Center 리스트
- **CR11**: Capacity 조회

## 3. MRP (Material Requirements Planning)

### Classic MRP (ECC)
- **MD01**: Total Planning (전사 MRP, **운영시간 외 권장**)
- **MD02**: Single-Item, Multi-Level
- **MD03**: Single-Item, Single-Level
- **MD04**: Stock/Requirements List (핵심 조회)
- **MD41/MD43**: Planning Evaluation

### MRP Live (S/4HANA)
- **MD01N**: MRP Live (HANA push-down)
- CDS View 기반
- 성능 대폭 향상 (대기업 MRP 시간 단축)

### 설정
- **OMI8**: MRP Type 정의
- **OMDU**: Planning Run Parameters
- **OPPQ**: Plant Parameters

### Low-Level Code
- **OMIW**: Low Level Code 재계산
- BOM 변경 시 필수

### Planned Independent Requirement (PIR)
- **MD61**: 생성
- **MD62**: 변경
- **MD63**: 조회
- 수요 예측 반영

## 4. Production Order

### Life Cycle
```
Planned Order (MRP) → CO01 Production Order Create → Release
                              │
                              ▼
                    Material Issue (MIGO 261)
                              │
                              ▼
                    CO11N Confirmation → GR (MIGO 101)
                              │
                              ▼
                    KKS1 Variance → KO88 Settlement
```

### 트랜잭션
- **CO01/CO02/CO03**: Production Order 생성/변경/조회
- **CO11N**: Confirmation
- **CO15**: Cancel Confirmation
- **COOIS**: Order Info System
- **COGI**: Automatic Goods Movement Errors

## 5. Process Order (PP-PI)

- **COR1/COR2/COR3**: Process Order
- **COR6N**: Process Order Confirmation
- 공정산업(화학·제약·식품)용

## 6. Repetitive Manufacturing (REM)

- **MFBF**: Backflush
- **MF50**: Planning Table
- 자동 구성품 소모 + 완제품 입고 동시

## 7. KANBAN
- **PK01**: Control Cycle
- **PK13N**: KANBAN Board
- 신호 기반 재보충

## 8. 확정 (Confirmation)

### Types
- **Milestone Confirmation**: 특정 공정 확정 시 선행 자동 확정
- **Final Confirmation**: 오더 종료
- **Partial Confirmation**: 부분 확정

### 한국 현장
- 자동 confirmation과 수동 confirmation 혼재
- MES 연동으로 실시간 confirmation 전송

## 9. 한국 특화

### 제조업 비중
- 한국 대기업은 제조업 중심 — PP는 핵심 모듈
- 삼성 반도체·LG 디스플레이·현대차·SK하이닉스 등

### 외주 처리
- **Subcontracting** 복잡 — 수탁 vs 위탁 구분
- 외주 단가 협상 주기적 (MEK1/MEK2)

### 납품 통제
- 요구사항 엄격 — 납기·품질·수량
- **Delivery Schedule** + **Release Schedule** 관리

### MES 연동
- Work Center별 실시간 생산 데이터 수집
- 한국 SI 현장: FactoryTalk, Ignition, MII 등 다양
- 커넥터는 대부분 커스텀 RFC/IDoc

## 10. 표준 응답 형식

```
## Issue
## Root Cause
## Check
## Fix
## Prevention
## SAP Note
```

## 11. 관련
- `quick-guide.md`
- `/plugins/sap-mm/skills/sap-mm/references/ko/SKILL-ko.md` — 구성품 재고
- `/plugins/sap-co/skills/sap-co/references/ko/SKILL-ko.md` — 생산원가
- `/agents/sap-pp-analyzer.md` — PP 분석 에이전트 (v1.3.0 신규)
