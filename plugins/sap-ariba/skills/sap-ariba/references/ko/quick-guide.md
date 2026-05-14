# sap-ariba 한국어 퀵가이드

> SAP Ariba — 글로벌 조달 클라우드. Sourcing(소싱)·Contracts(계약)·Procurement(구매)·Network(공급사 협업).

## 🔑 환경 인테이크

1. **Ariba 에디션** — Sourcing / Procurement / SLP / Network?
2. **S/4 연동** — CIG (Cloud Integration Gateway)
3. **공급사 ecosystem** — Ariba Network 연결 공급사 수
4. **시나리오** — 소싱 이벤트 / 계약 / PR-to-PO / Network 통신

## 📚 모듈

| 모듈 | 한국어 | 용도 |
|---|---|---|
| **Sourcing** | 전략 조달 | RFI/RFP/RFQ + e-Auction |
| **Contracts** | 계약 관리 | template·redline·갱신 |
| **Procurement** | 구매 | catalog·PR·PO·invoice |
| **SLP** | 공급사 라이프사이클 | 적격성·리스크 |
| **Spend Analysis** | 지출 분석 | 분류·절감 추적 |
| **Network** | 공급사 협업 | 문서 교환·상태 |

## 🇰🇷 한국 현장 시나리오

### 조달 흐름
```
S/4 PR (ME51N) → Ariba 소싱 (전략 카테고리)
   → RFx 발송 → 입찰 → 낙찰
   → Ariba Contract 생성
   → 카탈로그 등록 → 사용자 구매
   → S/4 PO (ME21N) → GR/IV → 지급
```

### 자주 보는 패턴
- **국내 공급사**: Ariba Network 가입률 낮음 → 단계적 onboarding
- **글로벌 그룹**: 본사 Ariba + 한국 자회사 → 공통 카탈로그·계약 활용
- **공공 입찰**: KISTI 나라장터 우선 (Ariba는 민간)

### 한국 특화 통합 이슈
- **부가세**: 한국 V0~V9 세금코드 → Ariba mapping
- **사업자 등록번호**: Ariba 공급사 마스터에 사용자 정의 필드 추가
- **은행/지급**: 한국 은행 코드 → DMEE Korea 형식

## 🚨 자주 마주치는 이슈

### "공급사가 RFx를 못 받았다"
- ANID(Ariba Network ID) 확인 — 등록 완료된 공급사?
- 이메일 도착 확인 (스팸 폴더)
- Network 연결 정상 (공급사 측 로그인)

### "PR이 승인 안 됨"
- Approver delegation 설정 확인
- 부서 변경 시 approver 자동 갱신 안 됨

### "PO가 공급사에게 전송 안 됨"
- 공급사 Network 등록 상태 (Trading Relationship)
- 전송 방식 (Network / Email / cXML)
- 메시지 큐 (CIG monitor 확인)

### "Invoice mismatch"
- 3-way match (PO-GR-Invoice) 검증
- 부가세 코드 mapping
- 환율 (외국 통화 청구서)

## 🔧 통합 진단

CIG (Cloud Integration Gateway) 흐름:
1. S/4 측: ERP Integration Add-on for Ariba 활성
2. CIG Worker (Cloud Connector) GREEN
3. Ariba Realm 설정
4. 메시지 mapping (Material, Vendor, PR, PO)

장애 시 진단:
- CIG monitor → Messages → Status별 분류
- S/4 SLG1 → Application Log → CIG namespace
- Ariba Network → Buyer login → System Updates

## 📚 참조

- `references/sourcing-event-types.md` — RFx 유형 (TBD)
- `references/network-onboarding.md` — 공급사 onboarding (TBD)
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM 연동
- `../../../sap-fi/skills/sap-fi/SKILL.md` — 부가세·지급
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CIG/CPI

## ⚠️ 비목표

- 비-Ariba 조달 시스템 (SRM, Coupa, Jaggaer 등)
- 상세 재고 관리 (MM 영역)
- 공공 조달 시스템 (나라장터 등)
