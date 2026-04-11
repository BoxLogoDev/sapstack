# SAP FI 한국어 전문 가이드

> 이 문서는 `plugins/sap-fi/skills/sap-fi/SKILL.md`의 한국어 병렬 버전입니다. 영문 원본은 키워드 자동 활성화를 위해 유지되며, 이 문서는 한국어 독자를 위한 **전문 번역**입니다. 퀵가이드는 `quick-guide.md` 참조.

## 1. 환경 인테이크 체크리스트

FI 이슈가 보고되면 답변 전에 반드시 다음을 수집하세요:

- **SAP 릴리스** (ECC 6.0 EhPx / S/4HANA 19xx/20xx/21xx/22xx/23xx)
- **배포 모델** (On-Premise / RISE / Cloud PE)
- **회계연도 변형** (달력 / 비달력 — 몇 월 시작?)
- **에러 메시지 번호와 T-code** (발생 지점)
- **회사코드** (사용자가 제공 — 절대 추정 금지)

---

## 2. AP — 채무회계

주요 이슈와 T-code + 테이블 레벨 진단:

### 벤더 송장 포스팅 오류 (FB60 / MIRO)
- **세금코드 미할당**: FTXP → 세금 절차 → 회사코드 할당 확인
- **허용오차 초과**: OMR6 → 회사코드별 허용오차 키 (금액 / 백분율)
- **GR 기반 IV 불일치**: PO 항목 → Invoice 탭 → GR-based IV 플래그 vs 입고 수량

### 지급실행 (F110)
- **선택 항목 없음**: Open Item 만기일, 벤더 마스터의 지급방법 (LFB1.ZWELS), 하우스뱅크 할당 확인
- **하우스뱅크 결정 실패**: FBZP → Bank Determination → Ranking Order → House Bank / Account ID
- **DME 파일 미생성**: DMEE → 지급 매체 트리 포맷이 지급방법에 할당되었는지

### 원천세 누락
- WTAD → 원천세 유형이 회사코드에 할당되지 않음
- SPRO → FI → 원천세 → Extended Withholding Tax → 회사코드 → 원천세 유형 할당

### 벤더 마스터 이중 승인 (Dual Control)
- FKMT → 두 번째 승인 대기 중인 변경
- LFA1 / LFB1 테이블의 필드 변경 로그 확인

### 재집계 계정(Reconciliation Account) 직접 포스팅 불가
- **근본 원인**: LFB1.AKONT이 재집계 계정 (FS00 → Recon Account Type = K)
- **해결**: FB60(벤더 송장) 또는 특수원장(F-47/F-48) 사용 — FB01 직접 포스팅 금지

---

## 3. AR — 채권회계

### 고객 송장
- **FB70** (FI 직접) / **VF01** (SD 빌링 — SD 통합 흐름에서 권장)
- **Dispute Management**: UDM_DISPUTE (S/4HANA FSCM)

### 독촉 (F150)
- **독촉 절차**: FBMP → 독촉 레벨, 최소 금액, 이자
- **독촉 영역**: 회사코드 → 독촉 영역 할당
- **독촉 차단**: FD02 → Correspondence 탭 → 독촉 블록

### 여신 관리
- **ECC**: FD32 → Credit Control Area별 여신 한도
- **S/4HANA FSCM**: UKM_BP → 신용 세그먼트 → 한도 / 규칙 기반 체크
- **차단 주문 해제**: VKM1 (오더) / VKM3 (출하)

### 선수금 프로세스 (AR)
- **요청**: F-37 (Special G/L indicator F)
- **선수금**: F-29 (특수원장에 포스팅)
- **송장과 청산**: F-39

---

## 4. GL — 총계정원장

### 필드 상태 충돌 (가장 제한적 규칙 적용)
- **세 가지 소스 확인**: OBC4 (문서유형 FSG) + OB14 (Posting Key FSG) + FS00 (계정 FSG)
- **규칙**: Required > Optional > Suppressed — 어느 하나라도 Required면 해당 필드는 Required

