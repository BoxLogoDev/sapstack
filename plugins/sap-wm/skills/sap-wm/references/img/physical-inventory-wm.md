# WM 물리적 재고실사 (Physical Inventory) IMG 구성 가이드

## SPRO 경로
`SPRO → Logistics Execution → Warehouse Management → Activities → Physical Inventory`

## 필수 선행 구성
- [ ] 창고 구조 정의 완료
- [ ] 자재 마스터 WM 뷰 설정
- [ ] WM 회계연도 기간 열림 확인

## 구성 단계

### 1. Physical Inventory 유형 정의 — T-code: LI01N
- Inventory methods:
  - **Continuous Inventory**: 상시 실사
  - **Annual Inventory**: 연간 실사
  - **Cycle Counting**: 주기적 실사
  - **Zero Stock Check**: 0 재고 확인
- Document category: WI (Warehouse Inventory)

### 2. Cycle Counting 설정 — SPRO
- `SPRO → WM → Activities → Physical Inventory → Cycle Counting`
- Cycle Counting Indicator (A/B/C/D)
- 자재 마스터 MARC-CCFIX 필드에 지시자 할당
- A: 연 4회 | B: 연 2회 | C: 연 1회 | D: 필요시

### 3. 실사 문서 번호범위 — T-code: LN02
- Number range object: LVS_LINV
- Internal vs External 번호 채번

### 4. 실사 차이 처리 규칙 — SPRO
- `SPRO → WM → Physical Inventory → Clear Differences`
- 차이 한도 설정 (Tolerance)
- 자동 승인 임계값
- GL 계정 결정 (OBYC TU keys)

### 5. 실사 진행 절차 — T-codes
- **LI01N**: 실사 문서 생성 (Create PI Document)
- **LI02N**: 실사 문서 변경 (Count blocking)
- **LI11N**: 실사 수량 입력 (Enter Inventory Count)
- **LI20**: 차이 확인 (Recount or Clear)
- **LI21**: 차이 정산 (Clear Differences)
- **LI06**: 실사 상태 조회

## 구성 검증
- LI11N에서 실사 수량 입력 → LI20에서 차이 확인
- LI04로 미완료 실사 목록 조회
- MB52 vs LS24 재고 일치 여부 확인 (WM ↔ MM 대사)

## MM 재고실사와의 관계
- WM 실사(LI01N)는 Storage Bin 단위
- MM 실사(MI01)는 Plant/Storage Location 단위
- 두 실사 결과는 별도 관리, 최종 대사 필수

## 주의사항
- 실사 기간 중에는 해당 Bin에 Transfer Order 생성 차단
- 차이 정산(LI21)은 MM 전표 자동 생성 — 회계 영향
- Cycle Counting 지시자는 자재별 설정 — 일관성 유지
- **S/4HANA**: WM deprecated → EWM의 /SCWM/PI 사용
