# EWM 일간 운영 Best Practice

## 적용 범위
- S/4HANA: ✓ | ECC: 별도 추가 모듈(deprecated)

## 개요
고급 창고 관리의 일일 점검 체크리스트. Warehouse Order(WO) 처리, Wave 관리, 자동화 시스템 모니터링을 포함합니다.

---

## 체크리스트

### EWM 모니터링 대시보드 확인
- [ ] **/SCWM/MON EWM 운영 현황** — T-code: /SCWM/MON
  - 왜: 전체 창고 운영 상태 실시간 파악, 병목 지점 조기 발견
  - 빈도: 매일 08:00, 12:00, 16:00 (3회)
  - 세부:
    ```
    주요 메트릭:
    - Active Warehouse Orders: 진행 중 작업 수
    - Wave Status: 파도별 진행률 (0~100%)
    - Resource Utilization: 인력/자동화 설비 활용률 (%)
    - Orders Processed: 시간당 처리된 주문 수
    - Average Cycle Time: 평균 사이클 타임(분)
    ```
  - 임계값:
    ```
    - WO Backlog > 500건 → 병목 발생 신호
    - Resource Utilization < 60% → 유휴 자원
    - Average Cycle Time > 15분 → 효율성 저하
    ```

### 미처리 Warehouse Order 확인
- [ ] **미결 WO 조회** — T-code: /SCWM/ORD 또는 /SCWM/SHD
  - 왜: 픽/팩 작업 우선순위 관리, 출고 기한 준수
  - 빈도: 매일 08:00, 14:00 (2회)
  - 세부:
    ```
    필터 조건:
    - Status: 'Created' 또는 'Started' (미완료)
    - Priority: 1(긴급) 필터링 우선
    - Start By: 오늘 또는 과기한
    ```
  - 조치:
    ```
    Priority별 처리:
    - Level 1(긴급): 2시간 이내 완료 목표
    - Level 2(높음): 4시간 이내
    - Level 3(보통): 당일 완료
    ```

### Wave Release 및 집행
- [ ] **Wave 출고 집행** — T-code: /SCWM/WAVE
  - 왜: 일괄 처리로 효율성 향상, 배송 그룹 최적화
  - 빈도: 매일 06:00(야간), 12:00(정오), 18:00(저녁) (3회)
  - 세부:
    ```
    Wave 프로세스:
    1. Wave Creation: 고객 주문 그룹화 (지역별, 운송사별)
    2. Wave Planning: 픽 경로 최적화, 자원 할당
    3. Wave Release: 픽 작업 창고에 전달
    4. Wave Execution: 현장 작업 진행 모니터링
    5. Wave Close: 완료 확인 → 배송
    
    목표:
    - Wave당 주문수: 30~50개 (규모에 따라)
    - Wave 완료 시간: 4~6시간
    ```

### Bin(빈) 최적화 및 Rearrangement
- [ ] **Rearrangement 작업** — T-code: /SCWM/REAR
  - 왜: 피킹 효율성 향상, 이동 거리 최소화
  - 빈도: 주 1회(목요일 야간)
  - 세부:
    ```
    Rearrangement 원리:
    - 빠른 회전 부품(Fast Mover): 픽 스테이션 근처
    - 느린 회전 부품(Slow Mover): 먼 곳
    - 함께 자주 주문되는 부품: 인접 배치
    
    작업:
    1. 시스템 분석: 지난 1개월 픽 데이터 분석
    2. 최적 배치안 산출
    3. 사람/자동화로 물품 이동
    4. 효율성 재검증 (이동 거리 %)
    
    기대 효과: 픽 시간 20~30% 단축
    ```