### 기간 제어
- **OB52** → 기간 변형 → 계정 유형(A/D/K/M/S)별 기간 열기/닫기
- **특수 기간 13~16**: 연말 감사 / 세무 조정 기간
- **변형을 회사코드에 할당**: OBY6

### 잔액 이월
- **ECC**: F.16 (P&L을 이익잉여금 계정으로 이월)
- **S/4HANA**: FAGLGVTR (Universal Journal 이월)
- 모든 연말 포스팅이 완료된 후 실행해야 함

### 외화평가
- **ECC**: F.05 → 평가 방법별, GL 계정 선택
- **S/4HANA**: FAGL_FC_VAL → 원장 기반, 병렬통화 지원
- **평가방법 설정**: OB59 → 환율 유형, 손익 계정

### 회사 간 청산
- **OBYA** → 회사코드 쌍별 Due-to / Due-from 청산 계정
- **Cross-company 문서**: 하나의 헤더 + 두 회사코드 동시 포스팅 (자동)

---

## 5. 특수원장 거래 (Special G/L Transactions)

| 유형 | 설명 | 벤더 T-code | 고객 T-code |
|------|------|-------------|-------------|
| A/F | 선수금 요청 | F-47 | F-37 |
| F | 선수금 | F-48 | F-29 |
| — | 선수금 청산 | F-54 | F-39 |
| B/G | 보증 (통계성) | F-55 | F-49 |
| W/V | 어음 (Bills of Exchange) | F-36 | F-33 |

**설정 확인 경로**:
- **OBXT** → AP 특수원장 → 자동 계정 결정
- **OBXR** → AR 특수원장 → 자동 계정 결정
- **TBSLT** → 특수원장 지시자 속성 (noted item / statistical / free offsetting)

---

## 6. 자산회계 (FI-AA)

### 자산 마스터 생성
- **AS01** (신규 자산) / **AS91** (기존 데이터 이관 — 이력 가치 포함)
- **자산 클래스**가 결정하는 것: 감가상각 키, 내용연수, G/L 계정 (AO90)

### 자산 포스팅
- **취득**:
  - F-90 (외부 구매)
  - MIGO 101 + PO (입고 → 자본화)
- **자산 간 이관**: ABUMN (동일 회사코드 내)
- **부분/전체 폐기**:
  - ABAVN (수익 없이)
  - ABAON (수익 포함)

### 감가상각 실행 (AFAB)
- **반드시 Test Mode 먼저** → AFBP(감가상각 포스팅 로그) 확인
- **Repeat Run**: 에러와 함께 포스팅된 경우 → AFAB → Repeat Run for Period
- **감가상각 키 설정**: AFAMA → 기간 제어 방법 → 기준 가치

### 연말 자산 절차
- **AJAB**: 자산회계 회계연도 마감 → 닫힌 연도 추가 포스팅 차단
- **AJRW**: 새 회계연도 열기 → 새 연도 포스팅 전 필수

### S/4HANA 차이점
- **New Asset Accounting만 지원** (Classic AA 미지원)
- **병렬 원장** 필수 (Multi-GAAP 시나리오)
- **APC 값**은 ACDOCA (Universal Journal)에 저장 — 별도 AA 테이블 아님

---

## 7. GR/IR 계정 관리

공통 청산 프로세스:

1. **MB5S** → GR/IR 잔액 분석 → 노후/불일치 항목 식별
2. **MR11** → 자동 GR/IR 청산 제안 (**항상 시뮬레이션 먼저 — Test Run**)
3. **수동 역분개**: PO가 GR 없이 취소된 경우 → GR 문서 역분개 (MIGO 102)
4. **월말 accrual**: GR은 포스팅됐지만 송장이 없는 경우 → FBS1로 accrual + F.81로 차월 역분개

**S/4HANA**: GRIR Fiori 앱 (Manage GR/IR Accounts)이 운영용 MB5S를 대체

---

## 8. 월결산 / 연결산 공통 순서

