# sap-pp 한국어 퀵가이드

## 🔑 환경 인테이크
1. 생산 방식 (Discrete / Process / Repetitive / KANBAN)
2. MRP 방식 (Classic MRP / MRP Live — S/4)
3. 플랜트 및 생산조직 (사용자 제공)

## 📚 핵심

### Master Data
- **CS01/CS02**: BOM (자재명세서)
- **CA01/CA02**: Routing (작업순서)
- **CR01/CR02**: Work Center
- **MD04**: Stock/Requirements 리스트

### MRP
- **MD01**: MRP Run (전사 — 권장 비권장)
- **MD02**: MRP Run (단일 자재)
- **MD03**: MRP Run (단일 자재 멀티 레벨)
- **MD41/MD43**: Planning Evaluation
- S/4HANA: **MRP Live** (CDS + HANA push-down)

### Production Orders
- **CO01/CO02**: 생산오더 생성/변경
- **CO11N**: 확정 (Confirmation)
- **CO15**: 확정 취소
- **COGI**: 자동 GR 실패 목록 처리

### Repetitive Manufacturing
- **MFBF**: Backflush
- **MF50**: Planning Table

## 🇰🇷 특화
- **제조업 비중 큰 한국 현장** — PP는 핵심 모듈
- **외주 처리** (Subcontracting) 복잡 — 수탁/위탁 구분 주의
- **납품 통제** 요구 엄격 (삼성·현대 협력사 표준)

## ⚠️ 주의
- MD01 전사 MRP는 **운영시간 외에만** 실행
- BOM 변경 시 Low-level code 재계산 필수 (**OMIW**)