### Resource(자원) 활용률 모니터링
- [ ] **RF 휴대 터미널 및 자동화 설비** — T-code: /SCWM/RES
  - 왜: 자원 배분 최적화, 병목 조기 발견
  - 빈도: 일간 실시간(대시보드)
  - 세부:
    ```
    자원 모니터링:
    - 활성 작업자: ___명 (목표: ___명)
    - RF 터미널 가동률: __% (목표: 85~95%)
    - 자동 컨베이어: __% (목표: 90~98%)
    - 로봇 가동률: __% (도입 시)
    
    부하 분산:
    - 작업자 per 주문: 1~2명 (피크 시간)
    - 컨베이어 처리량: 시간당 ___상자
    ```

### 품질 및 선택 오류(Pick Accuracy)
- [ ] **Pick Accuracy 모니터링** — T-code: /SCWM/QC 또는 /SCWM/ACT
  - 왜: 고객 반품 감소, 신뢰성 향상
  - 빈도: 주 1회(현황 리뷰)
  - 세부:
    ```
    정의:
    Pick Accuracy = (정확한 픽 건수 / 전체 픽 건수) × 100%
    
    목표: 99.5% 이상
    
    오류 분류:
    - 수량 오류: 지정 수량 < 픽 수량
    - 품목 오류: 잘못된 부품 픽
    - 주소 오류: 잘못된 빈에서 픽
    
    원인:
    - RF 스캔 오류 → RF 교육 강화
    - 바코드 마모 → 라벨 재인쇄
    - 작업자 주의 부족 → 품질 교육
    ```

### 재고 정확성 (EWM 레벨)
- [ ] **재고 모니터링** — T-code: /SCWM/INV
  - 왜: 픽/팩 신뢰성 확보, 고객 만족
  - 빈도: 주 1회
  - 세부:
    ```
    확인:
    - EWM 재고 vs ERP 재고(MM) 일치 여부
    - 차단(Hold) 재고: 사유 명확한가?
    - 폐기(Scrap) 재고: 처리 예정인가?
    
    불일치 시:
    1. 원인 파악: LPN(License Plate Number) 추적
    2. 조정: 자동 또는 수동 재고 보정
    ```

### 하루마감 운영 보고
- [ ] **일일 EWM 운영 리포트**
  - 시간: 매일 17:00
  - 내용:
    ```
    본일 운영 현황:
    - 처리 주문: ___건 (목표: ___)
    - 처리 라인: ___건 (목표: ___)
    - Pick Accuracy: __% (목표: 99.5%)
    - 평균 사이클 타임: __분 (목표: <15분)
    - Resource Utilization: __% (목표: 80~90%)
    
    예상 내일:
    - 예상 물량: ___건
    - 필요 자원: ___명
    - 특수 작업: ___
    
    이슈:
    - 설비 고장: 있음/없음
    - 인력 부족: 있음/없음
    ```

---

## SAP T-Code 빠른 참조

| T-Code | 영문명 | 용도 | 접근권 |
|--------|--------|------|--------|
| /SCWM/MON | EWM Monitor | 운영 대시보드 | EWM-MNT |
| /SCWM/ORD | Warehouse Order | WO 관리 | EWM-OPS |
| /SCWM/WAVE | Wave Management | 웨이브 관리 | EWM-OPS |
| /SCWM/REAR | Bin Rearrangement | 빈 최적화 | EWM-PLN |
| /SCWM/RES | Resource Management | 자원 관리 | EWM-OPS |
| /SCWM/QC | Quality Control | 품질 검증 | EWM-QC |
| /SCWM/INV | Inventory | 재고 관리 | EWM-INV |

---

## 운영 목표치

| 메트릭 | 목표 | 빈도 |
|--------|------|------|
| Wave Cycle Time | < 6시간 | 일간 |
| Pick Accuracy | ≥ 99.5% | 주간 |
| Resource Utilization | 80~90% | 일간 |
| Avg Order Lead Time | 24시간 | 일간 |

---

## 연계 프로세스

- **ERP(MM/SD)**: WO 자동 생성 → 출고 처리 연계
- **배송**: Wave Complete → TMS(Transport Management) 연계
- **품질**: Pick 오류 → QA 통보

---

**last updated: 2026-04**