| Step | 활동 | T-code | ECC | S/4HANA |
|------|------|--------|-----|---------|
| 1 | MM 기간 닫기 | MMPV | ✓ | ✓ |
| 2 | AP 연령분석 | S_ALR_87012085 | ✓ | ✓ |
| 3 | AR 연령분석 | S_ALR_87012078 | ✓ | ✓ |
| 4 | GR/IR 분석 | MB5S / MR11 | MB5S | GRIR Fiori |
| 5 | Open Item 청산 (시뮬) | F.13 | ✓ | ✓ |
| 6 | Open Item 청산 (실행) | F.13 | ✓ | ✓ |
| 7 | FC 평가 | F.05 / FAGL_FC_VAL | F.05 | FAGL_FC_VAL |
| 8 | 회사 간 조정 | F.19 / FBICR | ✓ | ✓ |
| 9 | Accruals (차월 역분개) | FBS1 → F.81 | ✓ | ✓ |
| 10 | 자산 감가상각 (Test 먼저) | AFAB | ✓ | ✓ |
| 11 | CO 배부 | KSU5 / KSV5 | ✓ | ✓ |
| 12 | 재무제표 | F.01 / S_ALR_87012284 | ✓ | ✓ |
| 13 | 잔액 이월 (연말) | F.16 / FAGLGVTR | F.16 | FAGLGVTR |

---

## 9. ECC vs S/4HANA 핵심 차이

| 주제 | ECC | S/4HANA |
|------|-----|---------|
| GL 라인 아이템 테이블 | BSEG + BSID/BSAD/BSIK/BSAK | **ACDOCA (Universal Journal)** |
| 자산회계 | Classic AA 또는 New AA | **New Asset Accounting만** |
| 여신 관리 | FD32 | **FSCM / UKM_MY_LIMIT** |
| 독촉 | F150 | F150 (동일) |
| 외화평가 | F.05 | **FAGL_FC_VAL** |
| 잔액 이월 | F.16 | **FAGLGVTR** |
| Material Ledger | 선택 | **필수** |
| Profit Center | EC-PCA (선택) | **Universal Journal에서 필수** |
| GR/IR 모니터링 | MB5S | **GRIR Fiori 앱** |

---

## 10. 한국 현장 주의사항 (원본 영문판 추가 컨텍스트)

### 한국 특화 규정
- **K-IFRS**: 한국채택국제회계기준 — 상장사 필수 적용
- **월결산 엄격**: 대기업 월 5~7일 차 마감 표준
- **전자세금계산서**: 부가가치세법 2011년 이후 법인 의무
- **원천세**: 사업/근로/기타 소득별 자동 분개
- **K-SOX**: 상장사 내부통제 — 분개입력자 ≠ 승인자

### 한국 현장 특이 이슈
- 원화(KRW) 소수점 없음 — 외화 환산 시 반올림 규칙
- 원화 기반 FAGL_FC_VAL 평가일자 주의
- CVI KR (Country Version Korea) 관련 설정은 `sap-bc` 플러그인 참조

### 자주 참조하는 SAP Note (data/sap-notes.yaml)
- **3092819** — Country Version Korea S/4HANA Localization Roadmap
- **2269324** — S/4HANA Simplification List
- **2214213** — FI/CO Conversion in S/4HANA
- **2265093** — Business Partner Migration

---

## 11. 관련 자료

- `../tcode-reference.md` — 영역별 전체 FI T-code 리스트
- `../closing-checklist.md` — 인쇄 가능한 월결산 체크리스트
- `quick-guide.md` — 한국어 퀵가이드 (짧은 요약)
- `../../../../sap-bc/skills/sap-bc/SKILL.md` — 한국 BC/localization 특화
- `../../../../sap-co/skills/sap-co/SKILL.md` — CO와 FI 통합 주제
- `/agents/sap-fi-consultant.md` — FI 전문 서브에이전트
- `/commands/sap-fi-closing.md` — 결산 체크리스트 슬래시 커맨드
